import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  createProduct,
  updateProduct,
  fetchProductById,
  clearSelectedProduct,
  clearProductMessage,
} from '../features/products/productsSlice';
import { Widget } from '../components/ui/Widget';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Alert } from '../components/ui/Alert';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { validateForm, commonRules } from '../utils/validation';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { ProductFormData } from '../types';
import { cn } from '../utils/helpers';

const CATEGORIES = [
  'Electronics',
  'Accessories',
  'Furniture',
  'Office Supplies',
  'Clothing',
  'Books',
  'Toys',
  'Sports',
  'Home',
  'Other',
];

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const selectedProduct = useAppSelector((s) => s.products.selectedProduct);
  const fetchStatus     = useAppSelector((s) => s.products.fetchStatus);
  const createStatus    = useAppSelector((s) => s.products.createStatus);
  const updateStatus    = useAppSelector((s) => s.products.updateStatus);
  const message         = useAppSelector((s) => s.products.message);
  const error           = useAppSelector((s) => s.products.error);

  const isEditMode = !!id;
  const isLoading  = createStatus === 'loading' || updateStatus === 'loading';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Electronics',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  // ── Load existing product ─────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(clearProductMessage());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (selectedProduct && isEditMode) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        category: selectedProduct.category || 'Electronics',
        isActive: selectedProduct.isActive ?? true,
      });
      if (selectedProduct.image) {
        setImagePreview(selectedProduct.image);
      }
    }
  }, [selectedProduct, isEditMode]);

  // ── File input ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(selectedProduct?.image || '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Field change ──────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData, {
      name:        { required: true, minLength: 2, maxLength: 200 },
      description: { required: true, minLength: 5 },
      price:       { required: true, min: 0.01 },
      stock:       { required: true, min: 0 },
      category:    { required: true },
    });

    if (!validation.isValid) {
      setErrors(validation.errors as any);
      return;
    }

    try {
      if (isEditMode && id) {
        await dispatch(
          updateProduct({ id, formData, imageFile })
        ).unwrap();
      } else {
        await dispatch(
          createProduct({ formData, imageFile })
        ).unwrap();
      }
      navigate('/products');
    } catch {
      // error handled by Redux
    }
  };

  if (fetchStatus === 'loading' && isEditMode) return <PageLoader />;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Products', href: '/products' },
          { label: isEditMode ? 'Edit Product' : 'New Product' },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-slate-500">
            {isEditMode
              ? 'Update product information'
              : 'Add a new product to your inventory'}
          </p>
        </div>
      </div>

      {message && (
        <Alert variant="success" dismissible onDismiss={() => dispatch(clearProductMessage())}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => dispatch(clearProductMessage())}>
          {error}
        </Alert>
      )}

      <div className="max-w-3xl">
        <Widget>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Basic Info ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Premium Wireless Headphones"
              />
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={errors.category as string}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                required
              />
            </div>

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              required
              rows={4}
              placeholder="Detailed product description..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Price (₹)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                required
                placeholder="299.99"
              />
              <Input
                label="Stock Quantity"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                error={errors.stock}
                required
                placeholder="50"
              />
            </div>

            {/* ── Status toggle ─────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-brand-green/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green" />
              </label>
              <span className="text-sm font-medium text-slate-700">
                {formData.isActive ? 'Active (visible to users)' : 'Inactive (hidden)'}
              </span>
            </div>

            {/* ── Image upload ──────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Image
              </label>

              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-xl border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-48 h-48 border-2 border-dashed border-slate-300 rounded-xl',
                    'flex flex-col items-center justify-center gap-2 text-slate-400',
                    'hover:border-brand-green hover:text-brand-green transition-colors'
                  )}
                >
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-sm font-medium">Upload Image</span>
                  <span className="text-xs">JPG, PNG, WEBP · max 5MB</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {!imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              )}
            </div>

            {/* ── Actions ───────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                type="button"
                onClick={() => navigate('/products')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Widget>
      </div>
    </div>
  );
}
