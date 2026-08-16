import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { useParams, Redirect } from 'wouter';

export function PlayDetailPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  
  const play = t.plays.items.find((p) => p.slug === params.slug);
  
  if (!play) {
    return <Redirect to={`/${locale}/plays`} />;
  }

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-stage-pink -z-10" />
      
      <SiteHeader showBack backHref={`/${locale}/plays`} theme="dark" />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-4xl flex flex-col items-center text-center">
        <span className="font-mono text-sm tracking-widest text-stage-mint/90 uppercase mb-6 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
          {play.genre}
        </span>
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-12 max-w-3xl leading-tight">
          {play.title}
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-16 w-full text-left mt-8 text-lg leading-relaxed text-stage-dark/80 font-sans shadow-stage-pink/10">
          <p className="whitespace-pre-line text-xl md:text-2xl font-serif text-stage-dark mb-8 leading-relaxed">
            {play.summary}
          </p>
          <div className="w-16 h-px bg-stage-pink/30 mb-8 mx-auto" />
          <p className="whitespace-pre-line">
            {play.fullDescription}
          </p>
        </div>
      </main>
    </div>
  );
}
