import { useListAdminPlays, getListAdminPlaysQueryKey, useCreateAdminPlay } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Plus, Drama, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPlaysList() {
  const { data: plays, isLoading } = useListAdminPlays({
    query: {
      queryKey: getListAdminPlaysQueryKey()
    }
  });

  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { mutate: createPlay, isPending: isCreating } = useCreateAdminPlay();

  const handleCreate = () => {
    const slug = `new-play-${Date.now()}`;
    createPlay(
      { data: { slug, scriptAvailability: 'on_request' } },
      {
        onSuccess: (newPlay) => {
          queryClient.invalidateQueries({ queryKey: getListAdminPlaysQueryKey() });
          setLocation(`/admin/plays/${newPlay.id}`);
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stage-mint/10 text-stage-mint border border-stage-mint/20">Published</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stage-pink/10 text-stage-pink border border-stage-pink/20">Draft</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#EBE7DF] text-stage-dark/50 border border-[#DCD6CC]">Missing</span>;
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stage-dark mb-2">Stage Plays</h1>
          <p className="text-lg text-stage-dark/60 font-sans">Manage your theatrical works.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="flex items-center gap-2 px-5 py-2.5 bg-stage-dark text-white rounded-lg font-sans font-medium hover:bg-black transition-colors disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Play
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-xl border border-[#DCD6CC] animate-pulse" />
          ))}
        </div>
      ) : plays?.length === 0 ? (
        <div className="bg-white border border-[#DCD6CC] border-dashed rounded-2xl p-12 text-center">
          <Drama className="w-12 h-12 text-stage-dark/20 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-medium text-stage-dark mb-2">No plays yet</h3>
          <p className="text-stage-dark/60 mb-6 font-sans">Create your first stage play.</p>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#DCD6CC] text-stage-dark rounded-lg font-sans font-medium hover:bg-[#F7F5F0] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Play
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {plays?.map(play => {
            return (
              <Link key={play.id} href={`/admin/plays/${play.id}`}>
                <div className="bg-white p-6 rounded-xl border border-[#DCD6CC] shadow-sm hover:shadow-md hover:border-stage-pink/40 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-serif font-bold text-stage-dark group-hover:text-stage-pink transition-colors">
                        {play.slug}
                      </h2>
                      {play.genre && (
                        <span className="font-mono text-xs text-stage-dark/60 px-2 py-0.5 bg-[#F7F5F0] rounded uppercase tracking-wider">{play.genre}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-sans text-stage-dark/50">
                      {play.castSize && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {play.castSize}
                        </span>
                      )}
                      <span>Updated {format(new Date(play.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    {['en', 'ua', 'ru', 'nl'].map(loc => {
                      const trans = play.translations.find(t => t.locale === loc);
                      return (
                        <div key={loc} className="flex flex-col items-center gap-1 min-w-[3rem]">
                          <span className="text-xs font-mono font-bold uppercase text-stage-dark/40">{loc}</span>
                          {getStatusBadge(trans?.status || 'missing')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
