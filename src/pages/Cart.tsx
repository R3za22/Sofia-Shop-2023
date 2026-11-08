import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/types';
import { useCart } from '../cartContext';
import { Illustration } from '../components/Illustration';
import { EmptyState, ErrorState } from '../components/States';
import { useI18n } from '../i18n';
import { CITIES } from '../lib/pricing';
import { COLOR_HEX } from '../mock/fixtures';
import type { City } from '../types';

export function Cart() {
  const { t, lang, money, num } = useI18n();
  const { cart, loading, failed, refresh, setQty, remove, setDelivery, applyCode } = useCart();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="wrap page"><p role="status" className="muted">{t('list.loading')}</p></div>;
  if (failed || !cart) return <div className="wrap page"><ErrorState onRetry={() => void refresh()} /></div>;
  if (cart.lines.length === 0) {
    return (
      <div className="wrap page">
        <h1>{t('cart.title')}</h1>
        <EmptyState title={t('cart.empty.t')} text={t('cart.empty.d')} cta={t('cart.empty.cta')} to="/products" />
      </div>
    );
  }

  const q = cart.quote;
  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  async function onApply(e: FormEvent) {
    e.preventDefault();
    setCodeMsg(null);
    try {
      await applyCode(code);
      setCode('');
    } catch (err) {
      setCodeMsg({ ok: false, text: err instanceof ApiError && err.code === 'invalid_code' ? t('cart.code.invalid') : t('err.d') });
    }
  }

  return (
    <div className="wrap page">
      <div className="list-head">
        <h1>{t('cart.title')}</h1>
        <Link to="/products">{t('cart.continue')}</Link>
      </div>
      <div className="cart-layout">
        <ul className="lines" aria-busy={busy}>
          {cart.lines.map((l) => {
            const name = l.product.name[lang];
            return (
              <li key={`${l.product.id}-${l.color}`} className="line" data-testid="cart-line">
                <div className="line__art" style={{ background: l.product.bg }}>
                  <Illustration kind={l.product.kind} c={COLOR_HEX[l.color]} d={l.product.accent} />
                </div>
                <div className="line__info">
                  <Link to={`/product/${l.product.id}`} className="line__name">{name}</Link>
                  <span className="muted">{t(`color.${l.color}`)}</span>
                  <span className="muted">{t('cart.each', { p: money(l.product.price) })}</span>
                  <button className="link-btn" aria-label={t('cart.removeLabel', { n: name })} onClick={() => act(() => remove(l.product.id, l.color))}>
                    {t('cart.remove')}
                  </button>
                </div>
                <div className="qty" role="group" aria-label={name}>
                  <button aria-label={t('pd.dec')} onClick={() => act(() => setQty(l.product.id, l.color, l.qty - 1))}>−</button>
                  <output>{num(l.qty)}</output>
                  <button aria-label={t('pd.inc')} onClick={() => act(() => setQty(l.product.id, l.color, l.qty + 1))}>+</button>
                </div>
                <div className="line__total">{money(l.lineTotal)}</div>
              </li>
            );
          })}
          <li>
            <form className="code" onSubmit={onApply}>
              <label htmlFor="code">{t('cart.code')}</label>
              <div className="code__row">
                <input id="code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" dir="ltr" />
                <button className="btn btn--ghost" type="submit">{t('cart.apply')}</button>
              </div>
              <p className="muted small">{t('cart.code.hint')}</p>
              {codeMsg && <p className="msg msg--err" role="alert">{codeMsg.text}</p>}
              {cart.code && !q.codeError && <p className="msg" role="status">{t('cart.code.ok', { c: cart.code })}</p>}
              {q.codeError === 'min_subtotal' && <p className="msg msg--err" role="alert">{t('cart.code.min')}</p>}
            </form>
          </li>
        </ul>

        <aside className="summary" aria-labelledby="sum-h">
          <h2 id="sum-h">{t('cart.summary')}</h2>
          <label className="field">
            <span>{t('cart.city')}</span>
            <select value={cart.city} onChange={(e) => act(() => setDelivery({ city: e.target.value as City }))}>
              {CITIES.map((c) => <option key={c} value={c}>{t(`city.${c}`)}</option>)}
            </select>
          </label>
          <dl className="totals">
            <div><dt>{t('cart.subtotal')}</dt><dd>{money(q.subtotal)}</dd></div>
            {q.discount > 0 && <div><dt>{t('cart.discount')}</dt><dd>−{money(q.discount)}</dd></div>}
            <div><dt>{t('cart.deliveryTo', { c: t(`city.${cart.city}`) })}</dt><dd>{q.delivery === 0 ? t('free') : money(q.delivery)}</dd></div>
            <div className="totals__grand"><dt>{t('cart.total')}</dt><dd data-testid="cart-total">{money(q.total)}</dd></div>
          </dl>
          <button className="btn btn--lg" onClick={() => navigate('/checkout')}>{t('cart.checkout')}</button>
          <p className="muted small">{t('cart.note')}</p>
        </aside>
      </div>
    </div>
  );
}
