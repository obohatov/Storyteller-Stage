import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { useParams, Link } from 'wouter';
import { useGetPublicFairyTale, getGetPublicFairyTaleQueryKey } from '@workspace/api-client-react';
import { Loader2 } from 'lucide-react';

export function TaleDetailPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  const slug = params.slug || '';
  
  const { data: tale, isLoading, isError } = useGetPublicFairyTale(slug, { locale }, {
    query: {
      enabled: !!slug,
      queryKey: getGetPublicFairyTaleQueryKey(slug, { locale }),
      retry: false
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
        <SiteHeader showBack backHref={`/${locale}/fairy-tales`} />
        <main className="flex-1 flex justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-stage-yellow" />
        </main>
      </div>
    );
  }

  // Handle the not available case (either true 404 or ContentNotAvailable from backend)
  if (isError || !tale || !tale.available) {
    // If it's a ContentNotAvailable error, the data might actually contain availableLocales, but since it throws an error in react-query we wouldn't easily get it here unless we catch the error object.
    // For now we will just show a graceful fallback.
    return (
      <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
        <SiteHeader showBack backHref={`/${locale}/fairy-tales`} />
        <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center max-w-2xl">
          <h1 className="text-4xl font-serif font-bold text-stage-dark mb-6">Not Available</h1>
          <p className="text-xl text-stage-dark/70 font-sans mb-8">This tale is not yet available in the selected language.</p>
          
          <div className="flex gap-4 items-center justify-center">
            <Link href={`/${locale}/fairy-tales`}>
              <span className="inline-block px-6 py-3 bg-stage-yellow text-white rounded-full font-medium hover:bg-stage-yellow/90 transition-colors cursor-pointer">
                Return to Fairy Tales
              </span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-stage-yellow -z-10" />
      
      <SiteHeader showBack backHref={`/${locale}/fairy-tales`} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-4xl flex flex-col items-center text-center">
        
        {tale.coverImagePath && (
          <div className="mb-12 shadow-2xl rounded-2xl overflow-hidden w-full max-w-2xl aspect-[4/3] bg-white border border-white/20">
            <img src={`/api/storage/public-objects/${tale.coverImagePath}`} className="w-full h-full object-cover" alt="" />
          </div>
        )}
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-stage-dark mb-12 max-w-3xl leading-tight">
          {tale.title}
        </h1>

        {tale.availableLocales && tale.availableLocales.length > 1 && (
          <div className="mb-8 flex items-center justify-center gap-2 text-sm font-sans font-medium text-stage-dark/60">
            <span>Also available in:</span>
            {tale.availableLocales.filter(l => l !== locale).map(l => (
              <Link key={l} href={`/${l}/fairy-tales/${tale.slug}`}>
                <span className="uppercase text-stage-mint hover:underline cursor-pointer">{l}</span>
              </Link>
            ))}
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-16 w-full text-left mt-4 text-lg leading-relaxed text-stage-dark/80 font-sans shadow-stage-yellow/20">
          {tale.blurb && (
            <>
              <p className="whitespace-pre-line text-xl md:text-2xl font-serif text-stage-dark mb-8 leading-relaxed text-center">
                {tale.blurb}
              </p>
              <div className="w-16 h-px bg-stage-yellow/50 mb-12 mx-auto" />
            </>
          )}
          
          <div 
            className="prose prose-lg prose-stage max-w-none font-sans"
            dangerouslySetInnerHTML={{ __html: tale.body || '' }}
          />
        </div>
      </main>
    </div>
  );
}
