import { useState, useCallback } from 'react';

// Types
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  barcode?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: MealType;
  date: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  hips?: number;
  chest?: number;
  bicepLeft?: number;
  bicepRight?: number;
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  restTime: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  duration: number;
  completed: boolean;
}

export interface UserGoals {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  goalType: 'cut' | 'bulk' | 'maintain';
}

export interface DailyCheckIn {
  date: string;
  completed: boolean;
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Lunch',
  dinner: 'Obiad',
  snack: 'Przekąska',
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

// Sample food database
export const FOOD_DATABASE: FoodItem[] = [
  { id: '1', name: 'Pierś z kurczaka', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g' },
  { id: '2', name: 'Ryż biały', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g' },
  { id: '3', name: 'Jajko', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '100g' },
  { id: '4', name: 'Banan', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: '100g' },
  { id: '5', name: 'Owsianka', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, servingSize: '100g' },
  { id: '6', name: 'Łosoś', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g' },
  { id: '7', name: 'Brokuły', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g' },
  { id: '8', name: 'Twaróg', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingSize: '100g' },
  { id: '9', name: 'Chleb pełnoziarnisty', calories: 247, protein: 13, carbs: 41, fat: 3.4, servingSize: '100g' },
  { id: '10', name: 'Masło orzechowe', calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: '100g' },
  { id: '11', name: 'Jogurt naturalny', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, servingSize: '100g' },
  { id: '12', name: 'Makaron', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: '100g' },
];

export const SAMPLE_WORKOUTS = [
  {
    name: 'Push Day',
    exercises: [
      { name: 'Wyciskanie sztangi', sets: 4, reps: 8 },
      { name: 'Wyciskanie hantli skos', sets: 3, reps: 10 },
      { name: 'Rozpiętki', sets: 3, reps: 12 },
      { name: 'Wyciskanie żołnierskie', sets: 4, reps: 8 },
      { name: 'Wznosy bokiem', sets: 3, reps: 15 },
      { name: 'Prostowanie na wyciągu', sets: 3, reps: 12 },
    ]
  },
  {
    name: 'Pull Day',
    exercises: [
      { name: 'Podciąganie', sets: 4, reps: 8 },
      { name: 'Wiosłowanie sztangą', sets: 4, reps: 8 },
      { name: 'Ściąganie drążka', sets: 3, reps: 10 },
      { name: 'Wiosłowanie hantlą', sets: 3, reps: 10 },
      { name: 'Face pull', sets: 3, reps: 15 },
      { name: 'Uginanie hantli', sets: 3, reps: 12 },
    ]
  },
  {
    name: 'Leg Day',
    exercises: [
      { name: 'Przysiad ze sztangą', sets: 4, reps: 8 },
      { name: 'Martwy ciąg rumuński', sets: 4, reps: 8 },
      { name: 'Wypychanie nogami', sets: 3, reps: 10 },
      { name: 'Uginanie nóg', sets: 3, reps: 12 },
      { name: 'Wyprosty nóg', sets: 3, reps: 12 },
      { name: 'Wspięcia na palce', sets: 4, reps: 15 },
    ]
  }
];

// Hooks for state
export function useMealEntries() {
  const [entries, setEntries] = useState<MealEntry[]>([
    { id: '1', foodItem: FOOD_DATABASE[4], quantity: 200, mealType: 'breakfast', date: new Date().toISOString().split('T')[0] },
    { id: '2', foodItem: FOOD_DATABASE[3], quantity: 120, mealType: 'breakfast', date: new Date().toISOString().split('T')[0] },
    { id: '3', foodItem: FOOD_DATABASE[0], quantity: 200, mealType: 'lunch', date: new Date().toISOString().split('T')[0] },
    { id: '4', foodItem: FOOD_DATABASE[1], quantity: 150, mealType: 'lunch', date: new Date().toISOString().split('T')[0] },
  ]);

  const addEntry = useCallback((entry: Omit<MealEntry, 'id'>) => {
    setEntries(prev => [...prev, { ...entry, id: Date.now().toString() }]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEntriesForDate = useCallback((date: string) => {
    return entries.filter(e => e.date === date);
  }, [entries]);

  const getDailyTotals = useCallback((date: string) => {
    const dayEntries = entries.filter(e => e.date === date);
    return dayEntries.reduce(
      (acc, entry) => {
        const multiplier = entry.quantity / 100;
        return {
          calories: acc.calories + entry.foodItem.calories * multiplier,
          protein: acc.protein + entry.foodItem.protein * multiplier,
          carbs: acc.carbs + entry.foodItem.carbs * multiplier,
          fat: acc.fat + entry.foodItem.fat * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  return { entries, addEntry, removeEntry, getEntriesForDate, getDailyTotals };
}

export function useUserGoals() {
  const [goals, setGoals] = useState<UserGoals>({
    calorieTarget: 2200,
    proteinTarget: 160,
    carbsTarget: 250,
    fatTarget: 70,
    goalType: 'maintain',
  });

  return { goals, setGoals };
}

export function useBodyMeasurements() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([
    { id: '1', date: '2025-03-01', weight: 82, waist: 84, chest: 102, bicepLeft: 36, bicepRight: 37 },
    { id: '2', date: '2025-03-08', weight: 81.5, waist: 83.5, chest: 102, bicepLeft: 36.5, bicepRight: 37 },
    { id: '3', date: '2025-03-15', weight: 81, waist: 83, chest: 102.5, bicepLeft: 36.5, bicepRight: 37.5 },
    { id: '4', date: '2025-03-22', weight: 80.5, waist: 82.5, chest: 103, bicepLeft: 37, bicepRight: 37.5 },
  ]);

  const addMeasurement = useCallback((m: Omit<BodyMeasurement, 'id'>) => {
    setMeasurements(prev => [...prev, { ...m, id: Date.now().toString() }]);
  }, []);

  return { measurements, addMeasurement };
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: '1', name: 'Push Day', date: '2025-03-22', duration: 65, completed: true,
      exercises: [
        { id: '1', name: 'Wyciskanie sztangi', sets: [{ reps: 8, weight: 80, completed: true }, { reps: 8, weight: 80, completed: true }, { reps: 7, weight: 80, completed: true }, { reps: 6, weight: 80, completed: true }], restTime: 120 },
        { id: '2', name: 'Wyciskanie hantli skos', sets: [{ reps: 10, weight: 28, completed: true }, { reps: 10, weight: 28, completed: true }, { reps: 9, weight: 28, completed: true }], restTime: 90 },
      ]
    },
    {
      id: '2', name: 'Pull Day', date: '2025-03-20', duration: 58, completed: true,
      exercises: [
        { id: '1', name: 'Podciąganie', sets: [{ reps: 10, weight: 0, completed: true }, { reps: 8, weight: 0, completed: true }, { reps: 7, weight: 0, completed: true }], restTime: 120 },
      ]
    },
  ]);

  const addWorkout = useCallback((w: Omit<Workout, 'id'>) => {
    setWorkouts(prev => [...prev, { ...w, id: Date.now().toString() }]);
  }, []);

  return { workouts, addWorkout };
}

export function useStreak() {
  const [streak, setStreak] = useState(7);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(
    Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      completed: true,
    }))
  );

  const doCheckIn = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setCheckIns(prev => {
      if (prev.find(c => c.date === today)) return prev;
      return [...prev, { date: today, completed: true }];
    });
    setStreak(prev => prev + 1);
  }, []);

  return { streak, checkIns, doCheckIn };
}
