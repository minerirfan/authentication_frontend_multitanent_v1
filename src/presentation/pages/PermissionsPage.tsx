import { useEffect, useState, useMemo, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../infrastructure/storage/tenant-store';
import { useAuthPermissions } from '../../infrastructure/hooks/use-auth-permissions.hook';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { Permission } from '../../shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { sanitizeText } from '../../shared/utils/sanitize';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { apiClient } from '../../infrastructure/api/api-client';
import { Edit, Trash2, Plus, ChevronDown, Search } from 'lucide-react';
import { useToast } from '../../shared/hooks/use-toast';

export default function PermissionsPage() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const { isSuperAdmin, isAdmin } = useAuthPermissions();
  
  // Memoize admin status to avoid infinite re-renders
  const adminStatus = useMemo(() => ({
    isSuperAdmin: isSuperAdmin(),
    isAdmin: isAdmin()
  }), [user?.roles]);

  // Redirect super admin to tenants page if no tenant selected
  if (adminStatus.isSuperAdmin && !selectedTenant) {
    return <Navigate to="/tenants" replace />;
  }
  
  // Regular users (non-admin) should not access this page
  if (!adminStatus.isAdmin) {
    return <Navigate to="/profile" replace />;
  }
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteActionConfirm, setDeleteActionConfirm] = useState<string | null>(null);
  const [resourceSearchTerm, setResourceSearchTerm] = useState('');
  const [showResourceDropdown, setShowResourceDropdown] = useState(false);
  const resourceDropdownRef = useRef<HTMLDivElement>(null);
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
  }, [selectedTenant, user?.tenantId, adminStatus.isSuperAdmin]);

  // Auto-populate selected actions when resource changes
  useEffect(() => {
    if (formData.resource) {
      // Find all permissions for the selected resource
      const resourcePermissions = permissions.filter(
        (perm) => perm.resource === formData.resource
      );
      
      // Extract actions from existing permissions for this resource
      const existingResourceActions = resourcePermissions
        .map((perm) => perm.action)
        .filter(Boolean);
      
      // Set selected actions to existing actions for this resource
      setFormData((prev) => ({
        ...prev,
        selectedActions: existingResourceActions,
      }));
    }
  }, [formData.resource, permissions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resourceDropdownRef.current && !resourceDropdownRef.current.contains(event.target as Node)) {
        setShowResourceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResourceSelect = (resource: string) => {
    setFormData({ ...formData, resource });
    setResourceSearchTerm('');
    setShowResourceDropdown(false);
  };

  const handleResourceInputChange = (value: string) => {
    setFormData({ ...formData, resource: value });
    setResourceSearchTerm(value);
    setShowResourceDropdown(true);
  };

  const loadPermissions = async () => {
    try {
      // For super admin viewing a tenant, add tenantId as query param
      const url = adminStatus.isSuperAdmin && selectedTenant
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
        ...(adminStatus.isSuperAdmin && selectedTenant ? { tenantId: selectedTenant.id } : {}),
      };

      const url = adminStatus.isSuperAdmin && selectedTenant
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
      const url = adminStatus.isSuperAdmin && selectedTenant
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

  const handleDeleteAction = async (action: string) => {
    try {
      // Find all permissions with this action
      const permissionsToDelete = permissions.filter((perm) => perm.action === action);
      
      if (permissionsToDelete.length === 0) {
        toast({
          title: 'Error',
          description: 'No permissions found with this action',
          variant: 'destructive',
        });
        return;
      }

      // Delete all permissions with this action
      const deletePromises = permissionsToDelete.map((perm) => {
        const url = adminStatus.isSuperAdmin && selectedTenant
          ? `/permissions/${perm.id}?tenantId=${selectedTenant.id}`
          : `/permissions/${perm.id}`;
        return apiClient.delete(url);
      });

      const results = await Promise.all(deletePromises);
      const allSuccess = results.every((response) => response.success);

      if (allSuccess) {
        setDeleteActionConfirm(null);
        loadPermissions();
        toast({
          title: 'Success',
          description: `Successfully deleted action "${action}" and ${permissionsToDelete.length} associated permission(s)`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Some permissions failed to delete. Please check and try again.',
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

  const handleAddNewAction = () => {
    const trimmedAction = formData.newAction.trim();
    
    if (!trimmedAction) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an action name',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedActions.includes(trimmedAction)) {
      toast({
        title: 'Validation Error',
        description: 'This action is already selected',
        variant: 'destructive',
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      selectedActions: [...prev.selectedActions, trimmedAction],
      newAction: '',
    }));
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

    try {
      // Get tenantId - super admin can specify, otherwise use user's tenant
      const tenantId = adminStatus.isSuperAdmin && selectedTenant
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

      // Find existing permissions for this resource
      const existingResourcePermissions = permissions.filter(
        (perm) => perm.resource === formData.resource
      );
      
      const existingActions = existingResourcePermissions.map((perm) => perm.action);
      
      // Determine actions to create (selected but not existing)
      const actionsToCreate = formData.selectedActions.filter(
        (action) => !existingActions.includes(action)
      );
      
      // Determine actions to delete (existing but not selected)
      const actionsToDelete = existingActions.filter(
        (action) => !formData.selectedActions.includes(action)
      );

      // Sanitize resource name for permission name
      const sanitizedResource = formData.resource.trim().replace(/\s+/g, '_').toLowerCase();

      // Create new permissions for newly selected actions
      const createPromises = actionsToCreate.map((action) => {
        const sanitizedAction = action.trim().replace(/\s+/g, '_').toLowerCase();
        const permissionData = {
          name: `${sanitizedResource}.${sanitizedAction}`,
          resource: formData.resource.trim(),
          action: action.trim(),
          description: formData.description || undefined,
          tenantId: tenantId,
        };
        return apiClient.post('/permissions', permissionData);
      });

      // Delete permissions for unchecked actions
      const deletePromises = actionsToDelete.map((action) => {
        const permissionToDelete = existingResourcePermissions.find(
          (perm) => perm.action === action
        );
        if (permissionToDelete) {
          const url = adminStatus.isSuperAdmin && selectedTenant
            ? `/permissions/${permissionToDelete.id}?tenantId=${selectedTenant.id}`
            : `/permissions/${permissionToDelete.id}`;
          return apiClient.delete(url);
        }
        return Promise.resolve({ success: true });
      });

      // Execute all operations
      const [createResults, deleteResults] = await Promise.all([
        Promise.all(createPromises),
        Promise.all(deletePromises),
      ]);

      const allCreateSuccess = createResults.every((response) => response.success);
      const allDeleteSuccess = deleteResults.every((response) => response.success);

      if (allCreateSuccess && allDeleteSuccess) {
        setShowCreateForm(false);
        setFormData({ resource: '', selectedActions: [], newAction: '', description: '' });
        loadPermissions();
        
        const messages = [];
        if (actionsToCreate.length > 0) {
          messages.push(`created ${actionsToCreate.length} permission(s)`);
        }
        if (actionsToDelete.length > 0) {
          messages.push(`removed ${actionsToDelete.length} permission(s)`);
        }
        
        toast({
          title: 'Success',
          description: `Successfully ${messages.join(' and ')}`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Some operations failed. Please check and try again.',
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

  // Filter resources based on search term
  const filteredResources = resourceSearchTerm
    ? existingResources.filter(r =>
        r.toLowerCase().includes(resourceSearchTerm.toLowerCase())
      )
    : existingResources;

  // Check if current resource is new (not in existing resources)
  const isNewResource = formData.resource && !existingResources.includes(formData.resource);

  // Default actions that are always available
  const defaultActions = ['create', 'view', 'update', 'delete'];
  
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
        {adminStatus.isAdmin && (
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="h-10">+ Create Permission</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Permissions</DialogTitle>
                <DialogDescription>
                  Select a resource to view existing actions. Check actions to create permissions, uncheck to remove them. You can also add new actions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <div className="relative" ref={resourceDropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="resource"
                        required
                        value={formData.resource}
                        onChange={(e) => handleResourceInputChange(e.target.value)}
                        onFocus={() => setShowResourceDropdown(true)}
                        className="h-10 pl-9 pr-10"
                        placeholder="Search or type a new resource"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResourceDropdown(!showResourceDropdown)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Resource Dropdown */}
                    {showResourceDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {filteredResources.length > 0 ? (
                          <div>
                            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                              Existing Resources ({filteredResources.length})
                            </div>
                            {filteredResources.map((resource) => (
                              <button
                                key={resource}
                                type="button"
                                onClick={() => handleResourceSelect(resource)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent rounded transition-colors ${
                                  formData.resource === resource ? 'bg-accent' : ''
                                }`}
                              >
                                {sanitizeText(resource)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {resourceSearchTerm
                              ? `No resources found. "${sanitizeText(resourceSearchTerm)}" will be created as a new resource.`
                              : 'No existing resources. Type a new resource name to create one.'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* New resource indicator */}
                    {isNewResource && formData.resource && (
                      <div className="mt-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
                        <p className="text-xs text-primary font-medium">
                          New Resource: "{sanitizeText(formData.resource)}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select actions below to create permissions for this new resource.
                        </p>
                      </div>
                    )}
                  </div>
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
                            <span className="text-sm font-medium">{sanitizeText(action)}</span>
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
                            <div
                              key={action}
                              className="inline-flex items-center space-x-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                id={`action-${action}`}
                                checked={formData.selectedActions.includes(action)}
                                onChange={() => toggleAction(action)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label
                                htmlFor={`action-${action}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {sanitizeText(action)}
                              </label>
                              <button
                                type="button"
                                onClick={() => setDeleteActionConfirm(action)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 hover:bg-destructive/10 rounded"
                                title="Delete this action"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newAction">Add New Action</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="newAction"
                          list="action-list"
                          value={formData.newAction}
                          onChange={(e) => setFormData({ ...formData, newAction: e.target.value })}
                          className="h-10"
                          placeholder="Type a new action (e.g., create, read, update, delete)"
                          autoComplete="off"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewAction();
                            }
                          }}
                        />
                        <datalist id="action-list">
                          {allAvailableActions.map((action) => (
                            <option key={action} value={action} />
                          ))}
                        </datalist>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={handleAddNewAction}
                        title="Add action to selected list"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formData.selectedActions.length > 0
                        ? `Selected: ${formData.selectedActions.join(', ')}`
                        : 'Select existing actions above or add new actions.'}
                    </p>
                  </div>
                </div>
                {formData.resource && (formData.selectedActions.length > 0 || permissions.filter(p => p.resource === formData.resource).length > 0) && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <p className="text-xs font-medium text-primary mb-2">Permissions to be created:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                      {formData.selectedActions.map((action) => {
                        const sanitizedResource = formData.resource.trim().replace(/\s+/g, '_').toLowerCase();
                        const sanitizedAction = action.trim().replace(/\s+/g, '_').toLowerCase();
                        return (
                          <li key={action}>
                            • <span className="font-mono">{sanitizeText(`${sanitizedResource}.${sanitizedAction}`)}</span>
                          </li>
                        );
                      })}
                      {formData.selectedActions.length === 0 && (
                        <li className="text-xs italic">No new permissions will be created</li>
                      )}
                    </ul>
                    {(() => {
                      const existingResourcePermissions = permissions.filter(p => p.resource === formData.resource);
                      const actionsToDelete = existingResourcePermissions
                        .map(p => p.action)
                        .filter(action => !formData.selectedActions.includes(action));
                      if (actionsToDelete.length > 0) {
                        return (
                          <>
                            <p className="text-xs font-medium text-destructive mb-2">Permissions to be removed:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                              {actionsToDelete.map((action) => {
                                const sanitizedResource = formData.resource.trim().replace(/\s+/g, '_').toLowerCase();
                                const sanitizedAction = action.trim().replace(/\s+/g, '_').toLowerCase();
                                return (
                                  <li key={action}>
                                    • <span className="font-mono text-destructive">{sanitizeText(`${sanitizedResource}.${sanitizedAction}`)}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        );
                      }
                      return null;
                    })()}
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
                    Save Changes
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
              <CardTitle className="text-lg capitalize">{sanitizeText(resource)}</CardTitle>
              <CardDescription>{perms.length} permission{perms.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{sanitizeText(perm.name)}</div>
                      {perm.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {sanitizeText(perm.description)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary whitespace-nowrap">
                        {sanitizeText(perm.action)}
                      </span>
                      {adminStatus.isAdmin && (
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
      {adminStatus.isSuperAdmin && (
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
      {adminStatus.isSuperAdmin && deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Permission</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this permission? This action cannot be undone.
                {permissions.find((p) => p.id === deleteConfirmId) && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                    <p className="text-sm font-medium">
                      {sanitizeText(permissions.find((p) => p.id === deleteConfirmId)?.name || '')}
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

      {/* Delete Action Confirmation Dialog */}
      {deleteActionConfirm && (
        <Dialog open={!!deleteActionConfirm} onOpenChange={(open) => !open && setDeleteActionConfirm(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the action "{deleteActionConfirm}"? This will also delete all permissions associated with this action. This action cannot be undone.
                <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                  <p className="text-sm font-medium">
                    {permissions.filter((p) => p.action === deleteActionConfirm).length} permission(s) will be deleted
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteActionConfirm && handleDeleteAction(deleteActionConfirm)}
              >
                Delete Action
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteActionConfirm(null)}
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
