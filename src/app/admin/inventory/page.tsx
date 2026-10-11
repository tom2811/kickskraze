'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  ButtonLink,
  PageHeader,
  PageSkeleton,
  Pager,
  ProductImage,
} from '@/components/ui';

type InventoryItem = {
  id: string;
  size: string;
  stock: number;
  price: number;
  product: {
    id: string;
    name: string;
    brand: string;
    sku: string;
    colorway: string;
    images: string[];
  };
};

type InventoryResponse = {
  items?: InventoryItem[];
  total?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
};

const PAGE_SIZE = 30;

export default function AdminInventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [page, setPage] = useState(1);
  const [stockStatus, setStockStatus] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Debounce search input
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
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString(),
        });
        if (stockStatus !== 'ALL') params.set('stockStatus', stockStatus);
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

        const data = await apiFetch<InventoryResponse>(
          `/api/admin/inventory?${params.toString()}`,
          undefined,
          'Failed to fetch inventory'
        );
        if (cancelled) return;

        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
        setLowStockCount(typeof data.lowStockCount === 'number' ? data.lowStockCount : 0);
        setOutOfStockCount(typeof data.outOfStockCount === 'number' ? data.outOfStockCount : 0);
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch inventory';
          setError(msg === 'Forbidden' ? 'Access denied. Admin privileges required.' : msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchInventory();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router, page, stockStatus, debouncedSearch]);

  const handleUpdateStock = async (variantId: string, delta: number) => {
    const current = items.find((i) => i.id === variantId);
    if (!current) return;
    const newStock = Math.max(0, current.stock + delta);
    if (newStock === current.stock) return;

    setSavingId(variantId);
    // Optimistic local update
    setItems((prev) =>
      prev.map((item) => (item.id === variantId ? { ...item, stock: newStock } : item))
    );

    try {
      await apiFetch(
        `/api/admin/inventory/${variantId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: newStock }),
        },
        'Failed to update stock'
      );
    } catch {
      // Revert on error
      setItems((prev) =>
        prev.map((item) => (item.id === variantId ? { ...item, stock: current.stock } : item))
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDirectStockChange = async (variantId: string, val: string) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 0) return;

    const current = items.find((i) => i.id === variantId);
    if (!current || current.stock === parsed) return;

    setSavingId(variantId);
    setItems((prev) =>
      prev.map((item) => (item.id === variantId ? { ...item, stock: parsed } : item))
    );

    try {
      await apiFetch(
        `/api/admin/inventory/${variantId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: parsed }),
        },
        'Failed to update stock'
      );
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === variantId ? { ...item, stock: current.stock } : item))
      );
    } finally {
      setSavingId(null);
    }
  };

  if (authLoading || (loading && !items.length && !search)) {
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
        <PageHeader eyebrow="Warehouse Operations" title="Inventory Management" />
        <Link
          href="/admin/products"
          className="inline-flex items-center px-5 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest border border-black hover:bg-white hover:text-black transition-colors self-start sm:self-auto"
        >
          [ Manage Products &amp; Details &rarr; ]
        </Link>
      </div>

      {/* Filter Tabs and Search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex border border-black bg-white">
          <button
            type="button"
            onClick={() => {
              setStockStatus('ALL');
              setPage(1);
            }}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
              stockStatus === 'ALL'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            All Variants [{total}]
          </button>
          <button
            type="button"
            onClick={() => {
              setStockStatus('LOW_STOCK');
              setPage(1);
            }}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest border-l border-black transition-colors ${
              stockStatus === 'LOW_STOCK'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            Low Stock [{lowStockCount}]
          </button>
          <button
            type="button"
            onClick={() => {
              setStockStatus('OUT_OF_STOCK');
              setPage(1);
            }}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest border-l border-black transition-colors ${
              stockStatus === 'OUT_OF_STOCK'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            Sold Out [{outOfStockCount}]
          </button>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="SEARCH BY PRODUCT / SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-widest border border-black placeholder:text-black/30 focus:outline-none focus:bg-neutral-50"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-black p-12 text-center bg-white">
          <p className="text-xs font-mono uppercase tracking-widest text-black/40">
            {debouncedSearch ? 'No inventory matching search' : 'No inventory variants found'}
          </p>
        </div>
      ) : (
        <div className="border border-black overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-black">
              <tr>
                {['Sneaker / Product', 'SKU', 'Size', 'Price', 'Stock Level', 'Adjust Stock'].map(
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
              {items.map((item) => {
                const isSaving = savingId === item.id;
                const isOutOfStock = item.stock === 0;
                const isLowStock = item.stock > 0 && item.stock <= 3;

                return (
                  <tr key={item.id} className="hover:bg-black/5">
                    {/* Product & Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 relative border border-black/10 overflow-hidden flex-shrink-0 bg-neutral-50">
                          <ProductImage
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/40">
                            {item.product.brand}
                          </p>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="font-bold text-sm text-black hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs font-mono text-black/40">{item.product.colorway}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-6 py-4 font-mono text-xs text-black/70 uppercase">
                      {item.product.sku}
                    </td>

                    {/* Size */}
                    <td className="px-6 py-4 font-mono text-sm font-bold text-black">
                      {item.size}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-mono text-sm font-black text-black">
                      ${item.price.toFixed(2)}
                    </td>

                    {/* Stock Level Badge */}
                    <td className="px-6 py-4">
                      {isOutOfStock ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-red-500 bg-red-50 text-red-700">
                          OUT OF STOCK [0]
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-amber-500 bg-amber-50 text-amber-800">
                          LOW STOCK [{item.stock}]
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-black bg-white text-black">
                          IN STOCK [{item.stock}]
                        </span>
                      )}
                    </td>

                    {/* Adjust Stock Stepper & Input */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(item.id, -1)}
                          disabled={item.stock <= 0 || isSaving}
                          className="w-8 h-8 flex items-center justify-center border border-black font-mono font-bold text-sm hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={item.stock}
                          onChange={(e) => handleDirectStockChange(item.id, e.target.value)}
                          disabled={isSaving}
                          className="w-16 h-8 text-center border border-black font-mono text-xs font-bold focus:outline-none focus:bg-neutral-50"
                        />

                        <button
                          type="button"
                          onClick={() => handleUpdateStock(item.id, 1)}
                          disabled={isSaving}
                          className="w-8 h-8 flex items-center justify-center border border-black font-mono font-bold text-sm hover:bg-black hover:text-white disabled:opacity-30 transition-colors"
                        >
                          +
                        </button>
                      </div>
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
