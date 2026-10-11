import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { parseBody, userRoleSchema } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actingUser = await requireAdmin();
    const { role } = parseBody(userRoleSchema, await req.json());
    const updated = await ordering.updateUserRole(id, actingUser.id, role);
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error, 'Failed to update user role');
  }
}
