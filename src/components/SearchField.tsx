// ─── Search field (Figma `inputField`, node 5433-34513) ──────────────────────
//
// The one canonical search input: the Discover feed, the collection page and the
// Add pieces sheet all render this. Figma spec: `height 48`, **`radius 12`**
// (radiusInput_Dropdown - a rounded rectangle, not a pill, same exception as the
// prompt field), `#161616` on `1px solid #282828`, padding `0 16`, `gap 8`.
// Leading `search` glyph 24px, the input (16/22), a `cancel` clear once there is
// text, then an optional trailing action.
//
// The right padding is 12 rather than 16 because in-field buttons are 32px wide
// for a usable touch target while the design draws bare 24px glyphs. 12 + 32/2
// puts the glyph centre 28px from the edge, exactly where Figma's 16 + 24/2 does.

import { theme } from '../theme';
import MIcon from './MIcon';
import { useAutoFocus } from '../hooks/useAutoFocus';

const FIELD_BG = '#161616';
const FIELD_BORDER = '#282828';
/** Figma text/textSecondary in the dark theme - glyphs and the placeholder. */
const ICON = '#8b8b8b';

export default function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  trailing,
  autoFocus = false,
  onActivate,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Defaults to `placeholder`; set it when the visible hint is not a good label. */
  ariaLabel?: string;
  /** Action drawn at the end of the field - use `<SearchFieldAction>`. */
  trailing?: React.ReactNode;
  /** Focused on mount without scrolling to reveal it. See `useAutoFocus`. */
  autoFocus?: boolean;
  /**
   * Turns the field into a button: it stops accepting text and opens something
   * instead (Discover's field opens the search modal). The field still looks
   * exactly the same, which is the point - it is the affordance, not the input.
   */
  onActivate?: () => void;
}) {
  const inputRef = useAutoFocus<HTMLInputElement>(autoFocus && !onActivate);
  return (
    <div
      onClick={onActivate}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 48,
        borderRadius: theme.radii.input,
        background: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        padding: '0 16px',
        cursor: onActivate ? 'pointer' : undefined,
      }}
    >
      <MIcon name="search" size={24} color={ICON} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        // As a button, the field must not take a caret or the mobile keyboard.
        readOnly={!!onActivate}
        onFocus={onActivate ? (e) => { e.currentTarget.blur(); onActivate(); } : undefined}
        style={{
          cursor: onActivate ? 'pointer' : undefined,
          flex: 1,
          minWidth: 0,
          background: 'none',
          border: 'none',
          outline: 'none',
          color: '#f6f6f6',
          fontSize: 16,
          lineHeight: '22px',
        }}
      />
      {value !== '' && (
        <SearchFieldAction label="Clear search" onClick={() => onChange('')}>
          <MIcon name="cancel" size={20} color={ICON} />
        </SearchFieldAction>
      )}
      {trailing}
    </div>
  );
}

/**
 * An icon button living inside the field (the Discover field's scan brackets,
 * the Add pieces sheet's camera, the clear button).
 *
 * The design draws these as bare 24px glyphs. The button is widened to 32x40 for
 * a usable touch target and pulled back by the 4px it gains on each side, so the
 * glyph still lands exactly where Figma puts it.
 */
export function SearchFieldAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      // Stops the tap reaching the field itself, which may be an `onActivate`
      // button (Discover's field opens the search modal).
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={label}
      style={{
        width: 32,
        height: 40,
        margin: '0 -4px',
        flexShrink: 0,
        background: 'none',
        border: 'none',
        borderRadius: theme.radii.button,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
