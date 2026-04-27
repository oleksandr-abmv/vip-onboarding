import { useEffect, useState, useRef, useCallback } from 'react';
import { theme, safeTop } from '../theme';
import { useDelayedReveal, SkeletonBlock } from '../components/Skeleton';
import { preloadImages } from '../utils/preloadImages';
import { getAllOnboardingImageUrls } from '../utils/categoryImageUrls';


interface InterestsScreenProps {
  onNext: () => void;
  selectedInterests: string[];
  onSelectionsChange: (interests: string[]) => void;
  gender: string | null;
}

type Category = {
  id: string;
  label: string;
  imageFile?: string;
  icon?: string; // Material Symbols Rounded glyph - used as placeholder when no imageFile
};

const CATEGORIES: Category[] = [
  { id: 'Accessories', label: 'Accessories', imageFile: 'accessories.webp' },
  { id: 'Handbags and Leather Goods', label: 'Bags', imageFile: 'bags.webp' },
  { id: 'Vehicles', label: 'Cars', imageFile: 'cars.webp' },
  { id: 'Cigars', label: 'Cigars', imageFile: 'cigars.png' },
  { id: 'Fashion and Apparel', label: 'Clothing', imageFile: 'clothing.webp' },
  { id: 'Collectibles', label: 'Collectibles', imageFile: 'collectibles.png' },
  { id: 'Fine Art', label: 'Fine Art', imageFile: 'fineart.webp' },
  { id: 'Furniture', label: 'Furniture', imageFile: 'furniture.webp' },
  { id: 'Jewellery', label: 'Jewelry', imageFile: 'jewelry.png' },
  { id: 'Footwear', label: 'Shoes', imageFile: 'shoes.webp' },
  { id: 'Watches', label: 'Watches', imageFile: 'watches.webp' },
  { id: 'Wine & Spirits', label: 'Wine & Spirits', imageFile: 'wine-spirits.png' },
  { id: 'Yachts & Boats', label: 'Yachts & Boats', imageFile: 'yachts.png' },
];

interface Ripple {
  id: string;
  x: number;
  y: number;
  selecting: boolean;
}

