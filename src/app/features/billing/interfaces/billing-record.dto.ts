export type BillingStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED';

export interface BillingRecordResponse {
  id: number;
  appointmentId: number;
  patientId: number;
  amount: number;
  currency: string;
  status: BillingStatus;
  issuedAt: string;
  paidAt: string | null;
}