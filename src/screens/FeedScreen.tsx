import { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PRODUCTS, { type Product } from '../data/products';
import { categoryConfigs } from '../data/categoryConfig';
import ProductPage, { type SavedStore } from './ProductPage';
import MenuScreen from './MenuScreen';
import ChatScreen, { type ChatMessage } from './ChatScreen';
import MemoryScreen from './MemoryScreen';
import BottomDock, { type DockTab } from '../components/BottomDock';
import { SEED_MEMORY_FACTS, type MemoryFact } from '../data/memory';
import { screenStyle, bodyStyle, Header } from './screenChrome';

const PAGE = 16; // horizontal page margin, matches Figma page/margins token

interface FeedScreenProps {
  gender: string | null;
  selectedInterests: string[];
  /** Products saved from the feed (the "Your Saved Products" section). */
  savedProducts: string[];
  onSavedChange: (products: string[]) => void;
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
// A full-screen detail view: the saved list, a category, or a titled product list
// (opened from a "View all" on the Discover groups).
type Detail =
  | { kind: 'category'; id: string; name: string }
  | { kind: 'saved' }
  | { kind: 'list'; title: string; items: Product[] };
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
  savedProducts,
  onSavedChange,
  onboardingPct,
  onboardingComplete,
  onResumeOnboarding,
  isGuest = false,
  onSignOut,
}: FeedScreenProps) {
  // Which bottom-bar tab is showing. Home carries the feed + its detail views.
  const [tab, setTab] = useState<'home' | 'menu' | 'chat'>('home');
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
  const [detail, setDetail] = useState<Detail | null>(null);
  const [snack, setSnack] = useState<Snack | null>(null);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  // Products the user hit "Do not recommend" on - filtered out of the Discover feed.
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  // Saved view sub-tab: saved products / collections / stores.
  const [savedTab, setSavedTab] = useState<'products' | 'collections' | 'stores'>('products');
  // Stores saved from a product page (shown in the Saved > Stores tab).
  const [savedStores, setSavedStores] = useState<SavedStore[]>([]);
  // Collections (looks) saved via the heart on a collection card.
  const [savedCollections, setSavedCollections] = useState<FeedSection[]>([]);
  // Which card's "..." menu is open (single source of truth so only one shows).
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Always-current view of savedProducts so the snackbar's "Undo" re-adds against
  // the latest list, not a stale snapshot from when the toast was shown.
  const savedRef = useRef(savedProducts);
  useEffect(() => { savedRef.current = savedProducts; }, [savedProducts]);
  const snackTimer = useRef<number | null>(null);
  useEffect(() => () => { if (snackTimer.current) clearTimeout(snackTimer.current); }, []);

  // Always land at the top when entering a category / saved detail or returning
  // to the feed, instead of inheriting the previous scroll position.
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bodyRef.current?.scrollTo(0, 0); }, [detail]);

  // Close any open card menu the moment the user scrolls (vertical body or a
  // horizontal carousel - capture catches nested scrollers), per best practice.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const close = () => setOpenMenuId(null);
    el.addEventListener('scroll', close, true);
    return () => el.removeEventListener('scroll', close, true);
  }, []);
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

  const savedItems = useMemo(
    () => savedProducts.map((n) => PRODUCT_BY_NAME[n]).filter(Boolean) as Product[],
    [savedProducts],
  );

  const toggleSave = (name: string) => {
    if (savedProducts.includes(name)) {
      onSavedChange(savedProducts.filter((n) => n !== name));
      showSnack('Removed from your list', 'Undo', () => {
        if (!savedRef.current.includes(name)) onSavedChange([...savedRef.current, name]);
        setSnack(null);
      });
    } else {
      onSavedChange([...savedProducts, name]);
      showSnack('Saved to your list', 'View', () => {
        setSnack(null);
        setDetail({ kind: 'saved' });
      });
    }
  };

  const isSaved = (name: string) => savedProducts.includes(name);

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
  const toggleCollection = (collection: FeedSection) => {
    const willSave = !savedCollections.some((c) => c.id === collection.id);
    setSavedCollections((prev) =>
      willSave ? [...prev, collection] : prev.filter((c) => c.id !== collection.id),
    );
    if (willSave) {
      showSnack('Saved to your list', 'View', () => {
        setSnack(null);
        setSavedTab('collections');
        setDetail({ kind: 'saved' });
      });
    } else {
      showSnack('Removed from your list', 'Undo', () => {
        setSavedCollections((prev) => (prev.some((c) => c.id === collection.id) ? prev : [...prev, collection]));
        setSnack(null);
      });
    }
  };
  const isCollectionSaved = (id: string) => savedCollections.some((c) => c.id === id);
  const toggleStore = (store: SavedStore) => {
    const willSave = !savedStores.some((s) => s.name === store.name);
    setSavedStores((prev) =>
      willSave ? [...prev, store] : prev.filter((s) => s.name !== store.name),
    );
    if (willSave) {
      showSnack('Saved to your list', 'View', () => {
        setSnack(null);
        setSavedTab('stores');
        setDetail({ kind: 'saved' });
      });
    } else {
      showSnack('Removed from your list', 'Undo', () => {
        setSavedStores((prev) => (prev.some((s) => s.name === store.name) ? prev : [...prev, store]));
        setSnack(null);
      });
    }
  };

  const goHome = () => {
    setTab('home');
    setDetail(null);
    setShowMemory(false);
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

  /** The five tabs of the Figma bottom dock, with the active one marked. */
  const dockTabs = (active: 'home' | 'chat' | 'menu'): DockTab[] => [
    { icon: 'home', label: 'Home', active: active === 'home', onClick: goHome },
    { icon: 'notifications', label: 'Alerts' },
    { icon: 'chat_bubble', label: 'Chat', active: active === 'chat', onClick: () => setTab('chat') },
    { icon: 'history', label: 'History' },
    { icon: 'menu', label: 'Menu', active: active === 'menu', onClick: () => setTab('menu') },
  ];

  // ── Chat tab ──────────────────────────────────────────────────────────────
  if (tab === 'chat') {
    return (
      <>
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
        />
        {memoryScreen}
        {snack && (
          <Snackbar
            key={snack.id}
            message={snack.message}
            actionLabel={snack.actionLabel}
            onAction={snack.onAction}
            // The chat dock carries a prompt field as well as the tabs, so it is
            // ~58px taller than the tabs-only dock the default is sized for.
            // Manage Memory's dock is the shorter prompt-only one.
            bottom={
              showMemory
                ? `calc(74px + env(safe-area-inset-bottom, 0px))`
                : `calc(129px + env(safe-area-inset-bottom, 0px))`
            }
            // Above the Memory sheet the chip can open (z 301).
            zIndex={310}
          />
        )}
      </>
    );
  }

  // ── Menu tab ──────────────────────────────────────────────────────────────
  if (tab === 'menu') {
    return (
      <>
        <MenuScreen
          isGuest={isGuest}
          onCreateAccount={() => onSignOut?.()}
          onSignOut={() => onSignOut?.()}
          onDeleteAccount={() => onSignOut?.()}
          onNotice={notice}
          memoryEnabled={memoryEnabled}
          onMemoryEnabledChange={setMemoryEnabled}
          onManageMemory={() => setShowMemory(true)}
          bottomBar={<BottomDock tabs={dockTabs('menu')} />}
        />
        {memoryScreen}
        {snack && (
          <Snackbar
            key={snack.id}
            message={snack.message}
            actionLabel={snack.actionLabel}
            onAction={snack.onAction}
            // Manage Memory is a z-200 push, and its prompt field sits where the
            // tab bar normally is - so clear both.
            zIndex={showMemory ? 250 : undefined}
            bottom={showMemory ? `calc(74px + env(safe-area-inset-bottom, 0px))` : undefined}
          />
        )}
      </>
    );
  }

  // ── "See all" detail view (per-category / saved grid) ─────────────────────
  if (detail) {
    const isSavedView = detail.kind === 'saved';
    const detailItems =
      detail.kind === 'saved'
        ? savedItems
        : detail.kind === 'list'
          ? detail.items
          : genderFilter(PRODUCTS.filter((p) => p.category === detail.id), gender);
    const detailTitle =
      detail.kind === 'saved' ? 'Saved' : detail.kind === 'list' ? detail.title : `All ${detail.name}`;
    // Category "See all" is a single-column list; saved + list views use a 2-col grid.
    const gridStyle: React.CSSProperties =
      detail.kind === 'category'
        ? { display: 'flex', flexDirection: 'column', gap: 16, padding: PAGE }
        : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: `12px ${PAGE}px ${PAGE}px` };
    return (
      <div style={screenStyle}>
        {/* Saved is a top-level tab, so no back button; other detail views keep one. */}
        <Header title={detailTitle} onBack={isSavedView ? undefined : () => setDetail(null)} />
        <div ref={bodyRef} style={{ ...bodyStyle }}>
          {/* Saved view splits into Products / Collections / Stores; all lists are
              a single full-width column. */}
          {isSavedView ? (
            <>
              <SavedSegments tab={savedTab} onChange={setSavedTab} />
              {savedTab === 'stores' ? (
                savedStores.length > 0 ? (
                  <div style={savedColStyle}>
                    {savedStores.map((store) => (
                      <SavedStoreCard key={store.name} store={store} onRemove={() => toggleStore(store)} />
                    ))}
                  </div>
                ) : (
                  <CenteredEmptyState
                    title="No saved stores yet"
                    subtitle="Save a boutique from any product page and it will show up here."
                  />
                )
              ) : savedTab === 'collections' ? (
                savedCollections.length > 0 ? (
                  <div style={savedColStyle}>
                    {savedCollections.map((c) => (
                      <CollectionCard
                        key={c.id}
                        name={c.name}
                        count={c.items.length}
                        items={c.items}
                        unit="pieces"
                        width="100%"
                        onOpen={() => setDetail({ kind: 'list', title: c.name, items: c.items })}
                        saved
                        onToggleSave={() => toggleCollection(c)}
                      />
                    ))}
                  </div>
                ) : (
                  <CenteredEmptyState
                    title="No saved collections yet"
                    subtitle="Tap the heart on any look and it will show up here."
                  />
                )
              ) : savedItems.length > 0 ? (
                <div style={savedColStyle}>
                  {savedItems.map((product) => (
                    <ProductCard
                      key={product.name}
                      product={product}
                      saved={isSaved(product.name)}
                      onToggleSave={() => toggleSave(product.name)}
                      onOpen={() => setOpenProduct(product)}
                      width="100%"
                    />
                  ))}
                </div>
              ) : (
                <CenteredEmptyState
                  title="No saved pieces yet"
                  subtitle="Tap the heart on any piece to save it here and build your personal edit."
                />
              )}
            </>
          ) : detailItems.length > 0 ? (
            <div style={gridStyle}>
              {detailItems.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  saved={isSaved(product.name)}
                  onToggleSave={() => toggleSave(product.name)}
                  onOpen={() => setOpenProduct(product)}
                  width="100%"
                />
              ))}
            </div>
          ) : (
            <EmptyNote text="Nothing here yet." />
          )}
        </div>
        {snack && (
          <Snackbar
            key={snack.id}
            message={snack.message}
            actionLabel={snack.actionLabel}
            onAction={snack.onAction}
            bottom={openProduct ? `calc(80px + env(safe-area-inset-bottom, 0px))` : undefined}
          />
        )}
        <BottomDock tabs={dockTabs('home')} />
        {openProduct && (
          <ProductPage
            product={openProduct}
            saved={isSaved(openProduct.name)}
            onToggleSave={() => toggleSave(openProduct.name)}
            onClose={() => setOpenProduct(null)}
            gender={gender}
            savedStores={savedStores.map((s) => s.name)}
            onToggleStore={toggleStore}
          />
        )}
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
  const collections = sections
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

  return (
    <div style={screenStyle}>
      {/* Centered "Discover" title (top-level tab - no back button). */}
      <Header title="Discover" />

      <div ref={bodyRef} style={bodyStyle}>
        {/* Onboarding-progress banner - permanent until onboarding hits 100% */}
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
                    onToggleSave={() => toggleSave(product.name)}
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
                    onToggleSave={() => toggleSave(product.name)}
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

            {/* Collections - coordinated looks, before the category list */}
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
                    unit="pieces"
                    onOpen={() => setDetail({ kind: 'list', title: o.name, items: o.items })}
                    saved={isCollectionSaved(o.id)}
                    onToggleSave={() => toggleCollection(o)}
                    onMoreLikeThis={moreLikeThis}
                    onHide={() => showSnack('Noted, fewer like this', 'Got it', () => setSnack(null))}
                  />
                ))}
              </Section>
            )}

            {/* Categories - full-width stack when few, else a 2-row horizontal scroll */}
            {collections.length > 0 && (
              <section style={{ paddingTop: 8, paddingBottom: 8 }}>
                <SectionHeader title="Categories" />
                {collections.length <= 2 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: `0 ${PAGE}px` }}>
                    {collections.map((c) => (
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
                      {collections.map((c) => (
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

      {snack && (
        <Snackbar
          key={snack.id}
          message={snack.message}
          actionLabel={snack.actionLabel}
          onAction={snack.onAction}
          bottom={openProduct ? `calc(80px + env(safe-area-inset-bottom, 0px))` : undefined}
        />
      )}
      <BottomDock tabs={dockTabs('home')} />
      {openProduct && (
        <ProductPage
          product={openProduct}
          saved={isSaved(openProduct.name)}
          onToggleSave={() => toggleSave(openProduct.name)}
          onClose={() => setOpenProduct(null)}
          gender={gender}
          savedStores={savedStores.map((s) => s.name)}
          onToggleStore={toggleStore}
        />
      )}
    </div>
  );
}

// ── Shared layout styles ─────────────────────────────────────────────────────
// screenStyle / bodyStyle / Header now live in ./screenChrome so other top-level
// tabs (Menu) can share them.

// Single full-width column for every Saved tab (products / collections / stores).
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
}) {
  // First four items fill a 2x2 image grid (no "+N" overflow, just four tiles).
  const cells = [0, 1, 2, 3].map((i) => items[i]);
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 1,
          aspectRatio: '4 / 3',
          background: '#282828',
        }}
      >
        {cells.map((p, i) => (
          <div
            key={i}
            style={{
              background: '#ececec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {p && (
              <img
                src={p.image}
                alt=""
                aria-hidden
                draggable={false}
                style={{ maxWidth: '76%', maxHeight: '80%', objectFit: 'contain', display: 'block' }}
              />
            )}
          </div>
        ))}
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
          {name}
        </p>
        <span style={{ fontSize: 13, fontWeight: 400, color: '#999', lineHeight: '18px' }}>
          {count} {unit}
        </span>
      </div>
    </div>
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

// ── Saved store card (full-width; shown in the Saved > Stores tab) ───────────
function SavedStoreCard({ store, onRemove }: { store: SavedStore; onRemove: () => void }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      style={{
        position: 'relative',
        background: '#0c0c0c',
        border: '1px solid #282828',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 150,
          background: '#ececec',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {imgError ? (
          <span
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#1a1a1a',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            {store.brand}
          </span>
        ) : (
          <img
            src={store.image}
            alt={store.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <span
          style={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            background: 'rgba(20,20,20,0.82)',
            color: '#f2f2f2',
            fontSize: 12,
            fontWeight: 500,
            padding: '3px 8px',
            borderRadius: 100,
            backdropFilter: 'blur(4px)',
          }}
        >
          {store.distance}
        </span>
      </div>
      <button
        onClick={onRemove}
        aria-label="Remove store from saved"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
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
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 18, fontVariationSettings: "'wght' 500, 'FILL' 1", color: '#ef4d63' }}
          aria-hidden
        >
          favorite
        </span>
      </button>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#f7f7f7',
            lineHeight: '20px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {store.name}
        </p>
        <p style={{ fontSize: 14, color: '#999', lineHeight: '18px', margin: 0 }}>{store.tagline}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#cfcfcf', flexShrink: 0 }} aria-hidden>
            location_on
          </span>
          <span
            style={{
              fontSize: 14,
              color: '#dedede',
              lineHeight: '20px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {store.address}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Saved sub-tab switcher (full-width segment control) ──────────────────────
type SavedTab = 'products' | 'collections' | 'stores';
function SavedSegments({
  tab,
  onChange,
}: {
  tab: SavedTab;
  onChange: (t: SavedTab) => void;
}) {
  const segs: { id: SavedTab; label: string }[] = [
    { id: 'products', label: 'Products' },
    { id: 'collections', label: 'Collections' },
    { id: 'stores', label: 'Stores' },
  ];
  return (
    <div style={{ padding: `4px ${PAGE}px 12px` }}>
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: '#141414',
          border: '1px solid #282828',
          borderRadius: 100,
          padding: 4,
        }}
      >
        {segs.map((s) => {
          const active = tab === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                background: active ? '#f6f6f6' : 'transparent',
                color: active ? '#121212' : '#999',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 200ms ease, color 200ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton illustration (fanned ghost cards for empty states) ──────────────
// A single shared illustration; the stack gently floats (no loading shimmer).
function SkeletonCards() {
  const cardW = 152;
  const Card = ({ rotate, dim }: { rotate: number; dim?: boolean }) => (
    <div
      style={{
        width: cardW,
        borderRadius: 14,
        background: '#101010',
        border: '1px solid #242424',
        padding: 9,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 10px 26px rgba(0,0,0,0.4)',
        opacity: dim ? 0.5 : 1,
      }}
    >
      <div style={{ height: 74, borderRadius: 9, background: '#1c1c1c', marginBottom: 9 }} />
      <div style={{ height: 8, borderRadius: 4, background: '#212121', width: '80%', marginBottom: 6 }} />
      <div style={{ height: 8, borderRadius: 4, background: '#181818', width: '52%' }} />
    </div>
  );
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 132,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
      }}
    >
      <div style={{ position: 'absolute', transform: 'translateX(-46px)' }}>
        <Card rotate={-9} dim />
      </div>
      <div style={{ position: 'absolute', transform: 'translateX(46px)' }}>
        <Card rotate={9} dim />
      </div>
      <div style={{ position: 'relative' }}>
        <Card rotate={0} />
      </div>
    </div>
  );
}

// ── Centered empty state (skeleton illustration + title + subtitle) ──────────
function CenteredEmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '58vh',
        padding: `0 32px`,
      }}
    >
      <SkeletonCards />
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0, lineHeight: '24px' }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: '#999', lineHeight: '20px', margin: '8px 0 0', maxWidth: 280 }}>
        {subtitle}
      </p>
    </div>
  );
}

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

