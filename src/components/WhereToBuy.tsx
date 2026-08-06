import { useMemo, useState } from 'react';
import MIcon from './MIcon';
import NavIconButton from './NavIconButton';
import Sheet from './Sheet';
import StoreMap from './StoreMap';
import { formatDistance, type Boutique } from '../data/boutiques';
import { FULL_REGION, PREVIEW_REGION } from '../data/mapCanvas';
import { safeBottom, safeTop, theme } from '../theme';

// ─── Where to buy ────────────────────────────────────────────────────────────
//
// The product page's stockist section, and the full-screen map behind it.
//
// Shape (Figma node 977-7694): a map preview, then a horizontal rail of store
// cards - image, a distance tag, name, kind, address and phone. Tapping a card
// opens that boutique's bottom sheet (node 602-10054), which carries the only
// two things you do next: get directions, or call.
//
// No boutique has photography of its own, so the card's image area is the VIP
// logotype placeholder the rest of the app uses for missing imagery, exactly as
// the first card in the design is drawn. Boutiques stay **not saveable**: the
// design's card carries a heart, but nothing in the app saves a store, so that
// control is left off rather than shipped dead.
//
// Distances and pins come from the same coordinates (`src/data/boutiques.ts`),
// so the rail and the map always agree.

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
const outlinedButtonStyle: React.CSSProperties = {
  ...rowButtonBase,
  background: 'transparent',
  border: `1px solid #313131`,
  color: '#f6f6f6',
};

/** Store card, per the design: a 264px card with a 176px image above its text. */
const CARD_W = 264;
const CARD_IMAGE_H = 176;

/** The sheet's two actions: full width, 48px, and pills like every other button. */
const sheetActionBase: React.CSSProperties = {
  height: 48,
  width: '100%',
  borderRadius: theme.radii.button,
  border: '1px solid transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontSize: 16,
  fontWeight: 500,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

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
  /** The boutique whose sheet is open. */
  const [openId, setOpenId] = useState<string | null>(null);

  // Nearest first. The rail is read left to right, so the closest boutique is
  // the card already on screen rather than one you have to scroll for.
  const list = useMemo(
    () => [...boutiques].sort((a, b) => a.distanceKm - b.distanceKm),
    [boutiques],
  );

  const nearestId = list[0]?.id;
  const selected = list.find((b) => b.id === openId) || null;

  return (
    <div style={{ padding: `20px 0 8px` }}>
      <div style={{ padding: `0 ${PAGE}px`, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, lineHeight: '24px' }}>
          Available in stores
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

      {/* Store rail. Every boutique is a card; the section no longer filters,
          because the card shows distance and nothing else to filter on. */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: `16px ${PAGE}px 0`,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {list.map((b) => (
          <StoreCard key={b.id} boutique={b} onOpen={() => setOpenId(b.id)} />
        ))}
      </div>

      {/* One boutique, and the two things you do about it. */}
      {selected && (
        <StoreSheet
          boutique={selected}
          onClose={() => setOpenId(null)}
          onDirections={() => {
            setOpenId(null);
            onOpenMap(selected.id);
          }}
          onNotice={onNotice}
        />
      )}
    </div>
  );
}

// ─── Store card ──────────────────────────────────────────────────────────────

function StoreCard({ boutique, onOpen }: { boutique: Boutique; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: CARD_W,
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        textAlign: 'left',
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: theme.radii.card,
        overflow: 'hidden',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Image. No boutique has a photograph of its own, so this is the app's
          one placeholder for missing imagery rather than an invented shot. */}
      <span
        style={{
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: CARD_IMAGE_H,
          background: '#141516',
        }}
      >
        <img
          src="/vip-logo.svg"
          alt=""
          aria-hidden
          style={{ width: 48, height: 48, opacity: 0.35, display: 'block' }}
        />
        <span
          style={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            display: 'flex',
            alignItems: 'center',
            height: 26,
            padding: '0 10px',
            borderRadius: theme.radii.chip,
            background: 'rgba(18,18,18,0.72)',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            fontSize: 14,
            fontWeight: 500,
            color: '#f6f6f6',
            whiteSpace: 'nowrap',
          }}
        >
          {formatDistance(boutique.distanceKm)} from you
        </span>
      </span>

      <span style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16, minWidth: 0 }}>
        <span
          style={{
            fontSize: 18,
            fontWeight: 500,
            lineHeight: '22px',
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {boutique.name}
        </span>
        <span style={{ fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#999' }}>
          {boutique.kind}
        </span>
        <CardLine icon="location_pin" text={boutique.address} />
        <CardLine icon="phone" text={boutique.phone} />
      </span>
    </button>
  );
}

/** An icon + one line of text on a store card, clipped rather than wrapped. */
function CardLine({ icon, text }: { icon: string; text: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
      <MIcon name={icon} size={18} color="#c8c8c8" />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 16,
          fontWeight: 400,
          lineHeight: '22px',
          color: '#c8c8c8',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </span>
  );
}

// ─── One boutique's sheet ────────────────────────────────────────────────────
//
// The header's title slot is deliberately empty (the design draws the name in
// the body at heading size), so the dialog takes its accessible name from the
// boutique instead.

function StoreSheet({
  boutique,
  onClose,
  onDirections,
  onNotice,
}: {
  boutique: Boutique;
  onClose: () => void;
  onDirections: () => void;
  onNotice?: (message: string) => void;
}) {
  return (
    <Sheet title="" ariaLabel={boutique.name} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: `0 ${PAGE}px 12px` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: '24px', color: '#fff' }}>
            {boutique.name}
          </h3>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#999' }}>
            {boutique.address}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Directions opens the app's own map focused on this boutique, which
              is the real destination we have; a toast would be a dead end. */}
          <button
            onClick={onDirections}
            style={{ ...sheetActionBase, background: '#f6f6f6', color: '#121212' }}
          >
            <MIcon name="navigation" size={20} color="#121212" />
            Directions
          </button>
          <button
            onClick={() => {
              onNotice?.(`Calling ${boutique.name}`);
              onClose();
            }}
            style={{ ...sheetActionBase, background: '#1f2022', color: '#f6f6f6' }}
          >
            <MIcon name="phone" size={20} color="#f6f6f6" />
            {boutique.phone}
          </button>
        </div>
      </div>
    </Sheet>
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
