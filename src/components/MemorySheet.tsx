import Sheet from './Sheet';
import Toggle from './Toggle';
import { theme } from '../theme';

// ─── Data Memory sheet ───────────────────────────────────────────────────────
//
// Figma: "Settings / Memory [On]" (node 5303-20603) and "[Off]" (node
// 5385-13776). Full-height sheet: one switch row plus the way into Manage
// Memory. Reached from Settings > Data Memory and from the "Memory updated" chip in
// a chat, so it lives in components/ rather than inside either screen.
//
// Switching memory off **pauses** collection; it does not lock the data away, so
// Manage Memory stays reachable and a note under the button says as much.

const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const TEXT_TERTIARY = '#a9a9ab';

export default function MemorySheet({
  enabled,
  onToggle,
  onManage,
  onClose,
}: {
  enabled: boolean;
  onToggle: () => void;
  onManage: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet title="Data Memory" onClose={onClose} full>
      {/* Figma insets the row and the button to the same 28px optical margin
          (sheet padding 20 + the listItem's own 8). */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 20px 0' }}>
        <button
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
          aria-label="Enable Memory"
          style={{
            all: 'unset',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '12px 8px',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              flex: 1,
              minWidth: 120,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: '22px', color: TEXT_PRIMARY }}>Enable Memory</span>
            <span style={{ fontSize: 14, lineHeight: '20px', color: TEXT_SECONDARY, opacity: 0.7 }}>
              VIP.ai remembers your tastes and sizes to tailor every recommendation.
            </span>
          </span>
          <Toggle on={enabled} />
        </button>

        <button
          onClick={onManage}
          style={{
            width: 'calc(100% - 16px)',
            alignSelf: 'center',
            height: 48,
            background: 'transparent',
            color: TEXT_PRIMARY,
            // Figma radius/roles/radiusButtonLarge.
            border: '1px solid #444547',
            borderRadius: theme.radii.button,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Manage Memory
        </button>

        {!enabled && (
          <p
            style={{
              margin: '4px 8px 0',
              fontSize: 14,
              lineHeight: '20px',
              color: TEXT_TERTIARY,
              textAlign: 'center',
            }}
          >
            Memory is paused. You still can access and manage your data.
          </p>
        )}
      </div>
    </Sheet>
  );
}
