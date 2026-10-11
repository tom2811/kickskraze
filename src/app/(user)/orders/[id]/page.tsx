'use client';

import { use, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { ButtonLink, PageHeader, PageSkeleton, ProductImage, StatusBadge } from '@/components/ui';

type Order = {
  id: string;
  total: number;
  status: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      size: string;
      product: {
        name: string;
        brand: string;
        colorway: string;
        images: string[];
      };
    };
  }>;
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchOrder();
    }
  }, [user, authLoading, id, router]);

  const fetchOrder = async () => {
    try {
      const data = await apiFetch<Order>(`/api/orders/${id}`, undefined, 'Order not found');
      setOrder(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">{error}</h2>
        <ButtonLink href="/orders" variant="secondary">
          View all orders
        </ButtonLink>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {isSuccess && (
        <div className="mb-10 p-6 bg-black text-white border border-black">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-2">
            Order confirmed
          </h2>
          <p className="font-mono text-sm leading-relaxed text-white/70">
            Thank you for your purchase. We received your order and will begin processing it shortly.
          </p>
        </div>
      )}

      <PageHeader eyebrow={`Placed ${new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`} title={`Order ${order.id.slice(0, 8)}`}>
        <StatusBadge status={order.status} />
      </PageHeader>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-black p-8">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight border-b border-black/15 pb-4 mb-4">
            Shipping address
          </h3>
          <div className="font-mono text-sm leading-relaxed text-black/70">
            <p className="text-black font-bold mb-1">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="bg-white border border-black p-8">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight border-b border-black/15 pb-4 mb-4">
            Order summary
          </h3>
          <div className="font-mono text-sm space-y-3">
            <div className="flex justify-between uppercase tracking-widest">
              <span className="text-black/40">Subtotal</span>
              <span className="text-black">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between uppercase tracking-widest">
              <span className="text-black/40">Shipping</span>
              <span className="text-black">Free</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-black/15">
              <span className="font-display text-xl font-bold uppercase">Total</span>
              <span className="font-display text-xl font-bold">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black">
        <div className="p-8 border-b border-black">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight">Items</h3>
        </div>
        <div className="divide-y divide-black/10">
          {order.items.map((item) => (
            <div key={item.id} className="p-8 flex flex-col sm:flex-row gap-6">
              <div className="relative w-24 h-24 bg-neutral-50 border border-black flex-shrink-0 p-3">
                <ProductImage src={item.variant.product.images[0]} alt={item.variant.product.name} />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-display text-xl font-bold uppercase">{item.variant.product.brand}</h4>
                <p className="font-mono text-sm uppercase text-black/80 mb-1">{item.variant.product.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                  {item.variant.product.colorway} / Size {item.variant.size}
                </p>
              </div>
              <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-end text-right">
                <p className="font-display text-xl font-bold mb-1">${item.price.toFixed(2)}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-black/40">Qty {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <ButtonLink href="/orders" variant="secondary">
          All orders
        </ButtonLink>
        <ButtonLink href="/products">Continue shopping</ButtonLink>
      </div>
    </div>
  );
}
