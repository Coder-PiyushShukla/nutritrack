import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PieChart,
  Droplet,
  UtensilsCrossed,
  UserCheck,
  TrendingUp,
  Camera,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

// Lazy-load the 3D Hero Scene
const HeroBowl3DCanvas = lazy(() => import('../../components/canvas/HeroBowl3D'));

// Fallback while Three.js loads
function HeroFallback() {
  return (
    <div className="w-full h-full min-h-[560px] lg:min-h-[700px] flex flex-col items-center justify-center relative">
      <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full border-2 border-forest/10 bg-lime/10 flex items-center justify-center shadow-subtle animate-pulse">
        <div className="w-52 h-52 lg:w-64 lg:h-64 rounded-full border border-lime/30 bg-lime/5 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-forest text-lime flex items-center justify-center font-serif text-2xl font-bold">
            NT
          </div>
        </div>
      </div>
      <p className="mt-8 text-xs font-mono tracking-widest uppercase text-forest/40">
        Loading 3D Nourish Scene…
      </p>
    </div>
  );
}

// Animated Stat Counter
function AnimatedStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1800;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center md:text-left space-y-1">
      <div className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-forest tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-forest/70 text-sm font-medium tracking-wide">
        {label}
      </div>
    </div>
  );
}

// "Today's Table" Food Card
const TABLE_FOODS = [
  {
    label: 'BREAKFAST',
    name: 'Berry Overnight Oats',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'LUNCH',
    name: 'Grilled Chicken & Quinoa',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'DINNER',
    name: 'Lemon Salmon & Asparagus',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'SNACK',
    name: 'Greek Yogurt Crunch Bowl',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-ivory text-forest overflow-x-hidden selection:bg-lime selection:text-forest">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION — Lime-tinted background zone + Giant 3D      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 overflow-hidden">
        {/* Subtle lime-tinted background wash behind 3D side */}
        <div className="absolute top-0 right-0 w-[65%] h-full bg-gradient-to-l from-lime/15 via-lime/8 to-transparent pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
            {/* Left Column — Headline (narrower so the 3D gets more room) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 space-y-8 relative z-20"
            >
              {/* Pill Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime/20 border border-lime/30 text-xs font-semibold tracking-wider uppercase text-forest">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span>Nutrition, Art-Directed</span>
              </div>

              {/* Giant Display Headline */}
              <h1 className="font-serif font-bold leading-[0.98] tracking-tightest text-forest" style={{ fontSize: 'clamp(3rem, 6vw, 7rem)' }}>
                Eat well.
                <br />
                <span className="italic font-normal">Feel </span>the
                <br />
                <span className="italic font-normal text-forest">difference.</span>
              </h1>

              {/* Subcopy */}
              <p className="text-forest/75 text-base sm:text-lg font-normal leading-relaxed max-w-md">
                Track every meal, follow a plan built by real nutritionists,
                and watch your habits bloom.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to="/dashboard"
                  className="bg-forest text-ivory font-semibold text-base px-8 py-4 rounded-full hover:bg-forest-light shadow-subtle hover:shadow-lift transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center gap-2 group"
                >
                  <span>Start tracking</span>
                  <ArrowRight className="w-5 h-5 text-ivory group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="border border-forest/20 text-forest text-base font-semibold px-8 py-4 rounded-full hover:bg-forest/5 transition-all text-center"
                >
                  Explore recipes
                </a>
              </div>

              {/* Trust micro-badges */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-forest/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>Zero ultra-processed noise</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>Nutritionist-verified plans</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column — 3D Scene */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative flex items-center justify-center"
            >
              <Suspense fallback={<HeroFallback />}>
                <HeroBowl3DCanvas />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. STATS STRIP                                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-forest/10 bg-ivory-light/60 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <AnimatedStat value={12000} label="Mindful dieters tracking daily" suffix="+" />
            <AnimatedStat value={98} label="Average plan adherence rate" suffix="%" />
            <AnimatedStat value={5} label="Clinical nutritionist rating" suffix=".0" />
            <AnimatedStat value={50} label="Certified health practitioners" suffix="+" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. "TODAY'S TABLE" — Food Photography Gallery (Forest bg)      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-forest text-ivory py-24 relative overflow-hidden paper-grain-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Section Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 space-y-3"
          >
            <span className="text-xs font-mono tracking-widest uppercase text-lime">
              Curated Whole Foods
            </span>
            <h2
              className="font-serif font-bold tracking-tight text-ivory"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
            >
              Today's <span className="italic font-normal text-lime">table.</span>
            </h2>
          </motion.div>

          {/* 4-Column Food Cards with real photography */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TABLE_FOODS.map((food, i) => (
              <motion.div
                key={food.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-3xl aspect-[3/4] mb-4">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Gradient overlay at bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent" />
                  {/* Text inside the image at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-lime text-xs font-mono font-bold uppercase tracking-widest block mb-1">
                      {food.label}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory leading-tight">
                      {food.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Subtle CTA row */}
          <div className="mt-12 flex items-center justify-center">
            <Link
              to="/dashboard"
              className="bg-lime text-forest font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-lime-hover shadow-subtle hover:shadow-lift transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            >
              <span>Browse All Recipes</span>
              <ArrowRight className="w-4 h-4 text-forest" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. FEATURES SECTION (Ivory on Forest)                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-ivory py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          {/* Section Header */}
          <div className="max-w-2xl mb-20 space-y-4">
            <span className="text-xs font-mono tracking-widest uppercase text-forest/50">
              Holistic Capabilities
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest">
              Nourishment measured with clarity,{' '}
              <span className="italic font-normal text-forest/70">not obsession.</span>
            </h2>
            <p className="text-forest/70 text-base sm:text-lg leading-relaxed">
              Every feature in NutriTrack is tuned to cultivate an intuitive, healthy relationship
              with your meals, hydration, and long-term vitality.
            </p>
          </div>

          {/* 6 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: PieChart, title: 'Concentric Macro Rings', desc: 'Smooth animated SVG stroke rings tracking Calories, Protein, Carbohydrates, and Healthy Fats in real-time as you log your day.', metaL: 'Real-time calculations', metaR: '100% Precision' },
              { icon: Droplet, title: 'Mindful Water Tracker', desc: 'An 8-glass visual hydration cadence. Tap to fill or empty with gentle fluid transitions to stay hydrated throughout your workday.', metaL: 'Interactive glass grid', metaR: '2.0L Daily Target' },
              { icon: UtensilsCrossed, title: 'Whole Food Journal', desc: 'Categorized meal logging for Breakfast, Lunch, Dinner, and Snacks. Search our curated whole foods library with instant portion scaling.', metaL: 'Search & custom entries', metaR: 'Instant Logging' },
              { icon: UserCheck, title: 'Nutritionist Suite', desc: 'A dedicated portal for health professionals to manage client rosters, monitor weekly adherence, and prescribe bespoke meal frameworks.', metaL: 'Clinical client drawer', metaR: 'Pro Portal' },
              { icon: TrendingUp, title: 'Vitality & Weight Trends', desc: 'Clean editorial charts visualizing weekly calorie intake against your maintenance baseline, alongside weight trend tracking.', metaL: 'Editorial bar analytics', metaR: '7-Day Trajectory' },
              { icon: ShieldCheck, title: 'Admin Platform Governance', desc: 'A centralized dashboard for platform oversight: manage user credentials, vet certified nutritionists, audit content, and review KPIs.', metaL: 'Multi-role access', metaR: 'Role Badging' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                whileHover={{ y: -6 }}
                className="bg-ivory border border-forest/12 rounded-3xl p-8 shadow-subtle hover:shadow-lift flex flex-col justify-between transition-shadow"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-forest text-lime flex items-center justify-center shadow-subtle">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-forest">
                    {feat.title}
                  </h3>
                  <p className="text-forest/75 text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-forest/10 flex items-center justify-between text-xs font-semibold text-forest/70">
                  <span>{feat.metaL}</span>
                  <span className="text-forest font-bold">{feat.metaR}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5. "HOW IT WORKS" — 3 Steps with oversized ghost numerals      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 max-w-7xl mx-auto px-6 md:px-12 border-t border-forest/10">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-mono tracking-widest uppercase text-forest/50">
            A Natural Rhythm
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-forest">
            Three steps to mindful sustenance
          </h2>
          <p className="text-forest/70 text-base">
            No convoluted diets or extreme deficit calculators. Simple daily consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {[
            { num: '01', title: 'Define Your Nourishment Baseline', desc: 'Establish healthy caloric and macronutrient targets calibrated to your daily movement, lifestyle, and dietary preferences.' },
            { num: '02', title: 'Log Real Whole Foods In Seconds', desc: 'Use our quick-add catalog or custom entry to record breakfast, lunch, dinner, and snacks with accurate portion multipliers.' },
            { num: '03', title: 'Review Vitality & Connect With Experts', desc: 'Watch your concentric macro rings illuminate, monitor weekly trends, and collaborate directly with accredited nutritionists.' },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="space-y-6 relative"
            >
              <div className="font-serif text-8xl sm:text-9xl font-bold text-forest/8 select-none -mb-8 leading-none">
                {step.num}
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">
                {step.title}
              </h3>
              <p className="text-forest/75 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 6. ROLE PORTALS                                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="roles" className="bg-ivory-light py-28 border-t border-forest/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-xl">
              <span className="text-xs font-mono tracking-widest uppercase text-forest/50">
                Unified Ecosystem
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-forest">
                Three curated experiences for every stakeholder
              </h2>
            </div>
            <p className="text-forest/70 text-sm max-w-sm">
              Whether you are logging daily breakfast, advising clients, or governing the platform,
              NutriTrack provides tailored workspaces.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dieter */}
            <div className="bg-ivory border border-forest/15 rounded-3xl p-8 shadow-subtle hover:shadow-lift flex flex-col justify-between hover:border-forest/40 transition-all">
              <div className="space-y-6">
                <div className="inline-flex px-3 py-1 rounded-full bg-lime text-forest text-xs font-bold uppercase tracking-wider">
                  Dieter Portal
                </div>
                <h3 className="font-serif text-3xl font-bold text-forest">
                  Mindful Nutrition & Daily Journal
                </h3>
                <p className="text-forest/75 text-sm leading-relaxed">
                  Personalized daily calorie dashboard, interactive meal logger, 8-glass water cadence,
                  and SVG concentric macro rings.
                </p>
                <ul className="space-y-2 text-xs text-forest/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-forest" /><span>Live calorie & macro tracking</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-forest" /><span>Quick-add food database search</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-forest" /><span>Animated water tracker</span></li>
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-8 w-full bg-lime text-forest font-semibold py-3.5 rounded-full hover:bg-lime-hover shadow-subtle text-center flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <span>Launch Dieter Dashboard</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Nutritionist */}
            <div className="bg-forest text-ivory rounded-3xl p-8 shadow-lift flex flex-col justify-between border border-forest-light">
              <div className="space-y-6">
                <div className="inline-flex px-3 py-1 rounded-full bg-ivory text-forest text-xs font-bold uppercase tracking-wider">
                  Nutritionist Suite
                </div>
                <h3 className="font-serif text-3xl font-bold text-ivory">
                  Client Roster & Clinical Review
                </h3>
                <p className="text-ivory/75 text-sm leading-relaxed">
                  Manage assigned clients, inspect their macro adherence, review meal journals, and
                  deliver tailored clinical notes.
                </p>
                <ul className="space-y-2 text-xs text-ivory/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-lime" /><span>Client roster with adherence %</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-lime" /><span>Detailed client drawer & macro graphs</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-lime" /><span>Prescriptive notes & adjustments</span></li>
                </ul>
              </div>
              <Link
                to="/nutritionist"
                className="mt-8 w-full bg-lime text-forest font-semibold py-3.5 rounded-full hover:bg-lime-hover shadow-subtle text-center flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <span>Open Nutritionist Suite</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Admin */}
            <div className="bg-ivory border border-forest/15 rounded-3xl p-8 shadow-subtle hover:shadow-lift flex flex-col justify-between hover:border-forest/40 transition-all">
              <div className="space-y-6">
                <div className="inline-flex px-3 py-1 rounded-full bg-forest text-ivory text-xs font-bold uppercase tracking-wider">
                  Admin Governance
                </div>
                <h3 className="font-serif text-3xl font-bold text-forest">
                  Platform Oversight & Approvals
                </h3>
                <p className="text-forest/75 text-sm leading-relaxed">
                  High-level platform KPI analytics, user status moderation, nutritionist credential
                  verification, and whole food catalog audits.
                </p>
                <ul className="space-y-2 text-xs text-forest/80">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-forest" /><span>Platform KPI cards & charts</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-forest" /><span>User management & role badges</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-forest" /><span>Nutritionist application review</span></li>
                </ul>
              </div>
              <Link
                to="/admin"
                className="mt-8 w-full bg-forest text-ivory font-semibold py-3.5 rounded-full hover:bg-forest-light shadow-subtle text-center flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
              >
                <span>Access Admin Panel</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 7. TESTIMONIAL EDITORIAL QUOTE                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-28 max-w-5xl mx-auto px-6 md:px-12 text-center">
        <div className="space-y-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-forest/5 flex items-center justify-center text-forest">
            <Sparkles className="w-6 h-6 text-lime" />
          </div>
          <blockquote className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-forest tracking-tight">
            "NutriTrack feels less like a calorie-counting chore and more like
            turning the pages of an artful wellness monograph. It changed how I view
            nourishment forever."
          </blockquote>
          <div className="space-y-1">
            <div className="font-serif text-lg font-bold text-forest">
              Elena Rostova, M.S., RD
            </div>
            <div className="text-xs uppercase tracking-widest text-forest/60">
              Integrative Nutritionist & Founder, Studio Sati
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 8. FINAL CTA BAND                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-forest text-ivory py-24 relative overflow-hidden paper-grain-dark">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ivory">
            Ready to bring calm back to{' '}
            <span className="italic font-normal text-lime">your daily table?</span>
          </h2>
          <p className="text-ivory/75 text-base sm:text-lg max-w-xl mx-auto">
            Experience our editorial nutrition platform today. Switch between Dieter,
            Nutritionist, and Admin roles instantly.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-lime text-forest font-semibold text-base px-10 py-4 rounded-full hover:bg-lime-hover shadow-subtle hover:shadow-lift transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Your Journey
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto border border-ivory/30 text-ivory font-semibold text-base px-10 py-4 rounded-full hover:bg-ivory/10 transition-all"
            >
              Demo Role Selector
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
