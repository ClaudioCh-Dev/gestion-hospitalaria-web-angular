import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  rxResource,
  toSignal,
} from '@angular/core/rxjs-interop';

import { catchError, EMPTY, forkJoin, map, of, startWith, switchMap } from 'rxjs';

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
} from '@taiga-ui/kit';

import {
  TuiCardLarge,
  TuiHeader,
  TuiSearch,
} from '@taiga-ui/layout';

import {
  BillingRecordResponse,
  BillingStatus,
} from '../../interfaces';

import { BillingRecordService } from '../../services/billing-record.service';
import { PatientService } from '@patients/services/patient.service';
import { withNotification } from '@shared/operators/with-notification';
import { NotificationService } from '@core/services/alert-notification.service';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { BillingDetailDialog } from '../../components/billing-detail-dialog/billing-detail-dialog';
import {
  BillingPayDialog,
  BillingPayDialogData,
} from '../../components/billing-pay-dialog/billing-pay-dialog';

const ALL_STATUSES = 'Todos los estados';

// Registros usados para calcular los totales del resumen
const SUMMARY_SIZE = 1000;

const STATUS_BY_LABEL: Record<string, BillingStatus> = {
  Pendiente: 'PENDING',
  Pagado: 'PAID',
  Cancelado: 'CANCELLED',
};

interface Stat {
  title: string;
  value: number;
  count: number;
  icon: string;
}

