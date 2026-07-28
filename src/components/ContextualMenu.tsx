import MIcon from './MIcon';
import { theme } from '../theme';

// ─── Contextual menu (Figma `contextualMenu`, node 5385-13724) ───────────────
//
// The dropdown the Manage Memory header's `more_horiz` opens. A `radius 12`
// card padded 4, rows 63px tall with a 24px icon + 16/22 label, hairline divider
// between them.

const SURFACE = '#1b1b1c';
const BORDER = '#444547';
const TEXT_PRIMARY = '#f6f6f6';
const DANGER = '#dc8589';

export interface MenuItem {
  /** Material Symbols name. */
  icon: string;
  label: string;
  destructive?: boolean;
  onClick: () => void;
}

export default function ContextualMenu({
  items,
  onClose,
  top,
  right = 16,
}: {
  items: MenuItem[];
  onClose: () => void;
  /** Distance from the top of the screen, usually just under the trigger. */
  top: string | number;
  right?: number;
}) {
  return (
    <>
      {/* Tapping anywhere else dismisses, the usual popover behaviour. */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 210 }}
        aria-hidden
      />
      <div
        role="menu"
        style={{
          position: 'absolute',
          top,
          right,
          zIndex: 211,
          minWidth: 207,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: theme.radii.cardSm,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          animation: 'menuPop 160ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        {items.map((item, i) => (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              role="menuitem"
              onClick={() => {
                onClose();
                item.onClick();
              }}
              style={{
                all: 'unset',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                height: 63,
                padding: '12px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: '22px',
                color: item.destructive ? DANGER : TEXT_PRIMARY,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <MIcon name={item.icon} size={24} color={item.destructive ? DANGER : TEXT_PRIMARY} />
              <span style={{ flex: 1, minWidth: 120 }}>{item.label}</span>
            </button>
            {i < items.length - 1 && <span style={{ height: 1, background: BORDER }} aria-hidden />}
          </div>
        ))}
      </div>
    </>
  );
}
