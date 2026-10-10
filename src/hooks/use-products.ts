import { useQuery } from '@tanstack/react-query';

export type ProductListItem = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  colorway: string;
  retailPrice: number;
  images: string[];
  category: string;
};

export type ProductDetail = ProductListItem & {
  description: string | null;
  releaseDate: string | null;
  variants: Array<{
    id: string;
    size: string;
    stock: number;
    price: number;
  }>;
};

export type PaginatedProducts = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export function useProducts(filters?: {
  brand?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 24;

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.brand) params.set('brand', filters.brand);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<PaginatedProducts>;
    },
    staleTime: 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json() as Promise<ProductDetail>;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
