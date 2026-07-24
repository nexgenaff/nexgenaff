"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  CheckCircle,
  RefreshCw,
  XCircle,
  Copy,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Globe,
  Zap,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { coerceArray } from "@/lib/utils/array-response";

interface DomainRecord {
  host: string;
  value: string;
}

interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  verifiedAt: string | null;
  sslEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  verificationInstructions?: {
    a?: DomainRecord[];
    cname?: DomainRecord[];
    txt?: DomainRecord[];
  };
}

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  tone: "danger" | "warning";
  onConfirm: () => Promise<void> | void;
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
};

// ===== ANIMATION VARIANTS =====
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 22, stiffness: 300, mass: 0.8 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 350, mass: 0.9 },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 30, stiffness: 400, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export default function DomainsPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [latestInstructions, setLatestInstructions] = useState<
    Domain["verificationInstructions"] | null
  >(null);
  const [latestStatusMessage, setLatestStatusMessage] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch("/api/domains", {
        cache: "no-store",
        credentials: "include",
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setDomains(coerceArray<Domain>(data));
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchDomains();
  }, [fetchDomains]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add domain");
      }

      const data = await response.json();
      setLatestInstructions(data.verificationInstructions ?? null);
      setLatestStatusMessage(
        data.vercelVerification?.error || data.vercelBinding?.error || ""
      );
      setNewDomain("");
      setShowForm(true);
      await fetchDomains();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      title: "Delete this domain?",
      message:
        "This will remove the custom domain mapping and its linked verification state from the workspace.",
      confirmLabel: "Delete domain",
      tone: "danger",
      onConfirm: async () => {
        setDeleteError("");
        setDeletingId(id);

        try {
          const response = await fetch(`/api/domains/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.error || "Failed to delete domain");
          }

          await fetchDomains();
        } catch (error) {
          console.error("Error deleting domain:", error);
          setDeleteError(
            error instanceof Error ? error.message : "Failed to delete domain"
          );
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const response = await fetch(`/api/domains/verify`, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify domain");
      }

      await fetchDomains();
    } catch (error) {
      console.error("Error verifying domain:", error);
    } finally {
      setVerifyingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const copyDnsInstructions = async (
    instructions?: Domain["verificationInstructions"]
  ) => {
    if (!instructions) return;

    const lines = [
      ...(instructions.a?.map((record) => `A ${record.host} ${record.value}`) ??
        []),
      ...(instructions.cname?.map(
        (record) => `CNAME ${record.host} ${record.value}`
      ) ?? []),
      ...(instructions.txt?.map((record) => `TXT ${record.host} ${record.value}`) ??
        []),
    ];

    await copyToClipboard(lines.join("\n"));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-12 w-12 rounded-full border-4 border-indigo-400/30 border-t-indigo-400"
          />
          <p className="mt-4 text-sm text-slate-400 animate-pulse">
            Loading domains…
          </p>
        </div>
      </div>
    );
  }

  const verifiedCount = domains.filter((d) => d.verified).length;
  const activeCount = domains.filter((d) => d.isActive).length;

  return (
    <div className="space-y-6">
      {/* ===== CONFIRMATION MODAL ===== */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDialog(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1724] backdrop-blur-xl p-6 shadow-2xl shadow-indigo-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                    confirmDialog.tone === "danger"
                      ? "border-rose-400/30 bg-rose-500/15 text-rose-300"
                      : "border-amber-400/30 bg-amber-500/15 text-amber-300"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {confirmDialog.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmDialog(null);
                    void confirmDialog.onConfirm();
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition hover:brightness-110 ${
                    confirmDialog.tone === "danger"
                      ? "bg-gradient-to-r from-rose-500 to-red-600"
                      : "bg-gradient-to-r from-amber-500 to-orange-600"
                  }`}
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MESSAGES ===== */}
      {deleteError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          {deleteError}
        </motion.div>
      )}

      {/* ===== HEADER ===== */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl shadow-indigo-500/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                Domain Management
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Custom Domains</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Connect your own domains with DNS verification
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] flex-shrink-0 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {showForm ? (
                <>
                  <XCircle className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Domain
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition duration-300" />
          </button>
        </div>
      </motion.div>

      {/* ===== STATS ===== */}
      {domains.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Domains",
              value: domains.length,
              icon: Globe,
              color: "text-indigo-400",
              gradient: "from-indigo-500/20 to-purple-500/20",
            },
            {
              label: "Verified",
              value: verifiedCount,
              icon: CheckCircle,
              color: "text-emerald-400",
              gradient: "from-emerald-500/20 to-teal-500/20",
            },
            {
              label: "Active",
              value: activeCount,
              icon: Zap,
              color: "text-amber-400",
              gradient: "from-amber-500/20 to-orange-500/20",
            },
            {
              label: "Pending",
              value: domains.length - verifiedCount,
              icon: RefreshCw,
              color: "text-rose-400",
              gradient: "from-rose-500/20 to-pink-500/20",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className={`rounded-xl border border-white/10 bg-gradient-to-br ${stat.gradient} backdrop-blur-xl p-4 shadow-lg shadow-indigo-500/10`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ===== FORM ===== */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl shadow-indigo-500/5"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                  placeholder="example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 transition hover:border-white/20"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4">
                <p className="text-sm font-medium text-indigo-300 mb-2">
                  DNS Setup Guide
                </p>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal pl-5">
                  <li>
                    Open your DNS provider settings and add the exact DNS values
                    shown below.
                  </li>
                  <li>
                    For apex domains (e.g.,{" "}
                    <span className="font-mono text-indigo-300">example.com</span>
                    ), add two A records pointing to{" "}
                    <span className="font-mono text-indigo-300">76.76.21.21</span>{" "}
                    and{" "}
                    <span className="font-mono text-indigo-300">76.76.21.22</span>.
                  </li>
                  <li>
                    For subdomains (e.g.,{" "}
                    <span className="font-mono text-indigo-300">go.example.com</span>
                    ), add a CNAME record with the host shown below.
                  </li>
                  <li>
                    After adding the records, click the <strong>Verify</strong>{" "}
                    button on the domain card.
                  </li>
                </ol>
              </div>

              {latestInstructions && (
                <div className="rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4">
                  <p className="text-sm font-medium text-emerald-300 mb-3">
                    📋 DNS Records to Add
                  </p>
                  {latestStatusMessage && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-200 mb-3">
                      {latestStatusMessage}
                    </div>
                  )}
                  <div className="space-y-3">
                    {(latestInstructions.a?.length ?? 0) > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                          A Records
                        </p>
                        {latestInstructions.a?.map((record, idx) => (
                          <div
                            key={`a-${idx}`}
                            className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
                          >
                            <code className="text-xs font-mono text-emerald-400 break-all flex-1">
                              {record.host} → {record.value}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(`A ${record.host} ${record.value}`)
                              }
                              className="p-1 text-slate-400 hover:text-white transition"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {(latestInstructions.cname?.length ?? 0) > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                          CNAME Records
                        </p>
                        {latestInstructions.cname?.map((record, idx) => (
                          <div
                            key={`cname-${idx}`}
                            className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
                          >
                            <code className="text-xs font-mono text-emerald-400 break-all flex-1">
                              {record.host} → {record.value}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `CNAME ${record.host} ${record.value}`
                                )
                              }
                              className="p-1 text-slate-400 hover:text-white transition"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {(latestInstructions.txt?.length ?? 0) > 0 && (
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                          TXT Records
                        </p>
                        {latestInstructions.txt?.map((record, idx) => (
                          <div
                            key={`txt-${idx}`}
                            className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
                          >
                            <code className="text-xs font-mono text-emerald-400 break-all flex-1">
                              {record.host} → {record.value}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(`TXT ${record.host} ${record.value}`)
                              }
                              className="p-1 text-slate-400 hover:text-white transition"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDnsInstructions(latestInstructions)}
                    className="mt-3 text-xs text-emerald-300 hover:text-emerald-200 transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3 h-3" />
                    Copy all DNS records
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {formLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Domain
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition duration-300" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DOMAINS LIST ===== */}
      {domains.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }}
          className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center"
        >
          <div className="text-5xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold text-white">No domains added</h3>
          <p className="mt-2 text-sm text-slate-400">
            Add your first custom domain to start using branded tracking links.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {domains.map((domain, index) => (
            <motion.div
              key={domain.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-lg shadow-indigo-500/5 transition hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10 ${
                domain.verified && domain.isActive
                  ? "border-l-4 border-l-emerald-400"
                  : domain.verified
                  ? "border-l-4 border-l-amber-400"
                  : "border-l-4 border-l-rose-400"
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-white">
                        {domain.domain}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border ${
                          domain.verified
                            ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                            : "border-amber-400/40 bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {domain.verified ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Pending
                          </>
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border ${
                          domain.isActive
                            ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                            : "border-rose-400/40 bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            domain.isActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                          }`}
                        />
                        {domain.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Added {new Date(domain.createdAt).toLocaleDateString()}
                      {domain.verifiedAt &&
                        ` • Verified ${new Date(domain.verifiedAt).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!domain.verified && (
                      <button
                        onClick={() => handleVerify(domain.id)}
                        disabled={verifyingId === domain.id}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-medium text-white hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-60"
                      >
                        {verifyingId === domain.id ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Verifying…
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3" />
                            Verify
                          </span>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(domain.id)}
                      disabled={deletingId === domain.id}
                      className="px-3 py-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/50 transition disabled:opacity-60"
                    >
                      {deletingId === domain.id ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                          Deleting…
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* DNS Instructions */}
                {domain.verificationInstructions && !domain.verified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <p className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        DNS Verification Instructions
                      </p>
                      <button
                        onClick={() =>
                          copyDnsInstructions(domain.verificationInstructions)
                        }
                        className="text-xs text-indigo-300 hover:text-indigo-200 transition flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(domain.verificationInstructions?.a?.length ?? 0) > 0 && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                            A Records
                          </p>
                          {domain.verificationInstructions?.a?.map((record, idx) => (
                            <div
                              key={`a-${idx}`}
                              className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
                            >
                              <code className="text-xs font-mono text-indigo-300 break-all flex-1">
                                {record.host} → {record.value}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(`A ${record.host} ${record.value}`)
                                }
                                className="p-1 text-slate-400 hover:text-white transition"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(domain.verificationInstructions?.cname?.length ?? 0) > 0 && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                            CNAME Records
                          </p>
                          {domain.verificationInstructions?.cname?.map(
                            (record, idx) => (
                              <div
                                key={`cname-${idx}`}
                                className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
                              >
                                <code className="text-xs font-mono text-indigo-300 break-all flex-1">
                                  {record.host} → {record.value}
                                </code>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      `CNAME ${record.host} ${record.value}`
                                    )
                                  }
                                  className="p-1 text-slate-400 hover:text-white transition"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {(domain.verificationInstructions?.txt?.length ?? 0) > 0 && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                            TXT Records
                          </p>
                          {domain.verificationInstructions?.txt?.map((record, idx) => (
                            <div
                              key={`txt-${idx}`}
                              className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
                            >
                              <code className="text-xs font-mono text-indigo-300 break-all flex-1">
                                {record.host} → {record.value}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(`TXT ${record.host} ${record.value}`)
                                }
                                className="p-1 text-slate-400 hover:text-white transition"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}