import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { inventoryQuerySchema } from '@/lib/validation';
import { catalog } from '@/modules/catalog';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const parsed = inventoryQuerySchema.safeParse({
      stockStatus: searchParams.get('stockStatus') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    const { page, pageSize, ...filters } = parsed.data;
    const inventory = await catalog.listInventory(filters, { page, pageSize });
    return NextResponse.json(inventory);
  } catch (error) {
    return apiError(error, 'Failed to fetch inventory');
  }
}
