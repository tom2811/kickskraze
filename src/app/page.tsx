import Link from 'next/link';

export default function Home() {
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

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-bold mb-4">KICKSKRAZE</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Premium sneakers, unbeatable prices. Find your next grail.
        </p>
        <Link
          href="/products"
          className="px-8 py-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Shop Now
        </Link>
      </main>
    </div>
  );
}
