'use client';

import { use, useState } from 'react';
import { toast } from 'sonner';
import { useProduct } from '@/hooks/use-products';
import { useCart } from '@/hooks/use-cart';
import { ProductImage } from '@/components/ui';
import { ProductAssistantDrawer } from '@/components/products/product-assistant-drawer';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>();

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      await addToCart.mutateAsync({ variantId: selectedVariant.id, quantity: 1 });
      toast.success(`ADDED TO CART // SIZE ${selectedVariant.size}`);
    } catch {
      // Mutation error renders under the button or via error toast.
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-black/5" />
          <div>
            <div className="h-10 bg-black/5 w-3/4 mb-4" />
            <div className="h-6 bg-black/5 w-1/2 mb-8" />
            <div className="h-32 bg-black/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-[10px] font-mono uppercase tracking-widest text-black/50">
        Product not found
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.size === selectedSize);
  const inStock = selectedVariant && selectedVariant.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
        <div className="relative aspect-square bg-neutral-50 border border-black/10 overflow-hidden p-8">
          <ProductImage src={product.images[0]} alt={product.name} />
        </div>

        <div className="flex flex-col">
          <h1 className="font-display text-4xl lg:text-5xl font-black uppercase tracking-tight text-black mb-2">
            {product.name}
          </h1>
          <p className="text-sm font-mono tracking-widest uppercase text-black/40 mb-6">
            {product.colorway}
          </p>
          <p className="font-display text-3xl font-black text-black mb-8">
            ${product.retailPrice}
          </p>

          {product.description && (
            <p className="text-sm text-black/60 leading-relaxed mb-10">
              {product.description}
            </p>
          )}

          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold text-black/50">
                Select Size
              </h3>
              {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-600 bg-amber-50 border border-amber-300 px-2 py-0.5">
                  [ Only {selectedVariant.stock} left in stock ]
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedSize(variant.size)}
                  disabled={variant.stock === 0}
                  className={`
                    relative py-3 border font-mono text-sm font-bold transition-colors
                    ${selectedSize === variant.size ? 'border-black bg-black text-white' : 'border-black/20 bg-white text-black hover:border-black'}
                    ${variant.stock === 0 ? 'opacity-30 cursor-not-allowed line-through hover:border-black/20' : ''}
                  `}
                >
                  {variant.size}
                  {variant.stock > 0 && variant.stock <= 3 && (
                    <span
                      className={`absolute top-1 right-1 w-1.5 h-1.5 ${
                        selectedSize === variant.size ? 'bg-amber-400' : 'bg-amber-500'
                      }`}
                      title={`Only ${variant.stock} left`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || !inStock || addToCart.isPending}
            className="w-full py-5 bg-black text-white border border-black font-mono text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-black disabled:bg-black/5 disabled:text-black/30 disabled:border-black/10 disabled:cursor-not-allowed transition-colors"
          >
            {addToCart.isPending
              ? 'Adding...'
              : !selectedSize
              ? 'Select Size'
              : !inStock
              ? 'Out of Stock'
              : 'Add to Cart'}
          </button>

          <ProductAssistantDrawer
            productId={product.id}
            productName={`${product.brand} ${product.name}`}
            selectedSize={selectedSize}
          />



          {addToCart.isError && (
            <div className="mt-4 p-4 border border-red-500 bg-red-50 text-red-700 font-mono text-xs font-bold uppercase tracking-widest text-center">
              {addToCart.error?.message || 'Failed to add to cart'}
            </div>
          )}

          <div className="mt-12 space-y-2 text-[10px] font-mono uppercase tracking-widest text-black/40">
            <p>SKU // {product.sku}</p>
            <p>Brand // {product.brand}</p>
            {product.releaseDate && (
              <p>Release // {new Date(product.releaseDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
