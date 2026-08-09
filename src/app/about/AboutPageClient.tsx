"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Target,
  Globe2,
  TrendingUp,
  Users,
  LineChart,
  Shield,
  Zap,
  Layers,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
  Rocket,
  BarChart3,
  HeartHandshake,
  Smartphone,
  DollarSign,
} from "lucide-react";

// ========== ANIMATIONS ==========

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

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
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl ${
      hover ? "hover:border-white/20 transition-all duration-300 hover:-translate-y-1" : ""
    } ${className}`}
  >
    {children}
  </div>
);

const SectionHeading = ({
  title,
  subtitle,
  centered = true,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className={`${centered ? "text-center" : ""} mb-10 md:mb-16`}
  >
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-white">
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
        {subtitle}
      </p>
    )}
  </motion.div>
);

// ========== MAIN CLIENT COMPONENT ==========

export default function AboutClient() {
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
    <div className="relative min-h-screen w-full bg-[#05070b] text-white overflow-x-hidden">
      {/* ─── CANVAS BACKGROUND ─── */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />

      {/* Background overlays */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/90 via-[#0d1724]/70 to-[#101827]/95" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-gradient-radial from-indigo-900/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-gradient-radial from-purple-700/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-gradient-radial from-pink-900/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <main className="relative z-10">
        {/* ===== HERO SECTION ===== */}
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16 md:pt-40 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 border border-indigo-400/30 backdrop-blur-md"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-slate-200">
                About Afficixo
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              Building the Future of
              <br />
              <GradientText className="text-4xl sm:text-5xl md:text-7xl">
                CPC Affiliate Marketing
              </GradientText>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
              Afficixo is a modern pay-per-click affiliate marketplace built for
              publishers who want to discover high-quality offers, monetize their
              traffic, track performance, and grow their affiliate business.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Publisher-First Platform</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Transparent Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Reliable Payouts</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===== MISSION & VALUES ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 md:p-12 h-full">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4">
                  <Target className="w-6 h-6 text-indigo-300" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  To simplify traffic monetization for publishers by providing a
                  transparent, user-friendly platform that connects them with
                  high-quality CPC offers and gives them the tools to succeed.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  We believe that every publisher deserves access to premium
                  offers, actionable analytics, and reliable payouts — regardless
                  of their size or experience level.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 md:p-12 h-full">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Values</h2>
                <ul className="space-y-3">
                  {[
                    { icon: Shield, text: "Transparency in everything we do" },
                    { icon: HeartHandshake, text: "Publisher-first approach" },
                    { icon: TrendingUp, text: "Continuous innovation and improvement" },
                    { icon: Users, text: "Building lasting partnerships" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* ===== WHAT WE OFFER ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <SectionHeading
            title="What We Offer"
            subtitle="Everything you need to monetize your traffic and grow your affiliate business"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Layers,
                title: "Curated CPC Offers",
                description:
                  "Access hand-picked campaigns across multiple verticals. Each offer is vetted for quality and conversion potential.",
                features: ["Exclusive campaigns", "Regular updates", "Performance tracking"],
                gradient: "from-indigo-500/20 to-purple-500/20",
                iconColor: "text-indigo-300",
              },
              {
                icon: LineChart,
                title: "Advanced Analytics",
                description:
                  "Real-time tracking and reporting that give you full visibility into your traffic, clicks, and earnings.",
                features: ["Live dashboards", "Conversion insights", "Traffic source analysis"],
                gradient: "from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-300",
              },
              {
                icon: Rocket,
                title: "Growth Tools",
                description:
                  "Everything you need to scale your affiliate business, from link generation to optimization recommendations.",
                features: ["Smart link builder", "A/B testing", "Performance alerts"],
                gradient: "from-pink-500/20 to-rose-500/20",
                iconColor: "text-pink-300",
              },
            ].map((item, idx) => (
              <motion.div key={idx} custom={idx} variants={fadeUpVariants}>
                <GlassCard className="p-6 md:p-8 h-full">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} mb-4`}
                  >
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm md:text-base mb-4">
                    {item.description}
                  </p>
                  <ul className="space-y-2">
                    {item.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== STATS ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8 md:p-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: Users, value: "21K+", label: "Active Publishers" },
                { icon: Globe2, value: "10+", label: "Countries" },
                { icon: TrendingUp, value: "1K+", label: "Live Offers" },
                { icon: DollarSign, value: "$2M+", label: "Paid Out" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex p-3 rounded-xl bg-white/5 mb-3">
                    <stat.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-2xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <SectionHeading
            title="How It Works"
            subtitle="Get started in three simple steps and start monetizing your traffic"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Smartphone,
                step: "01",
                title: "Sign Up",
                description:
                  "Create your publisher account in minutes. No complex paperwork or lengthy approval process.",
              },
              {
                icon: Target,
                step: "02",
                title: "Choose Offers",
                description:
                  "Browse our curated selection of CPC offers and find the perfect campaigns for your audience.",
              },
              {
                icon: BarChart3,
                step: "03",
                title: "Earn & Grow",
                description:
                  "Promote offers, track your performance, and watch your earnings grow with real-time analytics.",
              },
            ].map((step, idx) => (
              <motion.div key={idx} custom={idx} variants={fadeUpVariants}>
                <div className="relative text-center p-6 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl border border-white/5" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {step.step}
                      </span>
                    </div>
                    <div className="inline-flex p-3 rounded-xl bg-white/5 mb-4">
                      <step.icon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== WHY CHOOSE US ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <SectionHeading
            title="Why Publishers Choose Afficixo"
            subtitle="Built for publishers, by publishers — here's what sets us apart"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              {
                icon: Shield,
                title: "Transparent",
                description: "Clear pricing, real-time data, and no hidden fees.",
              },
              {
                icon: Zap,
                title: "Fast Payouts",
                description: "Weekly payments with multiple withdrawal options.",
              },
              {
                icon: Award,
                title: "Premium Offers",
                description: "Exclusive campaigns with competitive CPC rates.",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                description: "Dedicated support team ready to help you succeed.",
              },
            ].map((item, idx) => (
              <motion.div key={idx} custom={idx} variants={fadeUpVariants}>
                <GlassCard className="p-6 text-center h-full">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4">
                    <item.icon className="w-6 h-6 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ===== CTA ===== */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 backdrop-blur-xl p-8 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/10 to-pink-500/0" />
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
                Ready to Start Monetizing?
                <br />
                <GradientText className="text-3xl sm:text-4xl md:text-5xl">
                  Join Afficixo Today
                </GradientText>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Create your account in minutes and start earning with premium CPC
                offers, advanced analytics, and dedicated support.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-bold text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  Join Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/offers"
                  className="px-8 py-4 rounded-lg font-bold border-2 border-slate-400/30 text-white hover:bg-slate-400/10 hover:border-slate-300/60 transition-all duration-300"
                >
                  Browse Offers
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}