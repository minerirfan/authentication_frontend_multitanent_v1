import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useAuthPermissions } from '../../infrastructure/hooks/use-auth-permissions.hook';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuthStore();
  const { isAdmin } = useAuthPermissions();
  
  if (!isAdmin()) {
    // Regular users should be redirected to their profile
    return <Navigate to={`/profile/${user?.id}`} replace />;
  }
  
  return <>{children}</>;
}

