import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CellCallendarAdmin } from '../components/cell-callendar-admin/cell-callendar-admin';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-pages',
  imports: [CellCallendarAdmin, RouterLink,TuiButton],
  templateUrl: './appointment-page.html',
})
export class AppointmentPage {}