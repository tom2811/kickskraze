'use client';

import { useState } from 'react';
import { ProductGrid } from '@/components/products/product-grid';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState<string>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Sneakers</h1>

      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Search sneakers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={brand || ''}
          onChange={(e) => setBrand(e.target.value || undefined)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="">All Brands</option>
          <option value="Nike">Nike</option>
          <option value="Jordan">Jordan</option>
          <option value="Nike SB">Nike SB</option>
        </select>
      </div>

      <ProductGrid filters={{ search, brand }} />
    </div>
  );
}
