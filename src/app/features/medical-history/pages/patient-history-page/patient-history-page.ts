import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
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
  TuiFilter,
  TuiSegmented,
  TuiSelect,
  TuiSwitch,
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

interface MedicalRecordResponse {
  id: string;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  scheduledAt: string;
  reason: string;
  status: string;
  amount: number;
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
    TuiAppearance
  ],

  templateUrl: 'patient-history-page.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRecords {

  protected readonly form = new FormGroup({
    search: new FormControl(''),
    category: new FormControl(''),
    status: new FormControl(null),
    completed: new FormControl(false),
    filter: new FormControl([]),
  });

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

  protected readonly filters = [
    'Fecha reciente',
    'Fecha antigua',
    'Mayor monto',
    'Menor monto',
  ];

  protected readonly segments = [
    null,
    'COMPLETED',
    'PENDING',
    'CANCELLED',
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

  // --------------------------------------------------
  // MOCKS
  // --------------------------------------------------

  private readonly mockPages: PageResponse<MedicalRecordResponse>[] = [

    {
      content: [
        {
          id: '1',
          appointmentId: 101,
          patientId: 1,
          patientName: 'Juan Pérez',
          doctorId: 10,
          doctorName: 'Dr. Carlos López',
          specialty: 'Cardiología',
          scheduledAt: '2026-09-15T10:30:00',
          reason: 'Dolor en el pecho',
          status: 'COMPLETED',
          amount: 150,
        },
        {
          id: '2',
          appointmentId: 102,
          patientId: 2,
          patientName: 'María García',
          doctorId: 11,
          doctorName: 'Dra. Ana Torres',
          specialty: 'Dermatología',
          scheduledAt: '2026-09-14T09:00:00',
          reason: 'Revisión de manchas en la piel',
          status: 'COMPLETED',
          amount: 120,
        },
        {
          id: '3',
          appointmentId: 103,
          patientId: 3,
          patientName: 'Luis Ramírez',
          doctorId: 12,
          doctorName: 'Dr. Juan Pérez',
          specialty: 'Medicina General',
          scheduledAt: '2026-09-12T16:00:00',
          reason: 'Dolor de cabeza recurrente',
          status: 'COMPLETED',
          amount: 100,
        },
        {
          id: '4',
          appointmentId: 104,
          patientId: 4,
          patientName: 'Sofía Castillo',
          doctorId: 13,
          doctorName: 'Dra. Laura Mendoza',
          specialty: 'Pediatría',
          scheduledAt: '2026-09-10T11:00:00',
          reason: 'Control pediátrico',
          status: 'COMPLETED',
          amount: 130,
        },
      ],
      totalElements: 12,
      totalPages: 3,
      size: 4,
      number: 0,
      first: true,
      last: false,
      numberOfElements: 4,
    },

    {
      content: [
        {
          id: '5',
          appointmentId: 105,
          patientId: 5,
          patientName: 'Carlos Mendoza',
          doctorId: 10,
          doctorName: 'Dr. Carlos López',
          specialty: 'Cardiología',
          scheduledAt: '2026-09-09T08:30:00',
          reason: 'Control de presión arterial',
          status: 'COMPLETED',
          amount: 150,
        },
        {
          id: '6',
          appointmentId: 106,
          patientId: 6,
          patientName: 'Andrea Flores',
          doctorId: 14,
          doctorName: 'Dra. Patricia Silva',
          specialty: 'Neurología',
          scheduledAt: '2026-09-08T14:00:00',
          reason: 'Migraña frecuente',
          status: 'COMPLETED',
          amount: 180,
        },
        {
          id: '7',
          appointmentId: 107,
          patientId: 7,
          patientName: 'Pedro Sánchez',
          doctorId: 15,
          doctorName: 'Dr. Miguel Herrera',
          specialty: 'Traumatología',
          scheduledAt: '2026-09-06T10:00:00',
          reason: 'Dolor en la rodilla',
          status: 'COMPLETED',
          amount: 160,
        },
        {
          id: '8',
          appointmentId: 108,
          patientId: 8,
          patientName: 'Camila Torres',
          doctorId: 16,
          doctorName: 'Dra. Elena Vargas',
          specialty: 'Ginecología',
          scheduledAt: '2026-09-05T15:30:00',
          reason: 'Control ginecológico',
          status: 'COMPLETED',
          amount: 170,
        },
      ],
      totalElements: 12,
      totalPages: 3,
      size: 4,
      number: 1,
      first: false,
      last: false,
      numberOfElements: 4,
    },

    {
      content: [
        {
          id: '9',
          appointmentId: 109,
          patientId: 9,
          patientName: 'Diego Vargas',
          doctorId: 17,
          doctorName: 'Dr. Roberto Díaz',
          specialty: 'Oftalmología',
          scheduledAt: '2026-09-03T09:30:00',
          reason: 'Problemas de visión',
          status: 'COMPLETED',
          amount: 140,
        },
        {
          id: '10',
          appointmentId: 110,
          patientId: 10,
          patientName: 'Valeria Rojas',
          doctorId: 18,
          doctorName: 'Dra. Carmen Ruiz',
          specialty: 'Endocrinología',
          scheduledAt: '2026-09-02T11:30:00',
          reason: 'Control de glucosa',
          status: 'COMPLETED',
          amount: 190,
        },
        {
          id: '11',
          appointmentId: 111,
          patientId: 11,
          patientName: 'Fernando Castro',
          doctorId: 19,
          doctorName: 'Dr. Andrés Molina',
          specialty: 'Urología',
          scheduledAt: '2026-09-01T13:00:00',
          reason: 'Dolor abdominal',
          status: 'COMPLETED',
          amount: 160,
        },
        {
          id: '12',
          appointmentId: 112,
          patientId: 12,
          patientName: 'Gabriela Navarro',
          doctorId: 20,
          doctorName: 'Dra. Natalia León',
          specialty: 'Nutrición',
          scheduledAt: '2026-08-30T10:00:00',
          reason: 'Evaluación nutricional',
          status: 'COMPLETED',
          amount: 100,
        },
      ],
      totalElements: 12,
      totalPages: 3,
      size: 4,
      number: 2,
      first: false,
      last: true,
      numberOfElements: 4,
    },
  ];

  protected page: PageResponse<MedicalRecordResponse> =
    this.mockPages[0];

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
  // SEARCH
  // --------------------------------------------------

  protected searchRecords(): void {
    console.log('Filtros:', this.form.value);

    // Posteriormente:
    //
    // this.service.findAll({
    //   page: this.page.number,
    //   size: this.page.size,
    //   search: this.form.value.search,
    //   category: this.form.value.category,
    // });
  }
}