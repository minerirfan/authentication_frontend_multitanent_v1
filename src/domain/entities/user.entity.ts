export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly tenantId: string,
    public readonly roles: Array<{ id: string; name: string; description: string | null }>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasRole(roleName: string): boolean {
    return this.roles.some((role) => role.name === roleName);
  }
}

