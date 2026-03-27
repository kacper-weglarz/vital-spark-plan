import { useState, useCallback, useEffect } from 'react';
import { Search, X, Plus, ScanBarcode, Loader2, PlusCircle } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import BarcodeScanner from '@/components/BarcodeScanner';
import { getProducts, addProduct, Product } from '@/lib/local-storage';

interface AddFoodSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mealLabel: string;
  mealType: string;
  onAdd: (product: Product, quantity: number, unit: string, mealType: string) => void;
}

const UNITS = [
  { value: 'g', label: 'gramy (g)', grams: null },
  { value: 'ml', label: 'mililitry (ml)', grams: null },
  { value: 'łyżeczka', label: 'łyżeczka (5g)', grams: 5 },
  { value: 'łyżka', label: 'łyżka (15g)', grams: 15 },
  { value: 'szklanka', label: 'szklanka (250g)', grams: 250 },
  { value: 'sztuka', label: 'sztuka (~60g)', grams: 60 },
  { value: 'porcja', label: 'porcja (~150g)', grams: 150 },
  { value: 'opakowanie', label: 'opakowanie (~200g)', grams: 200 },
];

function haptic(ms = 50) {
  try { navigator?.vibrate?.(ms); } catch {}
}

export default function AddFoodSheet({ isOpen, onClose, mealLabel, mealType, onAdd }: AddFoodSheetProps) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', barcode: '' });

  const products = getProducts();
  const filtered = products.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  // Reset quantity on unit change
  const handleUnitChange = (newUnit: string) => {
    const prev = unit;
    setUnit(newUnit);
    const isGrams = newUnit === 'g' || newUnit === 'ml';
    const wasGrams = prev === 'g' || prev === 'ml';
    if (isGrams && !wasGrams) setQuantity('100');
    if (!isGrams && wasGrams) setQuantity('1');
  };

  const getGrams = (): number => {
    const q = Number(quantity) || 0;
    const u = UNITS.find(u => u.value === unit);
    if (!u || !u.grams) return q; // g or ml
    return u.grams * q;
  };

  const mult = getGrams() / 100;

  const handleAdd = () => {
    if (selectedFood) {
      haptic();
      onAdd(selectedFood, Number(quantity), unit, mealType);
      reset();
      onClose();
    }
  };

  const reset = () => {
    setSelectedFood(null);
    setQuantity('100');
    setUnit('g');
    setSearch('');
    setShowManualAdd(false);
    setManualForm({ name: '', calories: '', protein: '', carbs: '', fat: '', barcode: '' });
  };

  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setShowScanner(false);
    setScanning(true);

    // Check local custom products first
    const local = getProducts().find(p => p.barcode === barcode);
    if (local) {
      haptic();
      setSelectedFood(local);
      setScanning(false);
      return;
    }

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        haptic();
        const p = data.product;
        const n = p.nutriments || {};
        const product: Product = {
          id: 'api_' + barcode,
          name: p.product_name || p.product_name_pl || 'Produkt ' + barcode,
          calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
          protein: Math.round((n.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((n.fat_100g || 0) * 10) / 10,
          serving_size: '100g',
          barcode,
        };
        addProduct(product);
        setSelectedFood(product);
      } else {
        setManualForm(prev => ({ ...prev, barcode }));
        setShowManualAdd(true);
      }
    } catch {
      setManualForm(prev => ({ ...prev, barcode }));
      setShowManualAdd(true);
    } finally {
      setScanning(false);
    }
  }, []);

  const handleManualSave = () => {
    if (!manualForm.name.trim()) return;
    const product = addProduct({
      name: manualForm.name.trim(),
      calories: Number(manualForm.calories) || 0,
      protein: Number(manualForm.protein) || 0,
      carbs: Number(manualForm.carbs) || 0,
      fat: Number(manualForm.fat) || 0,
      serving_size: '100g',
      barcode: manualForm.barcode || undefined,
    });
    haptic();
    setSelectedFood(product);
    setShowManualAdd(false);
  };

  if (showScanner) {
    return <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }} shouldScaleBackground>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Dodaj do: {mealLabel}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 overflow-y-auto">
          {scanning && (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Szukam produktu...</span>
            </div>
          )}

          {!scanning && !selectedFood && !showManualAdd && (
            <>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Szukaj produktu..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-muted rounded-2xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <button onClick={() => setShowScanner(true)} className="p-3 bg-primary/10 rounded-2xl min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <ScanBarcode className="w-5 h-5 text-primary" />
                </button>
              </div>

              <button onClick={() => setShowManualAdd(true)} className="w-full flex items-center gap-2 p-3 mb-3 rounded-2xl bg-muted/50 text-sm font-semibold text-primary min-h-[44px]">
                <PlusCircle className="w-4 h-4" /> Dodaj produkt ręcznie
              </button>

              <div className="space-y-1">
                {filtered.map(food => (
                  <button key={food.id} onClick={() => setSelectedFood(food)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-muted/50 active:bg-muted transition-colors text-left min-h-[44px]">
                    <div>
                      <p className="font-semibold text-sm">{food.name}</p>
                      <p className="text-xs text-muted-foreground">{food.calories} kcal / {food.serving_size}</p>
                    </div>
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                ))}
              </div>
            </>
          )}

          {!scanning && showManualAdd && !selectedFood && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold">Dodaj produkt ręcznie</h4>
              <p className="text-xs text-muted-foreground">Podaj wartości odżywcze na 100g</p>
              <input placeholder="Nazwa produktu" value={manualForm.name} onChange={e => setManualForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-muted rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'calories', label: 'Kalorie (kcal)' },
                  { key: 'protein', label: 'Białko (g)' },
                  { key: 'carbs', label: 'Węgle (g)' },
                  { key: 'fat', label: 'Tłuszcze (g)' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-muted-foreground mb-1 block">{f.label}</label>
                    <input type="number" inputMode="decimal" placeholder="0"
                      value={(manualForm as any)[f.key]} onChange={e => setManualForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowManualAdd(false)} className="flex-1 py-3 bg-muted rounded-2xl font-bold text-sm text-muted-foreground min-h-[44px]">Wróć</button>
                <button onClick={handleManualSave} disabled={!manualForm.name.trim()} className="flex-1 py-3 bg-primary rounded-2xl text-primary-foreground font-bold text-sm min-h-[44px] disabled:opacity-40">Zapisz</button>
              </div>
            </div>
          )}

          {!scanning && selectedFood && (
            <>
              <div className="ios-card p-4 mb-4">
                <h4 className="font-bold text-base mb-1">{selectedFood.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">na 100g</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div><p className="text-lg font-bold text-primary">{selectedFood.calories}</p><p className="text-[10px] text-muted-foreground">kcal</p></div>
                  <div><p className="text-lg font-bold macro-protein">{selectedFood.protein}</p><p className="text-[10px] text-muted-foreground">białko</p></div>
                  <div><p className="text-lg font-bold macro-carbs">{selectedFood.carbs}</p><p className="text-[10px] text-muted-foreground">węgle</p></div>
                  <div><p className="text-lg font-bold macro-fat">{selectedFood.fat}</p><p className="text-[10px] text-muted-foreground">tłuszcz</p></div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Jednostka</label>
                <select value={unit} onChange={e => handleUnitChange(e.target.value)}
                  className="w-full px-4 py-3 bg-muted rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                  {UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  {unit === 'g' || unit === 'ml' ? `Ilość (${unit})` : 'Ilość'}
                </label>
                <input type="number" inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-muted rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              {/* Live preview */}
              <div className="grid grid-cols-4 gap-2 text-center mb-4 ios-card p-3">
                <div><p className="text-sm font-bold text-primary">{Math.round(selectedFood.calories * mult)}</p><p className="text-[10px] text-muted-foreground">kcal</p></div>
                <div><p className="text-sm font-bold macro-protein">{Math.round(selectedFood.protein * mult * 10) / 10}</p><p className="text-[10px] text-muted-foreground">białko</p></div>
                <div><p className="text-sm font-bold macro-carbs">{Math.round(selectedFood.carbs * mult * 10) / 10}</p><p className="text-[10px] text-muted-foreground">węgle</p></div>
                <div><p className="text-sm font-bold macro-fat">{Math.round(selectedFood.fat * mult * 10) / 10}</p><p className="text-[10px] text-muted-foreground">tłuszcz</p></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedFood(null)} className="flex-1 py-3.5 bg-muted rounded-2xl font-bold text-sm text-muted-foreground min-h-[44px]">Wróć</button>
                <button onClick={handleAdd} className="flex-1 py-3.5 bg-primary rounded-2xl text-primary-foreground font-bold text-base min-h-[44px]">Dodaj</button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
