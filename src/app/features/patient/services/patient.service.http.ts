import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';

import {PatientRequest, PatientResponse} from '../model/patient.dtos';
import {PageResponse} from '../../../shared/models/types.dto';

import {PatientService} from './patient.service';

@Injectable()
export class PatientHttpService implements PatientService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:4040/patients';

  private readonly _patients =
    signal<PageResponse<PatientResponse> | null>(null);

  readonly patients = this._patients.asReadonly();

findAll(
  page: number = 0,
  size: number = 10,
): Observable<PageResponse<PatientResponse>> {

  const params = new HttpParams()
    .set('page', page)
    .set('size', size);

  console.log('📤 GET pacientes:', this.apiUrl);
  console.log('📤 Params:', params.toString());

  return this.http
    .get<PageResponse<PatientResponse>>(
      this.apiUrl,
      {params},
    )
    .pipe(

      tap(response => {
        console.log('📥 PatientHttpService recibió:', response);

        this._patients.set(response);
      }),

      catchError(error => {

        console.error('❌ Error GET pacientes:', error);
        console.error('📄 Status:', error.status);
        console.error('📄 Body:', error.error);

        return throwError(() => error);
      }),
    );
}

  findById(
    id: number,
  ): Observable<PatientResponse> {

    return this.http.get<PatientResponse>(
      `${this.apiUrl}/${id}`,
    );
  }

  findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientResponse> {

    return this.http.get<PatientResponse>(
      `${this.apiUrl}/document/${documentNumber}`,
    );
  }

  create(patient: PatientRequest): Observable<PatientResponse> {
  console.log('📤 Enviando paciente:', patient);

  return this.http
    .post<PatientResponse>(this.apiUrl, patient)
    .pipe(
      tap(created => {
        console.log('✅ Paciente creado:', created);

        const current = this._patients();

        if (!current) {
          return;
        }

        this._patients.set({
          ...current,
          content: [
            ...current.content,
            created,
          ],
          totalElements: current.totalElements + 1,
        });
      }),

      catchError(error => {
        console.error('❌ Error al crear paciente:', error);
        console.error('📄 Status:', error.status);
        console.error('📄 Error body:', error.error);

        return throwError(() => error);
      }),
    );
}

  update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientResponse> {

    return this.http
      .put<PatientResponse>(
        `${this.apiUrl}/${id}`,
        patient,
      )
      .pipe(
        tap(updated => {

          const current = this._patients();

          if (!current) {
            return;
          }

          this._patients.set({
            ...current,
            content: current.content.map(
              item =>
                item.id === id
                  ? updated
                  : item,
            ),
          });
        }),
      );
  }

  delete(
    id: number,
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`,
      )
      .pipe(
        tap(() => {

          const current = this._patients();

          if (!current) {
            return;
          }

          this._patients.set({
            ...current,
            content: current.content.filter(
              item => item.id !== id,
            ),
            totalElements:
              current.totalElements - 1,
          });
        }),
      );
  }
}