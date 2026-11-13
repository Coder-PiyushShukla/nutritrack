import React, { createContext, useContext, useState, useEffect } from 'react';
import { MealEntry, FoodItem, MacroTarget } from '../types';
import { notifyMealLogged } from '../services/socket';

export const FOOD_DATABASE: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Wild Blueberry & Greek Yogurt Nourish Bowl',
    category: 'breakfast',
    calories: 380,
    protein: 26,
    carbs: 48,
    fat: 9,
    servingSize: '1 bowl (320g)',
    description: 'Whole milk Greek yogurt with organic wild Maine blueberries, toasted hemp hearts, and cold-pressed honey.',
    image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-2',
    name: 'Avocado Tartine with Sprouted Seed Bread',
    category: 'breakfast',
    calories: 340,
    protein: 11,
    carbs: 32,
    fat: 20,
    servingSize: '2 slices (180g)',
    description: 'Crushed Hass avocado on slow-fermented sprouted sourdough with Maldon flake salt, microgreens, and lime zest.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-3',
    name: 'Forest Kale & French Puy Lentil Salad',
    category: 'lunch',
    calories: 520,
    protein: 24,
    carbs: 62,
    fat: 21,
    servingSize: '1 large bowl (380g)',
    description: 'Lacinato dinosaur kale, warm French green lentils, roasted golden beets, walnuts, and creamy tahini-lime vinaigrette.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-4',
    name: 'Quinoa, Edamame & Cucumber Crunch Bowl',
    category: 'lunch',
    calories: 460,
    protein: 21,
    carbs: 56,
    fat: 16,
    servingSize: '1 bowl (350g)',
    description: 'Fluffy organic white quinoa with shelled young edamame, shaved Persian cucumbers, avocado, and toasted sesame.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-5',
    name: 'Charbroiled Wild Salmon & Tender Broccolini',
    category: 'dinner',
    calories: 610,
    protein: 48,
    carbs: 18,
    fat: 37,
    servingSize: '1 plate (340g)',
    description: 'Sustainably caught Pacific king salmon pan-seared with fresh dill, charred baby broccolini, and extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-6',
    name: 'Roasted Sweet Potato & Chickpea Harissa Skillet',
    category: 'dinner',
    calories: 540,
    protein: 19,
    carbs: 76,
    fat: 18,
    servingSize: '1 skillet portion (400g)',
    description: 'Cumin-spiced Japanese sweet potatoes with slow-simmered chickpeas, tender spinach, and mild green harissa drizzle.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-7',
    name: 'Ceremonial Matcha & Pistachio Energy Bites',
    category: 'snack',
    calories: 190,
    protein: 6,
    carbs: 18,
    fat: 11,
    servingSize: '2 bites (60g)',
    description: 'Hand-rolled Medjool dates, raw California pistachios, oats, and organic Uji ceremonial green tea powder.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'food-8',
    name: 'Chilled Coconut Kefir & Chia Seed Pot',
    category: 'snack',
    calories: 220,
    protein: 7,
    carbs: 19,
    fat: 13,
    servingSize: '1 jar (200ml)',
    description: 'Probiotic coconut kefir soaked overnight with black chia seeds, Ceylon cinnamon, and fresh raspberries.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'
  }
];

const INITIAL_MEALS: MealEntry[] = [
  {
    id: 'meal-init-1',
    name: 'Wild Blueberry & Greek Yogurt Nourish Bowl',
    category: 'breakfast',
    calories: 380,
    protein: 26,
    carbs: 48,
    fat: 9,
    portion: 1,
    servingUnit: '1 bowl',
    timeLogged: '08:15 AM',
    image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'meal-init-2',
    name: 'Forest Kale & French Puy Lentil Salad',
    category: 'lunch',
    calories: 520,
    protein: 24,
    carbs: 62,
    fat: 21,
    portion: 1,
    servingUnit: '1 large bowl',
    timeLogged: '01:10 PM',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'meal-init-3',
    name: 'Ceremonial Matcha & Pistachio Energy Bites',
    category: 'snack',
    calories: 190,
    protein: 6,
    carbs: 18,
    fat: 11,
    portion: 1,
    servingUnit: '2 bites',
    timeLogged: '04:30 PM',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  }
];

