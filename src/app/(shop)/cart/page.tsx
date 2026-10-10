'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { CartItem } from '@/components/cart/cart-item';
import { Button, ButtonLink, EmptyState, PageHeader, PageSkeleton } from '@/components/ui';

export default function CartPage() {
  const router = useRouter();
  const { items, total, isLoading } = useCart();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        eyebrow="Nothing here yet"
        title="Your cart is empty"
        description="Start adding some sneakers to your collection."
        actionHref="/products"
        actionLabel="Browse products"
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <PageHeader eyebrow="Cart" title="Shopping cart" />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border border-black p-6">
            {items.map((item) => (
              <CartItem key={item.id} {...item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border border-black p-6 sticky top-6">
            <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-black/40 mb-6">Order summary</h2>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-black/60 font-mono">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black/60 font-mono">
                <span>Shipping</span>
                <span>At checkout</span>
              </div>
              <div className="flex justify-between text-black/60 font-mono">
                <span>Tax</span>
                <span>At checkout</span>
              </div>
              <div className="border-t border-black pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full mb-3" onClick={() => router.push('/checkout')}>
              Checkout
            </Button>

            <ButtonLink
              href="/products"
              variant="ghost"
              className="w-full text-black/40 hover:text-black"
            >
              Continue shopping
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
