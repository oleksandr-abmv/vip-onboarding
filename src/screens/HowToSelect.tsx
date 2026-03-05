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
          background: '#0e0e0e',
          opacity: 0.7,
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
            style={{ fontSize: 18, color: 'white' }}
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
            color: '#f6f6f6',
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
            color: '#dedfe1',
            fontSize: 16,
            lineHeight: '22px',
            margin: 0,
            animation: 'fadeInUp 200ms ease-out 160ms both',
          }}
        >
          Refine your selection using simple gestures. Your choices shape your
          private feed.
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
              {/* Arrow */}
              <path opacity="0.4" d="M6.92278 12.2531C6.83046 12.5959 7.03354 12.9486 7.37637 13.041L12.9631 14.5454C13.3059 14.6377 13.6586 14.4347 13.751 14.0918C13.8433 13.749 13.6402 13.3962 13.2974 13.3039L8.33143 11.9666L9.66872 7.00069C9.76104 6.65787 9.55796 6.30511 9.21514 6.21279C8.87231 6.12047 8.51955 6.32354 8.42723 6.66637L6.92278 12.2531ZM24.4619 6.40096C24.8149 6.36264 25.0699 6.04544 25.0316 5.69248C24.9933 5.33951 24.6761 5.08444 24.3231 5.12276L24.3925 5.76186L24.4619 6.40096ZM7.54353 12.4202L7.86426 12.9774C9.56798 11.9966 12.4558 10.4848 15.561 9.14973C18.6808 7.80837 21.958 6.67279 24.4619 6.40096L24.3925 5.76186L24.3231 5.12276C21.6184 5.41639 18.1942 6.61807 15.0531 7.96856C11.8975 9.32533 8.96515 10.8601 7.2228 11.8631L7.54353 12.4202Z" fill="white" />
              {/* Hand — nudges left once after appearing */}
              <path style={{ animation: 'nudgeLeft 600ms ease-out 550ms both' }} d="M28.272 44.3415C27.9624 42.9145 26.441 39.6903 22.832 38.2093C19.223 36.7282 19.7155 32.5482 21.7918 28.6059M21.7918 28.6059L22.832 34.1596M21.7918 28.6059L19.0262 18.53C18.769 17.5931 19.3524 16.6327 20.3024 16.4291C21.1489 16.2477 21.9957 16.735 22.2642 17.558L25.1032 26.2611C25.4709 25.5599 26.6194 24.4608 28.272 25.6741C28.9606 24.9566 30.641 23.9521 31.8543 25.6741C32.9142 24.6957 35.1809 24.2162 35.7679 30.1259" stroke="white" strokeWidth="1.28571" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '22px',
                  margin: 0,
                }}
              >
                Skip
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 14,
                  lineHeight: '20px',
                  marginTop: 4,
                  marginBottom: 0,
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                Dismiss pieces that do not match your taste.
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
              {/* Arrow */}
              <path opacity="0.4" d="M11.1782 10.94C10.8534 11.0832 10.7061 11.4627 10.8492 11.7876C10.9924 12.1124 11.3719 12.2597 11.6968 12.1165L11.4375 11.5283L11.1782 10.94ZM28.4657 6.82118C28.6685 6.52972 28.5965 6.12909 28.3051 5.92636L23.5554 2.62261C23.2639 2.41987 22.8633 2.49181 22.6605 2.78327C22.4578 3.07474 22.5297 3.47537 22.8212 3.6781L27.0432 6.61476L24.1065 10.8367C23.9038 11.1282 23.9757 11.5288 24.2672 11.7316C24.5586 11.9343 24.9593 11.8624 25.162 11.5709L28.4657 6.82118ZM11.4375 11.5283L11.6968 12.1165C15.7718 10.3206 24.3309 7.75488 28.0516 7.08684L27.938 6.4541L27.8244 5.82136C24.0042 6.50726 15.3472 9.10264 11.1782 10.94L11.4375 11.5283Z" fill="white" />
              {/* Hand — nudges right once after appearing */}
              <path style={{ animation: 'nudgeRight 600ms ease-out 700ms both' }} d="M12.9635 45.2347C13.2763 43.7928 14.8136 40.5349 18.4603 39.0383C22.1071 37.5418 21.6094 33.3181 19.5114 29.3346M19.5114 29.3346L18.4603 34.9463M19.5114 29.3346L22.3059 19.1533C22.5658 18.2066 21.9762 17.2362 21.0163 17.0305C20.161 16.8472 19.3053 17.3396 19.0341 18.1713L16.1654 26.9653C15.7939 26.2568 14.6333 25.1462 12.9635 26.3721C12.2677 25.6471 10.5697 24.6321 9.34375 26.3721C8.27271 25.3835 5.98235 24.899 5.38916 30.8705" stroke="white" strokeWidth="1.28571" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '22px',
                  margin: 0,
                }}
              >
                Like
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 14,
                  lineHeight: '20px',
                  marginTop: 4,
                  marginBottom: 0,
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                Add pieces to your curated selection.
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
              {/* Arrow */}
              <path opacity="0.4" d="M10.8406 27.885C10.8406 28.24 11.1284 28.5278 11.4834 28.5278C11.8385 28.5278 12.1263 28.24 12.1263 27.885L11.4834 27.885L10.8406 27.885ZM11.9367 7.2566C11.6856 7.00562 11.2786 7.00572 11.0276 7.25684L6.93757 11.3491C6.68659 11.6002 6.6867 12.0072 6.93781 12.2582C7.18893 12.5092 7.59597 12.5091 7.84695 12.2579L11.4825 8.62043L15.1201 12.256C15.3712 12.507 15.7782 12.5069 16.0292 12.2558C16.2802 12.0046 16.2801 11.5976 16.0289 11.3466L11.9367 7.2566ZM11.4834 27.885L12.1263 27.885C12.1263 19.5769 12.1263 12.062 12.1251 7.71112L11.4823 7.71129L10.8394 7.71146C10.8406 12.0621 10.8406 19.5768 10.8406 27.885L11.4834 27.885Z" fill="white" />
              {/* Hand — nudges up once after appearing */}
              <path style={{ animation: 'nudgeUp 600ms ease-out 860ms both' }} d="M26.017 43.8381C26.1664 42.1576 25.5974 38.0776 22.1259 35.2024C18.6544 32.3272 20.6357 27.8858 24.2822 24.2514M24.2822 24.2514L23.5191 30.7354M24.2822 24.2514L24.6978 12.1857C24.7365 11.0637 25.7104 10.2051 26.8283 10.3073C27.8245 10.3984 28.5909 11.2273 28.6039 12.2275L28.7415 22.8042C29.3883 22.1572 31.0333 21.34 32.4389 23.2468C33.4452 22.6922 35.6444 22.1623 36.3903 24.4791C37.8961 23.7645 40.5613 24.0154 39.1759 30.7361" stroke="white" strokeWidth="1.28571" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: '22px',
                  margin: 0,
                }}
              >
                Info
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 14,
                  lineHeight: '20px',
                  marginTop: 4,
                  marginBottom: 0,
                  marginLeft: 0,
                  marginRight: 0,
                }}
              >
                View key details before deciding.
              </p>
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
            background: '#f6f6f6',
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
          Close
        </button>
      </div>
    </div>
  );
}
