import { theme } from '../theme';

// ─── Floating nav icon button ────────────────────────────────────────────────
//
// The circular control that floats over imagery: the product page's back /
// share / heart, and the map view's back. A translucent dark fill plus a blur
// keeps it legible over both a light hero and a dark map, so one button works on
// every backdrop.

export default function NavIconButton({
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
        // Re-enable taps: the containers these sit in set pointer-events: none
        // so the page still scrolls underneath.
        pointerEvents: 'auto',
        width: 40,
        height: 40,
        borderRadius: theme.radii.button,
        background: 'rgba(20,20,20,0.55)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
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
