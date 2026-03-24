import { useState } from 'react';
import BottomTabBar, { TabId } from '@/components/BottomTabBar';
import HomePage from '@/pages/HomePage';
import MealsPage from '@/pages/MealsPage';
import BodyPage from '@/pages/BodyPage';
import WorkoutPage from '@/pages/WorkoutPage';
import ProgressPage from '@/pages/ProgressPage';
import {
  useMealEntries,
  useUserGoals,
  useBodyMeasurements,
  useWorkouts,
  useStreak,
} from '@/lib/store';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const { entries, addEntry, removeEntry, getDailyTotals } = useMealEntries();
  const { goals } = useUserGoals();
  const { measurements, addMeasurement } = useBodyMeasurements();
  const { workouts, addWorkout } = useWorkouts();
  const { streak } = useStreak();

  const today = new Date().toISOString().split('T')[0];
  const dailyTotals = getDailyTotals(today);

  const handleAddFood = (foodItem: any, quantity: number, mealType: any) => {
    addEntry({ foodItem, quantity, mealType, date: today });
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage dailyTotals={dailyTotals} goals={goals} streak={streak} onNavigate={(tab) => setActiveTab(tab as TabId)} />;
      case 'meals':
        return <MealsPage entries={entries} dailyTotals={dailyTotals} goals={goals} onAdd={handleAddFood} onRemove={removeEntry} />;
      case 'body':
        return <BodyPage measurements={measurements} onAdd={addMeasurement} />;
      case 'workout':
        return <WorkoutPage workouts={workouts} onAdd={addWorkout} />;
      case 'progress':
        return <ProgressPage streak={streak} workoutCount={workouts.length} />;
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
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
        </div>
      </div>
      {renderPage()}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
