import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

import {
  catchError,
  Observable,
  tap,
  throwError,
} from 'rxjs';

import {
  PatientDetailResponse,
  PatientRequest,
  PatientResponse,
} from '../model/patient.dtos';

import { PageResponse } from '../../../shared/models/page.type';
import {PatientService} from './patient.service';

@Injectable()
export class PatientHttpService implements PatientService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:4040/patients';

  private readonly _patients =
    signal<PageResponse<PatientResponse> | null>(null);

  readonly patients = this._patients.asReadonly();

  // ============================
  // Obtener pacientes
  // ============================

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<PatientResponse>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http
      .get<PageResponse<PatientResponse>>(
        this.apiUrl,
        {params},
      )
      .pipe(
        tap(response => {
          this._patients.set(response);
        }),
        catchError(error => {
          console.error('❌ Error GET pacientes:', error);
          return throwError(() => error);
        }),
      );
  }

  // ============================
  // Buscar por ID
  // ============================

  findById(
    id: number,
  ): Observable<PatientDetailResponse> {

    return this.http.get<PatientDetailResponse>(
      `${this.apiUrl}/${id}`,
    );
  }

  // ============================
  // Buscar por DNI
  // ============================

  findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientDetailResponse> {

    return this.http.get<PatientDetailResponse>(
      `${this.apiUrl}/document/${documentNumber}`,
    );
  }

  // ============================
  // Crear
  // ============================

  create(
    patient: PatientRequest,
  ): Observable<PatientDetailResponse> {

    return this.http
      .post<PatientDetailResponse>(
        this.apiUrl,
        patient,
      )
      .pipe(
        tap(created => {

          this._patients.update(current => {

            if (!current) {
              return current;
            }

            return {
              ...current,
              content: [
                ...current.content,
                created,
              ],
              totalElements: current.totalElements + 1,
              numberOfElements: current.numberOfElements + 1,
            };
          });

        }),
        catchError(error => {
          console.error('❌ Error al crear paciente:', error);
          return throwError(() => error);
        }),
      );
  }

  // ============================
  // Actualizar
  // ============================

  update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientDetailResponse> {

    return this.http
      .put<PatientDetailResponse>(
        `${this.apiUrl}/${id}`,
        patient,
      )
      .pipe(
        tap(updated => {

          this._patients.update(current => {

            if (!current) {
              return current;
            }

            return {
              ...current,
              content: current.content.map(item =>
                item.id === id
                  ? {
                      ...item,
                      documentNumber: updated.documentNumber,
                      firstName: updated.firstName,
                      lastName: updated.lastName,
                      birthDate: updated.birthDate,
                      gender: updated.gender,
                      phone: updated.phone,
                      email: updated.email,
                    }
                  : item,
              ),
            };
          });

        }),
      );
  }

  // ============================
  // Eliminar
  // ============================

  delete(
    id: number,
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`,
      )
      .pipe(
        tap(() => {

          this._patients.update(current => {

            if (!current) {
              return current;
            }

            const content = current.content.filter(
              item => item.id !== id,
            );

            return {
              ...current,
              content,
              totalElements: current.totalElements - 1,
              numberOfElements: content.length,
            };
          });

        }),
      );
  }
}