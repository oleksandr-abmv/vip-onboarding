import { safeTop } from '../theme';

interface OnboardingGateScreenProps {
  onStart: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function OnboardingGateScreen({ onStart, onSkip, onClose }: OnboardingGateScreenProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        paddingTop: safeTop(72),
        background: 'transparent',
      }}
    >
      {/* Modal-style floating close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: safeTop(16),
          right: 16,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#2a2a2a',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          zIndex: 10,
          WebkitTapHighlightColor: 'transparent',
          animation: 'fadeIn 300ms ease both',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 2L12 12M12 2L2 12"
            stroke="#f6f6f6"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {/* Centered hero: brand mark + title + subtitle - vertically centered on screen */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* Brand mark - subtle bordered tile with the VIP logo */}
        <div
          role="img"
          aria-label="VIP"
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            border: '1px solid #242424',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        >
          <img
            src="/vip-logo.svg"
            alt=""
            aria-hidden
            style={{ width: 35, height: 35, opacity: 0.85, display: 'block' }}
          />
        </div>

        {/* Title - personalization is the primary message */}
        <h1
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: '#fff',
            lineHeight: '38px',
            margin: 0,
            marginBottom: 14,
            letterSpacing: '-0.4px',
            maxWidth: 320,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          Personalize your experience
        </h1>

        {/* Subtitle - the value */}
        <p
          style={{
            fontSize: 15,
            color: '#a8a8a8',
            lineHeight: '24px',
            margin: 0,
            maxWidth: 320,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 140ms both',
          }}
        >
          A short, guided walkthrough so your concierge learns what matters to you:
          your style, your people, the things you collect.
        </p>
      </div>

      {/* Time-to-complete chip - compact, high-contrast, scannable */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 16,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 200ms both',
        }}
      >
        <div
          role="note"
          aria-label="Six minutes to complete"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid #2a2a2a',
            borderRadius: 100,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#e7e7e7',
              lineHeight: '18px',
            }}
          >
            6 minutes to complete
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flexShrink: 0,
          marginBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 260ms both',
        }}
      >
        <button
          type="button"
          onClick={onStart}
          aria-label="Begin personalization"
          style={{
            width: '100%',
            height: 52,
            background: '#f6f6f6',
            color: '#121212',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Continue
        </button>

        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip personalization, finish later"
          style={{
            width: '100%',
            height: 52,
            background: 'transparent',
            color: '#cdcdcd',
            border: 'none',
            borderRadius: 100,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Finish later
        </button>
      </div>
    </div>
  );
}
