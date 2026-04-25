import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchProducts,
  searchProducts,
  deleteProduct,
  toggleProductActive,
  clearProductMessage,
  setPage,
} from '../features/products/productsSlice';
import { productsService } from '../features/products/productsService';
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
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/ui/Toast';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Package as PackageIcon,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { Product } from '../types';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'asc', label: 'Price: Low → High' },
  { value: 'desc', label: 'Price: High → Low' },
];

export default function ProductList() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const { success, error: toastError } = useToast();

  const user          = useAppSelector((s) => s.auth.user);
  const products      = useAppSelector((s) => s.products.items);
  const loading       = useAppSelector((s) => s.products.fetchStatus === 'loading');
  const deleteStatus  = useAppSelector((s) => s.products.deleteStatus);
  const message       = useAppSelector((s) => s.products.message);
  const storeError    = useAppSelector((s) => s.products.error);
  const pagination    = useAppSelector((s) => s.products.pagination);

  const rawRole = user?.rawRole || '';
  const isAdmin      = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);
  const isAdminType2 = rawRole === 'ADMIN_TYPE2';
  const isUserType2  = rawRole === 'USER_TYPE2';

  // ── Filter state ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder]          = useState('');
  const [minPrice, setMinPrice]            = useState('');
  const [maxPrice, setMaxPrice]            = useState('');
  const [deleteConfirm, setDeleteConfirm]  = useState<string | null>(null);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedMin    = useDebounce(minPrice, 700);
  const debouncedMax    = useDebounce(maxPrice, 700);

  // ── Initial load ──────────────────────────────────────────────────────
  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch]);

  // Toast on message/error
  useEffect(() => {
    if (message) {
      success(message);
      dispatch(clearProductMessage());
    }
    if (storeError) {
      toastError(storeError);
      dispatch(clearProductMessage());
    }
  }, [message, storeError]);

  // ── Search (debounced, API call) ──────────────────────────────────────
  useEffect(() => {
    if (debouncedSearch.trim()) {
      dispatch(searchProducts(debouncedSearch));
    } else if (debouncedSearch === '') {
      dispatch(fetchProducts());
    }
  }, [debouncedSearch, dispatch]);

  // ── Price range filter (USER_TYPE2) ───────────────────────────────────
  const [priceFilteredProducts, setPriceFilteredProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!isUserType2) return;
    const min = parseFloat(debouncedMin);
    const max = parseFloat(debouncedMax);
    if (!isNaN(min) && !isNaN(max) && min >= 0 && max > min) {
      productsService
        .getProductsByPriceRange(min, max)
        .then(setPriceFilteredProducts)
        .catch(() => setPriceFilteredProducts(null));
    } else {
      setPriceFilteredProducts(null);
    }
  }, [debouncedMin, debouncedMax, isUserType2]);

  // ── Sort by price (USER_TYPE2) ─────────────────────────────────────────
  const [sortedProducts, setSortedProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!isUserType2 || !sortOrder) {
      setSortedProducts(null);
      return;
    }
    productsService
      .getProductsSortedByPrice(sortOrder as 'asc' | 'desc')
      .then(setSortedProducts)
      .catch(() => setSortedProducts(null));
  }, [sortOrder, isUserType2]);

  // ── Category filter ───────────────────────────────────────────────────
  const [categoryProducts, setCategoryProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (categoryFilter === 'All') {
      setCategoryProducts(null);
      return;
    }
    productsService
      .getProductsByCategory(categoryFilter, rawRole)
      .then(setCategoryProducts)
      .catch(() => setCategoryProducts(null));
  }, [categoryFilter, rawRole]);

  // ── Derive display list ───────────────────────────────────────────────
  const displayProducts = useMemo(() => {
    // Priority: sort > price range > category > plain search/all
    if (isUserType2 && sortedProducts) return sortedProducts;
    if (isUserType2 && priceFilteredProducts) return priceFilteredProducts;
    if (categoryProducts) return categoryProducts;
    return products;
  }, [products, categoryProducts, priceFilteredProducts, sortedProducts, isUserType2]);

  // ── Pagination (client-side over the current display list) ────────────
  const pageSize = pagination.size;
  const currentPage = pagination.page;
  const totalPages  = Math.ceil(displayProducts.length / pageSize);
  const paginated   = displayProducts.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Unique categories for dropdown
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  // ── Actions ───────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    await dispatch(deleteProduct(id)).unwrap().catch(() => {});
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (id: string) => {
    await dispatch(toggleProductActive(id)).unwrap().catch(() => {});
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (loading && products.length === 0) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Products' }]} />
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Products' }]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">
            {isAdmin
              ? 'Manage your inventory and product listings.'
              : 'Browse our collection of products.'}
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

      <Widget noPadding>
        {/* ── Filter bar ─────────────────────────────────────────────── */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                dispatch(setPage(0));
              }}
              leftIcon={<Search className="w-4 h-4" />}
              containerClassName="flex-1"
            />

            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                dispatch(setPage(0));
              }}
              options={categories.map((c) => ({ value: c ?? 'Other', label: c ?? 'Other' }))}
              containerClassName="w-full md:w-48"
            />

            {/* Sort — USER_TYPE2 only */}
            {isUserType2 && (
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                options={SORT_OPTIONS}
                containerClassName="w-full md:w-52"
              />
            )}

            {/* Price filter toggle — USER_TYPE2 only */}
            {isUserType2 && (
              <Button
                variant={showPriceFilter ? 'secondary' : 'outline'}
                size="sm"
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                onClick={() => setShowPriceFilter((v) => !v)}
              >
                Price Filter
              </Button>
            )}
          </div>

          {/* Price range inputs */}
          {isUserType2 && showPriceFilter && (
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Min ₹"
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                containerClassName="w-36"
              />
              <span className="text-slate-400">—</span>
              <Input
                placeholder="Max ₹"
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                containerClassName="w-36"
              />
              {(minPrice || maxPrice) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Product grid ───────────────────────────────────────────── */}
        {paginated.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {paginated.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden group hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <PackageIcon className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <Badge
                        variant={
                          product.stock > 10
                            ? 'success'
                            : product.stock > 0
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {product.stock} in stock
                      </Badge>
                      {isAdminType2 && (
                        <Badge variant={product.isActive ? 'success' : 'default'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 truncate flex-1">
                        {product.name}
                      </h3>
                      <span className="text-lg font-bold text-brand-green ml-2">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                      {product.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1">
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

                            {/* ADMIN_TYPE2 toggle active */}
                            {isAdminType2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-amber-500 hover:bg-amber-50"
                                onClick={() => handleToggleActive(product.id)}
                              >
                                {product.isActive ? (
                                  <ToggleRight className="w-4 h-4" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </Button>
                            )}

                            {/* ADMIN delete */}
                            {rawRole === 'ADMIN' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-red-500 hover:bg-red-50"
                                onClick={() => setDeleteConfirm(product.id)}
                                isLoading={deleteStatus === 'loading'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing {currentPage * pageSize + 1}–
                  {Math.min((currentPage + 1) * pageSize, displayProducts.length)} of{' '}
                  {displayProducts.length} products
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(setPage(currentPage - 1))}
                    disabled={currentPage === 0}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Prev
                  </Button>
                  <span className="text-sm font-medium text-slate-700 px-2">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(setPage(currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
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
