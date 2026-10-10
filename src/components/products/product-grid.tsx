'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import ProductCard from './product-card';
import { Pager } from '@/components/ui';

export function ProductGrid({ filters }: { filters?: { brand?: string; search?: string } }) {
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const { data, isLoading } = useProducts({ ...filters, page, pageSize });

  useEffect(() => {
    setPage(1);
  }, [filters?.brand, filters?.search]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] bg-black/5 mb-3" />
            <div className="h-3 bg-black/5 mt-1 w-3/4" />
            <div className="h-3 bg-black/5 mt-1 w-1/2" />
            <div className="h-4 bg-black/5 mt-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="text-center py-24 border border-black/10">
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/50">No sneakers found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {data.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pager
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        onPage={(next) => {
          setPage(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
