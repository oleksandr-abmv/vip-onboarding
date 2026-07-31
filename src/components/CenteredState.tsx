import type { ReactNode } from 'react';
import MIcon from './MIcon';
import { theme } from '../theme';

// ─── Centred empty state ─────────────────────────────────────────────────────
//
// Icon disc, title, one line of hint, and an optional action underneath. Shared
// so every "there is nothing here" in the app draws the same picture: the search
// modal's no-match state and the Saved tab's, which are the same situation
// reached two ways and should not look like two different products.
//
// The `action` slot is usually `<AskConciergeOffer>`. Searching only finds what
// the catalog has already been tagged with, so a no-match state that just says
// "no matches" is a dead end; the offer is the way out of it.

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '72px 32px 0',
        textAlign: 'center',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 56,
          height: 56,
          marginBottom: 4,
          borderRadius: theme.radii.button,
          background: '#161616',
          border: '1px solid #282828',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MIcon name={icon} size={26} color="#8b8b8b" />
      </span>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: '26px', color: TEXT_PRIMARY }}>
        {title}
      </h2>
      <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: TEXT_SECONDARY, maxWidth: 280 }}>
        {hint}
      </p>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
