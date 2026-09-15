import React, { useState } from 'react';
import { Product, ProductColor } from '../types';
import { Plus, Trash2, Edit, Image as ImageIcon, Check, X, Tag, DollarSign, Layers, Palette, Ruler, AlertCircle, Package } from 'lucide-react';

interface ProductManagementProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

const PRESET_COLORS: ProductColor[] = [
  { name: 'Midnight Black', hex: '#0f172a' },
  { name: 'Space Gray', hex: '#475569' },
  { name: 'Silver White', hex: '#f8fafc' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Ruby Red', hex: '#dc2626' },
  { name: 'Rose Gold', hex: '#f43f5e' },
  { name: 'Sunset Orange', hex: '#ea580c' },
];

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size', '128GB', '256GB', '512GB', '1TB'];

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [regularPrice, setRegularPrice] = useState<number | ''>('');
  const [discountedPrice, setDiscountedPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [images, setImages] = useState<string[]>(['']);
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#3b82f6');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory('Electronics');
    setRegularPrice('');
    setDiscountedPrice('');
    setStock(10);
    setImages(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80']);
    setSelectedColors([PRESET_COLORS[0], PRESET_COLORS[1], PRESET_COLORS[3]]);
    setSelectedSizes(['M', 'L', 'XL']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category);
    setRegularPrice(product.regularPrice);
    setDiscountedPrice(product.discountedPrice);
    setStock(product.stock);
    setImages(product.images.length > 0 ? [...product.images] : ['']);
    setSelectedColors([...product.colors]);
    setSelectedSizes([...product.sizes]);
    setIsModalOpen(true);
  };

  const handleAddImageField = () => {
    setImages([...images, '']);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleToggleColor = (color: ProductColor) => {
    const exists = selectedColors.some((c) => c.name === color.name);
    if (exists) {
      setSelectedColors(selectedColors.filter((c) => c.name !== color.name));
    } else {
      if (selectedColors.length >= 7) {
        alert('You can select a maximum of 7 color options.');
        return;
      }
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    if (selectedColors.length >= 7) {
      alert('Maximum 7 color options allowed.');
      return;
    }
    const newColor = { name: customColorName.trim(), hex: customColorHex };
    if (!selectedColors.some((c) => c.name === newColor.name)) {
      setSelectedColors([...selectedColors, newColor]);
      setCustomColorName('');
    }
  };

  const handleToggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || regularPrice === '' || stock === '') {
      alert('Please fill in product name, regular price, and stock quantity.');
      return;
    }

    if (selectedColors.length < 1) {
      alert('Please select at least 1 color option.');
      return;
    }

    setSubmitting(true);
    try {
      const validImages = images.filter((img) => img.trim() !== '');
      const productPayload = {
        name,
        description,
        category,
        regularPrice: Number(regularPrice),
        discountedPrice: discountedPrice !== '' ? Number(discountedPrice) : Number(regularPrice),
        images: validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
        colors: selectedColors,
        sizes: selectedSizes,
        stock: Number(stock),
      };

      if (editingId) {
        await onUpdateProduct(editingId, productPayload);
      } else {
        await onAddProduct(productPayload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Management</h2>
          <p className="text-sm text-slate-600">Add, edit, manage stock, prices, colors, and multiple images for Tech Sodai catalog.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Grid / Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No products found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Your store currently has no products. Start adding items with multiple images, dynamic colors, sizes, and pricing.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const hasDiscount = product.discountedPrice < product.regularPrice;
            const discountPercent = hasDiscount
              ? Math.round(((product.regularPrice - product.discountedPrice) / product.regularPrice) * 100)
              : 0;

            return (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                    {hasDiscount && (
                      <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    Stock: {product.stock}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description || 'No description provided.'}</p>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-blue-600">৳{product.discountedPrice}</span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through">৳{product.regularPrice}</span>
                    )}
                  </div>

                  {/* Colors & Sizes indicators */}
                  <div className="space-y-2 mb-4 pt-3 border-t border-slate-100 mt-auto">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Colors ({product.colors.length}):</span>
                      <div className="flex items-center gap-1">
                        {product.colors.map((c, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Sizes:</span>
                      <span className="font-medium text-slate-800">{product.sizes.join(', ') || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 rounded-xl transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Product</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      className="inline-flex items-center justify-center p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Product' : 'Add New Product (Tech Sodai)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" /> Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Wireless Noise Canceling Headphones"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Audio, Gadgets, Wearables"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe product specs, warranty, features..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" /> Pricing & Inventory
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Regular Price (৳) *</label>
                    <input
                      type="number"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 2999"
                      required
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Discounted Price (৳)</label>
                    <input
                      type="number"
                      value={discountedPrice}
                      onChange={(e) => setDiscountedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 2499"
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Leave empty or equal to regular price if no discount.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 50"
                      required
                      min={0}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Multiple Images */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" /> Multiple Image URLs
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    + Add Another Image
                  </button>
                </div>
                <div className="space-y-2">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={imgUrl}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        placeholder="https://images.unsplash.com/... or image URL"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono text-xs"
                      />
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic 5-7 Color Options */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600" /> Dynamic Color Options (5-7 recommended)
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">{selectedColors.length}/7 selected</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_COLORS.map((color) => {
                    const isSelected = selectedColors.some((c) => c.name === color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => handleToggleColor(color)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate">{color.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Color */}
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Custom Color:</span>
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    placeholder="Color Name (e.g. Mint)"
                    className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-600" /> Size / Capacity Selection
                </h4>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
