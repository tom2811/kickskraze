import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { catalog } from '@/modules/catalog';
import { createProductSchema, parseBody, productQuerySchema } from '@/lib/validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = productQuerySchema.safeParse({
    brand: searchParams.get('brand') || undefined,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    page: searchParams.get('page') || undefined,
    pageSize: searchParams.get('pageSize') || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { page, pageSize, ...filters } = parsed.data;

  try {
    const result = await catalog.searchProducts(filters, { page, pageSize });
    const cacheable = !filters.search && !filters.brand && !filters.category;
    const response = NextResponse.json(result);
    if (cacheable) {
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    }
    return response;
  } catch (error) {
    return apiError(error, 'Failed to fetch products');
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = parseBody(createProductSchema, await request.json());
    const product = await catalog.createProduct(data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiError(error, 'Failed to create product');
  }
}
