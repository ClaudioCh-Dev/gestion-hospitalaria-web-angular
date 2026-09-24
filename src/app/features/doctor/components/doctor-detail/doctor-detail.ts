import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { TuiButton, TuiIcon, TuiPopup, TuiTitle, TuiAppearance } from '@taiga-ui/core';

import { TuiAvatar, TuiBadge, TuiDrawer, TuiInitialsPipe, TuiTabs } from '@taiga-ui/kit';

import { DoctorResponse } from '../../intefaces';
import { SpecialtyStore } from '../../store/specialty.store';

@Component({
  selector: 'app-doctor-detail',

  imports: [
    TuiButton,
    TuiDrawer,
    TuiPopup,
    TuiTabs,
    TuiTitle,
    TuiAvatar,
    TuiInitialsPipe,
    TuiIcon,
    TuiAppearance,
  ],

  templateUrl: './doctor-detail.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorDetailComponent {
  readonly doctor = input<DoctorResponse | null>(null);

  readonly close = output<void>();

  private readonly specialtyStore = inject(SpecialtyStore);

  protected readonly specialtyDescription = computed(() => {
    const doctor = this.doctor();

    if (!doctor) {
      return '';
    }

    return this.specialtyStore
      .specialties()
      .find((specialty) => specialty.id === doctor.specialtyId)
      ?.description ?? '';
  });

  constructor() {
    this.specialtyStore.load().catch(() => undefined);
  }
}
