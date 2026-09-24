import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '@environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly _accessToken = signal<string | null>(null);

  readonly accessToken = this._accessToken.asReadonly();

  private readonly baseUrl =
    `${environment.api.authUrl}/auth`;

  // =========================
  // LOGIN
  // =========================

  login(credentials: LoginRequest): Observable<TokenResponse> {

    return this.http
      .post<TokenResponse>(
        `${this.baseUrl}/login`,
        credentials,
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
  // REFRESH TOKEN
  // =========================

  refreshToken(): Observable<TokenResponse> {

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
}