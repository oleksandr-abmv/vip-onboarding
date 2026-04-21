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
  const startXRef = useRef(0);
  const swipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detail view state (kept from original v5.1 design)
  const [viewProduct, setViewProduct] = useState<{ product: Product; label: string } | null>(null);
  const [viewExpanded, setViewExpanded] = useState(false);

  useEffect(() => () => {
    if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
  }, []);

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

    if (direction === 'right') {
      const current = likedRef.current;
      if (!current.includes(currentProduct.name)) {
        onLikedChangeRef.current([...current, currentProduct.name]);
      }
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
          Right to like, left to skip
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

            {/* Info button - hidden while dragging */}
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
                opacity: isDragging ? 0 : 1,
                transition: isDragging ? 'none' : 'opacity 200ms ease',
                pointerEvents: isDragging ? 'none' : 'auto',
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 18, color: '#fff', fontVariationSettings: "'wght' 300" }}
              >
                info
              </span>
            </button>

            {/* Swipe labels — badge appears on the OPPOSITE side of the drag
                (classic swipe-deck pattern: label sits at the "leading edge") */}
            {dragX > 40 && <SwipeLabel label="LIKE" side="left" />}
            {dragX < -40 && <SwipeLabel label="SKIP" side="right" />}
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
    </div>
  );
}
