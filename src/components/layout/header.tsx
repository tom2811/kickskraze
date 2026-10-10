import Link from 'next/link';
import { CartButton } from '@/components/cart/cart-button';
import { UserMenu } from '@/components/auth/user-menu';

export function Header({ mode = 'store' }: { mode?: 'store' | 'admin' }) {
  const homeHref = mode === 'admin' ? '/admin' : '/';

  return (
    <nav className="border-b border-black/15 bg-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={homeHref} className="font-display text-lg font-bold tracking-[0.15em] uppercase">
          Kicks<span className="font-extrabold">kraze</span>
        </Link>
        <div className="flex items-center gap-5 text-[11px] font-mono font-semibold uppercase tracking-widest">
          {mode === 'store' && (
            <Link
              href="/products"
              className="py-1 px-2 text-black hover:bg-black hover:text-white transition-colors"
            >
              [ SHOP ]
            </Link>
          )}
          {mode === 'store' && <CartButton />}
          <UserMenu mode={mode} />
        </div>
      </div>
    </nav>
  );
}
