import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { userQuerySchema } from '@/lib/validation';
import { identity } from '@/modules/identity';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const parsed = userQuerySchema.safeParse({
      role: searchParams.get('role') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { page, pageSize, ...filters } = parsed.data;
    const result = await identity.listAdminUsers({ page, pageSize }, filters);
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, 'Failed to fetch users');
  }
}
