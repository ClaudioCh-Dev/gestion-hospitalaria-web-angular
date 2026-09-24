import { Observable } from 'rxjs';

import {
  ChangePasswordRequest,
  CreateUserRequest,
  RoleResponse,
  UpdateUserRequest,
  UserResponse,
} from '../interfaces';

export abstract class UserService {

  abstract findAll(): Observable<UserResponse[]>;

  abstract findRoles(): Observable<RoleResponse[]>;

  abstract create(request: CreateUserRequest): Observable<UserResponse>;

  abstract update(id: number, request: UpdateUserRequest): Observable<UserResponse>;

  // El backend no borra: desactiva el usuario y revoca sus sesiones
  abstract deactivate(id: number): Observable<void>;

  abstract resendActivation(email: string): Observable<void>;

  abstract changePasswordMe(request: ChangePasswordRequest): Observable<void>;
}
