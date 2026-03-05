import { useState } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import { colors, safeTop, safeBottom } from '../theme';

interface Props {
  onNext: () => void;
}

const GENDERS = [
  { value: 'male', label: 'Male', icon: 'male' },
  { value: 'female', label: 'Female', icon: 'female' },
] as const;

type Gender = (typeof GENDERS)[number]['value'];

export default function GenderSelection({ onNext }: Props) {
  const [selected, setSelected] = useState<Gender | null>(null);

  return (
    <ScreenLayout>
      <h1
        style={{
          position: 'absolute',
          top: safeTop(72),
          left: 16,
          right: 16,
          color: colors.ivory,
          fontSize: 24,
          fontWeight: 600,
          lineHeight: '28px',
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 80ms both',
        }}
      >
        Select Gender
      </h1>

      <p
        style={{
          position: 'absolute',
          top: safeTop(114),
          left: 16,
          right: 16,
          color: colors.ivoryMuted,
          fontSize: 15,
          lineHeight: '21px',
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 160ms both',
        }}
      >
        Help us refine your initial recommendations. Your preferences remain
        private.
      </p>

      <div
        style={{
          position: 'absolute',
          top: safeTop(178),
          left: 16,
          right: 16,
          display: 'flex',
          gap: 12,
        }}
      >
        {GENDERS.map(({ value, label, icon }, i) => (
          <button
            key={value}
            onClick={() => setSelected(value)}
            style={{
              flex: 1,
              height: 142,
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: 16,
              background: colors.bgCard,
              border: `2px solid ${selected === value ? colors.ivoryDeep : colors.borderPrimary}`,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              animation: `fadeInUp 350ms ease-out ${240 + i * 60}ms both`,
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ fontSize: 27, color: colors.ivory, opacity: 0.4 }}
            >
              {icon}
            </span>
            <span style={{ fontSize: 17, fontWeight: 500, color: colors.ivory }}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        style={{
          position: 'absolute',
          bottom: safeBottom(92),
          left: 0,
          right: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          color: colors.ivory,
          textAlign: 'center',
          padding: 0,
          animation: 'fadeInUp 350ms ease-out 380ms both',
        }}
      >
        I'd rather not to say
      </button>

      <button
        onClick={onNext}
        style={{
          position: 'absolute',
          bottom: safeBottom(24),
          left: 16,
          right: 16,
          height: 48,
          borderRadius: 9999,
          background: colors.ivoryDeep,
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 500,
          color: colors.textDark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeInUp 350ms ease-out 460ms both',
        }}
      >
        Continue
      </button>
    </ScreenLayout>
  );
}
