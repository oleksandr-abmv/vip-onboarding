// ─── Color palette ────────────────────────────────────────────────────────────

export const colors = {
  // Surfaces
  bgPrimary:   '#0c0c0c',
  bgSecondary: '#111111',
  bgCard:      '#1a1a1a',
  bgCardFront: '#1e1e1e',
  bgElevated:  '#181818',
  gradient:    'linear-gradient(143.5deg, #111111 21%, #0c0c0c 83%)',

  // Borders
  borderPrimary:   '#494949',
  borderSecondary: '#313131',

  // Ivory text scale
  ivory:      '#F5F0E8', // headings, icons, primary text
  ivoryDeep:  '#EDE8DC', // button backgrounds, selected chip fill
  ivoryMuted: '#C9C4BA', // subtitles, secondary text

  // On-ivory (dark text for light backgrounds)
  textDark: '#121212',
} as const;

// ─── Safe-area layout helpers ─────────────────────────────────────────────────

/** `calc(env(safe-area-inset-top, 0px) + Xpx)` */
export const safeTop = (offset: number) =>
  `calc(env(safe-area-inset-top, 0px) + ${offset}px)`;

/** `calc(Xpx + env(safe-area-inset-bottom, 0px))` */
export const safeBottom = (offset: number) =>
  `calc(${offset}px + env(safe-area-inset-bottom, 0px))`;
