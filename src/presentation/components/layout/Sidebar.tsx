import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../../shared/utils/cn';
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Building2,
  BookOpen,
  Menu,
  X,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../../infrastructure/storage/tenant-store';
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.use-case';
import { AuthRepository } from '../../../infrastructure/api/auth.repository';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Sheet, SheetContent } from '../ui/sheet';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (open: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedTenant, clearSelectedTenant } = useTenantStore();
  const authRepository = new AuthRepository();
  const logoutUseCase = new LogoutUseCase(authRepository);

  const isSuperAdmin = user?.roles?.includes('super_admin') || false;
  const isAdmin = isSuperAdmin || user?.roles?.includes('admin') || false;

  const handleLogout = async () => {
    await logoutUseCase.execute();
    clearSelectedTenant();
    navigate('/login');
  };

  let navItems: NavItem[] = [];

  if (isSuperAdmin) {
    if (!selectedTenant) {
      navItems = [
        {
          title: 'Tenants',
          href: '/tenants',
          icon: Building2,
        },
      ];
    } else {
      navItems = [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Users',
          href: '/users',
          icon: Users,
        },
        {
          title: 'Roles',
          href: '/roles',
          icon: Shield,
        },
        {
          title: 'Permissions',
          href: '/permissions',
          icon: Key,
        },
        {
          title: 'Tenants',
          href: '/tenants',
          icon: Building2,
        },
        {
          title: 'API Docs',
          href: '/api-docs',
          icon: BookOpen,
        },
      ];
    }
  } else if (isAdmin) {
    // Tenant admin can manage users, roles, and permissions
    navItems = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Users',
        href: '/users',
        icon: Users,
      },
      {
        title: 'Roles',
        href: '/roles',
        icon: Shield,
      },
      {
        title: 'Permissions',
        href: '/permissions',
        icon: Key,
      },
      {
        title: 'Profile',
        href: `/profile/${user?.id}`,
        icon: User,
      },
      {
        title: 'API Docs',
        href: '/api-docs',
        icon: BookOpen,
      },
    ];
  } else {
    // Regular users can only see profile
    navItems = [
      {
        title: 'Profile',
        href: `/profile/${user?.id}`,
        icon: User,
      },
    ];
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link
          to={isAdmin ? "/dashboard" : `/profile/${user?.id}`}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">UMS</span>
        </Link>
        {setMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen?.(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
              {item.badge && (
                <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {isSuperAdmin && selectedTenant && (
          <div className="mb-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                  {selectedTenant.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {selectedTenant.slug}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => {
                  clearSelectedTenant();
                  navigate('/tenants');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {isSuperAdmin ? 'Super Admin' : user?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <ThemeToggle />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full w-64 flex-col bg-sidebar">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

