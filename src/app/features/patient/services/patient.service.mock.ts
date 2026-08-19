import {Injectable, signal} from '@angular/core';
import {Observable, of} from 'rxjs';

import {
  PageResponse,
  PatientRequest,
  PatientResponse,
} from '../model/patient.dtos';

import {PatientService} from './patient.service';
import {PATIENTS_MOCK} from '../mocks/patient.mocks';


@Injectable()
export class PatientMockService extends PatientService {

  private readonly _patients =
    signal<PageResponse<PatientResponse>>(
      structuredClone(PATIENTS_MOCK),
    );

  readonly patients =
    this._patients.asReadonly();


  // ============================
  // Obtener pacientes
  // ============================

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<PatientResponse>> {

    const patients =
      this._patients().content;

    const totalElements =
      patients.length;

    const totalPages =
      Math.ceil(totalElements / size);

    const start =
      page * size;

    const end =
      start + size;

    const content =
      patients.slice(start, end);

    const response: PageResponse<PatientResponse> = {

      content,

      totalElements,

      totalPages,

      size,

      number: page,

      first: page === 0,

      last: page >= totalPages - 1,

      numberOfElements:
        content.length,
    };

    return of(response);
  }


  // ============================
  // Buscar por ID
  // ============================

  findById(
    id: number,
  ): Observable<PatientResponse> {

    const patient =
      this._patients()
        .content
        .find(item => item.id === id);

    if (!patient) {
      throw new Error(
        `Paciente ${id} no encontrado`,
      );
    }

    return of(patient);
  }


  // ============================
  // Buscar por DNI
  // ============================

  findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientResponse> {

    const patient =
      this._patients()
        .content
        .find(
          item =>
            item.documentNumber === documentNumber,
        );

    if (!patient) {
      throw new Error(
        `Paciente ${documentNumber} no encontrado`,
      );
    }

    return of(patient);
  }


  // ============================
  // Crear
  // ============================

  create(
    request: PatientRequest,
  ): Observable<PatientResponse> {

    const current =
      this._patients();

    const now =
      new Date().toISOString();

    const patient: PatientResponse = {

      ...request,

      id: Date.now(),

      birthDate:
        request.birthDate ?? '',

      active: true,

      createdAt: now,

      updatedAt: now,
    };


    this._patients.set({

      ...current,

      content: [
        ...current.content,
        patient,
      ],

      totalElements:
        current.totalElements + 1,

      numberOfElements:
        current.numberOfElements + 1,
    });


    return of(patient);
  }


  // ============================
  // Actualizar
  // ============================

  update(
    id: number,
    request: PatientRequest,
  ): Observable<PatientResponse> {

    const current =
      this._patients();

    const existing =
      current.content
        .find(item => item.id === id);

    if (!existing) {
      throw new Error(
        `Paciente ${id} no encontrado`,
      );
    }


    const updated: PatientResponse = {

      ...existing,

      ...request,

      birthDate:
        request.birthDate ??
        existing.birthDate,

      updatedAt:
        new Date().toISOString(),
    };


    this._patients.set({

      ...current,

      content:
        current.content.map(
          item =>
            item.id === id
              ? updated
              : item,
        ),
    });


    return of(updated);
  }


  // ============================
  // Eliminar
  // ============================

  delete(
    id: number,
  ): Observable<void> {

    const current =
      this._patients();


    this._patients.set({

      ...current,

      content:
        current.content.filter(
          item => item.id !== id,
        ),

      totalElements:
        current.totalElements - 1,

      numberOfElements:
        current.numberOfElements - 1,
    });


    return of(void 0);
  }
}