import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { TuiInput, TuiTextfield, TuiLabel, TuiButton } from '@taiga-ui/core';

import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';

export interface DoctorFilters {
  search: string;
  specialtyId: number | null;
}

@Component({
  selector: 'app-doctor-filters',

  imports: [
    FormsModule,

    TuiChevron,
    TuiDataListWrapper,
    TuiInput,
    TuiSelect,
    TuiTextfield,
    TuiLabel,
  ],

  templateUrl: './doctor-filters.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorFiltersComponent {
  protected search = '';

  protected readonly specialties = [
    'Todas las especialidades',
    'Cardiología',
    'Pediatría',
    'Dermatología',
    'Neurología',
    'Traumatología',
    'Medicina Interna',
    'Cirugía General',
    'Ginecología',
    'Oftalmología',
  ];

  protected specialty: string | null = this.specialties[0];

  readonly filtersChange = output<DoctorFilters>();

  protected applyFilters(): void {
    this.filtersChange.emit({
      search: this.search,

      specialtyId: 1,
    });
  }
}
