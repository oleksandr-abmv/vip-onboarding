import ConciergeMark from './ConciergeMark';
import { theme } from '../theme';

// ─── "or Ask AI Concierge" offer ─────────────────────────────────────────────
//
// Every search surface offers the concierge as the alternative rather than
// leaving the user at a dead end: the search modal's idle and no-match states,
// and both empty states of the Add pieces sheet. One component so the offer reads
// the same everywhere.
//
// A rule, a filled pill, one line. Search only matches what the catalog has
// already been tagged with, so the line has a job - it is the argument for asking
// rather than typing - but it earns one line, not a panel of worked examples.

const TEXT_SECONDARY = '#999';

export default function AskConciergeOffer({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* "or" on a hairline rule: the alternative to searching, not a next step. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ flex: 1, height: 1, background: '#282828' }} />
        <span style={{ fontSize: 13, lineHeight: '18px', color: TEXT_SECONDARY }}>or</span>
        <span style={{ flex: 1, height: 1, background: '#282828' }} />
      </div>

      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          height: 48,
          background: '#f6f6f6',
          color: '#121212',
          border: 'none',
          borderRadius: theme.radii.button,
          fontSize: 16,
          fontWeight: 500,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <ConciergeMark size={20} onLight />
        Ask AI Concierge
      </button>

      <span style={{ fontSize: 13, lineHeight: '18px', color: TEXT_SECONDARY, textAlign: 'center' }}>
        Describe an occasion, a budget or a mood. It looks past the catalog.
      </span>
    </div>
  );
}
