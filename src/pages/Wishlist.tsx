import { api } from '../api';
import { EmptyState, ErrorState, GridSkeleton } from '../components/States';
import { ProductCard } from '../components/ProductCard';
import { useAsync } from '../hooks';
import { useI18n } from '../i18n';
import { useUser } from '../userContext';

export function Wishlist() {
  const { t, num } = useI18n();
  const { wishlist } = useUser();
  // Re-fetch whenever an item is added or removed.
  const res = useAsync(() => api.listWishlist(), `wl-${wishlist.join(',')}`);
  return (
    <div className="wrap page">
      <h1>{t('wl.title')}</h1>
      {res.status === 'ready' && res.data.length > 0 && <p className="muted">{t('wl.count', { n: num(res.data.length) })}</p>}
      {res.status === 'loading' && <GridSkeleton count={4} />}
      {res.status === 'error' && <ErrorState error={res.error} onRetry={res.reload} />}
      {res.status === 'ready' && res.data.length === 0 && <EmptyState title={t('wl.empty.t')} text={t('wl.empty.d')} cta={t('cart.empty.cta')} to="/products" />}
      {res.status === 'ready' && res.data.length > 0 && <div className="grid" data-testid="wishlist-grid">{res.data.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
    </div>
  );
}
