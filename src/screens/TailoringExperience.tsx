import { useState, useEffect } from 'react';
import { colors } from '../theme';

export default function TailoringExperience() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 0.5;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: colors.gradient,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ animation: 'fadeInUp 350ms ease-out 80ms both' }}>
          <img src="/vip-logo.svg" alt="VIP" style={{ width: 48, height: 48 }} draggable={false} />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            animation: 'fadeInUp 350ms ease-out 160ms both',
          }}
        >
          <div
            style={{
              width: 200,
              height: 4,
              background: '#232323',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: colors.ivory,
                borderRadius: 3,
                transition: 'width 75ms linear',
              }}
            />
          </div>

          <p
            style={{
              textAlign: 'center',
              color: 'rgba(245, 240, 232, 0.9)',
              fontSize: 15,
              margin: 0,
            }}
          >
            Tailoring experience...
          </p>
        </div>
      </div>
    </div>
  );
}
