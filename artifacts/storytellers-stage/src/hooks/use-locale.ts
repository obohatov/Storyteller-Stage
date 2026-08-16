import { useLocation, useParams } from 'wouter';
import { translations, DEFAULT_LANGUAGE, type Language, LANGUAGES } from '../translations';
import { useCallback } from 'react';

export function useLocale() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  
  // Extract locale from params or path if possible
  const pathLocale = params.locale as Language;
  
  // Validate it's a known locale
  const isValidLocale = LANGUAGES.some(lang => lang.code === pathLocale);
  const locale = isValidLocale ? pathLocale : DEFAULT_LANGUAGE;
  
  const t = translations[locale];
  
  const navigateLocale = useCallback((newLocale: Language) => {
    // If we're on a locale-prefixed route, replace the prefix
    if (isValidLocale) {
      const rest = location.slice(locale.length + 1);
      setLocation(`/${newLocale}${rest}`);
    } else {
      // If we aren't (e.g. root), just go to the new locale root
      setLocation(`/${newLocale}`);
    }
  }, [isValidLocale, locale, location, setLocation]);

  return { locale, t, navigateLocale };
}
