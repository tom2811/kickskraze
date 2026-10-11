import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { apiError } from '@/lib/http';
import { ordering } from '@/modules/ordering';

export async function GET() {
  try {
    await requireAdmin();
    const metrics = await ordering.getDashboardMetrics();
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    return apiError(error, 'Failed to fetch dashboard metrics');
  }
}
