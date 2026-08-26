"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, CircleDollarSign, CreditCard, RefreshCw, Search, WalletCards } from "lucide-react";
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
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
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
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

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
    return paymentRows.filter(({ link, unpaidAmount, paidAmount }) => {
        const matchesQuery = !normalizedQuery || `${link.accountName} ${link.slug}`.toLowerCase().includes(normalizedQuery);
        const matchesFilter = filter === "all" || (filter === "unpaid" ? unpaidAmount > 0 : paidAmount > 0);
        return matchesQuery && matchesFilter;
      });
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

  const commission = totals.accrued * 0.1;

  const invoiceRows = useMemo(() => paymentRows
    .flatMap(({ link, invoices }) => invoices.map((invoice) => ({ link, invoice })))
    .sort((a, b) => new Date(b.invoice.createdAt).getTime() - new Date(a.invoice.createdAt).getTime()), [paymentRows]);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">Finance overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Payments</h1>
          <p className="mt-1 text-sm text-slate-400">Earnings and payout status across your active links.</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchPayments(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total accrued", value: totals.accrued, icon: WalletCards, tone: "text-cyan-300", accent: "border-cyan-400/20 bg-cyan-400/[0.07]" },
          { label: "Total invoices", value: totals.invoices, icon: CreditCard, tone: "text-violet-300", accent: "border-violet-400/20 bg-violet-400/[0.07]" },
          { label: "Paid out", value: totals.paid, icon: CircleDollarSign, tone: "text-emerald-300", accent: "border-emerald-400/20 bg-emerald-400/[0.07]" },
          { label: "Commission", value: commission, icon: CircleDollarSign, tone: "text-amber-300", accent: "border-amber-400/20 bg-amber-400/[0.07]" },
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
              {(["all", "unpaid", "paid"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold capitalize transition ${filter === option ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-white"}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? <div className="p-6 text-center text-sm text-rose-300">{error}</div> : loading ? <div className="p-10 text-center text-sm text-slate-400">Loading payments...</div> : rows.length === 0 ? <div className="p-10 text-center"><WalletCards className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 text-sm font-semibold text-slate-300">{activeLinks.length === 0 ? "No active links yet" : "No matching active links"}</p><p className="mt-1 text-xs text-slate-500">{activeLinks.length === 0 ? "Activate a link to start tracking earnings and payouts." : "Try clearing your search or changing the payment filter."}</p></div> : (
          <div className="divide-y divide-white/5">
            {rows.map(({ link, invoices, current, unpaidAmount, paidAmount, accrued }) => {
              const latestInvoice = invoices[0];
              const hasUnpaidInvoice = invoices.some((invoice) => !invoice.isPaid);
              return (
                <div key={link.id} className="flex flex-col gap-4 p-4 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">{link.accountName}</span>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">Active</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span>/{link.slug}</span>
                      <span>{link.qualifiedClicks.toLocaleString()} qualified clicks</span>
                      <span>{link.payoutMethod ? `${link.payoutMethod === "BKASH" ? "bKash" : link.payoutMethod} · ${link.payoutAccount || "Account not set"}` : "Payout method not set"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-left sm:min-w-[360px] sm:text-right">
                    <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Current</p><p className="mt-1 text-sm font-bold text-cyan-200">{money(current)}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Paid</p><p className="mt-1 text-sm font-bold text-emerald-300">{money(paidAmount)}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Total</p><p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-white">{money(accrued)} <ArrowUpRight className="h-3 w-3 text-slate-500" /></p></div>
                  </div>
                  <div className="shrink-0 text-left sm:w-24 sm:text-right">
                    <span className={`text-[10px] font-semibold ${hasUnpaidInvoice || unpaidAmount > current ? "text-amber-300" : "text-slate-400"}`}>{hasUnpaidInvoice ? "Awaiting payout" : latestInvoice ? "Paid" : "Accumulating"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-sm font-bold text-white">Invoice ledger</h2>
          <p className="mt-0.5 text-xs text-slate-500">Invoices generated from your active links.</p>
        </div>
        {invoiceRows.length === 0 ? (
          <div className="p-7 text-center text-xs text-slate-500">No invoices have been generated for active links yet.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {invoiceRows.map(({ link, invoice }) => (
              <div key={invoice.invoiceNumber} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_140px_110px_110px] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{invoice.invoiceNumber}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-500">{link.accountName} · /{link.slug}</p>
                </div>
                <p className="text-[11px] text-slate-500">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p className="text-sm font-bold text-white">{money(Number(invoice.totalEarning) || 0)}</p>
                <span className={`w-fit rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${invoice.isPaid ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" : "border-amber-300/20 bg-amber-300/10 text-amber-300"}`}>
                  {invoice.isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
