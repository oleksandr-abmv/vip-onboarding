import { useState } from 'react';
import { theme } from '../theme';
import MIcon from './MIcon';

// ─── Bottom dock (Figma `bottomBarLocal`, node 4483-34633) ───────────────────
//
// One surface carrying the prompt field and the tab bar, rounded `8px` at the
// top. The prompt field is a `radius 12` rounded rectangle - NOT a pill - with
// two 40px `radius 12` icon buttons inside it (add, then mic/send).
//
// Three shapes come out of the same component:
//   prompt + tabs   Chat tab
//   prompt only     Manage Memory
//   tabs only       Discover, Menu

const SURFACE = '#0d0d0d';
const PROMPT_BG = '#161616';
const BORDER = '#282828';
const TEXT_TERTIARY = '#8b8b8b';

/** Figma radius/roles/radiusButtonIconLarge - every 40px control in the dock. */
const ICON_BUTTON = theme.radii.button;

export interface DockTab {
  /** Material Symbols name (the tab bar still uses the icon font). */
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function BottomDock({
  tabs,
  placeholder,
  onSend,
  showAttach = true,
  disabled = false,
}: {
  /** Omit for the prompt-only dock (Manage Memory). */
  tabs?: DockTab[];
  /** Omit for the tabs-only dock (Discover, Menu). */
  placeholder?: string;
  onSend?: (text: string) => void;
  /** Manage Memory drops the attach button - there is nothing to attach there. */
  showAttach?: boolean;
  disabled?: boolean;
}) {
  const [text, setText] = useState('');
  const send = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend?.(value);
    setText('');
  };
  const hasText = text.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        flexShrink: 0,
        background: SURFACE,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderTop: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        paddingTop: 8,
        paddingBottom: `calc(8px + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      {placeholder !== undefined && (
        <div style={{ padding: '0 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 48,
              borderRadius: theme.radii.input,
              background: PROMPT_BG,
              border: `1px solid ${BORDER}`,
              padding: '4px 4px 4px 12px',
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder={placeholder}
              aria-label={placeholder}
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                background: 'none',
                border: 'none',
                outline: 'none',
                color: disabled ? '#6b6b6b' : '#f6f6f6',
                fontSize: 16,
                lineHeight: '22px',
                fontWeight: 400,
              }}
            />
            {showAttach && (
              <button
                aria-label="Add attachment"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: ICON_BUTTON,
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <MIcon name="add_2" size={24} color="#f6f6f6" />
              </button>
            )}
            <button
              onClick={send}
              disabled={disabled}
              aria-label={hasText ? 'Send' : 'Voice input'}
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: ICON_BUTTON,
                // Figma brand/brandSecondary; fills to white once there's text.
                background: hasText ? '#f6f6f6' : '#252526',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 160ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <MIcon
                name={hasText ? 'arrow_upward' : 'mic'}
                size={24}
                color={hasText ? '#121212' : '#f6f6f6'}
              />
            </button>
          </div>
        </div>
      )}

      {tabs && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.label}
              aria-label={t.label}
              aria-current={t.active ? 'page' : undefined}
              onClick={t.onClick}
              style={{
                width: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 12px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <MIcon
                name={t.icon}
                size={24}
                weight={t.active ? 400 : 300}
                fill={t.active ? 1 : 0}
                color={t.active ? '#f6f6f6' : TEXT_TERTIARY}
              />
              <span
                style={{
                  fontSize: 12,
                  lineHeight: '16px',
                  color: t.active ? '#f6f6f6' : TEXT_TERTIARY,
                }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
