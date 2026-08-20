import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { TuiTable, TuiTableControl, TuiTablePagination } from '@taiga-ui/addon-table';

import {
  TuiButton,
  TuiCell,
  TuiCheckbox,
  TuiDialogService,
  TuiDropdown,
  TuiIcon,
  TuiInput,
  TuiTitle,
} from '@taiga-ui/core';

import {
  TuiAutoColorPipe,
  TuiAvatar,
  TuiChevron,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInitialsPipe,
  TuiItemsWithMore,
  TuiSelect,
  TuiStatus,
} from '@taiga-ui/kit';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import {PageResponse} from '../../../../shared/models/types.dto';
import {PatientRequest, PatientResponse} from '../../model/patient.dtos';

import { PatientService } from '../../services/patient.service';

import { ModalCreateEdit } from '../../components/modal-create-edit/modal-create-edit';

import { PatientFilters, PatientFiltersComponent } from '../../components/patient-filters/patient-filters';

import { PatientTableComponent } from '../../components/patient-table/patient-table';

@Component({
  selector: 'app-patient-crud',

  imports: [
    FormsModule,

    PatientFiltersComponent,
    PatientTableComponent,

    TuiComboBox,
    TuiDataListWrapper,
    TuiDropdown,
    TuiInput,
    TuiItemsWithMore,
    TuiSelect,
    TuiTable,
    TuiTableControl,
    TuiTablePagination,
    TuiButton,
  ],

  templateUrl: 'patient.crud.html',

  styleUrl: 'patient.crud.less',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientCrud implements OnInit {
  private readonly patientService = inject(PatientService);

  private readonly dialogs = inject(TuiDialogService);

  // ============================
  // Tabla
  // ============================

  protected readonly data = signal<PatientResponse[]>([]);

  protected readonly selected = signal<PatientResponse[]>([]);

  protected total = signal(0);

  protected page = signal(0);

  protected size = signal(15);

  protected readonly sizeOptions = [10, 50, 100];

  // ============================
  // Inicialización
  // ============================

  ngOnInit(): void {
    this.loadPatients();
  }

  // ============================
  // Obtener pacientes
  // ============================

  protected loadPatients(): void {
    this.patientService.findAll(this.page(), this.size()).subscribe({
      next: (response: PageResponse<PatientResponse> | null) => {
        console.log('📥 Respuesta del backend:', response);

        if (!response) {
          console.error('❌ El backend devolvió null');
          return;
        }

        this.data.set(response.content);

        this.total.set(response.totalElements);
      },

      error: (error) => {
        console.error('Error al obtener pacientes', error);
      },
    });
  }

  // ============================
  // Crear paciente
  // ============================

  protected createPatientModal(): void {
    this.dialogs
      .open<PatientRequest | null>(new PolymorpheusComponent(ModalCreateEdit), {
        label: 'Nuevo paciente',
        size: 'm',
      })
      .subscribe((patient) => {
        if (patient === null) {
          return;
        }

        this.loadPatients();
      });
  }

  // ============================
  // Editar paciente
  // ============================

  protected editPatientModal(patient: PatientResponse): void {
    this.dialogs
      .open<PatientRequest | null>(new PolymorpheusComponent(ModalCreateEdit), {
        label: 'Editar paciente',
        size: 'm',
        data: patient,
      })
      .subscribe((patient) => {
        if (patient === null) {
          return;
        }

        this.loadPatients();
      });
  }
  
  // ============================
  // Filtros
  // ============================

  protected onFiltersChange(filters: PatientFilters): void {
    console.log('Filtros cambiados:', filters);
    this.loadPatients();
  }


  // ============================
  // Cambiar página
  // ============================

  protected changePage(page: number): void {
    this.page.set(page);

    this.loadPatients();
  }

  // ============================
  // Cambiar tamaño
  // ============================

  protected changeSize(size: number): void {
    this.size.set(size);

    this.page.set(0);

    this.loadPatients();
  }
}
