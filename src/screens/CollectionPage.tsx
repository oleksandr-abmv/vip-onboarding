import { useMemo, useRef, useState } from 'react';
import {
  screenStyle,
  bodyStyle,
  Header,
  iconButtonStyle,
  outlinedActionStyle,
  primaryActionStyle,
} from './screenChrome';
import MIcon from '../components/MIcon';
import BottomDock from '../components/BottomDock';
import ProductCard from '../components/ProductCard';
import ContextualMenu from '../components/ContextualMenu';
import Dialog from '../components/Dialog';
import ProductPage from './ProductPage';
import type { ConciergePrompt } from './ChatScreen';
import { AddItemsSheet, CreateCollectionSheet, NoteSheet } from '../components/CollectionSheets';
import GhostCards from '../components/GhostCards';
import {
  collectionHasClothing,
  collectionMeta,
  collectionShare,
  formatPrice,
  priceOf,
  type Collection,
} from '../data/collections';
import { type Product } from '../data/products';
import { shareContent, shareMessage } from '../data/share';
import { nextCover } from '../data/covers';

// ─── Collection page (push over the Saved or Home tab) ───────────────────────
//
// One collection in full: a centered title block (name, meta, description), the
// full-width action stack, then the item list where each piece carries an optional
// note and a heart, with the concierge prompt field pinned at the bottom. The nav
// bar holds share and a "..." menu of what is not already on screen; pieces have
// no menu of their own, since the note strip and the heart already cover
// everything one would hold. There is no search: the collection is a short list
// the user assembled and it is all on screen already.
//
// `preview` is the same page for a **Discover look the user has not saved yet**.
// It stays fully usable - notes and hearts work, and the hearts carry their
// app-wide meaning (save this piece somewhere) rather than "remove from this
// collection". Only what needs a stored collection changes: the primary action
// files the look instead of adding pieces, and rename / delete leave the menu.
// Writing a note files the look too, so the note always lands somewhere.

const PAGE = 16;
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';

