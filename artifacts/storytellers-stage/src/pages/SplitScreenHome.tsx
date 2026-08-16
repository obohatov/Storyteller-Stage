import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Theater, BookOpen } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { staticTitle, staticDesc, buildHreflang, buildPageUrl, type SeoLocale } from '@/lib/seo';

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

  const hreflang = buildHreflang(l => buildPageUrl(l as SeoLocale));

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden flex bg-stage-cream">
      <Helmet htmlAttributes={{ lang: locale }}>
        <title>{staticTitle('home', locale as SeoLocale)}</title>
        <meta name="description" content={staticDesc('home', locale as SeoLocale)} />
        <link rel="canonical" href={buildPageUrl(locale as SeoLocale)} />
        {hreflang.map(({ lang, href }) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${window.location.origin}${import.meta.env.BASE_URL}`} />
      </Helmet>

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
        
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8 text-center max-w-sm pointer-events-none">
          <Theater size={48} className="opacity-80" />
          <h2 className="text-4xl font-serif font-bold leading-snug">{t.plays.title}</h2>
          <p className="text-sm text-white/70 leading-relaxed font-sans">{t.hero.exploreStage}</p>
        </div>
      </motion.div>

      {/* Divider */}
      <div
        className={cn(
          "w-px bg-white/20 shrink-0 z-20 transition-all duration-700",
          expandingPane !== null && 'w-0 opacity-0'
        )}
      />

      {/* Fairy Tales Pane (Right) */}
      <motion.div
        className={cn(
          "split-pane relative h-full flex items-center justify-center cursor-pointer group z-10 shrink-0",
          "bg-stage-yellow bg-[radial-gradient(circle_at_center,_var(--color-stage-yellow)_0%,_#C9A850_100%)]",
          "text-white",
          (expandingPane === 'plays') ? 'w-0' : (expandingPane === 'tales') ? 'w-full' : 'w-1/2'
        )}
        onClick={() => handlePaneClick('tales', `/${locale}/fairy-tales`)}
        data-testid="pane-tales"
        initial={false}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/5 transition-colors duration-500 z-0" />
        
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8 text-center max-w-sm pointer-events-none">
          <BookOpen size={48} className="opacity-80" />
          <h2 className="text-4xl font-serif font-bold leading-snug">{t.fairyTales.title}</h2>
          <p className="text-sm text-white/70 leading-relaxed font-sans">{t.hero.enterMagic}</p>
        </div>
      </motion.div>
    </div>
  );
}
