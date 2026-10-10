import { Header } from '@/components/layout/header';
import { redirectAdminToConsole } from '@/lib/auth';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  await redirectAdminToConsole();
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
