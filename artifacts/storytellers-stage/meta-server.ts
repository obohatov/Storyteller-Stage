/**
 * meta-server.ts
 *
 * Thin Express server that wraps the Vite SPA and injects per-route SEO
 * metadata (title, description, canonical, hreflang, Open Graph, Twitter card,
 * JSON-LD, lang attribute) into the initial HTML response before serving it.
 *
 * Also serves /robots.txt and /sitemap.xml dynamically from the database.
 *
 * Dev mode  : embeds Vite dev server (middlewareMode) for HMR.
 * Prod mode : serves the built dist/public directory.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import express, { type Request, type Response, type NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import {
  db,
  fairyTalesTable,
  fairyTaleTranslationsTable,
  playsTable,
  playTranslationsTable,
  aboutTranslationsTable,
} from '@workspace/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const BASE = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const LOCALES = ['en', 'uk', 'ru', 'nl'] as const;
type Locale = (typeof LOCALES)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getSiteUrl(req: Request): string {
  const env = process.env.PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || 'localhost';
  return `${proto}://${host}`;
}

function buildUrl(siteUrl: string, locale: Locale, ...segments: string[]): string {
  const base = BASE ? `${BASE}` : '';
  const parts = [locale, ...segments.filter(Boolean)];
  return `${siteUrl}${base}/${parts.join('/')}`;
}

// ─── Localized copy ───────────────────────────────────────────────────────────

const SITE_NAME: Record<Locale, string> = {
  en: "The Storyteller's Stage",
  uk: 'Сцена Оповідача',
  ru: 'Сцена Рассказчика',
  nl: 'Het Vertellersstadium',
};

const PAGE_TITLE: Record<string, Record<Locale, string>> = {
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

const PAGE_DESC: Record<string, Record<Locale, string>> = {
  home: {
    en: 'Original plays for amateur theatre and magical fairy tales for children.',
    uk: "Оригінальні п'єси для аматорського театру та чарівні казки для дітей.",
    ru: 'Оригинальные пьесы для любительского театра и волшебные сказки для детей.',
    nl: 'Originele toneelstukken voor amateurtheater en magische sprookjes voor kinderen.',
  },
  taleList: {
    en: 'Discover a collection of original fairy tales — imaginative stories for children and those who never stopped believing.',
    uk: 'Відкрийте колекцію оригінальних казок — уявні історії для дітей і тих, хто не перестав вірити.',
    ru: 'Откройте коллекцию оригинальных сказок — воображаемые истории для детей.',
    nl: 'Ontdek een collectie originele sprookjes — verbeeldingsrijke verhalen voor kinderen.',
  },
  playList: {
    en: 'Scripts and synopses for original theatrical plays, designed for amateur theatre groups and community stages.',
    uk: "Сценарії та синопсиси оригінальних театральних п'єс для аматорських труп.",
    ru: 'Сценарии и синопсисы оригинальных театральных пьес для любительских трупп.',
    nl: 'Scripts en synopses van originele toneelstukken, ontworpen voor amateurtoneelgroepen.',
  },
  about: {
    en: "Learn about the author behind The Storyteller's Stage — playwright and storyteller.",
    uk: 'Дізнайтеся більше про автора Сцени Оповідача — драматурга та казкаря.',
    ru: 'Узнайте об авторе Сцены Рассказчика — драматурге и сказочнике.',
    nl: 'Leer meer over de auteur achter Het Vertellersstadium — toneelschrijver en verhalenverteller.',
  },
};

const BREADCRUMB_LABEL: Record<string, Record<Locale, string>> = {
  taleList: { en: 'Fairy Tales', uk: 'Казки', ru: 'Сказки', nl: 'Sprookjes' },
  playList: { en: 'Plays', uk: "П'єси", ru: 'Пьесы', nl: 'Toneelstukken' },
};

const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  uk: 'uk_UA',
  ru: 'ru_RU',
  nl: 'nl_NL',
};

// ─── Route parser ─────────────────────────────────────────────────────────────

type ParsedRoute =
  | { type: 'home'; locale: Locale }
  | { type: 'taleList'; locale: Locale }
  | { type: 'taleDetail'; locale: Locale; slug: string }
  | { type: 'playList'; locale: Locale }
  | { type: 'playDetail'; locale: Locale; slug: string }
  | { type: 'about'; locale: Locale }
  | { type: 'admin' }
  | { type: 'other' };

function parseRoute(pathname: string): ParsedRoute {
  // Strip base path prefix when present
  let p = BASE ? pathname.replace(new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), '') || '/' : pathname;
  // Strip query
  p = p.split('?')[0];

  const LC = '(en|uk|ru|nl)';
  const re = (pattern: string) => new RegExp(`^${pattern}$`);

  if (re(`/${LC}/fairy-tales/([^/]+)`).test(p)) {
    const [, locale, slug] = p.match(re(`/${LC}/fairy-tales/([^/]+)`))!;
    return { type: 'taleDetail', locale: locale as Locale, slug };
  }
  if (re(`/${LC}/fairy-tales`).test(p)) {
    const [, locale] = p.match(re(`/${LC}/fairy-tales`))!;
    return { type: 'taleList', locale: locale as Locale };
  }
  if (re(`/${LC}/plays/([^/]+)`).test(p)) {
    const [, locale, slug] = p.match(re(`/${LC}/plays/([^/]+)`))!;
    return { type: 'playDetail', locale: locale as Locale, slug };
  }
  if (re(`/${LC}/plays`).test(p)) {
    const [, locale] = p.match(re(`/${LC}/plays`))!;
    return { type: 'playList', locale: locale as Locale };
  }
  if (re(`/${LC}/about`).test(p)) {
    const [, locale] = p.match(re(`/${LC}/about`))!;
    return { type: 'about', locale: locale as Locale };
  }
  if (re(`/${LC}`).test(p) || re(`/${LC}/`).test(p)) {
    const [, locale] = p.match(re(`/${LC}/?`))!;
    return { type: 'home', locale: locale as Locale };
  }
  if (p === '/' || p === '') return { type: 'other' }; // root → client redirect
  if (p.startsWith('/admin')) return { type: 'admin' };
  return { type: 'other' };
}

// ─── SEO payload type ─────────────────────────────────────────────────────────

interface SeoMeta {
  lang: string;
  title: string;
  description: string;
  robots: string;
  canonical: string;
  hreflang: { lang: string; href: string }[];
  xDefault?: string;
  og: {
    title: string;
    description: string;
    url: string;
    type: string;
    locale: string;
    siteName: string;
    image?: string;
    imageAlt?: string;
  };
  twitter: { title: string; description: string; image?: string; imageAlt?: string };
  jsonLd: object[];
}

// ─── Meta builders ────────────────────────────────────────────────────────────

function makeSeo(siteUrl: string, locale: Locale, partial: Omit<SeoMeta, 'og' | 'twitter' | 'lang'> & {
  image?: string; imageAlt?: string; jsonLd: object[];
}): SeoMeta {
  return {
    lang: locale,
    title: partial.title,
    description: partial.description,
    robots: partial.robots,
    canonical: partial.canonical,
    hreflang: partial.hreflang,
    xDefault: partial.xDefault,
    og: {
      title: partial.title,
      description: partial.description,
      url: partial.canonical,
      type: 'website',
      locale: OG_LOCALE[locale],
      siteName: SITE_NAME[locale],
      image: partial.image,
      imageAlt: partial.imageAlt,
    },
    twitter: {
      title: partial.title,
      description: partial.description,
      image: partial.image,
      imageAlt: partial.imageAlt,
    },
    jsonLd: partial.jsonLd,
  };
}

function listingHreflang(siteUrl: string, locale: Locale, path: string) {
  return LOCALES.map(l => ({
    lang: l,
    href: buildUrl(siteUrl, l, path),
  }));
}

async function buildHomeMeta(siteUrl: string, locale: Locale): Promise<SeoMeta> {
  return makeSeo(siteUrl, locale, {
    title: PAGE_TITLE.home[locale],
    description: PAGE_DESC.home[locale],
    robots: 'index, follow',
    canonical: buildUrl(siteUrl, locale),
    hreflang: listingHreflang(siteUrl, locale, ''),
    xDefault: `${siteUrl}${BASE}/`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME[locale],
        url: `${siteUrl}${BASE}/`,
      },
    ],
  });
}

async function buildTaleListMeta(siteUrl: string, locale: Locale): Promise<SeoMeta> {
  return makeSeo(siteUrl, locale, {
    title: PAGE_TITLE.taleList[locale],
    description: PAGE_DESC.taleList[locale],
    robots: 'index, follow',
    canonical: buildUrl(siteUrl, locale, 'fairy-tales'),
    hreflang: listingHreflang(siteUrl, locale, 'fairy-tales'),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME[locale], item: buildUrl(siteUrl, locale) },
          { '@type': 'ListItem', position: 2, name: BREADCRUMB_LABEL.taleList[locale], item: buildUrl(siteUrl, locale, 'fairy-tales') },
        ],
      },
    ],
  });
}

async function buildPlayListMeta(siteUrl: string, locale: Locale): Promise<SeoMeta> {
  return makeSeo(siteUrl, locale, {
    title: PAGE_TITLE.playList[locale],
    description: PAGE_DESC.playList[locale],
    robots: 'index, follow',
    canonical: buildUrl(siteUrl, locale, 'plays'),
    hreflang: listingHreflang(siteUrl, locale, 'plays'),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME[locale], item: buildUrl(siteUrl, locale) },
          { '@type': 'ListItem', position: 2, name: BREADCRUMB_LABEL.playList[locale], item: buildUrl(siteUrl, locale, 'plays') },
        ],
      },
    ],
  });
}

async function buildAboutMeta(siteUrl: string, locale: Locale): Promise<SeoMeta> {
  return makeSeo(siteUrl, locale, {
    title: PAGE_TITLE.about[locale],
    description: PAGE_DESC.about[locale],
    robots: 'index, follow',
    canonical: buildUrl(siteUrl, locale, 'about'),
    hreflang: listingHreflang(siteUrl, locale, 'about'),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME[locale], item: buildUrl(siteUrl, locale) },
          { '@type': 'ListItem', position: 2, name: PAGE_TITLE.about[locale], item: buildUrl(siteUrl, locale, 'about') },
        ],
      },
    ],
  });
}

async function buildTaleDetailMeta(
  siteUrl: string,
  locale: Locale,
  slug: string,
): Promise<{ meta: SeoMeta; httpStatus: number } | null> {
  const [tale] = await db.select().from(fairyTalesTable).where(eq(fairyTalesTable.slug, slug));
  if (!tale) return null;

  const [translation] = await db
    .select()
    .from(fairyTaleTranslationsTable)
    .where(and(eq(fairyTaleTranslationsTable.fairyTaleId, tale.id), eq(fairyTaleTranslationsTable.locale, locale), eq(fairyTaleTranslationsTable.status, 'published')));
  if (!translation) return null;

  const publishedTranslations = await db
    .select({ locale: fairyTaleTranslationsTable.locale })
    .from(fairyTaleTranslationsTable)
    .where(and(eq(fairyTaleTranslationsTable.fairyTaleId, tale.id), eq(fairyTaleTranslationsTable.status, 'published')));

  const availableLocales = publishedTranslations.map(r => r.locale as Locale);
  const title = translation.seoTitle || `${translation.title} — ${SITE_NAME[locale]}`;
  const description = translation.seoDescription || translation.blurb || '';
  const imageUrl = tale.coverImagePath ? `${siteUrl}/api/storage/public-objects/${tale.coverImagePath}` : undefined;

  const meta = makeSeo(siteUrl, locale, {
    title,
    description,
    robots: 'index, follow',
    canonical: buildUrl(siteUrl, locale, 'fairy-tales', slug),
    hreflang: availableLocales.map(l => ({ lang: l, href: buildUrl(siteUrl, l, 'fairy-tales', slug) })),
    image: imageUrl,
    imageAlt: translation.coverImageAlt || translation.title,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: translation.title,
        description: translation.blurb || undefined,
        url: buildUrl(siteUrl, locale, 'fairy-tales', slug),
        inLanguage: locale,
        genre: 'fairy tale',
        ...(tale.coverImagePath ? { image: imageUrl } : {}),
        ...(translation.publishedAt ? { datePublished: translation.publishedAt.toISOString().split('T')[0] } : {}),
        ...(translation.updatedAt ? { dateModified: translation.updatedAt.toISOString().split('T')[0] } : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME[locale], item: buildUrl(siteUrl, locale) },
          { '@type': 'ListItem', position: 2, name: BREADCRUMB_LABEL.taleList[locale], item: buildUrl(siteUrl, locale, 'fairy-tales') },
          { '@type': 'ListItem', position: 3, name: translation.title, item: buildUrl(siteUrl, locale, 'fairy-tales', slug) },
        ],
      },
    ],
  });
  meta.og.type = 'article';
  return { meta, httpStatus: 200 };
}

async function buildPlayDetailMeta(
  siteUrl: string,
  locale: Locale,
  slug: string,
): Promise<{ meta: SeoMeta; httpStatus: number } | null> {
  const [play] = await db.select().from(playsTable).where(eq(playsTable.slug, slug));
  if (!play) return null;

  const [translation] = await db
    .select()
    .from(playTranslationsTable)
    .where(and(eq(playTranslationsTable.playId, play.id), eq(playTranslationsTable.locale, locale), eq(playTranslationsTable.status, 'published')));
  if (!translation) return null;

  const publishedTranslations = await db
    .select({ locale: playTranslationsTable.locale })
    .from(playTranslationsTable)
    .where(and(eq(playTranslationsTable.playId, play.id), eq(playTranslationsTable.status, 'published')));

  const availableLocales = publishedTranslations.map(r => r.locale as Locale);
  const title = translation.seoTitle || `${translation.title} — ${SITE_NAME[locale]}`;
  const description = translation.seoDescription || translation.logline || '';
  const imageUrl = play.coverImagePath ? `${siteUrl}/api/storage/public-objects/${play.coverImagePath}` : undefined;

  const meta = makeSeo(siteUrl, locale, {
    title,
    description,
    robots: 'index, follow',
    canonical: buildUrl(siteUrl, locale, 'plays', slug),
    hreflang: availableLocales.map(l => ({ lang: l, href: buildUrl(siteUrl, l, 'plays', slug) })),
    image: imageUrl,
    imageAlt: translation.coverImageAlt || translation.title,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Play',
        name: translation.title,
        description: translation.logline || undefined,
        url: buildUrl(siteUrl, locale, 'plays', slug),
        inLanguage: locale,
        ...(play.genre ? { genre: play.genre } : {}),
        ...(play.coverImagePath ? { image: imageUrl } : {}),
        ...(translation.publishedAt ? { datePublished: translation.publishedAt.toISOString().split('T')[0] } : {}),
        ...(translation.updatedAt ? { dateModified: translation.updatedAt.toISOString().split('T')[0] } : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME[locale], item: buildUrl(siteUrl, locale) },
          { '@type': 'ListItem', position: 2, name: BREADCRUMB_LABEL.playList[locale], item: buildUrl(siteUrl, locale, 'plays') },
          { '@type': 'ListItem', position: 3, name: translation.title, item: buildUrl(siteUrl, locale, 'plays', slug) },
        ],
      },
    ],
  });
  meta.og.type = 'article';
  return { meta, httpStatus: 200 };
}

// ─── HTML injection ───────────────────────────────────────────────────────────

function buildSeoBlock(seo: SeoMeta): string {
  const lines: string[] = [];

  lines.push(`<meta name="description" content="${esc(seo.description)}" />`);
  lines.push(`<meta name="robots" content="${esc(seo.robots)}" />`);
  lines.push(`<link rel="canonical" href="${esc(seo.canonical)}" />`);

  for (const { lang, href } of seo.hreflang) {
    lines.push(`<link rel="alternate" hreflang="${esc(lang)}" href="${esc(href)}" />`);
  }
  if (seo.xDefault) {
    lines.push(`<link rel="alternate" hreflang="x-default" href="${esc(seo.xDefault)}" />`);
  }

  lines.push(`<meta property="og:title" content="${esc(seo.og.title)}" />`);
  lines.push(`<meta property="og:description" content="${esc(seo.og.description)}" />`);
  lines.push(`<meta property="og:url" content="${esc(seo.og.url)}" />`);
  lines.push(`<meta property="og:type" content="${esc(seo.og.type)}" />`);
  lines.push(`<meta property="og:locale" content="${esc(seo.og.locale)}" />`);
  lines.push(`<meta property="og:site_name" content="${esc(seo.og.siteName)}" />`);
  if (seo.og.image) {
    lines.push(`<meta property="og:image" content="${esc(seo.og.image)}" />`);
    lines.push(`<meta property="og:image:width" content="1200" />`);
    lines.push(`<meta property="og:image:height" content="630" />`);
    if (seo.og.imageAlt) lines.push(`<meta property="og:image:alt" content="${esc(seo.og.imageAlt)}" />`);
  }

  lines.push(`<meta name="twitter:card" content="${seo.twitter.image ? 'summary_large_image' : 'summary'}" />`);
  lines.push(`<meta name="twitter:title" content="${esc(seo.twitter.title)}" />`);
  lines.push(`<meta name="twitter:description" content="${esc(seo.twitter.description)}" />`);
  if (seo.twitter.image) {
    lines.push(`<meta name="twitter:image" content="${esc(seo.twitter.image)}" />`);
    if (seo.twitter.imageAlt) lines.push(`<meta name="twitter:image:alt" content="${esc(seo.twitter.imageAlt)}" />`);
  }

  for (const schema of seo.jsonLd) {
    lines.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }

  return lines.map(l => `    ${l}`).join('\n');
}

function injectSeoIntoHtml(html: string, seo: SeoMeta): string {
  // 1. Set correct lang attribute
  let result = html.replace(/<html([^>]*)\slang="[^"]*"/, `<html$1 lang="${seo.lang}"`);

  // 2. Replace title
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`);

  // 3. Replace the SEO inject block
  result = result.replace(
    /<!-- SEO_INJECT_START -->[\s\S]*?<!-- SEO_INJECT_END -->/,
    `<!-- SEO_INJECT_START -->\n${buildSeoBlock(seo)}\n    <!-- SEO_INJECT_END -->`,
  );

  return result;
}

function noindexHtml(html: string, lang = 'en'): string {
  let result = html.replace(/<html([^>]*)\slang="[^"]*"/, `<html$1 lang="${lang}"`);
  result = result.replace(
    /<!-- SEO_INJECT_START -->[\s\S]*?<!-- SEO_INJECT_END -->/,
    `<!-- SEO_INJECT_START -->\n    <meta name="robots" content="noindex, nofollow" />\n    <!-- SEO_INJECT_END -->`,
  );
  return result;
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────

async function buildSitemap(siteUrl: string): Promise<string> {
  const urls: { loc: string; lastmod?: string; changefreq: string }[] = [];

  // Locale home pages + listing pages
  for (const locale of LOCALES) {
    urls.push({ loc: buildUrl(siteUrl, locale), changefreq: 'weekly' });
    urls.push({ loc: buildUrl(siteUrl, locale, 'fairy-tales'), changefreq: 'weekly' });
    urls.push({ loc: buildUrl(siteUrl, locale, 'plays'), changefreq: 'weekly' });
    urls.push({ loc: buildUrl(siteUrl, locale, 'about'), changefreq: 'monthly' });
  }

  // Published fairy tale translations
  const tales = await db
    .select({
      slug: fairyTalesTable.slug,
      locale: fairyTaleTranslationsTable.locale,
      publishedAt: fairyTaleTranslationsTable.publishedAt,
      updatedAt: fairyTaleTranslationsTable.updatedAt,
    })
    .from(fairyTaleTranslationsTable)
    .innerJoin(fairyTalesTable, eq(fairyTaleTranslationsTable.fairyTaleId, fairyTalesTable.id))
    .where(eq(fairyTaleTranslationsTable.status, 'published'));

  for (const row of tales) {
    urls.push({
      loc: buildUrl(siteUrl, row.locale as Locale, 'fairy-tales', row.slug),
      lastmod: (row.publishedAt ?? row.updatedAt).toISOString().split('T')[0],
      changefreq: 'monthly',
    });
  }

  // Published play translations
  const plays = await db
    .select({
      slug: playsTable.slug,
      locale: playTranslationsTable.locale,
      publishedAt: playTranslationsTable.publishedAt,
      updatedAt: playTranslationsTable.updatedAt,
    })
    .from(playTranslationsTable)
    .innerJoin(playsTable, eq(playTranslationsTable.playId, playsTable.id))
    .where(eq(playTranslationsTable.status, 'published'));

  for (const row of plays) {
    urls.push({
      loc: buildUrl(siteUrl, row.locale as Locale, 'plays', row.slug),
      lastmod: (row.publishedAt ?? row.updatedAt).toISOString().split('T')[0],
      changefreq: 'monthly',
    });
  }

  const entries = urls
    .map(u =>
      [
        '  <url>',
        `    <loc>${esc(u.loc)}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
        `    <changefreq>${u.changefreq}</changefreq>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

// ─── Server setup ─────────────────────────────────────────────────────────────

const app = express();
const httpServer = http.createServer(app);

// robots.txt — must be before Vite middleware
app.get(`${BASE}/robots.txt`, (req: Request, res: Response) => {
  const siteUrl = getSiteUrl(req);
  res.set('Content-Type', 'text/plain').send(
    `User-agent: *\nAllow: /\nDisallow: ${BASE}/admin\nDisallow: ${BASE}/admin/\nDisallow: /api/\n\nSitemap: ${siteUrl}${BASE}/sitemap.xml`,
  );
});

// Also serve at /robots.txt if base is not root
if (BASE && BASE !== '/') {
  app.get('/robots.txt', (req: Request, res: Response) => {
    const siteUrl = getSiteUrl(req);
    res.set('Content-Type', 'text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${siteUrl}${BASE}/sitemap.xml`,
    );
  });
}

// sitemap.xml
app.get(`${BASE}/sitemap.xml`, async (req: Request, res: Response) => {
  try {
    const siteUrl = getSiteUrl(req);
    const xml = await buildSitemap(siteUrl);
    res.set('Content-Type', 'application/xml').send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Sitemap generation failed');
  }
});
if (BASE && BASE !== '/') {
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    try {
      const siteUrl = getSiteUrl(req);
      const xml = await buildSitemap(siteUrl);
      res.set('Content-Type', 'application/xml').send(xml);
    } catch (err) {
      res.status(500).send('Sitemap generation failed');
    }
  });
}

// ─── HTML serving (dev vs prod) ───────────────────────────────────────────────

async function resolveAndServeHtml(req: Request, res: Response, template: string, viteTransform?: (url: string, html: string) => Promise<string>) {
  try {
    const siteUrl = getSiteUrl(req);
    const route = parseRoute(req.path);

    let html = template;
    if (viteTransform) {
      html = await viteTransform(req.originalUrl, template);
    }

    if (route.type === 'admin') {
      res.status(200).set('Content-Type', 'text/html').send(noindexHtml(html));
      return;
    }

    if (route.type === 'other') {
      res.status(200).set('Content-Type', 'text/html').send(noindexHtml(html));
      return;
    }

    let seo: SeoMeta;
    let httpStatus = 200;

    if (route.type === 'home') {
      seo = await buildHomeMeta(siteUrl, route.locale);
    } else if (route.type === 'taleList') {
      seo = await buildTaleListMeta(siteUrl, route.locale);
    } else if (route.type === 'playList') {
      seo = await buildPlayListMeta(siteUrl, route.locale);
    } else if (route.type === 'about') {
      seo = await buildAboutMeta(siteUrl, route.locale);
    } else if (route.type === 'taleDetail') {
      const result = await buildTaleDetailMeta(siteUrl, route.locale, route.slug);
      if (!result) {
        httpStatus = 404;
        seo = await buildTaleListMeta(siteUrl, route.locale);
        seo.robots = 'noindex, nofollow';
      } else {
        seo = result.meta;
      }
    } else if (route.type === 'playDetail') {
      const result = await buildPlayDetailMeta(siteUrl, route.locale, route.slug);
      if (!result) {
        httpStatus = 404;
        seo = await buildPlayListMeta(siteUrl, route.locale);
        seo.robots = 'noindex, nofollow';
      } else {
        seo = result.meta;
      }
    } else {
      seo = await buildHomeMeta(siteUrl, 'en');
    }

    const injected = injectSeoIntoHtml(html, seo);
    res.status(httpStatus).set('Content-Type', 'text/html').send(injected);
  } catch (err) {
    console.error('SEO injection error:', err);
    // Fail open — serve plain HTML rather than crashing
    res.status(200).set('Content-Type', 'text/html').send(template);
  }
}

if (!isProd) {
  // ── Development ─────────────────────────────────────────────────────────────
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    server: { middlewareMode: true, hmr: { server: httpServer } },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.use(async (req: Request, res: Response) => {
    const rawTemplate = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
    await resolveAndServeHtml(req, res, rawTemplate, (url, html) =>
      vite.transformIndexHtml(url, html),
    );
  });
} else {
  // ── Production ──────────────────────────────────────────────────────────────
  const distDir = path.resolve(__dirname, 'dist/public');
  app.use(BASE || '/', express.static(distDir, { index: false }));
  const template = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf-8');

  app.use(async (req: Request, res: Response) => {
    await resolveAndServeHtml(req, res, template);
  });
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[meta-server] listening on port ${PORT} (${isProd ? 'production' : 'development'})`);
});
