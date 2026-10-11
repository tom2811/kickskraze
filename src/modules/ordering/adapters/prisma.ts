import { OrderStatus as PrismaOrderStatus, Prisma, Role as PrismaRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  AdminOrder,
  AdminUserItem,
  CartLine,
  ORDER_STATUS_TRANSITIONS,
  OrderingStorage,
  OrderStatus,
  PaginatedAdminUsers,
  Pagination,
  ShippingAddress,
  UserFilters,
} from '../types';

const cartInclude = {
  variant: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brand: true,
          colorway: true,
          images: true,
        },
      },
    },
  },
} as const;

export class PrismaOrderingAdapter implements OrderingStorage {
  async getCart(userId: string): Promise<CartLine[]> {
    return prisma.cartItem.findMany({
      where: { userId },
      include: cartInclude,
      orderBy: { createdAt: 'desc' },
    }) as Promise<CartLine[]>;
  }

  async addToCart(userId: string, variantId: string, quantity: number): Promise<CartLine> {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUnique({ where: { id: variantId } });
      if (!variant) throw new Error('Variant not found');

      const existing = await tx.cartItem.findUnique({
        where: { userId_variantId: { userId, variantId } },
      });
      const nextQty = (existing?.quantity ?? 0) + quantity;
      if (variant.stock < nextQty) throw new Error('Insufficient stock');

      if (existing) {
        return tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: nextQty },
          include: cartInclude,
        }) as Promise<CartLine>;
      }

      return tx.cartItem.create({
        data: { userId, variantId, quantity },
        include: cartInclude,
      }) as Promise<CartLine>;
    });
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartLine> {
    return prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: { id: itemId, userId },
        include: { variant: true },
      });
      if (!item) throw new Error('Cart item not found');
      if (item.variant.stock < quantity) throw new Error('Insufficient stock');

      return tx.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: cartInclude,
      }) as Promise<CartLine>;
    });
  }

  async removeCartItem(userId: string, itemId: string) {
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) throw new Error('Cart item not found');
    await prisma.cartItem.delete({ where: { id: itemId } });
  }

  async createOrder(
    userId: string,
    shippingAddress: ShippingAddress,
    cartItems: CartLine[],
    total: number
  ) {
    return prisma.order.create({
      data: {
        userId,
        total,
        shippingAddress,
        status: 'PENDING',
        items: {
          create: cartItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.price,
          })),
        },
      },
      select: { id: true },
    });
  }

  async updateOrderSession(orderId: string, sessionId: string) {
    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: sessionId },
    });
  }

  async fulfillPaidOrder(orderId: string) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error('Order not found');

      if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
        return;
      }
      if (order.status === 'CANCELLED') {
        throw new Error('Order cancelled');
      }

      for (const item of order.items) {
        const updated = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new Error('Insufficient stock');
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
      await tx.cartItem.deleteMany({ where: { userId: order.userId } });
    });
  }

  async cancelPendingOrder(orderId: string) {
    await prisma.order.updateMany({
      where: { id: orderId, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });
  }

  async listOrders(userId: string, pagination: Pagination) {
    const where = { userId };
    const [total, items] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          shippingAddress: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              variant: {
                select: {
                  size: true,
                  product: {
                    select: { name: true, brand: true, colorway: true, images: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
    ]);
    return {
      items: items.map((order) => ({
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      })),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async listAdminOrders(pagination: Pagination) {
    const [total, items] = await prisma.$transaction([
      prisma.order.count(),
      prisma.order.findMany({
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, email: true } },
          items: { select: { quantity: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async getOrderForUser(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        shippingAddress: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            variant: {
              select: {
                size: true,
                product: {
                  select: { name: true, brand: true, colorway: true, images: true },
                },
              },
            },
          },
        },
      },
    });
    if (!order) return null;
    return { ...order, shippingAddress: order.shippingAddress as ShippingAddress };
  }

  async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        shippingAddress: true,
        user: { select: { id: true, email: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            variant: {
              select: {
                size: true,
                product: {
                  select: { id: true, name: true, brand: true, colorway: true, images: true },
                },
              },
            },
          },
        },
      },
    });
    if (!order) return null;
    return {
      ...order,
      shippingAddress: order.shippingAddress as ShippingAddress,
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrder> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const allowed = ORDER_STATUS_TRANSITIONS[order.status as OrderStatus];
    if (!allowed.includes(status)) {
      throw new Error('Invalid status transition');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as PrismaOrderStatus },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
        items: { select: { quantity: true } },
      },
    });
  }

  async listAdminUsers(
    pagination: Pagination,
    filters?: UserFilters
  ): Promise<PaginatedAdminUsers> {
    const { page, pageSize } = pagination;
    const where: Prisma.UserWhereInput = {};

    if (filters?.role) {
      where.role = filters.role as PrismaRole;
    }

    if (filters?.search) {
      where.email = { contains: filters.search.trim(), mode: 'insensitive' };
    }

    const [total, adminCount, userCount, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: items.map((user) => ({
        ...user,
        role: user.role as 'USER' | 'ADMIN',
      })),
      total,
      adminCount,
      userCount,
      page,
      pageSize,
    };
  }

  async updateUserRole(
    targetUserId: string,
    actingUserId: string,
    newRole: 'USER' | 'ADMIN'
  ): Promise<AdminUserItem> {
    if (targetUserId === actingUserId && newRole !== 'ADMIN') {
      throw new Error('Cannot remove own admin role');
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new Error('User not found');

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as PrismaRole },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      ...updated,
      role: updated.role as 'USER' | 'ADMIN',
    };
  }
}
