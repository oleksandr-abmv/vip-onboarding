import { useMemo, useState, useRef, useEffect } from 'react';
import { safeTop } from '../theme';
import PRODUCTS, { type Product } from '../data/products';
import { categoryConfigs } from '../data/categoryConfig';
import ProductPage from './ProductPage';

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
}

type FeedSection = { id: string; name: string; items: Product[] };
// A "See all" detail view: either a category or the saved list.
type Detail = { kind: 'category'; id: string; name: string } | { kind: 'saved' };
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

function genderFilter(items: Product[], gender: string | null): Product[] {
  if (gender === 'male' || gender === 'female') {
    const g = items.filter((p) => !p.gender || p.gender === 'unisex' || p.gender === gender);
    if (g.length > 0) return g;
  }
  return items;
}

export default function FeedScreen({
  gender,
  selectedInterests,
  savedProducts,
  onSavedChange,
  onboardingPct,
  onboardingComplete,
  onResumeOnboarding,
}: FeedScreenProps) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [snack, setSnack] = useState<Snack | null>(null);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [savedFilter, setSavedFilter] = useState<string>('all');

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

  // ── "See all" detail view (per-category / saved grid) ─────────────────────
  if (detail) {
    const isSavedView = detail.kind === 'saved';
    // Categories present across saved items - drives the filter chips.
    const savedCats = isSavedView
      ? Array.from(new Set(savedItems.map((p) => p.category)))
      : [];
    const activeFilter = savedCats.includes(savedFilter) ? savedFilter : 'all';
    const detailItems = isSavedView
      ? activeFilter === 'all'
        ? savedItems
        : savedItems.filter((p) => p.category === activeFilter)
      : genderFilter(PRODUCTS.filter((p) => p.category === detail.id), gender);
    const detailTitle = isSavedView ? 'Saved Products' : `All ${detail.name}`;
    return (
      <div style={screenStyle}>
        {/* Saved is a top-level tab, so no back button; category "See all" keeps one. */}
        <Header title={detailTitle} onBack={isSavedView ? undefined : () => setDetail(null)} />
        <div ref={bodyRef} style={{ ...bodyStyle }}>
          {isSavedView && savedItems.length > 0 && (
            <FilterChips categories={savedCats} active={activeFilter} onChange={setSavedFilter} />
          )}
          {detailItems.length > 0 ? (
            <div
              style={
                isSavedView
                  ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: `4px ${PAGE}px ${PAGE}px` }
                  : { display: 'flex', flexDirection: 'column', gap: 16, padding: PAGE }
              }
            >
              {detailItems.map((product) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  saved={isSaved(product.name)}
                  onToggleSave={() => toggleSave(product.name)}
                  onOpen={() => setOpenProduct(product)}
                  width="100%"
                  badge={isSavedView ? categoryConfigs[product.category]?.name || product.category : undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyNote text="Nothing here yet. Tap the heart on any piece to save it." />
          )}
        </div>
        {snack && (
          <Snackbar
            key={snack.id}
            message={snack.message}
            actionLabel={snack.actionLabel}
            onAction={snack.onAction}
            bottom={openProduct ? `calc(145px + env(safe-area-inset-bottom, 0px))` : undefined}
          />
        )}
        <BottomBar
          active={detail.kind === 'saved' ? 'saved' : 'home'}
          onHome={() => setDetail(null)}
          onSaved={() => { setSavedFilter('all'); setDetail({ kind: 'saved' }); }}
        />
        {openProduct && (
          <ProductPage
            product={openProduct}
            saved={isSaved(openProduct.name)}
            onToggleSave={() => toggleSave(openProduct.name)}
            onClose={() => setOpenProduct(null)}
            gender={gender}
          />
        )}
      </div>
    );
  }

  // Discover feed - a Pinterest-style masonry. Products are dealt alternately into
  // two columns (so categories mix), then varied card heights + a small offset on
  // the right column make the layout uneven.
  const feedItems = sections.flatMap((s) => s.items);
  const feedCols: Product[][] = [[], []];
  feedItems.forEach((p, i) => feedCols[i % 2].push(p));

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

        {/* Pinterest-style masonry: two columns, the right one offset lower. */}
        {sections.length > 0 ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: `12px ${PAGE}px ${PAGE}px` }}>
            {feedCols.map((col, ci) => (
              <div
                key={ci}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  marginTop: ci === 1 ? 28 : 0,
                }}
              >
                {col.map((product) => (
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
            ))}
          </div>
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
          bottom={openProduct ? `calc(145px + env(safe-area-inset-bottom, 0px))` : undefined}
        />
      )}
      <BottomBar
        active="home"
        onHome={() => setDetail(null)}
        onSaved={() => setDetail({ kind: 'saved' })}
      />
      {openProduct && (
        <ProductPage
          product={openProduct}
          saved={isSaved(openProduct.name)}
          onToggleSave={() => toggleSave(openProduct.name)}
          onClose={() => setOpenProduct(null)}
          gender={gender}
          onNotify={showSnack}
        />
      )}
    </div>
  );
}

