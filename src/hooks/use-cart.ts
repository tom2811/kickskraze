import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

type CartItem = {
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

type Cart = {
  items: CartItem[];
  total: number;
};

export function useCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => apiFetch<Cart>('/api/cart', undefined, 'Failed to fetch cart'),
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const addToCart = useMutation({
    mutationFn: ({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) =>
      apiFetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity }),
      }, 'Failed to add to cart'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiFetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      }, 'Failed to update quantity'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) =>
      apiFetch(`/api/cart/${itemId}`, { method: 'DELETE' }, 'Failed to remove item'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    cart: data,
    items: data?.items || [],
    total: data?.total || 0,
    itemCount: data?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
  };
}
