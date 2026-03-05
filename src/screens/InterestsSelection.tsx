import { useState } from 'react';
import ScreenLayout from '../components/ScreenLayout';

const INTERESTS = [
  { icon: 'directions_car', label: 'Vehicles' },
  { icon: 'diamond', label: 'Jewelry' },
  { icon: 'watch', label: 'Watches' },
  { icon: 'visibility', label: 'Sunglasses' },
  { icon: 'apparel', label: 'Fashion' },
  { icon: 'brush', label: 'Fine Art' },
  { icon: 'smoking_rooms', label: 'Cigars' },
  { icon: 'local_mall', label: 'Handbags' },
  { icon: 'liquor', label: 'Fine Wine' },
  { icon: 'directions_boat', label: 'Yachts' },
  { icon: 'helicopter', label: 'Private Aviation' },
  { icon: 'inventory_2', label: 'Collectibles' },
];

interface Props {
  onNext: () => void;
  onSelectionsChange: (interests: Set<string>) => void;
}

export default function InterestsSelection({
  onNext,
  onSelectionsChange,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      onSelectionsChange(next);
      return next;
    });
  };

  return (
    <ScreenLayout>
      <h1
        style={{
          position: 'absolute',
          top: `calc(env(safe-area-inset-top, 0px) + 65px)`,
          left: 16,
          right: 16,
          color: 'white',
          fontSize: 24,
          fontWeight: 600,
          lineHeight: '28px',
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 80ms both',
        }}
      >
        Select Interests
      </h1>

      <p
        style={{
          position: 'absolute',
          top: `calc(env(safe-area-inset-top, 0px) + 109px)`,
          left: 16,
          right: 16,
          color: '#dedfe1',
          fontSize: 16,
          lineHeight: '22px',
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 160ms both',
        }}
      >
        Choose the categories that reflect your lifestyle. We'll tailor your
        feed accordingly.
      </p>

      <div
        style={{
          position: 'absolute',
          top: `calc(env(safe-area-inset-top, 0px) + 170px)`,
          left: 16,
          right: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {INTERESTS.map(({ icon, label }, index) => {
          const isSelected = selected.has(label);
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 9999,
                fontSize: 16,
                lineHeight: '22px',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                background: isSelected ? '#f7f7f7' : '#252525',
                color: isSelected ? '#121212' : '#f7f7f7',
                border: isSelected ? '1px solid #f7f7f7' : '1px solid #494949',
                animation: `fadeInUp 350ms ease-out ${240 + index * 40}ms both`,
              }}
            >
              <span
                className="material-symbols-rounded"
                style={{
                  fontSize: 22,
                  lineHeight: '22px',
                  color: isSelected ? '#121212' : 'white',
                }}
              >
                {icon}
              </span>
              <span style={{ lineHeight: '22px' }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={onNext}
        style={{
          position: 'absolute',
          bottom: `calc(68px + env(safe-area-inset-bottom, 0px))`,
          left: 16,
          right: 16,
          height: 48,
          borderRadius: 9999,
          background: '#f6f6f6',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 500,
          color: '#121212',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeInUp 350ms ease-out 750ms both',
        }}
      >
        Continue
      </button>
    </ScreenLayout>
  );
}
