import type { ReactNode } from 'react';
import MIcon from './MIcon';
import { RAIL_CARD_W, theme } from '../theme';
import { collectionMeta, type Collection } from '../data/collections';
import type { Product } from '../data/products';

// ─── Save to your collections ────────────────────────────────────────────────
//
// The product page's last section. It has **two states, and only ever one of
// them**: a rail of the user's collections while the piece is in none, and a
// single row once it is filed.
//
// **Every collection here is a horizontal row** - preview, name, meta, control -
// in the rail and in the saved state alike, so filing a piece does not change
// the shape of the thing you were looking at. That is why this surface does not
// use `<CollectionCard>`, which stacks its cover above its text: a rail of those
// at picker size left the name with half its characters and the meta wrapping.
//
// **The preview is one piece, not the 2x2 cover.** At the size a row allows,
// four images are four thumbnails too small to read; one piece at 64px says
// "this is the jewellery one" at a glance, which is all the preview is for.
//
// **Saved is a different section, not a marked card.** A piece lives in exactly
// one collection, so once it is filed there is no second choice to offer: the
// rail collapses to the collection it went to and a **Saved** pill. Refiling is
// unsave, then save again - one deliberate step rather than a tap that quietly
// empties a slot in a collection the user had already built.
//
// **The rail is capped and bookended.** Four collections (the newest, so the
// likeliest answer leads) between two narrower cards of the same horizontal
// shape: **Add new** at the head, straight to the create sheet, and **View all** at the tail, which opens
// the Add to collection sheet with every collection and a search over their
// names. Add new is still not a way to make an empty collection: it creates one
// *while filing this piece*, which is the only way collections are ever made.
//
// `collections` arrives **newest first** - the caller sorts, as every surface
// listing collections does, so a collection created from the New button comes
// back at the head of the rail rather than buried among the seeds.

const PAGE = 16;
const BORDER = '#282828';
const SURFACE = '#101111';
/** The one product-image backdrop, as everywhere else in the app. */
const PHOTO_BG = '#ececec';

/** The app's one rail width, so this row lines up with every Discover rail. */
const CARD_W = RAIL_CARD_W;
const PREVIEW = 64;
/** The rail's bookend cards. Narrower than a collection row: they carry a
    label, not a name, a meta line and a control. Height comes from the row. */
const CAP_W = 160;

export default function SaveToCollection({
  collections,
  byName,
  currentId,
  onPick,
  onCreate,
  onViewAll,
}: {
  /** Newest first - the caller sorts. */
  collections: Collection[];
  byName: (name: string) => Product | undefined;
  /** The collection holding this piece, if any. */
  currentId?: string;
  /** File the piece here, or take it out when this is the one it is in. */
  onPick: (collectionId: string) => void;
  /** Straight to the create sheet, which files this piece into what it makes. */
  onCreate: () => void;
  /** The Add to collection sheet: every collection, a search over their names. */
  onViewAll: () => void;
}) {
  const current = collections.find((c) => c.id === currentId);

  return (
    <div style={{ padding: '20px 0 8px' }}>
      <div style={{ padding: `0 ${PAGE}px` }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: '#fff' }}>
          Save to your collections
        </h2>
      </div>

      {current ? (
        <div style={{ margin: `16px ${PAGE}px 0` }}>
          <CollectionRow
            collection={current}
            byName={byName}
            trailing={
              <button
                onClick={() => onPick(current.id)}
                aria-label={`Saved to ${current.name}. Remove it`}
                style={{
                  flexShrink: 0,
                  height: 40,
                  padding: '0 20px',
                  background: '#f6f6f6',
                  color: '#121212',
                  border: 'none',
                  borderRadius: theme.radii.button,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Saved
              </button>
            }
          />
        </div>
      ) : collections.length === 0 ? (
        <p style={{ margin: `12px ${PAGE}px 0`, fontSize: 14, lineHeight: '20px', color: '#999' }}>
          You have none yet. Create one to keep this piece.
        </p>
      ) : (
        /* The inset lives on the track, not the scroller, and the track is
           `max-content` wide - the same shape every Discover rail uses. Put the
           padding on the scroller instead and the first card sits flush against
           the screen edge instead of on the page margin. */
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, padding: `0 ${PAGE}px`, width: 'max-content' }}>
            <CapCard icon="add_2" label="Create" onClick={onCreate} />

            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => onPick(c.id)}
                aria-label={`Save to ${c.name}`}
                style={{ ...cardShell, width: CARD_W, cursor: 'pointer', textAlign: 'left' }}
              >
                <CollectionRow collection={c} byName={byName} trailing={<PlusBadge />} bare />
              </button>
            ))}

            <CapCard
              icon="more_horiz"
              label="More"
              onClick={onViewAll}
              ariaLabel={`View all ${collections.length} collections`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** The card the rail and the saved row are both drawn on. */
const cardShell: React.CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 12,
  background: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: theme.radii.card,
  WebkitTapHighlightColor: 'transparent',
};

