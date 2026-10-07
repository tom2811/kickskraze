'use client';

import Link from 'next/link';
import { useProducts } from '@/hooks/use-products';

export function ProductGrid({ filters }: { filters?: { brand?: string; search?: string } }) {
  const { data: products, isLoading } = useProducts(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-200 rounded mt-4 w-3/4" />
            <div className="h-4 bg-gray-200 rounded mt-2 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return <div className="text-center py-12 text-gray-500">No products found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`} className="group">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:underline">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{product.colorway}</p>
          <p className="text-sm font-bold mt-2">${product.retailPrice}</p>
        </Link>
      ))}
    </div>
  );
}
