import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { PageResponse } from '../../../shared/models/types.dto';
import {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorResponse,
  CreateSpecialtyRequest,
  SpecialtyResponse,
} from '../model/doctor.dtos';

import { DoctorService } from './doctor.service';

@Injectable()
export class DoctorHttpService implements DoctorService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:4040/doctor-ms';

  private readonly _doctors = signal<PageResponse<DoctorResponse> | null>(null);

  readonly doctors = this._doctors.asReadonly();

  findAll(page: number = 0, size: number = 10): Observable<PageResponse<DoctorResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);

    console.log('📤 GET doctores:', `${this.apiUrl}/doctors`);
    console.log('📤 Params:', params.toString());

    return this.http.get<PageResponse<DoctorResponse>>(`${this.apiUrl}/doctors`, { params }).pipe(
      tap((response) => {
        console.log('📥 DoctorHttpService recibió:', response);

        this._doctors.set(response);
      }),

      catchError((error) => {
        console.error('❌ Error GET doctores:', error);
        console.error('📄 Status:', error.status);
        console.error('📄 Body:', error.error);

        return throwError(() => error);
      }),
    );
  }

  findById(id: number): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.apiUrl}/doctors/${id}`);
  }

  findBySpecialty(
    specialtyId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<DoctorResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<DoctorResponse>>(
      `${this.apiUrl}/doctors/specialty/${specialtyId}`,
      { params },
    );
  }

  create(doctor: CreateDoctorRequest): Observable<DoctorResponse> {
    console.log('📤 Enviando doctor:', doctor);

    return this.http.post<DoctorResponse>(`${this.apiUrl}/doctors`, doctor).pipe(
      tap((created) => {
        console.log('✅ Doctor creado:', created);

        const current = this._doctors();

        if (!current) {
          return;
        }

        this._doctors.set({
          ...current,

          content: [...current.content, created],

          totalElements: current.totalElements + 1,
        });
      }),

      catchError((error) => {
        console.error('❌ Error al crear doctor:', error);
        console.error('📄 Status:', error.status);
        console.error('📄 Error body:', error.error);

        return throwError(() => error);
      }),
    );
  }

  update(id: number, doctor: UpdateDoctorRequest): Observable<DoctorResponse> {
    return this.http.put<DoctorResponse>(`${this.apiUrl}/doctors/${id}`, doctor).pipe(
      tap((updated) => {
        const current = this._doctors();

        if (!current) {
          return;
        }

        this._doctors.set({
          ...current,

          content: current.content.map((item) => (item.id === id ? updated : item)),
        });
      }),
    );
  }

  findAllSpecialties(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<SpecialtyResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<SpecialtyResponse>>(`${this.apiUrl}/specialties`, { params });
  }

  createSpecialty(specialty: CreateSpecialtyRequest): Observable<SpecialtyResponse> {
    return this.http.post<SpecialtyResponse>(`${this.apiUrl}/specialties`, specialty);
  }
}
