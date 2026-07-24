"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileDown,
  RefreshCw,
  Zap,
  Clock,
  Calendar,
  Filter,
  X,
  CalendarRange,
  Download,
  Award,
  ChevronDown,
} from "lucide-react";
import { formatNumber } from "@/lib/utils/helpers";
import StatsCards from "@/components/dashboard/StatsCards";

interface DashboardStats {
  totalClicks: number;
  uniqueClicks: number;
  totalLinks: number;
  botClicks: number;
  accountGeoReport?: {
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
    accountBreakdown: Array<{
      accountName: string;
      totalUniqueClicks: number;
      countries: Array<{ country: string; uniqueClicks: number }>;
    }>;
  };
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
}

interface FilterParams {
  startDate?: string;
  endDate?: string;
  granularity?: string;
  clickType?: string;
}

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
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const datePresets = [
  { label: "Today", value: "today" },
  { label: "Last 7d", value: "last7" },
  { label: "Last 30d", value: "last30" },
  { label: "This Month", value: "month" },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    uniqueClicks: 0,
    botClicks: 0,
    totalLinks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    granularity: "daily",
    clickType: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = useCallback(
    async (showRefreshing = false, filterParams: Partial<FilterParams> = {}) => {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        if (filterParams.startDate) params.append("startDate", filterParams.startDate as string);
        if (filterParams.endDate) params.append("endDate", filterParams.endDate as string);
        if (filterParams.granularity) params.append("granularity", filterParams.granularity as string);
        if (filterParams.clickType && filterParams.clickType !== "all") {
          params.append("clickType", filterParams.clickType as string);
        }

        const url = `/api/analytics/dashboard${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url, { credentials: "include" });
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) throw new Error(`Dashboard stats failed with ${response.status}`);

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch analytics overview:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void fetchStats(false);
  }, [fetchStats]);

  const applyFilters = () => {
    void fetchStats(true, filters);
    setActivePreset(null);
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      granularity: "daily",
      clickType: "all",
    });
    setActivePreset(null);
    setTimeout(() => {
      void fetchStats(true, {
        startDate: "",
        endDate: "",
        granularity: "daily",
        clickType: "all",
      });
    }, 100);
  };

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    const now = new Date();
    let startDate = "";
    let endDate = now.toISOString().split("T")[0];

    switch (preset) {
      case "today":
        startDate = endDate;
        break;
      case "last7": {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split("T")[0];
        break;
      }
      case "last30": {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split("T")[0];
        break;
      }
      case "month": {
        const d = new Date(now);
        d.setDate(1);
        startDate = d.toISOString().split("T")[0];
        break;
      }
      default:
        return;
    }

    const newFilters = { ...filters, startDate, endDate };
    setFilters(newFilters);
    void fetchStats(true, newFilters);
  };

  const exportCSV = () => {
    const report = stats.accountGeoReport;
    if (!report || report.accountBreakdown.length === 0) return;

    const headers = ["Account", ...report.labels];
    const rows = report.accountBreakdown.map((account) => [
      account.accountName,
      ...report.labels.map((country) => {
        const val = account.countries.find((c) => c.country === country);
        return val ? val.uniqueClicks : 0;
      }),
    ]);

    const totals = report.labels.map((country) => {
      return report.accountBreakdown.reduce((sum, acc) => {
        const val = acc.countries.find((c) => c.country === country);
        return sum + (val ? val.uniqueClicks : 0);
      }, 0);
    });
    rows.push(["TOTAL", ...totals]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const report = stats.accountGeoReport;
  const reportLabels = report?.labels ?? [];
  const reportRows = report?.accountBreakdown ?? [];

  const totals = useMemo(() => {
    return reportLabels.map((country) => {
      return reportRows.reduce((sum, acc) => {
        const val = acc.countries.find((c) => c.country === country);
        return sum + (val ? val.uniqueClicks : 0);
      }, 0);
    });
  }, [reportLabels, reportRows]);

  const sortedRows = useMemo(() => {
    if (!sortConfig) return reportRows;
    const sorted = [...reportRows];
    sorted.sort((a, b) => {
      let aVal: string | number = a.accountName;
      let bVal: string | number = b.accountName;
      if (sortConfig.key !== "accountName") {
        const country = sortConfig.key;
        const aCountry = a.countries.find((c) => c.country === country);
        const bCountry = b.countries.find((c) => c.country === country);
        aVal = aCountry ? aCountry.uniqueClicks : 0;
        bVal = bCountry ? bCountry.uniqueClicks : 0;
      }
      if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [reportRows, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
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
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#0d1724] to-[#101827]" />
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-radial from-indigo-900/25 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 20, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-gradient-radial from-purple-900/20 via-transparent to-transparent blur-3xl"
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
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
              >
                <Zap className="w-6 h-6 text-indigo-400" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                  Analytics Overview
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
                {stats.totalLinks > 0 ? `${stats.totalLinks} active` : "No data yet"}
              </div>
              <motion.button
                onClick={() => fetchStats(true, filters)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing" : "Refresh"}
              </motion.button>
              <Link
                href="/admin/links/create"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">New campaign</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ===== STATS CARDS – Single source of truth (NO DUPLICATION) ===== */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6 shadow-2xl shadow-indigo-500/5 mb-6"
        >
          <StatsCards
            stats={stats}
            chartData={stats.chartData}
            hourlyChartData={stats.hourlyChartData}
          />
        </motion.div>

        {/* ===== GEO BREAKDOWN ===== */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 px-4 py-3 sm:px-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-indigo-300">Geo breakdown</p>
              <h2 className="mt-1 text-sm font-semibold text-white">Account to Country Performance</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide" : "Filters"}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400 backdrop-blur-sm">
                {report?.datasets?.length ? `${reportRows.length} accounts` : "Waiting"}
              </div>
              {reportRows.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
              )}
            </div>
          </div>

          {/* ===== FILTER BAR – NOW FULLY READABLE ===== */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b border-white/10 bg-slate-900/50 p-4 sm:p-6"
            >
              {/* Quick presets */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-medium text-slate-300 mr-1">Quick:</span>
                {datePresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => applyPreset(preset.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      activePreset === preset.value
                        ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-indigo-400/30 shadow-lg shadow-indigo-500/10"
                        : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Filter inputs – DARK backgrounds with LIGHT text for readability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => {
                      setFilters({ ...filters, startDate: e.target.value });
                      setActivePreset(null);
                    }}
                    className="w-full rounded-xl border border-white/20 bg-slate-800/80 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => {
                      setFilters({ ...filters, endDate: e.target.value });
                      setActivePreset(null);
                    }}
                    className="w-full rounded-xl border border-white/20 bg-slate-800/80 px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Granularity</label>
                  <select
                    value={filters.granularity}
                    onChange={(e) => {
                      setFilters({ ...filters, granularity: e.target.value });
                      setActivePreset(null);
                    }}
                    className="w-full rounded-xl border border-white/20 bg-slate-800/80 px-3 py-2.5 text-sm text-white focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Click Type</label>
                  <select
                    value={filters.clickType}
                    onChange={(e) => {
                      setFilters({ ...filters, clickType: e.target.value });
                      setActivePreset(null);
                    }}
                    className="w-full rounded-xl border border-white/20 bg-slate-800/80 px-3 py-2.5 text-sm text-white focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all"
                  >
                    <option value="all">All Clicks</option>
                    <option value="direct">Direct Clicks</option>
                    <option value="referrer">Referrer Clicks</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={applyFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <CalendarRange className="w-4 h-4" />
                  Apply Filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:border-white/40 transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                  Clear
                </motion.button>
                {(filters.startDate || filters.endDate || filters.clickType !== "all" || filters.granularity !== "daily") && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Filters active
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* ===== TABLE ===== */}
          {report?.datasets?.length ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-x-auto"
            >
              <table className="min-w-full border-collapse text-left text-sm text-slate-300">
                <thead className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  <tr>
                    <th
                      className="border-b border-white/10 px-4 py-3 font-semibold text-slate-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => requestSort("accountName")}
                    >
                      <div className="flex items-center gap-1">
                        Account
                        {sortConfig?.key === "accountName" && (
                          <span className="text-indigo-400">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    {reportLabels.map((country) => (
                      <th
                        key={country}
                        className="border-b border-white/10 px-3 py-3 font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                        onClick={() => requestSort(country)}
                      >
                        <div className="flex items-center gap-1">
                          {country}
                          {sortConfig?.key === country && (
                            <span className="text-indigo-400">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((account, index) => (
                    <motion.tr
                      key={account.accountName}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                      className={`border-b border-white/5 ${index % 2 === 0 ? "bg-white/5" : "bg-white/[0.02]"}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-white flex items-center gap-2">
                        {account.accountName}
                        {index === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                            <Award className="w-3 h-3" />
                            Top
                          </span>
                        )}
                      </td>
                      {reportLabels.map((country) => {
                        const countryValue = account.countries.find((item) => item.country === country);
                        return (
                          <td key={`${account.accountName}-${country}`} className="px-3 py-3">
                            {countryValue ? (
                              <span className="inline-flex min-w-[54px] items-center justify-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-colors">
                                {countryValue.uniqueClicks}
                              </span>
                            ) : (
                              <span className="inline-flex min-w-[54px] items-center justify-center rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1 text-sm text-slate-500">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                  {/* Totals row */}
                  {totals.some((t) => t > 0) && (
                    <tr className="border-t-2 border-white/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 font-semibold">
                      <td className="px-4 py-3 text-white">TOTAL</td>
                      {totals.map((total, idx) => (
                        <td key={`total-${idx}`} className="px-3 py-3 text-white">
                          <span className="inline-flex min-w-[54px] items-center justify-center rounded-md bg-gradient-to-r from-indigo-500/30 to-purple-500/30 px-2.5 py-1 text-sm font-bold text-indigo-200">
                            {total}
                          </span>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
                <FileDown className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-200">No account to country report available yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Publish links and collect traffic so this board can render account-level country performance.
              </p>
            </div>
          )}
        </motion.div>

        {/* ===== FOOTER ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-slate-500 border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        >
          <span>© 2026 Nexgen Affiliates. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              v2.0.1
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}