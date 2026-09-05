"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, Copy, Database, MessageCircle, RefreshCw, Search, Webhook, XCircle } from "lucide-react";

interface PostbackConfig {
  id: string;
  provider: "AFFMINE" | "ADBLUMEDIA";
  label: string;
  token: string;
  isActive: boolean;
}

interface ConversionLead {
  id: string;
  payout: number | null;
  sub1: string | null;
  sub2: string | null;
  sub3: string | null;
  sub4: string | null;
  createdAt: string;
  postback: { provider: string };
}

function getPostbackTemplate(origin: string, config: PostbackConfig) {
  const receiverUrl = `${origin}/api/postback?secret=${config.token}`;
  return config.provider === "AFFMINE"
    ? `${receiverUrl}&payout=#payout#&subid1=#s1#&subid2=#s2#&subid3=#s3#&subid4=#s4#`
    : `${receiverUrl}&payout={payout}&s1={s1}&s2={s2}&s3={s3}&s4={s4}`;
}

export default function PostbackTools() {
  const router = useRouter();
  const [configs, setConfigs] = useState<PostbackConfig[]>([]);
  const [leads, setLeads] = useState<ConversionLead[]>([]);
  const [totalPayout, setTotalPayout] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [telegramChannelId, setTelegramChannelId] = useState("");
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const [telegramSubmitting, setTelegramSubmitting] = useState(false);
  const [showTelegramSettings, setShowTelegramSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const response = await fetch("/api/postbacks", { credentials: "include" });
      if (response.status === 403) {
        router.replace("/admin/dashboard");
        return;
      }
      if (!response.ok) throw new Error("Unable to load postback data");
      const data = await response.json();
      setConfigs(data.configs || []);
      setLeads(data.leads || []);
      setTotalPayout(Number(data.totalPayout) || 0);
      setTelegramChannelId(data.telegram?.channelId || "");
      setTelegramConfigured(Boolean(data.telegram));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load postback data");
    } finally {
      setLoading(false);
    }
  };

  const saveTelegram = async () => {
    setTelegramSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/postbacks", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channelId: telegramChannelId, botToken: telegramBotToken }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save Telegram settings");
      setTelegramConfigured(true);
      setTelegramBotToken("");
      setMessage("Telegram settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save Telegram settings");
    } finally {
      setTelegramSubmitting(false);
    }
  };

  const testTelegram = async () => {
    setTelegramSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/postbacks", { method: "PATCH", credentials: "include" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to send Telegram test message");
      setMessage(data.message || "Test message sent to Telegram.");
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Unable to send Telegram test message");
    } finally {
      setTelegramSubmitting(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const createPostback = async (provider: "AFFMINE" | "ADBLUMEDIA") => {
    setSubmitting(provider);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/postbacks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to create postback");
      setConfigs((current) => [...current.filter((item) => item.provider !== provider), data.config]);
      setMessage(`${data.config.label} postback is ready.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create postback");
    } finally {
      setSubmitting(null);
    }
  };

  const copyPostbackUrl = async (token: string) => {
    const config = configs.find((item) => item.token === token);
    if (!config) return;
    await navigator.clipboard.writeText(getPostbackTemplate(window.location.origin, config));
    setMessage("Postback URL copied to clipboard.");
  };

  const resetLeadData = async () => {
    setShowResetConfirm(false);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/postbacks", { method: "DELETE", credentials: "include" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to reset conversion data");
      setLeads([]);
      setTotalPayout(0);
      setMessage(`${data.deleted || 0} conversion records deleted.`);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset conversion data");
    }
  };

  const deleteLead = async (leadId: string) => {
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/postbacks", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to delete conversion data");

      const nextLeads = leads.filter((lead) => lead.id !== leadId);
      setLeads(nextLeads);
      setTotalPayout(nextLeads.reduce((sum, lead) => sum + (lead.payout ?? 0), 0));
      setMessage(`${data.deleted || 1} conversion record deleted.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete conversion data");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      lead.postback.provider,
      lead.payout?.toFixed(2),
      lead.sub1,
      lead.sub2,
      lead.sub3,
      lead.sub4,
    ].some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {(message || error) && (
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${error ? "border-red-500/20 bg-red-500/10 text-red-200" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"}`}>
          {error ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {error || message}
        </div>
      )}
      <section className="border-b border-slate-800 pb-6">
        <div className="mb-4 flex items-center gap-2"><Webhook className="h-5 w-5 text-cyan-300" /><h1 className="text-lg font-semibold text-white">Postback endpoints</h1></div>
        <div className="divide-y divide-slate-800">
          {(["AFFMINE", "ADBLUMEDIA"] as const).map((provider) => {
            const config = configs.find((item) => item.provider === provider);
            return <div key={provider} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-4"><p className="font-medium text-white">{provider === "AFFMINE" ? "Affmine" : "AdBluMedia"}</p>{config ? <button type="button" title="Copy receiver URL" onClick={() => copyPostbackUrl(config.token)} className="inline-flex shrink-0 items-center gap-1.5 border border-cyan-500/20 px-2.5 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/10"><Copy className="h-3.5 w-3.5" /> Copy URL</button> : <button type="button" onClick={() => createPostback(provider)} disabled={submitting === provider} className="shrink-0 bg-cyan-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-60">{submitting === provider ? "Creating..." : "Create URL"}</button>}</div>
              {config && <p title={typeof window !== "undefined" ? getPostbackTemplate(window.location.origin, config) : `/api/postback/${config.token}`} className="mt-2 truncate border-l-2 border-cyan-500/40 bg-slate-950/40 px-2.5 py-1.5 font-mono text-[11px] text-slate-500">{typeof window !== "undefined" ? getPostbackTemplate(window.location.origin, config) : `/api/postback/${config.token}`}</p>}
            </div>;
          })}
        </div>
      </section>
      <section className="border-b border-slate-800 pb-6">
        <button type="button" onClick={() => setShowTelegramSettings((current) => !current)} className="flex w-full items-center justify-between gap-3 text-left"><span className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-cyan-300" /><span className="text-sm font-semibold text-slate-300">Telegram notifications</span></span><ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${showTelegramSettings ? "rotate-180" : ""}`} /></button>
        {showTelegramSettings && <div className="mt-4">
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <label className="text-xs text-slate-400">Channel ID<input value={telegramChannelId} onChange={(event) => setTelegramChannelId(event.target.value)} className="mt-1.5 w-full border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" /></label>
          <label className="text-xs text-slate-400">Bot API token<input type="password" value={telegramBotToken} onChange={(event) => setTelegramBotToken(event.target.value)} className="mt-1.5 w-full border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" /></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={saveTelegram} disabled={telegramSubmitting || !telegramChannelId || !telegramBotToken} className="inline-flex items-center gap-1.5 bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-60">Save Telegram</button>{telegramConfigured && <button type="button" onClick={testTelegram} disabled={telegramSubmitting} className="inline-flex items-center gap-1.5 border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-60">Send test message</button>}</div>
        </div>}
      </section>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Database className="h-5 w-5 text-emerald-300" /><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Conversion report</h2></div><div className="flex items-center gap-2">{showResetConfirm && <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-200"><span>Delete all report data?</span><button type="button" onClick={() => setShowResetConfirm(false)} className="text-slate-300 hover:text-white">Cancel</button><button type="button" onClick={resetLeadData} className="font-semibold text-red-300 hover:text-red-200">Reset</button></div>}<button type="button" title="Reset conversion data" onClick={() => setShowResetConfirm(true)} className="inline-flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/20"><RefreshCw className="h-3.5 w-3.5" /> Reset data</button></div></div><div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search conversions" placeholder="Search network, payout, or SubID" className="w-full border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400" /></label><div className="border border-slate-800 px-4 py-2 sm:min-w-36"><p className="text-[10px] uppercase tracking-wide text-slate-500">Total payout</p><p className="mt-0.5 text-lg font-semibold text-white">${totalPayout.toFixed(2)}</p></div></div>{loading ? <p className="text-sm text-slate-500">Loading payout and SubID data...</p> : leads.length === 0 ? <p className="text-sm text-slate-500">No conversions received yet.</p> : filteredLeads.length === 0 ? <p className="text-sm text-slate-500">No matching conversions.</p> : <div className="overflow-auto rounded-lg border border-slate-800"><table className="w-full min-w-[560px] text-left text-xs"><thead className="bg-slate-800 text-slate-400"><tr><th className="px-3 py-2">Network</th><th className="px-3 py-2">Payout</th><th className="px-3 py-2">SubID 1</th><th className="px-3 py-2">SubID 2</th><th className="px-3 py-2">SubID 3</th><th className="px-3 py-2">SubID 4</th><th className="px-3 py-2">Received</th><th className="px-3 py-2 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-800">{filteredLeads.map((lead) => <tr key={lead.id} className="text-slate-300"><td className="px-3 py-2">{lead.postback.provider === "AFFMINE" ? "Affmine" : "AdBluMedia"}</td><td className="px-3 py-2 text-emerald-300">{`$${(lead.payout || 0).toFixed(2)}`}</td><td className="px-3 py-2">{lead.sub1 || "-"}</td><td className="px-3 py-2">{lead.sub2 || "-"}</td><td className="px-3 py-2">{lead.sub3 || "-"}</td><td className="px-3 py-2">{lead.sub4 || "-"}</td><td className="whitespace-nowrap px-3 py-2 text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</td><td className="px-3 py-2 text-right"><button type="button" onClick={() => deleteLead(lead.id)} className="inline-flex items-center justify-center rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-300 hover:bg-red-500/20">Delete</button></td></tr>)}</tbody></table></div>}</div>
    </div>
  );
}
