export type PaymentInvoiceLike = {
  totalEarning?: number | string | null
  isPaid?: boolean | null
}

export function calculateManagerPayoutTotal(
  invoices: PaymentInvoiceLike[],
  commissionRate: number,
): number {
  const unpaidTotal = invoices
    .filter((invoice) => !invoice.isPaid)
    .reduce((sum, invoice) => sum + Number(invoice.totalEarning || 0), 0)

  return unpaidTotal + (unpaidTotal * (commissionRate / 100))
}

export function calculatePendingAmount(
  invoices: PaymentInvoiceLike[],
  commissionRate: number,
): number {
  return calculateManagerPayoutTotal(invoices, commissionRate)
}
