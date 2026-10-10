'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { PageHeader, PageSkeleton } from '@/components/ui';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.name || 'User';
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <PageHeader eyebrow="Account" title="Profile" />

      <div className="bg-white border border-black p-8 mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-24 h-24 bg-black text-white flex items-center justify-center font-display font-black text-4xl flex-shrink-0 border border-black">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="font-display text-3xl font-black uppercase">{userName}</h2>
            <p className="font-mono text-sm uppercase tracking-widest text-black/60">{user.email}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/40 pt-2">
              Member since {memberSince}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/orders"
          className="group bg-white border border-black/20 hover:border-black p-8 transition-colors"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center group-hover:bg-white group-hover:text-black border border-black transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-widest">Orders</h3>
          </div>
          <p className="font-mono text-xs text-black/60 leading-relaxed">
            View past orders and track shipments.
          </p>
        </Link>

        <div className="bg-white border border-black/10 p-8 opacity-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-black/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-widest">AI Chat</h3>
          </div>
          <p className="font-mono text-xs text-black/60 leading-relaxed uppercase tracking-widest">
            Coming Phase 7
          </p>
        </div>

        <div className="bg-white border border-black/10 p-8 opacity-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-black/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-widest">Addresses</h3>
          </div>
          <p className="font-mono text-xs text-black/60 leading-relaxed uppercase tracking-widest">
            Coming Phase 5
          </p>
        </div>

        <div className="bg-white border border-black/10 p-8 opacity-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-black/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-widest">Payment</h3>
          </div>
          <p className="font-mono text-xs text-black/60 leading-relaxed uppercase tracking-widest">
            Coming Phase 4
          </p>
        </div>
      </div>
    </div>
  );
}
