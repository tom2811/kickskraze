import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  colorway: string;
  releaseDate: string | null;
  retailPrice: number;
  images: string[];
  description: string | null;
  category: string;
  variants: Array<{
    id: string;
    size: string;
    stock: number;
    price: number;
  }>;
}

export function useProducts(filters?: { brand?: string; category?: string; search?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.brand) params.set('brand', filters.brand);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<Product[]>;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json() as Promise<Product>;
    },
    enabled: !!id,
  });
}
