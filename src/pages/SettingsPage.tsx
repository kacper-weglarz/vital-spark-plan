import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '@/lib/store';

interface SettingsPageProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const GOAL_OPTIONS: { value: UserProfile['goalType']; label: string }[] = [
  { value: 'cut', label: 'Redukcja' },
  { value: 'maintain', label: 'Utrzymanie' },
  { value: 'bulk', label: 'Masa' },
];

const ACTIVITY_OPTIONS: { value: UserProfile['activityLevel']; label: string; mult: number }[] = [
  { value: 'sedentary', label: 'Siedzący', mult: 1.2 },
  { value: 'light', label: 'Lekka aktywność', mult: 1.375 },
  { value: 'moderate', label: 'Umiarkowana', mult: 1.55 },
  { value: 'active', label: 'Aktywny', mult: 1.725 },
  { value: 'very_active', label: 'Bardzo aktywny', mult: 1.9 },
];

export default function SettingsPage({ profile, onUpdate }: SettingsPageProps) {
  const bmi = useMemo(() => {
    if (profile.initialWeight && profile.height) {
      const h = profile.height / 100;
      return (profile.initialWeight / (h * h)).toFixed(1);
    }
    return null;
  }, [profile.initialWeight, profile.height]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return '';
    const v = parseFloat(bmi);
    if (v < 18.5) return 'Niedowaga';
    if (v < 25) return 'Norma';
    if (v < 30) return 'Nadwaga';
    return 'Otyłość';
  }, [bmi]);

  const bmiColor = useMemo(() => {
    if (!bmi) return '';
    const v = parseFloat(bmi);
    if (v < 18.5) return 'text-accent';
    if (v < 25) return 'text-primary';
    if (v < 30) return 'text-yellow-500';
    return 'text-destructive';
  }, [bmi]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="mb-5">
        <h1 className="text-2xl font-bold">Ustawienia</h1>
        <p className="text-sm text-muted-foreground">Dostosuj profil i cele</p>
      </motion.div>

      {/* Personal data */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Dane osobiste</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Waga początkowa (kg)</label>
            <input type="number" step="0.1" value={profile.initialWeight || ''} onChange={e => onUpdate({ initialWeight: Number(e.target.value) || undefined })}
              placeholder="80" className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Wzrost (cm)</label>
            <input type="number" value={profile.height || ''} onChange={e => onUpdate({ height: Number(e.target.value) || undefined })}
              placeholder="178" className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Data urodzenia</label>
            <input type="date" value={profile.birthDate || ''} onChange={e => onUpdate({ birthDate: e.target.value })}
              className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </motion.div>

      {/* BMI Calculator */}
      {bmi && (
        <motion.div variants={item} className="ios-card p-4 mb-4">
          <h3 className="text-sm font-bold mb-3">Kalkulator BMI</h3>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-black ${bmiColor}`}>{bmi}</div>
            <div>
              <p className={`text-sm font-bold ${bmiColor}`}>{bmiCategory}</p>
              <p className="text-xs text-muted-foreground">{profile.initialWeight} kg / {profile.height} cm</p>
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

      {/* Goals */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Cel</h3>
        <div className="flex gap-2 mb-3">
          {GOAL_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => onUpdate({ goalType: opt.value })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                profile.goalType === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Docelowa waga (kg)</label>
            <input type="number" step="0.1" value={profile.targetWeight || ''} onChange={e => onUpdate({ targetWeight: Number(e.target.value) || undefined })}
              placeholder="75" className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Zmiana/msc (kg)</label>
            <input type="number" step="0.1" value={profile.monthlyChange || ''} onChange={e => onUpdate({ monthlyChange: Number(e.target.value) || undefined })}
              placeholder="2" className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </motion.div>

      {/* Activity Level */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Aktywność dzienna</h3>
        <div className="space-y-2">
          {ACTIVITY_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => onUpdate({ activityLevel: opt.value })}
              className={`w-full p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                profile.activityLevel === opt.value ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-foreground'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Macro targets */}
      <motion.div variants={item} className="ios-card p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Cele dzienne</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Kalorie (kcal)</label>
            <input type="number" value={profile.calorieTarget} onChange={e => onUpdate({ calorieTarget: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Białko (g)</label>
            <input type="number" value={profile.proteinTarget} onChange={e => onUpdate({ proteinTarget: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Węglowodany (g)</label>
            <input type="number" value={profile.carbsTarget} onChange={e => onUpdate({ carbsTarget: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tłuszcze (g)</label>
            <input type="number" value={profile.fatTarget} onChange={e => onUpdate({ fatTarget: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
