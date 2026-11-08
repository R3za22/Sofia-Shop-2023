import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { ApiError } from '../api/types';
import { useCart } from '../cartContext';
import { Illustration } from '../components/Illustration';
import { ProductCard } from '../components/ProductCard';
import { ErrorState, PageSkeleton } from '../components/States';
import { useAsync } from '../hooks';
import { useI18n } from '../i18n';
import { MAX_QTY } from '../lib/cart';
import { COLOR_HEX, TYPE_SPECS } from '../mock/fixtures';
import type { ColorId } from '../types';

export function Product() {
  const { id = '' } = useParams();
  const { t, lang, money, num } = useI18n();
  const { add } = useCart();
  const res = useAsync(() => api.getProduct(id), id);
  const related = useAsync(async () => {
    const p = await api.getProduct(id);
    const page = await api.listProducts({ room: p.room, pageSize: 24 });
    return page.items.filter((x) => x.id !== id && x.stock > 0).slice(0, 3);
  }, `rel-${id}`);

  const [color, setColor] = useState<ColorId | null>(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setColor(null);
    setQty(1);
    setMsg(null);
  }, [id]);

  if (res.status === 'loading') return <div className="wrap page"><PageSkeleton /></div>;
  if (res.status === 'error') return <div className="wrap page"><ErrorState error={res.error} onRetry={res.reload} /></div>;

  const p = res.data;
  const chosen = color ?? p.colors[0];
  const soldOut = p.stock <= 0;
  const maxQty = Math.min(p.stock, MAX_QTY);

  async function onAdd() {
    setBusy(true);
    setMsg(null);
    try {
      await add(p.id, chosen, qty);
      setMsg({ kind: 'ok', text: t('pd.added') });
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof ApiError && e.code === 'out_of_stock' ? t('pd.soldout') : t('err.d') });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{t('list.crumb.home')}</Link> / <Link to={`/products?room=${p.room}`}>{t(`room.${p.room}`)}</Link> /{' '}
        <Link to={`/products?type=${p.type}`}>{t(`type.${p.type}`)}</Link> / <span>{p.name[lang]}</span>
      </nav>
      <div className="detail">
        <div>
          <div className="detail__art" style={{ background: p.bg }}>
            <Illustration kind={p.kind} c={COLOR_HEX[chosen]} d={p.accent} label={t('pd.art', { n: p.name[lang] })} />
          </div>
          <p className="muted small">{t('pd.drawn')}</p>
        </div>
        <div className="detail__info">
          <span className={soldOut ? 'badge badge--out' : p.stock <= 3 ? 'badge badge--low' : 'badge badge--in'}>
            {soldOut ? t('badge.out') : p.stock <= 3 ? t('badge.low', { n: num(p.stock) }) : t('badge.in')}
          </span>
          <h1>{p.name[lang]}</h1>
          <p className="price">{money(p.price)}</p>
          <p>{p.description[lang]}</p>

          <fieldset className="options">
            <legend>{t('pd.colour', { c: t(`color.${chosen}`) })}</legend>
            <div className="swatches">
              {p.colors.map((c) => (
                <button key={c} type="button" className="swatch" aria-label={t(`color.${c}`)} aria-pressed={c === chosen} style={{ background: COLOR_HEX[c] }} onClick={() => setColor(c)} />
              ))}
            </div>
          </fieldset>

          {!soldOut && (
            <div className="qty-row">
              <span id="qty-l">{t('pd.qty')}</span>
              <div className="qty" role="group" aria-labelledby="qty-l">
                <button aria-label={t('pd.dec')} disabled={qty <= 1} onClick={() => setQty(qty - 1)}>−</button>
                <output data-testid="qty">{num(qty)}</output>
                <button aria-label={t('pd.inc')} disabled={qty >= maxQty} onClick={() => setQty(qty + 1)}>+</button>
              </div>
            </div>
          )}
          <button className="btn btn--lg" disabled={soldOut || busy} onClick={onAdd}>
            {soldOut ? t('pd.soldout') : t('pd.add')}
          </button>
          <div aria-live="polite" className={msg?.kind === 'err' ? 'msg msg--err' : 'msg'}>
            {msg && <>{msg.text} {msg.kind === 'ok' && <Link to="/cart">{t('pd.viewCart')}</Link>}</>}
          </div>
          <ul className="notes">
            <li>{t('pd.delivery')}</li>
            <li>{t('pd.returns')}</li>
          </ul>
        </div>
      </div>

      <div className="detail-more">
        <section>
          <h2>{t('pd.details')}</h2>
          <dl className="specs">
            {TYPE_SPECS[p.type].map((s, i) => (
              <div key={i}><dt>{s.k[lang]}</dt><dd>{s.v[lang]}</dd></div>
            ))}
          </dl>
          <h2>{t('pd.care')}</h2>
          <p>{t('pd.careText')}</p>
        </section>
        {related.status === 'ready' && related.data.length > 0 && (
          <section>
            <h2>{t('pd.related')}</h2>
            <div className="grid grid--3">{related.data.map((r) => <ProductCard key={r.id} p={r} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
