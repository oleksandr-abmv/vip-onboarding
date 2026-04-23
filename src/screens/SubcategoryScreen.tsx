import { useState, useRef, useCallback, useEffect } from 'react';
import { safeTop } from '../theme';
import { categoryConfigs, getSubcategoryImagePath, getSubcategories } from '../data/categoryConfig';


interface SubcategoryScreenProps {
  onNext: () => void;
  onSkip: () => void;
  categoryId: string;
  selectedSubcategories: string[];
  onSelectionsChange: (subs: string[]) => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
  gender: string | null;
}

// Special reserved subcategory id for the free-form "Custom" option. Additive:
// selecting it does NOT deselect other subs, and it doesn't filter products on its
// own - the typed text is stored for later AI personalization.
const CUSTOM_SUB_ID = 'custom';

interface Ripple {
  id: string;
  x: number;
  y: number;
  selecting: boolean;
}

export default function SubcategoryScreen({
  onNext,
  onSkip,
  categoryId,
  selectedSubcategories,
  onSelectionsChange,
  customText,
  onCustomTextChange,
  gender,
}: SubcategoryScreenProps) {
  const [ripples, setRipples] = useState<Record<string, Ripple>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [customSheetOpen, setCustomSheetOpen] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent, subId: string) => {
    const card = cardRefs.current[subId];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setRipples(prev => ({
      ...prev,
      [subId]: { id: subId, x, y, selecting: true },
    }));

    // Custom tile always opens the bottom sheet - selection state is managed
    // by the Save action inside the sheet (save with text → selected; empty/cancel → not).
    if (subId === CUSTOM_SUB_ID) {
      setCustomSheetOpen(true);
    } else {
      const isSelected = selectedSubcategories.includes(subId);
      if (isSelected) {
        onSelectionsChange(selectedSubcategories.filter((i) => i !== subId));
      } else {
        onSelectionsChange([...selectedSubcategories, subId]);
      }
    }

    setTimeout(() => {
      setRipples(prev => {
        const next = { ...prev };
        delete next[subId];
        return next;
      });
    }, 500);
  }, [selectedSubcategories, onSelectionsChange]);

  // Guard against missing config - must be AFTER all hooks (rules-of-hooks)
  const config = categoryConfigs[categoryId];
  if (!config) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          paddingTop: safeTop(100),
          paddingBottom: 0,
        }}
      >
        {/* Category label */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#999',
            textTransform: 'uppercase',
            lineHeight: '18px',
            margin: 0,
            marginBottom: 4,
            padding: '0 15px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          }}
        >
          {config.name}
        </p>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#fff',
            lineHeight: '26px',
            margin: 0,
            marginBottom: 8,
            padding: '0 16px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 40ms both',
          }}
        >
          {config.title}
        </h1>

        <p
          style={{
            fontSize: 14,
            color: '#999',
            margin: 0,
            marginBottom: 20,
            lineHeight: '20px',
            padding: '0 15px',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          {config.description}
        </p>

        {/* Cigars: strength slider */}
        {categoryId === 'Cigars' && (
          <div
            style={{
              padding: '0 16px',
              paddingBottom: 24,
              animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
            }}
          >
            <CigarStrengthSlider
              strengths={getSubcategories(config, gender)}
              selectedId={(() => {
                const strengthIds = new Set(getSubcategories(config, gender).map((s) => s.id));
                return selectedSubcategories.find((id) => strengthIds.has(id)) ?? null;
              })()}
              onChange={(id) => {
                const strengthIds = new Set(getSubcategories(config, gender).map((s) => s.id));
                const withoutStrengths = selectedSubcategories.filter((sid) => !strengthIds.has(sid));
                onSelectionsChange([...withoutStrengths, id]);
              }}
            />
          </div>
        )}

        {/* 2-column subcategory grid (all non-Cigars categories) */}
        {categoryId !== 'Cigars' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: '0 16px',
            paddingBottom: 24,
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
          }}
        >
          {[
            ...getSubcategories(config, gender),
            // Always-present Custom tile - lets user specify their own preference
            { id: CUSTOM_SUB_ID, label: 'Custom', subtitle: 'Tell us what you want', icon: 'edit' as const },
          ].map((sub) => {
            const selected = selectedSubcategories.includes(sub.id);
            const ripple = ripples[sub.id];
            const isCustom = sub.id === CUSTOM_SUB_ID;
            return (
              <button
                key={sub.id}
                ref={(el) => { cardRefs.current[sub.id] = el as HTMLDivElement | null; }}
                onClick={(e) => handleClick(e, sub.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  background: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: selected ? '1.5px solid #fff' : '1px solid #282828',
                  borderRadius: 12,
                  padding: 16,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 300ms ease, background 300ms ease',
                }}
              >
                {/* Ripple effect - covers entire card */}
                {ripple && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      zIndex: 2,
                      overflow: 'hidden',
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: `${ripple.x}%`,
                        top: `${ripple.y}%`,
                        width: '300%',
                        height: '300%',
                        marginLeft: '-150%',
                        marginTop: '-150%',
                        borderRadius: '50%',
                        background: ripple.selecting
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(0,0,0,0.3)',
                        animation: 'rippleExpand 500ms cubic-bezier(0.2, 0, 0.0, 1) forwards',
                      }}
                    />
                  </div>
                )}

                {/* Image area */}
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '164 / 154',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCustom ? (
                    <span
                      className="material-symbols-rounded"
                      style={{
                        fontSize: 40,
                        fontVariationSettings: "'wght' 250",
                        color: '#fff',
                        opacity: selected ? 0.7 : 0.35,
                        transition: 'opacity 200ms ease',
                      }}
                    >
                      edit_note
                    </span>
                  ) : 'image' in sub && sub.image ? (
                    <img
                      src={getSubcategoryImagePath(config, sub.image, gender)}
                      alt={sub.label}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : (
                    /* Uniform placeholder - VIP logotype when no subcategory image is provided yet */
                    <img
                      src="/vip-logo.svg"
                      alt=""
                      aria-hidden
                      style={{
                        width: 48,
                        height: 48,
                        opacity: 0.35,
                        display: 'block',
                      }}
                    />
                  )}
                </div>

                {/* Checkmark - positioned on card */}
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: selected ? '#fff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 300ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease',
                    opacity: selected ? 1 : 0,
                    transform: selected ? 'scale(1)' : 'scale(0.5)',
                    zIndex: 3,
                  }}
                >
                  <span
                    className="material-symbols-rounded"
                    style={{ fontSize: 18, color: '#0A0A0A' }}
                  >
                    check
                  </span>
                </div>

                {/* Label + subtitle */}
                <div style={{ textAlign: 'left', width: '100%' }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: '22px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {sub.label}
                  </span>
                  {(isCustom && customText ? `"${customText}"` : sub.subtitle) && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: isCustom && customText ? '#cdcdcd' : '#999',
                        lineHeight: '18px',
                        marginTop: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {isCustom && customText ? `“${customText}”` : sub.subtitle}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* Sticky bottom bar - Skip / Continue */}
      <div
        style={{
          flexShrink: 0,
          background: '#0d0d0d',
          padding: `20px 24px calc(28px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
            style={{
              flex: 1,
              height: 48,
              background: '#f6f6f6',
              color: '#121212',
              border: 'none',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Custom preference bottom sheet */}
      {customSheetOpen && (
        <CustomSheet
          categoryName={config.name}
          initialText={customText}
          onSave={(text) => {
            const trimmed = text.trim();
            onCustomTextChange(trimmed);
            const wasSelected = selectedSubcategories.includes(CUSTOM_SUB_ID);
            if (trimmed && !wasSelected) {
              onSelectionsChange([...selectedSubcategories, CUSTOM_SUB_ID]);
            } else if (!trimmed && wasSelected) {
              onSelectionsChange(selectedSubcategories.filter((i) => i !== CUSTOM_SUB_ID));
            }
            setCustomSheetOpen(false);
          }}
          onRemove={() => {
            // Clear text and deselect in one action
            onCustomTextChange('');
            onSelectionsChange(selectedSubcategories.filter((i) => i !== CUSTOM_SUB_ID));
            setCustomSheetOpen(false);
          }}
          onClose={() => setCustomSheetOpen(false)}
        />
      )}
    </div>
  );
}

// ── Custom preference bottom sheet ───────────────────────────────────────────
function CustomSheet({
  categoryName,
  initialText,
  onSave,
  onRemove,
  onClose,
}: {
  categoryName: string;
  initialText: string;
  onSave: (text: string) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hadInitial = initialText.trim().length > 0;

  useEffect(() => {
    // Auto-focus the textarea when the sheet opens
    const t = setTimeout(() => textareaRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

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
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '20px 20px 4px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                lineHeight: '24px',
              }}
            >
              Tell us what you want
            </p>
            <p
              style={{
                fontSize: 14,
                color: '#8a8a8a',
                margin: '4px 0 0',
                lineHeight: '20px',
              }}
            >
              Anything specific about {categoryName.toLowerCase()} we should know?
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
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <div style={{ padding: '16px 20px 0' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A few sentences - preferred brands, sizes, styles, anything else."
            rows={5}
            maxLength={280}
            style={{
              width: '100%',
              background: '#151515',
              border: '1px solid #282828',
              borderRadius: 12,
              padding: '12px 14px',
              color: '#fff',
              fontSize: 15,
              lineHeight: '22px',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
          <p
            style={{
              fontSize: 12,
              color: '#666',
              margin: '8px 2px 0',
              lineHeight: '16px',
              textAlign: 'right',
            }}
          >
            {text.length}/280
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '16px 20px 24px',
          }}
        >
          <button
            onClick={() => onSave(text)}
            disabled={text.trim().length === 0}
            style={{
              width: '100%',
              height: 52,
              background: text.trim().length === 0 ? '#252525' : '#f6f6f6',
              color: text.trim().length === 0 ? '#666' : '#121212',
              border: 'none',
              borderRadius: 100,
              fontSize: 16,
              fontWeight: 600,
              cursor: text.trim().length === 0 ? 'default' : 'pointer',
              transition: 'background 200ms ease, color 200ms ease',
            }}
          >
            Save
          </button>

          {/* Only shown when there is already a saved preference to remove */}
          {hadInitial && (
            <button
              onClick={onRemove}
              style={{
                width: '100%',
                height: 44,
                background: 'transparent',
                color: '#ef6f6f',
                border: 'none',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Remove custom preference
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Cigar strength slider ────────────────────────────────────────────────────
// Horizontal draggable scale from Mild → Extra full. Snaps to 5 positions
// matching the subcategories array. Single-select: dragging replaces any
// previously picked strength. VIP aesthetic: thin monochrome line, precise
// thumb, subtle scale marks — reads like a precision instrument, not a form.
function CigarStrengthSlider({
  strengths,
  selectedId,
  onChange,
}: {
  strengths: { id: string; label: string; subtitle?: string }[];
  selectedId: string | null;
  onChange: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const lastIndex = strengths.length - 1;
  const selectedIndex = selectedId ? strengths.findIndex((s) => s.id === selectedId) : -1;
  const displayIndex = selectedIndex >= 0 ? selectedIndex : Math.floor(lastIndex / 2);
  const displayStrength = strengths[displayIndex];
  const hasSelection = selectedIndex >= 0;
  const thumbPct = (displayIndex / lastIndex) * 100;

  // Horizontal inset so the thumb circle (and the end ticks) sit fully inside
  // the slider range at 0% and 100% without overflowing the container.
  const INSET = 16;

  const indexFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return displayIndex;
      const rect = track.getBoundingClientRect();
      const innerLeft = rect.left + INSET;
      const innerWidth = rect.width - INSET * 2;
      if (innerWidth <= 0) return displayIndex;
      const x = Math.max(0, Math.min(innerWidth, clientX - innerLeft));
      const pct = x / innerWidth;
      return Math.round(pct * lastIndex);
    },
    [displayIndex, lastIndex]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    const idx = indexFromClientX(e.clientX);
    if (strengths[idx].id !== selectedId) onChange(strengths[idx].id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const idx = indexFromClientX(e.clientX);
    if (strengths[idx].id !== selectedId) onChange(strengths[idx].id);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { /* no-op */ }
  };

  return (
    <div
      style={{
        padding: '28px 20px 20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid #282828',
        borderRadius: 12,
      }}
    >
      {/* Current strength label + subtitle + level dots (changes as you drag) */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: hasSelection ? '#fff' : '#666',
            lineHeight: '26px',
            transition: 'color 200ms ease',
            letterSpacing: -0.1,
          }}
        >
          {displayStrength.label}
        </div>

        {displayStrength.subtitle && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: hasSelection ? '#999' : '#555',
              marginTop: 4,
              lineHeight: '18px',
              transition: 'color 200ms ease',
            }}
          >
            {displayStrength.subtitle}
          </div>
        )}
      </div>

      {/* Slider — thin line, precise thumb */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          height: 44,
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {/* Inset positioning layer — ticks, fill, and thumb all map to 0–100% in here */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: INSET,
            right: INSET,
            pointerEvents: 'none',
          }}
        >
          {/* Line segments between ticks — 6px gap on each side of every divider */}
          {Array.from({ length: lastIndex }).map((_, k) => {
            const SEG_GAP = 6;
            const isFilled = k < displayIndex;
            return (
              <div
                key={`seg-${k}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `calc(${(k / lastIndex) * 100}% + ${SEG_GAP}px)`,
                  width: `calc(${(100 / lastIndex)}% - ${SEG_GAP * 2}px)`,
                  height: 2,
                  transform: 'translateY(-50%)',
                  borderRadius: 2,
                  background: isFilled
                    ? hasSelection
                      ? '#f6f6f6'
                      : 'rgba(246,246,246,0.35)'
                    : 'rgba(255,255,255,0.12)',
                  transition: 'background 220ms ease',
                }}
              />
            );
          })}

          {/* Scale marks — thin vertical lines at each position */}
          {strengths.map((_, i) => {
            const isFilled = i <= displayIndex;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${(i / lastIndex) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 1,
                  height: 10,
                  background: isFilled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
                  transition: 'background 200ms ease',
                }}
              />
            );
          })}

          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${thumbPct}%`,
              transform: `translate(-50%, -50%) scale(${dragging ? 1.08 : 1})`,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: dragging
                ? '0 3px 14px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.08)'
                : '0 2px 8px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.08)',
              transition: dragging
                ? 'transform 120ms ease, box-shadow 120ms ease'
                : 'left 260ms cubic-bezier(0.25, 0.1, 0.25, 1), transform 120ms ease, box-shadow 120ms ease',
            }}
          />
        </div>
      </div>

      {/* Endpoint hints — anchor the scale without crowding the track */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          padding: `0 ${INSET - 6}px`,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: 0.8,
          color: '#666',
          textTransform: 'uppercase',
        }}
      >
        <span>{strengths[0].label}</span>
        <span>{strengths[lastIndex].label}</span>
      </div>
    </div>
  );
}
