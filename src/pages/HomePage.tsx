import { motion } from 'framer-motion';
import { Flame, Zap, TrendingUp, AlertTriangle, CheckCircle2, Circle, Dumbbell } from 'lucide-react';
import FitnessRings from '@/components/FitnessRings';
import { UserGoals } from '@/lib/store';
import { TrainingPlan, WorkoutSession, ScheduledWorkout } from '@/lib/local-storage';

interface HomePageProps {
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number };
  goals: UserGoals;
  streak: number;
  onNavigate: (tab: string) => void;
  stagnationWarning?: string;
  plans: TrainingPlan[];
  scheduled: ScheduledWorkout[];
  workouts: WorkoutSession[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage({ dailyTotals, goals, streak, onNavigate, stagnationWarning, plans, scheduled, workouts }: HomePageProps) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('pl-PL', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });

  // Today's scheduled workouts
  const todayScheduled = scheduled.filter(s => s.date === todayStr);
  const todayPlans = todayScheduled
    .map(s => plans.find(p => p.id === s.planId))
    .filter(Boolean) as TrainingPlan[];

  // Check if a workout for a plan is completed today
  const isPlanCompletedToday = (plan: TrainingPlan) => {
    return workouts.some(w =>
      w.date === todayStr &&
      w.name === plan.name &&
      w.completed &&
      w.exercises.every(ex => ex.sets.every(s => s.completed))
    );
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      {/* Header with date + flame */}
      <motion.div variants={item} className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium capitalize">{dayName}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{dateStr}</h1>
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-accent/15 px-2 py-0.5 rounded-full">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stagnation warning */}
      {stagnationWarning && (
        <motion.div variants={item} className="ios-card p-4 mb-4 flex items-center gap-3 bg-accent/5 border border-accent/20">
          <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0" />
          <p className="text-xs font-medium text-foreground">{stagnationWarning}</p>
        </motion.div>
      )}

      {/* Apple Fitness Rings */}
      <motion.div variants={item} className="ios-card p-5 mb-4">
        <FitnessRings
          calories={{ current: dailyTotals.calories, target: goals.calorieTarget }}
          protein={{ current: dailyTotals.protein, target: goals.proteinTarget }}
          carbs={{ current: dailyTotals.carbs, target: goals.carbsTarget }}
          fat={{ current: dailyTotals.fat, target: goals.fatTarget }}
          size={200}
        />
      </motion.div>

      {/* Quick Actions - 3D tactile buttons */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => onNavigate('meals')}
          className="relative p-4 rounded-2xl text-left active:scale-[0.95] transition-all min-h-[44px]
            bg-gradient-to-b from-card to-muted border border-border/60
            shadow-[0_4px_12px_-2px_hsl(var(--foreground)/0.08),inset_0_1px_0_hsl(0_0%_100%/0.6)]
            dark:shadow-[0_4px_12px_-2px_hsl(var(--foreground)/0.2),inset_0_1px_0_hsl(0_0%_100%/0.05)]"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Zap className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-sm font-bold">Dodaj posiłek</p>
        </button>
        <button
          onClick={() => onNavigate('workout')}
          className="relative p-4 rounded-2xl text-left active:scale-[0.95] transition-all min-h-[44px]
            bg-gradient-to-b from-card to-muted border border-border/60
            shadow-[0_4px_12px_-2px_hsl(var(--foreground)/0.08),inset_0_1px_0_hsl(0_0%_100%/0.6)]
            dark:shadow-[0_4px_12px_-2px_hsl(var(--foreground)/0.2),inset_0_1px_0_hsl(0_0%_100%/0.05)]"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
            <TrendingUp className="w-4.5 h-4.5 text-accent" />
          </div>
          <p className="text-sm font-bold">Rozpocznij trening</p>
        </button>
      </motion.div>

      {/* Today's Plan */}
      <motion.div variants={item} className="ios-card p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" /> Twój dzisiejszy plan:
        </h3>
        {todayPlans.length > 0 ? (
          <div className="space-y-3">
            {todayPlans.map(plan => {
              const completed = isPlanCompletedToday(plan);
              return (
                <div key={plan.id} className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {dayName}, {dateStr}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-bold flex-1">{plan.name}</p>
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/30 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.exercises.length} ćwiczeń
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    Plan dodany do dzisiaj w Treningach
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Brak zaplanowanych treningów na dziś. Przejdź do kalendarza treningów, aby dodać plan.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