/**
 * One collection, laid out horizontally: one of its pieces as the preview, then
 * the name over "N items · $total", then whatever the surface puts at the end.
 * `bare` drops the card shell, for a caller that already drew one (the rail's
 * cards are buttons, and a button cannot hold another button).
 */
function CollectionRow({
  collection,
  byName,
  trailing,
  bare = false,
}: {
  collection: Collection;
  byName: (name: string) => Product | undefined;
  trailing: ReactNode;
  bare?: boolean;
}) {
  const preview = collection.items.map((n) => byName(n)?.image).find(Boolean);

  const body = (
    <>
      <span
        aria-hidden
        style={{
          width: PREVIEW,
          height: PREVIEW,
          flexShrink: 0,
          borderRadius: 10,
          overflow: 'hidden',
          // An empty collection has no piece to show, so it takes the dark
          // surface and the logotype, the same as any missing image.
          background: preview ? PHOTO_BG : '#1a1b1b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt=""
            draggable={false}
            style={{ maxWidth: '82%', maxHeight: '84%', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <img src="/vip-logo.svg" alt="" style={{ width: 24, height: 24, opacity: 0.35, display: 'block' }} />
        )}
      </span>

      <span style={{ flex: 1, minWidth: 0, display: 'block' }}>
        <span
          style={{
            display: 'block',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '22px',
            color: '#f7f7f7',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {collection.name}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '20px',
            color: '#999',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {collectionMeta(collection, byName)}
        </span>
      </span>
      {trailing}
    </>
  );

  if (bare) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minWidth: 0 }}>
        {body}
      </span>
    );
  }
  return <div style={cardShell}>{body}</div>;
}

/**
 * The plus at the end of a rail card. A span, not a button: the whole card is
 * already the target, and a button inside a button is not valid markup.
 */
function PlusBadge() {
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radii.button,
        background: 'transparent',
        border: '1px solid #444547',
      }}
    >
      <MIcon name="add_2" size={18} color="#f6f6f6" weight={400} />
    </span>
  );
}

/**
 * The cards that bookend the rail: **Create** at the head, **More** at the
 * tail. Laid out like a collection row and stretched to its height by the
 * track, but narrower, with a bare glyph where the preview goes and no meta
 * line, so neither ever reads as a collection you could file into.
 */
function CapCard({
  icon,
  label,
  onClick,
  ariaLabel,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  /** When the visible label is shorter than what the control actually does. */
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      // Centred, unlike a collection row: there is no preview to anchor a left
      // edge to, so the pair sits in the middle of the card.
      style={{ ...cardShell, width: CAP_W, justifyContent: 'center', cursor: 'pointer' }}
    >
      {/* The glyph, bare. A filled tile where the collections show a piece read
          as a preview of nothing. */}
      <MIcon name={icon} size={24} color="#f6f6f6" />
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: '22px', color: '#f7f7f7' }}>
        {label}
      </span>
    </button>
  );
}
