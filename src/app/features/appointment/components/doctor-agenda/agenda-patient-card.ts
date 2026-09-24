import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

import { InfoItem } from '@shared/components/info-item/info-item';
import { PatientService } from '@patients/services/patient.service';
import { BLOOD_TYPES, GENDERS } from '@patients/constants/patient-options';

import {
  APPOINTMENT_STATUS_APPEARANCES,
  APPOINTMENT_STATUS_LABELS,
} from '../../constants/appointment-status';
import { AppointmentResponse } from '../../interfaces';

export interface AgendaSelection {
  appointment: AppointmentResponse;
  range: string;
  typeTitle: string;
  colorClasses: string;
}

// Ficha del paciente de la cita seleccionada en la agenda del médico
@Component({
  selector: 'app-agenda-patient-card',
  imports: [InfoItem, TuiBadge, TuiButton, TuiIcon],
  template: `
    @if (selection(); as selection) {
      <!-- Cita -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ heading() }}</p>
          <p class="mt-1 text-lg font-semibold text-slate-900">{{ selection.range }}</p>
          <p class="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-2.5 w-2.5 shrink-0 rounded-full" [class]="selection.colorClasses"></span>
            {{ selection.typeTitle }}
          </p>
        </div>

        <span tuiBadge size="m" [appearance]="statusAppearances[selection.appointment.status]">
          {{ statusLabels[selection.appointment.status] }}
        </span>
      </div>

      <!-- Paciente -->
      <div class="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--tui-background-accent-1) text-base font-semibold text-white"
        >
          @if (patientResource.value(); as patient) {
            {{ (patient.firstName[0] ?? '') + (patient.lastName[0] ?? '') }}
          } @else {
            <tui-icon icon="@tui.user" />
          }
        </span>

        <div class="min-w-0">
          @if (patientResource.isLoading()) {
            <div class="h-4 w-40 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-2 h-3 w-24 animate-pulse rounded bg-slate-200"></div>
          } @else if (patientResource.value(); as patient) {
            <p class="truncate text-base font-semibold text-slate-900">{{ patient.firstName }} {{ patient.lastName }}</p>
            <p class="text-xs text-slate-500">
              DNI {{ patient.documentNumber }}
              @if (age(); as age) {
                · {{ age }} años
              }
            </p>
          } @else {
            <p class="text-sm font-semibold text-slate-900">Paciente #{{ selection.appointment.patientId }}</p>
            <p class="text-xs text-slate-400">No se pudieron cargar sus datos</p>
          }
        </div>
      </div>

      @if (patientResource.value(); as patient) {
        <!-- Alergias: lo primero que un médico necesita ver -->
        @if (patient.allergies) {
          <div class="mt-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
            <tui-icon icon="@tui.triangle-alert" class="mt-0.5 shrink-0 text-red-500" />
            <div class="min-w-0">
              <p class="text-xs font-semibold text-red-700">Alergias</p>
              <p class="text-xs text-red-700">{{ patient.allergies }}</p>
            </div>
          </div>
        }

        <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <app-info-item icon="@tui.droplet" label="Grupo sanguíneo">{{ bloodType() }}</app-info-item>
          <app-info-item icon="@tui.user" label="Género">{{ gender() }}</app-info-item>
          <app-info-item icon="@tui.phone" label="Teléfono">{{ patient.phone || 'Sin teléfono' }}</app-info-item>
          <app-info-item icon="@tui.mail" label="Correo" class="col-span-2">
            <span class="break-all">{{ patient.email || 'Sin correo' }}</span>
          </app-info-item>
        </div>
      }

      <!-- Motivo y notas de la cita -->
      <div class="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <app-info-item icon="@tui.file-text" label="Motivo">
          {{ selection.appointment.reason || 'Consulta médica' }}
        </app-info-item>

        @if (selection.appointment.notes) {
          <app-info-item icon="@tui.notebook-pen" label="Notas">{{ selection.appointment.notes }}</app-info-item>
        }
      </div>

      <button tuiButton type="button" size="s" class="mt-5 w-full" iconEnd="@tui.arrow-right" (click)="open.emit(selection.appointment)">
        Abrir cita
      </button>
    } @else {
      <div class="flex h-full min-h-60 flex-col items-center justify-center gap-2 text-center">
        <tui-icon icon="@tui.calendar-heart" class="text-2xl text-slate-300" />
        <p class="text-sm text-slate-500">Selecciona una cita en la agenda para ver al paciente.</p>
      </div>
    }
  `,
  host: {
    // Mismo alto que la agenda (--agenda-height lo define el contenedor)
    class: 'rounded-xl border border-slate-200 bg-white p-4 shadow-md xl:h-(--agenda-height) xl:overflow-y-auto',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPatientCard {
  private readonly patientService = inject(PatientService);

  readonly selection = input<AgendaSelection | null>(null);

  // "En curso", "Siguiente cita" o "Cita seleccionada"
  readonly heading = input('Cita seleccionada');

  readonly open = output<AppointmentResponse>();

  protected readonly statusLabels = APPOINTMENT_STATUS_LABELS;
  protected readonly statusAppearances = APPOINTMENT_STATUS_APPEARANCES;

  protected readonly patientResource = rxResource({
    params: () => ({ id: this.selection()?.appointment.patientId ?? null }),
    stream: ({ params }) => (params.id ? this.patientService.findById(params.id) : of(null)),
  });

  protected readonly age = computed(() => {
    const birthDate = this.patientResource.value()?.birthDate;

    if (!birthDate) {
      return null;
    }

    const [year, month, day] = birthDate.split('-').map(Number);
    const today = new Date();
    const hadBirthday =
      today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);

    return today.getFullYear() - year - (hadBirthday ? 0 : 1);
  });

  protected readonly bloodType = computed(() => {
    const value = this.patientResource.value()?.bloodType;

    return BLOOD_TYPES.find((type) => type.id === value)?.value ?? value ?? 'Sin registrar';
  });

  protected readonly gender = computed(() => {
    const value = this.patientResource.value()?.gender;

    return GENDERS.find((gender) => gender.id === value)?.value ?? 'Sin registrar';
  });
}
