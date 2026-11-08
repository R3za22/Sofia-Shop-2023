import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { EmptyState, ErrorState, GridSkeleton } from '../components/States';
import { PriceRange } from '../components/PriceRange';
import { ProductCard } from '../components/ProductCard';
import { useAsync } from '../hooks';
import { useI18n } from '../i18n';
import { COLOR_HEX } from '../mock/fixtures';
import type { ColorId, ListParams, ProductType, Room, SortKey } from '../types';

const TYPES: ProductType[] = ['sofas', 'armchairs', 'coffee-tables', 'side-tables', 'dining-tables', 'rugs', 'lighting', 'decor', 'shelving'];
const COLORS: ColorId[] = ['indigo', 'sage', 'oat', 'saffron', 'charcoal', 'white'];
const ROOMS: Room[] = ['living', 'dining', 'bedroom', 'lighting', 'decor'];
const SORTS: SortKey[] = ['newest', 'price-asc', 'price-desc'];

function parse(sp: URLSearchParams): ListParams {
  const list = (k: string) => (sp.get(k) ?? '').split(',').filter(Boolean);
  const int = (k: string) => {
    const v = sp.get(k);
    return v && /^\d+$/.test(v) ? Number(v) : undefined;
  };
  const room = sp.get('room') as Room | null;
  const sort = sp.get('sort') as SortKey | null;
  return {
    room: room && ROOMS.includes(room) ? room : undefined,
    types: list('type').filter((x): x is ProductType => TYPES.includes(x as ProductType)),
    colors: list('color').filter((x): x is ColorId => COLORS.includes(x as ColorId)),
    minPrice: int('min'),
    maxPrice: int('max'),
    inStock: sp.get('stock') === '1',
    q: sp.get('q') ?? undefined,
    sort: sort && SORTS.includes(sort) ? sort : 'newest',
    page: int('page') ?? 1,
  };
}

