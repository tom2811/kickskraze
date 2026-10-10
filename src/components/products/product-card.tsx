'use client';

import Link from 'next/link';
import { ProductImage } from '@/components/ui';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    colorway: string;
    retailPrice: number;
    images: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square bg-neutral-50 overflow-hidden mb-3 border border-black/10 group-hover:border-black transition-colors p-4">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-black">
            {product.brand}
          </span>
        </div>
      </div>

      <div className="space-y-0.5 px-0.5">
        <h3 className="text-sm font-bold leading-tight text-black group-hover:text-black/60 transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-xs text-black/40 font-mono truncate">{product.colorway}</p>
        <p className="text-sm font-black text-black pt-1">${product.retailPrice}</p>
      </div>
    </Link>
  );
}
