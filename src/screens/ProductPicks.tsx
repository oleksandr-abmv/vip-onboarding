import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { theme, safeTop } from '../theme';
import PRODUCTS, { type Product } from '../data/products';

interface ProductPicksProps {
  onNext: () => void;
  selectedInterests: string[];
  likedProducts: string[];
  onLikedChange: (products: string[]) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterProducts(interests: string[]): Product[] {
  if (interests.length === 0) return shuffle(PRODUCTS);

  // Show only products from selected categories
  const filtered = PRODUCTS.filter((p) => interests.includes(p.category));
  return shuffle(filtered);
}

export default function ProductPicks({
  onNext,
  selectedInterests,
  likedProducts,
  onLikedChange,
}: ProductPicksProps) {
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);
  const [revealedCount, setRevealedCount] = useState(8);
  const [animating, setAnimating] = useState<string | null>(null);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [counterBouncing, setCounterBouncing] = useState(false);
  const counterRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heartIdRef = useRef(0);
  const allProducts = useMemo(() => filterProducts(selectedInterests), [selectedInterests]);
  const products = allProducts.slice(0, visibleCount);
  const hasMore = visibleCount < allProducts.length;

  // Infinite scroll: detect when near bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingMore || !hasMore) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (nearBottom) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((c) => c + 8);
        setTimeout(() => {
          setLoadingMore(false);
        }, 50);
      }, 600);
    }
  }, [loadingMore, hasMore]);

  // Update revealedCount after visibleCount changes (for staggered animation)
  useEffect(() => {
    if (visibleCount > revealedCount) {
      // Small delay so cards animate in after skeletons disappear
      const timer = setTimeout(() => setRevealedCount(visibleCount), 100);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, revealedCount]);

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

        // Bounce counter when heart arrives
        setTimeout(() => {
          setCounterBouncing(true);
          setTimeout(() => setCounterBouncing(false), 400);
        }, 450);

        // Remove flying heart after animation
        setTimeout(() => {
          setFlyingHearts((prev) => prev.filter((h) => h.id !== id));
        }, 600);
      }
    }
  };

  const likeCount = likedProducts.length;


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
      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing.screenPadding,
          paddingTop: safeTop(68),
          paddingBottom: 0,
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            lineHeight: '32px',
            margin: 0,
            marginBottom: 8,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          Tap anything that catches your eye
        </h1>
        <p
          style={{
            fontSize: 15,
            color: theme.colors.textMuted,
            lineHeight: '22px',
            margin: 0,
            marginBottom: 20,
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
            gap: 14,
            alignContent: 'start',
            paddingBottom: 10,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 240ms both',
          }}
        >
          {products.map((product, idx) => {
            const liked = likedProducts.includes(product.name);
            const isAnimating = animating === product.name && liked;
            const isNewlyRevealed = idx >= revealedCount - 8 && idx >= 8;
            const staggerDelay = isNewlyRevealed ? `${(idx % 8) * 60}ms` : undefined;

            return (
              <div
                key={product.name}
                onClick={() => openSheet(product)}
                style={{
                  background: theme.colors.surface,
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  animation: isNewlyRevealed ? `cardReveal 400ms cubic-bezier(0.25, 0.1, 0.25, 1) ${staggerDelay} both` : undefined,
                }}
              >
                {/* Image */}
                <div
                  style={{
                    height: 110,
                    background: theme.colors.surfaceElevated,
                    overflow: 'hidden',
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
                  onClick={(e) => { e.stopPropagation(); toggleLike(product.name, e); }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 36,
                    height: 36,
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
                      fontSize: 20,
                      fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    favorite
                  </span>
                </button>

                {/* Info */}
                <div style={{ padding: '8px 12px 10px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#bbb',
                      lineHeight: '16px',
                    }}
                  >
                    {product.brand}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                      lineHeight: '18px',
                      marginTop: 2,
                    }}
                  >
                    {product.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: theme.colors.textTertiary,
                      lineHeight: '16px',
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

        {/* Skeleton loading placeholders */}
        {loadingMore && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginTop: 14,
              paddingBottom: 10,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                style={{
                  background: theme.colors.surface,
                  borderRadius: 16,
                  overflow: 'hidden',
                  animation: `fadeIn 300ms ease ${i * 80}ms both`,
                }}
              >
                <div
                  style={{
                    height: 110,
                    background: `linear-gradient(90deg, ${theme.colors.surfaceElevated} 25%, #2a2a2a 50%, ${theme.colors.surfaceElevated} 75%)`,
                    backgroundSize: '200% 100%',
                    animation: 'skeletonShimmer 1.5s ease-in-out infinite',
                  }}
                />
                <div style={{ padding: '10px 12px 12px' }}>
                  <div
                    style={{
                      height: 10,
                      width: '50%',
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${theme.colors.surfaceElevated} 25%, #2a2a2a 50%, ${theme.colors.surfaceElevated} 75%)`,
                      backgroundSize: '200% 100%',
                      animation: 'skeletonShimmer 1.5s ease-in-out infinite',
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      width: '75%',
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${theme.colors.surfaceElevated} 25%, #2a2a2a 50%, ${theme.colors.surfaceElevated} 75%)`,
                      backgroundSize: '200% 100%',
                      animation: 'skeletonShimmer 1.5s ease-in-out infinite',
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      width: '35%',
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${theme.colors.surfaceElevated} 25%, #2a2a2a 50%, ${theme.colors.surfaceElevated} 75%)`,
                      backgroundSize: '200% 100%',
                      animation: 'skeletonShimmer 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom */}
      <div
        style={{
          flexShrink: 0,
          padding: `0 ${theme.spacing.screenPadding} calc(4px + env(safe-area-inset-bottom, 0px))`,
          background: `linear-gradient(to top, ${theme.colors.background} 70%, transparent)`,
        }}
      >
        {/* Like counter */}
        <p
          ref={counterRef}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: theme.colors.textMuted,
            textAlign: 'center',
            margin: 0,
            marginBottom: 10,
            opacity: likeCount > 0 ? 1 : 0,
            transition: 'opacity 200ms ease',
            animation: counterBouncing ? 'ctaBounce 400ms ease' : undefined,
          }}
        >
          {likeCount}/10 liked
        </p>

        {/* CTA */}
        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: 52,
            marginBottom: 4,
            background: theme.colors.ctaPrimary,
            color: theme.colors.ctaPrimaryText,
            border: 'none',
            borderRadius: 100,
            fontSize: 17,
            fontWeight: 500,
            cursor: 'pointer',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
          }}
        >
          Continue
        </button>
      </div>

      {/* Flying hearts */}
      {flyingHearts.map((heart) => {
        const counterEl = counterRef.current;
        const containerEl = containerRef.current;
        if (!counterEl || !containerEl) return null;
        const counterRect = counterEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        const targetX = counterRect.left + counterRect.width / 2 - containerRect.left;
        const targetY = counterRect.top + counterRect.height / 2 - containerRect.top;
        return (
          <span
            key={heart.id}
            className="material-symbols-rounded"
            style={{
              position: 'absolute',
              left: heart.x,
              top: heart.y,
              zIndex: 200,
              fontSize: 22,
              color: theme.colors.heartActive,
              fontVariationSettings: "'FILL' 1",
              pointerEvents: 'none',
              animation: 'flyToButton 500ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
              transition: 'left 500ms cubic-bezier(0.4, 0, 0.2, 1), top 500ms cubic-bezier(0.4, 0, 0.2, 1)',
              ...({ '--target-x': `${targetX}px`, '--target-y': `${targetY}px` } as React.CSSProperties),
            }}
            ref={(el) => {
              if (el) {
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
              bottom: 16,
              left: 16,
              right: 16,
              zIndex: 101,
              background: theme.colors.surface,
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              animation: `${sheetClosing ? 'sheetSlideDown' : 'sheetSlideUp'} 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both`,
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#444' }} />
            </div>

            {/* Content */}
            <div style={{ padding: '0 24px' }}>
              {/* Large image */}
              <div
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: theme.colors.surfaceElevated,
                  marginBottom: 14,
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
                  fontSize: 13,
                  fontWeight: 600,
                  color: theme.colors.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 4,
                }}
              >
                {sheetProduct.brand}
              </div>

              {/* Name + Price row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: theme.colors.textPrimary,
                    lineHeight: '24px',
                  }}
                >
                  {sheetProduct.name}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: theme.colors.textSecondary,
                    flexShrink: 0,
                  }}
                >
                  {sheetProduct.price}
                </div>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 14,
                  color: theme.colors.textMuted,
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                {sheetProduct.description}
              </p>
            </div>

            {/* Close button — sticky bottom */}
            <div style={{ padding: '14px 24px calc(14px + env(safe-area-inset-bottom, 0px))' }}>
              <button
                onClick={closeSheet}
                style={{
                  width: '100%',
                  height: 48,
                  background: theme.colors.surfaceElevated,
                  color: theme.colors.textPrimary,
                  border: 'none',
                  borderRadius: 100,
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
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
