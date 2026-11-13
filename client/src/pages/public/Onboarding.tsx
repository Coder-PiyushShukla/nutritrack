import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Scale,
  Flame,
  Salad,
  Activity,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDiary } from '../../context/DiaryContext';

const GOAL_OPTIONS = [
  {
    id: 'lean_muscle',
    title: 'Lean Muscle & Metabolic Equilibrium',
    desc: 'Focus on high biological value protein, clean complex carbs, and strength recovery.',
    defaultKcal: 2250,
    protein: 155,
    carbs: 220,
    fat: 65,
    icon: Flame,
  },
  {
    id: 'fat_loss',
    title: 'Mindful Caloric Deficit & Toning',
    desc: 'Gentle energy deficit with dense satiety, high fiber legumes, and clean fats.',
    defaultKcal: 1850,
    protein: 130,
    carbs: 175,
    fat: 55,
    icon: Scale,
  },
  {
    id: 'plant_vitality',
    title: 'Plant-Based Longevity & Micronutrients',
    desc: 'Antioxidant-dense botanical nutrition, fermented foods, and optimal digestion.',
    defaultKcal: 2000,
    protein: 110,
    carbs: 260,
    fat: 60,
    icon: Salad,
  },
  {
    id: 'daily_balance',
    title: 'Holistic Daily Maintenance',
    desc: 'Steady blood sugar harmony, mental clarity, and sustained vitality throughout the day.',
    defaultKcal: 2100,
    protein: 135,
    carbs: 210,
    fat: 65,
    icon: Heart,
  },
];

