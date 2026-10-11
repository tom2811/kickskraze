'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/lib/auth-context';
import { Button, ButtonLink, PageHeader, PageSkeleton, SelectField, TextField } from '@/components/ui';

type SavedAddress = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { items, total, isLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveToBook, setSaveToBook] = useState(true);

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const fetchAddresses = async () => {
      try {
        const list = await apiFetch<SavedAddress[]>(
          '/api/addresses',
          undefined,
          'Failed to load saved addresses'
        );
        if (cancelled) return;

        if (Array.isArray(list) && list.length > 0) {
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddr.id);
          setShippingAddress({
            name: defaultAddr.name,
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state,
            zip: defaultAddr.zip,
            country: defaultAddr.country || 'US',
          });
        }
      } catch {
        // Fall back to entering a manual address
      }
    };

    fetchAddresses();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setShippingAddress({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      });
      return;
    }

    const found = savedAddresses.find((a) => a.id === id);
    if (found) {
      setShippingAddress({
        name: found.name,
        street: found.street,
        city: found.city,
        state: found.state,
        zip: found.zip,
        country: found.country || 'US',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // If entering a new address and user opted to save to address book
      if (selectedAddressId === 'new' && saveToBook) {
        try {
          await apiFetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...shippingAddress,
              isDefault: savedAddresses.length === 0,
            }),
          });
        } catch {
          // Non-blocking: continue with checkout even if address save fails
        }
      }

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
            <div className="border border-black p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-black/40">
                  Shipping address
                </h2>
                <Link
                  href="/addresses"
                  className="text-[10px] font-mono uppercase tracking-widest text-black/50 hover:text-black underline"
                >
                  Manage Address Book
                </Link>
              </div>

              {error && (
                <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-700 text-xs font-mono uppercase font-bold">
                  {error}
                </div>
              )}

              {/* Saved Address Selector */}
              {savedAddresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest font-bold text-black/50">
                    Choose Saved Address
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectAddress(addr.id)}
                          className={`text-left p-4 border transition-all relative ${
                            isSelected
                              ? 'border-black bg-black text-white'
                              : 'border-black/20 bg-white text-black hover:border-black'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-display font-bold uppercase text-sm truncate">
                              {addr.name}
                            </span>
                            {addr.isDefault && (
                              <span
                                className={`text-[9px] font-mono uppercase px-1.5 py-0.2 border ${
                                  isSelected
                                    ? 'border-white text-white'
                                    : 'border-black text-black'
                                }`}
                              >
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p
                            className={`font-mono text-xs ${
                              isSelected ? 'text-white/80' : 'text-black/60'
                            }`}
                          >
                            {addr.street}
                          </p>
                          <p
                            className={`font-mono text-[11px] ${
                              isSelected ? 'text-white/70' : 'text-black/50'
                            }`}
                          >
                            {addr.city}, {addr.state} {addr.zip}
                          </p>
                        </button>
                      );
                    })}

                    {/* Enter New Address Card */}
                    <button
                      type="button"
                      onClick={() => handleSelectAddress('new')}
                      className={`text-left p-4 border transition-all flex flex-col justify-center ${
                        selectedAddressId === 'new'
                          ? 'border-black bg-black text-white'
                          : 'border-dashed border-black/30 bg-neutral-50 text-black hover:border-black'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold uppercase tracking-widest">
                        + Enter New Address
                      </span>
                      <span
                        className={`text-[10px] font-mono mt-1 ${
                          selectedAddressId === 'new' ? 'text-white/70' : 'text-black/40'
                        }`}
                      >
                        Type a custom shipping destination
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Address Form Fields */}
              <div className="space-y-4 pt-2">
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

                {selectedAddressId === 'new' && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveToBook"
                      checked={saveToBook}
                      onChange={(e) => setSaveToBook(e.target.checked)}
                      className="w-4 h-4 rounded-none border border-black accent-black"
                    />
                    <label
                      htmlFor="saveToBook"
                      className="font-mono text-xs uppercase tracking-widest text-black/70 cursor-pointer"
                    >
                      Save this address to my address book
                    </label>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={processing} className="w-full">
              {processing ? 'Processing...' : 'Continue to payment'}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="border border-black p-6 sticky top-6 bg-white">
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
