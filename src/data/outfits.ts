// ─── Outfits (Discover > Outfits) ────────────────────────────────────────────
//
// A look that has already been styled, rather than a group of pieces the user
// gathered. That difference is the whole point of the section: a collection is
// shown as its contents (the fanned cover), an outfit is shown as one composed
// flat-lay of the finished look, the way a lookbook page is.
//
// The flat-lays live in `/public/outfits/` and were generated for this
// prototype. They are art, not catalogue photography: `items` is what is
// actually shoppable, drawn from the real catalogue, and the two are styled to
// agree rather than being the same assets.
//
// Menswear only for now - the imagery is shot as menswear, so `OUTFITS` is
// filtered out of the feed for a user who is not shopping men's pieces rather
// than shown a look they cannot wear.

import type { Product } from './products';
import { priceOf, formatPrice } from './collections';

export interface Outfit {
  id: string;
  name: string;
  /** Unused by any surface today; the card subtitle comes from `outfitMetaLine()`. */
  description?: string;
  /** The styled flat-lay. **Landscape 4:3**, cut out on white - it is shown as a
   * wide hero and a wide card, and a portrait crop left grey gutters in both. */
  image: string;
  /** Catalogue product names, in the order they read down the look. */
  items: string[];
}

export const OUTFITS: Outfit[] = [
  {
    id: 'outfit-boardroom',
    name: 'Boardroom Navy',
    description: 'Navy, grey and a burgundy tie. The meeting you dress up for.',
    image: '/outfits/boardroom.webp',
    items: [
      'Shelton Suit',
      'Cotton Poplin Shirt',
      'Philip Ii Oxford',
      'Un Jour Briefcase',
      'Calatrava',
    ],
  },
  {
    id: 'outfit-linen',
    name: 'Linen Weekend',
    description: 'Everything in sand and tan, cut loose for the heat.',
    image: '/outfits/linen.webp',
    items: [
      'Cashmere Polo Shirt',
      'City Gommino',
      'H Buckle Belt',
      '714 Folding Sunglasses',
      'Leather Duffel',
    ],
  },
  {
    id: 'outfit-offduty',
    name: 'Off Duty',
    description: 'Soft grey, indigo and white. Saturday, nowhere to be.',
    image: '/outfits/offduty.webp',
    items: [
      'Monogram Hoodie',
      'Cashmere Joggers',
      'B30 Sneaker',
      'Cashmere Baseball Cap',
      'Re Nylon Backpack',
    ],
  },
  {
    id: 'outfit-evening',
    name: 'Evening Black',
    description: 'Black on charcoal, nothing shiny. Dinner, late.',
    image: '/outfits/evening.webp',
    items: [
      'Cashmere Sweater',
      'Chelsea Boot',
      'Intrecciato Card Holder',
      'Reverso',
      'Onyx Cufflinks',
    ],
  },
  {
    id: 'outfit-citybreak',
    name: 'City Break Camel',
    description: 'A camel coat over denim, packed for three days away.',
    image: '/outfits/citybreak.webp',
    items: [
      'Double Breasted Blazer',
      'Wyatt Boot',
      'Keepall 50',
      'Aviator Sunglasses',
      'Grande Unita Cashmere Scarf',
    ],
  },
];

/**
 * Furniture & Decor Ideas: the same object as an outfit, for rooms instead of
 * people. Same card, same flat-lay treatment, same collection page behind it -
 * the only reason it is a separate list is that it is a separate row, and that
 * it is unisex where the outfits are menswear.
 */
export const DECOR_SETS: Outfit[] = [
  {
    id: 'decor-reading-corner',
    name: 'The Reading Corner',
    description: 'A chair you sink into and somewhere to put the book down.',
    image: '/outfits/decor-reading.webp',
    items: ['Eames Lounge Chair', 'Noguchi Coffee Table', 'Usm Haller Shelving', 'No 5'],
  },
  {
    id: 'decor-long-table',
    name: 'The Long Table',
    description: 'Reclaimed oak, pale chairs, and something worth sitting under.',
    image: '/outfits/decor-dining.webp',
    items: [
      'Timber Reclaimed Oak Dining Table',
      'Ch24 Wishbone Chair',
      'Lalique Crystal Vase Lamp',
      'Large Vase Of Flowers',
    ],
  },
  {
    id: 'decor-drawing-room',
    name: 'The Drawing Room',
    description: 'Deep seats, one loud armchair, and a wall that earns its place.',
    image: '/outfits/decor-drawing.webp',
    items: ['Chester Sofa', 'Medusa Armchair', 'Water Lilies', 'Pk22 Lounge Chair'],
  },
  {
    id: 'decor-quiet-study',
    name: 'The Quiet Study',
    description: 'Low, plain and warm. The room you take calls in.',
    image: '/outfits/decor-study.webp',
    items: ['Charles Sofa', 'Egg Chair', 'Starry Night', 'Farm Table'],
  },
];

/** "5 pieces · $12,400" - the meta line under an outfit, matching a collection's. */
export function outfitMetaLine(
  outfit: Outfit,
  byName: (name: string) => Product | undefined,
): string {
  const found = outfit.items.map(byName).filter((p): p is Product => !!p);
  const total = found.reduce((sum, p) => sum + priceOf(p), 0);
  const n = found.length;
  return `${n} ${n === 1 ? 'piece' : 'pieces'} · ${formatPrice(total)}`;
}
