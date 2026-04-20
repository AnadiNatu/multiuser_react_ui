import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchOrders } from '../features/orders/ordersSlice';
import { Widget } from '../components/ui/Widget';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Table } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/helpers';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Order } from '../types';

export default function OrderList() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const orders = useAppSelector((state) => state.orders.items);
  const loading = useAppSelector((state) => state.orders.fetchStatus === 'loading');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (orders.length === 0) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length]);

  const filteredOrders = useMemo(() => {
    if (isAdmin) return orders;
    return orders.filter(o => o.userId === user?.id);
  }, [orders, isAdmin, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': 
        return <Badge variant="success" leftIcon={<CheckCircle className="w-3 h-3" />}>Completed</Badge>;
      case 'PENDING': 
        return <Badge variant="warning" leftIcon={<Clock className="w-3 h-3" />}>Pending</Badge>;
      case 'CANCELLED': 
        return <Badge variant="error" leftIcon={<XCircle className="w-3 h-3" />}>Cancelled</Badge>;
      default: 
        return <Badge>{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Order ID',
      render: (order: Order) => (
        <span className="font-mono text-sm font-medium text-slate-900">{order.id}</span>
      ),
      sortable: true,
    },
    ...(isAdmin ? [{
      key: 'userName',
      header: 'Customer',
      sortable: true,
    }] : []),
    {
      key: 'createdAt',
      header: 'Date',
      render: (order: Order) => (
        <span className="text-sm text-slate-600">{formatDate(order.createdAt)}</span>
      ),
      sortable: true,
    },
    {
      key: 'items',
      header: 'Items',
      render: (order: Order) => (
        <div className="flex flex-col">
          {order.items.map((item, idx) => (
            <span key={idx} className="text-sm text-slate-600 truncate max-w-[200px]">
              {item.quantity}x {item.productName}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (order: Order) => (
        <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
      ),
      sortable: true,
      className: 'text-right',
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => getStatusBadge(order.status),
      sortable: true,
    },
  ];

  if (loading && orders.length === 0) {
    return (
      <div>
        <Breadcrumb items={[{ label: 'Orders' }]} />
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Orders' }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isAdmin ? 'All Orders' : 'My Orders'}
        </h1>
        <p className="text-slate-500">
          {isAdmin ? 'Track and manage customer orders.' : 'View your order history and status.'}
        </p>
      </div>

      <Widget 
        title={`${filteredOrders.length} Total Orders`}
        noPadding
      >
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-12 h-12" />}
            title="No orders yet"
            description={
              isAdmin 
                ? 'When customers place orders, they will appear here.' 
                : "You haven't placed any orders yet."
            }
          />
        ) : (
          <Table
            data={filteredOrders}
            columns={columns}
            keyExtractor={(order) => order.id}
            hoverable
            striped
          />
        )}
      </Widget>
    </div>
  );
}