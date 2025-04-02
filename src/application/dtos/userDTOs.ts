export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'DEALERSHIP';
  dealershipId?: number;
}

export interface UpdateUserDTO {
  name: string;
  email: string;
  role: 'ADMIN' | 'DEALERSHIP';
  dealershipId?: number | null;
}
