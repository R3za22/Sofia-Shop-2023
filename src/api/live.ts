import type { ListParams } from '../types';
import { ApiError, type ApiErrorCode, type ShopApi } from './types';

const CODES: ApiErrorCode[] = ['not_found', 'validation', 'invalid_code', 'payment_declined', 'out_of_stock', 'empty_cart'];

function query(p: ListParams): string {
  const qs = new URLSearchParams();
  if (p.room) qs.set('room', p.room);
  if (p.types?.length) qs.set('types', p.types.join(','));
  if (p.colors?.length) qs.set('colors', p.colors.join(','));
  if (p.minPrice !== undefined) qs.set('minPrice', String(p.minPrice));
  if (p.maxPrice !== undefined) qs.set('maxPrice', String(p.maxPrice));
  if (p.inStock) qs.set('inStock', '1');
  if (p.q) qs.set('q', p.q);
  if (p.sort) qs.set('sort', p.sort);
  if (p.page) qs.set('page', String(p.page));
  if (p.pageSize) qs.set('pageSize', String(p.pageSize));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/** REST adapter. `baseUrl` comes from VITE_API_BASE_URL; see README for the endpoint list. */
export function createLiveApi(baseUrl: string, fetchImpl: typeof fetch = (...a) => fetch(...a)): ShopApi {
  const root = baseUrl.replace(/\/+$/, '');

  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetchImpl(`${root}${path}`, {
        method,
        credentials: 'include',
        headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError('network');
    }
    if (res.ok) return (await res.json()) as T;
    let data: { code?: string; message?: string; fields?: ApiError['fields'] } = {};
    try {
      data = await res.json();
    } catch {
      /* non-JSON error body */
    }
    const code = CODES.find((c) => c === data.code) ?? (res.status === 404 ? 'not_found' : 'server');
    throw new ApiError(code, data.message, data.fields);
  }

  const lineBody = (productId: string, color: string, qty?: number) => ({ productId, color, qty });
  return {
    listProducts: (p) => call('GET', `/products${query(p)}`),
    getProduct: (id) => call('GET', `/products/${encodeURIComponent(id)}`),
    getCart: () => call('GET', '/cart'),
    addToCart: (id, color, qty) => call('POST', '/cart/lines', lineBody(id, color, qty)),
    setQty: (id, color, qty) => call('PATCH', '/cart/lines', lineBody(id, color, qty)),
    removeLine: (id, color) => call('DELETE', '/cart/lines', lineBody(id, color)),
    setDelivery: (o) => call('PUT', '/cart/delivery', o),
    applyCode: (code) => call('PUT', '/cart/code', { code }),
    checkout: (input) => call('POST', '/checkout', input),
    listOrders: () => call('GET', '/orders'),
    getOrder: (id) => call('GET', `/orders/${encodeURIComponent(id)}`),
    getAccount: () => call('GET', '/account'),
    resetDemo: async () => undefined,
  };
}
