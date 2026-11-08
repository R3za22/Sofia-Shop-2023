import { useUser } from '../userContext';
import { useI18n } from '../i18n';
import type { Product } from '../types';

export function HeartButton({ product, className = '' }: { product: Product; className?: string }) {
  const { t, lang } = useI18n();
  const { wishlist, toggleWishlist } = useUser();
  const on = wishlist.includes(product.id);
  const name = product.name[lang];
  return (
    <button
      type="button"
      className={`heart ${on ? 'is-on' : ''} ${className}`}
      aria-pressed={on}
      aria-label={t(on ? 'wl.remove' : 'wl.add', { n: name })}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleWishlist(product.id);
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
      </svg>
    </button>
  );
}
