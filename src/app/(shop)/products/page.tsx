'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/products/product-grid';

const BRANDS = ['Nike', 'Jordan', 'Nike SB', 'Adidas', 'New Balance'] as const;

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [brand, setBrand] = useState<string>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/30 mb-2">
          Catalog
        </p>
        <h1 className="text-3xl font-black tracking-tight text-black uppercase">
          All Sneakers
        </h1>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, brand, colorway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-black text-sm font-mono border border-black/20 placeholder-black/30 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBrand(undefined)}
            className={`px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest font-bold border transition-colors ${
              !brand
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-black/20 hover:border-black'
            }`}
          >
            All
          </button>
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(brand === b ? undefined : b)}
              className={`px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest font-bold border transition-colors ${
                brand === b
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <ProductGrid filters={{ search: debouncedSearch, brand }} />
    </div>
  );
}
