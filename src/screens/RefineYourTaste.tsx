import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { safeTop } from '../theme';
import PRODUCTS, { type Product } from '../data/products';
import { categoryConfigs, getSubcategories } from '../data/categoryConfig';

// ── Swipe mechanics ───────────────────────────────────────────────────────────
const CARD_TRANSITION = 450;
const SWIPE_THRESHOLD = 80;

// ── "LIKE" / "SKIP" drag labels ──────────────────────────────────────────────
function SwipeLabel({ label, side }: { label: 'LIKE' | 'SKIP'; side: 'left' | 'right' }) {
  const onRight = side === 'right';
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        ...(onRight ? { right: 16 } : { left: 16 }),
        border: '1.5px solid rgba(255,255,255,0.3)',
        borderRadius: 6,
        padding: '3px 9px',
        transform: `rotate(${onRight ? '10deg' : '-10deg'})`,
        zIndex: 10,
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          display: 'block',
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Card component (shared front + back) ─────────────────────────────────────
type CardBaseProps = {
  product: Product;
  label: string;
  dim?: boolean; // for back card
};

function CardContent({ product, label, dim = false }: CardBaseProps) {
  const isPlaceholder = product.image === '/vip-logo.svg';
  return (
    <>
      {/* Image area */}
      <div
        style={{
          flex: 1,
          background: '#212020',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px',
          position: 'relative',
          minHeight: 0,
        }}
      >
        {isPlaceholder ? (
          <img
            src="/vip-logo.svg"
            alt=""
            aria-hidden
            style={{ width: 128, height: 128, opacity: dim ? 0.2 : 0.35, display: 'block' }}
          />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            draggable={false}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              opacity: dim ? 0.55 : 1,
            }}
          />
        )}
      </div>

      {/* Text info */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#999',
            textTransform: 'uppercase',
            lineHeight: '18px',
            margin: 0,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </p>
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
          {product.name}
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: '#dedfe1',
            lineHeight: '20px',
            margin: '2px 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.brand}
        </p>
      </div>
    </>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
interface RefineYourTasteProps {
  onNext: () => void;
  selectedInterests: string[];
  subcategoriesByCategory: Record<string, string[]>;
  likedProducts: string[];
  onLikedChange: (products: string[]) => void;
  onOverlayChange?: (visible: boolean) => void;
  gender?: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RefineYourTaste({
  onNext,
  selectedInterests,
  subcategoriesByCategory,
  likedProducts,
  onLikedChange,
  onOverlayChange,
  gender,
}: RefineYourTasteProps) {
  // Stable refs to avoid stale closures inside swipe handlers
  const likedRef = useRef(likedProducts);
  useEffect(() => { likedRef.current = likedProducts; }, [likedProducts]);
  const onLikedChangeRef = useRef(onLikedChange);
  useEffect(() => { onLikedChangeRef.current = onLikedChange; }, [onLikedChange]);

  // ── Filter pipeline: category → gender → subcategory ──────────────────────
  const allProducts = useMemo(() => {
    let filtered = selectedInterests.length > 0
      ? PRODUCTS.filter((p) => selectedInterests.includes(p.category))
      : PRODUCTS;

    if (gender === 'male' || gender === 'female') {
      const genderFiltered = filtered.filter((p) => !p.gender || p.gender === 'unisex' || p.gender === gender);
      if (genderFiltered.length > 0) filtered = genderFiltered;
    }

    const hasAnySubSelections = Object.values(subcategoriesByCategory).some(subs => subs.length > 0);
    if (hasAnySubSelections) {
      const subFiltered = filtered.filter((p) => {
        const subs = subcategoriesByCategory[p.category];
        if (!subs || subs.length === 0) return true;
        return p.subcategory ? subs.includes(p.subcategory) : true;
      });
      if (subFiltered.length > 0) filtered = subFiltered;
    }

    return shuffle(filtered);
  }, [selectedInterests, subcategoriesByCategory, gender]);

  // Map subcategory IDs → human labels (for the card eyebrow text)
  const subLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const catId of selectedInterests) {
      const config = categoryConfigs[catId];
      if (!config) continue;
      for (const sub of getSubcategories(config, gender ?? null)) {
        map[sub.id] = sub.label;
      }
    }
    return map;
  }, [selectedInterests, gender]);

  const activeCategory = selectedInterests.length === 1
    ? (categoryConfigs[selectedInterests[0]]?.name || selectedInterests[0])
    : selectedInterests.length > 1
      ? `${selectedInterests.length} categories`
      : 'All';

  // ── Swipe deck state ──────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [settled, setSettled] = useState(true);
  const [skipTransition, setSkipTransition] = useState(false);
  // One-shot feedback sheets — fire once each on the very first like / skip.
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const firstLikeShownRef = useRef(false);
  const [skipFeedbackOpen, setSkipFeedbackOpen] = useState(false);
  const firstSkipShownRef = useRef(false);
  // Small one-time gesture hint: nudges the first card right-then-left so users
  // understand the deck is swipeable. Cancelled if the user touches the card first.
  const [hintX, setHintX] = useState(0);
  const hintDoneRef = useRef(false);
  const hintTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startXRef = useRef(0);
  const swipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detail view state (kept from original v5.1 design)
  const [viewProduct, setViewProduct] = useState<{ product: Product; label: string } | null>(null);
  const [viewExpanded, setViewExpanded] = useState(false);

  useEffect(() => () => {
    if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
    hintTimeouts.current.forEach(clearTimeout);
  }, []);

  // Run the one-shot gesture hint when the component mounts (and there's a card to nudge)
  useEffect(() => {
    if (hintDoneRef.current) return;
    if (allProducts.length === 0) return;
    const schedule = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      hintTimeouts.current.push(t);
    };
    // Sequence: settle → nudge left (like) → across to right (skip) → back to center
    schedule(800, () => setHintX(-60));
    schedule(1300, () => setHintX(60));
    schedule(1800, () => setHintX(0));
    schedule(2000, () => { hintDoneRef.current = true; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelHint = () => {
    if (hintDoneRef.current) return;
    hintDoneRef.current = true;
    hintTimeouts.current.forEach(clearTimeout);
    hintTimeouts.current = [];
    setHintX(0);
  };

  const currentProduct = currentIndex < allProducts.length ? allProducts[currentIndex] : null;
  const nextProduct = currentIndex + 1 < allProducts.length ? allProducts[currentIndex + 1] : null;
  const isDone = allProducts.length === 0 || currentIndex >= allProducts.length;

  const labelFor = useCallback((p: Product): string => {
    const catName = categoryConfigs[p.category]?.name || p.category;
    return p.subcategory ? (subLabelMap[p.subcategory] || p.subcategory) : catName;
  }, [subLabelMap]);

  // Preload next few images so the promotion feels instant
  useEffect(() => {
    for (let i = 1; i <= 3; i++) {
      const p = allProducts[currentIndex + i];
      if (p && p.image !== '/vip-logo.svg') {
        const img = new Image();
        img.src = p.image;
      }
    }
  }, [currentIndex, allProducts]);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!settled || !currentProduct) return;
    cancelHint();
    setIsDragging(true);
    startXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startXRef.current);
  };

  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    if (!settled || !currentProduct) return;
    setExitDirection(direction);
    setPromoting(true);
    setSettled(false);

    // Swipe semantics: LEFT = like, RIGHT = skip.
    if (direction === 'left') {
      const current = likedRef.current;
      if (!current.includes(currentProduct.name)) {
        onLikedChangeRef.current([...current, currentProduct.name]);
        // Trigger the first-like celebration once per session.
        if (current.length === 0 && !firstLikeShownRef.current) {
          firstLikeShownRef.current = true;
          setCelebrationOpen(true);
        }
      }
    } else if (direction === 'right' && !firstSkipShownRef.current) {
      // Mirror the first-like cue on the user's first skip — reinforces that
      // skips also teach the concierge, so users keep giving signal.
      firstSkipShownRef.current = true;
      setSkipFeedbackOpen(true);
    }

    swipeTimeoutRef.current = setTimeout(() => {
      setSkipTransition(true);
      setCurrentIndex((i) => i + 1);
      setExitDirection(null);
      setPromoting(false);
      setDragX(0);
      requestAnimationFrame(() => {
        setSkipTransition(false);
        setSettled(true);
      });
    }, CARD_TRANSITION);
  }, [settled, currentProduct]);

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      triggerSwipe(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
    }
  };

  const handlePointerCancel = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragX(0);
  };

  const getCardTransform = () => {
    if (exitDirection === 'left') return 'translateX(-150%) rotate(-20deg)';
    if (exitDirection === 'right') return 'translateX(150%) rotate(20deg)';
    if (dragX !== 0) return `translateX(${dragX}px) rotate(${dragX * 0.06}deg)`;
    // Gesture hint nudge (one-shot on mount) - only when user isn't mid-drag
    if (hintX !== 0) return `translateX(${hintX}px) rotate(${hintX * 0.06}deg)`;
    return 'translateX(0)';
  };

  // Back-card geometry - slides up and forward as front card exits
  const CARD_TOP = 16;
  const FRONT_LEFT = 0;
  const BACK_LEFT = 12;
  const BACK_TOP_OFFSET = 24;
  const backLeft = promoting ? FRONT_LEFT : BACK_LEFT;
  const backTop = promoting ? CARD_TOP : CARD_TOP + BACK_TOP_OFFSET;

  // ── Detail view ───────────────────────────────────────────────────────────
  const handleOpenView = useCallback((p: Product, label: string) => {
    setViewProduct({ product: p, label });
    setViewExpanded(false);
    onOverlayChange?.(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setViewExpanded(true));
    });
  }, [onOverlayChange]);

  const handleCloseView = useCallback(() => {
    setViewProduct(null);
    setViewExpanded(false);
    onOverlayChange?.(false);
  }, [onOverlayChange]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, padding: `${safeTop(100)} 16px 20px` }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#999',
            textTransform: 'uppercase',
            lineHeight: '18px',
            margin: 0,
            marginBottom: 4,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        >
          {activeCategory}
        </p>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#fff',
            lineHeight: '26px',
            margin: 0,
            marginBottom: 6,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 40ms both',
          }}
        >
          Swipe to build your taste
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#999',
            lineHeight: '20px',
            margin: 0,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          Left to like, right to skip
        </p>
      </div>

      {/* Card stack area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Back card */}
        {nextProduct && !isDone && (
          <div
            style={{
              position: 'absolute',
              top: backTop,
              left: backLeft,
              right: backLeft,
              bottom: 16,
              background: '#0c0c0c',
              border: '1px solid #313131',
              borderRadius: 0,
              overflow: 'hidden',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              transition: promoting
                ? `top ${CARD_TRANSITION}ms cubic-bezier(0.16,1,0.3,1), left ${CARD_TRANSITION}ms cubic-bezier(0.16,1,0.3,1), right ${CARD_TRANSITION}ms cubic-bezier(0.16,1,0.3,1)`
                : 'none',
            }}
          >
            <CardContent product={nextProduct} label={labelFor(nextProduct)} dim />
          </div>
        )}

        {/* Front card */}
        {currentProduct && !isDone && (
          <div
            style={{
              position: 'absolute',
              top: CARD_TOP,
              left: FRONT_LEFT,
              right: FRONT_LEFT,
              bottom: 16,
              background: '#0c0c0c',
              border: '1px solid #313131',
              // Rounded only while actively swiping (drag or exit animation)
              borderRadius: isDragging || exitDirection ? 16 : 0,
              overflow: 'hidden',
              zIndex: 5,
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              transform: getCardTransform(),
              transition: isDragging || skipTransition
                ? 'border-radius 120ms ease-out'
                : `transform ${CARD_TRANSITION}ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 200ms ease-out`,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <CardContent product={currentProduct} label={labelFor(currentProduct)} />

            {/* Info button — hidden while dragging AND while the initial
                gesture-hint animation is in progress (prevents overlap with
                the LIKE badge that appears on the right during the hint). */}
            <button
              aria-label="View product details"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenView(currentProduct, labelFor(currentProduct));
              }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#181818',
                border: '1px solid #494949',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                zIndex: 6,
                touchAction: 'none',
                opacity: isDragging || hintX !== 0 ? 0 : 1,
                transition: isDragging ? 'none' : 'opacity 200ms ease',
                pointerEvents: isDragging || hintX !== 0 ? 'none' : 'auto',
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 18, color: '#fff', fontVariationSettings: "'wght' 300" }}
              >
                info
              </span>
            </button>

            {/* Swipe labels - badge appears on the OPPOSITE side of the drag
                (classic swipe-deck pattern: label sits at the "leading edge") */}
            {/* Badges react to real drag AND to the initial gesture-hint nudge
                so first-time users see which side means what. */}
            {(dragX > 40 || (dragX === 0 && hintX > 40)) && <SwipeLabel label="SKIP" side="left" />}
            {(dragX < -40 || (dragX === 0 && hintX < -40)) && <SwipeLabel label="LIKE" side="right" />}
          </div>
        )}

        {/* Empty state (card-shaped) */}
        {isDone && (
          <div
            style={{
              position: 'absolute',
              top: CARD_TOP,
              left: FRONT_LEFT,
              right: FRONT_LEFT,
              bottom: 16,
              background: '#0c0c0c',
              border: '1px solid #313131',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: '0 36px',
              animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 56,
                fontVariationSettings: "'wght' 200",
                color: '#fff',
                opacity: 0.25,
              }}
            >
              check_circle
            </span>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0, marginBottom: 6, lineHeight: '24px' }}>
                You're all caught up
              </h2>
              <p style={{ fontSize: 14, color: '#999', lineHeight: '20px', margin: 0, maxWidth: 280 }}>
                You've seen every piece in this selection. We'll surface more as they arrive.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div
        style={{
          flexShrink: 0,
          background: '#0d0d0d',
          padding: `16px 18px calc(28px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={onNext}
            style={{
              flex: 1,
              height: 48,
              background: 'rgba(246,246,246,0.1)',
              color: '#f6f6f6',
              border: 'none',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
          <button
            onClick={onNext}
            style={{
              flex: 1,
              height: 48,
              background: '#f6f6f6',
              color: '#121212',
              border: 'none',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Product detail view - premium layered transition (kept from v5.1) */}
      {viewProduct && (() => {
        const exp = viewExpanded;
        const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
        const isPlaceholder = viewProduct.product.image === '/vip-logo.svg';

        return (
          <>
            <div
              onClick={handleCloseView}
              style={{
                position: 'absolute', inset: 0, zIndex: 200,
                background: 'linear-gradient(-37deg, #0c0c0c 17%, #111111 79%)',
                opacity: exp ? 1 : 0,
                transition: `opacity 300ms ${ease}`,
              }}
            />

            <div style={{
              position: 'absolute', inset: 0, zIndex: 202,
              display: 'flex', flexDirection: 'column',
              padding: '60px 24px 0',
              pointerEvents: exp ? 'auto' : 'none',
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleCloseView(); }}
                style={{
                  position: 'absolute', top: 16, right: 16, width: 40, height: 40, zIndex: 204,
                  borderRadius: 10000, background: '#313131', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  opacity: exp ? 1 : 0,
                  transform: exp ? 'scale(1)' : 'scale(0.8)',
                  transition: `opacity 250ms ${ease} 200ms, transform 250ms ${ease} 200ms`,
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 24, fontVariationSettings: "'wght' 300", color: '#f8f8f8' }}>close</span>
              </button>

              <div style={{
                flex: '1 1 auto', minHeight: 0, overflow: 'auto',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isPlaceholder ? (
                  <div style={{
                    width: '100%', maxHeight: '50vh', minHeight: 240,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    opacity: exp ? 1 : 0,
                    transform: exp ? 'scale(1)' : 'scale(0.85)',
                    transition: `opacity 350ms ${ease}, transform 350ms ${ease}`,
                  }}>
                    <img
                      src="/vip-logo.svg"
                      alt=""
                      aria-hidden
                      style={{ width: 144, height: 144, opacity: 0.35, display: 'block' }}
                    />
                  </div>
                ) : (
                  <img
                    src={viewProduct.product.image}
                    alt={viewProduct.product.name}
                    style={{
                      maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain', display: 'block', flexShrink: 0,
                      opacity: exp ? 1 : 0,
                      transform: exp ? 'scale(1)' : 'scale(0.85)',
                      transition: `opacity 350ms ${ease}, transform 350ms ${ease}`,
                    }}
                  />
                )}

                <div style={{
                  flexShrink: 0, textAlign: 'center', color: '#fff', padding: '16px 0 0', width: '100%',
                  opacity: exp ? 1 : 0,
                  transform: exp ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 300ms ${ease} 250ms, transform 300ms ${ease} 250ms`,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#999', textTransform: 'uppercase', lineHeight: '22px', margin: 0 }}>{viewProduct.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: '22px', margin: '1px 0 0' }}>{viewProduct.product.name}</p>
                  <p style={{ fontSize: 14, fontWeight: 400, color: '#fff', opacity: 0.7, lineHeight: '17px', margin: '4px 0 0' }}>{viewProduct.product.brand}</p>
                </div>

                <p style={{
                  flexShrink: 0, fontSize: 14, fontWeight: 400, color: '#dedfe1', opacity: exp ? 0.8 : 0,
                  textAlign: 'center', lineHeight: '20px', margin: '12px auto 0', padding: '0 8px', maxWidth: 343,
                  transform: exp ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 300ms ${ease} 350ms, transform 300ms ${ease} 350ms`,
                }}>
                  {viewProduct.product.description}
                </p>
              </div>

              <div style={{
                flexShrink: 0, width: '100%', padding: '16px 8px 32px',
                opacity: exp ? 1 : 0,
                transform: exp ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 300ms ${ease} 400ms, transform 300ms ${ease} 400ms`,
              }}>
                <button onClick={handleCloseView} style={{ width: '100%', height: 48, background: 'rgba(246,246,246,0.1)', color: '#f6f6f6', border: 'none', borderRadius: 100, fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </>
        );
      })()}

      {/* First-like celebration — one-shot modal with confetti on the first like */}
      {celebrationOpen && (
        <FirstLikeCelebration onClose={() => setCelebrationOpen(false)} />
      )}

      {/* First-skip feedback — one-shot bottom sheet on the first skip */}
      {skipFeedbackOpen && (
        <FirstSkipFeedback onClose={() => setSkipFeedbackOpen(false)} />
      )}
    </div>
  );
}


