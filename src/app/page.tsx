'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ButtonLink } from '@/components/ui';
import { Header } from '@/components/layout/header';

export default function Home() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified! Welcome to Kickskraze.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center space-y-8">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.3em] text-black/40">
            Premium Sneaker Marketplace
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] uppercase">
            Find your
            <br />
            next grail
          </h1>

          <p className="text-base text-black/50 max-w-md mx-auto leading-relaxed">
            Curated drops from Nike, Jordan, Adidas, and New Balance. Authenticated. Delivered.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <ButtonLink href="/products">Shop now</ButtonLink>
            <ButtonLink href="/products?brand=Jordan" variant="secondary">
              Jordans
            </ButtonLink>
          </div>
        </div>
      </main>

      <footer className="border-t border-black/15">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[10px] font-mono text-black/30 uppercase tracking-widest">
          <span>&copy; 2026 Kickskraze</span>
          <span>All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
