'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { EmptyState, PageHeader, PageSkeleton, Pager, ProductImage, StatusBadge } from '@/components/ui';

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    quantity: number;
    variant: {
      product: {
        name: string;
        brand: string;
        images: string[];
      };
    };
  }>;
};

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const fetchOrders = async () => {
      setFetchingOrders(true);
      try {
        const data = await apiFetch<{ items?: Order[]; total?: number }>(
          `/api/orders?page=${page}&pageSize=${PAGE_SIZE}`,
          undefined,
          'Failed to fetch orders'
        );
        if (cancelled) return;
        setOrders(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        if (!cancelled) setFetchingOrders(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user, page]);

  const loading = authLoading || fetchingOrders;

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <PageHeader eyebrow="Account" title="Orders" />
        <EmptyState
          eyebrow="Nothing here yet"
          title="No orders yet"
          description="When you place orders, they appear here."
          actionHref="/products"
          actionLabel="Start shopping"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <PageHeader eyebrow="Account" title="Orders" />

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="group block bg-white border border-black/15 hover:border-black p-6 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 border-b border-black/10 pb-6">
              <div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-widest mb-1">
                  Order {order.id.slice(0, 8)}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex -space-x-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 bg-neutral-50 border border-black overflow-hidden p-2"
                  >
                    <ProductImage src={item.variant.product.images[0]} alt={item.variant.product.name} />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-16 h-16 bg-black text-white border border-black flex items-center justify-center font-mono text-xs font-bold">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-black/60">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} item
                {order.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="font-display text-2xl font-bold">${order.total.toFixed(2)}</span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-black group-hover:underline">
                View
              </span>
            </div>
          </Link>
        ))}
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
    </div>
  );
}
