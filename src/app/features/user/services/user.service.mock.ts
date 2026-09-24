import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AuthMockStore } from '@core/mocks/auth-mock.store';
import { AuthService } from '@core/services/auth.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { ProblemDetailMicroservice } from '@shared/models/problem.type';

import { ROLE_ADMIN } from '../constants/user-roles';
import {
  ChangePasswordRequest,
  CreateUserRequest,
  RoleResponse,
  UpdateUserRequest,
  UserResponse,
} from '../interfaces';
import { ROLES_MOCK, USERS_MOCK } from '../mocks/user.mocks';
import { UserService } from './user.service';

@Injectable()
export class UserMockService extends UserService {

  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly authService = inject(AuthService);

  private readonly authMockStore = inject(AuthMockStore);

  private readonly MOCK_DELAY = 1500;

  private readonly _users = signal<UserResponse[]>(structuredClone(USERS_MOCK));

  // =====================================================
  // HANDLE ERROR
  // =====================================================

  private handleError(
    status: number,
    title: string,
    detail: string,
    code?: string,
  ): Observable<never> {

    const problem: ProblemDetailMicroservice = {
      type: 'about:blank',
      title,
      status,
      detail,
      instance: undefined,
      code,
    };

    const error = new HttpErrorResponse({
      status,
      statusText: title,
      error: problem,
    });

    this.errorHandler.handle(error);

    return throwError(() => error);
  }

  private findUser(id: number): UserResponse | undefined {
    return this._users().find(user => user.id === id);
  }

  private emailTaken(email: string, exceptId?: number): boolean {
    return this._users().some(
      user => user.id !== exceptId && user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  private roleName(roleId: number): string | undefined {
    return ROLES_MOCK.find(role => role.id === roleId)?.name;
  }

  // =====================================================
  // QUERIES
  // =====================================================

  findAll(): Observable<UserResponse[]> {
    return of(this._users()).pipe(delay(this.MOCK_DELAY));
  }

  findRoles(): Observable<RoleResponse[]> {
    return of(ROLES_MOCK).pipe(delay(this.MOCK_DELAY / 2));
  }

  // =====================================================
  // CREATE
  // =====================================================

  create(request: CreateUserRequest): Observable<UserResponse> {

    if (this.emailTaken(request.email)) {
      return this.handleError(400, 'Correo ya registrado', 'El correo electrónico ya está registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const role = this.roleName(request.roleId);

    if (!role) {
      return this.handleError(404, 'Rol no encontrado', 'Rol no encontrado', 'ROLE_NOT_FOUND');
    }

    // Igual que el backend: nace inactivo y se le envía el correo de activación
    const user: UserResponse = {
      id: Date.now(),
      email: request.email,
      roleId: request.roleId,
      role,
      active: false,
      activationPending: true,
    };

    this._users.update(users => [...users, user]);

    return of(user).pipe(delay(this.MOCK_DELAY));
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(id: number, request: UpdateUserRequest): Observable<UserResponse> {

    const existing = this.findUser(id);

    if (!existing) {
      return this.handleError(404, 'Usuario no encontrado', 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (this.emailTaken(request.email, id)) {
      return this.handleError(400, 'Correo ya registrado', 'El correo electrónico ya está registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const updated: UserResponse = {
      ...existing,
      email: request.email,
      roleId: request.roleId,
      role: this.roleName(request.roleId) ?? existing.role,
    };

    this._users.update(users => users.map(user => (user.id === id ? updated : user)));

    return of(updated).pipe(delay(this.MOCK_DELAY));
  }

  // =====================================================
  // DEACTIVATE
  // =====================================================

  deactivate(id: number): Observable<void> {

    const user = this.findUser(id);

    if (!user) {
      return this.handleError(404, 'Usuario no encontrado', 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (id === this.authService.currentUser()?.userId) {
      return this.handleError(403, 'Operación no permitida', 'No puedes desactivar tu propio usuario', 'USER_CANNOT_DEACTIVATE_SELF');
    }

    if (user.role === ROLE_ADMIN) {
      return this.handleError(403, 'Operación no permitida', 'No se puede desactivar un usuario con rol ADMIN', 'USER_ADMIN_CANNOT_BE_DEACTIVATED');
    }

    this._users.update(users =>
      users.map(item => (item.id === id ? { ...item, active: false } : item)),
    );

    return of(undefined).pipe(delay(this.MOCK_DELAY));
  }

  // =====================================================
  // RESEND ACTIVATION
  // =====================================================

  resendActivation(email: string): Observable<void> {

    const user = this._users().find(item => item.email === email);

    if (!user) {
      return this.handleError(404, 'Usuario no encontrado', 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (user.active) {
      return this.handleError(400, 'Usuario activo', 'El usuario ya está activo', 'USER_ALREADY_ACTIVE');
    }

    this._users.update(users =>
      users.map(item => (item.id === user.id ? { ...item, activationPending: true } : item)),
    );

    return of(undefined).pipe(delay(this.MOCK_DELAY));
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  // Valida y guarda contra las cuentas del login simulado: la nueva contraseña sirve para el siguiente login
  changePasswordMe(request: ChangePasswordRequest): Observable<void> {

    const userId = this.authService.currentUser()?.userId;

    if (!userId) {
      return this.handleError(401, 'Sesión no válida', 'Inicia sesión nuevamente', 'AUTH_INVALID_TOKEN');
    }

    return this.authMockStore.changePassword(userId, request.currentPassword, request.newPassword);
  }
}
