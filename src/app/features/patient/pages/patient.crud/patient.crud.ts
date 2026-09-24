import { HasPermission } from '@shared/directives/has-permission.directive';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  TuiButtonLoading,
  TuiComboBox,
  TuiDataListWrapper,
  TuiItemsWithMore,
  TuiSelect,
} from '@taiga-ui/kit';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';

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
import { StateMessage } from '@shared/components/state-message/state-message';
import { fetchAllPages } from '@shared/utils/paging';
import { downloadCsv } from '@shared/utils/csv';

@Component({
  selector: 'app-patient-crud',
  imports: [HasPermission, 
    StateMessage,
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
    TuiButtonLoading,
  ],
  templateUrl: 'patient.crud.html',
  styleUrl: 'patient.crud.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientCrud {

  private readonly patientService = inject(PatientService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly confirm = inject(ConfirmService);
  private readonly notificationService = inject(NotificationService);

  protected readonly loadingPatientId = signal<number | null>(null);

  // ============================
  // Tabla
  // ============================

  protected readonly selected = signal<PatientResponse[]>([]);

  protected readonly bulkBusy = signal(false);

  protected readonly exporting = signal(false);

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

  // Espera a que el usuario deje de escribir antes de consultar al backend
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      debounceTime(300),
      map((search) => search.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly patientsResource = rxResource({
    params: () => ({
      page: this.page(),
      size: this.size(),
      gender: this.gender() ?? undefined,
      search: this.debouncedSearch(),
    }),

    stream: (resource) =>
      this.patientService.findAll(
        resource.params.page,
        resource.params.size,
        resource.params.gender,
        resource.params.search,
      ),
  });

  protected readonly patients = computed(
    () => this.patientsResource.value()?.content ?? [],
  );

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
    this.selected.set([]);

    if (filters.search !== this.search() || filters.gender !== this.gender()) {
      this.page.set(0);
    }

    this.search.set(filters.search);
    this.gender.set(filters.gender);
  }

  // ============================
  // Eliminar paciente
  // ============================

  protected deletePatient(patient: PatientResponse): void {
    this.confirm
      .ask({
        title: '¿Eliminar paciente?',
        message: 'Se eliminarán sus datos del sistema. Esta acción no se puede deshacer.',
        subject: `${patient.firstName} ${patient.lastName}`,
        subjectDetail: `DNI ${patient.documentNumber}`,
        confirmLabel: 'Eliminar',
        variant: 'danger',
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
    this.selected.set([]);
    this.page.set(page);
  }

  // ============================
  // Cambiar tamaño
  // ============================

  protected changeSize(size: number): void {
    this.selected.set([]);
    this.size.set(size);
    this.page.set(0);
  }

  // ============================
  // Acciones masivas
  // ============================

  // Con selección exporta los seleccionados; sin selección, todos los que cumplen los filtros
  protected exportCsv(): void {
    const selected = this.selected();

    if (selected.length) {
      this.downloadPatients(selected, `pacientes-seleccionados-${selected.length}.csv`);
      return;
    }

    const gender = this.gender() ?? undefined;
    const search = this.debouncedSearch();

    this.exporting.set(true);

    fetchAllPages((page, size) =>
      this.patientService.findAll(page, size, gender, search),
    ).subscribe({
      next: (patients) => {
        this.exporting.set(false);
        this.downloadPatients(patients, `pacientes-${patients.length}.csv`);
      },
      error: () => this.exporting.set(false),
    });
  }

  private downloadPatients(patients: PatientResponse[], fileName: string): void {
    const genders: Record<string, string> = {
      [Gender.MALE]: 'Masculino',
      [Gender.FEMALE]: 'Femenino',
    };

    downloadCsv(
      fileName,
      ['DNI', 'Nombres', 'Apellidos', 'Género', 'Nacimiento', 'Teléfono', 'Correo', 'Estado'],
      patients.map((patient) => [
        patient.documentNumber,
        patient.firstName,
        patient.lastName,
        genders[patient.gender ?? ''] ?? '',
        patient.birthDate,
        patient.phone,
        patient.email,
        patient.active ? 'Activo' : 'Inactivo',
      ]),
    );
  }

  protected deleteSelected(): void {
    const patients = this.selected();

    this.confirm
      .ask({
        title: '¿Eliminar pacientes seleccionados?',
        message: 'Se eliminarán sus datos del sistema. Esta acción no se puede deshacer.',
        subject: `${patients.length} ${patients.length === 1 ? 'paciente' : 'pacientes'}`,
        confirmLabel: 'Eliminar',
        variant: 'danger',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.bulkBusy.set(true);
          this.notificationService.showLoading();

          // Cada eliminación es independiente: un fallo no detiene las demás
          return forkJoin(
            patients.map((patient) =>
              this.patientService.delete(patient.id).pipe(
                map(() => true),
                catchError(() => of(false)),
              ),
            ),
          );
        }),
      )
      .subscribe((results) => {
        const deleted = results.filter(Boolean).length;

        this.bulkBusy.set(false);
        this.selected.set([]);
        this.selectedPatient.set(null);
        this.patientsResource.reload();

        if (deleted === patients.length) {
          this.notificationService.showSuccess(
            `${deleted} ${deleted === 1 ? 'paciente eliminado' : 'pacientes eliminados'} correctamente`,
          );
          return;
        }

        this.notificationService.showError({
          status: 500,
          title: 'Eliminación incompleta',
          detail: `Se eliminaron ${deleted} de ${patients.length} pacientes. Revisa los que quedaron.`,
        });
      });
  }
}