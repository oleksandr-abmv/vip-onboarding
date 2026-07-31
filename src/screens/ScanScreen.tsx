import { useEffect, useMemo, useRef, useState } from 'react';
import MIcon from '../components/MIcon';
import BottomDock from '../components/BottomDock';
import ProductPage from './ProductPage';
import type { ConciergePrompt } from './ChatScreen';
import type { Product } from '../data/products';
import { formatPrice, priceOf } from '../data/collections';
import { theme } from '../theme';

// ─── Scan (dock tab, full-screen overlay) ────────────────────────────────────
//
// Point the camera at any piece and match it against the catalog. Three phases:
//   capture     viewfinder chrome: close, flash, camera flip, upload, shutter
//   processing  the taken photo under a sweep line, "Identifying piece..."
//   results     photo recap + matching pieces + Ask AI Concierge / search manually
//
// The camera is simulated (prototype): the shutter "captures" a piece from the
// catalog, upload accepts a real image file. Matching is category-based.

const PAGE = 16;
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';

type Phase = 'capture' | 'processing' | 'results';
type Captured = {
  /** What the viewfinder took: a catalog piece, or an uploaded image. */
  image: string;
  product: Product | null;
  /** Object URL that must be revoked (upload only). */
  objectUrl?: string;
};

export default function ScanScreen({
  products,
  gender,
  isSaved,
  onSave,
  onAskConcierge,
  onNotice,
  onBrowseCategory,
  onClose,
}: {
  /** Catalog pool for capture + matching (gender-filtered, real imagery only). */
  products: Product[];
  gender: string | null;
  /** In any collection. The heart on a match (and in the product page) opens
      the Add to collection flow - hearts manage membership app-wide. */
  isSaved: (name: string) => boolean;
  onSave: (product: Product) => void;
  /** Pinned CTA: starts a NEW concierge chat with the scan attached. */
  onAskConcierge: (prompt: ConciergePrompt) => void;
  /** Toast for the product page's actions that have no destination yet. */
  onNotice?: (message: string) => void;
  /** "Search manually" - browse the matched category (or the whole catalog). */
  onBrowseCategory: (category: string | null) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('capture');
  const [captured, setCaptured] = useState<Captured | null>(null);
  const [flash, setFlash] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // The processing sweep resolves on a timer.
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const releaseCapture = (c: Captured | null) => {
    if (c?.objectUrl) URL.revokeObjectURL(c.objectUrl);
  };
  useEffect(() => () => releaseCapture(captured), [captured]);

  const startProcessing = (next: Captured) => {
    setCaptured((prev) => {
      if (prev && prev !== next) releaseCapture(prev);
      return next;
    });
    setPhase('processing');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPhase('results'), 2400);
  };

  const takePhoto = () => {
    if (products.length === 0) return;
    const product = products[Math.floor(Math.random() * products.length)];
    startProcessing({ image: product.image, product });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    startProcessing({ image: url, product: null, objectUrl: url });
  };

  const cancelProcessing = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('capture');
  };

  // Matches: the captured piece first, then its category neighbours; for an
  // uploaded photo (unknown piece) a spread across the catalog.
  const matches = useMemo<Product[]>(() => {
    if (phase !== 'results' && phase !== 'processing') return [];
    if (captured?.product) {
      const p = captured.product;
      const neighbours = products.filter((x) => x.category === p.category && x.name !== p.name);
      return [p, ...neighbours].slice(0, 4);
    }
    // Unknown piece: one per category, stable order.
    const seen = new Set<string>();
    const spread: Product[] = [];
    for (const p of products) {
      if (seen.has(p.category)) continue;
      seen.add(p.category);
      spread.push(p);
      if (spread.length === 4) break;
    }
    return spread;
  }, [phase, captured, products]);

  const conciergePrompt: ConciergePrompt = {
    text: captured?.product
      ? `I scanned a piece that looks like the ${captured.product.brand} ${captured.product.name}. Can you confirm the match and tell me where to buy it?`
      : 'I scanned a piece I would like identified. Can you help me find it and where to buy it?',
    attachment: captured
      ? {
          title: 'Scanned piece',
          subtitle: captured.product ? `${captured.product.brand} ${captured.product.name}` : 'Photo',
          images: [captured.image],
          // A scan we could not place has nowhere to send you.
          target: captured.product ? { kind: 'product', name: captured.product.name } : undefined,
        }
      : undefined,
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 220,
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 200ms ease both',
      }}
    >
      {phase === 'capture' && (
        <Capture
          flash={flash}
          facing={facing}
          onFlash={() => setFlash((f) => !f)}
          onFlip={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          onUpload={() => fileRef.current?.click()}
          onShutter={takePhoto}
          onClose={onClose}
        />
      )}

      {phase === 'processing' && captured && (
        <Processing image={captured.image} contain={!!captured.product} onCancel={cancelProcessing} />
      )}

      {phase === 'results' && captured && (
        <Results
          image={captured.image}
          contain={!!captured.product}
          matches={matches}
          isSaved={isSaved}
          onRetake={cancelProcessing}
          onOpen={setOpenProduct}
          onSave={onSave}
          onAskConcierge={(text) => onAskConcierge({ ...conciergePrompt, text: text.trim() || conciergePrompt.text })}
          onSearchManually={() => onBrowseCategory(captured.product?.category ?? null)}
          onClose={onClose}
        />
      )}

      {/* Hidden picker behind the Upload control. */}
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

      {/* A tapped match opens the full product page inside the scan overlay. */}
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

// ── Shared chrome ────────────────────────────────────────────────────────────

/** Translucent circular control on camera chrome (the product-page nav style). */
function CameraButton({
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
      onClick={onClick}
      aria-label={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: theme.radii.button,
        background: 'rgba(20,20,20,0.6)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

/** Four corner brackets around the framing area. */
function CornerBrackets({ color = 'rgba(255,255,255,0.65)' }: { color?: string }) {
  const corner = (pos: React.CSSProperties, borders: React.CSSProperties) => (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        width: 34,
        height: 34,
        // The shorthand must come first: the per-side widths in `borders` win.
        borderWidth: 0,
        ...pos,
        ...borders,
        borderColor: color,
        borderStyle: 'solid',
      }}
    />
  );
  const w = 2.5;
  const r = 18;
  return (
    <>
      {corner({ top: 0, left: 0, borderTopLeftRadius: r }, { borderTopWidth: w, borderLeftWidth: w })}
      {corner({ top: 0, right: 0, borderTopRightRadius: r }, { borderTopWidth: w, borderRightWidth: w })}
      {corner({ bottom: 0, left: 0, borderBottomLeftRadius: r }, { borderBottomWidth: w, borderLeftWidth: w })}
      {corner({ bottom: 0, right: 0, borderBottomRightRadius: r }, { borderBottomWidth: w, borderRightWidth: w })}
    </>
  );
}

// ── Capture ──────────────────────────────────────────────────────────────────

function Capture({
  flash,
  facing,
  onFlash,
  onFlip,
  onUpload,
  onShutter,
  onClose,
}: {
  flash: boolean;
  facing: 'back' | 'front';
  onFlash: () => void;
  onFlip: () => void;
  onUpload: () => void;
  onShutter: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Simulated feed: a soft-lit dark room, slightly brighter with flash on,
          mirrored for the front camera - stands in for the live preview. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          transform: facing === 'front' ? 'scaleX(-1)' : 'none',
          transition: 'transform 320ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          background:
            'radial-gradient(120% 90% at 30% 20%, #232323 0%, #101010 55%, #060606 100%)',
          filter: flash ? 'brightness(1.45)' : 'none',
        }}
      />
      {/* Vignette so the chrome reads over the "feed". */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* Top chrome: close · flash + flip */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `calc(env(safe-area-inset-top, 0px) + 12px) ${PAGE}px 0`,
        }}
      >
        <CameraButton label="Close scan" onClick={onClose}>
          <MIcon name="close" size={22} color={TEXT_PRIMARY} />
        </CameraButton>
        <div style={{ display: 'flex', gap: 8 }}>
          <CameraButton label={flash ? 'Flash on' : 'Flash off'} onClick={onFlash}>
            <MIcon
              name={flash ? 'flash_on' : 'flash_off'}
              size={22}
              weight={400}
              fill={flash ? 1 : 0}
              color={flash ? '#ffe9a8' : TEXT_PRIMARY}
            />
          </CameraButton>
          <CameraButton label={facing === 'back' ? 'Switch to front camera' : 'Switch to back camera'} onClick={onFlip}>
            <MIcon name="flip_camera_ios" size={22} weight={400} color={TEXT_PRIMARY} />
          </CameraButton>
        </div>
      </div>

      {/* Framing area */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 'min(72%, 290px)', aspectRatio: '3 / 4' }}>
          <CornerBrackets />
        </div>
      </div>

      {/* Bottom chrome: description · upload + shutter */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          padding: `0 ${PAGE}px calc(28px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: '20px',
            color: '#d6d6d6',
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          Frame the piece, its label, or a detail. Your concierge matches it to the catalog.
        </p>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={onUpload}
            aria-label="Upload a photo"
            style={{
              position: 'absolute',
              left: 12,
              width: 48,
              height: 48,
              borderRadius: theme.radii.button,
              background: 'rgba(20,20,20,0.6)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <MIcon name="imagesmode" size={24} color={TEXT_PRIMARY} />
          </button>
          {/* Shutter: white core in a hairline ring. */}
          <button
            onClick={onShutter}
            aria-label="Take a photo"
            style={{
              width: 74,
              height: 74,
              borderRadius: theme.radii.button,
              background: 'transparent',
              border: '3px solid rgba(255,255,255,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              aria-hidden
              style={{ width: 60, height: 60, borderRadius: theme.radii.button, background: '#f6f6f6', display: 'block' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Processing ───────────────────────────────────────────────────────────────

function Processing({
  image,
  contain,
  onCancel,
}: {
  image: string;
  /** Catalog shots sit on the gallery backdrop; uploads fill the frame. */
  contain: boolean;
  onCancel: () => void;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: `calc(env(safe-area-inset-top, 0px) + 12px) ${PAGE}px 0`,
        }}
      >
        <button
          onClick={onCancel}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: theme.radii.button,
            background: 'rgba(20,20,20,0.6)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            color: TEXT_PRIMARY,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Cancel
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: PAGE }}>
        <div
          style={{
            position: 'relative',
            width: 'min(74%, 300px)',
            aspectRatio: '3 / 4',
            padding: 10,
            boxSizing: 'border-box',
          }}
        >
          <CornerBrackets />
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 12,
              overflow: 'hidden',
              background: contain ? '#ececec' : '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <img
              src={image}
              alt="Your photo"
              style={
                contain
                  ? { maxWidth: '78%', maxHeight: '84%', objectFit: 'contain', display: 'block' }
                  : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
              }
            />
            {/* Sweep line */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 8,
                right: 8,
                top: 0,
                height: 2,
                borderRadius: 2,
                background:
                  'linear-gradient(to right, rgba(246,246,246,0) 0%, rgba(246,246,246,0.9) 50%, rgba(246,246,246,0) 100%)',
                boxShadow: '0 0 14px rgba(246,246,246,0.55)',
                animation: 'scanSweep 1600ms ease-in-out infinite',
              }}
            />
          </div>
        </div>
        <p role="status" style={{ margin: 0, fontSize: 16, fontWeight: 500, lineHeight: '22px', color: TEXT_PRIMARY }}>
          Identifying piece...
        </p>
      </div>
    </div>
  );
}

// ── Results ──────────────────────────────────────────────────────────────────

function Results({
  image,
  contain,
  matches,
  isSaved,
  onRetake,
  onOpen,
  onSave,
  onAskConcierge,
  onSearchManually,
  onClose,
}: {
  image: string;
  contain: boolean;
  matches: Product[];
  isSaved: (name: string) => boolean;
  onRetake: () => void;
  onOpen: (p: Product) => void;
  onSave: (p: Product) => void;
  /** Receives whatever was typed into the prompt field. */
  onAskConcierge: (text: string) => void;
  onSearchManually: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header: close · title · retake */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: `calc(env(safe-area-inset-top, 0px) + 12px) ${PAGE}px 8px`,
        }}
      >
        <CameraButton label="Close scan" onClick={onClose}>
          <MIcon name="close" size={22} color={TEXT_PRIMARY} />
        </CameraButton>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Matches</span>
        <button
          onClick={onRetake}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: theme.radii.button,
            background: 'rgba(20,20,20,0.6)',
            border: '1px solid rgba(255,255,255,0.14)',
            color: TEXT_PRIMARY,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Retake
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        {/* Photo recap */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: `8px ${PAGE}px 12px` }}>
          <div
            style={{
              width: 132,
              aspectRatio: '3 / 4',
              borderRadius: 14,
              overflow: 'hidden',
              background: contain ? '#ececec' : '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #282828',
            }}
          >
            <img
              src={image}
              alt="Your photo"
              style={
                contain
                  ? { maxWidth: '80%', maxHeight: '86%', objectFit: 'contain', display: 'block' }
                  : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
              }
            />
          </div>
        </div>

        <p
          style={{
            margin: '0 0 12px',
            textAlign: 'center',
            fontSize: 14,
            lineHeight: '20px',
            color: TEXT_SECONDARY,
          }}
        >
          Choose the piece that matches yours
        </p>

        {/* Matching options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: `0 ${PAGE}px` }}>
          {matches.map((p) => (
            <div
              key={p.name}
              onClick={() => onOpen(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#0c0c0c',
                border: '1px solid #282828',
                borderRadius: theme.radii.card,
                padding: 10,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
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
                  src={p.image}
                  alt=""
                  aria-hidden
                  draggable={false}
                  style={{ maxWidth: '80%', maxHeight: '84%', objectFit: 'contain', display: 'block' }}
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
                  {p.brand} {p.name}
                </p>
                <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: '18px' }}>
                  {p.category} · {formatPrice(priceOf(p))}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(p);
                }}
                aria-label={
                  isSaved(p.name) ? `Manage ${p.brand} ${p.name} in your collections` : `Save ${p.brand} ${p.name}`
                }
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: theme.radii.button,
                  background: '#101111',
                  border: '1px solid #444547',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <MIcon
                  name="favorite"
                  size={18}
                  weight={isSaved(p.name) ? 500 : 400}
                  fill={isSaved(p.name) ? 1 : 0}
                  color={isSaved(p.name) ? '#ef4d63' : '#e7e7e7'}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Browse the catalog yourself. The question is the label and stays
            text; only the answer is the control, so the button says what pressing
            it does rather than wrapping the whole sentence in a border. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 16,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: '20px', color: '#999' }}>None of these?</span>
          <button
            onClick={onSearchManually}
            style={{
              height: 36,
              padding: '0 16px',
              background: 'transparent',
              border: '1px solid #313131',
              borderRadius: theme.radii.button,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '20px',
              color: '#f6f6f6',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Search manually
          </button>
        </div>
      </div>

      {/* Pinned: hand the scan to the concierge, as a prompt field rather than a
          button - the same call the product and collection pages make. What you
          want to ask about a scan is specific ("is this the 2023 model?"), so it
          goes in one step instead of landing in an empty chat. Sending starts a
          NEW chat with the photo attached; an empty send uses the canned line. */}
      <BottomDock placeholder="Ask about this scan" showAttach={false} onSend={onAskConcierge} />
    </div>
  );
}