const DIET_PATTERNS = [
  { id: 'mediterranean', name: 'Mediterranean Whole Foods', desc: 'Cold-pressed olive oil, wild salmon, grains, berries' },
  { id: 'high_protein', name: 'High-Protein Performance', desc: 'Lean poultry, Greek yogurt, legumes, targeted amino acids' },
  { id: 'plant_based', name: 'Strict Vegan / Plant Sourced', desc: 'Organic tempeh, chia seeds, sprouted lentils, microgreens' },
  { id: 'ayurvedic', name: 'Ayurvedic Cleanse & Anti-Inflammatory', desc: 'Turmeric, ginger, kitchari, cooked roots, herbal infusions' },
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { setCustomTargets, logWeight } = useDiary();

  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(GOAL_OPTIONS[0]);
  const [currentWeight, setCurrentWeight] = useState(68.5);
  const [targetWeight, setTargetWeight] = useState(66.0);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [selectedDiet, setSelectedDiet] = useState(DIET_PATTERNS[0]);
  const [calories, setCalories] = useState(selectedGoal.defaultKcal);

  const handleGoalSelect = (goal: typeof GOAL_OPTIONS[0]) => {
    setSelectedGoal(goal);
    setCalories(goal.defaultKcal);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save targets to DiaryContext
    setCustomTargets({
      calories,
      protein: selectedGoal.protein,
      carbs: selectedGoal.carbs,
      fat: selectedGoal.fat,
    });

    // 2. Log starting weight
    logWeight(currentWeight);

    // 3. Update User Profile in AuthContext
    updateProfile({
      isOnboarded: true,
      goal: selectedGoal.title,
      weight: currentWeight,
      targetWeight,
      dietPreference: selectedDiet.name,
      dailyCalories: calories,
    });

    // 4. Redirect to Dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-forest text-ivory flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden paper-grain-dark selection:bg-lime selection:text-forest">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-lime/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime text-forest flex items-center justify-center font-bold shadow-subtle">
            <Sparkles className="w-5 h-5 text-forest" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-ivory block">
              NutriTrack Onboarding
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-lime">
              Welcome, {user?.name || 'Friend'}
            </span>
          </div>
        </div>

        {/* Step Counter */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                step === s
                  ? 'bg-lime text-forest scale-110 shadow-subtle'
                  : step > s
                  ? 'bg-forest-light text-lime'
                  : 'bg-ivory/10 text-ivory/40'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Main Container Card */}
      <div className="max-w-2xl mx-auto w-full my-8 relative z-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="bg-ivory text-forest rounded-3xl p-8 sm:p-10 shadow-lift border border-ivory/20 space-y-6"
        >
          {/* Step 1: Health Goal */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-forest/50">
                  Step 01 of 03 • Intention
                </span>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-forest">
                  What is your primary wellness focus?
                </h2>
                <p className="text-forest/70 text-xs sm:text-sm">
                  We calibrate your nutritional rhythm and daily macro targets based on your goal.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {GOAL_OPTIONS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal.id === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleGoalSelect(goal)}
                      className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-forest text-ivory border-forest shadow-md'
                          : 'bg-ivory-light border-forest/10 hover:border-forest/30 text-forest'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-lime text-forest' : 'bg-forest/5 text-forest'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-base">{goal.title}</h4>
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-lime text-forest font-bold' : 'bg-forest/5 text-forest/70'
                            }`}
                          >
                            ~{goal.defaultKcal} kcal
                          </span>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-ivory/80' : 'text-forest/60'}`}>
                          {goal.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-lime text-forest font-semibold px-6 py-3 rounded-full hover:bg-lime-hover shadow-subtle flex items-center gap-2 text-sm"
                >
                  <span>Continue to Measurements</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Measurements */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-forest/50">
                  Step 02 of 03 • Biological Metrics
                </span>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-forest">
                  Your Physical Baseline
                </h2>
                <p className="text-forest/70 text-xs sm:text-sm">
                  We use your initial metrics to graph weight equilibrium trends and hydration needs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-ivory-light border border-forest/10 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 block">
                    Current Weight
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 68)}
                      className="w-full text-2xl font-mono font-bold text-forest bg-white border border-forest/15 rounded-xl px-4 py-2 focus:ring-2 focus:ring-lime focus:outline-none"
                    />
                    <span className="text-sm font-mono text-forest/60">kg</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-ivory-light border border-forest/10 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 block">
                    Target Weight
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 65)}
                      className="w-full text-2xl font-mono font-bold text-forest bg-white border border-forest/15 rounded-xl px-4 py-2 focus:ring-2 focus:ring-lime focus:outline-none"
                    />
                    <span className="text-sm font-mono text-forest/60">kg</span>
                  </div>
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 block">
                  Daily Activity Rhythm
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sedentary', label: 'Restful', desc: 'Desk work, gentle walks' },
                    { id: 'moderate', label: 'Balanced', desc: '3-4 workouts per week' },
                    { id: 'active', label: 'Athletic', desc: 'High intensity daily' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActivityLevel(act.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activityLevel === act.id
                          ? 'bg-forest text-ivory border-forest shadow-sm'
                          : 'bg-ivory-light text-forest border-forest/10 hover:border-forest/30'
                      }`}
                    >
                      <span className="font-bold text-xs block">{act.label}</span>
                      <span className={`text-[10px] mt-0.5 block ${activityLevel === act.id ? 'text-ivory/70' : 'text-forest/50'}`}>
                        {act.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-xs font-semibold text-forest/70 hover:text-forest flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-lime text-forest font-semibold px-6 py-3 rounded-full hover:bg-lime-hover shadow-subtle flex items-center gap-2 text-sm"
                >
                  <span>Continue to Diet Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Dietary Pattern & Caloric Architecture */}
          {step === 3 && (
            <form onSubmit={handleFinish} className="space-y-6">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-forest/50">
                  Step 03 of 03 • Nutrition Blueprint
                </span>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-forest">
                  Your Nutritional Framework
                </h2>
                <p className="text-forest/70 text-xs sm:text-sm">
                  Select your dietary style and verify your recommended caloric allowance.
                </p>
              </div>

              {/* Diet Pattern Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 block">
                  Dietary Philosophy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DIET_PATTERNS.map((diet) => (
                    <button
                      key={diet.id}
                      type="button"
                      onClick={() => setSelectedDiet(diet)}
                      className={`text-left p-3.5 rounded-2xl border transition-all ${
                        selectedDiet.id === diet.id
                          ? 'bg-forest text-ivory border-forest shadow-sm'
                          : 'bg-ivory-light text-forest border-forest/10 hover:border-forest/30'
                      }`}
                    >
                      <span className="font-serif font-bold text-sm block">{diet.name}</span>
                      <span className={`text-[11px] mt-0.5 block line-clamp-1 ${selectedDiet.id === diet.id ? 'text-ivory/70' : 'text-forest/50'}`}>
                        {diet.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Caloric Target Adjustment */}
              <div className="p-5 rounded-2xl bg-ivory-light border border-forest/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-forest/60">
                    Daily Caloric Allowance
                  </span>
                  <span className="font-serif text-2xl font-bold text-forest">
                    {calories} <span className="text-xs font-sans text-forest/50 font-normal">kcal / day</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="1500"
                  max="3200"
                  step="50"
                  value={calories}
                  onChange={(e) => setCalories(parseInt(e.target.value, 10))}
                  className="w-full accent-forest cursor-pointer"
                />

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-xl border border-forest/5">
                    <span className="text-[10px] text-forest/50 uppercase font-mono block">Protein</span>
                    <span className="font-bold text-forest">{selectedGoal.protein}g</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-forest/5">
                    <span className="text-[10px] text-forest/50 uppercase font-mono block">Carbs</span>
                    <span className="font-bold text-forest">{selectedGoal.carbs}g</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-forest/5">
                    <span className="text-[10px] text-forest/50 uppercase font-mono block">Healthy Fats</span>
                    <span className="font-bold text-forest">{selectedGoal.fat}g</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-xs font-semibold text-forest/70 hover:text-forest flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="bg-lime text-forest font-semibold px-8 py-3.5 rounded-full hover:bg-lime-hover shadow-subtle hover:shadow-lift flex items-center gap-2 text-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter My Personalized Sanctuary</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto w-full text-center text-xs text-ivory/50 relative z-10">
        Kinfolk Editorial Design System • NutriTrack Mindful Nutrition
      </div>
    </div>
  );
};

export default Onboarding;

