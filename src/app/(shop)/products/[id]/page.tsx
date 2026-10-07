'use client';

import { use, useState } from 'react';
import { useProduct } from '@/hooks/use-products';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);
  const [selectedSize, setSelectedSize] = useState<string>();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  const selectedVariant = product.variants.find((v) => v.size === selectedSize);
  const inStock = selectedVariant && selectedVariant.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl text-gray-600 mb-4">{product.colorway}</p>
          <p className="text-3xl font-bold mb-8">${product.retailPrice}</p>

          {product.description && (
            <p className="text-gray-700 mb-8">{product.description}</p>
          )}

          <div className="mb-8">
            <h3 className="font-semibold mb-3">Select Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedSize(variant.size)}
                  disabled={variant.stock === 0}
                  className={`
                    py-3 border rounded-lg font-medium transition-colors
                    ${selectedSize === variant.size ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'}
                    ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed line-through' : ''}
                  `}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!selectedSize || !inStock}
            className="w-full py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {!selectedSize
              ? 'Select Size'
              : !inStock
              ? 'Out of Stock'
              : 'Add to Cart'}
          </button>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p>SKU: {product.sku}</p>
            <p>Brand: {product.brand}</p>
            {product.releaseDate && (
              <p>Release Date: {new Date(product.releaseDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
