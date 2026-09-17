import { BillingStatus } from "./billing-status";

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