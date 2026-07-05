import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleProtectedRoute({
  allowedRoles,
  redirectTo = '/dashboard',
}: RoleProtectedRouteProps) {
  const user = useAppSelector((state) => state.auth.user);

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not allowed
  if (!allowedRoles.includes(user.rawRole)) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          unauthorized: true,
          attemptedRole: user.rawRole,
        }}
      />
    );
  }

  return <Outlet />;
}