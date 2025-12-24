import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './infrastructure/storage/auth-store';
import { useTenantStore } from './infrastructure/storage/tenant-store';
import { ThemeProvider } from './shared/contexts/theme-context';
import { Toaster } from './presentation/components/ui/toaster';
import OnboardPage from './presentation/pages/OnboardPage';
import RegisterPage from './presentation/pages/RegisterPage';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';
import UsersPage from './presentation/pages/UsersPage';
import UserProfilePage from './presentation/pages/UserProfilePage';
import RolesPage from './presentation/pages/RolesPage';
import PermissionsPage from './presentation/pages/PermissionsPage';
import TenantsPage from './presentation/pages/TenantsPage';
import ApiDocsPage from './presentation/pages/ApiDocsPage';
import Layout from './presentation/layouts/Layout';
import ProtectedRoute from './presentation/components/ProtectedRoute';
import AdminRoute from './presentation/components/AdminRoute';

function DefaultRedirect() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const isSuperAdmin = user?.roles?.includes('super_admin') || false;
  const isAdmin = isSuperAdmin || user?.roles?.includes('admin') || false;

  if (isSuperAdmin) {
    // Super admin: redirect to tenants if no tenant selected, otherwise dashboard
    return <Navigate to={selectedTenant ? "/dashboard" : "/tenants"} replace />;
  }
  
  if (isAdmin) {
    // Tenant admin: redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // Regular users: redirect to profile
  return <Navigate to={`/profile/${user?.id}`} replace />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ums-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/onboard" element={<OnboardPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
          <Route index element={<DefaultRedirect />} />
          <Route 
            path="dashboard" 
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            } 
          />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId/profile" element={<UserProfilePage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          <Route path="roles" element={<RolesPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="api-docs" element={<ApiDocsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

