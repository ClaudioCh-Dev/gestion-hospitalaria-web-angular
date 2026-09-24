import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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

import { map, startWith } from 'rxjs';
import { tuiCountFilledControls } from '@taiga-ui/cdk';

import {
  TuiAppearance,
  TuiButton,
  TuiDialogService,
  TuiIcon,
  TuiInput,
  TuiLink,
  TuiTitle,
} from '@taiga-ui/core';

import {
  TuiChevron,
  TuiDataListWrapper,
  TuiSelect,
  TuiSwitch,
} from '@taiga-ui/kit';

import {
  TuiCardLarge,
  TuiHeader,
  TuiSearch,
} from '@taiga-ui/layout';

import {
  MedicalRecordService,
} from '../../services/medical-record.service';
import { MedicalRecordResponse } from '../../interfaces/medical-record-response';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { MedicalRecordDetailDialog } from '../../components/medical-record-detail-dialog/medical-record-detail-dialog';

// Registros usados para calcular el resumen y las categorías
const SUMMARY_SIZE = 1000;

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
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiCardLarge,
    TuiHeader,
    TuiIcon,
    TuiInput,
    TuiLink,
    TuiSearch,
    TuiSelect,
    TuiChevron,
    TuiDataListWrapper,
    TuiTitle,
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

  protected readonly page = signal(0);
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

  protected readonly summaryResource = rxResource({
    stream: () => this.service.findAll(0, SUMMARY_SIZE),
  });

  protected readonly categories = computed(() =>
    [...new Set(
      (this.summaryResource.value()?.content ?? []).map(record => record.specialty),
    )].sort(),
  );

  protected readonly stats = computed<Stat[]>(() => {
    const records = this.summaryResource.value()?.content ?? [];

    const patients = new Set(records.map(record => record.patientId)).size;

    const completed = records.filter(record => record.status === 'COMPLETED').length;

    const income = records.reduce((sum, record) => sum + (record.amount ?? 0), 0);

    return [
      { title: 'Total consultas', value: String(records.length), icon: '@tui.file-text' },
      { title: 'Pacientes atendidos', value: String(patients), icon: '@tui.users' },
      { title: 'Consultas completadas', value: String(completed), icon: '@tui.circle-check' },
      { title: 'Ingresos', value: `S/ ${income.toFixed(2)}`, icon: '@tui.wallet' },
    ];
  });

  protected readonly medicalRecordsResource = rxResource({
    params: () => ({
      page: this.page(),
      size: this.size(),
    }),

    stream: ({ params }) => 
      this.service.findAll(
        params.page,
        params.size,
      ),
  });

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

  // Filtros aplicados sobre la página cargada
  protected readonly filteredRecords = computed(() => {
    const records = this.medicalRecordsResource.value()?.content ?? [];

    const { search, category } = this.formValue();

    const term = (search ?? '').trim().toLowerCase();

    return records.filter(record =>
      (!category || record.specialty === category) &&
      (!term ||
        [record.patientName, record.doctorName, record.reason]
          .join(' ')
          .toLowerCase()
          .includes(term)),
    );
  });

  protected viewDetail(record: MedicalRecordResponse): void {
    this.dialogs
      .open(new PolymorpheusComponent(MedicalRecordDetailDialog), {
        label: `Atención del ${formatDate(record.scheduledAt, 'dd/MM/yyyy', 'es-PE')}`,
        size: 'm',
        data: record,
      })
      .subscribe();
  }

  protected statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  protected searchRecords(): void {
    this.medicalRecordsResource.reload();
    this.summaryResource.reload();
  }

  protected download(): void {
    const header = ['Cita', 'Fecha', 'Paciente', 'Médico', 'Especialidad', 'Motivo', 'Estado', 'Monto'];

    const escape = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const rows = this.filteredRecords().map((record: MedicalRecordResponse) => [
      record.appointmentId,
      record.scheduledAt,
      record.patientName,
      record.doctorName,
      record.specialty,
      record.reason,
      this.statusLabel(record.status),
      record.amount,
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(escape).join(','))
      .join('\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));

    const link = document.createElement('a');

    link.href = url;
    link.download = `historial-pagina-${this.page() + 1}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }
}