import type { ReactNode } from 'react';
import MIcon from './MIcon';
import SearchField from './SearchField';
import AskConciergeOffer from './AskConciergeOffer';
import { theme } from '../theme';

// ─── Search modal ────────────────────────────────────────────────────────────
//
// The one search experience in the app. Tapping any search affordance opens this
// full screen over whatever was underneath: an autofocused field paired with a
// Cancel button, an idle state before the user types, live results while they do,
// and a dead end that offers the concierge instead of leaving them stuck.
//
// The caller owns the results (`children`) and only tells us how many there are,
// so Discover can render product cards, Saved collection cards, and a collection
// its own item rows, without this component knowing about any of them.

const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';
const PAGE = 16;

export default function SearchModal({
  placeholder,
  ariaLabel,
  suggestions = [],
  showAllWhenEmpty = false,
  query,
  onQueryChange,
  onClose,
  resultCount,
  onAskConcierge,
  children,
}: {
  placeholder: string;
  ariaLabel?: string;
  /**
   * Shown before the user types anything: tappable queries that fill the field.
   * Draw them from the rows being searched so a chip can never come back empty.
   */
  suggestions?: string[];
  /**
   * Skip the idle state and show `children` straight away. For a search over a
   * short, known list (a collection's own pieces) there is nothing to suggest:
   * the list itself is the best idle state, and typing narrows it.
   */
  showAllWhenEmpty?: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  /** How many results `children` renders; drives the dead-end state. */
  resultCount: number;
  /** Offered when a query matches nothing. Receives the query. */
  onAskConcierge?: (query: string) => void;
  children: ReactNode;
}) {
  const trimmed = query.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? placeholder}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 320,
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        // Slides up like a sheet, so it reads as coming from the field.
        animation: 'sheetSlideUp 260ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
      }}
    >
      {/* Field + Cancel, pinned above the results. */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: `calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px`,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchField
            value={query}
            onChange={onQueryChange}
            placeholder={placeholder}
            ariaLabel={ariaLabel ?? placeholder}
            autoFocus
          />
        </div>
        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            padding: '0 2px',
            fontSize: 16,
            fontWeight: 500,
            color: TEXT_PRIMARY,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Cancel
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {trimmed === '' && !showAllWhenEmpty ? (
          // Idle. Deliberately thin: a scrollable row of things you could tap,
          // then the concierge. A headline and a worked-example panel both got
          // built here and both made an empty search screen feel like homework.
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 16 }}>
            {suggestions.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  // Padding on the track, not the scroller, so the right inset
                  // survives at scroll end (the app's carousel convention).
                  padding: `0 ${PAGE}px`,
                }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => onQueryChange(s)}
                    style={{
                      flexShrink: 0,
                      height: 36,
                      padding: '0 14px',
                      background: '#161616',
                      border: '1px solid #282828',
                      borderRadius: theme.radii.chip,
                      color: TEXT_PRIMARY,
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: '20px',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {onAskConcierge && (
              <div style={{ padding: `0 ${PAGE}px` }}>
                <AskConciergeOffer onClick={() => onAskConcierge('')} />
              </div>
            )}
          </div>
        ) : resultCount === 0 ? (
          <CenteredState
            title="No matches"
            hint={`Nothing here for "${trimmed}".`}
            icon="search_off"
            action={onAskConcierge && <AskConciergeOffer onClick={() => onAskConcierge(trimmed)} />}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function CenteredState({
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
