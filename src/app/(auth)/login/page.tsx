"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  ArrowLeft,
  AlertCircle,
  Rocket,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-[#05070b] text-white overflow-hidden">
      {/* ===== Animated Background ===== */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#0d1724] to-[#101827]" />

        {/* Animated radial glows */}
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-radial from-indigo-900/30 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 20, 0],
            opacity: [0.6, 1, 0.6, 0.6],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-radial from-purple-700/20 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 30, -20, 0],
            opacity: [0.4, 0.8, 0.4, 0.4],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-gradient-radial from-pink-900/15 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, 40, -60, 0],
            y: [0, -20, 30, 0],
            opacity: [0.3, 0.7, 0.3, 0.3],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        {/* Grid pattern with subtle pulse */}
        <motion.div
          className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:60px_60px]"
          animate={{ opacity: [0.02, 0.04, 0.02] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* ===== Back to home (top left) ===== */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all hover:gap-3 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </motion.div>

        {/* ===== Login Card ===== */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow duration-500"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Logo & Brand */}
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <motion.div
                className="flex items-center gap-2 font-bold text-2xl text-white"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -5, 0],
                    scale: [1, 1.1, 0.95, 1],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Nexgen
                </span>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="mt-4 text-xl font-semibold text-white"
              >
                Sign in to your account
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-1 text-sm text-slate-400"
              >
                Use your credentials to continue.
              </motion.p>
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 backdrop-blur"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="leading-6">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-white placeholder-slate-500 backdrop-blur-sm focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all duration-300 hover:border-white/20"
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-white placeholder-slate-500 backdrop-blur-sm focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all duration-300 hover:border-white/20"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.span
                        className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Sign in
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.form>

            {/* Support link */}
            <motion.div
              variants={itemVariants}
              className="border-t border-white/10 pt-5 text-center text-sm text-slate-400"
            >
              Need access?{" "}
              <a
                href="https://t.me/affiliate_king_rafsan"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-300 hover:text-indigo-200 transition-colors hover:underline underline-offset-2"
              >
                Contact the team
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ===== Footer ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-md mt-6 text-center text-xs text-slate-500 border-t border-white/5 pt-4"
        >
          <span>© 2026 Nexgen Affiliates. All rights reserved.</span>
        </motion.div>
      </div>
    </div>
  );
}