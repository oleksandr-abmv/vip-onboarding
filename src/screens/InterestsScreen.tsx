import { useState } from 'react';
import { theme, safeTop } from '../theme';
import ProgressBar from '../components/ProgressBar';


interface InterestsScreenProps {
  onNext: () => void;
  selectedInterests: string[];
  onSelectionsChange: (interests: string[]) => void;
  totalSteps: number;
}

const CATEGORIES = [
  { id: 'Watches', icon: 'watch', label: 'Watches' },
  { id: 'Jewelry', icon: 'diamond', label: 'Jewelry' },
  { id: 'Fine Wine', icon: 'wine_bar', label: 'Fine Wine' },
  { id: 'Handbags', icon: 'shopping_bag', label: 'Handbags' },
  { id: 'Vehicles', icon: 'directions_car', label: 'Vehicles' },
  { id: 'Fine Art', icon: 'palette', label: 'Fine Art' },
  { id: 'Yachts', icon: 'sailing', label: 'Yachts' },
  { id: 'Sunglasses', icon: 'sunny', label: 'Sunglasses' },
  { id: 'Fashion', icon: 'checkroom', label: 'Fashion' },
  { id: 'Cigars', icon: 'smoking_rooms', label: 'Cigars' },
  { id: 'Private Aviation', icon: 'flight', label: 'Aviation' },
  { id: 'Collectibles', icon: 'emoji_events', label: 'Collectibles' },
];

export default function InterestsScreen({
  onNext,
  selectedInterests,
  onSelectionsChange,
  totalSteps,
}: InterestsScreenProps) {
  const [tapped, setTapped] = useState<string | null>(null);

  const toggle = (id: string) => {
    setTapped(id);
    setTimeout(() => setTapped(null), 150);

    if (selectedInterests.includes(id)) {
      onSelectionsChange(selectedInterests.filter((i) => i !== id));
    } else {
      onSelectionsChange([...selectedInterests, id]);
    }
  };

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
      <ProgressBar step={2} totalSteps={totalSteps} />

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
            fontSize: 24,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            lineHeight: '32px',
            margin: 0,
            marginBottom: 8,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          What catches your eye?
        </h1>
        <p
          style={{
            fontSize: 15,
            color: theme.colors.textMuted,
            margin: 0,
            marginBottom: 24,
            lineHeight: '22px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
          }}
        >
          Pick everything that interests you.
        </p>

        {/* Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            paddingBottom: 10,
            alignContent: 'flex-start',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 240ms both',
          }}
        >
          {CATEGORIES.map((cat) => {
            const selected = selectedInterests.includes(cat.id);
            const isTapped = tapped === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: selected ? '#1a1a1a' : theme.colors.surface,
                  border: `1.5px solid ${selected ? '#fff' : '#333'}`,
                  borderRadius: 24,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease, border-color 150ms ease, transform 150ms',
                  transform: isTapped ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: selected ? '0 0 10px rgba(255,255,255,0.06)' : 'none',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: selected ? '#fff' : '#888', transition: 'color 150ms ease' }}>{cat.icon}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: selected ? '#fff' : '#bbb',
                    lineHeight: '18px',
                    transition: 'color 150ms ease',
                  }}
                >
                  {cat.label}
                </span>
              </button>
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
        {/* Selection count */}
        <p
          style={{
            fontSize: 14,
            color: theme.colors.textTertiary,
            textAlign: 'center',
            margin: 0,
            marginBottom: 10,
            height: 20,
            opacity: count > 0 ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        >
          {count} selected
        </p>

        {/* CTA */}
        <button
          onClick={onNext}
          disabled={count < 1}
          style={{
            width: '100%',
            height: 52,
            marginBottom: 4,
            background: count >= 1 ? theme.colors.ctaPrimary : '#252525',
            color: count >= 1 ? theme.colors.ctaPrimaryText : theme.colors.textTertiary,
            border: 'none',
            borderRadius: 100,
            fontSize: 17,
            fontWeight: 500,
            cursor: count >= 1 ? 'pointer' : 'default',
            transition: 'background 200ms ease, color 200ms ease',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
