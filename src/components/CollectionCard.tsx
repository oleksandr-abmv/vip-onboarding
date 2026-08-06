import type { ReactNode } from 'react';
import { CollectionCover } from './CollectionSheets';

// ─── Collection card ─────────────────────────────────────────────────────────
//
// The product-card shell with its image split into a 2x2 grid of the pieces
// inside (Figma node 5531-2750). **One card everywhere a collection appears** -
// the Saved column full width, Discover's Collections row at rail width, and the
// concierge's reply when it hands one back (node 5555-52787) - so a collection is
// always the same object, recognisable by its contents. There is no cover picture
// to override it with: the pieces are the cover.
//
// Lives here rather than in FeedScreen so the chat can render it without
// importing the screen that renders the chat.
//
// The small inline row in a chat bubble is a **different thing and stays small**:
// that is a mention of something the message is about. This is the collection
// itself, handed over.

export default function CollectionCard({
  name,
  meta,
  images,
  onOpen,
  saved = false,
  onToggleSave,
  savedLabel,
  menu,
  width = '100%',
}: {
  name: string;
  /** "N items · $total". */
  meta: string;
  /** The pieces' image URLs, in order; the first four are drawn. */
  images: string[];
  onOpen: () => void;
  /** When provided, the card shows a favorite heart (keeps the whole look). */
  saved?: boolean;
  onToggleSave?: () => void;
  savedLabel?: string;
  /** Trailing corner slot for a "..." menu, when the surface has one. */
  menu?: ReactNode;
  width?: number | string;
}) {
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
          aria-label={savedLabel ?? (saved ? 'Remove from saved' : 'Save to favorites')}
          style={{
            position: 'absolute',
            top: 8,
            // The "..." takes the corner when there is one; the heart sits inboard.
            right: menu ? 48 : 8,
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
      {menu}
      {/* The pieces inside, as a 2x2 grid. Square to the card's corners, since
          the card already clips them. */}
      <CollectionCover images={images} size="100%" aspect="600 / 400" radius={0} />
      <div style={{ padding: '12px 16px 16px' }}>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#f7f7f7',
            lineHeight: '24px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </p>
        <span
          style={{
            display: 'block',
            marginTop: 2,
            fontSize: 14,
            fontWeight: 400,
            color: '#999',
            lineHeight: '20px',
          }}
        >
          {meta}
        </span>
      </div>
    </div>
  );
}
