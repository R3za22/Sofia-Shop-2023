import { ACCOUNT, PRODUCTS } from '../mock/fixtures';
import { addLine, removeLine, setLineQty } from '../lib/cart';
import { listProducts } from '../lib/catalog';
import { digitsOnly, validateCheckout } from '../lib/validate';
import { discountFor, quote } from '../lib/pricing';
import type {
  CartLine, CartView, City, DeliveryMethod, Order, OrderLine, Product,
} from '../types';
import { ApiError, type ShopApi } from './types';
import { createStorage, type Storage } from './storage';

interface CartState { lines: CartLine[]; city: City; method: DeliveryMethod; code: string }
const EMPTY_CART: CartState = { lines: [], city: 'ahvaz', method: 'home', code: '' };

/** Test cards for the simulated gateway. Any other Luhn-valid card succeeds. */
export const DECLINE_CARD = '4000000000000002';

export interface MockOptions {
  storage?: Storage;
  /** Simulated latency in ms. */
  latency?: number;
  /** Operations that fail with a server error: products, product, cart, checkout, orders. */
  fail?: string[];
  now?: () => number;
}

const DAY = 86_400_000;

export function createMockApi(opts: MockOptions = {}): ShopApi {
  const storage = opts.storage ?? createStorage();
  const latency = opts.latency ?? 250;
  const fail = new Set(opts.fail ?? []);
  const now = opts.now ?? Date.now;

  const wait = () => (latency > 0 ? new Promise<void>((r) => setTimeout(r, latency)) : Promise.resolve());
  const maybeFail = (op: string) => {
    if (fail.has(op)) throw new ApiError('server', `Simulated ${op} failure`);
  };

  const stockMap = () => storage.get<Record<string, number>>('sofia.stock', {});
  const withStock = (p: Product): Product => ({ ...p, stock: stockMap()[p.id] ?? p.stock });
  const catalog = () => PRODUCTS.map(withStock);
  const find = (id: string): Product => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) throw new ApiError('not_found', `Product ${id} not found`);
    return withStock(p);
  };

  const readCart = (): CartState => ({ ...EMPTY_CART, ...storage.get<Partial<CartState>>('sofia.cart', {}) });
  const writeCart = (c: CartState) => storage.set('sofia.cart', c);

  function view(c: CartState): CartView {
    // Drop lines whose product vanished or sold out since they were added.
    const lines = c.lines.flatMap((l) => {
      const product = PRODUCTS.find((p) => p.id === l.productId);
      if (!product) return [];
      const stock = withStock(product).stock;
      if (stock <= 0) return [];
      const qty = Math.min(l.qty, stock);
      return [{ product: withStock(product), color: l.color, qty, lineTotal: product.price * qty }];
    });
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      city: c.city,
      method: c.method,
      code: c.code,
      quote: quote(lines.map((l) => ({ price: l.product.price, qty: l.qty })), c.city, c.method, c.code),
    };
  }

  function seedOrders(): Order[] {
    const mk = (id: string, daysAgo: number, status: Order['status'], pid: string, qty: number): Order => {
      const p = PRODUCTS.find((x) => x.id === pid)!;
      const line: OrderLine = {
        productId: p.id, name: p.name, kind: p.kind, color: p.colors[0], bg: p.bg, accent: p.accent, qty, unit: p.price,
      };
      return {
        id, createdAt: now() - daysAgo * DAY, status, lines: [line],
        quote: quote([{ price: p.price, qty }], 'ahvaz', 'home'),
        customer: { name: ACCOUNT.name, phone: ACCOUNT.phone },
        delivery: { method: 'home', city: 'ahvaz', postal: '6135712345', address: 'Kianpars, Street 5, No. 12' },
        payment: { method: 'simulated', last4: '4242' },
      };
    };
    return [mk('SF-10229', 25, 'cancelled', 'bam-rug', 1), mk('SF-10228', 40, 'delivered', 'tir-lamp', 1)];
  }
  const readOrders = (): Order[] => {
    const stored = storage.get<Order[] | null>('sofia.orders', null);
    if (stored) return stored;
    const seeded = seedOrders();
    storage.set('sofia.orders', seeded);
    return seeded;
  };

  async function mutateCart(fn: (c: CartState) => CartState): Promise<CartView> {
    await wait();
    maybeFail('cart');
    const next = fn(readCart());
    writeCart(next);
    return view(next);
  }

  return {
    async listProducts(params) {
      await wait();
      maybeFail('products');
      return listProducts(catalog(), params);
    },
    async getProduct(id) {
      await wait();
      maybeFail('product');
      return find(id);
    },
    async getCart() {
      await wait();
      maybeFail('cart');
      return view(readCart());
    },
    addToCart: (productId, color, qty) =>
      mutateCart((c) => {
        const p = find(productId);
        if (!p.colors.includes(color)) throw new ApiError('validation', 'Unknown colour');
        if (p.stock <= 0) throw new ApiError('out_of_stock');
        return { ...c, lines: addLine(c.lines, productId, color, qty, p.stock) };
      }),
    setQty: (productId, color, qty) => mutateCart((c) => ({ ...c, lines: setLineQty(c.lines, productId, color, qty, find(productId).stock) })),
    removeLine: (productId, color) => mutateCart((c) => ({ ...c, lines: removeLine(c.lines, productId, color) })),
    setDelivery: (o) => mutateCart((c) => ({ ...c, city: o.city ?? c.city, method: o.method ?? c.method })),
    applyCode: (code) =>
      mutateCart((c) => {
        const trimmed = code.trim();
        if (trimmed && discountFor(trimmed, Number.MAX_SAFE_INTEGER).error === 'invalid') throw new ApiError('invalid_code');
        return { ...c, code: trimmed.toUpperCase() };
      }),

    async checkout(input) {
      await wait();
      maybeFail('checkout');
      const errors = validateCheckout(input);
      if (Object.keys(errors).length) throw new ApiError('validation', 'Invalid checkout details', errors);
      const cart = view(readCart());
      if (cart.lines.length === 0) throw new ApiError('empty_cart');
      const last4 = digitsOnly(input.card.number).slice(-4);
      if (digitsOnly(input.card.number) === DECLINE_CARD) throw new ApiError('payment_declined');

      const q = quote(
        cart.lines.map((l) => ({ price: l.product.price, qty: l.qty })),
        input.city, input.method, cart.code,
      );
      const orders = readOrders();
      const seq = Math.max(10_229, ...orders.map((o) => Number(o.id.replace('SF-', '')))) + 1;
      const order: Order = {
        id: `SF-${seq}`,
        createdAt: now(),
        status: 'processing',
        lines: cart.lines.map((l) => ({
          productId: l.product.id, name: l.product.name, kind: l.product.kind, color: l.color,
          bg: l.product.bg, accent: l.product.accent, qty: l.qty, unit: l.product.price,
        })),
        quote: q,
        customer: { name: input.name.trim(), phone: digitsOnly(input.phone) },
        delivery: { method: input.method, city: input.city, postal: digitsOnly(input.postal), address: input.address.trim() },
        payment: { method: 'simulated', last4 },
      };
      const stock = stockMap();
      for (const l of cart.lines) stock[l.product.id] = l.product.stock - l.qty;
      storage.set('sofia.stock', stock);
      storage.set('sofia.orders', [order, ...orders]);
      writeCart({ ...EMPTY_CART, city: input.city, method: input.method });
      return order;
    },

    async listOrders() {
      await wait();
      maybeFail('orders');
      return [...readOrders()].sort((a, b) => b.createdAt - a.createdAt);
    },
    async getOrder(id) {
      await wait();
      maybeFail('orders');
      const o = readOrders().find((x) => x.id === id);
      if (!o) throw new ApiError('not_found', `Order ${id} not found`);
      return o;
    },
    async getAccount() {
      await wait();
      return ACCOUNT;
    },
    async resetDemo() {
      for (const k of ['sofia.cart', 'sofia.orders', 'sofia.stock']) storage.remove(k);
    },
  };
}

