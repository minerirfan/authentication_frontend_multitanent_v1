import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../infrastructure/storage/tenant-store';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { Permission } from '../../shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { apiClient } from '../../infrastructure/api/api-client';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '../../shared/hooks/use-toast';

export default function PermissionsPage() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const isSuperAdmin = user?.roles?.includes('super_admin') || false;
  const isAdmin = isSuperAdmin || user?.roles?.includes('admin') || false;

  // Redirect super admin to tenants page if no tenant selected
  if (isSuperAdmin && !selectedTenant) {
    return <Navigate to="/tenants" replace />;
  }

  // Regular users (non-admin) should not access this page
  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    resource: '',
    selectedActions: [] as string[],
    newAction: '',
    description: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: '',
  });

  useEffect(() => {
    loadPermissions();
  }, [selectedTenant, user?.tenantId]);

  const loadPermissions = async () => {
    try {
      // For super admin viewing a tenant, add tenantId as query param
      const url = isSuperAdmin && selectedTenant 
        ? `/permissions?tenantId=${selectedTenant.id}`
        : '/permissions';
      
      const response = await apiClient.get(url);
      if (response.success && response.results) {
        setPermissions(Array.isArray(response.results) ? response.results : []);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setEditFormData({
      name: permission.name,
      resource: permission.resource || '',
      action: permission.action || '',
      description: permission.description || '',
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermission) return;

    try {
      // Sanitize resource and action names
      const sanitizedResource = editFormData.resource.trim().replace(/\s+/g, '_').toLowerCase();
      const sanitizedAction = editFormData.action.trim().replace(/\s+/g, '_').toLowerCase();
      const sanitizedName = `${sanitizedResource}.${sanitizedAction}`;

      const updateData = {
        name: sanitizedName,
        resource: editFormData.resource.trim(),
        action: editFormData.action.trim(),
        description: editFormData.description || undefined,
        ...(isSuperAdmin && selectedTenant ? { tenantId: selectedTenant.id } : {}),
      };

      const url = isSuperAdmin && selectedTenant 
        ? `/permissions/${editingPermission.id}?tenantId=${selectedTenant.id}`
        : `/permissions/${editingPermission.id}`;

      const response = await apiClient.put(url, updateData);
      if (response.success) {
        setShowEditForm(false);
        setEditingPermission(null);
        setEditFormData({ name: '', resource: '', action: '', description: '' });
        loadPermissions();
        toast({
          title: 'Success',
          description: 'Permission updated successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const url = isSuperAdmin && selectedTenant 
        ? `/permissions/${id}?tenantId=${selectedTenant.id}`
        : `/permissions/${id}`;

      const response = await apiClient.delete(url);
      if (response.success) {
        setDeleteConfirmId(null);
        loadPermissions();
        toast({
          title: 'Success',
          description: 'Permission deleted successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resource) {
      toast({
        title: 'Validation Error',
        description: 'Resource is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedActions.length === 0 && !formData.newAction.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one action or enter a new action',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Collect all actions to create
      const actionsToCreate = [...formData.selectedActions];
      if (formData.newAction.trim()) {
        actionsToCreate.push(formData.newAction.trim());
      }

      // Get tenantId - super admin can specify, otherwise use user's tenant
      const tenantId = isSuperAdmin && selectedTenant 
        ? selectedTenant.id 
        : user?.tenantId;
      
      if (!tenantId) {
        toast({
          title: 'Error',
          description: 'Tenant ID is required',
          variant: 'destructive',
        });
        return;
      }

      // Sanitize resource name for permission name (replace spaces with underscores and convert to lowercase)
      const sanitizedResource = formData.resource.trim().replace(/\s+/g, '_').toLowerCase();

      // Create multiple permissions - one for each action
      const createPromises = actionsToCreate.map((action) => {
        const sanitizedAction = action.trim().replace(/\s+/g, '_').toLowerCase();
        const permissionData = {
          name: `${sanitizedResource}.${sanitizedAction}`,
          resource: formData.resource.trim(), // Keep original resource name for display
          action: action.trim(), // Keep original action name for display
          description: formData.description || undefined,
          tenantId: tenantId, // Add tenantId
        };
        return apiClient.post('/permissions', permissionData);
      });

      const results = await Promise.all(createPromises);
      const allSuccess = results.every((response) => response.success);

      if (allSuccess) {
        setShowCreateForm(false);
        setFormData({ resource: '', selectedActions: [], newAction: '', description: '' });
        loadPermissions();
        toast({
          title: 'Success',
          description: `Successfully created ${actionsToCreate.length} permission(s)`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Some permissions failed to create. Please check and try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const toggleAction = (action: string) => {
    setFormData((prev) => {
      if (prev.selectedActions.includes(action)) {
        return {
          ...prev,
          selectedActions: prev.selectedActions.filter((a) => a !== action),
        };
      } else {
        return {
          ...prev,
          selectedActions: [...prev.selectedActions, action],
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading permissions...</div>
      </div>
    );
  }

  // Extract unique resources from existing permissions
  const existingResources = Array.from(
    new Set(permissions.map((perm) => perm.resource).filter(Boolean))
  ).sort();

  // Default actions that are always available
  const defaultActions = ['create', 'edit', 'update', 'delete'];
  
  // Extract unique actions from existing permissions
  const existingActions = Array.from(
    new Set(permissions.map((perm) => perm.action).filter(Boolean))
  ).sort();
  
  // Combine default actions with existing actions, removing duplicates
  const allAvailableActions = Array.from(
    new Set([...defaultActions, ...existingActions])
  ).sort();

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">System permissions overview and management</p>
        </div>
        {isAdmin && (
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="h-10">+ Create Permission</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Permission(s)</DialogTitle>
                <DialogDescription>
                  Select a resource and one or more actions to create multiple permissions at once. Permission names will be auto-generated as "resource.action".
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <div className="relative">
                    <Input
                      id="resource"
                      required
                      list="resource-list"
                      value={formData.resource}
                      onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                      className="h-10"
                      placeholder="Select or type a new resource"
                      autoComplete="off"
                    />
                    <datalist id="resource-list">
                      {existingResources.map((resource) => (
                        <option key={resource} value={resource} />
                      ))}
                    </datalist>
                  </div>
                  {existingResources.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Existing resources ({existingResources.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {existingResources.map((resource) => (
                          <span
                            key={resource}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={() => setFormData({ ...formData, resource })}
                            title={`Click to select: ${resource}`}
                          >
                            {resource}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click a resource above to select it, or type a new resource name.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No existing resources. Type a new resource name (e.g., "user", "order", "product").
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Actions (Select multiple)</Label>
                  <div className="space-y-3">
                    {/* Default actions - always shown */}
                    <div className="p-3 border rounded-md bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Default actions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {defaultActions.map((action) => (
                          <label
                            key={action}
                            className="inline-flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.selectedActions.includes(action)}
                              onChange={() => toggleAction(action)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Existing actions from database - shown if any exist */}
                    {existingActions.length > 0 && existingActions.some(action => !defaultActions.includes(action)) && (
                      <div className="p-3 border rounded-md bg-muted/30">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Other existing actions ({existingActions.filter(a => !defaultActions.includes(a)).length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {existingActions
                            .filter(action => !defaultActions.includes(action))
                            .map((action) => (
                            <label
                              key={action}
                              className="inline-flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedActions.includes(action)}
                                onChange={() => toggleAction(action)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-medium">{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newAction">Add New Action</Label>
                    <div className="relative">
                      <Input
                        id="newAction"
                        list="action-list"
                        value={formData.newAction}
                        onChange={(e) => setFormData({ ...formData, newAction: e.target.value })}
                        className="h-10"
                        placeholder="Type a new action (e.g., create, read, update, delete)"
                        autoComplete="off"
                      />
                      <datalist id="action-list">
                        {allAvailableActions.map((action) => (
                          <option key={action} value={action} />
                        ))}
                      </datalist>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.selectedActions.length > 0
                        ? `Selected: ${formData.selectedActions.join(', ')}`
                        : 'Select existing actions above or enter a new action name.'}
                    </p>
                  </div>
                </div>
                {formData.resource && (formData.selectedActions.length > 0 || formData.newAction.trim()) && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <p className="text-xs font-medium text-primary mb-2">Permissions to be created:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {formData.selectedActions.map((action) => {
                        const sanitizedResource = formData.resource.trim().replace(/\s+/g, '_').toLowerCase();
                        const sanitizedAction = action.trim().replace(/\s+/g, '_').toLowerCase();
                        return (
                          <li key={action}>
                            • <span className="font-mono">{sanitizedResource}.{sanitizedAction}</span>
                          </li>
                        );
                      })}
                      {formData.newAction.trim() && (() => {
                        const sanitizedResource = formData.resource.trim().replace(/\s+/g, '_').toLowerCase();
                        const sanitizedAction = formData.newAction.trim().replace(/\s+/g, '_').toLowerCase();
                        return (
                          <li>
                            • <span className="font-mono">{sanitizedResource}.{sanitizedAction}</span>
                          </li>
                        );
                      })()}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Note: Permission names will be in lowercase with spaces replaced by underscores (e.g., "Vendor Invoice" → "vendor_invoice").
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-10"
                    placeholder="Create new users"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {formData.selectedActions.length + (formData.newAction.trim() ? 1 : 0) > 1
                      ? `Create ${formData.selectedActions.length + (formData.newAction.trim() ? 1 : 0)} Permissions`
                      : 'Create Permission'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ resource: '', selectedActions: [], newAction: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <Card key={resource} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg capitalize">{resource}</CardTitle>
              <CardDescription>{perms.length} permission{perms.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{perm.name}</div>
                      {perm.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {perm.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {perm.action}
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(perm)}
                            title="Edit permission"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(perm.id)}
                            title="Delete permission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Permission Dialog */}
      {isSuperAdmin && (
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Permission</DialogTitle>
              <DialogDescription>
                Update the permission details. Permission name will be auto-generated from resource and action.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-resource">Resource</Label>
                <Input
                  id="edit-resource"
                  required
                  value={editFormData.resource}
                  onChange={(e) => setEditFormData({ ...editFormData, resource: e.target.value })}
                  className="h-10"
                  placeholder="user"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-action">Action</Label>
                <Input
                  id="edit-action"
                  required
                  value={editFormData.action}
                  onChange={(e) => setEditFormData({ ...editFormData, action: e.target.value })}
                  className="h-10"
                  placeholder="create"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="h-10"
                  placeholder="Create new users"
                />
              </div>
              {editFormData.resource && editFormData.action && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <p className="text-xs font-medium text-primary mb-1">Permission name will be:</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {editFormData.resource.trim().replace(/\s+/g, '_').toLowerCase()}.
                    {editFormData.action.trim().replace(/\s+/g, '_').toLowerCase()}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Update Permission</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPermission(null);
                    setEditFormData({ name: '', resource: '', action: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {isSuperAdmin && deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Permission</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this permission? This action cannot be undone.
                {permissions.find((p) => p.id === deleteConfirmId) && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                    <p className="text-sm font-medium">
                      {permissions.find((p) => p.id === deleteConfirmId)?.name}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
