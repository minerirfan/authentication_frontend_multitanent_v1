import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../infrastructure/storage/tenant-store';
import { GetRolesUseCase } from '../../application/use-cases/role/get-roles.use-case';
import { CreateRoleUseCase } from '../../application/use-cases/role/create-role.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/role/update-role.use-case';
import { GetRoleUseCase } from '../../application/use-cases/role/get-role.use-case';
import { RoleRepository } from '../../infrastructure/api/role.repository';
import { PermissionRepository } from '../../infrastructure/api/permission.repository';
import { GetPermissionsUseCase } from '../../application/use-cases/permission/get-permissions.use-case';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { Role, Permission } from '../../shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Shield, Plus, Pencil, Key, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../shared/hooks/use-toast';
import { Skeleton } from '../components/ui/skeleton';

export default function RolesPage() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const { toast } = useToast();
  const isSuperAdmin = user?.roles?.includes('super_admin') || false;
  const isAdmin = isSuperAdmin || user?.roles?.includes('admin') || false;

  if (isSuperAdmin && !selectedTenant) {
    return <Navigate to="/tenants" replace />;
  }

  // Regular users (non-admin) should not access this page
  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  const roleRepository = new RoleRepository();
  const permissionRepository = new PermissionRepository();
  const getRolesUseCase = new GetRolesUseCase(roleRepository);
  const getRoleUseCase = new GetRoleUseCase(roleRepository);
  const createRoleUseCase = new CreateRoleUseCase(roleRepository);
  const updateRoleUseCase = new UpdateRoleUseCase(roleRepository);
  const getPermissionsUseCase = new GetPermissionsUseCase(permissionRepository);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        getRolesUseCase.execute(),
        getPermissionsUseCase.execute(),
      ]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoleUseCase.execute(formData);
      setShowCreateForm(false);
      setFormData({ name: '', description: '', permissionIds: [] });
      loadData();
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (roleId: string) => {
    try {
      const role = await getRoleUseCase.execute(roleId);
      setEditFormData({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions.map((p) => p.id),
      });
      setSelectedRole(role);
      setShowEditForm(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    try {
      await updateRoleUseCase.execute(selectedRole.id, editFormData);
      setShowEditForm(false);
      setSelectedRole(null);
      setEditFormData({ name: '', description: '', permissionIds: [] });
      loadData();
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData({
      ...formData,
      permissionIds: formData.permissionIds.includes(permissionId)
        ? formData.permissionIds.filter((id) => id !== permissionId)
        : [...formData.permissionIds, permissionId],
    });
  };

  const toggleEditPermission = (permissionId: string) => {
    setEditFormData({
      ...editFormData,
      permissionIds: editFormData.permissionIds.includes(permissionId)
        ? editFormData.permissionIds.filter((id) => id !== permissionId)
        : [...editFormData.permissionIds, permissionId],
    });
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role and assign permissions to it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Manager role with limited access"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-3">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="space-y-2">
                      <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Key className="h-3 w-3" />
                        {resource}
                      </div>
                      <div className="space-y-1.5 pl-5">
                        {perms.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissionIds.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm flex-1">{permission.name}</span>
                            {formData.permissionIds.includes(permission.id) && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Create Role</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.length === 0 ? (
          <Card className="border-dashed md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No roles found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first role
              </p>
              <Button onClick={() => setShowCreateForm(true)}>Create Role</Button>
            </CardContent>
          </Card>
        ) : (
          roles.map((role) => (
            <Card
              key={role.id}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {role.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(role.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Permissions</span>
                    <Badge variant="secondary">{role.permissions.length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.length > 0 ? (
                      role.permissions.slice(0, 4).map((perm) => (
                        <Badge
                          key={perm.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {perm.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No permissions</span>
                    )}
                    {role.permissions.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 4} more
                      </Badge>
                    )}
                  </div>
                  {role.permissions.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Resources: {[...new Set(role.permissions.map(p => p.resource))].join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permission assignments for {selectedRole?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Manager role with limited access"
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-3">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      {resource}
                    </div>
                    <div className="space-y-1.5 pl-5">
                      {perms.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={editFormData.permissionIds.includes(permission.id)}
                            onChange={() => toggleEditPermission(permission.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm flex-1">{permission.name}</span>
                          {editFormData.permissionIds.includes(permission.id) && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Update Role</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedRole(null);
                  setEditFormData({ name: '', description: '', permissionIds: [] });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
