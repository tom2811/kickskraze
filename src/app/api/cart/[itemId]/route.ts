import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { parseBody, updateCartSchema } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireUser();
    const { itemId } = await params;
    const { quantity } = parseBody(updateCartSchema, await req.json());
    const updated = await ordering.updateCartItem(user.id, itemId, quantity);
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Failed to update cart');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const user = await requireUser();
    const { itemId } = await params;
    await ordering.removeCartItem(user.id, itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Failed to delete cart item');
  }
}
