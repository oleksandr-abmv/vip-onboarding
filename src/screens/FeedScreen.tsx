import { useMemo, useState, useRef, useEffect } from 'react';
import { editById, editsFor } from '../data/edits';
import { createPortal } from 'react-dom';
import PRODUCTS, { type Product } from '../data/products';
import { categoryConfigs } from '../data/categoryConfig';
import ProductPage, { type CollectionPicker } from './ProductPage';
import MenuScreen from './MenuScreen';
import ChatScreen, { type AttachmentTarget, type ChatMessage, type ConciergePrompt } from './ChatScreen';
import MemoryScreen from './MemoryScreen';
import BottomDock, { type DockTab } from '../components/BottomDock';
import MIcon from '../components/MIcon';
import ScanIcon from '../components/ScanIcon';
import SearchField from '../components/SearchField';
import CenteredState, { CenteredStateAction } from '../components/CenteredState';
import ProductCard, { MenuRow } from '../components/ProductCard';
import CollectionCard from '../components/CollectionCard';
import ScanScreen from './ScanScreen';
import CollectionPage from './CollectionPage';
import { OUTFITS, DECOR_SETS, outfitMetaLine, type Outfit } from '../data/outfits';
import { AddToCollectionFlow } from '../components/CollectionSheets';
import { SEED_MEMORY_FACTS, relativeTime, type MemoryFact } from '../data/memory';
import {
  newestFirst,
  seedNotifications,
  unreadCount,
  type AppNotification,
} from '../data/notifications';
import {
  collectionMeta,
  collectionOf,
  formatPrice,
  makeCollection,
  priceOf,
  seedCollections,
  type Collection,
} from '../data/collections';
import { screenStyle, bodyStyle, Header, iconButtonStyle } from './screenChrome';
import { RAIL_CARD_W, theme } from '../theme';

const PAGE = 16; // horizontal page margin, matches Figma page/margins token

interface FeedScreenProps {
  gender: string | null;
  selectedInterests: string[];
  /** Onboarding completion, 0-100. Banner hides at 100. */
  onboardingPct: number;
  onboardingComplete: boolean;
  /** Jump back into the onboarding flow where the user left off. */
  onResumeOnboarding: () => void;
  /** Continued as a guest - the Menu tab shows the "create an account" prompt. */
  isGuest?: boolean;
  /** Leave the app back to Welcome (sign out, delete account, guest sign-up). */
  onSignOut?: () => void;
}

type FeedSection = { id: string; name: string; items: Product[] };
// A full-screen detail view on the Home tab: a category, or a titled product
// list (opened from a "View all" on the Discover groups). Saved is its own tab.
type Detail =
  | { kind: 'category'; id: string; name: string }
  | { kind: 'list'; title: string; items: Product[] }
  // Two "View all"s that are not lists of products: the looks themselves, and
  // every category rather than only the ones the user picked as interests.
  | { kind: 'outfits' }
  | { kind: 'decor' }
  | { kind: 'categories' }
  // What the nav bar's bell opens (Figma node 5570-55102). A push over Home
  // rather than an overlay, so it keeps the dock and Back returns to Discover.
  | { kind: 'notifications' };
/** The four stateful dock tabs. Scan is the fourth dock item, but an overlay. */
type Tab = 'home' | 'saved' | 'chat' | 'menu';
// Transient toast shown after saving / removing a product.
type Snack = { message: string; actionLabel: string; onAction: () => void; id: number };

const PRODUCT_BY_NAME: Record<string, Product> = (() => {
  const map: Record<string, Product> = {};
  for (const p of PRODUCTS) map[p.name] = p;
  return map;
})();

// When the user reaches the feed without picking interests (e.g. "Finish later"),
// fall back to whatever categories actually have products so it never renders empty.
function fallbackCategories(): string[] {
  const counts: Record<string, number> = {};
  for (const p of PRODUCTS) counts[p.category] = (counts[p.category] || 0) + 1;
  return Object.keys(counts).filter((id) => counts[id] >= 2).slice(0, 4);
}

/** Discover's looks are not saved `Collection`s, so they need their own meta line
    to read the same as the Saved tab's cards: "N items · $total". */
function outfitMeta(items: Product[]): string {
  return `${items.length} items · ${formatPrice(items.reduce((sum, p) => sum + priceOf(p), 0))}`;
}

function dedupeByName(items: Product[]): Product[] {
  const seen = new Set<string>();
  return items.filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true)));
}

function genderFilter(items: Product[], gender: string | null): Product[] {
  if (gender === 'male' || gender === 'female') {
    const g = items.filter((p) => !p.gender || p.gender === 'unisex' || p.gender === gender);
    if (g.length > 0) return g;
  }
  return items;
}

// Wearable categories (by product.category id) that get styled into "outfits",
// plus a few outfit labels.
const WEARABLE_CATEGORIES = [
  'Fashion and Apparel',
  'Footwear',
  'Handbags and Leather Goods',
  'Accessories',
  'Jewellery',
  'Watches',
];
const OUTFIT_NAMES = ['Weekend Edit', 'Evening Out', 'Off Duty', 'City Break', 'Boardroom'];

// Build coordinated looks: each outfit takes ONE piece from each of up to four
// distinct wearable categories (a top, shoes, a bag, an accessory) so the pieces
// actually go together rather than being four of the same thing.
function buildOutfits(byCat: Record<string, Product[]>): FeedSection[] {
  const slots = WEARABLE_CATEGORIES.filter((c) => (byCat[c]?.length ?? 0) > 0).slice(0, 4);
  if (slots.length < 2) return [];
  const maxOutfits = Math.min(OUTFIT_NAMES.length, Math.max(...slots.map((c) => byCat[c].length)));
  const outfits: FeedSection[] = [];
  for (let i = 0; i < maxOutfits; i++) {
    const items = slots.map((c) => byCat[c][i % byCat[c].length]);
    outfits.push({ id: `outfit-${i}`, name: OUTFIT_NAMES[i], items });
  }
  return outfits;
}

