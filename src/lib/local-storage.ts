// localStorage persistence layer

import { ProfileInput, CalculatedTargets, calculateTargets } from './calculator';

const KEYS = {
  PROFILE: 'ft_profile',
  TARGETS: 'ft_targets',
  MEALS: 'ft_meals',
  PRODUCTS: 'ft_products',
  MEASUREMENTS: 'ft_measurements',
  WORKOUTS: 'ft_workouts',
  PLANS: 'ft_plans',
  SCHEDULED: 'ft_scheduled',
  MEAL_SCHEDULE: 'ft_meal_schedule',
  ONBOARDED: 'ft_onboarded',
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Profile ───
export function getProfile(): ProfileInput | null {
  return get<ProfileInput | null>(KEYS.PROFILE, null);
}

export function setProfile(p: ProfileInput) {
  set(KEYS.PROFILE, p);
  // Recalculate and save targets
  const targets = calculateTargets(p);
  set(KEYS.TARGETS, targets);
}

export function getTargets(): CalculatedTargets | null {
  return get<CalculatedTargets | null>(KEYS.TARGETS, null);
}

export function setTargetsOverride(t: Partial<CalculatedTargets>) {
  const current = getTargets();
  if (current) set(KEYS.TARGETS, { ...current, ...t });
}

export function isOnboarded(): boolean {
  return get<boolean>(KEYS.ONBOARDED, false);
}

export function setOnboarded(v: boolean) {
  set(KEYS.ONBOARDED, v);
}

// ─── Meals ───
export interface MealEntry {
  id: string;
  product_name: string;
  meal_type: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export function getMeals(date: string): MealEntry[] {
  const all = get<MealEntry[]>(KEYS.MEALS, []);
  return all.filter(m => m.date === date);
}

export function getAllMeals(): MealEntry[] {
  return get<MealEntry[]>(KEYS.MEALS, []);
}

export function addMeal(meal: Omit<MealEntry, 'id'>): MealEntry {
  const all = get<MealEntry[]>(KEYS.MEALS, []);
  const entry: MealEntry = { ...meal, id: Date.now().toString() + Math.random().toString(36).slice(2) };
  set(KEYS.MEALS, [...all, entry]);
  return entry;
}

export function removeMeal(id: string) {
  const all = get<MealEntry[]>(KEYS.MEALS, []);
  set(KEYS.MEALS, all.filter(m => m.id !== id));
}

// ─── Products (custom) ───
export interface Product {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
  barcode?: string;
}

// No default products - empty database, users add via scanner or manually
const DEFAULT_PRODUCTS: Product[] = [];

export function getProducts(): Product[] {
  const custom = get<Product[]>(KEYS.PRODUCTS, []);
  return [...DEFAULT_PRODUCTS, ...custom];
}

export function addProduct(p: Omit<Product, 'id'>): Product {
  const custom = get<Product[]>(KEYS.PRODUCTS, []);
  const product: Product = { ...p, id: 'custom_' + Date.now() };
  set(KEYS.PRODUCTS, [...custom, product]);
  return product;
}

// ─── Body Measurements ───
export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  waist?: number;
  belly?: number;
  chest?: number;
  hips?: number;
  bicep_left?: number;
  bicep_right?: number;
  thigh_left?: number;
  thigh_right?: number;
  calf_left?: number;
  calf_right?: number;
}

export function getMeasurements(): BodyMeasurement[] {
  return get<BodyMeasurement[]>(KEYS.MEASUREMENTS, []);
}

export function addMeasurement(m: Omit<BodyMeasurement, 'id'>): BodyMeasurement {
  const all = get<BodyMeasurement[]>(KEYS.MEASUREMENTS, []);
  const entry: BodyMeasurement = { ...m, id: Date.now().toString() };
  set(KEYS.MEASUREMENTS, [...all, entry]);
  return entry;
}

// ─── Training Plans ───
export interface PlanExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  weight: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  exercises: PlanExercise[];
}

export function getPlans(): TrainingPlan[] {
  return get<TrainingPlan[]>(KEYS.PLANS, []);
}

export function addPlan(p: Omit<TrainingPlan, 'id'>): TrainingPlan {
  const all = get<TrainingPlan[]>(KEYS.PLANS, []);
  const plan: TrainingPlan = { ...p, id: Date.now().toString() };
  set(KEYS.PLANS, [...all, plan]);
  return plan;
}

export function updatePlan(id: string, updates: Partial<TrainingPlan>) {
  const all = get<TrainingPlan[]>(KEYS.PLANS, []);
  set(KEYS.PLANS, all.map(p => p.id === id ? { ...p, ...updates } : p));
}

export function removePlan(id: string) {
  const all = get<TrainingPlan[]>(KEYS.PLANS, []);
  set(KEYS.PLANS, all.filter(p => p.id !== id));
}

// ─── Workouts (completed sessions) ───
export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: number;
  completed: boolean;
  exercises: { name: string; sets: { reps: number; weight: number; completed: boolean }[] }[];
}

export function getWorkouts(): WorkoutSession[] {
  return get<WorkoutSession[]>(KEYS.WORKOUTS, []);
}

export function addWorkoutSession(w: Omit<WorkoutSession, 'id'>): WorkoutSession {
  const all = get<WorkoutSession[]>(KEYS.WORKOUTS, []);
  const session: WorkoutSession = { ...w, id: Date.now().toString() };
  set(KEYS.WORKOUTS, [...all, session]);
  return session;
}

// ─── Scheduled Workouts ───
export interface ScheduledWorkout {
  date: string;
  planId: string;
}

export function getScheduled(): ScheduledWorkout[] {
  return get<ScheduledWorkout[]>(KEYS.SCHEDULED, []);
}

export function scheduleWorkout(date: string, planId: string) {
  const all = get<ScheduledWorkout[]>(KEYS.SCHEDULED, []);
  // Allow multiple workouts per day - only prevent duplicate plan on same day
  if (all.some(s => s.date === date && s.planId === planId)) return;
  set(KEYS.SCHEDULED, [...all, { date, planId }]);
}

export function removeSchedule(date: string) {
  const all = get<ScheduledWorkout[]>(KEYS.SCHEDULED, []);
  set(KEYS.SCHEDULED, all.filter(s => s.date !== date));
}

// ─── Meal Schedule (labels & times) ───
export interface MealSlot {
  id: string;
  label: string;
  time: string; // HH:MM
}

export function getMealSchedule(mealsPerDay: number): MealSlot[] {
  const saved = get<MealSlot[] | null>(KEYS.MEAL_SCHEDULE, null);
  if (saved && saved.length === mealsPerDay) return saved;
  // Generate defaults
  const defaults = ['Śniadanie', 'II Śniadanie', 'Lunch', 'Obiad', 'Podwieczorek', 'Kolacja'];
  const times = ['07:00', '10:00', '12:00', '14:00', '16:00', '19:00'];
  return Array.from({ length: mealsPerDay }, (_, i) => ({
    id: String(i),
    label: defaults[i] || `Posiłek ${i + 1}`,
    time: times[i] || `${12 + i}:00`,
  }));
}

export function setMealSchedule(slots: MealSlot[]) {
  set(KEYS.MEAL_SCHEDULE, slots);
}

// Weight history for stagnation check
export function getWeightHistory(): { date: string; weight: number }[] {
  const measurements = getMeasurements();
  return measurements
    .filter(m => m.weight != null)
    .map(m => ({ date: m.date, weight: m.weight! }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
