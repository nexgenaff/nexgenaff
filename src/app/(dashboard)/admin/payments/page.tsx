"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, CircleDollarSign, CreditCard, Search, WalletCards } from "lucide-react";
import { coerceArray } from "@/lib/utils/array-response";

interface PaymentLink {
  id: string;
  accountName: string;
  slug: string;
  isActive: boolean;
  totalEarning: number;
  qualifiedClicks: number;
  payoutMethod: string | null;
  payoutAccount: string | null;
  invoiceHistory?: Array<{
    invoiceNumber: string;
    totalEarning: number;
    isPaid: boolean;
    createdAt: string;
    paidAt: string | null;
  }>;
}

const money = (value: number) => `$${value.toFixed(2)}`;

export default function PaymentsPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unpaid">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingLinkId, setPayingLinkId] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/links", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Unable to load payment data");
      setLinks(coerceArray<PaymentLink>(await response.json()));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load payment data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const markInvoicePaid = async (linkId: string) => {
    setPayingLinkId(linkId);
    setError("");
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-paid" }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to mark invoice as paid");
      await fetchPayments();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to mark invoice as paid");
    } finally {
      setPayingLinkId(null);
    }
  };

  const activeLinks = useMemo(() => links.filter((link) => link.isActive), [links]);

  const paymentRows = useMemo(() => activeLinks
      .map((link) => {
        const invoices = link.invoiceHistory || [];
        const unpaid = invoices.filter((invoice) => !invoice.isPaid);
        const paid = invoices.filter((invoice) => invoice.isPaid);
        const current = Number(link.totalEarning) || 0;
        const unpaidAmount = unpaid.reduce((sum, invoice) => sum + (Number(invoice.totalEarning) || 0), 0) + current;
        const paidAmount = paid.reduce((sum, invoice) => sum + (Number(invoice.totalEarning) || 0), 0);
        const invoiceTotal = invoices.reduce((sum, invoice) => sum + (Number(invoice.totalEarning) || 0), 0);
        return { link, invoices, current, unpaidAmount, paidAmount, invoiceTotal, accrued: unpaidAmount + paidAmount };
      }), [activeLinks]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return paymentRows.filter(({ link, invoices }) => {
        const matchesQuery = !normalizedQuery || `${link.accountName} ${link.slug}`.toLowerCase().includes(normalizedQuery);
      const matchesFilter = filter === "all" || invoices.some((invoice) => !invoice.isPaid);
        return matchesQuery && matchesFilter;
      }).sort((first, second) => second.accrued - first.accrued);
  }, [filter, paymentRows, query]);

  const totals = useMemo(() => paymentRows.reduce(
    (summary, row) => ({
      accrued: summary.accrued + row.accrued,
      invoices: summary.invoices + row.invoiceTotal,
      unpaid: summary.unpaid + row.unpaidAmount,
      paid: summary.paid + row.paidAmount,
    }),
    { accrued: 0, invoices: 0, unpaid: 0, paid: 0 },
  ), [paymentRows]);

  const commission = totals.accrued * 0.2;

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">Finance overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Earned", value: totals.accrued, icon: WalletCards, tone: "text-cyan-300", accent: "border-cyan-400/20 bg-cyan-400/[0.07]" },
          { label: "Commission", value: commission, icon: CircleDollarSign, tone: "text-orange-300", accent: "border-orange-400/20 bg-orange-400/[0.07]" },
          { label: "Invoice", value: totals.invoices, icon: CreditCard, tone: "text-violet-300", accent: "border-violet-400/20 bg-violet-400/[0.07]" },
          { label: "Paid out", value: totals.paid, icon: CircleDollarSign, tone: "text-emerald-300", accent: "border-emerald-400/20 bg-emerald-400/[0.07]" },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`rounded-lg border p-4 ${card.accent}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.tone}`} />
            </div>
            <div className={`mt-3 text-2xl font-bold ${card.tone}`}>{money(card.value)}</div>
          </motion.div>
        ))}
      </div>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Active link earnings</h2>
            <p className="mt-0.5 text-xs text-slate-500">{rows.length === activeLinks.length ? `${activeLinks.length} active ${activeLinks.length === 1 ? "link" : "links"}` : `Showing ${rows.length} of ${activeLinks.length} active links`}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search links" className="h-9 w-full rounded-lg border border-white/10 bg-black/20 pl-8 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40 sm:w-44" />
            </label>
            <div className="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
              {(["all", "unpaid"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold capitalize transition ${filter === option ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-white"}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? <div className="p-6 text-center text-sm text-rose-300">{error}</div> : loading ? <div className="p-10 text-center text-sm text-slate-400">Loading payments...</div> : rows.length === 0 ? <div className="p-10 text-center"><WalletCards className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 text-sm font-semibold text-slate-300">{activeLinks.length === 0 ? "No active links yet" : "No matching active links"}</p><p className="mt-1 text-xs text-slate-500">{activeLinks.length === 0 ? "Activate a link to start tracking earnings and payouts." : "Try clearing your search or changing the payment filter."}</p></div> : (
          <div className="divide-y divide-white/5">
            {rows.map(({ link, invoices, current, invoiceTotal, unpaidAmount, paidAmount }) => {
              const latestInvoice = invoices[0];
              const hasUnpaidInvoice = invoices.some((invoice) => !invoice.isPaid);
              return (
                <div key={link.id} className="grid gap-4 p-4 transition hover:bg-white/[0.025] sm:grid-cols-[minmax(180px,1.35fr)_minmax(140px,1fr)_repeat(3,minmax(75px,0.7fr))_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">{link.accountName}</span>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">Active</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span>/{link.slug}</span>
                      <span>{link.qualifiedClicks.toLocaleString()} qualified clicks</span>
                    </div>
                  </div>
                  <div className="min-w-0 text-xs text-slate-400">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">Payment method</p>
                    <p className="mt-1 truncate font-medium text-slate-200">{link.payoutMethod ? `${link.payoutMethod === "BKASH" ? "bKash" : link.payoutMethod} · ${link.payoutAccount || "Account not set"}` : "Not set"}</p>
                  </div>
                  <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Total earning</p><p className="mt-1 text-sm font-bold text-cyan-200">{money(current)}</p></div>
                  <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Invoice</p><p className="mt-1 text-sm font-bold text-violet-300">{money(invoiceTotal)}</p></div>
                  <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Total paid</p><p className="mt-1 text-sm font-bold text-emerald-300">{money(paidAmount)}</p></div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className={`text-[10px] font-semibold ${hasUnpaidInvoice || unpaidAmount > current ? "text-orange-300" : "text-slate-400"}`}>{hasUnpaidInvoice ? "Unpaid" : latestInvoice ? "Paid" : "Accumulating"}</span>
                    {hasUnpaidInvoice && <button type="button" onClick={() => void markInvoicePaid(link.id)} disabled={payingLinkId === link.id} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 py-1.5 text-[10px] font-bold text-emerald-200 transition hover:bg-emerald-300/20 disabled:opacity-60" aria-label={`Mark invoice for ${link.accountName} as paid`}>
                      <CheckCircle className="h-3 w-3" />
                      {payingLinkId === link.id ? "Saving" : "Mark paid"}
                    </button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
