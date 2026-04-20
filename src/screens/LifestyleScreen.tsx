import { useState, useRef, useCallback } from 'react';
import { safeTop } from '../theme';

interface LifestyleScreenProps {
  onNext: () => void;
  lifestyle: string | null;
  onLifestyleChange: (lifestyle: string) => void;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
  selecting: boolean;
}

const LIFESTYLE_CARDS = [
  { id: 'solo', icon: 'person', label: 'Single', subtitle: 'Curated just for you' },
  { id: 'couple', icon: 'group', label: 'Couple', subtitle: 'Recommendations for two' },
  { id: 'family', icon: 'family_restroom', label: 'Family', subtitle: 'Something for everyone' },
];

export default function LifestyleScreen({
  onNext,
  lifestyle,
  onLifestyleChange,
}: LifestyleScreenProps) {
  const [ripples, setRipples] = useState<Record<string, Ripple>>({});
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = useCallback((e: React.MouseEvent, id: string) => {
    const card = cardRefs.current[id];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const willSelect = lifestyle !== id;

    setRipples(prev => ({
      ...prev,
      [id]: { id, x, y, selecting: willSelect },
    }));
    onLifestyleChange(id);

    setTimeout(() => {
      setRipples(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 500);
  }, [lifestyle, onLifestyleChange]);

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
        What is your status?
      </h1>

      <p
        style={{
          fontSize: 14,
          color: '#999',
          lineHeight: '20px',
          margin: 0,
          marginBottom: 24,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
        }}
      >
        We use this to personalize your recommendations
      </p>

      {/* Lifestyle cards — horizontal rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
        }}
      >
        {LIFESTYLE_CARDS.map((opt) => {
          const selected = lifestyle === opt.id;
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
                padding: '16px 18px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 300ms ease, background 300ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Ripple effect */}
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
                  fontSize: 24,
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
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'left' }}>
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
                    fontSize: 13,
                    fontWeight: 400,
                    color: '#999',
                    lineHeight: '18px',
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

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* I'd rather not say */}
      <button
        onClick={() => { onLifestyleChange('prefer-not'); onNext(); }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          color: '#f7f7f7',
          textAlign: 'center',
          padding: '12px 0',
          marginBottom: 12,
          animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 240ms both',
        }}
      >
        I'd rather not say
      </button>

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!lifestyle}
        style={{
          width: '100%',
          height: 48,
          flexShrink: 0,
          marginBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
          background: lifestyle ? '#f6f6f6' : '#252525',
          color: lifestyle ? '#121212' : '#666',
          border: 'none',
          borderRadius: 100,
          fontSize: 16,
          fontWeight: 500,
          cursor: lifestyle ? 'pointer' : 'default',
          transition: 'background 200ms ease, color 200ms ease',
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
        }}
      >
        Continue
      </button>
    </div>
  );
}
