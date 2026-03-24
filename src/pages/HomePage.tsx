import { motion } from 'framer-motion';
import { Flame, TrendingUp, Calendar, ChevronRight, Zap } from 'lucide-react';
import CalorieRing from '@/components/CalorieRing';
import MacroBar from '@/components/MacroBar';
import { UserGoals } from '@/lib/store';

interface HomePageProps {
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number };
  goals: UserGoals;
  streak: number;
  onNavigate: (tab: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage({ dailyTotals, goals, streak, onNavigate }: HomePageProps) {
  const today = new Date();
  const dayName = today.toLocaleDateString('pl-PL', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
  const remaining = goals.calorieTarget - dailyTotals.calories;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      {/* Header */}
      <motion.div variants={item} className="mb-6">
        <p className="text-sm text-muted-foreground font-medium capitalize">{dayName}</p>
        <h1 className="text-2xl font-bold text-foreground">{dateStr}</h1>
      </motion.div>

      {/* Streak Banner */}
      <motion.div variants={item} className="ios-card-elevated p-4 mb-4 flex items-center gap-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center">
          <Flame className="w-6 h-6 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{streak} dni z rzędu! 🔥</p>
          <p className="text-xs text-muted-foreground">Świetna passa, nie przerywaj!</p>
        </div>
        <div className="text-2xl font-black text-accent">{streak}</div>
      </motion.div>

      {/* Calorie Summary */}
      <motion.div variants={item} className="ios-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Dzisiejsze kalorie</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${remaining > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            {remaining > 0 ? `Zostało ${Math.round(remaining)}` : `Przekroczono o ${Math.round(-remaining)}`}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <CalorieRing current={dailyTotals.calories} target={goals.calorieTarget} />
          <div className="flex-1 space-y-3">
            <MacroBar label="Białko" current={dailyTotals.protein} target={goals.proteinTarget} color="protein" />
            <MacroBar label="Węglowodany" current={dailyTotals.carbs} target={goals.carbsTarget} color="carbs" />
            <MacroBar label="Tłuszcze" current={dailyTotals.fat} target={goals.fatTarget} color="fat" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={() => onNavigate('meals')} className="ios-card p-4 text-left active:scale-[0.97] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-bold">Dodaj posiłek</p>
          <p className="text-xs text-muted-foreground mt-0.5">Śledź kalorie</p>
        </button>
        <button onClick={() => onNavigate('workout')} className="ios-card p-4 text-left active:scale-[0.97] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <p className="text-sm font-bold">Zacznij trening</p>
          <p className="text-xs text-muted-foreground mt-0.5">Push / Pull / Legs</p>
        </button>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Ostatnia aktywność</h3>
          <button onClick={() => onNavigate('progress')} className="text-xs font-semibold text-primary flex items-center gap-0.5">
            Zobacz więcej <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {[
            { icon: '🏋️', title: 'Push Day', subtitle: 'Wczoraj • 65 min', value: '6 ćwiczeń' },
            { icon: '📏', title: 'Pomiar wagi', subtitle: 'Wczoraj • 80.5 kg', value: '-0.5 kg' },
            { icon: '🍽️', title: 'Cel kaloryczny', subtitle: 'Wczoraj', value: '✅ Osiągnięty' },
          ].map((act, i) => (
            <div key={i} className="ios-card p-3.5 flex items-center gap-3">
              <span className="text-xl">{act.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{act.title}</p>
                <p className="text-xs text-muted-foreground">{act.subtitle}</p>
              </div>
              <span className="text-xs font-bold text-primary">{act.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Check-in */}
      <motion.div variants={item} className="mt-4 ios-card p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Tydzień
        </h3>
        <div className="flex justify-between">
          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day, i) => {
            const isToday = i === (today.getDay() + 6) % 7;
            const completed = i <= (today.getDay() + 6) % 7;
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isToday ? 'bg-primary text-primary-foreground' : completed ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {completed ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
