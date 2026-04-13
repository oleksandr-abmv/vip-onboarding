import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { safeTop } from '../theme';
import PRODUCTS, { type Product } from '../data/products';
import { categoryConfigs, getSubcategories } from '../data/categoryConfig';

// ── Spark particles (generated once) ─────────────────────────────────────────
const SPARK_COUNT = 12;
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (i / SPARK_COUNT) * 360 + (Math.random() * 10 - 5);
  const rad = (angle * Math.PI) / 180;
  const dist = 50 + Math.random() * 30;
  return {
    tx: Math.cos(rad) * dist,
    ty: Math.sin(rad) * dist,
    delay: Math.random() * 60,
    size: 2 + Math.random() * 2.5,
    duration: 450 + Math.random() * 200,
  };
});

// Inset padding per category so small items (rings, watches) don't fill the card
const IMAGE_PADDING: Record<string, number> = {};

// ── ProductCard component ────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product;
  label: string;
  labelNode: React.ReactNode;
  isLiked: boolean;
  isSparking: boolean;
  isDismissing: boolean;
  onLike: (name: string) => void;
  onDislike: (name: string) => void;
  onView: (product: Product, rect: DOMRect) => void;
}

function ProductCard({ product, labelNode, isLiked, isSparking, isDismissing, onLike, onDislike, onView }: ProductCardProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  return (
    <div
      style={{
        border: '1px solid #282828',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'opacity 350ms ease, transform 350ms ease, max-height 350ms ease, padding 350ms ease, margin 350ms ease, border-color 350ms ease',
        ...(isDismissing ? {
          opacity: 0,
          transform: 'scale(0.85)',
          maxHeight: 0,
          padding: '0 16px',
          marginTop: -12,
          borderColor: 'transparent',
          overflow: 'hidden',
        } : {
          padding: '24px 16px',
          maxHeight: 600,
          overflow: 'hidden',
        }),
      }}
    >
      {/* Product image — tappable to open detail view */}
      <div
        onClick={() => {
          const rect = imgRef.current?.getBoundingClientRect();
          if (rect) onView(product, rect);
        }}
        style={{
          width: '100%',
          aspectRatio: '343 / 250',
          position: 'relative',
          cursor: 'pointer',
          padding: IMAGE_PADDING[product.category] || 0,
        }}
      >
        <img
          ref={imgRef}
          src={product.image}
          alt={product.name}
          style={{
            position: 'absolute',
            inset: IMAGE_PADDING[product.category] || 0,
            width: `calc(100% - ${(IMAGE_PADDING[product.category] || 0) * 2}px)`,
            height: `calc(100% - ${(IMAGE_PADDING[product.category] || 0) * 2}px)`,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* Product info + actions row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {/* Text info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#999',
              textTransform: 'uppercase',
              lineHeight: '18px',
              margin: 0,
              overflow: 'hidden',
            }}
          >
            {labelNode}
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
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
              color: '#fff',
              opacity: 0.7,
              lineHeight: '17px',
              margin: 0,
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.brand}
          </p>
        </div>

        {/* Like / Dislike buttons */}
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          {/* Dislike — hidden when liked */}
          {!isLiked && (
            <button
              onClick={(e) => { e.stopPropagation(); onDislike(product.name); }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 100,
                background: '#242424',
                border: '1px solid #212020',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)' }}
              >
                thumb_down
              </span>
            </button>
          )}

          {/* Like — white bg when liked, with spark burst behind */}
          <div style={{ position: 'relative' }}>
            {/* Spark particles behind the button */}
            {isSparking && SPARKS.map((spark, si) => (
              <div
                key={si}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: spark.size,
                  height: spark.size,
                  marginLeft: -spark.size / 2,
                  marginTop: -spark.size / 2,
                  borderRadius: '50%',
                  background: si % 3 === 0 ? '#FFD700' : si % 3 === 1 ? '#fff' : '#FFA500',
                  opacity: 0,
                  pointerEvents: 'none',
                  zIndex: 0,
                  animation: `sparkBurst ${spark.duration}ms cubic-bezier(0.2, 0, 0.0, 1) ${spark.delay}ms forwards`,
                  '--spark-tx': `${spark.tx}px`,
                  '--spark-ty': `${spark.ty}px`,
                } as React.CSSProperties}
              />
            ))}

            <button
              onClick={(e) => { e.stopPropagation(); onLike(product.name); }}
              style={{
                position: 'relative',
                zIndex: 1,
                width: 44,
                height: 44,
                borderRadius: 100,
                background: isLiked ? '#fff' : '#242424',
                border: `1px solid ${isLiked ? '#fff' : '#212020'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'background 200ms ease, border-color 200ms ease, transform 150ms ease',
                transform: isSparking ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: 20,
                  color: isLiked ? '#121212' : 'rgba(255,255,255,0.5)',
                  transition: 'color 200ms ease',
                }}
              >
                thumb_up
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── "All caught up" badge with scroll-triggered animation ───────────────────
function CaughtUpBadge() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 0 8px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.9)',
        transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: '#1e1e1e',
          borderRadius: 100,
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 18, color: '#999' }}
        >
          check
        </span>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#999' }}>
          You're all caught up!
        </span>
      </div>
    </div>
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
  // Use ref to always have latest likedProducts — prevents stale closure bugs
  const likedRef = useRef(likedProducts);
  useEffect(() => { likedRef.current = likedProducts; }, [likedProducts]);

  const onLikedChangeRef = useRef(onLikedChange);
  useEffect(() => { onLikedChangeRef.current = onLikedChange; }, [onLikedChange]);

  const allProducts = useMemo(() => {
    // 1. Filter by selected categories
    let filtered = selectedInterests.length > 0
      ? PRODUCTS.filter((p) => selectedInterests.includes(p.category))
      : PRODUCTS;

    // 2. Filter by gender
    if (gender === 'male' || gender === 'female') {
      const genderFiltered = filtered.filter((p) => !p.gender || p.gender === 'unisex' || p.gender === gender);
      if (genderFiltered.length > 0) filtered = genderFiltered;
    }

    // 3. Filter by subcategories per category
    // If user selected specific subcategories for a category, only show those.
    // If user skipped (empty array), show all products from that category.
    const hasAnySubSelections = Object.values(subcategoriesByCategory).some(subs => subs.length > 0);
    if (hasAnySubSelections) {
      const subFiltered = filtered.filter((p) => {
        const subs = subcategoriesByCategory[p.category];
        // No subcategory selections for this category → show all its products
        if (!subs || subs.length === 0) return true;
        // Has selections → only show matching subcategories
        return p.subcategory ? subs.includes(p.subcategory) : true;
      });
      if (subFiltered.length > 0) filtered = subFiltered;
    }

    return shuffle(filtered);
  }, [selectedInterests, subcategoriesByCategory, gender]);

  const [dismissedProducts, setDismissedProducts] = useState<Set<string>>(new Set());
  const [dismissingProduct, setDismissingProduct] = useState<string | null>(null);
  const [sparkingProduct, setSparkingProduct] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<{ product: Product; label: string; sourceRect: DOMRect } | null>(null);
  const [viewExpanded, setViewExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map subcategory IDs → labels for card display (across all selected categories)
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

  // Header — category name
  const activeCategory = selectedInterests.length === 1
    ? (categoryConfigs[selectedInterests[0]]?.name || selectedInterests[0])
    : selectedInterests.length > 1
      ? `${selectedInterests.length} categories`
      : 'All';

  // Stable callbacks — read from ref, never stale
  const handleLike = useCallback((productName: string) => {
    const current = likedRef.current;
    const alreadyLiked = current.includes(productName);
    if (alreadyLiked) {
      // Unlike — just remove from liked
      onLikedChangeRef.current(current.filter(n => n !== productName));
    } else {
      // Like — add to liked, play sparks, then dismiss card
      onLikedChangeRef.current([...current, productName]);
      setSparkingProduct(productName);
      setTimeout(() => {
        setSparkingProduct(null);
        setDismissingProduct(productName);
        setTimeout(() => {
          setDismissedProducts(prev => new Set(prev).add(productName));
          setDismissingProduct(null);
        }, 350);
      }, 500);
    }
  }, []); // no deps — reads from refs

  const handleDislike = useCallback((productName: string) => {
    setDismissingProduct(productName);
    // Also remove from liked if it was liked
    const current = likedRef.current;
    if (current.includes(productName)) {
      onLikedChangeRef.current(current.filter(n => n !== productName));
    }
    setTimeout(() => {
      setDismissedProducts(prev => new Set(prev).add(productName));
      setDismissingProduct(null);
    }, 400);
  }, []); // no deps — reads from refs

  const handleOpenView = useCallback((product: Product, label: string, rect: DOMRect) => {
    setViewProduct({ product, label, sourceRect: rect });
    setViewExpanded(false);
    onOverlayChange?.(true);
    // Trigger expansion on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setViewExpanded(true));
    });
  }, [onOverlayChange]);

  const handleCloseView = useCallback(() => {
    setViewProduct(null);
    setViewExpanded(false);
    onOverlayChange?.(false);
  }, [onOverlayChange]);

  const visibleProducts = allProducts.filter(p => !dismissedProducts.has(p.name));

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
        style={{
          flex: 1,
          overflow: 'auto',
          paddingTop: safeTop(100),
          paddingBottom: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '0 16px', marginBottom: 24 }}>
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
              marginBottom: 8,
              animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 40ms both',
            }}
          >
            Like what catches your eye
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
            The more you like, the better your recommendations
          </p>
        </div>

        {/* Product cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '0 16px',
            paddingBottom: 24,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
          }}
        >
          {visibleProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: '#666' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 48, opacity: 0.3, display: 'block', marginBottom: 12 }}>inventory_2</span>
              <p style={{ fontSize: 15, margin: 0 }}>No products available for this selection yet</p>
            </div>
          )}
          {visibleProducts.map((product) => {
            const catName = categoryConfigs[product.category]?.name || product.category;
            // Prefer subcategory label; fall back to category name if no subcategory
            const cardLabel = product.subcategory
              ? (subLabelMap[product.subcategory] || product.subcategory)
              : catName;
            const cardLabelNode = cardLabel;
            return (
              <ProductCard
                key={product.image}
                product={product}
                label={cardLabel}
                labelNode={cardLabelNode}
                isLiked={likedProducts.includes(product.name)}
                isSparking={sparkingProduct === product.name}
                isDismissing={dismissingProduct === product.name}
                onLike={handleLike}
                onDislike={handleDislike}
                onView={(p, rect) => handleOpenView(p, cardLabel, rect)}
              />
            );
          })}

          {/* "All caught up" badge — animates in when scrolled into view */}
          {allProducts.length > 0 && (
            <CaughtUpBadge />
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div
        style={{
          flexShrink: 0,
          background: '#0d0d0d',
          padding: `12px 18px calc(28px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: '#999',
            textAlign: 'center',
            lineHeight: '20px',
            margin: 0,
            padding: '4px 0 12px',
          }}
        >
          Like at least 10 items to improve your results
        </p>

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

      {/* Product detail view — premium layered transition */}
      {viewProduct && (() => {
        const exp = viewExpanded;
        const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';

        return (
          <>
            {/* Layer 1: Background — fades in immediately */}
            <div
              onClick={handleCloseView}
              style={{
                position: 'absolute', inset: 0, zIndex: 200,
                background: 'linear-gradient(-37deg, #0c0c0c 17%, #111111 79%)',
                opacity: exp ? 1 : 0,
                transition: `opacity 300ms ${ease}`,
              }}
            />

            {/* Full modal layout — flexbox so image never pushes content off screen */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 202,
              display: 'flex', flexDirection: 'column',
              padding: '60px 24px 0',
              pointerEvents: exp ? 'auto' : 'none',
            }}>
              {/* Close X */}
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

              {/* Scrollable content: image + text grouped together */}
              <div style={{
                flex: '1 1 auto', minHeight: 0, overflow: 'auto',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Image */}
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

                {/* Info — directly below image */}
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

                {/* Description */}
                <p style={{
                  flexShrink: 0, fontSize: 14, fontWeight: 400, color: '#dedfe1', opacity: exp ? 0.8 : 0,
                  textAlign: 'center', lineHeight: '20px', margin: '12px auto 0', padding: '0 8px', maxWidth: 343,
                  transform: exp ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 300ms ${ease} 350ms, transform 300ms ${ease} 350ms`,
                }}>
                  {viewProduct.product.description}
                </p>
              </div>

              {/* Close button — appears at 400ms */}
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
