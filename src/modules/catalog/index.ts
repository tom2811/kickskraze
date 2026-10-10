import { PrismaCatalogAdapter } from './adapters/prisma';
import {
  CatalogStorage,
  CreateProductInput,
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

  getAvailability(sku: string, size: string) {
    return this.storage.getAvailability(sku, size);
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
}

export const catalog = new CatalogModule(new PrismaCatalogAdapter());
export type { CreateProductInput, ProductFilters, UpdateProductInput } from './types';
