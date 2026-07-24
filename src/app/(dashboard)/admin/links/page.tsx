"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MousePointerClick,
  Users,
  Bot,
  Globe2,
  Link2,
  Sparkles,
  Copy,
  Check,
  Pencil,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  Zap,
  Calendar,
  Rocket,
  Layers,
  ChevronDown,
  Filter,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { formatNumber } from "@/lib/utils/helpers";
import { buildOfferGroupList } from "@/lib/utils/offer-groups";
import { coerceArray } from "@/lib/utils/array-response";

interface LinkAccount {
  id: string;
  accountName: string;
  slug: string;
  totalClicks: number;
  uniqueClicks: number;
  botClicks: number;
  createdAt: string;
  isActive: boolean;
  offerGroupName: string | null;
  customDomain: { domain: string } | null;
  customDomainId?: string | null;
  publicDashboard: { publicId: string } | null;
}

interface DomainOption {
  id: string;
  domain: string;
  verified: boolean;
  isActive: boolean;
}

interface ConfirmInlineState {
  id: string;
  tone: "danger" | "warning";
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
};

// ===== SMOOTH ANIMATION VARIANTS =====
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
      ease: "easeOut",
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

// ===== FAT FILTER ANIMATION =====
const filterVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 12,
    transition: { type: "spring", damping: 25, stiffness: 300, mass: 0.5 },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 30, stiffness: 400 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

