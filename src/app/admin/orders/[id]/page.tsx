'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  ButtonLink,
  ORDER_STATUSES,
  PageHeader,
  PageSkeleton,
  ProductImage,
  SelectField,
  StatusBadge,
} from '@/components/ui';

type AdminOrderDetail = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  user: {
    id: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      size: string;
      product: {
        id: string;
        name: string;
        brand: string;
        colorway: string;
        images: string[];
      };
    };
  }>;
};

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    let cancelled = false;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<AdminOrderDetail>(
          `/api/admin/orders/${id}`,
          undefined,
          'Failed to fetch order'
        );
        if (!cancelled) {
          setOrder(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch order');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [id, user, authLoading, router]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    setStatusMessage(null);
    try {
      const updated = await apiFetch<AdminOrderDetail>(
        `/api/admin/orders/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        },
        'Failed to update order status'
      );
      setOrder(updated);
      setStatusMessage(`Status changed to ${newStatus}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return <PageSkeleton rows={4} />;
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">
          {error || 'Order not found'}
        </h2>
        <ButtonLink href="/admin/orders">← Back to Orders</ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors"
        >
          ← All Orders
        </Link>
      </div>

      <PageHeader
        eyebrow={`Placed on ${new Date(order.createdAt).toLocaleDateString()}`}
        title={`Order #${order.id.slice(0, 8)}`}
      >
        <div className="flex items-center gap-4">
          <StatusBadge status={order.status} />
          <SelectField
            label=""
            aria-label="Order status"
            value={order.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="min-w-[12rem]"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectField>
        </div>
      </PageHeader>

      {statusMessage ? (
        <div className="mb-6 p-3 border border-black bg-accent text-black font-mono text-xs font-bold uppercase tracking-widest">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-8 mb-10">
        {/* Customer Information */}
        <div className="border border-black p-6 bg-white">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-3 border-b border-black/10 pb-2">
            Customer
          </h3>
          <div className="font-mono text-xs space-y-1 text-black/80">
            <p className="font-bold text-black">{order.user.email}</p>
            <p className="text-[10px] text-black/40 uppercase tracking-widest">
              User ID // {order.user.id}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border border-black p-6 bg-white">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-3 border-b border-black/10 pb-2">
            Shipping Address
          </h3>
          <div className="font-mono text-xs space-y-1 text-black/80 uppercase">
            <p className="font-bold text-black">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="border border-black p-6 bg-white">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-3 border-b border-black/10 pb-2">
            Order Total
          </h3>
          <div className="font-mono text-xs space-y-2 text-black/80">
            <div className="flex justify-between">
              <span>Items</span>
              <span>
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-black/10 font-bold text-black text-sm">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Lines */}
      <div className="border border-black bg-white">
        <div className="p-6 border-b border-black">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight">
            Line Items ({order.items.length})
          </h3>
        </div>
        <div className="divide-y divide-black/10">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border border-black/15 bg-neutral-50 p-1 flex-shrink-0 relative">
                  <ProductImage
                    src={item.variant.product.images[0]}
                    alt=""
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold uppercase tracking-tight">
                    {item.variant.product.brand} {item.variant.product.name}
                  </h4>
                  <p className="font-mono text-xs text-black/60 uppercase">
                    {item.variant.product.colorway}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-black/40 mt-1">
                    Size: {item.variant.size}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 font-mono text-xs">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-black/40 block">Unit Price</span>
                  <span className="font-bold">${item.price.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-black/40 block">Qty</span>
                  <span className="font-bold">x{item.quantity}</span>
                </div>
                <div className="text-right min-w-[5rem]">
                  <span className="text-[10px] uppercase text-black/40 block">Total</span>
                  <span className="font-display text-base font-black">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
