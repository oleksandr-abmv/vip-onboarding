import { useMemo, useState } from 'react';
import Sheet from './Sheet';
import MIcon from './MIcon';
import SearchField, { SearchFieldAction } from './SearchField';
import ScanIcon from './ScanIcon';
import AskConciergeOffer from './AskConciergeOffer';
import { useAutoFocus } from '../hooks/useAutoFocus';
import { theme } from '../theme';
import { matchesQuery, type Product } from '../data/products';
import { collectionMeta, type Collection } from '../data/collections';

// ─── Collections sheet kit ───────────────────────────────────────────────────
//
// The bottom sheets behind Saved > Collections:
//   AddToCollectionFlow    select (multi) → create → note → save
//   CreateCollectionSheet  name + description (also used to rename)
//   AddItemsSheet          search the catalog, multi-select pieces to add
//   NoteSheet              edit the optional note on one collection item
//
// All of them ride the shared <Sheet>; the "X · title · Create" header uses the
// sheet's `action` slot. Multi-select uses CheckCircle - a 24px circle that
// fills white with a dark check when selected.

const FIELD_BG = '#161616';
const FIELD_BORDER = '#282828';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';
const PAGE = 16;
/** Dark fill behind anything in a cover that has no product on it. */
const SURFACE = '#161616';

// ── Shared bits ──────────────────────────────────────────────────────────────

export function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
        borderRadius: theme.radii.button,
        border: checked ? 'none' : '1.5px solid #444547',
        background: checked ? '#f6f6f6' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 140ms ease, border 140ms ease',
      }}
    >
      {checked && <MIcon name="check" size={16} weight={500} color="#121212" />}
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
  resize: 'none',
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
 * The 2x2 collection cover, at any size (56px row thumb or the full card):
 *   0 items     one full tile with the VIP logotype placeholder
 *   1-4 items   images fill in; empty cells are the dark surface + a faint logo
 *   5+ items    3 previews; the 4th sits under a scrim with "+N" (N = total - 3)
 */
