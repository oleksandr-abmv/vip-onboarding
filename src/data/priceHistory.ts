// ─── Historical price data ───────────────────────────────────────────────────
//
// Deterministic mock price history for the Historical Price component. Real price
// tracking would come from a backend; here we synthesise a stable per-product
// series so the chart, stats, and change log look plausible and never shift
// between renders. Seeded off brand + name, so the same product always gets the
// same history.
//
// Data shape: a list of price CHANGE events, ascending by date. changes[0] is the
// initial listing ("First tracked"); each later entry is a step to a new price.
// Between events the price is constant, which is why the chart draws as a step.

import type { Product } from './products';

export interface PriceChange {
  /** Date the price became `price`. */
  date: Date;
  price: number;
}

export type PriceProfile = 'up' | 'down' | 'mixed' | 'limited' | 'empty';

export interface PriceHistory {
  currentPrice: number;
  /** Date tracking began (equal to changes[0].date). */
  firstTracked: Date;
  /** Ascending by date. changes[0] is the initial listing. */
  changes: PriceChange[];
  profile: PriceProfile;
}

// ─── Deterministic RNG ───────────────────────────────────────────────────────

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 - small, stable, seedable PRNG. */
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY = 86400000;
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

function parsePrice(s: string): number | null {
  const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Build L price levels ending exactly at `current`. Each step is a non-zero
 * multiple of $50 (so no "$0 change" ever appears), and `upBias` sets how often a
 * step moves up (0..1). Built backwards from `current` so the latest price is
 * exact; earlier levels emerge from the accumulated steps, giving the trend.
 */
function buildLevels(rand: () => number, current: number, upBias: number, L: number): number[] {
  const nSteps = L - 1;
  const floor = Math.max(100, roundTo(current * 0.5, 50));
  const deltas: number[] = [];
  for (let i = 0; i < nSteps; i++) {
    const mag = Math.max(50, roundTo(current * (0.012 + rand() * 0.03), 50)); // ~$50+, 1-4%
    deltas.push(rand() < upBias ? mag : -mag);
  }
  const levels = new Array<number>(L);
  levels[L - 1] = current;
  for (let i = nSteps - 1; i >= 0; i--) {
    let lvl = levels[i + 1] - deltas[i];
    // Keep prices sane: if a downward step would dip too low, flip it up instead
    // (still non-zero, so the step stays visible).
    if (lvl < floor) lvl = levels[i + 1] + Math.abs(deltas[i]);
    levels[i] = lvl;
  }
  return levels;
}

/** L ascending dates spanning [firstTracked, today], the first pinned to firstTracked. */
function buildDates(
  rand: () => number,
  firstTracked: Date,
  today: Date,
  L: number,
): Date[] {
  const t0 = firstTracked.getTime();
  const t1 = today.getTime();
  const ts: number[] = [];
  // Keep the newest change a little short of today so the final flat run to
  // "Today" is always visible.
  for (let i = 0; i < L - 1; i++) ts.push(0.05 + rand() * 0.88);
  ts.sort((a, b) => a - b);
  return [firstTracked, ...ts.map((t) => startOfDay(new Date(t0 + (t1 - t0) * t)))];
}

// ─── Generator ───────────────────────────────────────────────────────────────

export function getPriceHistory(product: Pick<Product, 'brand' | 'name' | 'price'>): PriceHistory {
  const seed = hashSeed(`${product.brand}|${product.name}`);
  const rand = mulberry32(seed);
  const today = startOfDay(new Date());

  // Current price: from the product when present, else a stable generated one so
  // every product gets a chart (most prototype products have no price yet).
  const current = roundTo(parsePrice(product.price) ?? 650 + rand() * 11850, 50);

  // Profile mix (deterministic per product).
  const p = rand();
  let profile: PriceProfile;
  if (p < 0.05) profile = 'empty';
  else if (p < 0.14) profile = 'limited';
  else if (p < 0.55) profile = 'up';
  else if (p < 0.8) profile = 'down';
  else profile = 'mixed';

  // Empty: just started tracking, no changes recorded yet.
  if (profile === 'empty') {
    const firstTracked = addDays(today, -Math.floor(2 + rand() * 22));
    return {
      currentPrice: current,
      firstTracked,
      changes: [{ date: firstTracked, price: current }],
      profile,
    };
  }

  // Limited: tracked a couple of months, a single change on record.
  if (profile === 'limited') {
    const firstTracked = addDays(today, -Math.floor(40 + rand() * 70));
    const startPrice = Math.max(100, roundTo(current * (1 + (rand() * 0.08 - 0.04)), 50));
    const changeDate = startOfDay(
      new Date(firstTracked.getTime() + (today.getTime() - firstTracked.getTime()) * (0.4 + rand() * 0.3)),
    );
    const changes: PriceChange[] = [
      { date: firstTracked, price: startPrice === current ? current - 100 : startPrice },
      { date: changeDate, price: current },
    ];
    return { currentPrice: current, firstTracked, changes, profile };
  }

  // Full history: 2-6 years, 5-15 price levels (some products end up with a long
  // enough change log to page through).
  const spanYears = 2 + Math.floor(rand() * 5);
  const firstTracked = addDays(today, -Math.floor(spanYears * 365 + rand() * 120));
  const L = 5 + Math.floor(rand() * 11);

  const upBias = profile === 'up' ? 0.82 : profile === 'down' ? 0.18 : 0.5;
  const levels = buildLevels(rand, current, upBias, L);
  const dates = buildDates(rand, firstTracked, today, L);
  const changes: PriceChange[] = levels.map((price, i) => ({ date: dates[i], price }));

  return { currentPrice: current, firstTracked, changes, profile };
}