// ── First-like celebration modal ─────────────────────────────────────────────
// Appears once per session when the user registers their very first "like".
// CSS-only confetti rain behind a dark VIP card.
function FirstLikeCelebration({ onClose }: { onClose: () => void }) {
  // Stable confetti pieces — generated once per mount so they do not reshuffle.
  const pieces = useMemo(() => {
    const colors = ["#f6f6f6", "#d4a24b", "#8a6d3b", "#cdcdcd", "#ffffff"];
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 600,
      duration: 1600 + Math.random() * 1400,
      size: 5 + Math.random() * 5,
      rotate: Math.random() * 360,
      color: colors[i % colors.length],
      shape: i % 3 === 0 ? "circle" : "square",
    }));
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 400,
          background: "rgba(0,0,0,0.72)",
          animation: "backdropFadeIn 220ms ease both",
        }}
      />

      {/* Confetti rain — sits above the backdrop, below the modal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 401,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {pieces.map((p) => (
          <span
            key={p.id}
            style={{
              position: "absolute",
              top: -20,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : 2,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confettiFall ${p.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}ms forwards`,
              opacity: 0.95,
            }}
          />
        ))}
      </div>

      {/* Bottom sheet — keeps the CTA thumb-reachable on mobile */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 402,
          background: "#121212",
          borderTop: "1px solid #282828",
          borderRadius: "20px 20px 0 0",
          padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
          textAlign: "center",
          animation: "sheetSlideUp 320ms cubic-bezier(0.25, 0.1, 0.25, 1) both",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.18)",
            margin: "0 auto 18px",
          }}
        />
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 12 }}>🥂</div>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#fff",
            lineHeight: "28px",
            margin: 0,
            letterSpacing: -0.2,
          }}
        >
          Nice taste.
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "#a8a8a8",
            lineHeight: "20px",
            margin: "8px auto 20px",
            maxWidth: 300,
          }}
        >
          Your first pick is in. The more you like, the sharper your VIP shortlist gets.
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: 52,
            background: "#f6f6f6",
            color: "#121212",
            border: "none",
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Keep going
        </button>
      </div>
    </>
  );
}

