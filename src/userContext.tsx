import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { Account } from './types';

interface UserCtx {
  account: Account | null;
  /** True until the session check settles. */
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  wishlist: string[];
  toggleWishlist(productId: string): Promise<void>;
  /** Re-read session and wishlist (after a demo reset). */
  reload(): Promise<void>;
}

const Ctx = createContext<UserCtx | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const reload = useCallback(async () => {
    const [acc, wl] = await Promise.all([api.getAccount().catch(() => null), api.getWishlist().catch(() => [] as string[])]);
    setAccount(acc);
    setWishlist(wl);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<UserCtx>(
    () => ({
      account, loading, wishlist, reload,
      signIn: async (email, password) => setAccount(await api.signIn(email, password)),
      signOut: async () => {
        await api.signOut();
        setAccount(null);
      },
      toggleWishlist: async (id) => setWishlist(await api.toggleWishlist(id)),
    }),
    [account, loading, wishlist, reload],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser(): UserCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUser outside UserProvider');
  return v;
}
