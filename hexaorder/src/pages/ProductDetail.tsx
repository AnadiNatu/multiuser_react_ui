import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProductById, clearSelectedProduct } from '../features/products/productsSlice';
import { Button } from '../components/ui/Button';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Edit2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const product = useAppSelector((state) => state.products.selectedProduct);
  const loading = useAppSelector((state) => state.products.fetchStatus === 'loading');
  const user = useAppSelector((state) => state.auth.user);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

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
        items={[
          { label: 'Products', href: '/products' },
          { label: product.name }
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
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => navigate(`/products/${id}/edit`)}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit Product
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <Widget noPadding className="overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-auto object-cover"
            referrerPolicy="no-referrer"
          />
        </Widget>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <Badge variant="info" className="mb-4 uppercase tracking-widest">
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-brand-green">
                {formatCurrency(product.price)}
              </span>
              <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          <Widget>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Description</h3>
            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </Widget>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-white rounded-xl border border-slate-100">
              <ShieldCheck className="w-6 h-6 text-brand-green mr-3 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-slate-900">Warranty</p>
                <p className="text-slate-500">2 Years Limited</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white rounded-xl border border-slate-100">
              <Truck className="w-6 h-6 text-brand-green mr-3 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-slate-900">Shipping</p>
                <p className="text-slate-500">Free Worldwide</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white rounded-xl border border-slate-100">
              <RefreshCcw className="w-6 h-6 text-brand-green mr-3 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-slate-900">Returns</p>
                <p className="text-slate-500">30 Day Policy</p>
              </div>
            </div>
          </div>

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
                Add to Wishlist
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}