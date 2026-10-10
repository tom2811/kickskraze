import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  CatalogStorage,
  CreateProductInput,
  Pagination,
  ProductFilters,
  UpdateProductInput,
} from '../types';

const listSelect = {
  id: true,
  sku: true,
  name: true,
  brand: true,
  colorway: true,
  retailPrice: true,
  images: true,
  category: true,
} satisfies Prisma.ProductSelect;

function productWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (filters.brand) where.brand = filters.brand;
  if (filters.category) where.category = filters.category;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { brand: { contains: filters.search, mode: 'insensitive' } },
      { colorway: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.retailPrice = { gte: filters.minPrice, lte: filters.maxPrice };
  }
  return where;
}

export class PrismaCatalogAdapter implements CatalogStorage {
  async searchProducts(filters: ProductFilters, pagination: Pagination) {
    const where = productWhere(filters);
    const { page, pageSize } = pagination;
    const [total, items] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: listSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: {
        ...listSelect,
        description: true,
        releaseDate: true,
        variants: {
          select: { id: true, size: true, stock: true, price: true },
          orderBy: { size: 'asc' },
        },
      },
    });
  }

  async getAvailability(sku: string, size: string) {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: { variants: { where: { size } } },
    });
    if (!product) return { available: false, reason: 'Product not found' };
    const variant = product.variants[0];
    if (!variant) return { available: false, reason: 'Size not found' };
    return {
      available: variant.stock > 0,
      stock: variant.stock,
      price: variant.price,
      productName: product.name,
      brand: product.brand,
    };
  }

  async createProduct(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        brand: data.brand,
        category: data.category,
        colorway: data.colorway,
        retailPrice: data.retailPrice,
        description: data.description,
        images: data.images ?? [],
      },
      select: listSelect,
    });
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.sku !== undefined ? { sku: data.sku } : {}),
        ...(data.brand !== undefined ? { brand: data.brand } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.colorway !== undefined ? { colorway: data.colorway } : {}),
        ...(data.retailPrice !== undefined ? { retailPrice: data.retailPrice } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
      },
      select: listSelect,
    });
  }

  async deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } });
  }
}
