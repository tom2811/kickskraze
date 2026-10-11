'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/lib/auth-context';
import { Button, ButtonLink, PageHeader, PageSkeleton, SelectField, TextField } from '@/components/ui';

export default function CheckoutPage() {
  const { items, total, isLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const data = await apiFetch<{ url?: string }>(
        '/api/checkout',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shippingAddress }),
        },
        'Checkout failed'
      );

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Sign in to checkout</h2>
        <ButtonLink href="/login?redirectTo=/checkout">Sign in</ButtonLink>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Your cart is empty</h2>
        <ButtonLink href="/products">Continue shopping</ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <PageHeader eyebrow="Checkout" title="Shipping" />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-black p-6">
              <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-black/40 mb-6">Shipping address</h2>

              {error && (
                <div className="mb-4 p-3 border border-black text-xs font-mono uppercase font-bold">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <TextField
                  label="Full name"
                  required
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                />
                <TextField
                  label="Street address"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="City"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  />
                  <TextField
                    label="State"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="ZIP code"
                    required
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  />
                  <SelectField
                    label="Country"
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  >
                    <option value="US">United States</option>
                  </SelectField>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={processing} className="w-full">
              {processing ? 'Processing...' : 'Continue to payment'}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="border border-black p-6 sticky top-6">
            <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-black/40 mb-6">Order summary</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm font-mono">
                  <span className="text-black/60 truncate mr-2">
                    {item.variant.product.name} &times;{item.quantity}
                  </span>
                  <span className="font-bold flex-shrink-0">
                    ${(item.variant.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-black pt-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
