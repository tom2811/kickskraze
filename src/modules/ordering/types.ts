export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ShippingAddress = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'SHIPPED', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export interface OrderingStorage {
  getCart(userId: string): Promise<CartLine[]>;
  addToCart(userId: string, variantId: string, quantity: number): Promise<CartLine>;
  updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartLine>;
  removeCartItem(userId: string, itemId: string): Promise<void>;
  createOrder(
    userId: string,
    shippingAddress: ShippingAddress,
    cartItems: CartLine[],
    total: number
  ): Promise<{ id: string }>;
  updateOrderSession(orderId: string, sessionId: string): Promise<void>;
  fulfillPaidOrder(orderId: string): Promise<void>;
  cancelPendingOrder(orderId: string): Promise<void>;
  listOrders(userId: string, pagination: Pagination): Promise<PaginatedOrders>;
  listAdminOrders(pagination: Pagination, filters?: AdminOrderFilters): Promise<PaginatedAdminOrders>;
  getOrderForUser(userId: string, orderId: string): Promise<CustomerOrder | null>;
  getOrderById(orderId: string): Promise<AdminOrderDetail | null>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrder>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
}

export type DashboardMetrics = {
  productCount: number;
  orderCount: number;
  userCount: number;
  revenue: number;
  aov: number;
  recentOrders30d: number;
  recentRevenue30d: number;
  outOfStockVariants: number;
  ordersByStatus: Record<OrderStatus, number>;
};

export type CartLine = {
  id: string;
  userId: string;
  variantId: string;
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

export type CustomerOrder = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  shippingAddress: ShippingAddress;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      size: string;
      product: {
        name: string;
        brand: string;
        colorway: string;
        images: string[];
      };
    };
  }>;
};

export type AdminOrderDetail = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  shippingAddress: ShippingAddress;
  user: { id: string; email: string };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      size: string;
      product: {
        id: string;
        name: string;
        brand: string;
        colorway: string;
        images: string[];
      };
    };
  }>;
};

export type AdminOrder = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  user: { id: string; email: string };
  items: Array<{ quantity: number }>;
};

export type PaginatedOrders = {
  items: CustomerOrder[];
  total: number;
  page: number;
  pageSize: number;
};

export type OrderQueueFilter = 'ALL' | 'ACTIONABLE' | 'DELIVERED' | 'CANCELLED';

export type AdminOrderFilters = {
  queue?: OrderQueueFilter;
  status?: OrderStatus;
  search?: string;
};

export type PaginatedAdminOrders = {
  items: AdminOrder[];
  total: number;
  actionableCount: number;
  deliveredCount: number;
  cancelledCount: number;
  page: number;
  pageSize: number;
};

export interface PaymentGateway {
  createCheckoutSession(
    order: { id: string },
    user: { id: string; email: string },
    cartItems: CartLine[]
  ): Promise<{ sessionId: string; url: string }>;
}