// ===== COPY BUTTON =====
const CopyIcon = ({
  text,
  label,
  onCopy,
}: {
  text: string;
  label: string;
  onCopy: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleCopy}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white border border-white/5"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      {showTooltip && !copied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-[10px] text-slate-300 whitespace-nowrap shadow-xl pointer-events-none z-10">
          {text.length > 50 ? text.slice(0, 50) + "…" : text}
        </div>
      )}
    </div>
  );
};

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkAccount[]>([]);
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [offerGroups, setOfferGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [bulkCustomDomainId, setBulkCustomDomainId] = useState("");
  const [bulkOfferGroupName, setBulkOfferGroupName] = useState("");
  const [bulkIsActive, setBulkIsActive] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingAccountName, setEditingAccountName] = useState("");
  const [editingSlug, setEditingSlug] = useState("");
  const [editingCustomDomainId, setEditingCustomDomainId] = useState("");
  const [editingOfferGroupName, setEditingOfferGroupName] = useState("");
  const [editingIsActive, setEditingIsActive] = useState(true);
  const [savingLinkId, setSavingLinkId] = useState<string | null>(null);
  const [busyLinkId, setBusyLinkId] = useState<string | null>(null);
  const [confirmInline, setConfirmInline] = useState<ConfirmInlineState | null>(null);

  // ===== SORT & FILTER =====
  const [sortBy, setSortBy] = useState<"createdAt" | "totalClicks" | "uniqueClicks" | "accountName">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused">("all");
  const [filterOfferGroup, setFilterOfferGroup] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Offer group options for filter
  const offerGroupFilterOptions = useMemo(() => {
    const groups = new Set<string>();
    links.forEach((link) => {
      if (link.offerGroupName) {
        groups.add(link.offerGroupName);
      }
    });
    return ["all", ...Array.from(groups)];
  }, [links]);

  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch("/api/links", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setLinks(coerceArray<LinkAccount>(data));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch links:", error);
    }
  }, [router]);

  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch("/api/domains", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setDomains(coerceArray<DomainOption>(data));
    } catch (error) {
      console.error("Failed to fetch domains:", error);
    }
  }, [router]);

  const fetchOfferGroups = useCallback(async () => {
    try {
      const response = await fetch("/api/offers", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setOfferGroups(buildOfferGroupList(data));
    } catch (error) {
      console.error("Failed to fetch offer groups:", error);
    }
  }, [router]);

  useEffect(() => {
    void (async () => {
      await Promise.all([fetchLinks(), fetchDomains(), fetchOfferGroups()]);
      setLoading(false);
    })();
  }, [fetchLinks, fetchDomains, fetchOfferGroups]);

  // ===== FILTERED & SORTED LINKS =====
  const filteredLinks = useMemo(() => {
    let result = [...links];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (link) =>
          link.accountName.toLowerCase().includes(query) ||
          link.slug.toLowerCase().includes(query) ||
          (link.offerGroupName?.toLowerCase() || "").includes(query)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((link) =>
        filterStatus === "active" ? link.isActive : !link.isActive
      );
    }

    if (filterOfferGroup !== "all") {
      result = result.filter((link) => link.offerGroupName === filterOfferGroup);
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortBy];
      let bVal: string | number = b[sortBy];
      if (sortBy === "accountName") {
        aVal = a.accountName.toLowerCase();
        bVal = b.accountName.toLowerCase();
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [links, search, sortBy, sortOrder, filterStatus, filterOfferGroup]);

  const activeLinks = links.filter((link) => link.isActive).length;
  const totalClicks = links.reduce((sum, link) => sum + link.totalClicks, 0);
  const uniqueClicks = links.reduce((sum, link) => sum + link.uniqueClicks, 0);
  const botClicks = links.reduce((sum, link) => sum + link.botClicks, 0);

  const selectableDomains = domains.filter((domain) => domain.verified && domain.isActive);

  const getPreviewUrl = (link: LinkAccount) => {
    const baseUrl = link.customDomain?.domain ? `https://${link.customDomain.domain}` : getBaseUrl();
    return `${baseUrl}/${link.slug}`;
  };

  const getPublicStatsUrl = (link: LinkAccount) =>
    `${getBaseUrl()}/stats/${link.publicDashboard?.publicId ?? ""}`;

  const toggleSelectedId = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredLinks.map((link) => link.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const openEdit = (link: LinkAccount) => {
    setActionError("");
    setActionMessage("");
    setEditingLinkId(link.id);
    setEditingAccountName(link.accountName);
    setEditingSlug(link.slug);
    setEditingCustomDomainId(link.customDomainId ?? "");
    setEditingOfferGroupName(link.offerGroupName ?? "");
    setEditingIsActive(link.isActive);
  };

  const closeEdit = () => {
    setEditingLinkId(null);
    setEditingAccountName("");
    setEditingSlug("");
    setEditingCustomDomainId("");
    setEditingOfferGroupName("");
    setEditingIsActive(true);
  };

  const handleSaveEdit = async () => {
    if (!editingLinkId) return;

    setActionError("");
    setActionMessage("");
    setSavingLinkId(editingLinkId);

    try {
      const response = await fetch(`/api/links/${editingLinkId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName: editingAccountName.trim(),
          slug: editingSlug.trim().toLowerCase().replace(/\s+/g, "-"),
          customDomainId: editingCustomDomainId || null,
          offerGroupName: editingOfferGroupName.trim() || null,
          isActive: editingIsActive,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update link");
      }

      setActionMessage(`Link “${data.accountName}” was updated successfully.`);
      closeEdit();
      await fetchLinks();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update link");
    } finally {
      setSavingLinkId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmInline({
      id,
      tone: "danger",
      message: "This will remove the link account and its tracked history. This cannot be undone.",
      confirmLabel: "Delete link",
      onConfirm: async () => {
        setActionError("");
        setActionMessage("");
        setBusyLinkId(id);

        try {
          const response = await fetch(`/api/links/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(data?.error || "Failed to delete link");
          }

          setActionMessage("Link account deleted successfully.");
          await fetchLinks();
        } catch (error) {
          setActionError(error instanceof Error ? error.message : "Failed to delete link");
        } finally {
          setBusyLinkId(null);
        }
      },
    });
  };

  const handleReset = async (id: string) => {
    setConfirmInline({
      id,
      tone: "warning",
      message: "This will clear all recorded statistics for this link. The link will remain active.",
      confirmLabel: "Reset stats",
      onConfirm: async () => {
        setActionError("");
        setActionMessage("");
        setBusyLinkId(id);

        try {
          const response = await fetch(`/api/links/${id}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset" }),
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(data?.error || "Failed to reset link");
          }

          setActionMessage("Link statistics have been reset successfully.");
          await fetchLinks();
        } catch (error) {
          setActionError(error instanceof Error ? error.message : "Failed to reset link");
        } finally {
          setBusyLinkId(null);
        }
      },
    });
  };

  const handleBulkReset = async () => {
    if (selectedIds.length === 0) return;
    setConfirmInline({
      id: "bulk-reset",
      tone: "warning",
      message: `This will clear statistics for ${selectedIds.length} selected link(s).`,
      confirmLabel: "Reset selected",
      onConfirm: async () => {
        setActionError("");
        setActionMessage("");
        setBusyLinkId("bulk-reset");

        try {
          const response = await fetch("/api/links/bulk", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset", ids: selectedIds }),
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(data?.error || "Failed to reset selected links");
          }

          setSelectedIds([]);
          setActionMessage(`Reset ${data?.resetCount ?? selectedIds.length} link(s) successfully.`);
          await fetchLinks();
        } catch (error) {
          setActionError(error instanceof Error ? error.message : "Failed to reset selected links");
        } finally {
          setBusyLinkId(null);
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setConfirmInline({
      id: "bulk-delete",
      tone: "danger",
      message: `This will permanently delete ${selectedIds.length} selected link(s) and all their data.`,
      confirmLabel: "Delete selected",
      onConfirm: async () => {
        setActionError("");
        setActionMessage("");
        setBusyLinkId("bulk-delete");

        try {
          const response = await fetch("/api/links/bulk", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", ids: selectedIds }),
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(data?.error || "Failed to delete selected links");
          }

          setSelectedIds([]);
          setActionMessage(`Deleted ${data?.deletedCount ?? selectedIds.length} link(s) successfully.`);
          await fetchLinks();
        } catch (error) {
          setActionError(error instanceof Error ? error.message : "Failed to delete selected links");
        } finally {
          setBusyLinkId(null);
        }
      },
    });
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return;

    setActionError("");
    setActionMessage("");
    setBusyLinkId("bulk-update");

    try {
      const response = await fetch("/api/links/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          ids: selectedIds,
          customDomainId: bulkCustomDomainId || null,
          offerGroupName: bulkOfferGroupName.trim() || null,
          isActive: bulkIsActive,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update selected links");
      }

      setSelectedIds([]);
      setShowBulkEditor(false);
      setBulkCustomDomainId("");
      setBulkOfferGroupName("");
      setBulkIsActive(true);
      setActionMessage(`Updated ${data?.updatedCount ?? selectedIds.length} link(s) successfully.`);
      await fetchLinks();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update selected links");
    } finally {
      setBusyLinkId(null);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterOfferGroup("all");
    setSortBy("createdAt");
    setSortOrder("desc");
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
          <p className="mt-4 text-sm text-slate-400 animate-pulse">Loading link accounts…</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Zap,
      label: "Active Links",
      value: activeLinks,
      sub: "Live campaigns",
      gradient: "from-indigo-500/20 to-purple-500/20",
      border: "border-indigo-400/20",
      iconColor: "text-indigo-400",
      shadow: "shadow-indigo-500/10",
    },
    {
      icon: MousePointerClick,
      label: "Total Clicks",
      value: formatNumber(totalClicks),
      sub: "All recorded traffic",
      gradient: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-400/20",
      iconColor: "text-emerald-400",
      shadow: "shadow-emerald-500/10",
    },
    {
      icon: Users,
      label: "Unique Visitors",
      value: formatNumber(uniqueClicks),
      sub: "Real audience reach",
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-400/20",
      iconColor: "text-amber-400",
      shadow: "shadow-amber-500/10",
    },
    {
      icon: Bot,
      label: "Bot Traffic",
      value: formatNumber(botClicks),
      sub: "Filtered & posted",
      gradient: "from-rose-500/20 to-pink-500/20",
      border: "border-rose-400/20",
      iconColor: "text-rose-400",
      shadow: "shadow-rose-500/10",
    },
  ];

  const domainOptions = [
    { value: "", label: "Default domain" },
    ...selectableDomains.map((d) => ({ value: d.id, label: d.domain })),
  ];

  const groupOptions = [
    { value: "", label: "Default routing" },
    ...offerGroups.map((g) => ({ value: g, label: g })),
  ];

  const editingLink = links.find((l) => l.id === editingLinkId);
  const editPreviewUrl = editingLink
    ? getPreviewUrl(editingLink)
    : `${getBaseUrl()}/${editingSlug || "your-slug"}`;

  const sortOptions = [
    { value: "createdAt", label: "Date" },
    { value: "accountName", label: "Name" },
    { value: "totalClicks", label: "Clicks" },
    { value: "uniqueClicks", label: "Unique" },
  ];

  const hasActiveFilters = search !== "" || filterStatus !== "all" || filterOfferGroup !== "all";

  return (
    <div className="space-y-6">
      {/* ===== MESSAGES ===== */}
      <AnimatePresence mode="wait">
        {(actionError || actionMessage) && (
          <motion.div
            key="message"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`rounded-xl border p-4 text-sm ${
              actionError
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {actionError || actionMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Link Control Center</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">All Link Accounts</h1>
            <p className="text-sm text-slate-400 mt-0.5">Monitor and manage every smart tracking link from one workspace.</p>
          </div>
          <Link
            href="/admin/links/create"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] flex-shrink-0 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Link
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition duration-300" />
          </Link>
        </div>
      </motion.div>

      {/* ===== STATS ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={`rounded-xl border ${stat.border} bg-gradient-to-br ${stat.gradient} backdrop-blur-xl p-4 shadow-lg ${stat.shadow}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
              </div>
              <div className={`p-2 rounded-lg bg-white/5 ${stat.iconColor}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== SEARCH, SORT & FILTER (FAT) ===== */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-xl shadow-indigo-500/5"
      >
        <div className="flex flex-col gap-3">
          {/* Row 1: Search + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, slug, or pool…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 transition"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                  showFilters
                    ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Filter className="w-4 h-4 inline mr-1.5" />
                Filters
              </button>
              <button
                onClick={toggleSelectAllVisible}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                {filteredLinks.length > 0 && filteredLinks.every((l) => selectedIds.includes(l.id))
                  ? "Clear"
                  : "Select All"}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 text-sm font-medium text-rose-300 hover:bg-rose-500/20 transition"
                >
                  <X className="w-4 h-4 inline mr-1.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Filters (Fat) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="filters"
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10"
              >
                {/* Sort */}
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-transparent text-sm text-slate-300 border-0 focus:ring-0 focus:outline-none py-1"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="text-sm text-slate-400 hover:text-white transition px-2 py-1"
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                </div>

                <span className="w-px h-6 bg-slate-700" />

                {/* Status */}
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-sm text-slate-400">Status:</span>
                  {["all", "active", "paused"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status as typeof filterStatus)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        filterStatus === status
                          ? status === "all"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                            : status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                          : "text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {status === "all" ? "All" : status === "active" ? "Active" : "Paused"}
                    </button>
                  ))}
                </div>

                <span className="w-px h-6 bg-slate-700" />

                {/* Offer Group Filter */}
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Group:</span>
                  <select
                    value={filterOfferGroup}
                    onChange={(e) => setFilterOfferGroup(e.target.value)}
                    className="bg-transparent text-sm text-slate-300 border-0 focus:ring-0 focus:outline-none py-1"
                  >
                    {offerGroupFilterOptions.map((group) => (
                      <option key={group} value={group} className="bg-slate-800 text-white">
                        {group === "all" ? "All" : group}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="w-px h-6 bg-slate-700" />

                <span className="text-sm text-slate-500 font-medium">
                  {filteredLinks.length} of {links.length}
                </span>

                <span className="ml-auto text-xs text-slate-500 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== BULK ACTIONS ===== */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="mt-3 pt-3 border-t border-white/10 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-3"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                  {selectedIds.length}
                </span>
                link{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBulkEditor(!showBulkEditor)}
                  className="px-3 py-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition"
                >
                  {showBulkEditor ? "Hide" : "Bulk Edit"}
                </button>
                <button
                  onClick={handleBulkReset}
                  disabled={busyLinkId === "bulk-reset"}
                  className="px-3 py-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 text-xs font-medium text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/50 transition disabled:opacity-60"
                >
                  {busyLinkId === "bulk-reset" ? "…" : "Reset"}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={busyLinkId === "bulk-delete"}
                  className="px-3 py-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 text-xs font-medium text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/50 transition disabled:opacity-60"
                >
                  {busyLinkId === "bulk-delete" ? "…" : "Delete"}
                </button>
              </div>
            </div>

            {showBulkEditor && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                className="mt-3 grid gap-3 md:grid-cols-3"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Custom Domain</label>
                  <select
                    value={bulkCustomDomainId}
                    onChange={(e) => setBulkCustomDomainId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 transition"
                  >
                    <option value="">Keep current</option>
                    {selectableDomains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.domain}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Offer Group</label>
                  <select
                    value={bulkOfferGroupName}
                    onChange={(e) => setBulkOfferGroupName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 transition"
                  >
                    <option value="">Keep current</option>
                    {offerGroups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={bulkIsActive ? "active" : "paused"}
                    onChange={(e) => setBulkIsActive(e.target.value === "active")}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 transition"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button
                    onClick={handleBulkUpdate}
                    disabled={busyLinkId === "bulk-update"}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-60"
                  >
                    {busyLinkId === "bulk-update" ? "Applying…" : "Apply Update"}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ===== CONFIRMATION ===== */}
      <AnimatePresence>
        {confirmInline && (
          <motion.div
            key="confirm"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`rounded-xl border p-4 text-sm ${
              confirmInline.tone === "danger"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                : "border-amber-500/30 bg-amber-500/10 text-amber-200"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{confirmInline.message}</span>
              <button
                onClick={() => setConfirmInline(null)}
                className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-white/80 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmInline(null);
                  void confirmInline.onConfirm();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold text-white shadow-lg transition hover:brightness-110 ${
                  confirmInline.tone === "danger"
                    ? "bg-gradient-to-r from-rose-500 to-red-600"
                    : "bg-gradient-to-r from-amber-500 to-orange-600"
                }`}
              >
                {confirmInline.confirmLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== LINK LIST ===== */}
      {filteredLinks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }}
          className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center"
        >
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white">No links found</h3>
          <p className="mt-2 text-sm text-slate-400">
            {links.length === 0
              ? "Create your first smart tracking link to get started."
              : "Try adjusting your search or filters."}
          </p>
          {links.length === 0 && (
            <Link
              href="/admin/links/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              Create your first link →
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredLinks.map((link) => (
            <motion.article
              key={link.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-lg shadow-indigo-500/5 transition hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10 ${
                link.isActive ? "border-l-4 border-l-emerald-400" : "border-l-4 border-l-amber-400"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* LEFT: INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300 cursor-pointer hover:bg-white/10 transition">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(link.id)}
                        onChange={() => toggleSelectedId(link.id)}
                        className="h-3.5 w-3.5 accent-indigo-400 cursor-pointer"
                      />
                      Mark
                    </label>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border ${
                        link.isActive
                          ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                          : "border-amber-400/40 bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          link.isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`}
                      />
                      {link.isActive ? "Active" : "Paused"}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-medium ${
                        link.customDomain?.domain
                          ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                          : "border-slate-400/40 bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {link.customDomain?.domain ? "Custom" : "Default"}
                    </span>
                    {link.offerGroupName && (
                      <span className="rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1 text-[10px] font-medium text-violet-300">
                        {link.offerGroupName}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white hover:text-indigo-200 transition">
                    {link.accountName}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-px h-3 bg-slate-700" />
                    <span className="flex items-center gap-1">
                      /{link.slug}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-medium text-indigo-400">Tracking</span>
                      <CopyIcon
                        text={getPreviewUrl(link)}
                        label="tracking link"
                        onCopy={() => setCopiedKey(`tracking-${link.id}`)}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-medium text-emerald-400">Stats</span>
                      <CopyIcon
                        text={getPublicStatsUrl(link)}
                        label="public stats link"
                        onCopy={() => setCopiedKey(`stats-${link.id}`)}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT: STATS + ACTIONS */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2">
                  <div className="flex gap-2">
                    {[
                      { label: "Clicks", value: formatNumber(link.totalClicks), color: "text-indigo-400" },
                      { label: "Unique", value: formatNumber(link.uniqueClicks), color: "text-emerald-400" },
                      { label: "Bots", value: formatNumber(link.botClicks), color: "text-rose-400" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-center min-w-[56px] hover:bg-white/10 transition"
                      >
                        <div className="text-[8px] uppercase tracking-wider text-slate-500">{stat.label}</div>
                        <div className={`text-xs font-bold ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
                    <button
                      onClick={() => openEdit(link)}
                      className="p-1.5 rounded-lg text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReset(link.id)}
                      disabled={busyLinkId === link.id}
                      className="p-1.5 rounded-lg text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 transition disabled:opacity-60"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      disabled={busyLinkId === link.id}
                      className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline confirmation */}
              {confirmInline && confirmInline.id === link.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className="text-slate-300">{confirmInline.message}</span>
                  <button
                    onClick={() => setConfirmInline(null)}
                    className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setConfirmInline(null);
                      void confirmInline.onConfirm();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold text-white shadow-lg transition hover:brightness-110 ${
                      confirmInline.tone === "danger"
                        ? "bg-gradient-to-r from-rose-500 to-red-600"
                        : "bg-gradient-to-r from-amber-500 to-orange-600"
                    }`}
                  >
                    {confirmInline.confirmLabel}
                  </button>
                </motion.div>
              )}
            </motion.article>
          ))}
        </motion.div>
      )}

      {/* ===== EDIT MODAL ===== */}
      <AnimatePresence>
        {editingLinkId && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEdit();
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0d1724] backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-indigo-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-300">
                      Edit Link Account
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-xl font-bold text-white">Update routing details</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Modify the configuration for this tracking link.</p>
                </div>
                <button
                  onClick={closeEdit}
                  className="p-2 rounded-xl hover:bg-white/5 transition text-slate-400 hover:text-white border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
                      Account Name
                    </label>
                    <input
                      value={editingAccountName}
                      onChange={(e) => setEditingAccountName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition hover:border-white/20"
                      placeholder="e.g., iPhone Campaign"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
                      Slug
                    </label>
                    <input
                      value={editingSlug}
                      onChange={(e) => setEditingSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition hover:border-white/20"
                      placeholder="e.g., iphone-offer"
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Letters, numbers, and hyphens only</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
                      Custom Domain
                    </label>
                    <div className="relative">
                      <select
                        value={editingCustomDomainId}
                        onChange={(e) => setEditingCustomDomainId(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white appearance-none focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition hover:border-white/20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 14px center',
                          backgroundSize: '12px',
                        }}
                      >
                        {domainOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">Only verified domains are eligible</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
                      Offer Group
                    </label>
                    <div className="relative">
                      <select
                        value={editingOfferGroupName}
                        onChange={(e) => setEditingOfferGroupName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white appearance-none focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition hover:border-white/20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 14px center',
                          backgroundSize: '12px',
                        }}
                      >
                        {groupOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">Optional. Overrides default geo routing</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={editingIsActive ? "active" : "paused"}
                        onChange={(e) => setEditingIsActive(e.target.value === "active")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white appearance-none focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition hover:border-white/20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 14px center',
                          backgroundSize: '12px',
                        }}
                      >
                        <option value="active" className="bg-slate-800 text-white">Active</option>
                        <option value="paused" className="bg-slate-800 text-white">Paused</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 mt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5">
                    <Link2 className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Preview</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 font-mono text-sm text-indigo-300/90 break-all">
                    {editPreviewUrl}
                  </div>
                  <div className="flex items-center gap-3 mt-2.5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Globe2 className="w-3 h-3" />
                      {editingCustomDomainId ? "Custom domain" : "Default domain"}
                    </span>
                    <span className="w-px h-3 bg-slate-700" />
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {editingOfferGroupName || "Default routing"}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingLinkId === editingLinkId}
                    className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {savingLinkId === editingLinkId ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}