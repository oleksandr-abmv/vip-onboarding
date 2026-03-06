import { useEffect } from 'react';
import { theme } from '../theme';

interface TailoringScreenProps {
  onComplete: () => void;
}

export default function TailoringScreen({ onComplete }: TailoringScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(144deg, #0c0c0c 17%, #111111 79%)',
      }}
    >
      {/* Logo */}
      <img
        src="/vip-logo.svg"
        alt="VIP"
        style={{
          width: 48,
          height: 48,
          marginBottom: 28,
          animation: 'fadeIn 600ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          width: 200,
          height: 4,
          borderRadius: 3,
          background: '#232323',
          overflow: 'hidden',
          marginBottom: 16,
          animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 300ms both',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 3,
            background: theme.colors.textPrimary,
            animation: 'tailoringFill 2.8s cubic-bezier(0.4, 0, 0.2, 1) 400ms forwards',
            width: 0,
          }}
        />
      </div>

      {/* Text */}
      <p
        style={{
          fontSize: 15,
          color: theme.colors.textPrimary,
          textAlign: 'center',
          lineHeight: '20px',
          margin: 0,
          animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 300ms both',
        }}
      >
        Tailoring experience...
      </p>
    </div>
  );
}
