import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAdminFairyTale,
  getGetAdminFairyTaleQueryKey,
  useUpdateAdminFairyTale,
  useUpsertFairyTaleTranslation,
  usePublishFairyTaleTranslation,
  useUnpublishFairyTaleTranslation,
  useDeleteAdminFairyTale
} from '@workspace/api-client-react';
import { ChevronLeft, Save, Globe2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TiptapEditor } from './TiptapEditor';
import { ImageUpload } from './ImageUpload';

const LOCALES = ['en', 'ua', 'ru', 'nl'];

export default function AdminFairyTaleEdit() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('base');
  
  const { data: tale, isLoading } = useGetAdminFairyTale(id, {
    query: {
      enabled: !!id,
      queryKey: getGetAdminFairyTaleQueryKey(id)
    }
  });

  const { mutate: updateBase, isPending: isUpdatingBase } = useUpdateAdminFairyTale();
  const { mutate: deleteTale, isPending: isDeleting } = useDeleteAdminFairyTale();
  const { mutate: upsertTrans, isPending: isUpserting } = useUpsertFairyTaleTranslation();
  const { mutate: publishTrans, isPending: isPublishing } = usePublishFairyTaleTranslation();
  const { mutate: unpublishTrans, isPending: isUnpublishing } = useUnpublishFairyTaleTranslation();

  // Base state
  const [baseData, setBaseData] = useState({
    slug: '',
    ageRecommendation: '',
    estimatedReadingTime: '',
    themes: '',
    coverImagePath: null as string | null
  });

  // Translations state
  const [translations, setTranslations] = useState<Record<string, any>>({});

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (tale && initializedForId.current !== id) {
      initializedForId.current = id;
      setBaseData({
        slug: tale.slug || '',
        ageRecommendation: tale.ageRecommendation || '',
        estimatedReadingTime: tale.estimatedReadingTime?.toString() || '',
        themes: tale.themes?.join(', ') || '',
        coverImagePath: tale.coverImagePath || null
      });

      const transMap: Record<string, any> = {};
      LOCALES.forEach(loc => {
        const t = tale.translations.find(tr => tr.locale === loc);
        transMap[loc] = {
          title: t?.title || '',
          blurb: t?.blurb || '',
          body: t?.body || '',
          seoTitle: t?.seoTitle || '',
          seoDescription: t?.seoDescription || '',
          status: t?.status || 'missing'
        };
      });
      setTranslations(transMap);
    }
  }, [tale, id]);

  const handleSaveBase = () => {
    updateBase({
      id,
      data: {
        slug: baseData.slug,
        ageRecommendation: baseData.ageRecommendation || null,
        estimatedReadingTime: baseData.estimatedReadingTime ? Number(baseData.estimatedReadingTime) : null,
        themes: baseData.themes ? baseData.themes.split(',').map(t => t.trim()).filter(Boolean) : null,
        coverImagePath: baseData.coverImagePath
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminFairyTaleQueryKey(id) });
        alert('Saved base settings');
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this fairy tale entirely?')) {
      deleteTale({ id }, {
        onSuccess: () => setLocation('/admin/fairy-tales')
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
        blurb: t.blurb || null,
        body: t.body || null,
        seoTitle: t.seoTitle || null,
        seoDescription: t.seoDescription || null
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminFairyTaleQueryKey(id) });
        alert(`Saved ${loc.toUpperCase()} translation`);
      }
    });
  };

  const handlePublishToggle = (loc: string) => {
    const currentStatus = translations[loc].status;
    if (currentStatus === 'published') {
      unpublishTrans({ id, locale: loc }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminFairyTaleQueryKey(id) })
      });
    } else {
      publishTrans({ id, locale: loc }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminFairyTaleQueryKey(id) })
      });
    }
  };

  if (isLoading || !tale) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stage-mint" />
      </div>
    );
  }

  const isSaving = isUpdatingBase || isUpserting || isPublishing || isUnpublishing;

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="bg-white border-b border-[#DCD6CC] px-8 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLocation('/admin/fairy-tales')}
              className="p-2 hover:bg-[#F7F5F0] rounded-lg transition-colors text-stage-dark/60 hover:text-stage-dark"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-serif font-bold text-stage-dark">{baseData.slug || 'New Tale'}</h1>
              <div className="text-xs text-stage-dark/50">Edit Fairy Tale</div>
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
              className="flex items-center gap-2 px-5 py-2 bg-stage-mint text-white rounded-lg text-sm font-medium hover:bg-stage-mint/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save {activeTab === 'base' ? 'Settings' : activeTab.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto p-8 flex gap-8">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('base')}
            className={cn(
              "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-between items-center",
              activeTab === 'base' 
                ? "bg-white border border-[#DCD6CC] text-stage-dark shadow-sm" 
                : "text-stage-dark/60 hover:bg-white/50"
            )}
          >
            Base Settings
          </button>
          
          <div className="pt-4 pb-2 px-4">
            <div className="text-xs font-bold tracking-wider text-stage-dark/40 uppercase">Translations</div>
          </div>
          
          {LOCALES.map(loc => {
            const status = tale.translations.find(t => t.locale === loc)?.status || 'missing';
            return (
              <button
                key={loc}
                onClick={() => setActiveTab(loc)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-between items-center",
                  activeTab === loc 
                    ? "bg-white border border-[#DCD6CC] text-stage-dark shadow-sm" 
                    : "text-stage-dark/60 hover:bg-white/50"
                )}
              >
                <span className="uppercase">{loc}</span>
                {status === 'published' && <span className="w-2 h-2 rounded-full bg-stage-mint" />}
                {status === 'draft' && <span className="w-2 h-2 rounded-full bg-stage-yellow" />}
                {status === 'missing' && <span className="w-2 h-2 rounded-full bg-[#DCD6CC]" />}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="flex-1">
          {activeTab === 'base' ? (
            <div className="bg-white border border-[#DCD6CC] rounded-2xl p-8 space-y-6 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-stage-dark border-b border-[#EBE7DF] pb-4">Base Settings</h2>
              
              <div className="grid gap-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">URL Slug</label>
                  <input 
                    type="text"
                    value={baseData.slug}
                    onChange={e => setBaseData(p => ({ ...p, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-yellow/50"
                  />
                  <p className="text-xs text-stage-dark/50 mt-1">Changing this will change the public URL for all languages.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stage-dark mb-2">Age Recommendation</label>
                    <input 
                      type="text"
                      placeholder="e.g. 5-8 years"
                      value={baseData.ageRecommendation}
                      onChange={e => setBaseData(p => ({ ...p, ageRecommendation: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-yellow/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stage-dark mb-2">Read Time (mins)</label>
                    <input 
                      type="number"
                      value={baseData.estimatedReadingTime}
                      onChange={e => setBaseData(p => ({ ...p, estimatedReadingTime: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-yellow/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Themes (comma separated)</label>
                  <input 
                    type="text"
                    placeholder="e.g. courage, friendship, magic"
                    value={baseData.themes}
                    onChange={e => setBaseData(p => ({ ...p, themes: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-yellow/50"
                  />
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
                  <label className="block text-sm font-medium text-stage-dark mb-2">Title *</label>
                  <input 
                    type="text"
                    value={translations[activeTab]?.title || ''}
                    onChange={e => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], title: e.target.value } }))}
                    className="w-full text-lg px-4 py-3 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-yellow/50 font-serif"
                    placeholder="Tale title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Short Blurb</label>
                  <textarea 
                    value={translations[activeTab]?.blurb || ''}
                    onChange={e => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], blurb: e.target.value } }))}
                    className="w-full px-4 py-3 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-yellow/50 min-h-[100px] resize-y"
                    placeholder="A short description for the listing page..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stage-dark mb-2">Full Story Body</label>
                  <TiptapEditor 
                    value={translations[activeTab]?.body || ''}
                    onChange={html => setTranslations(p => ({ ...p, [activeTab]: { ...p[activeTab], body: html } }))}
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
