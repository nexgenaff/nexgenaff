"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
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

interface CreatedTurboLink {
  accountName: string;
  slug: string;
  trackingUrl: string;
  publicStatsUrl: string;
}

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
      <label className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-slate-300 uppercase sm:text-xs sm:tracking-wide">
        {label}
      </label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-white
          flex items-center justify-between gap-2
          transition-all duration-200
          ${isOpen ? "border-indigo-400/50 ring-2 ring-indigo-400/15" : "hover:border-white/20"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          min-h-[42px] sm:min-h-[44px]
        `}
      >
        <span className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className={selectedOption ? "text-white" : "text-slate-500"}>
            {selectedOption?.label || placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="ml-auto text-[10px] font-medium text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 text-slate-400">
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
                <div className="px-4 py-3 text-sm text-slate-500 text-center">No options found</div>
              ) : (
                filteredOptions.map((opt, idx) => (
                  <motion.button
                    key={opt.value}
                    type="button"
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
                    {opt.value === value && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
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

      {helper && <p className="mt-1.5 text-[11px] sm:text-xs text-slate-400">{helper}</p>}
    </div>
  );
};

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
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  helper?: string;
}) => (
  <div className="group">
    <label className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-slate-300 uppercase sm:text-xs sm:tracking-wide">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 hover:border-white/20 min-h-[42px] sm:min-h-[44px] sm:px-4 sm:py-3"
      placeholder={placeholder || ""}
      required={required}
      disabled={disabled}
    />
    {helper && <p className="mt-1.5 text-[11px] text-slate-400 sm:text-xs">{helper}</p>}
  </div>
);

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white group relative min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 group-hover:scale-105 transition-transform" />}
    </button>
  );
};

export default function CreateLinkTurboPage() {
  const router = useRouter();
  const [baseName, setBaseName] = useState("");
  const [startNumber, setStartNumber] = useState("1");
  const [endNumber, setEndNumber] = useState("10");
  const [customDomainId, setCustomDomainId] = useState("");
  const [offerGroupName, setOfferGroupName] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [offerGroups, setOfferGroups] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<CreatedTurboLink[]>([]);

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
      setOfferGroups(buildOfferGroupList(data));
    } catch (error) {
      console.error("Failed to fetch offer groups:", error);
    }
  }, [router]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    void fetchDomains();
    void fetchOfferGroups();
  }, [fetchDomains, fetchOfferGroups]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/admin/links");
  };

  const previewItems = (() => {
    const start = Number(startNumber) || 1;
    const end = Number(endNumber) || start;
    const approvedEnd = Math.min(end, start + 9);
    const items: string[] = [];

    for (let i = start; i <= approvedEnd; i += 1) {
      const name = `${baseName || "MR"}${i}`;
      items.push(`${name} → ${name.toLowerCase()}`);
    }
    return items;
  })();

  const selectableDomains = domains.filter((domain) => domain.verified && domain.isActive);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const start = Number(startNumber);
    const end = Number(endNumber);

    if (!baseName.trim()) {
      setError("Account name is required.");
      setLoading(false);
      return;
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1 || start > end) {
      setError("Please enter a valid number range starting from 1, with start less than or equal to end.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/links/turbo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseName: baseName.trim(),
          start,
          end,
          customDomainId: customDomainId || null,
          offerGroupName: offerGroupName || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to create turbo links");
      }

      setCreatedLinks(data.createdLinks || []);
      setSuccess(`Created ${data.createdCount || 0} link(s) successfully.`);
      setBaseName("");
      setStartNumber("1");
      setEndNumber("10");
      setCustomDomainId("");
      setOfferGroupName("");
    } catch (err: any) {
      setError(err.message || "Failed to create turbo links");
    } finally {
      setLoading(false);
    }
  };

  const createdTemplate = createdLinks.length
    ? createdLinks
        .map((link) => `🆔 ${link.accountName}\n🔗 ${link.trackingUrl}\n📊 ${link.publicStatsUrl}`)
        .join("\n\n")
    : "";

  return (
    <div className="min-h-screen bg-[#05070b] text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#0d1724] to-[#101827]" />
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-radial from-indigo-900/25 via-transparent to-transparent blur-3xl"
          animate={
            isMobile
              ? { opacity: 0.18 }
              : { x: [0, 80, -40, 0], y: [0, -60, 30, 0], opacity: [0.3, 0.6, 0.3] }
          }
          transition={isMobile ? { duration: 0.6 } : { duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-radial from-purple-900/20 via-transparent to-transparent blur-3xl"
          animate={
            isMobile
              ? { opacity: 0.12 }
              : { x: [0, -70, 50, 0], y: [0, 50, -30, 0], opacity: [0.2, 0.5, 0.2] }
          }
          transition={
            isMobile ? { duration: 0.6 } : { duration: 30, repeat: Infinity, ease: "easeInOut", delay: 3 }
          }
        />
        <div className="absolute inset-0 opacity-[0.015] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:80px_80px] hidden sm:block" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleBack}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.92 }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 min-h-10 min-w-10 flex items-center justify-center"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Create Links{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold">
                  Turbo
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-2 font-normal">
                Batch generation for powerful link campaigns
              </p>
            </div>
          </div>
          <Link href="/admin/links" className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">
            ↵ Cancel
          </Link>
        </motion.div>

        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.6fr] items-start">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="w-full rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-md p-6 sm:p-8 shadow-lg"
          >
            <div className="mb-8 pb-6 border-b border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300/70">
                  Batch Creation
                </span>
              </div>
              <h2 className="text-lg font-semibold text-white">Configuration</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
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
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{success}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField
                  label="Account Name Base"
                  value={baseName}
                  onChange={(e) => setBaseName(e.target.value.replace(/\s+/g, ""))}
                  required
                  disabled={loading}
                />

                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Start"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="1"
                    type="number"
                    required
                    disabled={loading}
                  />
                  <InputField
                    label="End"
                    value={endNumber}
                    onChange={(e) => setEndNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="10"
                    type="number"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full mt-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/40 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating accounts...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Create Batch</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <AnimatePresence mode="wait">
            {createdLinks.length > 0 ? (
              <motion.div
                key="created"
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: 20 }}
                className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950/30 to-emerald-900/10 backdrop-blur-sm p-6 shadow-lg"
              >
                <div className="flex items-center justify-between pb-5 border-b border-emerald-500/10 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-300">Batch Complete</h3>
                      <p className="text-xs text-emerald-300/60 mt-0.5">{createdLinks.length} links created</p>
                    </div>
                  </div>
                  <CopyButton text={createdTemplate} label="copy" />
                </div>

                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2">
                  {createdLinks.map((link, index) => (
                    <div key={`${link.accountName}-${index}`} className="rounded-lg border border-emerald-500/10 bg-emerald-950/20 p-4 hover:bg-emerald-950/30 transition-colors duration-200">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{link.accountName}</div>
                          <div className="text-xs text-emerald-400/70 mt-1">/{link.slug}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="text-slate-500 mb-1.5">Tracking URL</div>
                          <div className="rounded-md bg-slate-900/40 border border-white/5 px-2.5 py-2 text-slate-300 font-mono text-[11px] break-all">{link.trackingUrl}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1.5">Public Stats</div>
                          <div className="rounded-md bg-slate-900/40 border border-white/5 px-2.5 py-2 text-slate-300 font-mono text-[11px] break-all">{link.publicStatsUrl}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-8 text-center"
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="p-3 rounded-xl bg-slate-800/50 mb-4">
                    <Zap className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">No results yet</p>
                  <p className="text-xs text-slate-500 mt-1">Configure and create your batch above</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
