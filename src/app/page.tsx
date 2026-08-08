"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";
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
} from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Afficixo",
  url: "https://weebly.pro",
  logo: "https://weebly.pro/afficixo.png?v=2",
  description:
    "Afficixo helps affiliates and advertisers scale revenue with high-converting offers, advanced routing, fraud protection, and transparent analytics.",
};

// ========== ANIMATIONS ==========

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
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
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="text-center mb-12 md:mb-16"
  >
    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">{title}</h2>
    {subtitle && (
      <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-light px-4">
        {subtitle}
      </p>
    )}
  </motion.div>
);

// ========== HEADER ==========

const Header = () => (
  <motion.header
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#05070b]/80"
  >
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <Link href="/" className="flex items-center text-white">
        <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-lg overflow-hidden">
          <Image
            src="/afficixo.png"
            alt="Afficixo logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>
      <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-slate-300">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#verticals" className="hover:text-white transition-colors">Verticals</a>
        <a href="#services" className="hover:text-white transition-colors">Services</a>
        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
          Login
        </Link>
        <Link
          href="/signup"
          className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-xs md:text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
        >
          Join Now
        </Link>
      </div>
    </nav>
  </motion.header>
);

// ========== MAIN PAGE ==========

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ─── PARTICLE NETWORK ANIMATION ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    let can_w: number, can_h: number;
    const BALL_NUM = 35;
    const R = 2.5;
    const dis_limit = 280;
    const link_line_width = 1.0;
    const alpha_f = 0.025;

    // Dark theme colors
    const ball_color = { r: 0, g: 255, b: 100 };
    const line_color = { r: 255, g: 255, b: 255 };

    let balls: any[] = [];
    let animationId: number;

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
      canvas.setAttribute("width", window.innerWidth.toString());
      canvas.setAttribute("height", window.innerHeight.toString());
      can_w = parseInt(canvas.getAttribute("width")!);
      can_h = parseInt(canvas.getAttribute("height")!);
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

        // Glow effect for dark theme
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

        // Core dot
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
      ctx.clearRect(0, 0, can_w, can_h);
      renderLines();
      renderBalls();
      updateBalls();
      addBallIfy();
      animationId = window.requestAnimationFrame(render);
    }

    // ─── Initialize ───
    initCanvas();
    initBalls(BALL_NUM);
    render();

    // ─── Handle resize ───
    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener("resize", handleResize);

    // ─── Cleanup ───
    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#05070b] text-white overflow-x-hidden">
      {/* ─── CANVAS BACKGROUND ─── */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.8 }}
      />

      {/* Background overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/80 via-[#0d1724]/60 to-[#101827]/80" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-radial from-indigo-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-radial from-purple-700/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-gradient-radial from-pink-900/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <main id="main-content" className="relative z-10">
        <Header />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* ===== HERO ===== */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:py-40 lg:py-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="inline-flex items-center gap-2 md:gap-3 mb-6 md:mb-8 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-400/30 backdrop-blur-md"
              >
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400" />
                <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-slate-200">
                  #1 CPA Network
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-4 md:mb-6 tracking-tight">
                Where Top Affiliates
                <br />
                <GradientText className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
                  Meet Premium Offers
                </GradientText>
              </h1>

              <p className="text-base md:text-xl text-slate-400 mb-8 md:mb-10 max-w-2xl leading-relaxed font-light">
                Join Afficixo and unlock a world of high‑converting offers,
                seamless traffic monetization, and some of the best payouts in the
                industry – all on one dynamic platform built for growth.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
                className="flex flex-col sm:flex-row items-start gap-4 mb-8 md:mb-12"
              >
                <Link
                  href="/signup"
                  className="group relative w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-semibold text-white text-base md:text-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Now
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg border-2 border-slate-400/30 text-white hover:bg-slate-400/10 hover:border-slate-300/60 transition-all duration-300 backdrop-blur-sm">
                  Browse Offers
                </button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.35 }}
                className="flex flex-wrap items-center gap-4 md:gap-6"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" aria-hidden="true" />
                  <span className="text-xs md:text-sm text-slate-400">Trusted Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" aria-hidden="true" />
                  <span className="text-xs md:text-sm text-slate-400">Premium Offers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" aria-hidden="true" />
                  <span className="text-xs md:text-sm text-slate-400">Weekly Payouts</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right – Stats Card */}
            <motion.div
              variants={scaleInVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-3xl rounded-3xl"
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              <GlassCard className="relative p-6 md:p-10 border-slate-400/20 shadow-2xl shadow-slate-950/40">
                <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
                  <div>
                    <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      21K+
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1">Affiliates</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      10+
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1">Countries</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
                      1K+
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1">Offers</p>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
                  <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 md:mb-4">
                    Top Countries for Leads
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {[
                      { country: "Canada", offer: "Health & Fitness", badge: "High Conversion" },
                      { country: "Germany", offer: "Survey, Finance", badge: "Top" },
                      { country: "New Zealand", offer: "Finance", badge: "Trending" },
                      { country: "United Kingdom", offer: "Rewards", badge: "Top" },
                      { country: "USA", offer: "Jobs, Credit Score", badge: "High Conversion" },
                      { country: "Australia", offer: "Rewards, Sweeps", badge: "Trending" },
                    ].map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-white/5 p-2 md:p-3 border border-white/5 hover:border-indigo-400/20 transition-colors">
                        <p className="font-semibold text-xs md:text-sm">{item.country}</p>
                        <p className="text-[10px] md:text-xs text-slate-400">{item.offer}</p>
                        <span className="inline-block mt-1 text-[8px] md:text-[10px] font-medium text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
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
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <SectionHeading
            title="Why Partner With Us?"
            subtitle="At Afficixo, we connect publishers and advertisers for mutual growth. Our smart solutions are designed to help you scale revenue effortlessly – no fluff, just results."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* For Publishers */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-indigo-400/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 md:p-8 hover:border-indigo-400/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-indigo-300" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">For Publishers</h3>
              </div>
              <p className="text-slate-400 text-sm md:text-base mb-4 md:mb-6">
                Supercharge your earnings with exclusive, high‑converting offers.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: TrendingUp, text: "Competitive commissions that actually reward your effort." },
                  { icon: Headphones, text: "A real person in your corner to help you optimize." },
                  { icon: Eye, text: "See exactly what's working, down to the click." },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-300">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Advertisers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-purple-400/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6 md:p-8 hover:border-purple-400/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-300" aria-hidden="true" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">For Advertisers</h3>
              </div>
              <p className="text-slate-400 text-sm md:text-base mb-4 md:mb-6">
                Expand your reach through our curated network of top publishers.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Globe2, text: "Quality leads from sources you can trust." },
                  { icon: LayoutDashboard, text: "Tailor your strategy to hit your KPIs." },
                  { icon: LifeBuoy, text: "Expert support to maximize ROI." },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-300">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ===== POPULAR VERTICALS ===== */}
        <section id="verticals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <SectionHeading
            title="Popular Verticals"
            subtitle="These are the hottest niches in our network right now – proven offers that convert across multiple traffic sources."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
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
              <motion.div key={idx} custom={idx} variants={fadeUpVariants}>
                <div
                  className={`group relative h-full rounded-xl border border-white/10 bg-gradient-to-br ${vertical.color} backdrop-blur-lg p-5 md:p-6 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden`}
                >
                  <div className="relative">
                    <div
                      className={`inline-flex p-2 md:p-3 rounded-xl bg-gradient-to-br ${vertical.color} mb-3 md:mb-4`}
                    >
                      <vertical.icon className={`w-5 h-5 md:w-6 md:h-6 ${vertical.iconColor}`} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">{vertical.title}</h3>
                    <p className="text-xs md:text-sm text-slate-400 mb-3 md:mb-4 leading-relaxed">{vertical.description}</p>
                    <ul className="space-y-1.5 md:space-y-2">
                      {vertical.features.map((feature, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-[10px] md:text-xs text-slate-300">
                          <Check className="w-3 h-3 text-indigo-400" aria-hidden="true" />
                          <span>{feature}</span>
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
        <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <SectionHeading
            title="Services That Move the Needle"
            subtitle="We've built a suite of tools and support systems designed to help you scale faster and smarter – no fluff, just what works."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            {[
              {
                icon: Layers,
                title: "Offer Management",
                description: "Get access to curated, high‑converting offers across multiple verticals.",
                features: [
                  "Exclusive offers updated regularly",
                  "Tailored recommendations for your traffic",
                  "High‑payout campaigns",
                ],
              },
              {
                icon: LineChart,
                title: "Advanced Tracking",
                description: "Real‑time analytics that tell you exactly what's working.",
                features: [
                  "Live data dashboards",
                  "Comprehensive conversion reports",
                  "Granular traffic insights",
                ],
              },
              {
                icon: Headphones,
                title: "Affiliate Support",
                description: "A support team that actually knows what they're talking about.",
                features: [
                  "Dedicated account managers",
                  "Expert guidance to scale campaigns",
                  "Fast response times",
                ],
              },
            ].map((service, idx) => (
              <motion.div key={idx} custom={idx} variants={fadeUpVariants}>
                <GlassCard className="p-6 md:p-8 h-full hover:border-indigo-400/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="inline-flex p-2 md:p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-3 md:mb-4">
                    <service.icon className="w-5 h-5 md:w-6 md:h-6 text-indigo-300" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-white">{service.title}</h3>
                  <p className="text-sm md:text-base text-slate-400 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm md:text-base text-slate-300">
                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 backdrop-blur-xl p-8 md:p-20 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/10 to-pink-500/0 rounded-2xl" />
            <div className="relative space-y-6 md:space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 md:mb-4 leading-tight tracking-tight">
                  Ready to Level Up?
                  <br />
                  <GradientText className="text-3xl sm:text-4xl md:text-6xl">
                    Join Afficixo Today
                  </GradientText>
                </h2>
                <p className="text-base md:text-xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto px-2">
                  Get access to exclusive offers, reliable weekly payouts, and a support team that actually cares about your success.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
                  Weekly payouts
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
                  Exclusive offers
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
                  Dedicated support
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 md:pt-4">
                <Link
                  href="/signup"
                  className="group relative w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-bold text-white text-base md:text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 md:gap-3 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Now
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <button className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg border-2 border-slate-400/30 text-white hover:bg-slate-400/10 hover:border-slate-300/60 transition-all duration-300 backdrop-blur-sm">
                  Browse Offers
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <SectionHeading title="Frequently Asked Questions" />

          <div className="space-y-3 md:space-y-4">
            {[
              {
                q: "How do I sign up with Afficixo?",
                a: "It's quick and straightforward. Just fill out the affiliate registration form on our site, tell us a bit about your traffic sources, and our team will review your application. Once approved, you'll get immediate access to our entire catalog of high‑converting offers.",
              },
              {
                q: "What payment methods do you offer?",
                a: "We support multiple payout options to suit your preference: Wise, Wire Transfer, and Payoneer. Payments are processed on a Net‑30, Net‑15, or even weekly basis – it all depends on your performance and traffic quality.",
              },
              {
                q: "What verticals do you support?",
                a: "We've got a wide range of verticals: Jobs, Finance, Health & Beauty, E‑Commerce, Sweepstakes, Gaming, Rewards, Insurance, and more. We're constantly refreshing our offers to keep conversion rates high.",
              },
              {
                q: "What tracking and reporting tools do you provide?",
                a: "Our real‑time dashboard gives you full visibility into conversions, earnings, and traffic performance. You can dive into detailed reports to spot trends and optimize campaigns on the fly.",
              },
              {
                q: "Do you offer affiliate support?",
                a: "Absolutely. You'll have a dedicated affiliate manager to help with campaign setup, optimization, and any questions. We're available via email, Skype, or phone – we want you to succeed.",
              },
              {
                q: "What promotional materials do you provide?",
                a: "We supply banners, landing pages, and email templates to get you started. Plus, we share actionable insights on which traffic sources and strategies work best – whether you're into email, social, or SEO.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 hover:border-indigo-400/20 transition-colors"
              >
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-sm md:text-base text-slate-400 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-white/10 bg-white/[0.02] backdrop-blur py-8 md:py-12 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative h-9 w-9 md:h-10 md:w-10 rounded-lg overflow-hidden">
                  <Image
                    src="/afficixo.png"
                    alt="Afficixo logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400">
                <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                {[
                  { icon: Twitter, label: "X", href: "#" },
                  { icon: Linkedin, label: "LinkedIn", href: "#" },
                  { icon: Github, label: "GitHub", href: "#" },
                  { icon: MessageCircle, label: "Telegram", href: "#" },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="text-slate-400 hover:text-white hover:scale-110 transition-all duration-300"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}