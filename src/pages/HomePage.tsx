import { motion } from 'framer-motion';
import { Flame, Zap, Rocket, CheckCircle2, Circle, Dumbbell, Utensils } from 'lucide-react';
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

      {/* Consolidated Daily Plan Card */}
      <motion.div variants={item} className="ios-card p-4">
        {/* Date + streak */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground capitalize">{dateStr} <span className="text-muted-foreground font-medium capitalize">{dayName}</span></p>
            {streak > 0 && (
              <div className="flex items-center gap-0.5 bg-accent/15 px-1.5 py-0.5 rounded-full">
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-bold text-accent">{streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stagnation warning */}
        {stagnationWarning && (
          <div className="p-3 mb-3 bg-accent/5 border border-accent/20 rounded-xl">
            <p className="text-xs font-medium text-foreground">{stagnationWarning}</p>
          </div>
        )}

        {/* Today's workout section */}
        <div className="mb-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-primary" /> Twój dzisiejszy plan:
          </h3>
          {todayPlans.length > 0 ? (
            <div className="space-y-2">
              {todayPlans.map(plan => {
                const completed = isPlanCompletedToday(plan);
                return (
                  <div key={plan.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate">{plan.name}</p>
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.exercises.length} ćwiczeń</p>
                    </div>
                    <button
                      onClick={() => onNavigate('workout')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 rounded-xl text-xs font-bold text-primary min-h-[36px] active:scale-95 transition-transform"
                    >
                      <Rocket className="w-3.5 h-3.5" /> Start
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              Brak zaplanowanych treningów. Przejdź do kalendarza.
            </p>
          )}
        </div>

        {/* Add meal action */}
        <button
          onClick={() => onNavigate('meals')}
          className="w-full flex items-center gap-3 p-3 bg-muted/50 rounded-xl active:scale-[0.98] transition-transform min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold">Dodaj posiłek</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
