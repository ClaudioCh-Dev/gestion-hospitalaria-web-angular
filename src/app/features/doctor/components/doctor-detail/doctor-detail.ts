import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { TuiButton, TuiIcon, TuiPopup, TuiTitle, TuiAppearance } from '@taiga-ui/core';

import { TuiAvatar, TuiBadge, TuiDrawer, TuiInitialsPipe, TuiTabs } from '@taiga-ui/kit';

import { DoctorResponse } from '../../interfaces';
import { SpecialtyStore } from '../../store/specialty.store';
import { AppointmentResponse, AppointmentStatus } from '../../../appointment/interfaces';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import {
  APPOINTMENT_STATUS_APPEARANCES,
  APPOINTMENT_STATUS_LABELS,
} from '../../../appointment/constants/appointment-status';
import { PatientService } from '../../../patient/services/patient.service';

// Citas próximas mostradas en la agenda
const AGENDA_LIMIT = 8;

interface AgendaItem {
  appointment: AppointmentResponse;
  patientName: string;
}

@Component({
  selector: 'app-doctor-detail',

  imports: [
    DatePipe,
    TuiBadge,
    TuiButton,
    TuiDrawer,
    TuiPopup,
    TuiTabs,
    TuiTitle,
    TuiAvatar,
    TuiInitialsPipe,
    TuiIcon,
    TuiAppearance,
  ],

  templateUrl: './doctor-detail.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDetailComponent {
  readonly doctor = input<DoctorResponse | null>(null);

  readonly close = output<void>();

  private readonly specialtyStore = inject(SpecialtyStore);
  private readonly appointmentService = inject(AppointmentService);
  private readonly patientService = inject(PatientService);

  protected readonly statusLabels = APPOINTMENT_STATUS_LABELS;
  protected readonly statusAppearances = APPOINTMENT_STATUS_APPEARANCES;

  protected readonly agendaResource = rxResource({
    params: () => {
      const doctor = this.doctor();

      return doctor ? { id: doctor.id } : undefined;
    },

    stream: ({ params }) =>
      this.appointmentService.findByDoctor(params.id).pipe(
        switchMap((appointments) => {
          // scheduledAt viene en hora local (LocalDateTime), por eso no se usa toISOString
          const date = new Date();
          const pad = (value: number) => String(value).padStart(2, '0');
          const now = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

          const pending = appointments
            .filter(
              (appointment) =>
                (appointment.status === AppointmentStatus.SCHEDULED ||
                  appointment.status === AppointmentStatus.CONFIRMED) &&
                appointment.scheduledAt.slice(0, 16) >= now,
            )
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

          const upcoming = pending.slice(0, AGENDA_LIMIT);

          const summary = {
            total: appointments.length,
            completed: appointments.filter(
              (appointment) => appointment.status === AppointmentStatus.COMPLETED,
            ).length,
            pendingCount: pending.length,
          };

          const patientIds = [...new Set(upcoming.map((item) => item.patientId))];

          if (!patientIds.length) {
            return of({ ...summary, upcoming: [] as AgendaItem[] });
          }

          return forkJoin(
            patientIds.map((id) =>
              this.patientService.findById(id).pipe(catchError(() => of(null))),
            ),
          ).pipe(
            map((patients) => {
              const names = new Map(
                patientIds.map((id, index) => {
                  const patient = patients[index];

                  return [
                    id,
                    patient ? `${patient.firstName} ${patient.lastName}` : `Paciente #${id}`,
                  ];
                }),
              );

              return {
                ...summary,
                upcoming: upcoming.map<AgendaItem>((appointment) => ({
                  appointment,
                  patientName: names.get(appointment.patientId) ?? `Paciente #${appointment.patientId}`,
                })),
              };
            }),
          );
        }),
      ),
  });

  protected readonly specialtyDescription = computed(() => {
    const doctor = this.doctor();

    if (!doctor) {
      return '';
    }

    return this.specialtyStore
      .specialties()
      .find((specialty) => specialty.id === doctor.specialtyId)
      ?.description ?? '';
  });

  constructor() {
    this.specialtyStore.load().catch(() => undefined);
  }
}
