import { motion } from 'framer-motion';

interface FitnessRingsProps {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  size?: number;
}

// Colors from spec
const COLORS = {
  calories: '#00FF00',
  protein: '#ace3fa',
  carbs: '#cfacfa',
  fat: '#f5e8a9',
  overage: '#faacba',
};

function Ring({ cx, cy, radius, strokeWidth, current, target, color, delay }: {
  cx: number; cy: number; radius: number; strokeWidth: number;
  current: number; target: number; color: string; delay: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const ratio = target > 0 ? current / target : 0;
  const clamped = Math.min(ratio, 2); // max 200%

  // If exceeded by 100%+ for calories (extreme case), entire ring is overage color
  const isCalories = color === COLORS.calories;
  const isExceeded = current > target;
  const extremeOverage = isCalories && ratio >= 2;

  if (extremeOverage) {
    // Full ring in overage color
    return (
      <>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
        <motion.circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={COLORS.overage}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
        />
      </>
    );
  }

  if (isExceeded) {
    // Normal part + overage part
    const normalProgress = Math.min(1, target > 0 ? 1 : 0);
    const overageProgress = Math.min((current - target) / target, 1);
    const normalOffset = circumference * (1 - normalProgress);
    const overageArc = circumference * overageProgress;

    return (
      <>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
        {/* Normal portion */}
        <motion.circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: normalOffset }}
          transition={{ duration: 1.0, ease: 'easeOut', delay }}
        />
        {/* Overage portion */}
        <motion.circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={COLORS.overage}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${overageArc} ${circumference - overageArc}`}
          strokeDashoffset={-circumference * normalProgress}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.8 }}
        />
      </>
    );
  }

  // Normal (not exceeded)
  const progress = Math.min(ratio, 1);
  const offset = circumference * (1 - progress);

  return (
    <>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
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
    { radius: (size - sw) / 2, current: calories.current, target: calories.target, color: COLORS.calories },
    { radius: (size - sw) / 2 - (sw + gap), current: protein.current, target: protein.target, color: COLORS.protein },
    { radius: (size - sw) / 2 - 2 * (sw + gap), current: carbs.current, target: carbs.target, color: COLORS.carbs },
    { radius: (size - sw) / 2 - 3 * (sw + gap), current: fat.current, target: fat.target, color: COLORS.fat },
  ];

  const remaining = calories.target - calories.current;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="progress-ring">
          {rings.map((r, i) => (
            <Ring key={i} cx={cx} cy={cy} radius={r.radius} strokeWidth={sw}
              current={r.current} target={r.target} color={r.color} delay={i * 0.1} />
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
        <MacroLabel label="Białko" current={protein.current} target={protein.target} dotColor={COLORS.protein} exceeded={protein.current > protein.target} />
        <MacroLabel label="Węgle" current={carbs.current} target={carbs.target} dotColor={COLORS.carbs} exceeded={carbs.current > carbs.target} />
        <MacroLabel label="Tłuszcze" current={fat.current} target={fat.target} dotColor={COLORS.fat} exceeded={fat.current > fat.target} />
      </div>
    </div>
  );
}

function MacroLabel({ label, current, target, dotColor, exceeded }: {
  label: string; current: number; target: number; dotColor: string; exceeded: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: exceeded ? COLORS.overage : dotColor }} />
      <div className="text-center">
        <p className="text-xs font-bold" style={{ color: exceeded ? COLORS.overage : dotColor }}>{Math.round(current)}/{target}g</p>
        <p className="text-[9px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
