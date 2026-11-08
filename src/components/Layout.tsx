import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { isStorageBlocked } from '../api';
import { useCart } from '../cartContext';
import { useI18n } from '../i18n';
import type { Room } from '../types';

const ROOMS: Room[] = ['living', 'dining', 'bedroom', 'lighting', 'decor'];

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <rect width="56" height="56" rx="12" fill="#23407A" />
      <path d="M14 40V28a14 14 0 0 1 28 0v12" fill="none" stroke="#E3A53B" strokeWidth="5" strokeLinecap="round" />
      <rect x="10" y="38" width="36" height="6" rx="3" fill="#EEF1F0" />
    </svg>
  );
}

function Header() {
  const { t, lang, setLang, num } = useI18n();
  const { cart } = useCart();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const activeRoom = loc.pathname === '/products' ? sp.get('room') : null;
  const count = cart?.count ?? 0;
  return (
    <header className="header">
      <div className="wrap header__row">
        <Link to="/" className="brand">
          <Logo />
          <span>{t('brand')}</span>
        </Link>
        <nav className="nav" aria-label={t('nav.main')}>
          {ROOMS.map((r) => (
            <Link key={r} to={`/products?room=${r}`} className={activeRoom === r ? 'nav__link is-active' : 'nav__link'} aria-current={activeRoom === r ? 'page' : undefined}>
              {t(`room.${r}`)}
            </Link>
          ))}
        </nav>
        <div className="header__tools">
          <button className="icon-btn lang" lang={lang === 'en' ? 'fa' : 'en'} aria-label={t('nav.lang.label')} onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}>
            {t('nav.lang')}
          </button>
          <NavLink to="/account" className="icon-btn" aria-label={t('nav.account')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </NavLink>
          <NavLink to="/cart" className="cart-link" data-testid="cart-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 4h3l2.4 11h10l2-8H7" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
            </svg>
            <span>{t('nav.cart')}</span>
            <span className="cart-link__n" aria-label={String(count)}>{num(count)}</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="wrap footer__row">
        <p>{t('footer.about')}</p>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/products">{t('footer.products')}</Link>
          <Link to="/account">{t('footer.orders')}</Link>
          <Link to="/about">{t('footer.aboutLink')}</Link>
        </nav>
      </div>
    </footer>
  );
}

function DemoBanner() {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  if (!__DEMO__ || !open) return null;
  return (
    <div className="demo-banner" role="region" aria-label="Demo">
      <span>{t('demo.banner')}</span>
      <a href="https://rezaghamar.ir">{t('demo.back')}</a>
      <button onClick={() => setOpen(false)} aria-label={t('demo.dismiss')}>×</button>
    </div>
  );
}

export function Layout() {
  const { t } = useI18n();
  const storageBlocked = isStorageBlocked();
  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <DemoBanner />
      <Header />
      {storageBlocked && <p className="notice" role="status">{t('store.blocked')}</p>}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
