import { HasPermission } from '@shared/directives/has-permission.directive';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';

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

import {
  TuiButton,
  TuiDialogService,
} from '@taiga-ui/core';

import {
  TuiTable,
  TuiTablePagination,
} from '@taiga-ui/addon-table';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { TuiButtonLoading } from '@taiga-ui/kit';

import {
  DoctorResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
} from '../../interfaces';

import { DoctorService } from '../../services/doctor.service';

import { SpecialtyStore } from '../../store/specialty.store';

import { ModalCreateEdit } from '../../components/modal-create-edit/modal-create-edit';

import {
  DoctorFilters,
  DoctorFiltersComponent,
} from '../../components/doctor-filters/doctor-filters';

import { DoctorTableComponent } from '../../components/doctor-table/doctor-table';

import { SpecialtyModal } from '../../components/specialty-modal/specialty-modal';
import { StateMessage } from '@shared/components/state-message/state-message';
import { fetchAllPages } from '@shared/utils/paging';
import { downloadCsv } from '@shared/utils/csv';
import { NotificationService } from '@core/services/alert-notification.service';

@Component({
  selector: 'app-doctor-crud',
  imports: [HasPermission, 
    StateMessage,
    TuiButtonLoading,
    DoctorFiltersComponent,
    DoctorTableComponent,
    TuiTable,
    TuiTablePagination,
    TuiButton,
  ],
  templateUrl: 'doctor.crud.html',
  styleUrl: 'doctor.crud.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorCrud {
  private readonly doctorService = inject(DoctorService);

  private readonly specialtyStore =
    inject(SpecialtyStore);

  private readonly dialogs =
    inject(TuiDialogService);

  private readonly confirm = inject(ConfirmService);

  private readonly notificationService =
    inject(NotificationService);

  // =====================================================
  // LOADING DE ACCIONES
  // =====================================================

  protected readonly loadingDoctorId =
    signal<number | null>(null);

  protected readonly loadingAction =
    signal<'edit' | 'more' | null>(null);

  // =====================================================
  // TABLA
  // =====================================================

  protected readonly selected =
    signal<DoctorResponse[]>([]);

  protected readonly bulkBusy =
    signal(false);

  protected readonly exporting =
    signal(false);

  // Solo los activos se pueden desactivar
  protected readonly selectedActive = computed(() =>
    this.selected().filter((doctor) => doctor.active),
  );

  protected readonly page =
    signal(0);

  protected readonly size =
    signal(15);

  protected readonly sizeOptions =
    [10, 50, 100];

  protected readonly selectedDoctor =
    signal<DoctorResponse | null>(null);

  // =====================================================
  // FILTROS
  // =====================================================

  protected readonly search =
    signal('');

  protected readonly specialtyId =
    signal<number | null>(null);

  // =====================================================
  // RESOURCE
  // =====================================================

  // Espera a que el usuario deje de escribir antes de consultar al backend
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      debounceTime(300),
      map((search) => search.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly doctorsResource = rxResource({
    params: () => ({
      page: this.page(),
      size: this.size(),
      specialtyId: this.specialtyId(),
      search: this.debouncedSearch(),
    }),

    stream: ({ params }) =>
      params.specialtyId === null
        ? this.doctorService.findAll(
            params.page,
            params.size,
            params.search,
          )
        : this.doctorService.findBySpecialty(
            params.specialtyId,
            params.page,
            params.size,
            params.search,
          ),
  });

  protected readonly doctors = computed(
    () => this.doctorsResource.value()?.content ?? [],
  );

  // =====================================================
  // CREAR DOCTOR
  // =====================================================

  protected async createDoctorModal(): Promise<void> {
    try {
      await this.specialtyStore.load();

      this.dialogs
        .open<CreateDoctorRequest | null>(
          new PolymorpheusComponent(
            ModalCreateEdit,
          ),
          {
            label: 'Nuevo doctor',
            size: 'm',
          },
        )
        .subscribe((doctor) => {
          if (doctor === null) {
            return;
          }

          this.doctorsResource.reload();
        });
    } catch {
      // El error HTTP ya se notifica al usuario desde el interceptor
    }
  }

  // =====================================================
  // EDITAR DOCTOR
  // =====================================================

  protected async editDoctorModal(
    doctor: DoctorResponse,
  ): Promise<void> {
    this.loadingDoctorId.set(doctor.id);
    this.loadingAction.set('edit');

    try {
      // Cargamos especialidades si todavía no existen
      await this.specialtyStore.load();

      // Obtenemos detalle del doctor
      const detail =
        await this.getDoctorDetail(doctor.id);

      this.loadingDoctorId.set(null);
      this.loadingAction.set(null);

      this.dialogs
        .open<UpdateDoctorRequest | null>(
          new PolymorpheusComponent(
            ModalCreateEdit,
          ),
          {
            label: 'Editar doctor',
            size: 'm',
            data: detail,
          },
        )
        .subscribe((result) => {
          if (result === null) {
            return;
          }

          this.doctorsResource.reload();
        });
    } catch {
      this.loadingDoctorId.set(null);
      this.loadingAction.set(null);
    }
  }

  // =====================================================
  // OBTENER DETALLE
  // =====================================================

  private getDoctorDetail(
    id: number,
  ): Promise<DoctorResponse> {
    return new Promise((resolve, reject) => {
      this.doctorService
        .findById(id)
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
  }

  // =====================================================
  // VER DOCTOR
  // =====================================================

  protected moreDoctor(
    doctor: DoctorResponse,
  ): void {
    this.loadingDoctorId.set(doctor.id);
    this.loadingAction.set('more');

    this.doctorService
      .findById(doctor.id)
      .subscribe({
        next: (detail) => {
          this.loadingDoctorId.set(null);
          this.loadingAction.set(null);

          this.selectedDoctor.set(detail);
        },

        error: () => {
          this.loadingDoctorId.set(null);
          this.loadingAction.set(null);
        },
      });
  }

  // =====================================================
  // FILTROS
  // =====================================================

  protected onFiltersChange(
    filters: DoctorFilters,
  ): void {
    this.selected.set([]);

    if (
      filters.search !== this.search() ||
      filters.specialtyId !== this.specialtyId()
    ) {
      this.page.set(0);
    }

    this.search.set(filters.search);
    this.specialtyId.set(filters.specialtyId);
  }

  // =====================================================
  // CREAR ESPECIALIDAD
  // =====================================================

  protected createSpecialtyModal(): void {
    this.dialogs
      .open(
        new PolymorpheusComponent(
          SpecialtyModal,
        ),
        {
          label: 'Nueva especialidad',
          size: 'm',
        },
      )
      .subscribe();
  }

  // =====================================================
  // CAMBIAR PÁGINA
  // =====================================================

  protected changePage(
    page: number,
  ): void {
    this.selected.set([]);
    this.page.set(page);
  }

  // =====================================================
  // CAMBIAR TAMAÑO
  // =====================================================

  protected changeSize(
    size: number,
  ): void {
    this.selected.set([]);
    this.size.set(size);
    this.page.set(0);
  }

  // =====================================================
  // ACCIONES MASIVAS
  // =====================================================

  // Con selección exporta los seleccionados; sin selección, todos los que cumplen los filtros
  protected exportCsv(): void {
    const selected = this.selected();

    if (selected.length) {
      this.downloadDoctors(selected, `medicos-seleccionados-${selected.length}.csv`);
      return;
    }

    const specialtyId = this.specialtyId();
    const search = this.debouncedSearch();

    this.exporting.set(true);

    fetchAllPages((page, size) =>
      specialtyId === null
        ? this.doctorService.findAll(page, size, search)
        : this.doctorService.findBySpecialty(specialtyId, page, size, search),
    ).subscribe({
      next: (doctors) => {
        this.exporting.set(false);
        this.downloadDoctors(doctors, `medicos-${doctors.length}.csv`);
      },
      error: () => this.exporting.set(false),
    });
  }

  private downloadDoctors(
    doctors: DoctorResponse[],
    fileName: string,
  ): void {
    downloadCsv(
      fileName,
      [
        'Colegiatura',
        'Nombres',
        'Apellidos',
        'Especialidad',
        'Teléfono',
        'Correo',
        'Horario',
        'Estado',
      ],
      doctors.map((doctor) => [
        doctor.licenseNumber,
        doctor.firstName,
        doctor.lastName,
        doctor.specialtyName,
        doctor.phone,
        doctor.email,
        `${doctor.scheduleStart?.slice(0, 5) ?? ''} - ${doctor.scheduleEnd?.slice(0, 5) ?? ''}`,
        doctor.active ? 'Activo' : 'Inactivo',
      ]),
    );
  }

  // El backend no permite eliminar médicos: se desactivan con el update existente
  protected deactivateSelected(): void {
    const doctors = this.selectedActive();

    this.confirm
      .ask({
        title: '¿Desactivar médicos seleccionados?',
        message: 'Dejarán de estar disponibles para nuevas citas. Sus datos y su historial se conservan.',
        subject: `${doctors.length} ${doctors.length === 1 ? 'médico' : 'médicos'}`,
        confirmLabel: 'Desactivar',
        variant: 'warning',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.bulkBusy.set(true);
          this.notificationService.showLoading();

          // Cada actualización es independiente: un fallo no detiene las demás
          return forkJoin(
            doctors.map((doctor) =>
              this.doctorService
                .update(doctor.id, {
                  firstName: doctor.firstName,
                  lastName: doctor.lastName,
                  email: doctor.email,
                  phone: doctor.phone,
                  specialtyId: doctor.specialtyId,
                  scheduleStart: doctor.scheduleStart,
                  scheduleEnd: doctor.scheduleEnd,
                  active: false,
                })
                .pipe(
                  map(() => true),
                  catchError(() => of(false)),
                ),
            ),
          );
        }),
      )
      .subscribe((results) => {
        const updated = results.filter(Boolean).length;

        this.bulkBusy.set(false);
        this.selected.set([]);
        this.doctorsResource.reload();

        if (updated === doctors.length) {
          this.notificationService.showSuccess(
            `${updated} ${updated === 1 ? 'médico desactivado' : 'médicos desactivados'} correctamente`,
          );
          return;
        }

        this.notificationService.showError({
          status: 500,
          title: 'Desactivación incompleta',
          detail: `Se desactivaron ${updated} de ${doctors.length} médicos. Revisa los que quedaron.`,
        });
      });
  }
}