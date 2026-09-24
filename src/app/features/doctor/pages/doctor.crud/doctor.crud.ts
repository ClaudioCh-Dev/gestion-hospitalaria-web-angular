import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';

import {
  TuiButton,
  TuiDialogService,
} from '@taiga-ui/core';

import {
  TuiTable,
  TuiTablePagination,
} from '@taiga-ui/addon-table';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import {
  DoctorResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
} from '../../intefaces';

import { DoctorService } from '../../services/doctor.service';

import { SpecialtyStore } from '../../store/specialty.store';

import { ModalCreateEdit } from '../../components/modal-create-edit/modal-create-edit';

import {
  DoctorFilters,
  DoctorFiltersComponent,
} from '../../components/doctor-filters/doctor-filters';

import { DoctorTableComponent } from '../../components/doctor-table/doctor-table';

import { SpecialtyModal } from '../../components/specialty-modal/specialty-modal';

@Component({
  selector: 'app-doctor-crud',
  imports: [
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

  protected readonly doctorsResource = rxResource({
    params: () => ({
      page: this.page(),
      size: this.size(),
      specialtyId: this.specialtyId(),
    }),

    stream: ({ params }) =>
      params.specialtyId === null
        ? this.doctorService.findAll(
            params.page,
            params.size,
          )
        : this.doctorService.findBySpecialty(
            params.specialtyId,
            params.page,
            params.size,
          ),
  });

  // El backend no tiene búsqueda por texto: se filtra la página cargada
  protected readonly filteredDoctors = computed(() => {
    const doctors =
      this.doctorsResource.value()?.content ?? [];

    const term =
      this.search().toLowerCase();

    if (!term) {
      return doctors;
    }

    return doctors.filter((doctor) =>
      [
        doctor.firstName,
        doctor.lastName,
        doctor.licenseNumber,
        doctor.specialtyName,
        doctor.email ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  });

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
    } catch (error) {
      console.error(
        'Error al cargar las especialidades',
        error,
      );
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
    } catch (error) {
      this.loadingDoctorId.set(null);
      this.loadingAction.set(null);

      console.error(
        'Error al preparar la edición del doctor',
        error,
      );
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

        error: (error) => {
          this.loadingDoctorId.set(null);
          this.loadingAction.set(null);

          console.error(
            'Error al obtener detalle del doctor',
            error,
          );
        },
      });
  }

  // =====================================================
  // FILTROS
  // =====================================================

  protected onFiltersChange(
    filters: DoctorFilters,
  ): void {
    this.search.set(filters.search);

    if (filters.specialtyId !== this.specialtyId()) {
      this.specialtyId.set(filters.specialtyId);
      this.page.set(0);
    }
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
    this.page.set(page);
  }

  // =====================================================
  // CAMBIAR TAMAÑO
  // =====================================================

  protected changeSize(
    size: number,
  ): void {
    this.size.set(size);
    this.page.set(0);
  }
}