import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { parseBody, updateStockSchema } from '@/lib/validation';
import { catalog } from '@/modules/catalog';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const { stock } = parseBody(updateStockSchema, await req.json());
    const updated = await catalog.updateVariantStock(id, stock);
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Failed to update stock');
  }
}
