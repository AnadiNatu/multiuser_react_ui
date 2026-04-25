import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchProductById,
  clearSelectedProduct,
  updateProductStock,
  toggleProductActive,
} from '../features/products/productsSlice';
import { Button } from '../components/ui/Button';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Edit2,
  Package as PackageIcon,
  ToggleLeft,
  ToggleRight,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const { success, error: toastError } = useToast();

  const product     = useAppSelector((s) => s.products.selectedProduct);
  const loading     = useAppSelector((s) => s.products.fetchStatus === 'loading');
  const updateStatus = useAppSelector((s) => s.products.updateStatus);
  const user        = useAppSelector((s) => s.auth.user);

  const rawRole      = user?.rawRole || '';
  const isAdmin      = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);
  const isAdminType1 = rawRole === 'ADMIN_TYPE1';
  const isAdminType2 = rawRole === 'ADMIN_TYPE2';

  // Stock update modal
  const [stockModal, setStockModal] = useState(false);
  const [newStock, setNewStock]     = useState('');
  const [stockError, setStockError] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
    return () => { dispatch(clearSelectedProduct()); };
  }, [dispatch, id]);

  const handleStockUpdate = async () => {
    const qty = parseInt(newStock, 10);
    if (isNaN(qty) || qty < 0) {
      setStockError('Enter a valid quantity (≥ 0)');
      return;
    }
    try {
      await dispatch(updateProductStock({ id: id!, quantity: qty })).unwrap();
      success('Stock updated successfully!');
      setStockModal(false);
      setNewStock('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update stock');
    }
  };

  const handleToggleActive = async () => {
    try {
      await dispatch(toggleProductActive(id!)).unwrap();
      success('Product status updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to toggle status');
    }
  };

  if (loading) return <PageLoader />;

  if (!product) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: 'Not Found' }]} />
        <EmptyState
          title="Product not found"
          description="The product you're looking for doesn't exist."
          action={{
            label: 'Back to Products',
            onClick: () => navigate('/products'),
            icon: <ArrowLeft className="w-4 h-4" />,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[{ label: 'Products', href: '/products' }, { label: product.name }]}
      />

      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => navigate(`/products/${id}/edit`)}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit
          </Button>
        )}

        {/* ADMIN_TYPE1: update stock */}
        {isAdminType1 && (
          <Button
            variant="secondary"
            leftIcon={<Layers className="w-4 h-4" />}
            onClick={() => {
              setNewStock(String(product.stock));
              setStockError('');
              setStockModal(true);
            }}
          >
            Update Stock
          </Button>
        )}

        {/* ADMIN_TYPE2: toggle active */}
        {isAdminType2 && (
          <Button
            variant={product.isActive ? 'outline' : 'primary'}
            leftIcon={
              product.isActive ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )
            }
            onClick={handleToggleActive}
            isLoading={updateStatus === 'loading'}
          >
            {product.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <Widget noPadding className="overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-slate-100 text-slate-300">
              <PackageIcon className="w-24 h-24" />
            </div>
          )}
        </Widget>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Badge variant="info" className="uppercase tracking-widest">
                {product.category}
              </Badge>
              {isAdminType2 && (
                <Badge variant={product.isActive ? 'success' : 'default'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <span className="text-3xl font-bold text-brand-green">
                {formatCurrency(product.price)}
              </span>
              <Badge
                variant={
                  product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'
                }
              >
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          <Widget>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Description</h3>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </Widget>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'Warranty', sub: '2 Years Limited' },
              { icon: Truck, title: 'Shipping', sub: 'Free Worldwide' },
              { icon: RefreshCcw, title: 'Returns', sub: '30 Day Policy' },
            ].map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center p-4 bg-white rounded-xl border border-slate-100"
              >
                <Icon className="w-6 h-6 text-brand-green mr-3 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{title}</p>
                  <p className="text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add to cart — regular users only */}
          {!isAdmin && (
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1"
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button size="lg" variant="outline">
                Wishlist
              </Button>
            </div>
          )}

          {/* Admin meta */}
          {isAdmin && product.createdBy && (
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1">
              <p>Created by: {product.createdBy}</p>
              {product.updatedBy && <p>Last updated by: {product.updatedBy}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Stock update modal */}
      <Modal
        isOpen={stockModal}
        onClose={() => setStockModal(false)}
        title="Update Stock Quantity"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStockModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockUpdate} isLoading={updateStatus === 'loading'}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {stockError && <Alert variant="error">{stockError}</Alert>}
          <p className="text-sm text-slate-600">
            Current stock: <strong>{product.stock}</strong>
          </p>
          <Input
            label="New Quantity"
            type="number"
            min="0"
            value={newStock}
            onChange={(e) => {
              setNewStock(e.target.value);
              setStockError('');
            }}
            leftIcon={<Layers className="w-4 h-4" />}
            placeholder="Enter new quantity"
          />
        </div>
      </Modal>
    </div>
  );
}
