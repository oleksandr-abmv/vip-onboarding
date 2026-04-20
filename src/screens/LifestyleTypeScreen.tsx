import { useState, useRef, useCallback, useMemo } from 'react';
import { safeTop } from '../theme';

interface LifestyleTypeScreenProps {
  onNext: () => void;
  lifestyle: string | null; // 'solo' | 'couple' | 'family' | 'prefer-not' | null
  lifestyleType: string | null;
  onLifestyleTypeChange: (type: string) => void;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
  selecting: boolean;
}

type Option = { id: string; icon: string; label: string; subtitle: string };

const SINGLE_COUPLE_OPTIONS: Option[] = [
  { id: 'social-luxe',     icon: 'celebration',      label: 'Social Luxe',        subtitle: 'Trendy hotels, rooftop bars, nightlife, beautiful people' },
  { id: 'classic-refined', icon: 'diamond',          label: 'Classic Refined',    subtitle: 'Five-star luxury, discreet service, old-world elegance' },
  { id: 'private-retreat', icon: 'villa',            label: 'Private Retreat',    subtitle: 'Villas, seclusion, wellness, minimal crowds' },
  { id: 'culture-taste',   icon: 'palette',          label: 'Culture & Taste',    subtitle: 'Art, architecture, opera, chef-driven dining' },
  { id: 'adventure-elite', icon: 'sailing',          label: 'Adventure Elite',    subtitle: 'Yachts, safari, heli-skiing, unusual experiences' },
  { id: 'wellness',        icon: 'spa',              label: 'Wellness & Balance', subtitle: 'Spa, longevity, clean food, calm environments' },
];

const FAMILY_OPTIONS: Option[] = [
  { id: 'family-oriented',     icon: 'family_restroom', label: 'Family-Oriented',     subtitle: 'Broad, balanced experiences for the whole family' },
  { id: 'family-luxury',       icon: 'diamond',         label: 'Family Luxury',       subtitle: 'Elevated, premium stays and private service' },
  { id: 'multi-generational',  icon: 'groups',          label: 'Multi-Generational',  subtitle: 'Grandparents, parents and kids together' },
  { id: 'kid-friendly',        icon: 'child_care',      label: 'Kid-Friendly',        subtitle: 'Practical, playful, kid-first itineraries' },
  { id: 'family-retreat',      icon: 'villa',           label: 'Family Retreat',      subtitle: 'Resort-style escapes, space and privacy' },
];

export default function LifestyleTypeScreen({
  onNext,
  lifestyle,
  lifestyleType,
  onLifestyleTypeChange,
}: LifestyleTypeScreenProps) {
  const [ripples, setRipples] = useState<Record<string, Ripple>>({});
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const options = useMemo<Option[]>(
    () => (lifestyle === 'family' ? FAMILY_OPTIONS : SINGLE_COUPLE_OPTIONS),
    [lifestyle],
  );

  const select = useCallback((e: React.MouseEvent, id: string) => {
    const card = cardRefs.current[id];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const willSelect = lifestyleType !== id;

    setRipples(prev => ({ ...prev, [id]: { id, x, y, selecting: willSelect } }));
    onLifestyleTypeChange(id);

    setTimeout(() => {
      setRipples(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 500);
  }, [lifestyleType, onLifestyleTypeChange]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 16px',
        paddingTop: safeTop(100),
        background: 'transparent',
      }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#fff',
          lineHeight: '26px',
          margin: 0,
          marginBottom: 8,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        What's your lifestyle type?
      </h1>

      <p
        style={{
          fontSize: 14,
          color: '#999',
          lineHeight: '20px',
          margin: 0,
          marginBottom: 20,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
        }}
      >
        Pick the vibe that fits you best
      </p>

      {/* Scrollable card stack */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingBottom: 8,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {options.map((opt) => {
          const selected = lifestyleType === opt.id;
          const ripple = ripples[opt.id];
          return (
            <button
              key={opt.id}
              ref={(el) => { cardRefs.current[opt.id] = el; }}
              onClick={(e) => select(e, opt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: selected ? '1.5px solid #fff' : '1px solid #282828',
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 300ms ease, background 300ms ease',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
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

              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: 22,
                  fontVariationSettings: "'wght' 300",
                  color: '#fff',
                  opacity: selected ? 0.7 : 0.3,
                  transition: 'opacity 300ms ease',
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0,
                }}
              >
                {opt.icon}
              </span>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'left', flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#fff',
                    lineHeight: '20px',
                    display: 'block',
                  }}
                >
                  {opt.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: '#999',
                    lineHeight: '16px',
                    display: 'block',
                    marginTop: 2,
                  }}
                >
                  {opt.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!lifestyleType}
        style={{
          width: '100%',
          height: 48,
          flexShrink: 0,
          marginTop: 12,
          marginBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
          background: lifestyleType ? '#f6f6f6' : '#252525',
          color: lifestyleType ? '#121212' : '#666',
          border: 'none',
          borderRadius: 100,
          fontSize: 16,
          fontWeight: 500,
          cursor: lifestyleType ? 'pointer' : 'default',
          transition: 'background 200ms ease, color 200ms ease',
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
        }}
      >
        Continue
      </button>
    </div>
  );
}
