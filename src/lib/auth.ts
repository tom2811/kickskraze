import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@/lib/supabase-server';
export { ROLE_COOKIE, roleCookieOptions } from '@/lib/role-cookie';

export class AuthError extends Error {
  constructor(
    public status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export type AppUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export async function requireUser(): Promise<AppUser> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError(401, 'Unauthorized');
  }

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email || undefined },
    create: { id: user.id, email: user.email || '' },
  });

  return { id: dbUser.id, email: dbUser.email, role: dbUser.role };
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') {
    throw new AuthError(403, 'Forbidden');
  }
  return user;
}

export async function getSessionUser(): Promise<AppUser | null> {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}

export async function redirectAdminToConsole() {
  const user = await getSessionUser();
  if (user?.role === 'ADMIN') {
    redirect('/admin');
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}
