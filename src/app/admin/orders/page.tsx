'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ButtonLink, ORDER_STATUSES, PageHeader, PageSkeleton, Pager, SelectField } from '@/components/ui';
import { StatusBadge } from '@/components/ui';

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    email: string;
  };
  items: Array<{
    quantity: number;
  }>;
};

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    let cancelled = false;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/orders?page=${page}&pageSize=${PAGE_SIZE}`);
        if (res.status === 403) {
          if (!cancelled) setError('Access denied. Admin privileges required.');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch orders');

        const data = await res.json();
        if (cancelled) return;
        setOrders(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router, page]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update order');

      const updatedOrder = await res.json();
      setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (authLoading || loading) {
    return <PageSkeleton rows={4} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">{error}</h2>
        <ButtonLink href="/">Go home</ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader eyebrow={`${total} total`} title="Orders" />

      {orders.length === 0 ? (
        <div className="border border-black/15 p-12 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40">No orders yet</p>
        </div>
      ) : (
        <div className="border border-black overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-black">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Date', 'Status', ''].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-black/40"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-black/5">
                  <td className="px-6 py-4 text-sm font-mono">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm font-mono">{order.user.email}</td>
                  <td className="px-6 py-4 text-sm font-mono text-black/60">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-mono text-black/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <SelectField
                        label=""
                        aria-label={`Status for order ${order.id.slice(0, 8)}`}
                        value={order.status}
                        disabled={updatingOrder === order.id}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="min-w-[10rem]"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-[10px] font-mono font-bold uppercase tracking-widest hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
    </div>
  );
}
