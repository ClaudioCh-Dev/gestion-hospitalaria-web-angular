import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DashboardPage } from './features/dashboard/page/dashboard-page/dashboard-page';

export const routes: Routes = [
  {
    path: '',
    component: Layout,

    children: [
      {
        path: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/patient/pages/patient.crud/patient.crud')
            .then((m) => m.PatientCrud),
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/doctor/pages/doctor.crud/doctor.crud')
            .then((m) => m.DoctorCrud),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointment/pages/appointment-page')
            .then((m) => m.AppointmentPage),
      },
      {
        path: 'appointments/create',
        loadComponent: () =>
          import('./features/appointment/pages/appointment-create-page/appointment-create-page')
            .then((m) => m.AppointmentCreatePage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
  },
];