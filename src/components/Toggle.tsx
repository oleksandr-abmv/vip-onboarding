// ─── Toggle track ────────────────────────────────────────────────────────────
//
// 52x32 track with a 24px thumb (Figma Toggle, node 984-96476). Presentational:
// the wrapping control owns `role="switch"` and the click handler. Shared by the
// Menu rows and the Memory sheet.

const TRACK_OFF = '#9a979b';
const TRACK_ON = '#f6f6f6';
const THUMB = '#252526';

export default function Toggle({ on }: { on: boolean }) {
  return (
    <span
      style={{
        position: 'relative',
        width: 52,
        height: 32,
        flexShrink: 0,
        borderRadius: 100,
        background: on ? TRACK_ON : TRACK_OFF,
        transition: 'background 200ms cubic-bezier(0.25,0.1,0.25,1)',
      }}
      aria-hidden
    >
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: on ? 24 : 4,
          width: 24,
          height: 24,
          borderRadius: 100,
          background: THUMB,
          transition: 'left 200ms cubic-bezier(0.25,0.1,0.25,1)',
        }}
      />
    </span>
  );
}
