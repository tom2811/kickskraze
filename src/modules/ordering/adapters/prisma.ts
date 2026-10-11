import { OrderStatus as PrismaOrderStatus, Prisma, Role as PrismaRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  AddressInput,
  AdminOrder,
  AdminUserItem,
  CartLine,
  DashboardMetrics,
  ORDER_STATUS_TRANSITIONS,
  OrderingStorage,
  OrderStatus,
  PaginatedAdminUsers,
  Pagination,
  SavedAddress,
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
    return prisma.$transaction(async (tx) => {
      // 1. Atomically hold stock for each variant in the cart.
      // If two concurrent buyers checkout the same last unit, the second
      // updateMany returns count: 0 and throws "Insufficient stock".
      for (const item of cartItems) {
        const updated = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count !== 1) {
          throw new Error('Insufficient stock');
        }
      }

      // 2. Create the PENDING order with line items
      return tx.order.create({
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
      });
      if (!order) throw new Error('Order not found');

      if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
        return; // Idempotent: already marked as paid
      }
      if (order.status === 'CANCELLED') {
        throw new Error('Order cancelled');
      }

      // Stock was already reserved at checkout initiation.
      // Transition status to PAID and clear the user's cart.
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
      await tx.cartItem.deleteMany({ where: { userId: order.userId } });
    });
  }

  async cancelPendingOrder(orderId: string) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order || order.status !== 'PENDING') {
        return; // Only pending orders hold stock that needs releasing
      }

      // Mark order as CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // Restore reserved stock back to the catalog
      for (const item of order.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
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

  async listAddresses(userId: string): Promise<SavedAddress[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, input: AddressInput): Promise<SavedAddress> {
    const existingCount = await prisma.address.count({ where: { userId } });
    const isDefault = input.isDefault ?? existingCount === 0;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        name: input.name,
        street: input.street,
        city: input.city,
        state: input.state,
        zip: input.zip,
        country: input.country || 'US',
        isDefault,
      },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    input: Partial<AddressInput>
  ): Promise<SavedAddress> {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new Error('Address not found');

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.street !== undefined ? { street: input.street } : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.state !== undefined ? { state: input.state } : {}),
        ...(input.zip !== undefined ? { zip: input.zip } : {}),
        ...(input.country !== undefined ? { country: input.country } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      },
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new Error('Address not found');

    await prisma.address.delete({ where: { id: addressId } });

    // If the deleted address was default, promote the most recent one
    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<SavedAddress> {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new Error('Address not found');

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const statuses: OrderStatus[] = [
      'PENDING',
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      productCount,
      userCount,
      orderCount,
      revenueAggregate,
      recentOrders30d,
      recentRevenue30d,
      outOfStockVariants,
      ...statusCounts
    ] = await prisma.$transaction([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { total: true },
      }),
      prisma.variant.count({
        where: { stock: 0 },
      }),
      ...statuses.map((status) =>
        prisma.order.count({
          where: { status: status as PrismaOrderStatus },
        })
      ),
    ]);

    const ordersByStatus: Record<OrderStatus, number> = {
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    statuses.forEach((status, index) => {
      ordersByStatus[status] = statusCounts[index] as number;
    });

    const completedOrders =
      ordersByStatus.PAID +
      ordersByStatus.PROCESSING +
      ordersByStatus.SHIPPED +
      ordersByStatus.DELIVERED;

    const totalRevenue = revenueAggregate._sum.total || 0;
    const aov = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    return {
      productCount,
      orderCount,
      userCount,
      revenue: totalRevenue,
      aov,
      recentOrders30d,
      recentRevenue30d: recentRevenue30d._sum.total || 0,
      outOfStockVariants,
      ordersByStatus,
    };
  }
}
