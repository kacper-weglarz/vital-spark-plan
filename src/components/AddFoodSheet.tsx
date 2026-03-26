import { useState, useCallback } from 'react';
import { Search, X, Plus, ScanBarcode, Loader2 } from 'lucide-react';
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
  { value: 'g', label: 'gramy (g)', multiplier: 1 },
  { value: 'ml', label: 'mililitry (ml)', multiplier: 1 },
  { value: 'sztuka', label: 'sztuka (~60g)', multiplier: 0.6 },
  { value: 'porcja', label: 'porcja (~150g)', multiplier: 1.5 },
  { value: 'opakowanie', label: 'opakowanie (~200g)', multiplier: 2 },
  { value: 'łyżeczka', label: 'łyżeczka (5g)', multiplier: 0.05 },
  { value: 'łyżka', label: 'łyżka (15g)', multiplier: 0.15 },
  { value: 'szklanka', label: 'szklanka (250g)', multiplier: 2.5 },
];

export default function AddFoodSheet({ isOpen, onClose, mealLabel, mealType, onAdd }: AddFoodSheetProps) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const products = getProducts();
  const filtered = products.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const getMultiplier = () => {
    const u = UNITS.find(u => u.value === unit);
    if (!u) return Number(quantity) / 100;
    if (unit === 'g' || unit === 'ml') return Number(quantity) / 100;
    return u.multiplier * Number(quantity);
  };

  const mult = getMultiplier();

  const handleAdd = () => {
    if (selectedFood) {
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
    setManualBarcode('');
  };

  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setShowScanner(false);
    setScanning(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
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
        setSearch(barcode);
      }
    } catch {
      setSearch(barcode);
    } finally {
      setScanning(false);
    }
  }, []);

  const handleManualBarcode = () => {
    if (manualBarcode.trim()) handleBarcodeScan(manualBarcode.trim());
  };

  if (showScanner) {
    return <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) { reset(); onClose(); } }}>
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

          {!scanning && !selectedFood && (
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

              {/* Manual barcode input as fallback */}
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Lub wpisz kod kreskowy..." value={manualBarcode} onChange={e => setManualBarcode(e.target.value)}
                  className="flex-1 px-4 py-3 bg-muted rounded-2xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={handleManualBarcode} disabled={!manualBarcode.trim()}
                  className="px-4 py-3 bg-primary/10 rounded-2xl text-sm font-bold text-primary disabled:opacity-40 min-h-[44px]">Szukaj</button>
              </div>

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

              {/* Unit picker */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 block">Jednostka</label>
                <select value={unit} onChange={e => setUnit(e.target.value)}
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
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-muted rounded-2xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-4 ios-card p-3">
                <div><p className="text-sm font-bold text-primary">{Math.round(selectedFood.calories * mult)}</p><p className="text-[10px] text-muted-foreground">kcal</p></div>
                <div><p className="text-sm font-bold macro-protein">{Math.round(selectedFood.protein * mult)}</p><p className="text-[10px] text-muted-foreground">białko</p></div>
                <div><p className="text-sm font-bold macro-carbs">{Math.round(selectedFood.carbs * mult)}</p><p className="text-[10px] text-muted-foreground">węgle</p></div>
                <div><p className="text-sm font-bold macro-fat">{Math.round(selectedFood.fat * mult)}</p><p className="text-[10px] text-muted-foreground">tłuszcz</p></div>
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