export function Products() {
  const { t, num } = useI18n();
  const [sp, setSp] = useSearchParams();
  const params = parse(sp);
  const res = useAsync(() => api.listProducts(params), sp.toString());
  const [filtersOpen, setFiltersOpen] = useState(false);

  /** Update URL params; changing any filter returns to page 1. */
  const update = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    if (!keepPage) next.delete('page');
    setSp(next);
  };
  const toggle = (key: 'type' | 'color', value: string) => {
    const cur = (sp.get(key) ?? '').split(',').filter(Boolean);
    const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
    update({ [key]: next.join(',') });
  };

  const chips: { label: string; clear: () => void }[] = [
    ...(params.room ? [{ label: t(`room.${params.room}`), clear: () => update({ room: null }) }] : []),
    ...(params.types ?? []).map((x) => ({ label: t(`type.${x}`), clear: () => toggle('type', x) })),
    ...(params.colors ?? []).map((x) => ({ label: t(`color.${x}`), clear: () => toggle('color', x) })),
    ...(params.minPrice !== undefined || params.maxPrice !== undefined
      ? [{ label: `${num(params.minPrice ?? 0)} – ${params.maxPrice !== undefined ? num(params.maxPrice) : '∞'}`, clear: () => update({ min: null, max: null }) }]
      : []),
    ...(params.inStock ? [{ label: t('list.stock'), clear: () => update({ stock: null }) }] : []),
    ...(params.q ? [{ label: `“${params.q}”`, clear: () => update({ q: null }) }] : []),
  ];
  const clearAll = () => setSp(params.room ? new URLSearchParams({ room: params.room }) : new URLSearchParams());
  const title = params.room ? t(`room.${params.room}`) : t('list.all');
  const data = res.status === 'ready' ? res.data : null;
  const pageCount = data?.pageCount ?? 1;

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{t('list.crumb.home')}</Link> / <span>{title}</span>
      </nav>
      <div className="list-head">
        <div>
          <h1>{title}</h1>
          <p className="muted" aria-live="polite">{data ? t('list.showing', { a: num(data.items.length), b: num(data.total) }) : ' '}</p>
        </div>
        <div className="list-tools">
          <label className="field field--inline">
            <span className="sr-only">{t('list.search')}</span>
            <input type="search" placeholder={t('list.search')} value={params.q ?? ''} onChange={(e) => update({ q: e.target.value })} />
          </label>
          <label className="field field--inline">
            <span>{t('list.sort')}</span>
            <select value={params.sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}>
              {SORTS.map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
            </select>
          </label>
          <button className="btn btn--ghost filters-toggle" aria-expanded={filtersOpen} aria-controls="filters" onClick={() => setFiltersOpen((o) => !o)}>
            {t('list.filters.show')}
          </button>
        </div>
      </div>

      <div className="list-layout">
        <aside id="filters" className={filtersOpen ? 'filters is-open' : 'filters'} aria-label={t('list.filters')}>
          <div className="filters__head">
            <h2>{t('list.filters')}</h2>
            <button className="link-btn" onClick={clearAll}>{t('list.clear')}</button>
          </div>
          <fieldset>
            <legend>{t('list.type')}</legend>
            {TYPES.map((x) => (
              <label key={x} className="check">
                <input type="checkbox" checked={params.types?.includes(x) ?? false} onChange={() => toggle('type', x)} />
                <span>{t(`type.${x}`)}</span>
                <small>{data ? num(data.facets[x] ?? 0) : ''}</small>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('list.price')}</legend>
            {data && <PriceRange bounds={{ min: Math.floor(data.priceRange.min / 100_000) * 100_000, max: Math.ceil(data.priceRange.max / 100_000) * 100_000 }} min={params.minPrice} max={params.maxPrice} onCommit={(lo, hi) => update({ min: lo === undefined ? null : String(lo), max: hi === undefined ? null : String(hi) })} />}
          </fieldset>
          <fieldset>
            <legend>{t('list.color')}</legend>
            <div className="swatches">
              {COLORS.map((c) => (
                <button key={c} type="button" className="swatch" aria-label={t(`color.${c}`)} aria-pressed={params.colors?.includes(c) ?? false} style={{ background: COLOR_HEX[c] }} onClick={() => toggle('color', c)} />
              ))}
            </div>
          </fieldset>
          <label className="check">
            <input type="checkbox" checked={params.inStock} onChange={(e) => update({ stock: e.target.checked ? '1' : null })} />
            <span>{t('list.stock')}</span>
          </label>
        </aside>

        <section className="results" aria-busy={res.status === 'loading'}>
          {chips.length > 0 && (
            <div className="chips">
              <span className="muted">{t('list.active')}</span>
              {chips.map((c, i) => (
                <button key={i} className="chip" onClick={c.clear} aria-label={t('list.remove', { x: c.label })}>
                  {c.label}
                  <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" /></svg>
                </button>
              ))}
            </div>
          )}
          {res.status === 'loading' && <GridSkeleton />}
          {res.status === 'error' && <ErrorState error={res.error} onRetry={res.reload} />}
          {data && data.items.length === 0 && <EmptyState title={t('list.empty.t')} text={t('list.empty.d')} cta={t('list.clear')} onClick={clearAll} />}
          {data && data.items.length > 0 && <div className="grid" data-testid="product-grid">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
          {data && pageCount > 1 && (
            <nav className="pager" aria-label={t('list.pages')}>
              {data.page > 1 && <button className="pager__btn" onClick={() => update({ page: String(data.page - 1) }, true)}>{t('list.prev')}</button>}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button key={n} className="pager__btn" aria-label={t('list.page', { n: num(n) })} aria-current={n === data.page ? 'page' : undefined} onClick={() => update({ page: String(n) }, true)}>
                  {num(n)}
                </button>
              ))}
              {data.page < pageCount && <button className="pager__btn" onClick={() => update({ page: String(data.page + 1) }, true)}>{t('list.next')}</button>}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
