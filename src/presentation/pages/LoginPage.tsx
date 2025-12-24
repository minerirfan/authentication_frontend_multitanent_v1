import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { AuthRepository } from '../../infrastructure/api/auth.repository';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Shield, Mail, Lock, Building2, Loader2 } from 'lucide-react';
import { useToast } from '../../shared/hooks/use-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSlug: '',
  });

  const authRepository = new AuthRepository();
  const loginUseCase = new LoginUseCase(authRepository);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUseCase.execute(formData);
      if (!result || !result.user) {
        throw new Error('Login response is missing user data');
      }

      // Redirect based on user role
      const isSuperAdmin = result.user.roles?.includes('super_admin') || result.user.isSuperAdmin || false;
      const isAdmin = isSuperAdmin || result.user.roles?.includes('admin') || false;

      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate(`/profile/${result.user.id}`);
      }

      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-9"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantSlug">
                  Tenant Slug <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="tenantSlug"
                    value={formData.tenantSlug}
                    onChange={(e) => setFormData({ ...formData, tenantSlug: e.target.value })}
                    className="pl-9"
                    placeholder="your-tenant-slug"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty if you're a super admin
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register Tenant
          </Link>
        </p>
      </div>
    </div>
  );
}
