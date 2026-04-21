import { useState, useRef, useCallback } from 'react';
import { safeTop } from '../theme';
import { categoryConfigs, getSubcategoryImagePath, getSubcategories } from '../data/categoryConfig';


interface SubcategoryScreenProps {
  onNext: () => void;
  onSkip: () => void;
  categoryId: string;
  selectedSubcategories: string[];
  onSelectionsChange: (subs: string[]) => void;
  gender: string | null;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
  selecting: boolean;
}

export default function SubcategoryScreen({
  onNext,
  onSkip,
  categoryId,
  selectedSubcategories,
  onSelectionsChange,
  gender,
}: SubcategoryScreenProps) {
  const [ripples, setRipples] = useState<Record<string, Ripple>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleClick = useCallback((e: React.MouseEvent, subId: string) => {
    const card = cardRefs.current[subId];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const isSelected = selectedSubcategories.includes(subId);
    const willSelect = !isSelected;

    setRipples(prev => ({
      ...prev,
      [subId]: { id: subId, x, y, selecting: willSelect },
    }));

    if (isSelected) {
      onSelectionsChange(selectedSubcategories.filter((i) => i !== subId));
    } else {
      onSelectionsChange([...selectedSubcategories, subId]);
    }

    setTimeout(() => {
      setRipples(prev => {
        const next = { ...prev };
        delete next[subId];
        return next;
      });
    }, 500);
  }, [selectedSubcategories, onSelectionsChange]);

  // Guard against missing config — must be AFTER all hooks (rules-of-hooks)
  const config = categoryConfigs[categoryId];
  if (!config) return null;

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
        {/* Category label */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#999',
            textTransform: 'uppercase',
            lineHeight: '18px',
            margin: 0,
            marginBottom: 4,
            padding: '0 15px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        >
          {config.name}
        </p>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#fff',
            lineHeight: '26px',
            margin: 0,
            marginBottom: 8,
            padding: '0 16px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 40ms both',
          }}
        >
          {config.title}
        </h1>

        <p
          style={{
            fontSize: 14,
            color: '#999',
            margin: 0,
            marginBottom: 20,
            lineHeight: '20px',
            padding: '0 15px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          {config.description}
        </p>

        {/* 2-column subcategory grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 16px',
            paddingBottom: 24,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
          }}
        >
          {getSubcategories(config, gender).map((sub) => {
            const selected = selectedSubcategories.includes(sub.id);
            const ripple = ripples[sub.id];
            return (
              <button
                key={sub.id}
                ref={(el) => { cardRefs.current[sub.id] = el as HTMLDivElement | null; }}
                onClick={(e) => handleClick(e, sub.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  background: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
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
                    aspectRatio: '164 / 154',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sub.image ? (
                    <img
                      src={getSubcategoryImagePath(config, sub.image, gender)}
                      alt={sub.label}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : (
                    /* Uniform placeholder - VIP logotype when no subcategory image is provided yet */
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

                {/* Checkmark - positioned on card */}
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

                {/* Label + subtitle */}
                <div style={{ textAlign: 'left', width: '100%' }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: '22px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {sub.label}
                  </span>
                  {sub.subtitle && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: '#999',
                        lineHeight: '18px',
                        marginTop: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {sub.subtitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom bar - Skip / Continue */}
      <div
        style={{
          flexShrink: 0,
          background: '#0d0d0d',
          padding: `20px 24px calc(28px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Skip */}
          <button
            onClick={onSkip}
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

          {/* Continue */}
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
    </div>
  );
}
