// ── Ghost cards (the app's empty-state illustration) ─────────────────────────
//
// Three fanned placeholder cards: the shape of the content that is missing, which
// says "nothing here yet" better than an icon of nothing. Shared so every empty
// state standing for an absent list draws the same picture. No shimmer - this is
// not loading, it is empty.

const CARD_W = 152;

function Card({ rotate, dim = false }: { rotate: number; dim?: boolean }) {
  return (
    <div
      style={{
        width: CARD_W,
        borderRadius: 14,
        background: '#101010',
        border: '1px solid #242424',
        padding: 9,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 10px 26px rgba(0,0,0,0.4)',
        opacity: dim ? 0.5 : 1,
      }}
    >
      <div style={{ height: 74, borderRadius: 9, background: '#1c1c1c', marginBottom: 9 }} />
      <div style={{ height: 8, borderRadius: 4, background: '#212121', width: '80%', marginBottom: 6 }} />
      <div style={{ height: 8, borderRadius: 4, background: '#181818', width: '52%' }} />
    </div>
  );
}

export default function GhostCards() {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: '100%',
        height: 132,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* The outer two are dimmed and rotated away, so the stack reads as depth
          rather than three cards that failed to load. */}
      <div style={{ position: 'absolute', transform: 'translateX(-46px)' }}>
        <Card rotate={-9} dim />
      </div>
      <div style={{ position: 'absolute', transform: 'translateX(46px)' }}>
        <Card rotate={9} dim />
      </div>
      <div style={{ position: 'relative' }}>
        <Card rotate={0} />
      </div>
    </div>
  );
}
