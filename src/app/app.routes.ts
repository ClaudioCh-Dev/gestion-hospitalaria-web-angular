import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { homeUrl } from './core/guards/home';
import { Routes } from '@angular/router';

// Todas las páginas (y el layout) se cargan bajo demanda: el bundle inicial solo lleva el
// arranque, los guards y los servicios. Login no descarga el layout ni el dashboard.

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login),
    canMatch: [guestGuard],
  },
  // Enlace del correo de activación ({frontendUrl}/activate?token=...): público, sin sesión
  {
    path: 'activate',
    loadComponent: () =>
      import('./features/auth/pages/activate-account/activate-account').then(m => m.ActivateAccount),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    canMatch: [authGuard], // protege TODO lo que cuelga del layout (y el layout no se descarga sin sesión)

    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/page/dashboard-page/dashboard-page').then(m => m.DashboardPage),
        canMatch: [permissionGuard],
        data: { permission: 'DASHBOARD_READ' }, // solo administración
      },
      {
        path: 'patients',
        canMatch: [permissionGuard],
        data: { permission: 'PATIENT_READ' },
        loadComponent: () => import('./features/patient/pages/patient.crud/patient.crud').then(m => m.PatientCrud),
      },
      {
        path: 'doctors',
        canMatch: [permissionGuard],
        data: { permission: 'DOCTOR_READ' },
        loadComponent: () => import('./features/doctor/pages/doctor.crud/doctor.crud').then(m => m.DoctorCrud),
      },
      {
        path: 'appointments',
        canMatch: [permissionGuard],
        // Agenda completa (admin) o solo la propia (médico)
        data: { permission: ['APPOINTMENT_READ', 'APPOINTMENT_READ_BY_DOCTOR'] },
        loadComponent: () => import('./features/appointment/pages/appointment-page').then(m => m.AppointmentPage),
      },
      {
        path: 'appointments/create',
        canMatch: [permissionGuard],
        data: { permission: 'APPOINTMENT_CREATE' },
        loadComponent: () => import('./features/appointment/pages/appointment-create-page/appointment-create-page').then(m => m.AppointmentCreatePage),
      },
      {
        path: 'appointment-types',
        canMatch: [permissionGuard],
        // Pantalla de gestión: el médico lee tipos (agenda) pero no ve esta opción
        data: { permission: 'APPOINTMENT_TYPE_MANAGE' },
        loadComponent: () => import('./features/appointment/pages/appointment-types-page/appointment-types-page').then(m => m.AppointmentTypesPage),
      },
      {
        path: 'medical-records',
        canMatch: [permissionGuard],
        data: { permission: 'MEDICAL_RECORD_READ' },
        loadComponent: () => import('./features/medical-history/pages/patient-history-page/patient-history-page').then(m => m.MedicalRecords),
      },
      {
        path: 'users',
        canMatch: [permissionGuard],
        data: { permission: 'USER_READ' },
        loadComponent: () => import('./features/user/pages/user-page/user-page').then(m => m.UserPage),
      },
      {
        path: 'billing',
        canMatch: [permissionGuard],
        data: { permission: 'BILLING_READ' },
        loadComponent: () => import('./features/billing/pages/billing-page/billing-page').then(m => m.BillingPage),
      },
      // Bienvenida: inicio de quien no tiene dashboard ni agenda (sin permiso propio)
      {
        path: 'welcome',
        loadComponent: () => import('./features/welcome/welcome-page').then(m => m.WelcomePage),
      },
      // Inicio según permisos: admin → dashboard, médico → su agenda, resto → bienvenida
      { path: '', redirectTo: () => homeUrl(), pathMatch: 'full' },
      { path: '**', redirectTo: () => homeUrl() },
    ],
  },
  // Sin sesión, cualquier otra URL cae aquí (authGuard no hizo match)
  { path: '**', redirectTo: 'login' },
];