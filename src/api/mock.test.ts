import { beforeEach, describe, expect, it } from 'vitest';
import { createMockApi, DECLINE_CARD, WRONG_PASSWORD } from './mock';
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

  it('prices sofas per size and keeps sizes as separate lines', async () => {
    const p = await api.getProduct('alma-sofa');
    expect(p.sizes?.map((s) => s.id)).toEqual(['three', 'two', 'four']);
    await api.addToCart('alma-sofa', 'indigo', 1, 'two');
    const cart = await api.addToCart('alma-sofa', 'indigo', 1);
    expect(cart.lines).toHaveLength(2);
    const two = cart.lines.find((l) => l.size?.id === 'two')!;
    expect(two.unit).toBe(p.sizes![1].price);
    expect(cart.quote.subtotal).toBe(p.sizes![1].price + p.price);
    await expect(api.addToCart('alma-sofa', 'indigo', 1, 'huge')).rejects.toMatchObject({ code: 'validation' });
    const order = await api.checkout(form());
    expect(order.lines.find((l) => l.size?.en === '2-seat')?.unit).toBe(p.sizes![1].price);
  });

  it('persists a wishlist and lists its products', async () => {
    expect(await api.getWishlist()).toEqual([]);
    expect(await api.toggleWishlist('kaveh-vase')).toEqual(['kaveh-vase']);
    expect(await api.toggleWishlist('tir-lamp')).toEqual(['kaveh-vase', 'tir-lamp']);
    expect((await make().listWishlist()).map((x) => x.id).sort()).toEqual(['kaveh-vase', 'tir-lamp']);
    expect(await api.toggleWishlist('kaveh-vase')).toEqual(['tir-lamp']);
    await expect(api.toggleWishlist('nope')).rejects.toMatchObject({ code: 'not_found' });
  });

  it('signs in and out, gating orders and account', async () => {
    expect((await api.getAccount()).name.fa).toBe('سارا کریمی');
    await api.signOut();
    await expect(api.getAccount()).rejects.toMatchObject({ code: 'unauthorized' });
    await expect(api.listOrders()).rejects.toMatchObject({ code: 'unauthorized' });
    await expect(api.signIn('bad', '123')).rejects.toMatchObject({ code: 'validation', fields: { email: 'email', password: 'password' } });
    await expect(api.signIn('a@b.co', WRONG_PASSWORD)).rejects.toMatchObject({ code: 'unauthorized' });
    expect((await api.signIn('me@example.com', 'secret1')).email).toBe('me@example.com');
    expect(await api.listOrders()).toHaveLength(2);
    expect((await make().getAccount()).email).toBe('me@example.com');
  });

  it('accepts a valid contact message and rejects an invalid one', async () => {
    await expect(api.sendContact({ name: '', contact: 'x', message: 'hi' })).rejects.toMatchObject({ code: 'validation' });
    const r = await api.sendContact({ name: 'Sara', contact: 'sara@example.com', message: 'Do you deliver to Shiraz?' });
    expect(r.id).toBe('MSG-1001');
    expect((await api.sendContact({ name: 'Sara', contact: '09121234567', message: 'Another question here' })).id).toBe('MSG-1002');
  });
});
