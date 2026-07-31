import { useMemo, useState } from 'react';
import MIcon from './MIcon';
import NavIconButton from './NavIconButton';
import StoreMap from './StoreMap';
import { formatDistance, type Boutique } from '../data/boutiques';
import { FULL_REGION, PREVIEW_REGION } from '../data/mapCanvas';
import { safeBottom, safeTop, theme } from '../theme';

// ─── Where to buy ────────────────────────────────────────────────────────────
//
// The product page's stockist section, and the full-screen map behind it.
//
// Shape: a map preview, filter chips, then one row per boutique - name, address,
// hours, stock and a distance / contacts pair. Boutiques carry NO photography:
// a storefront picture said nothing about whether the piece is there today, and
// it doubled the height of every row. Everything that decides where you go is
// text.
//
// Distances and pins come from the same coordinates (`src/data/boutiques.ts`),
// so the list and the map always agree.

const PAGE = 16;
const OPEN_TONE = '#82ed9a';
const CLOSED_TONE = '#dc8589';
const BORDER = '#282828';
const SURFACE = '#101111';

// Buttons here are deliberately quiet. The page already spends its one filled
// button on Virtual try-on / Ask AI Concierge, so a row action is a soft fill
// and its sibling is outlined - the pair reads without shouting down the page.
const rowButtonBase: React.CSSProperties = {
  height: 40,
  borderRadius: theme.radii.button,
  fontSize: 14,
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};
const softButtonStyle: React.CSSProperties = {
  ...rowButtonBase,
  background: '#1f2022',
  border: '1px solid transparent',
  color: '#f6f6f6',
};
const outlinedButtonStyle: React.CSSProperties = {
  ...rowButtonBase,
  background: 'transparent',
  border: `1px solid #313131`,
  color: '#f6f6f6',
};

type FilterId = 'nearest' | 'open' | 'stock';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'nearest', label: 'Nearest to me' },
  { id: 'open', label: 'Open now' },
  { id: 'stock', label: 'In stock' },
];

/** How many rows before "Show all". */
const PREVIEW_COUNT = 3;

