import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  fetchProducts, 
  deleteProduct,
  clearProductMessage 
} from '../features/products/productsSlice';
import { Widget } from '../components/ui/Widget';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  Package as PackageIcon,
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function ProductList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const products = useAppSelector((state) => state.products.items);
  const loading = useAppSelector((state) => state.products.fetchStatus === 'loading');
  const deleteStatus = useAppSelector((state) => state.products.deleteStatus);
  const message = useAppSelector((state) => state.products.message);
  const error = useAppSelector((state) => state.products.error);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        dispatch(clearProductMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handleDelete = async (id: string) => {
    await dispatch(deleteProduct(id)).unwrap();
    setDeleteConfirm(null);
  };

  if (loading && products.length === 0) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Products' }]} />
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Products' }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">
            {isAdmin ? 'Manage your inventory and product listings.' : 'Browse our collection of premium products.'}
          </p>
        </div>
        {isAdmin && (
          <Button 
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/products/new')}
          >
            Add Product
          </Button>
        )}
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

      <Widget noPadding>
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              containerClassName="flex-1"
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categories.map(cat => ({ value: cat, label: cat }))}
              containerClassName="w-full md:w-48"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<PackageIcon className="w-12 h-12" />}
            title="No products found"
            description="Try adjusting your search or filters."
            action={
              isAdmin
                ? {
                    label: 'Add Product',
                    onClick: () => navigate('/products/new'),
                    icon: <Plus className="w-4 h-4" />,
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}>
                      {product.stock} in stock
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 truncate flex-1">{product.name}</h3>
                    <span className="text-lg font-bold text-brand-green ml-2">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2"
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2 text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(product.id)}
                            isLoading={deleteStatus === 'loading'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}