import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Search, Bell } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { SidebarTrigger } from './Sidebar';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  roles: 'Roles',
  permissions: 'Permissions',
  tenants: 'Tenants',
  'api-docs': 'API Documentation',
};

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/dashboard' }];

  paths.forEach((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
    breadcrumbs.push({ label, href: index < paths.length - 1 ? href : undefined });
  });

  return breadcrumbs;
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger onClick={onMenuClick} />
        <Separator orientation="vertical" className="h-6" />

        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 pl-9 h-9"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

