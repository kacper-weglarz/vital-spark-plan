import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import CalorieRing from '@/components/CalorieRing';
import AddFoodSheet from '@/components/AddFoodSheet';
import { MealType, MEAL_LABELS, MEAL_ICONS, UserGoals } from '@/lib/store';

interface MealsPageProps {
  meals: any[];
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number };
  goals: UserGoals;
  onAdd: (product: any, quantity: number, mealType: string) => void;
  onRemove: (id: string) => void;
}

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function MealsPage({ meals, dailyTotals, goals, onAdd, onRemove }: MealsPageProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');

  const getMealCalories = (type: MealType) =>
    meals.filter(m => m.meal_type === type).reduce((sum, m) => sum + Number(m.calories), 0);

  const openSheet = (type: MealType) => {
    setActiveMeal(type);
    setSheetOpen(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="mb-5">
        <h1 className="text-2xl font-bold">Posiłki</h1>
        <p className="text-sm text-muted-foreground">Dzisiejszy dziennik żywienia</p>
      </motion.div>

      <motion.div variants={item} className="ios-card p-4 mb-5 flex items-center gap-5">
        <CalorieRing current={dailyTotals.calories} target={goals.calorieTarget} size={100} strokeWidth={8} />
        <div className="flex-1 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-base font-bold macro-protein">{Math.round(dailyTotals.protein)}g</p>
            <p className="text-[10px] text-muted-foreground">Białko</p>
          </div>
          <div>
            <p className="text-base font-bold macro-carbs">{Math.round(dailyTotals.carbs)}g</p>
            <p className="text-[10px] text-muted-foreground">Węgle</p>
          </div>
          <div>
            <p className="text-base font-bold macro-fat">{Math.round(dailyTotals.fat)}g</p>
            <p className="text-[10px] text-muted-foreground">Tłuszcze</p>
          </div>
        </div>
      </motion.div>

      {mealTypes.map(type => {
        const mealEntries = meals.filter(m => m.meal_type === type);
        const mealCals = getMealCalories(type);
        return (
          <motion.div key={type} variants={item} className="ios-card p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{MEAL_ICONS[type]}</span>
                <div>
                  <h3 className="text-sm font-bold">{MEAL_LABELS[type]}</h3>
                  <p className="text-xs text-muted-foreground">{Math.round(mealCals)} kcal</p>
                </div>
              </div>
              <button onClick={() => openSheet(type)} className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center active:scale-90 transition-transform">
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
                      <span className="macro-protein">{Math.round(entry.protein)}B</span>
                      <span className="macro-carbs">{Math.round(entry.carbs)}W</span>
                      <span className="macro-fat">{Math.round(entry.fat)}T</span>
                    </div>
                    <button onClick={() => onRemove(entry.id)} className="p-1 text-muted-foreground hover:text-destructive">
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

      <AddFoodSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} mealType={activeMeal} onAdd={onAdd} />
    </motion.div>
  );
}
