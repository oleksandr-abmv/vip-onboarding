import type { ReactNode } from 'react';
import MIcon from './MIcon';
import { theme } from '../theme';

// ─── Centred empty state (Figma `State`, node 5539-18382) ────────────────────
//
// Icon disc, title, one line of hint, and an optional action. Shared so every
// "there is nothing here" in the app draws the same picture rather than each
// screen inventing its own.
//
// It **takes the leftover height and centres in it** (`flex: 1` +
// `justify-content: center`), so it sits in the middle of what is left rather
// than hanging 72px under whatever is above it. That means the parent has to be
// a flex column - see the Saved tab, which switches `bodyStyle` to a column
// while its list is empty.

const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';

export default function CenteredState({
  title,
  hint,
  icon,
  action,
}: {
  title: string;
  hint: string;
  icon: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        textAlign: 'center',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: theme.radii.button,
          // The same neutral fill the heart buttons use, which is what the file's
          // brand/brandSecondary resolves to in the dark theme.
          background: '#2f2f31',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MIcon name={icon} size={24} color={TEXT_PRIMARY} />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300 }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 500, lineHeight: '22px', color: TEXT_PRIMARY }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_SECONDARY }}>{hint}</p>
      </div>
      {action}
    </div>
  );
}

/**
 * The state's own action (Figma `Actions` > `Button`): a neutral filled pill,
 * 40 tall. Filled rather than outlined because it is the one thing to do from
 * here, and neutral rather than white because the empty state is not the page's
 * primary action - it is the way out of a corner.
 */
export function CenteredStateAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 40,
        padding: '0 16px',
        background: '#2f2f31',
        color: TEXT_PRIMARY,
        border: 'none',
        borderRadius: theme.radii.button,
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '22px',
        cursor: 'pointer',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  );
}
