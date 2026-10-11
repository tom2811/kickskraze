'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { PageSkeleton } from '@/components/ui';

const cards = [
  {
    href: '/admin/orders',
    title: 'Orders',
    description: 'Manage customer orders and update shipping status',
  },
  {
    href: '/admin/products',
    title: 'Products',
    description: 'Create, edit, and delete products in the catalog',
  },
  {
    href: '/admin/users',
    title: 'Users',
    description: 'Manage user accounts and assign roles',
  },
];

const upcoming = [
  { title: 'Analytics', description: 'Coming later' },
  { title: 'Revenue', description: 'Coming later' },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader eyebrow="Admin" title="Dashboard" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group block border border-black p-8 bg-white text-black hover:bg-black hover:text-white transition-colors"
          >
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-3">
              {card.title}
            </h3>
            <p className="font-mono text-sm leading-relaxed text-black/60 group-hover:text-white">
              {card.description}
            </p>
          </Link>
        ))}

        {upcoming.map((card) => (
          <div key={card.title} className="border border-black/15 p-8 opacity-50">
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-3">
              {card.title}
            </h3>
            <p className="font-mono text-sm text-black/60">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
