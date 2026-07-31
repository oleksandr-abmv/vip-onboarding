import { type Boutique } from '../data/boutiques';
import { FULL_REGION, MAP_H, MAP_W, USER_POS, type MapRegion } from '../data/mapCanvas';

// ─── Store map ───────────────────────────────────────────────────────────────
//
// The map behind "Where to buy". It is drawn, not fetched: a dark-theme city
// plate (land, blocks, parks, the river, a road grid and a few street labels)
// with a pin per boutique and a "you are here" marker. No tiles, no key, no
// network - and it can be themed to match the app instead of fighting a light
// map surface.
//
// One canvas serves both surfaces. `region` crops it: the product page shows a
// zoomed band around the user, the full-screen view shows the whole plate. The
// geometry lives in `src/data/mapCanvas.ts`, shared with the boutique
// coordinates, so pins and distances can never drift apart.

const LAND = '#101112';
const BLOCK = '#191a1c';
const PARK = '#16261c';
const WATER = '#0f2836';
const ROAD = '#24262b';
const ROAD_MAJOR = '#31343a';
const LABEL = '#5c6068';

const H_ROADS = [45, 110, 175, 240, 300, 355, 410, 470, 530, 590, 720];
const V_ROADS = [18, 72, 128, 182, 236, 292, 342];
/** Blocks between the grid lines, for a bit of texture. */
const BLOCKS: [number, number, number, number][] = [
  [78, 116, 44, 53], [134, 116, 42, 53], [242, 116, 44, 53],
  [24, 181, 42, 53], [188, 181, 42, 53], [298, 181, 38, 53],
  [78, 246, 44, 48], [242, 246, 44, 48], [134, 246, 42, 48],
  [24, 306, 42, 43], [78, 361, 44, 43], [188, 361, 42, 43],
  [298, 306, 38, 43], [134, 416, 42, 48], [242, 416, 44, 48],
  [24, 476, 42, 48], [188, 476, 42, 48], [298, 476, 38, 48],
  [78, 536, 44, 48], [242, 536, 44, 48],
];

export default function StoreMap({
  boutiques,
  region = FULL_REGION,
  selectedId,
  onSelect,
  style,
}: {
  boutiques: Boutique[];
  region?: MapRegion;
  selectedId?: string | null;
  /** When set, pins are tappable. Omitted on the preview, where the whole card taps. */
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox={`${region.x} ${region.y} ${region.w} ${region.h}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Map of nearby boutiques"
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    >
      <rect x={0} y={0} width={MAP_W} height={MAP_H} fill={LAND} />

      {/* Blocks */}
      <g fill={BLOCK}>
        {BLOCKS.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={2} />
        ))}
      </g>

      {/* Parks */}
      <rect x={200} y={316} width={120} height={52} rx={4} fill={PARK} />
      <rect x={30} y={116} width={72} height={58} rx={5} fill={PARK} />

      {/* River */}
      <path
        d="M -10 664 C 60 644, 120 694, 200 676 C 272 659, 320 690, 372 672"
        stroke={WATER}
        strokeWidth={30}
        fill="none"
      />

      {/* Road grid */}
      <g stroke={ROAD} strokeWidth={2.5} strokeLinecap="square">
        {H_ROADS.map((y) => (
          <line key={`h${y}`} x1={-10} y1={y} x2={MAP_W + 10} y2={y} />
        ))}
        {V_ROADS.map((x) => (
          <line key={`v${x}`} x1={x} y1={-10} x2={x} y2={MAP_H + 10} />
        ))}
      </g>

      {/* Streets that break the grid, so the plate does not read as graph paper. */}
      <g stroke={ROAD} strokeWidth={2.5} fill="none" strokeLinecap="round">
        <path d="M 18 415 L 128 300" />
        <path d="M 236 175 L 342 110" />
        <path d="M 72 590 C 130 566, 150 520, 182 470" />
        <path d="M 292 530 L 342 470" />
      </g>

      {/* Boulevards */}
      <g stroke={ROAD_MAJOR} strokeWidth={6.5} strokeLinecap="square" fill="none">
        <line x1={-10} y1={300} x2={MAP_W + 10} y2={300} />
        <line x1={-10} y1={470} x2={MAP_W + 10} y2={470} />
        <line x1={182} y1={-10} x2={182} y2={MAP_H + 10} />
        <path d="M 8 706 L 348 118" />
      </g>

      {/* The square the flagship sits on. */}
      <circle cx={151} cy={312} r={15} fill={ROAD} />

      {/* Street labels */}
      <g fill={LABEL} fontSize={8} fontWeight={500} letterSpacing={0.6} fontFamily="Inter, sans-serif">
        <text x={26} y={295}>BD HAUSSMANN</text>
        <text x={216} y={465}>RUE DE RIVOLI</text>
        <text x={188} y={250} transform="rotate(-90 188 250)">AV. DE L&rsquo;OPERA</text>
        <text x={244} y={392} transform="rotate(-60 244 392)">AV. MONTAIGNE</text>
        <text x={90} y={531}>RUE DE SEVRES</text>
      </g>
      <text x={210} y={346} fill="#3f6b52" fontSize={7.5} fontWeight={500} letterSpacing={0.4} fontFamily="Inter, sans-serif">
        JARDIN DES TUILERIES
      </text>
      <text x={40} y={660} fill="#2e5f7d" fontSize={8} fontWeight={500} letterSpacing={0.6} fontFamily="Inter, sans-serif" transform="rotate(-7 40 660)">
        LA SEINE
      </text>

      {/* You are here */}
      <g transform={`translate(${USER_POS.x * MAP_W} ${USER_POS.y * MAP_H})`}>
        <circle r={17} fill="rgba(74,144,255,0.16)" />
        <circle r={6.5} fill="#4a90ff" stroke="#eaf1ff" strokeWidth={2} />
      </g>

      {/* Pins. Drawn farthest-first so the nearest, and the selected one, sit on top. */}
      {[...boutiques]
        .sort((a, b) => b.distanceKm - a.distanceKm)
        .map((b) => (
          <Pin
            key={b.id}
            boutique={b}
            selected={b.id === selectedId}
            onSelect={onSelect}
          />
        ))}
    </svg>
  );
}

/** A teardrop whose tip sits exactly on the boutique's coordinate. */
function Pin({
  boutique,
  selected,
  onSelect,
}: {
  boutique: Boutique;
  selected: boolean;
  onSelect?: (id: string) => void;
}) {
  const scale = selected ? 1.15 : 1;
  return (
    <g
      transform={`translate(${boutique.x * MAP_W} ${boutique.y * MAP_H}) scale(${scale})`}
      onClick={onSelect ? () => onSelect(boutique.id) : undefined}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      <ellipse cx={0} cy={1} rx={6} ry={2} fill="rgba(0,0,0,0.45)" />
      <path
        d="M0 0 C -2 -6 -11 -12 -11 -20 A 11 11 0 1 1 11 -20 C 11 -12 2 -6 0 0 Z"
        fill={selected ? '#f6f6f6' : '#2b2e33'}
        stroke={selected ? 'none' : 'rgba(255,255,255,0.45)'}
        strokeWidth={1.2}
      />
      <circle cx={0} cy={-20} r={4} fill={selected ? '#121212' : '#f6f6f6'} />
      {onSelect && (
        <circle cx={0} cy={-16} r={20} fill="transparent">
          <title>{boutique.name}</title>
        </circle>
      )}
    </g>
  );
}
