import { useMemo, useState } from 'react';
import { safeTop } from '../theme';
import { type Product } from '../data/products';
import { categoryConfigs, getSubcategories } from '../data/categoryConfig';

const PAGE = 16;

interface ProductPageProps {
  product: Product;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
  gender: string | null;
  /** Fire a snackbar (shared with the feed) for favorite actions. */
  onNotify?: (message: string, actionLabel: string, onAction: () => void) => void;
}

type Store = {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  distance: string;
  image: string;
};

// Real storefront photos pulled from the internet (keyword-matched, stable per
// `lock`). Falls back to the brand wordmark if a photo fails to load.
const STORE_IMAGES = [
  'https://loremflickr.com/600/400/boutique,storefront/?lock=27',
  'https://loremflickr.com/600/400/luxury,boutique,facade/?lock=54',
];

// Mock boutiques for a product, keyed off its brand. Prototype data - stands in
// for a "where to buy" lookup.
function storesFor(product: Product): Store[] {
  return [
    {
      name: `${product.brand} Flagship`,
      tagline: 'Flagship boutique',
      address: '31 Rue Cambon, Paris',
      phone: '+33 142-68-3700',
      distance: '1km from you',
      image: STORE_IMAGES[0],
    },
    {
      name: `${product.brand} Madison Ave`,
      tagline: 'Concept store',
      address: '680 Madison Ave, New York',
      phone: '+1 212-555-0142',
      distance: '2km from you',
      image: STORE_IMAGES[1],
    },
  ];
}

export default function ProductPage({ product, saved, onToggleSave, onClose, gender, onNotify }: ProductPageProps) {
  const isPlaceholder = product.image === '/vip-logo.svg';
  const categoryName = categoryConfigs[product.category]?.name || product.category;

  const subLabel = useMemo(() => {
    if (!product.subcategory) return null;
    const config = categoryConfigs[product.category];
    if (!config) return null;
    return getSubcategories(config, gender).find((s) => s.id === product.subcategory)?.label || null;
  }, [product, gender]);

  const genderLabel =
    product.gender === 'female' ? 'Women' : product.gender === 'male' ? 'Men' : 'Unisex';

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

  const stores = useMemo(() => storesFor(product), [product]);

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
      {/* Nav bar: back / Details / share + heart */}
      <div
        style={{
          flexShrink: 0,
          padding: `${safeTop(10)} ${PAGE}px 10px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          position: 'relative',
        }}
      >
        <NavIconButton label="Back" onClick={onClose}>
          <span className="material-symbols-rounded" style={{ fontSize: 22, fontVariationSettings: "'wght' 300", color: '#f2f2f2' }} aria-hidden>
            arrow_left_alt
          </span>
        </NavIconButton>

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
          Details
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <NavIconButton label="Share">
            <span className="material-symbols-rounded" style={{ fontSize: 22, fontVariationSettings: "'wght' 300", color: '#f2f2f2' }} aria-hidden>
              share
            </span>
          </NavIconButton>
          <NavIconButton label={saved ? 'Remove from saved' : 'Save to favorites'} onClick={onToggleSave}>
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

      {/* Scroll body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        {/* Hero image */}
        <div
          style={{
            width: '100%',
            height: 250,
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
              style={{ width: 88, height: 88, opacity: 0.3, filter: 'brightness(0)', display: 'block' }}
            />
          ) : (
            <img
              src={product.image}
              alt={product.name}
              style={{ maxWidth: '78%', maxHeight: '86%', objectFit: 'contain', display: 'block' }}
            />
          )}
        </div>

        {/* Title + price (CTAs are pinned to the bottom bar) */}
        <div style={{ padding: `24px ${PAGE}px 0`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', lineHeight: '30px', margin: 0 }}>
            {product.brand} {product.name}
          </h1>
          {product.price && (
            <p style={{ fontSize: 16, fontWeight: 500, color: '#bdbdbd', lineHeight: '22px', margin: 0 }}>
              {product.price}
            </p>
          )}
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

        {/* Available in stores */}
        <div style={{ padding: `20px 0 8px` }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, padding: `0 ${PAGE}px`, lineHeight: '24px' }}>
            Available in stores
          </h2>
          <div
            style={{
              display: 'flex',
              gap: 16,
              overflowX: 'auto',
              padding: `16px ${PAGE}px 0`,
              scrollPadding: `0 ${PAGE}px`,
              scrollSnapType: 'x proximity',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {stores.map((store) => (
              <StoreCard key={store.name} store={store} brand={product.brand} onNotify={onNotify} />
            ))}
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Pinned bottom action bar */}
      <div
        style={{
          flexShrink: 0,
          background: '#0A0A0A',
          borderTop: '1px solid #1c1c1c',
          padding: `12px ${PAGE}px calc(16px + env(safe-area-inset-bottom, 0px))`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <button
          style={{
            width: '100%',
            height: 48,
            background: '#f6f6f6',
            color: '#121212',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Explore on Official Site
        </button>
        <button
          style={{
            width: '100%',
            height: 48,
            background: 'transparent',
            color: '#f6f6f6',
            border: '1px solid #3a3a3a',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Ask VIP.ai
        </button>
      </div>
    </div>
  );
}

// ── Circular nav icon button (matches the Figma product-page nav) ────────────
function NavIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid #282828',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

// ── Store / boutique card ────────────────────────────────────────────────────
function StoreCard({
  store,
  brand,
  onNotify,
}: {
  store: Store;
  brand: string;
  onNotify?: (message: string, actionLabel: string, onAction: () => void) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const toggle = () => {
    const next = !saved;
    setSaved(next);
    onNotify?.(next ? 'Saved to your list' : 'Removed from your list', 'Undo', () => setSaved(!next));
  };
  return (
    <div
      style={{
        position: 'relative',
        width: 264,
        flexShrink: 0,
        background: '#0c0c0c',
        border: '1px solid #282828',
        borderRadius: 16,
        overflow: 'hidden',
        scrollSnapAlign: 'start',
      }}
    >
      {/* Store image - real storefront photo (falls back to a brand wordmark). */}
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
              lineHeight: 1.25,
              padding: '0 20px',
            }}
          >
            {brand}
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
        {/* Distance tag */}
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

      {/* Favorite icon button */}
      <button
        onClick={toggle}
        aria-label={saved ? 'Remove store from saved' : 'Save store'}
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
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        <InfoRow icon="location_on" text={store.address} />
        <InfoRow icon="call" text={store.phone} />
      </div>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#cfcfcf', flexShrink: 0 }} aria-hidden>
        {icon}
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
        {text}
      </span>
    </div>
  );
}
