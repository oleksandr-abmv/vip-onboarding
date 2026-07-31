import type { Product } from './products';
import { MAP_H, MAP_W, PX_PER_KM, USER_POS } from './mapCanvas';

// ─── Boutiques ("Where to buy") ──────────────────────────────────────────────
//
// Prototype stand-in for a stock/location lookup. Every boutique sits in ONE
// city so "2.9 km" means something: the pins, the distances and the list are all
// the same geography. `x` / `y` are normalised 0..1 positions on the shared map
// canvas (`src/data/mapCanvas.ts`) and the distance is DERIVED from them, so a
// pin can never disagree with the row that describes it.
//
// Boutiques carry no photography. The row is name, address, hours and stock -
// a storefront picture told the user nothing and made the list twice as tall.

export type Boutique = {
  id: string;
  /** "Cartier Place Vendome" or a department store's own name. */
  name: string;
  /** "Flagship boutique", "Department store", ... */
  kind: string;
  address: string;
  /** Opening hours for today. */
  hours: string;
  openNow: boolean;
  inStock: boolean;
  /** Derived from the pin's distance to the user marker. */
  distanceKm: number;
  phone: string;
  email: string;
  /** Pin position on the map canvas, normalised 0..1. */
  x: number;
  y: number;
};

type Venue = {
  id: string;
  /** Appended to the brand: "Cartier Place Vendome". */
  street: string;
  /** Set when the venue is a house of its own (a department store). */
  storeName?: string;
  storeDomain?: string;
  kind?: string;
  address: string;
  hours: string;
  openNow: boolean;
  phone: string;
  x: number;
  y: number;
};

const VENUES: Venue[] = [
  {
    id: 'vendome',
    street: 'Place Vendome',
    address: '6 Place Vendome, 75001 Paris',
    hours: '10:00 - 19:00',
    openNow: true,
    phone: '+33 1 42 60 82 30',
    x: 0.42,
    y: 0.4,
  },
  {
    id: 'saint-honore',
    street: 'Rue Saint-Honore',
    address: '356 Rue Saint-Honore, 75001 Paris',
    hours: '10:30 - 19:30',
    openNow: true,
    phone: '+33 1 42 96 15 44',
    x: 0.63,
    y: 0.445,
  },
  {
    id: 'cambon',
    street: 'Rue Cambon',
    address: '31 Rue Cambon, 75001 Paris',
    hours: '11:00 - 19:00',
    openNow: true,
    phone: '+33 1 44 50 66 00',
    x: 0.31,
    y: 0.485,
  },
  {
    id: 'sevres',
    street: 'Rue de Sevres',
    storeName: 'Le Bon Marche',
    storeDomain: 'lebonmarche.com',
    kind: 'Department store',
    address: '24 Rue de Sevres, 75007 Paris',
    hours: '10:00 - 19:45',
    openNow: true,
    phone: '+33 1 44 39 80 00',
    x: 0.55,
    y: 0.555,
  },
  {
    id: 'montaigne',
    street: 'Avenue Montaigne',
    address: '30 Avenue Montaigne, 75008 Paris',
    hours: '10:00 - 19:00',
    openNow: false,
    phone: '+33 1 40 73 73 73',
    x: 0.71,
    y: 0.335,
  },
  {
    id: 'haussmann',
    street: 'Boulevard Haussmann',
    storeName: 'Galeries Lafayette',
    storeDomain: 'galerieslafayette.com',
    kind: 'Department store',
    address: '40 Boulevard Haussmann, 75009 Paris',
    hours: '09:30 - 20:30',
    openNow: true,
    phone: '+33 1 42 82 34 56',
    x: 0.25,
    y: 0.28,
  },
];

/** Boutique kinds, rotated per brand so two products do not read identically. */
const KINDS = ['Flagship boutique', 'Concept store', 'Maison', 'Authorized retailer', 'Private salon'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function distanceKm(venue: Venue): number {
  const dx = (venue.x - USER_POS.x) * MAP_W;
  const dy = (venue.y - USER_POS.y) * MAP_H;
  return Math.round((Math.hypot(dx, dy) / PX_PER_KM) * 10) / 10;
}

function slug(brand: string): string {
  return brand.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Five boutiques carrying this product, nearest first. Deterministic per brand:
 * the same product always returns the same list, but two brands get a different
 * mix of venues and stock.
 */
export function boutiquesFor(product: Product): Boutique[] {
  const seed = hash(product.brand);
  const brandSlug = slug(product.brand);

  const list = Array.from({ length: 5 }, (_, i) => {
    const venue = VENUES[(seed + i) % VENUES.length];
    return {
      id: venue.id,
      name: venue.storeName || `${product.brand} ${venue.street}`,
      kind: venue.kind || KINDS[(seed + i) % KINDS.length],
      address: venue.address,
      hours: venue.hours,
      openNow: venue.openNow,
      // Varies by brand so the "In stock" filter has something to do, but is
      // stable for a given brand + venue.
      inStock: hash(brandSlug + venue.id) % 4 !== 0,
      distanceKm: distanceKm(venue),
      phone: venue.phone,
      email: `${venue.id}@${venue.storeDomain || `${brandSlug}.com`}`,
      x: venue.x,
      y: venue.y,
    };
  });

  return list.sort((a, b) => a.distanceKm - b.distanceKm);
}

/** "2.9 km" - one decimal everywhere, so the rows line up. */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}
