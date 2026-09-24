import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap, throwError } from 'rxjs';

import { environment } from '@environments/environment';

import { AuthMockStore } from '../mocks/auth-mock.store';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
}

// Claims que firma auth-server (JwtHelper.createToken)
export interface AuthUser {
  userId: number;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http = inject(HttpClient);

  // Modo mock: auth-server simulado en memoria (no hace falta levantar el backend)
  private readonly mockStore = environment.useMocks ? inject(AuthMockStore) : null;

  private readonly _accessToken = signal<string | null>(null);

  readonly accessToken = this._accessToken.asReadonly();

  readonly currentUser = computed(() => {
    const token = this._accessToken();

    return token ? this.decodeToken(token) : null;
  });

  private readonly baseUrl =
    `${environment.api.authUrl}/auth`;

  // =========================
  // LOGIN
  // =========================

  login(credentials: LoginRequest): Observable<TokenResponse> {

    const request$ = this.mockStore
      ? this.mockStore.login(credentials.username, credentials.password)
      : this.http.post<TokenResponse>(
          `${this.baseUrl}/login`,
          credentials,
          {
            withCredentials: true,
          },
        );

    return request$
      .pipe(
        tap(response => {
          this._accessToken.set(response.accessToken);
        }),
      );
  }

  // =========================
  // REFRESH TOKEN
  // =========================

  refreshToken(): Observable<TokenResponse> {

    // Sin cookie de refresh en mock: la sesión dura hasta recargar la página
    if (this.mockStore) {
      return throwError(() => new Error('Refresh no disponible en modo mock'));
    }

    return this.http
      .post<TokenResponse>(
        `${this.baseUrl}/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(response => {
          this._accessToken.set(response.accessToken);
        }),
      );
  }

  // =========================
  // LOGOUT
  // =========================

  logout(): Observable<void> {

    if (this.mockStore) {
      this.clearAccessToken();

      return of(undefined);
    }

    return this.http
      .post<void>(
        `${this.baseUrl}/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.clearAccessToken();
        }),
      );
  }

  // =========================
  // ACCESS TOKEN
  // =========================

  setAccessToken(token: string): void {
    this._accessToken.set(token);
  }

  clearAccessToken(): void {
    this._accessToken.set(null);
  }

  // =========================
  // AUTH STATE
  // =========================

  isAuthenticated(): boolean {
    return this._accessToken() !== null;
  }

  hasPermission(permission: string): boolean {
    return this.currentUser()?.permissions.includes(permission) ?? false;
  }

  // Solo lee el payload para la UI; la firma la valida el backend en cada petición
  private decodeToken(token: string): AuthUser | null {
    try {
      const payload = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const json = decodeURIComponent(
        atob(payload)
          .split('')
          .map(char => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      );

      const claims = JSON.parse(json);

      return {
        userId: Number(claims.userId),
        email: claims.sub ?? '',
        role: claims.role ?? '',
        permissions: claims.permissions ?? [],
      };
    } catch {
      return null;
    }
  }
}