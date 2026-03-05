import { useState } from 'react';
import ScreenLayout from '../components/ScreenLayout';

interface Props {
  onNext: () => void;
}

export default function GenderSelection({ onNext }: Props) {
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  return (
    <ScreenLayout>
      {/* Heading at y=119, x=16 */}
      <h1
        style={{
          position: 'absolute',
          top: 119,
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
        Select Gender
      </h1>

      {/* Description at y=159 */}
      <p
        style={{
          position: 'absolute',
          top: 159,
          left: 16,
          right: 16,
          color: '#dedfe1',
          fontSize: 14,
          lineHeight: '20px',
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 160ms both',
        }}
      >
        Help us refine your initial recommendations. Your preferences remain
        private.
      </p>

      {/* Gender Cards at y=225, h=142, gap=12 */}
      <div
        style={{
          position: 'absolute',
          top: 225,
          left: 16,
          right: 16,
          display: 'flex',
          gap: 12,
        }}
      >
        <button
          onClick={() => setSelected('male')}
          style={{
            flex: 1,
            height: 142,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: 16,
            background: '#2a2a2a',
            border:
              selected === 'male'
                ? '2px solid #f0f0f0'
                : '2px solid #494949',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            animation: 'fadeInUp 350ms ease-out 240ms both',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 34, color: '#f6f6f6', opacity: 0.4 }}
          >
            male
          </span>
          <span
            style={{
              fontSize: 17,
              fontWeight: 500,
              color: '#f7f7f7',
              textAlign: 'left',
            }}
          >
            Male
          </span>
        </button>

        <button
          onClick={() => setSelected('female')}
          style={{
            flex: 1,
            height: 142,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: 16,
            background: '#2a2a2a',
            border:
              selected === 'female'
                ? '2px solid #f0f0f0'
                : '2px solid #494949',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            animation: 'fadeInUp 350ms ease-out 300ms both',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 34, color: '#f6f6f6', opacity: 0.4 }}
          >
            female
          </span>
          <span
            style={{
              fontSize: 17,
              fontWeight: 500,
              color: '#f7f7f7',
              textAlign: 'left',
            }}
          >
            Female
          </span>
        </button>
      </div>

      {/* "I'd rather not to say" at y=653, centered */}
      <button
        onClick={onNext}
        style={{
          position: 'absolute',
          top: 653,
          left: 0,
          right: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          color: '#f7f7f7',
          textAlign: 'center',
          padding: 0,
          animation: 'fadeInUp 350ms ease-out 380ms both',
        }}
      >
        I'd rather not to say
      </button>

      {/* Continue button at y=696, h=48 */}
      <button
        onClick={onNext}
        style={{
          position: 'absolute',
          top: 696,
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
          animation: 'fadeInUp 350ms ease-out 460ms both',
        }}
      >
        Continue
      </button>
    </ScreenLayout>
  );
}
