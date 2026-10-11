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
      apiFetch(
        '/api/cart',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variantId, quantity }),
        },
        'Failed to add to cart'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiFetch(
        `/api/cart/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        },
        'Failed to update quantity'
      ),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      if (previousCart) {
        const nextItems = previousCart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        const nextTotal = nextItems.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        );
        queryClient.setQueryData<Cart>(['cart'], {
          items: nextItems,
          total: nextTotal,
        });
      }

      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) =>
      apiFetch(`/api/cart/${itemId}`, { method: 'DELETE' }, 'Failed to remove item'),
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<Cart>(['cart']);

      if (previousCart) {
        const nextItems = previousCart.items.filter((item) => item.id !== itemId);
        const nextTotal = nextItems.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        );
        queryClient.setQueryData<Cart>(['cart'], {
          items: nextItems,
          total: nextTotal,
        });
      }

      return { previousCart };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
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
