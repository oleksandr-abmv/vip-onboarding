import Sheet from './Sheet';
import Toggle from './Toggle';

// ─── Data Memory sheet (Figma "Settings / Memory", node 5303-20603) ──────────
//
// Full-height sheet: one switch row plus the way into Manage Memory. Reached
// from Menu > Data Memory and from the "Memory updated" chip in a chat, so it
// lives in components/ rather than inside either screen.
//
// With memory off there is nothing to manage, so the button goes disabled
// rather than opening a screen the user cannot act on.

const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';

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
    <Sheet title="Memory" onClose={onClose} full>
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
              The app will remember facts about you from chats and other shared info.
            </span>
          </span>
          <Toggle on={enabled} />
        </button>

        <button
          onClick={onManage}
          disabled={!enabled}
          style={{
            width: 'calc(100% - 16px)',
            alignSelf: 'center',
            height: 48,
            background: 'transparent',
            color: enabled ? TEXT_PRIMARY : '#666',
            // Figma radius/roles/radiusButtonLarge.
            border: `1px solid ${enabled ? '#444547' : '#252525'}`,
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 500,
            cursor: enabled ? 'pointer' : 'default',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Manage Memory
        </button>
      </div>
    </Sheet>
  );
}
