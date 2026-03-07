import { useRef, useCallback, useState, useEffect } from 'react';


interface WelcomeScreenProps {
  onNext: () => void;
}

const VIDEO_PARTS = ['/Part_1.mp4', '/Part_2.mp4', '/Part_3.mp4'];

const BENEFITS = [
  { icon: 'diamond', text: 'Curated daily feed' },
  { icon: 'auto_awesome', text: 'Personalized AI Concierge' },
  { icon: 'shopping_bag', text: 'Premium products and boutiques nearby' },
];

const ROTATING_WORDS = ['curated', 'personalized', 'tailored'];

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [prevWordIdx, setPrevWordIdx] = useState<number | null>(null);
  const wordKey = useRef(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [wordWidth, setWordWidth] = useState<number | undefined>(undefined);

  // Measure current word width
  useEffect(() => {
    if (measureRef.current) {
      setWordWidth(measureRef.current.offsetWidth);
    }
  }, [wordIdx]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevWordIdx(wordIdx);
      setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
      wordKey.current++;
      // Clear exiting word after animation
      setTimeout(() => setPrevWordIdx(null), 400);
    }, 2500);
    return () => clearInterval(interval);
  }, [wordIdx]);

  const handleEnded = useCallback((idx: number) => {
    const next = (idx + 1) % VIDEO_PARTS.length;
    const nextVideo = videoRefs.current[next];
    if (nextVideo) {
      nextVideo.currentTime = 0;
      nextVideo.play();
    }
    setActiveVideo(next);
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
      {/* Background videos — preloaded, stacked, swap instantly */}
      {VIDEO_PARTS.map((src, i) => (
        <video
          key={src}
          ref={(el) => { videoRefs.current[i] = el; }}
          src={src}
          autoPlay={i === 0}
          muted
          playsInline
          preload="auto"
          onEnded={() => handleEnded(i)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            opacity: activeVideo === i ? 1 : 0,
          }}
        />
      ))}

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
          padding: '0 24px',
          paddingBottom: 16,
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
            width: 56,
            height: 56,
            marginBottom: 20,
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
          Enter the world of
          <br />
          <span
            style={{
              display: 'inline-block',
              position: 'relative',
              overflow: 'hidden',
              verticalAlign: 'bottom',
              height: '1.3em',
              width: wordWidth ?? 'auto',
              transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Hidden measurer for current word */}
            <span
              ref={measureRef}
              aria-hidden
              style={{
                position: 'absolute',
                visibility: 'hidden',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
            {prevWordIdx !== null && (
              <span
                key={`out-${wordKey.current}`}
                style={{
                  display: 'block',
                  position: 'absolute',
                  inset: 0,
                  color: 'rgba(255,255,255,0.7)',
                  animation: 'wordRevealOut 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                }}
              >
                {ROTATING_WORDS[prevWordIdx]}
              </span>
            )}
            <span
              key={`in-${wordKey.current}`}
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.7)',
                animation: prevWordIdx !== null
                  ? 'wordRevealIn 400ms cubic-bezier(0.4, 0, 0.2, 1) both'
                  : undefined,
              }}
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
          </span>{' '}
          luxury
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            lineHeight: '22px',
            margin: 0,
            marginBottom: 24,
            maxWidth: 320,
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
            maxWidth: 340,
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
                  gap: 14,
                  padding: '12px 8px',
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
            maxWidth: 340,
            height: 50,
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
          Get started
        </button>

        {/* Login */}
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            margin: 0,
            marginTop: 14,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 720ms both',
          }}
        >
          Already have an account?{' '}
          <span
            onClick={() => {}}
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Log in
          </span>
        </p>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 340,
            gap: 12,
            marginTop: 16,
            animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 760ms both',
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: 1 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Social login */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 16,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 800ms both',
          }}
        >
          {/* Google */}
          <button
            onClick={() => {}}
            style={{
              width: 48,
              height: 48,
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          {/* Apple */}
          <button
            onClick={() => {}}
            style={{
              width: 48,
              height: 48,
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>
          {/* Facebook */}
          <button
            onClick={() => {}}
            style={{
              width: 48,
              height: 48,
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        {/* Terms */}
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            lineHeight: '16px',
            margin: 0,
            marginTop: 16,
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
