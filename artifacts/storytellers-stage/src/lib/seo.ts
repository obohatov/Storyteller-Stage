/**
 * Client-side SEO helpers.
 * The server (meta-server.ts) handles the initial HTML injection.
 * These utilities keep titles, canonicals and hreflang correct during SPA
 * navigation after React has hydrated.
 */

export type SeoLocale = 'en' | 'uk' | 'ru' | 'nl';

export const ALL_LOCALES: SeoLocale[] = ['en', 'uk', 'ru', 'nl'];

export const SITE_NAME: Record<SeoLocale, string> = {
  en: "The Storyteller's Stage",
  uk: 'Сцена Оповідача',
  ru: 'Сцена Рассказчика',
  nl: 'Het Vertellersstадium',
};

const PAGE_TITLE: Record<string, Record<SeoLocale, string>> = {
  home: {
    en: "The Storyteller's Stage — Plays & Fairy Tales",
    uk: "Сцена Оповідача — П'єси та Казки",
    ru: 'Сцена Рассказчика — Пьесы и Сказки',
    nl: 'Het Vertellersstadium — Toneelstukken & Sprookjes',
  },
  taleList: {
    en: "Fairy Tales — The Storyteller's Stage",
    uk: 'Казки — Сцена Оповідача',
    ru: 'Сказки — Сцена Рассказчика',
    nl: 'Sprookjes — Het Vertellersstadium',
  },
  playList: {
    en: "Plays — The Storyteller's Stage",
    uk: "П'єси — Сцена Оповідача",
    ru: 'Пьесы — Сцена Рассказчика',
    nl: 'Toneelstukken — Het Vertellersstadium',
  },
  about: {
    en: "About — The Storyteller's Stage",
    uk: 'Про Автора — Сцена Оповідача',
    ru: 'Об Авторе — Сцена Рассказчика',
    nl: 'Over de Auteur — Het Vertellersstadium',
  },
};

const PAGE_DESC: Record<string, Record<SeoLocale, string>> = {
  home: {
    en: 'Original plays for amateur theatre and magical fairy tales for children.',
    uk: "Оригінальні п'єси для аматорського театру та чарівні казки для дітей.",
    ru: 'Оригинальные пьесы для любительского театра и волшебные сказки для детей.',
    nl: 'Originele toneelstukken voor amateurtheater en magische sprookjes voor kinderen.',
  },
  taleList: {
    en: 'Discover a collection of original fairy tales — imaginative stories for children.',
    uk: 'Відкрийте колекцію оригінальних казок для дітей.',
    ru: 'Откройте коллекцию оригинальных сказок для детей.',
    nl: 'Ontdek een collectie originele sprookjes voor kinderen.',
  },
  playList: {
    en: 'Scripts and synopses for original theatrical plays for amateur theatre groups.',
    uk: "Сценарії та синопсиси оригінальних п'єс для аматорського театру.",
    ru: 'Сценарии и синопсисы оригинальных пьес для любительского театра.',
    nl: 'Scripts en synopses van originele toneelstukken voor amateurtoneelgroepen.',
  },
  about: {
    en: "Learn about the author behind The Storyteller's Stage — playwright and storyteller.",
    uk: 'Дізнайтеся більше про автора Сцени Оповідача — драматурга та казкаря.',
    ru: 'Узнайте об авторе Сцены Рассказчика — драматурге и сказочнике.',
    nl: 'Leer meer over de auteur achter Het Vertellersstadium — toneelschrijver en verhalenverteller.',
  },
};

function getBase(): string {
  return (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
}

/** Build an absolute URL for a locale-prefixed page. */
export function buildPageUrl(locale: SeoLocale, ...segments: string[]): string {
  const base = getBase();
  const rest = segments.length ? `/${segments.join('/')}` : '';
  return `${window.location.origin}${base}/${locale}${rest}`;
}

/** Build hreflang alternate links for a page. */
export function buildHreflang(
  pathFn: (l: SeoLocale) => string,
  availableLocales?: string[],
): { lang: string; href: string }[] {
  const locales = availableLocales
    ? ALL_LOCALES.filter(l => availableLocales.includes(l))
    : ALL_LOCALES;
  return locales.map(l => ({ lang: l, href: pathFn(l) }));
}

/** Static page title for home/list/about pages. */
export function staticTitle(key: keyof typeof PAGE_TITLE, locale: SeoLocale): string {
  return PAGE_TITLE[key]?.[locale] ?? PAGE_TITLE[key]?.en ?? '';
}

/** Static page description for home/list/about pages. */
export function staticDesc(key: keyof typeof PAGE_DESC, locale: SeoLocale): string {
  return PAGE_DESC[key]?.[locale] ?? PAGE_DESC[key]?.en ?? '';
}

/** Build the display title for a work detail page. */
export function workTitle(title: string, locale: SeoLocale): string {
  return `${title} — ${SITE_NAME[locale]}`;
}
