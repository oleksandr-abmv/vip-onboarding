import { useState, useEffect } from 'react';

export default function TailoringExperience() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
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
        background: 'linear-gradient(143.5deg, #111111 21%, #0c0c0c 83%)',
        overflow: 'hidden',
      }}
    >
      {/* VIP Logo at y=325, centered, 48x48 */}
      <div
        style={{
          position: 'absolute',
          top: 325,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          animation: 'fadeInUp 350ms ease-out 80ms both',
        }}
      >
        <img
          src="/vip-logo.svg"
          alt="VIP"
          style={{ width: 48, height: 48 }}
          draggable={false}
        />
      </div>

      {/* Progress bar at y=422, w=200, h=4, centered */}
      <div
        style={{
          position: 'absolute',
          top: 422,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
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
              background: 'white',
              borderRadius: 3,
              transition: 'width 75ms linear',
            }}
          />
        </div>
      </div>

      {/* "Tailoring experience..." at y=446 */}
      <p
        style={{
          position: 'absolute',
          top: 446,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 15,
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 240ms both',
        }}
      >
        Tailoring experience...
      </p>
    </div>
  );
}
