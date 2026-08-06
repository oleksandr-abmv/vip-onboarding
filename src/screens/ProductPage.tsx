import { useMemo, useState, type ReactNode } from 'react';
import { RAIL_CARD_W, safeTop, theme } from '../theme';
import { viewsOf, type Product } from '../data/products';
import { categoryConfigs, getSubcategories } from '../data/categoryConfig';
import MIcon from '../components/MIcon';
import NavIconButton from '../components/NavIconButton';
import CollectionCard from '../components/CollectionCard';
import ProductCard from '../components/ProductCard';
import ProductGallery from '../components/ProductGallery';
import SaveToCollection from '../components/SaveToCollection';
import { getPriceHistory } from '../data/priceHistory';
import { getSpecs } from '../data/specs';
import { houseFor, peopleFor } from '../data/people';
import { collectionOf, isClothing, type Collection } from '../data/collections';
import { shareContent, shareMessage } from '../data/share';
import { outlinedActionStyle, primaryActionStyle } from './screenChrome';
import BottomDock from '../components/BottomDock';
import type { ConciergePrompt } from './ChatScreen';

const PAGE = 16;

/** Nav height below the safe area: 10 top pad + 40 button + 20 bottom pad. */
const NAV_H = 70;

/**
 * The collections store, as the product page's rail needs to see it. Bundled
 * because the page is opened from three places (the feed, a collection page and
 * a scan result) and all three forward the same thing.
 */
/** A Discover look that contains this piece, flattened for the card. */
export interface LookMatch {
  id: string;
  name: string;
  /** The pieces' images, for the 2x2 cover. */
  images: string[];
  /** "N items · $total", computed upstream where the prices live. */
  meta: string;
  /** Whether the whole look is already one of the user's collections. */
  saved: boolean;
}

export interface CollectionPicker {
  /** Newest first, the order every surface listing collections uses. */
  collections: Collection[];
  byName: (name: string) => Product | undefined;
  /** File the piece here, or take it out when it is already the one. */
  onPick: (product: Product, collectionId: string) => void;
  /** Opens the create sheet, which files the piece into what it makes. */
  onCreate: (product: Product) => void;
  /** The looks this piece already appears in. Empty for most of the catalogue. */
  looksWith: (product: Product) => LookMatch[];
  /** Individual pieces of the same kind, nearest in price first. */
  similarTo: (product: Product) => Product[];
  /** Whether a piece is in any collection, for its card's heart. */
  isSaved: (product: Product) => boolean;
  /** The heart on a piece's card: the same sheet flow the page's own heart uses. */
  onToggleSaved: (product: Product) => void;
  /** Opens a look's collection page, the same one Discover opens. */
  onOpenLook: (lookId: string) => void;
  /** The card's heart: files the whole look, as Discover's look cards do. */
  onToggleLookSaved: (lookId: string) => void;
  /** The card's "..." menu, rendered by the host that owns its actions. */
  renderLookMenu: (lookId: string) => ReactNode;
}

interface ProductPageProps {
  product: Product;
  /** In any collection - the heart manages membership via the sheet flow. */
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
  gender: string | null;
  /** Toast for actions with no destination yet (Virtual try-on). */
  onNotice?: (message: string) => void;
  /** Everything the "Save to collection" rail needs. */
  picker: CollectionPicker;
  /** The pinned prompt field's hand-off: a NEW chat with this piece attached. */
  onAskConcierge?: (prompt: ConciergePrompt) => void;
}