export default function FeedScreen({
  gender,
  selectedInterests,
  onboardingPct,
  onboardingComplete,
  onResumeOnboarding,
  isGuest = false,
  onSignOut,
}: FeedScreenProps) {
  // Which bottom-bar tab is showing. Home carries the feed + its detail views.
  const [tab, setTab] = useState<Tab>('home');
  // The Scan overlay (fourth dock item). An overlay, not a tab, so Close
  // returns to whatever was underneath.
  const [showScan, setShowScan] = useState(false);
  // ── Data Memory ───────────────────────────────────────────────────────────
  // Owned here rather than inside a tab, because the Menu tab edits it and the
  // Chat tab writes to it, and both have to see the same list.
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>(SEED_MEMORY_FACTS);
  // Manage Memory is a full-screen push over the Menu tab.
  const [showMemory, setShowMemory] = useState(false);
  // Chat thread, kept here so switching tabs does not discard the conversation.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatRatings, setChatRatings] = useState<Record<string, 'up' | 'down'>>({});
  // "Ask AI Concierge" hand-off (scan results / collection actions): starts a NEW
  // chat and auto-sends the prompt (with its attachment) when the tab opens.
  const [chatPrompt, setChatPrompt] = useState<ConciergePrompt | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  // **There is no catalog search.** Matching a typed string against tags only
  // ever finds what the catalog is already labelled with, while the questions
  // people have are not ("something for a wedding in Como, under 5k"), so the
  // concierge does that job: the Chat tab, or the prompt field on a page that is
  // already about one thing. Do not put a field back on Discover.
  //
  // The **Saved tab is the one exception**, and it is not the same thing: a
  // filter over the handful of collections the user named themselves, where the
  // name they chose is exactly what they would type. It runs in place.
  const [savedQuery, setSavedQuery] = useState('');
  const [snack, setSnack] = useState<Snack | null>(null);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  // Products the user hit "Do not recommend" on - filtered out of the Discover feed.
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  // ── Collections ───────────────────────────────────────────────────────────
  // User-curated groups of saved pieces. Owned here because Saved, the product
  // page, the scan results, and Discover's look cards all write to them.
  const seededCollections = useMemo(() => seedCollections(gender), [gender]);
  const [collections, setCollections] = useState<Collection[]>(seededCollections);
  // The collection page open over the Saved tab (survives tab switches, so
  // coming back from Chat lands on the same collection).
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);
  /**
   * Which tab the pushes (collection page, product page) sit over. **Back always
   * returns to where you came from**, so a push is recorded against the tab it
   * was opened from rather than being forced onto Saved: open a collection from
   * the concierge's reply and Back lands you back in that conversation, not on
   * the Saved list you were never on.
   *
   * It also keeps a push out of the way when you leave: `askConcierge` parks it
   * under Saved, so the chat is never covered and coming back to Saved still
   * lands on the same collection.
   */
  const [pushHost, setPushHost] = useState<Exclude<Tab, 'menu'>>('saved');
  // The piece the "Add to collection" sheet flow is filing (null = closed).
  const [addTarget, setAddTarget] = useState<Product | null>(null);
  /** The rail's "Add new" card opens the same flow already on its create step. */
  const [addStartOnCreate, setAddStartOnCreate] = useState(false);
  // Collections the concierge has **put together but not filed**. Asked for
  // pieces like something, it assembles them and hands them over as a whole
  // collection; keeping it is the user's call, so the proposal opens the
  // collection page in `preview` and lives here until they save it. Keyed by
  // the same `col-...` id the card and the chat attachment point at.
  const [proposals, setProposals] = useState<Record<string, { name: string; items: string[] }>>({});
  // Which card's "..." menu is open (single source of truth so only one shows).
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const snackTimer = useRef<number | null>(null);
  useEffect(() => () => { if (snackTimer.current) clearTimeout(snackTimer.current); }, []);

  // Always land at the top when entering a detail view or switching tabs. The
  // Home / Saved / detail bodies reuse the same scroller DOM node (same shell
  // position), so without this they inherit each other's scroll position.
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bodyRef.current?.scrollTo(0, 0); }, [detail, tab]);

  // Close any open card menu the moment the user scrolls (vertical body or a
  // horizontal carousel - capture catches nested scrollers), per best practice.
  // Rebound per tab/detail because each branch mounts its own scroller.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const close = () => setOpenMenuId(null);
    el.addEventListener('scroll', close, true);
    return () => el.removeEventListener('scroll', close, true);
  }, [tab, detail]);
  const showSnack = (message: string, actionLabel: string, onAction: () => void) => {
    if (snackTimer.current) clearTimeout(snackTimer.current);
    setSnack({ message, actionLabel, onAction, id: Date.now() });
    snackTimer.current = window.setTimeout(() => setSnack(null), 3600);
  };

  const sections = useMemo<FeedSection[]>(() => {
    const cats = selectedInterests.length > 0 ? selectedInterests : fallbackCategories();
    return cats
      .map((catId) => ({
        id: catId,
        name: categoryConfigs[catId]?.name || catId,
        items: genderFilter(PRODUCTS.filter((p) => p.category === catId), gender),
      }))
      .filter((s) => s.items.length > 0);
  }, [selectedInterests, gender]);

  // Names are the product key throughout the app, but a few pieces share a name
  // across genders (e.g. Triomphe Sunglasses men/women). Prefer the user's
  // gender variant on collisions so collections and saved lists render the
  // piece the user actually picked.
  const productByName = useMemo(() => {
    const map: Record<string, Product> = { ...PRODUCT_BY_NAME };
    if (gender === 'male' || gender === 'female') {
      for (const p of PRODUCTS) if (p.gender === gender) map[p.name] = p;
    }
    return map;
  }, [gender]);

  // ── Notifications ─────────────────────────────────────────────────────────
  // The bell in the Discover nav bar and the list behind it. Seeded from the
  // user's own collections, so every row names a piece they actually filed and
  // opens it. Lives here because opening one pushes the product / collection
  // page, which is FeedScreen's job.
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    seedNotifications(seededCollections, (name) => productByName[name]),
  );
  const unread = unreadCount(notifications);
  const notificationList = useMemo(() => newestFirst(notifications), [notifications]);

  // Hearts manage collection membership app-wide: a heart is filled when the
  // piece sits in ANY collection, and tapping one opens the Add to collection
  // flow (with the piece's current collections pre-checked).
  const isSaved = (name: string) => collections.some((c) => c.items.includes(name));

  // Card "..." menu actions.
  const hideProduct = (name: string) => {
    setHidden((prev) => new Set(prev).add(name));
    showSnack('Removed from recommendations', 'Undo', () => {
      setHidden((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      setSnack(null);
    });
  };
  const moreLikeThis = () => showSnack('We will show more like this', 'Got it', () => setSnack(null));

  // ── Collections ───────────────────────────────────────────────────────────
  const byName = (name: string): Product | undefined => productByName[name];
  // Remounts the collection page when the snackbar's View targets the SAME
  // collection, so the overlays it opened itself (the product page) reset.
  const [collectionEpoch, setCollectionEpoch] = useState(0);

  /**
   * The one-collection rule, applied: `names` leave every collection except
   * `keepId`. Filing a piece (or a whole look) somewhere moves it rather than
   * copying it, so this runs on every write that adds items.
   */
  const exclusive = (list: Collection[], keepId: string, names: string[]): Collection[] => {
    const taken = new Set(names);
    return list.map((c) =>
      c.id === keepId ? c : { ...c, items: c.items.filter((n) => !taken.has(n)) },
    );
  };

  /** Hearting a Discover look files it as a collection of its pieces. */
  const lookCollectionId = (id: string) => `look-${id}`;
  /** An outfit opens the collection page too, under its own deterministic id. */
  const outfitCollectionId = (id: string) => `outfit-col-${id}`;
  const isCollectionSaved = (id: string) => collections.some((c) => c.id === lookCollectionId(id));
  const isOutfitSaved = (id: string) => collections.some((c) => c.id === outfitCollectionId(id));
  /** The outfit card's heart: files the whole look, the same as a look's heart. */
  const toggleOutfitSaved = (outfit: Outfit) => {
    const id = outfitCollectionId(outfit.id);
    const existing = collections.find((c) => c.id === id);
    if (!existing) {
      const items = outfit.items.filter((n) => !!byName(n));
      const col: Collection = { id, name: outfit.name, items, createdAt: Date.now() };
      // Filing a whole look moves its pieces here, the same as filing one.
      setCollections((prev) => exclusive([...prev, col], id, items));
      showSnack('Saved to your collections', 'View', () => {
        setSnack(null);
        goSaved();
      });
    } else {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      showSnack('Removed from your collections', 'Undo', () => {
        setCollections((prev) => (prev.some((c) => c.id === id) ? prev : [...prev, existing]));
        setSnack(null);
      });
    }
  };

  /**
   * The heart on a generated look (the product page's rail). Same contract as
   * `toggleCollection`: filing a look moves its pieces here, and the collection
   * keeps the edit's own id so the page it opens is the one already stored.
   */
  const toggleEditSaved = (editId: string) => {
    const existing = collections.find((c) => c.id === editId);
    if (existing) {
      setCollections((prev) => prev.filter((c) => c.id !== editId));
      showSnack('Removed from your collections', 'Undo', () => {
        setCollections((prev) => (prev.some((c) => c.id === editId) ? prev : [...prev, existing]));
        setSnack(null);
      });
      return;
    }
    const edit = editById(editId, catalogue);
    if (!edit) return;
    const items = edit.items.filter((n) => !!byName(n));
    const col: Collection = { id: editId, name: edit.name, items, createdAt: Date.now() };
    setCollections((prev) => exclusive([...prev, col], editId, items));
    showSnack('Saved to your collections', 'View', () => {
      setSnack(null);
      goSaved();
    });
  };

  const toggleCollection = (look: FeedSection) => {
    const id = lookCollectionId(look.id);
    const existing = collections.find((c) => c.id === id);
    if (!existing) {
      const items = look.items.map((p) => p.name);
      const col: Collection = { id, name: look.name, items, createdAt: Date.now() };
      setCollections((prev) => exclusive([...prev, col], id, items));
      showSnack('Saved to your collections', 'View', () => {
        setSnack(null);
        goSaved();
      });
    } else {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      showSnack('Removed from your collections', 'Undo', () => {
        setCollections((prev) => (prev.some((c) => c.id === id) ? prev : [...prev, existing]));
        setSnack(null);
      });
    }
  };

  const createCollection = (name: string): Collection => {
    const col = makeCollection(name);
    setCollections((prev) => [...prev, col]);
    return col;
  };
  const renameCollection = (id: string, name: string) =>
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  const deleteCollection = (id: string) => {
    const col = collections.find((c) => c.id === id);
    if (!col) return;
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setOpenCollectionId(null);
    showSnack('Collection deleted', 'Undo', () => {
      setCollections((prev) => (prev.some((c) => c.id === id) ? prev : [...prev, col]));
      setSnack(null);
    });
  };
  const removeFromCollection = (id: string, productName: string) => {
    const col = collections.find((c) => c.id === id);
    if (!col || !col.items.includes(productName)) return;
    // Capture the position so Undo puts the piece back where it was rather than
    // at the end of the list.
    const index = col.items.indexOf(productName);
    setCollections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, items: c.items.filter((n) => n !== productName) } : c,
      ),
    );
    showSnack('Removed from collection', 'Undo', () => {
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id !== id || c.items.includes(productName)) return c;
          const items = [...c.items];
          items.splice(Math.min(index, items.length), 0, productName);
          return { ...c, items };
        }),
      );
      setSnack(null);
    });
  };

  /**
   * File a piece. A piece lives in one collection, so this is a move, not a
   * diff: it lands in `collectionId` and leaves wherever it was. `null` takes
   * it out of collections altogether.
   *
   * The heart's sheet and the product page's "Save to collection" rail both
   * end here, so the two can never disagree about where a piece lives.
   */
  const fileProduct = (
    name: string,
    collectionId: string | null,
    /**
     * One tap on the product page's rail files the piece there and then, so
     * the confirmation is a way back out. The heart's sheet is already a
     * deliberate two-step choice, so its confirmation is a way onward instead.
     */
    opts?: { undo?: boolean },
  ) => {
    const before = collections;
    const target = collections.find((c) => c.id === collectionId);
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collectionId) {
          return c.items.includes(name) ? c : { ...c, items: [...c.items, name] };
        }
        return c.items.includes(name) ? { ...c, items: c.items.filter((n) => n !== name) } : c;
      }),
    );
    if (collectionId && opts?.undo) {
      showSnack(target ? `Saved to ${target.name}` : 'Saved to your collections', 'Undo', () => {
        setCollections(before);
        setSnack(null);
      });
    } else if (collectionId) {
      showSnack(target ? `Added to ${target.name}` : 'Added to your collections', 'View', () => {
        setSnack(null);
        setShowScan(false);
        setOpenProduct(null);
        goSaved();
        pushCollection(collectionId, 'saved');
        // Remount the collection page even when it is already showing this
        // collection, so overlays it opened itself (product page, sheets) clear.
        setCollectionEpoch((e) => e + 1);
      });
    } else {
      showSnack('Removed from your collections', 'Undo', () => {
        setCollections(before);
        setSnack(null);
      });
    }
  };

  const closeAddFlow = () => {
    setAddTarget(null);
    setAddStartOnCreate(false);
  };

  /** The heart's sheet flow finished. */
  const finishAddFlow = (collectionId: string | null) => {
    if (!addTarget) return;
    fileProduct(addTarget.name, collectionId);
    closeAddFlow();
  };

  const goHome = () => {
    setTab('home');
    setDetail(null);
    setShowMemory(false);
  };
  /** Jump to the Saved tab from a snackbar / dock tap, closing any push. */
  const goSaved = () => {
    setTab('saved');
    setDetail(null);
    setShowMemory(false);
    setOpenCollectionId(null);
  };

  /**
   * Open a push over the tab we are on, so its Back returns there. The Menu tab
   * has no list of its own to come back to, so pushes opened from it park on
   * Saved. Pass `host` when the tab is being switched in the same tick, since
   * `tab` is still the old one at that point.
   */
  const hostFor = (host?: Exclude<Tab, 'menu'>) => host ?? (tab === 'menu' ? 'saved' : tab);
  const pushCollection = (id: string, host?: Exclude<Tab, 'menu'>) => {
    const h = hostFor(host);
    setPushHost(h);
    // Belt and braces: a push only renders over its host, so land on it. Almost
    // always a no-op (the host IS the tab we are on); it matters when the host
    // was forced, as it is from Menu, which has no list to come back to.
    setTab(h);
    setOpenCollectionId(id);
  };
  const pushProduct = (product: Product, host?: Exclude<Tab, 'menu'>) => {
    const h = hostFor(host);
    setPushHost(h);
    setTab(h);
    setOpenProduct(product);
  };

  /**
   * A notification opens what it names, over the list rather than instead of it,
   * so Back returns to the other notifications. A piece that has since left the
   * catalog, or a collection since deleted, stays inert - the same rule the
   * chat's attachment cards follow.
   */
  const openNotification = (n: AppNotification) => {
    const target = n.target;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (target.kind === 'product') {
      const product = byName(target.name);
      if (product) pushProduct(product, 'home');
      return;
    }
    if (collections.some((c) => c.id === target.id)) pushCollection(target.id, 'home');
  };

  // **Leaving the list is what marks it read**, not opening it: the dots have to
  // stay put while the user is looking at them, or the thing they came to see
  // disappears as they arrive.
  const readingNotifications = detail?.kind === 'notifications';
  useEffect(() => {
    if (!readingNotifications) return;
    return () =>
      setNotifications((prev) =>
        prev.some((n) => !n.read) ? prev.map((n) => (n.read ? n : { ...n, read: true })) : prev,
      );
  }, [readingNotifications]);

  // ── Scan + chat hand-off ──────────────────────────────────────────────────
  // The catalog the scan can "capture": real imagery, user's gender. Deduped by
  // name because names are the selection key everywhere (a few pieces exist in
  // both gender variants under one name).
  const catalogue = useMemo(
    () => dedupeByName(genderFilter(PRODUCTS.filter((p) => p.image !== '/vip-logo.svg'), gender)),
    [gender],
  );
  /** Saved lists newest first, so the collection just saved leads the list. */
  const collectionsNewestFirst = useMemo(
    () => [...collections].sort((a, b) => b.createdAt - a.createdAt),
    [collections],
  );

  /**
   * The product page's "Save to collection" rail, wherever the page was opened
   * from. The rail is a radio, so tapping the collection the piece already sits
   * in takes it back out - the same as clearing the selected row in the sheet.
   */
  const collectionPicker: CollectionPicker = {
    collections: collectionsNewestFirst,
    byName,
    onPick: (product, collectionId) => {
      const current = collectionOf(collections, product.name)?.id;
      fileProduct(product.name, current === collectionId ? null : collectionId, { undo: true });
    },
    onCreate: (product) => {
      setAddStartOnCreate(true);
      setAddTarget(product);
    },
    // The coordinated looks that already contain this piece. Same objects
    // Discover's Mixed Collections row renders, so the product page's cards and
    // the feed's cards open the same page.
    // Looks built around the piece rather than found: the catalogue only holds
    // a handful of hand-made ones, so most pieces would show an empty rail.
    // The lens is chosen by category upstream (see `src/data/edits.ts`).
    looksWith: (product) =>
      editsFor(product, catalogue).map((e) => {
        // `e.products`, not a lookup by name: a few pieces share a name across
        // genders, and resolving by name can swap in the other one.
        const items = e.products;
        return {
          id: e.id,
          name: e.name,
          images: items.map((p) => p.image),
          meta: outfitMeta(items),
          saved: collections.some((c) => c.id === e.id),
        };
      }),
    onOpenLook: (editId) => {
      setOpenProduct(null);
      pushCollection(editId);
    },
    onToggleLookSaved: (editId) => toggleEditSaved(editId),
    renderLookMenu: () => (
      <OverflowMenu
        onMoreLikeThis={moreLikeThis}
        onHide={() => showSnack('Noted, fewer like this', 'Got it', () => setSnack(null))}
      />
    ),
  };
  // The Saved field filters in place: an empty field shows the whole list. A
  // collection is a name and its pieces, so the name is all there is to match.
  const savedFiltered = useMemo(() => {
    const q = savedQuery.trim().toLowerCase();
    if (!q) return collectionsNewestFirst;
    return collectionsNewestFirst.filter((c) => c.name.toLowerCase().includes(q));
  }, [collectionsNewestFirst, savedQuery]);

  // The flat-lays are shot as menswear, so the section stays out of a women's
  // feed rather than offering a look that cannot be worn. Everyone else sees it.
  const feedOutfits = useMemo(() => (gender === 'female' ? [] : OUTFITS), [gender]);
  // Decor is unisex, so unlike the outfits it is never filtered out.
  const feedDecor = DECOR_SETS;
  /** Both styled rows, for resolving an id back to its set. */
  const allStyledSets = useMemo(() => [...OUTFITS, ...DECOR_SETS], []);

  /**
   * The concierge actually doing it: file two more pieces into a collection and
   * hand back what changed, so the chat can answer "update this collection"
   * with the collection's **new state** instead of a sentence promising to.
   *
   * Picks from the same categories the collection already leans on before
   * reaching wider - a wall of paintings should grow by paintings - and only
   * from pieces no collection holds, so the one-piece-one-collection rule holds
   * without having to move anything out from under the user. `null` when the
   * catalogue has nothing left to give.
   */
  const conciergeAddPieces = (id: string) => {
    const col = collections.find((c) => c.id === id);
    if (!col) return null;
    const filed = new Set(collections.flatMap((c) => c.items));
    const kinds = new Set(
      col.items.map((n) => byName(n)?.category).filter(Boolean) as string[],
    );
    const free = catalogue.filter((p) => !filed.has(p.name));
    const picks = [
      ...free.filter((p) => kinds.has(p.category)),
      ...free.filter((p) => !kinds.has(p.category)),
    ].slice(0, 2);
    if (picks.length === 0) return null;

    const next: Collection = { ...col, items: [...col.items, ...picks.map((p) => p.name)] };
    setCollections((prev) => prev.map((c) => (c.id === id ? next : c)));
    return {
      added: picks.map((p) => `the ${p.brand} ${p.name}`),
      attachment: {
        title: next.name,
        subtitle: collectionMeta(next, byName),
        images: (next.items.map(byName).filter(Boolean) as Product[]).slice(0, 4).map((p) => p.image),
        target: { kind: 'collection' as const, id },
      },
    };
  };

  /**
   * "Find me pieces like this one." The concierge picks a handful and hands them
   * over **as a collection**, not as a list: a set of pieces chosen to go
   * together is a collection already, and making the user file five hearts one
   * at a time to end up with the same thing would be busywork.
   *
   * It is a **proposal**, not a save. Nothing is written to `collections` here -
   * the user opens it, looks, and keeps it or does not. `seed` is the piece they
   * asked to match; without one it picks across the catalogue.
   */
  const conciergeProposeCollection = (seed?: string, text?: string) => {
    // The piece can arrive two ways and both have to work: attached (asked from
    // the product page) or simply **named in the sentence** ("pieces like the
    // Hermès Kelly Bag"). Longest match wins, so "Kelly Bag" beats "Bag".
    const named = text
      ? catalogue
          .filter((p) => text.toLowerCase().includes(p.name.toLowerCase()))
          .sort((a, b) => b.name.length - a.name.length)[0]
      : undefined;
    const anchor = (seed ? byName(seed) : undefined) ?? named;
    const filed = new Set(collections.flatMap((c) => c.items));
    const pool = catalogue.filter((p) => p.name !== anchor?.name && !filed.has(p.name));
    // Same category first, so "like this bag" comes back as bags before it
    // reaches for anything else.
    const picks = anchor
      ? [
          ...pool.filter((p) => p.category === anchor.category),
          ...pool.filter((p) => p.category !== anchor.category),
        ].slice(0, 4)
      : pool.slice(0, 4);
    if (picks.length === 0) return null;

    const name = anchor ? `Like the ${anchor.name}` : 'Picked for you';
    const id = `col-proposal-${Date.now()}-${Object.keys(proposals).length + 1}`;
    const items = picks.map((p) => p.name);
    setProposals((prev) => ({ ...prev, [id]: { name, items } }));
    return {
      name,
      anchor: anchor ? `${anchor.brand} ${anchor.name}` : null,
      count: picks.length,
      attachment: {
        title: name,
        subtitle: collectionMeta({ id, name, items, createdAt: 0 }, byName),
        images: picks.map((p) => p.image),
        target: { kind: 'collection' as const, id },
      },
    };
  };

  /** Starts a NEW concierge chat with the prompt's attachment and sends it. */
  const askConcierge = (prompt: ConciergePrompt, opts?: { continueThread?: boolean }) => {
    setShowScan(false);
    setDetail(null);
    setShowMemory(false);
    // Reaching the concierge from somewhere else starts a NEW chat. The one
    // exception is a page you opened FROM a conversation: asking about the
    // collection you just tapped is the next turn of that conversation, and
    // wiping the thread to ask it would throw away the context you came with.
    if (!opts?.continueThread) {
      setChatMessages([]);
      setChatRatings({});
    }
    setChatPrompt(prompt);
    // Park whatever push we came from under Saved before switching. Two jobs: a
    // page opened FROM the chat must not cover the chat it just handed off to,
    // and a collection page left behind stays open so coming back to Saved lands
    // on the same collection rather than on the bare list.
    setPushHost('saved');
    setTab('chat');
  };
  /**
   * An attachment card in the chat, tapped. The chat carries only a descriptor,
   * so resolving it back to a screen is this component's job. Both open **over
   * the chat**, so Back returns to the conversation they were opened from
   * rather than dumping the user on a tab they were never on. A collection that has
   * since been deleted quietly does nothing rather than opening an empty page.
   */
  const openAttachment = (target: AttachmentTarget) => {
    if (target.kind === 'collection') {
      // Saved, or still just proposed - both open the same page, the proposal in
      // `preview`. A collection since deleted opens nothing, and the card that
      // named it stays inert rather than bouncing the user somewhere random.
      const exists =
        collections.some((c) => c.id === target.id) ||
        !!proposals[target.id] ||
        !!outfits.find((o) => lookCollectionId(o.id) === target.id) ||
        !!allStyledSets.find((o) => outfitCollectionId(o.id) === target.id);
      if (!exists) return;
      setDetail(null);
      setShowMemory(false);
      setOpenProduct(null);
      pushCollection(target.id);
      setCollectionEpoch((e) => e + 1);
      return;
    }
    const product = byName(target.name);
    if (!product) return;
    setShowMemory(false);
    pushProduct(product);
  };

  /** Toast. `action` overrides the default "Got it" dismiss. */
  const notice = (message: string, action?: { label: string; onAction: () => void }) =>
    action
      ? showSnack(message, action.label, () => {
          setSnack(null);
          action.onAction();
        })
      : showSnack(message, 'Got it', () => setSnack(null));

  // Memory writes, shared by the Chat tab and Manage Memory. Saying the same
  // thing twice should refresh the fact, not stack a duplicate onto the list.
  const addFact = (fact: MemoryFact) =>
    setMemoryFacts((prev) => {
      const key = fact.text.trim().toLowerCase();
      const existing = prev.findIndex((f) => f.text.trim().toLowerCase() === key);
      if (existing === -1) return [...prev, fact];
      const next = [...prev];
      next[existing] = { ...next[existing], createdAt: fact.createdAt };
      return next;
    });
  const forgetFacts = (ids: string[]) =>
    setMemoryFacts((prev) => prev.filter((f) => !ids.includes(f.id)));

  // Manage Memory is a push over whichever tab opened it (Settings > Data Memory, or
  // the chat's "Memory updated" chip). Rendering it in both branches means Back
  // returns to where the user was rather than dumping them on the Menu tab.
  const memoryScreen = showMemory && (
    <MemoryScreen
      facts={memoryFacts}
      onAdd={addFact}
      onForget={forgetFacts}
      onClearAll={() => setMemoryFacts([])}
      onRefresh={() => setMemoryFacts((prev) => prev.map((f) => ({ ...f, createdAt: Date.now() })))}
      onClose={() => setShowMemory(false)}
      onNotice={notice}
    />
  );

  /** The five dock items (Figma bottomBar): Home · Saved · Chat · Scan · Menu.
      Scan opens the camera overlay and is never marked active. */
  const dockTabs = (active: Tab): DockTab[] => [
    { icon: 'home', label: 'Home', active: active === 'home', onClick: goHome },
    {
      icon: 'favorite',
      label: 'Saved',
      active: active === 'saved',
      onClick: () => {
        // Tapping Saved while already on it pops the open collection.
        if (tab === 'saved') setOpenCollectionId(null);
        setTab('saved');
      },
    },
    { icon: 'chat_bubble', label: 'Chat', active: active === 'chat', onClick: () => setTab('chat') },
    {
      icon: 'qr_scanner',
      label: 'Scan',
      // The design's own vector, not a Material glyph. See ScanIcon.tsx.
      renderIcon: (color) => <ScanIcon size={24} color={color} />,
      onClick: () => setShowScan(true),
    },
    { icon: 'menu', label: 'Menu', active: active === 'menu', onClick: () => setTab('menu') },
  ];

  // ── Branch bodies ─────────────────────────────────────────────────────────
  // One shell at the end renders the shared overlays (product page, collection
  // page, scan, sheets, snackbar) exactly once, above whichever body shows.
  let body: React.ReactNode;

  if (tab === 'chat') {
    body = (
      <ChatScreen
        memoryEnabled={memoryEnabled}
        onMemoryEnabledChange={setMemoryEnabled}
        facts={memoryFacts}
        messages={chatMessages}
        onMessagesChange={setChatMessages}
        ratings={chatRatings}
        onRatingsChange={setChatRatings}
        onAddFact={addFact}
        onManageMemory={() => setShowMemory(true)}
        onNotice={notice}
        tabs={dockTabs('chat')}
        initialPrompt={chatPrompt}
        onPromptConsumed={() => setChatPrompt(null)}
        onOpenAttachment={openAttachment}
        onUpdateCollection={conciergeAddPieces}
        onProposeCollection={conciergeProposeCollection}
      />
    );
  } else if (tab === 'menu') {
    body = (
      <MenuScreen
        isGuest={isGuest}
        onCreateAccount={() => onSignOut?.()}
        onSignOut={() => onSignOut?.()}
        onDeleteAccount={() => onSignOut?.()}
        onNotice={notice}
        memoryEnabled={memoryEnabled}
        onMemoryEnabledChange={setMemoryEnabled}
        onManageMemory={() => setShowMemory(true)}
        onScan={() => setShowScan(true)}
        bottomBar={<BottomDock tabs={dockTabs('menu')} />}
      />
    );
  } else if (tab === 'saved') {
    // ── Saved tab: a field to narrow the list, and the list. No `+`, since
    // collections are created while filing a piece ("Add to collection" >
    // Create) and an empty collection is not a thing anyone wants. ───────────
    body = (
      <div style={screenStyle}>
        <Header title="Saved collections" height={56} />
        <div
          ref={bodyRef}
          style={{
            ...bodyStyle,
            // An empty list has nothing to scroll, so the body becomes a column
            // and the state takes the leftover height - centred in what is left
            // rather than hanging under the field.
            ...(savedFiltered.length === 0 ? { display: 'flex', flexDirection: 'column' } : null),
          }}
        >
          {/* The app's only search field, and it filters in place rather than
              pushing a screen: this list is short, already scoped and already
              on screen, so a full-screen modal would cost a screen to say less.
              It is not catalog search - see the note on `savedQuery`. */}
          <div style={{ flexShrink: 0, padding: `${PAGE}px ${PAGE}px 4px` }}>
            <SearchField
              value={savedQuery}
              onChange={setSavedQuery}
              placeholder="Search collections"
            />
          </div>
          {savedFiltered.length === 0 ? (
            // Two different nothings: a query that matched none of the names the
            // user wrote, and no collections at all. Only the first has a way
            // out that lives on this screen, so only it carries an action.
            savedQuery.trim() !== '' ? (
              <CenteredState
                title="Nothing found"
                hint="Check the spelling or try a different name."
                icon="search"
                action={<CenteredStateAction label="Clear Search" onClick={() => setSavedQuery('')} />}
              />
            ) : (
              <CenteredState
                title="Nothing saved yet"
                hint="Heart a piece anywhere in the app and file it into a collection."
                icon="favorite"
              />
            )
          ) : (
            <div style={savedColStyle}>
              {savedFiltered.map((c) => (
                <CollectionCard
                  key={c.id}
                  name={c.name}
                  images={(c.items.map(byName).filter(Boolean) as Product[]).map((p) => p.image)}
                  meta={collectionMeta(c, byName)}
                  width="100%"
                  onOpen={() => pushCollection(c.id)}
                />
              ))}
            </div>
          )}
        </div>
        <BottomDock tabs={dockTabs('saved')} />
      </div>
    );
  } else if (detail && detail.kind === 'outfits') {
    // Every look, two up. Same card as the rail so a look reads the same here.
    body = (
      <div style={screenStyle}>
        <Header title="Tailored Outfits" onBack={() => setDetail(null)} />
        <div ref={bodyRef} style={bodyStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: `12px ${PAGE}px ${PAGE}px` }}>
            {feedOutfits.map((o) => (
              <OutfitCard
                key={o.id}
                outfit={o}
                meta={outfitMetaLine(o, byName)}
                width="100%"
                onOpen={() => pushCollection(outfitCollectionId(o.id))}
                saved={isOutfitSaved(o.id)}
                onToggleSave={() => toggleOutfitSaved(o)}
              />
            ))}
          </div>
        </div>
        <BottomDock tabs={dockTabs('home')} />
      </div>
    );
  } else if (detail && detail.kind === 'decor') {
    body = (
      <div style={screenStyle}>
        <Header title="Furniture & Decor Ideas" onBack={() => setDetail(null)} />
        <div ref={bodyRef} style={bodyStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: `12px ${PAGE}px ${PAGE}px` }}>
            {feedDecor.map((o) => (
              <OutfitCard
                key={o.id}
                outfit={o}
                meta={outfitMetaLine(o, byName)}
                width="100%"
                onOpen={() => pushCollection(outfitCollectionId(o.id))}
                saved={isOutfitSaved(o.id)}
                onToggleSave={() => toggleOutfitSaved(o)}
              />
            ))}
          </div>
        </div>
        <BottomDock tabs={dockTabs('home')} />
      </div>
    );
  } else if (detail && detail.kind === 'categories') {
    // Every category in the catalog, not just the interests the feed groups by,
    // which is the only reason to tap "View all" on a list you can already see.
    const allCategories = (() => {
      const byCat: Record<string, Product[]> = {};
      for (const p of genderFilter(PRODUCTS, gender)) {
        if (p.image === '/vip-logo.svg' || hidden.has(p.name)) continue;
        (byCat[p.category] ||= []).push(p);
      }
      return Object.entries(byCat)
        .map(([id, items]) => ({ id, name: categoryConfigs[id]?.name ?? id, items }))
        .sort((a, b) => a.name.localeCompare(b.name));
    })();
    body = (
      <div style={screenStyle}>
        <Header title="Categories" onBack={() => setDetail(null)} />
        <div ref={bodyRef} style={bodyStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: `12px ${PAGE}px ${PAGE}px` }}>
            {allCategories.map((c) => (
              <CategoryRow
                key={c.id}
                name={c.name}
                count={c.items.length}
                cover={c.items[0].image}
                onOpen={() => setDetail({ kind: 'list', title: c.name, items: c.items })}
              />
            ))}
          </div>
        </div>
        <BottomDock tabs={dockTabs('home')} />
      </div>
    );
  } else if (detail && detail.kind === 'notifications') {
    // ── Notifications (the nav bar's bell) ──────────────────────────────────
    // Newest first, and every row opens the piece or collection it names.
    body = (
      <div style={screenStyle}>
        <Header title="Notifications" onBack={() => setDetail(null)} />
        <div
          ref={bodyRef}
          style={{
            ...bodyStyle,
            ...(notificationList.length === 0 ? { display: 'flex', flexDirection: 'column' } : null),
          }}
        >
          {notificationList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: `12px ${PAGE}px ${PAGE}px` }}>
              {notificationList.map((n) => (
                <NotificationRow key={n.id} notification={n} onOpen={() => openNotification(n)} />
              ))}
            </div>
          ) : (
            <CenteredState
              icon="notifications"
              title="Nothing new"
              hint="Price drops and arrivals on the pieces you save will land here."
            />
          )}
        </div>
        <BottomDock tabs={dockTabs('home')} />
      </div>
    );
  } else if (detail) {
    // ── "See all" detail view (per-category / titled list) ──────────────────
    const detailItems =
      detail.kind === 'list'
        ? detail.items
        : genderFilter(PRODUCTS.filter((p) => p.category === detail.id), gender);
    const detailTitle = detail.kind === 'list' ? detail.title : `All ${detail.name}`;
    // Category "See all" is a single-column list; list views use a 2-col grid.
    const gridStyle: React.CSSProperties =
      detail.kind === 'category'
        ? { display: 'flex', flexDirection: 'column', gap: 16, padding: PAGE }
        : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: `12px ${PAGE}px ${PAGE}px` };
    body = (
      <div style={screenStyle}>
        <Header title={detailTitle} onBack={() => setDetail(null)} />
        <div ref={bodyRef} style={{ ...bodyStyle }}>
          {detailItems.length > 0 ? (
            <div style={gridStyle}>
              {detailItems.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  saved={isSaved(product.name)}
                  onToggleSave={() => setAddTarget(product)}
                  onOpen={() => pushProduct(product)}
                  width="100%"
                />
              ))}
            </div>
          ) : (
            <EmptyNote text="Nothing here yet." />
          )}
        </div>
        <BottomDock tabs={dockTabs('home')} />
      </div>
    );
  }

  // Products in a stable shuffle so categories spread evenly across every group
  // (deterministic, so the feed doesn't reshuffle on re-render).
  const feedItems: Product[] = (() => {
    // Hide products without real imagery (VIP-logo placeholder) and anything the
    // user marked "Do not recommend".
    const a = sections
      .flatMap((s) => s.items)
      .filter((p) => p.image !== '/vip-logo.svg' && !hidden.has(p.name));
    let s = 0x9e3779b9;
    const rand = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 0x100000000);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  })();
  // Discover groups: a daily 1-column pick stack, a trending carousel, and
  // Collections (each interest category as a themed group).
  const topPicks = feedItems.slice(0, 10);
  const trending = feedItems.slice(10, 20);
  const categoryGroups = sections
    .map((s) => ({ ...s, items: s.items.filter((p) => p.image !== '/vip-logo.svg' && !hidden.has(p.name)) }))
    .filter((s) => s.items.length > 0);
  // Coordinated looks, built across the whole catalog (one piece per category).
  const outfits = (() => {
    const byCat: Record<string, Product[]> = {};
    for (const p of genderFilter(PRODUCTS, gender)) {
      if (p.image === '/vip-logo.svg' || hidden.has(p.name)) continue;
      if (!WEARABLE_CATEGORIES.includes(p.category)) continue;
      (byCat[p.category] ||= []).push(p);
    }
    return buildOutfits(byCat);
  })();

  // Default branch: the Discover feed.
  if (body === undefined) body = (
    <div style={screenStyle}>
      {/* Centered "Discover" title (top-level tab - no back button), with the
          bell in the trailing slot (Figma node 5570-55102): the same bordered
          `buttonIcon` circle every other nav bar uses, carrying a dot while
          there is something unread. */}
      <Header
        title="Discover"
        right={
          <button
            onClick={() => setDetail({ kind: 'notifications' })}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            style={{ ...iconButtonStyle, position: 'relative' }}
          >
            <MIcon name="notifications" size={24} color="#fff" />
            {unread > 0 && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: theme.radii.button,
                  background: theme.colors.unread,
                  // A ring of the button's own fill, so the dot reads as sitting
                  // on top of the bell rather than merging with the glyph.
                  boxShadow: '0 0 0 2px #101111',
                }}
              />
            )}
          </button>
        }
      />

      <div ref={bodyRef} style={bodyStyle}>
        {/* Onboarding-progress banner - permanent until onboarding hits 100%, and
            pinned at the very top of the feed, above the first rail. */}
        {!onboardingComplete && (
          <div style={{ padding: `${PAGE}px ${PAGE}px 8px` }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #282828',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <ProgressPie pct={onboardingPct} />
                <span style={{ fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: '22px' }}>
                  Complete onboarding ({onboardingPct}%)
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#999', lineHeight: '20px', textAlign: 'center', margin: 0 }}>
                Personalize what you see on the feed and what concierge knows about you.
              </p>
              <button
                onClick={onResumeOnboarding}
                style={{
                  width: '100%',
                  height: 44,
                  background: '#f6f6f6',
                  color: '#121212',
                  border: 'none',
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* No search field. Discover is a feed you browse and the concierge is
            how you look something up, so the page goes straight from the banner
            into the rails; the Chat and Scan dock items are the two ways off it.

            The field used to supply the feed's top margin, so the spacer takes
            that over: a full page margin under the header when it is the first
            thing on the page, and only 8 when the banner is already above it. */}
        <div style={{ height: onboardingComplete ? PAGE : 8 }} />

        {sections.length > 0 ? (
          <>
            {/* Top picks - horizontal carousel (same treatment as Trending) */}
            {topPicks.length > 0 && (
              <Section
                title="Top picks for you"
                onViewAll={() => setDetail({ kind: 'list', title: 'Top picks for you', items: topPicks })}
              >
                {topPicks.map((product) => (
                  <ProductCard
                    key={product.name}
                    product={product}
                    saved={isSaved(product.name)}
                    onToggleSave={() => setAddTarget(product)}
                    onOpen={() => pushProduct(product)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => hideProduct(product.name)}
                    menuOpen={openMenuId === product.name}
                    onToggleMenu={() =>
                      setOpenMenuId((id) => (id === product.name ? null : product.name))
                    }
                    onCloseMenu={() => setOpenMenuId(null)}
                    width={RAIL_CARD_W}
                  />
                ))}
              </Section>
            )}

            {/* Trending - horizontal carousel (keeps the "..." menu) */}
            {trending.length > 0 && (
              <Section
                title="Trending Pieces"
                onViewAll={() => setDetail({ kind: 'list', title: 'Trending Pieces', items: trending })}
              >
                {trending.map((product) => (
                  <ProductCard
                    key={product.name}
                    product={product}
                    saved={isSaved(product.name)}
                    onToggleSave={() => setAddTarget(product)}
                    onOpen={() => pushProduct(product)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => hideProduct(product.name)}
                    menuOpen={openMenuId === product.name}
                    onToggleMenu={() =>
                      setOpenMenuId((id) => (id === product.name ? null : product.name))
                    }
                    onCloseMenu={() => setOpenMenuId(null)}
                    width={RAIL_CARD_W}
                  />
                ))}
              </Section>
            )}

            {/* Collections - coordinated looks. A horizontal carousel, but the
                cards read exactly like the Saved tab's: same cover, same
                "N items · $total" meta rather than a bare "N pieces". */}
            {outfits.length > 0 && (
              <Section
                title="Mixed Collections"
                onViewAll={() =>
                  setDetail({
                    kind: 'list',
                    title: 'Mixed Collections',
                    items: dedupeByName(outfits.flatMap((o) => o.items)),
                  })
                }
              >
                {outfits.map((o) => (
                  <CollectionCard
                    key={o.id}
                    name={o.name}
                    images={o.items.map((p) => p.image)}
                    meta={outfitMeta(o.items)}
                    width={RAIL_CARD_W}
                    // Opens the collection page, previewed until it is hearted.
                    onOpen={() => pushCollection(lookCollectionId(o.id))}
                    saved={isCollectionSaved(o.id)}
                    onToggleSave={() => toggleCollection(o)}
                    menu={
                      <OverflowMenu
                        onMoreLikeThis={moreLikeThis}
                        onHide={() => showSnack('Noted, fewer like this', 'Got it', () => setSnack(null))}
                      />
                    }
                  />
                ))}
              </Section>
            )}

            {/* Outfits: looks that have already been styled, so the card is the
                finished flat-lay rather than a cover assembled from contents.
                Sits after Collections deliberately - Collections is what the
                user could gather, Outfits is what somebody gathered for them.
                Menswear imagery, so it stays out of a women's feed rather than
                offering a look that cannot be worn. */}
            {feedOutfits.length > 0 && (
              <Section title="Tailored Outfits" onViewAll={() => setDetail({ kind: 'outfits' })}>
                {feedOutfits.map((o) => (
                  <OutfitCard
                    key={o.id}
                    outfit={o}
                    meta={outfitMetaLine(o, byName)}
                    onOpen={() => pushCollection(outfitCollectionId(o.id))}
                    saved={isOutfitSaved(o.id)}
                    onToggleSave={() => toggleOutfitSaved(o)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => showSnack('Noted, fewer like this', 'Got it', () => setSnack(null))}
                  />
                ))}
              </Section>
            )}

            {/* Furniture & Decor Ideas: the same styled-set card, for rooms
                rather than people. Unisex, so it has no gender branch. */}
            {feedDecor.length > 0 && (
              <Section
                title="Furniture & Decor Ideas"
                onViewAll={() => setDetail({ kind: 'decor' })}
              >
                {feedDecor.map((o) => (
                  <OutfitCard
                    key={o.id}
                    outfit={o}
                    meta={outfitMetaLine(o, byName)}
                    onOpen={() => pushCollection(outfitCollectionId(o.id))}
                    saved={isOutfitSaved(o.id)}
                    onToggleSave={() => toggleOutfitSaved(o)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => showSnack('Noted, fewer like this', 'Got it', () => setSnack(null))}
                  />
                ))}
              </Section>
            )}

            {/* Categories - full-width stack when few, else a 2-row horizontal scroll */}
            {categoryGroups.length > 0 && (
              <section style={{ paddingTop: 8, paddingBottom: 8 }}>
                <SectionHeader
                  title="Categories"
                  onViewAll={() => setDetail({ kind: 'categories' })}
                />
                {categoryGroups.length <= 2 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: `0 ${PAGE}px` }}>
                    {categoryGroups.map((c) => (
                      <CategoryRow
                        key={c.id}
                        name={c.name}
                        count={c.items.length}
                        cover={c.items[0].image}
                        width="100%"
                        onOpen={() => setDetail({ kind: 'list', title: c.name, items: c.items })}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridAutoFlow: 'column',
                        gridTemplateRows: 'auto auto',
                        gridAutoColumns: 'max-content',
                        gap: 10,
                        // Padding on the grid (not the scroller), and the grid
                        // sized to its content, so the right inset is part of
                        // the scrollable width and survives at scroll end.
                        padding: `0 ${PAGE}px`,
                        width: 'max-content',
                      }}
                    >
                      {categoryGroups.map((c) => (
                        <CategoryRow
                          key={c.id}
                          name={c.name}
                          count={c.items.length}
                          cover={c.items[0].image}
                          onOpen={() => setDetail({ kind: 'list', title: c.name, items: c.items })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <EmptyNote text="Your feed is being tailored. Complete onboarding to start seeing pieces picked for you." />
        )}
      </div>

      <BottomDock tabs={dockTabs('home')} />
    </div>
  );

  // ── Shell: the active body + every shared overlay, rendered once ──────────
  // A Discover look opens the same collection page as a saved one. Until it is
  // hearted there is no stored `Collection`, so stand one up from the look itself
  // and mark the page `preview`: same layout, but the primary action saves it
  // rather than adding pieces to something that does not exist yet.
  const savedOpenCollection = openCollectionId
    ? (collections.find((c) => c.id === openCollectionId) ?? null)
    : null;
  const previewCollection = useMemo(() => {
    if (!openCollectionId || savedOpenCollection) return null;
    const look = outfits.find((o) => lookCollectionId(o.id) === openCollectionId);
    if (look) {
      return {
        id: openCollectionId,
        name: look.name,
        items: look.items.map((p) => p.name),
        createdAt: 0,
      } satisfies Collection;
    }
    // An Outfit opens the very same page a collection does. Only its card on
    // Discover looks different (the styled flat-lay); once you are inside, a
    // look is a look and the page has no reason to be a second design.
    const outfit = allStyledSets.find((o) => outfitCollectionId(o.id) === openCollectionId);
    if (outfit) {
      return {
        id: openCollectionId,
        name: outfit.name,
        items: outfit.items.filter((n) => !!byName(n)),
        createdAt: 0,
      } satisfies Collection;
    }
    // A look generated around a piece (the product page's rail). Rebuilt from
    // its id rather than stored, which is why `editById` has to be pure.
    const edit = editById(openCollectionId, catalogue);
    if (edit) {
      return {
        id: openCollectionId,
        name: edit.name,
        items: edit.items.filter((n) => !!byName(n)),
        createdAt: 0,
      } satisfies Collection;
    }
    // Something the concierge put together and the user has not kept yet. Same
    // page, same preview treatment: it is a look until they say otherwise.
    const proposed = proposals[openCollectionId];
    if (proposed) {
      return {
        id: openCollectionId,
        name: proposed.name,
        items: proposed.items,
        createdAt: 0,
      } satisfies Collection;
    }
    return null;
  }, [openCollectionId, savedOpenCollection, outfits, byName, allStyledSets, proposals]);
  const openCollection = savedOpenCollection ?? previewCollection;
  const isPreviewCollection = !savedOpenCollection && !!previewCollection;
  // Snackbar geometry: above whatever occupies the bottom of the screen. The
  // chat dock carries a prompt field (~58px taller than the tabs-only dock);
  // Manage Memory's is the prompt-only one; the product page has an action bar.
  const snackBottom =
    tab === 'chat'
      ? showMemory
        ? `calc(74px + env(safe-area-inset-bottom, 0px))`
        : `calc(129px + env(safe-area-inset-bottom, 0px))`
      : showMemory
        ? `calc(74px + env(safe-area-inset-bottom, 0px))`
        : openProduct
          ? `calc(80px + env(safe-area-inset-bottom, 0px))`
          : // The collection page carries the concierge prompt field, the same
            // prompt-only dock Manage Memory uses.
            openCollection
            ? `calc(74px + env(safe-area-inset-bottom, 0px))`
            : undefined;
  // Above the pushes (Manage Memory / collection page, z 200), the scan overlay
  // (z 220) and the sheets (z 301) when the toast fires over one of those.
  const snackZ =
    showScan || addTarget || tab === 'chat' ? 310 : showMemory || openCollection ? 250 : undefined;

  return (
    <>
      {body}

      {/* Collection page: a push over the Saved tab (kept while visiting Chat,
          so "Ask AI Concierge" and back lands on the same collection). */}
      {tab === pushHost && openCollection && (
        <CollectionPage
          // Keyed by id + epoch: switching collections OR following the add
          // flow's View resets the page's local overlays (the product page)
          // instead of reusing them across collections.
          key={`${openCollection.id}:${collectionEpoch}`}
          collection={openCollection}
          byName={byName}
          onBack={() => setOpenCollectionId(null)}
          onRename={(name) => renameCollection(openCollection.id, name)}
          onDelete={() => deleteCollection(openCollection.id)}
          onRemoveItem={(name) => removeFromCollection(openCollection.id, name)}
          // Opened from a conversation, its prompt field continues that
          // conversation instead of starting a new one.
          onAskConcierge={(p) => askConcierge(p, { continueThread: pushHost === 'chat' })}
          onNotice={(message) => notice(message)}
          gender={gender}
          isSaved={isSaved}
          onSave={(p) => setAddTarget(p)}
          preview={isPreviewCollection}
          picker={collectionPicker}
          onSaveCollection={() => {
            setCollections((prev) =>
              prev.some((c) => c.id === openCollection.id)
                ? prev
                : exclusive(
                    [...prev, { ...openCollection, createdAt: Date.now() }],
                    openCollection.id,
                    openCollection.items,
                  ),
            );
            showSnack('Saved to your collections', 'View', () => {
              setSnack(null);
              goSaved();
            });
          }}
        />
      )}

      {/* Product page over the Home / Saved lists. */}
      {tab === pushHost && openProduct && (
        <ProductPage
          product={openProduct}
          saved={isSaved(openProduct.name)}
          onToggleSave={() => setAddTarget(openProduct)}
          onClose={() => setOpenProduct(null)}
          gender={gender}
          onNotice={(message) => notice(message)}
          onAskConcierge={(p) => askConcierge(p, { continueThread: pushHost === 'chat' })}
          picker={collectionPicker}
        />
      )}

      {memoryScreen}

      {/* Scan overlay (the dock's center item). */}
      {showScan && (
        <ScanScreen
          products={catalogue}
          gender={gender}
          isSaved={isSaved}
          picker={collectionPicker}
          onSave={(p) => setAddTarget(p)}
          onAskConcierge={askConcierge}
          onNotice={(message) => notice(message)}
          onClose={() => setShowScan(false)}
        />
      )}

      {/* Add to collection (pick one → save), heart-driven. A piece lives in one
          collection, so the sheet opens on the one it is in, if any. */}
      {addTarget && (
        <AddToCollectionFlow
          // Newest first, the same order the Saved list uses: the collection
          // just created in this very sheet has to be the one at the top
          // (Figma node 5550-27212), not buried under the seeded ones.
          collections={collectionsNewestFirst}
          byName={byName}
          current={collectionOf(collections, addTarget.name)?.id}
          startOnCreate={addStartOnCreate}
          onCreate={createCollection}
          onSave={finishAddFlow}
          onClose={closeAddFlow}
        />
      )}

      {snack && (
        <Snackbar
          key={snack.id}
          message={snack.message}
          actionLabel={snack.actionLabel}
          onAction={snack.onAction}
          bottom={snackBottom}
          zIndex={snackZ}
        />
      )}
    </>
  );
}

// ── Shared layout styles ─────────────────────────────────────────────────────
// screenStyle / bodyStyle / Header now live in ./screenChrome so other top-level
// tabs (Menu) can share them.

/** Saved collections: one full-width `CollectionCard` per row. */
const savedColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: `12px ${PAGE}px ${PAGE}px`,
};

// ── Section header (title + optional "View all" or custom right slot) ────────
function SectionHeader({
  title,
  onViewAll,
  right,
}: {
  title: string;
  onViewAll?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${PAGE}px`,
        marginBottom: 12,
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0, lineHeight: '24px' }}>
        {title}
      </h2>
      {right !== undefined
        ? right
        : onViewAll && (
            <button
              onClick={onViewAll}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0 4px 8px',
                color: '#cfcfcf',
                fontSize: 14,
                fontWeight: 500,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              View all
            </button>
          )}
    </div>
  );
}

// ── Section (title + "View all" + horizontal card carousel) ──────────────────
function Section({
  title,
  onViewAll,
  children,
}: {
  title: string;
  onViewAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section style={{ paddingTop: 8, paddingBottom: 8 }}>
      <SectionHeader title={title} onViewAll={onViewAll} />
      {/* The inset lives on the track, not the scroller, and the track is
          `max-content` wide so its trailing padding is part of the scrollable
          width. Put the padding on the scroller instead and the last card ends
          flush against the screen edge at scroll end, with the right margin
          only appearing at rest. */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 12, padding: `0 ${PAGE}px`, width: 'max-content' }}>
          {children}
        </div>
      </div>
    </section>
  );
}

// ── Self-contained overflow "..." menu (button + portaled dropdown) ──────────
// Portaled to <body> so it escapes card/carousel overflow; closes on outside tap
// and on scroll. Used where a card isn't wired into the lifted openMenuId system.
function OverflowMenu({ onMoreLikeThis, onHide }: { onMoreLikeThis: () => void; onHide: () => void }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);
  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: 100,
          background: open ? 'rgba(40,40,40,0.92)' : 'rgba(20,20,20,0.72)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          WebkitTapHighlightColor: 'transparent',
          zIndex: 3,
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#e7e7e7' }} aria-hidden>
          more_vert
        </span>
      </button>
      {open && pos &&
        createPortal(
          <>
            <div
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              style={{ position: 'fixed', inset: 0, zIndex: 200 }}
            />
            <div
              role="menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: pos.top,
                right: pos.right,
                minWidth: 202,
                zIndex: 201,
                background: '#1f1f1f',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 16px 38px rgba(0,0,0,0.6)',
                transformOrigin: 'top right',
                animation: 'menuPop 130ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
              }}
            >
              <MenuRow icon="thumb_up" label="More like this" onClick={() => { setOpen(false); onMoreLikeThis(); }} />
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <MenuRow icon="block" label="Do not recommend" destructive onClick={() => { setOpen(false); onHide(); }} />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

// ── Outfit card (Discover > Outfits) ─────────────────────────────────────────
//
// The collection card's twin, and deliberately not identical to it: where that
// one assembles a cover out of the pieces inside, this shows the styled flat-lay
// as it was shot. Portrait rather than 3:2, so the two sit differently in the
// feed and you can tell a look from a list at a glance without reading a word.
//
// It carries the same heart and "..." a collection card does, and they mean the
// same things: the heart files the look under `outfit-col-<id>`, the menu tunes
// what the feed shows. Only the picture is different.
function OutfitCard({
  outfit,
  meta,
  onOpen,
  saved = false,
  onToggleSave,
  onMoreLikeThis,
  onHide,
  width = RAIL_CARD_W,
}: {
  outfit: Outfit;
  meta: string;
  onOpen: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
  onMoreLikeThis?: () => void;
  onHide?: () => void;
  width?: number | string;
}) {
  const showMenu = !!(onMoreLikeThis && onHide);
  return (
    <div
      onClick={onOpen}
      style={{
        position: 'relative',
        width,
        flexShrink: 0,
        background: '#0c0c0c',
        border: '1px solid #282828',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        scrollSnapAlign: 'start',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {onToggleSave && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
          aria-label={saved ? 'Remove from saved' : 'Save to favorites'}
          style={{
            position: 'absolute',
            top: 8,
            right: showMenu ? 48 : 8,
            width: 32,
            height: 32,
            borderRadius: 100,
            background: 'rgba(20,20,20,0.72)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 3,
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: 18,
              fontVariationSettings: saved ? "'wght' 500, 'FILL' 1" : "'wght' 400",
              color: saved ? '#ef4d63' : '#e7e7e7',
            }}
            aria-hidden
          >
            favorite
          </span>
        </button>
      )}
      {showMenu && <OverflowMenu onMoreLikeThis={onMoreLikeThis!} onHide={onHide!} />}

      {/* 4:3, matching the art, so the rails line up and the look fills the
          tile. `contain`, never `cover`: the art already carries its own safe
          margin, so it lands flush at this ratio, and anything off-ratio is
          letterboxed rather than having its outer pieces clipped off. */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={outfit.image}
          alt=""
          aria-hidden
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#f7f7f7',
            lineHeight: '20px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {outfit.name}
        </p>
        <span style={{ fontSize: 13, fontWeight: 400, color: '#999', lineHeight: '18px' }}>
          {meta}
        </span>
      </div>
    </div>
  );
}

// ── Category row (compact list item: thumbnail + name + count) ───────────────
/**
 * One notification. A card, not a bare row, because the list is short and each
 * one is a separate thing that happened rather than an entry in a register.
 *
 * The whole card is the button: there is exactly one thing to do with a
 * notification, and it is to go and look at what it is about.
 */
function NotificationRow({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: () => void;
}) {
  const { icon, title, body, createdAt, read } = notification;
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        // Unread lifts off the page slightly; read settles back into it.
        background: read ? '#0c0c0c' : 'rgba(255,255,255,0.05)',
        border: '1px solid #282828',
        borderRadius: theme.radii.card,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: theme.radii.button,
          background: '#2f2f31',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MIcon name={icon} size={22} color="#f6f6f6" />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '22px', color: '#f6f6f6' }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: '#999' }}>{body}</p>
        <span style={{ fontSize: 12, lineHeight: '16px', color: '#666' }}>
          {relativeTime(createdAt)}
        </span>
      </div>
      {!read && (
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            marginTop: 8,
            flexShrink: 0,
            borderRadius: theme.radii.button,
            background: theme.colors.unread,
          }}
        />
      )}
    </div>
  );
}

function CategoryRow({
  name,
  count,
  cover,
  onOpen,
  // 230, the width every other card in the Discover carousels uses, so the rows
  // line up with the Collections and Outfits rails above them.
  width = RAIL_CARD_W,
}: {
  name: string;
  count: number;
  cover: string;
  onOpen: () => void;
  width?: number | string;
}) {
  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width,
        padding: 8,
        background: '#0c0c0c',
        border: '1px solid #282828',
        borderRadius: 14,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 10,
          background: '#ececec',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={cover}
          alt=""
          aria-hidden
          draggable={false}
          style={{ maxWidth: '78%', maxHeight: '80%', objectFit: 'contain', display: 'block' }}
        />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#f7f7f7',
            lineHeight: '20px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </p>
        <span style={{ fontSize: 13, fontWeight: 400, color: '#999', lineHeight: '18px' }}>
          {count} items
        </span>
      </div>
    </div>
  );
}

// ── Skeleton illustration (fanned ghost cards for empty states) ──────────────


// ── Progress pie (donut ring showing % complete) ────────────────────────────
function ProgressPie({ pct }: { pct: number }) {
  const size = 24;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#333" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f6f6f6"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 400ms ease' }}
      />
    </svg>
  );
}



// ── Snackbar (Figma hint/snackbar - text + action, floats above the bottom bar) ─
function Snackbar({
  message,
  actionLabel,
  onAction,
  bottom = `calc(71px + env(safe-area-inset-bottom, 0px))`,
  zIndex = 90,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  /** Distance from the bottom - raised when the product-page action bar is open. */
  bottom?: string;
  /** Raised again over full-screen pushes like Manage Memory (z 200). */
  zIndex?: number;
}) {
  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        left: PAGE,
        right: PAGE,
        // 8px above whatever sits at the bottom (feed bar = 63px, or the product
        // page's action bar), plus the device safe-area inset.
        bottom,
        // Above the product-page overlay (z 80) so favorite toasts show there too.
        zIndex,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        // Reversed (light) treatment so the toast stands out on the dark feed.
        background: '#f6f6f6',
        border: 'none',
        borderRadius: 10,
        padding: '8px 8px 8px 16px',
        boxShadow: '0 12px 34px rgba(0,0,0,0.6)',
        animation: 'fadeInUp 260ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
      }}
    >
      <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, color: '#121212', lineHeight: '20px' }}>
        {message}
      </span>
      <button
        onClick={onAction}
        style={{
          flexShrink: 0,
          background: '#121212',
          border: 'none',
          borderRadius: 100,
          color: '#f6f6f6',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 16px',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 14, color: '#999', lineHeight: '20px', margin: 0 }}>{text}</p>
    </div>
  );
}
