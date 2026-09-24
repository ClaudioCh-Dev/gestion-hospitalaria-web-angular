// Valores tal cual los envía billing-ms; el tipo es la unión de esos literales
export const BillingStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export type BillingStatus = (typeof BillingStatus)[keyof typeof BillingStatus];
