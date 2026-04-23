import { useCallback, useEffect, useRef, useState } from 'react';
import { safeTop } from '../theme';

interface KidsScreenProps {
  onNext: () => void;
  onSkip: () => void;
  kidsCount: number;
  onKidsCountChange: (n: number) => void;
  kidsAges: (number | null)[];
  onKidsAgesChange: (ages: (number | null)[]) => void;
  kidsNames: (string | null)[];
  onKidsNamesChange: (names: (string | null)[]) => void;
}

const MIN_KIDS = 1;
const MAX_KIDS = 8;

export default function KidsScreen({
  onNext,
  onSkip,
  kidsCount,
  onKidsCountChange,
  kidsAges,
  onKidsAgesChange,
  kidsNames,
  onKidsNamesChange,
}: KidsScreenProps) {
  // Keep kidsAges array length in sync with kidsCount
  useEffect(() => {
    if (kidsAges.length !== kidsCount) {
      const next = [...kidsAges];
      while (next.length < kidsCount) next.push(null);
      next.length = kidsCount;
      onKidsAgesChange(next);
    }
  }, [kidsCount, kidsAges, onKidsAgesChange]);

  // Keep kidsNames array length in sync with kidsCount
  useEffect(() => {
    if (kidsNames.length !== kidsCount) {
      const next = [...kidsNames];
      while (next.length < kidsCount) next.push(null);
      next.length = kidsCount;
      onKidsNamesChange(next);
    }
  }, [kidsCount, kidsNames, onKidsNamesChange]);

  const setName = useCallback((i: number, raw: string) => {
    const trimmed = raw.slice(0, 24);
    const next = [...kidsNames];
    next[i] = trimmed === '' ? null : trimmed;
    onKidsNamesChange(next);
  }, [kidsNames, onKidsNamesChange]);

  const dec = useCallback(() => {
    if (kidsCount > MIN_KIDS) onKidsCountChange(kidsCount - 1);
  }, [kidsCount, onKidsCountChange]);

  const inc = useCallback(() => {
    if (kidsCount < MAX_KIDS) onKidsCountChange(kidsCount + 1);
  }, [kidsCount, onKidsCountChange]);

  const setAge = useCallback((i: number, age: number) => {
    const next = [...kidsAges];
    next[i] = age;
    onKidsAgesChange(next);
  }, [kidsAges, onKidsAgesChange]);

  const allFilled = kidsAges.length === kidsCount && kidsAges.every((a) => a != null);

  const listRef = useRef<HTMLDivElement>(null);

  // Age picker bottom sheet - one instance shared across all kids
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const closePicker = () => setPickerIndex(null);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 16px',
        paddingTop: safeTop(100),
        background: 'transparent',
      }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: '#fff',
          lineHeight: '26px',
          margin: 0,
          marginBottom: 8,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        How many kids do you have?
      </h1>

      <p
        style={{
          fontSize: 14,
          color: '#999',
          lineHeight: '20px',
          margin: 0,
          marginBottom: 24,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
        }}
      >
        We'll tailor recommendations for their age groups
      </p>

      {/* Stepper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          border: '1px solid #282828',
          borderRadius: 12,
          marginBottom: 24,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>
          Number of kids
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <StepperButton label="−" onClick={dec} disabled={kidsCount <= MIN_KIDS} />
          <span
            style={{
              minWidth: 28,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {kidsCount}
          </span>
          <StepperButton label="+" onClick={inc} disabled={kidsCount >= MAX_KIDS} />
        </div>
      </div>

      {/* Age inputs - scrollable if many */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {Array.from({ length: kidsCount }).map((_, i) => (
          <AgeRow
            key={i}
            index={i}
            name={kidsNames[i] ?? null}
            onNameChange={(raw) => setName(i, raw)}
            value={kidsAges[i] ?? null}
            onOpenPicker={() => setPickerIndex(i)}
          />
        ))}
      </div>

      {/* Skip / Continue bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexShrink: 0,
          marginTop: 12,
          marginBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
        }}
      >
        {/* Skip */}
        <button
          onClick={onSkip}
          style={{
            flex: 1,
            height: 48,
            background: 'rgba(246,246,246,0.1)',
            color: '#f6f6f6',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>

        {/* Continue */}
        <button
          onClick={onNext}
          disabled={!allFilled}
          style={{
            flex: 1,
            height: 48,
            background: allFilled ? '#f6f6f6' : '#252525',
            color: allFilled ? '#121212' : '#666',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: allFilled ? 'pointer' : 'default',
            transition: 'background 200ms ease, color 200ms ease',
          }}
        >
          Continue
        </button>
      </div>

      {/* Age picker bottom sheet */}
      {pickerIndex !== null && (
        <AgePickerSheet
          currentValue={kidsAges[pickerIndex] ?? null}
          title={`How old is ${kidsNames[pickerIndex] ?? `Kid ${pickerIndex + 1}`}?`}
          onSelect={(age) => {
            setAge(pickerIndex, age);
            closePicker();
          }}
          onClose={closePicker}
        />
      )}
    </div>
  );
}

const ROW_HEIGHT = 42;
const VISIBLE_ROWS = 7; // odd - middle row is the selection
const WHEEL_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const PAD = (WHEEL_HEIGHT - ROW_HEIGHT) / 2;
const AGES = Array.from({ length: 21 }, (_, k) => k + 1);

function AgePickerSheet({
  currentValue,
  title,
  onSelect,
  onClose,
}: {
  currentValue: number | null;
  title: string;
  onSelect: (age: number) => void;
  onClose: () => void;
}) {
  const initial = currentValue ?? 5;
  const [tempAge, setTempAge] = useState<number>(initial);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<number | null>(null);

  // Scroll to initial value on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = AGES.indexOf(initial);
    el.scrollTop = idx * ROW_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    // Preview update while scrolling (for center pill fade)
    const idx = Math.max(0, Math.min(AGES.length - 1, Math.round(el.scrollTop / ROW_HEIGHT)));
    const next = AGES[idx];
    if (next !== tempAge) setTempAge(next);
    // Snap on scroll-end
    scrollTimer.current = window.setTimeout(() => {
      const targetTop = idx * ROW_HEIGHT;
      if (Math.abs(el.scrollTop - targetTop) > 0.5) {
        el.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    }, 120);
  };

  const tapRow = (age: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = AGES.indexOf(age);
    el.scrollTo({ top: idx * ROW_HEIGHT, behavior: 'smooth' });
    setTempAge(age);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0,0,0,0.75)',
          animation: 'backdropFadeIn 200ms ease both',
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 301,
          background: '#0d0d0d',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'sheetSlideUp 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header: title + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '20px 20px 4px',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                lineHeight: '24px',
              }}
            >
              Age
            </p>
            <p
              style={{
                fontSize: 14,
                color: '#8a8a8a',
                margin: '4px 0 0',
                lineHeight: '20px',
              }}
            >
              {title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#fff',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4L14 14M14 4L4 14"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Wheel picker */}
        <div
          style={{
            position: 'relative',
            height: WHEEL_HEIGHT,
            margin: '12px 0 16px',
          }}
        >
          {/* Center selection pill */}
          <div
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              top: PAD,
              height: ROW_HEIGHT,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 12,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          {/* Scroll track */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              height: WHEEL_HEIGHT,
              overflowY: 'auto',
              scrollSnapType: 'y mandatory',
              WebkitOverflowScrolling: 'touch',
              maskImage:
                'linear-gradient(to bottom, transparent 0, #000 25%, #000 75%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0, #000 25%, #000 75%, transparent 100%)',
              scrollbarWidth: 'none',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ height: PAD, flexShrink: 0 }} />
            {AGES.map((age) => {
              const selected = age === tempAge;
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => tapRow(age)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: ROW_HEIGHT,
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'always',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: selected ? 600 : 500,
                      color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontVariantNumeric: 'tabular-nums',
                      transition: 'color 150ms ease, font-weight 150ms ease',
                      minWidth: 44,
                      textAlign: 'right',
                    }}
                  >
                    {age}
                  </span>
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: 14,
                      color: selected ? '#c9c9c9' : 'rgba(255,255,255,0.25)',
                      transition: 'color 150ms ease',
                      minWidth: 36,
                      textAlign: 'left',
                    }}
                  >
                    yrs
                  </span>
                </button>
              );
            })}
            <div style={{ height: PAD, flexShrink: 0 }} />
          </div>
          {/* Hide WebKit scrollbar */}
          <style>{`
            .__hidden-scroll::-webkit-scrollbar { display: none; }
          `}</style>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={() => onSelect(tempAge)}
            style={{
              width: '100%',
              height: 54,
              background: '#f6f6f6',
              color: '#121212',
              border: 'none',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 200ms ease',
            }}
          >
            Set age
          </button>
        </div>
      </div>
    </>
  );
}

function StepperButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        border: '1px solid #3a3a3a',
        background: disabled ? 'transparent' : '#1b1b1b',
        color: disabled ? '#555' : '#fff',
        fontSize: 18,
        lineHeight: '18px',
        fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'background 200ms ease, color 200ms ease',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {label}
    </button>
  );
}

function AgeRow({
  index,
  name,
  onNameChange,
  value,
  onOpenPicker,
}: {
  index: number;
  name: string | null;
  onNameChange: (raw: string) => void;
  value: number | null;
  onOpenPicker: () => void;
}) {
  const hasVal = value != null;
  const [editing, setEditing] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const displayName = name ?? `Kid ${index + 1}`;

  useEffect(() => {
    if (editing) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editing]);

  const commit = () => setEditing(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        border: `1px solid ${hasVal ? '#3a3a3a' : '#282828'}`,
        borderRadius: 12,
        flexShrink: 0,
        transition: 'border-color 200ms ease',
      }}
    >
      {/* Name - display or edit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
        {editing ? (
          <input
            ref={nameInputRef}
            type="text"
            value={name ?? ''}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                e.currentTarget.blur();
              }
            }}
            placeholder={`Kid ${index + 1}`}
            maxLength={24}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 15,
              fontWeight: 500,
              padding: 0,
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditing((v) => !v);
          }}
          aria-label={editing ? 'Save name' : 'Edit name'}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: '#999',
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: 18,
              fontVariationSettings: "'wght' 300",
              color: editing ? '#fff' : '#777',
              transition: 'color 200ms ease',
            }}
          >
            {editing ? 'check' : 'edit'}
          </span>
        </button>
      </div>

      {/* Age picker trigger */}
      <button
        type="button"
        onClick={onOpenPicker}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'inherit',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: hasVal ? '#fff' : '#777',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {hasVal ? value : '-'}
        </span>
        <span style={{ fontSize: 13, color: '#777' }}>yrs</span>
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          style={{ marginLeft: 2 }}
        >
          <path
            d="M1 1L4 4L7 1"
            stroke="#777"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
