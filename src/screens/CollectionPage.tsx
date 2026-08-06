import { useMemo, useState } from 'react';
import { screenStyle, bodyStyle, Header, iconButtonStyle, primaryActionStyle } from './screenChrome';
import MIcon from '../components/MIcon';
import BottomDock from '../components/BottomDock';
import ProductCard from '../components/ProductCard';
import ContextualMenu from '../components/ContextualMenu';
import Dialog from '../components/Dialog';
import ProductPage from './ProductPage';
import type { ConciergePrompt } from './ChatScreen';
import { CreateCollectionSheet } from '../components/CollectionSheets';
import GhostCards from '../components/GhostCards';
import { collectionMeta, collectionShare, formatPrice, priceOf, type Collection } from '../data/collections';
import { type Product } from '../data/products';
import { shareContent, shareMessage } from '../data/share';
import { safeBottom } from '../theme';

// ─── Collection page (push over the Saved or Home tab) ───────────────────────
//
// One collection in full (Figma node 5539-20057): a centered title block, the
// pieces two up, and one thing at the bottom - see below.
//
// What is deliberately not here: a cover picture, a description, per-piece
// notes, virtual try-on, an "Add pieces" button, and a search field. A
// collection is a name and the things in it; pieces arrive by hearting them
// wherever you find them, and the "..." menu carries only what is left - Rename
// and Delete.
//
// `preview` is the same page for a **Discover look or outfit the user has not
// filed yet**. It stays fully usable, and the hearts carry their app-wide
// meaning (file this piece) rather than "remove from this collection". Only what
// needs a stored collection changes: rename / delete stay out of the menu, and
// **the bottom swaps** - a floating "Save to collection" while the look is not
// yours, the concierge prompt field once it is.

const PAGE = 16;
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';

