import { useState, useMemo } from 'react';
import BottomTabBar, { TabId } from '@/components/BottomTabBar';
import HomePage from '@/pages/HomePage';
import MealsPage from '@/pages/MealsPage';
import BodyPage from '@/pages/BodyPage';
import WorkoutPage from '@/pages/WorkoutPage';
import SettingsPage from '@/pages/SettingsPage';
import { useProfile, useMeals, useBodyMeasurements, useWorkouts, useTrainingPlans, useScheduledWorkouts } from '@/lib/supabase-hooks';
import { useAuth } from '@/lib/auth';
import { calculateTargets } from '@/lib/tdee';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();

  const today = new Date().toISOString().split('T')[0];
  const { meals, addMeal, removeMeal } = useMeals(today);
  const { measurements, addMeasurement } = useBodyMeasurements();
  const { workouts, addWorkout } = useWorkouts();
  const { plans, addPlan, updatePlan, removePlan } = useTrainingPlans();
  const { scheduled, scheduleWorkout, removeSchedule } = useScheduledWorkouts();

  const dailyTotals = useMemo(() => {
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + Number(m.calories),
        protein: acc.protein + Number(m.protein),
        carbs: acc.carbs + Number(m.carbs),
        fat: acc.fat + Number(m.fat),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  // Auto-calculated goals based on profile data
  const goals = useMemo(() => {
    if (profile?.initial_weight && profile?.height && profile?.birth_date) {
      const calc = calculateTargets(
        Number(profile.initial_weight),
        Number(profile.height),
        profile.birth_date,
        profile.activity_level,
        profile.goal_type
      );
      return {
        calorieTarget: profile.calorie_target || calc.calories,
        proteinTarget: profile.protein_target || calc.protein,
        carbsTarget: profile.carbs_target || calc.carbs,
        fatTarget: profile.fat_target || calc.fat,
        goalType: profile.goal_type as 'cut' | 'bulk' | 'maintain',
      };
    }
    return {
      calorieTarget: profile?.calorie_target ?? 2200,
      proteinTarget: profile?.protein_target ?? 160,
      carbsTarget: profile?.carbs_target ?? 250,
      fatTarget: profile?.fat_target ?? 70,
      goalType: (profile?.goal_type ?? 'maintain') as 'cut' | 'bulk' | 'maintain',
    };
  }, [profile]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Ładowanie...</div>
      </div>
    );
  }

  const handleAddFood = (product: any, quantity: number, mealType: string) => {
    const mult = quantity / 100;
    addMeal({
      product_name: product.name,
      product_id: product.id,
      meal_type: mealType,
      quantity,
      calories: Math.round(product.calories * mult),
      protein: Math.round(product.protein * mult),
      carbs: Math.round(product.carbs * mult),
      fat: Math.round(product.fat * mult),
      date: today,
    });
  };

  const handleUpdateProfile = (updates: Record<string, any>) => {
    updateProfile(updates);
  };

  const handleAddMeasurement = (m: Record<string, any>) => {
    addMeasurement(m);
  };

  const handleAddWorkout = (w: any) => {
    addWorkout({
      name: w.name,
      date: w.date || today,
      duration: w.duration || 0,
      completed: w.completed ?? true,
      plan_id: w.plan_id,
    });
  };

  const handleAddPlan = (p: any) => {
    addPlan({
      name: p.name,
      exercises: p.exercises.map((e: any) => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        rest_time: e.restTime || e.rest_time || 90,
        weight: e.weight || 0,
      })),
    });
  };

  const handleUpdatePlan = (id: string, p: any) => {
    updatePlan({
      id,
      name: p.name,
      exercises: (p.exercises || []).map((e: any) => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        rest_time: e.restTime || e.rest_time || 90,
        weight: e.weight || 0,
      })),
    });
  };

  const handleRemovePlan = (id: string) => {
    removePlan(id);
  };

  const handleSchedule = (date: string, planId: string) => {
    scheduleWorkout({ date, planId });
  };

  const handleRemoveSchedule = (date: string) => {
    removeSchedule(date);
  };

  // Adapt plans to old interface shape
  const plansForWorkout = plans.map(p => ({
    id: p.id,
    name: p.name,
    exercises: (p.plan_exercises || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      restTime: e.rest_time,
      weight: Number(e.weight),
    })),
  }));

  const scheduledForWorkout = scheduled.map(s => ({
    date: s.date,
    planId: s.plan_id,
  }));

  const profileForSettings = {
    initialWeight: profile?.initial_weight ? Number(profile.initial_weight) : undefined,
    birthDate: profile?.birth_date ?? undefined,
    height: profile?.height ? Number(profile.height) : undefined,
    goalType: (profile?.goal_type ?? 'maintain') as 'cut' | 'bulk' | 'maintain',
    targetWeight: profile?.target_weight ? Number(profile.target_weight) : undefined,
    monthlyChange: profile?.monthly_change ? Number(profile.monthly_change) : undefined,
    activityLevel: (profile?.activity_level ?? 'moderate') as any,
    calorieTarget: profile?.calorie_target ?? 2200,
    proteinTarget: profile?.protein_target ?? 160,
    carbsTarget: profile?.carbs_target ?? 250,
    fatTarget: profile?.fat_target ?? 70,
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage dailyTotals={dailyTotals} goals={goals} streak={workouts.length} onNavigate={(tab) => setActiveTab(tab as TabId)} />;
      case 'meals':
        return <MealsPage meals={meals} dailyTotals={dailyTotals} goals={goals} onAdd={handleAddFood} onRemove={(id) => removeMeal(id)} />;
      case 'body':
        return <BodyPage measurements={measurements} onAdd={handleAddMeasurement} />;
      case 'workout':
        return <WorkoutPage workouts={workouts} onAdd={handleAddWorkout} plans={plansForWorkout} onAddPlan={handleAddPlan} onUpdatePlan={handleUpdatePlan} onRemovePlan={handleRemovePlan} scheduled={scheduledForWorkout} onSchedule={handleSchedule} onRemoveSchedule={handleRemoveSchedule} />;
      case 'settings':
        return <SettingsPage profile={profileForSettings} onUpdate={handleUpdateProfile} onSignOut={signOut} displayName={profile?.display_name} />;
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
          <button onClick={() => setActiveTab('settings')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm">👤</span>
          </button>
        </div>
      </div>
      {renderPage()}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
