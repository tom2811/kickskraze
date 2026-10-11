import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { parseBody, updateAddressSchema } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const input = parseBody(updateAddressSchema, await req.json());
    const address = await ordering.updateAddress(user.id, id, input);
    return NextResponse.json(address);
  } catch (error) {
    return apiError(error, 'Failed to update address');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    await ordering.deleteAddress(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, 'Failed to delete address');
  }
}
