import { useState, useRef, useCallback, useMemo } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import { getProductsForInterests } from '../data/products';
import { colors, safeTop, safeBottom } from '../theme';

interface Props {
  onNext: () => void;
  selectedInterests: Set<string>;
}

const CARD_TRANSITION = '0.45s cubic-bezier(0.16, 1, 0.3, 1)';
const CARD_BOTTOM_H = 80;
const INFO_SIZE = 40;

export default function BrandsSelection({ onNext, selectedInterests }: Props) {
  const products = useMemo(
    () => getProductsForInterests(selectedInterests),
    [selectedInterests],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [settled, setSettled] = useState(true);
  const startXRef = useRef(0);
  const skipTransitionRef = useRef(false);

  const currentItem = products[currentIndex % products.length];
  const nextItem = products[(currentIndex + 1) % products.length];

  // Card position definitions — y relative to safe area top
  const FRONT = { x: 19, y: safeTop(200), w: 337, h: 382 };
  const BACK  = { x: 29, y: safeTop(232), w: 317, h: 359 };

  const backPos = promoting ? FRONT : BACK;

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    setExitDirection(direction);
    setPromoting(true);
    setSettled(false);
    if (direction === 'right') setSelectedCount((c) => c + 1);
    setTimeout(() => {
      skipTransitionRef.current = true;
      setCurrentIndex((i) => i + 1);
      setExitDirection(null);
      setPromoting(false);
      setDragX(0);
      requestAnimationFrame(() => {
        skipTransitionRef.current = false;
        setSettled(true);
      });
    }, 450);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startXRef.current);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > 80) {
      handleSwipe(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
    }
  };

  const getCardTransform = () => {
    if (exitDirection === 'left')  return 'translateX(-150%) rotate(-20deg)';
    if (exitDirection === 'right') return 'translateX(150%) rotate(20deg)';
    if (dragX !== 0) return `translateX(${dragX}px) rotate(${dragX * 0.08}deg)`;
    return 'translateX(0)';
  };

  const infoButtonVisible = settled && !isDragging && Math.abs(dragX) <= 5;

  return (
    <ScreenLayout>
      <h1
        style={{
          position: 'absolute',
          top: safeTop(72),
          left: 16,
          right: 16,
          color: colors.ivory,
          fontSize: 24,
          fontWeight: 600,
          lineHeight: '28px',
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 80ms both',
        }}
      >
        Select Brands
      </h1>

      <p
        style={{
          position: 'absolute',
          top: safeTop(114),
          left: 16,
          right: 16,
          color: colors.ivoryMuted,
          fontSize: 15,
          lineHeight: '21px',
          margin: 0,
          animation: 'fadeInUp 350ms ease-out 160ms both',
        }}
      >
        Select the pieces and maisons that align with your aesthetic. Your
        choices shape your experience.
      </p>

      {/* Back card — transitions to front position when promoting */}
      <div
        style={{
          position: 'absolute',
          top: backPos.y,
          left: backPos.x,
          width: backPos.w,
          height: backPos.h,
          borderRadius: 16,
          border: `1px solid ${colors.borderSecondary}`,
          background: colors.bgPrimary,
          overflow: 'hidden',
          transition: promoting
            ? `top ${CARD_TRANSITION}, left ${CARD_TRANSITION}, width ${CARD_TRANSITION}, height ${CARD_TRANSITION}`
            : 'none',
        }}
      >
        <div
          style={{
            background: colors.bgCard,
            height: `calc(100% - ${CARD_BOTTOM_H}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={nextItem.image}
            alt={nextItem.name}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            draggable={false}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 70% 65% at center 45%, transparent 35%, ${colors.bgCard} 90%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
        <div style={{ padding: 16 }}>
          <p style={{ color: colors.ivory, fontSize: 16, fontWeight: 500, lineHeight: '20px', margin: 0 }}>
            {nextItem.name}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ color: colors.ivoryMuted, fontSize: 14, lineHeight: '20px' }}>
              {nextItem.brand}
            </span>
            <span style={{ color: colors.ivoryMuted, fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>
              {nextItem.price}
            </span>
          </div>
        </div>
      </div>

      {/* Front card — DOM persists across swipes for seamless transitions */}
      <div
        style={{
          position: 'absolute',
          top: FRONT.y,
          left: FRONT.x,
          width: FRONT.w,
          height: FRONT.h,
          borderRadius: 16,
          border: `1px solid ${colors.borderSecondary}`,
          background: colors.bgPrimary,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          transform: getCardTransform(),
          transition: isDragging || skipTransitionRef.current
            ? 'none'
            : `transform ${CARD_TRANSITION}`,
          zIndex: 5,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Info button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 15,
            right: 8,
            zIndex: 10,
            width: INFO_SIZE,
            height: INFO_SIZE,
            borderRadius: 9999,
            background: colors.bgElevated,
            border: `1px solid ${colors.borderPrimary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            opacity: infoButtonVisible ? 1 : 0,
            transition: settled ? 'opacity 0.35s ease-out' : 'opacity 0.15s ease-out',
            pointerEvents: infoButtonVisible ? 'auto' : 'none',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18, color: colors.ivory }}>
            info
          </span>
        </button>

        {/* Swipe indicators */}
        {dragX > 40 && (
          <SwipeLabel label="LIKE" side="left" rotation="-12deg" />
        )}
        {dragX < -40 && (
          <SwipeLabel label="SKIP" side="right" rotation="12deg" />
        )}

        <div
          style={{
            background: colors.bgCardFront,
            height: `calc(100% - ${CARD_BOTTOM_H}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={currentItem.image}
            alt={currentItem.name}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            draggable={false}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 70% 65% at center 45%, transparent 35%, ${colors.bgCardFront} 90%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
        <div style={{ height: CARD_BOTTOM_H, padding: 16 }}>
          <p style={{ color: colors.ivory, fontSize: 16, fontWeight: 500, lineHeight: '20px', margin: 0 }}>
            {currentItem.name}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ color: colors.ivoryMuted, fontSize: 14, lineHeight: '20px' }}>
              {currentItem.brand}
            </span>
            <span style={{ color: colors.ivoryMuted, fontSize: 14, lineHeight: '20px', fontWeight: 600 }}>
              {currentItem.price}
            </span>
          </div>
        </div>
      </div>

      {/* Counter / Continue button */}
      <button
        onClick={onNext}
        style={{
          position: 'absolute',
          bottom: safeBottom(24),
          left: 16,
          right: 16,
          height: 48,
          borderRadius: 9999,
          fontSize: 16,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          padding: 0,
          transition: 'all 0.2s',
          background: colors.ivoryDeep,
          color: colors.textDark,
          cursor: 'pointer',
          animation: 'fadeInUp 350ms ease-out 400ms both',
        }}
      >
        {selectedCount >= 10 ? 'Continue' : `${selectedCount}/10 Selected`}
      </button>

      {/* Info overlay */}
      {showInfo && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'flex-end' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17,17,17,0.6)',
              animation: 'fadeInBackdrop 250ms ease-out both',
            }}
            onClick={() => setShowInfo(false)}
          />
          <div
            style={{
              position: 'relative',
              background: colors.bgCard,
              borderRadius: 24,
              width: 'calc(100% - 32px)',
              margin: `0 16px calc(20px + env(safe-area-inset-bottom, 0px))`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              animation: 'slideUpModal 300ms ease-out both',
            }}
          >
            <p style={{ color: colors.ivory, fontSize: 14, lineHeight: '20px', margin: 0 }}>
              {currentItem.description}
            </p>
            <button
              onClick={() => setShowInfo(false)}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 9999,
                background: '#3f3f3f',
                color: colors.ivory,
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </ScreenLayout>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function SwipeLabel({
  label,
  side,
  rotation,
}: {
  label: string;
  side: 'left' | 'right';
  rotation: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        [side]: 24,
        zIndex: 10,
        background: 'rgba(245, 240, 232, 0.15)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: colors.ivory,
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.06em',
        transform: `rotate(${rotation})`,
        border: '1px solid rgba(245, 240, 232, 0.25)',
      }}
    >
      {label}
    </div>
  );
}
