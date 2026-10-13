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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, productId, size } = assistantQuerySchema.parse(body);

    let productContext;

    if (productId) {
      const product = await catalog.getById(productId);
      if (product) {
        const availableSizes = product.variants
          .filter((v) => v.stock > 0)
          .map((v) => v.size);

        productContext = {
          name: product.name,
          brand: product.brand,
          colorway: product.colorway,
          retailPrice: product.retailPrice,
          availableSizes,
          inStock: availableSizes.length > 0,
        };
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
    return apiError(error, 'Failed to query assistant');
  }
}
