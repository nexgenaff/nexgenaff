"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface AfficixoLoadingProps {
  className?: string;
  text?: string;
  compact?: boolean;
}

export default function AfficixoLoading({
  className = "",
  text = "Loading...",
  compact = false,
}: AfficixoLoadingProps) {
  return (
    <div
      className={`flex items-center justify-center ${compact ? "min-h-[260px]" : "min-h-screen"} bg-[var(--page-bg)] text-[var(--text-primary)] ${className}`}
    >
      <div className="flex scale-[0.7] flex-col items-center justify-center gap-7">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <Image
            src="/afficixo-logo.png"
            alt="Afficixo logo"
            width={150}
            height={44}
            sizes="150px"
            className="mx-auto object-contain"
            priority
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-300/20 blur-xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative h-1.5 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-200 dark:border-white/10 dark:bg-white/5">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-0"
              animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
              animate={{
                x: ["-120%", "220%"],
                width: ["20%", "45%", "20%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
            />
          </div>

          <motion.p
            className="text-[11px] text-slate-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {text}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
