import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../cartContext';
import { useUser } from '../userContext';
import { SignIn } from './SignIn';
import { Illustration } from '../components/Illustration';
import { EmptyState, ErrorState, PageSkeleton } from '../components/States';
import { useAsync } from '../hooks';
import { useI18n } from '../i18n';
import { COLOR_HEX } from '../mock/fixtures';
import type { Order } from '../types';

const TABS = ['orders', 'addresses', 'details'] as const;
type Tab = (typeof TABS)[number];

function OrderRow({ o }: { o: Order }) {
  const { t, lang, money, num, date, digits } = useI18n();
  const [open, setOpen] = useState(false);
  const count = o.lines.reduce((n, l) => n + l.qty, 0);
  return (
    <li className="order" data-testid="order-row">
      <div className="order__main">
        <div className="order__arts">
          {o.lines.slice(0, 3).map((l) => (
            <div key={l.productId + l.color + (l.size?.en ?? '')} className="mini__art" style={{ background: l.bg }}><Illustration kind={l.kind} c={COLOR_HEX[l.color]} d={l.accent} /></div>
          ))}
        </div>
        <div className="order__info">
          <strong>{t('ac.order', { id: digits(o.id) })}</strong>
          <span className="muted">{date(o.createdAt)} · {t('ac.items', { n: num(count) })}</span>
          <span className="muted small">{o.lines.map((l) => l.name[lang]).join(', ')}</span>
        </div>
        <span className={`badge badge--${o.status}`}>{t(`status.${o.status}`)}</span>
        <strong className="order__total">{money(o.quote.total)}</strong>
        <button className="btn btn--ghost" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? t('ac.hideDetails') : t('ac.details')}</button>
      </div>
      {open && (
        <div className="order__more">
          <ul className="mini">
            {o.lines.map((l) => (
              <li key={l.productId + l.color + (l.size?.en ?? '')}>
                <div className="mini__art" style={{ background: l.bg }}><Illustration kind={l.kind} c={COLOR_HEX[l.color]} d={l.accent} /></div>
                <div><div className="line__name">{l.name[lang]}</div><span className="muted small">{t(`color.${l.color}`)}{l.size ? ` · ${l.size[lang]}` : ''} · {t('co.qty', { n: num(l.qty) })}</span></div>
                <span>{money(l.unit * l.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="muted">{o.delivery.method === 'pickup' ? t('ac.addr.pickup') : `${o.delivery.address}, ${t(`city.${o.delivery.city}`)}`}</p>
          {o.status === 'processing' && <p className="muted">{t('ac.eta')}</p>}
        </div>
      )}
    </li>
  );
}

export function Account() {
  const { t, lang, digits } = useI18n();
  const user = useUser();
  const [sp, setSp] = useSearchParams();
  const tab: Tab = TABS.find((x) => x === sp.get('tab')) ?? 'orders';
  const { refresh } = useCart();
  const signedIn = !!user.account;
  const orders = useAsync(() => (signedIn ? api.listOrders() : Promise.resolve([] as Order[])), `orders-${signedIn}`);
  const account = useAsync(() => (signedIn ? api.getAccount() : Promise.resolve(null)), `account-${signedIn}`);
  const [done, setDone] = useState(false);

  async function reset() {
    await api.resetDemo();
    await refresh();
    await user.reload();
    orders.reload();
    setDone(true);
  }

  const addresses = new Map<string, string>();
  if (orders.status === 'ready') {
    for (const o of orders.data) {
      if (o.delivery.method === 'home') addresses.set(`${o.delivery.address}|${o.delivery.city}`, `${o.delivery.address}, ${t(`city.${o.delivery.city}`)}`);
    }
  }

  if (user.loading) return <div className="wrap page"><PageSkeleton /></div>;
  if (!user.account) return <SignIn notice />;

  return (
    <div className="wrap page">
      <h1>{t('ac.title')}</h1>
      {account.status === 'ready' && account.data && <p className="muted">{account.data.name[lang]} · {account.data.email}</p>}
      <div className="account-layout">
        <div className="tabs" role="tablist" aria-label={t('ac.title')}>
          {TABS.map((x) => (
            <button key={x} role="tab" id={`tab-${x}`} aria-selected={tab === x} aria-controls="panel" className={tab === x ? 'tab is-on' : 'tab'} onClick={() => setSp(x === 'orders' ? {} : { tab: x })}>
              {t(`ac.tab.${x}`)}
            </button>
          ))}
        </div>
        <div id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {tab === 'orders' && (
            <>
              <h2>{t('ac.orders')}</h2>
              {orders.status === 'loading' && <PageSkeleton />}
              {orders.status === 'error' && <ErrorState error={orders.error} onRetry={orders.reload} />}
              {orders.status === 'ready' && orders.data.length === 0 && <EmptyState title={t('ac.empty.t')} text={t('ac.empty.d')} cta={t('cart.empty.cta')} to="/products" />}
              {orders.status === 'ready' && orders.data.length > 0 && <ul className="orders">{orders.data.map((o) => <OrderRow key={o.id} o={o} />)}</ul>}
            </>
          )}
          {tab === 'addresses' && (
            <>
              <h2>{t('ac.tab.addresses')}</h2>
              {addresses.size === 0 ? <p className="muted">{t('ac.addr.empty')}</p> : <ul className="plain">{[...addresses.values()].map((a) => <li key={a} className="panel">{a}</li>)}</ul>}
            </>
          )}
          {tab === 'details' && (
            <>
              <h2>{t('ac.tab.details')}</h2>
              {account.status === 'ready' && account.data && (
                <dl className="facts panel">
                  <div><dt>{t('ac.field.name')}</dt><dd>{account.data.name[lang]}</dd></div>
                  <div><dt>{t('ac.field.email')}</dt><dd dir="ltr">{account.data.email}</dd></div>
                  <div><dt>{t('ac.field.phone')}</dt><dd dir="ltr">{digits(account.data.phone)}</dd></div>
                </dl>
              )}
              {account.status === 'error' && <ErrorState error={account.error} onRetry={account.reload} />}
              <div className="panel">
                <h3>{t('ac.reset.t')}</h3>
                <p className="muted">{t('ac.reset.d')}</p>
                <button className="btn btn--ghost" onClick={reset}>{t('ac.reset')}</button>
                <p role="status" className="msg">{done ? t('ac.reset.done') : ''}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
