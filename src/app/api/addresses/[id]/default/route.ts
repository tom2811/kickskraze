import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { ordering } from '@/modules/ordering';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const address = await ordering.setDefaultAddress(user.id, id);
    return NextResponse.json(address);
  } catch (error) {
    return apiError(error, 'Failed to set default address');
  }
}