export default function WhereToBuy({
  boutiques,
  onOpenMap,
  onNotice,
}: {
  boutiques: Boutique[];
  /** Opens the full-screen map focused on this boutique. */
  onOpenMap: (id: string) => void;
  onNotice?: (message: string) => void;
}) {
  // "Nearest to me" is a sort, the other two are filters. With it off the list
  // falls back to relevance - in stock and open first - which is a different
  // and useful order, so the chip is never a no-op.
  const [active, setActive] = useState<FilterId[]>(['nearest']);
  const [showAll, setShowAll] = useState(false);
  const [contactsFor, setContactsFor] = useState<string | null>(null);

  const toggle = (id: FilterId) =>
    setActive((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  const list = useMemo(() => {
    const filtered = boutiques.filter(
      (b) => (!active.includes('open') || b.openNow) && (!active.includes('stock') || b.inStock),
    );
    return [...filtered].sort((a, b) =>
      active.includes('nearest')
        ? a.distanceKm - b.distanceKm
        : Number(b.inStock) - Number(a.inStock) ||
          Number(b.openNow) - Number(a.openNow) ||
          a.distanceKm - b.distanceKm,
    );
  }, [boutiques, active]);

  const nearestId = useMemo(
    () => [...boutiques].sort((a, b) => a.distanceKm - b.distanceKm)[0]?.id,
    [boutiques],
  );

  const visible = showAll ? list : list.slice(0, PREVIEW_COUNT);

  return (
    <div style={{ padding: `20px 0 8px` }}>
      <div style={{ padding: `0 ${PAGE}px`, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, lineHeight: '24px' }}>
          Where to buy
        </h2>
        <p style={{ fontSize: 14, color: '#999', margin: 0, lineHeight: '20px' }}>
          {boutiques.length} boutiques near you
        </p>
      </div>

      {/* Map preview. The whole card opens the map, so the pins here are not
          individually tappable - one target, no mis-taps. */}
      <div style={{ padding: `16px ${PAGE}px 0` }}>
        <button
          onClick={() => onOpenMap(nearestId)}
          aria-label="View boutiques on the map"
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            height: 168,
            padding: 0,
            border: `1px solid ${BORDER}`,
            borderRadius: theme.radii.card,
            overflow: 'hidden',
            background: '#131415',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <StoreMap
            boutiques={boutiques}
            region={PREVIEW_REGION}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          />
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0) 45%, rgba(10,10,10,0.45) 100%)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 16px',
              borderRadius: theme.radii.button,
              background: 'rgba(18,18,18,0.72)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              color: '#f6f6f6',
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            <MIcon name="map" size={18} color="#f6f6f6" />
            View on map
          </span>
        </button>
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: `16px ${PAGE}px 0`,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {FILTERS.map((f) => {
          const on = active.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              aria-pressed={on}
              style={{
                flexShrink: 0,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: on ? '0 14px 0 10px' : '0 14px',
                borderRadius: theme.radii.chip,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                background: on ? '#2f2f31' : SURFACE,
                border: on ? '1px solid transparent' : `1px solid #313131`,
                color: on ? '#f8f8f8' : '#c8c8c8',
                transition: 'background 200ms, border-color 200ms, color 200ms',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {on && <MIcon name="check" size={16} color="#f8f8f8" weight={400} />}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Rows */}
      {list.length === 0 ? (
        <div style={{ padding: `24px ${PAGE}px 8px`, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#999', margin: '0 0 12px', lineHeight: '20px' }}>
            No boutique matches these filters.
          </p>
          <button
            onClick={() => setActive([])}
            style={{ ...outlinedButtonStyle, flex: 'none', display: 'inline-flex', padding: '0 20px' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: `16px ${PAGE}px 0` }}>
          {visible.map((b) => (
            <BoutiqueRow
              key={b.id}
              boutique={b}
              closest={b.id === nearestId}
              contactsOpen={contactsFor === b.id}
              onToggleContacts={() => setContactsFor((prev) => (prev === b.id ? null : b.id))}
              onOpenMap={() => onOpenMap(b.id)}
              onNotice={onNotice}
            />
          ))}
        </div>
      )}

      {list.length > PREVIEW_COUNT && (
        <div style={{ padding: `12px ${PAGE}px 0` }}>
          <button onClick={() => setShowAll((v) => !v)} style={{ ...outlinedButtonStyle, width: '100%', height: 44 }}>
            {showAll ? 'Show less' : `Show all ${list.length} boutiques`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── One boutique ────────────────────────────────────────────────────────────

function BoutiqueRow({
  boutique,
  closest,
  contactsOpen,
  onToggleContacts,
  onOpenMap,
  onNotice,
}: {
  boutique: Boutique;
  closest: boolean;
  contactsOpen: boolean;
  onToggleContacts: () => void;
  onOpenMap: () => void;
  onNotice?: (message: string) => void;
}) {
  return (
    <div
      style={{
        background: '#0c0c0c',
        border: `1px solid ${BORDER}`,
        borderRadius: theme.radii.card,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Tapping the details opens the map on this boutique. */}
      <button
        onClick={onOpenMap}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 16,
              fontWeight: 600,
              color: '#f7f7f7',
              lineHeight: '22px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {boutique.name}
          </span>
          {closest && <Tag label="Closest" tone="good" />}
        </span>
        <BoutiqueMeta boutique={boutique} />
      </button>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onOpenMap}
          style={{ ...softButtonStyle, flex: 1, minWidth: 0 }}
          aria-label={`${formatDistance(boutique.distanceKm)} away, view on map`}
        >
          <MIcon name="near_me" size={18} color="#f6f6f6" />
          {formatDistance(boutique.distanceKm)}
        </button>
        <button
          onClick={onToggleContacts}
          aria-expanded={contactsOpen}
          style={{ ...outlinedButtonStyle, flex: 1, minWidth: 0 }}
        >
          Contacts
          <MIcon
            name="keyboard_arrow_down"
            size={18}
            color="#f6f6f6"
            style={{
              transform: contactsOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          />
        </button>
      </div>

      {contactsOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            animation: 'fadeInUp 200ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        >
          <ContactButton
            icon="call"
            label={boutique.phone}
            onClick={() => onNotice?.(`Calling ${boutique.name}`)}
          />
          <ContactButton
            icon="mail"
            label={boutique.email}
            onClick={() => onNotice?.(`Opening a message to ${boutique.name}`)}
          />
        </div>
      )}
    </div>
  );
}

/** Address, hours and stock - the three lines that decide where you go. */
function BoutiqueMeta({ boutique, compact = false }: { boutique: Boutique; compact?: boolean }) {
  return (
    <>
      <span style={{ fontSize: 14, color: '#999', lineHeight: '20px' }}>
        {compact ? boutique.address : `${boutique.kind} · ${boutique.address}`}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <MIcon name="schedule" size={16} color="#cfcfcf" />
        <span style={{ fontSize: 14, color: '#cfcfcf', lineHeight: '20px' }}>{boutique.hours}</span>
        <span style={{ color: '#4a4a4a' }}>·</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: boutique.openNow ? OPEN_TONE : CLOSED_TONE,
            lineHeight: '20px',
          }}
        >
          {boutique.openNow ? 'Open now' : 'Closed'}
        </span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <MIcon name="inventory_2" size={16} color={boutique.inStock ? '#cfcfcf' : '#8a8a8a'} />
        <span
          style={{
            fontSize: 14,
            color: boutique.inStock ? '#cfcfcf' : '#8a8a8a',
            lineHeight: '20px',
          }}
        >
          {boutique.inStock ? 'In stock' : 'Available to order'}
        </span>
      </span>
    </>
  );
}

function Tag({ label, tone }: { label: string; tone: 'good' | 'muted' }) {
  const good = tone === 'good';
  return (
    <span
      style={{
        flexShrink: 0,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        borderRadius: theme.radii.chip,
        fontSize: 12,
        fontWeight: 500,
        background: good ? 'rgba(130,237,154,0.12)' : '#2f2f31',
        color: good ? OPEN_TONE : '#c8c8c8',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function ContactButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ ...outlinedButtonStyle, width: '100%', justifyContent: 'flex-start', padding: '0 14px', gap: 10 }}
    >
      <MIcon name={icon} size={18} color="#cfcfcf" />
      <span
        style={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Full-screen map ─────────────────────────────────────────────────────────
//
// Figma reference: the map view with a pinned detail card (Chatoshi 172-60775),
// re-tone for the dark theme. Pins select; the card below always describes one
// boutique, and its actions are Directions / Call / Email.

export function BoutiqueMapView({
  boutiques,
  initialId,
  onClose,
  onNotice,
}: {
  boutiques: Boutique[];
  initialId: string | null;
  onClose: () => void;
  onNotice?: (message: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const selected = boutiques.find((b) => b.id === selectedId) || boutiques[0];
  if (!selected) return null;

  const nearestId = [...boutiques].sort((a, b) => a.distanceKm - b.distanceKm)[0]?.id;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 90,
        background: '#0f1011',
        animation: 'fadeIn 200ms ease both',
      }}
    >
      <StoreMap
        boutiques={boutiques}
        region={FULL_REGION}
        selectedId={selected.id}
        onSelect={setSelectedId}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Top scrim, so the back button stays legible over any part of the map. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(10,10,10,0))',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', top: safeTop(10), left: PAGE, pointerEvents: 'none' }}>
        <NavIconButton label="Back" onClick={onClose}>
          <MIcon name="arrow_left_alt" size={22} color="#f2f2f2" />
        </NavIconButton>
      </div>

      {/* Detail card */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0d0d0d',
          borderTop: `1px solid ${BORDER}`,
          borderRadius: `${theme.radii.card} ${theme.radii.card} 0 0`,
          padding: `10px ${PAGE}px ${safeBottom(20)}`,
          animation: 'sheetSlideUp 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        <div
          aria-hidden
          style={{ width: 36, height: 4, borderRadius: 100, background: '#3a3a3a', margin: '0 auto 14px' }}
        />
        {/* Keyed so switching pins re-plays the card. */}
        <div
          key={selected.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            animation: 'fadeInUp 200ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 20,
                fontWeight: 600,
                color: '#fff',
                lineHeight: '26px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selected.name}
            </span>
            {selected.id === nearestId && <Tag label="Closest" tone="good" />}
          </div>
          <BoutiqueMeta boutique={selected} compact />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <button
              onClick={() => onNotice?.(`Opening directions to ${selected.name}`)}
              style={{
                ...rowButtonBase,
                width: '100%',
                height: 44,
                fontSize: 15,
                background: '#f6f6f6',
                border: 'none',
                color: '#121212',
              }}
            >
              <MIcon name="near_me" size={20} color="#121212" />
              Directions · {formatDistance(selected.distanceKm)}
            </button>
            <ContactButton
              icon="call"
              label={selected.phone}
              onClick={() => onNotice?.(`Calling ${selected.name}`)}
            />
            <ContactButton
              icon="mail"
              label={selected.email}
              onClick={() => onNotice?.(`Opening a message to ${selected.name}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
