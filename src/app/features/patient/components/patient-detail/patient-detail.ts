import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';

import { TuiButton, TuiIcon, TuiPopup, TuiTitle, TuiAppearance } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiDrawer, TuiInitialsPipe, TuiTabs } from '@taiga-ui/kit';

import {
  APPOINTMENT_STATUS_APPEARANCES,
  APPOINTMENT_STATUS_LABELS,
} from '../../../appointment/constants/appointment-status';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { BillingStatus } from '../../../billing/interfaces';
import { BillingRecordService } from '../../../billing/services/billing-record.service';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { MedicalRecordService } from '../../../medical-history/services/medical-record.service';
import { PatientDetailResponse } from '../../interfaces';

// Registros mostrados por pestaña
const TAB_PAGE_SIZE = 20;

enum PatientTab {
  INFO,
  APPOINTMENTS,
  BILLING,
  HISTORY,
}

@Component({
  selector: 'app-patient-detail',

  imports: [
    CurrencyPipe,
    DatePipe,
    TuiAppearance,
    TuiAvatar,
    TuiBadge,
    TuiButton,
    TuiDrawer,
    TuiIcon,
    TuiInitialsPipe,
    TuiPopup,
    TuiTabs,
    TuiTitle,
  ],

  templateUrl: './patient-detail.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDetailComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);
  private readonly billingService = inject(BillingRecordService);
  private readonly medicalRecordService = inject(MedicalRecordService);

  readonly patient = input<PatientDetailResponse | null>(null);

  readonly close = output<void>();

  protected readonly Tab = PatientTab;

  // Vuelve a "Información" cada vez que se abre otro paciente
  protected readonly activeTab = linkedSignal<PatientDetailResponse | null, PatientTab>({
    source: this.patient,
    computation: () => PatientTab.INFO,
  });

  private readonly patientId = computed(() => this.patient()?.id ?? null);

  protected readonly appointmentStatusLabels = APPOINTMENT_STATUS_LABELS;
  protected readonly appointmentStatusAppearances = APPOINTMENT_STATUS_APPEARANCES;

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

  // =====================================================
  // RESOURCES (cada pestaña carga solo cuando se abre)
  // =====================================================

  protected readonly appointmentsResource = rxResource({
    params: () => this.paramsFor(PatientTab.APPOINTMENTS),

    stream: ({ params }) =>
      forkJoin({
        appointments: this.appointmentService.findByPatient(params.id),
        doctors: this.doctorService
          .findAll(0, 100)
          .pipe(catchError(() => of(null))),
      }).pipe(
        map(({ appointments, doctors }) => {
          const names = new Map(
            (doctors?.content ?? []).map((doctor) => [
              doctor.id,
              `${doctor.firstName} ${doctor.lastName}`,
            ]),
          );

          return [...appointments]
            .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
            .map((appointment) => ({
              ...appointment,
              doctorName: names.get(appointment.doctorId) ?? `Médico #${appointment.doctorId}`,
            }));
        }),
      ),
  });

  protected readonly billingResource = rxResource({
    params: () => this.paramsFor(PatientTab.BILLING),

    stream: ({ params }) =>
      this.billingService.findByPatientId(params.id, 0, TAB_PAGE_SIZE),
  });

  protected readonly historyResource = rxResource({
    params: () => this.paramsFor(PatientTab.HISTORY),

    stream: ({ params }) =>
      this.medicalRecordService.findByPatientId(params.id, 0, TAB_PAGE_SIZE),
  });

  protected readonly pendingAmount = computed(() =>
    (this.billingResource.value()?.content ?? [])
      .filter((record) => record.status === 'PENDING')
      .reduce((sum, record) => sum + record.amount, 0),
  );

  // undefined deja el resource inactivo (no hace la petición)
  private paramsFor(tab: PatientTab): { id: number } | undefined {
    const id = this.patientId();

    return id !== null && this.activeTab() === tab ? { id } : undefined;
  }
}
