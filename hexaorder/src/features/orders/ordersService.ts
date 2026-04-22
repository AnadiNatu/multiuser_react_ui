import { API_ENDPOINTS, apiService } from '@/services/apiService';
import { Order } from '../../types';

function mapBackendOrder(o: any): Order {
  return {
    id: String(o.id),
    userId: o.userId || o.email || '',
    userName: o.userName || o.userEmail || '',
    items: (o.items || []).map((item: any) => ({
      id: String(item.id),
      productId: String(item.productId),
      productName: item.productName || '',
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal ?? item.price * item.quantity,
    })),
    totalAmount: typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : o.totalAmount,
    status: o.status as Order['status'],
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt || new Date().toISOString(),
  };
}

export const ordersService = {
  /**
   * Get orders — ADMIN sees all, users see their own
   * Falls back to empty array if backend Order module not built yet
   */
  getOrders: async (rawRole?: string): Promise<Order[]> => {
    const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
    const isAdmin = rawRole && adminRoles.includes(rawRole);
    const endpoint = isAdmin ? API_ENDPOINTS.ORDERS_ADMIN_ALL : API_ENDPOINTS.ORDERS_MY;

    try {
      const json = await apiService.get<any>(endpoint);
      const list: any[] = json.orders || json;
      if (!Array.isArray(list)) return [];
      return list.map(mapBackendOrder);
    } catch (err: any) {
      // If the orders backend module doesn't exist yet, return empty array
      // instead of crashing the whole app
      if (err.message?.includes('404') || err.message?.includes('500')) {
        console.warn('[ordersService] Orders API not yet available:', err.message);
        return [];
      }
      throw err;
    }
  },

  /**
   * Create order
   */
  createOrder: async (
    payload: { items: Array<{ productId: string; quantity: number }> }
  ): Promise<Order> => {
    const json = await apiService.post<any>(API_ENDPOINTS.ORDERS_CREATE, payload);
    return mapBackendOrder(json.order || json);
  },

  /**
   * Update order status (ADMIN)
   */
  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const json = await apiService.put<any>(
      `${API_ENDPOINTS.ORDER_STATUS(id)}?status=${status}`
    );
    return mapBackendOrder(json.order || json);
  },
};