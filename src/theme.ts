// ─── Theme tokens ────────────────────────────────────────────────────────────

export const theme = {
  colors: {
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1C1C1C',
    surfaceHover: '#181818',
    border: 'rgba(255, 255, 255, 0.06)',
    borderSelected: '#FFFFFF',
    borderGlow: '0 0 12px rgba(255, 255, 255, 0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: '#999999',
    textTertiary: '#666666',
    textMuted: '#888888',
    ctaPrimary: '#FFFFFF',
    ctaPrimaryText: '#0A0A0A',
    heartDefault: '#444444',
    heartActive: '#E53935',
    progressBg: '#333333',
    progressFill: '#FFFFFF',
    tagBg: '#1E1E1E',
    tagBorder: '#2A2A2A',
    tagText: '#BBBBBB',
    profileGradientStart: '#131313',
    profileGradientEnd: '#1A1A1A',
  },
  radii: {
    card: '10px',
    cardLg: '14px',
    button: '10px',
    chip: '20px',
    pill: '6px',
    phone: '32px',
  },
  spacing: {
    screenPadding: '24px',
    cardGap: '10px',
    sectionGap: '18px',
  },
  animation: {
    cardBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    duration: '400ms',
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    stagger: 80,
  },
} as const;

// ─── Safe-area layout helpers ─────────────────────────────────────────────────

/** `calc(env(safe-area-inset-top, 0px) + Xpx)` */
export const safeTop = (offset: number) =>
  `calc(env(safe-area-inset-top, 0px) + ${offset}px)`;

/** `calc(Xpx + env(safe-area-inset-bottom, 0px))` */
export const safeBottom = (offset: number) =>
  `calc(${offset}px + env(safe-area-inset-bottom, 0px))`;
