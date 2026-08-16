import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { useParams, Redirect } from 'wouter';

export function TaleDetailPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  
  const tale = t.fairyTales.items.find((p) => p.slug === params.slug);
  
  if (!tale) {
    return <Redirect to={`/${locale}/fairy-tales`} />;
  }

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-stage-yellow -z-10" />
      
      <SiteHeader showBack backHref={`/${locale}/fairy-tales`} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-4xl flex flex-col items-center text-center">
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-stage-dark mb-12 max-w-3xl leading-tight">
          {tale.title}
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-16 w-full text-left mt-4 text-lg leading-relaxed text-stage-dark/80 font-sans shadow-stage-yellow/20">
          <p className="whitespace-pre-line text-xl md:text-2xl font-serif text-stage-dark mb-8 leading-relaxed">
            {tale.summary}
          </p>
          <div className="w-16 h-px bg-stage-yellow/50 mb-8 mx-auto" />
          <p className="whitespace-pre-line">
            {tale.fullDescription}
          </p>
        </div>
      </main>
    </div>
  );
}
