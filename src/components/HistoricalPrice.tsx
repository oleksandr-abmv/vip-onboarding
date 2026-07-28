import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Product } from '../data/products';
import { getPriceHistory, type PriceChange, type PriceHistory } from '../data/priceHistory';

// ─── Historical price ─────────────────────────────────────────────────────────
//
// Collapsible price-history card shown under the price on the Product Page.
// Figma: "Historical price" component (node 5294-26355) plus the Product Page
// states (node 5294-28266). Covers every variant in the file: collapsed
// positive / negative / neutral / no-data, the expanded chart with period chips,
// the scrub tooltip, the lowest / highest stats box, the change log, and its
// overflow "View more" button.
//
// The chart is a step line (prices change in discrete events) with a gradient
// area fill and dot markers at each change. All maths runs off a measured pixel
// width so the scrubber hit-testing is exact.

interface HistoricalPriceProps {
  product: Product;
  /** Optional shared history (the Product Page computes it once for the price line). */
  history?: PriceHistory;
  /** Start expanded (defaults to collapsed). */
  defaultOpen?: boolean;
}

// ─── Figma tokens ────────────────────────────────────────────────────────────
//
// Dark-theme values resolved from the Figma variables: Background/backgroundPrimary,
// Border/borderPrimary, Text/textPrimary + textSecondary, Tag/tagSecondary,
// Brand/brandSecondary, Graphs/*, Alerts/success + error.

const BG = '#101111';
const BORDER = '#444547';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const GRID = '#2a2a2c';
const NEUTRAL_BG = '#2f2f31';
const NEUTRAL_TEXT = '#f8f8f8';

type Tone = 'up' | 'down' | 'flat';
const TONES: Record<Tone, { line: string; marker: string; tagBg: string; tagText: string }> = {
  up: { line: '#82ed9a', marker: '#66c9ad', tagBg: '#006347', tagText: '#f2faf8' },
  down: { line: '#dc8589', marker: '#dc8589', tagBg: '#4e1518', tagText: '#fcf5f5' },
  // Figma draws a flat history with the same green graph palette; only the tag
  // goes neutral.
  flat: { line: '#82ed9a', marker: '#66c9ad', tagBg: NEUTRAL_BG, tagText: NEUTRAL_TEXT },
};

// Type scale, straight off the Figma text styles.
// h5 = Heading/H5 16/20 medium, body = Body 16/22, sub = Secondary_Subtext 14/20,
// cap = Caption 12/16, h4 = Heading/H4 18/22 medium.
const FS = { h4: 18, h5: 16, body: 16, sub: 14, cap: 12 };
const LH = { h4: '22px', h5: '20px', body: '22px', sub: '20px', cap: '16px' };

// ─── Periods ─────────────────────────────────────────────────────────────────

type PeriodId = '3m' | '1y' | '5y' | 'max';
// `label` is the chip, `short` the stats caption, `tag` the header pill suffix.
const PERIODS: { id: PeriodId; label: string; short: string; tag: string; days: number }[] = [
  { id: '3m', label: '3 month', short: '3 month', tag: '3M', days: 91 },
  { id: '1y', label: '1 year', short: '1 year', tag: '1Y', days: 365 },
  { id: '5y', label: '5 years', short: '5 years', tag: '5Y', days: 365 * 5 },
  { id: 'max', label: 'Max', short: 'Max', tag: 'Max', days: Infinity },
];

// ─── Formatting ──────────────────────────────────────────────────────────────

const DAY = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const fmtDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmtMon = (d: Date) => `${MONTHS[d.getMonth()]} ’${String(d.getFullYear()).slice(2)}`;
const signed = (n: number) => (n >= 0 ? '+' : '-') + money(Math.abs(n));

// ─── Derived view for a selected period ──────────────────────────────────────

interface View {
  windowStart: Date;
  startPrice: number;
  inWindow: PriceChange[];
  min: number;
  max: number;
  delta: number;
  pct: number;
  current: number;
  tone: Tone;
}

/** Price in effect at time `t` (step function over the change events). */
function priceAt(changes: PriceChange[], t: Date): number {
  let price = changes[0].price;
  for (const c of changes) {
    if (c.date.getTime() <= t.getTime()) price = c.price;
    else break;
  }
  return price;
}

