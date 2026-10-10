'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, PageHeader, PageSkeleton, Pager, ProductImage, TextField, SelectField } from '@/components/ui';

type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  colorway: string;
  retailPrice: number;
  images: string[];
};

const emptyForm = {
  name: '',
  sku: '',
  brand: '',
  category: 'SNEAKERS',
  colorway: '',
  retailPrice: '',
  imageUrl: '',
};

const PAGE_SIZE = 20;

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?page=${page}&pageSize=${PAGE_SIZE}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (cancelled) return;
        const items = Array.isArray(data.items) ? data.items : [];
        const nextTotal = typeof data.total === 'number' ? data.total : 0;
        setProducts(items);
        setTotal(nextTotal);
        const pageCount = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
        if (page > pageCount) setPage(pageCount);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, refresh]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      colorway: product.colorway,
      retailPrice: product.retailPrice.toString(),
      imageUrl: product.images[0] ?? '',
    });
    setIsModalOpen(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      setRefresh((n) => n + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    const imageUrl = formData.imageUrl.trim();
    const payload = {
      name: formData.name,
      sku: formData.sku,
      brand: formData.brand,
      category: formData.category,
      colorway: formData.colorway,
      retailPrice: parseFloat(formData.retailPrice),
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save product');
      setIsModalOpen(false);
      setRefresh((n) => n + 1);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <PageSkeleton rows={4} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader eyebrow="Admin" title="Product catalog">
        <Button onClick={openCreateModal}>Add product</Button>
      </PageHeader>

      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-black/15 hover:border-black p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors"
          >
            <div className="flex gap-4 items-start">
              <div className="relative w-16 h-16 border border-black/15 bg-neutral-50 p-1 flex-shrink-0">
                <ProductImage src={product.images[0]} alt="" className="object-contain" />
              </div>
              <div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2 font-mono text-[10px] uppercase tracking-widest">
                <span className="bg-black text-white px-2 py-1">{product.sku}</span>
                <span className="border border-black px-2 py-1">{product.brand}</span>
                <span className="border border-black px-2 py-1">${product.retailPrice}</span>
              </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="secondary" size="sm" className="flex-1 md:flex-none" onClick={() => openEditModal(product)}>
                Edit
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 md:flex-none" onClick={() => deleteProduct(product.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="border border-black/15 p-12 text-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/40">
              No products found
            </p>
          </div>
        )}
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />

      {isModalOpen && (
        <Modal
          title={editingProduct ? 'Edit product' : 'New product'}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <TextField
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="SKU"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
              <TextField
                label="Brand"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
              <SelectField
                label="Category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="SNEAKERS">Sneakers</option>
                <option value="APPAREL">Apparel</option>
                <option value="ACCESSORIES">Accessories</option>
              </SelectField>
              <TextField
                label="Colorway"
                required
                value={formData.colorway}
                onChange={(e) => setFormData({ ...formData, colorway: e.target.value })}
              />
              <TextField
                label="Retail price"
                required
                type="number"
                step="0.01"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
              />
              <div className="md:col-span-2">
                <TextField
                  label="Image URL"
                  type="text"
                  placeholder="https://placehold.co/600x600/111111/ffffff?text=Sneaker"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-black/15">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save product</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
