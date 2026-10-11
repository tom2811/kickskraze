import { NextResponse } from 'next/server';
import { AuthError, authErrorResponse } from '@/lib/auth';
import { ValidationError } from '@/lib/validation';

const CLIENT_ERROR_STATUS: Record<string, number> = {
  'Cart is empty': 400,
  'Insufficient stock': 400,
  'Variant not found': 400,
  'Invalid status transition': 400,
  'Cart item not found': 404,
  'Order not found': 404,
};

export function apiError(error: unknown, fallback = 'Internal Server Error') {
  const auth = authErrorResponse(error);
  if (auth) return auth;

  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof Error) {
    const message = error.message.startsWith('Insufficient stock')
      ? 'Insufficient stock'
      : error.message;
    const status = CLIENT_ERROR_STATUS[message];
    if (status) return NextResponse.json({ error: message }, { status });
  }

  console.error(error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export { AuthError };
