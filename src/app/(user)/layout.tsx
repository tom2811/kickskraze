import { Header } from '@/components/layout/header';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}
