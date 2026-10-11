import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { AuthError, requireAdmin } from '@/lib/auth';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect('/login?redirectTo=/admin');
    }
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <div className="sticky top-0 z-50 bg-white">
        <Header mode="admin" />
        <div className="border-b border-black/15 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border border-transparent text-black hover:border-black hover:bg-black hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
