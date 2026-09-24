import { SidebarGroup } from './types';

/**
 * Secciones de la aplicación. Las usan el menú (sidebar y menú móvil) y la página de
 * bienvenida; cada una se muestra solo si el usuario tiene el permiso (o alguno de la lista).
 * Los guards de ruta (app.routes.ts) exigen los mismos permisos.
 */
export const MENU_ITEMS: SidebarGroup[] = [
  {
    item: {
      label: 'Dashboard',
      icon: '@tui.layout-dashboard',
      route: '/dashboard',
      permission: 'DASHBOARD_READ',
      description: 'Indicadores generales de la clínica.',
    },
  },
  {
    item: {
      label: 'Pacientes',
      icon: '@tui.users',
      route: '/patients',
      permission: 'PATIENT_READ',
      description: 'Consulta los datos de los pacientes.',
    },
  },
  {
    item: {
      label: 'Médicos',
      icon: '@tui.stethoscope',
      route: '/doctors',
      permission: 'DOCTOR_READ',
      description: 'Profesionales, especialidades y horarios.',
    },
  },
  {
    item: {
      label: 'Citas',
      icon: '@tui.calendar',
      route: '/appointments',
      // Agenda completa (admin) o solo la propia (médico)
      permission: ['APPOINTMENT_READ', 'APPOINTMENT_READ_BY_DOCTOR'],
      description: 'Agenda del día y estado de las citas.',
    },
  },
  {
    item: {
      label: 'Tipos de cita',
      icon: '@tui.tag',
      route: '/appointment-types',
      permission: 'APPOINTMENT_TYPE_MANAGE',
      description: 'Servicios que se pueden agendar y sus tarifas.',
    },
  },
  {
    item: {
      label: 'Historias clínicas',
      icon: '@tui.file-text',
      route: '/medical-records',
      permission: 'MEDICAL_RECORD_READ',
      description: 'Historial de atenciones de los pacientes.',
    },
  },
  {
    item: {
      label: 'Facturación',
      icon: '@tui.credit-card',
      route: '/billing',
      permission: 'BILLING_READ',
      description: 'Facturas, cobros y pagos pendientes.',
    },
  },
  {
    item: {
      label: 'Usuarios',
      icon: '@tui.user-cog',
      route: '/users',
      permission: 'USER_READ',
      description: 'Cuentas con acceso al sistema.',
    },
  },
];