export function CollectionCover({
  items,
  total,
  size = 56,
  aspect,
  radius = 10,
}: {
  items: (Product | undefined)[];
  /** Full collection size; past four, the 4th tile gains the "+N" scrim. */
  total?: number;
  /** A number renders a square; pass '100%' + `aspect` for the card cover. */
  size?: number | string;
  aspect?: string;
  radius?: number;
}) {
  const cells = [0, 1, 2, 3].map((i) => items[i]);
  const count = items.filter(Boolean).length;
  const plus = total != null && total > 4 ? total - 3 : 0;
  const plusFont = typeof size === 'number' ? Math.max(10, Math.round(size / 5)) : 17;

  const cell = (p: Product | undefined, i: number) => (
    <div
      key={i}
      style={{
        position: 'relative',
        // The light gallery backdrop exists to sit a product on. An empty slot has
        // no product, so it takes the dark surface instead - the same one the
        // image-less cover uses - and a half-filled collection stops reading as a
        // grid with the lights left on.
        background: p ? '#ececec' : SURFACE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {p ? (
        <img
          src={p.image}
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
      {i === 3 && plus > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10, 10, 10, 0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: plusFont, fontWeight: 600, color: '#fff', letterSpacing: 0.2 }}>
            +{plus}
          </span>
        </div>
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
        gap: 1,
        background: '#282828',
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
 * The fanned collection cover (Figma node 5442-23149): up to three product
 * tiles laid out like photos dropped on a table, the outer two kicked out by
 * 15deg so you can see what is inside without opening anything.
 *
 *   0 items   the VIP logotype on the bare surface, no tile
 *   1 item    one tile, centred, square to the card
 *   2 items   two tiles at -15deg / +15deg
 *   3+ items  three tiles at -15deg / 0 / +15deg
 *
 * Unlike the 2x2 `CollectionCover` there are no empty slots to fill: a
 * two-piece collection is two tiles, not two tiles and two holes. Past three
 * pieces the extras simply are not drawn - the card's own subtitle already
 * reads "12 pieces - $48,000", so a "+9" badge would say it twice.
 *
 * Every measurement is in `cqw` (percent of the cover's own width) taken
 * straight from the 343px-wide frame in the file, so the fan keeps its
 * proportions at the 230px Discover width as well as full bleed.
 */
export function CollectionFan({
  items,
  size = '100%',
  aspect = '600 / 400',
  radius = 0,
  max = 4,
}: {
  items: (Product | undefined)[];
  size?: number | string;
  aspect?: string;
  radius?: number;
  /**
   * Tiles drawn before the rest of the collection is left off the cover. The
   * file draws three; four still shows enough of every piece to recognise it
   * (44% of each tile), and five drops that to a third, where the middle of the
   * fan turns into slivers you cannot read. Four is the ceiling worth using.
   */
  max?: number;
}) {
  // Tile geometry, as fractions of the cover width in the design frame:
  // 120.652 / 343 wide, 11.664 padding and corner, 80 between adjacent centres.
  // The whole fan is scaled to 85% of the file's geometry: at the card widths
  // the feed actually uses, the tiles at full size crowded the cover edge to
  // edge. Every number below is the Figma value times 0.85, so the fan keeps its
  // proportions exactly and only its footprint changes.
  const TILE_W = 29.9; // cqw (35.18 in the file)
  const TILE_PAD = 2.89; // cqw (3.4)
  const TILE_RADIUS = 2.89; // cqw (3.4)
  const TILE_ASPECT = '120.652 / 114.72';
  // The trio does not sit on the cover's vertical midline in the file; it rides
  // slightly low so the rotated corners have room at the top.
  const TILE_CY = '54.39%';
  // How far the outermost tile's centre may sit from the middle before its
  // rotated corner leaves the cover. Taken from the file's three-tile layout,
  // where the outer tiles land 19px inside a 343px card.
  // Spread, unlike tile size, is NOT scaled down with the tiles. Shrinking the
  // tiles freed room at both ends of the cover, so the fan opens wider than the
  // file's to use it: at four tiles each one now shows 60% of itself instead of
  // 44%, and the run still lands a few cqw inside the edge.
  const EDGE = 27; // cqw from the middle to the outermost tile's centre
  const BASE_STEP = 22; // cqw between adjacent centres while they still fit

  const shown = items.filter(Boolean).slice(0, max) as Product[];
  const n = shown.length;
  // Up to three tiles keep the file's spacing exactly. Past that the run would
  // walk out of the cover, so the step tightens to pin the outermost tile at
  // the same margin and the extras slide in underneath.
  const step = n < 2 ? 0 : Math.min(BASE_STEP, (EDGE * 2) / (n - 1));
  // Rotation fans evenly from -15 to +15, which reproduces the file's -15/0/+15
  // for three and -15/+15 for two.
  const angles = shown.map((_, i) => (n < 2 ? 0 : -15 + (30 / (n - 1)) * i));

  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: size,
        ...(aspect ? { aspectRatio: aspect } : { height: size }),
        flexShrink: 0,
        borderRadius: radius,
        overflow: 'hidden',
        background: SURFACE,
        containerType: 'inline-size',
      }}
    >
      {shown.length === 0 ? (
        // Image-less collection: the uniform VIP logotype placeholder, bare on
        // the surface. No tile behind it - there is no piece to sit on one.
        <img
          src="/vip-logo.svg"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '23.18cqw',
            opacity: 0.35,
            display: 'block',
          }}
        />
      ) : (
        shown.map((p, i) => {
          // Centre the run of tiles: n tiles span n-1 steps either side.
          const offset = (i - (n - 1) / 2) * step;
          return (
            <div
              key={p.name}
              style={{
                position: 'absolute',
                left: '50%',
                top: TILE_CY,
                width: `${TILE_W}cqw`,
                aspectRatio: TILE_ASPECT,
                transform: `translate(-50%, -50%) translateX(${offset}cqw) rotate(${angles[i]}deg)`,
                background: '#ececec',
                borderRadius: `${TILE_RADIUS}cqw`,
                padding: `${TILE_PAD}cqw`,
                boxSizing: 'border-box',
                // The file's shadow token is a light-mode one and vanishes on
                // this surface, so the tiles get a dark one instead - without it
                // the overlaps read as one flat shape.
                boxShadow: '0 2px 4cqw rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={p.image}
                alt=""
                aria-hidden
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

/** Compact product row: thumb + name/brand + price. Used in note + add sheets. */
function ProductMiniRow({
  product,
  price,
  trailing,
  onClick,
}: {
  product: Product;
  price: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
}) {
  const isPlaceholder = product.image === '/vip-logo.svg';
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 10,
          background: '#ececec',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={product.image}
          alt=""
          aria-hidden
          draggable={false}
          style={
            isPlaceholder
              ? { width: 26, height: 26, opacity: 0.3, filter: 'brightness(0)', display: 'block' }
              : { maxWidth: '80%', maxHeight: '84%', objectFit: 'contain', display: 'block' }
          }
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#f7f7f7',
            lineHeight: '20px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.brand} {product.name}
        </p>
        <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: '18px' }}>
          {product.category}
          {price && ` · ${price}`}
        </span>
      </div>
      {trailing}
    </div>
  );
}

// ── Create / rename ──────────────────────────────────────────────────────────

export function CreateCollectionSheet({
  title = 'New collection',
  cta = 'Create Collection',
  initialName = '',
  initialDescription = '',
  onSubmit,
  onClose,
  onBack,
}: {
  title?: string;
  cta?: string;
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => void;
  onClose: () => void;
  onBack?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const canSubmit = name.trim().length > 0;
  const nameRef = useAutoFocus<HTMLInputElement>();
  return (
    <Sheet title={title} onClose={onClose} onBack={onBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: `8px ${PAGE}px 0` }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={fieldLabelStyle}>Name</span>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name your collection"
            style={fieldStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={fieldLabelStyle}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What belongs here (optional)"
            rows={3}
            style={fieldStyle}
          />
        </label>
        <CtaButton
          label={cta}
          disabled={!canSubmit}
          onClick={() => onSubmit(name.trim(), description.trim())}
        />
      </div>
    </Sheet>
  );
}

// ── Add to collection (select → create → note) ───────────────────────────────

export function AddToCollectionFlow({
  product,
  price,
  collections,
  byName,
  preselected = [],
  onCreate,
  onSave,
  onClose,
}: {
  /** The piece being filed. */
  product: Product;
  /** Its display price (from the shared price history). */
  price: string;
  collections: Collection[];
  byName: (name: string) => Product | undefined;
  /** Collections already holding the piece - checked on open; unchecking them
      and saving removes the piece (the heart manages membership). */
  preselected?: string[];
  /** Creates the collection upstream and returns it (so it can be preselected). */
  onCreate: (name: string, description: string) => Collection;
  /** The final membership (and note for new additions), then closes. */
  onSave: (collectionIds: string[], note: string) => void;
  onClose: () => void;
}) {
  // Jump straight to "create" when there is nothing to select yet.
  const [step, setStep] = useState<'select' | 'create' | 'note'>(
    collections.length === 0 ? 'create' : 'select',
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(preselected));
  const [note, setNote] = useState('');
  // Focused only on the note step, so the select step does not steal focus.
  const noteRef = useAutoFocus<HTMLTextAreaElement>(step === 'note');
  // The note step only applies to NEW additions; pure removals save directly.
  const additions = [...selected].filter((id) => !preselected.includes(id));
  const changed = additions.length > 0 || preselected.some((id) => !selected.has(id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (step === 'create') {
    return (
      <CreateCollectionSheet
        onClose={onClose}
        onBack={collections.length > 0 ? () => setStep('select') : undefined}
        onSubmit={(name, description) => {
          const created = onCreate(name, description);
          setSelected((prev) => new Set(prev).add(created.id));
          setStep('select');
        }}
      />
    );
  }

  if (step === 'note') {
    return (
      <Sheet title="Add to collection" onClose={onClose} onBack={() => setStep('select')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: `8px ${PAGE}px 0` }}>
          <ProductMiniRow product={product} price={price} />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={fieldLabelStyle}>Note</span>
            <textarea
              ref={noteRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              rows={3}
              style={fieldStyle}
            />
          </label>
          <CtaButton label="Save" onClick={() => onSave([...selected], note.trim())} />
        </div>
      </Sheet>
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
            background: 'none',
            border: 'none',
            padding: '6px 0',
            fontSize: 15,
            fontWeight: 500,
            color: TEXT_PRIMARY,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Create
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', padding: `8px ${PAGE}px 0` }}>
        <div
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
              role="checkbox"
              aria-checked={selected.has(c.id)}
              onClick={() => toggle(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CollectionCover items={c.items.map(byName)} total={c.items.length} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#f7f7f7',
                    lineHeight: '20px',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.name}
                </p>
                <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: '18px' }}>
                  {collectionMeta(c, byName)}
                </span>
              </div>
              <CheckCircle checked={selected.has(c.id)} />
            </div>
          ))}
        </div>
        <CtaButton
          label={additions.length > 0 ? 'Next' : 'Save'}
          disabled={!changed}
          onClick={() => (additions.length > 0 ? setStep('note') : onSave([...selected], ''))}
        />
      </div>
    </Sheet>
  );
}

// ── Add pieces to a collection (search the catalog) ──────────────────────────

export function AddItemsSheet({
  catalogue,
  existing,
  priceFor,
  onAddOne,
  onScan,
  onAskConcierge,
  onClose,
}: {
  /** Pieces that can be added (already gender-filtered upstream). */
  catalogue: Product[];
  /** Names already in the collection - shown with a check, inert. */
  existing: string[];
  priceFor: (p: Product) => string;
  /** Tapping a result adds that one piece immediately; the sheet stays open. */
  onAddOne: (name: string) => void;
  /** The camera button inside the search field - closes into the scan overlay. */
  onScan: () => void;
  /** The concierge hand-off. Receives the typed query, blank from the idle state. */
  onAskConcierge?: (query: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  // Results appear only once the user starts typing (idle state before that).
  // Shared `matchesQuery` so "piece, brand, or category" means the same here as
  // it does on Discover.
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return catalogue.filter((p) => matchesQuery(p, q));
  }, [catalogue, query]);

  return (
    <Sheet title="Add to collection" onClose={onClose} full>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Search + scan share the field (shared SearchField, Figma inputField). */}
        <div style={{ padding: `8px ${PAGE}px 12px` }}>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder='Try "Juste un Clou"'
            ariaLabel="Search the catalog"
            autoFocus
            trailing={
              <SearchFieldAction label="Scan a piece" onClick={onScan}>
                {/* The design's own scan vector, same as Discover's field. */}
                <ScanIcon size={24} color={TEXT_PRIMARY} />
              </SearchFieldAction>
            }
          />
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: `4px ${PAGE}px calc(16px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          {query.trim() === '' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '72px 8px 0',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: '26px', color: TEXT_PRIMARY }}>
                Search the catalog
              </h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: TEXT_SECONDARY, maxWidth: 280 }}>
                Type a piece, brand, or category to get started - or scan one with the camera.
              </p>
              {onAskConcierge && <AskConciergeOffer onClick={() => onAskConcierge('')} />}
            </div>
          ) : results.length > 0 ? (
            results.map((p) => {
              const added = existing.includes(p.name);
              return (
                <ProductMiniRow
                  key={p.name}
                  product={p}
                  price={priceFor(p)}
                  onClick={added ? undefined : () => onAddOne(p.name)}
                  trailing={
                    added ? (
                      <MIcon name="check_circle" size={22} fill={1} color="#8b8b8b" />
                    ) : (
                      <MIcon name="add_2" size={22} color={TEXT_PRIMARY} />
                    )
                  }
                />
              );
            })
          ) : (
            // Dead end: the same concierge offer, so a miss is never the end of it.
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 8px 0' }}>
              <p style={{ margin: 0, textAlign: 'center', fontSize: 14, lineHeight: '20px', color: TEXT_SECONDARY }}>
                Nothing matches "{query}" yet.
              </p>
              {onAskConcierge && <AskConciergeOffer onClick={() => onAskConcierge(query.trim())} />}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

// ── Edit the note on one collection item ─────────────────────────────────────

export function NoteSheet({
  product,
  price,
  initial = '',
  onSave,
  onClose,
}: {
  product: Product;
  price: string;
  initial?: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(initial);
  const noteRef = useAutoFocus<HTMLTextAreaElement>();
  return (
    <Sheet title={initial ? 'Edit note' : 'Add note'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: `8px ${PAGE}px 0` }}>
        <ProductMiniRow product={product} price={price} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={fieldLabelStyle}>Note</span>
          <textarea
            ref={noteRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Sizing, occasion, who it's for..."
            rows={3}
            style={fieldStyle}
          />
        </label>
        <CtaButton label="Save" onClick={() => onSave(note.trim())} />
      </div>
    </Sheet>
  );
}
