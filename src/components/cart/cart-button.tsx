'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { CartDrawer } from './cart-drawer';

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="py-1 px-2 text-black hover:bg-black hover:text-white transition-colors"
        aria-label="Open cart"
      >
        [ CART{itemCount > 0 ? ` (${itemCount})` : ''} ]
      </button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
