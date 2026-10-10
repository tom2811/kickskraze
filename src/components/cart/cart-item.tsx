'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { ProductImage } from '@/components/ui';

type CartItemProps = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    size: string;
    price: number;
    stock: number;
    product: {
      id: string;
      name: string;
      brand: string;
      colorway: string;
      images: string[];
    };
  };
};

export function CartItem({ id, quantity, variant }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, size, price, stock } = variant;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > stock) return;
    updateQuantity.mutate({ itemId: id, quantity: newQuantity });
  };

  const handleRemove = () => {
    removeItem.mutate(id);
  };

  return (
    <div className="flex gap-5 py-5 border-b-2 border-black last:border-b-0">
      <Link href={`/products/${product.id}`} className="relative w-20 h-20 bg-neutral-100 overflow-hidden flex-shrink-0 border border-black/10 p-1">
        <ProductImage src={product.images[0]} alt={`${product.name} ${product.colorway}`} className="object-cover" />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${product.id}`} className="group">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-black">{product.brand}</h3>
          <p className="text-sm font-bold text-black truncate">{product.name}</p>
          <p className="text-xs text-black/40 font-mono">{product.colorway}</p>
        </Link>
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 mt-1">Size {size}</p>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border-2 border-black">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || updateQuantity.isPending}
              className="px-2.5 py-1 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              −
            </button>
            <span className="px-3 py-1 border-x-2 border-black text-xs font-mono font-bold min-w-[2.5rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= stock || updateQuantity.isPending}
              className="px-2.5 py-1 text-xs font-bold hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={removeItem.isPending}
            className="text-[10px] font-mono uppercase tracking-widest font-bold text-red-500 hover:text-red-700 disabled:opacity-40"
          >
            Remove
          </button>
        </div>

        {quantity >= stock && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-amber-600 mt-2">Max stock reached</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black text-black">${price.toFixed(2)}</p>
        {quantity > 1 && (
          <p className="text-[10px] font-mono text-black/40 mt-1">${(price * quantity).toFixed(2)} total</p>
        )}
      </div>
    </div>
  );
}
