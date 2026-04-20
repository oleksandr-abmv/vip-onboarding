import { useCallback, useEffect, useRef, useState } from 'react';
import { safeTop } from '../theme';

interface KidsScreenProps {
  onNext: () => void;
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

  const setAge = useCallback((i: number, raw: string) => {
    const trimmed = raw.replace(/[^\d]/g, '').slice(0, 2);
    const parsed = trimmed === '' ? null : Math.min(Number(trimmed), 25);
    const next = [...kidsAges];
    next[i] = parsed;
    onKidsAgesChange(next);
  }, [kidsAges, onKidsAgesChange]);

  const allFilled = kidsAges.length === kidsCount && kidsAges.every((a) => a != null);

  const listRef = useRef<HTMLDivElement>(null);

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

      {/* Age inputs — scrollable if many */}
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
            onChange={(raw) => setAge(i, raw)}
          />
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        disabled={!allFilled}
        style={{
          width: '100%',
          height: 48,
          flexShrink: 0,
          marginTop: 12,
          marginBottom: `calc(24px + env(safe-area-inset-bottom, 0px))`,
          background: allFilled ? '#f6f6f6' : '#252525',
          color: allFilled ? '#121212' : '#666',
          border: 'none',
          borderRadius: 100,
          fontSize: 16,
          fontWeight: 500,
          cursor: allFilled ? 'pointer' : 'default',
          transition: 'background 200ms ease, color 200ms ease',
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
        }}
      >
        Continue
      </button>
    </div>
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
  onChange,
}: {
  index: number;
  name: string | null;
  onNameChange: (raw: string) => void;
  value: number | null;
  onChange: (raw: string) => void;
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
      {/* Name — display or edit */}
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

      {/* Age input */}
      <label style={{ display: 'flex', alignItems: 'baseline', gap: 6, cursor: 'text' }}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          style={{
            width: 54,
            textAlign: 'right',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 17,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            padding: 0,
          }}
        />
        <span style={{ fontSize: 13, color: '#777' }}>yrs</span>
      </label>
    </div>
  );
}
