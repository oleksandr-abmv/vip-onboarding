import { useCallback, useRef, useState } from 'react';
import { theme } from '../theme';

// ─── Product gallery ─────────────────────────────────────────────────────────
//
// The Product Page hero: every view of the piece in one place, with a counter
// reading "n / total".
//
// Views **cross-fade**, they do not slide. Each shot is a piece on its own
// backdrop rather than a frame of one continuous strip, so sliding read as
// moving a filmstrip past a window; a fade reads as the same object being
// re-lit. It also keeps the piece centred at all times, which a slide cannot.
//
// Three rules hold it together:
//
//  - **One image is not a gallery.** With a single view the counter, the fade
//    and the swipe all disappear and it renders as the plain static image the
//    page had before. Most of the catalogue is single-image today, so this is
//    the common case, not the edge case.
//  - **The counter counts what the user can actually reach.** It reads from the
//    same array the stack renders, so the two can never disagree.
//  - **Swiping must never fight the page.** The stack is not a scroll
//    container, and `touchAction: pan-y` hands every vertical gesture straight
//    to the page underneath, so only a horizontal drag changes the view.

interface ProductGalleryProps {
  /** Every view, primary first. Use `viewsOf()` from data/products. */
  images: string[];
  /** Alt text for the piece. Each view is numbered off it. */
  alt: string;
  /** Renders the VIP logo placeholder instead, for a piece with no imagery. */
  placeholder?: boolean;
  /** Hero height. Matches the Product Page's 300px band by default. */
  height?: number;
}

const BG = '#ececec';

/** How far a horizontal drag must travel before it counts as a swipe. */
const SWIPE_PX = 40;

/** Shared by every state so the hero band never changes height mid-fade. */
const frameStyle = (height: number) => ({
  width: '100%',
  height,
  boxSizing: 'border-box' as const,
  background: BG,
  position: 'relative' as const,
  overflow: 'hidden' as const,
});

const imageStyle = {
  maxWidth: '78%',
  maxHeight: '86%',
  objectFit: 'contain' as const,
  display: 'block' as const,
};

const centered = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function ProductGallery({ images, alt, placeholder = false, height = 300 }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  // Where the current drag started. Null between drags.
  const dragX = useRef<number | null>(null);

  const count = images.length;

  // Clamped, never wrapping: "3 / 3" has to mean there is nothing after it.
  const step = useCallback(
    (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), count - 1)),
    [count],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragX.current = e.clientX;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = dragX.current;
      dragX.current = null;
      if (start === null) return;
      const dx = e.clientX - start;
      if (Math.abs(dx) < SWIPE_PX) return;
      // Drag left (negative dx) moves forward, the way a strip would.
      step(dx < 0 ? 1 : -1);
    },
    [step],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      }
    },
    [step],
  );

  if (placeholder) {
    return (
      <div style={{ ...frameStyle(height), ...centered }}>
        <img
          src="/vip-logo.svg"
          alt=""
          aria-hidden
          style={{ width: 88, height: 88, opacity: 0.3, filter: 'brightness(0)', display: 'block' }}
        />
      </div>
    );
  }

  // One view is not a gallery: nothing to fade between, nothing to count.
  if (count <= 1) {
    return (
      <div style={{ ...frameStyle(height), ...centered }}>
        <img src={images[0]} alt={alt} style={imageStyle} />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${alt}, ${count} images`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (dragX.current = null)}
      onKeyDown={handleKeyDown}
      style={{
        ...frameStyle(height),
        // Vertical gestures belong to the page; only horizontal ones are ours.
        touchAction: 'pan-y',
        cursor: 'grab',
        outline: 'none',
      }}
    >
      {images.map((src, i) => {
        const active = i === index;
        return (
          <div
            key={src}
            aria-hidden={!active}
            style={{
              ...centered,
              position: 'absolute',
              inset: 0,
              opacity: active ? 1 : 0,
              transition: `opacity 400ms ${theme.animation.easing}`,
              // The outgoing view must not swallow the next drag.
              pointerEvents: active ? 'auto' : 'none',
            }}
          >
            <img
              src={src}
              alt={active ? `${alt}, view ${i + 1} of ${count}` : ''}
              // Every view loads up front. A fade cannot cover an image that
              // has not arrived: lazy-loading shows the empty backdrop through
              // the whole transition and the shot pops in at the end. A piece
              // has a handful of views, so this costs little.
              loading="eager"
              draggable={false}
              style={imageStyle}
            />
          </div>
        );
      })}

      {/* Counter. Dark pill on a light hero, bottom-right so it clears the
          piece itself. aria-live keeps it announced as the view changes. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          padding: '4px 10px',
          borderRadius: theme.radii.pill,
          background: 'rgba(18, 18, 18, 0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: '16px',
          fontVariantNumeric: 'tabular-nums',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {index + 1} / {count}
      </div>
    </div>
  );
}
