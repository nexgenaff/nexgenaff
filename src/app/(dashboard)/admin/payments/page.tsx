"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, CheckCircle, CircleDollarSign, Copy, CreditCard, Eye, EyeOff, Info, Pencil, Search, WalletCards, X } from "lucide-react";
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

interface ManagerPayment {
  id: string;
  username: string;
  fullName: string | null;
  status: string;
  payoutMethod: string | null;
  payoutAccount: string | null;
  bkashNumber: string | null;
  linkAccounts: Array<{
    id: string;
    accountName: string;
    payoutMethod: string | null;
    payoutAccount: string | null;
    invoices: Array<{
      invoiceNumber: string;
      totalEarning: number;
      isPaid: boolean;
    }>;
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
  const [copiedPaymentAccount, setCopiedPaymentAccount] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("BKASH");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [paymentPassword, setPaymentPassword] = useState("");
  const [showPaymentPassword, setShowPaymentPassword] = useState(false);
  const [isEditingPaymentMethod, setIsEditingPaymentMethod] = useState(false);
  const [bindingMessage, setBindingMessage] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [managerPayments, setManagerPayments] = useState<ManagerPayment[]>([]);

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

  const fetchManagerPayments = useCallback(async () => {
    const response = await fetch("/api/owner/managers", { credentials: "include" });
    if (!response.ok) return;
    const data = await response.json();
    setManagerPayments(data.managers || []);
  }, []);

  useEffect(() => {
    const loadAccountData = async () => {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (!response.ok) return;
      const data = await response.json();
      setUserRole(data.role || null);
      setPayoutMethod(data.payoutMethod || "BKASH");
      setPayoutAccount(data.payoutAccount || "");

      if (data.role === "OWNER") {
        await fetchManagerPayments();
      }
    };

    void loadAccountData();
  }, [fetchManagerPayments]);

  const handlePaymentBindingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBindingMessage("");
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-payment-binding", payoutMethod, payoutAccount, paymentPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save payment binding");
      setPaymentPassword("");
      setIsEditingPaymentMethod(false);
      setBindingMessage(data.message || "Payment method saved successfully.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to save payment binding");
    }
  };

  const markInvoicePaid = async (linkId: string, reference: string) => {
    setPayingLinkId(linkId);
    setError("");
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-paid", paymentReference: reference }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to mark invoice as paid");
      await fetchPayments();
      if (userRole === "OWNER") await fetchManagerPayments();
      return true;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to mark invoice as paid");
      return false;
    } finally {
      setPayingLinkId(null);
    }
  };

  const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paymentLink || !paymentReference.trim()) return;
    const success = await markInvoicePaid(paymentLink.id, paymentReference.trim());
    if (success) {
      setPaymentLink(null);
      setPaymentReference("");
    }
  };

  const copyPaymentAccount = async (linkId: string, account: string) => {
    try {
      await navigator.clipboard.writeText(account);
      setCopiedPaymentAccount(linkId);
      window.setTimeout(() => setCopiedPaymentAccount(null), 1600);
    } catch {
      setError("Unable to copy payment account");
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
  const managerPaymentRows = managerPayments.map((manager) => {
    const invoices = manager.linkAccounts.flatMap((link) => link.invoices);
    const paid = invoices.filter((invoice) => invoice.isPaid).reduce((sum, invoice) => sum + Number(invoice.totalEarning || 0), 0);
    const unpaid = invoices.filter((invoice) => !invoice.isPaid).reduce((sum, invoice) => sum + Number(invoice.totalEarning || 0), 0);
    const firstLink = manager.linkAccounts.find((link) => link.payoutAccount || link.payoutMethod);
    const nextUnpaidInvoice = manager.linkAccounts
      .flatMap((link) => link.invoices.filter((invoice) => !invoice.isPaid).map((invoice) => ({ invoice, link })))
      .sort((firstInvoice, secondInvoice) => firstInvoice.invoice.invoiceNumber.localeCompare(secondInvoice.invoice.invoiceNumber))[0];
    return {
      manager,
      invoiceCount: invoices.length,
      paid,
      unpaid,
      total: paid + unpaid,
      payoutMethod: manager.payoutMethod || firstLink?.payoutMethod || (manager.bkashNumber ? "BKASH" : null),
      payoutAccount: manager.payoutAccount || firstLink?.payoutAccount || manager.bkashNumber,
      nextUnpaidInvoice,
    };
  });

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600">Finance overview</p>
          <p className="mt-1 text-xs text-slate-500">Track earnings and manage where your payouts are sent.</p>
        </div>
      </div>

      {bindingMessage && <p className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">{bindingMessage}</p>}
      {userRole === "OWNER" ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-[var(--surface-card)] shadow-sm dark:border-white/10">
          <div className="border-b border-slate-200 p-4 dark:border-white/10">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Manager payments</h2>
            <p className="mt-1 text-xs text-slate-500">Invoice totals and payout details for your team members.</p>
          </div>
          {managerPaymentRows.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No manager accounts found.</p>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {managerPaymentRows.map(({ manager, invoiceCount, paid, unpaid, total, payoutMethod, payoutAccount, nextUnpaidInvoice }) => (
                <div key={manager.id} className="grid gap-3 p-4 sm:grid-cols-[1.3fr_repeat(3,0.7fr)_1.4fr] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{manager.fullName || manager.username}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">@{manager.username} · {invoiceCount} {invoiceCount === 1 ? "invoice" : "invoices"}</p>
                  </div>
                  <div><p className="text-[10px] uppercase tracking-wide text-slate-500">Total</p><p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{money(total)}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-slate-500">Paid</p><p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{money(paid)}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-slate-500">Due</p><p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">{money(unpaid)}</p></div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Payment details</p>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{payoutMethod ? `${payoutMethod === "BKASH" ? "bKash" : payoutMethod} · ${payoutAccount || "Account missing"}` : "Payment method missing"}</p>
                      {payoutAccount && <button type="button" onClick={() => void copyPaymentAccount(manager.id, payoutAccount)} className="shrink-0 rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/10 dark:hover:text-indigo-300" aria-label={`Copy payment account for ${manager.username}`} title={copiedPaymentAccount === manager.id ? "Copied" : "Copy payment account"}>
                        {copiedPaymentAccount === manager.id ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>}
                    </div>
                    {nextUnpaidInvoice && <button type="button" onClick={() => { setPaymentLink({ id: nextUnpaidInvoice.link.id, accountName: manager.fullName || manager.username, slug: "", isActive: true, totalEarning: 0, qualifiedClicks: 0, payoutMethod: payoutMethod, payoutAccount: payoutAccount }); setPaymentReference(""); }} className="mt-2 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1.5 text-[10px] font-semibold text-white transition hover:bg-indigo-500">Mark invoice paid</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
      <section className="space-y-4 rounded-lg border border-slate-200 bg-[var(--surface-card)] p-4 shadow-sm dark:border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Payout details</h2>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${payoutAccount ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300" : "border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-300"}`}>
                  {payoutAccount ? "Payable" : "Action needed"}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{payoutAccount ? "Your saved payout details are visible here. An access password is required only when you edit them." : "Add a payout method so your account is ready for payouts."}</p>
            </div>
            {!isEditingPaymentMethod && <button type="button" title={payoutAccount ? "Edit payment method" : "Set up payment method"} aria-label={payoutAccount ? "Edit payment method" : "Set up payment method"} onClick={() => setIsEditingPaymentMethod(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-500/20 dark:text-indigo-300">
              <Pencil className="h-3 w-3" />
              {payoutAccount ? "Edit" : "Set up"}
            </button>}
          </div>
          {!isEditingPaymentMethod ? (
            payoutAccount ? (
              <dl className="grid gap-4 border-t border-slate-200 pt-4 dark:border-white/10 sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Payment method</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{payoutMethod === "BINANCE" ? "Binance" : "bKash"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Account</dt>
                  <dd className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-white">{payoutAccount}</dd>
                </div>
              </dl>
            ) : (
              <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No payout method added yet</p>
                <p className="mt-1 text-xs text-slate-500">Select Set up to choose a payout method and add the account details needed for payments.</p>
              </div>
            )
          ) : (
            <form onSubmit={handlePaymentBindingSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Payment method
                  <select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)} className="w-full rounded-md border border-slate-200 bg-[var(--surface-elevated)] px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:text-white">
                    <option value="BKASH">bKash</option>
                    <option value="BINANCE">Binance</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {payoutMethod === "BINANCE" ? "Binance ID" : "bKash number"}
                  <input value={payoutAccount} onChange={(event) => setPayoutAccount(event.target.value)} placeholder={payoutMethod === "BINANCE" ? "Enter your Binance ID" : "Enter your bKash number"} required className="w-full rounded-md border border-slate-200 bg-[var(--surface-elevated)] px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:text-white" />
                </label>
              </div>
              <label className="block space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                Access password to confirm changes
                <span className="relative block">
                  <input type={showPaymentPassword ? "text" : "password"} minLength={8} value={paymentPassword} onChange={(event) => setPaymentPassword(event.target.value)} placeholder="At least 8 characters" required className="w-full rounded-md border border-slate-200 bg-[var(--surface-elevated)] px-3 py-2 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:text-white" />
                  <button type="button" onClick={() => setShowPaymentPassword((previous) => !previous)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label={showPaymentPassword ? "Hide access password" : "Show access password"} title={showPaymentPassword ? "Hide password" : "Show password"}>
                    {showPaymentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setIsEditingPaymentMethod(false); setPaymentPassword(""); }} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/10">Cancel</button>
                <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500">Save payment method</button>
              </div>
            </form>
          )}
      </section>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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
              <div className="mt-3 flex max-w-2xl gap-2.5 border-l-2 border-indigo-500/30 bg-indigo-500/5 px-3 py-2.5 text-[11px] leading-5 text-slate-600 dark:border-indigo-400/30 dark:bg-indigo-400/5 dark:text-slate-300">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-300" />
                  <p><strong className="font-semibold text-slate-800 dark:text-slate-200">Team payout process:</strong> Valid-click earnings are paid to the account manager first. The manager then pays team members. Add payment details from your public Stats link so they appear here.</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search links" className="h-9 w-full rounded-lg border border-white/10 bg-black/20 pl-8 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40 sm:w-44" />
            </label>
            <div className="flex shrink-0 rounded-lg border border-white/10 bg-black/20 p-0.5">
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
              const hasUnpaidInvoice = invoices.some((invoice) => !invoice.isPaid);
              return (
                <div key={link.id} className="mx-3 my-2 grid gap-3 rounded-lg border border-slate-700/40 bg-slate-900/35 p-3 transition hover:border-cyan-400/25 hover:bg-white/[0.04] sm:mx-0 sm:my-0 sm:gap-4 sm:rounded-none sm:border-0 sm:border-b sm:border-white/5 sm:bg-transparent sm:p-4 sm:hover:border-white/5 sm:hover:bg-white/[0.025] sm:grid-cols-[minmax(180px,1.35fr)_minmax(140px,1fr)_repeat(3,minmax(75px,0.7fr))_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:hidden">Account name</p>
                    <div className="flex items-center gap-2">
                      <span className="truncate text-base font-bold text-white sm:text-sm sm:font-semibold">{link.accountName}</span>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">Active</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 sm:text-[11px] sm:text-slate-500">
                      <span>/{link.slug}</span>
                      <span>{link.qualifiedClicks.toLocaleString()} qualified clicks</span>
                    </div>
                  </div>
                  <div className="min-w-0 text-xs text-slate-400">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment method</p>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-slate-200 sm:text-xs">{link.payoutMethod ? `${link.payoutMethod === "BKASH" ? "bKash" : link.payoutMethod} · ${link.payoutAccount || "Account not set"}` : "Not set"}</p>
                      {link.payoutAccount && <button type="button" onClick={() => void copyPaymentAccount(link.id, link.payoutAccount!)} className="shrink-0 rounded p-1 text-slate-500 transition hover:bg-white/10 hover:text-cyan-300" aria-label={`Copy payment account for ${link.accountName}`} title="Copy payment account">
                        {copiedPaymentAccount === link.id ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>}
                    </div>
                  </div>
                  <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Total earning</p><p className="mt-1 text-sm font-bold text-cyan-200">{money(current)}</p></div>
                  <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Invoice</p><p className="mt-1 text-sm font-bold text-violet-300">{money(invoiceTotal)}</p></div>
                  <div><p className="text-[9px] uppercase tracking-wider text-slate-500">Total paid</p><p className="mt-1 text-sm font-bold text-emerald-300">{money(paidAmount)}</p></div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className={`text-[10px] font-semibold ${hasUnpaidInvoice || unpaidAmount > current ? "text-orange-300" : "text-slate-400"}`}>{hasUnpaidInvoice ? "Unpaid" : "Not Invoiced"}</span>
                    {hasUnpaidInvoice && <button type="button" onClick={() => { setPaymentLink(link); setPaymentReference(""); }} disabled={payingLinkId === link.id} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2 py-1.5 text-[10px] font-bold text-emerald-200 transition hover:bg-emerald-300/20 disabled:opacity-60" aria-label={`Mark invoice for ${link.accountName} as paid`}>
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

      {paymentLink && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payment-dialog-title">
        <form onSubmit={submitPayment} className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Confirm payout</p>
              <h2 id="payment-dialog-title" className="mt-1 text-base font-bold text-white">Mark invoice as paid</h2>
              <p className="mt-1 text-xs text-slate-400">{paymentLink.accountName}</p>
            </div>
            <button type="button" onClick={() => setPaymentLink(null)} className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close payment dialog">
              <X className="h-4 w-4" />
            </button>
          </div>
          <label className="mt-5 block text-xs font-semibold text-slate-300" htmlFor="payment-reference">
            {paymentLink.payoutMethod === "BKASH" ? "bKash transaction ID" : "Binance order ID"}
            <input id="payment-reference" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} autoFocus required placeholder={paymentLink.payoutMethod === "BKASH" ? "Enter bKash transaction ID" : "Enter Binance order ID"} className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/50" />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setPaymentLink(null)} className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={!paymentReference.trim() || payingLinkId === paymentLink.id} className="rounded-md bg-emerald-300 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-200 disabled:opacity-60">{payingLinkId === paymentLink.id ? "Saving..." : "Confirm paid"}</button>
          </div>
        </form>
      </div>}

    </div>
  );
}
