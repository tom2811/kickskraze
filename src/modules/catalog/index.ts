import { PrismaCatalogAdapter } from './adapters/prisma';
import {
  CatalogStorage,
  CreateProductInput,
  InventoryFilters,
  Pagination,
  ProductFilters,
  UpdateProductInput,
} from './types';

export class CatalogModule {
  constructor(private storage: CatalogStorage) {}

  searchProducts(filters: ProductFilters, pagination: Pagination) {
    return this.storage.searchProducts(filters, pagination);
  }

  getById(id: string) {
    return this.storage.getById(id);
  }

  createProduct(data: CreateProductInput) {
    return this.storage.createProduct(data);
  }

  updateProduct(id: string, data: UpdateProductInput) {
    return this.storage.updateProduct(id, data);
  }

  deleteProduct(id: string) {
    return this.storage.deleteProduct(id);
  }

  addVariant(productId: string, data: { size: string; price: number; stock: number }) {
    return this.storage.addVariant(productId, data);
  }

  updateVariant(variantId: string, data: { size?: string; price?: number; stock?: number }) {
    return this.storage.updateVariant(variantId, data);
  }

  deleteVariant(variantId: string) {
    return this.storage.deleteVariant(variantId);
  }

  listInventory(filters: InventoryFilters, pagination: Pagination) {
    return this.storage.listInventory(filters, pagination);
  }

  updateVariantStock(variantId: string, stock: number) {
    return this.storage.updateVariantStock(variantId, stock);
  }
}

export const catalog = new CatalogModule(new PrismaCatalogAdapter());
export type {
  CreateProductInput,
  ProductFilters,
  UpdateProductInput,
  VariantInput,
  ProductVariant,
  InventoryItem,
  InventoryFilters,
  PaginatedInventory,
} from './types';
