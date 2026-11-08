import { describe, expect, it } from 'vitest';
import { deliveryFee, discountFor, quote, unitPrice } from './pricing';

const items = [
  { price: 38_900_000, qty: 1 },
  { price: 890_000, qty: 2 },
];

describe('pricing', () => {
  it('prices per size and falls back to the base price', () => {
    const p = { price: 100, sizes: [{ id: 'a', price: 100 }, { id: 'b', price: 150 }] };
    expect(unitPrice(p, 'b')).toBe(150);
    expect(unitPrice(p, 'zzz')).toBe(100);
    expect(unitPrice({ price: 70 })).toBe(70);
  });

  it('sums the subtotal and totals with free delivery in Ahvaz', () => {
    const q = quote(items, 'ahvaz', 'home');
    expect(q).toEqual({ subtotal: 40_680_000, discount: 0, delivery: 0, total: 40_680_000 });
  });

  it('charges a flat fee outside Ahvaz but not for showroom pickup', () => {
    expect(deliveryFee('tehran', 'home')).toBe(850_000);
    expect(deliveryFee('tehran', 'pickup')).toBe(0);
    expect(quote(items, 'shiraz', 'home').total).toBe(40_680_000 + 650_000);
  });

  it('applies a percent code to the subtotal only, case-insensitive', () => {
    const q = quote(items, 'tehran', 'home', ' sofia10 ');
    expect(q.discount).toBe(4_068_000);
    expect(q.total).toBe(40_680_000 - 4_068_000 + 850_000);
  });

  it('floors percent discounts to whole Toman', () => {
    expect(discountFor('SOFIA10', 1_999_999).discount).toBe(199_999);
  });

  it('rejects unknown codes and enforces the fixed code minimum', () => {
    expect(quote(items, 'ahvaz', 'home', 'NOPE')).toMatchObject({ discount: 0, codeError: 'invalid' });
    expect(discountFor('NOWRUZ', 4_000_000)).toEqual({ discount: 0, error: 'min_subtotal' });
    expect(discountFor('NOWRUZ', 6_000_000).discount).toBe(500_000);
  });

  it('never discounts more than the subtotal and has no delivery for an empty cart', () => {
    expect(quote([], 'tehran', 'home')).toEqual({ subtotal: 0, discount: 0, delivery: 0, total: 0 });
  });
});
