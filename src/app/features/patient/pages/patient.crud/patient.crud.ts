import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { rxResource } from '@angular/core/rxjs-interop';

import {
  TuiTable,
  TuiTableControl,
  TuiTablePagination,
} from '@taiga-ui/addon-table';

import {
  TuiButton,
  TuiDialogService,
  TuiDropdown,
  TuiInput,
} from '@taiga-ui/core';

import {
  TuiComboBox,
  TuiDataListWrapper,
  TuiItemsWithMore,
  TuiSelect,
} from '@taiga-ui/kit';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { PatientDetailResponse, PatientRequest, PatientResponse } from '../../interfaces';

import { PatientService } from '@patients/services/patient.service';

import { ModalCreateEdit } from '../../components/modal-create-edit/modal-create-edit';

import {
  PatientFilters,
  PatientFiltersComponent,
} from '../../components/patient-filters/patient-filters';

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
export class PatientCrud {

  private readonly patientService = inject(PatientService);
  private readonly dialogs = inject(TuiDialogService);

  protected readonly loadingPatientId = signal<number | null>(null);

  // ============================
  // Tabla
  // ============================

  protected readonly selected = signal<PatientResponse[]>([]);

  protected readonly selectedPatient =
    signal<PatientDetailResponse | null>(null);

  protected page = signal(0);
  protected size = signal(15);

  protected readonly sizeOptions = [10, 50, 100];

  // ============================
  // Pacientes
  // ============================

  protected readonly patientsResource = rxResource({
    params: () => ({
      page: this.page(),
      size: this.size(),
    }),

    stream: (resource) =>
      this.patientService.findAll(
        resource.params.page,
        resource.params.size,
      ),
  });

  // ============================
  // Crear paciente
  // ============================

  protected createPatientModal(): void {
    this.dialogs
      .open<PatientRequest | null>(
        new PolymorpheusComponent(ModalCreateEdit),
        {
          label: 'Nuevo paciente',
          size: 'm',
        },
      )
      .subscribe((patient) => {
        if (patient === null) {
          return;
        }

        this.patientsResource.reload();
      });
  }

  // ============================
  // Editar paciente
  // ============================

  protected editPatientModal(patient: PatientResponse): void {

    this.loadingPatientId.set(patient.id);

    this.patientService.findById(patient.id).subscribe({
      next: (detail) => {

        this.loadingPatientId.set(null);

        this.dialogs
          .open<PatientRequest | null>(
            new PolymorpheusComponent(ModalCreateEdit),
            {
              label: 'Editar paciente',
              size: 'm',
              data: detail,
            },
          )
          .subscribe((result) => {

            if (result === null) {
              return;
            }

            this.patientsResource.reload();
          });
      },

      error: (error) => {
        this.loadingPatientId.set(null);

        console.error(
          'Error al obtener detalle del paciente',
          error,
        );
      },
    });
  }

  // ============================
  // Ver paciente
  // ============================

  protected morePatient(patient: PatientResponse): void {

    this.loadingPatientId.set(patient.id);

    this.patientService.findById(patient.id).subscribe({
      next: (detail) => {

        this.loadingPatientId.set(null);

        this.selectedPatient.set(detail);
      },

      error: (error) => {

        this.loadingPatientId.set(null);

        console.error(
          'Error al obtener detalle del paciente',
          error,
        );
      },
    });
  }

  // ============================
  // Filtros
  // ============================

  protected onFiltersChange(filters: PatientFilters): void {
    console.log('Filtros cambiados:', filters);

    this.page.set(0);
  }

  // ============================
  // Cambiar página
  // ============================

  protected changePage(page: number): void {
    this.page.set(page);
  }

  // ============================
  // Cambiar tamaño
  // ============================

  protected changeSize(size: number): void {
    this.size.set(size);
    this.page.set(0);
  }
}