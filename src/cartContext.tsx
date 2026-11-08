import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { CartView, City, ColorId, DeliveryMethod } from './types';

interface CartCtx {
  cart: CartView | null;
  /** True until the first cart load settles. */
  loading: boolean;
  failed: boolean;
  refresh(): Promise<void>;
  add(productId: string, color: ColorId, qty: number, size?: string): Promise<void>;
  setQty(productId: string, color: ColorId, qty: number, size?: string): Promise<void>;
  remove(productId: string, color: ColorId, size?: string): Promise<void>;
  setDelivery(o: { city?: City; method?: DeliveryMethod }): Promise<void>;
  applyCode(code: string): Promise<void>;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setCart(await api.getCart());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<CartCtx>(() => {
    const run = (p: Promise<CartView>) => p.then(setCart);
    return {
      cart, loading, failed, refresh,
      add: (id, color, qty, size) => run(api.addToCart(id, color, qty, size)),
      setQty: (id, color, qty, size) => run(api.setQty(id, color, qty, size)),
      remove: (id, color, size) => run(api.removeLine(id, color, size)),
      setDelivery: (o) => run(api.setDelivery(o)),
      applyCode: (code) => run(api.applyCode(code)),
    };
  }, [cart, loading, failed, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart outside CartProvider');
  return v;
}
