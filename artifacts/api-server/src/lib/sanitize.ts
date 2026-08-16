import sanitizeHtml from "sanitize-html";

/**
 * Sanitize Tiptap-generated HTML before storage.
 *
 * Allow only the tags the editor supports:
 *   paragraphs, headings, bold, italic, lists, links, blockquotes, horizontal rules.
 * Strip all other tags, attributes, and unsafe URL schemes.
 */
export function sanitizeRichText(html: string | null | undefined): string | null {
  if (!html) return null;
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "em", "b", "i", "s",
      "ul", "ol", "li",
      "a",
      "blockquote",
      "pre", "code",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    // Only allow safe URL schemes on <a href>
    allowedSchemes: ["http", "https"],
    allowedSchemesByTag: { a: ["http", "https"] },
    // Force safe link attributes
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
    // Reject any tag not in the allowlist (no fallback to text)
    disallowedTagsMode: "discard",
  });
}
