'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button, TextField } from '@/components/ui';
import { toast } from 'sonner';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // Check if email confirmation is required
      if (data?.user && !data.session) {
        // Email confirmation required
        setEmailSent(true);
        toast.success('Confirmation email sent! Check your inbox to verify your account.');
      } else if (data?.session) {
        // Auto-confirmed (shouldn't happen in production with email confirmation enabled)
        await fetch('/api/session');
        toast.success('Account created successfully!');
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-5 text-center">
        <div className="p-6 border border-black bg-green-50">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-sm font-mono uppercase font-bold tracking-widest mb-2">
            Check your email
          </h2>
          <p className="text-xs font-mono text-black/60">
            We've sent a confirmation link to <strong>{email}</strong>
          </p>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-black/40">
          Didn't receive it?{' '}
          <button
            onClick={() => setEmailSent(false)}
            className="text-black font-bold underline underline-offset-2 hover:bg-black hover:text-white transition-colors"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 border border-black text-xs font-mono uppercase font-bold">{error}</div>
      )}

      <TextField
        id="name"
        label="Full name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Jane Doe"
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        placeholder="••••••••"
      />
      <TextField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={6}
        placeholder="••••••••"
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Create account'}
      </Button>

      <p className="text-center text-[10px] font-mono uppercase tracking-widest text-black/40 pt-2">
        Already have an account?{' '}
        <Link href="/login" className="text-black font-bold underline underline-offset-2 hover:bg-black hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
