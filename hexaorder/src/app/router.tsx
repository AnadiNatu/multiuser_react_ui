import { JSX, lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouteObject,
} from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { authService } from '../features/auth/authService';

// Lazy load all pages
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ProductList = lazy(() => import('../pages/ProductList'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const ProductForm = lazy(() => import('../pages/ProductForm'));
const OrderList = lazy(() => import('../pages/OrderList'));
const Profile = lazy(() => import('../pages/Profile'));

// Route loader for authentication check
const authLoader = () => {
  if (authService.hasActiveSession()) {
    return redirect('/dashboard');
  }
  return null;
};

// Route loader for protected routes
const protectedLoader = () => {
  if (!authService.hasActiveSession()) {
    return redirect('/login');
  }
  return null;
};

const redirect = (path: string) => {
  return Response.redirect(path);
};

// Wrapper for lazy loaded pages with suspense
const renderLazyPage = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: renderLazyPage(Login),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: renderLazyPage(Dashboard),
      },
      {
        path: '/products',
        element: renderLazyPage(ProductList),
      },
      {
        path: '/products/new',
        element: renderLazyPage(ProductForm),
      },
      {
        path: '/products/:id',
        element: renderLazyPage(ProductDetail),
      },
      {
        path: '/products/:id/edit',
        element: renderLazyPage(ProductForm),
      },
      {
        path: '/orders',
        element: renderLazyPage(OrderList),
      },
      {
        path: '/profile',
        element: renderLazyPage(Profile),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];

export const router = createBrowserRouter(routes);