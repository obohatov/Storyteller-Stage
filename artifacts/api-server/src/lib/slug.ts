/**
 * Convert a title to a URL-friendly slug.
 * Uses only ASCII-safe characters – good enough for CMS slugs.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^\w\s-]/g, "") // keep word chars, spaces, hyphens
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .substring(0, 100);
}
