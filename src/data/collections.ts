// ─── Collections (Saved > Collections) ───────────────────────────────────────
//
// A collection is a user-curated group of saved pieces: a name and the product
// names in it, in the order they were added. Owned by FeedScreen (like Data
// Memory) because Saved, the product page, the scan results, and the collection
// page all read and write the same list.
//
// **A piece lives in exactly one collection.** Filing it somewhere new moves it
// rather than copying it, which is why the Add to collection sheet is a radio
// list and not a set of checkboxes. Everything downstream can therefore treat
// "which collection is this in" as a single answer - see `collectionOf`.
//
// Deliberately absent: descriptions, per-piece notes and cover pictures. A
// collection is a name and a list of things, and its card already shows the
// pieces inside it.
//
// Prices: discovered products carry `price: ''`, so totals are computed from
// the deterministic price history (the same source the product page shows).

import type { Product } from './products';
import PRODUCTS from './products';
import { getPriceHistory } from './priceHistory';

export interface Collection {
  id: string;
  name: string;
  /** Product names, in the order they were added. */
  items: string[];
  createdAt: number;
}

let seq = 0;
export const makeCollection = (name: string): Collection => ({
  id: `col-${Date.now()}-${(seq += 1)}`,
  name,
  items: [],
  createdAt: Date.now(),
});

/** The one collection holding this piece, if any. A piece is never in two. */
export const collectionOf = (
  collections: Collection[],
  productName: string,
): Collection | undefined => collections.find((c) => c.items.includes(productName));

/** The price the product page shows for this product (deterministic mock). */
export const priceOf = (product: Product): number => getPriceHistory(product).currentPrice;

export const formatPrice = (n: number): string =>
  '$' + Math.round(n).toLocaleString('en-US');

/** Sum of the collection's item prices, formatted ("$36,800"). */
export function collectionTotal(
  collection: Collection,
  byName: (name: string) => Product | undefined,
): string {
  const total = collection.items.reduce((sum, name) => {
    const p = byName(name);
    return p ? sum + priceOf(p) : sum;
  }, 0);
  return formatPrice(total);
}

/** "4 items · $36,800" - the meta line under a collection name. */
export function collectionMeta(
  collection: Collection,
  byName: (name: string) => Product | undefined,
): string {
  const n = collection.items.length;
  const items = `${n} ${n === 1 ? 'item' : 'items'}`;
  return n === 0 ? items : `${items} · ${collectionTotal(collection, byName)}`;
}

/**
 * What gets handed to the OS share sheet. A collection is a list, so it shares
 * as one: the name and the meta line its card already shows, then a line per
 * piece. The link is the app itself, since the prototype has no per-collection
 * route to point at.
 */
export function collectionShare(
  collection: Collection,
  byName: (name: string) => Product | undefined,
): { title: string; text: string; url: string } {
  const pieces = collection.items
    .map((name) => byName(name))
    .filter((p): p is Product => !!p)
    .map((p) => `- ${p.brand} ${p.name}`);
  return {
    title: collection.name,
    text: [`${collection.name} (${collectionMeta(collection, byName)})`, ...pieces].join('\n'),
    url: typeof window === 'undefined' ? '' : window.location.origin,
  };
}

/** Virtual try-on works on clothing only (the product page's own button). */
export const isClothing = (product: Product): boolean =>
  product.category === 'Fashion and Apparel';

// ── Seed ─────────────────────────────────────────────────────────────────────
// Starter collections so the feature demos without setup. They deliberately
// span the whole catalog rather than just the wearable categories: a car, a
// canvas and an armchair photograph nothing like a boot does, and the card's
// mosaic has to hold up on all of them. They also run 2, 3, 4 and 6 pieces
// long, so every state of that mosaic is on screen at once.
//
// **Disjoint by construction.** A piece belongs to one collection, so the seeds
// draw from a shared pool and `take` never hands the same piece out twice - the
// old seeds overlapped, which would now be an illegal state on first paint.
//
// Gender-filtered, which only bites on the wearable categories: Vehicles, Fine
// Art and Furniture are unisex throughout.

const wearableByGender = (product: Product, gender: string | null): boolean =>
  !product.gender ||
  product.gender === 'unisex' ||
  gender === null ||
  product.gender === gender ||
  (gender !== 'male' && gender !== 'female');

export function seedCollections(gender: string | null): Collection[] {
  const now = Date.now();
  const used = new Set<string>();

  /** The next `count` unclaimed pieces in a category that have real imagery. */
  const take = (category: string, count: number): string[] => {
    const out: string[] = [];
    for (const p of PRODUCTS) {
      if (out.length === count) break;
      if (p.category !== category) continue;
      if (p.image === '/vip-logo.svg') continue;
      if (used.has(p.name)) continue;
      if (!wearableByGender(p, gender)) continue;
      used.add(p.name);
      out.push(p.name);
    }
    return out;
  };

  const build = (id: string, name: string, items: string[]): Collection => ({
    id,
    name,
    items,
    createdAt: now,
  });

  return [
    build('col-seed-evening-edit', 'Evening Edit', [
      ...take('Jewellery', 2),
      ...take('Handbags and Leather Goods', 1),
      ...take('Footwear', 1),
    ]),
    build('col-seed-como', 'Weekend in Como', [
      ...take('Watches', 1),
      ...take('Fashion and Apparel', 2),
      ...take('Handbags and Leather Goods', 1),
      ...take('Footwear', 1),
      ...take('Jewellery', 1),
    ]),
    build('col-seed-garage', 'The Garage', take('Vehicles', 3)),
    build('col-seed-gallery', 'Gallery Wall', take('Fine Art', 3)),
    build('col-seed-study', 'The Study', take('Furniture', 2)),
  ];
}
