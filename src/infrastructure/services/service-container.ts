import { UserRepository } from '../api/user.repository';
import { RoleRepository } from '../api/role.repository';
import { PermissionRepository } from '../api/permission.repository';
import { UserProfileRepository } from '../api/user-profile.repository';
import { AuthRepository } from '../api/auth.repository';
import { GetUsersUseCase } from '../../application/use-cases/user/get-users.use-case';
import { GetUserUseCase } from '../../application/use-cases/user/get-user.use-case';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case';
import { GetRolesUseCase } from '../../application/use-cases/role/get-roles.use-case';
import { GetRoleUseCase } from '../../application/use-cases/role/get-role.use-case';
import { CreateRoleUseCase } from '../../application/use-cases/role/create-role.use-case';
import { UpdateRoleUseCase } from '../../application/use-cases/role/update-role.use-case';
import { GetPermissionsUseCase } from '../../application/use-cases/permission/get-permissions.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/user-profile/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user-profile/update-user-profile.use-case';
import { CreateUserProfileUseCase } from '../../application/use-cases/user-profile/create-user-profile.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
 
/**
 * Service Container
 * 
 * Centralizes use case instantiation to avoid creating new instances in components.
 * This follows the Dependency Injection pattern and makes testing easier.
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;
  private permissionRepository: PermissionRepository;
  private userProfileRepository: UserProfileRepository;
  private authRepository: AuthRepository;
  
  // User Use Cases
  private getUsersUseCase: GetUsersUseCase;
  private getUserUseCase: GetUserUseCase;
  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;
  
  // Role Use Cases
  private getRolesUseCase: GetRolesUseCase;
  private getRoleUseCase: GetRoleUseCase;
  private createRoleUseCase: CreateRoleUseCase;
  private updateRoleUseCase: UpdateRoleUseCase;
  
  // Permission Use Cases
  private getPermissionsUseCase: GetPermissionsUseCase;
  
  // User Profile Use Cases
  private getUserProfileUseCase: GetUserProfileUseCase;
  private updateUserProfileUseCase: UpdateUserProfileUseCase;
  private createUserProfileUseCase: CreateUserProfileUseCase;
  
  // Auth Use Cases
  private logoutUseCase: LogoutUseCase;
  
  private constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
    this.permissionRepository = new PermissionRepository();
    this.userProfileRepository = new UserProfileRepository();
    this.authRepository = new AuthRepository();
    
    // User Use Cases
    this.getUsersUseCase = new GetUsersUseCase(this.userRepository);
    this.getUserUseCase = new GetUserUseCase(this.userRepository);
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
    
    // Role Use Cases
    this.getRolesUseCase = new GetRolesUseCase(this.roleRepository);
    this.getRoleUseCase = new GetRoleUseCase(this.roleRepository);
    this.createRoleUseCase = new CreateRoleUseCase(this.roleRepository);
    this.updateRoleUseCase = new UpdateRoleUseCase(this.roleRepository);
    
    // Permission Use Cases
    this.getPermissionsUseCase = new GetPermissionsUseCase(this.permissionRepository);
    
    // User Profile Use Cases
    this.getUserProfileUseCase = new GetUserProfileUseCase(this.userProfileRepository);
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(this.userProfileRepository);
    this.createUserProfileUseCase = new CreateUserProfileUseCase(this.userProfileRepository);
    
    // Auth Use Cases
    this.logoutUseCase = new LogoutUseCase(this.authRepository);
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
  
  // User Services
  get users() {
    return {
      getUsers: this.getUsersUseCase,
      getUser: this.getUserUseCase,
      createUser: this.createUserUseCase,
      updateUser: this.updateUserUseCase,
      deleteUser: this.deleteUserUseCase,
    };
  }
  
  get roles() {
    return {
      getRoles: this.getRolesUseCase,
      getRole: this.getRoleUseCase,
      createRole: this.createRoleUseCase,
      updateRole: this.updateRoleUseCase,
    };
  }
  
  get permissions() {
    return {
      getPermissions: this.getPermissionsUseCase,
    };
  }
  
  get userProfiles() {
    return {
      getUserProfile: this.getUserProfileUseCase,
      updateUserProfile: this.updateUserProfileUseCase,
      createUserProfile: this.createUserProfileUseCase,
    };
  }
  
  get auth() {
    return {
      logout: this.logoutUseCase,
    };
  }
}
