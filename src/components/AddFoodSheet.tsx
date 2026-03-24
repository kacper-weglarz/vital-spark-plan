import { useState } from 'react';
import { Search, X, Plus, ScanBarcode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FOOD_DATABASE, FoodItem, MealType, MEAL_LABELS } from '@/lib/store';

interface AddFoodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  onAdd: (foodItem: FoodItem, quantity: number, mealType: MealType) => void;
}

export default function AddFoodSheet({ isOpen, onClose, mealType, onAdd }: AddFoodSheetProps) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('100');

  const filtered = FOOD_DATABASE.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedFood) {
      onAdd(selectedFood, Number(quantity), mealType);
      setSelectedFood(null);
      setQuantity('100');
      setSearch('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] flex flex-col"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Dodaj do: {MEAL_LABELS[mealType]}</h3>
                <button onClick={onClose} className="p-1 rounded-full bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Szukaj produktu..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button className="p-2.5 bg-primary/10 rounded-xl">
                  <ScanBarcode className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>

            {selectedFood ? (
              <div className="p-4 flex-1">
                <div className="ios-card p-4 mb-4">
                  <h4 className="font-bold text-base mb-1">{selectedFood.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">na 100g</p>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{selectedFood.calories}</p>
                      <p className="text-[10px] text-muted-foreground">kcal</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold macro-protein">{selectedFood.protein}</p>
                      <p className="text-[10px] text-muted-foreground">białko</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold macro-carbs">{selectedFood.carbs}</p>
                      <p className="text-[10px] text-muted-foreground">węgle</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold macro-fat">{selectedFood.fat}</p>
                      <p className="text-[10px] text-muted-foreground">tłuszcz</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-semibold text-foreground mb-2 block">Ilość (g)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-muted rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-4 ios-card p-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{Math.round(selectedFood.calories * Number(quantity) / 100)}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold macro-protein">{Math.round(selectedFood.protein * Number(quantity) / 100)}</p>
                    <p className="text-[10px] text-muted-foreground">białko</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold macro-carbs">{Math.round(selectedFood.carbs * Number(quantity) / 100)}</p>
                    <p className="text-[10px] text-muted-foreground">węgle</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold macro-fat">{Math.round(selectedFood.fat * Number(quantity) / 100)}</p>
                    <p className="text-[10px] text-muted-foreground">tłuszcz</p>
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full py-3.5 bg-primary rounded-2xl text-primary-foreground font-bold text-base"
                >
                  Dodaj produkt
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4">
                {filtered.map(food => (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="w-full flex items-center justify-between p-3 mb-1.5 rounded-xl hover:bg-muted/50 active:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="font-semibold text-sm">{food.name}</p>
                      <p className="text-xs text-muted-foreground">{food.calories} kcal / {food.servingSize}</p>
                    </div>
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
