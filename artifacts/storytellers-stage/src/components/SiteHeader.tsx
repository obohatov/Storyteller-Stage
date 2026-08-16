import { BookOpen, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { LANGUAGES, type Language } from '@/translations';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  showBack?: boolean;
  backHref?: string;
  theme?: 'dark' | 'light' | 'split';
}

export function SiteHeader({ showBack, backHref, theme = 'light' }: SiteHeaderProps) {
  const { locale, navigateLocale, t } = useLocale();

  return (
    <header className={cn(
      "absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none",
      theme === 'dark' ? 'text-white' : theme === 'light' ? 'text-stage-dark' : ''
    )}>
      <div className={cn(
        "flex-1 flex items-center gap-4 pointer-events-auto",
        theme === 'split' ? 'text-white' : ''
      )}>
        {showBack && backHref ? (
          <Link href={backHref} className="hover:text-stage-mint transition-colors p-2 -ml-2" data-testid="btn-back">
            <ArrowLeft className="w-6 h-6" />
            <span className="sr-only">{t.nav.backToHome}</span>
          </Link>
        ) : (
          <Link href={`/${locale}`} className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <BookOpen className="w-8 h-8 text-stage-mint group-hover:scale-110 transition-transform" />
            <span className="font-serif text-xl font-bold tracking-wide hidden sm:inline-block">
              The Storyteller's Stage
            </span>
          </Link>
        )}
      </div>

      <nav className={cn(
        "flex items-center gap-6 pointer-events-auto",
        theme === 'split' ? 'text-stage-dark' : ''
      )}>
        <div className="hidden md:flex items-center gap-6 font-mono text-sm tracking-wider mr-4">
          <Link href={`/${locale}/about`} className="hover:text-stage-mint transition-colors">
            {t.nav.about}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-stage-mint transition-colors">
            {t.nav.contact}
          </Link>
        </div>
        
        <ul className={cn(
          "flex items-center gap-2 p-1 rounded-full backdrop-blur-sm font-mono text-sm tracking-wider",
          theme === 'dark' ? 'bg-white/10' : 'bg-black/5'
        )}>
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => navigateLocale(lang.code)}
                data-testid={`lang-btn-${lang.code}`}
                className={cn(
                  "px-3 py-1.5 rounded-full transition-all duration-200",
                  locale === lang.code 
                    ? "bg-stage-mint text-white shadow-sm" 
                    : theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10"
                )}
                aria-label={lang.nativeLabel}
                aria-current={locale === lang.code ? 'true' : undefined}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
