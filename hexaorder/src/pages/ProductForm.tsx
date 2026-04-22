import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  createProduct,
  updateProduct,
  fetchProductById,
  clearSelectedProduct,
  clearProductMessage
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
import { ArrowLeft } from 'lucide-react';
import type { Product, ProductCategory } from '../types';

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  image: string;
};

const CATEGORIES: ProductCategory[] = [
  'Electronics',
  'Accessories',
  'Furniture',
  'Books',
];

// ✅ Helper to validate category safely
const isValidCategory = (cat: any): cat is ProductCategory =>
  CATEGORIES.includes(cat);

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const selectedProduct = useAppSelector((state) => state.products.selectedProduct);
  const fetchStatus = useAppSelector((state) => state.products.fetchStatus);
  const createStatus = useAppSelector((state) => state.products.createStatus);
  const updateStatus = useAppSelector((state) => state.products.updateStatus);
  const message = useAppSelector((state) => state.products.message);
  const error = useAppSelector((state) => state.products.error);

  const isEditMode = !!id;
  const isLoading = createStatus === 'loading' || updateStatus === 'loading';

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'Electronics',
    image: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(clearProductMessage());
    };
  }, [dispatch, id, isEditMode]);

  // ✅ FIXED ERROR HERE
  useEffect(() => {
    if (selectedProduct && isEditMode) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        category: isValidCategory(selectedProduct.category)
          ? selectedProduct.category
          : 'Electronics', // fallback if "A" or invalid
        image: selectedProduct.image ?? '',
      });
    }
  }, [selectedProduct, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'stock'
          ? Number(value)
          : name === 'category'
          ? (value as ProductCategory) // ✅ safe cast for dropdown
          : value,
    }));

    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData, {
      name: { required: true, minLength: 3, maxLength: 100 },
      description: { required: true, minLength: 10, maxLength: 500 },
      price: { ...commonRules.positiveNumber, min: 0.01 },
      stock: { ...commonRules.positiveNumber, min: 0 },
      category: commonRules.required,
      image: { url: true, required: true },
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const now = new Date().toISOString();

      if (isEditMode && id) {
        await dispatch(
          updateProduct({
            id,
            data: {
              ...formData,
              updatedAt: now,
            },
          })
        ).unwrap();
      } else {
        const newProduct: Omit<Product, 'id'> = {
          ...formData,
          createdAt: now,
          updatedAt: now,
          avatar: '',
          avatarUrl: '',
        } as unknown as Omit<Product, 'id'>;

        await dispatch(createProduct(newProduct)).unwrap();
      }

      navigate('/products');
    } catch {
      // handled by redux
    }
  };

  if (fetchStatus === 'loading' && isEditMode) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Products', href: '/products' },
          { label: isEditMode ? 'Edit Product' : 'New Product' }
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

            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              error={errors.category}
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              required
            />

            <Input
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              required
            />

            <Input
              label="Stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock}
              required
            />

            <Input
              label="Image URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
              error={errors.image}
              required
            />

            <div className="flex justify-end gap-3">
              <Button type="button" onClick={() => navigate('/products')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>

          </form>
        </Widget>
      </div>
    </div>
  );
}