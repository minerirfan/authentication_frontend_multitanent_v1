import { useAuthStore } from '../storage/auth-store';

/**
 * useAuthPermissions Hook
 *
 * Centralizes role and permission checking logic to avoid repetition.
 * Provides methods to check user roles and permissions.
 */
export function useAuthPermissions() {
  const { user } = useAuthStore();
  
  /**
   * Check if user has a specific role (case-insensitive)
   */
  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(role => role.toLowerCase() === roleName.toLowerCase());
  };

  /**
   * Check if user has any of the specified roles (case-insensitive)
   */
  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!user?.roles) return false;
    return roleNames.some(roleName =>
      user.roles.some(role => role.toLowerCase() === roleName.toLowerCase())
    );
  };

  /**
   * Check if user has all of the specified roles (case-insensitive)
   */
  const hasAllRoles = (roleNames: string[]): boolean => {
    if (!user?.roles) return false;
    return roleNames.every(roleName =>
      user.roles.some(role => role.toLowerCase() === roleName.toLowerCase())
    );
  };

  /**
   * Check if user is a super admin
   */
  const isSuperAdmin = (): boolean => {
    return hasRole('SUPER_ADMIN');
  };

  /**
   * Check if user is a tenant admin
   */
  const isTenantAdmin = (): boolean => {
    return hasRole('TENANT_ADMIN');
  };

  /**
   * Check if user is an admin (super admin or tenant admin)
   */
  const isAdmin = (): boolean => {
    return isSuperAdmin() || isTenantAdmin();
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionName: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionName);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissionNames.some(permissionName => 
      user.permissions.includes(permissionName)
    );
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissionNames.every(permissionName => 
      user.permissions.includes(permissionName)
    );
  };

  /**
   * Get all permissions for current user
   */
  const getPermissions = (): string[] => {
    if (!user?.permissions) return [];
    return [...user.permissions];
  };

  /**
   * Get all roles for current user
   */
  const getRoles = (): string[] => {
    if (!user?.roles) return [];
    return [...user.roles];
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isSuperAdmin,
    isTenantAdmin,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,
    getRoles,
  };
}
