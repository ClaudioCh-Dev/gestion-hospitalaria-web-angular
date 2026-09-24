import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
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

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  forkJoin,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';

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
import { PageResponse } from '@shared/models/page.type';

import { BillingRecordService } from '../../services/billing-record.service';
import { BILLING_STATUS_LABELS } from '../../constants/billing-status';
import { downloadCsv } from '@shared/utils/csv';
import { PatientService } from '@patients/services/patient.service';
import { withNotification } from '@shared/operators/with-notification';
import { NotificationService } from '@core/services/alert-notification.service';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { BillingDetailDialog } from '../../components/billing-detail-dialog/billing-detail-dialog';
import {
  BillingPayDialog,
  BillingPayDialogData,
} from '../../components/billing-pay-dialog/billing-pay-dialog';
import { StateMessage } from '@shared/components/state-message/state-message';

const ALL_STATUSES = 'Todos los estados';

// Pacientes consultados en patient-ms al buscar facturas por nombre
const PATIENT_LOOKUP_SIZE = 100;

// Opciones de "Ordenar por" → parámetro sort de Spring
const SORT_BY_LABEL: Record<string, string> = {
  'Fecha reciente': 'issuedAt,desc',
  'Fecha antigua': 'issuedAt,asc',
  'Mayor monto': 'amount,desc',
  'Menor monto': 'amount,asc',
};

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
    StateMessage,
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

  // Espera a que el usuario deje de escribir antes de consultar al backend
  private readonly debouncedSearch = toSignal(
    this.form.controls.search.valueChanges.pipe(
      debounceTime(300),
      map(search => (search ?? '').trim()),
      distinctUntilChanged(),
    ),
    {
      initialValue: '',
    },
  );

  protected readonly activeFilters = computed(() => {
    const { status, filter } = this.formValue();

    return {
      status: STATUS_BY_LABEL[status ?? ''] ?? null,
      sort: SORT_BY_LABEL[filter ?? ''] ?? null,
      search: this.debouncedSearch(),
    };
  });

  // --------------------------------------------------
  // PAGINACIÓN: vuelve a la primera página al cambiar los filtros
  // --------------------------------------------------

  protected readonly page = linkedSignal({
    source: this.activeFilters,
    computation: () => 0,
  });

  // --------------------------------------------------
  // ESTADÍSTICAS (GET /billings/crud/summary)
  // --------------------------------------------------

  protected readonly summaryResource =
    rxResource({
      stream: () => this.billingService.summary(),
    });

  protected readonly stats = computed<Stat[]>(() => {
    const summary = this.summaryResource.value();

    return [
      {
        title: 'Total facturado',
        icon: '@tui.wallet',
        value: summary?.totalAmount ?? 0,
        count: summary?.totalCount ?? 0,
      },
      {
        title: 'Pendiente de pago',
        icon: '@tui.clock',
        value: summary?.pendingAmount ?? 0,
        count: summary?.pendingCount ?? 0,
      },
      {
        title: 'Pagado',
        icon: '@tui.circle-check',
        value: summary?.paidAmount ?? 0,
        count: summary?.paidCount ?? 0,
      },
      {
        title: 'Cancelado',
        icon: '@tui.circle-x',
        value: summary?.cancelledAmount ?? 0,
        count: summary?.cancelledCount ?? 0,
      },
    ];
  });

  // --------------------------------------------------
  // RESOURCE
  //
  // Un número se busca en billing-ms (factura, cita o paciente).
  // Un texto se busca primero en patient-ms y se filtra por esos IDs.
  // --------------------------------------------------

  protected readonly billingResource =
    rxResource({
      params: () => ({
        page: this.page(),
        size: this.size(),
        ...this.activeFilters(),
      }),

      stream: ({ params }) => {
        const term = params.search.replace('#', '');

        const base = {
          status: params.status,
          sort: params.sort,
        };

        if (!term || /^\d+$/.test(term)) {
          return this.billingService.findAll(
            params.page,
            params.size,
            { ...base, search: term },
          );
        }

        return this.patientService
          .findAll(0, PATIENT_LOOKUP_SIZE, undefined, term)
          .pipe(
            switchMap(patients =>
              patients.content.length
                ? this.billingService.findAll(
                    params.page,
                    params.size,
                    { ...base, patientIds: patients.content.map(patient => patient.id) },
                  )
                : of(this.emptyPage(params.page, params.size)),
            ),
          );
      },
    });

  protected readonly records = computed(
    () => this.billingResource.value()?.content ?? [],
  );

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
  // HELPERS
  // --------------------------------------------------

  protected getStatusLabel(
    status: BillingStatus,
  ): string {
    return BILLING_STATUS_LABELS[status];
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
    downloadCsv(
      `facturacion-pagina-${this.page() + 1}.csv`,
      ['Factura', 'Cita', 'Paciente', 'Monto', 'Moneda', 'Estado', 'Emitida', 'Pagada'],
      this.records().map(record => [
        record.id,
        record.appointmentId,
        this.patientName(record.patientId),
        record.amount.toFixed(2),
        record.currency,
        this.getStatusLabel(record.status),
        record.issuedAt,
        record.paidAt,
      ]),
    );
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

  private emptyPage(
    page: number,
    size: number,
  ): PageResponse<BillingRecordResponse> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size,
      number: page,
      first: true,
      last: true,
      numberOfElements: 0,
    };
  }
}
