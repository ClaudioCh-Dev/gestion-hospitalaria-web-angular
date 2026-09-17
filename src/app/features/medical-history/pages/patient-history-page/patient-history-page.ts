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

import {
  rxResource,
  toSignal,
} from '@angular/core/rxjs-interop';

import { map } from 'rxjs';
import { tuiCountFilledControls } from '@taiga-ui/cdk';

import {
  TuiAppearance,
  TuiButton,
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

interface Stat {
  title: string;
  value: string;
  icon: string;
  change: string;
  description: string;
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

  protected readonly form = new FormGroup({
    search: new FormControl(''),
    category: new FormControl(''),
    status: new FormControl(null),
    completed: new FormControl(false),
    filter: new FormControl([]),
  });

  protected readonly page = signal(0);
  protected readonly size = signal(4);

  protected readonly categories = [
    'Cardiología',
    'Dermatología',
    'Medicina General',
    'Pediatría',
    'Neurología',
    'Traumatología',
    'Ginecología',
    'Oftalmología',
    'Endocrinología',
    'Urología',
    'Nutrición',
  ];

  protected readonly count = toSignal(
    this.form.valueChanges.pipe(
      map(() => tuiCountFilledControls(this.form)),
    ),
    {
      initialValue: 0,
    },
  );

  protected readonly stats: Stat[] = [
    {
      title: 'Total consultas',
      value: '128',
      icon: '@tui.file-text',
      change: '+12%',
      description: 'este mes',
    },
    {
      title: 'Pacientes atendidos',
      value: '86',
      icon: '@tui.users',
      change: '+8%',
      description: 'este mes',
    },
    {
      title: 'Consultas completadas',
      value: '114',
      icon: '@tui.circle-check',
      change: '+10%',
      description: 'este mes',
    },
    {
      title: 'Ingresos',
      value: 'S/ 18,450',
      icon: '@tui.wallet',
      change: '+15%',
      description: 'este mes',
    },
  ];

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

  protected searchRecords(): void {
    console.log('Filtros:', this.form.value);

    this.page.set(0);

    this.medicalRecordsResource.reload();
  }
}