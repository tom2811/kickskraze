export type UserRole = 'USER' | 'ADMIN';

export type Pagination = {
  page: number;
  pageSize: number;
};

export type AdminUserItem = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export type UserFilters = {
  role?: UserRole;
  search?: string;
};

export type PaginatedAdminUsers = {
  items: AdminUserItem[];
  total: number;
  adminCount: number;
  userCount: number;
  page: number;
  pageSize: number;
};

export type SavedAddress = {
  id: string;
  userId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
};

export type AddressInput = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  isDefault?: boolean;
};

export interface IdentityStorage {
  listAdminUsers(pagination: Pagination, filters?: UserFilters): Promise<PaginatedAdminUsers>;
  updateUserRole(targetUserId: string, actingUserId: string, newRole: UserRole): Promise<AdminUserItem>;
  listAddresses(userId: string): Promise<SavedAddress[]>;
  createAddress(userId: string, input: AddressInput): Promise<SavedAddress>;
  updateAddress(userId: string, addressId: string, input: Partial<AddressInput>): Promise<SavedAddress>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<SavedAddress>;
}
