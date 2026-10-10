import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { orderQuerySchema } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = request.nextUrl;
    const parsed = orderQuerySchema.safeParse({
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const result = await ordering.listOrders(user.id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, 'Failed to fetch orders');
  }
}
