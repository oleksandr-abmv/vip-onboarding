// ─── Shared top-level screen chrome ──────────────────────────────────────────
//
// The layout shell every top-level tab (Discover, Menu) and detail view uses:
// a full-bleed column, a scroll body that runs under a gradient-fade header, and
// the header itself. Lives here rather than in FeedScreen so other tabs can use
// it without importing that module (which would be circular).

export const screenStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  background: 'transparent',
  overflow: 'hidden',
};

export const bodyStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
  // Content scrolls under the gradient-fade header (which is absolutely positioned).
  paddingTop: `calc(env(safe-area-inset-top, 0px) + 56px)`,
  paddingBottom: 16,
};

// ── Header (gradient-fade overlay: content scrolls under it, ChatGPT-style) ───
//
// `subtitle` stacks a secondary line under the title (Figma "Manage Memory" ->
// "Updated 1 min ago"); `right` drops a control into the trailing corner. Both
// are optional, so callers that only pass a title render exactly as before.
export function Header({
  title,
  subtitle,
  onBack,
  left,
  right,
  height = 64,
}: {
  /** Plain string for most screens; a node when the title carries chrome of its
      own (the Chat tab's "Concierge" picker). */
  title: React.ReactNode;
  subtitle?: string;
  onBack?: () => void;
  /** Leading control, replacing the plain back arrow (the Chat tab's new-chat
      button). Ignored when `onBack` is set. */
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Figma navBar is 56px; the plain title header stays at 64. */
  height?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        height: `calc(env(safe-area-inset-top, 0px) + ${height}px)`,
        paddingTop: `env(safe-area-inset-top, 0px)`,
        display: 'flex',
        alignItems: 'center',
        // Container ignores taps so scrolling passes through; only the back button
        // (below) re-enables pointer events.
        pointerEvents: 'none',
        // Solid at the top for legibility, fading to transparent so content
        // dissolves as it scrolls beneath the bar.
        background:
          'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 52%, rgba(10,10,10,0) 100%)',
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            pointerEvents: 'auto',
            marginLeft: 8,
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
      {!onBack && left && (
        <span style={{ pointerEvents: 'auto', position: 'absolute', left: 16, top: `calc(env(safe-area-inset-top, 0px) + 8px)` }}>
          {left}
        </span>
      )}
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: `calc(env(safe-area-inset-top, 0px) + ${subtitle ? 12 : 20}px)`,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          maxWidth: 'calc(100% - 120px)',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: '20px' }}>{title}</span>
        {subtitle && (
          <span style={{ fontSize: 14, fontWeight: 400, color: '#999', lineHeight: '20px' }}>{subtitle}</span>
        )}
      </span>

      {right && (
        <span
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            right: 16,
            top: `calc(env(safe-area-inset-top, 0px) + ${height === 56 ? 8 : 16}px)`,
          }}
        >
          {right}
        </span>
      )}
    </div>
  );
}

/**
 * Figma `buttonIcon` - a bordered rounded square, not a filled circle.
 * 40px / `radius 12` (radiusButtonIconLarge) is the nav-bar size; the 32px /
 * `radius 8` variant lives in components/Sheet.tsx as `sheetIconButtonStyle`.
 */
export const iconButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#101111',
  border: '1px solid #444547',
  borderRadius: 12,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
  WebkitTapHighlightColor: 'transparent',
};
