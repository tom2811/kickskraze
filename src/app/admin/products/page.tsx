'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, PageHeader, PageSkeleton, Pager, ProductImage, TextField, SelectField } from '@/components/ui';
import { apiFetch } from '@/lib/api-client';

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

type ProductVariant = {
  id?: string;
  size: string;
  price: number;
  stock: number;
};

type ProductDetail = AdminProduct & {
  variants: ProductVariant[];
};

const emptyForm = {
  name: '',
  sku: '',
  brand: '',
  category: 'SNEAKERS',
  colorway: '',
  retailPrice: '',
  imageUrl: '',
  variants: [] as ProductVariant[],
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

  // New variant inputs
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('5');
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<{ items?: AdminProduct[]; total?: number }>(
          `/api/products?page=${page}&pageSize=${PAGE_SIZE}`,
          undefined,
          'Failed to fetch products'
        );
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
    setNewSize('');
    setNewPrice('');
    setNewStock('5');
    setVariantError(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (product: AdminProduct) => {
    setEditingProduct(product);
    setNewSize('');
    setNewPrice('');
    setNewStock('5');
    setVariantError(null);

    setFormData({
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      colorway: product.colorway,
      retailPrice: product.retailPrice.toString(),
      imageUrl: product.images[0] ?? '',
      variants: [],
    });
    setIsModalOpen(true);

    // Fetch full details with variants
    try {
      const full = await apiFetch<ProductDetail>(
        `/api/products/${product.id}`,
        undefined,
        'Failed to fetch product details'
      );
      if (full?.variants) {
        setFormData((prev) => ({
          ...prev,
          variants: full.variants,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVariant = () => {
    setVariantError(null);
    const size = newSize.trim();
    if (!size) {
      setVariantError('Size is required');
      return;
    }

    if (formData.variants.some((v) => v.size.toLowerCase() === size.toLowerCase())) {
      setVariantError(`Size ${size} already exists`);
      return;
    }

    const price = newPrice ? parseFloat(newPrice) : parseFloat(formData.retailPrice) || 0;
    if (isNaN(price) || price <= 0) {
      setVariantError('Price must be greater than 0');
      return;
    }

    const stock = parseInt(newStock, 10);
    if (isNaN(stock) || stock < 0) {
      setVariantError('Stock cannot be negative');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size, price, stock }],
    }));

    setNewSize('');
    setNewPrice('');
    setNewStock('5');
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateVariantStock = (index: number, stock: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, stock: Math.max(0, stock) } : v)),
    }));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' }, 'Failed to delete product');
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
      variants: formData.variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        size: v.size,
        price: v.price,
        stock: v.stock,
      })),
    };

    try {
      await apiFetch(
        url,
        {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        'Failed to save product'
      );
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

            {/* Variants Section */}
            <div className="border-t border-black/15 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display text-lg font-bold uppercase tracking-tight">
                  Sizes & Inventory ({formData.variants.length})
                </h4>
                <span className="font-mono text-[10px] text-black/40 uppercase tracking-widest">
                  Variants make this product buyable
                </span>
              </div>

              {/* Add Variant Sub-form */}
              <div className="bg-neutral-50 border border-black/15 p-4 mb-4">
                <div className="text-[10px] font-mono uppercase tracking-widest font-bold text-black/40 mb-3">
                  Add Size Variant
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest font-bold text-black/40 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10.5"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-black text-xs font-mono border border-black/20 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest font-bold text-black/40 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={formData.retailPrice || 'Retail'}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-black text-xs font-mono border border-black/20 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest font-bold text-black/40 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full px-3 py-2 bg-white text-black text-xs font-mono border border-black/20 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full h-[34px]"
                      onClick={handleAddVariant}
                    >
                      + Add Size
                    </Button>
                  </div>
                </div>
                {variantError && (
                  <p className="font-mono text-xs text-red-600 mt-2">{variantError}</p>
                )}
              </div>

              {/* Variants Table/List */}
              {formData.variants.length > 0 ? (
                <div className="border border-black/15 max-h-48 overflow-y-auto divide-y divide-black/10">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={v.id ?? `${v.size}-${idx}`}
                      className="px-4 py-2 flex items-center justify-between text-xs font-mono bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold">
                          US {v.size}
                        </span>
                        <span className="text-black/60">${v.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase text-black/40">Stock:</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) =>
                              handleUpdateVariantStock(idx, parseInt(e.target.value, 10) || 0)
                            }
                            className="w-16 px-1.5 py-0.5 border border-black/20 text-center text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-[10px] font-bold uppercase text-red-600 hover:text-red-900"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 italic">
                  No sizes added yet. Use the form above to add purchasable sizes.
                </p>
              )}
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
