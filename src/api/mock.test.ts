import { beforeEach, describe, expect, it } from 'vitest';
import { createMockApi, DECLINE_CARD } from './mock';
import { createStorage, type Backend } from './storage';
import { ApiError, type ShopApi } from './types';
import type { CheckoutInput } from '../types';

class MemBackend implements Backend {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

const form = (over: Partial<CheckoutInput> = {}): CheckoutInput => ({
  name: 'Sara Karimi', phone: '09121234567', city: 'ahvaz', postal: '6135712345',
  address: 'Kianpars, Street 5, No. 12', method: 'home',
  card: { number: '4242 4242 4242 4242', expiry: '12/39', cvv: '123' }, ...over,
});

let backend: MemBackend;
let api: ShopApi;
const make = () => createMockApi({ storage: createStorage(backend), latency: 0, now: () => 1_700_000_000_000 });
beforeEach(() => { backend = new MemBackend(); api = make(); });

describe('mock api', () => {
  it('lists seeded products and persists the cart across instances', async () => {
    expect((await api.listProducts({})).total).toBe(24);
    await api.addToCart('alma-sofa', 'indigo', 1);
    const again = make(); // simulates a page reload
    const cart = await again.getCart();
    expect(cart.count).toBe(1);
    expect(cart.quote.total).toBe(38_900_000);
  });

  it('applies and rejects discount codes', async () => {
    await api.addToCart('kaveh-vase', 'saffron', 2);
    expect((await api.applyCode('sofia10')).quote.discount).toBe(178_000);
    await expect(api.applyCode('bogus')).rejects.toMatchObject({ code: 'invalid_code' });
    expect((await api.getCart()).code).toBe('SOFIA10');
  });

  it('refuses sold-out products', async () => {
    await expect(api.addToCart('rayan-sofa', 'sage', 1)).rejects.toMatchObject({ code: 'out_of_stock' });
  });

  it('checks out: creates an order, empties the cart, reduces stock', async () => {
    await api.addToCart('omid-chair', 'oat', 2);
    const order = await api.checkout(form());
    expect(order.id).toBe('SF-10230');
    expect(order.quote.total).toBe(33_600_000);
    expect(order.payment.last4).toBe('4242');
    expect((await api.getCart()).count).toBe(0);
    expect((await api.getProduct('omid-chair')).stock).toBe(1);
    expect((await api.listOrders())[0].id).toBe('SF-10230');
    expect((await api.getOrder('SF-10230')).customer.name).toBe('Sara Karimi');
  });

  it('keeps the cart when payment is declined or validation fails', async () => {
    await api.addToCart('tir-lamp', 'indigo', 1);
    await expect(api.checkout(form({ card: { number: DECLINE_CARD, expiry: '12/39', cvv: '123' } }))).rejects.toMatchObject({ code: 'payment_declined' });
    const err = await api.checkout(form({ postal: '1' })).catch((e: ApiError) => e);
    expect(err).toMatchObject({ code: 'validation', fields: { postal: 'postal' } });
    expect((await api.getCart()).count).toBe(1);
  });

  it('rejects checkout of an empty cart and unknown orders', async () => {
    await expect(api.checkout(form())).rejects.toMatchObject({ code: 'empty_cart' });
    await expect(api.getOrder('SF-1')).rejects.toMatchObject({ code: 'not_found' });
  });

  it('injects failures and resets demo data', async () => {
    const failing = createMockApi({ storage: createStorage(new MemBackend()), latency: 0, fail: ['products'] });
    await expect(failing.listProducts({})).rejects.toMatchObject({ code: 'server' });
    await api.addToCart('tir-lamp', 'indigo', 1);
    await api.resetDemo();
    expect((await api.getCart()).count).toBe(0);
    expect(await api.listOrders()).toHaveLength(2);
  });

  it('survives blocked storage by falling back to memory', async () => {
    const blocked: Backend = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
    const s = createStorage(blocked);
    const a = createMockApi({ storage: s, latency: 0 });
    await a.addToCart('tir-lamp', 'indigo', 1);
    expect((await a.getCart()).count).toBe(1);
    expect(s.blocked).toBe(true);
  });
});