export default function ProductPage({
  saved,
  onToggleSave,
  onClose,
  gender,
  onNotice,
  onAskConcierge,
  product: anchor,
  picker,
}: ProductPageProps) {
  /**
   * Pieces opened from the "Similar pieces" rail, newest last. The page swaps to
   * the piece you tapped and **Back walks the trail** rather than closing: you
   * arrived at the fifth belt through four others, and losing all of them to one
   * tap is the thing that makes people stop tapping.
   */
  // The anchor is stored with the trail rather than watched by an effect: a new
  // piece from the host (a different card on the feed) simply makes the stored
  // trail stale, and a stale trail reads as empty.
  const [stack, setStack] = useState<{ anchor: Product; items: Product[] }>({ anchor, items: [] });
  const trail = stack.anchor === anchor ? stack.items : [];
  const product = trail.length ? trail[trail.length - 1] : anchor;
  const pushPiece = (p: Product) => setStack({ anchor, items: [...trail, p] });
  const goBack = () =>
    trail.length ? setStack({ anchor, items: trail.slice(0, -1) }) : onClose();

  const isPlaceholder = product.image === '/vip-logo.svg';
  /** Every view of the piece. One entry means the hero is a static image. */
  const views = useMemo(() => viewsOf(product), [product]);
  const categoryName = categoryConfigs[product.category]?.name || product.category;

  const subLabel = useMemo(() => {
    if (!product.subcategory) return null;
    const config = categoryConfigs[product.category];
    if (!config) return null;
    return getSubcategories(config, gender).find((s) => s.id === product.subcategory)?.label || null;
  }, [product, gender]);

  const genderLabel =
    product.gender === 'female' ? 'Women' : product.gender === 'male' ? 'Men' : 'Unisex';

  const tryOn = isClothing(product);

  /** The reference table behind the Details row. */
  const specs = useMemo(() => getSpecs(product), [product]);

  /** Details expand in place rather than opening a sheet: it is reference you
      read against the piece, not a decision you leave the page to make. */
  const [detailsOpen, setDetailsOpen] = useState(false);
  /** Which story inside them is unfolded, by name. One at a time. */
  const [openStory, setOpenStory] = useState<string | null>(null);
  const people = useMemo(() => peopleFor(product.brand), [product.brand]);
  const house = useMemo(() => houseFor(product.brand), [product.brand]);

  /** The coordinated looks this piece appears in. */
  const looks = useMemo(() => picker.looksWith(product), [picker, product]);

  /** Individual pieces of the same kind. */
  const similar = useMemo(() => picker.similarTo(product), [picker, product]);
  /** Only one card's "..." is open at a time, as on Discover. */
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /**
   * Real spec bullets only. There used to be a derived fallback here - category,
   * subcategory, "Designed for men", "Concierge-sourced and authenticated" - but
   * every line of it was already on the screen (in the meta line, or the title,
   * or on all 228 products alike), so it was length without information. When a
   * piece grows genuine specs (materials, dimensions, movement) they show here.
   */
  const bullets = product.details ?? [];

  /** What the piece is, in one line: the three facts the old table carried
      minus the brand, which the title already says. */
  const metaLine = [categoryName, subLabel, genderLabel].filter(Boolean).join('  ·  ');

  // Price history is what the displayed price is derived from, so the number on
  // the page is the same "today" the history ends on. The `HistoricalPrice`
  // chart itself stays off the product page deliberately: it is taller than the
  // frame and this page is long enough. Component and data are intact.
  const history = useMemo(() => getPriceHistory(product), [product]);
  const priceLabel = useMemo(
    () => '$' + history.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [history],
  );

  /** Same hand-off as the collection page's, one piece instead of a list. */
  const handleShare = async () => {
    const message = shareMessage(
      await shareContent({
        title: `${product.brand} ${product.name}`,
        text: `${product.brand} ${product.name} (${priceLabel})`,
        url: typeof window === 'undefined' ? '' : window.location.origin,
      }),
    );
    if (message) onNotice?.(message);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0A0A',
      }}
    >
      {/* Nav: the only pinned element on the page. Everything else, hero image
          included, scrolls normally underneath it. A masked blur + colour
          gradient fades whatever passes below, so the icons stay legible over
          both the light hero and the dark body. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          padding: `${safeTop(10)} ${PAGE}px 20px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          // Scrolling passes through; the buttons re-enable pointer events.
          pointerEvents: 'none',
        }}
      >
        {/* Fade layer. The mask makes the blur itself taper off, so there is no
            hard edge where the effect stops. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.86) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0) 100%)',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <NavIconButton label="Back" onClick={goBack}>
          <span className="material-symbols-rounded" style={{ fontSize: 22, fontVariationSettings: "'wght' 300", color: '#f2f2f2' }} aria-hidden>
            arrow_left_alt
          </span>
        </NavIconButton>

        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: `calc(env(safe-area-inset-top, 0px) + 20px)`,
            transform: 'translateX(-50%)',
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
          }}
        >
          Details
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <NavIconButton label="Share" onClick={handleShare}>
            <span className="material-symbols-rounded" style={{ fontSize: 22, fontVariationSettings: "'wght' 300", color: '#f2f2f2' }} aria-hidden>
              share
            </span>
          </NavIconButton>
          <NavIconButton label={saved ? 'Manage in your collections' : 'Save to a collection'} onClick={onToggleSave}>
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 20,
                fontVariationSettings: saved ? "'wght' 500, 'FILL' 1" : "'wght' 300",
                color: saved ? '#ef4d63' : '#f2f2f2',
              }}
              aria-hidden
            >
              favorite
            </span>
          </NavIconButton>
        </div>
      </div>

      {/* Scroll body. Inset by the nav's height so the hero starts just below the
          nav instead of running up behind it; the dark page background fills that
          band. Everything still scrolls up under the nav from there. */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingTop: safeTop(NAV_H),
          // The pinned prompt field below carries the safe-area inset.
          paddingBottom: 28,
        }}
      >
        {/* Hero gallery. Not pinned: it scrolls straight up under the nav, so no
            slice of the light backdrop is left stranded behind the fade.
            Keyed by product so swiping to view 3 and opening another piece
            never lands mid-track. */}
        <ProductGallery
          key={product.image}
          images={views}
          alt={product.name}
          placeholder={isPlaceholder}
        />

        {/* Title + general price */}
        <div style={{ padding: `24px ${PAGE}px 0`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', lineHeight: '30px', margin: 0 }}>
            {product.brand} {product.name}
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, color: '#ededed', lineHeight: '26px', margin: 0 }}>
            {priceLabel}
          </p>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#999', lineHeight: '21px', margin: 0 }}>
            {metaLine}
          </p>
        </div>

        {/* Actions: Virtual try-on (clothing only), then official retail. Exactly
            one filled primary - a car has nothing to try on, so that button is
            absent rather than dead and retail takes the filled slot. The concierge
            is not here; it is the prompt field pinned at the bottom. */}
        <div style={{ padding: `16px ${PAGE}px 0`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tryOn && (
            <button
              onClick={() => onNotice?.('Your virtual fitting room is being prepared')}
              style={primaryActionStyle}
            >
              <MIcon name="apparel" size={20} color="#121212" />
              Virtual try-on
            </button>
          )}
          <button
            onClick={() => onNotice?.(`Opening the ${product.brand} official site`)}
            style={tryOn ? outlinedActionStyle : primaryActionStyle}
          >
            Explore on Official Site
          </button>
        </div>

        {/* Description */}
        <div style={{ padding: `24px ${PAGE}px 0`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 400, color: '#c8c8c8', lineHeight: '22px', margin: 0 }}>
            {product.description}
          </p>
          {bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 22, listStyleType: 'disc', listStylePosition: 'outside' }}>
              {bullets.map((b, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    color: '#c8c8c8',
                    lineHeight: '22px',
                    marginBottom: i < bullets.length - 1 ? 8 : 0,
                  }}
                >
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Details, as a dropdown rather than a sheet: this is reference you
            read against the piece in front of you, so leaving the page for it
            was a step too many. The row keeps its place and the panel unfolds
            underneath. */}
        <div style={{ padding: `24px ${PAGE}px 0` }}>
          <button
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
            style={{
              width: '100%',
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: 0,
              background: 'transparent',
              border: 'none',
              borderTop: '1px solid #282828',
              borderBottom: detailsOpen ? 'none' : '1px solid #282828',
              color: '#f6f6f6',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Details
            <Chevron open={detailsOpen} />
          </button>

          {detailsOpen && (
            <div style={{ paddingBottom: 20, borderBottom: '1px solid #282828' }}>
              {/* Authored spec bullets lead when a piece has them. */}
              {product.details?.length ? (
                <ul style={{ margin: '0 0 4px', paddingLeft: 22, listStyleType: 'disc' }}>
                  {product.details.map((d) => (
                    <li key={d} style={{ fontSize: 16, lineHeight: '22px', color: '#c8c8c8', marginBottom: 8 }}>
                      {d}
                    </li>
                  ))}
                </ul>
              ) : null}

              <BlockTitle>Specification</BlockTitle>
              {/* Rows follow the category: a watch has a movement, a bottle has
                  a vintage, a car has an engine. See `src/data/specs.ts`. */}
              <div
                style={{
                  padding: `2px ${PAGE}px`,
                  background: '#101111',
                  border: '1px solid #282828',
                  borderRadius: theme.radii.card,
                }}
              >
                {specs.map((row, i) => (
                  <div key={row.label}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: 16,
                        padding: '12px 0',
                      }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 500, color: '#999', lineHeight: '22px', flexShrink: 0 }}>
                        {row.label}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 400, color: '#f2f2f2', lineHeight: '22px', textAlign: 'right' }}>
                        {row.value}
                      </span>
                    </div>
                    {i < specs.length - 1 && <div style={{ height: 1, background: '#1c1c1c' }} />}
                  </div>
                ))}
              </div>

              {/* The company, then the people. Both unfold in place. Only what is
                  on public record, and never a generated portrait: these are real
                  houses and several of the names are living people. */}
              <BlockTitle>The house</BlockTitle>
              <StoryCard
                title={house.name}
                subtitle={house.origin}
                story={house.story}
                open={openStory === house.name}
                onToggle={() => setOpenStory((k) => (k === house.name ? null : house.name))}
              />

              <BlockTitle>People</BlockTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {people.map((person) => (
                  <StoryCard
                    key={person.name}
                    title={person.name}
                    subtitle={person.role}
                    story={person.story}
                    image={person.image}
                    open={openStory === person.name}
                    onToggle={() => setOpenStory((k) => (k === person.name ? null : person.name))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar pieces: individual products of the same kind, nearest in
            price. Above the looks, because "another like this" is a smaller
            question than "what it goes with". */}
        {similar.length > 0 && (
          <>
            <div style={{ height: 6, background: '#141414', marginTop: 24 }} />

            <div style={{ padding: '20px 0 0' }}>
              <h2
                style={{
                  padding: `0 ${PAGE}px`,
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '24px',
                  color: '#fff',
                }}
              >
                Similar pieces
              </h2>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: 16 }}>
                <div style={{ display: 'flex', gap: 12, padding: `0 ${PAGE}px`, width: 'max-content' }}>
                  {similar.map((p) => (
                    <ProductCard
                      key={p.name}
                      product={p}
                      width={RAIL_CARD_W}
                      saved={picker.isSaved(p)}
                      onToggleSave={() => picker.onToggleSaved(p)}
                      onOpen={() => pushPiece(p)}
                      menuOpen={openMenu === p.name}
                      onToggleMenu={() => setOpenMenu((prev) => (prev === p.name ? null : p.name))}
                      onCloseMenu={() => setOpenMenu(null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Looks built around the piece, not the user's own collections - those
            are the section below. Each is a different lens on it (the occasion,
            the room, the maker, the price), chosen by what kind of thing it is;
            see `src/data/edits.ts`. Same card and same page as Discover's. */}
        {looks.length > 0 && (
          <>
            <div style={{ height: 6, background: '#141414', marginTop: 24 }} />

            <div style={{ padding: `20px 0 0` }}>
              <h2
                style={{
                  padding: `0 ${PAGE}px`,
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '24px',
                  color: '#fff',
                }}
              >
                Collections with this piece
              </h2>

              {/* Inset on the track, not the scroller - the shape every rail
                  in the app uses. */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingTop: 16 }}>
                <div style={{ display: 'flex', gap: 12, padding: `0 ${PAGE}px`, width: 'max-content' }}>
                  {looks.map((look) => (
                    <CollectionCard
                      key={look.id}
                      name={look.name}
                      images={look.images}
                      meta={look.meta}
                      width={RAIL_CARD_W}
                      onOpen={() => picker.onOpenLook(look.id)}
                      // The heart keeps the whole look, exactly as it does on
                      // Discover's look cards. The section below is about this
                      // one piece; this is about the set it sits in.
                      saved={look.saved}
                      onToggleSave={() => picker.onToggleLookSaved(look.id)}
                      savedLabel={
                        look.saved
                          ? `Remove ${look.name} from your collections`
                          : `Save ${look.name} to your collections`
                      }
                      // Same "..." as Discover's cards: more like this, or stop
                      // showing this kind. A generated rail is only as good as
                      // the ability to tell it when it is wrong.
                      menu={picker.renderLookMenu(look.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Section divider */}
        <div style={{ height: 6, background: '#141414', marginTop: 24 }} />

        {/* Save to collection: the page's last section. The heart in the nav
            opens the same decision as a sheet; this is it laid out in place,
            with the collection the piece is in already marked. */}
        <SaveToCollection
          collections={picker.collections}
          byName={picker.byName}
          currentId={collectionOf(picker.collections, product.name)?.id}
          onPick={(id) => picker.onPick(product, id)}
          onCreate={() => picker.onCreate(product)}
          // The heart's own sheet: the full list, with a search.
          onViewAll={onToggleSave}
        />

      </div>

      {/* The concierge, as a prompt field rather than a button - the same call the
          collection page makes. What you want to ask about a piece is specific
          ("does this come in black?"), so it goes in one step instead of landing
          in an empty chat. Sending starts a NEW chat with the piece attached. */}
      {onAskConcierge && (
        <BottomDock
          // Leads with the thing the concierge does that browsing cannot: hand
          // back a whole set of pieces that go with this one. An empty send
          // asks for exactly that, since it is the likeliest reason to open the
          // field without knowing what to type.
          placeholderPrefix="Ask me"
          placeholder={['for pieces like this', 'where to buy it', 'about this piece']}
          ariaLabel="Ask AI Concierge"
          showAttach={false}
          onSend={(text) =>
            onAskConcierge({
              text: text.trim() || 'Find me pieces like this one',
              attachment: {
                title: `${product.brand} ${product.name}`,
                subtitle: priceLabel,
                images: [product.image],
                target: { kind: 'product', name: product.name },
              },
            })
          }
        />
      )}

    </div>
  );
}

/** A titled block inside the Details sheet. */
function BlockTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      style={{
        margin: '24px 0 12px',
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '22px',
        color: '#f6f6f6',
      }}
    >
      {children}
    </h3>
  );
}

/** "Thierry Hermes" -> "TH". Drops the articles a house fallback carries. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => !['the', 'of', 'and'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** The disclosure arrow, pointing down and turning over when open. */
function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'flex',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      <MIcon name="keyboard_arrow_down" size={22} color="#999" />
    </span>
  );
}

/**
 * A house or a person: the mark, the name, a line under it, and the story
 * unfolding inside the card. `image` is a licensed photograph when there is
 * one; there is never a generated likeness, so the mark falls back to initials.
 */
function StoryCard({
  title,
  subtitle,
  story,
  image,
  open,
  onToggle,
}: {
  title: string;
  subtitle: string;
  story: string;
  image?: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        background: '#101111',
        border: '1px solid #282828',
        borderRadius: theme.radii.card,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: `14px ${PAGE}px`,
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: theme.radii.button,
            background: '#1f2022',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            color: '#c8c8c8',
          }}
        >
          {image ? (
            <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            initialsOf(title)
          )}
        </span>
        <span style={{ flex: 1, minWidth: 0, display: 'block' }}>
          <span style={{ display: 'block', fontSize: 16, fontWeight: 600, lineHeight: '22px', color: '#f7f7f7' }}>
            {title}
          </span>
          <span style={{ display: 'block', fontSize: 14, lineHeight: '20px', color: '#999' }}>{subtitle}</span>
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <p style={{ margin: 0, padding: `0 ${PAGE}px 16px`, fontSize: 16, lineHeight: '24px', color: '#c8c8c8' }}>
          {story}
        </p>
      )}
    </div>
  );
}
