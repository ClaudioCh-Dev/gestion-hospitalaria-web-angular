export interface UserResponse {
  id: number;
  email: string;
  roleId: number;
  role: string;
  active: boolean;
  // Inactivo con un correo de activación enviado que aún no se usa
  activationPending: boolean;
}

export interface RoleResponse {
  id: number;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  roleId: number;
}

export interface UpdateUserRequest {
  email: string;
  roleId: number;
  // Opcional: vacío conserva la contraseña actual
  password?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
