import { useState, useCallback, useRef } from 'react';
import { theme, safeTop } from '../theme';
import ProgressBar from '../components/ProgressBar';
import PRODUCTS, { type Product } from '../data/products';

interface ProductPicksProps {
  onNext: () => void;
  selectedInterests: string[];
  likedProducts: string[];
  onLikedChange: (products: string[]) => void;
  totalSteps: number;
}

function filterProducts(interests: string[]): typeof PRODUCTS {
  let filtered = PRODUCTS;

  if (interests.length > 0) {
    const byInterest = filtered.filter((p) => interests.includes(p.category));
    if (byInterest.length >= 6) {
      filtered = byInterest;
    } else if (byInterest.length > 0) {
      const rest = filtered.filter((p) => !interests.includes(p.category));
      filtered = [...byInterest, ...rest];
    }
  }

  // Sort by interest priority
  filtered.sort((a, b) => {
    const ai = interests.indexOf(a.category);
    const bi = interests.indexOf(b.category);
    return (ai >= 0 ? ai : 999) - (bi >= 0 ? bi : 999);
  });

  return filtered.slice(0, 8);
}

export default function ProductPicks({
  onNext,
  selectedInterests,
  likedProducts,
  onLikedChange,
  totalSteps,
}: ProductPicksProps) {
  const [animating, setAnimating] = useState<string | null>(null);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [ctaBouncing, setCtaBouncing] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heartIdRef = useRef(0);
  const products = filterProducts(selectedInterests);

  const openSheet = useCallback((product: Product) => {
    setSheetProduct(product);
    setSheetClosing(false);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetClosing(true);
    setTimeout(() => {
      setSheetProduct(null);
      setSheetClosing(false);
    }, 250);
  }, []);

  const toggleLike = (productName: string, e: React.MouseEvent) => {
    const isLiked = likedProducts.includes(productName);
    setAnimating(productName);
    setTimeout(() => setAnimating(null), 300);

    if (isLiked) {
      onLikedChange(likedProducts.filter((p) => p !== productName));
    } else {
      onLikedChange([...likedProducts, productName]);

      // Spawn flying heart from click position
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = ++heartIdRef.current;
        setFlyingHearts((prev) => [...prev, { id, x, y }]);

        // Bounce CTA when heart arrives
        setTimeout(() => {
          setCtaBouncing(true);
          setTimeout(() => setCtaBouncing(false), 400);
        }, 450);

        // Remove flying heart after animation
        setTimeout(() => {
          setFlyingHearts((prev) => prev.filter((h) => h.id !== id));
        }, 600);
      }
    }
  };

  const likeCount = likedProducts.length;
  const progressStep = totalSteps - 1;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      <ProgressBar step={progressStep} totalSteps={totalSteps} />

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing.screenPadding,
          paddingTop: safeTop(52),
          paddingBottom: 0,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            lineHeight: '26px',
            margin: 0,
            marginBottom: 6,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          Tap anything that catches your eye
        </h1>
        <p
          style={{
            fontSize: 13,
            color: theme.colors.textMuted,
            lineHeight: '18px',
            margin: 0,
            marginBottom: 18,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
          }}
        >
          Your advisor learns from your picks.
        </p>

        {/* Product grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            alignContent: 'start',
            paddingBottom: 8,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 240ms both',
          }}
        >
          {products.map((product) => {
            const liked = likedProducts.includes(product.name);
            const isAnimating = animating === product.name && liked;

            return (
              <div
                key={product.name}
                style={{
                  background: theme.colors.surface,
                  borderRadius: 14,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Image — tap to view details */}
                <div
                  onClick={() => openSheet(product)}
                  style={{
                    height: 72,
                    background: theme.colors.surfaceElevated,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Heart */}
                <button
                  onClick={(e) => toggleLike(product.name, e)}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.45)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: liked ? theme.colors.heartActive : 'rgba(255,255,255,0.7)',
                    animation: isAnimating ? 'heartPop 300ms ease' : 'none',
                    padding: 0,
                  }}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{
                      fontSize: 16,
                      fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    favorite
                  </span>
                </button>

                {/* Info */}
                <div style={{ padding: '6px 10px 8px' }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: '#bbb',
                      lineHeight: '14px',
                    }}
                  >
                    {product.brand}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: theme.colors.textSecondary,
                      lineHeight: '14px',
                      marginTop: 1,
                    }}
                  >
                    {product.name}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: theme.colors.textTertiary,
                      lineHeight: '12px',
                      marginTop: 3,
                    }}
                  >
                    {product.price}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom */}
      <div
        style={{
          flexShrink: 0,
          padding: `0 ${theme.spacing.screenPadding} calc(4px + env(safe-area-inset-bottom, 0px))`,
          background: `linear-gradient(to top, ${theme.colors.background} 70%, transparent)`,
        }}
      >
        {/* Like count */}
        <p
          style={{
            fontSize: 13,
            color: theme.colors.textTertiary,
            textAlign: 'center',
            margin: 0,
            marginBottom: 8,
            height: 18,
            opacity: likeCount > 0 ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        >
          {likeCount} liked
        </p>

        {/* CTA */}
        <button
          ref={ctaRef}
          onClick={onNext}
          style={{
            width: '100%',
            height: 48,
            marginBottom: 4,
            background: theme.colors.ctaPrimary,
            color: theme.colors.ctaPrimaryText,
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            animation: ctaBouncing
              ? 'ctaBounce 400ms ease'
              : 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
          }}
        >
          Continue
        </button>
      </div>

      {/* Flying hearts */}
      {flyingHearts.map((heart) => {
        const ctaEl = ctaRef.current;
        const containerEl = containerRef.current;
        if (!ctaEl || !containerEl) return null;
        const ctaRect = ctaEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        const targetX = ctaRect.left + ctaRect.width / 2 - containerRect.left;
        const targetY = ctaRect.top + ctaRect.height / 2 - containerRect.top;
        return (
          <span
            key={heart.id}
            className="material-symbols-rounded"
            style={{
              position: 'absolute',
              left: heart.x,
              top: heart.y,
              zIndex: 200,
              fontSize: 20,
              color: theme.colors.heartActive,
              fontVariationSettings: "'FILL' 1",
              pointerEvents: 'none',
              animation: 'flyToButton 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
              transition: 'left 500ms cubic-bezier(0.4, 0, 0.2, 1), top 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              // Move to CTA center
              ...({ '--target-x': `${targetX}px`, '--target-y': `${targetY}px` } as React.CSSProperties),
            }}
            ref={(el) => {
              if (el) {
                // Animate position to CTA center
                requestAnimationFrame(() => {
                  el.style.left = `${targetX}px`;
                  el.style.top = `${targetY}px`;
                });
              }
            }}
          >
            favorite
          </span>
        );
      })}

      {/* Product detail bottom sheet */}
      {sheetProduct && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeSheet}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100,
              animation: `${sheetClosing ? 'backdropFadeOut' : 'backdropFadeIn'} 250ms ease both`,
            }}
          />

          {/* Sheet */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 101,
              background: theme.colors.surface,
              borderRadius: '20px 20px 0 0',
              maxHeight: '75%',
              display: 'flex',
              flexDirection: 'column',
              animation: `${sheetClosing ? 'sheetSlideDown' : 'sheetSlideUp'} 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both`,
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#444' }} />
            </div>

            {/* Content */}
            <div style={{ overflow: 'auto', padding: '0 20px 20px' }}>
              {/* Large image */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: theme.colors.surfaceElevated,
                  marginBottom: 16,
                }}
              >
                <img
                  src={sheetProduct.image}
                  alt={sheetProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Brand */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: theme.colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 4,
                }}
              >
                {sheetProduct.brand}
              </div>

              {/* Name */}
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: theme.colors.textPrimary,
                  lineHeight: '24px',
                  marginBottom: 4,
                }}
              >
                {sheetProduct.name}
              </div>

              {/* Price */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: theme.colors.textSecondary,
                  marginBottom: 14,
                }}
              >
                {sheetProduct.price}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#333', marginBottom: 14 }} />

              {/* Description */}
              <p
                style={{
                  fontSize: 13,
                  color: theme.colors.textMuted,
                  lineHeight: '20px',
                  margin: 0,
                  marginBottom: 20,
                }}
              >
                {sheetProduct.description}
              </p>

              {/* Close button */}
              <button
                onClick={closeSheet}
                style={{
                  width: '100%',
                  height: 44,
                  background: theme.colors.surfaceElevated,
                  color: theme.colors.textPrimary,
                  border: 'none',
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginBottom: `env(safe-area-inset-bottom, 0px)`,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
