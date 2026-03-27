import { motion } from 'framer-motion';

interface RingData {
  current: number;
  target: number;
  color: string;
  label: string;
}

interface FitnessRingsProps {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  size?: number;
}

function Ring({ cx, cy, radius, strokeWidth, progress, color, delay }: {
  cx: number; cy: number; radius: number; strokeWidth: number; progress: number; color: string; delay: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.4} />
      <motion.circle
        cx={cx} cy={cy} r={radius} fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay }}
      />
    </>
  );
}

export default function FitnessRings({ calories, protein, carbs, fat, size = 200 }: FitnessRingsProps) {
  const cx = size / 2;
  const cy = size / 2;
  const gap = 3;
  const sw = 10;

  const rings = [
    { radius: (size - sw) / 2, progress: calories.current / (calories.target || 1), color: 'hsl(var(--calories-ring))' },
    { radius: (size - sw) / 2 - (sw + gap), progress: protein.current / (protein.target || 1), color: 'hsl(var(--protein))' },
    { radius: (size - sw) / 2 - 2 * (sw + gap), progress: carbs.current / (carbs.target || 1), color: 'hsl(var(--carbs))' },
    { radius: (size - sw) / 2 - 3 * (sw + gap), progress: fat.current / (fat.target || 1), color: 'hsl(var(--fat))' },
  ];

  const remaining = calories.target - calories.current;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="progress-ring">
          {rings.map((r, i) => (
            <Ring key={i} cx={cx} cy={cy} radius={r.radius} strokeWidth={sw} progress={r.progress} color={r.color} delay={i * 0.1} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-foreground">{Math.round(calories.current)}</span>
          <span className="text-[11px] text-muted-foreground font-medium">/ {calories.target} kcal</span>
          <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${remaining > 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            {remaining > 0 ? `Zostało ${Math.round(remaining)}` : `+${Math.round(-remaining)}`}
          </span>
        </div>
      </div>
      <div className="flex gap-4 mt-3">
        <MacroLabel label="Białko" current={protein.current} target={protein.target} colorClass="macro-protein" dotColor="hsl(var(--protein))" />
        <MacroLabel label="Węgle" current={carbs.current} target={carbs.target} colorClass="macro-carbs" dotColor="hsl(var(--carbs))" />
        <MacroLabel label="Tłuszcze" current={fat.current} target={fat.target} colorClass="macro-fat" dotColor="hsl(var(--fat))" />
      </div>
    </div>
  );
}

function MacroLabel({ label, current, target, colorClass, dotColor }: { label: string; current: number; target: number; colorClass: string; dotColor: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
      <div className="text-center">
        <p className={`text-xs font-bold ${colorClass}`}>{Math.round(current)}/{target}g</p>
        <p className="text-[9px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
