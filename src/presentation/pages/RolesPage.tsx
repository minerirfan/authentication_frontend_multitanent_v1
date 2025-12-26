import { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../infrastructure/storage/tenant-store';
import { useAuthPermissions } from '../../infrastructure/hooks/use-auth-permissions.hook';
import { ServiceContainer } from '../../infrastructure/services/service-container';
import { Role, Permission } from '../../shared/types';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { sanitizeText } from '../../shared/utils/sanitize';
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
import { Shield, Plus, Pencil, Key, CheckCircle2, Check, X, Square } from 'lucide-react';
import { useToast } from '../../shared/hooks/use-toast';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../../shared/utils/cn';

export default function RolesPage() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const { toast } = useToast();
  const { isSuperAdmin, isAdmin } = useAuthPermissions();
  
  // Memoize admin status to avoid infinite re-renders
  const adminStatus = useMemo(() => ({
    isSuperAdmin: isSuperAdmin(),
    isAdmin: isAdmin()
  }), [user?.roles]);

  if (adminStatus.isSuperAdmin && !selectedTenant) {
    return <Navigate to="/tenants" replace />;
  }
 
  // Regular users (non-admin) should not access this page
  if (!adminStatus.isAdmin) {
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

  const serviceContainer = ServiceContainer.getInstance();
  const getRolesUseCase = serviceContainer.roles.getRoles;
  const getRoleUseCase = serviceContainer.roles.getRole;
  const createRoleUseCase = serviceContainer.roles.createRole;
  const updateRoleUseCase = serviceContainer.roles.updateRole;
  const getPermissionsUseCase = serviceContainer.permissions.getPermissions;

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

  // Get all unique actions across all permissions with custom sort order
  const allActions = useMemo(() => {
    const actions = new Set(permissions.map(p => p.action));
    const actionList = Array.from(actions);
    
    // Define custom action order
    const actionOrder = [
      'create',
      'view',
      'read',
      'update',
      'delete',
      'inv approval',
      'acc approval',
      'audit approval'
    ];
    
    // Sort actions based on defined order, with any new actions at the end
    return actionList.sort((a, b) => {
      const indexA = actionOrder.indexOf(a);
      const indexB = actionOrder.indexOf(b);
      
      // If both actions are in the defined order, sort by their positions
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only action A is in the defined order, it comes first
      if (indexA !== -1) {
        return -1;
      }
      
      // If only action B is in the defined order, it comes first
      if (indexB !== -1) {
        return 1;
      }
      
      // If neither is in the defined order, sort alphabetically (new actions)
      return a.localeCompare(b);
    });
  }, [permissions]);

  // Check if all actions for a resource are selected
  const isResourceFullySelected = (resource: string, selectedIds: string[]) => {
    const resourcePerms = groupedPermissions[resource] || [];
    return resourcePerms.length > 0 && resourcePerms.every(p => selectedIds.includes(p.id));
  };

  // Check if some actions for a resource are selected
  const isResourcePartiallySelected = (resource: string, selectedIds: string[]) => {
    const resourcePerms = groupedPermissions[resource] || [];
    return resourcePerms.length > 0 && resourcePerms.some(p => selectedIds.includes(p.id)) && !isResourceFullySelected(resource, selectedIds);
  };

  // Toggle all actions for a resource
  const toggleResourcePermissions = (resource: string, selectedIds: string[], setter: (ids: string[]) => void) => {
    const resourcePerms = groupedPermissions[resource] || [];
    if (isResourceFullySelected(resource, selectedIds)) {
      // Deselect all
      setter(selectedIds.filter(id => !resourcePerms.some(p => p.id === id)));
    } else {
      // Select all
      const newIds = [...selectedIds];
      resourcePerms.forEach(p => {
        if (!newIds.includes(p.id)) {
          newIds.push(p.id);
        }
      });
      setter(newIds);
    }
  };

  // Check if all resources have all actions selected
  const isAllSelected = (selectedIds: string[]) => {
    return permissions.length > 0 && permissions.every(p => selectedIds.includes(p.id));
  };

  // Toggle all permissions
  const toggleAllPermissions = (selectedIds: string[], setter: (ids: string[]) => void) => {
    if (isAllSelected(selectedIds)) {
      setter([]);
    } else {
      setter(permissions.map(p => p.id));
    }
  };

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
          <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role and assign permissions using the grid matrix below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-4 border-b space-y-4 bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                  {/* Summary Header */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">Selected:</span>{' '}
                        <span className="text-primary">{formData.permissionIds.length}</span> / {permissions.length} permissions
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Resources:</span>{' '}
                        {Object.keys(groupedPermissions).length}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllPermissions(formData.permissionIds, (ids) => setFormData({ ...formData, permissionIds: ids }))}
                      className="gap-2"
                    >
                      {isAllSelected(formData.permissionIds) ? (
                        <>
                          <X className="h-4 w-4" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Select All
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Permission Grid Matrix */}
                  <div className="border rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid bg-muted border-b" style={{ gridTemplateColumns: `200px repeat(${allActions.length}, minmax(120px, 1fr))` }}>
                      <div className="p-3 font-semibold text-sm border-r sticky left-0 bg-muted z-10">
                        Resource
                      </div>
                      {allActions.map((action) => (
                        <div key={action} className="p-3 font-semibold text-sm text-center capitalize border-r last:border-r-0">
                          {action}
                        </div>
                      ))}
                    </div>

                    {/* Table Body */}
                    <div className="max-h-[calc(90vh-400px)] overflow-auto">
                      {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div
                          key={resource}
                          className="grid border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                          style={{ gridTemplateColumns: `200px repeat(${allActions.length}, minmax(120px, 1fr))` }}
                        >
                          {/* Resource Name with Toggle */}
                          <div className="p-3 font-medium text-sm border-r sticky left-0 bg-background z-10">
                            <button
                              type="button"
                              onClick={() => toggleResourcePermissions(resource, formData.permissionIds, (ids) => setFormData({ ...formData, permissionIds: ids }))}
                              className="flex items-center gap-2 hover:text-primary transition-colors w-full text-left"
                            >
                              <Key className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{sanitizeText(resource)}</span>
                              {isResourceFullySelected(resource, formData.permissionIds) && (
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                              {isResourcePartiallySelected(resource, formData.permissionIds) && (
                                <Square className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </button>
                          </div>

                          {/* Action Checkboxes */}
                          {allActions.map((action) => {
                            const permission = perms.find(p => p.action === action);
                            const isSelected = permission ? formData.permissionIds.includes(permission.id) : false;
                            
                            return (
                              <div
                                key={`${resource}-${action}`}
                                className={cn(
                                  "p-3 border-r last:border-r-0 flex items-center justify-center",
                                  !permission && "bg-muted/20"
                                )}
                              >
                                {permission ? (
                                  <button
                                    type="button"
                                    onClick={() => togglePermission(permission.id)}
                                    className={cn(
                                      "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                                      isSelected
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-input hover:border-primary hover:bg-primary/5"
                                    )}
                                  >
                                    {isSelected && <Check className="h-4 w-4" />}
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-primary bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border-2 border-input" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">—</span>
                      <span>Not applicable</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t bg-muted/30 flex gap-2">
                <Button type="submit" className="flex-1">Create Role</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', description: '', permissionIds: [] });
                  }}
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
                      <CardTitle className="text-lg">{sanitizeText(role.name)}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {sanitizeText(role.description || 'No description')}
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
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permission assignments for {selectedRole?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-4 border-b space-y-4 bg-muted/30">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                {/* Summary Header */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium">Selected:</span>{' '}
                      <span className="text-primary">{editFormData.permissionIds.length}</span> / {permissions.length} permissions
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Resources:</span>{' '}
                      {Object.keys(groupedPermissions).length}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllPermissions(editFormData.permissionIds, (ids) => setEditFormData({ ...editFormData, permissionIds: ids }))}
                    className="gap-2"
                  >
                    {isAllSelected(editFormData.permissionIds) ? (
                      <>
                        <X className="h-4 w-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Select All
                      </>
                    )}
                  </Button>
                </div>

                {/* Permission Grid Matrix */}
                <div className="border rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid bg-muted border-b" style={{ gridTemplateColumns: `200px repeat(${allActions.length}, minmax(120px, 1fr))` }}>
                    <div className="p-3 font-semibold text-sm border-r sticky left-0 bg-muted z-10">
                      Resource
                    </div>
                    {allActions.map((action) => (
                      <div key={action} className="p-3 font-semibold text-sm text-center capitalize border-r last:border-r-0">
                        {action}
                      </div>
                    ))}
                  </div>

                  {/* Table Body */}
                  <div className="max-h-[calc(90vh-400px)] overflow-auto">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <div
                        key={resource}
                        className="grid border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                        style={{ gridTemplateColumns: `200px repeat(${allActions.length}, minmax(120px, 1fr))` }}
                      >
                        {/* Resource Name with Toggle */}
                        <div className="p-3 font-medium text-sm border-r sticky left-0 bg-background z-10">
                          <button
                            type="button"
                            onClick={() => toggleResourcePermissions(resource, editFormData.permissionIds, (ids) => setEditFormData({ ...editFormData, permissionIds: ids }))}
                            className="flex items-center gap-2 hover:text-primary transition-colors w-full text-left"
                          >
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{sanitizeText(resource)}</span>
                            {isResourceFullySelected(resource, editFormData.permissionIds) && (
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            {isResourcePartiallySelected(resource, editFormData.permissionIds) && (
                              <Square className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        </div>

                        {/* Action Checkboxes */}
                        {allActions.map((action) => {
                          const permission = perms.find(p => p.action === action);
                          const isSelected = permission ? editFormData.permissionIds.includes(permission.id) : false;
                          
                          return (
                            <div
                              key={`${resource}-${action}`}
                              className={cn(
                                "p-3 border-r last:border-r-0 flex items-center justify-center",
                                !permission && "bg-muted/20"
                              )}
                            >
                              {permission ? (
                                <button
                                  type="button"
                                  onClick={() => toggleEditPermission(permission.id)}
                                  className={cn(
                                    "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                                    isSelected
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-input hover:border-primary hover:bg-primary/5"
                                  )}
                                >
                                  {isSelected && <Check className="h-4 w-4" />}
                                </button>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-primary bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-input" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">—</span>
                    <span>Not applicable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-muted/30 flex gap-2">
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
