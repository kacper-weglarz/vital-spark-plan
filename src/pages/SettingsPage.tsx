import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Scale, Ruler, User, Calendar, ChevronLeft, ChevronRight, Check, Bell, BellOff, Sun, Moon, Monitor, Palette } from 'lucide-react';
import { ProfileInput, CalculatedTargets, calculateBMI, getBMICategory, calculateTargets, ACTIVITY_OPTIONS, GOAL_OPTIONS, ActivityLevel, Goal } from '@/lib/calculator';
import { getProfile } from '@/lib/local-storage';

interface SettingsPageProps {
  profile: ProfileInput;
  targets: CalculatedTargets | null;
  onRecalculate: (profile: ProfileInput) => void;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

// Color themes
const COLOR_THEMES = [
  { name: 'Zielony', hue: '160 84% 39%', ring: '160 84% 39%' },
  { name: 'Różowy', hue: '340 82% 52%', ring: '340 82% 52%' },
  { name: 'Niebieski', hue: '210 90% 50%', ring: '210 90% 50%' },
  { name: 'Beżowy', hue: '30 50% 50%', ring: '30 50% 50%' },
  { name: 'Zinc', hue: '220 15% 50%', ring: '220 15% 50%' },
];

type ThemeMode = 'light' | 'dark' | 'system';

interface Reminder {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

function getStoredTheme(): ThemeMode {
  return (localStorage.getItem('ft_theme_mode') as ThemeMode) || 'system';
}
function getStoredColor(): number {
  return Number(localStorage.getItem('ft_theme_color') || '0');
}
function getStoredReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem('ft_reminders');
    return raw ? JSON.parse(raw) : [
      { id: '1', label: 'Śniadanie', time: '07:00', enabled: false },
      { id: '2', label: 'Trening', time: '17:00', enabled: false },
      { id: '3', label: 'Kolacja', time: '19:00', enabled: false },
    ];
  } catch { return []; }
}

