import {
  Injectable,
  inject,
  signal,
} from '@angular/core';

import {
  Observable,
  of,
  throwError,
} from 'rxjs';

import {
  PatientDetailResponse,
  PatientRequest,
  PatientResponse,
} from '../model';

import { PageResponse } from '@shared/models/page.type';

import { PatientService } from './patient.service';

import { PATIENTS_MOCK } from '../mocks/patient.mocks';
import { PATIENT_DETAILS_MOCK } from '../mocks/patient.detail.mocks';

import { NotificationInfoService } from '@shared/services/notification-service';
import { GENDERS } from '@patients/constans/patient-options';

@Injectable()
export class PatientMockService extends PatientService {

  private readonly notification = inject(
    NotificationInfoService,
  );

  private readonly _patients =
    signal<PageResponse<PatientResponse>>(
      structuredClone(PATIENTS_MOCK),
    );

  private readonly _patientDetails =
    signal<PatientDetailResponse[]>(
      structuredClone(PATIENT_DETAILS_MOCK),
    );

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<PatientResponse>> {

    const patients = this._patients().content;

    const totalElements = patients.length;

    const totalPages = Math.ceil(
      totalElements / size,
    );

    const start = page * size;
    const end = start + size;

    const content = patients.slice(
      start,
      end,
    );

    return of({
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: content.length,
    });
  }

  findById(
    id: number,
  ): Observable<PatientDetailResponse> {

    const patient = this._patientDetails()
      .find(item => item.id === id);

    if (!patient) {

      const message =
        `Paciente ${id} no encontrado`;

      this.notification.error(message);

      return throwError(
        () => new Error(message),
      );
    }

    return of(patient);
  }

  findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientResponse> {

    const patient = this._patients()
      .content
      .find(
        item =>
          item.documentNumber === documentNumber,
      );

    if (!patient) {

      const message =
        `Paciente ${documentNumber} no encontrado`;

      this.notification.error(message);

      return throwError(
        () => new Error(message),
      );
    }

    return of(patient);
  }

  create(
    patient: PatientRequest,
  ): Observable<PatientResponse> {

    const id = Date.now();

    const newPatient: PatientResponse = {
      id,
      documentNumber: patient.documentNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate,
      phone: patient.phone,
      email: patient.email,
      active: true,
    };

    this._patients.update(current => ({
      ...current,

      content: [
        ...current.content,
        newPatient,
      ],

      totalElements:
        current.totalElements + 1,

      numberOfElements:
        current.numberOfElements + 1,
    }));

    return of(newPatient);
  }

  update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientResponse> {

    const existing = this._patients()
      .content
      .find(item => item.id === id);

    if (!existing) {

      const message =
        `Paciente ${id} no encontrado`;

      this.notification.error(message);

      return throwError(
        () => new Error(message),
      );
    }

    const updatedPatient: PatientResponse = {
      ...existing,
      documentNumber: patient.documentNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate,
      phone: patient.phone,
      email: patient.email,
      gender: GENDERS.find(gender => gender.id === patient.gender)?.value || 'MALE',
    };

    this._patients.update(current => ({
      ...current,

      content: current.content.map(item =>
        item.id === id
          ? updatedPatient
          : item,
      ),
    }));

    this._patientDetails.update(current =>
      current.map(item =>
        item.id === id
          ? {
              ...item,
              ...patient,
              updatedAt:
                new Date().toISOString(),
            }
          : item,
      ),
    );

    return of(updatedPatient);
  }

  delete(
    id: number,
  ): Observable<void> {

    const exists = this._patients()
      .content
      .some(item => item.id === id);

    if (!exists) {

      const message =
        `Paciente ${id} no encontrado`;

      this.notification.error(message);

      return throwError(
        () => new Error(message),
      );
    }

    this._patients.update(current => {

      const content = current.content
        .filter(item => item.id !== id);

      return {
        ...current,
        content,
        totalElements: content.length,
        numberOfElements: content.length,
      };
    });

    this._patientDetails.update(current =>
      current.filter(
        item => item.id !== id,
      ),
    );

    return of(void 0);
  }
}