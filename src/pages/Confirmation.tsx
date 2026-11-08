import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { Illustration } from '../components/Illustration';
import { ErrorState, PageSkeleton } from '../components/States';
import { useAsync } from '../hooks';
import { useI18n } from '../i18n';
import { COLOR_HEX } from '../mock/fixtures';

export function Confirmation() {
  const { id = '' } = useParams();
  const { t, lang, money, num, digits } = useI18n();
  const res = useAsync(() => api.getOrder(id), id);
  if (res.status === 'loading') return <div className="wrap page"><PageSkeleton /></div>;
  if (res.status === 'error') return <div className="wrap page"><ErrorState error={res.error} onRetry={res.reload} /></div>;
  const o = res.data;
  const first = o.customer.name.split(' ')[0];
  const pickup = o.delivery.method === 'pickup';
  const p = digits(o.customer.phone);
  return (
    <div className="wrap page confirm">
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#DCE8DA" /><path d="M20 33l8 8 16-18" fill="none" stroke="#1E4A2B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <h1 tabIndex={-1}>{t('cf.title', { n: first })}</h1>
      <p className="lead" data-testid="order-id">{t(pickup ? 'cf.lead.pickup' : 'cf.lead', { id: digits(o.id), p })}</p>
      <div className="confirm__grid">
        <div className="panel">
          <dl className="facts">
            <div><dt>{pickup ? t('cf.pickup') : t('cf.delivery')}</dt><dd>{pickup ? t('cf.showroom') : `${o.customer.name}, ${o.delivery.address}, ${t(`city.${o.delivery.city}`)}`}</dd></div>
            <div><dt>{t('cf.eta')}</dt><dd>{pickup ? t('co.method.pickup.d') : t('co.method.home.d')}</dd></div>
            <div><dt>{t('cf.payment')}</dt><dd>{t('cf.paymentValue', { l: digits(o.payment.last4) })} <span className="badge badge--done">{t('cf.paid')}</span></dd></div>
          </dl>
        </div>
        <div className="panel">
          <ul className="mini">
            {o.lines.map((l) => (
              <li key={l.productId + l.color}>
                <div className="mini__art" style={{ background: l.bg }}><Illustration kind={l.kind} c={COLOR_HEX[l.color]} d={l.accent} /></div>
                <div><div className="line__name">{l.name[lang]}</div><span className="muted small">{t('co.qty', { n: num(l.qty) })}</span></div>
                <span>{money(l.unit * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="totals"><div className="totals__grand"><dt>{t('cf.total')}</dt><dd>{money(o.quote.total)}</dd></div></dl>
        </div>
      </div>
      <div className="actions">
        <Link className="btn" to="/account">{t('cf.orders')}</Link>
        <Link className="btn btn--ghost" to="/products">{t('cf.keep')}</Link>
      </div>
    </div>
  );
}
