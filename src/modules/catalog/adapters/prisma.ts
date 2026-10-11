import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  CatalogStorage,
  CreateProductInput,
  InventoryFilters,
  PaginatedInventory,
  Pagination,
  ProductFilters,
  ProductVariant,
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

function compareSizes(a: string, b: string) {
  const key = (size: string) => {
    const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(size.trim());
    return match ? { n: Number(match[1]), rest: match[2] } : null;
  };
  const left = key(a);
  const right = key(b);
  if (left && right) {
    if (left.n !== right.n) return left.n - right.n;
    return left.rest.localeCompare(right.rest);
  }
  if (left) return -1;
  if (right) return 1;
  return a.localeCompare(b);
}

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
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        ...listSelect,
        description: true,
        releaseDate: true,
        variants: {
          select: { id: true, size: true, stock: true, price: true },
        },
      },
    });
    if (!product) return null;
    return {
      ...product,
      variants: [...product.variants].sort((a, b) => compareSizes(a.size, b.size)),
    };
  }

  async createProduct(data: CreateProductInput) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          brand: data.brand,
          category: data.category,
          colorway: data.colorway,
          retailPrice: data.retailPrice,
          description: data.description,
          images: data.images ?? [],
          ...(data.variants && data.variants.length > 0
            ? {
                variants: {
                  create: data.variants.map((v) => ({
                    size: v.size,
                    price: v.price,
                    stock: v.stock,
                  })),
                },
              }
            : {}),
        },
        select: listSelect,
      });
      return product;
    });
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    return prisma.$transaction(async (tx) => {
      if (data.variants !== undefined) {
        const existing = await tx.variant.findMany({ where: { productId: id } });
        const existingIds = new Set(existing.map((v) => v.id));
        const inputIds = new Set(data.variants.map((v) => v.id).filter(Boolean));

        const toDelete = existing.filter((v) => !inputIds.has(v.id));
        if (toDelete.length > 0) {
          await tx.variant.deleteMany({
            where: { id: { in: toDelete.map((v) => v.id) } },
          });
        }

        for (const v of data.variants) {
          if (v.id && existingIds.has(v.id)) {
            await tx.variant.update({
              where: { id: v.id },
              data: { size: v.size, price: v.price, stock: v.stock },
            });
          } else {
            await tx.variant.upsert({
              where: { productId_size: { productId: id, size: v.size } },
              update: { price: v.price, stock: v.stock },
              create: { productId: id, size: v.size, price: v.price, stock: v.stock },
            });
          }
        }
      }

      return tx.product.update({
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
    });
  }

  async deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } });
  }

  async addVariant(productId: string, data: { size: string; price: number; stock: number }) {
    return prisma.variant.create({
      data: {
        productId,
        size: data.size,
        price: data.price,
        stock: data.stock,
      },
      select: { id: true, size: true, stock: true, price: true },
    });
  }

  async updateVariant(variantId: string, data: { size?: string; price?: number; stock?: number }) {
    return prisma.variant.update({
      where: { id: variantId },
      data: {
        ...(data.size !== undefined ? { size: data.size } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
      },
      select: { id: true, size: true, stock: true, price: true },
    });
  }

  async deleteVariant(variantId: string) {
    await prisma.variant.delete({ where: { id: variantId } });
  }

  async listInventory(
    filters: InventoryFilters,
    pagination: Pagination
  ): Promise<PaginatedInventory> {
    const { page, pageSize } = pagination;
    const where: Prisma.VariantWhereInput = {};

    if (filters.stockStatus === 'OUT_OF_STOCK') {
      where.stock = 0;
    } else if (filters.stockStatus === 'LOW_STOCK') {
      where.stock = { gt: 0, lte: 3 };
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.product = {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const [total, lowStockCount, outOfStockCount, rawItems] = await prisma.$transaction([
      prisma.variant.count({ where }),
      prisma.variant.count({ where: { stock: { gt: 0, lte: 3 } } }),
      prisma.variant.count({ where: { stock: 0 } }),
      prisma.variant.findMany({
        where,
        select: {
          id: true,
          size: true,
          stock: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              sku: true,
              colorway: true,
              images: true,
            },
          },
        },
        orderBy: [{ stock: 'asc' }, { product: { name: 'asc' } }, { size: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: rawItems,
      total,
      lowStockCount,
      outOfStockCount,
      page,
      pageSize,
    };
  }

  async updateVariantStock(variantId: string, stock: number): Promise<ProductVariant> {
    if (stock < 0) throw new Error('Stock cannot be negative');
    return prisma.variant.update({
      where: { id: variantId },
      data: { stock },
      select: { id: true, size: true, stock: true, price: true },
    });
  }
}
