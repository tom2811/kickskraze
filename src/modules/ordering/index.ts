import { PrismaOrderingAdapter } from './adapters/prisma';
import { StripePaymentAdapter } from './adapters/stripe';
import {
  AddressInput,
  OrderingStorage,
  OrderStatus,
  Pagination,
  PaymentGateway,
  SavedAddress,
  ShippingAddress,
  UserFilters,
} from './types';

export class OrderingModule {
  constructor(
    private storage: OrderingStorage,
    private payment: PaymentGateway
  ) {}

  async getCart(userId: string) {
    const items = await this.storage.getCart(userId);
    const total = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
    return { items, total };
  }

  addToCart(userId: string, variantId: string, quantity: number) {
    return this.storage.addToCart(userId, variantId, quantity);
  }

  updateCartItem(userId: string, itemId: string, quantity: number) {
    return this.storage.updateCartItem(userId, itemId, quantity);
  }

  removeCartItem(userId: string, itemId: string) {
    return this.storage.removeCartItem(userId, itemId);
  }

  async checkout(userId: string, userEmail: string, shippingAddress: ShippingAddress) {
    const { items, total } = await this.getCart(userId);
    if (items.length === 0) throw new Error('Cart is empty');
    for (const item of items) {
      if (item.variant.stock < item.quantity) {
        throw new Error('Insufficient stock');
      }
    }
    const order = await this.storage.createOrder(userId, shippingAddress, items, total);
    const session = await this.payment.createCheckoutSession(order, { id: userId, email: userEmail }, items);
    await this.storage.updateOrderSession(order.id, session.sessionId);
    return session;
  }

  fulfillPaidOrder(orderId: string) {
    return this.storage.fulfillPaidOrder(orderId);
  }

  cancelPendingOrder(orderId: string) {
    return this.storage.cancelPendingOrder(orderId);
  }

  listOrders(userId: string, pagination: Pagination) {
    return this.storage.listOrders(userId, pagination);
  }

  listAdminOrders(pagination: Pagination) {
    return this.storage.listAdminOrders(pagination);
  }

  getOrderForUser(userId: string, orderId: string) {
    return this.storage.getOrderForUser(userId, orderId);
  }

  getOrderById(orderId: string) {
    return this.storage.getOrderById(orderId);
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.storage.updateOrderStatus(orderId, status);
  }

  listAdminUsers(pagination: Pagination, filters?: UserFilters) {
    return this.storage.listAdminUsers(pagination, filters);
  }

  updateUserRole(targetUserId: string, actingUserId: string, newRole: 'USER' | 'ADMIN') {
    return this.storage.updateUserRole(targetUserId, actingUserId, newRole);
  }

  listAddresses(userId: string) {
    return this.storage.listAddresses(userId);
  }

  createAddress(userId: string, input: AddressInput) {
    return this.storage.createAddress(userId, input);
  }

  updateAddress(userId: string, addressId: string, input: Partial<AddressInput>) {
    return this.storage.updateAddress(userId, addressId, input);
  }

  deleteAddress(userId: string, addressId: string) {
    return this.storage.deleteAddress(userId, addressId);
  }

  setDefaultAddress(userId: string, addressId: string) {
    return this.storage.setDefaultAddress(userId, addressId);
  }

  getDashboardMetrics() {
    return this.storage.getDashboardMetrics();
  }
}

export const ordering = new OrderingModule(new PrismaOrderingAdapter(), new StripePaymentAdapter());
