'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  ButtonLink,
  PageHeader,
  PageSkeleton,
  Pager,
  SelectField,
} from '@/components/ui';

type AdminUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

type UserResponse = {
  items?: AdminUser[];
  total?: number;
  adminCount?: number;
  userCount?: number;
};

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  // Debounce search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    let cancelled = false;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: PAGE_SIZE.toString(),
        });

        if (roleFilter !== 'ALL') {
          params.set('role', roleFilter);
        }

        if (debouncedSearch.trim()) {
          params.set('search', debouncedSearch.trim());
        }

        const data = await apiFetch<UserResponse>(
          `/api/admin/users?${params.toString()}`,
          undefined,
          'Failed to fetch users'
        );
        if (cancelled) return;
        setUsers(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
        setAdminCount(typeof data.adminCount === 'number' ? data.adminCount : 0);
        setUserCount(typeof data.userCount === 'number' ? data.userCount : 0);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to fetch users';
          setError(message === 'Forbidden' ? 'Access denied. Admin privileges required.' : message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router, page, roleFilter, debouncedSearch]);

  const handleRoleChange = async (targetUser: AdminUser, newRole: 'USER' | 'ADMIN') => {
    if (targetUser.role === newRole) return;

    if (user?.id === targetUser.id && newRole !== 'ADMIN') {
      setFeedback({
        message: 'Cannot remove your own admin role. This prevents console lockout.',
        type: 'error',
      });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    setUpdatingUser(targetUser.id);
    setFeedback(null);
    try {
      const updated = await apiFetch<AdminUser>(
        `/api/admin/users/${targetUser.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        },
        'Failed to update user role'
      );
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
      if (newRole === 'ADMIN') {
        setAdminCount((prev) => prev + 1);
        setUserCount((prev) => Math.max(0, prev - 1));
      } else {
        setAdminCount((prev) => Math.max(0, prev - 1));
        setUserCount((prev) => prev + 1);
      }
      setFeedback({
        message: `Updated ${targetUser.email} to ${newRole}`,
        type: 'success',
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Failed to update user role',
        type: 'error',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleTabChange = (filter: 'ALL' | 'ADMIN' | 'USER') => {
    setRoleFilter(filter);
    setPage(1);
  };

  if (authLoading || (loading && !users.length && !search)) {
    return <PageSkeleton rows={4} />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">{error}</h2>
        <ButtonLink href="/admin">Dashboard</ButtonLink>
      </div>
    );
  }

  const allCount = adminCount + userCount;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader eyebrow={`${allCount} total registered`} title="Users" />

      {feedback && (
        <div
          className={`mb-6 p-4 border font-mono text-xs font-bold uppercase tracking-widest ${
            feedback.type === 'error'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-black bg-accent text-black'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex border border-black bg-white">
          <button
            type="button"
            onClick={() => handleTabChange('ALL')}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
              roleFilter === 'ALL'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            All [{allCount}]
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('ADMIN')}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest border-l border-black transition-colors ${
              roleFilter === 'ADMIN'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            Admins [{adminCount}]
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('USER')}
            className={`px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest border-l border-black transition-colors ${
              roleFilter === 'USER'
                ? 'bg-black text-white'
                : 'text-black hover:bg-black/5'
            }`}
          >
            Customers [{userCount}]
          </button>
        </div>

        {/* Email Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="SEARCH BY EMAIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-widest border border-black placeholder:text-black/30 focus:outline-none focus:bg-neutral-50"
          />
        </div>
      </div>

      {users.length === 0 ? (
        <div className="border border-black/15 p-12 text-center bg-white">
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40">
            {debouncedSearch ? 'No users matching search criteria' : 'No users found'}
          </p>
        </div>
      ) : (
        <div className="border border-black overflow-x-auto bg-white">
          <table className="w-full">
            <thead className="border-b border-black">
              <tr>
                {['Email', 'Role', 'Joined', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-[10px] font-mono font-bold uppercase tracking-widest text-black/40"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {users.map((u) => {
                const isSelf = user?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-black/5">
                    <td className="px-6 py-4 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <span>{u.email}</span>
                        {isSelf && (
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border border-black bg-black text-white">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-black ${
                          u.role === 'ADMIN'
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-black/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <SelectField
                          label=""
                          aria-label={`Role for ${u.email}`}
                          value={u.role}
                          disabled={updatingUser === u.id}
                          onChange={(e) =>
                            handleRoleChange(u, e.target.value as 'USER' | 'ADMIN')
                          }
                          className="min-w-[8rem]"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </SelectField>
                        {isSelf && (
                          <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest hidden sm:inline">
                            (Protected)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
    </div>
  );
}
