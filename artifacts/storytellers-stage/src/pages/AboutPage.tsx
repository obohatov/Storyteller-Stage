import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';

export function AboutPage() {
  const { locale, t } = useLocale();

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <SiteHeader showBack backHref={`/${locale}`} />
      
      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-3xl flex flex-col justify-center">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-stage-dark mb-12">
          {t.about.title}
        </h1>
        
        <div className="prose prose-lg prose-stage max-w-none text-stage-dark/80 font-sans leading-relaxed">
          <p className="text-xl md:text-2xl font-serif text-stage-dark mb-8 leading-relaxed">
            {t.about.content}
          </p>
        </div>
      </main>
    </div>
  );
}
