import { Role as PrismaRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  AddressInput,
  AdminUserItem,
  IdentityStorage,
  PaginatedAdminUsers,
  Pagination,
  SavedAddress,
  UserFilters,
  UserRole,
} from '../types';

export class PrismaIdentityAdapter implements IdentityStorage {
  async listAdminUsers(
    pagination: Pagination,
    filters?: UserFilters
  ): Promise<PaginatedAdminUsers> {
    const { page, pageSize } = pagination;
    const where: { role?: PrismaRole; email?: { contains: string; mode: 'insensitive' } } = {};

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
        role: user.role as UserRole,
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
    newRole: UserRole
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
      role: updated.role as UserRole,
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
}