// ── First-skip feedback sheet ────────────────────────────────────────────────
// Mirrors FirstLikeCelebration for the user's very first skip — acknowledges
// the signal, re-frames it as a refinement (not a failure). VIP-dry voice.
// No confetti; a small sparkle sits above the copy to rhyme visually with the
// champagne cue without overselling.
function FirstSkipFeedback({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 400,
          background: "rgba(0,0,0,0.72)",
          animation: "backdropFadeIn 220ms ease both",
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 402,
          background: "#121212",
          borderTop: "1px solid #282828",
          borderRadius: "20px 20px 0 0",
          padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
          textAlign: "center",
          animation: "sheetSlideUp 320ms cubic-bezier(0.25, 0.1, 0.25, 1) both",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.18)",
            margin: "0 auto 18px",
          }}
        />

        {/* Tune / refinement glyph */}
        <div
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 14px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid #282828",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: 26,
              fontVariationSettings: "'wght' 300",
              color: "#f6f6f6",
              opacity: 0.85,
            }}
            aria-hidden
          >
            tune
          </span>
        </div>

        <h3
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#fff",
            lineHeight: "28px",
            margin: 0,
            letterSpacing: -0.2,
          }}
        >
          Duly noted.
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "#a8a8a8",
            lineHeight: "20px",
            margin: "8px auto 20px",
            maxWidth: 300,
          }}
        >
          Your concierge logs every preference. Skips refine your shortlist just as much as likes — the next picks will feel closer.
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: 52,
            background: "#f6f6f6",
            color: "#121212",
            border: "none",
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Keep going
        </button>
      </div>
    </>
  );
}
