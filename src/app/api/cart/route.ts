import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { addToCartSchema, parseBody } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function GET() {
  try {
    const user = await requireUser();
    const cart = await ordering.getCart(user.id);
    return NextResponse.json(cart);
  } catch (error) {
    return apiError(error, 'Failed to fetch cart');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { variantId, quantity } = parseBody(addToCartSchema, await req.json());
    const cartItem = await ordering.addToCart(user.id, variantId, quantity ?? 1);
    return NextResponse.json(cartItem);
  } catch (error) {
    return apiError(error, 'Failed to add to cart');
  }
}
