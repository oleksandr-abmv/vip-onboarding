// ─── Notifications ───────────────────────────────────────────────────────────
//
// What sits behind the bell in the Discover nav bar (Figma node 5570-55102).
//
// **Every notification opens something.** The catalog only holds what is already
// tagged in it, so a row that just announces a fact and leaves the user on a
// list is the same dead end the app refuses everywhere else. Each one carries a
// `target` and the row is a button.
//
// **They are anchored to what the user already has.** The seeds are built from
// the user's own collections rather than from a hardcoded list, so a price drop
// is a price drop on a piece they filed, and the piece it names is one their
// gender filter actually returned.

import type { Product } from './products';
import { formatPrice, priceOf, type Collection } from './collections';

/**
 * Where a notification goes. Deliberately the same shape as the chat's
 * `AttachmentTarget`, so both resolve through the same "open what this names"
 * plumbing in FeedScreen.
 */
export type NotificationTarget =
  | { kind: 'collection'; id: string }
  | { kind: 'product'; name: string };

export interface AppNotification {
  id: string;
  /** Material Symbols glyph for the row's icon disc. */
  icon: string;
  title: string;
  body: string;
  createdAt: number;
  /** Unread rows carry a dot. Reading the list is what clears them. */
  read: boolean;
  target: NotificationTarget;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Notifications newest first - the same rule the Saved list follows. */
export const newestFirst = (list: AppNotification[]): AppNotification[] =>
  [...list].sort((a, b) => b.createdAt - a.createdAt);

export const unreadCount = (list: AppNotification[]): number =>
  list.reduce((n, x) => n + (x.read ? 0 : 1), 0);

/**
 * Starter notifications, drawn from the seeded collections so the bell has
 * something true to say on first paint. A collection with nothing in it yields
 * nothing rather than a row pointing at an empty page.
 */
export function seedNotifications(
  collections: Collection[],
  byName: (name: string) => Product | undefined,
): AppNotification[] {
  const now = Date.now();
  // The user's own pieces, paired with the collection holding them.
  const filed = collections.flatMap((c) =>
    c.items.map((name) => ({ product: byName(name), collection: c })),
  );
  const pieces = filed.filter((f): f is { product: Product; collection: Collection } => !!f.product);
  if (pieces.length === 0) return [];

  const out: AppNotification[] = [];
  const at = (i: number) => pieces[i % pieces.length];

  // 1. A price drop on something they filed. The "was" price is derived from the
  //    piece's own current price, so the two numbers never contradict each other.
  const drop = at(0);
  const nowPrice = priceOf(drop.product);
  out.push({
    id: 'notif-price-drop',
    icon: 'sell',
    title: 'Price drop',
    body: `${drop.product.brand} ${drop.product.name} is now ${formatPrice(nowPrice)}, down from ${formatPrice(Math.round(nowPrice * 1.12))}.`,
    createdAt: now - 40 * MINUTE,
    read: false,
    target: { kind: 'product', name: drop.product.name },
  });

  // 2. Stock, which is the one thing the product page can actually answer (see
  //    Where to buy), so the row lands somewhere useful.
  const stock = at(2);
  out.push({
    id: 'notif-back-in-stock',
    icon: 'store',
    title: 'Back in stock',
    body: `${stock.product.brand} ${stock.product.name} is available again in a boutique near you.`,
    createdAt: now - 5 * HOUR,
    read: false,
    target: { kind: 'product', name: stock.product.name },
  });

  // 3. Something for a collection, opening the collection rather than the piece:
  //    the point is the set it would join.
  const forCollection = pieces.find((p) => p.collection.items.length > 1) ?? at(1);
  out.push({
    id: 'notif-collection-idea',
    icon: 'favorite',
    title: `Something for "${forCollection.collection.name}"`,
    body: 'A new arrival sits alongside the pieces you have gathered here.',
    createdAt: now - 1 * DAY,
    read: true,
    target: { kind: 'collection', id: forCollection.collection.id },
  });

  // 4. A new arrival in a category they already collect in.
  const arrival = at(3);
  out.push({
    id: 'notif-new-arrival',
    icon: 'auto_awesome_motion',
    title: 'New arrival',
    body: `${arrival.product.brand} has just landed in ${arrival.product.category}.`,
    createdAt: now - 3 * DAY,
    read: true,
    target: { kind: 'product', name: arrival.product.name },
  });

  return newestFirst(out);
}