function computeView(h: PriceHistory, period: PeriodId, today: Date): View {
  const def = PERIODS.find((p) => p.id === period)!;
  const windowStart =
    period === 'max'
      ? h.firstTracked
      : new Date(Math.max(h.firstTracked.getTime(), today.getTime() - def.days * DAY));

  const startPrice = priceAt(h.changes, windowStart);
  const inWindow = h.changes.filter((c) => c.date.getTime() > windowStart.getTime());
  const prices = [startPrice, ...inWindow.map((c) => c.price), h.currentPrice];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const delta = h.currentPrice - startPrice;
  const pct = startPrice ? (delta / startPrice) * 100 : 0;
  const tone: Tone = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return { windowStart, startPrice, inWindow, min, max, delta, pct, current: h.currentPrice, tone };
}

// ─── Y-axis scale (3 gridlines) ──────────────────────────────────────────────
//
// Figma anchors the top gridline at (or just above) the highest price and spaces
// the other two a round step below, so the line is allowed to dip a little under
// the bottom gridline. The step ladder is walked smallest-first and stops at the
// first step whose dip still fits above the plot floor.

function niceNum(x: number): number {
  if (x <= 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * Math.pow(10, exp);
}

/** Round step sizes, smallest first, so the band hugs the data. */
const STEP_LADDER = [1, 2, 2.5, 4, 5, 10, 20, 25, 40, 50];

function niceScale(min: number, max: number): { lo: number; mid: number; hi: number } {
  if (min === max) {
    const pad = niceNum(Math.max(1, min * 0.025));
    return { lo: min - pad, mid: min, hi: min + pad };
  }
  const base = Math.pow(10, Math.floor(Math.log10((max - min) / 2)));
  for (const m of STEP_LADDER) {
    const step = m * base;
    const hi = Math.ceil(max / step) * step;
    // The bottom gridline may sit above the minimum: there is 0.766 of a step of
    // room between it and the plot floor, so the line is allowed to dip under it.
    if (hi - 2 * step - min <= 0.76 * step) return { lo: hi - 2 * step, mid: hi - step, hi };
  }
  const step = 100 * base;
  const hi = Math.ceil(max / step) * step;
  return { lo: hi - 2 * step, mid: hi - step, hi };
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function HistoricalPrice({ product, history: historyProp, defaultOpen = false }: HistoricalPriceProps) {
  const history = useMemo(() => historyProp ?? getPriceHistory(product), [historyProp, product]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const spanDays = (today.getTime() - history.firstTracked.getTime()) / DAY;
  const isEmpty = history.profile === 'empty';

  const [open, setOpen] = useState(defaultOpen);
  const [period, setPeriod] = useState<PeriodId>(() => (spanDays < 330 ? 'max' : '1y'));

  // The header tag always reports the selected period, so picking a chip updates
  // it in place (and it survives collapsing the card).
  const view = useMemo(() => computeView(history, period, today), [history, period, today]);
  const periodTag = PERIODS.find((p) => p.id === period)!.tag;

  return (
    <div
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <style>{`@keyframes hpFade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>

      {/* Top container: header + (when open) chips, chart and stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
        {/* Header (whole row toggles) */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Collapse historical price' : 'Expand historical price'}
          style={{
            all: 'unset',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            height: 32,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span style={{ flex: 1, fontSize: FS.h5, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: LH.h5 }}>
            Historical price
          </span>
          <Tag
            bg={isEmpty ? NEUTRAL_BG : TONES[view.tone].tagBg}
            color={isEmpty ? NEUTRAL_TEXT : TONES[view.tone].tagText}
          >
            {isEmpty
              ? 'No data'
              : `${view.delta > 0 ? '+' : view.delta < 0 ? '-' : '+'}${
                  view.delta === 0 ? '0' : Math.abs(view.pct).toFixed(1)
                }% ∙ ${periodTag}`}
          </Tag>
          <span
            className="material-symbols-rounded"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              fontSize: 24,
              fontVariationSettings: "'wght' 300",
              color: TEXT_PRIMARY,
              transition: 'transform 300ms cubic-bezier(0.25,0.1,0.25,1)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            aria-hidden
          >
            keyboard_arrow_down
          </span>
        </button>

        {open &&
          (isEmpty ? (
            <div style={{ animation: 'hpFade 320ms cubic-bezier(0.25,0.1,0.25,1)' }}>
              <EmptyState firstTracked={history.firstTracked} />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                animation: 'hpFade 320ms cubic-bezier(0.25,0.1,0.25,1)',
              }}
            >
              <Periods selected={period} onSelect={setPeriod} />
              <Chart history={history} view={view} today={today} />
              <Stats view={view} period={period} />
            </div>
          ))}
      </div>

      {/* Price change log lives in its own section under a full-bleed divider.
          Keyed by period so switching chips re-collapses it to the first page. */}
      {open && !isEmpty && <ChangeLog key={period} history={history} view={view} />}
    </div>
  );
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

function Tag({ bg, color, children }: { bg: string; color: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: bg,
        color,
        padding: '2px 8px',
        borderRadius: 100,
        fontSize: FS.cap,
        fontWeight: 400,
        lineHeight: LH.cap,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// ─── Period chips ────────────────────────────────────────────────────────────

function Periods({ selected, onSelect }: { selected: PeriodId; onSelect: (p: PeriodId) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {PERIODS.map((p) => {
        const active = p.id === selected;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            aria-pressed={active}
            style={{
              all: 'unset',
              boxSizing: 'border-box',
              flex: 1,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 100,
              fontSize: FS.sub,
              fontWeight: 400,
              lineHeight: LH.sub,
              cursor: 'pointer',
              background: active ? NEUTRAL_BG : BG,
              border: active ? '1px solid transparent' : `1px solid ${BORDER}`,
              color: active ? NEUTRAL_TEXT : TEXT_PRIMARY,
              transition: 'background 200ms, border-color 200ms',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Chart (SVG step line + area + scrub) ─────────────────────────────────────
//
// Geometry is lifted straight from the Figma chart frame (296 x 247): three
// gridline rows 77px apart with a 44px label gutter, the plot inset 47px from
// the left and running from y 2 to y 221, then a 16px row of x labels.

const CHART_H = 247;
const GRID_X = 44;
const PLOT_X = 47;
const GRID_YS = [8, 85, 162]; // hi / mid / lo
const PLOT_TOP = 2;
const PLOT_BOT = 221;
const XLABEL_Y = 239;
const TIP_W = 116;
const TIP_H = 56;

function Chart({ history, view, today }: { history: PriceHistory; view: View; today: Date }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(296);
  const [scrub, setScrub] = useState<number | null>(null); // 0..1 across plot, or null

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setW(cw);
    });
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const tone = TONES[view.tone];
  const plotW = Math.max(1, w - PLOT_X);
  const t0 = view.windowStart.getTime();
  const t1 = today.getTime();
  const tspan = t1 - t0 || 1;

  const scale = useMemo(() => niceScale(view.min, view.max), [view.min, view.max]);

  const x = (d: Date) => PLOT_X + ((d.getTime() - t0) / tspan) * plotW;
  const xt = (t: number) => PLOT_X + t * plotW;
  const y = (price: number) => {
    const raw = GRID_YS[0] + ((scale.hi - price) / (scale.hi - scale.lo)) * (GRID_YS[2] - GRID_YS[0]);
    return Math.max(PLOT_TOP, Math.min(PLOT_BOT, raw));
  };

  // Step polyline: startPrice held to first in-window change, jump, ... to today.
  const pts: { x: number; y: number }[] = [];
  pts.push({ x: xt(0), y: y(view.startPrice) });
  let prev = view.startPrice;
  for (const c of view.inWindow) {
    pts.push({ x: x(c.date), y: y(prev) });
    pts.push({ x: x(c.date), y: y(c.price) });
    prev = c.price;
  }
  pts.push({ x: xt(1), y: y(prev) });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L${xt(1).toFixed(2)} ${PLOT_BOT} L${xt(0).toFixed(2)} ${PLOT_BOT} Z`;

  // Markers sit on the change events only - the design has no "today" dot.
  const markers = view.inWindow.map((c) => ({ x: x(c.date), y: y(c.price) }));

  const gridYs = [
    { v: scale.hi, y: GRID_YS[0] },
    { v: scale.mid, y: GRID_YS[1] },
    { v: scale.lo, y: GRID_YS[2] },
  ];
  const gradId = useMemo(() => `hpg-${Math.round(view.startPrice)}-${view.tone}`, [view.startPrice, view.tone]);

  // Scrub value (step function).
  const scrubData = useMemo(() => {
    if (scrub == null) return null;
    const t = new Date(t0 + scrub * tspan);
    const price = priceAt(history.changes, t > today ? today : t);
    return { t, price, x: xt(scrub), y: y(price) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrub, w, view]);

  function handlePointer(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = (clientX - rect.left - PLOT_X) / plotW;
    setScrub(Math.max(0, Math.min(1, t)));
  }

  // Tooltip hugs the left of the cursor, flipping right when it runs out of room.
  const tipLeft = scrubData
    ? scrubData.x - 8 - TIP_W >= 0
      ? scrubData.x - 8 - TIP_W
      : Math.min(scrubData.x + 8, w - TIP_W)
    : 0;
  const tipTop = scrubData ? Math.max(0, Math.min(CHART_H - TIP_H - 26, scrubData.y - 4)) : 0;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: CHART_H, userSelect: 'none' }}>
      <svg width="100%" height={CHART_H} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone.line} stopOpacity={0.24} />
            <stop offset="100%" stopColor={tone.line} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Gridlines + left-aligned y labels */}
        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={GRID_X} y1={g.y} x2={w} y2={g.y} stroke={GRID} strokeWidth={1} />
            <text x={0} y={g.y} dominantBaseline="middle" textAnchor="start" fontSize={FS.cap} fill={TEXT_SECONDARY}>
              {money(g.v)}
            </text>
          </g>
        ))}

        {/* Area + line */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={tone.line} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Change markers: tone-filled dot with a white ring */}
        {markers.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={3.25} fill={tone.marker} stroke="#ffffff" strokeWidth={1.5} />
        ))}

        {/* X labels */}
        <text x={GRID_X} y={XLABEL_Y} dominantBaseline="middle" fontSize={FS.cap} fill={TEXT_SECONDARY} textAnchor="start">
          {fmtMon(view.windowStart)}
        </text>
        <text
          x={GRID_X + (w - GRID_X) / 2}
          y={XLABEL_Y}
          dominantBaseline="middle"
          fontSize={FS.cap}
          fill={TEXT_SECONDARY}
          textAnchor="middle"
        >
          {fmtMon(new Date(t0 + tspan / 2))}
        </text>
        <text x={w} y={XLABEL_Y} dominantBaseline="middle" fontSize={FS.cap} fill={TEXT_SECONDARY} textAnchor="end">
          Today
        </text>

        {/* Scrubber: dotted drop line from the cursor dot to the plot floor */}
        {scrubData && (
          <g>
            <line
              x1={scrubData.x}
              y1={scrubData.y}
              x2={scrubData.x}
              y2={PLOT_BOT}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <circle cx={scrubData.x} cy={scrubData.y} r={3.25} fill={tone.marker} stroke="#ffffff" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {/* Scrub tooltip (HTML, clamped within the chart) */}
      {scrubData && (
        <div
          style={{
            position: 'absolute',
            top: tipTop,
            left: tipLeft,
            width: TIP_W,
            boxSizing: 'border-box',
            background: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: '8px 12px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: FS.h5, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: LH.h5 }}>
            {money(scrubData.price)}
          </div>
          <div style={{ fontSize: FS.sub, fontWeight: 400, color: TEXT_SECONDARY, lineHeight: LH.sub }}>
            {fmtDay(scrubData.t)}
          </div>
        </div>
      )}

      {/* Pointer overlay over the plot area. touch-action pan-y keeps vertical
          page scrolling while horizontal drags scrub. */}
      <div
        style={{
          position: 'absolute',
          left: PLOT_X,
          top: PLOT_TOP,
          width: plotW,
          height: PLOT_BOT - PLOT_TOP,
          touchAction: 'pan-y',
          cursor: 'crosshair',
        }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          handlePointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0 || e.pointerType === 'mouse') handlePointer(e.clientX);
        }}
        onPointerUp={() => setScrub(null)}
        onPointerCancel={() => setScrub(null)}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setScrub(null);
        }}
      />
    </div>
  );
}

