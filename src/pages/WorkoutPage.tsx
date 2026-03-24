import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, ChevronRight, Plus, X, Check } from 'lucide-react';
import { Workout, SAMPLE_WORKOUTS, Exercise, ExerciseSet } from '@/lib/store';

interface WorkoutPageProps {
  workouts: Workout[];
  onAdd: (w: Omit<Workout, 'id'>) => void;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function RestTimer() {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);
  const [initial, setInitial] = useState(90);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, seconds]);

  const reset = () => { setSeconds(initial); setRunning(false); };

  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">Timer przerwy</span>
        </div>
        <div className="flex gap-1">
          {[60, 90, 120].map(t => (
            <button
              key={t}
              onClick={() => { setInitial(t); setSeconds(t); setRunning(false); }}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg ${initial === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <span className={`text-4xl font-black tabular-nums ${seconds <= 10 && seconds > 0 ? 'text-destructive' : 'text-foreground'}`}>
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </span>
      </div>
      <div className="flex justify-center gap-3 mt-3">
        <button onClick={() => setRunning(!running)} className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          {running ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
        </button>
        <button onClick={reset} className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
          <RotateCcw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

export default function WorkoutPage({ workouts, onAdd }: WorkoutPageProps) {
  const [activeWorkout, setActiveWorkout] = useState<{
    name: string;
    exercises: { name: string; sets: ExerciseSet[] }[];
  } | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  const startPlan = (plan: typeof SAMPLE_WORKOUTS[0]) => {
    setActiveWorkout({
      name: plan.name,
      exercises: plan.exercises.map(e => ({
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: 0, completed: false })),
      })),
    });
    setShowPlans(false);
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const sets = [...exercises[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], completed: !sets[setIdx].completed };
      exercises[exIdx] = { ...exercises[exIdx], sets };
      return { ...prev, exercises };
    });
  };

  const updateSetField = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const sets = [...exercises[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      exercises[exIdx] = { ...exercises[exIdx], sets };
      return { ...prev, exercises };
    });
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;
    onAdd({
      name: activeWorkout.name,
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      completed: true,
      exercises: activeWorkout.exercises.map((e, i) => ({
        id: String(i),
        name: e.name,
        sets: e.sets,
        restTime: 90,
      })),
    });
    setActiveWorkout(null);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Trening</h1>
          <p className="text-sm text-muted-foreground">
            {activeWorkout ? activeWorkout.name : 'Zacznij lub przeglądaj treningi'}
          </p>
        </div>
        {!activeWorkout && (
          <button onClick={() => setShowPlans(true)} className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        )}
      </motion.div>

      {activeWorkout ? (
        <>
          <motion.div variants={item}>
            <RestTimer />
          </motion.div>
          <div className="mt-4 space-y-3">
            {activeWorkout.exercises.map((ex, exIdx) => (
              <motion.div key={exIdx} variants={item} className="ios-card p-4">
                <h3 className="text-sm font-bold mb-3">{ex.name}</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-[10px] font-bold text-muted-foreground uppercase px-1">
                    <span>Set</span><span>Kg</span><span>Reps</span><span></span>
                  </div>
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center p-1.5 rounded-lg ${set.completed ? 'bg-primary/5' : ''}`}>
                      <span className="text-xs font-bold text-muted-foreground text-center">{setIdx + 1}</span>
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={e => updateSetField(exIdx, setIdx, 'weight', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={e => updateSetField(exIdx, setIdx, 'reps', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <button
                        onClick={() => toggleSet(exIdx, setIdx)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${set.completed ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <Check className={`w-4 h-4 ${set.completed ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => setActiveWorkout(null)} className="flex-1 py-3.5 bg-muted rounded-2xl font-bold text-sm text-muted-foreground">
              Anuluj
            </button>
            <button onClick={finishWorkout} className="flex-1 py-3.5 bg-primary rounded-2xl font-bold text-sm text-primary-foreground shadow-lg shadow-primary/25">
              Zakończ trening
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Recent workouts */}
          <motion.div variants={item}>
            <h3 className="ios-section-title mb-2">Ostatnie treningi</h3>
            <div className="space-y-2">
              {workouts.map(w => (
                <div key={w.id} className="ios-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{w.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(w.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} • {w.duration} min • {w.exercises.length} ćwiczeń
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
              {workouts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Brak treningów — zacznij pierwszy!</p>
              )}
            </div>
          </motion.div>

          {/* Plans */}
          <motion.div variants={item} className="mt-5">
            <h3 className="ios-section-title mb-2">Gotowe plany</h3>
            <div className="space-y-2">
              {SAMPLE_WORKOUTS.map((plan, i) => (
                <button
                  key={i}
                  onClick={() => startPlan(plan)}
                  className="ios-card p-4 w-full text-left flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <div>
                    <p className="text-sm font-bold">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.exercises.length} ćwiczeń</p>
                  </div>
                  <Play className="w-4 h-4 text-primary" />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Plans Sheet */}
      <AnimatePresence>
        {showPlans && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setShowPlans(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Wybierz plan</h3>
                <button onClick={() => setShowPlans(false)} className="p-1 rounded-full bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-2">
                {SAMPLE_WORKOUTS.map((plan, i) => (
                  <button key={i} onClick={() => startPlan(plan)} className="w-full ios-card p-4 text-left">
                    <p className="font-bold text-sm">{plan.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.exercises.map(e => e.name).join(', ')}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
