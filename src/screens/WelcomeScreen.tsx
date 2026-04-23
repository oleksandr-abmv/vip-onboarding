interface WelcomeScreenProps {
  onNext: () => void;
}

// 3 rows of 4 unique images - no duplicates across rows
const ROW1 = ['/images/welcome/1.jpg', '/images/welcome/2.jpg', '/images/welcome/3.jpg', '/images/welcome/4.jpg'];
const ROW2 = ['/images/welcome/5.jpg', '/images/welcome/6.jpg', '/images/welcome/7.jpg', '/images/welcome/8.jpg'];
const ROW3 = ['/images/welcome/9.jpg', '/images/welcome/10.jpg', '/images/welcome/11.jpg', '/images/welcome/12.jpg'];

const CARD_W = 125;
const CARD_H = 130;
const GAP = 1;
const ROW_SPEEDS = [32, 38, 28]; // seconds per full cycle
const ROW_DIRS: ('left' | 'right')[] = ['left', 'right', 'left'];

function MarqueeRow({ images, speed, direction }: { images: string[]; speed: number; direction: 'left' | 'right' }) {
  // Double the images for seamless loop
  const doubled = [...images, ...images];
  const animName = direction === 'left' ? 'marqueeLeft' : 'marqueeRight';

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: GAP,
          width: 'max-content',
          animation: `${animName} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            style={{
              width: CARD_W,
              height: CARD_H,
              flexShrink: 0,
              overflow: 'hidden',
              background: '#202020',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width: '85%',
                height: '85%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const ROWS = [ROW1, ROW2, ROW3];

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(-36deg, #0c0c0c 17%, #111111 79%)',
      }}
    >
      {/* Marquee rows */}
      <div
        style={{
          position: 'absolute',
          top: -9,
          left: -40,
          right: -40,
          display: 'flex',
          flexDirection: 'column',
          gap: GAP,
          animation: 'fadeIn 1000ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        {ROWS.map((images, i) => (
          <MarqueeRow key={i} images={images} speed={ROW_SPEEDS[i]} direction={ROW_DIRS[i]} />
        ))}
      </div>

      {/* Gradient overlay - fades grid to dark */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -108,
          right: -108,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(15,15,15,0) 10%, rgba(15,15,15,0.5) 30%, rgba(15,15,15,0.95) 48%, #0f0f0f 55%)',
          zIndex: 1,
        }}
      />

      {/* Content - positioned at bottom */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 23px',
          paddingBottom: `calc(32px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        {/* VIP Logo */}
        <img
          src="/vip-logo.svg"
          alt="VIP"
          style={{
            width: 41,
            height: 41,
            marginBottom: 16,
            animation: 'fadeIn 600ms cubic-bezier(0.25, 0.1, 0.25, 1) 200ms both',
          }}
        />

        {/* Title */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#f7f7f7',
            textAlign: 'center',
            lineHeight: '28px',
            margin: 0,
            marginBottom: 14,
            letterSpacing: '-0.3px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 300ms both',
          }}
        >
          Discover luxury, tailored to you
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            fontWeight: 400,
            color: '#999',
            textAlign: 'center',
            lineHeight: '22px',
            margin: 0,
            marginBottom: 16,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 350ms both',
          }}
        >
          A curated world of luxury guided by your personal AI concierge
        </p>

        {/* Create an account CTA (primary - white) */}
        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: 48,
            flexShrink: 0,
            background: '#fbfafe',
            color: '#121212',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 400ms both',
          }}
        >
          Create an account
        </button>

        {/* Login with email (secondary - transparent) */}
        <button
          onClick={onNext}
          style={{
            width: '100%',
            height: 48,
            flexShrink: 0,
            marginTop: 16,
            background: 'rgba(246,246,246,0.1)',
            color: '#f6f6f6',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 450ms both',
          }}
        >
          Login with email
        </button>

        {/* Or divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: 8,
            margin: '24px 0',
            animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 500ms both',
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontSize: 15, fontWeight: 500, color: '#dedfe1' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Social login row */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 550ms both',
          }}
        >
          {/* Google */}
          <button
            onClick={() => {}}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>

          {/* X (Twitter) */}
          <button
            onClick={() => {}}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>

          {/* Telegram */}
          <button
            onClick={() => {}}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
