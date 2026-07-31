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
// One starter collection so the feature demos without setup: a piece from each
// wearable category (clothing first, so virtual try-on starts enabled), with a
// note on the first piece. Gender-filtered so the demo matches the user.
const SEED_CATEGORIES = ['Fashion and Apparel', 'Footwear', 'Jewellery', 'Handbags and Leather Goods'];

export function seedCollections(gender: string | null): Collection[] {
  const items: string[] = [];
  for (const category of SEED_CATEGORIES) {
    const p = PRODUCTS.find(
      (p) =>
        p.category === category &&
        p.image !== '/vip-logo.svg' &&
        (!p.gender || p.gender === 'unisex' || gender === null || p.gender === gender ||
          (gender !== 'male' && gender !== 'female')),
    );
    if (p) items.push(p.name);
  }
  const seed: Collection = {
    id: 'col-seed-evening-edit',
    name: 'Evening Edit',
    description: 'Pieces for gala season and late dinners.',
    items,
    notes: items.length > 0 ? { [items[0]]: 'Fitting booked for the 12th' } : {},
    createdAt: Date.now(),
  };
  return [seed];
}
