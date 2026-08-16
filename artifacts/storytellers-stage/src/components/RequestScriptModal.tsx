import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Translation } from '@/translations';

const INTENDED_USE_VALUES = [
  'reading', 'production', 'festival', 'publishing', 'translation', 'education', 'other',
] as const;
type IntendedUse = typeof INTENDED_USE_VALUES[number];

function makeSchema(v: Translation['scriptRequest']['validation']) {
  return z.object({
    name:         z.string().min(1, 'Required').max(200),
    email:        z.string().email('Invalid email').max(300),
    organization: z.string().min(1, v.organizationRequired).max(200),
    role:         z.string().max(200).optional(),
    city:         z.string().max(100).optional(),
    country:      z.string().min(1, v.countryRequired).max(100),
    intendedUse:  z.enum(INTENDED_USE_VALUES, { message: v.intendedUseRequired }),
    message:      z.string().min(10, v.messageRequired).max(5000),
    website:      z.string().max(0).optional(),
  });
}

type FormValues = {
  name: string;
  email: string;
  organization: string;
  role?: string;
  city?: string;
  country: string;
  intendedUse: IntendedUse;
  message: string;
  website?: string;
};

function getApiBase() {
  return (import.meta.env.BASE_URL as string).replace(/\/+$/, '');
}

interface RequestScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  playTitle: string;
  playSlug: string;
}

export function RequestScriptModal({
  isOpen,
  onClose,
  playTitle,
  playSlug,
}: RequestScriptModalProps) {
  const { locale, t } = useLocale();
  const sr = t.scriptRequest;
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const schema = makeSchema(sr.validation);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', email: '', organization: '', role: '', city: '', country: '',
      intendedUse: undefined, message: '', website: '',
    },
  });

  const isLoading = submitState === 'loading';

  const handleClose = () => {
    if (isLoading) return;
    // Reset to idle on close so the form is fresh next time
    if (submitState === 'success') {
      form.reset();
      setSubmitState('idle');
    }
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitState('loading');
    setServerError('');
    try {
      const res = await fetch(`${getApiBase()}/api/script-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, playSlug, ...data }),
      });
      if (!res.ok) {
        setServerError(sr.error);
        setSubmitState('error');
        return;
      }
      setSubmitState('success');
    } catch {
      setServerError(sr.error);
      setSubmitState('error');
    }
  };

  const inputCls = "bg-stage-cream/50 border-stage-dark/10 focus-visible:ring-stage-pink";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto bg-white p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold text-stage-dark">
            {sr.modalTitle}
          </DialogTitle>
        </DialogHeader>

        {submitState === 'success' ? (
          <div className="flex flex-col items-center text-center py-10 gap-4">
            <CheckCircle2 className="w-14 h-14 text-stage-mint" />
            <h3 className="text-2xl font-serif font-bold text-stage-dark">{sr.successTitle}</h3>
            <p className="text-stage-dark/70 font-sans">{sr.success}</p>
            <p className="text-stage-dark/50 text-sm font-sans">{sr.successDetail}</p>
            <Button
              onClick={handleClose}
              className="mt-4 bg-stage-pink hover:bg-stage-pink/90 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              {sr.cancel}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ display: 'none' }}
                {...form.register('website')}
              />

              {/* Play title indicator */}
              <div className="bg-stage-pink/8 rounded-xl p-4 border border-stage-pink/20">
                <p className="text-xs font-mono uppercase tracking-widest text-stage-pink/70 mb-1">
                  {sr.requestingPlay}
                </p>
                <p className="font-serif text-lg font-bold text-stage-dark">{playTitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sr.name}</FormLabel>
                      <FormControl><Input placeholder="…" {...field} className={inputCls} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sr.email}</FormLabel>
                      <FormControl><Input type="email" placeholder="you@theatre.org" {...field} className={inputCls} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{sr.organization}</FormLabel>
                    <FormControl><Input placeholder={sr.organizationPlaceholder} {...field} className={inputCls} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sr.role} <span className="text-stage-dark/40 font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl><Input placeholder={sr.rolePlaceholder} {...field} className={inputCls} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sr.country}</FormLabel>
                      <FormControl><Input placeholder={sr.countryPlaceholder} {...field} className={inputCls} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sr.city} <span className="text-stage-dark/40 font-normal text-xs">(optional)</span></FormLabel>
                      <FormControl><Input placeholder={sr.cityPlaceholder} {...field} className={inputCls} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intendedUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sr.intendedUse}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputCls}>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.entries(sr.intendedUseOptions) as [IntendedUse, string][]).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{sr.message}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={sr.messagePlaceholder}
                        {...field}
                        rows={4}
                        className={`${inputCls} resize-none`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitState === 'error' && serverError && (
                <p className="text-sm text-red-600 font-sans">{serverError}</p>
              )}

              <p className="text-xs text-stage-dark/40 font-sans leading-relaxed">{sr.privacyNote}</p>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {sr.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-stage-pink hover:bg-stage-pink/90 text-white"
                >
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{sr.sending}</>
                    : sr.send}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
