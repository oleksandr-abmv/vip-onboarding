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


  // ── View mode (swipe vs scroll feed) ──────────────────────────────────────
  const [viewMode, setViewMode] = useState<'swipe' | 'scroll'>('swipe');
  // Local "skipped" set used only by the scroll-feed thumb-down button. Lets
  // the icon stay filled when scrolling away and back.
  const [skippedSet, setSkippedSet] = useState<Set<string>>(() => new Set());

  // ── Swipe deck state ──────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [settled, setSettled] = useState(true);
  const [skipTransition, setSkipTransition] = useState(false);
  // One-shot feedback sheets — fire once each on the very first like / skip,
  // shared across both swipe and scroll modes.
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const firstLikeShownRef = useRef(false);
  const [skipFeedbackOpen, setSkipFeedbackOpen] = useState(false);
  const firstSkipShownRef = useRef(false);

  // Helpers for scroll-feed actions (also fire the celebration sheets)
  const scrollLike = useCallback((productName: string) => {
    const current = likedRef.current;
    const wasLiked = current.includes(productName);
    if (wasLiked) {
      // Toggle off
      onLikedChangeRef.current(current.filter((n) => n !== productName));
    } else {
      onLikedChangeRef.current([...current, productName]);
      if (current.length === 0 && !firstLikeShownRef.current) {
        firstLikeShownRef.current = true;
        setCelebrationOpen(true);
      }
    }
    // Always clear from skipped if newly liked
    if (!wasLiked) {
      setSkippedSet((prev) => {
        if (!prev.has(productName)) return prev;
        const next = new Set(prev);
        next.delete(productName);
        return next;
      });
    }
  }, []);

  const scrollSkip = useCallback((productName: string) => {
    setSkippedSet((prev) => {
      const next = new Set(prev);
      if (next.has(productName)) {
        next.delete(productName);
      } else {
        next.add(productName);
        // Remove from liked if previously liked
        const current = likedRef.current;
        if (current.includes(productName)) {
          onLikedChangeRef.current(current.filter((n) => n !== productName));
        }
        // Fire first-skip sheet on the very first skip across modes
        if (!firstSkipShownRef.current) {
          firstSkipShownRef.current = true;
          setSkipFeedbackOpen(true);
        }
      }
      return next;
    });
  }, []);
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

  // Gesture hint replays every time the user enters swipe mode (mount, or
  // toggling from scroll → swipe). Reminds users which side is like vs skip.
  useEffect(() => {
    if (viewMode !== 'swipe') return;
    if (allProducts.length === 0) return;
    // Reset state so the hint can re-run
    hintDoneRef.current = false;
    hintTimeouts.current.forEach(clearTimeout);
    hintTimeouts.current = [];
    setHintX(0);

    const schedule = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      hintTimeouts.current.push(t);
    };
    // Sequence: settle → nudge left (like) → across to right (skip) → back to center
    schedule(800, () => setHintX(-60));
    schedule(1300, () => setHintX(60));
    schedule(1800, () => setHintX(0));
    schedule(2000, () => { hintDoneRef.current = true; });

    return () => {
      hintTimeouts.current.forEach(clearTimeout);
      hintTimeouts.current = [];
    };
  }, [viewMode, allProducts.length]);

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
    } else if (Math.abs(dragX) < 6 && currentProduct) {
      // Treated as a tap (barely any drag) → open the product detail view.
      setDragX(0);
      handleOpenView(currentProduct, labelFor(currentProduct));
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
      <div style={{ flexShrink: 0, padding: `${safeTop(92)} 16px 14px` }}>
        {/* Title row + view-mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: '#fff',
              lineHeight: '26px',
              margin: 0,
              animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 40ms both',
            }}
          >
            {viewMode === 'swipe' ? 'Swipe to build your taste' : 'Scroll to build your taste'}
          </h1>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>

        <p
          style={{
            fontSize: 13,
            color: '#999',
            lineHeight: '18px',
            margin: 0,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          {viewMode === 'swipe' ? 'Left to like, right to skip' : 'Tap thumb up to like, thumb down to skip'}
        </p>
      </div>

      {/* Card stack area (swipe mode) */}
      {viewMode === 'swipe' && (
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
      )}

      {/* Scroll feed (alternative view mode) */}
      {viewMode === 'scroll' && (
        <ScrollFeed
          products={allProducts}
          labelFor={labelFor}
          likedProducts={likedProducts}
          skippedSet={skippedSet}
          onLike={scrollLike}
          onSkip={scrollSkip}
          onOpenView={handleOpenView}
        />
      )}

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
          Nice taste
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

// ── View-mode toggle (swipe / scroll) ────────────────────────────────────────
function ViewModeToggle({
  mode,
  onChange,
  floating = false,
}: {
  mode: 'swipe' | 'scroll';
  onChange: (m: 'swipe' | 'scroll') => void;
  /** Floating mode: stronger background + shadow to read over content. */
  floating?: boolean;
}) {
  // Two-segment switcher. Each half is [icon] + one-word label.
  // Active: filled white pill. Inactive: transparent + muted text.
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: floating ? 'rgba(20,20,20,0.86)' : 'rgba(255,255,255,0.06)',
        border: floating ? '1px solid rgba(255,255,255,0.08)' : '1px solid #282828',
        borderRadius: 100,
        padding: 3,
        flexShrink: 0,
        boxShadow: floating ? '0 6px 20px rgba(0,0,0,0.5)' : undefined,
        backdropFilter: floating ? 'blur(8px)' : undefined,
        WebkitBackdropFilter: floating ? 'blur(8px)' : undefined,
      }}
      role="tablist"
      aria-label="Card view mode"
    >
      {(['swipe', 'scroll'] as const).map((m) => {
        const active = mode === m;
        const label = m === 'swipe' ? 'Swipe' : 'List';
        const icon = m === 'swipe' ? 'style' : 'view_agenda';
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            aria-label={`${label} view`}
            onClick={() => onChange(m)}
            style={{
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              background: active ? '#fff' : 'transparent',
              border: 'none',
              borderRadius: 100,
              cursor: active ? 'default' : 'pointer',
              padding: '0 11px',
              transition: 'background 200ms ease, color 200ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{
                fontSize: 16,
                fontVariationSettings: "'wght' 400",
                color: active ? '#0a0a0a' : '#cdcdcd',
                transition: 'color 200ms ease',
              }}
              aria-hidden
            >
              {icon}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1,
                color: active ? '#0a0a0a' : '#cdcdcd',
                whiteSpace: 'nowrap',
                transition: 'color 200ms ease',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Scroll feed (alternative to swipe deck) ──────────────────────────────────
// Vertical list of cards. Each card starts as a skeleton, fades to real
// content after a staggered delay (loading-state feel). Like / skip buttons
// live on the card itself; first-action celebrations still fire via the
// shared one-shot guards.
function ScrollFeed({
  products,
  labelFor,
  likedProducts,
  skippedSet,
  onLike,
  onSkip,
  onOpenView,
}: {
  products: Product[];
  labelFor: (p: Product) => string;
  likedProducts: string[];
  skippedSet: Set<string>;
  onLike: (productName: string) => void;
  onSkip: (productName: string) => void;
  onOpenView: (p: Product, label: string) => void;
}) {
  // Track which cards have "loaded" (skeleton → content). Use IntersectionObserver
  // so cards that scroll into view get a brief skeleton before revealing.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Card-exit animation tracking (for like/skip actions in scroll mode)
  // Phase 1: exitingMap → card slides + fades
  // Phase 2: collapsedSet → wrapper max-height transitions to 0
  // Phase 3: removedSet → card filtered out of the rendered list
  const [exitingMap, setExitingMap] = useState<Map<string, 'like' | 'skip'>>(() => new Map());
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(() => new Set());
  const [removedSet, setRemovedSet] = useState<Set<string>>(() => new Set());

  const handleAction = useCallback((name: string, action: 'like' | 'skip') => {
    if (exitingMap.has(name)) return; // already animating out
    // Fire the actual state change (records like/skip + may trigger first-action sheet)
    if (action === 'like') onLike(name);
    else onSkip(name);
    // Phase 1: slide + fade
    setExitingMap((prev) => new Map(prev).set(name, action));
    // Phase 2: collapse height to close the gap
    setTimeout(() => {
      setCollapsedSet((prev) => {
        if (prev.has(name)) return prev;
        const next = new Set(prev);
        next.add(name);
        return next;
      });
    }, 220);
    // Phase 3: drop from DOM entirely
    setTimeout(() => {
      setRemovedSet((prev) => {
        if (prev.has(name)) return prev;
        const next = new Set(prev);
        next.add(name);
        return next;
      });
    }, 600);
  }, [exitingMap, onLike, onSkip]);

  // Initial load: stagger-reveal first 3 cards
  useEffect(() => {
    [0, 1, 2].forEach((i) => {
      if (i >= products.length) return;
      const t = setTimeout(() => {
        setLoaded((prev) => {
          if (prev.has(i)) return prev;
          const next = new Set(prev);
          next.add(i);
          return next;
        });
      }, 250 + i * 350);
      timersRef.current.set(i, t);
    });
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reveal additional cards as they scroll into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (Number.isFinite(idx) && !loaded.has(idx) && !timersRef.current.has(idx)) {
              const t = setTimeout(() => {
                setLoaded((prev) => {
                  if (prev.has(idx)) return prev;
                  const next = new Set(prev);
                  next.add(idx);
                  return next;
                });
                timersRef.current.delete(idx);
              }, 500);
              timersRef.current.set(idx, t);
            }
          }
        });
      },
      { root: container, threshold: 0.2 }
    );
    cardRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [products.length, loaded]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {products.map((p, i) => {
        if (removedSet.has(p.name)) return null;
        const isLoaded = loaded.has(i);
        const isLiked = likedProducts.includes(p.name);
        const isSkipped = skippedSet.has(p.name);
        const exitAction = exitingMap.get(p.name);
        const isCollapsed = collapsedSet.has(p.name);
        return (
          <div
            key={`${p.name}-${i}`}
            // Outer wrapper handles height collapse so the gap closes smoothly
            style={{
              maxHeight: isCollapsed ? 0 : 1200,
              marginBottom: isCollapsed ? -16 : 0, // counteract the parent gap
              overflow: 'hidden',
              transition: isCollapsed
                ? 'max-height 360ms cubic-bezier(0.4, 0, 0.2, 1), margin-bottom 360ms cubic-bezier(0.4, 0, 0.2, 1)'
                : undefined,
              flexShrink: 0,
              pointerEvents: exitAction ? 'none' : 'auto',
            }}
          >
            <div
              data-index={i}
              ref={(el) => {
                if (el) cardRefs.current.set(i, el);
                else cardRefs.current.delete(i);
              }}
              style={{
                background: '#0c0c0c',
                border: '1px solid #313131',
                borderRadius: 16,
                overflow: 'hidden',
                animation: exitAction === 'like'
                  ? 'cardExitLike 240ms cubic-bezier(0.5, 0, 0.75, 0) both'
                  : exitAction === 'skip'
                    ? 'cardExitSkip 240ms cubic-bezier(0.5, 0, 0.75, 0) both'
                    : isLoaded
                      ? 'fadeInUp 320ms cubic-bezier(0.25, 0.1, 0.25, 1) both'
                      : undefined,
              }}
            >
              {isLoaded ? (
                <ScrollFeedCard
                  product={p}
                  label={labelFor(p)}
                  isLiked={isLiked}
                  isSkipped={isSkipped}
                  onLike={() => handleAction(p.name, 'like')}
                  onSkip={() => handleAction(p.name, 'skip')}
                  onOpenView={() => onOpenView(p, labelFor(p))}
                />
              ) : (
                <SkeletonCard />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
          backgroundSize: '200% 100%',
          animation: 'skeletonShimmer 1.4s linear infinite',
        }}
      />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            width: 70,
            height: 10,
            borderRadius: 3,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.4s linear infinite',
          }}
        />
        <div
          style={{
            width: '60%',
            height: 16,
            borderRadius: 4,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.4s linear infinite',
          }}
        />
        <div
          style={{
            width: '40%',
            height: 14,
            borderRadius: 4,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.4s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

function ScrollFeedCard({
  product,
  label,
  isLiked,
  isSkipped,
  onLike,
  onSkip,
  onOpenView,
}: {
  product: Product;
  label: string;
  isLiked: boolean;
  isSkipped: boolean;
  onLike: () => void;
  onSkip: () => void;
  onOpenView: () => void;
}) {
  const isPlaceholder = product.image === '/vip-logo.svg';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image — tap to open detail */}
      <button
        onClick={onOpenView}
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: '#212020',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label="View details"
      >
        {isPlaceholder ? (
          <img
            src="/vip-logo.svg"
            alt=""
            aria-hidden
            style={{ width: 96, height: 96, opacity: 0.35, display: 'block' }}
          />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            draggable={false}
            style={{
              maxWidth: '70%',
              maxHeight: '85%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        )}
      </button>

      {/* Body — vertically stacked, all content centered */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          padding: '16px 16px 18px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: '100%', minWidth: 0 }}>
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

        {/* Thumb buttons — centered row below the meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 4 }}>
          <ThumbButton
            kind="down"
            active={isSkipped}
            onClick={onSkip}
            ariaLabel={isSkipped ? 'Undo skip' : 'Skip this product'}
          />
          <ThumbButton
            kind="up"
            active={isLiked}
            onClick={onLike}
            ariaLabel={isLiked ? 'Undo like' : 'Like this product'}
          />
        </div>
      </div>
    </div>
  );
}

function ThumbButton({
  kind,
  active,
  onClick,
  ariaLabel,
}: {
  kind: 'up' | 'down';
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: active ? '#f6f6f6' : 'rgba(255,255,255,0.06)',
        border: active ? '1.5px solid #fff' : '1px solid #313131',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 200ms ease, border-color 200ms ease, transform 120ms ease',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
      }}
      onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.94)'; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
    >
      <span
        className="material-symbols-rounded"
        style={{
          fontSize: 26,
          fontVariationSettings: active ? "'wght' 500, 'FILL' 1" : "'wght' 400",
          color: active ? '#0a0a0a' : '#cdcdcd',
        }}
        aria-hidden
      >
        {kind === 'up' ? 'thumb_up' : 'thumb_down'}
      </span>
    </button>
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
          Learning your taste
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
          Every skip teaches your concierge what to filter out. Your next picks will land closer to what you actually want.
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
