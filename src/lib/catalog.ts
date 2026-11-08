import type { ListParams, Product, ProductPage, ProductType } from '../types';

export const PAGE_SIZE = 9;

function matches(p: Product, q: ListParams, skipType: boolean): boolean {
  if (q.room && p.room !== q.room) return false;
  if (!skipType && q.types?.length && !q.types.includes(p.type)) return false;
  if (q.colors?.length && !p.colors.some((c) => q.colors!.includes(c))) return false;
  if (q.minPrice !== undefined && p.price < q.minPrice) return false;
  if (q.maxPrice !== undefined && p.price > q.maxPrice) return false;
  if (q.inStock && p.stock <= 0) return false;
  if (q.q) {
    const needle = q.q.trim().toLowerCase();
    if (needle && !`${p.name.en} ${p.name.fa}`.toLowerCase().includes(needle)) return false;
  }
  return true;
}

export function listProducts(all: Product[], q: ListParams): ProductPage {
  const filtered = all.filter((p) => matches(p, q, false));
  const sort = q.sort ?? 'newest';
  filtered.sort((a, b) =>
    sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : b.createdAt - a.createdAt,
  );

  const facets: Partial<Record<ProductType, number>> = {};
  for (const p of all) if (matches(p, q, true)) facets[p.type] = (facets[p.type] ?? 0) + 1;

  const pageSize = q.pageSize ?? PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, q.page ?? 1), pageCount);
  const prices = all.map((p) => p.price);
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageCount,
    facets,
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
  };
}
