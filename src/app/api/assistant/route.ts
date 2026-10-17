import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { catalog } from '@/modules/catalog';
import { nexus } from '@/modules/nexus';
import { apiError } from '@/lib/http';

const assistantQuerySchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000),
  productId: z.string().uuid().optional(),
  size: z.string().optional(),
});

const STOPWORDS = new Set([
  'is', 'are', 'do', 'does', 'you', 'have', 'has', 'the', 'a', 'an', 'this',
  'that', 'these', 'those', 'in', 'stock', 'available', 'availability', 'size',
  'sizes', 'of', 'for', 'it', 'any', 'and', 'or', 'to', 'can', 'i', 'get',
  'buy', 'price', 'cost', 'how', 'much', 'what', 'which', 'on', 'with',
]);

function toProductContext(product: {
  name: string;
  brand: string;
  colorway: string;
  retailPrice: number;
  variants: Array<{ size: string; stock: number }>;
}) {
  const availableSizes = product.variants
    .filter((v) => v.stock > 0)
    .map((v) => v.size);

  return {
    name: product.name,
    brand: product.brand,
    colorway: product.colorway,
    retailPrice: product.retailPrice,
    availableSizes,
    inStock: availableSizes.length > 0,
  };
}

function extractSearchTerm(message: string): string | null {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w) && !/^\d+(?:\.\d+)?$/.test(w));
  return words.join(' ').trim() || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, productId, size } = assistantQuerySchema.parse(body);

    let productContext;

    if (productId) {
      const product = await catalog.getById(productId);
      if (product) productContext = toProductContext(product);
    } else {
      const search = extractSearchTerm(message);
      if (search) {
        const { items } = await catalog.searchProducts(
          { search },
          { page: 1, pageSize: 1 }
        );
        if (items[0]) {
          const product = await catalog.getById(items[0].id);
          if (product) productContext = toProductContext(product);
        }
      }
    }

    const response = await nexus.query({
      message,
      productId,
      size,
      productContext,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Assistant query failed:', error instanceof Error ? error.message : error);
    return apiError(error, 'Failed to query assistant');
  }
}
