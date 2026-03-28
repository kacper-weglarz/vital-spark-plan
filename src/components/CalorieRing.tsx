import { motion } from 'framer-motion';

interface CalorieRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const GREEN = '#00FF00';
const OVERAGE = '#faacba';

export default function CalorieRing({ current, target, size = 140, strokeWidth = 10, label }: CalorieRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const exceeded = current > target;
  const ratio = target > 0 ? current / target : 0;

  // Extreme overage: 200%+ → full red ring
  if (ratio >= 2) {
    return (
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="progress-ring">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
          <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={OVERAGE} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-bold text-destructive">{Math.round(current)}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{label || `/ ${target} kcal`}</span>
        </div>
      </div>
    );
  }

  const progress = Math.min(ratio, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.3} />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={exceeded ? OVERAGE : GREEN}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-lg font-bold ${exceeded ? 'text-destructive' : 'text-foreground'}`}>{Math.round(current)}</span>
        <span className="text-[10px] text-muted-foreground font-medium">{label || `/ ${target} kcal`}</span>
      </div>
    </div>
  );
}
