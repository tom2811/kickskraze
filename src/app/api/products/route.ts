import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const where: any = {};

  if (brand) where.brand = brand;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { colorway: { contains: search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      variants: {
        select: {
          id: true,
          size: true,
          stock: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}
