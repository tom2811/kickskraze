export type ProductCategory = 'SNEAKERS' | 'APPAREL' | 'ACCESSORIES';

export interface ProductFilters {
  brand?: string;
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface VariantInput {
  id?: string;
  size: string;
  price: number;
  stock: number;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  brand: string;
  category: ProductCategory;
  colorway: string;
  retailPrice: number;
  description?: string;
  images?: string[];
  variants?: VariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  brand?: string;
  category?: ProductCategory;
  colorway?: string;
  retailPrice?: number;
  description?: string;
  images?: string[];
  variants?: VariantInput[];
}

export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  colorway: string;
  retailPrice: number;
  images: string[];
  category: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
  price: number;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  releaseDate: Date | string | null;
  variants: ProductVariant[];
}

export interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CatalogStorage {
  searchProducts(filters: ProductFilters, pagination: Pagination): Promise<PaginatedProducts>;
  getById(id: string): Promise<ProductDetail | null>;
  createProduct(data: CreateProductInput): Promise<ProductListItem>;
  updateProduct(id: string, data: UpdateProductInput): Promise<ProductListItem>;
  deleteProduct(id: string): Promise<void>;
  addVariant(productId: string, data: { size: string; price: number; stock: number }): Promise<ProductVariant>;
  updateVariant(variantId: string, data: { size?: string; price?: number; stock?: number }): Promise<ProductVariant>;
  deleteVariant(variantId: string): Promise<void>;
}
