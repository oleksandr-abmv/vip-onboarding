/**
 * <MIcon /> - Material Symbols Rounded (Material Design 3), the icon library the
 * Figma file uses. `name` is the Material Symbols name exactly as it appears in
 * the design layer (e.g. `menu_book`, `keyboard_arrow_right`, `more_horiz`).
 *
 * Defaults match the file's "Icons/Outlined/Large" style: 24px, weight 300
 * (Light), FILL 0, GRAD 0.
 *
 *   <MIcon name="menu_book" size={24} color="#f6f6f6" />
 *
 * The font is loaded in index.html with the full opsz/wght/FILL/GRAD axes.
 */

interface MIconProps {
  /** Material Symbols name, snake_case, as written in Figma. */
  name: string;
  /** Optical size in px. Default 24. */
  size?: number;
  color?: string;
  /** Stroke weight axis, 100-700. Figma's "Light" is 300. */
  weight?: number;
  /** FILL axis, 0 or 1. Filled is used for the active tab. */
  fill?: 0 | 1;
  style?: React.CSSProperties;
  /** Decorative by default - set to false if the icon conveys meaning. */
  decorative?: boolean;
  label?: string;
}

export default function MIcon({
  name,
  size = 24,
  color,
  weight = 300,
  fill = 0,
  style,
  decorative = true,
  label,
}: MIconProps) {
  return (
    <span
      className="material-symbols-rounded"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      style={{
        fontSize: size,
        lineHeight: 1,
        color,
        flexShrink: 0,
        // opsz tracks the render size so the glyph keeps its intended weight.
        fontVariationSettings: `'opsz' ${size}, 'wght' ${weight}, 'FILL' ${fill}, 'GRAD' 0`,
        userSelect: 'none',
        ...style,
      }}
    >
      {name}
    </span>
  );
}
