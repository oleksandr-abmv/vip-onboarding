import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export default function HowToSelect({ onClose }: Props) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
      }}
    >
      {/* Blurred backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(14, 14, 14, 0.7)',
          animation: closing
            ? 'fadeOutBackdrop 300ms ease-in both'
            : 'fadeInBackdrop 150ms ease-out both',
        }}
      />

      {/* Content wrapper — slides down on close */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: closing
            ? 'slideDownContent 300ms ease-in both'
            : undefined,
        }}
      >
        {/* Close X button at top-right */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: `calc(env(safe-area-inset-top, 0px) + 20px)`,
            right: 19,
            width: 40,
            height: 40,
            borderRadius: 9999,
            background: '#181818',
            border: '1px solid #494949',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0,
            animation: 'fadeIn 200ms ease-out 50ms both',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 18, color: '#F5F0E8' }}
          >
            close
          </span>
        </button>

        {/* Heading */}
        <h1
          style={{
            position: 'absolute',
            top: `calc(env(safe-area-inset-top, 0px) + 72px)`,
            left: 28,
            right: 28,
            color: '#F5F0E8',
            fontSize: 24,
            fontWeight: 600,
            lineHeight: '28px',
            margin: 0,
            animation: 'fadeInUp 200ms ease-out 80ms both',
          }}
        >
          How to Select
        </h1>

        {/* Description */}
        <p
          style={{
            position: 'absolute',
            top: `calc(env(safe-area-inset-top, 0px) + 114px)`,
            left: 28,
            right: 28,
            color: '#C9C4BA',
            fontSize: 16,
            lineHeight: '22px',
            margin: 0,
            animation: 'fadeInUp 200ms ease-out 160ms both',
          }}
        >
          Swipe through pieces to refine your private selection. Each choice
          helps VIP.ai understand your taste.
        </p>

        {/* Gesture instructions */}
        <div
          style={{
            position: 'absolute',
            top: `calc(env(safe-area-inset-top, 0px) + 223px)`,
            left: 28,
            right: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Skip gesture — appears first */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              animation: 'fadeInUp 200ms ease-out 240ms both',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path opacity="0.4" d="M6.92278 12.2531C6.83046 12.5959 7.03354 12.9486 7.37637 13.041L12.9631 14.5454C13.3059 14.6377 13.6586 14.4347 13.751 14.0918C13.8433 13.749 13.6402 13.3962 13.2974 13.3039L8.33143 11.9666L9.66872 7.00069C9.76104 6.65787 9.55796 6.30511 9.21514 6.21279C8.87231 6.12047 8.51955 6.32354 8.42723 6.66637L6.92278 12.2531ZM24.4619 6.40096C24.8149 6.36264 25.0699 6.04544 25.0316 5.69248C24.9933 5.33951 24.6761 5.08444 24.3231 5.12276L24.3925 5.76186L24.4619 6.40096ZM7.54353 12.4202L7.86426 12.9774C9.56798 11.9966 12.4558 10.4848 15.561 9.14973C18.6808 7.80837 21.958 6.67279 24.4619 6.40096L24.3925 5.76186L24.3231 5.12276C21.6184 5.41639 18.1942 6.61807 15.0531 7.96856C11.8975 9.32533 8.96515 10.8601 7.2228 11.8631L7.54353 12.4202Z" fill="#F5F0E8" />
              <path d="M28.272 44.3415C27.9624 42.9145 26.441 39.6903 22.832 38.2093C19.223 36.7282 19.7155 32.5482 21.7918 28.6059M21.7918 28.6059L22.832 34.1596M21.7918 28.6059L19.0262 18.53C18.769 17.5931 19.3524 16.6327 20.3024 16.4291C21.1489 16.2477 21.9957 16.735 22.2642 17.558L25.1032 26.2611C25.4709 25.5599 26.6194 24.4608 28.272 25.6741C28.9606 24.9566 30.641 23.9521 31.8543 25.6741C32.9142 24.6957 35.1809 24.2162 35.7679 30.1259" stroke="#F5F0E8" strokeWidth="1.28571" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: '#F5F0E8',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '22px',
                  margin: 0,
                }}
              >
                Skip a piece
              </p>
              <p
                style={{
                  color: 'rgba(245,240,232,0.7)',
                  fontSize: 14,
                  lineHeight: '20px',
                  marginTop: 4,
                  marginBottom: 0,
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                Swipe left
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: '#313131',
              animation: 'fadeIn 200ms ease-out 320ms both',
            }}
          />

          {/* Like gesture — appears second */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              animation: 'fadeInUp 200ms ease-out 400ms both',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path opacity="0.4" d="M11.1782 10.94C10.8534 11.0832 10.7061 11.4627 10.8492 11.7876C10.9924 12.1124 11.3719 12.2597 11.6968 12.1165L11.4375 11.5283L11.1782 10.94ZM28.4657 6.82118C28.6685 6.52972 28.5965 6.12909 28.3051 5.92636L23.5554 2.62261C23.2639 2.41987 22.8633 2.49181 22.6605 2.78327C22.4578 3.07474 22.5297 3.47537 22.8212 3.6781L27.0432 6.61476L24.1065 10.8367C23.9038 11.1282 23.9757 11.5288 24.2672 11.7316C24.5586 11.9343 24.9593 11.8624 25.162 11.5709L28.4657 6.82118ZM11.4375 11.5283L11.6968 12.1165C15.7718 10.3206 24.3309 7.75488 28.0516 7.08684L27.938 6.4541L27.8244 5.82136C24.0042 6.50726 15.3472 9.10264 11.1782 10.94L11.4375 11.5283Z" fill="#F5F0E8" />
              <path d="M12.9635 45.2347C13.2763 43.7928 14.8136 40.5349 18.4603 39.0383C22.1071 37.5418 21.6094 33.3181 19.5114 29.3346M19.5114 29.3346L18.4603 34.9463M19.5114 29.3346L22.3059 19.1533C22.5658 18.2066 21.9762 17.2362 21.0163 17.0305C20.161 16.8472 19.3053 17.3396 19.0341 18.1713L16.1654 26.9653C15.7939 26.2568 14.6333 25.1462 12.9635 26.3721C12.2677 25.6471 10.5697 24.6321 9.34375 26.3721C8.27271 25.3835 5.98235 24.899 5.38916 30.8705" stroke="#F5F0E8" strokeWidth="1.28571" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: '#F5F0E8',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '22px',
                  margin: 0,
                }}
              >
                Like a piece
              </p>
              <p
                style={{
                  color: 'rgba(245,240,232,0.7)',
                  fontSize: 14,
                  lineHeight: '20px',
                  marginTop: 4,
                  marginBottom: 0,
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                Swipe right
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: '#313131',
              animation: 'fadeIn 200ms ease-out 480ms both',
            }}
          />

          {/* Info gesture — appears third */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              animation: 'fadeInUp 200ms ease-out 560ms both',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              {/* Hand */}
              <path d="M36.047 33.9976C37.4324 27.2769 34.7672 27.026 33.2614 27.7406C32.5155 25.4237 30.3163 25.9536 29.3099 26.5082C27.9044 24.6014 26.2594 25.4187 25.6126 26.0656L25.475 15.4889C25.462 14.4887 24.6956 13.6599 23.6994 13.5688C22.5815 13.4665 21.6076 14.3252 21.5689 15.4471L21.1533 27.5129M21.1533 27.5129L20.3902 33.9968M21.1533 27.5129C17.5068 31.1472 15.5255 35.5886 18.997 38.4639C21.5084 40.5439 22.5007 43.2544 22.801 45.2309" stroke="#F5F0E8" strokeWidth="1.28571" strokeLinecap="round" strokeLinejoin="round" />
              {/* Tap ripple arcs */}
              <path opacity="0.4" d="M18.7506 18.0251C18.0214 17.0466 17.5898 15.8333 17.5898 14.5192C17.5898 11.2756 20.2193 8.64618 23.4629 8.64618C26.7065 8.64618 29.3359 11.2756 29.3359 14.5192C29.3359 15.8333 28.9044 17.0466 28.1752 18.0251M16.84 21.6345C14.9342 19.8599 13.7422 17.3288 13.7422 14.5192C13.7422 9.1509 18.0941 4.79901 23.4624 4.79901C28.8307 4.79901 33.1826 9.1509 33.1826 14.5192C33.1826 17.0371 32.2252 19.3314 30.6547 21.058" stroke="#F5F0E8" strokeWidth="1.28571" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: '#F5F0E8',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '22px',
                  margin: 0,
                }}
              >
                View key details
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    color: 'rgba(245,240,232,0.7)',
                    fontSize: 14,
                    lineHeight: '20px',
                  }}
                >
                  Tap the
                </span>
                <span
                  className="material-symbols-rounded"
                  style={{ fontSize: 18, color: '#F5F0E8' }}
                >
                  info
                </span>
                <span
                  style={{
                    color: 'rgba(245,240,232,0.7)',
                    fontSize: 14,
                    lineHeight: '20px',
                  }}
                >
                  info icon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            bottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
            left: 16,
            right: 16,
            height: 48,
            borderRadius: 9999,
            background: '#EDE8DC',
            color: '#121212',
            fontSize: 16,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            animation: 'fadeInUp 200ms ease-out 640ms both',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
