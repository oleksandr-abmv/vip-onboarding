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

      {/* Content - positioned at bottom. 16px page margins; the logo/title/
          subtitle group and the actions group each use a 12px rhythm, with
          16px between the two groups (matches the Figma Auth frame). */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 16px',
          paddingBottom: `calc(32px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        {/* Logo + title + subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            marginBottom: 16,
          }}
        >
          {/* VIP Logo */}
          <img
            src="/vip-logo.svg"
            alt="VIP"
            style={{
              width: 41,
              height: 41,
              animation: 'fadeIn 600ms cubic-bezier(0.25, 0.1, 0.25, 1) 200ms both',
            }}
          />

          {/* Title */}
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#f7f7f7',
              textAlign: 'center',
              lineHeight: '34px',
              margin: 0,
              animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 300ms both',
            }}
          >
            Discover luxury tailored to you
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#999',
              textAlign: 'center',
              lineHeight: '22px',
              margin: 0,
              animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 350ms both',
            }}
          >
            A curated world of luxury guided by your personal AI concierge.
          </p>
        </div>

        {/* Actions - 12px gap between buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
          }}
        >
          {/* Primary - Create an account or login */}
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
            Create an account or login
          </button>

          {/* Secondary - Continue as a guest */}
          <button
            onClick={onNext}
            style={{
              width: '100%',
              height: 48,
              flexShrink: 0,
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
            Continue as a guest
          </button>
        </div>
      </div>
    </div>
  );
}
