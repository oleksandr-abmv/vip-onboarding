// ─── Collections (Saved > Collections) ───────────────────────────────────────
//
// A collection is a user-curated group of saved pieces: name, description,
// ordered product names, and an optional note per piece. Owned by FeedScreen
// (like Data Memory) because Saved, the product page, the scan results, and the
// collection page all read and write the same list.
//
// Prices: discovered products carry `price: ''`, so totals are computed from
// the deterministic price history (the same source the product page shows).

import type { Product } from './products';
import PRODUCTS from './products';
import { getPriceHistory } from './priceHistory';

export interface Collection {
  id: string;
  name: string;
  description: string;
  /** Product names, in the order they were added. */
  items: string[];
  /** Optional note per product name. */
  notes: Record<string, string>;
  createdAt: number;
}

let seq = 0;
export const makeCollection = (name: string, description = ''): Collection => ({
  id: `col-${Date.now()}-${(seq += 1)}`,
  name,
  description,
  items: [],
  notes: {},
  createdAt: Date.now(),
});

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
 * as one: the name and meta line the card already shows, the description if it
 * has one, then a line per piece. The link is the app itself, since the
 * prototype has no per-collection route to point at.
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
    text: [
      `${collection.name} (${collectionMeta(collection, byName)})`,
      ...(collection.description ? [collection.description] : []),
      ...pieces,
    ].join('\n'),
    url: typeof window === 'undefined' ? '' : window.location.origin,
  };
}

/** Virtual try-on works on clothing only. */
export const isClothing = (product: Product): boolean =>
  product.category === 'Fashion and Apparel';

export const collectionHasClothing = (
  collection: Collection,
  byName: (name: string) => Product | undefined,
): boolean => collection.items.some((name) => {
  const p = byName(name);
  return !!p && isClothing(p);
});

// ── Seed ─────────────────────────────────────────────────────────────────────
// Starter collections so the feature demos without setup. They deliberately
// span the whole catalog rather than just the wearable categories: a car, a
// canvas and an armchair photograph nothing like a boot does, and the cover has
// to hold up on all of them. They also run 2, 3, 4 and 5 pieces long, so every
// state of the cover is on screen at once without adding anything.
//
// Gender-filtered, which only bites on the wearable categories: Vehicles, Fine
// Art and Furniture are unisex throughout.

/** The first `count` pieces in a category that have real imagery. */
function pick(category: string, count: number, gender: string | null): string[] {
  return PRODUCTS.filter(
    (p) =>
      p.category === category &&
      p.image !== '/vip-logo.svg' &&
      (!p.gender || p.gender === 'unisex' || gender === null || p.gender === gender ||
        (gender !== 'male' && gender !== 'female')),
  )
    .slice(0, count)
    .map((p) => p.name);
}

/** One piece from each of the given categories, in order. */
const oneEach = (categories: string[], gender: string | null): string[] =>
  categories.flatMap((c) => pick(c, 1, gender));

export function seedCollections(gender: string | null): Collection[] {
  const now = Date.now();
  const build = (
    id: string,
    name: string,
    description: string,
    items: string[],
    notes: Record<string, string> = {},
  ): Collection => ({ id, name, description, items, notes, createdAt: now });

  const evening = oneEach(
    // Clothing first, so virtual try-on starts enabled on this one.
    ['Fashion and Apparel', 'Footwear', 'Jewellery', 'Handbags and Leather Goods'],
    gender,
  );

  return [
    build(
      'col-seed-evening-edit',
      'Evening Edit',
      'Pieces for gala season and late dinners.',
      evening,
      evening.length > 0 ? { [evening[0]]: 'Fitting booked for the 12th' } : {},
    ),
    build(
      'col-seed-garage',
      'The Garage',
      'Weekend cars and the ones I keep watching.',
      pick('Vehicles', 4, gender),
    ),
    build(
      'col-seed-gallery',
      'Gallery Wall',
      'Works I would hang if the wall were bigger.',
      pick('Fine Art', 3, gender),
    ),
    build(
      'col-seed-study',
      'The Study',
      'Furniture for the room off the library.',
      pick('Furniture', 2, gender),
    ),
    build(
      'col-seed-long-list',
      'The Long List',
      'One of everything I have not talked myself out of.',
      oneEach(['Vehicles', 'Watches', 'Fine Art', 'Handbags and Leather Goods', 'Furniture'], gender),
    ),
  ];
}
