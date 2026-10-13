'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { PageHeader, PageSkeleton, TextField, Button } from '@/components/ui';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const supabase = createClient();

  const [editedName, setEditedName] = useState<string | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.name || 'User';
  const nameValue = editedName ?? (user.user_metadata?.name || '');
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true);
    setNameSuccess(false);
    setNameError(null);

    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty.');
      setNameSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: { name: trimmed },
    });

    if (error) {
      setNameError(error.message);
    } else {
      setNameSuccess(true);
      setEditedName(trimmed);
      setTimeout(() => setNameSuccess(false), 3000);
    }
    setNameSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      setPasswordSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setPasswordSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <PageHeader eyebrow="Account" title="Profile Settings" />

      {/* User Summary Card */}
      <div className="bg-white border border-black p-8 mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-20 h-20 bg-black text-white flex items-center justify-center font-display font-black text-3xl flex-shrink-0 border border-black">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="font-display text-2xl font-black uppercase">{displayName}</h2>
            <p className="font-mono text-sm tracking-widest uppercase text-black/60">{user.email}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/40 pt-1">
              Member since {memberSince}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[11px] font-mono font-semibold uppercase tracking-widest border border-black hover:bg-white hover:text-black transition-colors"
            >
              [ Orders ]
            </Link>
            <Link
              href="/addresses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[11px] font-mono font-semibold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors"
            >
              [ Addresses ]
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Name Settings */}
        <section className="bg-white border border-black p-8">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-2">
            Display Name
          </h3>
          <p className="font-mono text-xs text-black/60 mb-6">
            Update how your name appears on your account. Email address is read-only.
          </p>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <TextField
              label="Display Name"
              id="name"
              name="name"
              value={nameValue}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />

            <div>
              <label
                htmlFor="email-display"
                className="block text-[10px] font-mono uppercase tracking-widest font-bold text-black/40 mb-2"
              >
                Email Address
              </label>
              <input
                id="email-display"
                type="text"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2.5 bg-neutral-100 text-black/60 text-sm font-mono border border-black/10 cursor-not-allowed"
              />
            </div>

            {nameError ? (
              <div className="p-3 border border-red-500 bg-red-50 text-red-700 font-mono text-xs">
                {nameError}
              </div>
            ) : null}

            {nameSuccess ? (
              <div className="p-3 border border-black bg-accent text-black font-mono text-xs font-bold uppercase tracking-widest">
                Display name updated
              </div>
            ) : null}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={nameSaving}
              >
                {nameSaving ? 'Saving...' : 'Save Name'}
              </Button>
            </div>
          </form>
        </section>

        {/* Password Settings */}
        <section className="bg-white border border-black p-8">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-2">
            Change Password
          </h3>
          <p className="font-mono text-xs text-black/60 mb-6">
            Ensure your account is using a long, secure password.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <TextField
              label="New Password"
              id="new-password"
              name="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <TextField
              label="Confirm Password"
              id="confirm-password"
              name="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {passwordError ? (
              <div className="p-3 border border-red-500 bg-red-50 text-red-700 font-mono text-xs">
                {passwordError}
              </div>
            ) : null}

            {passwordSuccess ? (
              <div className="p-3 border border-black bg-accent text-black font-mono text-xs font-bold uppercase tracking-widest">
                Password updated successfully
              </div>
            ) : null}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={passwordSaving}
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
