export type UserRole = 'dieter' | 'nutritionist' | 'admin';

export interface FoodItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number; // per serving
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  servingSize: string;
  image?: string;
  description?: string;
}

export interface MealEntry {
  id: string;
  foodId?: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number; // multiplier, default 1
  servingUnit: string;
  timeLogged: string;
  image?: string;
}

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  goal: string;
  targetKcal: number;
  adherenceRate: number; // e.g. 94%
  lastActive: string;
  status: 'active' | 'review_needed' | 'paused';
  notes: string;
  dietPreference: string;
  recentMeals: {
    name: string;
    kcal: number;
    time: string;
  }[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  activityCount: number;
}