interface WeightEntry {
  date: string;
  weight: number; // kg
}

interface DiaryContextType {
  meals: MealEntry[];
  targets: MacroTarget;
  setCustomTargets: (targets: MacroTarget) => void;
  waterGlasses: number;
  weightHistory: WeightEntry[];
  addMeal: (meal: Omit<MealEntry, 'id' | 'timeLogged'>) => void;
  deleteMeal: (id: string) => void;
  incrementWater: () => void;
  decrementWater: () => void;
  setWater: (glasses: number) => void;
  logWeight: (weight: number) => void;
  searchFoods: (query: string) => FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    remainingKcal: number;
  };
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<MealEntry[]>(() => {
    const saved = localStorage.getItem('nutritrack_meals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MEALS;
  });

  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('nutritrack_water');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => {
    const saved = localStorage.getItem('nutritrack_weight');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { date: 'Mon', weight: 68.8 },
      { date: 'Tue', weight: 68.6 },
      { date: 'Wed', weight: 68.5 },
      { date: 'Thu', weight: 68.3 },
      { date: 'Fri', weight: 68.4 },
      { date: 'Sat', weight: 68.1 },
      { date: 'Today', weight: 67.9 },
    ];
  });

  const [targets, setTargets] = useState<MacroTarget>(() => {
    const saved = localStorage.getItem('nutritrack_targets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      calories: 2150,
      protein: 140,
      carbs: 215,
      fat: 65,
    };
  });

  const setCustomTargets = (newTargets: MacroTarget) => {
    setTargets(newTargets);
    localStorage.setItem('nutritrack_targets', JSON.stringify(newTargets));
  };

  useEffect(() => {
    localStorage.setItem('nutritrack_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('nutritrack_water', waterGlasses.toString());
  }, [waterGlasses]);

  useEffect(() => {
    localStorage.setItem('nutritrack_weight', JSON.stringify(weightHistory));
  }, [weightHistory]);

  const addMeal = (mealData: Omit<MealEntry, 'id' | 'timeLogged'>) => {
    const now = new Date();
    const timeLogged = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: MealEntry = {
      ...mealData,
      id: `meal-${Date.now()}`,
      timeLogged,
    };
    setMeals(prev => [newEntry, ...prev]);

    // Real-Time Socket.IO Notification: Broadcast meal logged to nutritionists
    try {
      notifyMealLogged({
        userName: 'Aarav Mehta',
        mealType: mealData.category,
        itemsCount: 1,
        totalCalories: mealData.calories,
      });
    } catch (e) {
      // safe fallback
    }
  };

  const deleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const incrementWater = () => {
    setWaterGlasses(prev => Math.min(8, prev + 1));
  };

  const decrementWater = () => {
    setWaterGlasses(prev => Math.max(0, prev - 1));
  };

  const setWater = (glasses: number) => {
    setWaterGlasses(Math.max(0, Math.min(8, glasses)));
  };

  const logWeight = (weight: number) => {
    setWeightHistory(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { date: 'Today', weight };
      return updated;
    });
  };

  const searchFoods = (query: string): FoodItem[] => {
    if (!query.trim()) return FOOD_DATABASE;
    const lower = query.toLowerCase();
    return FOOD_DATABASE.filter(f => 
      f.name.toLowerCase().includes(lower) || 
      f.category.toLowerCase().includes(lower) ||
      f.description?.toLowerCase().includes(lower)
    );
  };

  // Compute live aggregates
  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += Math.round(meal.calories * meal.portion);
      acc.protein += Math.round(meal.protein * meal.portion);
      acc.carbs += Math.round(meal.carbs * meal.portion);
      acc.fat += Math.round(meal.fat * meal.portion);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, remainingKcal: 0 }
  );
  totals.remainingKcal = Math.max(0, targets.calories - totals.calories);

  return (
    <DiaryContext.Provider
      value={{
        meals,
        targets,
        setCustomTargets,
        waterGlasses,
        weightHistory,
        addMeal,
        deleteMeal,
        incrementWater,
        decrementWater,
        setWater,
        logWeight,
        searchFoods,
        totals,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
