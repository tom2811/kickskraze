import { Header } from '@/components/layout/header';
import { redirectAdminToConsole } from '@/lib/auth';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  await redirectAdminToConsole();
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}
