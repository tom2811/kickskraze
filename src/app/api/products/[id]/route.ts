import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { catalog } from '@/modules/catalog';
import { parseBody, updateProductSchema } from '@/lib/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await catalog.getById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const response = NextResponse.json(product);
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    return apiError(error, 'Failed to fetch product');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
    const data = parseBody(updateProductSchema, await request.json());
    const product = await catalog.updateProduct(id, data);
    return NextResponse.json(product);
  } catch (error) {
    return apiError(error, 'Failed to update product');
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAdmin();
    await catalog.deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Failed to delete product');
  }
}
