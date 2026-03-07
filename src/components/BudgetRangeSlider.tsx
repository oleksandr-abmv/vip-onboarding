import { useState, useRef, useCallback, useEffect } from 'react';
import { theme } from '../theme';
import type { BudgetTier } from '../data/categoryConfig';

interface BudgetRangeSliderProps {
  tiers: BudgetTier[];
  selectedMin: number; // index
  selectedMax: number; // index
  onChange: (min: number, max: number) => void;
}

export default function BudgetRangeSlider({
  tiers,
  selectedMin,
  selectedMax,
  onChange,
}: BudgetRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const max = tiers.length - 1;

  const getPositionFromIndex = (idx: number) => (max === 0 ? 0 : (idx / max) * 100);

  const getIndexFromPosition = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || max === 0) return 0;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(pct * max);
    },
    [max],
  );

  const handlePointerDown = useCallback(
    (handle: 'min' | 'max') => (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(handle);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const idx = getIndexFromPosition(e.clientX);
      if (dragging === 'min') {
        onChange(Math.min(idx, selectedMax), selectedMax);
      } else {
        onChange(selectedMin, Math.max(idx, selectedMin));
      }
    },
    [dragging, getIndexFromPosition, onChange, selectedMin, selectedMax],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Allow clicking on the track to snap the nearest handle
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const idx = getIndexFromPosition(e.clientX);
      const distToMin = Math.abs(idx - selectedMin);
      const distToMax = Math.abs(idx - selectedMax);
      if (distToMin <= distToMax) {
        onChange(Math.min(idx, selectedMax), selectedMax);
      } else {
        onChange(selectedMin, Math.max(idx, selectedMin));
      }
    },
    [getIndexFromPosition, onChange, selectedMin, selectedMax],
  );

  const leftPct = getPositionFromIndex(selectedMin);
  const rightPct = getPositionFromIndex(selectedMax);

  // Build display label
  const minLabel = tiers[selectedMin]?.price ?? '';
  const maxLabel = tiers[selectedMax]?.price ?? '';

  // Ensure initial callback fires to sync state
  useEffect(() => {
    // no-op, parent controls state
  }, []);

  return (
    <div style={{ padding: '8px 0 16px' }}>
      {/* Price range display */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: theme.colors.surface,
            border: `1px solid ${dragging === 'min' ? '#fff' : '#333'}`,
            borderRadius: 10,
            padding: '10px 16px',
            transition: 'border-color 150ms ease',
          }}
        >
          <div style={{ fontSize: 11, color: theme.colors.textTertiary, marginBottom: 2 }}>Min</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.colors.textPrimary }}>{minLabel}</div>
        </div>
        <div
          style={{
            background: theme.colors.surface,
            border: `1px solid ${dragging === 'max' ? '#fff' : '#333'}`,
            borderRadius: 10,
            padding: '10px 16px',
            textAlign: 'right',
            transition: 'border-color 150ms ease',
          }}
        >
          <div style={{ fontSize: 11, color: theme.colors.textTertiary, marginBottom: 2 }}>Max</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.colors.textPrimary }}>{maxLabel}</div>
        </div>
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'relative',
          height: 44,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          touchAction: 'none',
        }}
      >
        {/* Background track */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 2,
            background: '#333',
          }}
        />

        {/* Active range */}
        <div
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
            height: 4,
            borderRadius: 2,
            background: '#fff',
            transition: dragging ? 'none' : 'left 100ms ease, width 100ms ease',
          }}
        />

        {/* Tick marks */}
        {tiers.map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${getPositionFromIndex(i)}%`,
              width: 2,
              height: 8,
              borderRadius: 1,
              background: i >= selectedMin && i <= selectedMax ? '#fff' : '#444',
              transform: 'translateX(-1px)',
              transition: 'background 150ms ease',
            }}
          />
        ))}

        {/* Min handle */}
        <div
          onPointerDown={handlePointerDown('min')}
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#fff',
            border: '2px solid #0A0A0A',
            transform: 'translateX(-14px)',
            cursor: 'grab',
            zIndex: dragging === 'min' ? 3 : 2,
            boxShadow: dragging === 'min'
              ? '0 0 0 6px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 6px rgba(0,0,0,0.3)',
            transition: dragging ? 'box-shadow 100ms ease' : 'left 100ms ease, box-shadow 100ms ease',
            touchAction: 'none',
          }}
        />

        {/* Max handle */}
        <div
          onPointerDown={handlePointerDown('max')}
          style={{
            position: 'absolute',
            left: `${rightPct}%`,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#fff',
            border: '2px solid #0A0A0A',
            transform: 'translateX(-14px)',
            cursor: 'grab',
            zIndex: dragging === 'max' ? 3 : 2,
            boxShadow: dragging === 'max'
              ? '0 0 0 6px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 6px rgba(0,0,0,0.3)',
            transition: dragging ? 'box-shadow 100ms ease' : 'left 100ms ease, box-shadow 100ms ease',
            touchAction: 'none',
          }}
        />
      </div>

      {/* Tier labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
        }}
      >
        {tiers.map((tier, i) => (
          <span
            key={tier.id}
            style={{
              fontSize: 11,
              color: i >= selectedMin && i <= selectedMax ? theme.colors.textSecondary : '#444',
              textAlign: i === 0 ? 'left' : i === max ? 'right' : 'center',
              flex: 1,
              transition: 'color 150ms ease',
            }}
          >
            {tier.label}
          </span>
        ))}
      </div>
    </div>
  );
}
