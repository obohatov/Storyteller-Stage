import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { Link } from 'wouter';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useListPublicPlays, getListPublicPlaysQueryKey } from '@workspace/api-client-react';
import { Helmet } from 'react-helmet-async';
import { staticTitle, staticDesc, buildHreflang, buildPageUrl, type SeoLocale } from '@/lib/seo';

export function PlaysListPage() {
  const { locale, t } = useLocale();

  const { data: plays, isLoading } = useListPublicPlays({ locale }, {
    query: {
      queryKey: getListPublicPlaysQueryKey({ locale })
    }
  });

  const hreflang = buildHreflang(l => buildPageUrl(l as SeoLocale, 'plays'));

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <Helmet htmlAttributes={{ lang: locale }}>
        <title>{staticTitle('playList', locale as SeoLocale)}</title>
        <meta name="description" content={staticDesc('playList', locale as SeoLocale)} />
        <link rel="canonical" href={buildPageUrl(locale as SeoLocale, 'plays')} />
        {hreflang.map(({ lang, href }) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}
      </Helmet>

      <div className="absolute top-0 left-0 w-full h-96 bg-stage-pink/10 -z-10" />
      
      <SiteHeader showBack backHref={`/${locale}`} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-5xl">
        <header className="mb-16 md:mb-24 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stage-dark mb-6">
            {t.plays.title}
          </h1>
          <p className="text-lg md:text-xl text-stage-dark/70 font-sans max-w-2xl leading-relaxed">
            {t.plays.description}
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-stage-pink" />
          </div>
        ) : plays?.length === 0 ? (
          <div className="text-center py-24 bg-white/50 border border-stage-pink/20 rounded-2xl">
            <p className="text-lg font-serif text-stage-dark/60">No plays have been published in this language yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plays?.map((play) => {
              const anyPlay = play as typeof play & { coverImageAlt?: string };
              return (
                <Link
                  key={play.slug}
                  href={`/${locale}/plays/${play.slug}`}
                  className="group block relative bg-white border border-stage-pink/30 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  data-testid={`card-play-${play.slug}`}
                >
                  <div className="absolute inset-0 bg-stage-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {play.coverImagePath && (
                      <div className="w-full h-48 mb-6 overflow-hidden rounded-lg">
                        <img
                          src={`/api/storage/public-objects/${play.coverImagePath}`}
                          alt={anyPlay.coverImageAlt || (play.title ?? '')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <h2 className="text-3xl font-serif font-bold text-stage-dark mb-4 group-hover:text-stage-pink transition-colors">
                      {play.title}
                    </h2>
                    
                    {play.genre && (
                      <span className="text-xs font-mono uppercase tracking-wider text-stage-pink/70 mb-3">
                        {play.genre}
                      </span>
                    )}
                    
                    {play.logline && (
                      <p className="text-stage-dark/70 font-sans mb-8 flex-1 italic">
                        "{play.logline}"
                      </p>
                    )}
                    
                    <div className="flex items-center text-stage-mint font-medium font-sans tracking-wide text-sm mt-auto">
                      <span>View play</span>
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
