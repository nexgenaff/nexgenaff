"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Layers,
  Rocket,
} from "lucide-react";
import { buildOfferGroupList } from "@/lib/utils/offer-groups";
import { coerceArray } from "@/lib/utils/array-response";

// ========== TYPES ==========
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

// ========== SIMPLE COPY BUTTON ==========
const CopyButton = ({ text, onCopy }: { text: string; onCopy: () => void }) => {
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
      className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
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

  const templateText = createdAccount
    ? `🆔 𝗣𝘂𝗯𝗹𝗶𝘀𝗵𝗲𝗿 𝗜𝗗\n\`${createdAccount.accountName}\`\n\n📊 𝗣𝘂𝗯𝗹𝗶𝗰 𝗔𝗻𝗮𝗹𝘆𝘁𝗶𝗰𝘀\n${createdAccount.publicStatsUrl}\n\n🔗 𝗧𝗿𝗮𝗰𝗸𝗶𝗻𝗴 𝗨𝗥𝗟\n\`${createdAccount.trackingUrl}\``
    : "";

  const hasCustomizations = customDomainId || offerGroupName;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Link</h1>
              <p className="text-sm text-slate-400">Launch a new branded tracking link</p>
            </div>
          </div>
          <Link
            href="/admin/links"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800 self-start sm:self-center"
          >
            Cancel
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr] items-start">
          {/* Form Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <div className="rounded-md bg-indigo-500/10 p-1.5">
                <Rocket className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Campaign Builder
              </span>
              {hasCustomizations && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Customized
                </span>
              )}
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., iPhone Campaign"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Sub_ID</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                  placeholder="use random words"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">Letters, numbers, and hyphens only</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Custom Domain</label>
                <select
                  value={customDomainId}
                  onChange={(e) => setCustomDomainId(e.target.value)}
                  disabled={loading || selectableDomains.length === 0}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                >
                  <option value="">Default domain</option>
                  {selectableDomains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.domain}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Only verified domains are eligible</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Offer Group</label>
                <select
                  value={offerGroupName}
                  onChange={(e) => setOfferGroupName(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Default routing</option>
                  {offerGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Optional. Overrides default geo routing</p>
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-slate-800 bg-slate-800/50 p-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                  <Globe className="h-3.5 w-3.5 text-indigo-400" />
                  Preview
                </div>
                <div className="mt-2 break-all rounded-md bg-slate-900 px-3 py-2 font-mono text-sm text-indigo-300">
                  {previewUrl}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {selectedDomain ? "Custom domain" : "Default domain"}
                  </span>
                  <span className="h-3 w-px bg-slate-700" />
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {offerGroupName || "Default routing"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Create Link Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar / Result */}
          {createdAccount ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Ready to share
                  </span>
                </div>
                <CopyButton text={templateText} onCopy={() => {}} />
              </div>

              <div className="pt-4 space-y-4 text-sm">
                <div>
                  <div className="text-xs font-medium text-slate-400">Publisher ID</div>
                  <div className="mt-1 flex items-center justify-between gap-2 rounded-md bg-slate-800/50 px-3 py-2 font-mono text-sm break-all text-slate-100">
                    <code>{createdAccount.accountName}</code>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-400">Public analytics</div>
                  <div className="mt-1 flex items-center justify-between gap-2 rounded-md bg-slate-800/50 px-3 py-2">
                    <span className="break-all text-xs text-slate-300 sm:text-sm">{createdAccount.publicStatsUrl}</span>
                    <a
                      href={createdAccount.publicStatsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700"
                    >
                      Open
                    </a>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-400">Tracking URL</div>
                  <div className="mt-1 flex items-center justify-between gap-2 rounded-md bg-slate-800/50 px-3 py-2 font-mono text-xs sm:text-sm break-all text-slate-100">
                    <code>{createdAccount.trackingUrl}</code>
                    <a
                      href={createdAccount.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700"
                    >
                      Open
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Your link is live and ready to share
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-lg bg-slate-800 p-3 mb-3">
                  <Rocket className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">Your link will appear here</p>
                <p className="mt-1 text-xs text-slate-500">Complete the form to create one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}