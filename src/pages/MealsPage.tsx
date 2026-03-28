import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Sunrise, Sun, Cloud, Moon, Coffee, Salad, MoreVertical, Copy } from 'lucide-react';
import CalorieRing from '@/components/CalorieRing';
import AddFoodSheet from '@/components/AddFoodSheet';
import { UserGoals } from '@/lib/store';
import { ProfileInput } from '@/lib/calculator';
import { getMealSchedule, MealEntry, Product, getAllMeals, addMeal } from '@/lib/local-storage';

interface MealsPageProps {
  meals: MealEntry[];
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number };
  goals: UserGoals;
  onAdd: (product: Product, quantity: number, unit: string, mealType: string) => void;
  onRemove: (id: string) => void;
  profile: ProfileInput;
  onRefresh?: () => void;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const MEAL_ICONS = [Sunrise, Coffee, Sun, Moon, Cloud, Salad];
const OVERAGE_COLOR = '#faacba';

function MacroProgressBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const exceeded = current > target;
  const progress = Math.min(current / (target || 1), 1);
  const overageProgress = exceeded ? Math.min((current - target) / (target || 1), 1) : 0;

  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color: exceeded ? OVERAGE_COLOR : color }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: exceeded ? OVERAGE_COLOR : color }}>
          {Math.round(current)}/{target}g
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress * 100}%`, backgroundColor: color }} />
        {exceeded && (
          <div className="h-full rounded-full absolute top-0 transition-all duration-500"
            style={{ left: `${progress * 100}%`, width: `${overageProgress * 100}%`, backgroundColor: OVERAGE_COLOR }} />
        )}
      </div>
    </div>
  );
}

export default function MealsPage({ meals, dailyTotals: _externalTotals, goals, onAdd, onRemove, profile, onRefresh }: MealsPageProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState('meal_0');
  const [activeMealLabel, setActiveMealLabel] = useState('Posiłek');
  const [copyMenuId, setCopyMenuId] = useState<string | null>(null);
  const [copyModalEntry, setCopyModalEntry] = useState<MealEntry | null>(null);
  const [copyDate, setCopyDate] = useState('');
  const [copyMealType, setCopyMealType] = useState('meal_0');

  // Day slider
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        date: d.toISOString().split('T')[0],
        dayLetter: d.toLocaleDateString('pl-PL', { weekday: 'narrow' }).toUpperCase(),
        dayNum: d.getDate(),
        isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
      };
    });
  }, []);

  // Filter meals for selected date
  const allMeals = getAllMeals();
  const dateMeals = allMeals.filter(m => m.date === selectedDate);

  const dailyTotals = dateMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const mealSlots = getMealSchedule(profile.mealsPerDay);

  const getMealCalories = (type: string) =>
    dateMeals.filter(m => m.meal_type === type).reduce((sum, m) => sum + m.calories, 0);

  const openSheet = (type: string, label: string) => {
    setActiveMealType(type);
    setActiveMealLabel(label);
    setSheetOpen(true);
  };

  const calExceeded = dailyTotals.calories > goals.calorieTarget;

  const handleCopy = () => {
    if (!copyModalEntry || !copyDate) return;
    addMeal({
      product_name: copyModalEntry.product_name,
      meal_type: copyMealType,
      quantity: copyModalEntry.quantity,
      unit: copyModalEntry.unit,
      calories: copyModalEntry.calories,
      protein: copyModalEntry.protein,
      carbs: copyModalEntry.carbs,
      fat: copyModalEntry.fat,
      date: copyDate,
    });
    setCopyModalEntry(null);
    setCopyDate('');
    onRefresh?.();
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      {/* Day slider */}
      <motion.div variants={item} className="mb-4">
        <div className="flex justify-between gap-1">
          {weekDays.map(d => (
            <button key={d.date} onClick={() => setSelectedDate(d.date)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all min-h-[44px]
                ${selectedDate === d.date ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              <span className="text-[10px] font-bold">{d.dayLetter}</span>
              <span className="text-sm font-bold">{d.dayNum}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Calorie ring + vertical macro bars */}
      <motion.div variants={item} className="ios-card p-4 mb-5">
        <div className="flex items-start gap-4">
          <CalorieRing current={dailyTotals.calories} target={goals.calorieTarget} size={100} strokeWidth={8} />
          <div className="flex-1 pt-1">
            <MacroProgressBar label="Białko" current={dailyTotals.protein} target={goals.proteinTarget} color="#ace3fa" />
            <MacroProgressBar label="Węgle" current={dailyTotals.carbs} target={goals.carbsTarget} color="#cfacfa" />
            <MacroProgressBar label="Tłuszcze" current={dailyTotals.fat} target={goals.fatTarget} color="#f5e8a9" />
          </div>
        </div>
      </motion.div>

      {calExceeded && (
        <motion.div variants={item} className="mb-3 p-3 bg-destructive/10 rounded-2xl text-center">
          <p className="text-xs font-bold text-destructive">
            Przekroczono cel kaloryczny o {Math.round(dailyTotals.calories - goals.calorieTarget)} kcal
          </p>
        </motion.div>
      )}

      {mealSlots.map((slot, i) => {
        const type = `meal_${i}`;
        const mealEntries = dateMeals.filter(m => m.meal_type === type);
        const mealCals = getMealCalories(type);
        const Icon = MEAL_ICONS[i] || Sun;
        return (
          <motion.div key={type} variants={item} className="ios-card p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{slot.label}</h3>
                  <p className="text-xs text-muted-foreground">{slot.time} • {Math.round(mealCals)} kcal</p>
                </div>
              </div>
              <button onClick={() => openSheet(type, slot.label)} className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform min-w-[44px] min-h-[44px]">
                <Plus className="w-4 h-4 text-primary" />
              </button>
            </div>
            {mealEntries.length > 0 ? (
              <div className="space-y-2">
                {mealEntries.map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{entry.product_name}</p>
                      <p className="text-xs text-muted-foreground">{entry.quantity}g • {Math.round(entry.calories)} kcal</p>
                    </div>
                    <div className="flex gap-2.5 text-[10px] font-bold">
                      <span style={{ color: '#ace3fa' }}>{Math.round(entry.protein)}B</span>
                      <span style={{ color: '#cfacfa' }}>{Math.round(entry.carbs)}W</span>
                      <span style={{ color: '#f5e8a9' }}>{Math.round(entry.fat)}T</span>
                    </div>
                    <div className="relative">
                      <button onClick={() => setCopyMenuId(copyMenuId === entry.id ? null : entry.id)}
                        className="p-2 text-muted-foreground min-w-[36px] min-h-[36px] flex items-center justify-center">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {copyMenuId === entry.id && (
                        <div className="absolute right-0 top-full z-20 bg-card border border-border rounded-xl shadow-lg p-1 min-w-[120px]">
                          <button onClick={() => { setCopyMenuId(null); setCopyModalEntry(entry); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted min-h-[36px]">
                            <Copy className="w-3.5 h-3.5" /> Kopiuj do...
                          </button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => onRemove(entry.id)} className="p-2 text-muted-foreground hover:text-destructive min-w-[36px] min-h-[36px] flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">Brak wpisów — dodaj produkt</p>
            )}
          </motion.div>
        );
      })}

      {/* Copy modal */}
      {copyModalEntry && (
        <>
          <div className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setCopyModalEntry(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-2xl p-5 shadow-xl max-w-sm mx-auto">
            <h3 className="text-base font-bold mb-3">Kopiuj: {copyModalEntry.product_name}</h3>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Data docelowa</label>
            <input type="date" value={copyDate} onChange={e => setCopyDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold mb-3 focus:outline-none" />
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Posiłek</label>
            <select value={copyMealType} onChange={e => setCopyMealType(e.target.value)}
              className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold mb-4 focus:outline-none appearance-none">
              {mealSlots.map((s, i) => <option key={i} value={`meal_${i}`}>{s.label}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setCopyModalEntry(null)} className="flex-1 py-3 bg-muted rounded-2xl font-bold text-sm min-h-[44px]">Anuluj</button>
              <button onClick={handleCopy} disabled={!copyDate} className="flex-1 py-3 bg-primary rounded-2xl text-primary-foreground font-bold text-sm min-h-[44px] disabled:opacity-40">Kopiuj</button>
            </div>
          </div>
        </>
      )}

      <AddFoodSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} mealType={activeMealType} mealLabel={activeMealLabel} onAdd={onAdd} />
    </motion.div>
  );
}
