import { useEffect, useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useAuthStore } from '../../infrastructure/storage/auth-store';
import { useTenantStore } from '../../infrastructure/storage/tenant-store';
import { GetUsersUseCase } from '../../application/use-cases/user/get-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/user/get-user.use-case';
import { UserRepository } from '../../infrastructure/api/user.repository';
import { RoleRepository } from '../../infrastructure/api/role.repository';
import { GetRolesUseCase } from '../../application/use-cases/role/get-roles.use-case';
import { User, Role } from '../../shared/types';
import { getErrorMessage } from '../../shared/utils/error-handler';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { DataTable } from '../components/data-table/DataTable';
import { ColumnHeader } from '../components/data-table/ColumnHeader';
import { TableSkeleton } from '../components/ui/loading';
import { useToast } from '../../shared/hooks/use-toast';
import { Pencil, Trash2, Eye, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const { user } = useAuthStore();
  const { selectedTenant } = useTenantStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isSuperAdmin = user?.roles?.includes('super_admin') || false;
  const isAdmin = isSuperAdmin || user?.roles?.includes('admin') || false;

  if (isSuperAdmin && !selectedTenant) {
    return <Navigate to="/tenants" replace />;
  }

  // Regular users (non-admin) should not access this page
  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roleIds: [] as string[],
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleIds: [] as string[],
  });

  const userRepository = new UserRepository();
  const roleRepository = new RoleRepository();
  const getUsersUseCase = new GetUsersUseCase(userRepository);
  const getUserUseCase = new GetUserUseCase(userRepository);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const updateUserUseCase = new UpdateUserUseCase(userRepository);
  const deleteUserUseCase = new DeleteUserUseCase(userRepository);
  const getRolesUseCase = new GetRolesUseCase(roleRepository);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsersUseCase.execute(),
        getRolesUseCase.execute(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setUsers([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserUseCase.execute(formData);
      setShowCreateForm(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', roleIds: [] });
      loadData();
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async (userId: string) => {
    try {
      const user = await getUserUseCase.execute(userId);
      setEditFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
        roleIds: user.roles.map((r) => r.id),
      });
      setSelectedUser(user);
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
    if (!selectedUser) return;
    try {
      const updateDto: any = {
        email: editFormData.email,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        roleIds: editFormData.roleIds,
      };
      if (editFormData.password) {
        updateDto.password = editFormData.password;
      }
      await updateUserUseCase.execute(selectedUser.id, updateDto);
      setShowEditForm(false);
      setSelectedUser(null);
      setEditFormData({ email: '', firstName: '', lastName: '', password: '', roleIds: [] });
      loadData();
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUserUseCase.execute(id);
      loadData();
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (userId: string) => {
    navigate(`/users/${userId}/profile`);
  };

  const toggleRole = (roleId: string) => {
    setFormData({
      ...formData,
      roleIds: formData.roleIds.includes(roleId)
        ? formData.roleIds.filter((id) => id !== roleId)
        : [...formData.roleIds, roleId],
    });
  };

  const toggleEditRole = (roleId: string) => {
    setEditFormData({
      ...editFormData,
      roleIds: editFormData.roleIds.includes(roleId)
        ? editFormData.roleIds.filter((id) => id !== roleId)
        : [...editFormData.roleIds, roleId],
    });
  };

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <ColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'roles',
        header: ({ column }) => <ColumnHeader column={column} title="Roles" />,
        cell: ({ row }) => {
          const roles = row.original.roles;
          return (
            <div className="flex flex-wrap gap-1">
              {roles.length > 0 ? (
                roles.slice(0, 2).map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No roles</span>
              )}
              {roles.length > 2 && (
                <Badge variant="outline">+{roles.length - 2}</Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <ColumnHeader column={column} title="Created" />,
        cell: ({ row }) => {
          return format(new Date(row.original.createdAt), 'MMM dd, yyyy');
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleViewDetails(user.id)}
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(user.id)}
                title="Edit user"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDelete(user.id)}
                title="Delete user"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (loading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and their access</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to your tenant. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Assign Roles</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
                  {roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No roles available</p>
                  ) : (
                    roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.roleIds.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{role.name}</span>
                          {role.description && (
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Create User</Button>
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

      <DataTable columns={columns} data={users} searchKey="email" searchPlaceholder="Search users..." />

      {/* Edit User Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role assignments for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  required
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  required
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                placeholder="Enter new password to change"
              />
            </div>
            <div className="space-y-2">
              <Label>Assign Roles</Label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles available</p>
                ) : (
                  roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={editFormData.roleIds.includes(role.id)}
                        onChange={() => toggleEditRole(role.id)}
                        className="rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{role.name}</span>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Update User</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedUser(null);
                  setEditFormData({ email: '', firstName: '', lastName: '', password: '', roleIds: [] });
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
