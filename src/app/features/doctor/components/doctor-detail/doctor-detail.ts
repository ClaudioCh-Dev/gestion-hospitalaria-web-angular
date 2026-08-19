import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TuiButton, TuiIcon, TuiPopup, TuiTitle, TuiAppearance } from '@taiga-ui/core';

import { TuiAvatar, TuiBadge, TuiDrawer, TuiInitialsPipe, TuiTabs } from '@taiga-ui/kit';

import { DoctorResponse } from '../../model/doctor.dtos';

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
}
