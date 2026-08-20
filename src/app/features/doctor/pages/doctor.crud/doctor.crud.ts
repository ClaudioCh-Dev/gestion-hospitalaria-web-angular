import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { TuiButton, TuiDialogService } from '@taiga-ui/core';

import { TuiTable, TuiTablePagination } from '@taiga-ui/addon-table';

import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { PageResponse } from '../../../../shared/models/types.dto';

import {
  DoctorResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
} from '../../model/doctor.dtos';

import { DoctorService } from '../../services/doctor.service';

import { ModalCreateEdit } from '../../components/modal-create-edit/modal-create-edit';

import {
  DoctorFilters,
  DoctorFiltersComponent,
} from '../../components/doctor-filters/doctor-filters';

import { DoctorTableComponent } from '../../components/doctor-table/doctor-table';

@Component({
  selector: 'app-doctor-crud',

  imports: [DoctorFiltersComponent, DoctorTableComponent, TuiTable, TuiTablePagination,TuiButton],

  templateUrl: 'doctor.crud.html',

  styleUrl: 'doctor.crud.less',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorCrud implements OnInit {
  private readonly doctorService = inject(DoctorService);

  private readonly dialogs = inject(TuiDialogService);

  // ============================
  // Tabla
  // ============================

  protected readonly data = signal<DoctorResponse[]>([]);

  protected readonly selected = signal<DoctorResponse[]>([]);

  protected total = signal(0);

  protected page = signal(0);

  protected size = signal(15);

  protected readonly sizeOptions = [10, 50, 100];

  // ============================
  // Inicialización
  // ============================

  ngOnInit(): void {
    this.loadDoctors();
  }

  // ============================
  // Obtener doctores
  // ============================

  protected loadDoctors(): void {
    this.doctorService.findAll(this.page(), this.size()).subscribe({
      next: (response: PageResponse<DoctorResponse>) => {
        console.log('📥 Respuesta doctores:', response);

        this.data.set(response.content);

        this.total.set(response.totalElements);
      },

      error: (error) => {
        console.error('❌ Error al obtener doctores', error);
      },
    });
  }

  // ============================
  // Crear doctor
  // ============================

  protected createDoctorModal(): void {
    this.dialogs
      .open<CreateDoctorRequest | null>(new PolymorpheusComponent(ModalCreateEdit), {
        label: 'Nuevo doctor',
        size: 'm',
      })
      .subscribe((doctor) => {
        if (doctor === null) {
          return;
        }

        this.loadDoctors();
      });
  }

  // ============================
  // Editar doctor
  // ============================

  protected editDoctorModal(doctor: DoctorResponse): void {
    this.dialogs
      .open<UpdateDoctorRequest | null>(new PolymorpheusComponent(ModalCreateEdit), {
        label: 'Editar doctor',
        size: 'm',
        data: doctor,
      })
      .subscribe((doctor) => {
        if (doctor === null) {
          return;
        }

        this.loadDoctors();
      });
  }

  // ============================
  // Filtros
  // ============================

  protected onFiltersChange(filters: DoctorFilters): void {
    console.log('Filtros cambiados:', filters);

    this.loadDoctors();
  }

  // ============================
  // Cambiar página
  // ============================

  protected changePage(page: number): void {
    this.page.set(page);

    this.loadDoctors();
  }

  // ============================
  // Cambiar tamaño
  // ============================

  protected changeSize(size: number): void {
    this.size.set(size);

    this.page.set(0);

    this.loadDoctors();
  }
}