export default function InterestsScreen({
  onNext,
  selectedInterests,
  onSelectionsChange,
  gender,
}: InterestsScreenProps) {
  const genderFolder = gender === 'female' ? 'women' : 'men';
  const [ripples, setRipples] = useState<Record<string, Ripple>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Skeleton → real-content reveal so the screen reads as actively loading.
  const ready = useDelayedReveal(380);
  // Warm the cache for every onboarding tile image while the user reads this
  // screen, so subsequent screens (Subcategory, etc.) render images instantly.
  useEffect(() => {
    preloadImages(getAllOnboardingImageUrls(gender));
  }, [gender]);
  // "Load more" placeholder — simulates LLM-backed category expansion.
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreTimeoutRef = useRef<number | null>(null);
  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    setLoadingMore(true);
    loadMoreTimeoutRef.current = window.setTimeout(() => {
      setLoadingMore(false);
    }, 2200);
  }, [loadingMore]);

  const handleClick = useCallback((e: React.MouseEvent, catId: string) => {
    const card = cardRefs.current[catId];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const isSelected = selectedInterests.includes(catId);
    const willSelect = !isSelected;

    setRipples(prev => ({
      ...prev,
      [catId]: { id: catId, x, y, selecting: willSelect },
    }));

    if (isSelected) {
      onSelectionsChange(selectedInterests.filter((i) => i !== catId));
    } else if (selectedInterests.length < 5) {
      onSelectionsChange([...selectedInterests, catId]);
    }

    setTimeout(() => {
      setRipples(prev => {
        const next = { ...prev };
        delete next[catId];
        return next;
      });
    }, 500);
  }, [selectedInterests, onSelectionsChange]);

  const count = selectedInterests.length;

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
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          paddingTop: safeTop(100),
          paddingBottom: 0,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#fff',
            lineHeight: '26px',
            margin: 0,
            marginBottom: 8,
            padding: `0 16px`,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          Choose what interests you
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#999',
            margin: 0,
            marginBottom: 20,
            lineHeight: '20px',
            padding: `0 14px`,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
          }}
        >
          Select 3 to 5 categories
        </p>

        {/* 2-column category grid (skeleton → real cards) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 16px',
            paddingBottom: 24,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 240ms both',
          }}
        >
          {!ready && CATEGORIES.map((cat) => (
            <div
              key={`sk-${cat.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid #282828',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <SkeletonBlock height={123} radius={6} />
              <SkeletonBlock width="60%" height={16} radius={4} />
            </div>
          ))}
          {ready && CATEGORIES.map((cat) => {
            const selected = selectedInterests.includes(cat.id);
            const ripple = ripples[cat.id];
            return (
              <button
                key={cat.id}
                ref={(el) => { cardRefs.current[cat.id] = el as HTMLDivElement | null; }}
                onClick={(e) => handleClick(e, cat.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  background: selected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: selected ? '1.5px solid #fff' : '1px solid #282828',
                  borderRadius: 12,
                  padding: 16,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 300ms ease, background 300ms ease',
                }}
              >
                {/* Ripple effect - covers entire card */}
                {ripple && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      zIndex: 2,
                      overflow: 'hidden',
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: `${ripple.x}%`,
                        top: `${ripple.y}%`,
                        width: '300%',
                        height: '300%',
                        marginLeft: '-150%',
                        marginTop: '-150%',
                        borderRadius: '50%',
                        background: ripple.selecting
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(0,0,0,0.3)',
                        animation: 'rippleExpand 500ms cubic-bezier(0.2, 0, 0.0, 1) forwards',
                      }}
                    />
                  </div>
                )}

                {/* Image area */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '164 / 123',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cat.imageFile ? (
                    <img
                      src={`/images/categories/${genderFolder}/${cat.imageFile}`}
                      alt={cat.label}
                      decoding="async"
                      loading="eager"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : (
                    /* Uniform placeholder - VIP logotype for categories without imagery yet */
                    <img
                      src="/vip-logo.svg"
                      alt=""
                      aria-hidden
                      style={{
                        width: 48,
                        height: 48,
                        opacity: 0.35,
                        display: 'block',
                      }}
                    />
                  )}
                </div>

                {/* Checkmark - positioned on the card, over the image top-right */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: selected ? '#fff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 300ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease',
                    opacity: selected ? 1 : 0,
                    transform: selected ? 'scale(1)' : 'scale(0.5)',
                    zIndex: 3,
                  }}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: 18, color: '#0A0A0A' }}
                  >
                    check
                  </span>
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#fff',
                    lineHeight: '22px',
                    textAlign: 'left',
                    width: '100%',
                    wordBreak: 'break-word',
                  }}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}

        </div>

        {/* "Load more" — centered link-style button after the grid. Placeholder
            for future LLM-suggested categories. */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '4px 16px 24px',
          }}
        >
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              padding: '10px 14px',
              cursor: loadingMore ? 'default' : 'pointer',
              color: '#cdcdcd',
              fontSize: 14,
              fontWeight: 500,
              WebkitTapHighlightColor: 'transparent',
              transition: 'opacity 200ms ease',
              opacity: loadingMore ? 0.75 : 1,
            }}
          >
            {loadingMore && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                  animation: 'spin 900ms linear infinite',
                }}
                aria-hidden
              />
            )}
            <span>{loadingMore ? 'Finding more…' : 'Load more'}</span>
          </button>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div
        style={{
          flexShrink: 0,
          background: '#0d0d0d',
          padding: `12px 16px calc(28px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        {/* Shield-check privacy note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 0',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 20, color: '#fff', opacity: 0.7 }}
          >
            verified_user
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: '#999',
              textAlign: 'center',
            }}
          >
            Private to you. Easy to update anytime.
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onNext}
          disabled={count < 3}
          style={{
            width: '100%',
            height: 48,
            marginBottom: 8,
            background: count >= 3 ? '#f6f6f6' : '#252525',
            color: count >= 3 ? '#121212' : theme.colors.textTertiary,
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: count >= 3 ? 'pointer' : 'default',
            transition: 'background 200ms ease, color 200ms ease',
          }}
        >
          {count < 3
            ? `Select ${3 - count} more`
            : `Continue with ${count} categories`
          }
        </button>
      </div>
    </div>
  );
}
