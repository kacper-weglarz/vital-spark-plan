// TDEE / BMR / Macro calculator with validation

export type Gender = 'male' | 'female';
export type Goal = 'cut' | 'maintain' | 'bulk';
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

export interface ProfileInput {
  name: string;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  mealsPerDay: number;
}

export interface CalculatedTargets {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  dailyDeficitOrSurplus: number;
  monthlyWeightChange: number;
}

export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: number): number {
  return Math.round(bmr * activityLevel);
}

export function calculateTargets(input: ProfileInput): CalculatedTargets {
  const bmr = calculateBMR(input.weight, input.height, input.age, input.gender);
  const tdee = calculateTDEE(bmr, input.activityLevel);

  let calories = tdee;
  let dailyDeficitOrSurplus = 0;

  if (input.goal === 'cut') {
    calories = tdee - 300;
    const minCal = input.gender === 'female' ? 1200 : 1500;
    calories = Math.max(calories, minCal);
    dailyDeficitOrSurplus = calories - tdee;
  } else if (input.goal === 'bulk') {
    calories = tdee + 300;
    dailyDeficitOrSurplus = calories - tdee;
  }

  // Macros
  const protein = Math.round(1.8 * input.weight);
  const fat = Math.round(0.9 * input.weight);
  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  const carbs = Math.max(0, Math.round((calories - proteinCal - fatCal) / 4));

  const monthlyWeightChange = Math.round(((dailyDeficitOrSurplus * 30) / 7700) * 100) / 100;

  return { bmr: Math.round(bmr), tdee, calories, protein, carbs, fat, dailyDeficitOrSurplus, monthlyWeightChange };
}

export function calculateBMI(weight: number, height: number): number {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Niedowaga', color: 'text-accent' };
  if (bmi < 25) return { label: 'Norma', color: 'text-primary' };
  if (bmi < 30) return { label: 'Nadwaga', color: 'text-yellow-500' };
  return { label: 'Otyłość', color: 'text-destructive' };
}

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 1.2, label: 'Siedzący', desc: 'Praca biurowa, brak ćwiczeń' },
  { value: 1.375, label: 'Lekka aktywność', desc: '1-3 treningi/tydzień' },
  { value: 1.55, label: 'Umiarkowana', desc: '3-5 treningów/tydzień' },
  { value: 1.725, label: 'Aktywny', desc: '6-7 treningów/tydzień' },
  { value: 1.9, label: 'Bardzo aktywny', desc: 'Praca fizyczna + trening' },
];

export const GOAL_OPTIONS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'cut', label: 'Redukcja', emoji: '🔥' },
  { value: 'maintain', label: 'Utrzymanie', emoji: '⚖️' },
  { value: 'bulk', label: 'Masa', emoji: '💪' },
];

export function checkWeightStagnation(weights: { date: string; weight: number }[], goal: Goal): { stagnated: boolean; suggestion: string } {
  if (goal !== 'cut' || weights.length < 3) return { stagnated: false, suggestion: '' };
  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const recent = sorted.filter(w => new Date(w.date) >= twoWeeksAgo);
  if (recent.length < 2) return { stagnated: false, suggestion: '' };
  const oldest = recent[recent.length - 1].weight;
  const newest = recent[0].weight;
  if (newest >= oldest) {
    return { stagnated: true, suggestion: 'Waga nie spada od 2 tygodni. Rozważ obcięcie 100-200 kcal.' };
  }
  return { stagnated: false, suggestion: '' };
}
