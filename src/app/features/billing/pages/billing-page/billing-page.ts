import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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

interface Stat {
  title: string;
  value: string;
  icon: string;
  change: string;
  description: string;
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
  private readonly billingService = inject(BillingRecordService);

  // --------------------------------------------------
  // FORMULARIO
  // --------------------------------------------------

  protected readonly form = new FormGroup({
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
  // RESOURCE
  // --------------------------------------------------

  protected readonly billingResource = rxResource({
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
    const response = this.billingResource.value();

    if (!response || response.last) {
      return;
    }

    this.page.update(page => page + 1);
  }

  protected previousPage(): void {
    const response = this.billingResource.value();

    if (!response || response.first) {
      return;
    }

    this.page.update(page => page - 1);
  }

  // --------------------------------------------------
  // ACCIONES
  // --------------------------------------------------

  protected searchBillings(): void {
    console.log('Filtros:', this.form.value);

    this.page.set(0);

    this.billingResource.reload();
  }

  protected payBilling(
    record: BillingRecordResponse,
  ): void {
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
        this.billingService
          .pay(record.id)
          .subscribe(() => {
            this.billingResource.reload();
          });
      });
  }

  protected viewDetail(
    record: BillingRecordResponse,
  ): void {
    console.log('Ver detalle:', record);
  }
}