import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { PaginatedProducts, ProductDetail } from '@/modules/catalog/types';

export type { PaginatedProducts, ProductDetail, ProductListItem } from '@/modules/catalog/types';

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
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.brand) params.set('brand', filters.brand);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.search) params.set('search', filters.search);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      return apiFetch<PaginatedProducts>(`/api/products?${params}`, undefined, 'Failed to fetch products');
    },
    staleTime: 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiFetch<ProductDetail>(`/api/products/${id}`, undefined, 'Failed to fetch product'),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
