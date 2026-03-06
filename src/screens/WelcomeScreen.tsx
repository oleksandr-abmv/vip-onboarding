import { useRef, useCallback } from 'react';


interface WelcomeScreenProps {
  onNext: () => void;
}

const VIDEO_PARTS = ['/Part_1.mp4', '/Part_2.mp4', '/Part_3.mp4'];

const BENEFITS = [
  { icon: 'auto_awesome', text: 'AI-powered luxury curation' },
  { icon: 'verified', text: 'Authenticated & vetted sellers' },
  { icon: 'lock', text: 'Private, invitation-only access' },
];

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const partIndex = useRef(0);

  const handleEnded = useCallback(() => {
    partIndex.current = (partIndex.current + 1) % VIDEO_PARTS.length;
    const video = videoRef.current;
    if (video) {
      video.src = VIDEO_PARTS[partIndex.current];
      video.play();
    }
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background video — plays Part 1 → 2 → 3, then loops */}
      <video
        ref={videoRef}
        src={VIDEO_PARTS[0]}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Dark overlay for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 32px',
          paddingBottom: 18,
          flex: 1,
          width: '100%',
        }}
      >
        {/* Spacer top */}
        <div style={{ flex: 1 }} />

        {/* Logo */}
        <img
          src="/vip-logo.svg"
          alt="VIP"
          style={{
            width: 64,
            height: 64,
            marginBottom: 32,
            animation: 'fadeIn 600ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        />

        {/* Title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            lineHeight: '36px',
            margin: 0,
            marginBottom: 10,
            letterSpacing: '-0.3px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 200ms both',
          }}
        >
          Your luxury world,{' '}
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>curated</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            lineHeight: '22px',
            margin: 0,
            marginBottom: 40,
            maxWidth: 290,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 300ms both',
          }}
        >
          Tell us what you love. We'll build your personal luxury profile in under 2 minutes.
        </p>

        {/* Benefits */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%',
            maxWidth: 300,
          }}
        >
          {BENEFITS.map((benefit, i) => (
            <div
              key={benefit.icon}
              style={{
                animation: `fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) ${400 + i * 80}ms both`,
              }}
            >
              {i > 0 && (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 8px',
                }}
              >
                <span
                  className="material-symbols-rounded"
                  style={{
                    fontSize: 22,
                    color: 'rgba(255,255,255,0.9)',
                    flexShrink: 0,
                  }}
                >
                  {benefit.icon}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: '20px',
                    letterSpacing: '0.1px',
                  }}
                >
                  {benefit.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer bottom */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <button
          onClick={onNext}
          style={{
            width: '100%',
            maxWidth: 300,
            height: 52,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.95)',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: 100,
            fontSize: 17,
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 640ms both',
          }}
        >
          Discover my style
        </button>

        {/* Terms */}
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            lineHeight: '16px',
            margin: 0,
            marginTop: 14,
            flexShrink: 0,
            marginBottom: `env(safe-area-inset-bottom, 0px)`,
            animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 800ms both',
          }}
        >
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
