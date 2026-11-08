import { describe, expect, it } from 'vitest';
import { listProducts } from './catalog';
import { PRODUCTS } from '../mock/fixtures';

describe('catalog', () => {
  it('paginates 24 products into 3 pages of 9', () => {
    const p1 = listProducts(PRODUCTS, {});
    expect(p1.total).toBe(24);
    expect(p1.pageCount).toBe(3);
    expect(p1.items).toHaveLength(9);
    expect(listProducts(PRODUCTS, { page: 3 }).items).toHaveLength(6);
    expect(listProducts(PRODUCTS, { page: 99 }).page).toBe(3);
  });

  it('sorts by price both ways and newest first by default', () => {
    const asc = listProducts(PRODUCTS, { sort: 'price-asc' }).items;
    expect(asc[0].price).toBeLessThanOrEqual(asc[1].price);
    const desc = listProducts(PRODUCTS, { sort: 'price-desc' }).items;
    expect(desc[0].price).toBe(38_900_000);
    expect(listProducts(PRODUCTS, {}).items[0].id).toBe('alma-sofa');
  });

  it('filters by room, type, colour, price, stock and search', () => {
    expect(listProducts(PRODUCTS, { room: 'lighting' }).total).toBe(3);
    expect(listProducts(PRODUCTS, { types: ['sofas'] }).total).toBe(3);
    expect(listProducts(PRODUCTS, { types: ['sofas'], inStock: true }).total).toBe(2);
    expect(listProducts(PRODUCTS, { colors: ['saffron'] }).items.every((p) => p.colors.includes('saffron'))).toBe(true);
    expect(listProducts(PRODUCTS, { minPrice: 10_000_000 }).items.every((p) => p.price >= 10_000_000)).toBe(true);
    expect(listProducts(PRODUCTS, { q: 'kaveh' }).items.map((p) => p.id)).toEqual(['kaveh-vase']);
    expect(listProducts(PRODUCTS, { q: 'آلما' }).total).toBe(1);
    expect(listProducts(PRODUCTS, { q: 'zzz' }).total).toBe(0);
  });

  it('facet counts ignore the type filter but respect the others', () => {
    const r = listProducts(PRODUCTS, { types: ['rugs'], inStock: true });
    expect(r.facets.sofas).toBe(2);
    expect(r.facets.rugs).toBe(3);
  });
});
