import { motion } from 'framer-motion';
import { Award, Flame, Target, TrendingUp, Star, Zap, Crown } from 'lucide-react';

interface ProgressPageProps {
  streak: number;
  workoutCount: number;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const badges = [
  { icon: Flame, name: '7 dni streak', desc: 'Aktywność 7 dni z rzędu', earned: true, color: 'text-accent' },
  { icon: Target, name: 'Cel kaloryczny', desc: 'Osiągnij cel 5 razy', earned: true, color: 'text-primary' },
  { icon: TrendingUp, name: 'Pierwszy trening', desc: 'Ukończ pierwszy trening', earned: true, color: 'text-primary' },
  { icon: Star, name: 'Pomiar miesiąca', desc: 'Wykonaj 4 pomiary', earned: true, color: 'text-accent' },
  { icon: Crown, name: 'Złota seria', desc: '30 dni streak', earned: false, color: 'text-muted-foreground' },
  { icon: Zap, name: 'Powerlifter', desc: 'Wyciskaj 100kg', earned: false, color: 'text-muted-foreground' },
];

export default function ProgressPage({ streak, workoutCount }: ProgressPageProps) {
  const level = Math.floor(streak / 7) + 1;
  const xpProgress = (streak % 7) / 7;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 pt-2 pb-28">
      <motion.div variants={item} className="mb-5">
        <h1 className="text-2xl font-bold">Progres</h1>
        <p className="text-sm text-muted-foreground">Twoje osiągnięcia i statystyki</p>
      </motion.div>

      {/* Level Card */}
      <motion.div variants={item} className="ios-card-elevated p-5 mb-4 bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-2xl font-black text-primary-foreground">{level}</span>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">Poziom {level}</p>
            <p className="text-xs text-muted-foreground">
              {streak % 7}/7 dni do następnego poziomu
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary">{streak}</p>
            <p className="text-[10px] text-muted-foreground font-semibold">DNI STREAK</p>
          </div>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Treningi', value: workoutCount, icon: '🏋️' },
          { label: 'Streak', value: `${streak}d`, icon: '🔥' },
          { label: 'Odznaki', value: badges.filter(b => b.earned).length, icon: '🏆' },
        ].map((s, i) => (
          <div key={i} className="ios-card p-3 text-center">
            <span className="text-xl">{s.icon}</span>
            <p className="text-xl font-bold mt-1">{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Badges */}
      <motion.div variants={item}>
        <h3 className="ios-section-title mb-3">Odznaki</h3>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                className={`ios-card p-4 ${!badge.earned ? 'opacity-40' : ''}`}
              >
                <Icon className={`w-8 h-8 mb-2 ${badge.color}`} />
                <p className="text-sm font-bold">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
                {badge.earned && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full">
                    <Award className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary">Zdobyta</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Leaderboard preview */}
      <motion.div variants={item} className="mt-5">
        <h3 className="ios-section-title mb-3">Ranking znajomych</h3>
        <div className="ios-card divide-y divide-border">
          {[
            { name: 'Ty', streak: streak, pos: 1 },
            { name: 'Kacper M.', streak: 12, pos: 2 },
            { name: 'Anna K.', streak: 5, pos: 3 },
            { name: 'Mateusz W.', streak: 3, pos: 4 },
          ].sort((a, b) => b.streak - a.streak).map((user, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </span>
              <p className={`flex-1 text-sm font-semibold ${user.name === 'Ty' ? 'text-primary' : ''}`}>{user.name}</p>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span className="text-sm font-bold">{user.streak}d</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