export default function CollectionPage({
  collection,
  byName,
  catalogue,
  onBack,
  onRename,
  onDelete,
  onRemoveItem,
  onSetNote,
  onAddItem,
  onScan,
  onAskConcierge,
  onNotice,
  gender,
  isSaved,
  onSave,
  preview = false,
  onSaveCollection,
  onSetCover,
}: {
  collection: Collection;
  byName: (name: string) => Product | undefined;
  /** Pieces the Add sheet can offer (gender-filtered upstream). */
  catalogue: Product[];
  onBack: () => void;
  onRename: (name: string, description: string) => void;
  /** Called after the destructive dialog confirms. */
  onDelete: () => void;
  onRemoveItem: (name: string) => void;
  onSetNote: (name: string, note: string) => void;
  /** One piece at a time, from the Add sheet. */
  onAddItem: (name: string) => void;
  /** The camera inside the Add sheet's search field - opens the scan overlay. */
  onScan: () => void;
  /** Pinned CTA: a new concierge chat with this collection attached. */
  onAskConcierge: (prompt: ConciergePrompt) => void;
  onNotice: (message: string) => void;
  gender: string | null;
  /** Hearts manage collection membership app-wide. */
  isSaved: (name: string) => boolean;
  onSave: (product: Product) => void;
  /**
   * A Discover look the user has not saved yet. Same page, but nothing here is
   * theirs to edit: the primary action files the look instead of adding pieces,
   * and rename / delete / notes stay out of the way until it is a real
   * collection.
   */
  preview?: boolean;
  onSaveCollection?: () => void;
  /** Set or clear the collection's cover. `null` removes it. */
  onSetCover: (cover: string | null) => void;
}) {
  const [headerMenu, setHeaderMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [noteTarget, setNoteTarget] = useState<Product | null>(null);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  /**
   * Generate the collection's cover. There is deliberately no upload: the app
   * owns the picture, so every cover is the same shape and the same safe fit.
   * Regenerating always lands on a different one.
   */
  const generateCover = () => {
    onNotice(collection.cover ? 'Regenerating cover' : 'Generating cover');
    window.setTimeout(() => onSetCover(nextCover(collection.cover)), 900);
  };

  const items = useMemo(
    () => collection.items.map(byName).filter(Boolean) as Product[],
    [collection.items, byName],
  );
  const hasClothing = collectionHasClothing(collection, byName);

  /**
   * Hand the collection to someone else. The OS sheet confirms itself, so only
   * the clipboard fallback and an outright failure say anything.
   */
  const handleShare = async () => {
    const message = shareMessage(await shareContent(collectionShare(collection, byName)));
    if (message) onNotice(message);
  };
  /**
   * The "..." menu carries what the action stack does not, so it can legitimately
   * come out empty - a Discover look you can try on has every action on screen
   * already. Built here rather than inline so the header can drop the button
   * instead of opening onto nothing.
   */
  const menuItems = [
    // Try-on is the one action that can be unavailable, and a collection with
    // nothing wearable should still name the feature rather than drop it, so it
    // appears here (disabled) exactly when the stack has no try-on button.
    ...(hasClothing
      ? []
      : [
          {
            icon: 'apparel',
            label: 'Virtual try-on',
            disabled: true,
            onClick: () => onNotice('Your virtual fitting room is being prepared'),
          },
        ]),
    // Renaming, re-covering and deleting only make sense once the look is the
    // user's. An outfit's cover is editorial until they save it, at which point
    // it is copied onto their collection and becomes theirs to change.
    ...(preview
      ? []
      : [
          {
            // Not the `auto_awesome` sparkle: see the concierge-mark rule in
            // CLAUDE.md. These say what happens, not who did it.
            icon: collection.cover ? 'autorenew' : 'image',
            label: collection.cover ? 'Regenerate cover' : 'Generate cover',
            onClick: generateCover,
          },
          ...(collection.cover
            ? [{ icon: 'hide_image', label: 'Remove cover', onClick: () => onSetCover(null) }]
            : []),
          { icon: 'edit', label: 'Rename', onClick: () => setShowRename(true) },
          {
            icon: 'delete',
            label: 'Delete collection',
            destructive: true,
            onClick: () => setShowDelete(true),
          },
        ]),
  ];


  /**
   * Hand off to the concierge with this collection attached. `text` is whatever
   * the user typed into the pinned prompt field; the canned line is the fallback
   * for entries that carry no question of their own.
   */
  const askConcierge = (text?: string) =>
    onAskConcierge({
      text: text?.trim() || `Advise me on my "${collection.name}" collection - what would complete it?`,
      attachment: {
        title: collection.name,
        subtitle: collectionMeta(collection, byName),
        images: items.slice(0, 4).map((p) => p.image),
        target: { kind: 'collection', id: collection.id },
      },
    });

  return (
    <div
      ref={rootRef}
      style={{
        ...screenStyle,
        zIndex: 200,
        background: '#0A0A0A',
        // A push, so it arrives like one (and never just pops in).
        animation: 'screenSlideInRight 320ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
      }}
    >
      {/* The name lives in the body's centered block; the bar keeps controls:
          share, then the "..." menu. There is deliberately no search here - a
          collection is a short list the user assembled themselves and it is
          already entirely on screen, so a field to find something inside it
          only added a step. Share sits out here rather than in the menu because
          handing a collection to someone is the point of building one, and a
          collection is shareable whether or not it is yours to edit: a preview
          look has no menu at all, and it still shares. */}
      <Header
        title=""
        onBack={onBack}
        right={
          <span style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleShare} aria-label="Share this collection" style={iconButtonStyle}>
              <MIcon name="share" size={24} color={TEXT_PRIMARY} />
            </button>
            {menuItems.length > 0 && (
              <button onClick={() => setHeaderMenu(true)} aria-label="Collection actions" style={iconButtonStyle}>
                <MIcon name="more_horiz" size={24} color={TEXT_PRIMARY} />
              </button>
            )}
          </span>
        }
      />

      <div
        style={{
          ...bodyStyle,
          // An empty collection has nothing to scroll, so the body becomes a
          // column and its empty state takes the leftover height - centred in the
          // page rather than stranded under the title with dead space below.
          ...(items.length === 0 ? { display: 'flex', flexDirection: 'column' } : null),
        }}
      >
        {/* Cover hero, when the collection has one. Deliberately NOT the product
            page's full-bleed band: that runs the picture to both screen edges,
            and a 4:3 cover in it left grey gutters either side that read as a
            broken image. This is an inset card instead - page margins, the same
            16 radius as everything else, and its own 4:3 box - so the cover sits
            on the page like a card rather than being cropped into a strip.

            `contain` on white: every cover is a 4:3 flat-lay with its own safe
            margin, so it lands flush and nothing is ever cropped off a look. */}
        {collection.cover && (
          <div
            style={{
              margin: `8px ${PAGE}px 16px`,
              aspectRatio: '4 / 3',
              background: '#fff',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <img
              src={collection.cover}
              alt=""
              aria-hidden
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
        )}

        {/* Centered title block: name, meta, description. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: `4px 24px 0`,
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: '30px', color: '#fff' }}>
            {collection.name}
          </h1>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#dedede', lineHeight: '20px' }}>
            {collectionMeta(collection, byName)}
          </span>
          {collection.description && (
            <p style={{ margin: 0, fontSize: 15, color: TEXT_SECONDARY, lineHeight: '21px', maxWidth: 300 }}>
              {collection.description}
            </p>
          )}
        </div>

        {/* Action stack, full width, in priority order: Virtual try-on, then
            whatever this page is for - filing the look while it is still a
            preview, adding pieces once it is the user's own. Try-on leads because
            it is the thing you came to a collection of clothes to do; the
            collection's own action sits under it, the way Add to collection does
            elsewhere. The first that applies takes the filled slot, so the page
            always has exactly one primary. */}
        {/* Skipped entirely while the collection is empty: its empty state below
            carries the one action there is, and two Add pieces buttons on one
            screen is one too many. */}
        <div
          style={{
            display: items.length === 0 ? 'none' : 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: `16px ${PAGE}px 4px`,
          }}
        >
          {hasClothing && (
            <ActionButton
              icon="apparel"
              label="Virtual try-on"
              onClick={() => onNotice('Your virtual fitting room is being prepared')}
              primary
            />
          )}
          {preview ? (
            <ActionButton
              icon="favorite"
              label="Save Collection"
              onClick={() => onSaveCollection?.()}
              primary={!hasClothing}
            />
          ) : (
            /* A preview has no stored collection to add to. */
            <ActionButton
              icon="add_2"
              label="Add pieces"
              onClick={() => setShowAddItems(true)}
              primary={!hasClothing}
            />
          )}
        </div>

        {/* Items */}
        {items.length === 0 ? (
          // A real empty state, not a dropzone: the app's shared ghost-cards
          // illustration - the shape of the pieces that are missing - then the
          // title, the line that says what to do, and the action that does it.
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: `24px ${PAGE}px 40px`,
              textAlign: 'center',
            }}
          >
            <GhostCards />
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '20px 0 0', lineHeight: '24px' }}>
              Nothing here yet
            </h2>
            <p style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: '20px', margin: 0, maxWidth: 260 }}>
              Add pieces from the catalog, or scan one with your camera.
            </p>
            <button
              onClick={() => setShowAddItems(true)}
              style={{ ...primaryActionStyle, width: 'auto', padding: '0 20px', marginTop: 12 }}
            >
              <MIcon name="add_2" size={18} color="#121212" />
              Add pieces
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: `12px ${PAGE}px ${PAGE}px` }}>
            {items.map((p) => (
              <ItemRow
                key={p.name}
                product={p}
                note={collection.notes[p.name]}
                hearted={preview ? isSaved(p.name) : true}
                showNote={!preview}
                heartLabel={
                  preview
                    ? `Save ${p.brand} ${p.name} to a collection`
                    : `Remove ${p.brand} ${p.name} from this collection`
                }
                onOpen={() => setOpenProduct(p)}
                onRemove={() => (preview ? onSave(p) : onRemoveItem(p.name))}
                onEditNote={() => setNoteTarget(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* The concierge, as a prompt field rather than a button: the question is
          usually specific ("what shoes go with this?"), so asking it takes one
          step instead of landing in an empty chat and typing it there. Sending
          starts a NEW chat with the collection attached. Same prompt-only dock
          Manage Memory uses. */}
      <BottomDock
        // Only the verb cycles. This field does three jobs and a single hint would
        // advertise one of them, but rotating whole sentences made it hard to read
        // at a glance - so the lead-in stays put and the tail changes under it.
        // The lead-in is only the word the three share, and short on purpose:
        // spelling out "Ask AI Concierge to" ate the width the tails need, and the
        // field already sits on a page that says whose concierge it is.
        placeholderPrefix="Ask"
        placeholder={['about this collection', 'to find a piece', 'to modify this collection']}
        ariaLabel="Ask AI Concierge"
        showAttach={false}
        onSend={(text) => askConcierge(text)}
      />

      {/* Header "..." menu */}
      {headerMenu && menuItems.length > 0 && (
        <ContextualMenu
          top={`calc(env(safe-area-inset-top, 0px) + 62px)`}
          onClose={() => setHeaderMenu(false)}
          items={menuItems}
        />
      )}


      {showRename && (
        <CreateCollectionSheet
          title="Edit collection"
          cta="Save Changes"
          initialName={collection.name}
          initialDescription={collection.description}
          onClose={() => setShowRename(false)}
          onSubmit={(name, description) => {
            setShowRename(false);
            onRename(name, description);
          }}
        />
      )}

      {showDelete && (
        <Dialog
          title={`Delete "${collection.name}"?`}
          body="The pieces stay in your other collections. Only this one goes away."
          confirmLabel="Delete Collection"
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            setShowDelete(false);
            onDelete();
          }}
        />
      )}

      {showAddItems && (
        <AddItemsSheet
          catalogue={catalogue}
          existing={collection.items}
          priceFor={(p) => formatPrice(priceOf(p))}
          onClose={() => setShowAddItems(false)}
          onAddOne={onAddItem}
          onScan={() => {
            setShowAddItems(false);
            onScan();
          }}
          onAskConcierge={(q) => {
            setShowAddItems(false);
            onAskConcierge({
              text: q
                ? `Help me find "${q}" for my "${collection.name}" collection`
                : `Help me find pieces for my "${collection.name}" collection`,
            });
          }}
        />
      )}

      {noteTarget && (
        <NoteSheet
          product={noteTarget}
          price={formatPrice(priceOf(noteTarget))}
          initial={collection.notes[noteTarget.name] ?? ''}
          onClose={() => setNoteTarget(null)}
          onSave={(note) => {
            onSetNote(noteTarget.name, note);
            setNoteTarget(null);
          }}
        />
      )}

      {openProduct && (
        <ProductPage
          product={openProduct}
          saved={isSaved(openProduct.name)}
          onToggleSave={() => onSave(openProduct)}
          onClose={() => setOpenProduct(null)}
          gender={gender}
          onNotice={onNotice}
          onAskConcierge={onAskConcierge}
        />
      )}
    </div>
  );
}

