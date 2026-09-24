import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { TuiButton, TuiCell, TuiDialogContext, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiProgressBar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiSlides } from '@taiga-ui/layout';
import { injectContext } from '@taiga-ui/polymorpheus';

import {
  APPOINTMENT_STATUS_APPEARANCES,
  APPOINTMENT_STATUS_LABELS,
} from '../../../appointment/constants/appointment-status';
import { AppointmentStatus } from '../../../appointment/interfaces';
import { BillingStatus } from '../../../billing/interfaces';
import { BillingRecordService } from '../../../billing/services/billing-record.service';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { BLOOD_TYPES } from '../../../patient/constans/patient-options';
import { PatientService } from '../../../patient/services/patient.service';
import { MedicalRecordResponse } from '../../interfaces/medical-record-response';

const STEPS = 3;

// Facturas del paciente revisadas para encontrar la de esta cita
const BILLING_LOOKUP_SIZE = 100;

@Component({
  selector: 'app-medical-record-detail-dialog',
  imports: [
    CurrencyPipe,
    DatePipe,
    TuiAvatar,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    TuiProgressBar,
    TuiSlides,
    TuiTitle,
  ],
  templateUrl: './medical-record-detail-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRecordDetailDialog {
  private readonly context = injectContext<TuiDialogContext<void, MedicalRecordResponse>>();

  private readonly patientService = inject(PatientService);
  private readonly doctorService = inject(DoctorService);
  private readonly billingService = inject(BillingRecordService);

  protected readonly record = this.context.data;

  protected readonly steps = STEPS;

  protected readonly step = signal(1);

  // Dirección de la animación de tuiSlides: negativo = atrás, positivo = adelante
  protected readonly direction = signal(0);

  protected readonly stepTitles = ['Atención', 'Paciente', 'Médico y facturación'];

  protected readonly status = this.record.status as AppointmentStatus;

  protected readonly statusLabel = APPOINTMENT_STATUS_LABELS[this.status] ?? this.record.status;

  protected readonly statusAppearance = APPOINTMENT_STATUS_APPEARANCES[this.status] ?? 'neutral';

  protected readonly billingStatusLabels: Record<BillingStatus, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
  };

  protected readonly billingStatusAppearances: Record<BillingStatus, string> = {
    PENDING: 'warning',
    PAID: 'positive',
    CANCELLED: 'negative',
  };

  protected readonly patientResource = rxResource({
    stream: () => this.patientService.findById(this.record.patientId),
  });

  protected readonly doctorResource = rxResource({
    stream: () => this.doctorService.findById(this.record.doctorId),
  });

  protected readonly billingResource = rxResource({
    stream: () =>
      this.billingService
        .findByPatientId(this.record.patientId, 0, BILLING_LOOKUP_SIZE)
        .pipe(
          map(
            (page) =>
              page.content.find((item) => item.appointmentId === this.record.appointmentId) ??
              null,
          ),
        ),
  });

  protected readonly bloodTypeLabel = computed(() => {
    const bloodType = this.patientResource.value()?.bloodType;

    if (!bloodType) {
      return 'No especificado';
    }

    return BLOOD_TYPES.find((option) => option.id === bloodType)?.value ?? bloodType;
  });

  protected readonly age = computed(() => {
    const birthDate = this.patientResource.value()?.birthDate;

    if (!birthDate) {
      return null;
    }

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const beforeBirthday =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());

    if (beforeBirthday) {
      age--;
    }

    return age;
  });

  protected onStep(delta: number): void {
    this.direction.set(delta);
    this.step.update((step) => step + delta);
  }

  protected next(): void {
    if (this.step() < STEPS) {
      this.onStep(1);
      return;
    }

    this.close();
  }

  protected close(): void {
    this.context.completeWith();
  }
}
