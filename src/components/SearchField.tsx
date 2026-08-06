// ─── Search field (Figma `inputField`, node 5433-34513) ──────────────────────
//
// The app has **one** search field and it is the Saved tab's, over the user's own
// collections (Figma node 5531-2750). There is deliberately no catalog search:
// matching a typed string against tags only ever finds what has already been
// labelled, so the concierge does that job. This is a different thing - a filter
// over a short list you built yourself, where the name you gave a collection is
// exactly the word you would type to find it again.
//
// Figma spec: `height 48`, **`radius 12`** (radiusInput_Dropdown - a rounded
// rectangle, not a pill, the same exception the prompt field makes), `#161616` on
// `1px solid #282828`, padding `0 16`, `gap 8`. Leading `search` glyph 24px, the
// input (16/22), and a clear once there is text.
//
// The clear button is 32px wide for a usable touch target where the design draws
// a bare 24px glyph, so it carries a -4px margin: 16 - 4 + 32/2 puts the glyph
// centre 28px from the edge, exactly where Figma's 16 + 24/2 does.

import { theme } from '../theme';
import MIcon from './MIcon';

const FIELD_BG = '#161616';
const FIELD_BORDER = '#282828';
/** Figma text/textSecondary in the dark theme - glyphs and the placeholder. */
const ICON = '#8b8b8b';

export default function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Defaults to `placeholder`; set it when the visible hint is not a good label. */
  ariaLabel?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 48,
        borderRadius: theme.radii.input,
        background: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        padding: '0 16px',
      }}
    >
      <MIcon name="search" size={24} color={ICON} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        style={{
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
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
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
          <MIcon name="close" size={20} color={ICON} />
        </button>
      )}
    </div>
  );
}
