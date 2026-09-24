import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CellCalendarAdmin } from '../components/cell-calendar-admin/cell-calendar-admin';
import { DoctorAgenda } from '../components/doctor-agenda/doctor-agenda';
import { AgendaScope } from '../services/agenda-scope.service';
import { TuiButton } from '@taiga-ui/core';
import { HasPermission } from '@shared/directives/has-permission.directive';

@Component({
  selector: 'app-pages',
  imports: [CellCalendarAdmin, DoctorAgenda, HasPermission, RouterLink, TuiButton],
  templateUrl: './appointment-page.html',
})
export class AppointmentPage {
  // Con APPOINTMENT_READ se ve la agenda de todos; sin él, solo la propia
  protected readonly fullAgenda = inject(AgendaScope).fullAgenda;
}
