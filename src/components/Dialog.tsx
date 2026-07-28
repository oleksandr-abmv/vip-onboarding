import type { ReactNode } from 'react';
import { Icon } from './Icon';

// ─── Centered confirm dialog ─────────────────────────────────────────────────
//
// Figma: "Dialog" (node 5381-8672). A centered card - not a bottom sheet - used
// for destructive confirmations: round icon badge, title, body, then a stacked
// danger button + outline Cancel, with a close X in the top-right corner.

const SURFACE = '#1b1b1c';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const DANGER = '#dc8589';

export default function Dialog({
  title,
  body,
  icon = 'warn',
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}: {
  title: string;
  body: ReactNode;
  /** Badge glyph from src/icons/core/. Defaults to the warning triangle. */
  icon?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 400,
          background: 'rgba(0,0,0,0.75)',
          animation: 'backdropFadeIn 200ms ease both',
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 401,
          background: SURFACE,
          borderRadius: 16,
          padding: '24px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          animation: 'dialogPop 240ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            padding: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="close" size={24} color={TEXT_PRIMARY} />
        </button>

        <span
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 100,
            background: '#252526',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden
        >
          <Icon name={icon} size={24} color={TEXT_SECONDARY} />
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'center', width: '100%' }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 500, lineHeight: '24px', color: TEXT_PRIMARY }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_SECONDARY }}>{body}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%',
              height: 48,
              background: DANGER,
              color: '#2b0d0f',
              border: 'none',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              height: 48,
              background: 'transparent',
              color: TEXT_PRIMARY,
              border: '1px solid #313131',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </>
  );
}