// ── Card overflow-menu row ───────────────────────────────────────────────────
function MenuRow({
  icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  const color = destructive ? '#ef8a99' : '#f2f2f2';
  const iconColor = destructive ? '#ef8a99' : '#cfcfcf';
  return (
    <button
      role="menuitem"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '13px 16px',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        className="material-symbols-rounded"
        style={{ fontSize: 20, color: iconColor, fontVariationSettings: "'wght' 400", flexShrink: 0 }}
        aria-hidden
      >
        {icon}
      </span>
      <span style={{ fontSize: 14, fontWeight: 500, color, lineHeight: '18px', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </button>
  );
}

// ── Product card (Figma "Product Card" adapted to the dark theme) ────────────
function ProductCard({
  product,
  saved,
  onToggleSave,
  onOpen,
  onMoreLikeThis,
  onHide,
  menuOpen = false,
  onToggleMenu,
  onCloseMenu,
  width = 200,
  aspect = '4 / 3',
}: {
  product: Product;
  saved: boolean;
  onToggleSave: () => void;
  onOpen?: () => void;
  /** "..." menu → "More like this". Menu only renders when a handler is passed. */
  onMoreLikeThis?: () => void;
  /** "..." menu → "Do not recommend". */
  onHide?: () => void;
  /** Controlled menu state (lifted so only one card's menu is open at a time). */
  menuOpen?: boolean;
  onToggleMenu?: () => void;
  onCloseMenu?: () => void;
  width?: number | string;
  /** Image aspect ratio (defaults to 4:3). */
  aspect?: string;
}) {
  const isPlaceholder = product.image === '/vip-logo.svg';
  const showMenu = !!((onMoreLikeThis || onHide) && onToggleMenu);
  // The menu is portaled to <body> (fixed to the "..." button) so it escapes the
  // card + carousel overflow clipping ("menu shows behind the screen").
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  useEffect(() => {
    if (menuOpen && menuBtnRef.current) {
      const r = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }, [menuOpen]);
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
        scrollSnapAlign: 'start',
        cursor: onOpen ? 'pointer' : 'default',
      }}
    >
      {/* Image - light gray backdrop (#ececec) in both light and dark modes so
          products always sit on a consistent, gallery-like surface (Figma card). */}
      <div
        style={{
          width: '100%',
          aspectRatio: aspect,
          background: '#ececec',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {isPlaceholder ? (
          <img
            src="/vip-logo.svg"
            alt=""
            aria-hidden
            // darken the logo so it reads on the light-gray backdrop (medium gray)
            style={{ width: 64, height: 64, opacity: 0.3, filter: 'brightness(0)', display: 'block' }}
          />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            draggable={false}
            style={{ maxWidth: '72%', maxHeight: '82%', objectFit: 'contain', display: 'block' }}
          />
        )}
      </div>

      {/* Favorite icon button - rounded brand corners. Saved shows a filled
          accent-red heart; unsaved shows an outline heart. When the overflow
          menu is present, the heart sits inboard and "..." takes the corner. */}
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

      {/* Overflow "..." menu (takes the top-right corner; heart sits to its left) */}
      {showMenu && (
        <button
          ref={menuBtnRef}
          onClick={(e) => { e.stopPropagation(); onToggleMenu?.(); }}
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 100,
            background: menuOpen ? 'rgba(40,40,40,0.92)' : 'rgba(20,20,20,0.72)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            WebkitTapHighlightColor: 'transparent',
            zIndex: 6,
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#e7e7e7' }} aria-hidden>
            more_vert
          </span>
        </button>
      )}
      {showMenu && menuOpen && menuPos &&
        createPortal(
          <>
            {/* Full-screen tap-away catcher */}
            <div
              onClick={(e) => { e.stopPropagation(); onCloseMenu?.(); }}
              style={{ position: 'fixed', inset: 0, zIndex: 200 }}
            />
            <div
              role="menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: menuPos.top,
                right: menuPos.right,
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
              <MenuRow
                icon="thumb_up"
                label="More like this"
                onClick={() => { onCloseMenu?.(); onMoreLikeThis?.(); }}
              />
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <MenuRow
                icon="block"
                label="Do not recommend"
                destructive
                onClick={() => { onCloseMenu?.(); onHide?.(); }}
              />
            </div>
          </>,
          document.body,
        )}

      {/* Meta */}
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
          {product.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              fontWeight: 400,
              color: '#999',
              lineHeight: '18px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.brand}
          </span>
          {product.price && (
            <span style={{ fontSize: 13, fontWeight: 500, color: '#dedfe1', lineHeight: '18px', flexShrink: 0 }}>
              {product.price}
            </span>
          )}
        </div>
      </div>
    </div>
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
