import type { ReactNode } from 'react';
import MIcon from './MIcon';
import { theme } from '../theme';

// ─── Bottom sheet ────────────────────────────────────────────────────────────
//
// Figma: BottomSheetHeader (node 5303-20609) on a `radius 12` top-rounded panel.
// Header is `pt 16 / pb 8 / px 16` with a 32px slot on each side so the title
// stays optically centered, and the close control is a bordered `radius 8`
// rounded square rather than a filled circle.
//
// `full` raises the panel to just under the status bar, which is how the Memory
// sheet is drawn in the design (744 of 806pt) rather than hugging its content.

const SHEET_BG = '#0d0d0d';
const BORDER = '#444547';
const TEXT_PRIMARY = '#f6f6f6';

/** Figma buttonIcon, small: a bordered circle on the sheet surface. */
export const sheetIconButtonStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#101111',
  border: `1px solid ${BORDER}`,
  borderRadius: theme.radii.button,
  cursor: 'pointer',
  padding: 0,
  WebkitTapHighlightColor: 'transparent',
};

export default function Sheet({
  title,
  onClose,
  onBack,
  action,
  closeLeading = false,
  full = false,
  children,
}: {
  title: string;
  onClose: () => void;
  /** Renders a back control in the leading 32px slot. */
  onBack?: () => void;
  /** Trailing header control (the collections sheet's "Create"). When set, the
      close button moves to the leading slot - the Figma "X · title · action"
      header - unless `onBack` already claims it. */
  action?: ReactNode;
  /** Keep close on the left even with no trailing action, so the collection
      sheets read the same whether or not they carry a "Create". */
  closeLeading?: boolean;
  /** Fill the screen below the status bar (the Memory sheet's height). */
  full?: boolean;
  children: ReactNode;
}) {
  const leadingClose = !onBack && (closeLeading || !!action);
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0,0,0,0.75)',
          animation: 'backdropFadeIn 200ms ease both',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          ...(full ? { top: `calc(env(safe-area-inset-top, 0px) + 8px)` } : {}),
          zIndex: 301,
          background: SHEET_BG,
          borderRadius: `${theme.radii.sheet} ${theme.radii.sheet} 0 0`,
          display: 'flex',
          flexDirection: 'column',
          animation: 'sheetSlideUp 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          paddingBottom: full ? 0 : `calc(20px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 16px 8px',
          }}
        >
          <span style={{ minWidth: 32, flexShrink: 0, display: 'flex' }}>
            {onBack ? (
              <button onClick={onBack} aria-label="Back" style={sheetIconButtonStyle}>
                <MIcon name="arrow_left_alt" size={20} color={TEXT_PRIMARY} />
              </button>
            ) : leadingClose ? (
              <button onClick={onClose} aria-label="Close" style={sheetIconButtonStyle}>
                <MIcon name="close" size={20} color={TEXT_PRIMARY} />
              </button>
            ) : null}
          </span>
          <p
            style={{
              flex: 1,
              minWidth: 0,
              margin: 0,
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 500,
              lineHeight: '20px',
              color: TEXT_PRIMARY,
            }}
          >
            {title}
          </p>
          {action ? (
            <span style={{ minWidth: 32, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
              {action}
            </span>
          ) : leadingClose ? (
            // Balances the leading close so the title stays optically centred.
            <span aria-hidden style={{ width: 32, flexShrink: 0 }} />
          ) : (
            <button onClick={onClose} aria-label="Close" style={sheetIconButtonStyle}>
              <MIcon name="close" size={20} color={TEXT_PRIMARY} />
            </button>
          )}
        </div>
        {children}
      </div>
    </>
  );
}
