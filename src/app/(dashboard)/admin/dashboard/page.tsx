"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import StatsCards from "@/components/dashboard/StatsCards";
import ClickLogs from "@/components/dashboard/ClickLogs";
import { TrafficBreakdown } from "@/components/dashboard/TrafficBreakdown";
import TelegramCommunityPopup from "@/components/ui/TelegramCommunityPopup";
import { consumeManagerTelegramPopupPending } from "@/lib/utils/telegram-popup";
import {
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
  totalEarned: number;
  commission: number;
  revenue: number;
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
    totalEarned: 0,
    commission: 0,
    revenue: 0,
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
  const [logFilter, setLogFilter] = useState<string>("all"); // ✅ was missing
  const [now, setNow] = useState(() => new Date());
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authIdentity, setAuthIdentity] = useState<string | null>(null);
  const [isHelpPopoverOpen, setIsHelpPopoverOpen] = useState(false);

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
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now]
  );

  // ─── Data fetching ───
  const loadDashboardData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      try {
        const response = await fetch(
          "/api/analytics/dashboard?period=all",
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
            totalEarned: 0,
            commission: 0,
            revenue: 0,
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
        const linksResponse = await fetch("/api/links", { credentials: "include" });
        const paymentLinks = linksResponse.ok ? await linksResponse.json() : [];
        const paymentSummary = Array.isArray(paymentLinks)
          ? paymentLinks.filter((link) => link.isActive).reduce(
              (summary, link) => {
                const invoices = Array.isArray(link.invoiceHistory) ? link.invoiceHistory : [];
                const current = Number(link.totalEarning) || 0;
                const invoiceTotal = invoices.reduce((total: number, invoice: { totalEarning?: number }) => total + (Number(invoice.totalEarning) || 0), 0);
                const commissionRate = Number(link.commissionRate ?? 20) || 20;
                return { totalEarned: summary.totalEarned + current + invoiceTotal, commission: summary.commission + (current + invoiceTotal) * (commissionRate / 100) };
              },
              { totalEarned: 0, commission: 0 },
            )
          : { totalEarned: 0, commission: 0 };

        // Safe assignment with defaults
        const safeData: DashboardStats = {
          totalClicks: data.totalClicks ?? 0,
          uniqueClicks: data.uniqueClicks ?? 0,
          totalLinks: data.totalLinks ?? 0,
          totalEarned: paymentSummary.totalEarned,
          commission: paymentSummary.commission,
          revenue: paymentSummary.totalEarned + paymentSummary.commission,
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
    [router]
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

    const shouldOpenPopup = consumeManagerTelegramPopupPending(window);

    if (shouldOpenPopup) {
      const timer = window.setTimeout(() => {
        setShowTelegramPopup(true);
        setIsHelpPopoverOpen(true);
      }, 800);
      return () => window.clearTimeout(timer);
    }
  }, [userRole, authIdentity]);

  const handleCloseTelegramPopup = () => {
    setShowTelegramPopup(false);
    setIsHelpPopoverOpen(false);
  };

  const handleOpenHelpPopover = () => {
    setShowTelegramPopup(true);
    setIsHelpPopoverOpen(true);
  };

  useEffect(() => {
    if (!showTelegramPopup) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.key !== "Esc") return;
      event.preventDefault();
      handleCloseTelegramPopup();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showTelegramPopup]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090e] text-center">
        <div className="flex flex-col items-center justify-center gap-8">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Image
              src="/afficixo-logo.png"
              alt="Afficixo logo"
              width={200}
              height={200}
              sizes="(max-width: 768px) 200px, 240px"
              className="mx-auto object-cover"
              priority
            />
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-transparent blur-xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-1.5 w-32 overflow-hidden rounded-full bg-white/5 border border-white/10">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0"
                animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
                animate={{ 
                  x: ["-100%", "300%"],
                  width: ["25%", "50%", "25%"]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
              />
            </div>
            <motion.p
              className="text-xs text-slate-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Loading...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // ─── Main container with overflow protection ───
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white pb-20 overflow-x-hidden w-full max-w-full">
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-2 pt-4 sm:px-3 sm:pt-6 lg:px-3">
        {/* ─── Header ─── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-cyan-50/80 p-4 shadow-[0_10px_30px_rgba(6,182,212,0.14)] backdrop-blur-md mb-4 sm:mb-6 sm:p-5 dark:bg-slate-900/95 dark:shadow-[0_10px_30px_rgba(34,211,238,0.1)]">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Image
                src="/afficixo-logo.png"
                alt="Afficixo logo"
                width={96}
                height={96}
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
            {userRole === "MANAGER" ? (
              <button
                type="button"
                onClick={handleOpenHelpPopover}
                aria-label="Open help popup"
                className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(0,136,204,0.22),rgba(0,136,204,0.08))] text-slate-100 shadow-[0_8px_24px_rgba(0,136,204,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-[linear-gradient(135deg,rgba(0,136,204,0.3),rgba(0,136,204,0.14))] hover:shadow-[0_10px_28px_rgba(0,136,204,0.24)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current transition-transform duration-200 group-hover:scale-105">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </button>
            ) : null}
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

        {showTelegramPopup && userRole === "MANAGER" && isHelpPopoverOpen ? (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24 sm:pt-28">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={handleCloseTelegramPopup}
            />
            <div className="relative pointer-events-auto">
              <TelegramCommunityPopup onClose={handleCloseTelegramPopup} />
            </div>
          </div>
        ) : null}

        {/* ─── Stats & Charts ─── */}
        <section className="mb-4 sm:mb-6 relative">
          <StatsCards
            stats={stats}
            chartData={chartData}
            hourlyChartData={hourlyChartData}
            countryBreakdown={countryBreakdown}
          />
        </section>

        {/* ─── Traffic Breakdown ─── */}
        <section className="mb-4 sm:mb-6">
          <TrafficBreakdown
            referrerBreakdown={referrerBreakdown}
            browserBreakdown={browserBreakdown}
            deviceBreakdown={deviceBreakdown}
            countryBreakdown={countryBreakdown}
          />
        </section>

        <div className="overflow-x-auto">
          <ClickLogs filter={logFilter} />
        </div>

      </div>
    </div>
  );
}