import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../data/products';

// ── Product card (Figma "Product Card" adapted to the dark theme) ────────────
export default function ProductCard({
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
  subtitle,
  price,
  footer,
  savedLabel,
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
  /** Replaces the brand line. */
  subtitle?: string;
  /** Appended after the brand line as "· price". Defaults to the catalog price. */
  price?: string;
  /** Extra content under the meta block (the collection page's note strip). */
  footer?: ReactNode;
  /** Overrides the heart's label (a collection says "remove from this collection"). */
  savedLabel?: string;
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
            // The piece fills more of its tile than the old 72/82 left it: at the
            // card widths the feed uses now there was a wide dead margin around
            // every product. Still short of the edges, so cut-outs keep air.
            style={{ maxWidth: '84%', maxHeight: '90%', objectFit: 'contain', display: 'block' }}
          />
        )}
      </div>

      {/* Favorite icon button - rounded brand corners. Saved shows a filled
          accent-red heart; unsaved shows an outline heart. When the overflow
          menu is present, the heart sits inboard and "..." takes the corner. */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
        aria-label={savedLabel ?? (saved ? 'Remove from saved' : 'Save to favorites')}
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
        {/* Brand · price. The price never shrinks and the brand ellipsises into
            whatever is left: a truncated brand still identifies the piece (the name
            is on the line above), a truncated price - "$10,2..." - is useless. */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, lineHeight: '18px', marginTop: 4 }}>
          <span
            style={{
              minWidth: 0,
              fontWeight: 400,
              color: '#999',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle ?? product.brand}
          </span>
          {(price ?? product.price) && (
            <span style={{ flexShrink: 0, fontWeight: 500, color: '#dedfe1', whiteSpace: 'pre' }}>
              {` · ${price ?? product.price}`}
            </span>
          )}
        </div>
        {footer && <div style={{ marginTop: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ── Card overflow-menu row ───────────────────────────────────────────────────
export function MenuRow({
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
