import { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PRODUCTS, { matchesQuery, type Product } from '../data/products';
import { categoryConfigs } from '../data/categoryConfig';
import ProductPage from './ProductPage';
import MenuScreen from './MenuScreen';
import ChatScreen, { type AttachmentTarget, type ChatMessage, type ConciergePrompt } from './ChatScreen';
import MemoryScreen from './MemoryScreen';
import BottomDock, { type DockTab } from '../components/BottomDock';
import MIcon from '../components/MIcon';
import ScanIcon from '../components/ScanIcon';
import SearchField, { SearchFieldAction } from '../components/SearchField';
import SearchModal from '../components/SearchModal';
import ProductCard, { MenuRow } from '../components/ProductCard';
import { theme } from '../theme';
import ScanScreen from './ScanScreen';
import CollectionPage from './CollectionPage';
import { AddToCollectionFlow, CollectionFan, CreateCollectionSheet } from '../components/CollectionSheets';
import { SEED_MEMORY_FACTS, type MemoryFact } from '../data/memory';
import {
  collectionMeta,
  formatPrice,
  makeCollection,
  priceOf,
  seedCollections,
  type Collection,
} from '../data/collections';
import { screenStyle, bodyStyle, Header, iconButtonStyle } from './screenChrome';

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
  | { kind: 'list'; title: string; items: Product[] };
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
  // Search is its own full-screen experience (`<SearchModal>`), opened from the
  // Discover field or the Saved header. The feed itself never shows results.
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'products' | null>(null);
  // Saved's field is a plain filter over the grid, not a doorway into the modal,
  // so it keeps its own query.
  const [savedQuery, setSavedQuery] = useState('');
  const [snack, setSnack] = useState<Snack | null>(null);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  // Products the user hit "Do not recommend" on - filtered out of the Discover feed.
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  // ── Collections ───────────────────────────────────────────────────────────
  // User-curated groups of saved pieces. Owned here because Saved, the product
  // page, the scan results, and Discover's look cards all write to them.
  const [collections, setCollections] = useState<Collection[]>(() => seedCollections(gender));
  // Collections the user pinned, most recently pinned last. Pinned ones lift out
  // of the Saved column into a horizontal rail at the top of the tab, the same
  // shape Discover's Collections row uses, so the handful you are living in stay
  // one swipe away while the rest of the list keeps growing underneath.
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const togglePin = (id: string) => {
    const wasPinned = pinnedIds.includes(id);
    // Undo restores the whole previous array rather than toggling back, so it
    // returns the rail to the exact order it had, not just the membership.
    const before = pinnedIds;
    setPinnedIds(wasPinned ? before.filter((p) => p !== id) : [...before, id]);
    showSnack(wasPinned ? 'Unpinned' : 'Pinned to the top', 'Undo', () => {
      setPinnedIds(before);
      setSnack(null);
    });
  };
  // The collection page open over the Saved tab (survives tab switches, so
  // coming back from Chat lands on the same collection).
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);
  // The piece the "Add to collection" sheet flow is filing (null = closed).
  const [addTarget, setAddTarget] = useState<Product | null>(null);
  // The standalone "New collection" sheet on the Saved tab.
  const [showCreate, setShowCreate] = useState(false);
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
  // collection, so its local overlays (product page, search, note sheet) reset.
  const [collectionEpoch, setCollectionEpoch] = useState(0);

  /** Hearting a Discover look files it as a collection of its pieces. */
  const lookCollectionId = (id: string) => `look-${id}`;
  const isCollectionSaved = (id: string) => collections.some((c) => c.id === lookCollectionId(id));
  const toggleCollection = (look: FeedSection) => {
    const id = lookCollectionId(look.id);
    const existing = collections.find((c) => c.id === id);
    if (!existing) {
      const col: Collection = {
        id,
        name: look.name,
        description: 'Saved from Discover.',
        items: look.items.map((p) => p.name),
        notes: {},
        createdAt: Date.now(),
      };
      setCollections((prev) => [...prev, col]);
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

  const createCollection = (name: string, description: string): Collection => {
    const col = makeCollection(name, description);
    setCollections((prev) => [...prev, col]);
    return col;
  };
  const renameCollection = (id: string, name: string, description: string) =>
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name, description } : c)));
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
  /** One piece at a time, from the collection page's Add sheet. */
  const addItemToCollection = (id: string, name: string) => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === id && !c.items.includes(name) ? { ...c, items: [...c.items, name] } : c,
      ),
    );
    notice('Added to collection');
  };
  const removeFromCollection = (id: string, productName: string) => {
    const col = collections.find((c) => c.id === id);
    if (!col || !col.items.includes(productName)) return;
    // Capture position + note so Undo restores the piece exactly as it was,
    // and so a later re-add does not resurrect a stale note.
    const index = col.items.indexOf(productName);
    const note = col.notes[productName];
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const notes = { ...c.notes };
        delete notes[productName];
        return { ...c, items: c.items.filter((n) => n !== productName), notes };
      }),
    );
    showSnack('Removed from collection', 'Undo', () => {
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id !== id || c.items.includes(productName)) return c;
          const items = [...c.items];
          items.splice(Math.min(index, items.length), 0, productName);
          const notes = note ? { ...c.notes, [productName]: note } : c.notes;
          return { ...c, items, notes };
        }),
      );
      setSnack(null);
    });
  };
  const setCollectionNote = (id: string, productName: string, note: string) =>
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const notes = { ...c.notes };
        if (note) notes[productName] = note;
        else delete notes[productName];
        return { ...c, notes };
      }),
    );

  /** The heart's sheet flow finished: apply the membership diff, confirm. */
  const finishAddFlow = (ids: string[], note: string) => {
    if (!addTarget) return;
    const name = addTarget.name;
    const before = collections;
    const containing = collections.filter((c) => c.items.includes(name)).map((c) => c.id);
    const additions = ids.filter((id) => !containing.includes(id));
    const removals = containing.filter((id) => !ids.includes(id));
    setCollections((prev) =>
      prev.map((c) => {
        if (additions.includes(c.id)) {
          const items = c.items.includes(name) ? c.items : [...c.items, name];
          const notes = note ? { ...c.notes, [name]: note } : c.notes;
          return { ...c, items, notes };
        }
        if (removals.includes(c.id)) {
          const notes = { ...c.notes };
          delete notes[name];
          return { ...c, items: c.items.filter((n) => n !== name), notes };
        }
        return c;
      }),
    );
    setAddTarget(null);
    if (additions.length > 0) {
      const first = collections.find((c) => c.id === additions[0]);
      const label =
        removals.length > 0
          ? 'Collections updated'
          : additions.length === 1 && first
            ? `Added to ${first.name}`
            : `Added to ${additions.length} collections`;
      showSnack(label, 'View', () => {
        setSnack(null);
        setShowScan(false);
        setOpenProduct(null);
        goSaved();
        setOpenCollectionId(additions.length === 1 ? additions[0] : null);
        // Remount the collection page even when it is already showing this
        // collection, so overlays it opened itself (product page, sheets) clear.
        setCollectionEpoch((e) => e + 1);
      });
    } else if (removals.length > 0) {
      showSnack('Removed from your collections', 'Undo', () => {
        setCollections(before);
        setSnack(null);
      });
    }
  };

  const goHome = () => {
    setTab('home');
    setDetail(null);
    setShowMemory(false);
    // Tapping Home while already on it clears the search, the same way tapping
    // Saved while on Saved pops the open collection.
    setQuery('');
  };
  /** Jump to the Saved tab from a snackbar / dock tap, closing any push. */
  const goSaved = () => {
    setTab('saved');
    setDetail(null);
    setShowMemory(false);
    setOpenCollectionId(null);
  };

  // ── Scan + chat hand-off ──────────────────────────────────────────────────
  // The catalog the scan can "capture" and Discover search covers: real imagery,
  // user's gender. Deduped by name because names are the selection key everywhere
  // (a few pieces exist in both gender variants under one name).
  const catalogue = useMemo(
    () => dedupeByName(genderFilter(PRODUCTS.filter((p) => p.image !== '/vip-logo.svg'), gender)),
    [gender],
  );
  // Discover search (shared `matchesQuery`: piece, brand or category), honouring
  // "Do not recommend" the same way the feed groups do.
  const trimmedQuery = query.trim();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    return catalogue.filter((p) => !hidden.has(p.name) && matchesQuery(p, trimmedQuery));
  }, [catalogue, trimmedQuery, hidden]);
  /** Saved lists newest first, so the collection just saved leads the grid. */
  const collectionsNewestFirst = useMemo(
    () => [...collections].sort((a, b) => b.createdAt - a.createdAt),
    [collections],
  );
  // Saved search runs over collection names and descriptions, in place: an empty
  // field shows the whole grid, the way the collection page's own search does.
  const savedFiltered = useMemo(() => {
    const q = savedQuery.trim().toLowerCase();
    if (!q) return collectionsNewestFirst;
    return collectionsNewestFirst.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q),
    );
  }, [collectionsNewestFirst, savedQuery]);

  // Pinned lift out of the column into the rail, in the order they were pinned.
  // Derived by intersecting with the live list rather than pruned on delete, so
  // deleting a pinned collection and hitting Undo brings the pin back with it.
  const savedPinned = useMemo(
    () =>
      pinnedIds
        .map((id) => savedFiltered.find((c) => c.id === id))
        .filter((c): c is Collection => !!c),
    [pinnedIds, savedFiltered],
  );
  const savedRest = useMemo(
    () => savedFiltered.filter((c) => !pinnedIds.includes(c.id)),
    [savedFiltered, pinnedIds],
  );

  /**
   * Idle-state chips for the catalog search: actual pieces, one per category so
   * they spread across the catalog. Named pieces rather than departments, because
   * a chip should show what a good query looks like, and every one of them is
   * drawn from the catalogue the search covers, so none can come back empty.
   */
  const searchSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of catalogue) {
      if (seen.has(p.category)) continue;
      seen.add(p.category);
      out.push(p.name);
      if (out.length === 5) break;
    }
    return out;
  }, [catalogue]);

  const openSearch = (scope: 'products') => {
    setQuery('');
    setSearchScope(scope);
  };
  const closeSearch = () => {
    setSearchScope(null);
    setQuery('');
  };
  /** Starts a NEW concierge chat with the prompt's attachment and sends it. */
  const askConcierge = (prompt: ConciergePrompt) => {
    setShowScan(false);
    setDetail(null);
    setShowMemory(false);
    setChatMessages([]);
    setChatRatings({});
    setChatPrompt(prompt);
    setTab('chat');
  };
  /**
   * An attachment card in the chat, tapped. The chat carries only a descriptor,
   * so resolving it back to a screen is this component's job: a collection opens
   * over Saved, a piece opens its product page over Home. A collection that has
   * since been deleted quietly does nothing rather than opening an empty page.
   */
  const openAttachment = (target: AttachmentTarget) => {
    if (target.kind === 'collection') {
      if (!collections.some((c) => c.id === target.id)) return;
      setTab('saved');
      setDetail(null);
      setShowMemory(false);
      setOpenProduct(null);
      setOpenCollectionId(target.id);
      setCollectionEpoch((e) => e + 1);
      return;
    }
    const product = byName(target.name);
    if (!product) return;
    setShowMemory(false);
    setOpenProduct(product);
  };

  /** Scan results "Search manually": browse the matched category on Home. */
  const browseCategory = (category: string | null) => {
    setShowScan(false);
    setTab('home');
    setShowMemory(false);
    // Everything pushed over Home has to go, or the category list opens
    // underneath it: the collection page is deliberately kept across tab
    // switches, so landing on Home is not enough to reveal what we just opened.
    setOpenCollectionId(null);
    setOpenProduct(null);
    if (category) {
      const items = genderFilter(
        PRODUCTS.filter((p) => p.category === category && p.image !== '/vip-logo.svg'),
        gender,
      );
      setDetail({ kind: 'list', title: `All ${categoryConfigs[category]?.name || category}`, items });
    } else {
      setDetail(null);
    }
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
    // ── Saved tab: collections only. Creating one is the `+` in the header's
    // top-right corner, not a row in the list. ────────────────────────────────
    body = (
      <div style={screenStyle}>
        <Header
          title="Saved"
          height={56}
          right={
            <button
              onClick={() => setShowCreate(true)}
              aria-label="New collection"
              style={iconButtonStyle}
            >
              <MIcon name="add_2" size={24} color="#f6f6f6" />
            </button>
          }
        />
        <div ref={bodyRef} style={bodyStyle}>
          {/* Saved is the one search that filters in place. The list is short,
              already on screen and already scoped to this page, so a full-screen
              modal to narrow it would cost a screen to say less. (The catalog
              searches still push `<SearchModal>`: there the field is a doorway
              into everything, not a filter over what you are looking at.) */}
          <div style={{ padding: `${PAGE}px ${PAGE}px 4px` }}>
            <SearchField
              value={savedQuery}
              onChange={setSavedQuery}
              placeholder="Search collections"
            />
          </div>
          {savedFiltered.length === 0 ? (
            <p
              style={{
                margin: '40px 0',
                textAlign: 'center',
                fontSize: 14,
                lineHeight: '20px',
                color: '#999',
              }}
            >
              No collections match "{savedQuery.trim()}".
            </p>
          ) : (
            <>
              {/* Pinned rail: the same horizontal carousel Discover's Collections
                  row uses, so a pinned collection reads as the same object in a
                  faster place rather than a new kind of thing. Cards keep the
                  230px carousel width, which is what makes it scroll. */}
              {savedPinned.length > 0 && (
                <Section title="Pinned">
                  {savedPinned.map((c) => (
                    <CollectionCard
                      key={c.id}
                      name={c.name}
                      count={c.items.length}
                      items={c.items.map(byName).filter(Boolean) as Product[]}
                      meta={collectionMeta(c, byName)}
                      onOpen={() => setOpenCollectionId(c.id)}
                      pinned
                      onTogglePin={() => togglePin(c.id)}
                    />
                  ))}
                  {/* One pinned card leaves the rail mostly gap and nothing to
                      scroll, so the second slot is drawn empty. */}
                  {savedPinned.length === 1 && <PinnedSlotCard />}
                </Section>
              )}
              {savedRest.length > 0 && (
                <>
                  {/* Only titled once something sits above it, so an unpinned
                      Saved tab stays the bare list it has always been. */}
                  {savedPinned.length > 0 && <SectionHeader title="All collections" />}
                  <div style={savedColStyle}>
                    {savedRest.map((c) => (
                      <CollectionCard
                        key={c.id}
                        name={c.name}
                        count={c.items.length}
                        items={c.items.map(byName).filter(Boolean) as Product[]}
                        meta={collectionMeta(c, byName)}
                        width="100%"
                        onOpen={() => setOpenCollectionId(c.id)}
                        onTogglePin={() => togglePin(c.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {/* Creator row closes the list - horizontal, so it reads as the action
              at the end rather than another collection in the column. Hidden
              while filtering, where it would read as a result. */}
          {savedQuery.trim() === '' && (
            <div style={{ padding: `0 ${PAGE}px ${PAGE}px` }}>
              <NewCollectionCard onClick={() => setShowCreate(true)} />
            </div>
          )}
        </div>
        <BottomDock tabs={dockTabs('saved')} />
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
                  onOpen={() => setOpenProduct(product)}
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
      {/* Centered "Discover" title (top-level tab - no back button). */}
      <Header title="Discover" />

      <div ref={bodyRef} style={bodyStyle}>
        {/* Onboarding-progress banner - permanent until onboarding hits 100%, and
            pinned at the very top of the feed, above the search field. */}
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

        {/* Search (Figma inputField 5433-34513). The field is the affordance, not
            the input: tapping it opens the search modal. The scan brackets still
            open the camera, same target as the Scan dock item. */}
        <div style={{ padding: `${onboardingComplete ? PAGE : 8}px ${PAGE}px 4px` }}>
          <SearchField
            value=""
            onChange={() => {}}
            placeholder="Search for products"
            onActivate={() => openSearch('products')}
            trailing={
              <SearchFieldAction label="Scan a piece" onClick={() => setShowScan(true)}>
                <ScanIcon size={24} color="#f6f6f6" />
              </SearchFieldAction>
            }
          />
        </div>

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
                    onOpen={() => setOpenProduct(product)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => hideProduct(product.name)}
                    menuOpen={openMenuId === product.name}
                    onToggleMenu={() =>
                      setOpenMenuId((id) => (id === product.name ? null : product.name))
                    }
                    onCloseMenu={() => setOpenMenuId(null)}
                    width={230}
                  />
                ))}
              </Section>
            )}

            {/* Trending - horizontal carousel (keeps the "..." menu) */}
            {trending.length > 0 && (
              <Section
                title="Trending"
                onViewAll={() => setDetail({ kind: 'list', title: 'Trending', items: trending })}
              >
                {trending.map((product) => (
                  <ProductCard
                    key={product.name}
                    product={product}
                    saved={isSaved(product.name)}
                    onToggleSave={() => setAddTarget(product)}
                    onOpen={() => setOpenProduct(product)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => hideProduct(product.name)}
                    menuOpen={openMenuId === product.name}
                    onToggleMenu={() =>
                      setOpenMenuId((id) => (id === product.name ? null : product.name))
                    }
                    onCloseMenu={() => setOpenMenuId(null)}
                    width={230}
                  />
                ))}
              </Section>
            )}

            {/* Collections - coordinated looks. A horizontal carousel, but the
                cards read exactly like the Saved tab's: same cover, same
                "N items · $total" meta rather than a bare "N pieces". */}
            {outfits.length > 0 && (
              <Section
                title="Collections"
                onViewAll={() =>
                  setDetail({
                    kind: 'list',
                    title: 'Collections',
                    items: dedupeByName(outfits.flatMap((o) => o.items)),
                  })
                }
              >
                {outfits.map((o) => (
                  <CollectionCard
                    key={o.id}
                    name={o.name}
                    count={o.items.length}
                    items={o.items}
                    meta={outfitMeta(o.items)}
                    // Opens the collection page, previewed until it is hearted.
                    onOpen={() => setOpenCollectionId(lookCollectionId(o.id))}
                    saved={isCollectionSaved(o.id)}
                    onToggleSave={() => toggleCollection(o)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => showSnack('Noted, fewer like this', 'Got it', () => setSnack(null))}
                  />
                ))}
              </Section>
            )}

            {/* Categories - full-width stack when few, else a 2-row horizontal scroll */}
            {categoryGroups.length > 0 && (
              <section style={{ paddingTop: 8, paddingBottom: 8 }}>
                <SectionHeader title="Categories" />
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
                        // Padding on the grid (not the scroller) so the right inset
                        // survives at scroll end.
                        padding: `0 ${PAGE}px`,
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
    if (!look) return null;
    return {
      id: openCollectionId,
      name: look.name,
      description: 'A look put together for you.',
      items: look.items.map((p) => p.name),
      notes: {},
      createdAt: 0,
    } satisfies Collection;
  }, [openCollectionId, savedOpenCollection, outfits]);
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
      {(tab === 'saved' || tab === 'home') && openCollection && (
        <CollectionPage
          // Keyed by id + epoch: switching collections OR following the add
          // flow's View resets the page's local overlays (product page, search,
          // note sheet) instead of reusing them across collections.
          key={`${openCollection.id}:${collectionEpoch}`}
          collection={openCollection}
          byName={byName}
          catalogue={catalogue}
          onBack={() => setOpenCollectionId(null)}
          onRename={(name, description) => renameCollection(openCollection.id, name, description)}
          onDelete={() => deleteCollection(openCollection.id)}
          onRemoveItem={(name) => removeFromCollection(openCollection.id, name)}
          onSetNote={(name, note) => setCollectionNote(openCollection.id, name, note)}
          onAddItem={(name) => addItemToCollection(openCollection.id, name)}
          onScan={() => setShowScan(true)}
          onAskConcierge={askConcierge}
          onNotice={(message) => notice(message)}
          gender={gender}
          isSaved={isSaved}
          onSave={(p) => setAddTarget(p)}
          preview={isPreviewCollection}
          onSaveCollection={() => {
            setCollections((prev) =>
              prev.some((c) => c.id === openCollection.id)
                ? prev
                : [...prev, { ...openCollection, createdAt: Date.now() }],
            );
            showSnack('Saved to your collections', 'View', () => {
              setSnack(null);
              goSaved();
            });
          }}
        />
      )}

      {/* Product page over the Home / Saved lists. */}
      {(tab === 'home' || tab === 'saved') && openProduct && (
        <ProductPage
          product={openProduct}
          saved={isSaved(openProduct.name)}
          onToggleSave={() => setAddTarget(openProduct)}
          onClose={() => setOpenProduct(null)}
          gender={gender}
          onNotice={(message) => notice(message)}
          onAskConcierge={askConcierge}
        />
      )}

      {memoryScreen}

      {/* Scan overlay (the dock's center item). */}
      {showScan && (
        <ScanScreen
          products={catalogue}
          gender={gender}
          isSaved={isSaved}
          onSave={(p) => setAddTarget(p)}
          onAskConcierge={askConcierge}
          onBrowseCategory={browseCategory}
          onNotice={(message) => notice(message)}
          onClose={() => setShowScan(false)}
        />
      )}

      {/* Add to collection flow (select → create → note), heart-driven. */}
      {addTarget && (
        <AddToCollectionFlow
          product={addTarget}
          price={formatPrice(priceOf(addTarget))}
          collections={collections}
          byName={byName}
          preselected={collections.filter((c) => c.items.includes(addTarget.name)).map((c) => c.id)}
          onCreate={createCollection}
          onSave={finishAddFlow}
          onClose={() => setAddTarget(null)}
        />
      )}

      {/* Search: a full screen over whatever opened it. Products from Discover's
          field, collections from the Saved header. */}
      {searchScope === 'products' && (
        <SearchModal
          placeholder="Search for products"
          suggestions={searchSuggestions}
          query={query}
          onQueryChange={setQuery}
          onClose={closeSearch}
          resultCount={searchResults.length}
          onAskConcierge={(q) => {
            closeSearch();
            // The offer also sits on the idle state, where there is no query to
            // quote - "Help me find \"\"" is not a question.
            askConcierge({
              text: q ? `Help me find "${q}"` : 'Help me find a piece',
            });
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              padding: `4px ${PAGE}px calc(16px + env(safe-area-inset-bottom, 0px))`,
            }}
          >
            {searchResults.map((product) => (
              <ProductCard
                key={product.name}
                product={product}
                saved={isSaved(product.name)}
                onToggleSave={() => setAddTarget(product)}
                onOpen={() => {
                  closeSearch();
                  setOpenProduct(product);
                }}
                width="100%"
              />
            ))}
          </div>
        </SearchModal>
      )}

      {/* "New collection" from the Saved tab - opens the new collection. */}
      {showCreate && (
        <CreateCollectionSheet
          onClose={() => setShowCreate(false)}
          onSubmit={(name, description) => {
            const col = createCollection(name, description);
            setShowCreate(false);
            setOpenCollectionId(col.id);
          }}
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
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: `0 ${PAGE}px`,
          scrollPadding: `0 ${PAGE}px`,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
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

// ── Collection card (regular product-card shell; image split into 4 tiles) ───
function CollectionCard({
  name,
  count,
  items,
  onOpen,
  saved = false,
  onToggleSave,
  onMoreLikeThis,
  onHide,
  width = 230,
  unit = 'items',
  meta,
  pinned = false,
  onTogglePin,
}: {
  name: string;
  count: number;
  items: Product[];
  onOpen: () => void;
  /** When provided, the card shows a favorite heart (save the whole look). */
  saved?: boolean;
  onToggleSave?: () => void;
  /** When provided, the card shows a "..." menu (like a product card). */
  onMoreLikeThis?: () => void;
  onHide?: () => void;
  width?: number | string;
  unit?: string;
  /** Overrides the "count unit" line (user collections show "N items · $total"). */
  meta?: string;
  /** When provided, the card shows a pin toggle beside its name. */
  pinned?: boolean;
  onTogglePin?: () => void;
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
      {/* The fanned cover: up to three pieces, the outer two kicked out 15deg. */}
      <CollectionFan items={items} size="100%" radius={0} />
      <div style={{ padding: '12px 14px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
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
            {meta ?? `${count} ${unit}`}
          </span>
        </div>
        {/* Pin sits with the name rather than over the cover: it is a property of
            the collection, not an action on the imagery, and the cover's corners
            are already spoken for by the heart and the "..." menu. Filled when
            pinned, the same way the dock marks its active tab. */}
        {onTogglePin && (
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
            aria-label={pinned ? `Unpin ${name}` : `Pin ${name} to the top`}
            aria-pressed={pinned}
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: theme.radii.button,
              background: pinned ? 'rgba(246,246,246,0.12)' : 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <MIcon
              name="keep"
              size={20}
              weight={pinned ? 400 : 300}
              fill={pinned ? 1 : 0}
              color={pinned ? '#f6f6f6' : '#999'}
            />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Empty pin slot (second card of a one-item Pinned rail) ───────────────────
//
// A rail holding exactly one card is mostly gap: the carousel does not scroll,
// and the single card reads as a mistake rather than a shortlist. This fills the
// second position with the shape of the card that is missing, so the row has the
// rhythm of a rail and quietly says there is room for another.
//
// Same skeleton vocabulary as `GhostCards` (dark fills, dim bars, no shimmer -
// this is not loading, it is empty), and the same tile geometry the real cover
// uses, so the ghost tiles land exactly where products would.
function PinnedSlotCard() {
  const tile = (offset: number, rotate: number) => (
    <div
      key={rotate}
      style={{
        position: 'absolute',
        left: '50%',
        top: '54.39%',
        width: '35.18cqw',
        aspectRatio: '120.652 / 114.72',
        transform: `translate(-50%, -50%) translateX(${offset}cqw) rotate(${rotate}deg)`,
        background: '#151515',
        border: '1px solid #232323',
        borderRadius: '3.4cqw',
      }}
    />
  );
  return (
    <div
      aria-hidden
      style={{
        width: 230,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed #2c2c2c',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '600 / 400', containerType: 'inline-size' }}>
        {tile(-11.66, -15)}
        {tile(11.66, 15)}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ height: 9, borderRadius: 5, background: '#1e1e1e', width: '62%', marginBottom: 8 }} />
        <div style={{ height: 8, borderRadius: 4, background: '#171717', width: '44%' }} />
      </div>
    </div>
  );
}

// ── "New collection" creator tile (last cell of the Saved grid) ──────────────
//
// A dashed outline rather than the solid card border, so it reads as an empty
// slot waiting to be filled instead of a collection that already exists. Fills
// the grid cell, so it matches whatever height the row's real cards settle on.
function NewCollectionCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="New collection"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        height: 64,
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed #3a3a3a',
        borderRadius: theme.radii.card,
        padding: '0 16px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <MIcon name="add_2" size={22} color="#f6f6f6" />
      <span style={{ fontSize: 15, fontWeight: 600, color: '#f7f7f7', lineHeight: '20px' }}>
        New Collection
      </span>
    </button>
  );
}

// ── Category row (compact list item: thumbnail + name + count) ───────────────
function CategoryRow({
  name,
  count,
  cover,
  onOpen,
  width = 208,
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
