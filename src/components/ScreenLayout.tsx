import type { ReactNode } from 'react';

export default function ScreenLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(143.5deg, #111111 21%, #0c0c0c 83%)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
