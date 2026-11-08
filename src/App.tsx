import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CartProvider } from './cartContext';
import { Layout } from './components/Layout';
import { I18nProvider } from './i18n';
import { About } from './pages/About';
import { Account } from './pages/Account';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Confirmation } from './pages/Confirmation';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Product } from './pages/Product';
import { Products } from './pages/Products';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <HashRouter>
          <ScrollTop />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="product/:id" element={<Product />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order/:id" element={<Confirmation />} />
              <Route path="account" element={<Account />} />
              <Route path="about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </CartProvider>
    </I18nProvider>
  );
}
