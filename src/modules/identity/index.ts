import { PrismaIdentityAdapter } from './adapters/prisma';
import {
  AddressInput,
  IdentityStorage,
  Pagination,
  UserFilters,
  UserRole,
} from './types';

export class IdentityModule {
  constructor(private storage: IdentityStorage) {}

  listAdminUsers(pagination: Pagination, filters?: UserFilters) {
    return this.storage.listAdminUsers(pagination, filters);
  }

  updateUserRole(targetUserId: string, actingUserId: string, newRole: UserRole) {
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
}

export const identity = new IdentityModule(new PrismaIdentityAdapter());
export type {
  AddressInput,
  AdminUserItem,
  IdentityStorage,
  PaginatedAdminUsers,
  Pagination as IdentityPagination,
  SavedAddress,
  UserFilters,
  UserRole,
} from './types';
