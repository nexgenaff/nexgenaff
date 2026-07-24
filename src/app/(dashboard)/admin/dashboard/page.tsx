"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import StatsCards from "@/components/dashboard/StatsCards";
import ClickLogs from "@/components/dashboard/ClickLogs";
import { TrafficBreakdown } from "@/components/dashboard/TrafficBreakdown";
import {
  RefreshCw,
  Plus,
  Zap,
  Clock,
  Calendar,
  ChevronDown,
} from "lucide-react";

interface DashboardStats {
  totalClicks: number;
  uniqueClicks: number;
  totalLinks: number;
  botClicks: number;
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      tension?: number;
      pointRadius?: number;
    }[];
  };
  hourlyChartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      tension?: number;
      pointRadius?: number;
    }[];
  };
  geoData?: {
    country: string;
    clicks: number;
    uniqueClicks: number;
  }[];
  countryBreakdown?: {
    country: string;
    clicks: number;
    uniqueClicks: number;
  }[];
  referrerBreakdown?: {
    name: string;
    clicks: number;
    uniqueClicks: number;
  }[];
  browserBreakdown?: {
    name: string;
    clicks: number;
    uniqueClicks: number;
  }[];
  deviceBreakdown?: {
    name: string;
    clicks: number;
    uniqueClicks: number;
  }[];
}

const defaultChartData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Clicks",
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: "#818CF8",
      backgroundColor: "rgba(129, 140, 248, 0.14)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    uniqueClicks: 0,
    totalLinks: 0,
    botClicks: 0,
  });
  const [chartData, setChartData] = useState(defaultChartData);
  const [hourlyChartData, setHourlyChartData] = useState(defaultChartData);
  const [countryBreakdown, setCountryBreakdown] = useState<
    { country: string; clicks: number; uniqueClicks: number }[]
  >([]);
  const [referrerBreakdown, setReferrerBreakdown] = useState<
    { name: string; clicks: number; uniqueClicks: number }[]
  >([]);
  const [browserBreakdown, setBrowserBreakdown] = useState<
    { name: string; clicks: number; uniqueClicks: number }[]
  >([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<
    { name: string; clicks: number; uniqueClicks: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = useCallback(async () => {
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
        console.error("Failed to fetch stats, status:", response.status);
        setStats({ totalClicks: 0, uniqueClicks: 0, totalLinks: 0, botClicks: 0 });
        setChartData(defaultChartData);
        setHourlyChartData(defaultChartData);
        setCountryBreakdown([]);
        setReferrerBreakdown([]);
        setBrowserBreakdown([]);
        setDeviceBreakdown([]);
        return;
      }

      const data = await response.json();
      setStats(data);
      setChartData(data.chartData || defaultChartData);
      setHourlyChartData(data.hourlyChartData || defaultChartData);
      setCountryBreakdown(data.countryBreakdown || []);
      setReferrerBreakdown(data.referrerBreakdown || []);
      setBrowserBreakdown(data.browserBreakdown || []);
      setDeviceBreakdown(data.deviceBreakdown || []);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, [period, router]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setLoading(true);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070b] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-indigo-400/30 border-t-indigo-400"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#05070b] text-white overflow-x-hidden"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#0d1724] to-[#101827]" />
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-radial from-indigo-900/20 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-gradient-radial from-purple-900/15 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 30, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
        {/* ===== TOP BAR ===== */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-2xl shadow-indigo-500/5 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Analytics Dashboard
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentTime.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <motion.button
                onClick={handleRefresh}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </motion.button>
              <Link
                href="/admin/links/create"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Link
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ===== PERIOD SELECTOR ===== */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2 mb-6"
        >
          <span className="text-sm text-slate-400">Period:</span>
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as "week" | "month" | "year")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                period === p
                  ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-indigo-400/30 shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* ===== STATS CARDS ===== */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-2xl shadow-indigo-500/5 mb-6"
        >
          <StatsCards
            stats={stats}
            chartData={chartData}
            hourlyChartData={hourlyChartData}
            countryBreakdown={countryBreakdown}
            period={period}
            onPeriodChange={setPeriod}
          />
        </motion.div>

        {/* ===== TRAFFIC BREAKDOWN ===== */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-2xl shadow-indigo-500/5 mb-6"
        >
          <TrafficBreakdown
            referrerBreakdown={referrerBreakdown}
            browserBreakdown={browserBreakdown}
            deviceBreakdown={deviceBreakdown}
          />
        </motion.div>

        {/* ===== CLICK LOGS ===== */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-2xl shadow-indigo-500/5"
        >
          <ClickLogs />
        </motion.div>

        {/* ===== FOOTER ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-slate-500 border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        >
          <span>© 2026 Nexgen Affiliates. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}