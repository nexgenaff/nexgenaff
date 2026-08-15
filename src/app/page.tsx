"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  ArrowRight,
  Users,
  Target,
  Globe2,
  Sparkles,
  Check,
  Shield,
  Twitter,
  Linkedin,
  Github,
  MessageCircle,
  Award,
  TrendingUp,
  Clock,
  Headphones,
  LayoutDashboard,
  LineChart,
  LifeBuoy,
  Briefcase,
  Gift,
  CreditCard,
  Ticket,
  Layers,
  Eye,
  Menu,
  X,
} from "lucide-react";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Afficixo",
    url: "https://www.weebly.pro",
    logo: "https://www.weebly.pro/AFFICIXO.png",
    description:
      "Afficixo is a modern pay-per-click affiliate marketplace built for publishers who want to monetize traffic through CPC offers.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Afficixo",
    url: "https://www.weebly.pro",
  },
];

// ========== ANIMATIONS ==========

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ========== UI HELPERS ==========

const GradientText = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ${className}`}
  >
    {children}
  </span>
);

const GlassCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="text-center mb-10 md:mb-16"
  >
    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-white break-words">
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-light px-4 break-words">
        {subtitle}
      </p>
    )}
  </motion.div>
);

// ========== HEADER ==========

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/offers", label: "Offers" },
    { href: "/publishers", label: "Publishers" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#05070b]/90"
    >
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-white shrink-0"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="relative h-16 w-16 md:h-28 md:w-28 rounded-lg overflow-hidden">
            <Image
              src="/afficixo.png"
              alt="Afficixo logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-slate-300 whitespace-nowrap">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="hidden sm:block text-sm text-slate-300 hover:text-white transition-colors whitespace-nowrap"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-xs md:text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 whitespace-nowrap"
          >
            Join Now
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-[#05070b]/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-slate-300 hover:text-white transition-colors py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block text-sm text-slate-300 hover:text-white transition-colors py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

// ========== MAIN PAGE ==========

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ─── PARTICLE NETWORK ANIMATION ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    let can_w: number, can_h: number;
    const BALL_NUM = window.innerWidth < 768 ? 20 : 35;
    const R = 2.5;
    const dis_limit = 280;
    const link_line_width = 1.0;
    const alpha_f = 0.025;

    const ball_color = { r: 0, g: 255, b: 100 };
    const line_color = { r: 255, g: 255, b: 255 };

    let balls: any[] = [];
    let animationId: number;
    let isVisible = true;

    function randomNumFrom(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function randomSidePos(length: number) {
      return Math.ceil(Math.random() * length);
    }

    function randomArrayItem(arr: any[]) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomSpeed(pos: string) {
      const min = -0.8,
        max = 0.8;
      switch (pos) {
        case "top":
          return [randomNumFrom(min, max), randomNumFrom(0.2, max)];
        case "right":
          return [randomNumFrom(min, -0.2), randomNumFrom(min, max)];
        case "bottom":
          return [randomNumFrom(min, max), randomNumFrom(min, -0.2)];
        case "left":
          return [randomNumFrom(0.2, max), randomNumFrom(min, max)];
        default:
          return [0, 0];
      }
    }

    function getRandomBall() {
      const pos = randomArrayItem(["top", "right", "bottom", "left"]);
      switch (pos) {
        case "top":
          return {
            x: randomSidePos(can_w),
            y: -R,
            vx: getRandomSpeed("top")[0],
            vy: getRandomSpeed("top")[1],
            r: R,
            alpha: 1,
            phase: randomNumFrom(0, 10),
            glow: randomNumFrom(0.5, 1),
          };
        case "right":
          return {
            x: can_w + R,
            y: randomSidePos(can_h),
            vx: getRandomSpeed("right")[0],
            vy: getRandomSpeed("right")[1],
            r: R,
            alpha: 1,
            phase: randomNumFrom(0, 10),
            glow: randomNumFrom(0.5, 1),
          };
        case "bottom":
          return {
            x: randomSidePos(can_w),
            y: can_h + R,
            vx: getRandomSpeed("bottom")[0],
            vy: getRandomSpeed("bottom")[1],
            r: R,
            alpha: 1,
            phase: randomNumFrom(0, 10),
            glow: randomNumFrom(0.5, 1),
          };
        case "left":
          return {
            x: -R,
            y: randomSidePos(can_h),
            vx: getRandomSpeed("left")[0],
            vy: getRandomSpeed("left")[1],
            r: R,
            alpha: 1,
            phase: randomNumFrom(0, 10),
            glow: randomNumFrom(0.5, 1),
          };
      }
    }

    function initCanvas() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.setAttribute("width", (window.innerWidth * dpr).toString());
      canvas.setAttribute("height", (window.innerHeight * dpr).toString());
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      can_w = parseInt(canvas.getAttribute("width")!);
      can_h = parseInt(canvas.getAttribute("height")!);
      ctx.scale(dpr, dpr);
    }

    function initBalls(num: number) {
      for (let i = 1; i <= num; i++) {
        balls.push({
          x: randomSidePos(can_w),
          y: randomSidePos(can_h),
          vx: getRandomSpeed("top")[0],
          vy: getRandomSpeed("top")[1],
          r: R,
          alpha: 1,
          phase: randomNumFrom(0, 10),
          glow: randomNumFrom(0.5, 1),
        });
      }
    }

    function getDisOf(b1: any, b2: any) {
      const dx = Math.abs(b1.x - b2.x),
        dy = Math.abs(b1.y - b2.y);
      return Math.sqrt(dx * dx + dy * dy);
    }

    function renderBalls() {
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, R * 4);
        gradient.addColorStop(
          0,
          `rgba(${ball_color.r},${ball_color.g},${ball_color.b},${b.alpha})`
        );
        gradient.addColorStop(
          1,
          `rgba(${ball_color.r},${ball_color.g},${ball_color.b},0)`
        );

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(b.x, b.y, R * 4, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = `rgba(${ball_color.r},${ball_color.g},${ball_color.b},${b.alpha})`;
        ctx.shadowColor = `rgba(${ball_color.r},${ball_color.g},${ball_color.b},${b.alpha * 0.5})`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, R, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function renderLines() {
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const fraction = getDisOf(balls[i], balls[j]) / dis_limit;
          if (fraction < 1) {
            const alpha = (1 - fraction) * 0.6;
            ctx.strokeStyle = `rgba(${line_color.r},${line_color.g},${line_color.b},${alpha})`;
            ctx.lineWidth = link_line_width;
            ctx.shadowColor = `rgba(${line_color.r},${line_color.g},${line_color.b},${alpha * 0.3})`;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.moveTo(balls[i].x, balls[i].y);
            ctx.lineTo(balls[j].x, balls[j].y);
            ctx.stroke();
            ctx.closePath();
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    function updateBalls() {
      const new_balls = [];
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x > -50 && b.x < can_w + 50 && b.y > -50 && b.y < can_h + 50) {
          new_balls.push(b);
        }
        b.phase += alpha_f;
        b.alpha = Math.abs(Math.cos(b.phase));
      }
      balls = new_balls.slice(0);
    }

    function addBallIfy() {
      if (balls.length < BALL_NUM) {
        balls.push(getRandomBall());
      }
    }

    function render() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, can_w, can_h);
      renderLines();
      renderBalls();
      updateBalls();
      addBallIfy();
      animationId = window.requestAnimationFrame(render);
    }

    initCanvas();
    initBalls(BALL_NUM);
    render();

    const handleResize = () => {
      initCanvas();
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        render();
      } else {
        window.cancelAnimationFrame(animationId);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <PublicLayout>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />

      <main id="main-content" className="relative z-10 w-full max-w-full overflow-x-hidden">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* ===== HERO ===== */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:py-40 lg:py-48 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center w-full">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full min-w-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-8 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-400/30 backdrop-blur-md whitespace-nowrap"
              >
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400 shrink-0" />
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-slate-200">
                  #1 CPA Network
                </span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-3 md:mb-6 tracking-tight break-words">
                Pay Per Click
                <br />
                <GradientText className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl break-words">
                  Affiliate Marketplace
                </GradientText>
              </h1>

              <p className="text-sm md:text-xl text-slate-400 mb-3 max-w-2xl leading-relaxed font-light break-words">
                Promote Offers. Generate Valid Clicks. Get Paid.
              </p>

              <p className="text-sm md:text-xl text-slate-400 mb-6 md:mb-10 max-w-2xl leading-relaxed font-light break-words">
                Afficixo is a modern pay-per-click affiliate marketplace built
                for publishers who want to monetize their traffic through CPC
                offers. Discover campaigns, promote offers, track your clicks,
                analyze performance, and earn from valid traffic.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-start gap-3 mb-6 md:mb-12 w-full"
              >
                <Link
                  href="/signup"
                  className="group relative w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-semibold text-white text-sm md:text-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 md:gap-3 overflow-hidden min-w-[140px]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Now
                    <ArrowRight
                      className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform shrink-0"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  href="/offers"
                  className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-lg border-2 border-slate-400/30 text-white hover:bg-slate-400/10 hover:border-slate-300/60 transition-all duration-300 backdrop-blur-sm min-w-[140px] text-center"
                >
                  Browse Offers
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3 md:gap-6"
              >
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Shield
                    className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-xs md:text-sm text-slate-400 whitespace-nowrap">
                    Trusted Network
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Award
                    className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-xs md:text-sm text-slate-400 whitespace-nowrap">
                    Premium Offers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Clock
                    className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-xs md:text-sm text-slate-400 whitespace-nowrap">
                    Weekly Payouts
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right – Stats Card */}
            <motion.div
              variants={scaleInVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
              className="relative mt-4 lg:mt-0 w-full"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-3xl rounded-3xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              <GlassCard className="relative p-5 md:p-10 border-slate-400/20 shadow-2xl shadow-slate-950/40 w-full">
                <div className="grid grid-cols-3 gap-3 md:gap-6 text-center">
                  <div>
                    <p className="text-2xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent break-words">
                      21K+
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1 break-words">
                      Affiliates
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent break-words">
                      10+
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1 break-words">
                      Countries
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl md:text-4xl font-black bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent break-words">
                      1K+
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1 break-words">
                      Offers
                    </p>
                  </div>
                </div>

                <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-white/10">
                  <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 md:mb-4 break-words">
                    Top Countries for Leads
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {[
                      {
                        country: "Canada",
                        offer: "Health & Fitness",
                        badge: "High Conversion",
                      },
                      { country: "Germany", offer: "Survey, Finance", badge: "Top" },
                      { country: "New Zealand", offer: "Finance", badge: "Trending" },
                      { country: "United Kingdom", offer: "Rewards", badge: "Top" },
                      {
                        country: "USA",
                        offer: "Jobs, Credit Score",
                        badge: "High Conversion",
                      },
                      { country: "Australia", offer: "Rewards, Sweeps", badge: "Trending" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-white/5 p-2 md:p-3 border border-white/5 hover:border-indigo-400/20 transition-colors overflow-hidden"
                      >
                        <p className="font-semibold text-xs md:text-sm break-words">
                          {item.country}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 break-words">
                          {item.offer}
                        </p>
                        <span className="inline-block mt-1 text-[8px] md:text-[10px] font-medium text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full break-words">
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* ===== WHY WORK WITH US ===== */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 w-full">
          <SectionHeading
            title="Why Choose Afficixo?"
            subtitle="Afficixo is built for publishers and traffic partners who want a simple, transparent way to monetize clicks and scale their CPC affiliate earnings."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 w-full">
            {/* For Publishers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-indigo-400/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-5 md:p-8 hover:border-indigo-400/30 transition-all duration-300 hover:-translate-y-1 w-full"
            >
              <div className="flex items-center gap-3 mb-3 md:mb-6">
                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shrink-0">
                  <Users
                    className="w-5 h-5 md:w-6 md:h-6 text-indigo-300 shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg md:text-2xl font-bold break-words">Find CPC Offers</h3>
              </div>
              <p className="text-slate-400 text-sm md:text-base mb-4 md:mb-6 break-words">
                Browse available affiliate campaigns and choose offers that match
                your audience and traffic sources.
              </p>
              <ul className="space-y-2 md:space-y-3">
                {[
                  {
                    icon: TrendingUp,
                    text: "Relevant CPC campaigns tailored to your traffic.",
                  },
                  {
                    icon: Headphones,
                    text: "Campaigns matched to publisher audiences.",
                  },
                  {
                    icon: Eye,
                    text: "High-quality offer selection with transparent details.",
                  },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 md:gap-3 text-sm md:text-base text-slate-300"
                  >
                    <item.icon
                      className="w-4 h-4 md:w-5 md:h-5 text-indigo-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="break-words">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Advertisers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-purple-400/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-5 md:p-8 hover:border-purple-400/30 transition-all duration-300 hover:-translate-y-1 w-full"
            >
              <div className="flex items-center gap-3 mb-3 md:mb-6">
                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 shrink-0">
                  <Target
                    className="w-5 h-5 md:w-6 md:h-6 text-purple-300 shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg md:text-2xl font-bold break-words">Promote Your Offers</h3>
              </div>
              <p className="text-slate-400 text-sm md:text-base mb-4 md:mb-6 break-words">
                Create affiliate links and promote selected campaigns through your
                approved traffic sources.
              </p>
              <ul className="space-y-2 md:space-y-3">
                {[
                  {
                    icon: Globe2,
                    text: "Build shareable links for every campaign.",
                  },
                  {
                    icon: LayoutDashboard,
                    text: "Use approved traffic sources with confidence.",
                  },
                  {
                    icon: LifeBuoy,
                    text: "Access assets and optimization support as you promote.",
                  },
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 md:gap-3 text-sm md:text-base text-slate-300"
                  >
                    <item.icon
                      className="w-4 h-4 md:w-5 md:h-5 text-purple-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="break-words">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 w-full">
          <SectionHeading
            title="Built for Publishers"
            subtitle="Afficixo provides publishers with the tools they need to manage campaigns, monitor performance, and grow their traffic monetization."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 w-full">
            {[
              {
                title: "Track Your Clicks",
                description:
                  "Monitor clicks and campaign performance with detailed tracking and analytics.",
                icon: LineChart,
              },
              {
                title: "Earn From Valid Traffic",
                description:
                  "Generate quality traffic and earn according to the applicable CPC rate and campaign requirements.",
                icon: Sparkles,
              },
              {
                title: "Built for Publishers",
                description:
                  "Manage offers, links, clicks, and earnings from one place and grow your traffic monetization.",
                icon: LayoutDashboard,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8 hover:border-white/20 transition-colors w-full"
              >
                <div className="inline-flex items-center justify-center mb-3 h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-indigo-500/10 text-indigo-300 shrink-0">
                  <item.icon className="w-5 h-5 md:w-6 md:h-6 shrink-0" aria-hidden="true" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3 break-words">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed break-words">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== POPULAR VERTICALS ===== */}
        <section id="verticals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 w-full">
          <SectionHeading
            title="Popular Verticals"
            subtitle="These are the hottest niches in our network right now – proven offers that convert across multiple traffic sources."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full"
          >
            {[
              {
                icon: Briefcase,
                title: "Jobs",
                description:
                  "High‑converting job offers – from recruitment platforms to gig economy sign‑ups. Perfect for audiences hungry for work.",
                features: ["High‑paying campaigns", "Broad audience appeal", "Easy conversion path"],
                color: "from-blue-500/20 to-cyan-500/20",
                iconColor: "text-blue-400",
              },
              {
                icon: Gift,
                title: "Rewards",
                description:
                  "Cashback, loyalty points, and gift cards that drive engagement and retention. People love free stuff.",
                features: ["Cashback & gift cards", "High engagement", "Variety of reward types"],
                color: "from-amber-500/20 to-orange-500/20",
                iconColor: "text-amber-400",
              },
              {
                icon: CreditCard,
                title: "Credit Score",
                description:
                  "Free credit score checks that give users real value. Huge demand among personal‑finance audiences.",
                features: ["Free credit checks", "High EPC", "Finance‑focused traffic"],
                color: "from-emerald-500/20 to-green-500/20",
                iconColor: "text-emerald-400",
              },
              {
                icon: Ticket,
                title: "Sweepstakes",
                description:
                  "Giveaways, gadgets, and cash prizes – these lead‑gen powerhouses convert like crazy and keep users excited.",
                features: ["High‑converting giveaways", "Top lead‑gen potential", "Exciting prizes"],
                color: "from-pink-500/20 to-rose-500/20",
                iconColor: "text-pink-400",
              },
            ].map((vertical, idx) => (
              <motion.div key={idx} custom={idx} variants={fadeUpVariants} className="w-full">
                <div
                  className={`group relative h-full rounded-xl border border-white/10 bg-gradient-to-br ${vertical.color} backdrop-blur-lg p-4 md:p-6 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden w-full`}
                >
                  <div className="relative">
                    <div
                      className={`inline-flex p-2 md:p-3 rounded-xl bg-gradient-to-br ${vertical.color} mb-3 md:mb-4 shrink-0`}
                    >
                      <vertical.icon
                        className={`w-5 h-5 md:w-6 md:h-6 ${vertical.iconColor} shrink-0`}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-white break-words">
                      {vertical.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 mb-3 md:mb-4 leading-relaxed break-words">
                      {vertical.description}
                    </p>
                    <ul className="space-y-1 md:space-y-2">
                      {vertical.features.map((feature, fi) => (
                        <li
                          key={fi}
                          className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-slate-300"
                        >
                          <Check className="w-3 h-3 text-indigo-400 shrink-0" aria-hidden="true" />
                          <span className="break-words">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== SERVICES ===== */}
        <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 w-full">
          <SectionHeading
            title="Services That Move the Needle"
            subtitle="We've built a suite of tools and support systems designed to help you scale faster and smarter – no fluff, just what works."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full"
          >
            {[
              {
                icon: Layers,
                title: "Offer Management",
                description:
                  "Get access to curated, high‑converting offers across multiple verticals.",
                features: [
                  "Exclusive offers updated regularly",
                  "Tailored recommendations for your traffic",
                  "High‑payout campaigns",
                ],
              },
              {
                icon: LineChart,
                title: "Advanced Tracking",
                description:
                  "Real‑time analytics that tell you exactly what's working.",
                features: [
                  "Live data dashboards",
                  "Comprehensive conversion reports",
                  "Granular traffic insights",
                ],
              },
              {
                icon: Headphones,
                title: "Affiliate Support",
                description:
                  "A support team that actually knows what they're talking about.",
                features: [
                  "Dedicated account managers",
                  "Expert guidance to scale campaigns",
                  "Fast response times",
                ],
              },
            ].map((service, idx) => (
              <motion.div key={idx} custom={idx} variants={fadeUpVariants} className="w-full">
                <GlassCard className="p-5 md:p-8 h-full hover:border-indigo-400/30 transition-all duration-300 hover:-translate-y-1 w-full">
                  <div className="inline-flex p-2 md:p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-3 md:mb-4 shrink-0">
                    <service.icon
                      className="w-5 h-5 md:w-6 md:h-6 text-indigo-300 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-white break-words">
                    {service.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-400 mb-3 md:mb-4 break-words">
                    {service.description}
                  </p>
                  <ul className="space-y-1.5 md:space-y-2">
                    {service.features.map((feature, fi) => (
                      <li
                        key={fi}
                        className="flex items-center gap-2 text-sm md:text-base text-slate-300"
                      >
                        <Check className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
                        <span className="break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-32 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 backdrop-blur-xl p-6 md:p-20 text-center overflow-hidden w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/10 to-pink-500/0 rounded-2xl" />
            <div className="relative space-y-5 md:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-6xl font-black mb-3 md:mb-4 leading-tight tracking-tight break-words">
                  Ready to Level Up?
                  <br />
                  <GradientText className="text-2xl sm:text-3xl md:text-6xl break-words">
                    Join Afficixo Today
                  </GradientText>
                </h2>
                <p className="text-sm md:text-xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto px-2 break-words">
                  Get access to exclusive offers, reliable weekly payouts, and a
                  support team that actually cares about your success.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-slate-300">
                <span className="flex items-center gap-1.5 md:gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">Weekly payouts</span>
                </span>
                <span className="flex items-center gap-1.5 md:gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">Exclusive offers</span>
                </span>
                <span className="flex items-center gap-1.5 md:gap-2">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">Dedicated support</span>
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 md:pt-4 w-full">
                <Link
                  href="/signup"
                  className="group relative w-full sm:w-auto px-6 md:px-10 py-3 md:py-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-bold text-white text-sm md:text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 md:gap-3 overflow-hidden min-w-[160px]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Now
                    <ArrowRight
                      className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform shrink-0"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  href="/offers"
                  className="w-full sm:w-auto px-6 md:px-10 py-3 md:py-4 rounded-lg font-bold text-sm md:text-lg border-2 border-slate-400/30 text-white hover:bg-slate-400/10 hover:border-slate-300/60 transition-all duration-300 backdrop-blur-sm min-w-[160px] text-center"
                >
                  Browse Offers
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 w-full">
          <SectionHeading title="Frequently Asked Questions" />

          <div className="space-y-3 md:space-y-4 w-full">
            {[
              {
                q: "What is Afficixo?",
                a: "Afficixo is a pay-per-click affiliate marketplace for publishers and traffic partners who want to earn from valid clicks using CPC offers.",
              },
              {
                q: "How does the Afficixo CPC marketplace work?",
                a: "Publishers discover CPC offers, generate tracking links, promote campaigns, and earn when valid traffic converts according to offer rules.",
              },
              {
                q: "How do publishers earn with Afficixo?",
                a: "Publishers earn money from valid clicks delivered to CPC affiliate offers. The more quality traffic you send, the more you can earn.",
              },
              {
                q: "What are CPC affiliate offers?",
                a: "CPC affiliate offers pay publishers for each valid click or visit that meets the campaign's traffic and quality requirements.",
              },
              {
                q: "How are clicks tracked?",
                a: "Clicks are tracked with secure affiliate links and reporting tools that record visitor activity, traffic sources, and campaign performance in real time.",
              },
              {
                q: "What is considered a valid click?",
                a: "A valid click is traffic that meets the offer's rules, including approved sources, geo requirements, and anti-fraud checks.",
              },
              {
                q: "How do I create an affiliate link?",
                a: "Once you are approved, create tracking links from the dashboard, then promote those links across your website, social media, and other approved channels.",
              },
              {
                q: "How can I promote Afficixo offers?",
                a: "Promote offers using your approved traffic sources such as websites, social media, email, and display placements while following campaign guidelines.",
              },
              {
                q: "How can I check my click statistics?",
                a: "Your dashboard shows detailed analytics for clicks, earnings, campaign performance, and traffic quality so you can optimize in real time.",
              },
              {
                q: "When are publisher payments processed?",
                a: "Payments are processed based on your account terms and performance schedule, with updates visible in your earnings dashboard.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                viewport={{ once: true }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 hover:border-indigo-400/20 transition-colors w-full"
              >
                <h3 className="text-sm md:text-lg font-semibold text-white mb-1.5 md:mb-2 break-words">
                  {item.q}
                </h3>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed break-words">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </PublicLayout>
  );
}