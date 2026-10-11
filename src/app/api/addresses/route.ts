import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { addressInputSchema, parseBody } from '@/lib/validation';
import { ordering } from '@/modules/ordering';

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await ordering.listAddresses(user.id);
    return NextResponse.json(addresses);
  } catch (error) {
    return apiError(error, 'Failed to fetch addresses');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const input = parseBody(addressInputSchema, await req.json());
    const address = await ordering.createAddress(user.id, input);
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    return apiError(error, 'Failed to create address');
  }
}
