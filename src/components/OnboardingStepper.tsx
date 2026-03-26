import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { ProfileInput, Gender, Goal, ActivityLevel, ACTIVITY_OPTIONS, GOAL_OPTIONS } from '@/lib/calculator';

interface OnboardingStepperProps {
  onComplete: (profile: ProfileInput) => void;
}

const STEPS = ['name', 'gender', 'body', 'age', 'activity', 'goal', 'meals'] as const;
type Step = typeof STEPS[number];

export default function OnboardingStepper({ onComplete }: OnboardingStepperProps) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>(1.55);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [mealsPerDay, setMealsPerDay] = useState(4);

  const current = STEPS[step];

  const canNext = () => {
    switch (current) {
      case 'name': return name.trim().length > 0;
      case 'body': return Number(weight) > 0 && Number(height) > 0;
      case 'age': return Number(age) > 0 && Number(age) < 120;
      default: return true;
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) { setDir(1); setStep(s => s + 1); }
    else finish();
  };

  const prev = () => {
    if (step > 0) { setDir(-1); setStep(s => s - 1); }
  };

  const finish = () => {
    onComplete({
      name: name.trim(),
      gender,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      activityLevel: activity,
      goal,
      mealsPerDay,
    });
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const renderStep = () => {
    switch (current) {
      case 'name':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Jak masz na imię? 👋</h2>
            <p className="text-sm text-muted-foreground">Spersonalizujemy aplikację dla Ciebie</p>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Twoje imię"
              autoFocus
              className="w-full px-4 py-4 bg-muted rounded-2xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        );
      case 'gender':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Płeć biologiczna</h2>
            <p className="text-sm text-muted-foreground">Potrzebna do obliczenia metabolizmu</p>
            <div className="grid grid-cols-2 gap-3">
              {([['male', 'Mężczyzna', '🧔'], ['female', 'Kobieta', '👩']] as const).map(([v, l, e]) => (
                <button key={v} onClick={() => setGender(v)}
                  className={`p-5 rounded-2xl text-center transition-all ${gender === v ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20' : 'bg-muted border-2 border-transparent'}`}>
                  <span className="text-3xl block mb-2">{e}</span>
                  <span className="text-sm font-bold">{l}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'body':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Dane ciała 📏</h2>
            <p className="text-sm text-muted-foreground">Waga i wzrost do obliczeń BMR</p>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Waga (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="80"
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
            <h2 className="text-2xl font-bold">Ile masz lat? 🎂</h2>
            <p className="text-sm text-muted-foreground">Wiek wpływa na metabolizm</p>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25"
              className="w-full px-4 py-4 bg-muted rounded-2xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Aktywność 🏃</h2>
            <p className="text-sm text-muted-foreground">Jak aktywny jesteś na co dzień?</p>
            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setActivity(opt.value)}
                  className={`w-full p-4 rounded-2xl text-left transition-all ${activity === opt.value
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-muted border-2 border-transparent'
                  }`}>
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
            <p className="text-sm text-muted-foreground">Dopasujemy kalorie do celu</p>
            <div className="space-y-2">
              {GOAL_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setGoal(opt.value)}
                  className={`w-full p-5 rounded-2xl text-left transition-all ${goal === opt.value
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-muted border-2 border-transparent'
                  }`}>
                  <span className="text-xl mr-2">{opt.emoji}</span>
                  <span className="text-base font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'meals':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ile posiłków dziennie? 🍽️</h2>
            <p className="text-sm text-muted-foreground">Ułożymy schemat posiłków</p>
            <div className="flex items-center justify-center gap-6 py-8">
              <button onClick={() => setMealsPerDay(Math.max(1, mealsPerDay - 1))}
                className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-foreground">−</button>
              <span className="text-5xl font-black text-primary">{mealsPerDay}</span>
              <button onClick={() => setMealsPerDay(Math.min(8, mealsPerDay + 1))}
                className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-foreground">+</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8 max-w-lg mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
          <span className="text-lg font-black text-primary-foreground">FT</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={prev} className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={next}
          disabled={!canNext()}
          className="flex-1 h-14 bg-primary rounded-2xl text-primary-foreground font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-40"
        >
          {step === STEPS.length - 1 ? (
            <><Check className="w-5 h-5" /> Zakończ</>
          ) : (
            <><span>Dalej</span> <ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
