'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const itemClass =
  'block px-4 py-2.5 text-black hover:bg-black hover:text-white border-b border-black/10 transition-colors';

export function UserMenu({ mode = 'store' }: { mode?: 'store' | 'admin' }) {
  const { user, role, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return <div className="w-6 h-6 bg-black/10 animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="py-1 px-2 text-black hover:bg-black hover:text-white transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="bg-black text-white px-3 py-1 border-2 border-black hover:bg-white hover:text-black transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const isAdmin = role === 'ADMIN';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-1 px-2 text-black hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black"
      >
        <span className="hidden md:block truncate max-w-[80px]">{userName}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white border border-black z-20 text-xs tracking-widest font-mono">
            <Link href="/profile" onClick={() => setIsOpen(false)} className={itemClass}>
              Profile
            </Link>
            {mode === 'store' && (
              <Link href="/orders" onClick={() => setIsOpen(false)} className={itemClass}>
                Orders
              </Link>
            )}
            {isAdmin && mode === 'store' && (
              <Link href="/admin" onClick={() => setIsOpen(false)} className={`${itemClass} font-bold`}>
                Admin
              </Link>
            )}
            {mode === 'admin' && (
              <Link href="/" onClick={() => setIsOpen(false)} className={itemClass}>
                View Store
              </Link>
            )}
            <button
              onClick={() => {
                void signOut();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
