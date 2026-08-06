import type { Product } from './products';
import { priceOf } from './collections';

// ─── Edits: collections built around one piece ───────────────────────────────
//
// The product page's "Styled around this piece" rail. These are **generated,
// not stored**: five looks a-piece drawn from the catalogue, so every product
// has a rail rather than the handful that happen to sit in a hand-made look.
//
// **The lens changes with the category.** A watch is styled for an occasion, a
// chair for a room, a bottle for a moment, a car for a drive - so the sets a
// piece belongs to are named by what kind of thing it is. One naming pool per
// family; anything unfamiliar falls back to `misc`.
//
// Two lenses work for anything and close the rail: **the house** (other pieces
// by the same maker) and **a price tier** (what the whole look costs).
//
// Everything here is deterministic from the piece's name, so a collection can
// be rebuilt from its id alone - which is how the collection page resolves one
// when it is opened.

export interface Edit {
  /** `edit-<lens>-<n>-<slug>`, rebuildable by `editById`. */
  id: string;
  name: string;
  /** Catalogue product names, the anchor piece first. What a collection stores. */
  items: string[];
  /**
   * The very pieces chosen, anchor first. A few products share a name across
   * genders ("Cashmere Sweater" is both The Row's and Loro Piana's), so looking
   * `items` back up by name can hand back the other gender's piece. Anything
   * rendering the look reads this; only storing it reads `items`.
   */
  products: Product[];
}

type Family = 'worn' | 'lived' | 'poured' | 'driven' | 'misc';

const FAMILY_OF: Record<string, Family> = {
  'Fashion and Apparel': 'worn',
  Footwear: 'worn',
  'Handbags and Leather Goods': 'worn',
  Accessories: 'worn',
  Jewellery: 'worn',
  Watches: 'worn',
  Furniture: 'lived',
  'Fine Art': 'lived',
  Collectibles: 'lived',
  'Wine & Spirits': 'poured',
  Cigars: 'poured',
  'Fragrance & Oud': 'poured',
  Vehicles: 'driven',
  'Yachts & Boats': 'driven',
};

/** What a set of this kind of thing is called. Three per family, so the rail
    never repeats a name for the same piece. */
const SETTINGS: Record<Family, string[]> = {
  worn: ['Black tie', 'Off duty', 'The boardroom', 'Travelling light'],
  lived: ['The study', 'The drawing room', 'The entrance hall'],
  poured: ['After dinner', 'The cellar', 'Sunday lunch'],
  driven: ['The weekend drive', 'Down the coast', 'The long road'],
  misc: ['The short list', 'Quietly good', 'Worth the wait'],
};

/** How many pieces a generated look holds, the anchor included. */
const SIZE = 4;

const familyOf = (product: Product): Family => FAMILY_OF[product.category] ?? 'misc';

/**
 * Can this piece sit in a look built around `anchor`? A men's belt does not get
 * styled with a women's skirt, whatever the user answered at onboarding: the
 * anchor declares the gender of the look, and the feed's own filter only runs
 * when a preference was given. Unisex pieces go with anything.
 */
function compatible(anchor: Product, p: Product): boolean {
  if (anchor.gender !== 'male' && anchor.gender !== 'female') return true;
  return !p.gender || p.gender === 'unisex' || p.gender === anchor.gender;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * `count` companions for the anchor, drawn from `pool` and spread across
 * categories so a look is a look rather than four of the same thing. Seeded, so
 * the same piece always gets the same companions.
 */
function companions(anchor: Product, pool: Product[], count: number, seed: number): Product[] {
  const others = pool.filter((p) => p.name !== anchor.name);
  const byCat = new Map<string, Product[]>();
  for (const p of others) {
    const list = byCat.get(p.category) ?? [];
    list.push(p);
    byCat.set(p.category, list);
  }
  // The anchor's own category last: a second bag is the least interesting
  // companion a bag can have.
  const cats = [...byCat.keys()].sort((a, b) => {
    if (a === anchor.category) return 1;
    if (b === anchor.category) return -1;
    return hash(a + seed) - hash(b + seed);
  });

  const out: Product[] = [];
  for (let round = 0; out.length < count && round < 4; round++) {
    for (const cat of cats) {
      if (out.length >= count) break;
      const list = byCat.get(cat)!;
      const pick = list[(hash(cat + anchor.name) + seed + round) % list.length];
      if (pick && !out.some((p) => p.name === pick.name)) out.push(pick);
    }
  }
  return out;
}

/** "$50,000" rounded up to something a person would say. */
function tierLabel(total: number): string {
  const steps = [5, 10, 25, 50, 100, 250, 500, 1000];
  const k = total / 1000;
  const step = steps.find((s) => k <= s) ?? Math.ceil(k / 500) * 500;
  return `$${step >= 1000 ? `${step / 1000}m` : `${step}k`}`;
}

/**
 * The looks this piece sits in. `pool` is the catalogue the user can actually
 * see (gender-filtered upstream), so a men's rail never proposes a women's coat.
 */
export function editsFor(product: Product, pool: Product[]): Edit[] {
  const family = familyOf(product);
  const seed = hash(product.name);
  // Everything below draws from pieces that can share a look with the anchor.
  const usable = pool.filter((p) => compatible(product, p));
  const kin = usable.filter((p) => familyOf(p) === family);
  const base = kin.length >= SIZE ? kin : usable;
  const out: Edit[] = [];

  // 1-3. The settings this kind of thing belongs to, each a different mix.
  SETTINGS[family].slice(0, 3).forEach((name, i) => {
    const mates = companions(product, base, SIZE - 1, seed + i * 977);
    if (mates.length < SIZE - 1) return;
    out.push({
      id: `edit-set${i}-${slug(product.name)}`,
      name,
      items: [product.name, ...mates.map((p) => p.name)],
      products: [product, ...mates],
    });
  });

  // 4. The house. Only when the maker actually has other pieces to show.
  const house = usable.filter((p) => p.brand === product.brand && p.name !== product.name);
  if (house.length >= 2) {
    const kinfolk = house.slice(0, SIZE - 1);
    out.push({
      id: `edit-house-${slug(product.name)}`,
      name: `The ${product.brand} edit`,
      items: [product.name, ...kinfolk.map((p) => p.name)],
      products: [product, ...kinfolk],
    });
  }

  // 5. What the whole look costs, for the piece plus its closest companions.
  const tierMates = companions(product, base, SIZE - 1, seed + 5501);
  if (tierMates.length === SIZE - 1) {
    const total = [product, ...tierMates].reduce((sum, p) => sum + priceOf(p), 0);
    out.push({
      id: `edit-tier-${slug(product.name)}`,
      name: `Under ${tierLabel(total)} together`,
      items: [product.name, ...tierMates.map((p) => p.name)],
      products: [product, ...tierMates],
    });
  }

  return out;
}

/**
 * Rebuild one edit from its id. The collection page opens by id alone, and
 * these are generated rather than stored, so it has to be reproducible.
 */
export function editById(id: string, pool: Product[]): Edit | undefined {
  if (!id.startsWith('edit-')) return undefined;
  const anchor = pool.find((p) => id.endsWith(`-${slug(p.name)}`));
  if (!anchor) return undefined;
  return editsFor(anchor, pool).find((e) => e.id === id);
}