// ── Shared layout styles ─────────────────────────────────────────────────────
const screenStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  background: 'transparent',
  overflow: 'hidden',
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
  // clears the fixed bottom bar
  paddingBottom: `calc(76px + env(safe-area-inset-bottom, 0px))`,
};

// ── Header (optional back arrow + centered title) ────────────────────────────
function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: `${safeTop(12)} 8px 12px`,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        height: 56,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 24, fontVariationSettings: "'wght' 300", color: '#fff' }}
            aria-hidden
          >
            arrow_back
          </span>
        </button>
      )}
      <span
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 16,
          fontWeight: 600,
          color: '#fff',
        }}
      >
        {title}
      </span>
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

// ── Category filter chips (horizontal scroll, used on the Saved view) ────────
function FilterChips({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
}) {
  const chips = ['all', ...categories];
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: `12px ${PAGE}px 8px`,
        scrollPadding: `0 ${PAGE}px`,
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {chips.map((c) => {
        const isActive = c === active;
        const label = c === 'all' ? 'All' : categoryConfigs[c]?.name || c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: 100,
              border: isActive ? '1px solid #f6f6f6' : '1px solid #2a2a2a',
              background: isActive ? '#f6f6f6' : 'rgba(255,255,255,0.04)',
              color: isActive ? '#121212' : '#cfcfcf',
              fontSize: 13,
              fontWeight: 500,
              lineHeight: '16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Product card (Figma "Product Card" adapted to the dark theme) ────────────
function ProductCard({
  product,
  saved,
  onToggleSave,
  onOpen,
  width = 200,
  badge,
  aspect = '4 / 3',
}: {
  product: Product;
  saved: boolean;
  onToggleSave: () => void;
  onOpen?: () => void;
  width?: number | string;
  /** Optional category badge shown below the brand (e.g. in the saved grid). */
  badge?: string;
  /** Image aspect ratio - varied on the feed masonry to stagger the columns. */
  aspect?: string;
}) {
  const isPlaceholder = product.image === '/vip-logo.svg';
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
          accent-red heart; unsaved shows an outline heart. */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        aria-label={saved ? 'Remove from saved' : 'Save to favorites'}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: 12,
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
        {badge && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 8,
              maxWidth: '100%',
              padding: '3px 9px',
              borderRadius: 100,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid #2a2a2a',
              fontSize: 11,
              fontWeight: 500,
              color: '#bdbdbd',
              lineHeight: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Bottom navigation bar (Figma bottomBarLocal, dark) ───────────────────────
function BottomBar({
  active,
  onHome,
  onSaved,
}: {
  active: 'home' | 'saved';
  onHome: () => void;
  onSaved: () => void;
}) {
  const tabs: {
    icon: string;
    label: string;
    active?: boolean;
    center?: boolean;
    onClick?: () => void;
  }[] = [
    { icon: 'home', label: 'Home', active: active === 'home', onClick: onHome },
    { icon: 'favorite', label: 'Saved', active: active === 'saved', onClick: onSaved },
    { icon: 'chat_bubble', label: 'Concierge', center: true },
    { icon: 'history', label: 'History' },
    { icon: 'more_vert', label: 'More' },
  ];
  return (
    <div
      style={{
        flexShrink: 0,
        background: '#0d0d0d',
        borderTop: '1px solid #282828',
        paddingTop: 8,
        paddingBottom: `calc(10px + env(safe-area-inset-bottom, 0px))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `8px ${PAGE}px calc(10px + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      {tabs.map((t) =>
        t.center ? (
          <button
            key={t.label}
            aria-label={t.label}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#f6f6f6',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ fontSize: 22, fontVariationSettings: "'wght' 400", color: '#121212' }}
              aria-hidden
            >
              {t.icon}
            </span>
          </button>
        ) : (
          <button
            key={t.label}
            aria-label={t.label}
            onClick={t.onClick}
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 24,
                fontVariationSettings: t.active ? "'wght' 400, 'FILL' 1" : "'wght' 300",
                color: t.active ? '#fff' : '#6f6f6f',
              }}
              aria-hidden
            >
              {t.icon}
            </span>
          </button>
        ),
      )}
    </div>
  );
}

// ── Snackbar (Figma hint/snackbar - text + action, floats above the bottom bar) ─
function Snackbar({
  message,
  actionLabel,
  onAction,
  bottom = `calc(71px + env(safe-area-inset-bottom, 0px))`,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  /** Distance from the bottom - raised when the product-page action bar is open. */
  bottom?: string;
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
        zIndex: 90,
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
          borderRadius: 12,
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
