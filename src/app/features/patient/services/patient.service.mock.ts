import {
  Injectable,
  inject,
  signal,
} from '@angular/core';

import {
  HttpErrorResponse,
} from '@angular/common/http';

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

import {
  PageResponse,
} from '@shared/models/page.type';

import {
  PatientService,
} from './patient.service';

import {
  PATIENTS_MOCK,
} from '../mocks/patient.mocks';

import {
  PATIENT_DETAILS_MOCK,
} from '../mocks/patient.detail.mocks';

import {
  ErrorHandlerService,
} from '@core/services/error-handler.service';

import {
  GENDERS,
} from '@patients/constans/patient-options';

import {
  ProblemDetailMicroservice,
} from '@shared/models/problem.type';

@Injectable()
export class PatientMockService
  extends PatientService {

  private readonly errorHandler =
    inject(ErrorHandlerService);

  // =====================================================
  // PATIENTS
  // =====================================================

  private readonly _patients =
    signal<PageResponse<PatientResponse>>(
      structuredClone(PATIENTS_MOCK),
    );

  // =====================================================
  // PATIENT DETAILS
  // =====================================================

  private readonly _patientDetails =
    signal<PatientDetailResponse[]>(
      structuredClone(PATIENT_DETAILS_MOCK),
    );

  // =====================================================
  // HANDLE ERROR
  // =====================================================

  private handleError(
    status: number,
    title: string,
    detail: string,
    code?: string,
  ): Observable<never> {

    const problem: ProblemDetailMicroservice = {

      type:
        'about:blank',

      title,

      status,

      detail,

      instance:
        undefined,

      code,
    };

    console.log(
      '🧪 MOCK PROBLEM:',
      problem,
    );

    const error =
      new HttpErrorResponse({

        status,

        statusText:
          title,

        error:
          problem,

      });

    this.errorHandler.handle(error);

    return throwError(
      () => error,
    );
  }

  // =====================================================
  // FIND ALL
  // =====================================================

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<
    PageResponse<PatientResponse>
  > {

    const patients =
      this._patients().content;

    const totalElements =
      patients.length;

    const totalPages =
      Math.ceil(
        totalElements / size,
      );

    const start =
      page * size;

    const end =
      start + size;

    const content =
      patients.slice(
        start,
        end,
      );

    return of({

      content,

      totalElements,

      totalPages,

      size,

      number:
        page,

      first:
        page === 0,

      last:
        page >= totalPages - 1,

      numberOfElements:
        content.length,

    });
  }

  // =====================================================
  // FIND BY ID
  // =====================================================

  findById(
    id: number,
  ): Observable<PatientDetailResponse> {

    const patient =
      this._patientDetails()
        .find(
          item =>
            item.id === id,
        );

    if (!patient) {

      return this.handleError(
        404,
        'Paciente no encontrado',
        `Paciente ${id} no encontrado`,
        'PATIENT_NOT_FOUND',
      );
    }

    return of(patient);
  }

  // =====================================================
  // FIND BY DOCUMENT NUMBER
  // =====================================================

  findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientResponse> {

    const patient =
      this._patients()
        .content
        .find(
          item =>
            item.documentNumber ===
            documentNumber,
        );

    if (!patient) {

      return this.handleError(
        404,
        'Paciente no encontrado',
        `Paciente con documento ${documentNumber} no encontrado`,
        'PATIENT_NOT_FOUND',
      );
    }

    return of(patient);
  }

  // =====================================================
  // CREATE
  // =====================================================

  create(
    patient: PatientRequest,
  ): Observable<PatientResponse> {

    const documentExists =
      this._patients()
        .content
        .some(
          item =>
            item.documentNumber ===
            patient.documentNumber,
        );

    if (documentExists) {

      return this.handleError(
        409,
        'Paciente ya existe',
        `El documento ${patient.documentNumber} ya está registrado`,
        'PATIENT_DOCUMENT_EXISTS',
      );
    }

    const id =
      Date.now();

    const newPatient:
      PatientResponse = {

      id,

      documentNumber:
        patient.documentNumber,

      firstName:
        patient.firstName,

      lastName:
        patient.lastName,

      birthDate:
        patient.birthDate,

      phone:
        patient.phone,

      email:
        patient.email,

      active:
        true,
    };

    this._patients.update(
      current => ({

        ...current,

        content: [
          ...current.content,
          newPatient,
        ],

        totalElements:
          current.totalElements + 1,

        numberOfElements:
          current.numberOfElements + 1,

      }),
    );

    return of(
      newPatient,
    );
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientResponse> {

    const existing =
      this._patients()
        .content
        .find(
          item =>
            item.id === id,
        );

    // -----------------------------------------
    // NOT FOUND
    // -----------------------------------------

    if (!existing) {

      return this.handleError(
        404,
        'Paciente no encontrado',
        `Paciente ${id} no encontrado`,
        'PATIENT_NOT_FOUND',
      );
    }

    // -----------------------------------------
    // DUPLICATE DOCUMENT
    // -----------------------------------------

    const documentExists =
      this._patients()
        .content
        .some(
          item =>
            item.documentNumber ===
              patient.documentNumber &&
            item.id !== id,
        );

    if (documentExists) {

      return this.handleError(
        409,
        'Paciente ya existe',
        `El documento ${patient.documentNumber} ya está registrado`,
        'PATIENT_DOCUMENT_EXISTS',
      );
    }

    // -----------------------------------------
    // UPDATE PATIENT
    // -----------------------------------------

    const updatedPatient:
      PatientResponse = {

      ...existing,

      documentNumber:
        patient.documentNumber,

      firstName:
        patient.firstName,

      lastName:
        patient.lastName,

      birthDate:
        patient.birthDate,

      phone:
        patient.phone,

      email:
        patient.email,

      gender:
        GENDERS.find(
          gender =>
            gender.id ===
            patient.gender,
        )?.value ??
        'MALE',
    };

    // -----------------------------------------
    // UPDATE LIST
    // -----------------------------------------

    this._patients.update(
      current => ({

        ...current,

        content:
          current.content.map(
            item =>
              item.id === id
                ? updatedPatient
                : item,
          ),

      }),
    );

    // -----------------------------------------
    // UPDATE DETAILS
    // -----------------------------------------

    this._patientDetails.update(
      current =>
        current.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  ...patient,
                  updatedAt:
                    new Date()
                      .toISOString(),
                }
              : item,
        ),
    );

    return of(
      updatedPatient,
    );
  }

  // =====================================================
  // DELETE
  // =====================================================

  delete(
    id: number,
  ): Observable<void> {

    const exists =
      this._patients()
        .content
        .some(
          item =>
            item.id === id,
        );

    if (!exists) {

      return this.handleError(
        404,
        'Paciente no encontrado',
        `Paciente ${id} no encontrado`,
        'PATIENT_NOT_FOUND',
      );
    }

    this._patients.update(
      current => {

        const content =
          current.content.filter(
            item =>
              item.id !== id,
          );

        return {

          ...current,

          content,

          totalElements:
            content.length,

          numberOfElements:
            content.length,

        };
      },
    );

    this._patientDetails.update(
      current =>
        current.filter(
          item =>
            item.id !== id,
        ),
    );

    return of(
      void 0,
    );
  }
}