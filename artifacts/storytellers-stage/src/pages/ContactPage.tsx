import { useLocale } from '@/hooks/use-locale';
import { SiteHeader } from '@/components/SiteHeader';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactPage() {
  const { locale, t } = useLocale();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    console.log('Form submitted:', data);
    alert('This is a placeholder contact form. Backend integration coming soon.');
    form.reset();
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        placeholder="John Doe" 
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
                        placeholder="john@example.com" 
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
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stage-dark font-sans font-medium">
                      {t.contact.message}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Hello..." 
                        {...field} 
                        rows={5}
                        className="bg-stage-cream/50 border-stage-dark/10 focus-visible:ring-stage-mint resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-stage-mint hover:bg-stage-mint/90 text-white font-sans text-lg h-12"
                data-testid="btn-submit-contact"
              >
                {t.contact.send}
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
