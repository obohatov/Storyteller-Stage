import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Mail, FileText, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

type MessageDetail = {
  id: number;
  type: 'contact' | 'script_request';
  status: 'new' | 'read' | 'archived';
  locale: string;
  name: string;
  email: string;
  message: string;
  // contact
  enquiryCategory: string | null;
  // script_request
  playId: number | null;
  playTitle: string | null;
  organization: string | null;
  role: string | null;
  city: string | null;
  country: string | null;
  intendedUse: string | null;
  createdAt: string;
};

function getApiBase() {
  return (import.meta.env.BASE_URL as string).replace(/\/+$/, '');
}

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-[#DCD6CC] last:border-0">
      <dt className="text-sm text-stage-dark/50 font-sans font-medium sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm text-stage-dark font-sans break-all">{value}</dd>
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  new:      'bg-stage-mint/15 text-stage-mint border-stage-mint/30',
  read:     'bg-stage-dark/8 text-stage-dark/50 border-stage-dark/15',
  archived: 'bg-[#DCD6CC]/50 text-stage-dark/40 border-[#DCD6CC]',
};

export default function AdminMessageDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = parseInt(params.id, 10);

  const [msg, setMsg]           = useState<MessageDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    const base = getApiBase();
    // Auto-mark as read when opened
    fetch(`${base}/api/admin/messages/${id}`, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json() as MessageDetail;
        setMsg(data);
        // If new, mark as read
        if (data.status === 'new') {
          fetch(`${base}/api/admin/messages/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read' }),
          }).then(async (r2) => {
            if (r2.ok) setMsg(prev => prev ? { ...prev, status: 'read' } : prev);
          }).catch(() => {/* non-critical */});
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (status: 'new' | 'read' | 'archived') => {
    if (!msg || saving) return;
    setSaving(true);
    const base = getApiBase();
    const res = await fetch(`${base}/api/admin/messages/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setMsg(prev => prev ? { ...prev, status } : prev);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    const base = getApiBase();
    const res = await fetch(`${base}/api/admin/messages/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) navigate('/admin/messages');
    else setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-stage-dark/30" />
      </div>
    );
  }

  if (error || !msg) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-sans">
          Message not found.
        </div>
      </div>
    );
  }

  const isContact = msg.type === 'contact';

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/messages">
          <button className="flex items-center gap-2 text-stage-dark/60 hover:text-stage-dark transition-colors text-sm font-sans">
            <ArrowLeft className="w-4 h-4" />
            Messages
          </button>
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-[#DCD6CC] shadow-sm p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-3 rounded-xl',
              isContact ? 'bg-stage-mint/10 text-stage-mint' : 'bg-stage-pink/10 text-stage-pink',
            )}>
              {isContact ? <Mail className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-stage-dark">
                {isContact ? 'Contact Message' : 'Script Request'}
              </h1>
              <p className="text-sm text-stage-dark/50 font-sans">{formatDate(msg.createdAt)}</p>
            </div>
          </div>
          <span className={cn(
            'text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full border font-medium shrink-0',
            STATUS_BADGE[msg.status],
          )}>
            {msg.status}
          </span>
        </div>

        {/* Meta fields */}
        <dl>
          {!isContact && <MetaRow label="Play" value={msg.playTitle} />}
          <MetaRow label="From"         value={msg.name} />
          <MetaRow label="Email"        value={msg.email} />
          {isContact  && <MetaRow label="Category"     value={msg.enquiryCategory ?? undefined} />}
          {!isContact && <MetaRow label="Organisation" value={msg.organization ?? undefined} />}
          {!isContact && <MetaRow label="Role"         value={msg.role ?? undefined} />}
          {!isContact && <MetaRow label="City"         value={msg.city ?? undefined} />}
          {!isContact && <MetaRow label="Country"      value={msg.country ?? undefined} />}
          {!isContact && <MetaRow label="Intended use" value={msg.intendedUse ?? undefined} />}
          <MetaRow label="Locale"       value={msg.locale} />
        </dl>

        {/* Email link */}
        <a
          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(isContact ? 'Your enquiry' : `Script request for ${msg.playTitle ?? 'the play'}`)}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-sans text-stage-mint hover:underline"
        >
          <Mail className="w-4 h-4" />
          Reply to {msg.email}
        </a>
      </div>

      {/* Message body */}
      <div className="bg-white rounded-2xl border border-[#DCD6CC] shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-serif font-bold text-stage-dark mb-4">
          {isContact ? 'Message' : 'Additional Notes'}
        </h2>
        <p className="text-stage-dark/80 font-sans leading-relaxed whitespace-pre-wrap">{msg.message}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {msg.status !== 'new' && (
          <button
            onClick={() => changeStatus('new')}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-[#DCD6CC] text-sm font-sans text-stage-dark hover:bg-[#F7F5F0] transition-colors disabled:opacity-50"
          >
            Mark as New
          </button>
        )}
        {msg.status !== 'read' && (
          <button
            onClick={() => changeStatus('read')}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-[#DCD6CC] text-sm font-sans text-stage-dark hover:bg-[#F7F5F0] transition-colors disabled:opacity-50"
          >
            Mark as Read
          </button>
        )}
        {msg.status !== 'archived' && (
          <button
            onClick={() => changeStatus('archived')}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-[#DCD6CC] text-sm font-sans text-stage-dark hover:bg-[#F7F5F0] transition-colors disabled:opacity-50"
          >
            Archive
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={handleDelete}
          disabled={deleting}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-sans transition-colors disabled:opacity-50',
            confirmDel
              ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
              : 'border-red-200 text-red-500 hover:bg-red-50',
          )}
        >
          {deleting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <>{confirmDel ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                {confirmDel ? 'Confirm Delete' : 'Delete'}</>}
        </button>
        {confirmDel && !deleting && (
          <button
            onClick={() => setConfirmDel(false)}
            className="px-4 py-2 rounded-xl border border-[#DCD6CC] text-sm font-sans text-stage-dark hover:bg-[#F7F5F0] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
