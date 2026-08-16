import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { Link } from 'wouter';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useListPublicFairyTales, getListPublicFairyTalesQueryKey } from '@workspace/api-client-react';

export function TalesListPage() {
  const { locale, t } = useLocale();

  const { data: tales, isLoading } = useListPublicFairyTales({ locale }, {
    query: {
      queryKey: getListPublicFairyTalesQueryKey({ locale })
    }
  });

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      {/* Background tint header area */}
      <div className="absolute top-0 left-0 w-full h-96 bg-stage-yellow/10 -z-10" />
      
      <SiteHeader showBack backHref={`/${locale}`} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-5xl">
        <header className="mb-16 md:mb-24 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stage-dark mb-6">
            {t.fairyTales.title}
          </h1>
          <p className="text-lg md:text-xl text-stage-dark/70 font-sans max-w-2xl leading-relaxed">
            {t.fairyTales.description}
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-stage-yellow" />
          </div>
        ) : tales?.length === 0 ? (
          <div className="text-center py-24 bg-white/50 border border-stage-yellow/20 rounded-2xl">
            <p className="text-lg font-serif text-stage-dark/60">No fairy tales have been published in this language yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tales?.map((tale) => (
              <Link 
                key={tale.slug} 
                href={`/${locale}/fairy-tales/${tale.slug}`}
                className="group block relative bg-white border border-stage-yellow/30 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                data-testid={`card-tale-${tale.slug}`}
              >
                {/* Subtle hover background fill */}
                <div className="absolute inset-0 bg-stage-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  {tale.coverImagePath && (
                    <div className="w-full h-48 mb-6 overflow-hidden rounded-lg">
                      <img src={`/api/storage/public-objects/${tale.coverImagePath}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  
                  <h2 className="text-3xl font-serif font-bold text-stage-dark mb-4 group-hover:text-[#C9A850] transition-colors">
                    {tale.title}
                  </h2>
                  
                  {tale.blurb && (
                    <p className="text-stage-dark/70 font-sans mb-8 flex-1">
                      {tale.blurb}
                    </p>
                  )}
                  
                  <div className="flex items-center text-stage-mint font-medium font-sans tracking-wide text-sm mt-auto">
                    <span>Read more</span>
                    <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
