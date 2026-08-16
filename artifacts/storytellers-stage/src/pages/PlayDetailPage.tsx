import { useState } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { useParams, Link } from 'wouter';
import { useGetPublicPlay, getGetPublicPlayQueryKey } from '@workspace/api-client-react';
import { Loader2, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { workTitle, buildHreflang, buildPageUrl, type SeoLocale } from '@/lib/seo';
import { RequestScriptModal } from '@/components/RequestScriptModal';

export function PlayDetailPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  const slug = params.slug || '';
  const [modalOpen, setModalOpen] = useState(false);

  const { data: play, isLoading, isError } = useGetPublicPlay(slug, { locale }, {
    query: {
      enabled: !!slug,
      queryKey: getGetPublicPlayQueryKey(slug, { locale }),
      retry: false
    }
  });

  const anyPlay = play as typeof play & { coverImageAlt?: string; seoTitle?: string; seoDescription?: string };

  const hreflang = play?.available && play.availableLocales
    ? buildHreflang(l => buildPageUrl(l as SeoLocale, 'plays', slug), play.availableLocales)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
        <SiteHeader showBack backHref={`/${locale}/plays`} theme="dark" />
        <main className="flex-1 flex justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-stage-pink" />
        </main>
      </div>
    );
  }

  if (isError || !play || !play.available) {
    return (
      <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
        <Helmet htmlAttributes={{ lang: locale }}>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <SiteHeader showBack backHref={`/${locale}/plays`} theme="dark" />
        <main className="flex-1 container mx-auto px-6 flex flex-col items-center justify-center text-center max-w-2xl">
          <h1 className="text-4xl font-serif font-bold text-stage-dark mb-6">Not Available</h1>
          <p className="text-xl text-stage-dark/70 font-sans mb-8">This play is not yet available in the selected language.</p>
          <div className="flex gap-4 items-center justify-center">
            <Link href={`/${locale}/plays`}>
              <span className="inline-block px-6 py-3 bg-stage-pink text-white rounded-full font-medium hover:bg-stage-pink/90 transition-colors cursor-pointer">
                Return to Plays
              </span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const pageTitle = anyPlay.seoTitle || workTitle(play.title ?? '', locale as SeoLocale);
  const pageDesc  = anyPlay.seoDescription || play.logline || '';
  const coverUrl  = play.coverImagePath ? `/api/storage/public-objects/${play.coverImagePath}` : undefined;

  // Show Request Full Script CTA for on_request or excerpt_only availability
  const showRequestCta =
    (play as typeof play & { scriptAvailability?: string }).scriptAvailability !== 'public';

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <Helmet htmlAttributes={{ lang: locale }}>
        <title>{pageTitle}</title>
        {pageDesc && <meta name="description" content={pageDesc} />}
        <link rel="canonical" href={buildPageUrl(locale as SeoLocale, 'plays', slug)} />
        {hreflang.map(({ lang, href }) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}
        {coverUrl && <meta property="og:image" content={coverUrl} />}
      </Helmet>

      <div className="absolute top-0 left-0 w-full h-[60vh] bg-stage-pink -z-10" />

      <SiteHeader showBack backHref={`/${locale}/plays`} theme="dark" />

      <main className="flex-1 container mx-auto px-6 pt-24 pb-24 max-w-4xl flex flex-col items-center text-center">

        {play.coverImagePath && (
          <div className="mb-12 shadow-2xl rounded-2xl overflow-hidden w-full max-w-lg aspect-square bg-white border border-white/20">
            <img
              src={`/api/storage/public-objects/${play.coverImagePath}`}
              className="w-full h-full object-cover"
              alt={anyPlay.coverImageAlt || (play.title ?? '')}
              loading="eager"
            />
          </div>
        )}

        <span className="font-mono text-sm tracking-widest text-stage-mint/90 uppercase mb-6 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
          {play.genre || 'Play'}
        </span>

        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 max-w-3xl leading-tight">
          {play.title}
        </h1>

        {play.availableLocales && play.availableLocales.length > 1 && (
          <div className="mb-12 flex items-center justify-center gap-2 text-sm font-sans font-medium text-white/80">
            <span>Also available in:</span>
            {play.availableLocales.filter(l => l !== locale).map(l => (
              <Link key={l} href={`/${l}/plays/${play.slug}`}>
                <span className="uppercase text-white hover:underline cursor-pointer">{l}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {play.estimatedDuration && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white">
              <div className="text-xs uppercase tracking-wider opacity-70 font-mono mb-1">Duration</div>
              <div className="font-serif text-lg">{play.estimatedDuration} min</div>
            </div>
          )}
          {play.castSize && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white">
              <div className="text-xs uppercase tracking-wider opacity-70 font-mono mb-1">Cast Size</div>
              <div className="font-serif text-lg">{play.castSize}</div>
            </div>
          )}
          {play.targetAudience && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white">
              <div className="text-xs uppercase tracking-wider opacity-70 font-mono mb-1">Audience</div>
              <div className="font-serif text-lg">{play.targetAudience}</div>
            </div>
          )}
          {play.stagingComplexity && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white">
              <div className="text-xs uppercase tracking-wider opacity-70 font-mono mb-1">Staging</div>
              <div className="font-serif text-lg">{play.stagingComplexity}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-16 w-full text-left text-lg leading-relaxed text-stage-dark/80 font-sans shadow-stage-pink/10">
          {play.logline && (
            <>
              <p className="whitespace-pre-line text-xl md:text-2xl font-serif text-stage-dark mb-10 leading-relaxed text-center">
                "{play.logline}"
              </p>
              <div className="w-16 h-px bg-stage-pink/30 mb-10 mx-auto" />
            </>
          )}

          <div className="space-y-12">
            {play.synopsis && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-stage-dark mb-4">Synopsis</h3>
                <div className="prose prose-lg prose-stage max-w-none" dangerouslySetInnerHTML={{ __html: play.synopsis }} />
              </div>
            )}

            {play.excerpt && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-stage-dark mb-4">Excerpt</h3>
                <div className="p-6 bg-[#F7F5F0] rounded-xl border border-[#DCD6CC] prose prose-lg prose-stage max-w-none" dangerouslySetInnerHTML={{ __html: play.excerpt }} />
              </div>
            )}

            {play.stagingNotes && (
              <div>
                <h3 className="text-2xl font-serif font-bold text-stage-dark mb-4">Staging Notes</h3>
                <div className="prose prose-lg prose-stage max-w-none" dangerouslySetInnerHTML={{ __html: play.stagingNotes }} />
              </div>
            )}

            {/* Request Full Script CTA */}
            {showRequestCta && (
              <div className="border-t border-[#DCD6CC] pt-10 flex flex-col items-center text-center gap-4">
                <div className="p-3 bg-stage-pink/10 rounded-xl text-stage-pink">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-stage-dark mb-1">
                    {t.scriptRequest.ctaLabel}
                  </h3>
                  <p className="text-stage-dark/60 font-sans text-sm">
                    Contact the author to receive the complete script.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-8 py-3 bg-stage-pink text-white rounded-full font-sans font-medium hover:bg-stage-pink/90 transition-colors shadow-lg shadow-stage-pink/20"
                  data-testid="btn-request-script"
                >
                  {t.scriptRequest.ctaLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <RequestScriptModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        playTitle={play.title ?? ''}
        playSlug={slug}
      />
    </div>
  );
}
