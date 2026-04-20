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
import { Product } from '../types';

type ProductFormData = Omit<Product, 'id'>;

const CATEGORIES = ['Electronics', 'Accessories', 'Furniture', 'Office Supplies'];

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

  useEffect(() => {
    if (selectedProduct && isEditMode) {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        stock: selectedProduct.stock,
        category: selectedProduct.category,
        image: selectedProduct.image,
      });
    }
  }, [selectedProduct, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData, {
      name: { ...commonRules.required, minLength: 3, maxLength: 100 },
      description: { ...commonRules.required, minLength: 10, maxLength: 500 },
      price: { ...commonRules.positiveNumber, min: 0.01 },
      stock: { ...commonRules.positiveNumber, min: 0 },
      category: commonRules.required,
      image: { ...commonRules.url, required: true },
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      if (isEditMode && id) {
        await dispatch(updateProduct({ id, data: formData })).unwrap();
      } else {
        await dispatch(createProduct(formData)).unwrap();
      }
      navigate('/products');
    } catch (err) {
      // Error handled by Redux
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
          <p className="text-slate-500">
            {isEditMode ? 'Update product information' : 'Add a new product to your inventory'}
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
                error={errors.category}
                options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
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
                label="Price"
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
                placeholder="45"
              />
            </div>

            <Input
              label="Image URL"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              error={errors.image}
              required
              placeholder="https://example.com/image.jpg"
              helperText="Provide a valid image URL"
            />

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