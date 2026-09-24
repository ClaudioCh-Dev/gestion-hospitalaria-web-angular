import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DashboardPage } from './features/dashboard/page/dashboard-page/dashboard-page';
import { Login } from './features/auth/pages/login/login';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
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
        path: 'appointment-types',
        loadComponent: () =>
          import('./features/appointment/pages/appointment-types-page/appointment-types-page')
            .then((m) => m.AppointmentTypesPage),
      },
      {
        path: 'medical-records',
        loadComponent: () =>
          import('./features/medical-history/pages/patient-history-page/patient-history-page')
            .then((m) => m.MedicalRecords),
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./features/billing/pages/billing-page/billing-page')
            .then((m) => m.BillingPage),
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
];