export type UserRoleType = 'ADMIN' | 'DEALERSHIP';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRoleType;
  dealershipId?: number;
}

export interface UpdateUserDTO {
  name: string;
  email: string;
  role: UserRoleType;
  dealershipId?: number | null;
}
