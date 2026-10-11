import { z } from 'zod';

export class ValidationError extends Error {
  constructor(message = 'Invalid request') {
    super(message);
    this.name = 'ValidationError';
  }
}

export function parseBody<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Invalid request');
  }
  return result.data;
}

const categoryEnum = z.enum(['SNEAKERS', 'APPAREL', 'ACCESSORIES']);

export const variantInputSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1).max(20),
  price: z.number().positive().max(1_000_000),
  stock: z.number().int().min(0).max(1_000_000),
});

export const createProductSchema = z
  .object({
    name: z.string().min(1).max(200),
    sku: z.string().min(1).max(64),
    brand: z.string().min(1).max(100),
    category: categoryEnum,
    colorway: z.string().min(1).max(200),
    retailPrice: z.number().positive().max(1_000_000),
    description: z.string().max(5000).optional(),
    images: z.array(z.string().url()).max(10).optional(),
    variants: z.array(variantInputSchema).optional(),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export const addToCartSchema = z
  .object({
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(10).default(1),
  })
  .strict();

export const updateCartSchema = z
  .object({
    quantity: z.number().int().min(1).max(10),
  })
  .strict();

export const shippingAddressSchema = z
  .object({
    name: z.string().min(1).max(200),
    street: z.string().min(1).max(300),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    zip: z.string().min(1).max(20),
    country: z.string().min(2).max(2),
  })
  .strict();

export const addressInputSchema = shippingAddressSchema
  .extend({
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateAddressSchema = addressInputSchema.partial().strict();

export const checkoutSchema = z
  .object({
    shippingAddress: shippingAddressSchema,
  })
  .strict();

export const orderStatusSchema = z
  .object({
    status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  })
  .strict();

export const productQuerySchema = z.object({
  brand: z.string().max(100).optional(),
  category: categoryEnum.optional(),
  search: z.string().max(100).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(24),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const userRoleSchema = z
  .object({
    role: z.enum(['USER', 'ADMIN']),
  })
  .strict();

export const userQuerySchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const inventoryQuerySchema = z.object({
  stockStatus: z.enum(['ALL', 'LOW_STOCK', 'OUT_OF_STOCK']).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
});

export const updateStockSchema = z
  .object({
    stock: z.number().int().min(0).max(1_000_000),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
