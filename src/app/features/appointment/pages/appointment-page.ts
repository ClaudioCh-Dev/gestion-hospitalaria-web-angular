import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CellCalendarAdmin } from '../components/cell-calendar-admin/cell-calendar-admin';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-pages',
  imports: [CellCalendarAdmin, RouterLink,TuiButton],
  templateUrl: './appointment-page.html',
})
export class AppointmentPage {}