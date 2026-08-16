import { useGetAdminDashboard, getGetAdminDashboardQueryKey } from '@workspace/api-client-react';
import { BookOpen, Drama, Globe2 } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useGetAdminDashboard({
    query: {
      queryKey: getGetAdminDashboardQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-[#DCD6CC] rounded-lg w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-[#DCD6CC] rounded-xl" />
          <div className="h-32 bg-[#DCD6CC] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          Failed to load dashboard statistics.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
      <header>
        <h1 className="text-4xl font-serif font-bold text-stage-dark mb-2">Welcome Back</h1>
        <p className="text-lg text-stage-dark/60 font-sans">Here's the current state of your published works.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/fairy-tales">
          <div className="bg-white p-6 rounded-2xl border border-[#DCD6CC] shadow-sm hover:shadow-md hover:border-stage-yellow/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#F7F5F0] rounded-xl group-hover:bg-stage-yellow/10 transition-colors">
                <BookOpen className="w-6 h-6 text-stage-yellow" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stage-dark mb-1">Fairy Tales</h2>
            <div className="flex items-center gap-4 text-sm font-sans text-stage-dark/60">
              <span className="font-medium text-stage-mint">{stats.publishedFairyTales} Published</span>
              <span className="w-1 h-1 rounded-full bg-[#DCD6CC]" />
              <span>{stats.draftFairyTales} Drafts</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/plays">
          <div className="bg-white p-6 rounded-2xl border border-[#DCD6CC] shadow-sm hover:shadow-md hover:border-stage-pink/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#F7F5F0] rounded-xl group-hover:bg-stage-pink/10 transition-colors">
                <Drama className="w-6 h-6 text-stage-pink" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stage-dark mb-1">Plays</h2>
            <div className="flex items-center gap-4 text-sm font-sans text-stage-dark/60">
              <span className="font-medium text-stage-mint">{stats.publishedPlays} Published</span>
              <span className="w-1 h-1 rounded-full bg-[#DCD6CC]" />
              <span>{stats.draftPlays} Drafts</span>
            </div>
          </div>
        </Link>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Globe2 className="w-5 h-5 text-stage-dark/40" />
          <h2 className="text-xl font-serif font-bold text-stage-dark">Translation Coverage</h2>
        </div>
        
        <div className="bg-white border border-[#DCD6CC] rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-[#DCD6CC]">
            {stats.translationCoverage.map((cov) => (
              <div key={cov.locale} className="p-4 sm:p-6 flex items-center justify-between hover:bg-[#F7F5F0]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#EBE7DF] flex items-center justify-center font-mono font-bold text-stage-dark/70 uppercase">
                    {cov.locale}
                  </div>
                  <div>
                    <div className="font-medium text-stage-dark">
                      {cov.locale === 'en' ? 'English' : 
                       cov.locale === 'ua' ? 'Ukrainian' : 
                       cov.locale === 'ru' ? 'Russian' : 
                       cov.locale === 'nl' ? 'Dutch' : cov.locale}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm font-sans">
                  <div className="text-right">
                    <div className="font-medium text-stage-mint">{cov.published}</div>
                    <div className="text-stage-dark/50 text-xs uppercase tracking-wider">Published</div>
                  </div>
                  <div className="w-px h-8 bg-[#DCD6CC]" />
                  <div className="text-right">
                    <div className="font-medium text-stage-dark/70">{cov.draft}</div>
                    <div className="text-stage-dark/50 text-xs uppercase tracking-wider">Drafts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
