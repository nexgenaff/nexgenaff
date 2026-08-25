"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AfficixoLoading from "@/components/ui/AfficixoLoading";
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
} from "lucide-react";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string; role?: string } | null>(null);
  const [clickRate, setClickRate] = useState("0");
  const [showClickRateForm, setShowClickRateForm] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState("BKASH");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [paymentPassword, setPaymentPassword] = useState("");
  const [showPaymentBindingForm, setShowPaymentBindingForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
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
          setUserInfo({ username: data.username || "admin", email: data.email || "", role: data.role });
          setEmailDraft(data.email || "");
          setClickRate(String(data.clickRate ?? 0));
          setPayoutMethod(data.payoutMethod || "BKASH");
          setPayoutAccount(data.payoutAccount || "");
        } else {
          setUserInfo({ username: "admin", email: "" });
          setEmailDraft("");
        }
      } catch {
        setUserInfo({ username: "admin", email: "" });
        setEmailDraft("");
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

  const handleClickRateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-click-rate", clickRate: Number(clickRate) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to update USA click rate");
      setClickRate(String(data.clickRate));
      setFeedback({ type: "success", message: data.message || "USA click rate updated successfully." });
      setShowClickRateForm(false);
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update USA click rate" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentBindingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-payment-binding", payoutMethod, payoutAccount, paymentPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save payment binding");
      setPaymentPassword("");
      setShowPaymentBindingForm(false);
      setFeedback({ type: "success", message: data.message || "Payment binding saved successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to save payment binding" });
    } finally {
      setIsSubmitting(false);
    }
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
    return <AfficixoLoading compact />;
  }

  const initials = userInfo?.username
    ? userInfo.username.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="space-y-6 pb-8 md:space-y-8">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Settings className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Preferences</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white">Workspace Settings</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              Manage your account, appearance, and workspace preferences.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{userInfo?.username || "admin"}</p>
              <p className="text-xs text-slate-400">{userInfo?.email || "No email added yet"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/20 bg-red-500/10 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-80">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              {darkMode ? (
                <Moon className="h-4 w-4 text-indigo-400" />
              ) : (
                <Sun className="h-4 w-4 text-indigo-400" />
              )}
              <h3 className="text-sm font-semibold text-white">Appearance</h3>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Dark mode</p>
                <p className="text-xs text-slate-400">Switch between dark and light themes.</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`theme-toggle relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? "bg-indigo-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Account</h3>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-800/50 px-4 py-3">
                  <p className="text-xs text-slate-400">Username</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {userInfo?.username || "admin"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-800/50 px-4 py-3">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {userInfo?.email || "No email added yet"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPasswordForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  <Key className="h-3.5 w-3.5" />
                  {showPasswordForm ? "Hide" : "Change password"}
                </button>
                <button
                  onClick={() => {
                    setShowEmailForm((prev) => !prev);
                    if (!showEmailForm) setEmailDraft(userInfo?.email || "");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {userInfo?.email ? "Update email" : "Add email"}
                </button>
                {(userInfo?.role === "OWNER" || userInfo?.role === "ADMIN") && (
                  <button
                    onClick={() => setShowClickRateForm((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                  >
                    USA click rate: ${Number(clickRate).toFixed(2)}
                  </button>
                )}
                {userInfo && (
                  <button onClick={() => setShowPaymentBindingForm((prev) => !prev)} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20">
                    Payment binding
                  </button>
                )}
                <button
                  onClick={() => setShowDangerZone((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {showDangerZone ? "Hide danger zone" : "Danger zone"}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>

              {/* Email Form */}
              {showClickRateForm && (userInfo?.role === "OWNER" || userInfo?.role === "ADMIN") && (
                <form onSubmit={handleClickRateSubmit} className="mt-3 space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">{userInfo.role === "ADMIN" ? "Your USA click rate per unique referrer click" : "USA click rate per unique referrer click"}</label>
                    <input type="number" min="0" step="0.01" value={clickRate} onChange={(event) => setClickRate(event.target.value)} required className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60">{isSubmitting ? "Saving..." : "Save USA click rate"}</button>
                </form>
              )}

              {showPaymentBindingForm && userInfo && (
                <form onSubmit={handlePaymentBindingSubmit} className="mt-3 space-y-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-xs text-slate-400">Set the password and payout account used by your public link account.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none">
                      <option value="BKASH">bKash</option>
                      <option value="BINANCE">Binance</option>
                    </select>
                    <input value={payoutAccount} onChange={(event) => setPayoutAccount(event.target.value)} placeholder={payoutMethod === "BINANCE" ? "Binance ID" : "bKash number"} required className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none" />
                  </div>
                  <input type="password" minLength={8} value={paymentPassword} onChange={(event) => setPaymentPassword(event.target.value)} placeholder="Payment access password (8+ characters)" required className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none" />
                  <button type="submit" disabled={isSubmitting} className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-60">{isSubmitting ? "Saving..." : "Save payment binding"}</button>
                </form>
              )}

              {showEmailForm && (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setIsSubmitting(true);
                    setFeedback(null);

                    try {
                      const response = await fetch("/api/settings", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "update-email", email: emailDraft.trim() }),
                      });

                      const data = await response.json().catch(() => ({ message: "Email updated" }));
                      if (!response.ok) {
                        throw new Error(data.error || "Unable to update email");
                      }

                      setUserInfo((prev) => (prev ? { ...prev, email: emailDraft.trim() } : prev));
                      setFeedback({ type: "success", message: data.message || "Email updated successfully." });
                      setShowEmailForm(false);
                    } catch (error) {
                      setFeedback({
                        type: "error",
                        message: error instanceof Error ? error.message : "Unable to update email",
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="mt-3 space-y-3 rounded-lg border border-slate-800 bg-slate-800/30 p-4"
                >
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Email address</label>
                    <input
                      type="email"
                      value={emailDraft}
                      onChange={(event) => setEmailDraft(event.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Saving…" : "Save email"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Password Form */}
              {showPasswordForm && (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="mt-3 space-y-3 rounded-lg border border-slate-800 bg-slate-800/30 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">
                        Current password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        required
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-400">
                        New password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        required
                        minLength={8}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      required
                      minLength={8}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Updating…" : "Save password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Danger Zone */}
          {showDangerZone && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-semibold text-red-300">Danger zone</h3>
              </div>

              <p className="mb-4 text-sm text-slate-400">
                These actions are irreversible. Please review them before proceeding.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleDangerAction("delete-data")}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete all data
                </button>
                <button
                  onClick={() => handleDangerAction("reset-analytics")}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset analytics
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowDangerZone((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  {showDangerZone ? "Hide" : "Show"} danger zone
                </span>
              </button>
              <button
                onClick={() => router.push("/admin/analytics")}
                className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-400" />
                  View analytics
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}