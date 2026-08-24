import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PageResponse } from '../../../shared/models/page.type';
import {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorResponse,
  CreateSpecialtyRequest,
  SpecialtyResponse,
} from '../model/doctor.dtos';

import { DoctorService } from './doctor.service';
import { DOCTORS_MOCK } from '../mocks/doctor.mocks';
import { SPECIALTIES_MOCK } from '../constans/doctor-options';

@Injectable()
export class DoctorMockService extends DoctorService {
  private readonly _doctors = signal<PageResponse<DoctorResponse>>(structuredClone(DOCTORS_MOCK));

  readonly doctors = this._doctors.asReadonly();

  // ============================
  // Obtener doctores
  // ============================

  findAll(page: number = 0, size: number = 10): Observable<PageResponse<DoctorResponse>> {
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

    return of(response);
  }

  // ============================
  // Buscar por ID
  // ============================

  findById(id: number): Observable<DoctorResponse> {
    const doctor = this._doctors().content.find((item) => item.id === id);

    if (!doctor) {
      throw new Error(`Doctor ${id} no encontrado`);
    }

    return of(doctor);
  }

  // ============================
  // Buscar por especialidad
  // ============================

  findBySpecialty(
    specialtyId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<DoctorResponse>> {
    const doctors = this._doctors().content.filter((doctor) => doctor.specialty.id === specialtyId);

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

    return of(response);
  }

  // ============================
  // Crear doctor
  // ============================

  create(request: CreateDoctorRequest): Observable<DoctorResponse> {
    const current = this._doctors();

    const now = new Date().toISOString();

    const doctor: DoctorResponse = {
      id: Date.now(),

      licenseNumber: request.licenseNumber,

      firstName: request.firstName,

      lastName: request.lastName,

      email: request.email,

      phone: request.phone,

      specialty: {
        id: request.specialtyId,
        name:
          SPECIALTIES_MOCK.find((s) => s.id === request.specialtyId)?.value || 'Especialidad',
        description: '',
      },

      scheduleStart: request.scheduleStart,

      scheduleEnd: request.scheduleEnd,

      active: true,

      createdAt: now,
    };

    this._doctors.set({
      ...current,

      content: [...current.content, doctor],

      totalElements: current.totalElements + 1,

      numberOfElements: current.numberOfElements + 1,
    });

    return of(doctor);
  }

  // ============================
  // Actualizar doctor
  // ============================

  update(id: number, request: UpdateDoctorRequest): Observable<DoctorResponse> {
    const current = this._doctors();

    const existing = current.content.find((item) => item.id === id);

    if (!existing) {
      throw new Error(`Doctor ${id} no encontrado`);
    }

    const updated: DoctorResponse = {
      ...existing,

      firstName: request.firstName,

      lastName: request.lastName,

      email: request.email,

      phone: request.phone,

      specialty: {
        ...existing.specialty,
        id: request.specialtyId,
        name:
          SPECIALTIES_MOCK.find((s) => s.id === request.specialtyId)?.value || 'Especialidad',
      },

      scheduleStart: request.scheduleStart,

      scheduleEnd: request.scheduleEnd,

      active: request.active ?? existing.active,
    };

    this._doctors.set({
      ...current,

      content: current.content.map((item) => (item.id === id ? updated : item)),
    });

    return of(updated);
  }

  // ============================
  // Obtener especialidades
  // ============================

  findAllSpecialties(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<SpecialtyResponse>> {
    const specialties: SpecialtyResponse[] = [
      {
        id: 1,
        name: 'Cardiología',
        description:
          'Especialidad dedicada al diagnóstico y tratamiento de enfermedades del corazón.',
      },

      {
        id: 2,
        name: 'Pediatría',
        description: 'Atención médica especializada para niños y adolescentes.',
      },

      {
        id: 3,
        name: 'Dermatología',
        description: 'Diagnóstico y tratamiento de enfermedades de la piel.',
      },

      {
        id: 4,
        name: 'Neurología',
        description: 'Especialidad enfocada en enfermedades del sistema nervioso.',
      },

      {
        id: 5,
        name: 'Traumatología',
        description: 'Tratamiento de lesiones y enfermedades del sistema musculoesquelético.',
      },

      {
        id: 6,
        name: 'Medicina Interna',
        description: 'Atención integral de enfermedades en pacientes adultos.',
      },

      {
        id: 7,
        name: 'Cirugía General',
        description: 'Tratamiento quirúrgico de diversas enfermedades y lesiones.',
      },

      {
        id: 8,
        name: 'Ginecología',
        description: 'Atención especializada de la salud reproductiva femenina.',
      },

      {
        id: 9,
        name: 'Oftalmología',
        description: 'Diagnóstico y tratamiento de enfermedades de los ojos.',
      },
    ];

    const totalElements = specialties.length;

    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;

    const end = start + size;

    const content = specialties.slice(start, end);

    return of({
      content,

      totalElements,

      totalPages,

      size,

      number: page,

      first: page === 0,

      last: totalPages === 0 || page >= totalPages - 1,

      numberOfElements: content.length,
    });
  }

  // ============================
  // Crear especialidad
  // ============================

  createSpecialty(request: CreateSpecialtyRequest): Observable<SpecialtyResponse> {
    const specialty: SpecialtyResponse = {
      id: Date.now(),

      name: request.name,

      description: request.description,
    };

    return of(specialty);
  }
}