export default function CollectionPage({
  collection,
  byName,
  onBack,
  onRename,
  onDelete,
  onRemoveItem,
  onAskConcierge,
  onNotice,
  gender,
  isSaved,
  onSave,
  preview = false,
  onSaveCollection,
}: {
  collection: Collection;
  byName: (name: string) => Product | undefined;
  onBack: () => void;
  onRename: (name: string) => void;
  /** Called after the destructive dialog confirms. */
  onDelete: () => void;
  onRemoveItem: (name: string) => void;
  /** Passed through to the product page opened from a piece in here. */
  onAskConcierge: (prompt: ConciergePrompt) => void;
  onNotice: (message: string) => void;
  gender: string | null;
  /** Hearts manage collection membership app-wide. */
  isSaved: (name: string) => boolean;
  onSave: (product: Product) => void;
  /**
   * A Discover look the user has not saved yet. Nothing here is theirs to edit
   * until they file it, so the page offers that instead of a menu.
   */
  preview?: boolean;
  onSaveCollection?: () => void;
}) {
  const [headerMenu, setHeaderMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const items = useMemo(
    () => collection.items.map(byName).filter(Boolean) as Product[],
    [collection.items, byName],
  );

  /** Renaming and deleting only make sense once the look is the user's. */
  const menuItems = preview
    ? []
    : [
        { icon: 'edit', label: 'Rename', onClick: () => setShowRename(true) },
        {
          icon: 'delete',
          label: 'Delete collection',
          destructive: true,
          onClick: () => setShowDelete(true),
        },
      ];

  /**
   * Hand the collection to someone else. The OS sheet confirms itself, so only
   * the clipboard fallback and an outright failure say anything.
   */
  const handleShare = async () => {
    const message = shareMessage(await shareContent(collectionShare(collection, byName)));
    if (message) onNotice(message);
  };

  /**
   * Hand off to the concierge with this collection attached. `text` is whatever
   * the user typed into the pinned prompt field; the canned line is the fallback
   * for an empty send.
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
      style={{
        ...screenStyle,
        zIndex: 200,
        background: '#0A0A0A',
        // A push, so it arrives like one (and never just pops in).
        animation: 'screenSlideInRight 320ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
      }}
    >
      {/* The name lives in the body's centered block; the bar keeps back, share,
          and the "..." menu. Share sits in the bar rather than the menu because
          handing a collection to someone is a large part of the point of making
          one - and because a **preview look has no menu at all** and still has
          to be shareable, which is exactly the state the design draws it in
          (Figma node 5555-53458). There is deliberately no search here: a
          collection is a short list the user assembled themselves and it is
          already entirely on screen. */}
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
          // The floating button hovers over this, so the last row needs room to
          // clear it - and the overlay it must clear ends at the safe-area inset,
          // not at the screen edge. The concierge field is a solid bar and takes
          // its own space.
          ...(preview ? { paddingBottom: safeBottom(96) } : null),
          // An empty collection has nothing to scroll, so the body becomes a
          // column and its empty state takes the leftover height - centred in the
          // page rather than stranded under the title with dead space below.
          ...(items.length === 0 ? { display: 'flex', flexDirection: 'column' } : null),
        }}
      >
        {/* Centered title block: name, then what is in it and what it costs. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: `4px 24px 0`,
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, lineHeight: '28px', color: '#fff' }}>
            {collection.name}
          </h1>
          <span style={{ fontSize: 14, fontWeight: 400, color: TEXT_SECONDARY, lineHeight: '20px' }}>
            {collectionMeta(collection, byName)}
          </span>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          // A real empty state: the app's shared ghost-cards illustration - the
          // shape of the pieces that are missing - then the line that says how
          // they get here. There is no button: pieces are added by hearting them
          // out in the app, not from inside an empty list.
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
              Heart a piece anywhere in the app to file it here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: `16px ${PAGE}px ${PAGE}px` }}>
            {items.map((p) => (
              // The app's `<ProductCard>` verbatim - same image, meta and heart.
              // Do not restyle the card here; change `components/ProductCard.tsx`
              // and every surface follows.
              <ProductCard
                key={p.name}
                product={p}
                width="100%"
                // The card titles the piece by name, so the brand goes on the
                // subtitle line (as it does on Discover) with the price the
                // collection needs alongside it. Kept as two fields so a narrow
                // card truncates the brand, never the price.
                subtitle={p.brand}
                price={formatPrice(priceOf(p))}
                // In a saved collection a filled heart means "in here"; in a
                // preview it is the app-wide save state, so an unsaved piece
                // reads as an outline.
                saved={preview ? isSaved(p.name) : true}
                savedLabel={
                  preview
                    ? `Save ${p.brand} ${p.name} to a collection`
                    : `Remove ${p.brand} ${p.name} from this collection`
                }
                onToggleSave={() => (preview ? onSave(p) : onRemoveItem(p.name))}
                onOpen={() => setOpenProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* The bottom of this page has exactly one job at a time, and which one
          depends on whether the collection is yours yet.

          **Not yours** - a Discover look or an outfit - and the only thing to
          decide is whether to keep it, so a full-width **"Save to collection"**
          pill floats over the list. Floating rather than a docked bar: it is one
          decision, not a permanent fixture, and the pieces stay visible under it
          while you make it. The heart is the same glyph that saves a piece
          everywhere else, because this saves the whole look the same way.
          Saving confirms with the snackbar upstream.

          **Already yours** and there is nothing left to decide, so the slot goes
          to the concierge instead - a prompt field, not a button, because what
          you want to ask about a collection is specific ("what shoes go with
          this?") and that way it takes one step instead of landing in an empty
          chat and typing it there. Sending starts a NEW chat with the collection
          attached. */}
      {preview ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            padding: `24px ${PAGE}px ${safeBottom(20)}`,
            // Fades the list out under the pill so it never sits on top of a
            // half-cropped card with nothing between them.
            background: 'linear-gradient(to top, #0A0A0A 55%, rgba(10,10,10,0))',
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={() => onSaveCollection?.()}
            style={{
              ...primaryActionStyle,
              pointerEvents: 'auto',
              // The shadow is what makes it read as floating over the list
              // rather than as a bar welded to the bottom of the page.
              boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
            }}
          >
            <MIcon name="favorite" size={18} color="#121212" />
            Save to my collections
          </button>
        </div>
      ) : (
        <BottomDock
          // Only the tail cycles. This field does more than one job and a single
          // static hint advertises one of them, but rotating whole sentences was
          // hard to read at a glance - so the lead-in stays put and the tail
          // changes under it. Short lead-in on purpose: spelling out "Ask AI
          // Concierge to" ate the width the tails need, and the page already
          // says whose concierge it is.
          // Keep every tail to ~20 characters: past that it truncates against
          // the attach and mic buttons at this field width.
          placeholderPrefix="Ask me"
          placeholder={['to add a piece', 'to update collection', 'to compare pieces']}
          ariaLabel="Ask AI Concierge"
          onSend={(text) => askConcierge(text)}
        />
      )}

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
          title="Rename collection"
          cta="Save"
          initialName={collection.name}
          onClose={() => setShowRename(false)}
          onSubmit={(name) => {
            setShowRename(false);
            onRename(name);
          }}
        />
      )}

      {showDelete && (
        <Dialog
          title="Delete this collection?"
          body="The pieces will be removed from this collection."
          confirmLabel="Delete collection"
          onClose={() => setShowDelete(false)}
          onConfirm={() => {
            setShowDelete(false);
            onDelete();
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
