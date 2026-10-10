import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { checkoutSchema, parseBody } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { shippingAddress } = parseBody(checkoutSchema, await req.json());
    const session = await ordering.checkout(user.id, user.email, shippingAddress);
    return NextResponse.json({ sessionId: session.sessionId, url: session.url });
  } catch (error) {
    return apiError(error, 'Failed to create checkout session');
  }
}
