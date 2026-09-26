import { NotificationType } from '../interfaces';

// Icono y apariencia del tuiAvatar de cada notificación en la campana
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_SCHEDULED]: '@tui.calendar-plus',
  [NotificationType.APPOINTMENT_CONFIRMED]: '@tui.calendar-check',
  [NotificationType.APPOINTMENT_COMPLETED]: '@tui.circle-check',
  [NotificationType.APPOINTMENT_CANCELLED]: '@tui.calendar-x',
};

export const NOTIFICATION_TYPE_APPEARANCES: Record<NotificationType, string> = {
  [NotificationType.APPOINTMENT_SCHEDULED]: 'info',
  [NotificationType.APPOINTMENT_CONFIRMED]: 'positive',
  [NotificationType.APPOINTMENT_COMPLETED]: 'neutral',
  [NotificationType.APPOINTMENT_CANCELLED]: 'negative',
};
