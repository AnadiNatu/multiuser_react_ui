/**
 * Core type definitions for the HexaOrder application
 */

// ==================== User Types ====================
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl : string;
  avatar : string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// ==================== Product Types ====================
export type ProductCategory = 
  | 'Electronics' 
  | 'Clothing' 
  | 'Accessories'
  | 'Food' 
  | 'Furniture'
  | 'Books' 
  | 'Toys' 
  | 'Sports' 
  | 'Home' 
  | 'Other';

export interface Product {
  id: string;
  name: string;
  description: string;
  category?: ProductCategory | 'A';
  price: number;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  image?: string;
}

export interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  fetchStatus: 'idle' | 'loading' | 'success' | 'failed';
  createStatus: 'idle' | 'loading' | 'success' | 'failed';
  updateStatus: 'idle' | 'loading' | 'success' | 'failed';
  deleteStatus: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
}

// ==================== Order Types ====================
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  fetchStatus: 'idle' | 'loading' | 'success' | 'failed';
  createStatus: 'idle' | 'loading' | 'success' | 'failed';
  updateStatus: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
}

// ==================== UI Types ====================
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface UiState {
  sidebarOpen: boolean;
  toasts: Toast[];
  theme: 'light' | 'dark';
}

// ==================== Dashboard Types ====================
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface OrdersData {
  date: string;
  orders: number;
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ==================== Form Types ====================
export interface FormField {
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ==================== Table Types ====================
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: any;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

// ==================== Chart Types ====================
export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  colors?: string[];
  height?: number;
}