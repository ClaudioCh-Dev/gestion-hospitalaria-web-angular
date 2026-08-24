import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

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

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>('http://localhost:3000/auth-server/auth/login', credentials)
      .pipe(
        tap((response) => {
          this._accessToken.set(response.accessToken);
        }),
      );
  }

  setAccessToken(token: string): void {
    this._accessToken.set(token);
  }

  clearAccessToken(): void {
    this._accessToken.set(null);
  }

  isAuthenticated(): boolean {
    return this._accessToken() !== null;
  }
}
