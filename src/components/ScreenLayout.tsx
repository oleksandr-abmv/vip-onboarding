import type { ReactNode } from 'react';
import { colors } from '../theme';

export default function ScreenLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: colors.gradient,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
