'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { CartItem } from './cart-item';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, itemCount, isLoading } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l-2 border-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-black">
            Cart ({itemCount})
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black hover:text-white transition-colors text-xs font-mono uppercase tracking-widest font-bold"
            aria-label="Close cart"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          {isLoading ? (
            <div className="text-center py-16 text-xs font-mono uppercase tracking-widest text-black/30">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xs font-mono uppercase tracking-widest text-black/30 mb-6">Your cart is empty</p>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-block px-6 py-2.5 bg-black text-white border-2 border-black text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t-2 border-black px-6 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold">Subtotal</span>
              <span className="font-black text-base">${total.toFixed(2)}</span>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full text-center px-6 py-3 bg-black text-white border-2 border-black text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              View cart &amp; checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-[10px] font-mono uppercase tracking-widest text-black/40 hover:text-black transition-colors pt-1"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
