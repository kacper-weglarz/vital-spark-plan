import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { ProfileInput, CalculatedTargets, calculateBMI, getBMICategory, ACTIVITY_OPTIONS, GOAL_OPTIONS } from '@/lib/calculator';
import { getMealSchedule, setMealSchedule, MealSlot } from '@/lib/local-storage';
import OnboardingStepper from '@/components/OnboardingStepper';

interface SettingsPageProps {
  profile: ProfileInput;
  targets: CalculatedTargets | null;
  onRecalculate: (profile: ProfileInput) => void;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage({ profile, targets, onRecalculate }: SettingsPageProps) {
  const [showStepper, setShowStepper] = useState(false);
  const [mealSlots, setLocalMealSlots] = useState<MealSlot[]>(getMealSchedule(profile.mealsPerDay));

  const bmi = useMemo(() => {
    if (profile.weight && profile.height) return calculateBMI(profile.weight, profile.height);
    return null;
  }, [profile.weight, profile.height]);

  const bmiInfo = useMemo(() => bmi ? getBMICategory(bmi) : null, [bmi]);

  const handleSlotChange = (idx: number, field: 'label' | 'time', value: string) => {
    const updated = mealSlots.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setLocalMealSlots(updated);
    setMealSchedule(updated);
  };

  if (showStepper) {
    return (
      <OnboardingStepper
        onComplete={(p) => {
          onRecalculate(p);
          setLocalMealSlots(getMealSchedule(p.mealsPerDay));
          setShowStepper(false);
        }}
      />
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="mb-5">
        <h1 className="text-2xl font-bold">Ustawienia</h1>
        <p className="text-sm text-muted-foreground">Cześć, {profile.name}!</p>
      </motion.div>

      {/* Cele dzienne */}
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
            {targets.monthlyWeightChange !== 0 && (
              <p>Szacowana zmiana: {targets.monthlyWeightChange > 0 ? '+' : ''}{targets.monthlyWeightChange} kg/msc</p>
            )}
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
            <div className="h-full bg-gradient-to-r from-accent via-primary via-50% via-yellow-500 to-destructive" style={{ width: '100%' }} />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
            <span>16</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
          </div>
        </motion.div>
      )}

      {/* Dane osobiste */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Dane osobiste</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Imię</span><span className="font-semibold">{profile.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Płeć</span><span className="font-semibold">{profile.gender === 'male' ? 'Mężczyzna' : 'Kobieta'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Waga</span><span className="font-semibold">{profile.weight} kg</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Wzrost</span><span className="font-semibold">{profile.height} cm</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Wiek</span><span className="font-semibold">{profile.age} lat</span></div>
        </div>
      </motion.div>

      {/* Meal schedule */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Układ posiłków ({profile.mealsPerDay})</h3>
        <div className="space-y-3">
          {mealSlots.map((slot, idx) => (
            <div key={slot.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={slot.label}
                onChange={e => handleSlotChange(idx, 'label', e.target.value)}
                className="flex-1 px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="time"
                value={slot.time}
                onChange={e => handleSlotChange(idx, 'time', e.target.value)}
                className="w-24 px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
