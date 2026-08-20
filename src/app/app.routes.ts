import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.Layout),

    children: [
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/patient/pages/patient.crud/patient.crud')
            .then((m) => m.PatientCrud),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/page/dashboard-page/dashboard-page')
            .then((m) => m.DashboardPage),
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
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
  },
];