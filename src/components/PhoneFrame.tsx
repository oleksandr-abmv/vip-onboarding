import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';

const DESIGN_W = 375;
const DESIGN_H = 812;
const MOBILE_BREAKPOINT = 500;

export default function PhoneFrame({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const update = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw <= MOBILE_BREAKPOINT;
    setIsMobile(mobile);

    if (mobile) {
      // Fill viewport — scale to fit both dimensions
      setScale(Math.min(vw / DESIGN_W, vh / DESIGN_H));
    } else {
      // Desktop — phone frame with padding
      const padding = 32;
      setScale(Math.min((vw - padding) / DESIGN_W, (vh - padding) / DESIGN_H, 1));
    }
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        background: 'black',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: DESIGN_W,
          height: DESIGN_H,
          overflow: 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          ...(isMobile
            ? {}
            : {
                borderRadius: 40,
                border: '1px solid #333',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              }),
        }}
      >
        {children}
      </div>
    </div>
  );
}
