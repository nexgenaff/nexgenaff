"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatsCards from "@/components/dashboard/StatsCards";
import ClickLogs from "@/components/dashboard/ClickLogs";
import { TrafficBreakdown } from "@/components/dashboard/TrafficBreakdown";
import TelegramCommunityPopup from "@/components/ui/TelegramCommunityPopup";
import {
  RefreshCw,
  Plus,
  Clock,
  Calendar,
  ShieldCheck,
  Activity,
  TrendingUp,
} from "lucide-react";

interface DashboardStats {
  totalClicks: number;
  uniqueClicks: number;
  totalLinks: number;
  botClicks: number;
  chartData: any;
  hourlyChartData: any;
  countryBreakdown: any[];
  referrerBreakdown: any[];
  browserBreakdown: any[];
  deviceBreakdown: any[];
}

// Safe default chart structure
const createDefaultChart = () => ({
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Traffic Volume",
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.08)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
});

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    uniqueClicks: 0,
    totalLinks: 0,
    botClicks: 0,
    chartData: createDefaultChart(),
    hourlyChartData: createDefaultChart(),
    countryBreakdown: [],
    referrerBreakdown: [],
    browserBreakdown: [],
    deviceBreakdown: [],
  });
  const [chartData, setChartData] = useState(createDefaultChart());
  const [hourlyChartData, setHourlyChartData] = useState(createDefaultChart());
  const [countryBreakdown, setCountryBreakdown] = useState<any[]>([]);
  const [referrerBreakdown, setReferrerBreakdown] = useState<any[]>([]);
  const [browserBreakdown, setBrowserBreakdown] = useState<any[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [logFilter, setLogFilter] = useState<string>("all"); // ✅ was missing
  const [now, setNow] = useState(() => new Date());
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authIdentity, setAuthIdentity] = useState<string | null>(null);

  // ─── ZOOM FIX: ensure viewport meta is correct ───
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
    );
  }, []);

  // ─── Clock ───
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = useMemo(
    () =>
      now.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    [now]
  );
  const timeStr = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [now]
  );

  // ─── Data fetching ───
  const loadDashboardData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      try {
        const response = await fetch(
          `/api/analytics/dashboard?period=${period}`,
          { credentials: "include" }
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          // fallback to zeroed data
          setStats({
            totalClicks: 0,
            uniqueClicks: 0,
            totalLinks: 0,
            botClicks: 0,
            chartData: createDefaultChart(),
            hourlyChartData: createDefaultChart(),
            countryBreakdown: [],
            referrerBreakdown: [],
            browserBreakdown: [],
            deviceBreakdown: [],
          });
          setChartData(createDefaultChart());
          setHourlyChartData(createDefaultChart());
          setCountryBreakdown([]);
          setReferrerBreakdown([]);
          setBrowserBreakdown([]);
          setDeviceBreakdown([]);
          return;
        }

        const data = await response.json();

        // Safe assignment with defaults
        const safeData: DashboardStats = {
          totalClicks: data.totalClicks ?? 0,
          uniqueClicks: data.uniqueClicks ?? 0,
          totalLinks: data.totalLinks ?? 0,
          botClicks: data.botClicks ?? 0,
          chartData: data.chartData || createDefaultChart(),
          hourlyChartData: data.hourlyChartData || createDefaultChart(),
          countryBreakdown: Array.isArray(data.countryBreakdown)
            ? data.countryBreakdown
            : [],
          referrerBreakdown: Array.isArray(data.referrerBreakdown)
            ? data.referrerBreakdown
            : [],
          browserBreakdown: Array.isArray(data.browserBreakdown)
            ? data.browserBreakdown
            : [],
          deviceBreakdown: Array.isArray(data.deviceBreakdown)
            ? data.deviceBreakdown
            : [],
        };

        setStats(safeData);
        setChartData(safeData.chartData);
        setHourlyChartData(safeData.hourlyChartData);
        setCountryBreakdown(safeData.countryBreakdown);
        setReferrerBreakdown(safeData.referrerBreakdown);
        setBrowserBreakdown(safeData.browserBreakdown);
        setDeviceBreakdown(safeData.deviceBreakdown);
      } catch (error) {
        console.error("Telemetry sync failed:", error);
      } finally {
        setLoading(false);
        if (isManualRefresh) setRefreshing(false);
      }
    },
    [period, router]
  );

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (!response.ok) return;

        const data = await response.json();
        const nextIdentity = data.id ? `${data.role ?? "unknown"}:${data.id}` : null;
        setUserRole(data.role ?? null);
        setAuthIdentity((currentIdentity) => {
          if (currentIdentity === nextIdentity) {
            return currentIdentity;
          }

          return nextIdentity;
        });
      } catch (error) {
        console.error("Failed to load user role for popup", error);
      }
    };

    void loadUserRole();
  }, []);

  useEffect(() => {
    if (userRole !== "MANAGER" || !authIdentity) return;

    const storageKey = `afficixo-manager-telegram-popup-shown:${authIdentity}`;
    const alreadyShown = window.sessionStorage.getItem(storageKey);

    if (!alreadyShown) {
      const timer = window.setTimeout(() => {
        setShowTelegramPopup(true);
        window.sessionStorage.setItem(storageKey, "true");
      }, 1200);
      return () => window.clearTimeout(timer);
    }
  }, [userRole, authIdentity]);

  const handleCloseTelegramPopup = () => {
    setShowTelegramPopup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
          Loading Telemetry
        </span>
      </div>
    );
  }

  return (
    // ─── Main container with overflow protection ───
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white pb-20 overflow-x-hidden w-full max-w-full">
      {/* Background Grid Texture */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.06),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {showTelegramPopup && userRole === "MANAGER" ? (
          <TelegramCommunityPopup onClose={handleCloseTelegramPopup} />
        ) : null}
        {/* ─── Header ─── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d111a]/95 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Image
                src="/afficixo.png"
                alt="Afficixo logo"
                width={64}
                height={64}
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {dateStr}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {timeStr}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <Link
              href="/admin/links/create"
              aria-label="Create new link"
              className="min-h-[36px] flex items-center justify-center gap-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[10px] font-medium text-white shadow-md shadow-indigo-600/25 transition-all active:scale-[0.97] w-full sm:w-auto"
            >
              <Plus className="w-3 h-3" />
              <span>New Link</span>
            </Link>
          </div>
        </header>

        {/* ─── Period selector ─── */}
        <div className="flex items-center bg-[#0d111a]/85 border border-slate-800/80 p-1 rounded-2xl mb-4 sm:mb-6 shadow-md">
          <div className="grid grid-cols-3 gap-1 w-full">
            {(["week", "month", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`min-h-[36px] flex items-center justify-center text-xs font-medium rounded-xl transition-all capitalize active:scale-[0.97] ${
                  period === p
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Stats & Charts ─── */}
        <section className="mb-4 sm:mb-6 relative">
          <StatsCards
            stats={stats}
            chartData={chartData}
            hourlyChartData={hourlyChartData}
            countryBreakdown={countryBreakdown}
            period={period}
            onPeriodChange={setPeriod}
          />
        </section>

        {/* ─── Traffic Breakdown ─── */}
        <section className="mb-4 sm:mb-6">
          <TrafficBreakdown
            referrerBreakdown={referrerBreakdown}
            browserBreakdown={browserBreakdown}
            deviceBreakdown={deviceBreakdown}
          />
        </section>

        {/* ─── Click Logs ─── */}
        <section className="bg-[#0d111a]/95 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-pulse" />
                <span>Live Click Logs & Telemetry Stream</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Low-latency inspection of inbound traffic quality, fingerprints,
                and bot filtering status.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {/* Filter tabs */}
              <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto">
                {(["all", "valid", "bot"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`flex-1 sm:flex-none px-3 py-2 text-[11px] font-medium rounded-lg capitalize transition-all min-h-[38px] ${
                      logFilter === f
                        ? "bg-slate-800 text-indigo-400 shadow-sm border border-slate-700/60"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Mitigation Active</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <ClickLogs filter={logFilter} />
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="mt-8 text-center text-[11px] sm:text-xs text-slate-500 border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Next-Gen Affiliates. Enterprise Conversion Engine.</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Node Operational
          </div>
        </footer>
      </div>
    </div>
  );
}