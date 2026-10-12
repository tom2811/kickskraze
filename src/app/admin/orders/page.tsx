'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  ButtonLink,
  ORDER_STATUSES,
  PageHeader,
  PageSkeleton,
  Pager,
  SelectField,
  StatusBadge,
} from '@/components/ui';

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

type OrdersResponse = {
  items?: Order[];
  total?: number;
  actionableCount?: number;
  deliveredCount?: number;
  cancelledCount?: number;
};

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionableCount, setActionableCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [queue, setQueue] = useState<'ACTIONABLE' | 'ALL' | 'DELIVERED' | 'CANCELLED'>('ACTIONABLE');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

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
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString(),
        });
        if (queue !== 'ALL') params.set('queue', queue);
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const data = await apiFetch<OrdersResponse>(
          `/api/admin/orders?${params.toString()}`,
          undefined,
          'Failed to fetch orders'
        );
        if (cancelled) return;

        setOrders(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
        setActionableCount(typeof data.actionableCount === 'number' ? data.actionableCount : 0);
        setDeliveredCount(typeof data.deliveredCount === 'number' ? data.deliveredCount : 0);
        setCancelledCount(typeof data.cancelledCount === 'number' ? data.cancelledCount : 0);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to fetch orders';
          setError(message === 'Forbidden' ? 'Access denied. Admin privileges required.' : message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router, page, queue, debouncedSearch]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await apiFetch(
        `/api/admin/orders/${orderId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        },
        'Failed to update order status'
      );
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
      alert(message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (authLoading || (loading && !orders.length && !search)) {
    return <PageSkeleton rows={4} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">{error}</h2>
        <ButtonLink href="/admin">Dashboard</ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader eyebrow="Operations" title="Customer Orders" />
        <Link
          href="/admin/inventory"
          className="inline-flex items-center px-4 py-2 border border-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors self-start sm:self-auto"
        >
          [ Check Inventory &rarr; ]
        </Link>
      </div>

      {/* Queue Filter Tabs and Search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Workflow Tabs */}
        <div className="flex border border-black bg-white">
          <button
            type="button"
            onClick={() => {
              setQueue('ACTIONABLE');
              setPage(1);
            }}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
              queue === 'ACTIONABLE'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            To Fulfill [{actionableCount}]
          </button>
          <button
            type="button"
            onClick={() => {
              setQueue('ALL');
              setPage(1);
            }}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest border-l border-black transition-colors ${
              queue === 'ALL'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            All Orders [{total}]
          </button>
          <button
            type="button"
            onClick={() => {
              setQueue('DELIVERED');
              setPage(1);
            }}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest border-l border-black transition-colors ${
              queue === 'DELIVERED'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            Delivered [{deliveredCount}]
          </button>
          <button
            type="button"
            onClick={() => {
              setQueue('CANCELLED');
              setPage(1);
            }}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest border-l border-black transition-colors ${
              queue === 'CANCELLED'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            Cancelled/Pending [{cancelledCount}]
          </button>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="SEARCH BY ORDER ID / EMAIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-widest border border-black placeholder:text-black/30 focus:outline-none focus:bg-neutral-50"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="border border-black p-12 text-center bg-white">
          <p className="text-xs font-mono uppercase tracking-widest text-black/40">
            {debouncedSearch
              ? 'No orders matching search'
              : queue === 'ACTIONABLE'
              ? 'Action queue empty. All paid orders have been fulfilled!'
              : 'No orders found'}
          </p>
        </div>
      ) : (
        <div className="border border-black overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-black">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-6 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-black/40"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {orders.map((order) => {
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <tr key={order.id} className="hover:bg-black/5">
                    <td className="px-6 py-4 font-mono text-xs text-black">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-bold underline hover:text-black/60"
                      >
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-black/60">
                      {order.user.email}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-black">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-black text-black">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-black/40">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <SelectField
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingOrder === order.id}
                        className="text-xs"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </SelectField>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
    </div>
  );
}
