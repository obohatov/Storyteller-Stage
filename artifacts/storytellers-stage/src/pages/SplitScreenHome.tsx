import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Theater, BookOpen } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function SplitScreenHome() {
  const { locale, t } = useLocale();
  const [, setLocation] = useLocation();
  const [expandingPane, setExpandingPane] = useState<'plays' | 'tales' | null>(null);

  const handlePaneClick = useCallback((pane: 'plays' | 'tales', href: string) => {
    if (expandingPane) return; // Prevent double-clicks
    setExpandingPane(pane);
    // Let the animation play before navigating
    setTimeout(() => {
      setLocation(href);
    }, 600);
  }, [expandingPane, setLocation]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden flex bg-stage-cream">
      <SiteHeader theme={expandingPane === 'plays' ? 'dark' : expandingPane === 'tales' ? 'light' : 'split'} />
      
      {/* Plays Pane (Left) */}
      <motion.div
        className={cn(
          "split-pane relative h-full flex items-center justify-center cursor-pointer group z-10 shrink-0",
          "bg-stage-pink bg-[radial-gradient(circle_at_center,_var(--color-stage-pink)_0%,_#A84D70_100%)]",
          "text-white",
          (expandingPane === 'tales') ? 'w-0' : (expandingPane === 'plays') ? 'w-full' : 'w-1/2'
        )}
        onClick={() => handlePaneClick('plays', `/${locale}/plays`)}
        data-testid="pane-plays"
        initial={false}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors duration-500 z-0" />
        
        {/* Content wrapper */}
        <div className={cn(
          "relative z-10 flex flex-col items-center text-center px-8 transition-opacity duration-300 min-w-max",
          expandingPane === 'tales' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}>
          <div className="mb-6 p-4 rounded-full bg-white/10 group-hover:scale-110 group-hover:bg-stage-mint/20 transition-all duration-500">
            <Theater className="w-12 h-12 text-stage-mint" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            {t.nav.plays}
          </h2>
          <p className="font-mono text-sm md:text-base uppercase tracking-widest text-white/80 group-hover:text-stage-mint transition-colors duration-300">
            {t.hero.exploreStage}
          </p>
        </div>
      </motion.div>

      {/* Fairy Tales Pane (Right) */}
      <motion.div
        className={cn(
          "split-pane relative h-full flex items-center justify-center cursor-pointer group z-10 shrink-0",
          "bg-stage-yellow bg-[radial-gradient(circle_at_center,_var(--color-stage-yellow)_0%,_#C9A850_100%)]",
          "text-stage-dark",
          (expandingPane === 'plays') ? 'w-0' : (expandingPane === 'tales') ? 'w-full' : 'w-1/2'
        )}
        onClick={() => handlePaneClick('tales', `/${locale}/fairy-tales`)}
        data-testid="pane-tales"
        initial={false}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors duration-500 z-0" />
        
        {/* Content wrapper */}
        <div className={cn(
          "relative z-10 flex flex-col items-center text-center px-8 transition-opacity duration-300 min-w-max",
          expandingPane === 'plays' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}>
          <div className="mb-6 p-4 rounded-full bg-black/5 group-hover:scale-110 group-hover:bg-stage-mint/20 transition-all duration-500">
            <BookOpen className="w-12 h-12 text-stage-mint" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            {t.nav.fairyTales}
          </h2>
          <p className="font-mono text-sm md:text-base uppercase tracking-widest text-stage-dark/70 group-hover:text-stage-mint transition-colors duration-300">
            {t.hero.enterMagic}
          </p>
        </div>
      </motion.div>

      {/* Mobile hint if needed, though they stack usually, but requirement says split pane */}
      {/* Absolute center divider visual - optional but nice for aesthetics */}
      {!expandingPane && (
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 mix-blend-overlay z-20 pointer-events-none" />
      )}
    </div>
  );
}
