
export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  conditions: string; // Comma-separated
  cuisinePreferences?: string;
  dietaryRestrictions?: string;
}

export interface DailyHabits {
  exerciseFrequency: 'daily' | '3-4 times a week' | '1-2 times a week' | 'rarely';
  sleepHours: number;
  dietQuality: 'healthy' | 'average' | 'unhealthy';
}

export interface DietRecommendation {
  planName: string;
  description: string;
  dailyCalories: number;
  macronutrients: {
    protein: string;
    carbohydrates: string;
    fats: string;
  };
  sampleMeals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface MedicineInfo {
  name: string;
  purpose: string;
  generalAdvice: string;
}

export interface WorkoutRecommendation {
  type: string;
  duration: string;
  frequency: string;
  description: string;
}

export interface Recommendations {
  diet: DietRecommendation;
  medicineInfo: MedicineInfo[];
  workouts: WorkoutRecommendation[];
}

export interface FoodAnalysis {
  foodItems: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    vitamins: string[];
  };
  suitability: {
    isSuitable: boolean;
    reason: string;
    modification?: string;
    alternatives?: string[];
  };
}

export interface LifeImpact {
  score: number;
  riskFactors: {
    factor: string;
    impact: 'High' | 'Medium' | 'Low';
    advice: string;
  }[];
  positiveFactors: {
      factor: string;
      impact: 'High' | 'Medium' | 'Low';
      advice: string;
  }[];
  summary: string;
}