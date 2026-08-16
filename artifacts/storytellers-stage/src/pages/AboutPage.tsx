import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { useGetPublicAbout, getGetPublicAboutQueryKey } from '@workspace/api-client-react';
import { Loader2 } from 'lucide-react';

export function AboutPage() {
  const { locale, t } = useLocale();

  const { data: about, isLoading, isError } = useGetPublicAbout(locale, {
    query: {
      queryKey: getGetPublicAboutQueryKey(locale)
    }
  });

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <SiteHeader showBack backHref={`/${locale}`} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-4xl flex flex-col justify-center items-center">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-stage-dark mb-16 text-center">
          {t.about.title}
        </h1>

        {isLoading ? (
          <div className="flex justify-center p-12 w-full">
            <Loader2 className="w-8 h-8 animate-spin text-stage-dark" />
          </div>
        ) : isError || !about || !about.available ? (
          <div className="text-center py-24 bg-white/50 border border-stage-dark/10 rounded-2xl w-full">
            <p className="text-lg font-serif text-stage-dark/60">Biography coming soon.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col md:flex-row gap-12 items-start">
            {about.authorPhotoPath && (
              <div className="w-full md:w-1/3 shrink-0 rounded-2xl overflow-hidden shadow-xl bg-white p-2">
                <div className="rounded-xl overflow-hidden aspect-[3/4]">
                  <img src={`/api/storage/public-objects/${about.authorPhotoPath}`} alt="Author Portrait" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            <div className="flex-1 bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-stage-dark/5 border border-stage-dark/5">
              {about.body ? (
                <div 
                  className="prose prose-lg prose-stage max-w-none font-sans text-stage-dark/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: about.body }}
                />
              ) : (
                <p className="text-xl md:text-2xl font-serif text-stage-dark mb-8 leading-relaxed">
                  {t.about.content}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
