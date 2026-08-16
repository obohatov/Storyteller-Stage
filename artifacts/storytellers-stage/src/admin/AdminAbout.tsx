import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAdminAbout,
  getGetAdminAboutQueryKey,
  useSaveAdminAbout
} from '@workspace/api-client-react';
import { Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TiptapEditor } from './TiptapEditor';
import { ImageUpload } from './ImageUpload';

const LOCALES = ['en', 'ua', 'ru', 'nl'];

export default function AdminAbout() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('en');

  const { data: aboutData, isLoading } = useGetAdminAbout(activeTab, {
    query: {
      queryKey: getGetAdminAboutQueryKey(activeTab)
    }
  });

  const { mutate: saveAbout, isPending: isSaving } = useSaveAdminAbout();

  const [localData, setLocalData] = useState({
    body: '',
    authorPhotoPath: null as string | null,
    authorPhotoAlt: '' as string
  });

  const initializedForLoc = useRef<string | null>(null);

  useEffect(() => {
    if (aboutData && initializedForLoc.current !== activeTab) {
      initializedForLoc.current = activeTab;
      setLocalData({
        body: aboutData.body || '',
        authorPhotoPath: aboutData.authorPhotoPath || null,
        authorPhotoAlt: (aboutData as any).authorPhotoAlt || ''
      });
    } else if (!aboutData && !isLoading) {
      initializedForLoc.current = activeTab;
      setLocalData({
        body: '',
        authorPhotoPath: null,
        authorPhotoAlt: ''
      });
    }
  }, [aboutData, activeTab, isLoading]);

  const handleSave = () => {
    saveAbout({
      locale: activeTab,
      data: {
        body: localData.body,
        authorPhotoPath: localData.authorPhotoPath,
        authorPhotoAlt: localData.authorPhotoAlt || null
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminAboutQueryKey(activeTab) });
        alert(`Saved About page for ${activeTab.toUpperCase()}`);
      }
    });
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stage-dark mb-2">Author Bio</h1>
          <p className="text-lg text-stage-dark/60 font-sans">Manage your personal biography across languages.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-stage-mint text-white rounded-lg font-sans font-medium hover:bg-stage-mint/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Biography
        </button>
      </header>

      <div className="flex gap-8">
        {/* Language Tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {LOCALES.map(loc => (
            <button
              key={loc}
              onClick={() => {
                initializedForLoc.current = null; // force re-init
                setActiveTab(loc);
              }}
              className={cn(
                "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors uppercase",
                activeTab === loc 
                  ? "bg-white border border-[#DCD6CC] text-stage-dark shadow-sm" 
                  : "text-stage-dark/60 hover:bg-white/50"
              )}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-white border border-[#DCD6CC] rounded-2xl p-8 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-stage-mint" />
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <ImageUpload 
                  label="Author Portrait"
                  value={localData.authorPhotoPath}
                  onChange={path => setLocalData(p => ({ ...p, authorPhotoPath: path }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stage-dark mb-2">
                  Author Photo Alt Text <span className="text-stage-dark/40 font-normal">(accessibility & SEO)</span>
                </label>
                <input
                  type="text"
                  value={localData.authorPhotoAlt}
                  onChange={e => setLocalData(p => ({ ...p, authorPhotoAlt: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-[#DCD6CC] rounded-lg focus:outline-none focus:ring-2 focus:ring-stage-mint/50"
                  placeholder="Describe the author photo for screen readers and search engines…"
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stage-dark mb-2">Biography ({activeTab.toUpperCase()})</label>
                <TiptapEditor 
                  value={localData.body}
                  onChange={html => setLocalData(p => ({ ...p, body: html }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
