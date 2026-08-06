import type { Product } from './products';
import { compatible } from './edits';
import { priceOf } from './collections';

// ─── Similar pieces ──────────────────────────────────────────────────────────
//
// The product page's "Similar pieces" rail: individual products, not the looks
// the piece sits in (those are the section below it).
//
// **Same kind of thing, then the closest in price.** A piece is similar when it
// is the same category and, ideally, the same subcategory - a belt is like other
// belts before it is like other accessories. Within that, order by how close the
// price is, because at these numbers the price is most of what separates two
// pieces of the same kind.
//
// Gender comes from the anchor, the same rule the generated looks use: a men's
// belt is never "similar to" a women's one.

/** How many the rail shows. Enough to scroll, not enough to become a browse. */
const LIMIT = 8;

export function similarTo(product: Product, pool: Product[], limit = LIMIT): Product[] {
  const price = priceOf(product);

  const candidates = pool.filter(
    (p) => p.name !== product.name && p.category === product.category && compatible(product, p),
  );

  return candidates
    .map((p) => ({
      product: p,
      // Same subcategory wins outright; price proximity decides the rest.
      rank: (p.subcategory === product.subcategory ? 0 : 1_000_000_000) + Math.abs(priceOf(p) - price),
    }))
    .sort((a, b) => a.rank - b.rank || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((c) => c.product);
}
