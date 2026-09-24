import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';

import {
  ChangePasswordRequest,
  CreateUserRequest,
  RoleResponse,
  UpdateUserRequest,
  UserResponse,
} from '../interfaces';
import { UserService } from './user.service';

@Injectable()
export class UserHttpService implements UserService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.api.authUrl}/users`;

  findAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  findRoles(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${this.apiUrl}/roles`);
  }

  create(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, request);
  }

  update(id: number, request: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, request);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resendActivation(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/resend-activation`, { email });
  }

  changePasswordMe(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password-me`, request);
  }
}
