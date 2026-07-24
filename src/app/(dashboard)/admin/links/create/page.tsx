"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Link2,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Globe,
  Layers,
  Rocket,
  ChevronDown,
  Search,
} from "lucide-react";
import { buildOfferGroupList } from "@/lib/utils/offer-groups";
import { coerceArray } from "@/lib/utils/array-response";

interface Domain {
  id: string;
  domain: string;
  verified: boolean;
  isActive: boolean;
}

interface CreatedAccount {
  accountName: string;
  slug: string;
  domain?: string;
  trackingUrl: string;
  publicStatsUrl: string;
}

// ========== ANIMATIONS ==========

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(129, 140, 248, 0)",
      "0 0 40px rgba(129, 140, 248, 0.08)",
      "0 0 20px rgba(129, 140, 248, 0)",
    ],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

// ========== CUSTOM DROPDOWN COMPONENT ==========

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
  helper?: string;
  placeholder?: string;
}

const CustomDropdown = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  helper,
  placeholder = "Select an option",
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
        {label}
      </label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white
          flex items-center justify-between gap-2
          transition-all duration-200
          ${isOpen ? "border-indigo-400/50 ring-2 ring-indigo-400/15" : "hover:border-white/20"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? "text-white" : "text-slate-500"}>
            {selectedOption?.label || placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="ml-auto text-[10px] font-medium text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-slate-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 overflow-hidden"
          >
            <div className="p-2 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 pl-8 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
                />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt, idx) => (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full px-4 py-2.5 text-sm text-left flex items-center gap-2.5
                      transition-all duration-150
                      ${
                        opt.value === value
                          ? "bg-indigo-500/15 text-indigo-200"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }
                      ${opt.value === value ? "border-l-2 border-indigo-400" : ""}
                    `}
                  >
                    {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
                        {opt.badge}
                      </span>
                    )}
                    {opt.value === value && (
                      <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    )}
                  </motion.button>
                ))
              )}
            </div>

            <div className="px-4 py-1.5 border-t border-white/5 text-[10px] text-slate-500 text-center">
              {filteredOptions.length} options
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {helper && <p className="mt-1.5 text-xs text-slate-400">{helper}</p>}
    </div>
  );
};

// ========== INPUT FIELD ==========

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  helper,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  helper?: string;
}) => (
  <div className="group">
    <label className="block text-xs font-medium text-slate-300 mb-1.5 tracking-wide">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 hover:border-white/20"
      placeholder={placeholder}
      required={required}
      disabled={disabled}
    />
    {helper && <p className="mt-1.5 text-xs text-slate-400">{helper}</p>}
  </div>
);

// ========== COPY BUTTON ==========

const CopyButton = ({
  text,
  label,
  onCopy,
}: {
  text: string;
  label: string;
  onCopy: () => void;
}) => {
  const [copied, setCopied] = useState(false);

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
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white group relative"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
      )}
    </button>
  );
};

// ========== MAIN PAGE ==========

export default function CreateLinkPage() {
  const router = useRouter();
  const [accountName, setAccountName] = useState("");
  const [slug, setSlug] = useState("");
  const [customDomainId, setCustomDomainId] = useState("");
  const [offerGroupName, setOfferGroupName] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [offerGroups, setOfferGroups] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch("/api/domains", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setDomains(coerceArray<Domain>(data));
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
      const groups = buildOfferGroupList(data);
      setOfferGroups(groups);
    } catch (error) {
      console.error("Failed to fetch offer groups:", error);
    }
  }, [router]);

  useEffect(() => {
    void fetchDomains();
    void fetchOfferGroups();
  }, [fetchDomains, fetchOfferGroups]);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin.replace(/\/$/, "");
    }
    return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  };

  const selectableDomains = domains.filter((domain) => domain.verified && domain.isActive);
  const selectedDomain = selectableDomains.find((domain) => domain.id === customDomainId);
  const previewUrl = selectedDomain
    ? `https://${selectedDomain.domain}/${slug || "your-slug"}`
    : `${getBaseUrl()}/${slug || "your-slug"}`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/admin/links");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountName,
          slug,
          customDomainId: customDomainId || null,
          offerGroupName: offerGroupName || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create link");
      }

      const createdTrackingUrl = data.customDomain?.domain
        ? `https://${data.customDomain.domain}/${data.slug}`
        : `${getBaseUrl()}/${data.slug}`;

      const createdPublicStatsUrl = `${getBaseUrl()}/stats/${data.publicDashboard?.publicId}`;

      setCreatedAccount({
        accountName: data.accountName,
        slug: data.slug,
        domain: data.customDomain?.domain,
        trackingUrl: createdTrackingUrl,
        publicStatsUrl: createdPublicStatsUrl,
      });
      setSuccess(`Link account “${data.accountName}” was created successfully.`);
      setAccountName("");
      setSlug("");
      setCustomDomainId("");
      setOfferGroupName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const domainOptions: DropdownOption[] = [
    { value: "", label: "Default domain", icon: <Globe className="w-4 h-4 text-slate-400" /> },
    ...selectableDomains.map((d) => ({
      value: d.id,
      label: d.domain,
      icon: <Globe className="w-4 h-4 text-indigo-400" />,
      badge: "Verified",
    })),
  ];

  const groupOptions: DropdownOption[] = [
    { value: "", label: "Default routing", icon: <Layers className="w-4 h-4 text-slate-400" /> },
    ...offerGroups.map((g) => ({
      value: g,
      label: g,
      icon: <Layers className="w-4 h-4 text-purple-400" />,
    })),
  ];

  const hasActiveFilters = customDomainId || offerGroupName;

  return (
    <div className="min-h-screen bg-[#05070b] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#0d1724] to-[#101827]" />
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-radial from-indigo-900/25 via-transparent to-transparent blur-3xl"
          animate={{ x: [0, 80, -40, 0], y: [0, -60, 30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-radial from-purple-900/20 via-transparent to-transparent blur-3xl"
          animate={{ x: [0, -70, 50, 0], y: [0, 50, -30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <div className="absolute inset-0 opacity-[0.015] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-slate-400 hover:text-white group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Create Link
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Launch a new branded tracking link
              </p>
            </div>
          </div>
          <Link
            href="/admin/links"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5 self-start sm:self-center"
          >
            Cancel
          </Link>
        </motion.div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr] items-start">
          {/* ===== FORM ===== */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-indigo-500/5"
          >
            <div className="flex items-center gap-2.5 mb-7">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-300/80">
                Campaign Builder
              </span>
              {hasActiveFilters && (
                <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Customized
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-200"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g., iPhone Campaign"
                required
                disabled={loading}
              />

              <InputField
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                placeholder="e.g., iphone-offer"
                helper="Letters, numbers, and hyphens only"
                required
                disabled={loading}
              />

              <CustomDropdown
                label="Custom Domain"
                value={customDomainId}
                onChange={setCustomDomainId}
                options={domainOptions}
                disabled={loading || selectableDomains.length === 0}
                helper="Only verified domains are eligible"
                placeholder="Select a domain"
              />

              <CustomDropdown
                label="Offer Group"
                value={offerGroupName}
                onChange={setOfferGroupName}
                options={groupOptions}
                disabled={loading}
                helper="Optional. Overrides default geo routing"
                placeholder="Select an offer group"
              />

              <motion.div
                variants={glowPulse}
                animate="animate"
                className="rounded-xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-4 mt-2"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Preview</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 font-mono text-sm text-indigo-300/90 break-all">
                  {previewUrl}
                </div>
                <div className="flex items-center gap-3 mt-2.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {selectedDomain ? "Custom domain" : "Default domain"}
                  </span>
                  <span className="w-px h-3 bg-slate-700" />
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {offerGroupName || "Default routing"}
                  </span>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/15 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Create Link Account
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          </motion.div>

          {/* ===== SIDEBAR ===== */}
          <AnimatePresence mode="wait">
            {createdAccount ? (
              <motion.div
                key="created"
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: 20 }}
                className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/[0.02] backdrop-blur-xl p-6 shadow-xl shadow-emerald-500/5"
              >
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
                    Created
                  </span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-[10px] text-emerald-400/60"
                  >
                    ✓ Live
                  </motion.span>
                </div>

                <div className="py-4 border-b border-white/5 space-y-0.5">
                  <div className="font-semibold text-white text-base">{createdAccount.accountName}</div>
                  <div className="text-sm text-slate-400">/{createdAccount.slug}</div>
                  {createdAccount.domain && (
                    <div className="text-sm text-emerald-300/70 mt-0.5">Domain: {createdAccount.domain}</div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5 group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                        Tracking Link
                      </span>
                      <CopyButton
                        text={createdAccount.trackingUrl}
                        label="tracking link"
                        onCopy={() => setCopiedKey("tracking")}
                      />
                    </div>
                    <div className="mt-1.5 break-all font-mono text-xs text-indigo-300/80 leading-relaxed">
                      {createdAccount.trackingUrl}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3.5 group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-300/80">
                        Public Stats
                      </span>
                      <CopyButton
                        text={createdAccount.publicStatsUrl}
                        label="public stats link"
                        onCopy={() => setCopiedKey("stats")}
                      />
                    </div>
                    <div className="mt-1.5 break-all font-mono text-xs text-emerald-300/70 leading-relaxed">
                      {createdAccount.publicStatsUrl}
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-500"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Link is live and ready to use
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-xl p-6 text-center"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
                    <Zap className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-400">Your link will appear here</p>
                  <p className="text-xs text-slate-500 mt-1">Complete the form to create one</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== FOOTER ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <span className="text-xs text-slate-500">© 2026 Nexgen Affiliates. All rights reserved.</span>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span>v2.0.1</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}