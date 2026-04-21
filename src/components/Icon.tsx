/**
 * <Icon /> - wraps the CORE UI Design icon library.
 *
 * Usage:
 *   <Icon name="timer" size={16} color="#e7e7e7" />
 *
 * Icons live in src/icons/core/ and use currentColor for strokes, so passing
 * `color` (or wrapping in an element with `color: X`) recolors them.
 *
 * Library: https://github.com/oleksandr-abmv/core-ui-design-icons
 */

// Eager-loads all SVG files at build time as raw strings so the component stays
// synchronous and icons appear instantly.
const icons = import.meta.glob('../icons/core/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

// Build a { timer: "<svg...>", ... } lookup keyed by filename without extension.
const ICON_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(icons).map(([path, svg]) => {
    const match = path.match(/([^/]+)\.svg$/);
    return [match ? match[1] : path, svg];
  }),
);

export type IconName = keyof typeof ICON_MAP;

interface IconProps {
  /** Filename (without .svg) from src/icons/core/ - e.g. 'timer', 'clock', 'arrow-back' */
  name: string;
  /** Pixel size (applied to both width and height). Default 24. */
  size?: number;
  /** Any CSS color for the stroke (icons use currentColor). */
  color?: string;
  /** Extra inline styles for the wrapping span. */
  style?: React.CSSProperties;
  /** Decorative by default - set to false if the icon conveys meaning. */
  decorative?: boolean;
  /** Accessible label when decorative=false. */
  label?: string;
}

export function Icon({ name, size = 24, color, style, decorative = true, label }: IconProps) {
  const svg = ICON_MAP[name];
  if (!svg) {
    if (import.meta.env.DEV) {
      console.warn(`[Icon] Unknown icon: "${name}". Available: ${Object.keys(ICON_MAP).slice(0, 10).join(', ')}...`);
    }
    return null;
  }

  // Swap the root <svg ...> attributes so width/height match the requested size.
  const sized = svg.replace(
    /<svg([^>]*)>/,
    (_, attrs: string) => {
      const cleaned = attrs
        .replace(/\s(width|height)="[^"]*"/g, '')
        .replace(/\s(xmlns)="[^"]*"/g, '');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"${cleaned}>`;
    },
  );

  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        lineHeight: 0,
        flexShrink: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: sized }}
    />
  );
}

export default Icon;
