import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    queryFn: async () => {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error('Failed to fetch cart');
      return res.json();
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const addToCart = useMutation({
    mutationFn: async ({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) => {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add to cart');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update quantity');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove item');
      return res.json();
    },
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
