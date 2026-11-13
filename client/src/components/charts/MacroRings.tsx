import React from 'react';
import { motion } from 'framer-motion';

interface MacroRingsProps {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export const MacroRings: React.FC<MacroRingsProps> = ({
  calories,
  protein,
  carbs,
  fat,
}) => {
  const size = 260;
  const strokeWidth = 12;
  const center = size / 2;

  // Calorie ring (outermost)
  const rCal = 110;
  const cCal = 2 * Math.PI * rCal;
  const pctCal = Math.min(1, Math.max(0, calories.current / (calories.target || 1)));
  const offsetCal = cCal * (1 - pctCal);

  // Protein ring
  const rProt = 90;
  const cProt = 2 * Math.PI * rProt;
  const pctProt = Math.min(1, Math.max(0, protein.current / (protein.target || 1)));
  const offsetProt = cProt * (1 - pctProt);

  // Carbs ring
  const rCarbs = 70;
  const cCarbs = 2 * Math.PI * rCarbs;
  const pctCarbs = Math.min(1, Math.max(0, carbs.current / (carbs.target || 1)));
  const offsetCarbs = cCarbs * (1 - pctCarbs);

  // Fat ring (innermost)
  const rFat = 50;
  const cFat = 2 * Math.PI * rFat;
  const pctFat = Math.min(1, Math.max(0, fat.current / (fat.target || 1)));
  const offsetFat = cFat * (1 - pctFat);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 justify-between">
      {/* SVG Rings Container */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 select-none"
        >
          {/* Track 1: Calories */}
          <circle
            cx={center}
            cy={center}
            r={rCal}
            stroke="#174A3A"
            strokeOpacity="0.12"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Stroke: Calories (Lime) */}
          <motion.circle
            cx={center}
            cy={center}
            r={rCal}
            stroke="#C6E86B"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={cCal}
            initial={{ strokeDashoffset: cCal }}
            animate={{ strokeDashoffset: offsetCal }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Track 2: Protein */}
          <circle
            cx={center}
            cy={center}
            r={rProt}
            stroke="#174A3A"
            strokeOpacity="0.12"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Stroke: Protein (Forest Green) */}
          <motion.circle
            cx={center}
            cy={center}
            r={rProt}
            stroke="#174A3A"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={cProt}
            initial={{ strokeDashoffset: cProt }}
            animate={{ strokeDashoffset: offsetProt }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Track 3: Carbs */}
          <circle
            cx={center}
            cy={center}
            r={rCarbs}
            stroke="#174A3A"
            strokeOpacity="0.12"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Stroke: Carbs (Muted Forest) */}
          <motion.circle
            cx={center}
            cy={center}
            r={rCarbs}
            stroke="#235C4A"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={cCarbs}
            initial={{ strokeDashoffset: cCarbs }}
            animate={{ strokeDashoffset: offsetCarbs }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Track 4: Fat */}
          <circle
            cx={center}
            cy={center}
            r={rFat}
            stroke="#174A3A"
            strokeOpacity="0.12"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Stroke: Fat (Lime / Muted) */}
          <motion.circle
            cx={center}
            cy={center}
            r={rFat}
            stroke="#A9CE47"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={cFat}
            initial={{ strokeDashoffset: cFat }}
            animate={{ strokeDashoffset: offsetFat }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center Display: Remaining Kcal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs uppercase tracking-widest text-forest/50 font-mono">
            Remaining
          </span>
          <span className="font-serif text-3xl font-bold text-forest">
            {Math.max(0, calories.target - calories.current)}
          </span>
          <span className="text-xs text-forest/60 font-medium">kcal</span>
        </div>
      </div>

      {/* Legend & Breakdown values */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Calories */}
        <div className="p-4 rounded-2xl bg-ivory-light border border-forest/10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime border border-forest/10" />
            <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
              Energy
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-forest">
            {calories.current}
            <span className="text-xs font-sans text-forest/50 font-normal"> / {calories.target} kcal</span>
          </div>
          <div className="text-[11px] text-forest/60">
            {Math.round(pctCal * 100)}% of daily allowance
          </div>
        </div>

        {/* Protein */}
        <div className="p-4 rounded-2xl bg-ivory-light border border-forest/10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest" />
            <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
              Protein
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-forest">
            {protein.current}g
            <span className="text-xs font-sans text-forest/50 font-normal"> / {protein.target}g</span>
          </div>
          <div className="text-[11px] text-forest/60">
            {Math.round(pctProt * 100)}% reached
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="p-4 rounded-2xl bg-ivory-light border border-forest/10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-light" />
            <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
              Carbs
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-forest">
            {carbs.current}g
            <span className="text-xs font-sans text-forest/50 font-normal"> / {carbs.target}g</span>
          </div>
          <div className="text-[11px] text-forest/60">
            {Math.round(pctCarbs * 100)}% reached
          </div>
        </div>

        {/* Healthy Fats */}
        <div className="p-4 rounded-2xl bg-ivory-light border border-forest/10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-muted" />
            <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
              Fats
            </span>
          </div>
          <div className="font-serif text-2xl font-bold text-forest">
            {fat.current}g
            <span className="text-xs font-sans text-forest/50 font-normal"> / {fat.target}g</span>
          </div>
          <div className="text-[11px] text-forest/60">
            {Math.round(pctFat * 100)}% reached
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroRings;
