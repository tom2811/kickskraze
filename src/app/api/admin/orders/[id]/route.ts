import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { orderStatusSchema, parseBody } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const { status } = parseBody(orderStatusSchema, await req.json());
    const order = await ordering.updateOrderStatus(id, status);
    return NextResponse.json(order);
  } catch (error) {
    return apiError(error, 'Failed to update order');
  }
}
