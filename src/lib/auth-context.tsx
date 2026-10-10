'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from './supabase';

type AppRole = 'USER' | 'ADMIN';

type AuthContextType = {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    const loadRole = async (nextUser: User | null) => {
      if (!nextUser) {
        setRole(null);
        return;
      }
      const res = await fetch('/api/session');
      if (!res.ok) {
        setRole(null);
        return;
      }
      const data = (await res.json()) as { role?: AppRole };
      if (!cancelled) setRole(data.role ?? 'USER');
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await loadRole(nextUser);
      if (!cancelled) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void loadRole(nextUser);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    const wasAdmin = role === 'ADMIN';
    await fetch('/api/session', { method: 'DELETE' });
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    if (wasAdmin) {
      window.location.assign('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
