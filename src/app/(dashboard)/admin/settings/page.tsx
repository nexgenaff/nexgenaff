"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  User,
  Mail,
  Key,
  LogOut,
  AlertTriangle,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Settings,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 340, mass: 0.8 },
  },
};

const slideDown = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.25 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const readTheme = () => {
      const storedTheme = window.localStorage.getItem("theme");
      const shouldUseDark = storedTheme
        ? storedTheme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;

      setDarkMode(shouldUseDark);
      document.documentElement.classList.toggle("dark", shouldUseDark);
    };

    const fetchAccount = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setUserInfo({ username: data.username || "admin", email: data.email || "admin@nextgen.com" });
        } else {
          setUserInfo({ username: "admin", email: "admin@nextgen.com" });
        }
      } catch {
        setUserInfo({ username: "admin", email: "admin@nextgen.com" });
      } finally {
        setLoading(false);
      }
    };

    readTheme();
    fetchAccount();

    const handleThemeChange = () => readTheme();
    window.addEventListener("storage", handleThemeChange);
    window.addEventListener("themechange", handleThemeChange);

    return () => {
      window.removeEventListener("storage", handleThemeChange);
      window.removeEventListener("themechange", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    window.localStorage.setItem("theme", newDark ? "dark" : "light");
    window.dispatchEvent(new Event("themechange"));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({ message: "Password updated" }));
      if (!response.ok) {
        throw new Error(data.error || "Unable to update password");
      }

      setFeedback({ type: "success", message: data.message || "Password updated successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDangerAction = async (action: "delete-data" | "reset-analytics") => {
    const confirmMessage =
      action === "delete-data"
        ? "This will permanently remove all workspace data for this account. Continue?"
        : "This will reset all analytics for your workspace. Continue?";

    if (!window.confirm(confirmMessage)) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Unable to complete that action");
      }

      setFeedback({ type: "success", message: data.message || "Action completed." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to complete that action",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="mt-4 text-sm text-slate-400 animate-pulse">Loading settings…</p>
        </div>
      </div>
    );
  }

  // Get initials for avatar
  const initials = userInfo?.username
    ? userInfo.username.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="space-y-6 pb-8 md:space-y-8">
      {/* ===== HEADER ===== */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl shadow-indigo-500/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-indigo-300">
              <Settings className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Preferences</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Workspace Settings</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your account, appearance, and workspace preferences.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{userInfo?.username || "admin"}</p>
              <p className="text-xs text-slate-400">{userInfo?.email || "admin@nextgen.com"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== FEEDBACK ===== */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-xl border p-4 text-sm ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Appearance */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/5"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-indigo-500/10">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-indigo-300" />
                ) : (
                  <Sun className="w-4 h-4 text-indigo-300" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-white">Appearance</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Dark mode</p>
                <p className="text-xs text-slate-400">Switch between dark and light themes.</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  darkMode ? "bg-indigo-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Account */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/5"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-indigo-500/10">
                <User className="w-4 h-4 text-indigo-300" />
              </div>
              <h3 className="text-sm font-semibold text-white">Account</h3>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    Username
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">{userInfo?.username || "admin"}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">{userInfo?.email || "admin@nextgen.com"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setShowPasswordForm((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <Key className="w-4 h-4" />
                  {showPasswordForm ? "Hide" : "Change password"}
                </button>
                <button
                  onClick={() => setShowDangerZone((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {showDangerZone ? "Hide danger zone" : "Danger zone"}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-rose-400/30 bg-rose-500/10 text-sm font-medium text-rose-300 hover:bg-rose-500/20 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

              {/* Password Form */}
              <AnimatePresence>
                {showPasswordForm && (
                  <motion.div
                    variants={slideDown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden"
                  >
                    <form
                      onSubmit={handlePasswordSubmit}
                      className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4 space-y-3"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Current password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            New password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                            required
                            minLength={8}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Confirm new password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 rounded-lg bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-600 transition disabled:opacity-60"
                        >
                          {isSubmitting ? "Updating…" : "Save password"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Danger Zone */}
          <AnimatePresence>
            {showDangerZone && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 10 }}
                className="rounded-xl border border-rose-400/30 bg-gradient-to-br from-rose-500/10 to-rose-600/5 backdrop-blur-xl p-5 shadow-xl shadow-rose-500/10"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 rounded-lg bg-rose-500/20">
                    <AlertTriangle className="w-4 h-4 text-rose-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-rose-200">Danger zone</h3>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                  These actions are irreversible. Please review them before proceeding.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDangerAction("delete-data")}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition disabled:opacity-60 shadow-lg shadow-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete all data
                  </button>
                  <button
                    onClick={() => handleDangerAction("reset-analytics")}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-rose-400/30 bg-rose-500/10 text-sm font-medium text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-60"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset analytics
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help / Quick Actions */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/5"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-indigo-500/10">
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
              <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowDangerZone((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 transition"
              >
                <span className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  {showDangerZone ? "Hide" : "Show"} danger zone
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => router.push("/admin/analytics")}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 transition"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  View analytics
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}