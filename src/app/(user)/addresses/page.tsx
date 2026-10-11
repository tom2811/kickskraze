'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  Button,
  ButtonLink,
  Modal,
  PageHeader,
  PageSkeleton,
  SelectField,
  TextField,
} from '@/components/ui';

export type Address = {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

type AddressFormData = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

const emptyForm: AddressFormData = {
  name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  isDefault: false,
};

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/addresses');
      return;
    }

    if (!user) return;

    let cancelled = false;
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<Address[]>(
          '/api/addresses',
          undefined,
          'Failed to fetch addresses'
        );
        if (!cancelled) {
          setAddresses(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAddresses();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingAddress) {
        const updated = await apiFetch<Address>(
          `/api/addresses/${editingAddress.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          },
          'Failed to update address'
        );
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === updated.id) return updated;
            if (updated.isDefault) return { ...a, isDefault: false };
            return a;
          })
        );
      } else {
        const created = await apiFetch<Address>(
          '/api/addresses',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          },
          'Failed to save address'
        );
        setAddresses((prev) => {
          if (created.isDefault) {
            return [created, ...prev.map((a) => ({ ...a, isDefault: false }))];
          }
          return [...prev, created];
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await apiFetch(`/api/addresses/${id}`, { method: 'DELETE' }, 'Failed to delete address');
      setAddresses((prev) => {
        const filtered = prev.filter((a) => a.id !== id);
        // If deleted was default and there are remaining, promote the first
        const wasDefault = prev.find((a) => a.id === id)?.isDefault;
        if (wasDefault && filtered.length > 0) {
          filtered[0].isDefault = true;
        }
        return filtered;
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await apiFetch<Address>(
        `/api/addresses/${id}/default`,
        { method: 'POST' },
        'Failed to set default address'
      );
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === updated.id,
        }))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to set default address');
    }
  };

  if (authLoading || loading) {
    return <PageSkeleton rows={4} />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">{error}</h2>
        <ButtonLink href="/profile">Back to Profile</ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader eyebrow="Account" title="Saved Addresses" />
        <div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-6 py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest border border-black hover:bg-white hover:text-black transition-colors"
          >
            [ + Add New Address ]
          </button>
        </div>
      </div>

      <div className="mb-8">
        <Link
          href="/profile"
          className="text-xs font-mono uppercase tracking-widest text-black/50 hover:text-black transition-colors"
        >
          &larr; Back to Profile Settings
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-black p-12 text-center bg-white">
          <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-6">
            You do not have any saved addresses yet.
          </p>
          <Button onClick={openCreateModal}>Add your first address</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`border p-6 bg-white relative flex flex-col justify-between ${
                addr.isDefault ? 'border-black ring-1 ring-black' : 'border-black/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                    {addr.name}
                  </h3>
                  {addr.isDefault && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-black bg-black text-white">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="font-mono text-xs text-black/70 space-y-1 mb-6 leading-relaxed">
                  <p>{addr.street}</p>
                  <p>
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="uppercase text-black/40 text-[10px] pt-1">{addr.country}</p>
                </div>
              </div>

              <div className="border-t border-black/10 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-xs font-mono uppercase tracking-widest font-bold text-black hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-black/30">|</span>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs font-mono uppercase tracking-widest font-bold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-mono uppercase tracking-widest text-black/50 hover:text-black font-semibold"
                  >
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          title={editingAddress ? 'Edit Address' : 'New Address'}
        >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 border border-red-500 bg-red-50 text-red-700 font-mono text-xs font-bold uppercase tracking-widest">
              {formError}
            </div>
          )}

          <TextField
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />

          <TextField
            label="Street Address"
            required
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder="123 Sneaker St, Apt 4B"
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="New York"
            />
            <TextField
              label="State"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="NY"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="ZIP Code"
              required
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              placeholder="10001"
            />
            <SelectField
              label="Country"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              <option value="US">United States</option>
            </SelectField>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 rounded-none border border-black accent-black"
            />
            <label
              htmlFor="isDefault"
              className="font-mono text-xs uppercase tracking-widest text-black/70 cursor-pointer"
            >
              Set as default shipping address
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      )}
    </div>
  );
}
