import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { PageResponse } from '../../../shared/models/page.type';
import {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorResponse,
  CreateSpecialtyRequest,
  SpecialtyResponse,
} from '../interfaces';

import { DoctorService } from './doctor.service';
import { environment } from '@environments/environment';

@Injectable()
export class DoctorHttpService implements DoctorService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.api.baseUrl}/doctors`;

  private readonly _doctors = signal<PageResponse<DoctorResponse> | null>(null);

  readonly doctors = this._doctors.asReadonly();

  findAll(page: number = 0, size: number = 10): Observable<PageResponse<DoctorResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<DoctorResponse>>(`${this.apiUrl}/crud`, { params }).pipe(
      tap((response) => this._doctors.set(response)),
    );
  }

  findById(id: number): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.apiUrl}/crud/${id}`);
  }

  findBySpecialty(
    specialtyId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<DoctorResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<DoctorResponse>>(
      `${this.apiUrl}/crud/specialty/${specialtyId}`,
      { params },
    );
  }

  create(doctor: CreateDoctorRequest): Observable<DoctorResponse> {

    return this.http.post<DoctorResponse>(`${this.apiUrl}/crud`, doctor).pipe(
      tap((created) => {

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
    );
  }

  update(id: number, doctor: UpdateDoctorRequest): Observable<DoctorResponse> {
    return this.http.put<DoctorResponse>(`${this.apiUrl}/crud/${id}`, doctor).pipe(
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

  findAllSpecialties(): Observable<SpecialtyResponse[]> {
    return this.http.get<SpecialtyResponse[]>(`${this.apiUrl}/specialties`);
  }

  createSpecialty(specialty: CreateSpecialtyRequest): Observable<SpecialtyResponse> {
    return this.http.post<SpecialtyResponse>(`${this.apiUrl}/specialties`, specialty);
  }
}
