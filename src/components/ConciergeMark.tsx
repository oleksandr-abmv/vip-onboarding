// ─── Concierge mark ──────────────────────────────────────────────────────────
//
// The VIP logotype, wherever something stands for the concierge: the Ask AI
// Concierge buttons, the chat's suggestion row, the assistant's avatar. Use this
// rather than the generic `auto_awesome` sparkle - the sparkle is every AI
// product's badge, and this one is ours.
//
// `onLight` flips it to black for the filled pill (the asset is a white mark, so
// it needs the brightness filter rather than a colour).

export default function ConciergeMark({
  size = 20,
  onLight = false,
  opacity = 1,
}: {
  size?: number;
  onLight?: boolean;
  opacity?: number;
}) {
  return (
    <img
      src="/vip-logo.svg"
      alt=""
      aria-hidden
      draggable={false}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'block',
        opacity,
        ...(onLight ? { filter: 'brightness(0)' } : null),
      }}
    />
  );
}
