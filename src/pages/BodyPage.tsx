import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingDown, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { BodyMeasurement } from '@/lib/store';

interface BodyPageProps {
  measurements: BodyMeasurement[];
  onAdd: (m: Omit<BodyMeasurement, 'id'>) => void;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function BodyPage({ measurements, onAdd }: BodyPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weight: '', waist: '', chest: '', hips: '', bicepLeft: '', bicepRight: '' });

  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));
  const weightData = sorted.filter(m => m.weight).map(m => ({ date: m.date.slice(5), weight: m.weight }));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const weightDiff = latest?.weight && previous?.weight ? latest.weight - previous.weight : 0;

  const handleSubmit = () => {
    onAdd({
      date: new Date().toISOString().split('T')[0],
      weight: form.weight ? Number(form.weight) : undefined,
      waist: form.waist ? Number(form.waist) : undefined,
      chest: form.chest ? Number(form.chest) : undefined,
      hips: form.hips ? Number(form.hips) : undefined,
      bicepLeft: form.bicepLeft ? Number(form.bicepLeft) : undefined,
      bicepRight: form.bicepRight ? Number(form.bicepRight) : undefined,
    });
    setForm({ weight: '', waist: '', chest: '', hips: '', bicepLeft: '', bicepRight: '' });
    setShowForm(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Pomiary ciała</h1>
          <p className="text-sm text-muted-foreground">Monitoruj swoje postępy</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </motion.div>

      {/* Weight Overview */}
      <motion.div variants={item} className="ios-card p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Aktualna waga</p>
            <p className="text-2xl font-bold">{latest?.weight || '—'} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
          {weightDiff !== 0 && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${weightDiff < 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
              <TrendingDown className={`w-3.5 h-3.5 ${weightDiff > 0 ? 'rotate-180' : ''}`} />
              {Math.abs(weightDiff).toFixed(1)} kg
            </div>
          )}
        </div>
        {weightData.length > 1 && (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Measurements grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Talia', value: latest?.waist, unit: 'cm' },
          { label: 'Klatka', value: latest?.chest, unit: 'cm' },
          { label: 'Biodra', value: latest?.hips, unit: 'cm' },
          { label: 'Biceps L/P', value: latest?.bicepLeft && latest?.bicepRight ? `${latest.bicepLeft}/${latest.bicepRight}` : undefined, unit: 'cm' },
        ].map((m, i) => (
          <div key={i} className="ios-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xl font-bold">{m.value ?? '—'} <span className="text-xs font-normal text-muted-foreground">{m.unit}</span></p>
          </div>
        ))}
      </motion.div>

      {/* History */}
      <motion.div variants={item}>
        <h3 className="ios-section-title mb-2">Historia pomiarów</h3>
        <div className="space-y-2">
          {sorted.slice().reverse().map(m => (
            <div key={m.id} className="ios-card p-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{new Date(m.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</p>
                <p className="text-xs text-muted-foreground">{m.weight}kg • T:{m.waist}cm • Kl:{m.chest}cm</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Form Sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-50" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Nowy pomiar</h3>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-full bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { key: 'weight', label: 'Waga (kg)', placeholder: '80.5' },
                  { key: 'waist', label: 'Talia (cm)', placeholder: '82' },
                  { key: 'chest', label: 'Klatka (cm)', placeholder: '103' },
                  { key: 'hips', label: 'Biodra (cm)', placeholder: '96' },
                  { key: 'bicepLeft', label: 'Biceps L (cm)', placeholder: '37' },
                  { key: 'bicepRight', label: 'Biceps P (cm)', placeholder: '37.5' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} className="w-full py-3.5 bg-primary rounded-2xl text-primary-foreground font-bold">
                Zapisz pomiar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
