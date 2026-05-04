// Convert an internal problem id (kebab-case, with topical prefix) into a
// human-readable display name. Used by the session-stats panel and the
// build-time SEO pre-render.

export function readableName(id: string): string {
  return id
    .replace(/^twist-|^special-|^ds-/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
