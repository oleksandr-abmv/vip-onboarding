import { useMemo, useState } from 'react';
import { safeTop } from '../theme';
import { viewsOf, type Product } from '../data/products';
import { categoryConfigs, getSubcategories } from '../data/categoryConfig';
import HistoricalPrice from '../components/HistoricalPrice';
import MIcon from '../components/MIcon';
import NavIconButton from '../components/NavIconButton';
import ProductGallery from '../components/ProductGallery';
import WhereToBuy, { BoutiqueMapView } from '../components/WhereToBuy';
import { getPriceHistory } from '../data/priceHistory';
import { boutiquesFor } from '../data/boutiques';
import { isClothing } from '../data/collections';
import { shareContent, shareMessage } from '../data/share';
import { outlinedActionStyle, primaryActionStyle } from './screenChrome';
import BottomDock from '../components/BottomDock';
import type { ConciergePrompt } from './ChatScreen';

const PAGE = 16;

/**
 * The historical-price card is hidden for now. Nothing was deleted: the
 * component, its data and the price line it feeds are all still here, so
 * flipping this to `true` restores the chart exactly as it was.
 */
const SHOW_HISTORICAL_PRICE = false;

/** Nav height below the safe area: 10 top pad + 40 button + 20 bottom pad. */
const NAV_H = 70;

interface ProductPageProps {
  product: Product;
  /** In any collection - the heart manages membership via the sheet flow. */
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
  gender: string | null;
  /** Toast for actions with no destination yet (Virtual try-on). */
  onNotice?: (message: string) => void;
  /** The pinned prompt field's hand-off: a NEW chat with this piece attached. */
  onAskConcierge?: (prompt: ConciergePrompt) => void;
}