// Recalc stepper (shorter, no name/gender)
function RecalcStepper({ profile, onComplete, onCancel }: { profile: ProfileInput; onComplete: (p: ProfileInput) => void; onCancel: () => void }) {
  const STEPS = ['body', 'age', 'activity', 'goal', 'pace'] as const;
  type Step = typeof STEPS[number];
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [weight, setWeight] = useState(String(profile.weight));
  const [height, setHeight] = useState(String(profile.height));
  const [age, setAge] = useState(String(profile.age));
  const [activity, setActivity] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [mealsPerDay, setMealsPerDay] = useState(profile.mealsPerDay);
  const [monthlyKg, setMonthlyKg] = useState(0.8);

  const current = STEPS[step];

  // Skip pace step if maintain
  const shouldShowPace = goal !== 'maintain';
  const effectiveSteps = shouldShowPace ? STEPS : STEPS.filter(s => s !== 'pace');
  const effectiveStep = effectiveSteps[step];
  const isLast = step === effectiveSteps.length - 1;

  const canNext = () => {
    if (effectiveStep === 'body') return Number(weight) > 0 && Number(height) > 0;
    if (effectiveStep === 'age') return Number(age) > 0 && Number(age) < 120;
    return true;
  };

  const next = () => {
    if (isLast) finish();
    else { setDir(1); setStep(s => s + 1); }
  };
  const prev = () => { if (step > 0) { setDir(-1); setStep(s => s - 1); } else onCancel(); };

  const finish = () => {
    onComplete({
      ...profile, // keep name and gender from localStorage
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      activityLevel: activity,
      goal,
      mealsPerDay,
      monthlyChange: shouldShowPace ? monthlyKg : undefined,
    } as any);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const renderStep = () => {
    switch (effectiveStep) {
      case 'body':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Aktualne dane 📏</h2>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Waga (kg)</label>
              <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="80"
                className="w-full px-4 py-4 bg-muted rounded-2xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Wzrost (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="178"
                className="w-full px-4 py-4 bg-muted rounded-2xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        );
      case 'age':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Wiek 🎂</h2>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25"
              className="w-full px-4 py-4 bg-muted rounded-2xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Aktywność 🏃</h2>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setActivity(opt.value)}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${activity === opt.value
                    ? 'bg-primary/10 border-2 border-primary' : 'bg-muted border-2 border-transparent'}`}>
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 'goal':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Twój cel 🎯</h2>
            <div className="space-y-2">
              {GOAL_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setGoal(opt.value)}
                  className={`w-full p-5 rounded-2xl text-left transition-all ${goal === opt.value
                    ? 'bg-primary/10 border-2 border-primary' : 'bg-muted border-2 border-transparent'}`}>
                  <span className="text-xl mr-2">{opt.emoji}</span>
                  <span className="text-base font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Ilość posiłków dziennie</label>
              <div className="flex items-center justify-center gap-6 py-4">
                <button onClick={() => setMealsPerDay(Math.max(1, mealsPerDay - 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg font-bold">−</button>
                <span className="text-3xl font-black text-primary">{mealsPerDay}</span>
                <button onClick={() => setMealsPerDay(Math.min(8, mealsPerDay + 1))} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg font-bold">+</button>
              </div>
            </div>
          </div>
        );
      case 'pace':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{goal === 'cut' ? 'Tempo redukcji' : 'Tempo budowy masy'} ⚡</h2>
            <p className="text-sm text-muted-foreground">Ile kg miesięcznie chcesz {goal === 'cut' ? 'schudnąć' : 'przytyć'}?</p>
            <div className="py-6 text-center">
              <span className="text-5xl font-black text-primary">{monthlyKg.toFixed(1)}</span>
              <span className="text-lg text-muted-foreground ml-1">kg/msc</span>
            </div>
            <input type="range" min="0.5" max="1.0" step="0.1" value={monthlyKg}
              onChange={e => setMonthlyKg(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5 kg</span><span>1.0 kg</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 max-w-lg mx-auto">
      <div className="flex gap-1.5 mb-8">
        {effectiveSteps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-3 mt-8">
        <button onClick={prev} className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <button onClick={next} disabled={!canNext()}
          className="flex-1 h-14 bg-primary rounded-2xl text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-40">
          {isLast ? <><Check className="w-5 h-5" /> Przelicz</> : <><span>Dalej</span> <ChevronRight className="w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage({ profile, targets, onRecalculate }: SettingsPageProps) {
  const [showStepper, setShowStepper] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme);
  const [colorIdx, setColorIdx] = useState(getStoredColor);
  const [reminders, setReminders] = useState<Reminder[]>(getStoredReminders);

  const bmi = useMemo(() => {
    if (profile.weight && profile.height) return calculateBMI(profile.weight, profile.height);
    return null;
  }, [profile.weight, profile.height]);

  const bmiInfo = useMemo(() => bmi ? getBMICategory(bmi) : null, [bmi]);

  // Apply theme mode
  useEffect(() => {
    localStorage.setItem('ft_theme_mode', themeMode);
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (themeMode === 'dark') root.classList.add('dark');
    else if (themeMode === 'light') root.classList.remove('dark');
    else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
    }
  }, [themeMode]);

  // Apply color theme
  useEffect(() => {
    localStorage.setItem('ft_theme_color', String(colorIdx));
    const theme = COLOR_THEMES[colorIdx];
    if (theme) {
      document.documentElement.style.setProperty('--primary', theme.hue);
      document.documentElement.style.setProperty('--ring', theme.ring);
      document.documentElement.style.setProperty('--calories-ring', theme.ring);
    }
  }, [colorIdx]);

  // Save reminders
  useEffect(() => {
    localStorage.setItem('ft_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r;
      const newEnabled = !r.enabled;
      if (newEnabled && 'Notification' in window) {
        Notification.requestPermission();
      }
      return { ...r, enabled: newEnabled };
    }));
  };

  const updateReminderTime = (id: string, time: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, time } : r));
  };

  const addReminder = () => {
    setReminders(prev => [...prev, { id: Date.now().toString(), label: 'Nowe', time: '12:00', enabled: false }]);
  };

  const updateReminderLabel = (id: string, label: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, label } : r));
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  if (showStepper) {
    return (
      <RecalcStepper
        profile={profile}
        onComplete={(p) => {
          onRecalculate(p);
          setShowStepper(false);
        }}
        onCancel={() => setShowStepper(false)}
      />
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="mb-5">
        <h1 className="text-2xl font-bold">Ustawienia</h1>
        <p className="text-sm text-muted-foreground">Cześć, {profile.name}!</p>
      </motion.div>

      {/* Daily targets */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Cele dzienne</h3>
          <button onClick={() => setShowStepper(true)} className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl min-h-[44px]">
            <RefreshCw className="w-3.5 h-3.5" /> Przelicz
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-primary">{targets?.calories ?? '—'}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">kcal</p>
          </div>
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-2xl font-black macro-protein">{targets?.protein ?? '—'}g</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Białko</p>
          </div>
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-2xl font-black macro-carbs">{targets?.carbs ?? '—'}g</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Węglowodany</p>
          </div>
          <div className="bg-muted rounded-2xl p-3 text-center">
            <p className="text-2xl font-black macro-fat">{targets?.fat ?? '—'}g</p>
            <p className="text-[10px] text-muted-foreground font-semibold">Tłuszcze</p>
          </div>
        </div>
        {targets && (
          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <p>BMR: {targets.bmr} kcal • TDEE: {targets.tdee} kcal</p>
            <p>Cel: {GOAL_OPTIONS.find(g => g.value === profile.goal)?.label} • Aktywność: {ACTIVITY_OPTIONS.find(a => a.value === profile.activityLevel)?.label}</p>
          </div>
        )}
      </motion.div>

      {/* BMI */}
      {bmi && bmiInfo && (
        <motion.div variants={item} className="ios-card p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">Kalkulator BMI</h3>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-black ${bmiInfo.color}`}>{bmi}</div>
            <div>
              <p className={`text-sm font-bold ${bmiInfo.color}`}>{bmiInfo.label}</p>
              <p className="text-xs text-muted-foreground">{profile.weight} kg / {profile.height} cm</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent via-primary via-50% to-destructive" style={{ width: '100%' }} />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
            <span>16</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
          </div>
        </motion.div>
      )}

      {/* Personal data - widget style */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Dane osobiste</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/60 rounded-xl p-3 text-center">
            <Scale className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold">{profile.weight}</p>
            <p className="text-[9px] text-muted-foreground">kg</p>
          </div>
          <div className="bg-muted/60 rounded-xl p-3 text-center">
            <Ruler className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold">{profile.height}</p>
            <p className="text-[9px] text-muted-foreground">cm</p>
          </div>
          <div className="bg-muted/60 rounded-xl p-3 text-center">
            <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold">{profile.age}</p>
            <p className="text-[9px] text-muted-foreground">lat</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
          <span className="bg-muted px-2 py-1 rounded-lg">{profile.gender === 'male' ? '♂ Mężczyzna' : '♀ Kobieta'}</span>
          <span className="bg-muted px-2 py-1 rounded-lg">{profile.name}</span>
        </div>
      </motion.div>

      {/* Reminders */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Przypomnienia</h3>
          <button onClick={addReminder} className="text-xs font-bold text-primary min-h-[44px] px-2">+ Dodaj</button>
        </div>
        <div className="space-y-2">
          {reminders.map(r => (
            <div key={r.id} className="flex items-center gap-2">
              <input type="text" value={r.label} onChange={e => updateReminderLabel(r.id, e.target.value)}
                className="flex-1 px-3 py-2 bg-muted rounded-xl text-sm font-semibold focus:outline-none min-w-0" />
              <input type="time" value={r.time} onChange={e => updateReminderTime(r.id, e.target.value)}
                className="w-20 px-2 py-2 bg-muted rounded-xl text-sm font-semibold focus:outline-none" />
              <button onClick={() => toggleReminder(r.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center min-w-[44px] min-h-[44px] ${r.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                {r.enabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={() => removeReminder(r.id)} className="text-xs text-destructive font-semibold min-h-[44px] px-1">×</button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Wygląd aplikacji</h3>

        {/* Theme mode */}
        <p className="text-xs text-muted-foreground mb-2">Tryb</p>
        <div className="flex gap-2 mb-4">
          {([
            { mode: 'light' as ThemeMode, icon: Sun, label: 'Jasny' },
            { mode: 'dark' as ThemeMode, icon: Moon, label: 'Ciemny' },
            { mode: 'system' as ThemeMode, icon: Monitor, label: 'System' },
          ]).map(({ mode, icon: Icon, label }) => (
            <button key={mode} onClick={() => setThemeMode(mode)}
              className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 text-xs font-semibold transition-all min-h-[44px]
                ${themeMode === mode ? 'bg-primary/10 border-2 border-primary text-primary' : 'bg-muted border-2 border-transparent text-muted-foreground'}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Color palette */}
        <p className="text-xs text-muted-foreground mb-2">Kolor wiodący</p>
        <div className="flex gap-3 justify-center">
          {COLOR_THEMES.map((theme, i) => (
            <button key={i} onClick={() => setColorIdx(i)}
              className={`w-10 h-10 rounded-full transition-all min-w-[44px] min-h-[44px] ${colorIdx === i ? 'ring-2 ring-offset-2 ring-foreground/30' : ''}`}
              style={{ backgroundColor: `hsl(${theme.hue})` }}
              title={theme.name} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