@Component({
  selector: 'app-billing-page',

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

  templateUrl: 'billing-page.html',

  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class BillingPage {
  // --------------------------------------------------
  // SERVICES
  // --------------------------------------------------


  private readonly dialogs =
    inject(TuiDialogService);

  private readonly patientService =
    inject(PatientService);

  private readonly billingService =
    inject(BillingRecordService);

  private readonly notificationService= inject(NotificationService)

  // --------------------------------------------------
  // FORMULARIO
  // --------------------------------------------------

  protected readonly form =
    new FormGroup({
      search: new FormControl(''),
      status: new FormControl(''),
      filter: new FormControl(''),
    });

  // --------------------------------------------------
  // PAGINACIÓN
  // --------------------------------------------------

  protected readonly page = signal(0);

  protected readonly size = signal(4);

  // --------------------------------------------------
  // FILTROS
  // --------------------------------------------------

  protected readonly statuses = [
    ALL_STATUSES,
    'Pendiente',
    'Pagado',
    'Cancelado',
  ];

  protected readonly filters = [
    'Fecha reciente',
    'Fecha antigua',
    'Mayor monto',
    'Menor monto',
  ];

  protected readonly count = toSignal(
    this.form.valueChanges.pipe(
      map(() =>
        tuiCountFilledControls(this.form),
      ),
    ),
    {
      initialValue: 0,
    },
  );

  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.value),
    ),
    {
      initialValue: this.form.value,
    },
  );

  // --------------------------------------------------
  // ESTADÍSTICAS
  // --------------------------------------------------

  protected readonly summaryResource =
    rxResource({
      stream: () =>
        this.billingService.findAll(
          0,
          SUMMARY_SIZE,
        ),
    });

  protected readonly stats = computed<Stat[]>(() => {
    const records =
      this.summaryResource.value()?.content ?? [];

    const total = (status?: BillingStatus) => {
      const filtered = status
        ? records.filter(record => record.status === status)
        : records;

      return {
        value: filtered.reduce((sum, record) => sum + record.amount, 0),
        count: filtered.length,
      };
    };

    return [
      { title: 'Total facturado', icon: '@tui.wallet', ...total() },
      { title: 'Pendiente de pago', icon: '@tui.clock', ...total('PENDING') },
      { title: 'Pagado', icon: '@tui.circle-check', ...total('PAID') },
      { title: 'Cancelado', icon: '@tui.circle-x', ...total('CANCELLED') },
    ];
  });

  // --------------------------------------------------
  // RESOURCE
  // --------------------------------------------------

  protected readonly billingResource =
    rxResource({
      params: () => ({
        page: this.page(),
        size: this.size(),
      }),

      stream: ({ params }) =>
        this.billingService.findAll(
          params.page,
          params.size,
        ),
    });

  // --------------------------------------------------
  // NOMBRES DE PACIENTES
  //
  // BillingRecordResponse solo trae patientId: se consulta
  // una vez cada paciente distinto de la página cargada.
  // --------------------------------------------------

  private readonly patientIds = computed(() => [
    ...new Set(
      (this.billingResource.value()?.content ?? [])
        .map(record => record.patientId),
    ),
  ]);

  protected readonly patientNamesResource =
    rxResource({
      params: () => ({
        ids: this.patientIds(),
      }),

      stream: ({ params }) => {
        if (!params.ids.length) {
          return of(new Map<number, string>());
        }

        return forkJoin(
          params.ids.map(id =>
            this.patientService.findById(id).pipe(
              map(patient => `${patient.firstName} ${patient.lastName}`),
              catchError(() => of(null)),
            ),
          ),
        ).pipe(
          map(names => {
            const result = new Map<number, string>();

            params.ids.forEach((id, index) => {
              const name = names[index];

              if (name) {
                result.set(id, name);
              }
            });

            return result;
          }),
        );
      },
    });

  protected patientName(
    patientId: number,
  ): string {
    return (
      this.patientNamesResource.value()?.get(patientId) ??
      `Paciente #${patientId}`
    );
  }

  // --------------------------------------------------
  // FILTROS (sobre la página cargada)
  // --------------------------------------------------

  protected readonly filteredRecords = computed(() => {
    const records =
      this.billingResource.value()?.content ?? [];

    const { search, status, filter } =
      this.formValue();

    const term = (search ?? '').trim().replace('#', '');

    const statusFilter =
      STATUS_BY_LABEL[status ?? ''];

    const result = records.filter(record =>
      (!statusFilter || record.status === statusFilter) &&
      (!term ||
        [record.id, record.patientId, record.appointmentId]
          .some(value => String(value).includes(term)) ||
        this.patientName(record.patientId)
          .toLowerCase()
          .includes(term.toLowerCase())),
    );

    const byDate = (record: BillingRecordResponse) =>
      new Date(record.issuedAt).getTime();

    switch (filter) {
      case 'Fecha reciente':
        return [...result].sort((a, b) => byDate(b) - byDate(a));
      case 'Fecha antigua':
        return [...result].sort((a, b) => byDate(a) - byDate(b));
      case 'Mayor monto':
        return [...result].sort((a, b) => b.amount - a.amount);
      case 'Menor monto':
        return [...result].sort((a, b) => a.amount - b.amount);
      default:
        return result;
    }
  });

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  protected getStatusLabel(
    status: BillingStatus,
  ): string {
    const labels: Record<
      BillingStatus,
      string
    > = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      CANCELLED: 'Cancelado',
    };

    return labels[status];
  }

  protected getStatusClass(
    status: BillingStatus,
  ): string {
    const classes: Record<
      BillingStatus,
      string
    > = {
      PENDING:
        'bg-amber-50 text-amber-700',

      PAID:
        'bg-emerald-50 text-emerald-700',

      CANCELLED:
        'bg-red-50 text-red-700',
    };

    return classes[status];
  }

  // --------------------------------------------------
  // PAGINACIÓN
  // --------------------------------------------------

  protected nextPage(): void {
    const response =
      this.billingResource.value();

    if (!response || response.last) {
      return;
    }

    this.page.update(
      page => page + 1,
    );
  }

  protected previousPage(): void {
    const response =
      this.billingResource.value();

    if (!response || response.first) {
      return;
    }

    this.page.update(
      page => page - 1,
    );
  }

  // --------------------------------------------------
  // BÚSQUEDA
  // --------------------------------------------------

  protected searchBillings(): void {
    this.billingResource.reload();
    this.summaryResource.reload();
  }

  // --------------------------------------------------
  // DESCARGAR CSV
  // --------------------------------------------------

  protected download(): void {
    const header = [
      'Factura',
      'Cita',
      'Paciente',
      'Monto',
      'Moneda',
      'Estado',
      'Emitida',
      'Pagada',
    ];

    const rows = this.filteredRecords().map(record => [
      record.id,
      record.appointmentId,
      `"${this.patientName(record.patientId)}"`,
      record.amount.toFixed(2),
      record.currency,
      this.getStatusLabel(record.status),
      record.issuedAt,
      record.paidAt ?? '',
    ]);

    const csv = [header, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );

    const link = document.createElement('a');

    link.href = url;
    link.download = `facturacion-pagina-${this.page() + 1}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------
  // PAGAR FACTURA
  // --------------------------------------------------

  protected payBilling(
    record: BillingRecordResponse,
  ): void {
    const data: BillingPayDialogData = {
      record,
      patientName: this.patientName(record.patientId),
    };

    this.dialogs
      .open<boolean>(
        new PolymorpheusComponent(
          BillingPayDialog,
        ),
        {
          label: 'Registrar cobro',
          size: 's',
          data,
        },
      )
      .pipe(
        // Cerrar con la X completa el diálogo sin valor: solo se cobra con true
        switchMap(confirmed =>
          confirmed
            ? this.billingService
                .pay(record.id)
                .pipe(
                  withNotification(
                    this.notificationService,
                    {
                      success:
                        'Factura pagada correctamente',
                    },
                  ),
                )
            : EMPTY,
        ),
      )
      .subscribe({
        next: () => {
          this.billingResource.reload();
          this.summaryResource.reload();
        },
      });
  }

  // --------------------------------------------------
  // DETALLE
  // --------------------------------------------------

  protected viewDetail(
    record: BillingRecordResponse,
  ): void {
    this.dialogs
      .open(
        new PolymorpheusComponent(
          BillingDetailDialog,
        ),
        {
          label: 'Detalle de factura',
          size: 'm',
          data: record,
        },
      )
      .subscribe();
  }
}