// ─── Theme tokens ────────────────────────────────────────────────────────────

export const theme = {
  colors: {
    background: '#0A0A0A',
    surface: '#1A1A1A',
    surfaceElevated: '#222222',
    surfaceHover: '#1e1e1e',
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
    tagBg: '#2A2A2A',
    tagBorder: '#3A3A3A',
    tagText: '#BBBBBB',
    profileGradientStart: '#1A1A1A',
    profileGradientEnd: '#252525',
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
    screenPadding: '18px',
    cardGap: '8px',
    sectionGap: '14px',
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
