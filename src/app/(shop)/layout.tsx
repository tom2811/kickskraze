import { Header } from '@/components/layout/header';
import { GlobalAssistantDrawer } from '@/components/assistant/global-assistant-drawer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Header />
      <main className="flex-1">{children}</main>
      <GlobalAssistantDrawer />
    </div>
  );
}
