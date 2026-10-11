'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { PageHeader, PageSkeleton } from '@/components/ui';

type DashboardMetrics = {
  productCount: number;
  orderCount: number;
  userCount: number;
  revenue: number;
  aov: number;
  recentOrders30d: number;
  recentRevenue30d: number;
  outOfStockVariants: number;
  ordersByStatus: {
    PENDING: number;
    PAID: number;
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'30D' | 'ALL'>('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    let cancelled = false;
    const fetchMetrics = async () => {
      try {
        const data = await apiFetch<DashboardMetrics>(
          '/api/admin/metrics',
          undefined,
          'Failed to load metrics'
        );
        if (!cancelled) setMetrics(data);
      } catch {
        // Non-blocking fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMetrics();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  if (!user) return null;

  const displayedRevenue =
    timeframe === '30D'
      ? metrics?.recentRevenue30d ?? 0
      : metrics?.revenue ?? 0;

  const displayedOrders =
    timeframe === '30D'
      ? metrics?.recentOrders30d ?? 0
      : metrics?.orderCount ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader eyebrow="Console" title="Admin Overview" />

        {/* Timeframe Toggle Buttons */}
        <div className="flex border border-black bg-white self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe('ALL')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              timeframe === 'ALL'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            All-Time
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('30D')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest border-l border-black transition-colors ${
              timeframe === '30D'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Top Level Metric Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="border border-black p-6 bg-white">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/50 font-bold mb-2">
            {timeframe === '30D' ? '30D Revenue' : 'Net Revenue'}
          </p>
          <p className="font-display text-3xl lg:text-4xl font-black text-black">
            ${displayedRevenue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 mt-2">
            Paid &amp; Delivered
          </p>
        </div>

        <div className="border border-black p-6 bg-white">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/50 font-bold mb-2">
            Average Order Value (AOV)
          </p>
          <p className="font-display text-3xl lg:text-4xl font-black text-black">
            ${metrics?.aov ? metrics.aov.toFixed(2) : '0.00'}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 mt-2">
            Per fulfilled basket
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="border border-black p-6 bg-white hover:bg-black hover:text-white transition-colors group"
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/50 group-hover:text-white/70 font-bold mb-2">
            {timeframe === '30D' ? '30D Order Velocity' : 'Total Orders'}
          </p>
          <p className="font-display text-3xl lg:text-4xl font-black">
            {displayedOrders}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-white/60 mt-2">
            Manage orders &rarr;
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="border border-black p-6 bg-white hover:bg-black hover:text-white transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/50 group-hover:text-white/70 font-bold">
              Catalog &amp; Stock
            </p>
            {metrics?.outOfStockVariants && metrics.outOfStockVariants > 0 ? (
              <span className="text-[9px] font-mono uppercase tracking-widest font-bold px-1.5 py-0.5 border border-amber-500 bg-amber-50 text-amber-800 group-hover:border-white group-hover:bg-white group-hover:text-black">
                {metrics.outOfStockVariants} OOS
              </span>
            ) : null}
          </div>
          <p className="font-display text-3xl lg:text-4xl font-black">
            {metrics?.productCount ?? 0}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 group-hover:text-white/60 mt-2">
            {metrics?.outOfStockVariants ? `${metrics.outOfStockVariants} sizes sold out` : 'All sizes healthy'} &rarr;
          </p>
        </Link>
      </div>

      {/* Orders Breakdown by Status */}
      <div className="border border-black p-8 bg-white mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">
            Order Fulfillment Pipeline
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-mono uppercase tracking-widest font-bold underline hover:text-black/60"
          >
            View All Orders
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { status: 'PAID', label: 'Paid', count: metrics?.ordersByStatus.PAID ?? 0, bg: 'bg-accent/30' },
            { status: 'PROCESSING', label: 'Processing', count: metrics?.ordersByStatus.PROCESSING ?? 0, bg: 'bg-white' },
            { status: 'SHIPPED', label: 'Shipped', count: metrics?.ordersByStatus.SHIPPED ?? 0, bg: 'bg-white' },
            { status: 'DELIVERED', label: 'Delivered', count: metrics?.ordersByStatus.DELIVERED ?? 0, bg: 'bg-white' },
            { status: 'PENDING', label: 'Pending', count: metrics?.ordersByStatus.PENDING ?? 0, bg: 'bg-neutral-50' },
            { status: 'CANCELLED', label: 'Cancelled', count: metrics?.ordersByStatus.CANCELLED ?? 0, bg: 'bg-neutral-50' },
          ].map((item) => (
            <div
              key={item.status}
              className={`border border-black p-4 flex flex-col justify-between ${item.bg}`}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-black/50">
                {item.label}
              </span>
              <span className="font-display text-2xl font-black text-black mt-3">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 className="font-display text-xl font-bold uppercase tracking-tight mb-4">
        Console Sections
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/admin/orders"
          className="group block border border-black p-8 bg-white text-black hover:bg-black hover:text-white transition-colors"
        >
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">
            Orders
          </h3>
          <p className="font-mono text-xs leading-relaxed text-black/60 group-hover:text-white">
            Inspect line items, view shipping addresses, update live dispatch statuses.
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="group block border border-black p-8 bg-white text-black hover:bg-black hover:text-white transition-colors"
        >
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">
            Products &amp; Inventory
          </h3>
          <p className="font-mono text-xs leading-relaxed text-black/60 group-hover:text-white">
            Create items, manage size variants, adjust pricing, update stock numbers.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="group block border border-black p-8 bg-white text-black hover:bg-black hover:text-white transition-colors"
        >
          <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">
            User Roles
          </h3>
          <p className="font-mono text-xs leading-relaxed text-black/60 group-hover:text-white">
            Filter users by role, search by email, promote or demote administrators safely.
          </p>
        </Link>
      </div>
    </div>
  );
}
