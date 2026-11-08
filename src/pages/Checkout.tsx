import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ApiError } from '../api/types';
import { useCart } from '../cartContext';
import { Illustration } from '../components/Illustration';
import { EmptyState, ErrorState } from '../components/States';
import { useI18n, type Key } from '../i18n';
import { CITIES, deliveryFee, quote } from '../lib/pricing';
import { digitsOnly, validateCheckout, type Errors } from '../lib/validate';
import { COLOR_HEX } from '../mock/fixtures';
import type { City, DeliveryMethod } from '../types';

type FieldName = keyof Errors;
const ORDER: FieldName[] = ['name', 'phone', 'city', 'postal', 'address', 'card', 'expiry', 'cvv'];

function groupCard(v: string): string {
  return digitsOnly(v).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}
function fmtExpiry(v: string): string {
  const d = digitsOnly(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function Checkout() {
  const { t, lang, money, num } = useI18n();
  const { cart, loading, failed, refresh, setDelivery } = useCart();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<City | null>(null);
  const [postal, setPostal] = useState('');
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState<DeliveryMethod | null>(null);
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [paying, setPaying] = useState(false);
  const [banner, setBanner] = useState<'declined' | 'failed' | null>(null);

  if (loading) return <div className="wrap page"><p role="status" className="muted">{t('list.loading')}</p></div>;
  if (failed || !cart) return <div className="wrap page"><ErrorState onRetry={() => void refresh()} /></div>;
  if (cart.lines.length === 0) {
    return (
      <div className="wrap page">
        <h1>{t('co.title')}</h1>
        <EmptyState title={t('cart.empty.t')} text={t('co.empty')} cta={t('cart.empty.cta')} to="/products" />
      </div>
    );
  }

  const theCity = city ?? cart.city;
  const theMethod = method ?? cart.method;
  const q = quote(cart.lines.map((l) => ({ price: l.unit, qty: l.qty })), theCity, theMethod, cart.code);
  const pickCity = (c: City) => { setCity(c); void setDelivery({ city: c }); };
  const pickMethod = (m: DeliveryMethod) => { setMethod(m); void setDelivery({ method: m }); };

  const input = () => ({
    name, phone, city: theCity, postal, address, method: theMethod,
    card: { number, expiry, cvv },
  });

  function focusFirst(e: Errors) {
    const first = ORDER.find((k) => e[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setBanner(null);
    const local = validateCheckout(input());
    setErrors(local);
    if (Object.keys(local).length) {
      focusFirst(local);
      return;
    }
    setPaying(true);
    try {
      const order = await api.checkout(input());
      await refresh();
      navigate(`/order/${order.id}`);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'validation' && e.fields) {
        setErrors(e.fields as Errors);
        focusFirst(e.fields as Errors);
      } else if (e instanceof ApiError && e.code === 'payment_declined') setBanner('declined');
      else setBanner('failed');
    } finally {
      setPaying(false);
    }
  }

  const err = (f: FieldName) => (errors[f] ? t(`co.err.${errors[f]}` as Key) : undefined);
  const field = (f: FieldName) => ({ name: f, id: `f-${f}`, 'aria-invalid': errors[f] ? true : undefined, 'aria-describedby': errors[f] ? `e-${f}` : undefined });
  const msg = (f: FieldName) => errors[f] && <span id={`e-${f}`} className="field__err">{err(f)}</span>;

  return (
    <div className="wrap page">
      <div className="list-head">
        <h1>{t('co.title')}</h1>
        <Link to="/cart">{t('co.back')}</Link>
      </div>
      <ol className="steps" aria-label={t('co.title')}>
        <li className="is-done">{t('co.step.delivery')}</li>
        <li className="is-current" aria-current="step">{t('co.step.payment')}</li>
        <li>{t('co.step.confirm')}</li>
      </ol>

      <form ref={formRef} className="cart-layout" onSubmit={onSubmit} noValidate>
        <div className="co-main">
          {Object.keys(errors).length > 0 && <p className="msg msg--err" role="alert">{t('co.fix')}</p>}

          <section className="panel">
            <h2>{t('co.address')}</h2>
            <div className="form-grid">
              <label className="field" htmlFor="f-name"><span>{t('co.name')}</span>
                <input {...field('name')} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />{msg('name')}</label>
              <label className="field" htmlFor="f-phone"><span>{t('co.phone')}</span>
                <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={t('co.phone.hint')} value={phone} onChange={(e) => setPhone(e.target.value)} />{msg('phone')}</label>
              <label className="field" htmlFor="f-city"><span>{t('co.city')}</span>
                <select {...field('city')} value={theCity} onChange={(e) => pickCity(e.target.value as City)}>
                  {CITIES.map((c) => <option key={c} value={c}>{t(`city.${c}`)}</option>)}
                </select></label>
              <label className="field" htmlFor="f-postal"><span>{t('co.postal')}</span>
                <input {...field('postal')} inputMode="numeric" autoComplete="postal-code" dir="ltr" value={postal} onChange={(e) => setPostal(e.target.value)} />{msg('postal')}</label>
              <label className="field field--wide" htmlFor="f-address"><span>{t('co.street')}</span>
                <textarea {...field('address')} rows={3} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} />{msg('address')}</label>
            </div>
          </section>

          <section className="panel methods" role="radiogroup" aria-labelledby="m-h">
            <h2 id="m-h">{t('co.method')}</h2>
            {(['home', 'pickup'] as const).map((m) => (
              <label key={m} className={theMethod === m ? 'method is-on' : 'method'}>
                <input type="radio" name="method" checked={theMethod === m} onChange={() => pickMethod(m)} />
                <span className="method__t">{t(`co.method.${m}`)}</span>
                <span className="muted">{t(`co.method.${m}.d`)}</span>
                <strong>{deliveryFee(theCity, m) === 0 ? t('free') : money(deliveryFee(theCity, m))}</strong>
              </label>
            ))}
          </section>

          <section className="panel">
            <h2>{t('co.payment')}</h2>
            <p className="notice notice--info">{t('co.sim')}</p>
            <p className="muted small">{t('co.testCards')}</p>
            <div className="form-grid">
              <label className="field field--wide" htmlFor="f-card"><span>{t('co.card')}</span>
                <input {...field('card')} inputMode="numeric" autoComplete="cc-number" dir="ltr" placeholder="0000 0000 0000 0000" value={number} onChange={(e) => setNumber(groupCard(e.target.value))} />{msg('card')}</label>
              <label className="field" htmlFor="f-expiry"><span>{t('co.expiry')}</span>
                <input {...field('expiry')} inputMode="numeric" autoComplete="cc-exp" dir="ltr" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(fmtExpiry(e.target.value))} />{msg('expiry')}</label>
              <label className="field" htmlFor="f-cvv"><span>{t('co.cvv')}</span>
                <input {...field('cvv')} inputMode="numeric" autoComplete="cc-csc" dir="ltr" maxLength={4} value={cvv} onChange={(e) => setCvv(digitsOnly(e.target.value))} />{msg('cvv')}</label>
            </div>
          </section>
        </div>

        <aside className="summary" aria-labelledby="ord-h">
          <h2 id="ord-h">{t('co.order')}</h2>
          <ul className="mini">
            {cart.lines.map((l) => (
              <li key={`${l.product.id}-${l.color}-${l.size?.id ?? ''}`}>
                <div className="mini__art" style={{ background: l.product.bg }}><Illustration kind={l.product.kind} c={COLOR_HEX[l.color]} d={l.product.accent} /></div>
                <div><div className="line__name">{l.product.name[lang]}</div><span className="muted small">{l.size ? `${l.size.label[lang]} · ` : ''}{t('co.qty', { n: num(l.qty) })}</span></div>
                <span>{money(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="totals">
            <div><dt>{t('cart.subtotal')}</dt><dd>{money(q.subtotal)}</dd></div>
            {q.discount > 0 && <div><dt>{t('cart.discount')}</dt><dd>−{money(q.discount)}</dd></div>}
            <div><dt>{t('cart.delivery')}</dt><dd>{q.delivery === 0 ? t('free') : money(q.delivery)}</dd></div>
            <div className="totals__grand"><dt>{t('cart.total')}</dt><dd data-testid="checkout-total">{money(q.total)}</dd></div>
          </dl>
          {banner && (
            <div className="state state--error state--compact" role="alert">
              <div className="state__body">
                <h2>{banner === 'declined' ? t('co.declined.t') : t('err.t')}</h2>
                <p>{banner === 'declined' ? t('co.declined.d') : t('co.failed.d')}</p>
              </div>
            </div>
          )}
          <button className="btn btn--pay btn--lg" type="submit" disabled={paying}>
            {paying ? t('co.paying') : t('co.pay', { t: money(q.total) })}
          </button>
          <p className="muted small">{t('co.failNote')}</p>
        </aside>
      </form>
    </div>
  );
}
