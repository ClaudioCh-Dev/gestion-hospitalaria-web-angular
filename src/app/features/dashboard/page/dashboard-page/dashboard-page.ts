import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';

import { type TuiContext } from '@taiga-ui/cdk';
import { TuiButton, TuiIcon, TuiPoint } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiAxes, TuiLineChart, TuiLineChartHint, TuiPieChart } from '@taiga-ui/addon-charts';

import { AppointmentResponse, AppointmentStatus } from '../../../appointment/interfaces';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { BillingRecordService } from '../../../billing/services/billing-record.service';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { Gender, PatientDetailResponse } from '../../../patient/interfaces';
import { PatientService } from '../../../patient/services/patient.service';
import { StateMessage } from '@shared/components/state-message/state-message';

interface Stat {
  title: string;
  value: string;
  description: string;
  icon: string;
}

interface UpcomingAppointment {
  appointment: AppointmentResponse;
  patient: string;
  doctor: string;
  specialty: string;
}

// Días mostrados en el gráfico de citas
const CHART_DAYS = 7;

// Registros usados para calcular los ingresos del mes
const BILLING_SUMMARY_SIZE = 1000;

// Citas mostradas en "Próximas citas"
const UPCOMING_LIMIT = 5;

@Component({
  selector: 'app-dashboard-page',
  imports: [
    StateMessage,
    DatePipe,
    DecimalPipe,
    RouterLink,
    TuiAxes,
    TuiBadge,
    TuiButton,
    TuiIcon,
    TuiLineChart,
    TuiLineChartHint,
    TuiPieChart,
  ],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly patientService = inject(PatientService);
  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly billingService = inject(BillingRecordService);

  private readonly today = new Date();

  protected readonly todayLabel = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(this.today);

  // =====================================================
  // RESOURCES
  // =====================================================

  // Los totales salen de totalElements, por eso basta con páginas de 1 elemento
  protected readonly patientsResource = rxResource({
    stream: () =>
      forkJoin({
        total: this.patientService.findAll(0, 1),
        male: this.patientService.findAll(0, 1, Gender.MALE),
        female: this.patientService.findAll(0, 1, Gender.FEMALE),
      }).pipe(
        map(({ total, male, female }) => ({
          total: total.totalElements,
          male: male.totalElements,
          female: female.totalElements,
        })),
      ),
  });

  protected readonly doctorsResource = rxResource({
    stream: () => this.doctorService.findAll(0, 100),
  });

  protected readonly billingResource = rxResource({
    stream: () => this.billingService.findAll(0, BILLING_SUMMARY_SIZE),
  });

  protected readonly chartDays = Array.from({ length: CHART_DAYS }, (_, index) => {
    const day = new Date(this.today);

    day.setDate(day.getDate() - (CHART_DAYS - 1 - index));

    return day;
  });

  protected readonly weekResource = rxResource({
    stream: () =>
      forkJoin(
        this.chartDays.map((day) => this.appointmentService.findByDate(this.toIsoDate(day))),
      ),
  });

  // Las citas de hoy son el último día del gráfico
  protected readonly todayAppointments = computed(() => this.weekResource.value()?.at(-1) ?? []);

  private readonly upcomingAppointments = computed(() =>
    this.todayAppointments()
      .filter(
        (appointment) =>
          appointment.status === AppointmentStatus.SCHEDULED ||
          appointment.status === AppointmentStatus.CONFIRMED,
      )
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .slice(0, UPCOMING_LIMIT),
  );

  // Nombres de los pacientes de las próximas citas
  protected readonly upcomingResource = rxResource({
    params: () => ({ appointments: this.upcomingAppointments() }),

    stream: ({ params }) => {
      const patientIds = [...new Set(params.appointments.map((item) => item.patientId))];

      if (!patientIds.length) {
        return of(new Map<number, PatientDetailResponse | null>());
      }

      return forkJoin(
        patientIds.map((id) =>
          this.patientService.findById(id).pipe(catchError(() => of(null))),
        ),
      ).pipe(
        map((patients) => new Map(patientIds.map((id, index) => [id, patients[index]]))),
      );
    },
  });

  // =====================================================
  // STATS
  // =====================================================

  protected readonly monthIncome = computed(() => {
    const records = this.billingResource.value()?.content ?? [];

    const isThisMonth = (date: string | null) => {
      if (!date) {
        return false;
      }

      const value = new Date(date);

      return (
        value.getFullYear() === this.today.getFullYear() &&
        value.getMonth() === this.today.getMonth()
      );
    };

    return {
      paid: records
        .filter((record) => record.status === 'PAID' && isThisMonth(record.paidAt))
        .reduce((sum, record) => sum + record.amount, 0),
      pending: records
        .filter((record) => record.status === 'PENDING')
        .reduce((sum, record) => sum + record.amount, 0),
    };
  });

  protected readonly stats = computed<Stat[]>(() => {
    const patients = this.patientsResource.value();
    const doctors = this.doctorsResource.value();
    const today = this.todayAppointments();
    const income = this.monthIncome();

    const pendingToday = today.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.SCHEDULED ||
        appointment.status === AppointmentStatus.CONFIRMED,
    ).length;

    const activeDoctors = doctors?.content.filter((doctor) => doctor.active).length ?? 0;

    return [
      {
        title: 'Pacientes',
        value: this.formatNumber(patients?.total),
        description: 'registrados en total',
        icon: '@tui.users',
      },
      {
        title: 'Citas hoy',
        value: this.weekResource.hasValue() ? String(today.length) : '—',
        description: `${pendingToday} por atender`,
        icon: '@tui.calendar',
      },
      {
        title: 'Médicos',
        value: this.formatNumber(doctors?.totalElements),
        description: `${activeDoctors} activos`,
        icon: '@tui.stethoscope',
      },
      {
        title: 'Ingresos del mes',
        value: this.billingResource.hasValue() ? this.formatCurrency(income.paid) : '—',
        description: `${this.formatCurrency(income.pending)} por cobrar`,
        icon: '@tui.wallet',
      },
    ];
  });

  protected readonly statsLoading = computed(
    () =>
      this.patientsResource.isLoading() ||
      this.doctorsResource.isLoading() ||
      this.weekResource.isLoading() ||
      this.billingResource.isLoading(),
  );

  // =====================================================
  // CHART: CITAS POR DÍA
  // =====================================================

  protected readonly appointmentsChart = computed<readonly TuiPoint[]>(() =>
    (this.weekResource.value() ?? []).map((appointments, index) => [index, appointments.length]),
  );

  // Rango del eje Y con un margen para que el punto más alto no toque el borde
  protected readonly chartHeight = computed(() => {
    const max = Math.max(0, ...this.appointmentsChart().map(([, count]) => count));

    return Math.max(4, Math.ceil(max * 1.25));
  });

  protected readonly chartLabels = this.chartDays.map((day) =>
    new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric' }).format(day),
  );

  protected readonly xStringify = (index: number): string => this.chartLabels[index] ?? '';

  protected readonly yStringify = (count: number): string =>
    `${count} ${count === 1 ? 'cita' : 'citas'}`;

  protected readonly hintContent = ({ $implicit }: TuiContext<readonly TuiPoint[]>): string =>
    this.yStringify($implicit[0]?.[1] ?? 0);

  // =====================================================
  // CHART: GÉNERO
  // =====================================================

  protected readonly genderChart = computed(() => {
    const patients = this.patientsResource.value();

    return [
      { label: 'Femenino', value: patients?.female ?? 0, color: 'var(--tui-chart-categorical-00)' },
      { label: 'Masculino', value: patients?.male ?? 0, color: 'var(--tui-chart-categorical-01)' },
    ];
  });

  protected readonly genderValues = computed(() => this.genderChart().map((item) => item.value));

  // =====================================================
  // PRÓXIMAS CITAS
  // =====================================================

  protected readonly upcoming = computed<UpcomingAppointment[]>(() => {
    const patients = this.upcomingResource.value();
    const doctors = new Map(
      (this.doctorsResource.value()?.content ?? []).map((doctor) => [doctor.id, doctor]),
    );

    return this.upcomingAppointments().map((appointment) => {
      const patient = patients?.get(appointment.patientId);
      const doctor = doctors.get(appointment.doctorId);

      return {
        appointment,
        patient: patient
          ? `${patient.firstName} ${patient.lastName}`
          : `Paciente #${appointment.patientId}`,
        doctor: doctor
          ? `${doctor.firstName} ${doctor.lastName}`
          : `Médico #${appointment.doctorId}`,
        specialty: doctor?.specialtyName ?? '',
      };
    });
  });

  // =====================================================
  // HELPERS
  // =====================================================

  protected reloadAll(): void {
    this.patientsResource.reload();
    this.doctorsResource.reload();
    this.billingResource.reload();
    this.weekResource.reload();
  }

  private toIsoDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private formatNumber(value: number | undefined): string {
    return value === undefined ? '—' : new Intl.NumberFormat('es-PE').format(value);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  }
}
