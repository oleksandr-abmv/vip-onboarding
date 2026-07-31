import { theme } from '../theme';

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
  // `clip`, not `hidden`: an overlay entering with `sheetSlideUp` momentarily
  // overhangs the bottom, and `hidden` would make this a scroll container that
  // the browser can then scroll to reveal a focused field, shunting the whole
  // screen sideways with no scrollbar to explain it. `clip` cannot scroll at all.
  // The scroll body inside keeps its own `overflowY: auto`. See `useAutoFocus`.
  overflow: 'clip',
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
  // Leading/trailing controls are the 40px `iconButtonStyle` circle, centred in
  // the bar so they read as part of the nav bar at any header height.
  const actionTop = `calc(env(safe-area-inset-top, 0px) + ${Math.max(0, (height - 40) / 2)}px)`;
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
      {/* Back is the same bordered circle as the trailing controls: a bare glyph
          on one side of a bar whose other side carries outlined buttons read as
          two different kinds of control. */}
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            ...iconButtonStyle,
            pointerEvents: 'auto',
            position: 'absolute',
            left: 16,
            top: actionTop,
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
        <span
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            left: 16,
            top: actionTop,
          }}
        >
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
            top: actionTop,
          }}
        >
          {right}
        </span>
      )}
    </div>
  );
}

/**
 * Figma `buttonIcon` - a bordered circle. 40px is the nav-bar size; the 32px
 * variant lives in components/Sheet.tsx as `sheetIconButtonStyle`.
 */
/**
 * Full-width page actions, filled and outlined. Shared so the product page and
 * the collection page offer their actions in one visual language: exactly one
 * filled primary at the top of the stack, the rest outlined under it.
 */
const actionBase: React.CSSProperties = {
  width: '100%',
  height: 44,
  borderRadius: theme.radii.button,
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  WebkitTapHighlightColor: 'transparent',
};
export const primaryActionStyle: React.CSSProperties = {
  ...actionBase,
  background: '#f6f6f6',
  color: '#121212',
  border: 'none',
};
export const outlinedActionStyle: React.CSSProperties = {
  ...actionBase,
  background: 'transparent',
  color: '#f6f6f6',
  border: '1px solid #313131',
};

export const iconButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#101111',
  border: '1px solid #444547',
  borderRadius: theme.radii.button,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
  WebkitTapHighlightColor: 'transparent',
};
