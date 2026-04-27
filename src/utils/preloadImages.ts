/**
 * Fire-and-forget image preloader. Browsers will cache anything fetched here,
 * so subsequent <img src=...> usage on later screens renders instantly.
 *
 * Safe to call with hundreds of URLs — uses a per-call dedup so we don't spam
 * the network with duplicates inside the same session.
 */
const seen = new Set<string>();

export function preloadImages(urls: Iterable<string>): void {
  if (typeof Image === 'undefined') return; // SSR guard
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    const img = new Image();
    // Hint the browser this is best-effort, low-priority
    img.decoding = 'async';
    // 'fetchpriority' isn't on all browsers' Image type yet
    (img as unknown as { fetchPriority?: string }).fetchPriority = 'low';
    img.src = u;
  }
}