// ── Action-stack button ─────────────────────────────────────────────────────
//
// The product page's own filled / outlined pair, so the two pages offer their
// actions in one visual language rather than two.
function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button onClick={onClick} style={primary ? primaryActionStyle : outlinedActionStyle}>
      <MIcon name={icon} size={18} color={primary ? '#121212' : TEXT_PRIMARY} />
      {label}
    </button>
  );
}

// ── Collection item ─────────────────────────────────────────────────────────
//
// The app's `<ProductCard>` verbatim - same image, meta and heart - with the
// collection's note strip dropped into its `footer` slot. Do not restyle the card
// here; change `components/ProductCard.tsx` and every surface follows.
function ItemRow({
  product,
  note,
  onOpen,
  onRemove,
  onEditNote,
  /** Filled heart. In a saved collection that means "in here"; in a preview it is
      the app-wide save state, so an unsaved piece reads as an outline. */
  hearted = true,
  heartLabel,
  /** A look you have not saved is not yours to annotate yet. */
  showNote = true,
}: {
  product: Product;
  note?: string;
  onOpen: () => void;
  onRemove: () => void;
  onEditNote: () => void;
  hearted?: boolean;
  heartLabel?: string;
  showNote?: boolean;
}) {
  return (
    <ProductCard
      product={product}
      width="100%"
      // The card titles the piece by name, so the brand goes on the subtitle line
      // (as it does on Discover) with the price the collection needs alongside it.
      // Kept as two fields so a narrow card truncates the brand, never the price.
      subtitle={product.brand}
      price={formatPrice(priceOf(product))}
      saved={hearted}
      savedLabel={heartLabel}
      onToggleSave={onRemove}
      onOpen={onOpen}
      footer={
        !showNote ? null : note ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditNote();
            }}
            aria-label="Edit note"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              width: '100%',
              // Lifted off the card: the note is the one piece of the user's own
              // writing here, and the fill plus the italic mark it as theirs
              // rather than more product copy.
              background: '#1c1c1c',
              border: '1px solid #2a2a2a',
              borderRadius: 10,
              padding: '6px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* No label and no glyph: the box plus the italic is what says "this
                is the user's own writing", and it says it without spending a
                line of an already narrow card on the word "Note". */}
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 14,
                lineHeight: '20px',
                fontStyle: 'italic',
                color: '#ededed',
                // Two lines at card width, so a long note cannot stretch its card
                // past the one beside it. Tapping opens the sheet with the full
                // text. A clamp rather than `nowrap` because `text-overflow` only
                // ellipsises a single line; at two lines its habit of breaking at
                // the last whole word barely shows.
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {note}
            </span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditNote();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              color: '#a9a9a9',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Add Note
          </button>
        )
      }
    />
  );
}
