import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { ApiError } from '../api/types';

export function ErrorState({ error, onRetry }: { error?: ApiError; onRetry?: () => void }) {
  const { t } = useI18n();
  const notFound = error?.code === 'not_found';
  return (
    <div className="state state--error" role="alert">
      <svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
        <circle cx="48" cy="48" r="34" fill="#F4D9D4" />
        <path d="M48 30v22" stroke="#8A2A1F" strokeWidth="6" strokeLinecap="round" />
        <circle cx="48" cy="64" r="4" fill="#8A2A1F" />
      </svg>
      <div className="state__body">
        <h2>{notFound ? t('err.notfound.t') : t('err.t')}</h2>
        <p>{notFound ? t('err.notfound.d') : t('err.d')}</p>
        {notFound ? (
          <Link className="btn btn--ghost" to="/products">{t('err.home')}</Link>
        ) : (
          onRetry && <button className="btn btn--ghost" onClick={onRetry}>{t('err.retry')}</button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, text, cta, to, onClick }: { title: string; text: string; cta?: string; to?: string; onClick?: () => void }) {
  return (
    <div className="state state--empty">
      <svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
        <rect x="14" y="30" width="68" height="46" rx="8" fill="#C9D3E8" />
        <path d="M30 30c0-14 36-14 36 0" fill="none" stroke="#23407A" strokeWidth="5" strokeLinecap="round" />
        <circle cx="38" cy="52" r="4" fill="#23407A" />
        <circle cx="58" cy="52" r="4" fill="#23407A" />
      </svg>
      <div className="state__body">
        <h2>{title}</h2>
        <p>{text}</p>
        {cta && to && <Link className="btn" to={to}>{cta}</Link>}
        {cta && onClick && <button className="btn" onClick={onClick}>{cta}</button>}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-live="polite">
      <p className="loading-label">
        {t('list.loading')}
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
      </p>
      <div className="grid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div className="card card--skeleton" key={i}>
            <div className="card__art sk" />
            <div className="card__body">
              <div className="sk sk--s" />
              <div className="sk sk--l" />
              <div className="sk sk--m" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  const { t } = useI18n();
  return (
    <div className="detail" role="status" aria-live="polite" aria-label={t('list.loading')}>
      <div className="detail__art sk" />
      <div className="detail__info">
        <div className="sk sk--s" /><div className="sk sk--l" /><div className="sk sk--m" /><div className="sk sk--l" />
      </div>
    </div>
  );
}
