import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { TuiInput, TuiTextfield, TuiLabel, TuiButton } from '@taiga-ui/core';

import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';

import { SpecialtyStore } from '../../store/specialty.store';

const ALL_SPECIALTIES = 'Todas las especialidades';

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
  private readonly specialtyStore = inject(SpecialtyStore);

  protected search = '';

  protected readonly specialties = computed(() => [
    ALL_SPECIALTIES,
    ...this.specialtyStore.specialties().map((specialty) => specialty.name),
  ]);

  protected specialty: string | null = ALL_SPECIALTIES;

  readonly filtersChange = output<DoctorFilters>();

  constructor() {
    this.specialtyStore.load().catch(() => undefined);
  }

  protected applyFilters(): void {
    const specialtyId =
      this.specialtyStore
        .specialties()
        .find((specialty) => specialty.name === this.specialty)?.id ?? null;

    this.filtersChange.emit({
      search: this.search.trim(),
      specialtyId,
    });
  }
}
