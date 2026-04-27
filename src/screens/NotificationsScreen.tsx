import { safeTop } from '../theme';
import { personalizedNotification } from '../data/notificationTemplates';

interface NotificationsScreenProps {
  onNext: () => void;
  selectedInterests: string[];
  subcategoriesByCategory: Record<string, string[]>;
}

/**
 * End-of-onboarding permission prompt. The hero is a single, prominent
 * VIP notification - centered, editorial. Notification body is personalized
 * from what the user picked on Interests + Subcategory.
 */
export default function NotificationsScreen({
  onNext,
  selectedInterests,
  subcategoriesByCategory,
}: NotificationsScreenProps) {
  const notifBody = personalizedNotification(selectedInterests, subcategoriesByCategory);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        paddingTop: safeTop(100),
        background: 'transparent',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          textAlign: 'center',
        }}
      >
        {/* Hero: illustrated "phone peeking up" scene with a VIP notification
            landing on top. Matches the Swarm reference layout, retuned for our dark theme. */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 340,
            aspectRatio: '340 / 260',
            background: '#1a1a1a',
            borderRadius: 24,
            overflow: 'hidden',
            animation: 'fadeInUp 500ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        >
          {/* Illustrated "phone" - inverted-U bezel anchored to the bottom of the tile */}
          <div
            style={{
              position: 'absolute',
              left: 32,
              right: 32,
              bottom: 0,
              top: 60,
              borderTop: '6px solid #3a3a3a',
              borderLeft: '6px solid #3a3a3a',
              borderRight: '6px solid #3a3a3a',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              background: 'transparent',
              padding: '28px 16px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Two "history" notification rows behind the hero banner */}
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#242424',
                  border: '1px solid #2e2e2e',
                  borderRadius: 12,
                  padding: '10px 12px',
                  opacity: 1 - i * 0.25,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: '#0f0f0f',
                    border: '1px solid #2a2a2a',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src="/vip-logo.svg" alt="" aria-hidden style={{ width: 13, height: 13, opacity: 0.35 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ height: 6, width: '55%', borderRadius: 3, background: '#3a3a3a' }} />
                  <div style={{ height: 6, width: '85%', borderRadius: 3, background: '#303030' }} />
                </div>
                <div
                  style={{
                    width: 18,
                    height: 6,
                    borderRadius: 3,
                    background: '#2a2a2a',
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Foreground VIP notification - overlaps the phone top bezel */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              top: 28,
              background: '#f6f6f6',
              borderRadius: 18,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              textAlign: 'left',
              boxShadow: '0 16px 32px -12px rgba(0,0,0,0.6)',
              animation: 'fadeInUp 500ms cubic-bezier(0.25, 0.1, 0.25, 1) 180ms both',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: '#0f0f0f',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="/vip-logo.svg" alt="" aria-hidden style={{ width: 18, height: 18, opacity: 0.95 }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#111',
                    margin: 0,
                    lineHeight: '16px',
                  }}
                >
                  VIP Concierge
                </p>
                <span style={{ fontSize: 11, color: '#6a6a6a', lineHeight: '14px' }}>now</span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: '#2a2a2a',
                  margin: '2px 0 0',
                  lineHeight: '18px',
                }}
              >
                {notifBody}
              </p>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxWidth: 320,
            animation: 'fadeInUp 500ms cubic-bezier(0.25, 0.1, 0.25, 1) 340ms both',
          }}
        >
          <h1
            style={{
              fontSize: 26,
              fontWeight: 500,
              color: '#fff',
              lineHeight: '32px',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            Get first access
          </h1>
          <p
            style={{
              fontSize: 15,
              color: '#a8a8a8',
              lineHeight: '22px',
              margin: 0,
            }}
          >
            Your concierge will quietly surface new arrivals, waitlist openings and private
            invitations that fit what you like. Nothing else.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
          animation: 'fadeInUp 500ms cubic-bezier(0.25, 0.1, 0.25, 1) 460ms both',
        }}
      >
        <button
          onClick={onNext}
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
          Turn on notifications
        </button>
        <button
          onClick={onNext}
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
          Maybe later
        </button>
      </div>
    </div>
  );
}
