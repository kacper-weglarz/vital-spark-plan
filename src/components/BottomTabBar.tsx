import { Home, Utensils, Ruler, Dumbbell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'home' | 'meals' | 'body' | 'workout' | 'settings';

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'meals', label: 'Posiłki', icon: Utensils },
  { id: 'body', label: 'Ciało', icon: Ruler },
  { id: 'workout', label: 'Trening', icon: Dumbbell },
  { id: 'settings', label: 'Ustawienia', icon: Settings },
];

export default function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 ios-blur-bg border-t border-border/50 tab-bar-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 min-w-[56px] relative"
            >
              <div className="relative p-1">
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