export default function ProductPage({
  product,
  saved,
  onToggleSave,
  onClose,
  gender,
  onNotice,
  onAskConcierge,
}: ProductPageProps) {
  const isPlaceholder = product.image === '/vip-logo.svg';
  /** Every view of the piece. One entry means the hero is a static image. */
  const views = useMemo(() => viewsOf(product), [product]);
  const categoryName = categoryConfigs[product.category]?.name || product.category;

  const subLabel = useMemo(() => {
    if (!product.subcategory) return null;
    const config = categoryConfigs[product.category];
    if (!config) return null;
    return getSubcategories(config, gender).find((s) => s.id === product.subcategory)?.label || null;
  }, [product, gender]);

  const genderLabel =
    product.gender === 'female' ? 'Women' : product.gender === 'male' ? 'Men' : 'Unisex';

  const tryOn = isClothing(product);

  // Derived bullet list when the product has no explicit spec bullets.
  const bullets = useMemo(() => {
    if (product.details?.length) return product.details;
    return [
      categoryName,
      subLabel,
      `Designed for ${genderLabel.toLowerCase()}`,
      'Concierge-sourced and authenticated',
    ].filter(Boolean) as string[];
  }, [product, categoryName, subLabel, genderLabel]);

  const specs: { label: string; value: string }[] = [
    { label: 'Brand', value: product.brand },
    { label: 'For', value: genderLabel },
    { label: 'Category', value: categoryName },
  ];

  // Where to buy. The list and the full-screen map share one dataset, and the
  // map is opened focused on whichever boutique was tapped.
  const boutiques = useMemo(() => boutiquesFor(product), [product]);
  const [mapFocus, setMapFocus] = useState<string | null>(null);

  // Price history drives both the "general price" line and the chart. Computed
  // once here and shared so the displayed price always matches the chart's today.
  const history = useMemo(() => getPriceHistory(product), [product]);
  const priceLabel = useMemo(
    () => '$' + history.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [history],
  );

  /** Same hand-off as the collection page's, one piece instead of a list. */
  const handleShare = async () => {
    const message = shareMessage(
      await shareContent({
        title: `${product.brand} ${product.name}`,
        text: `${product.brand} ${product.name} (${priceLabel})`,
        url: typeof window === 'undefined' ? '' : window.location.origin,
      }),
    );
    if (message) onNotice?.(message);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A0A',
      }}
    >
      {/* Nav: the only pinned element on the page. Everything else, hero image
          included, scrolls normally underneath it. A masked blur + colour
          gradient fades whatever passes below, so the icons stay legible over
          both the light hero and the dark body. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          padding: `${safeTop(10)} ${PAGE}px 20px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          // Scrolling passes through; the buttons re-enable pointer events.
          pointerEvents: 'none',
        }}
      >
        {/* Fade layer. The mask makes the blur itself taper off, so there is no
            hard edge where the effect stops. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.86) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0) 100%)',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <NavIconButton label="Back" onClick={onClose}>
          <span className="material-symbols-rounded" style={{ fontSize: 22, fontVariationSettings: "'wght' 300", color: '#f2f2f2' }} aria-hidden>
            arrow_left_alt
          </span>
        </NavIconButton>

        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: `calc(env(safe-area-inset-top, 0px) + 20px)`,
            transform: 'translateX(-50%)',
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          Details
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <NavIconButton label="Share" onClick={handleShare}>
            <span className="material-symbols-rounded" style={{ fontSize: 22, fontVariationSettings: "'wght' 300", color: '#f2f2f2' }} aria-hidden>
              share
            </span>
          </NavIconButton>
          <NavIconButton label={saved ? 'Manage in your collections' : 'Save to a collection'} onClick={onToggleSave}>
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 20,
                fontVariationSettings: saved ? "'wght' 500, 'FILL' 1" : "'wght' 300",
                color: saved ? '#ef4d63' : '#f2f2f2',
              }}
              aria-hidden
            >
              favorite
            </span>
          </NavIconButton>
        </div>
      </div>

      {/* Scroll body. Inset by the nav's height so the hero starts just below the
          nav instead of running up behind it; the dark page background fills that
          band. Everything still scrolls up under the nav from there. */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingTop: safeTop(NAV_H),
          // The pinned prompt field below carries the safe-area inset.
          paddingBottom: 28,
        }}
      >
        {/* Hero gallery. Not pinned: it scrolls straight up under the nav, so no
            slice of the light backdrop is left stranded behind the fade.
            Keyed by product so swiping to view 3 and opening another piece
            never lands mid-track. */}
        <ProductGallery
          key={product.image}
          images={views}
          alt={product.name}
          placeholder={isPlaceholder}
        />

        {/* Title + general price */}
        <div style={{ padding: `24px ${PAGE}px 0`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', lineHeight: '30px', margin: 0 }}>
            {product.brand} {product.name}
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, color: '#ededed', lineHeight: '26px', margin: 0 }}>
            {priceLabel}
          </p>
        </div>

        {/* Historical price (interactive chart, sits under the price). Starts
            collapsed; tapping its header row expands it.
            Keyed by product so it resets per item.

            HIDDEN FOR NOW. The component and its data are kept intact
            (src/components/HistoricalPrice.tsx, src/data/priceHistory.ts) - flip
            SHOW_HISTORICAL_PRICE back to true to bring the card back. The price
            line above still reads from the same history, so nothing else moves. */}
        {SHOW_HISTORICAL_PRICE && (
          <div style={{ padding: `16px ${PAGE}px 0` }}>
            <HistoricalPrice key={`${product.brand}-${product.name}`} product={product} history={history} />
          </div>
        )}

        {/* Actions: Virtual try-on (clothing only), then official retail. Exactly
            one filled primary - a car has nothing to try on, so that button is
            absent rather than dead and retail takes the filled slot. The concierge
            is not here; it is the prompt field pinned at the bottom. */}
        <div style={{ padding: `16px ${PAGE}px 0`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tryOn && (
            <button
              onClick={() => onNotice?.('Your virtual fitting room is being prepared')}
              style={primaryActionStyle}
            >
              <MIcon name="apparel" size={20} color="#121212" />
              Virtual try-on
            </button>
          )}
          <button style={tryOn ? outlinedActionStyle : primaryActionStyle}>
            Explore on Official Site
          </button>
        </div>

        {/* Description */}
        <div style={{ padding: `24px ${PAGE}px 0`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#c8c8c8', lineHeight: '22px', margin: 0 }}>
            {product.description}
          </p>
          {bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 22, listStyleType: 'disc', listStylePosition: 'outside' }}>
              {bullets.map((b, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    color: '#c8c8c8',
                    lineHeight: '22px',
                    marginBottom: i < bullets.length - 1 ? 8 : 0,
                  }}
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Spec table */}
        <div style={{ padding: `24px ${PAGE}px 0` }}>
          <div style={{ height: 1, background: '#282828' }} />
          {specs.map((row, i) => (
            <div key={row.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '10px 0' }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#999', lineHeight: '22px', flexShrink: 0 }}>
                  {row.label}
                </span>
                <span style={{ fontSize: 16, fontWeight: 400, color: '#f2f2f2', lineHeight: '22px', textAlign: 'right' }}>
                  {row.value}
                </span>
              </div>
              {i < specs.length - 1 && <div style={{ height: 1, background: '#1c1c1c' }} />}
            </div>
          ))}
          <div style={{ height: 1, background: '#282828' }} />
        </div>

        {/* Section divider */}
        <div style={{ height: 6, background: '#141414', marginTop: 24 }} />

        {/* Where to buy */}
        <WhereToBuy boutiques={boutiques} onOpenMap={setMapFocus} onNotice={onNotice} />

      </div>

      {/* The concierge, as a prompt field rather than a button - the same call the
          collection page makes. What you want to ask about a piece is specific
          ("does this come in black?"), so it goes in one step instead of landing
          in an empty chat. Sending starts a NEW chat with the piece attached. */}
      {onAskConcierge && (
        <BottomDock
          // Leads with the thing the concierge does that browsing cannot: hand
          // back a whole set of pieces that go with this one. An empty send
          // asks for exactly that, since it is the likeliest reason to open the
          // field without knowing what to type.
          placeholderPrefix="Ask me"
          placeholder={['for pieces like this', 'where to buy it', 'about this piece']}
          ariaLabel="Ask AI Concierge"
          showAttach={false}
          onSend={(text) =>
            onAskConcierge({
              text: text.trim() || 'Find me pieces like this one',
              attachment: {
                title: `${product.brand} ${product.name}`,
                subtitle: priceLabel,
                images: [product.image],
                target: { kind: 'product', name: product.name },
              },
            })
          }
        />
      )}

      {/* Full-screen map, over the page. Sits outside the scroll body so it is
          pinned rather than scrolling with it. */}
      {mapFocus !== null && (
        <BoutiqueMapView
          boutiques={boutiques}
          initialId={mapFocus}
          onClose={() => setMapFocus(null)}
          onNotice={onNotice}
        />
      )}

    </div>
  );
}
