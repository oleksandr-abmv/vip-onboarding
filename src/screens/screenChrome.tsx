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
export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        height: `calc(env(safe-area-inset-top, 0px) + 64px)`,
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
        {title}
      </span>
    </div>
  );
}
