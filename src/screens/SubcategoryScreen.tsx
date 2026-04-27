import { useState, useRef, useCallback, useEffect } from 'react';
import { safeTop } from '../theme';
import { categoryConfigs, getSubcategoryImagePath, getSubcategories } from '../data/categoryConfig';
import { useDelayedReveal, SkeletonBlock } from '../components/Skeleton';


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
  // Skeleton → real-content reveal
  const ready = useDelayedReveal(360);

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
    } else if (categoryId === 'Cigars') {
      // Cigar strength is a single-choice scale — picking one replaces any other
      // strength selection. Keep Custom if it was selected.
      const customIfPresent = selectedSubcategories.includes(CUSTOM_SUB_ID) ? [CUSTOM_SUB_ID] : [];
      const isSelected = selectedSubcategories.includes(subId);
      onSelectionsChange(isSelected ? customIfPresent : [subId, ...customIfPresent]);
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

        {/* Cigars: vertical card list (strength scale) */}
        {categoryId === 'Cigars' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '0 16px',
              paddingBottom: 24,
              animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 160ms both',
            }}
          >
            {!ready && getSubcategories(config, gender).map((sub) => (
              <div
                key={`sk-cigar-${sub.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid #282828',
                  borderRadius: 12,
                  padding: '14px 16px',
                }}
              >
                <SkeletonBlock width={22} height={22} radius={11} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <SkeletonBlock width="40%" height={14} radius={3} />
                  <SkeletonBlock width="70%" height={10} radius={3} />
                </div>
              </div>
            ))}
            {ready && getSubcategories(config, gender).map((sub) => {
              const selected = selectedSubcategories.includes(sub.id);
              const ripple = ripples[sub.id];
              return (
                <button
                  key={sub.id}
                  ref={(el) => { cardRefs.current[sub.id] = el as HTMLDivElement | null; }}
                  onClick={(e) => handleClick(e, sub.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: selected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: selected ? '1.5px solid #fff' : '1px solid #282828',
                    borderRadius: 12,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 300ms ease, background 300ms ease',
                    WebkitTapHighlightColor: 'transparent',
                    flexShrink: 0,
                    textAlign: 'left',
                  }}
                >
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
                  <span
                    className="material-symbols-rounded"
                    style={{
                      fontSize: 22,
                      fontVariationSettings: "'wght' 300",
                      color: '#fff',
                      opacity: selected ? 0.8 : 0.35,
                      transition: 'opacity 300ms ease',
                      position: 'relative',
                      zIndex: 1,
                      flexShrink: 0,
                    }}
                  >
                    {sub.icon ?? 'local_fire_department'}
                  </span>
                  <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#fff',
                        lineHeight: '20px',
                        display: 'block',
                      }}
                    >
                      {sub.label}
                    </span>
                    {sub.subtitle && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          color: '#999',
                          lineHeight: '16px',
                          display: 'block',
                          marginTop: 2,
                        }}
                      >
                        {sub.subtitle}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 2-column subcategory grid (non-Cigars) */}
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
          {!ready && [
            ...getSubcategories(config, gender),
            { id: CUSTOM_SUB_ID, label: '', subtitle: '' },
          ].map((sub) => (
            <div
              key={`sk-${sub.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid #282828',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <SkeletonBlock height={130} radius={6} />
              <SkeletonBlock width="55%" height={14} radius={4} />
              <SkeletonBlock width="80%" height={11} radius={4} />
            </div>
          ))}
          {ready && [
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
                  background: selected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
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
                      decoding="async"
                      loading="eager"
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

