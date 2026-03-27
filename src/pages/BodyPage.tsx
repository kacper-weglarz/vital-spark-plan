import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingDown, Scale, ChevronLeft, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BodyMeasurement, getProfile } from '@/lib/local-storage';

interface BodyPageProps {
  measurements: BodyMeasurement[];
  onAdd: (m: Record<string, any>) => void;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

type MeasurementKey = 'weight' | 'waist' | 'belly' | 'chest' | 'bicep_left' | 'bicep_right' | 'thigh_left' | 'thigh_right' | 'calf_left' | 'calf_right' | 'hips';

const MEASUREMENT_CONFIG: { key: MeasurementKey; label: string; unit: string; paired?: MeasurementKey }[] = [
  { key: 'weight', label: 'Waga', unit: 'kg' },
  { key: 'waist', label: 'Talia', unit: 'cm' },
  { key: 'belly', label: 'Brzuch', unit: 'cm' },
  { key: 'chest', label: 'Klatka', unit: 'cm' },
  { key: 'hips', label: 'Biodra', unit: 'cm' },
  { key: 'bicep_left', label: 'Biceps L', unit: 'cm', paired: 'bicep_right' },
  { key: 'thigh_left', label: 'Udo L', unit: 'cm', paired: 'thigh_right' },
  { key: 'calf_left', label: 'Łydka L', unit: 'cm', paired: 'calf_right' },
];

const FORM_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'weight', label: 'Waga (kg)', placeholder: '80.5' },
  { key: 'waist', label: 'Talia (cm)', placeholder: '82' },
  { key: 'belly', label: 'Brzuch (cm)', placeholder: '86' },
  { key: 'chest', label: 'Klatka (cm)', placeholder: '103' },
  { key: 'hips', label: 'Biodra (cm)', placeholder: '96' },
  { key: 'bicep_left', label: 'Biceps L (cm)', placeholder: '37' },
  { key: 'bicep_right', label: 'Biceps P (cm)', placeholder: '37.5' },
  { key: 'thigh_left', label: 'Udo L (cm)', placeholder: '58' },
  { key: 'thigh_right', label: 'Udo P (cm)', placeholder: '59' },
  { key: 'calf_left', label: 'Łydka L (cm)', placeholder: '37' },
  { key: 'calf_right', label: 'Łydka P (cm)', placeholder: '37.5' },
];

export default function BodyPage({ measurements, onAdd }: BodyPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [chartKey, setChartKey] = useState<MeasurementKey | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const sorted = [...measurements].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const profile = getProfile();

  // Get current weight: latest measurement or profile
  const currentWeight = latest?.weight ?? profile?.weight ?? null;
  const weightDiff = latest?.weight && previous?.weight ? latest.weight - previous.weight : 0;

  const getChartData = (key: MeasurementKey) =>
    sorted.filter(m => (m as any)[key] != null).map(m => ({ date: (m.date || '').slice(5), value: Number((m as any)[key]) }));

  const getPairedDisplay = (cfg: typeof MEASUREMENT_CONFIG[0]) => {
    if (!latest) return '—';
    if (cfg.paired) {
      const l = (latest as any)[cfg.key];
      const r = (latest as any)[cfg.paired];
      if (l != null && r != null) return `${l}/${r}`;
      if (l != null) return String(l);
    }
    return (latest as any)[cfg.key] != null ? String((latest as any)[cfg.key]) : '—';
  };

  const handleSubmit = () => {
    const entry: Record<string, any> = { date: new Date().toISOString().split('T')[0] };
    let hasValue = false;
    FORM_FIELDS.forEach(f => {
      if (form[f.key]) {
        entry[f.key] = Number(form[f.key]);
        hasValue = true;
      }
    });
    if (!hasValue) return;
    onAdd(entry);
    setForm({});
    setShowForm(false);
  };

  if (chartKey) {
    const cfg = MEASUREMENT_CONFIG.find(c => c.key === chartKey)!;
    const data = getChartData(chartKey);
    const pairedData = cfg.paired ? getChartData(cfg.paired) : null;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-2 pb-28">
        <button onClick={() => setChartKey(null)} className="flex items-center gap-1 text-sm font-semibold text-primary mb-4 min-h-[44px]">
          <ChevronLeft className="w-4 h-4" /> Powrót
        </button>
        <h2 className="text-xl font-bold mb-1">{cfg.label}</h2>
        <p className="text-sm text-muted-foreground mb-4">Historia zmian ({cfg.unit})</p>
        <div className="ios-card p-4">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={35} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} name={cfg.label} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {pairedData && pairedData.length > 1 && (
            <div className="h-52 mt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{cfg.label.replace(' L', ' P')}</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pairedData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={35} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--accent))', r: 4 }} name={cfg.label.replace(' L', ' P')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Pomiary ciała</h1>
          <p className="text-sm text-muted-foreground">Monitoruj swoje postępy</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 min-w-[44px] min-h-[44px]">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </motion.div>

      {/* Current weight card */}
      <motion.div variants={item} className="ios-card p-4 mb-4" onClick={() => setChartKey('weight')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Aktualna waga</p>
            <p className="text-2xl font-bold">{currentWeight ?? '—'} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
          {weightDiff !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${weightDiff < 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              <TrendingDown className={`w-3 h-3 ${weightDiff > 0 ? 'rotate-180' : ''}`} />
              {Math.abs(weightDiff).toFixed(1)} kg
            </div>
          )}
        </div>
        <p className="text-[10px] text-primary mt-2">Zobacz wykres →</p>
      </motion.div>

      {/* Compact measurement tiles */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2 mb-4">
        {MEASUREMENT_CONFIG.filter(c => c.key !== 'weight').map(cfg => (
          <button key={cfg.key} onClick={() => setChartKey(cfg.key)}
            className="bg-muted/60 p-3 rounded-xl text-left active:scale-[0.97] transition-transform min-h-[44px]"
            style={{ boxShadow: '0 1px 4px hsl(var(--foreground) / 0.04)' }}>
            <p className="text-[10px] text-muted-foreground mb-0.5 truncate">{cfg.label}{cfg.paired ? '/P' : ''}</p>
            <p className="text-base font-bold">{getPairedDisplay(cfg)} <span className="text-[10px] font-normal text-muted-foreground">{cfg.unit}</span></p>
            <p className="text-[9px] text-primary mt-0.5">Wykres →</p>
          </button>
        ))}
      </motion.div>

      {/* History */}
      <motion.div variants={item}>
        <h3 className="ios-section-title mb-2">Historia pomiarów</h3>
        <div className="space-y-1.5">
          {sorted.slice().reverse().slice(0, 5).map(m => (
            <div key={m.id} className="ios-card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{new Date(m.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</p>
                <p className="text-[10px] text-muted-foreground">{m.weight}kg • T:{m.waist}cm • Br:{m.belly}cm</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* New measurement form - bottom sheet style */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] flex flex-col">
              {/* Sticky header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                <h3 className="text-lg font-bold">Nowy pomiar</h3>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-full bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Scrollable fields - vertical layout */}
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {FORM_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                    <input type="number" inputMode="decimal" step="0.1" placeholder={f.placeholder} value={form[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-4 py-3 bg-muted rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              {/* Sticky save button */}
              <div className="p-4 border-t border-border/50 flex-shrink-0">
                <button onClick={handleSubmit} className="w-full py-4 bg-primary rounded-2xl text-primary-foreground font-bold text-base flex items-center justify-center gap-2 min-h-[44px] shadow-lg shadow-primary/25">
                  <Save className="w-5 h-5" /> Zapisz pomiary
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
