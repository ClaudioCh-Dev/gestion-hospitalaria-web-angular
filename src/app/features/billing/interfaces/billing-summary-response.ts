// GET /billings/crud/summary
export interface BillingSummaryResponse {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  paidCount: number;
  paidAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
  paidThisMonthAmount: number;
}
