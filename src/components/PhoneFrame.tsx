import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { theme } from '../theme';

const DESIGN_W = 375;
const DESIGN_H = 812;
const MOBILE_BREAKPOINT = 500;

function calcScale() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = 32;
  return Math.min((vw - padding) / DESIGN_W, (vh - padding) / DESIGN_H, 1);
}

export default function PhoneFrame({ children }: { children: ReactNode }) {
  // Lazy initializers avoid a flash of the wrong layout on first render
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const [scale, setScale] = useState(() => calcScale());

  const update = useCallback(() => {
    const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    setScale(mobile ? 1 : calcScale());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  if (isMobile) {
    return (
      <div
        className="grain-bg"
        style={{
          position: 'relative',
          width: '100%',
          height: '100dvh',
          background: theme.colors.background,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        background: theme.colors.background,
        overflow: 'hidden',
      }}
    >
      <div
        className="grain-bg"
        style={{
          position: 'relative',
          width: DESIGN_W,
          height: DESIGN_H,
          overflow: 'hidden',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          borderRadius: 40,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
