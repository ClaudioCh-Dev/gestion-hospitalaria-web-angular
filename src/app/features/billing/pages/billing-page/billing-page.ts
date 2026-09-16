import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import {CommonModule} from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {toSignal} from '@angular/core/rxjs-interop';

import {map} from 'rxjs';

import {tuiCountFilledControls} from '@taiga-ui/cdk';

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

interface Stat {
  title: string;
  value: string;
  icon: string;
  change: string;
  description: string;
}

type BillingStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED';

interface BillingRecordResponse {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  amount: number;
  currency: string;
  status: BillingStatus;
  issuedAt: string;
  paidAt: string | null;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
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

  private readonly dialogs = inject(TuiDialogService);

  // --------------------------------------------------
  // FORMULARIO
  // --------------------------------------------------

  protected readonly form = new FormGroup({
    search: new FormControl(''),
    status: new FormControl(''),
    filter: new FormControl(''),
  });

  // --------------------------------------------------
  // FILTROS
  // --------------------------------------------------

  protected readonly statuses = [
    'Todos los estados',
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
      map(() => tuiCountFilledControls(this.form)),
    ),
    {
      initialValue: 0,
    },
  );

  // --------------------------------------------------
  // ESTADÍSTICAS
  // --------------------------------------------------

  protected readonly stats: Stat[] = [
    {
      title: 'Total facturado',
      value: 'S/ 18,450',
      icon: '@tui.wallet',
      change: '+15%',
      description: 'este mes',
    },
    {
      title: 'Pendiente de pago',
      value: 'S/ 2,350',
      icon: '@tui.clock',
      change: '+8%',
      description: 'por cobrar',
    },
    {
      title: 'Pagado',
      value: 'S/ 15,200',
      icon: '@tui.circle-check',
      change: '+12%',
      description: 'este mes',
    },
    {
      title: 'Cancelado',
      value: 'S/ 900',
      icon: '@tui.circle-x',
      change: '-5%',
      description: 'este mes',
    },
  ];

  // --------------------------------------------------
  // MOCKS
  // --------------------------------------------------

  private readonly mockPages: PageResponse<BillingRecordResponse>[] = [
    {
      content: [
        {
          id: 125,
          appointmentId: 101,
          patientId: 1,
          patientName: 'Juan Pérez',
          amount: 150,
          currency: 'PEN',
          status: 'PAID',
          issuedAt: '2026-09-15T10:30:00',
          paidAt: '2026-09-15T11:05:00',
        },
        {
          id: 124,
          appointmentId: 102,
          patientId: 2,
          patientName: 'María García',
          amount: 120,
          currency: 'PEN',
          status: 'PENDING',
          issuedAt: '2026-09-14T09:00:00',
          paidAt: null,
        },
        {
          id: 123,
          appointmentId: 103,
          patientId: 3,
          patientName: 'Luis Ramírez',
          amount: 100,
          currency: 'PEN',
          status: 'PAID',
          issuedAt: '2026-09-13T16:00:00',
          paidAt: '2026-09-13T16:45:00',
        },
        {
          id: 122,
          appointmentId: 104,
          patientId: 4,
          patientName: 'Sofía Castillo',
          amount: 130,
          currency: 'PEN',
          status: 'CANCELLED',
          issuedAt: '2026-09-12T11:00:00',
          paidAt: null,
        },
        {
          id: 121,
          appointmentId: 105,
          patientId: 5,
          patientName: 'Carlos Mendoza',
          amount: 150,
          currency: 'PEN',
          status: 'PENDING',
          issuedAt: '2026-09-11T08:30:00',
          paidAt: null,
        },
      ],
      totalElements: 15,
      totalPages: 3,
      size: 5,
      number: 0,
      first: true,
      last: false,
      numberOfElements: 5,
    },

    {
      content: [
        {
          id: 120,
          appointmentId: 106,
          patientId: 6,
          patientName: 'Andrea Flores',
          amount: 180,
          currency: 'PEN',
          status: 'PAID',
          issuedAt: '2026-09-10T14:00:00',
          paidAt: '2026-09-10T14:30:00',
        },
        {
          id: 119,
          appointmentId: 107,
          patientId: 7,
          patientName: 'Pedro Sánchez',
          amount: 160,
          currency: 'PEN',
          status: 'PAID',
          issuedAt: '2026-09-09T10:00:00',
          paidAt: '2026-09-09T10:40:00',
        },
        {
          id: 118,
          appointmentId: 108,
          patientId: 8,
          patientName: 'Camila Torres',
          amount: 170,
          currency: 'PEN',
          status: 'PENDING',
          issuedAt: '2026-09-08T15:30:00',
          paidAt: null,
        },
        {
          id: 117,
          appointmentId: 109,
          patientId: 9,
          patientName: 'Diego Vargas',
          amount: 140,
          currency: 'PEN',
          status: 'CANCELLED',
          issuedAt: '2026-09-07T09:30:00',
          paidAt: null,
        },
        {
          id: 116,
          appointmentId: 110,
          patientId: 10,
          patientName: 'Valeria Rojas',
          amount: 190,
          currency: 'PEN',
          status: 'PAID',
          issuedAt: '2026-09-06T11:30:00',
          paidAt: '2026-09-06T12:00:00',
        },
      ],
      totalElements: 15,
      totalPages: 3,
      size: 5,
      number: 1,
      first: false,
      last: false,
      numberOfElements: 5,
    },

    {
      content: [
        {
          id: 115,
          appointmentId: 111,
          patientId: 11,
          patientName: 'Fernando Castro',
          amount: 160,
          currency: 'PEN',
          status: 'PENDING',
          issuedAt: '2026-09-05T13:00:00',
          paidAt: null,
        },
        {
          id: 114,
          appointmentId: 112,
          patientId: 12,
          patientName: 'Gabriela Navarro',
          amount: 100,
          currency: 'PEN',
          status: 'PAID',
          issuedAt: '2026-09-04T10:00:00',
          paidAt: '2026-09-04T10:35:00',
        },
        {
          id: 113,
          appointmentId: 113,
          patientId: 13,
          patientName: 'Ricardo Salazar',
          amount: 200,
          currency: 'PEN',
          status: 'PAID',
          issuedAt: '2026-09-03T09:00:00',
          paidAt: '2026-09-03T09:50:00',
        },
        {
          id: 112,
          appointmentId: 114,
          patientId: 14,
          patientName: 'Daniela Mendoza',
          amount: 150,
          currency: 'PEN',
          status: 'CANCELLED',
          issuedAt: '2026-09-02T15:00:00',
          paidAt: null,
        },
        {
          id: 111,
          appointmentId: 115,
          patientId: 15,
          patientName: 'Miguel Herrera',
          amount: 180,
          currency: 'PEN',
          status: 'PENDING',
          issuedAt: '2026-09-01T10:30:00',
          paidAt: null,
        },
      ],
      totalElements: 15,
      totalPages: 3,
      size: 5,
      number: 2,
      first: false,
      last: true,
      numberOfElements: 5,
    },
  ];

  protected page: PageResponse<BillingRecordResponse> =
    this.mockPages[0];

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  protected getStatusLabel(status: BillingStatus): string {
    const labels: Record<BillingStatus, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      CANCELLED: 'Cancelado',
    };

    return labels[status];
  }

  protected getStatusClass(status: BillingStatus): string {
    const classes: Record<BillingStatus, string> = {
      PENDING: 'bg-amber-50 text-amber-700',
      PAID: 'bg-emerald-50 text-emerald-700',
      CANCELLED: 'bg-red-50 text-red-700',
    };

    return classes[status];
  }

  // --------------------------------------------------
  // PAGINACIÓN
  // --------------------------------------------------

  protected nextPage(): void {
    if (this.page.last) {
      return;
    }

    this.loadPage(this.page.number + 1);
  }

  protected previousPage(): void {
    if (this.page.first) {
      return;
    }

    this.loadPage(this.page.number - 1);
  }

  private loadPage(page: number): void {
    console.log('Cargando página:', page + 1);

    setTimeout(() => {
      const response = this.mockPages[page];

      if (!response) {
        return;
      }

      this.page = response;

      console.log('Respuesta recibida:', response);
    }, 500);
  }

  // --------------------------------------------------
  // ACCIONES
  // --------------------------------------------------

  protected searchBillings(): void {
    console.log('Filtros:', this.form.value);
  }

  protected payBilling(record: BillingRecordResponse): void {
    this.dialogs
      .open(
        `
          ¿Deseas confirmar el pago de la factura
          <strong>#${record.id}</strong>
          por
          <strong>${record.currency} ${record.amount.toFixed(2)}</strong>?
        `,
        {
          label: 'Confirmar pago',
          size: 's',
        },
      )
      .subscribe(() => {
        console.log('Pago confirmado:', record.id);

        // Posteriormente:
        // this.billingService.payBilling(record.id)
        //   .subscribe(() => this.loadPage(this.page.number));
      });
  }

  protected viewDetail(record: BillingRecordResponse): void {
    console.log('Ver detalle:', record);
  }
}