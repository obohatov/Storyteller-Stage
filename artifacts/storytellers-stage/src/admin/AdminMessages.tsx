import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Mail, FileText, Clock, ChevronRight, Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

type MessageListItem = {
  id: number;
  type: 'contact' | 'script_request';
  status: 'new' | 'read' | 'archived';
  locale: string;
  name: string;
  email: string;
  enquiryCategory: string | null;
  playId: number | null;
  organization: string | null;
  createdAt: string;
  playTitle: string | null;
};

type Tab = 'all' | 'contact' | 'script_request';

function getApiBase() {
  return (import.meta.env.BASE_URL as string).replace(/\/+$/, '');
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 30)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const STATUS_STYLES: Record<string, string> = {
  new:      'bg-stage-mint/15 text-stage-mint border-stage-mint/30',
  read:     'bg-stage-dark/8 text-stage-dark/50 border-stage-dark/15',
  archived: 'bg-[#DCD6CC]/50 text-stage-dark/40 border-[#DCD6CC]',
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<MessageListItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [tab, setTab]           = useState<Tab>('all');

  useEffect(() => {
    const base = getApiBase();
    setLoading(true);
    fetch(`${base}/api/admin/messages`, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new Error('fetch failed');
        setMessages(await r.json() as MessageListItem[]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof Mail }[] = [
    { key: 'all',            label: 'All',             icon: Inbox },
    { key: 'contact',        label: 'Contact',         icon: Mail },
    { key: 'script_request', label: 'Script Requests', icon: FileText },
  ];

  const filtered = tab === 'all' ? messages : messages.filter((m) => m.type === tab);
  const newCount = (t: Tab) =>
    messages.filter((m) => m.status === 'new' && (t === 'all' || m.type === t)).length;

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-serif font-bold text-stage-dark mb-2">Messages</h1>
        <p className="text-lg text-stage-dark/60 font-sans">Contact messages and script requests.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(({ key, label, icon: Icon }) => {
          const n = newCount(key);
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-medium transition-colors border',
                tab === key
                  ? 'bg-white border-[#DCD6CC] text-stage-dark shadow-sm'
                  : 'border-transparent text-stage-dark/60 hover:text-stage-dark hover:bg-white/60',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {n > 0 && (
                <span className="bg-stage-mint text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-stage-dark/30" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-sans">
          Failed to load messages.
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#DCD6CC] p-16 text-center text-stage-dark/40 font-sans">
          No messages yet.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DCD6CC] divide-y divide-[#DCD6CC] shadow-sm overflow-hidden">
          {filtered.map((msg) => (
            <Link key={msg.id} href={`/admin/messages/${msg.id}`}>
              <div className="p-5 sm:p-6 flex items-start gap-4 hover:bg-[#F7F5F0]/60 transition-colors cursor-pointer group">
                {/* Icon */}
                <div className={cn(
                  'mt-0.5 p-2.5 rounded-xl shrink-0',
                  msg.type === 'contact' ? 'bg-stage-mint/10 text-stage-mint' : 'bg-stage-pink/10 text-stage-pink',
                )}>
                  {msg.type === 'contact'
                    ? <Mail className="w-4 h-4" />
                    : <FileText className="w-4 h-4" />}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className={cn(
                      'text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium',
                      STATUS_STYLES[msg.status],
                    )}>
                      {msg.status}
                    </span>
                    {msg.type === 'script_request' && msg.playTitle && (
                      <span className="text-xs text-stage-pink font-medium font-sans truncate">
                        {msg.playTitle}
                      </span>
                    )}
                    {msg.type === 'contact' && msg.enquiryCategory && (
                      <span className="text-xs text-stage-dark/50 font-sans capitalize">
                        {msg.enquiryCategory}
                      </span>
                    )}
                    <span className="text-xs text-stage-dark/30 font-mono uppercase ml-auto">
                      {msg.locale}
                    </span>
                  </div>

                  <p className="font-medium text-stage-dark font-sans">{msg.name}</p>
                  <p className="text-sm text-stage-dark/50 font-sans">{msg.email}</p>
                  {msg.type === 'script_request' && msg.organization && (
                    <p className="text-sm text-stage-dark/40 font-sans mt-0.5">{msg.organization}</p>
                  )}
                </div>

                {/* Date + arrow */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-xs text-stage-dark/40 font-sans">
                    <Clock className="w-3 h-3" />
                    {relativeTime(msg.createdAt)}
                  </div>
                  <ChevronRight className="w-4 h-4 text-stage-dark/20 group-hover:text-stage-dark/50 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
