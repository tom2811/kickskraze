import { NextResponse } from 'next/server';
import { AuthError, authErrorResponse } from '@/lib/auth';
import { ValidationError } from '@/lib/validation';

const SAFE_CLIENT_ERRORS = new Set([
  'Cart is empty',
  'Insufficient stock',
  'Variant not found',
  'Cart item not found',
  'Invalid status transition',
  'Order not found',
]);

export function apiError(error: unknown, fallback = 'Internal Server Error') {
  const auth = authErrorResponse(error);
  if (auth) return auth;

  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof Error) {
    if (error.message === 'Order not found' || error.message === 'Cart item not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === 'Insufficient stock' || error.message.startsWith('Insufficient stock')) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }
    if (SAFE_CLIENT_ERRORS.has(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  console.error(error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export { AuthError };
