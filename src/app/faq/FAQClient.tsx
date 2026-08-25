"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  HelpCircle,
  Shield,
  TrendingUp,
  Globe2,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQClientProps {
  faqData: any;
}

// ========== ANIMATIONS ==========

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.05,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

export default function FAQClient({ faqData }: FAQClientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  // FAQ items with categories
  const faqItems: (FAQItem & { category: string })[] = [
    {
      q: "What is Afficixo?",
      a: "Afficixo is a pay-per-click affiliate marketplace for publishers and traffic partners who want to earn from valid clicks using CPC offers.",
      category: "general",
    },
    {
      q: "How does the Afficixo CPC marketplace work?",
      a: "Publishers discover CPC offers, generate tracking links, promote campaigns, and earn when valid traffic converts according to offer rules.",
      category: "general",
    },
    {
      q: "How do publishers earn with Afficixo?",
      a: "Publishers earn money from valid clicks delivered to CPC affiliate offers. The more quality traffic you send, the more you can earn.",
      category: "earnings",
    },
    {
      q: "What are CPC affiliate offers?",
      a: "CPC affiliate offers pay publishers for each valid click or visit that meets the campaign's traffic and quality requirements.",
      category: "offers",
    },
    {
      q: "How are clicks tracked?",
      a: "Clicks are tracked with secure affiliate links and reporting tools that record visitor activity, traffic sources, and campaign performance in real time.",
      category: "tracking",
    },
    {
      q: "What is considered a valid click?",
      a: "A valid click is traffic that meets the offer's rules, including approved sources, geo requirements, and anti-fraud checks.",
      category: "tracking",
    },
    {
      q: "How do I create an affiliate link?",
      a: "Once approved, create tracking links from the dashboard, then promote those links across your website, social media, and other approved channels.",
      category: "getting-started",
    },
    {
      q: "How can I promote Afficixo offers?",
      a: "Promote offers using your approved traffic sources such as websites, social media, email, and display placements while following campaign guidelines.",
      category: "getting-started",
    },
    {
      q: "How can I check my click statistics?",
      a: "Your dashboard shows detailed analytics for clicks, earnings, campaign performance, and traffic quality so you can optimize in real time.",
      category: "tracking",
    },
    {
      q: "When are publisher payments processed?",
      a: "Payments are processed based on your account terms and performance schedule, with updates visible in your earnings dashboard.",
      category: "earnings",
    },
  ];

  // Categories
  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "general", label: "General", icon: Globe2 },
    { id: "getting-started", label: "Getting Started", icon: Users },
    { id: "offers", label: "Offers", icon: TrendingUp },
    { id: "tracking", label: "Tracking", icon: Shield },
    { id: "earnings", label: "Earnings & Payments", icon: Clock },
  ];

  // Filter questions based on search and category
  const filteredItems = faqItems.filter((item) => {
    const matchesSearch = item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle accordion
  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // ─── PARTICLE NETWORK ANIMATION ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    let can_w: number, can_h: number;
    const BALL_NUM = window.innerWidth < 768 ? 16 : 28;
    const R = 2.5;
    const dis_limit = 280;
    const link_line_width = 1.0;
    const alpha_f = 0.025;

    const isLight = !document.documentElement.classList.contains("dark");
    const ball_color = isLight ? { r: 14, g: 165, b: 233 } : { r: 0, g: 255, b: 100 };
    const line_color = isLight ? { r: 99, g: 102, b: 241 } : { r: 255, g: 255, b: 255 };
    const line_opacity = isLight ? 0.18 : 0.38;

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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
            const alpha = (1 - fraction) * line_opacity;
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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
                Help Center
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              Frequently Asked
              <br />
              <GradientText className="text-4xl sm:text-5xl md:text-7xl">
                Questions
              </GradientText>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
              Find answers to common questions about Afficixo, CPC offers, publisher onboarding,
              tracking, and payments. Can't find what you're looking for? Contact our support team.
            </p>
          </motion.div>
        </section>

        {/* ===== SEARCH & CATEGORIES ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8"
          >
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400/50 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                    {isActive && (
                      <span className="text-xs bg-white/20 px-1.5 rounded-full">
                        {filteredItems.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ===== FAQ ITEMS ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
          />

          {filteredItems.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-3 md:space-y-4"
            >
              {filteredItems.map((item, idx) => {
                const globalIndex = faqItems.indexOf(item);
                const isOpen = openItems.includes(globalIndex);

                return (
                  <motion.div key={idx} custom={idx} variants={fadeUpVariants}>
                    <GlassCard
                      className={`p-4 md:p-6 hover:border-indigo-400/30 transition-all duration-300 ${
                        isOpen ? "border-indigo-400/30" : ""
                      }`}
                      hover={false}
                    >
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full text-left flex items-start justify-between gap-4"
                        aria-expanded={isOpen}
                      >
                        <h3 className="text-base md:text-lg font-semibold text-white">
                          {item.q}
                        </h3>
                        <div className="shrink-0 mt-1">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-indigo-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 md:pt-4">
                              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                                {item.a}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-slate-400">
                We couldn't find any questions matching "{searchTerm}". Try a different search term or browse our categories.
              </p>
            </motion.div>
          )}
        </section>

        {/* ===== STILL HAVE QUESTIONS? ===== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <SectionHeading
            title="Still Have Questions?"
            subtitle="Our support team is here to help you with any questions about Afficixo"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div custom={0} variants={fadeUpVariants}>
              <GlassCard className="p-6 md:p-8 text-center h-full hover:border-indigo-400/30">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4">
                  <MessageCircle className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Chat with our support team in real-time. Available during business hours.
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                  Start Chat
                </button>
              </GlassCard>
            </motion.div>

            <motion.div custom={1} variants={fadeUpVariants}>
              <GlassCard className="p-6 md:p-8 text-center h-full hover:border-indigo-400/30">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                  <Mail className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Support</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 inline-block"
                >
                  Contact Us
                </Link>
              </GlassCard>
            </motion.div>
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
                Ready to Get Started?
                <br />
                <GradientText className="text-3xl sm:text-4xl md:text-5xl">
                  Join Afficixo Today
                </GradientText>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Create your publisher account in minutes and start earning with premium CPC offers.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="group relative px-8 py-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg font-bold text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-lg font-bold border-2 border-slate-400/30 text-white hover:bg-slate-400/10 hover:border-slate-300/60 transition-all duration-300"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}