import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';

import { TuiDay } from '@taiga-ui/cdk';
import { TuiButton, TuiCalendar, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { TuiInputDate } from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { StateMessage } from '@shared/components/state-message/state-message';
import { StatCard } from '@shared/components/stat-card/stat-card';
import { injectNow } from '@shared/utils/now';
import { PatientService } from '@patients/services/patient.service';

import { getAppointmentTypeColor } from '../../constants/appointment-type-colors';
import { APPOINTMENT_STATUS_LABELS } from '../../constants/appointment-status';
import { AppointmentResponse, AppointmentStatus } from '../../interfaces';
import { AgendaScope } from '../../services/agenda-scope.service';
import { AppointmentTypeService } from '../../services/appointment-type.service';
import { AgendaItem, AgendaLegendItem, AgendaPanel } from '../agenda-panel/agenda-panel';
import { AgendaPatientCard, AgendaSelection } from './agenda-patient-card';
import {
  AppointmentDetailData,
  AppointmentDetailDialog,
} from '../appointment-detail-dialog/appointment-detail-dialog';

// Alto de cada tramo de 30 minutos en la línea de tiempo
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 48;
const PX_PER_MINUTE = SLOT_HEIGHT / SLOT_MINUTES;

// Horario por defecto si el médico no tiene uno configurado
const DEFAULT_START = 8 * 60;
const DEFAULT_END = 18 * 60;

// Hueco mínimo que se considera "libre" para una cita
const MIN_FREE_MINUTES = 30;

interface DayStat {
  title: string;
  value: string;
  caption: string;
  icon: string;
}

interface AgendaBlock {
  appointment: AppointmentResponse;
  top: number;
  height: number;
  range: string;
  patientName: string;
  typeTitle: string;
  colorClasses: string;
  finished: boolean;
  compact: boolean;
}

/**
 * Agenda del médico: su día en una línea de tiempo vertical
 * (la de administración es una cuadrícula horizontal de todos los médicos).
 */
@Component({
  selector: 'app-doctor-agenda',
  imports: [
    AgendaPanel,
    AgendaPatientCard,
    StatCard,
    FormsModule,
    NgClass,
    StateMessage,
    TuiButton,
    TuiCalendar,
    TuiInputDate,
    TuiTextfield,
  ],
  templateUrl: './doctor-agenda.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorAgenda {
  private readonly agendaScope = inject(AgendaScope);
  private readonly appointmentTypeService = inject(AppointmentTypeService);
  private readonly patientService = inject(PatientService);
  private readonly dialogs = inject(TuiDialogService);

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  protected readonly now = injectNow();

  protected readonly selectedDate = signal(TuiDay.currentLocal());

  protected readonly statusLabels = APPOINTMENT_STATUS_LABELS;

  // =========================
  // DATOS
  // =========================

  protected readonly agendaResource = rxResource({
    params: () => ({ date: this.formatDate(this.selectedDate()) }),
    stream: ({ params }) =>
      forkJoin({
        doctor: this.agendaScope.myDoctor(),
        types: this.appointmentTypeService.findAll(),
        appointments: this.agendaScope.findByDate(params.date),
      }),
  });

  // Solo cambia al pasar la medianoche
  private readonly todayKey = computed(() => {
    const now = this.now();

    return this.formatDate(new TuiDay(now.getFullYear(), now.getMonth(), now.getDate()));
  });

  // Citas de hoy para el panel lateral, aunque se esté viendo otro día
  protected readonly todayResource = rxResource({
    params: () => ({ date: this.todayKey() }),
    stream: ({ params }) => this.agendaScope.findByDate(params.date),
  });

  // Nombres de los pacientes del día mostrado y de hoy
  protected readonly patientsResource = rxResource({
    params: () => ({
      ids: [
        ...new Set([
          ...(this.agendaResource.value()?.appointments ?? []),
          ...(this.todayResource.value() ?? []),
        ].map((appointment) => appointment.patientId)),
      ].sort((a, b) => a - b),
    }),
    stream: ({ params }) =>
      params.ids.length
        ? forkJoin(
            params.ids.map((id) =>
              this.patientService.findById(id).pipe(catchError(() => of(null))),
            ),
          ).pipe(
            map(
              (patients) =>
                new Map(
                  params.ids.map((id, index) => {
                    const patient = patients[index];

                    return [id, patient ? `${patient.firstName} ${patient.lastName}` : `Paciente #${id}`];
                  }),
                ),
            ),
          )
        : of(new Map<number, string>()),
  });

  protected readonly doctor = computed(() => this.agendaResource.value()?.doctor ?? null);

  private readonly types = computed(
    () => new Map((this.agendaResource.value()?.types ?? []).map((type) => [type.id, type])),
  );

  // =========================
  // LÍNEA DE TIEMPO
  // =========================

  // Horario del médico, ampliado a horas completas si hay citas fuera de él
  protected readonly range = computed(() => {
    const doctor = this.doctor();
    const appointments = this.agendaResource.value()?.appointments ?? [];

    let start = doctor?.scheduleStart ? this.toMinutes(doctor.scheduleStart) : DEFAULT_START;
    let end = doctor?.scheduleEnd ? this.toMinutes(doctor.scheduleEnd) : DEFAULT_END;

    for (const appointment of appointments) {
      const appointmentStart = this.toMinutes(this.getTime(appointment.scheduledAt));

      start = Math.min(start, appointmentStart);
      end = Math.max(end, appointmentStart + appointment.durationMinutes);
    }

    return {
      start: Math.floor(start / 60) * 60,
      end: Math.ceil(end / 60) * 60,
    };
  });

  protected readonly gridHeight = computed(
    () => (this.range().end - this.range().start) * PX_PER_MINUTE,
  );

  protected readonly slots = computed(() => {
    const { start, end } = this.range();
    const slots: { label: string; top: number; isHour: boolean }[] = [];

    for (let minutes = start; minutes < end; minutes += SLOT_MINUTES) {
      slots.push({
        label: this.fromMinutes(minutes),
        top: (minutes - start) * PX_PER_MINUTE,
        isHour: minutes % 60 === 0,
      });
    }

    return slots;
  });

  protected readonly blocks = computed<AgendaBlock[]>(() => {
    const { start } = this.range();
    const names = this.patientsResource.value();

    return [...(this.agendaResource.value()?.appointments ?? [])]
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .map((appointment) => {
        const time = this.getTime(appointment.scheduledAt);
        const minutes = this.toMinutes(time);
        const type = this.types().get(appointment.appointmentTypeId);
        const height = appointment.durationMinutes * PX_PER_MINUTE;

        return {
          appointment,
          top: (minutes - start) * PX_PER_MINUTE,
          height,
          range: `${time} - ${this.fromMinutes(minutes + appointment.durationMinutes)}`,
          patientName: names?.get(appointment.patientId) ?? `Paciente #${appointment.patientId}`,
          typeTitle: type?.title ?? 'Cita',
          colorClasses: getAppointmentTypeColor(type?.color).classes,
          finished: this.isFinished(appointment),
          // Citas de 30 min: una sola línea
          compact: height < 64,
        };
      });
  });

  protected readonly isToday = computed(() => this.formatDate(this.selectedDate()) === this.todayKey());

  // Posición de la hora actual en px (null si no es hoy o está fuera del rango)
  protected readonly nowTop = computed(() => {
    if (!this.isToday()) {
      return null;
    }

    const now = this.now();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const { start, end } = this.range();

    if (minutes < start) {
      return null;
    }

    return (Math.min(minutes, end) - start) * PX_PER_MINUTE;
  });

  protected readonly nowLabel = computed(() => this.fromMinutes(this.now().getHours() * 60 + this.now().getMinutes()));

  protected readonly pxPerMinute = PX_PER_MINUTE;

  // =========================
  // CITA SELECCIONADA
  // =========================

  // Se reinicia al cambiar de día
  protected readonly selectedId = linkedSignal<string, number | null>({
    source: () => this.formatDate(this.selectedDate()),
    computation: () => null,
  });

  private readonly nowMinutes = computed(() => this.now().getHours() * 60 + this.now().getMinutes());

  // Sin selección: la cita en curso, si no la siguiente (hoy) o la primera del día
  private readonly defaultBlock = computed(() => {
    const active = this.blocks().filter((block) => block.appointment.status !== AppointmentStatus.CANCELLED);

    if (!this.isToday()) {
      return { block: active[0] ?? null, heading: 'Primera cita del día' };
    }

    const now = this.nowMinutes();
    const pending = active.filter((block) => !block.finished);
    const minutesOf = (block: AgendaBlock) => this.toMinutes(this.getTime(block.appointment.scheduledAt));

    const inProgress = pending.find(
      (block) => minutesOf(block) <= now && now < minutesOf(block) + block.appointment.durationMinutes,
    );

    if (inProgress) {
      return { block: inProgress, heading: 'En curso' };
    }

    const next = pending.find((block) => minutesOf(block) > now);

    return next
      ? { block: next, heading: 'Siguiente cita' }
      : { block: active.at(-1) ?? null, heading: 'Última cita del día' };
  });

  protected readonly selection = computed<AgendaSelection | null>(() => {
    const id = this.selectedId();
    const block = id !== null
      ? this.blocks().find((item) => item.appointment.id === id)
      : this.defaultBlock().block;

    return block
      ? {
          appointment: block.appointment,
          range: block.range,
          typeTitle: block.typeTitle,
          colorClasses: block.colorClasses,
        }
      : null;
  });

  protected readonly selectionHeading = computed(() =>
    this.selectedId() !== null ? 'Cita seleccionada' : this.defaultBlock().heading,
  );

  // Pantallas con la ficha visible (lg+): seleccionar; en móvil, abrir el detalle
  protected onBlockClick(appointment: AppointmentResponse): void {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      this.selectedId.set(appointment.id);
    } else {
      this.openAppointment(appointment);
    }
  }

  // =========================
  // RESUMEN DEL DÍA
  // =========================

  // Jornada del médico (sin ampliar por citas fuera de horario)
  private readonly schedule = computed(() => {
    const doctor = this.doctor();

    return {
      start: doctor?.scheduleStart ? this.toMinutes(doctor.scheduleStart) : DEFAULT_START,
      end: doctor?.scheduleEnd ? this.toMinutes(doctor.scheduleEnd) : DEFAULT_END,
    };
  });

  protected readonly stats = computed<DayStat[]>(() => {
    const appointments = this.agendaResource.value()?.appointments ?? [];
    const active = appointments.filter((item) => item.status !== AppointmentStatus.CANCELLED);
    const cancelled = appointments.length - active.length;
    const completed = active.filter((item) => item.status === AppointmentStatus.COMPLETED).length;
    const pending = active.length - completed;

    // Minutos reservados dentro de la jornada
    const { start, end } = this.schedule();
    const booked = active.reduce((sum, item) => {
      const from = this.toMinutes(this.getTime(item.scheduledAt));
      const to = from + item.durationMinutes;

      return sum + Math.max(0, Math.min(to, end) - Math.max(from, start));
    }, 0);
    const occupancy = end > start ? Math.round((booked / (end - start)) * 100) : 0;

    const freeSlot = this.nextFreeSlot(active);

    return [
      {
        title: 'Citas del día',
        value: String(appointments.length),
        caption: cancelled ? `${cancelled} ${cancelled === 1 ? 'cancelada' : 'canceladas'}` : 'Ninguna cancelada',
        icon: '@tui.calendar',
      },
      {
        title: 'Atendidas',
        value: `${completed} de ${active.length}`,
        caption: `${pending} por atender`,
        icon: '@tui.circle-check',
      },
      {
        title: 'Ocupación',
        value: `${occupancy} %`,
        caption: `${this.formatDuration(booked)} de ${this.formatDuration(end - start)}`,
        icon: '@tui.chart-pie',
      },
      {
        title: 'Próximo hueco libre',
        value: freeSlot.value,
        caption: freeSlot.caption,
        icon: '@tui.clock',
      },
    ];
  });

  // Primer hueco de al menos 30 min en la jornada (desde ahora si es hoy)
  private nextFreeSlot(active: AppointmentResponse[]): { value: string; caption: string } {
    const { start, end } = this.schedule();
    const today = this.todayKey();
    const day = this.formatDate(this.selectedDate());

    if (day < today) {
      return { value: '—', caption: 'Día pasado' };
    }

    // Hoy: a partir de la siguiente media hora
    let cursor = day === today
      ? Math.max(start, Math.ceil(this.nowMinutes() / SLOT_MINUTES) * SLOT_MINUTES)
      : start;

    if (cursor >= end) {
      return { value: '—', caption: 'Jornada terminada' };
    }

    const ranges = active
      .map((item) => {
        const from = this.toMinutes(this.getTime(item.scheduledAt));

        return { from, to: from + item.durationMinutes };
      })
      .sort((a, b) => a.from - b.from);

    for (const range of ranges) {
      if (range.to <= cursor) {
        continue;
      }

      if (range.from - cursor >= MIN_FREE_MINUTES) {
        return { value: this.fromMinutes(cursor), caption: `${this.formatDuration(range.from - cursor)} libres` };
      }

      cursor = Math.max(cursor, range.to);
    }

    return end - cursor >= MIN_FREE_MINUTES
      ? { value: this.fromMinutes(cursor), caption: `${this.formatDuration(end - cursor)} libres` }
      : { value: '—', caption: 'Sin huecos en la jornada' };
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (!hours) {
      return `${rest} min`;
    }

    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  // =========================
  // PANEL LATERAL
  // =========================

  private readonly todayItems = computed(() => {
    const now = this.now();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const names = this.patientsResource.value();

    return (this.todayResource.value() ?? [])
      .filter((appointment) => !this.isFinished(appointment))
      .map((appointment) => {
        const start = this.getTime(appointment.scheduledAt);
        const startMinutes = this.toMinutes(start);
        const endMinutes = startMinutes + appointment.durationMinutes;
        const type = this.types().get(appointment.appointmentTypeId);
        const inProgress = startMinutes <= nowMinutes && nowMinutes < endMinutes;

        return {
          inProgress,
          startMinutes,
          item: {
            appointment,
            start,
            end: this.fromMinutes(endMinutes),
            patientName: names?.get(appointment.patientId),
            typeTitle: type?.title ?? 'Cita',
            colorClasses: getAppointmentTypeColor(type?.color).classes,
            minutes: inProgress ? endMinutes - nowMinutes : startMinutes - nowMinutes,
            progress: inProgress ? ((nowMinutes - startMinutes) / appointment.durationMinutes) * 100 : 0,
          } satisfies AgendaItem,
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);
  });

  protected readonly currentAppointments = computed(() =>
    this.todayItems()
      .filter((entry) => entry.inProgress)
      .map((entry) => entry.item),
  );

  protected readonly upcomingAppointments = computed(() => {
    const now = this.now();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return this.todayItems()
      .filter((entry) => entry.startMinutes > nowMinutes)
      .map((entry) => entry.item);
  });

  protected readonly legend = computed<AgendaLegendItem[]>(() => {
    const used = new Set((this.agendaResource.value()?.appointments ?? []).map((item) => item.appointmentTypeId));

    return (this.agendaResource.value()?.types ?? [])
      .filter((type) => type.active || used.has(type.id))
      .map((type) => ({ title: type.title, colorClasses: getAppointmentTypeColor(type.color).classes }));
  });

  constructor() {
    // Al cargar un día: ir a la hora actual (hoy) o a la primera cita (otro día)
    effect(() => {
      const scroller = this.scroller()?.nativeElement;
      const loaded = this.agendaResource.hasValue();

      if (!scroller || !loaded) {
        return;
      }

      untracked(() => {
        const target = this.nowTop() ?? this.blocks()[0]?.top ?? 0;

        setTimeout(() => scroller.scrollTo({ top: Math.max(0, target - 96), behavior: 'smooth' }));
      });
    });
  }

  // =========================
  // NAVEGACIÓN
  // =========================

  protected previousDay(): void {
    this.selectedDate.update((date) => date.append({ day: -1 }));
  }

  protected nextDay(): void {
    this.selectedDate.update((date) => date.append({ day: 1 }));
  }

  protected goToday(): void {
    this.selectedDate.set(TuiDay.currentLocal());
  }

  protected onDateChange(date: TuiDay | null): void {
    if (date) {
      this.selectedDate.set(date);
    }
  }

  protected readonly dayTitle = computed(() => {
    const date = this.selectedDate();

    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date.year, date.month, date.day));
  });

  // =========================
  // DETALLE
  // =========================

  protected openAppointment(appointment: AppointmentResponse): void {
    const data: AppointmentDetailData = {
      appointment,
      doctor: this.doctor() ?? undefined,
    };

    this.dialogs
      .open<AppointmentResponse | null>(new PolymorpheusComponent(AppointmentDetailDialog), {
        label: 'Detalle de la cita',
        size: 'm',
        data,
      })
      .subscribe((updated) => {
        if (updated) {
          this.agendaResource.reload();
          this.todayResource.reload();
        }
      });
  }

  // =========================
  // HELPERS
  // =========================

  private isFinished(appointment: AppointmentResponse): boolean {
    return (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    );
  }

  private formatDate(date: TuiDay): string {
    return [date.year, String(date.month + 1).padStart(2, '0'), String(date.day).padStart(2, '0')].join('-');
  }

  private getTime(dateTime: string): string {
    return dateTime.split('T')[1]?.slice(0, 5) ?? '00:00';
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  private fromMinutes(total: number): string {
    return [Math.floor(total / 60), total % 60].map((value) => String(value).padStart(2, '0')).join(':');
  }
}
