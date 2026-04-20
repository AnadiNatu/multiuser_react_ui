import { Order } from '../../types';
import { MOCK_ORDERS } from '../../services/mockData';

const ORDERS_STORAGE_KEY = 'hexaorder.orders';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sortOrders = (orders: Order[]) =>
  [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const readStoredOrders = (): Order[] => {
  if (typeof window === 'undefined') {
    return MOCK_ORDERS;
  }

  const rawValue = localStorage.getItem(ORDERS_STORAGE_KEY);

  if (!rawValue) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(MOCK_ORDERS));
    return MOCK_ORDERS;
  }

  try {
    return sortOrders(JSON.parse(rawValue) as Order[]);
  } catch {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(MOCK_ORDERS));
    return MOCK_ORDERS;
  }
};

const persistOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(sortOrders(orders)));
};

export const ordersService = {
  getOrders: async (): Promise<Order[]> => {
    await delay(500);
    return readStoredOrders();
  },

  createOrder: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    await delay(1000);

    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const orders = [newOrder, ...readStoredOrders()];
    persistOrders(orders);

    return newOrder;
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    await delay(800);

    const orders = readStoredOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) throw new Error('Order not found');

    const updatedOrder = { ...orders[index], status };
    orders[index] = updatedOrder;
    persistOrders(orders);

    return updatedOrder;
  },
};