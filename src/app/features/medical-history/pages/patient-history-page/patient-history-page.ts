import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';

import { CommonModule, formatDate } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  rxResource,
  toSignal,
} from '@angular/core/rxjs-interop';

import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { tuiCountFilledControls } from '@taiga-ui/cdk';

import {
  TuiAppearance,
  TuiButton,
  TuiDialogService,
  TuiIcon,
  TuiInput,
  TuiLink,
} from '@taiga-ui/core';

import {
  TuiChevron,
  TuiDataListWrapper,
  TuiSelect,
  TuiSwitch,
} from '@taiga-ui/kit';

import {
  TuiSearch,
} from '@taiga-ui/layout';

import {
  MedicalRecordService,
} from '../../services/medical-record.service';
import { MedicalRecordResponse } from '../../interfaces/medical-record-response';
import { downloadCsv } from '@shared/utils/csv';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { MedicalRecordDetailDialog } from '../../components/medical-record-detail-dialog/medical-record-detail-dialog';
import { StateMessage } from '@shared/components/state-message/state-message';
import { InfoItem } from '@shared/components/info-item/info-item';
import { RecordCard } from '@shared/components/record-card/record-card';
import { RecordList } from '@shared/components/record-list/record-list';
import { SimplePager } from '@shared/components/simple-pager/simple-pager';
import { StatCard } from '@shared/components/stat-card/stat-card';

// Colores de la etiqueta de estado
const STATUS_BADGE_CLASSES: Record<string, string> = {
  SCHEDULED: 'bg-sky-50 text-sky-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const DEFAULT_STATUS_BADGE_CLASS = 'bg-slate-100 text-slate-700';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programada',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

interface Stat {
  title: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-medical-records',
  imports: [
    StateMessage,
    InfoItem,
    RecordCard,
    RecordList,
    SimplePager,
    StatCard,
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiIcon,
    TuiInput,
    TuiLink,
    TuiSearch,
    TuiSelect,
    TuiChevron,
    TuiDataListWrapper,
    TuiAppearance,
  ],
  templateUrl: 'patient-history-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRecords {

  private readonly service = inject(MedicalRecordService);
  private readonly dialogs = inject(TuiDialogService);

  protected readonly form = new FormGroup({
    search: new FormControl(''),
    category: new FormControl(''),
    status: new FormControl(null),
    completed: new FormControl(false),
    filter: new FormControl([]),
  });

  protected readonly size = signal(4);

  protected readonly count = toSignal(
    this.form.valueChanges.pipe(
      map(() => tuiCountFilledControls(this.form)),
    ),
    {
      initialValue: 0,
    },
  );

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.value)),
    { initialValue: this.form.value },
  );

  // Espera a que el usuario deje de escribir antes de consultar al backend
  private readonly debouncedSearch = toSignal(
    this.form.controls.search.valueChanges.pipe(
      debounceTime(300),
      map(search => (search ?? '').trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly activeFilters = computed(() => ({
    search: this.debouncedSearch(),
    specialty: this.formValue().category || null,
  }));

  // Vuelve a la primera página al cambiar los filtros
  protected readonly page = linkedSignal({
    source: this.activeFilters,
    computation: () => 0,
  });

  // GET /medical-records/crud/summary
  protected readonly summaryResource = rxResource({
    stream: () => this.service.summary(),
  });

  protected readonly categories = computed(
    () => this.summaryResource.value()?.specialties ?? [],
  );

  protected readonly stats = computed<Stat[]>(() => {
    const summary = this.summaryResource.value();

    return [
      { title: 'Total consultas', value: String(summary?.totalRecords ?? 0), icon: '@tui.file-text' },
      { title: 'Pacientes atendidos', value: String(summary?.uniquePatients ?? 0), icon: '@tui.users' },
      { title: 'Consultas completadas', value: String(summary?.completedRecords ?? 0), icon: '@tui.circle-check' },
      { title: 'Ingresos', value: `S/ ${(summary?.totalAmount ?? 0).toFixed(2)}`, icon: '@tui.wallet' },
    ];
  });

  protected readonly medicalRecordsResource = rxResource({
    params: () => ({
      page: this.page(),
      size: this.size(),
      ...this.activeFilters(),
    }),

    stream: ({ params }) =>
      this.service.findAll(
        params.page,
        params.size,
        { search: params.search, specialty: params.specialty },
      ),
  });

  protected readonly records = computed(
    () => this.medicalRecordsResource.value()?.content ?? [],
  );

  protected nextPage(): void {
    const response = this.medicalRecordsResource.value();

    if (!response || response.last) {
      return;
    }

    this.page.update(page => page + 1);
  }

  protected previousPage(): void {
    const response = this.medicalRecordsResource.value();

    if (!response || response.first) {
      return;
    }

    this.page.update(page => page - 1);
  }

  protected viewDetail(record: MedicalRecordResponse): void {
    this.dialogs
      .open(new PolymorpheusComponent(MedicalRecordDetailDialog), {
        label: `Atención del ${formatDate(record.scheduledAt, 'dd/MM/yyyy', 'es-PE')}`,
        size: 'm',
        data: record,
      })
      .subscribe();
  }

  protected statusBadgeClass(status: string): string {
    return STATUS_BADGE_CLASSES[status] ?? DEFAULT_STATUS_BADGE_CLASS;
  }

  protected statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  protected searchRecords(): void {
    this.medicalRecordsResource.reload();
    this.summaryResource.reload();
  }

  protected download(): void {
    downloadCsv(
      `historial-pagina-${this.page() + 1}.csv`,
      ['Cita', 'Fecha', 'Paciente', 'Médico', 'Especialidad', 'Motivo', 'Estado', 'Monto'],
      this.records().map((record: MedicalRecordResponse) => [
        record.appointmentId,
        record.scheduledAt,
        record.patientName,
        record.doctorName,
        record.specialty,
        record.reason,
        this.statusLabel(record.status),
        record.amount,
      ]),
    );
  }
}