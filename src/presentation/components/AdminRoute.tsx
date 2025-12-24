import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.roles?.includes('super_admin') || false;
  const isAdmin = isSuperAdmin || user?.roles?.includes('admin') || false;

  if (!isAdmin) {
    // Regular users should be redirected to their profile
    return <Navigate to={`/profile/${user?.id}`} replace />;
  }

  return <>{children}</>;
}

