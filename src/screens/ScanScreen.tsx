import { useEffect, useMemo, useRef, useState } from 'react';
import MIcon from '../components/MIcon';
import ProductPage from './ProductPage';
import { Header, iconButtonStyle, screenStyle } from './screenChrome';
import type { ConciergePrompt } from './ChatScreen';
import type { Product } from '../data/products';
import { categoryConfigs } from '../data/categoryConfig';
import { formatPrice, priceOf } from '../data/collections';
import { theme, safeBottom, safeTop } from '../theme';

// ─── Scan (dock tab, full-screen overlay) ────────────────────────────────────
//
// Point the camera at any piece and match it against the catalog. Three phases
// (Figma node 5488-3358 "Scan a product"):
//   capture     viewfinder chrome: close, flash, camera flip, upload, shutter
//   processing  the taken photo under a sweep line, "Identifying the piece..."
//   results     photo recap + matching pieces + None of these? Ask AI Concierge
//
// The camera is simulated (prototype): the shutter "captures" a piece from the
// catalog, upload accepts a real image file. Matching is category-based.

const PAGE = 16;
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#999';
const BORDER = '#444547';
const SURFACE = '#101111';
const PAGE_BG = '#0A0A0A';
/** The framing brackets, and the shutter's ring. */
const BRACKET = '#d3d3d5';
/** Gallery backdrop behind a contained product shot. */
const PHOTO_BG = '#ececec';

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
  onClose,
}: {
  /** Catalog pool for capture + matching (gender-filtered, real imagery only). */
  products: Product[];
  gender: string | null;
  /** In any collection. The heart on a match (and in the product page) opens
      the Add to collection flow - hearts manage membership app-wide. */
  isSaved: (name: string) => boolean;
  onSave: (product: Product) => void;
  /** "None of these?": starts a NEW concierge chat with the scan attached. */
  onAskConcierge: (prompt: ConciergePrompt) => void;
  /** Toast for the product page's actions that have no destination yet. */
  onNotice?: (message: string) => void;
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
        background: PAGE_BG,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'clip',
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
          onAskConcierge={() => onAskConcierge(conciergePrompt)}
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

/**
 * The camera surface: Figma's "Viewfinder glow" radial over the frame, plus the
 * "Vignette" so chrome stays legible top and bottom.
 *
 * The design only draws these on the Processing frame - its Capture frame is an
 * empty placeholder for a live feed - but both phases are the same viewfinder,
 * and swapping the backdrop on the shutter press would read as a flicker. So
 * capture wears it too.
 */
function Viewfinder({ flash, facing }: { flash: boolean; facing: 'back' | 'front' }) {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          transform: facing === 'front' ? 'scaleX(-1)' : 'none',
          transition: `transform 320ms ${theme.animation.easing}`,
          background:
            'radial-gradient(41.7% 55.6% at 50% 50%, #232323 0%, #101010 55%, #060606 100%)',
          filter: flash ? 'brightness(1.45)' : 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </>
  );
}

/** Figma `buttonIcon` on camera chrome: the app's bordered 40px circle. */
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
    <button onClick={onClick} aria-label={label} style={iconButtonStyle}>
      {children}
    </button>
  );
}

/** Figma `Button` on camera chrome: the same circle stretched around a label. */
const cameraTextButtonStyle: React.CSSProperties = {
  height: 40,
  padding: '0 16px',
  borderRadius: theme.radii.button,
  background: SURFACE,
  border: `1px solid ${BORDER}`,
  color: TEXT_PRIMARY,
  fontSize: 16,
  fontWeight: 500,
  lineHeight: '22px',
  cursor: 'pointer',
  flexShrink: 0,
  WebkitTapHighlightColor: 'transparent',
};

/**
 * Figma "Focus frame": four 34px brackets, 2.5px, 18px corner radius, around a
 * 280 x 368 framing area. The same frame holds the photo while it processes.
 */
function FocusFrame({ children }: { children?: React.ReactNode }) {
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
        borderColor: BRACKET,
        borderStyle: 'solid',
      }}
    />
  );
  const w = 2.5;
  const r = 18;
  return (
    <div style={{ position: 'relative', width: 'min(76%, 280px)', aspectRatio: '280 / 368' }}>
      {corner({ top: 0, left: 0, borderTopLeftRadius: r }, { borderTopWidth: w, borderLeftWidth: w })}
      {corner({ top: 0, right: 0, borderTopRightRadius: r }, { borderTopWidth: w, borderRightWidth: w })}
      {corner({ bottom: 0, left: 0, borderBottomLeftRadius: r }, { borderBottomWidth: w, borderLeftWidth: w })}
      {corner({ bottom: 0, right: 0, borderBottomRightRadius: r }, { borderBottomWidth: w, borderRightWidth: w })}
      {children}
    </div>
  );
}

/**
 * A scanned photo on its gallery backdrop. Catalog shots are cut-outs, so they
 * sit contained on the backdrop; an uploaded photo is a real photo and fills.
 */
