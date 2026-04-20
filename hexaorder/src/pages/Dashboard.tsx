import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProducts } from '../features/products/productsSlice';
import { fetchOrders } from '../features/orders/ordersSlice';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { LoadingSpinner, SkeletonCard } from '../components/ui/LoadingSpinner';
import { 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  Users, 
  Activity, 
  Database, 
  Clock,
  TrendingUp,
  Package as PackageIcon
} from 'lucide-react';
import { formatCurrency, cn } from '../utils/helpers';
import { motion } from 'motion/react';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const products = useAppSelector((state) => state.products.items);
  const orders = useAppSelector((state) => state.orders.items);
  const productsLoading = useAppSelector((state) => state.products.fetchStatus === 'loading');
  const ordersLoading = useAppSelector((state) => state.orders.fetchStatus === 'loading');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, products.length, orders.length]);

  // Calculate stats from real data
  const stats = {
    totalRevenue: orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    activeUsers: isAdmin ? 89 : 0,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
  };

  const adminStats = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'bg-emerald-500',
      trend: '+12.5%'
    },
    { 
      label: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingBag, 
      color: 'bg-blue-500',
      trend: `${stats.pendingOrders} pending`
    },
    { 
      label: 'Total Products', 
      value: stats.totalProducts, 
      icon: Layers, 
      color: 'bg-amber-500',
      trend: 'All categories'
    },
    { 
      label: 'Completed Orders', 
      value: stats.completedOrders, 
      icon: Users, 
      color: 'bg-indigo-500',
      trend: `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}% rate`
    },
  ];

  const userOrders = orders.filter(o => o.userId === user?.id);
  const userStats = [
    { 
      label: 'My Orders', 
      value: userOrders.length, 
      icon: ShoppingBag, 
      color: 'bg-blue-500',
      trend: `${userOrders.filter(o => o.status === 'PENDING').length} pending`
    },
    { 
      label: 'Total Spent', 
      value: formatCurrency(
        userOrders
          .filter(o => o.status === 'COMPLETED')
          .reduce((sum, o) => sum + o.totalAmount, 0)
      ), 
      icon: DollarSign, 
      color: 'bg-emerald-500',
      trend: 'All time'
    },
    { 
      label: 'Products Available', 
      value: products.length, 
      icon: PackageIcon, 
      color: 'bg-amber-500',
      trend: 'Browse catalog'
    },
  ];

  const displayStats = isAdmin ? adminStats : userStats;

  if (productsLoading && ordersLoading) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />

      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          {isAdmin ? 'System Overview' : `Welcome back, ${user?.name}!`}
        </h1>
        <p className="text-slate-500">
          {isAdmin ? "Here's what's happening today." : "Here's a summary of your recent activity."}
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
                <div className={cn("p-3 rounded-xl text-white shadow-lg", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className="w-24 h-24" />
              </div>
            </Widget>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {isAdmin ? (
          <>
            {/* System Health Widget */}
            <Widget title="System Health" className="lg:col-span-1" collapsible>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-slate-400 mr-3" />
                    <span className="text-sm font-medium text-slate-700">Service Status</span>
                  </div>
                  <Badge variant="success">UP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-slate-400 mr-3" />
                    <span className="text-sm font-medium text-slate-700">Database</span>
                  </div>
                  <Badge variant="success">CONNECTED</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-slate-400 mr-3" />
                    <span className="text-sm font-medium text-slate-700">Uptime</span>
                  </div>
                  <span className="text-sm font-mono text-slate-600">15d 4h 22m</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Version</span>
                  <span className="text-xs font-mono text-slate-500">1.2.4-STABLE</span>
                </div>
              </div>
            </Widget>

            {/* Recent Orders Widget */}
            <Widget 
              title="Recent Orders" 
              subtitle={`${stats.totalOrders} total orders`}
              className="lg:col-span-2"
              collapsible
            >
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-slate-900">{order.id}</p>
                      <p className="text-xs text-slate-500">{order.userName}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-slate-500">{order.items.length} items</p>
                    </div>
                    <Badge variant={
                      order.status === 'COMPLETED' ? 'success' : 
                      order.status === 'PENDING' ? 'warning' : 'error'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Widget>
          </>
        ) : (
          <>
            {/* User Quick Actions */}
            <Widget title="Quick Actions" className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="p-4 bg-gradient-to-br from-brand-green to-green-600 text-white rounded-xl hover:shadow-lg transition-all text-left">
                  <ShoppingBag className="w-6 h-6 mb-2" />
                  <h4 className="font-bold">Browse Products</h4>
                  <p className="text-sm text-green-100">Explore our catalog</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all text-left">
                  <PackageIcon className="w-6 h-6 mb-2" />
                  <h4 className="font-bold">View Orders</h4>
                  <p className="text-sm text-blue-100">Track your purchases</p>
                </button>
              </div>
            </Widget>

            {/* User Recent Activity */}
            <Widget title="Recent Activity" className="lg:col-span-1">
              <div className="space-y-3">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="border-l-2 border-brand-green pl-3 py-2">
                    <p className="font-mono text-xs text-slate-500">{order.id}</p>
                    <p className="text-sm font-medium text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <Badge variant={order.status === 'COMPLETED' ? 'success' : 'warning'} className="mt-1">
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Widget>
          </>
        )}
      </div>
    </div>
  );
}