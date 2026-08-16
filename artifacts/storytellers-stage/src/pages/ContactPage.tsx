import { useState } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
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

const CATEGORY_VALUES = ['general', 'publishing', 'translation', 'festival', 'collaboration', 'reader', 'other'] as const;
type ContactCategory = typeof CATEGORY_VALUES[number];

function makeSchema(v: Translation['contact']['validation']) {
  return z.object({
    name:             z.string().min(1, v.nameRequired).max(200),
    email:            z.string().email(v.emailInvalid).max(300),
    message:          z.string().min(10, v.messageMin).max(5000),
    enquiryCategory:  z.enum(CATEGORY_VALUES, { message: v.categoryRequired }),
    // honeypot – must stay empty
    website:          z.string().max(0).optional(),
  });
}

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
  enquiryCategory: ContactCategory;
  website?: string;
};

function getApiBase() {
  return (import.meta.env.BASE_URL as string).replace(/\/+$/, '');
}

export function ContactPage() {
  const { locale, t } = useLocale();
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const schema = makeSchema(t.contact.validation);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '', enquiryCategory: undefined, website: '' },
  });

  const isLoading = submitState === 'loading';

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitState('loading');
    setServerError('');
    try {
      const res = await fetch(`${getApiBase()}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, ...data }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as Record<string, unknown>;
        setServerError(typeof json.error === 'string' ? t.contact.error : t.contact.error);
        setSubmitState('error');
        return;
      }
      setSubmitState('success');
    } catch {
      setServerError(t.contact.error);
      setSubmitState('error');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-stage-cream flex flex-col">
      <SiteHeader showBack backHref={`/${locale}`} />

      <main className="flex-1 container mx-auto px-6 pt-32 pb-24 max-w-2xl flex flex-col justify-center">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-stage-dark mb-6">
            {t.contact.title}
          </h1>
          <p className="text-lg text-stage-dark/70 font-sans max-w-xl mx-auto leading-relaxed">
            {t.contact.description}
          </p>
        </header>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl shadow-stage-dark/5 border border-stage-dark/5">
          {submitState === 'success' ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <CheckCircle2 className="w-14 h-14 text-stage-mint" />
              <p className="text-2xl font-serif font-bold text-stage-dark">
                {t.contact.success}
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Honeypot – hidden from real users */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ display: 'none' }}
                  {...form.register('website')}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stage-dark font-sans font-medium">
                        {t.contact.name}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sofia Bohatova"
                          {...field}
                          className="bg-stage-cream/50 border-stage-dark/10 focus-visible:ring-stage-mint"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stage-dark font-sans font-medium">
                        {t.contact.email}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          {...field}
                          className="bg-stage-cream/50 border-stage-dark/10 focus-visible:ring-stage-mint"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enquiryCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stage-dark font-sans font-medium">
                        {t.contact.category}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-stage-cream/50 border-stage-dark/10 focus:ring-stage-mint">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.entries(t.contact.categories) as [ContactCategory, string][]).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stage-dark font-sans font-medium">
                        {t.contact.message}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="…"
                          {...field}
                          rows={5}
                          className="bg-stage-cream/50 border-stage-dark/10 focus-visible:ring-stage-mint resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitState === 'error' && serverError && (
                  <p className="text-sm text-red-600 font-sans">{serverError}</p>
                )}

                <p className="text-xs text-stage-dark/40 font-sans leading-relaxed">
                  {t.contact.privacyNote}
                </p>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-stage-mint hover:bg-stage-mint/90 text-white font-sans text-lg h-12"
                  data-testid="btn-submit-contact"
                >
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t.contact.sending}</>
                    : t.contact.send}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </main>
    </div>
  );
}
