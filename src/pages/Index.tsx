import { useState, useMemo, useCallback, useEffect } from 'react';
import BottomTabBar, { TabId } from '@/components/BottomTabBar';
import HomePage from '@/pages/HomePage';
import MealsPage from '@/pages/MealsPage';
import BodyPage from '@/pages/BodyPage';
import WorkoutPage from '@/pages/WorkoutPage';
import SettingsPage from '@/pages/SettingsPage';
import OnboardingStepper from '@/components/OnboardingStepper';
import { ProfileInput, calculateTargets, checkWeightStagnation } from '@/lib/calculator';
import * as ls from '@/lib/local-storage';
import { toast } from 'sonner';
import { UserGoals } from '@/lib/store';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const profile = ls.getProfile();
  const targets = ls.getTargets();
  const onboarded = ls.isOnboarded();

  // Reminder notifications check
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const reminders = JSON.parse(localStorage.getItem('ft_reminders') || '[]');
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        reminders.forEach((r: any) => {
          if (r.enabled && r.time === hhmm && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`FitTracker: ${r.label}`, { body: `Czas na: ${r.label}`, icon: '/icon-192.png' });
          }
        });
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Restore theme on mount
  useEffect(() => {
    const mode = localStorage.getItem('ft_theme_mode') || 'system';
    const root = document.documentElement;
    root.classList.remove('dark');
    if (mode === 'dark') root.classList.add('dark');
    else if (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');

    const colorIdx = Number(localStorage.getItem('ft_theme_color') || '0');
    const themes = [
      { hue: '160 84% 39%' }, { hue: '340 82% 52%' }, { hue: '210 90% 50%' },
      { hue: '30 50% 50%' }, { hue: '220 15% 50%' },
    ];
    const t = themes[colorIdx];
    if (t) {
      root.style.setProperty('--primary', t.hue);
      root.style.setProperty('--ring', t.hue);
      root.style.setProperty('--calories-ring', t.hue);
    }
  }, []);

  if (!onboarded || !profile) {
    return (
      <OnboardingStepper
        onComplete={(p: ProfileInput) => {
          ls.setProfile(p);
          ls.setOnboarded(true);
          ls.setMealSchedule(ls.getMealSchedule(p.mealsPerDay));
          refresh();
          toast.success(`Cześć ${p.name}! Twoje cele zostały obliczone.`);
        }}
      />
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const meals = ls.getMeals(today);
  const measurements = ls.getMeasurements();
  const workouts = ls.getWorkouts();
  const plans = ls.getPlans();
  const scheduled = ls.getScheduled();

  const dailyTotals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goals: UserGoals = {
    calorieTarget: targets?.calories ?? 2200,
    proteinTarget: targets?.protein ?? 160,
    carbsTarget: targets?.carbs ?? 250,
    fatTarget: targets?.fat ?? 70,
    goalType: profile.goal,
  };

  const stagnation = checkWeightStagnation(ls.getWeightHistory(), profile.goal);

  const handleAddFood = (product: ls.Product, quantity: number, unit: string, mealType: string) => {
    const UNITS_MAP: Record<string, number> = {
      g: 1, ml: 1, sztuka: 60, porcja: 150, opakowanie: 200,
      'łyżeczka': 5, 'łyżka': 15, szklanka: 250,
    };
    const grams = (unit === 'g' || unit === 'ml') ? quantity : (UNITS_MAP[unit] || 100) * quantity;
    const mult = grams / 100;

    ls.addMeal({
      product_name: product.name,
      meal_type: mealType,
      quantity: grams,
      unit,
      calories: Math.round(product.calories * mult),
      protein: Math.round(product.protein * mult * 10) / 10,
      carbs: Math.round(product.carbs * mult * 10) / 10,
      fat: Math.round(product.fat * mult * 10) / 10,
      date: today,
    });
    refresh();
  };

  const handleRemoveMeal = (id: string) => { ls.removeMeal(id); refresh(); };

  const handleAddMeasurement = (m: Record<string, any>) => { ls.addMeasurement(m as any); refresh(); };

  const handleAddWorkout = (w: any) => { ls.addWorkoutSession(w); refresh(); };

  const handleAddPlan = (p: any) => { ls.addPlan(p); refresh(); };

  const handleUpdatePlan = (id: string, p: any) => { ls.updatePlan(id, p); refresh(); };

  const handleRemovePlan = (id: string) => { ls.removePlan(id); refresh(); };

  const handleSchedule = (date: string, planId: string) => {
    ls.scheduleWorkout(date, planId);
    refresh();
  };

  const handleRemoveSchedule = (date: string, planId?: string) => {
    if (planId) {
      // Remove specific plan from date
      const all = ls.getScheduled().filter(s => !(s.date === date && s.planId === planId));
      // We need to update localStorage directly for multi-workout support
      localStorage.setItem('ft_scheduled', JSON.stringify(all));
    } else {
      ls.removeSchedule(date);
    }
    refresh();
  };

  const handleRecalculate = (p: ProfileInput) => {
    ls.setProfile(p);
    ls.setMealSchedule(ls.getMealSchedule(p.mealsPerDay));
    refresh();
    toast.success('Cele zostały przeliczone!');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            dailyTotals={dailyTotals}
            goals={goals}
            streak={workouts.length}
            onNavigate={(tab) => setActiveTab(tab as TabId)}
            stagnationWarning={stagnation.stagnated ? stagnation.suggestion : undefined}
            plans={plans}
            scheduled={scheduled}
            workouts={workouts}
          />
        );
      case 'meals':
        return (
          <MealsPage
            meals={meals}
            dailyTotals={dailyTotals}
            goals={goals}
            onAdd={handleAddFood}
            onRemove={handleRemoveMeal}
            profile={profile}
          />
        );
      case 'body':
        return <BodyPage measurements={measurements} onAdd={handleAddMeasurement} />;
      case 'workout':
        return (
          <WorkoutPage
            workouts={workouts}
            onAdd={handleAddWorkout}
            plans={plans}
            onAddPlan={handleAddPlan}
            onUpdatePlan={handleUpdatePlan}
            onRemovePlan={handleRemovePlan}
            scheduled={scheduled}
            onSchedule={handleSchedule}
            onRemoveSchedule={handleRemoveSchedule}
          />
        );
      case 'settings':
        return <SettingsPage profile={profile} targets={targets} onRecalculate={handleRecalculate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <div className="pt-12 pb-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-sm font-black text-primary-foreground">FT</span>
            </div>
            <span className="text-base font-bold">FitTracker</span>
          </div>
          <button onClick={() => setActiveTab('settings')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center min-w-[44px] min-h-[44px]">
            <span className="text-sm">👤</span>
          </button>
        </div>
      </div>
      {renderPage()}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
