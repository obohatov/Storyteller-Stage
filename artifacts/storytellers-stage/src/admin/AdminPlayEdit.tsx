import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAdminPlay,
  getGetAdminPlayQueryKey,
  useUpdateAdminPlay,
  useUpsertPlayTranslation,
  usePublishPlayTranslation,
  useUnpublishPlayTranslation,
  useDeleteAdminPlay
} from '@workspace/api-client-react';
import { ChevronLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TiptapEditor } from './TiptapEditor';
import { ImageUpload } from './ImageUpload';

const LOCALES = ['en', 'ua', 'ru', 'nl'];

export default function AdminPlayEdit() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('base');
  
  const { data: play, isLoading } = useGetAdminPlay(id, {
    query: {
      enabled: !!id,
      queryKey: getGetAdminPlayQueryKey(id)
    }
  });

  const { mutate: updateBase, isPending: isUpdatingBase } = useUpdateAdminPlay();
  const { mutate: deletePlay, isPending: isDeleting } = useDeleteAdminPlay();
  const { mutate: upsertTrans, isPending: isUpserting } = useUpsertPlayTranslation();
  const { mutate: publishTrans, isPending: isPublishing } = usePublishPlayTranslation();
  const { mutate: unpublishTrans, isPending: isUnpublishing } = useUnpublishPlayTranslation();

  const [baseData, setBaseData] = useState({
    slug: '',
    genre: '',
    targetAudience: '',
    estimatedDuration: '',
    castSize: '',
    scriptAvailability: 'on_request',
    stagingComplexity: '',
    coverImagePath: null as string | null
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (play && initializedForId.current !== id) {
      initializedForId.current = id;
      setBaseData({
        slug: play.slug || '',
        genre: play.genre || '',
        targetAudience: play.targetAudience || '',
        estimatedDuration: play.estimatedDuration?.toString() || '',
        castSize: play.castSize || '',
        scriptAvailability: play.scriptAvailability || 'on_request',
        stagingComplexity: play.stagingComplexity || '',
        coverImagePath: play.coverImagePath || null
      });

      const transMap: Record<string, any> = {};
      LOCALES.forEach(loc => {
        const t = play.translations.find(tr => tr.locale === loc);
        transMap[loc] = {
          title: t?.title || '',
          logline: t?.logline || '',
          synopsis: t?.synopsis || '',
          excerpt: t?.excerpt || '',
          stagingNotes: t?.stagingNotes || '',
          productionInfo: t?.productionInfo || '',
          coverImageAlt: (t as any)?.coverImageAlt || '',
          status: t?.status || 'missing'
        };
      });
      setTranslations(transMap);
    }
  }, [play, id]);

  const handleSaveBase = () => {
    updateBase({
      id,
      data: {
        slug: baseData.slug,
        genre: baseData.genre || null,
        targetAudience: baseData.targetAudience || null,
        estimatedDuration: baseData.estimatedDuration ? Number(baseData.estimatedDuration) : null,
        castSize: baseData.castSize || null,
        scriptAvailability: baseData.scriptAvailability,
        stagingComplexity: baseData.stagingComplexity || null,
        coverImagePath: baseData.coverImagePath
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminPlayQueryKey(id) });
        alert('Saved base settings');
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this play entirely?')) {
      deletePlay({ id }, {
        onSuccess: () => setLocation('/admin/plays')
      });
    }
  };

  const handleSaveTranslation = (loc: string) => {
    const t = translations[loc];
    if (!t.title) {
      alert('Title is required for translation');
      return;
    }
    
    upsertTrans({
      id,
      locale: loc,
      data: {
        title: t.title,
        logline: t.logline || null,
        synopsis: t.synopsis || null,
        excerpt: t.excerpt || null,
        stagingNotes: t.stagingNotes || null,
        productionInfo: t.productionInfo || null,
        coverImageAlt: t.coverImageAlt || null
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminPlayQueryKey(id) });
        alert(`Saved ${loc.toUpperCase()} translation`);
      }
    });
  };

  const handlePublishToggle = (loc: string) => {
    const currentStatus = translations[loc].status;
    if (currentStatus === 'published') {
      unpublishTrans({ id, locale: loc }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminPlayQueryKey(id) })
      });
    } else {
      publishTrans({ id, locale: loc }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminPlayQueryKey(id) })
      });
    }
  };

  if (isLoading || !play) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-stage-pink" /></div>;
  }

  const isSaving = isUpdatingBase || isUpserting || isPublishing || isUnpublishing;

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="bg-white border-b border-[#DCD6CC] px-8 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation('/admin/plays')}
              className="p-2 hover:bg-[#F7F5F0] rounded-lg transition-colors text-stage-dark/60 hover:text-stage-dark"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-serif font-bold text-stage-dark">{baseData.slug || 'New Play'}</h1>
              <div className="text-xs text-stage-dark/50">Edit Play</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
            <button
              onClick={activeTab === 'base' ? handleSaveBase : () => handleSaveTranslation(activeTab)}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-stage-pink text-white rounded-lg text-sm font-medium hover:bg-stage-pink/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save {activeTab === 'base' ? 'Settings' : activeTab.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-8 flex gap-8">
        <div className="w-48 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('base')}
            className={cn(
              "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-between items-center",
              activeTab === 'base' ? "bg-white border border-[#DCD6CC] text-stage-dark shadow-sm" : "text-stage-dark/60 hover:bg-white/50"
            )}
          >
            Base Settings
          </button>
          
          <div className="pt-4 pb-2 px-4">
            <div className="text-xs font-bold tracking-wider text-stage-dark/40 uppercase">Translations</div>
          </div>
          
          {LOCALES.map(loc => {
            const status = play.translations.find(t => t.locale === loc)?.status || 'missing';
            return (
              <button
                key={loc}
                onClick={() => setActiveTab(loc)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-between items-center",
                  activeTab === loc ? "bg-white border border-[#DCD6CC] text-stage-dark shadow-sm" : "text-stage-dark/60 hover:bg-white/50"
                )}
              >
                <span className="uppercase">{loc}</span>
                {status === 'published' && <span className="w-2 h-2 rounded-full bg-stage-mint" />}
                {status === 'draft' && <span className="w-2 h-2 rounded-full bg-stage-pink" />}
                {status === 'missing' && <span className="w-2 h-2 rounded-full bg-[#DCD6CC]" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1">
          {activeTab === 'base' ? (
            <div className="bg-white border border-[#DCD6CC] rounded-2xl p-8 space-y-6 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-stage-dark border-b border-[#EBE7DF] pb-4">Technical Details</h2>
              
              <div className="grid gap-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">URL Slug</label>
                  <input 
                    type="text" value={baseData.slug} onChange={e => setBaseData(p => ({ ...p, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stage-dark mb-2">Genre</label>
                    <input type="text" value={baseData.genre} onChange={e => setBaseData(p => ({ ...p, genre: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stage-dark mb-2">Duration (mins)</label>
                    <input type="number" value={baseData.estimatedDuration} onChange={e => setBaseData(p => ({ ...p, estimatedDuration: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stage-dark mb-2">Cast Size</label>
                    <input type="text" placeholder="e.g. 2F, 3M" value={baseData.castSize} onChange={e => setBaseData(p => ({ ...p, castSize: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stage-dark mb-2">Staging Complexity</label>
                    <input type="text" placeholder="e.g. Minimal" value={baseData.stagingComplexity} onChange={e => setBaseData(p => ({ ...p, stagingComplexity: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Target Audience</label>
                  <input type="text" placeholder="e.g. Adults, 12+" value={baseData.targetAudience} onChange={e => setBaseData(p => ({ ...p, targetAudience: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Script Availability</label>
                  <select value={baseData.scriptAvailability} onChange={e => setBaseData(p => ({ ...p, scriptAvailability: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50">
                    <option value="on_request">Available On Request</option>
                    <option value="published">Published Book</option>
                    <option value="download">Downloadable PDF</option>
                    <option value="unavailable">Not Currently Available</option>
                  </select>
                </div>
                
                <div>
                  <ImageUpload 
                    label="Cover Image"
                    value={baseData.coverImagePath}
                    onChange={path => setBaseData(p => ({ ...p, coverImagePath: path }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#DCD6CC] rounded-2xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-4">
                <h2 className="text-2xl font-serif font-bold text-stage-dark uppercase">{activeTab} Translation</h2>
                {translations[activeTab]?.status !== 'missing' && (
                  <button
                    onClick={() => handlePublishToggle(activeTab)}
                    disabled={isSaving}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                      translations[activeTab]?.status === 'published' 
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        : "bg-stage-mint/10 text-stage-mint border-stage-mint/20 hover:bg-stage-mint/20"
                    )}
                  >
                    {translations[activeTab]?.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                )}
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Play Title *</label>
                  <input type="text" value={translations[activeTab]?.title || ''} onChange={e => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], title: e.target.value } }))}
                    className="w-full text-lg px-4 py-3 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50 font-serif" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Logline (1-2 sentences)</label>
                  <textarea value={translations[activeTab]?.logline || ''} onChange={e => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], logline: e.target.value } }))}
                    className="w-full px-4 py-3 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50 min-h-[80px]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Full Synopsis</label>
                  <TiptapEditor value={translations[activeTab]?.synopsis || ''} onChange={html => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], synopsis: html } }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Excerpt (Optional)</label>
                  <TiptapEditor value={translations[activeTab]?.excerpt || ''} onChange={html => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], excerpt: html } }))} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Staging Notes (Optional)</label>
                  <TiptapEditor value={translations[activeTab]?.stagingNotes || ''} onChange={html => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], stagingNotes: html } }))} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Cover Image Alt Text <span className="text-stage-dark/40 font-normal">(accessibility & SEO)</span></label>
                  <input
                    type="text"
                    value={translations[activeTab]?.coverImageAlt || ''}
                    onChange={e => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], coverImageAlt: e.target.value } }))}
                    className="w-full px-4 py-3 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-pink/50"
                    placeholder="Describe the cover image for screen readers and search engines…"
                    maxLength={300}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
