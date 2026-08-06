import { useState } from 'react';
import Sheet from './Sheet';
import MIcon from './MIcon';
import { useAutoFocus } from '../hooks/useAutoFocus';
import { theme } from '../theme';
import { type Product } from '../data/products';
import { collectionMeta, type Collection } from '../data/collections';

// ─── Collections sheet kit ───────────────────────────────────────────────────
//
// The bottom sheets behind Saved > Collections (Figma node 5531-2750):
//   AddToCollectionFlow    pick one collection (or create one) → save
//   CreateCollectionSheet  a name, nothing else (also used to rename)
//
// Both ride the shared <Sheet> with close in the leading slot; the "X · title ·
// Create" header uses the sheet's `action` slot.
//
// **The picker is radio, not checkbox.** A piece lives in exactly one
// collection, so choosing a different one moves it rather than adding a second
// membership - there is no set to edit, only an answer to change.

const FIELD_BG = '#161616';
const FIELD_BORDER = '#282828';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';
const PAGE = 16;
/** Dark fill behind a collection with nothing in it yet. */
const SURFACE = '#161616';
/** The gallery backdrop every product sits on, app-wide. */
const PHOTO_BG = '#ececec';

// ── Shared bits ──────────────────────────────────────────────────────────────

/** Figma `Radio`: a ring that gains a filled centre when it is the chosen one. */
export function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
        borderRadius: theme.radii.button,
        border: `1.5px solid ${checked ? '#f6f6f6' : '#444547'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 140ms ease',
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: theme.radii.button,
          background: checked ? '#f6f6f6' : 'transparent',
          transition: 'background 140ms ease',
        }}
      />
    </span>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: TEXT_PRIMARY,
  lineHeight: '20px',
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: FIELD_BG,
  border: `1px solid ${FIELD_BORDER}`,
  borderRadius: theme.radii.input,
  padding: '12px 14px',
  fontSize: 16,
  lineHeight: '22px',
  color: TEXT_PRIMARY,
  outline: 'none',
  fontFamily: 'inherit',
};

function CtaButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        height: 48,
        background: disabled ? '#252525' : '#f6f6f6',
        color: disabled ? '#666' : '#121212',
        border: 'none',
        borderRadius: theme.radii.button,
        fontSize: 16,
        fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 160ms ease, color 160ms ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  );
}

/**
 * The 2x2 collection cover: the pieces inside, laid out as a grid rather than
 * fanned. This is what a collection looks like everywhere it appears as a card
 * (the Saved column, Discover's Collections row), so a collection is always
 * recognisable by its contents and never needs a cover picture of its own.
 *
 *   0 items     one full tile with the VIP logotype placeholder
 *   1-4 items   images fill in; empty cells are the dark surface + a faint logo
 *   5+ items    the first four, and that is all
 *
 * **There is no "+N" overflow count.** The four tiles are a preview, not an
 * inventory, and the card's own meta line already reads "6 items · $45,550" -
 * the badge said it a second time and cost a piece to say it.
 */
export function CollectionCover({
  images,
  size = 56,
  aspect,
  radius = 10,
}: {
  /** The pieces' image URLs. Only the picture is ever read, so a caller that
      has URLs (the chat's attachment) does not need to resolve Products. */
  images: (string | undefined)[];
  /** A number renders a square; pass '100%' + `aspect` for the card cover. */
  size?: number | string;
  aspect?: string;
  radius?: number;
}) {
  const cells = [0, 1, 2, 3].map((i) => images[i]);
  const count = images.filter(Boolean).length;

  const cell = (p: string | undefined, i: number) => (
    <div
      key={i}
      style={{
        position: 'relative',
        // The light gallery backdrop exists to sit a product on. An empty slot has
        // no product, so it takes the dark surface instead - the same one the
        // image-less cover uses - and a half-filled collection stops reading as a
        // grid with the lights left on.
        background: p ? PHOTO_BG : SURFACE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {p ? (
        <img
          src={p}
          alt=""
          aria-hidden
          draggable={false}
          style={{ maxWidth: '82%', maxHeight: '84%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        // Empty slot: the concierge logotype, faint on the dark surface.
        <img
          src="/vip-logo.svg"
          alt=""
          aria-hidden
          style={{ width: '38%', height: '38%', opacity: 0.22, display: 'block' }}
        />
      )}
    </div>
  );

  return (
    <div
      aria-hidden
      style={{
        width: size,
        ...(aspect ? { aspectRatio: aspect } : { height: size }),
        flexShrink: 0,
        borderRadius: radius,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        // The hairline between tiles is the page showing through, not a border:
        // a lighter rule read as a frame around each piece.
        gap: 1,
        background: '#101111',
      }}
    >
      {count === 0 ? (
        <div
          style={{
            gridColumn: '1 / -1',
            gridRow: '1 / -1',
            // A dark surface, not the light gallery backdrop: that backdrop
            // exists to sit products on, and with no product on it the cover read
            // as a blank white slab next to the real ones.
            background: SURFACE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Image-less collection: the uniform VIP logotype placeholder. */}
          <img
            src="/vip-logo.svg"
            alt=""
            aria-hidden
            style={{ width: '42%', height: '42%', opacity: 0.35, display: 'block' }}
          />
        </div>
      ) : (
        cells.map(cell)
      )}
    </div>
  );
}

/**
 * The collection as one square: the first piece in it. Used in the Add to
 * collection rows, where a 2x2 grid at 56px turned four pieces into four
 * thumbnails too small to read - one piece you can actually see identifies the
 * collection better than four you cannot.
 */
function CollectionThumb({ item }: { item?: Product }) {
  return (
    <div
      aria-hidden
      style={{
        width: 56,
        height: 56,
        flexShrink: 0,
        borderRadius: 12,
        background: item ? PHOTO_BG : SURFACE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {item ? (
        <img
          src={item.image}
          alt=""
          aria-hidden
          draggable={false}
          style={{ maxWidth: '80%', maxHeight: '84%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <img
          src="/vip-logo.svg"
          alt=""
          aria-hidden
          style={{ width: 22, height: 22, opacity: 0.35, display: 'block' }}
        />
      )}
    </div>
  );
}

// ── Create / rename ──────────────────────────────────────────────────────────

/**
 * One field. A collection is a name and the things in it, so there is nothing
 * else to fill in here - no description, no cover to pick.
 */
export function CreateCollectionSheet({
  title = 'New collection',
  cta = 'Create collection',
  initialName = '',
  onSubmit,
  onClose,
  onBack,
}: {
  title?: string;
  cta?: string;
  initialName?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
  onBack?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const canSubmit = name.trim().length > 0;
  const nameRef = useAutoFocus<HTMLInputElement>();
  return (
    <Sheet title={title} onClose={onClose} onBack={onBack} closeLeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: `8px ${PAGE}px 0` }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={fieldLabelStyle}>Collection name</span>
          <span style={{ position: 'relative', display: 'flex' }}>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Riviera Summer"
              style={{ ...fieldStyle, paddingRight: 44 }}
            />
            {name !== '' && (
              <button
                onClick={() => setName('')}
                aria-label="Clear the name"
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 32,
                  height: 32,
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
                <MIcon name="close" size={20} color={TEXT_SECONDARY} />
              </button>
            )}
          </span>
        </label>
        <CtaButton label={cta} disabled={!canSubmit} onClick={() => onSubmit(name.trim())} />
      </div>
    </Sheet>
  );
}

// ── Add to collection (pick one → save) ──────────────────────────────────────

export function AddToCollectionFlow({
  collections,
  byName,
  /** The collection currently holding the piece, if any. */
  current,
  onCreate,
  onSave,
  onClose,
}: {
  /** **Newest first** - the caller sorts, the same order the Saved list uses.
      A collection created from this sheet's own "Create" has to come back at
      the top of the list, not wherever it happened to be appended. */
  collections: Collection[];
  byName: (name: string) => Product | undefined;
  current?: string;
  /** Creates the collection upstream and returns it (so it can be selected). */
  onCreate: (name: string) => Collection;
  /** The chosen collection, or null to take the piece out of all of them. */
  onSave: (collectionId: string | null) => void;
  onClose: () => void;
}) {
  // Jump straight to "create" when there is nothing to choose from yet.
  const [step, setStep] = useState<'select' | 'create'>(
    collections.length === 0 ? 'create' : 'select',
  );
  const [selected, setSelected] = useState<string | null>(current ?? null);

  if (step === 'create') {
    return (
      <CreateCollectionSheet
        onClose={onClose}
        onBack={collections.length > 0 ? () => setStep('select') : undefined}
        onSubmit={(name) => {
          const created = onCreate(name);
          setSelected(created.id);
          setStep('select');
        }}
      />
    );
  }

  return (
    <Sheet
      title="Add to collection"
      onClose={onClose}
      action={
        <button
          onClick={() => setStep('create')}
          style={{
            height: 32,
            padding: '0 12px',
            background: '#101111',
            border: '1px solid #444547',
            borderRadius: theme.radii.button,
            fontSize: 15,
            fontWeight: 500,
            color: TEXT_PRIMARY,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Create
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', padding: `8px ${PAGE}px 0` }}>
        <div
          role="radiogroup"
          aria-label="Collections"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: 320,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 16,
          }}
        >
          {collections.map((c) => (
            <div
              key={c.id}
              role="radio"
              aria-checked={selected === c.id}
              // Tapping the chosen one again clears it, which is how a piece
              // leaves every collection: the heart's only other job.
              onClick={() => setSelected((prev) => (prev === c.id ? null : c.id))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CollectionThumb item={c.items[0] ? byName(c.items[0]) : undefined} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#f7f7f7',
                    lineHeight: '22px',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.name}
                </p>
                <span style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: '20px' }}>
                  {collectionMeta(c, byName)}
                </span>
              </div>
              <RadioDot checked={selected === c.id} />
            </div>
          ))}
        </div>
        <CtaButton
          label="Save"
          disabled={selected === (current ?? null)}
          onClick={() => onSave(selected)}
        />
      </div>
    </Sheet>
  );
}
