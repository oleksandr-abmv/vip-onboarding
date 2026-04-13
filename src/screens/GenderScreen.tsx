import { useState, useRef, useCallback } from 'react';
import { theme, safeTop } from '../theme';


interface GenderScreenProps {
  onNext: () => void;
  gender: string | null;
  onGenderChange: (gender: string) => void;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
  selecting: boolean;
}

const GENDER_CARDS = [
  { id: 'male', icon: 'male', label: 'Male' },
  { id: 'female', icon: 'female', label: 'Female' },
];

export default function GenderScreen({
  onNext,
  gender,
  onGenderChange,
}: GenderScreenProps) {
  const [ripples, setRipples] = useState<Record<string, Ripple>>({});
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = useCallback((e: React.MouseEvent, id: string) => {
    const card = cardRefs.current[id];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const willSelect = gender !== id;

    setRipples(prev => ({
      ...prev,
      [id]: { id, x, y, selecting: willSelect },
    }));
    onGenderChange(id);

    setTimeout(() => {
      setRipples(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 500);
  }, [gender, onGenderChange]);

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
        Who is this for?
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

      {/* Gender cards — Figma layout: icon top-left, label bottom-left */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
        }}
      >
        {GENDER_CARDS.map((opt) => {
          const selected = gender === opt.id;
          const ripple = ripples[opt.id];
          return (
            <button
              key={opt.id}
              ref={(el) => { cardRefs.current[opt.id] = el; }}
              onClick={(e) => select(e, opt.id)}
              style={{
                flex: 1,
                height: 109,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                background: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: selected ? '1.5px solid #fff' : '1px solid #282828',
                borderRadius: 12,
                padding: 16,
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
                  fontSize: 28,
                  fontVariationSettings: "'wght' 300",
                  color: '#fff',
                  opacity: selected ? 0.6 : 0.2,
                  transition: 'opacity 300ms ease',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {opt.icon}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  lineHeight: '22px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!gender}
        style={{
          width: '100%',
          height: 48,
          flexShrink: 0,
          marginBottom: `calc(28px + env(safe-area-inset-bottom, 0px))`,
          background: gender ? '#f6f6f6' : '#252525',
          color: gender ? '#121212' : theme.colors.textTertiary,
          border: 'none',
          borderRadius: 100,
          fontSize: 16,
          fontWeight: 500,
          cursor: gender ? 'pointer' : 'default',
          transition: 'background 200ms ease, color 200ms ease',
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
        }}
      >
        Continue
      </button>
    </div>
  );
}
