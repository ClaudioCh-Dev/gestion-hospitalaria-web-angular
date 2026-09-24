import { Injectable, signal } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { PageResponse } from '../../../shared/models/page.type';

import {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorResponse,
  CreateSpecialtyRequest,
  SpecialtyResponse,
} from '../intefaces';

import { DoctorService } from './doctor.service';

import { DOCTORS_MOCK } from '../mocks/doctor.mocks';


@Injectable()
export class DoctorMockService extends DoctorService {

   private readonly specialties: SpecialtyResponse[] = [
      {
        id: 1,
        name: 'Cardiología',
        description:
          'Especialidad dedicada al diagnóstico y tratamiento de enfermedades del corazón.',
      },
      {
        id: 2,
        name: 'Pediatría',
        description:
          'Atención médica especializada para niños y adolescentes.',
      },
      {
        id: 3,
        name: 'Dermatología',
        description:
          'Diagnóstico y tratamiento de enfermedades de la piel.',
      },
      {
        id: 4,
        name: 'Neurología',
        description:
          'Especialidad enfocada en enfermedades del sistema nervioso.',
      },
      {
        id: 5,
        name: 'Traumatología',
        description:
          'Tratamiento de lesiones y enfermedades del sistema musculoesquelético.',
      },
      {
        id: 6,
        name: 'Medicina Interna',
        description:
          'Atención integral de enfermedades en pacientes adultos.',
      },
      {
        id: 7,
        name: 'Cirugía General',
        description:
          'Tratamiento quirúrgico de diversas enfermedades y lesiones.',
      },
      {
        id: 8,
        name: 'Ginecología',
        description:
          'Atención especializada de la salud reproductiva femenina.',
      },
      {
        id: 9,
        name: 'Oftalmología',
        description:
          'Diagnóstico y tratamiento de enfermedades de los ojos.',
      },
    ];

  // =====================================================
  // MOCK DELAY
  // =====================================================

  private readonly MOCK_DELAY = 1500;

  // =====================================================
  // DOCTORS
  // =====================================================

  private readonly _doctors = signal<PageResponse<DoctorResponse>>(
    structuredClone(DOCTORS_MOCK),
  );

  readonly doctors = this._doctors.asReadonly();

  // =====================================================
  // FIND ALL
  // =====================================================

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<DoctorResponse>> {

    const doctors = this._doctors().content;
    const totalElements = doctors.length;
    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;
    const end = start + size;

    const content = doctors.slice(start, end);

    const response: PageResponse<DoctorResponse> = {
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: content.length,
    };

    return of(response).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND BY ID
  // =====================================================

  findById(
    id: number,
  ): Observable<DoctorResponse> {

    const doctor = this._doctors().content.find(
      (item) => item.id === id,
    );

    if (!doctor) {
      throw new Error(
        `Doctor ${id} no encontrado`,
      );
    }

    return of(doctor).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND BY SPECIALTY
  // =====================================================

  findBySpecialty(
    specialtyId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<DoctorResponse>> {

    const doctors = this._doctors().content.filter(
      (doctor) => doctor.specialtyId === specialtyId,
    );

    const totalElements = doctors.length;
    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;
    const end = start + size;

    const content = doctors.slice(start, end);

    const response: PageResponse<DoctorResponse> = {
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: totalPages === 0 || page >= totalPages - 1,
      numberOfElements: content.length,
    };

    return of(response).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // CREATE DOCTOR
  // =====================================================

  create(
    request: CreateDoctorRequest,
  ): Observable<DoctorResponse> {

    const current = this._doctors();
    const doctor: DoctorResponse = {
      id: Date.now(),
      licenseNumber: request.licenseNumber,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,

      specialtyId: request.specialtyId,
      specialtyName:
        this.specialties.find(
          (s) => s.id === request.specialtyId,
        )?.name || 'Especialidad',

      scheduleStart: request.scheduleStart,
      scheduleEnd: request.scheduleEnd,
      active: true,
    };

    this._doctors.set({
      ...current,

      content: [
        ...current.content,
        doctor,
      ],

      totalElements: current.totalElements + 1,
      numberOfElements: current.numberOfElements + 1,
    });

    return of(doctor).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // UPDATE DOCTOR
  // =====================================================

  update(
    id: number,
    request: UpdateDoctorRequest,
  ): Observable<DoctorResponse> {

    const current = this._doctors();

    const existing = current.content.find(
      (item) => item.id === id,
    );

    if (!existing) {
      throw new Error(
        `Doctor ${id} no encontrado`,
      );
    }

    const updated: DoctorResponse = {
      ...existing,

      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,

      specialtyId: request.specialtyId,
      specialtyName:
        this.specialties.find(
          (s) => s.id === request.specialtyId,
        )?.name || 'Especialidad',

      scheduleStart: request.scheduleStart,
      scheduleEnd: request.scheduleEnd,

      active:
        request.active ?? existing.active,
    };

    this._doctors.set({
      ...current,

      content: current.content.map(
        (item) =>
          item.id === id
            ? updated
            : item,
      ),
    });

    return of(updated).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND ALL SPECIALTIES
  // =====================================================

  findAllSpecialties(): Observable<SpecialtyResponse[]> {

    return of(this.specialties).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // CREATE SPECIALTY
  // =====================================================

  createSpecialty(
    request: CreateSpecialtyRequest,
  ): Observable<SpecialtyResponse> {

    const specialty: SpecialtyResponse = {
      id: Date.now(),
      name: request.name,
      description: request.description,
    };

    this.specialties.push(specialty);

    return of(specialty).pipe(
      delay(this.MOCK_DELAY),
    );
  }
}