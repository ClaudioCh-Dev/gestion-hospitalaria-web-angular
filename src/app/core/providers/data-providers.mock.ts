import { Provider } from '@angular/core';

import { AppointmentTypeService } from '../../features/appointment/services/appointment-type.service';
import { AppointmentService } from '../../features/appointment/services/appointment.service';
import { AppointmentMockService } from '../../features/appointment/services/impl/appointment-mock.service';
import { AppointmentTypeMockService } from '../../features/appointment/services/impl/appointment-type-mock.service';
import { BillingRecordMockService } from '../../features/billing/services/billing-record-mock.service';
import { BillingRecordService } from '../../features/billing/services/billing-record.service';
import { BillingTariffMockService } from '../../features/billing/services/billing-tariff-mock.service';
import { BillingTariffService } from '../../features/billing/services/billing-tariff.service';
import { DoctorService } from '../../features/doctor/services/doctor.service';
import { DoctorMockService } from '../../features/doctor/services/doctor.service.mock';
import { MedicalRecordMockService } from '../../features/medical-history/services/medical-record-mock.service';
import { MedicalRecordService } from '../../features/medical-history/services/medical-record.service';
import { PatientService } from '../../features/patient/services/patient.service';
import { PatientMockService } from '../../features/patient/services/patient.service.mock';
import { UserService } from '../../features/user/services/user.service';
import { UserMockService } from '../../features/user/services/user.service.mock';
import { AuthMockStore } from '../mocks/auth-mock.store';
import { AUTH_MOCK_BACKEND } from '../mocks/auth-mock.token';

/**
 * Implementaciones simuladas (configuración "mock"). Reemplaza a data-providers.ts
 * mediante fileReplacements en angular.json: solo se compila con --configuration mock.
 */
export const DATA_PROVIDERS: Provider[] = [
  { provide: PatientService, useClass: PatientMockService },
  { provide: DoctorService, useClass: DoctorMockService },
  { provide: AppointmentService, useClass: AppointmentMockService },
  { provide: AppointmentTypeService, useClass: AppointmentTypeMockService },
  { provide: BillingRecordService, useClass: BillingRecordMockService },
  { provide: BillingTariffService, useClass: BillingTariffMockService },
  { provide: MedicalRecordService, useClass: MedicalRecordMockService },
  { provide: UserService, useClass: UserMockService },

  // auth-server simulado: AuthService lo usa a través del token (login, logout, refresh)
  // y UserMockService directamente (cambio de contraseña)
  AuthMockStore,
  { provide: AUTH_MOCK_BACKEND, useExisting: AuthMockStore },
];
