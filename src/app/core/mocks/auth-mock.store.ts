import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

import { ProblemDetailMicroservice } from '@shared/models/problem.type';

interface MockAccount {
  userId: number;
  email: string;
  password: string;
  role: string;
  permissions: string[];
}

// Mismos permisos que asigna el DataSeeder de auth-server
const DOCTOR_PERMISSIONS = [
  'PATIENT_READ',
  'APPOINTMENT_READ',
  'APPOINTMENT_READ_BY_DOCTOR',
  'APPOINTMENT_UPDATE_STATUS',
  'APPOINTMENT_TYPE_READ',
  'DOCTOR_READ',
  'DOCTOR_READ_BY_SPECIALTY',
  'SPECIALTY_READ',
  'MEDICAL_RECORD_READ',
  'MEDICAL_RECORD_READ_BY_PATIENT',
  'NOTIFICATION_READ_DOCTOR',
  'NOTIFICATION_MARK_READ_DOCTOR',
];

const ADMIN_PERMISSIONS = [
  'PATIENT_READ', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'PATIENT_DELETE',
  'APPOINTMENT_CREATE', 'APPOINTMENT_READ', 'APPOINTMENT_READ_BY_PATIENT', 'APPOINTMENT_READ_BY_DOCTOR',
  'APPOINTMENT_UPDATE_STATUS', 'APPOINTMENT_CANCEL',
  'APPOINTMENT_TYPE_CREATE', 'APPOINTMENT_TYPE_READ', 'APPOINTMENT_TYPE_UPDATE', 'APPOINTMENT_TYPE_DELETE',
  'BILLING_CREATE', 'BILLING_READ', 'BILLING_READ_BY_PATIENT', 'BILLING_PAY',
  'BILLING_TARIFF_CREATE', 'BILLING_TARIFF_UPDATE', 'BILLING_TARIFF_READ',
  'DOCTOR_READ', 'DOCTOR_READ_BY_SPECIALTY', 'DOCTOR_CREATE', 'DOCTOR_UPDATE',
  'SPECIALTY_READ', 'SPECIALTY_CREATE',
  'MEDICAL_RECORD_READ', 'MEDICAL_RECORD_READ_BY_PATIENT',
  'NOTIFICATION_CREATE', 'NOTIFICATION_READ_ADMIN', 'NOTIFICATION_MARK_READ_ADMIN',
  'USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
];

const MOCK_DELAY = 800;

/**
 * auth-server simulado para el modo mock: mismas cuentas que el DataSeeder
 * (admin@example.com / doctor@example.com, contraseña 123456).
 *
 * Las contraseñas viven en memoria: un cambio de contraseña sirve para el
 * siguiente login, y al recargar la página vuelven a 123456.
 */
@Injectable({ providedIn: 'root' })
export class AuthMockStore {

  private readonly accounts: MockAccount[] = [
    { userId: 1, email: 'admin@example.com', password: '123456', role: 'ADMIN', permissions: ADMIN_PERMISSIONS },
    { userId: 2, email: 'doctor@example.com', password: '123456', role: 'DOCTOR', permissions: DOCTOR_PERMISSIONS },
  ];

  login(email: string, password: string): Observable<{ accessToken: string }> {
    const account = this.accounts.find(
      item => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
    );

    if (!account) {
      return this.error(401, 'Credenciales inválidas', 'Correo o contraseña incorrectos', 'AUTH_INVALID_CREDENTIALS');
    }

    return of({ accessToken: this.buildToken(account) }).pipe(delay(MOCK_DELAY));
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<void> {
    const account = this.accounts.find(item => item.userId === userId);

    if (!account) {
      return this.error(404, 'Usuario no encontrado', 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (account.password !== currentPassword) {
      return this.error(400, 'Contraseña incorrecta', 'La contraseña actual es incorrecta', 'INVALID_PASSWORD');
    }

    return timer(MOCK_DELAY * 2).pipe(
      switchMap(() => {
        account.password = newPassword;

        return of(undefined);
      }),
    );
  }

  // JWT sin firma válida: el frontend solo lee el payload
  private buildToken(account: MockAccount): string {
    const encode = (value: object) =>
      btoa(unescape(encodeURIComponent(JSON.stringify(value))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const now = Math.floor(Date.now() / 1000);

    return [
      encode({ alg: 'none', typ: 'JWT' }),
      encode({
        sub: account.email,
        role: account.role,
        userId: account.userId,
        permissions: account.permissions,
        iat: now,
        exp: now + 60 * 60,
      }),
      'mock-signature',
    ].join('.');
  }

  private error(status: number, title: string, detail: string, code: string): Observable<never> {
    const problem: ProblemDetailMicroservice = {
      type: 'about:blank',
      title,
      status,
      detail,
      instance: undefined,
      code,
    };

    return timer(MOCK_DELAY).pipe(
      switchMap(() =>
        throwError(() => new HttpErrorResponse({ status, statusText: title, error: problem })),
      ),
    );
  }
}
