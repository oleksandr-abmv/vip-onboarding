import { useState } from 'react';
import { theme, safeTop } from '../theme';
import ProgressBar from '../components/ProgressBar';


interface GenderScreenProps {
  onNext: () => void;
  gender: string | null;
  onGenderChange: (gender: string) => void;
  totalSteps: number;
}

const GENDER_CARDS = [
  { id: 'male', icon: 'male', label: 'Male' },
  { id: 'female', icon: 'female', label: 'Female' },
];

export default function GenderScreen({
  onNext,
  gender,
  onGenderChange,
  totalSteps,
}: GenderScreenProps) {
  const [tapped, setTapped] = useState<string | null>(null);

  const select = (id: string) => {
    setTapped(id);
    setTimeout(() => setTapped(null), 150);
    onGenderChange(id);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing.screenPadding,
        paddingTop: safeTop(68),
        background: 'transparent',
      }}
    >
      <ProgressBar step={1} totalSteps={totalSteps} />

      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          lineHeight: '32px',
          margin: 0,
          marginBottom: 8,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        How do you identify?
      </h1>

      <p
        style={{
          fontSize: 15,
          color: theme.colors.textMuted,
          lineHeight: '22px',
          margin: 0,
          marginBottom: 28,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
        }}
      >
        This helps us personalize your experience.
      </p>

      {/* Gender cards */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
        }}
      >
        {GENDER_CARDS.map((opt) => {
          const selected = gender === opt.id;
          const isTapped = tapped === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => select(opt.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                background: selected ? '#1a1a1a' : theme.colors.surface,
                border: `1.5px solid ${selected ? '#fff' : '#333'}`,
                borderRadius: 16,
                padding: '24px 16px',
                cursor: 'pointer',
                transition: 'background 150ms ease, border-color 150ms ease, transform 150ms',
                transform: isTapped ? 'scale(0.96)' : 'scale(1)',
                boxShadow: selected ? '0 0 16px rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: 32,
                  color: selected ? '#fff' : '#666',
                  transition: 'color 150ms ease',
                }}
              >
                {opt.icon}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: selected ? '#fff' : '#999',
                  lineHeight: '20px',
                  transition: 'color 150ms ease',
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

      {/* Prefer not to say */}
      <button
        onClick={() => select('prefer-not')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 15,
          color: gender === 'prefer-not' ? theme.colors.textPrimary : theme.colors.textTertiary,
          textAlign: 'center',
          padding: '12px 0',
          marginBottom: 12,
          transition: 'color 150ms ease',
          animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 240ms both',
        }}
      >
        Prefer not to say
      </button>

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!gender}
        style={{
          width: '100%',
          height: 52,
          flexShrink: 0,
          marginBottom: `calc(4px + env(safe-area-inset-bottom, 0px))`,
          background: gender ? theme.colors.ctaPrimary : '#252525',
          color: gender ? theme.colors.ctaPrimaryText : theme.colors.textTertiary,
          border: 'none',
          borderRadius: 100,
          fontSize: 17,
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