function ScanPhoto({
  image,
  contain,
  radius,
  children,
}: {
  image: string;
  contain: boolean;
  radius: number;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: radius,
        overflow: 'hidden',
        background: contain ? PHOTO_BG : '#111',
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
            ? { maxWidth: '88%', maxHeight: '92%', objectFit: 'contain', display: 'block' }
            : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
        }
      />
      {children}
    </div>
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
      <Viewfinder flash={flash} facing={facing} />

      {/* navBar: close · flash + flip */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${safeTop(8)} ${PAGE}px 0`,
        }}
      >
        <CameraButton label="Close scan" onClick={onClose}>
          <MIcon name="close" size={24} color={TEXT_PRIMARY} />
        </CameraButton>
        <div style={{ display: 'flex', gap: 8 }}>
          <CameraButton label={flash ? 'Flash on' : 'Flash off'} onClick={onFlash}>
            <MIcon
              name={flash ? 'flashlight_on' : 'flashlight_off'}
              size={24}
              fill={flash ? 1 : 0}
              color={flash ? '#ffe9a8' : TEXT_PRIMARY}
            />
          </CameraButton>
          <CameraButton label={facing === 'back' ? 'Switch to front camera' : 'Switch to back camera'} onClick={onFlip}>
            <MIcon name="flip_camera_ios" size={24} color={TEXT_PRIMARY} />
          </CameraButton>
        </div>
      </div>

      {/* Framing area */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FocusFrame />
      </div>

      {/* Capture controls: hint · upload + shutter */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: `24px 0 ${safeBottom(24)}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: '22px',
            color: TEXT_PRIMARY,
            textAlign: 'center',
            padding: `0 ${PAGE}px`,
          }}
        >
          Frame the piece, its label, or a detail
        </p>
        {/* Upload and an equal-width spacer flank the shutter, so the shutter
            stays centred on the screen rather than in the leftover space. */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: 55,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
            }}
          >
            <CameraButton label="Upload a photo" onClick={onUpload}>
              <MIcon name="add_photo_alternate" size={24} color={TEXT_PRIMARY} />
            </CameraButton>
            <span style={{ fontSize: 12, fontWeight: 500, lineHeight: '16px', color: TEXT_PRIMARY }}>
              Upload
            </span>
          </div>
          {/* Shutter: white core in a hairline ring. */}
          <button
            onClick={onShutter}
            aria-label="Take a photo"
            style={{
              width: 74,
              height: 74,
              borderRadius: theme.radii.button,
              background: 'transparent',
              border: `2.5px solid ${BRACKET}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              aria-hidden
              style={{ width: 60, height: 60, borderRadius: theme.radii.button, background: TEXT_PRIMARY, display: 'block' }}
            />
          </button>
          <span aria-hidden style={{ width: 55, height: 60, flexShrink: 0 }} />
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
      <Viewfinder flash={false} facing="back" />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: `${safeTop(8)} ${PAGE}px 0`,
        }}
      >
        <button onClick={onCancel} style={cameraTextButtonStyle}>
          Cancel
        </button>
      </div>

      {/* The photo lands inside the focus frame it was framed in, 8px in. */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: `0 ${PAGE}px ${safeBottom(24)}`,
        }}
      >
        <FocusFrame>
          <div style={{ position: 'absolute', inset: 8 }}>
            <ScanPhoto image={image} contain={contain} radius={12}>
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
            </ScanPhoto>
          </div>
        </FocusFrame>
        <p role="status" style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_PRIMARY }}>
          Identifying the piece...
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
  onClose,
}: {
  image: string;
  contain: boolean;
  matches: Product[];
  isSaved: (name: string) => boolean;
  onRetake: () => void;
  onOpen: (p: Product) => void;
  onSave: (p: Product) => void;
  onAskConcierge: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ ...screenStyle, background: PAGE_BG }}>
      <Header
        title="Matches"
        height={56}
        left={
          <CameraButton label="Close scan" onClick={onClose}>
            <MIcon name="close" size={24} color={TEXT_PRIMARY} />
          </CameraButton>
        }
        right={
          <button onClick={onRetake} style={cameraTextButtonStyle}>
            Retake
          </button>
        }
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          paddingTop: safeTop(56 + PAGE),
          paddingLeft: PAGE,
          paddingRight: PAGE,
          paddingBottom: safeBottom(24),
        }}
      >
        {/* Scan recap */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 120, height: 160, border: '1px solid #282828', borderRadius: 12 }}>
            <ScanPhoto image={image} contain={contain} radius={11} />
          </div>
          <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_SECONDARY, textAlign: 'center' }}>
            Choose the piece that matches yours
          </p>
        </div>

        {/* Matching options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matches.map((p) => (
            <div
              key={p.name}
              onClick={() => onOpen(p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: theme.radii.card,
                padding: 8,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  borderRadius: 8,
                  background: PHOTO_BG,
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
              {/* The name wraps rather than truncating: which of four near-identical
                  pieces this is often lives in the words a clamp would eat. */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: '22px' }}>
                  {p.brand} {p.name}
                </p>
                <span style={{ fontSize: 13, lineHeight: '18px', color: TEXT_SECONDARY }}>
                  {categoryConfigs[p.category]?.name || p.category} · {formatPrice(priceOf(p))}
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
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  alignSelf: 'center',
                  borderRadius: theme.radii.button,
                  background: '#2f2f31',
                  border: 'none',
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
                  size={24}
                  fill={isSaved(p.name) ? 1 : 0}
                  color={isSaved(p.name) ? '#ef4d63' : TEXT_PRIMARY}
                />
              </button>
            </div>
          ))}
        </div>

        {/* No match. Searching only finds what the catalog is already tagged
            with, so the way out of a bad match is the concierge, carrying the
            photo: the question is the label and stays text, only the answer is
            the control. */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, lineHeight: '22px', color: TEXT_SECONDARY }}>None of these?</span>
          <button
            onClick={onAskConcierge}
            style={{
              height: 48,
              padding: '0 16px',
              background: '#222124',
              border: 'none',
              borderRadius: theme.radii.button,
              fontSize: 16,
              fontWeight: 500,
              lineHeight: '22px',
              color: TEXT_PRIMARY,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Ask AI Concierge
          </button>
        </div>
      </div>
    </div>
  );
}
