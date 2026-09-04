export type PaymentInvoiceLike = {
  totalEarning?: number | string | null
  isPaid?: boolean | null
}

export function calculatePendingAmount(
  invoices: PaymentInvoiceLike[],
  commissionRate: number,
): number {
  const unpaidTotal = invoices
    .filter((invoice) => !invoice.isPaid)
    .reduce((sum, invoice) => sum + Number(invoice.totalEarning || 0), 0)

  const pendingBase = unpaidTotal
  const pendingCommission = pendingBase * (commissionRate / 100)

  return pendingBase + pendingCommission
}
