import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-sm w-full">
        <div className="mb-10">
          <Link href="/" className="text-xl font-black tracking-tight uppercase block mb-8">
            Kickskraze
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Sign in
          </h1>
          <p className="mt-1 text-xs font-mono uppercase tracking-widest text-black/40">
            Welcome back to the drop
          </p>
        </div>

        <div className="border border-black p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
