import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, ChevronRight, ChevronLeft, Plus, X, Check, Trash2, Calendar, Edit3 } from 'lucide-react';
import { PlanExercise, ExerciseSet } from '@/lib/store';

interface DBWorkout {
  id: string;
  name: string;
  date: string;
  duration: number;
  completed: boolean;
  [key: string]: any;
}

interface WorkoutPlan {
  id: string;
  name: string;
  exercises: PlanExercise[];
}

interface WorkoutPageProps {
  workouts: DBWorkout[];
  onAdd: (w: any) => void;
  plans: WorkoutPlan[];
  onAddPlan: (p: any) => void;
  onUpdatePlan: (id: string, p: any) => void;
  onRemovePlan: (id: string) => void;
  scheduled: { date: string; planId: string }[];
  onSchedule: (date: string, planId: string) => void;
  onRemoveSchedule: (date: string) => void;
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
            <button key={t} onClick={() => { setInitial(t); setSeconds(t); setRunning(false); }}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg ${initial === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
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

type ViewMode = 'main' | 'plan-editor' | 'active-workout' | 'calendar';

export default function WorkoutPage({ workouts, onAdd, plans, onAddPlan, onUpdatePlan, onRemovePlan, scheduled, onSchedule, onRemoveSchedule }: WorkoutPageProps) {
  const [view, setView] = useState<ViewMode>('main');
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<{ name: string; exercises: { name: string; sets: ExerciseSet[] }[] } | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const openNewPlan = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanExercises([]);
    setView('plan-editor');
  };

  const openEditPlan = (plan: TrainingPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanExercises([...plan.exercises]);
    setView('plan-editor');
  };

  const addExercise = () => {
    setPlanExercises(prev => [...prev, { id: Date.now().toString(), name: '', sets: 3, reps: 10, restTime: 90, weight: 0 }]);
  };

  const updateExercise = (idx: number, field: keyof PlanExercise, value: any) => {
    setPlanExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const removeExercise = (idx: number) => {
    setPlanExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const savePlan = () => {
    if (!planName.trim() || planExercises.length === 0) return;
    if (editingPlan) {
      onUpdatePlan(editingPlan.id, { name: planName, exercises: planExercises });
    } else {
      onAddPlan({ name: planName, exercises: planExercises });
    }
    setView('main');
  };

  const startPlan = (plan: TrainingPlan) => {
    setActiveWorkout({
      name: plan.name,
      exercises: plan.exercises.map(e => ({
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: e.weight, completed: false })),
      })),
    });
    setView('active-workout');
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
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
      exercises: activeWorkout.exercises.map((e, i) => ({ id: String(i), name: e.name, sets: e.sets, restTime: 90 })),
    });
    setActiveWorkout(null);
    setView('main');
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];
    const startPad = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    return days;
  };

  const formatDateStr = (day: number) => {
    const y = calendarMonth.getFullYear();
    const m = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-${String(day).padStart(2, '0')}`;
  };

  // Plan editor view
  if (view === 'plan-editor') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-2 pb-28">
        <button onClick={() => setView('main')} className="flex items-center gap-1 text-sm font-semibold text-primary mb-4">
          <ChevronLeft className="w-4 h-4" /> Powrót
        </button>
        <h2 className="text-xl font-bold mb-4">{editingPlan ? 'Edytuj plan' : 'Nowy plan treningowy'}</h2>
        <div className="mb-4">
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nazwa planu</label>
          <input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="np. Push Day"
            className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="space-y-3 mb-4">
          {planExercises.map((ex, idx) => (
            <div key={ex.id} className="ios-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">Ćwiczenie {idx + 1}</span>
                <button onClick={() => removeExercise(idx)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
              <input value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} placeholder="Nazwa ćwiczenia"
                className="w-full px-3 py-2 bg-muted rounded-xl text-sm font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Serie</label>
                  <input type="number" value={ex.sets} onChange={e => updateExercise(idx, 'sets', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Powt.</label>
                  <input type="number" value={ex.reps} onChange={e => updateExercise(idx, 'reps', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Ciężar</label>
                  <input type="number" value={ex.weight || ''} onChange={e => updateExercise(idx, 'weight', Number(e.target.value))}
                    placeholder="kg" className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Przerwa</label>
                  <input type="number" value={ex.restTime} onChange={e => updateExercise(idx, 'restTime', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addExercise} className="w-full py-3 bg-muted rounded-2xl text-sm font-bold text-muted-foreground mb-3 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Dodaj ćwiczenie
        </button>
        <button onClick={savePlan} className="w-full py-3.5 bg-primary rounded-2xl text-primary-foreground font-bold shadow-lg shadow-primary/25">
          {editingPlan ? 'Zapisz zmiany' : 'Utwórz plan'}
        </button>
      </motion.div>
    );
  }

  // Active workout view
  if (view === 'active-workout' && activeWorkout) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-2 pb-28">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">Trening</h1>
            <p className="text-sm text-muted-foreground">{activeWorkout.name}</p>
          </div>
        </div>
        <RestTimer />
        <div className="mt-4 space-y-3">
          {activeWorkout.exercises.map((ex, exIdx) => (
            <div key={exIdx} className="ios-card p-4">
              <h3 className="text-sm font-bold mb-3">{ex.name}</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-[10px] font-bold text-muted-foreground uppercase px-1">
                  <span>Set</span><span>Kg</span><span>Reps</span><span></span>
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center p-1.5 rounded-lg ${set.completed ? 'bg-primary/5' : ''}`}>
                    <span className="text-xs font-bold text-muted-foreground text-center">{setIdx + 1}</span>
                    <input type="number" value={set.weight || ''} onChange={e => updateSetField(exIdx, setIdx, 'weight', Number(e.target.value))} placeholder="0"
                      className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none focus:ring-1 focus:ring-primary/30" />
                    <input type="number" value={set.reps || ''} onChange={e => updateSetField(exIdx, setIdx, 'reps', Number(e.target.value))} placeholder="0"
                      className="w-full px-2 py-1.5 bg-muted rounded-lg text-sm font-semibold text-center focus:outline-none focus:ring-1 focus:ring-primary/30" />
                    <button onClick={() => toggleSet(exIdx, setIdx)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${set.completed ? 'bg-primary' : 'bg-muted'}`}>
                      <Check className={`w-4 h-4 ${set.completed ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={() => { setActiveWorkout(null); setView('main'); }} className="flex-1 py-3.5 bg-muted rounded-2xl font-bold text-sm text-muted-foreground">Anuluj</button>
          <button onClick={finishWorkout} className="flex-1 py-3.5 bg-primary rounded-2xl font-bold text-sm text-primary-foreground shadow-lg shadow-primary/25">Zakończ trening</button>
        </div>
      </motion.div>
    );
  }

  // Calendar view
  if (view === 'calendar') {
    const days = getDaysInMonth(calendarMonth);
    const monthLabel = calendarMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-2 pb-28">
        <button onClick={() => setView('main')} className="flex items-center gap-1 text-sm font-semibold text-primary mb-4">
          <ChevronLeft className="w-4 h-4" /> Powrót
        </button>
        <h2 className="text-xl font-bold mb-4">Kalendarz treningów</h2>
        <div className="ios-card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
              className="p-1"><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
            <span className="text-sm font-bold capitalize">{monthLabel}</span>
            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
              className="p-1"><ChevronRight className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
              <span key={d} className="text-[10px] font-bold text-muted-foreground text-center">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = formatDateStr(day);
              const hasSchedule = scheduled.some(s => s.date === dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              return (
                <button key={i} onClick={() => setSelectedDate(dateStr)}
                  className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold relative
                    ${isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-primary/10 text-primary' : 'text-foreground'}
                  `}>
                  {day}
                  {hasSchedule && <div className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? 'bg-primary-foreground' : 'bg-accent'}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date details */}
        {selectedDate && (
          <div className="ios-card p-4">
            <p className="text-sm font-bold mb-3">{new Date(selectedDate + 'T00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            {(() => {
              const sw = scheduled.find(s => s.date === selectedDate);
              const plan = sw ? plans.find(p => p.id === sw.planId) : null;
              if (plan) {
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-primary">{plan.name}</span>
                      <button onClick={() => onRemoveSchedule(selectedDate)} className="text-xs text-destructive font-semibold">Usuń</button>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.exercises.length} ćwiczeń</p>
                  </div>
                );
              }
              return (
                <div>
                  <p className="text-xs text-muted-foreground mb-3">Brak przypisanego treningu</p>
                  <div className="space-y-2">
                    {plans.map(p => (
                      <button key={p.id} onClick={() => onSchedule(selectedDate, p.id)}
                        className="w-full p-3 bg-muted rounded-xl text-left text-sm font-semibold active:scale-[0.98] transition-transform">
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </motion.div>
    );
  }

  // Main view
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Trening</h1>
          <p className="text-sm text-muted-foreground">Zacznij lub przeglądaj treningi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('calendar')} className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={openNewPlan} className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </motion.div>

      {/* Plans */}
      <motion.div variants={item}>
        <h3 className="ios-section-title mb-2">Twoje plany</h3>
        <div className="space-y-2 mb-5">
          {plans.map(plan => (
            <div key={plan.id} className="ios-card p-4 flex items-center gap-3">
              <button onClick={() => startPlan(plan)} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Play className="w-5 h-5 text-primary" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{plan.exercises.length} ćwiczeń</p>
              </div>
              <button onClick={() => openEditPlan(plan)} className="p-2 text-muted-foreground"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => onRemovePlan(plan.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {plans.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Brak planów — utwórz pierwszy!</p>}
        </div>
      </motion.div>

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
          {workouts.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Brak treningów — zacznij pierwszy!</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}
