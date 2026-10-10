import { NextResponse } from 'next/server';
import { getSessionUser, requireUser } from '@/lib/auth';
import { ROLE_COOKIE, roleCookieOptions } from '@/lib/role-cookie';
import { apiError } from '@/lib/http';

export async function GET() {
  try {
    const user = await requireUser();
    const response = NextResponse.json({ id: user.id, email: user.email, role: user.role });
    const cookie = roleCookieOptions(user.role);
    response.cookies.set(cookie.name, cookie.value, cookie);
    return response;
  } catch (error) {
    return apiError(error, 'Unauthorized');
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  const response = NextResponse.json({ ok: true, role: user?.role ?? null });
  response.cookies.set(ROLE_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
