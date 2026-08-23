import {Injectable, signal} from '@angular/core';
import {Observable, of} from 'rxjs';

import {
  PatientDetailResponse,
  PatientRequest,
  PatientResponse,
} from '../model/patient.dtos';

import { PageResponse } from '../../../shared/models/page.type';
import {PatientService} from './patient.service';

import {PATIENTS_MOCK} from '../mocks/patient.mocks';
import {PATIENT_DETAILS_MOCK} from '../mocks/patient.detail.mocks';

@Injectable()
export class PatientMockService extends PatientService {

  private readonly _patients = signal<PageResponse<PatientResponse>>(
    structuredClone(PATIENTS_MOCK),
  );

  private readonly _patientDetails = signal<PatientDetailResponse[]>(
    structuredClone(PATIENT_DETAILS_MOCK),
  );

  readonly patients = this._patients.asReadonly();

  // ============================
  // Obtener pacientes
  // ============================

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<PatientResponse>> {

    const patients = this._patients().content;

    const totalElements = patients.length;
    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;
    const end = start + size;

    const content = patients.slice(start, end);

    const response: PageResponse<PatientResponse> = {
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

  findById(id: number): Observable<PatientDetailResponse> {

    const patient = this._patientDetails()
      .find(item => item.id === id);

    if (!patient) {
      throw new Error(`Paciente ${id} no encontrado`);
    }

    return of(patient);
  }

  // ============================
  // Buscar por DNI
  // ============================

  findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientDetailResponse> {

    const patient = this._patientDetails()
      .find(item => item.documentNumber === documentNumber);

    if (!patient) {
      throw new Error(`Paciente ${documentNumber} no encontrado`);
    }

    return of(patient);
  }

  // ============================
  // Crear
  // ============================

  create(
    patient: PatientRequest,
  ): Observable<PatientDetailResponse> {

    const id = Date.now();
    const now = new Date().toISOString();

    const newPatient: PatientResponse = {
      id,
      documentNumber: patient.documentNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      active: true,
    };

    const newPatientDetail: PatientDetailResponse = {
      id,
      documentNumber: patient.documentNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate ?? '',
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    this._patients.update(current => ({
      ...current,
      content: [
        ...current.content,
        newPatient,
      ],
      totalElements: current.totalElements + 1,
      numberOfElements: current.numberOfElements + 1,
    }));

    this._patientDetails.update(current => [
      ...current,
      newPatientDetail,
    ]);

    return of(newPatientDetail);
  }

  // ============================
  // Actualizar
  // ============================

  update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientDetailResponse> {

    const existing = this._patientDetails()
      .find(item => item.id === id);

    if (!existing) {
      throw new Error(`Paciente ${id} no encontrado`);
    }

    const updatedPatient: PatientDetailResponse = {
      ...existing,
      documentNumber: patient.documentNumber,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate ?? '',
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      updatedAt: new Date().toISOString(),
    };

    // Actualizar detalle
    this._patientDetails.update(current =>
      current.map(item =>
        item.id === id
          ? updatedPatient
          : item,
      ),
    );

    // Actualizar listado
    this._patients.update(current => ({
      ...current,
      content: current.content.map(item =>
        item.id === id
          ? {
              ...item,
              documentNumber: updatedPatient.documentNumber,
              firstName: updatedPatient.firstName,
              lastName: updatedPatient.lastName,
              birthDate: updatedPatient.birthDate,
              gender: updatedPatient.gender,
              phone: updatedPatient.phone,
              email: updatedPatient.email,
            }
          : item,
      ),
    }));

    return of(updatedPatient);
  }

  // ============================
  // Eliminar
  // ============================

  delete(id: number): Observable<void> {

    const exists = this._patients()
      .content
      .some(item => item.id === id);

    if (!exists) {
      throw new Error(`Paciente ${id} no encontrado`);
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
      current.filter(item => item.id !== id),
    );

    return of(void 0);
  }
}