import Link from 'next/link';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            KICKSKRAZE
          </Link>
          <div className="flex gap-8">
            <Link href="/products" className="hover:underline">
              Shop
            </Link>
            <Link href="/cart" className="hover:underline">
              Cart
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
