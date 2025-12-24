import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../infrastructure/storage/tenant-store';
import { GetUsersUseCase } from '../../application/use-cases/user/get-users.use-case';
import { GetRolesUseCase } from '../../application/use-cases/role/get-roles.use-case';
import { GetPermissionsUseCase } from '../../application/use-cases/permission/get-permissions.use-case';
import { UserRepository } from '../../infrastructure/api/user.repository';
import { RoleRepository } from '../../infrastructure/api/role.repository';
import { PermissionRepository } from '../../infrastructure/api/permission.repository';
import { apiClient } from '../../infrastructure/api/api-client';
import { PaginatedResult } from '../../shared/types/pagination';
import { extractData } from '../../shared/utils/pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Shield, Key, Building2, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    roles: 0,
    permissions: 0,
    tenants: 0,
  });
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.roles?.includes('super_admin') || false;
  const isAdmin = isSuperAdmin || user?.roles?.includes('admin') || false;

  // Redirect regular users to profile
  useEffect(() => {
    if (!isAdmin && user?.id) {
      navigate(`/profile/${user.id}`, { replace: true });
    }
  }, [isAdmin, user?.id, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [selectedTenant, isAdmin]);

  const loadStats = async () => {
    try {
      const userRepository = new UserRepository();
      const roleRepository = new RoleRepository();
      const permissionRepository = new PermissionRepository();
      const getUsersUseCase = new GetUsersUseCase(userRepository);
      const getRolesUseCase = new GetRolesUseCase(roleRepository);
      const getPermissionsUseCase = new GetPermissionsUseCase(permissionRepository);

      const users = await getUsersUseCase.execute();

      let roles: any[] = [];
      if (isSuperAdmin && !selectedTenant) {
        try {
          const tenantsResponse = await apiClient.get<PaginatedResult<Tenant> | Tenant[]>('/tenants');
          if (tenantsResponse.success && tenantsResponse.results) {
            const tenants = extractData(tenantsResponse.results);
            const allRolesPromises = tenants.map(async (tenant) => {
              try {
                const rolesResponse = await apiClient.get<PaginatedResult<any> | any[]>(`/roles?tenantId=${tenant.id}`);
                if (rolesResponse.success && rolesResponse.results) {
                  return extractData(rolesResponse.results);
                }
                return [];
              } catch (error) {
                console.error(`Failed to load roles for tenant ${tenant.id}:`, error);
                return [];
              }
            });
            const rolesArrays = await Promise.all(allRolesPromises);
            roles = rolesArrays.flat();
          }
        } catch (error) {
          console.error('Failed to load roles for all tenants:', error);
        }
      } else {
        roles = await getRolesUseCase.execute();
      }

      const permissions = await getPermissionsUseCase.execute();

      let tenantsCount = 0;
      if (isSuperAdmin) {
        try {
          const tenantsResponse = await apiClient.get<PaginatedResult<Tenant> | Tenant[]>('/tenants');
          if (tenantsResponse.success && tenantsResponse.results) {
            if (Array.isArray(tenantsResponse.results)) {
              tenantsCount = tenantsResponse.results.length;
            } else {
              const paginatedResult = tenantsResponse.results as PaginatedResult<Tenant>;
              tenantsCount = paginatedResult.total || paginatedResult.data?.length || 0;
            }
          }
        } catch (error) {
          console.error('Failed to load tenants:', error);
        }
      } else {
        tenantsCount = 1;
      }

      setStats({
        users: Array.isArray(users) ? users.length : 0,
        roles: Array.isArray(roles) ? roles.length : 0,
        permissions: Array.isArray(permissions) ? permissions.length : 0,
        tenants: tenantsCount,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Users',
      value: stats.users,
      description: 'Total system users',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      href: '/users',
    },
    {
      title: 'Roles',
      value: stats.roles,
      description: 'Available roles',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      href: '/roles',
    },
    {
      title: 'Permissions',
      value: stats.permissions,
      description: 'System permissions',
      icon: Key,
      color: 'from-orange-500 to-red-500',
      href: '/permissions',
    },
    {
      title: isSuperAdmin ? 'Tenants' : 'Tenant',
      value: isSuperAdmin ? stats.tenants : 1,
      description: isSuperAdmin ? 'Total tenants' : 'Your organization',
      icon: Building2,
      color: 'from-green-500 to-emerald-500',
      href: isSuperAdmin ? '/tenants' : undefined,
    },
  ];

  const chartData = [
    { name: 'Users', value: stats.users },
    { name: 'Roles', value: stats.roles },
    { name: 'Permissions', value: stats.permissions },
    { name: 'Tenants', value: stats.tenants },
  ];

  const barChartData = statCards.map((card) => ({
    name: card.title,
    value: card.value,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold">{user?.firstName}</span>! Here's what's happening.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => stat.href && navigate(stat.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-2.5 text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                {stat.href && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs group-hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(stat.href!);
                    }}
                  >
                    View all
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Distribution Overview</CardTitle>
            <CardDescription>Visual breakdown of system resources</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Resource Comparison</CardTitle>
            <CardDescription>Side-by-side comparison of metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'calc(var(--radius) - 2px)',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start hover:bg-accent transition-colors"
              onClick={() => navigate('/users')}
            >
              <div className="flex-1 text-left">
                <div className="font-semibold mb-1">Create User</div>
                <div className="text-sm text-muted-foreground">Add a new user to your tenant</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 justify-start hover:bg-accent transition-colors"
              onClick={() => navigate('/roles')}
            >
              <div className="flex-1 text-left">
                <div className="font-semibold mb-1">Manage Roles</div>
                <div className="text-sm text-muted-foreground">Configure user roles and permissions</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            {isSuperAdmin && (
              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-accent transition-colors"
                onClick={() => navigate('/tenants')}
              >
                <div className="flex-1 text-left">
                  <div className="font-semibold mb-1">Create Tenant</div>
                  <div className="text-sm text-muted-foreground">Register a new tenant organization</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
