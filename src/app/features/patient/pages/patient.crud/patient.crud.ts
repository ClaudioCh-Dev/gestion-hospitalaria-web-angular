import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  TUI_CONFIRM,
  TuiComboBox,
  TuiDataListWrapper,
  TuiItemsWithMore,
  TuiSelect,
  type TuiConfirmData,
} from '@taiga-ui/kit';

import { filter, switchMap } from 'rxjs';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { Gender, PatientDetailResponse, PatientRequest, PatientResponse } from '../../interfaces';

import { NotificationService } from '@core/services/alert-notification.service';
import { withNotification } from '@shared/operators/with-notification';

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
  private readonly notificationService = inject(NotificationService);

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
  // Filtros
  // ============================

  protected readonly search = signal('');

  protected readonly gender = signal<Gender | null>(null);

  // ============================
  // Pacientes
  // ============================

  protected readonly patientsResource = rxResource({
    params: () => ({
      page: this.page(),
      size: this.size(),
      gender: this.gender() ?? undefined,
    }),

    stream: (resource) =>
      this.patientService.findAll(
        resource.params.page,
        resource.params.size,
        resource.params.gender,
      ),
  });

  // El backend solo filtra por género: la búsqueda por texto se aplica sobre la página cargada
  protected readonly filteredPatients = computed(() => {
    const patients = this.patientsResource.value()?.content ?? [];
    const term = this.search().toLowerCase();

    if (!term) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.firstName, patient.lastName, patient.documentNumber, patient.email ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
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

      error: () => {
        this.loadingPatientId.set(null);
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

      error: () => {
        this.loadingPatientId.set(null);
      },
    });
  }

  // ============================
  // Filtros
  // ============================

  protected onFiltersChange(filters: PatientFilters): void {
    this.search.set(filters.search);

    if (filters.gender !== this.gender()) {
      this.gender.set(filters.gender);
      this.page.set(0);
    }
  }

  // ============================
  // Eliminar paciente
  // ============================

  protected deletePatient(patient: PatientResponse): void {
    const data: TuiConfirmData = {
      content: `Se eliminará a <strong>${patient.firstName} ${patient.lastName}</strong> (DNI ${patient.documentNumber}). Esta acción no se puede deshacer.`,
      yes: 'Eliminar',
      no: 'Cancelar',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: '¿Eliminar paciente?',
        size: 's',
        data,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.loadingPatientId.set(patient.id);

          return this.patientService.delete(patient.id).pipe(
            withNotification(this.notificationService, {
              success: 'Paciente eliminado correctamente',
            }),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.loadingPatientId.set(null);

          if (this.selectedPatient()?.id === patient.id) {
            this.selectedPatient.set(null);
          }

          this.patientsResource.reload();
        },
        error: () => this.loadingPatientId.set(null),
      });
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