import { useEffect, useState, type CSSProperties } from 'react';

/**
 * One-shot reveal hook: returns false initially, flips to true after the
 * given delay. Used to gate "skeleton → real content" transitions on each
 * screen so the app reads as actively loading instead of snapping in.
 */
export function useDelayedReveal(ms: number = 380): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}

const SHIMMER_BG =
  'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%)';

/**
 * Generic shimmering rectangle building block. Use it inside per-screen
 * skeleton layouts to mimic real content shapes.
 */
export function SkeletonBlock({
  width = '100%',
  height = 16,
  radius = 4,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: SHIMMER_BG,
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s linear infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
