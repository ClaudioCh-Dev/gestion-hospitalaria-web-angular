import { BillingStatus } from '../interfaces';

export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  [BillingStatus.PENDING]: 'Pendiente',
  [BillingStatus.PAID]: 'Pagado',
  [BillingStatus.CANCELLED]: 'Cancelado',
};

// Apariencias de tuiBadge
export const BILLING_STATUS_APPEARANCES: Record<BillingStatus, string> = {
  [BillingStatus.PENDING]: 'warning',
  [BillingStatus.PAID]: 'positive',
  [BillingStatus.CANCELLED]: 'negative',
};

export const BILLING_STATUS_ICONS: Record<BillingStatus, string> = {
  [BillingStatus.PENDING]: '@tui.clock',
  [BillingStatus.PAID]: '@tui.circle-check',
  [BillingStatus.CANCELLED]: '@tui.circle-x',
};
