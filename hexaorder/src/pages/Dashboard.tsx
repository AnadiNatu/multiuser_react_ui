import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProducts } from '../features/products/productsSlice';
import { fetchOrders } from '../features/orders/ordersSlice';
import { productsService } from '../features/products/productsService';
import { apiService } from '../services/apiService';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SkeletonCard } from '../components/ui/LoadingSpinner';
import { OrdersChart } from '../components/charts/OrdersChart';
import { RevenueChart } from '../components/charts/RevenueChart';
import {
  DollarSign,
  ShoppingBag,
  Layers,
  Activity,
  Database,
  Clock,
  TrendingUp,
  Package as PackageIcon,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { formatCurrency, cn } from '../utils/helpers';
import { Product } from '../types';

export default function Dashboard() {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const user     = useAppSelector((s) => s.auth.user);
  const products = useAppSelector((s) => s.products.items);
  const orders   = useAppSelector((s) => s.orders.items);
  const statistics = useAppSelector((s) => s.products.statistics);
  const productsLoading = useAppSelector((s) => s.products.fetchStatus === 'loading');
  const ordersLoading   = useAppSelector((s) => s.orders.fetchStatus === 'loading');

  const rawRole  = user?.rawRole || '';
  const isAdmin  = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'].includes(rawRole);
  const isAt1    = rawRole === 'ADMIN_TYPE1';
  const isUt1    = rawRole === 'USER_TYPE1';

  // ── Dashboard greeting from backend ──────────────────────────────────
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    const roleSlug = rawRole.toLowerCase().replace('_', '-');
    const endpoint = user?.userType === 'TYPE1'
      ? `/type1/${roleSlug}/dashboard`
      : `/type2/${roleSlug}/dashboard`;

    apiService
      .get<{ fullName?: string; message?: string }>(endpoint)
      .then((res) => {
        if (res.fullName) setFullName(res.fullName);
      })
      .catch(() => {}); // Silently ignore if endpoint not yet available
  }, [rawRole, user?.userType]);

  // ── Low stock data (ADMIN_TYPE1) ──────────────────────────────────────
  const [lowStock, setLowStock] = useState<Product[]>([]);
  useEffect(() => {
    if (!isAt1) return;
    productsService.getLowStockProducts(10).then(setLowStock).catch(() => {});
  }, [isAt1]);

  // ── Featured products (USER_TYPE1) ────────────────────────────────────
  const [featured, setFeatured] = useState<Product[]>([]);
  useEffect(() => {
    if (!isUt1) return;
    productsService.getFeaturedProducts().then(setFeatured).catch(() => {});
  }, [isUt1]);

  // ── Initial data fetch ────────────────────────────────────────────────
  useEffect(() => {
    if (products.length === 0) dispatch(fetchProducts());
    if (orders.length === 0)   dispatch(fetchOrders());
  }, [dispatch]);

  // ── Stats ─────────────────────────────────────────────────────────────
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders   = orders.filter((o) => o.status === 'PENDING').length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

  const adminStats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-500',
      trend: '+12.5%',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: `${pendingOrders} pending`,
    },
    {
      label: statistics ? `${statistics.totalProducts} Products` : `${products.length} Products`,
      value: statistics?.activeProducts ?? products.length,
      icon: Layers,
      color: 'bg-amber-500',
      trend: statistics ? `${statistics.inactive} inactive` : 'All categories',
    },
    {
      label: 'Completed Orders',
      value: completedOrders,
      icon: Activity,
      color: 'bg-indigo-500',
      trend: orders.length
        ? `${Math.round((completedOrders / orders.length) * 100)}% rate`
        : '0%',
    },
  ];

  const userOrders = orders.filter(
    (o) => o.userId === user?.id || o.userId === user?.email
  );

  const userStats = [
    {
      label: 'My Orders',
      value: userOrders.length,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: `${userOrders.filter((o) => o.status === 'PENDING').length} pending`,
    },
    {
      label: 'Total Spent',
      value: formatCurrency(
        userOrders.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + o.totalAmount, 0)
      ),
      icon: DollarSign,
      color: 'bg-emerald-500',
      trend: 'All time',
    },
    {
      label: 'Products',
      value: products.length,
      icon: PackageIcon,
      color: 'bg-amber-500',
      trend: 'Browse catalog',
    },
  ];

  const displayStats = isAdmin ? adminStats : userStats;
  const isLoading = productsLoading && ordersLoading;

  if (isLoading && products.length === 0 && orders.length === 0) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const displayName = fullName || user?.name || user?.email || 'User';

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          {isAdmin ? 'System Overview' : `Welcome back, ${displayName}!`}
        </h1>
        <p className="text-slate-500">
          {isAdmin
            ? "Here's what's happening today."
            : "Here's a summary of your recent activity."}
        </p>
      </header>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <div
            key={stat.label}
            className="opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Widget className="relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                  <div className="flex items-center mt-2 text-xs font-medium text-emerald-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </div>
                </div>
                <div className={cn('p-3 rounded-xl text-white shadow-lg', stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className="w-24 h-24" />
              </div>
            </Widget>
          </div>
        ))}
      </div>

      {/* ── Main content area ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAdmin ? (
          <>
            {/* System health */}
            <Widget title="System Health" className="lg:col-span-1" collapsible>
              <div className="space-y-4">
                {[
                  { icon: Activity, label: 'Service Status', value: <Badge variant="success">UP</Badge> },
                  { icon: Database, label: 'Database', value: <Badge variant="success">CONNECTED</Badge> },
                  { icon: Clock, label: 'Uptime', value: <span className="text-sm font-mono text-slate-600">—</span> },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-slate-400 mr-3" />
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                    </div>
                    {value}
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Role</span>
                  <Badge variant="primary">{rawRole}</Badge>
                </div>
              </div>
            </Widget>

            {/* Recent orders */}
            <Widget
              title="Recent Orders"
              subtitle={`${orders.length} total`}
              className="lg:col-span-2"
              collapsible
            >
              {orders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  No orders yet — build the Orders backend to see data here.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/orders')}
                    >
                      <div className="flex-1">
                        <p className="font-mono text-sm font-semibold text-slate-900">{order.id}</p>
                        <p className="text-xs text-slate-500">{order.userName}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-slate-500">{order.items.length} items</p>
                      </div>
                      <Badge
                        variant={
                          order.status === 'COMPLETED'
                            ? 'success'
                            : order.status === 'PENDING'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Widget>
          </>
        ) : (
          <>
            {/* Quick actions */}
            <Widget title="Quick Actions" className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="p-4 bg-gradient-to-br from-brand-green to-green-600 text-white rounded-xl hover:shadow-lg transition-all text-left"
                >
                  <ShoppingBag className="w-6 h-6 mb-2" />
                  <h4 className="font-bold">Browse Products</h4>
                  <p className="text-sm text-green-100">Explore our catalog</p>
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all text-left"
                >
                  <PackageIcon className="w-6 h-6 mb-2" />
                  <h4 className="font-bold">View Orders</h4>
                  <p className="text-sm text-blue-100">Track your purchases</p>
                </button>
              </div>
            </Widget>

            {/* Recent activity */}
            <Widget title="Recent Activity" className="lg:col-span-1">
              {userOrders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {userOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="border-l-2 border-brand-green pl-3 py-1">
                      <p className="font-mono text-xs text-slate-500">{order.id}</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <Badge
                        variant={order.status === 'COMPLETED' ? 'success' : 'warning'}
                        className="mt-1"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Widget>
          </>
        )}
      </div>

      {/* ── Charts (admin only, when orders exist) ─────────────────────── */}
      {isAdmin && orders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Widget title="Orders Trend (7 days)">
            <div style={{ height: 280 }}>
              <OrdersChart orders={orders} days={7} />
            </div>
          </Widget>
          <Widget title="Revenue (7 days)">
            <div style={{ height: 280 }}>
              <RevenueChart orders={orders} days={7} />
            </div>
          </Widget>
        </div>
      )}

      {/* ── Low stock (ADMIN_TYPE1) ──────────────────────────────────────── */}
      {isAt1 && (
        <Widget
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Alert
            </span>
          }
          subtitle={`${lowStock.length} products below 10 units`}
          collapsible
        >
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-400">All products are well-stocked.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg cursor-pointer hover:border-amber-300 transition-colors"
                >
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center">
                      <PackageIcon className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-amber-600 font-medium">{p.stock} left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Widget>
      )}

      {/* ── Featured products (USER_TYPE1) ──────────────────────────────── */}
      {isUt1 && featured.length > 0 && (
        <Widget
          title={
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Featured Products
            </span>
          }
          subtitle="High availability picks"
          collapsible
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                    <PackageIcon className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm text-slate-900 truncate">{p.name}</p>
                  <p className="text-brand-green font-bold text-sm">{formatCurrency(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </Widget>
      )}
    </div>
  );
}
