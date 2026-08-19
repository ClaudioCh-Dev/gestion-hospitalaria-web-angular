import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly _accessToken = signal<string | null>("eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsInVzZXJJZCI6MSwiaWF0IjoxNzg3MDc4NTk3LCJleHAiOjE3ODcwODIxOTd9.LoVhc5VbcDh11yeZkCaEZ6gwvuwZSbp-j_6-IUHZVR4D-EuYplpMnmjeG96hbUbUIKGchW28uGi2VRiwuvoO9vLffOuzwlZOHt5UqukiyplvTuHOFFigj99ynUgzuWom3rQQeqlUPaK-5yaZseoeOpAqG04WgZIG5YUk2pY0w84Az7Q_91tmSVqKafIpyJl0tmThwKbfcY6mqUAPQ6LvCaK_j2UX_cIsXv060XoINEb02iHub2Y4hF7ePhAuERXZ37AkATMjhWaUbUe0WqfxVntkiXVDAitHejCab_4zh_YbkuvLytW4yqSk__DThePf3KYokf7y17EAM4KCazCtZw");

  readonly accessToken = this._accessToken.asReadonly()

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