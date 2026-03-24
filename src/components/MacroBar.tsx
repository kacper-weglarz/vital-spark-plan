import { motion } from 'framer-motion';

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  color: 'protein' | 'carbs' | 'fat';
  unit?: string;
}

const colorMap = {
  protein: 'bg-macro-protein',
  carbs: 'bg-macro-carbs',
  fat: 'bg-macro-fat',
};

const textColorMap = {
  protein: 'macro-protein',
  carbs: 'macro-carbs',
  fat: 'macro-fat',
};

export default function MacroBar({ label, current, target, color, unit = 'g' }: MacroBarProps) {
  const progress = Math.min(current / target, 1);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-semibold ${textColorMap[color]}`}>{label}</span>
        <span className="text-xs text-muted-foreground font-medium">
          {Math.round(current)}/{target}{unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorMap[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