// ─── Stats box ───────────────────────────────────────────────────────────────

function Stats({ view, period }: { view: View; period: PeriodId }) {
  const short = PERIODS.find((p) => p.id === period)!.short;
  return (
    <div style={{ display: 'flex', border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
      <StatCell value={money(view.min)} label={`Lowest · ${short}`} padLeft={12} />
      <div style={{ width: 1, background: BORDER }} />
      <StatCell value={money(view.max)} label={`Highest · ${short}`} padLeft={10} />
    </div>
  );
}

function StatCell({ value, label, padLeft }: { value: string; label: string; padLeft: number }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: `8px 12px 8px ${padLeft}px`,
      }}
    >
      <span style={{ fontSize: FS.h5, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: LH.h5 }}>{value}</span>
      <span style={{ fontSize: FS.cap, fontWeight: 400, color: TEXT_SECONDARY, lineHeight: LH.cap }}>{label}</span>
    </div>
  );
}

// ─── Price change log ────────────────────────────────────────────────────────
//
// Scoped to the selected period, like the tag, chart and stats: a card reading
// "+0% · 3M" must not list changes from two years ago. Newest first, three
// rows at a time behind a "View more" button.

const LOG_PAGE = 3;

function ChangeLog({ history, view }: { history: PriceHistory; view: View }) {
  const [shown, setShown] = useState(LOG_PAGE);

  // The initial listing (changes[0]) shows a "First tracked" tag instead of a
  // delta, and only appears when tracking began inside the window.
  const rows: { date: Date; price: number; delta: number | null }[] = [];
  for (let i = history.changes.length - 1; i >= 0; i--) {
    const c = history.changes[i];
    if (c.date.getTime() < view.windowStart.getTime()) break;
    const prev = i > 0 ? history.changes[i - 1].price : null;
    const delta = prev == null ? null : c.price - prev;
    if (delta === 0) continue; // never log a no-op change
    rows.push({ date: c.date, price: c.price, delta });
  }
  if (rows.length === 0) return null;

  const visible = rows.slice(0, shown);
  const remaining = rows.length - shown;
  // A history with nothing but the initial listing has no count to show.
  const hasChanges = rows.some((r) => r.delta !== null);

  return (
    <>
      <div style={{ height: 1, background: BORDER }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, fontSize: FS.body, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: LH.body }}>
            Price change log
          </span>
          {hasChanges && (
            <span
              style={{ fontSize: FS.sub, fontWeight: 400, color: TEXT_SECONDARY, lineHeight: LH.sub, whiteSpace: 'nowrap' }}
            >
              {rows.length} change{rows.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {visible.map((r, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                <span
                  style={{ flex: 1, minWidth: 0, fontSize: FS.sub, fontWeight: 400, color: TEXT_SECONDARY, lineHeight: LH.sub }}
                >
                  {fmtDay(r.date)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DeltaTag delta={r.delta} />
                  <span
                    style={{
                      fontSize: FS.sub,
                      fontWeight: 600,
                      color: TEXT_PRIMARY,
                      lineHeight: LH.sub,
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {money(r.price)}
                  </span>
                </span>
              </div>
              {i < visible.length - 1 && <div style={{ height: 1, background: BORDER }} />}
            </div>
          ))}
        </div>

        {remaining > 0 && (
          <button
            onClick={() => setShown((s) => s + LOG_PAGE)}
            style={{
              all: 'unset',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: 8,
              background: BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 100,
              cursor: 'pointer',
              fontSize: FS.body,
              fontWeight: 500,
              lineHeight: LH.body,
              color: TEXT_PRIMARY,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            View more
          </button>
        )}
      </div>
    </>
  );
}

function DeltaTag({ delta }: { delta: number | null }) {
  if (delta == null) {
    return (
      <Tag bg={NEUTRAL_BG} color={NEUTRAL_TEXT}>
        First tracked
      </Tag>
    );
  }
  const tone = delta > 0 ? TONES.up : TONES.down;
  return (
    <Tag bg={tone.tagBg} color={tone.tagText}>
      {signed(delta)}
    </Tag>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ firstTracked }: { firstTracked: Date }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 158,
        padding: 16,
        boxSizing: 'border-box',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 100,
          background: NEUTRAL_BG,
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 24, fontVariationSettings: "'wght' 300", color: NEUTRAL_TEXT }}
          aria-hidden
        >
          history
        </span>
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <span style={{ fontSize: FS.h4, fontWeight: 500, color: TEXT_PRIMARY, lineHeight: LH.h4 }}>
          No price data yet
        </span>
        <span style={{ fontSize: FS.body, fontWeight: 400, color: TEXT_SECONDARY, lineHeight: LH.body }}>
          We started tracking this price on {fmtDay(firstTracked)}. Changes will appear here.
        </span>
      </div>
    </div>
  );
}
