import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Droplet,
  ChevronRight,
  TrendingDown,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Scale,
  Utensils
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import MacroRings from '../../components/charts/MacroRings';
import QuickAddMealModal from '../../components/forms/QuickAddMealModal';
import LiveConsultationDrawer from '../../components/chat/LiveConsultationDrawer';
import { useDiary } from '../../context/DiaryContext';
import { useAuth } from '../../context/AuthContext';

export const DieterDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    meals,
    totals,
    targets,
    waterGlasses,
    incrementWater,
    decrementWater,
    setWater,
    deleteMeal,
    weightHistory,
    logWeight,
  } = useDiary();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [weightInput, setWeightInput] = useState('67.9');

  // Format today's date in serene editorial format
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const openAddModal = (cat: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setModalCategory(cat);
    setIsModalOpen(true);
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 300) {
      logWeight(val);
    }
  };

  // Group meals by category
  const mealCategories: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  // Weekly bar data for caloric balance
  const weeklyBarData = [
    { day: 'Mon', kcal: 2050, isToday: false },
    { day: 'Tue', kcal: 2120, isToday: false },
    { day: 'Wed', kcal: 1980, isToday: false },
    { day: 'Thu', kcal: 2240, isToday: false },
    { day: 'Fri', kcal: 2100, isToday: false },
    { day: 'Sat', kcal: 2190, isToday: false },
    { day: 'Sun (Today)', kcal: totals.calories, isToday: true },
  ];
  const maxWeeklyKcal = 2500;

  return (
    <div className="min-h-screen bg-ivory text-forest paper-grain selection:bg-lime selection:text-forest">
      <Navbar />

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Top Greeting Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-forest/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-forest/60">
              <Calendar className="w-3.5 h-3.5 text-forest" />
              <span>{todayFormatted}</span>
              <span className="text-forest/30">•</span>
              <span className="text-lime-muted font-semibold">Mindful Journal</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-forest">
              Good morning, <span className="italic font-normal">{user?.name ? user.name.split(' ')[0] : 'Aarav'}.</span>
            </h1>
            <p className="text-forest/75 text-sm sm:text-base max-w-xl">
              Your nutritional rhythm is aligned. You have logged{' '}
              <strong className="text-forest font-semibold">{totals.calories} kcal</strong> today, leaving{' '}
              <strong className="text-forest font-semibold">{totals.remainingKcal} kcal</strong> for gentle balance.
            </p>
          </div>

          {/* Quick Primary Action */}
          <button
            onClick={() => openAddModal('breakfast')}
            className="bg-lime text-forest font-semibold text-sm px-6 py-3 rounded-full hover:bg-lime-hover shadow-subtle hover:shadow-lift transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-forest stroke-[2.5]" />
            <span>Log Nourishment</span>
          </button>
        </section>

        {/* 1. CALORIE & CONCENTRIC MACRO RINGS SUMMARY CARD */}
        <section className="bg-ivory rounded-3xl p-6 sm:p-10 border border-forest/15 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-forest/10 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-forest/50">
                Daily Macronutrient Symmetry
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
                Caloric Equilibrium
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-forest text-ivory font-mono">
                Target: {targets.calories} kcal
              </span>
              <span className="px-3 py-1 rounded-full bg-lime text-forest font-semibold">
                Logged: {totals.calories} kcal
              </span>
            </div>
          </div>

          <MacroRings
            calories={{ current: totals.calories, target: targets.calories }}
            protein={{ current: totals.protein, target: targets.protein }}
            carbs={{ current: totals.carbs, target: targets.carbs }}
            fat={{ current: totals.fat, target: targets.fat }}
          />
        </section>

        {/* 2. SPLIT LAYOUT: TODAY'S MEALS & WATER/WEIGHT TRACKER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Today's Meals by Category */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-forest">
                Today&apos;s Nourishment Log
              </h2>
              <span className="text-xs text-forest/60">
                {meals.length} item{meals.length === 1 ? '' : 's'} recorded
              </span>
            </div>

            <div className="space-y-6">
              {mealCategories.map((category) => {
                const categoryMeals = meals.filter((m: any) => m.category === category);
                const categoryKcal = categoryMeals.reduce(
                  (sum: number, m: any) => sum + Math.round(m.calories * m.portion),
                  0
                );

                return (
                  <div
                    key={category}
                    className="bg-ivory rounded-2xl p-6 border border-forest/10 shadow-subtle space-y-4"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-lime" />
                        <h3 className="font-serif text-xl font-bold capitalize text-forest">
                          {category}
                        </h3>
                        <span className="text-xs text-forest/50 font-mono">
                          • {categoryKcal} kcal
                        </span>
                      </div>
                      <button
                        onClick={() => openAddModal(category)}
                        className="text-xs font-semibold text-forest hover:text-forest-light flex items-center gap-1 transition-colors px-3 py-1 rounded-full hover:bg-forest/5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Meal Items */}
                    {categoryMeals.length === 0 ? (
                      <p className="text-xs italic text-forest/40 py-2">
                        No food recorded yet for {category}. Tap + Add to log.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {categoryMeals.map((meal: any) => (
                          <div
                            key={meal.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-ivory-light/80 hover:bg-ivory-light transition-colors border border-forest/5 group"
                          >
                            <div className="flex items-center gap-3">
                              {meal.image ? (
                                <img
                                  src={meal.image}
                                  alt={meal.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-forest/5 flex items-center justify-center text-forest/40">
                                  <Utensils className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-semibold text-forest">
                                  {meal.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-forest/60">
                                  <span>{meal.portion}x {meal.servingUnit}</span>
                                  <span>•</span>
                                  <span>{meal.timeLogged}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="font-serif text-base font-bold text-forest">
                                  {Math.round(meal.calories * meal.portion)}
                                </span>
                                <span className="text-xs text-forest/50 ml-1">kcal</span>
                                <div className="text-[10px] text-forest/50">
                                  P: {Math.round(meal.protein * meal.portion)}g | C: {Math.round(meal.carbs * meal.portion)}g | F: {Math.round(meal.fat * meal.portion)}g
                                </div>
                              </div>
                              <button
                                onClick={() => deleteMeal(meal.id)}
                                title="Remove meal entry"
                                className="opacity-40 group-hover:opacity-100 p-2 text-forest/60 hover:text-forest transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: Water Tracker & Vitality Charts */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Water Hydration Card (8 glasses visual) */}
            <div className="bg-ivory rounded-3xl p-6 border border-forest/15 shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-forest/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-forest text-lime flex items-center justify-center">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-forest">
                      Hydration Tracker
                    </h3>
                    <span className="text-xs text-forest/60">
                      Goal: 8 glasses (2.0L)
                    </span>
                  </div>
                </div>
                <span className="font-serif text-2xl font-bold text-forest">
                  {waterGlasses}/8
                </span>
              </div>

              {/* 8-Glass Visual Grid */}
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const filled = idx < waterGlasses;
                  return (
                    <button
                      key={idx}
                      onClick={() => setWater(idx + 1 === waterGlasses ? idx : idx + 1)}
                      className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden border ${
                        filled
                          ? 'bg-forest text-lime border-forest shadow-subtle'
                          : 'bg-ivory-light border-forest/15 text-forest/30 hover:border-forest/40'
                      }`}
                      title={`Glass ${idx + 1}`}
                    >
                      <Droplet
                        className={`w-5 h-5 transition-transform duration-300 ${
                          filled ? 'scale-110 fill-current' : 'scale-90'
                        }`}
                      />
                      <span className="text-[10px] font-mono mt-1 font-bold">
                        {250}ml
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Water Controls */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  onClick={decrementWater}
                  disabled={waterGlasses === 0}
                  className="px-4 py-2 rounded-full border border-forest/20 text-forest disabled:opacity-30 hover:bg-forest/5"
                >
                  - Remove Glass
                </button>
                <button
                  onClick={incrementWater}
                  disabled={waterGlasses >= 8}
                  className="px-4 py-2 rounded-full bg-lime text-forest font-bold disabled:opacity-30 hover:bg-lime-hover shadow-subtle"
                >
                  + Drink Glass
                </button>
              </div>
            </div>

            {/* Weekly Calorie Balance Chart (Forest bars, Lime for today) */}
            <div className="bg-ivory rounded-3xl p-6 border border-forest/15 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-forest">
                  Weekly Caloric Rhythm
                </h3>
                <span className="text-xs font-mono text-forest/60">7-Day History</span>
              </div>

              {/* CSS Bar Chart with strict Forest & Lime palette */}
              <div className="pt-4 flex items-end justify-between h-44 gap-2">
                {weeklyBarData.map((item, i) => {
                  const heightPct = Math.min(100, (item.kcal / maxWeeklyKcal) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[10px] font-mono font-semibold text-forest/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.kcal}
                      </div>
                      <div className="w-full bg-forest/10 rounded-full h-32 relative overflow-hidden flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className={`w-full rounded-full transition-colors ${
                            item.isToday
                              ? 'bg-lime shadow-lime-glow'
                              : 'bg-forest hover:bg-forest-light'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-mono tracking-tight ${
                          item.isToday ? 'font-bold text-forest underline' : 'text-forest/60'
                        }`}
                      >
                        {item.day.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-forest/60 pt-2 border-t border-forest/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest" />
                  <span>Previous days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime" />
                  <span className="font-semibold text-forest">Today (Live)</span>
                </div>
              </div>
            </div>

            {/* Weight Logging Mini Widget */}
            <div className="bg-ivory rounded-3xl p-6 border border-forest/15 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-lg font-bold text-forest">
                    Weight Equilibrium
                  </h3>
                </div>
                <span className="text-xs text-lime-muted font-bold font-mono">
                  -0.9 kg / 7 days
                </span>
              </div>

              <form onSubmit={handleWeightSubmit} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-ivory-light border border-forest/15 rounded-xl text-sm font-semibold text-forest focus:outline-none focus:ring-2 focus:ring-lime"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-forest/50 font-mono">
                    kg
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-forest text-ivory rounded-xl text-xs font-semibold hover:bg-forest-light transition-colors"
                >
                  Save Log
                </button>
              </form>

              {/* Sparkline list of recent records */}
              <div className="flex items-center justify-between text-xs text-forest/70 pt-1">
                {weightHistory.slice(-4).map((entry: any, idx: number) => (
                  <div key={idx} className="text-center">
                    <span className="text-[10px] text-forest/40 block">{entry.date}</span>
                    <span className="font-mono font-bold">{entry.weight} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Quick Add Meal Modal */}
      <QuickAddMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCategory={modalCategory}
      />

      {/* Real-Time Socket.IO Live Consultation Chat */}
      <LiveConsultationDrawer
        currentUser={{
          userId: user?.id || 'usr-dieter-aarav',
          name: user?.name || 'Aarav Mehta',
          role: 'dieter',
        }}
        recipientName="Maya Lin, Clinical RD"
        recipientRole="Lead Nutritionist"
        roomId="consultation-aarav-maya"
      />

      <Footer />
    </div>
  );
};

export default DieterDashboard;
