import { useState, useEffect } from 'react';
import { theme } from '../theme';
import { categoryConfigs } from '../data/categoryConfig';
import type { TasteProfile as TasteProfileType } from '../utils/profileLogic';
import type { CategoryAnswerSet } from '../utils/profileLogic';


interface TasteProfileProps {
  profile: TasteProfileType;
  selectedInterests: string[];
  categoryAnswers: Record<string, CategoryAnswerSet>;
  likedProducts: string[];
  onFinish: () => void;
}

const PARTICLES = ['auto_awesome', 'diamond', 'stars', 'flare', 'auto_awesome', 'star'];

export default function TasteProfile({
  profile,
  selectedInterests,
  categoryAnswers,
  likedProducts,
  onFinish,
}: TasteProfileProps) {
  const [typedLabel, setTypedLabel] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedLabel(profile.vibeLabel.slice(0, i));
      if (i >= profile.vibeLabel.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [profile.vibeLabel]);

  // Build category summaries
  const categorySummaries = selectedInterests
    .filter((id) => categoryAnswers[id]?.budget)
    .map((id) => {
      const config = categoryConfigs[id];
      const answers = categoryAnswers[id];
      if (!config || !answers?.budget) return null;
      const tier = config.budgetTiers.find((t) => t.id === answers.budget);
      return tier ? `${config.name}: ${tier.label}` : null;
    })
    .filter(Boolean) as string[];

  // Build preference highlights from answers
  const prefHighlights: string[] = [];
  Object.entries(categoryAnswers).forEach(([catId, answers]) => {
    const config = categoryConfigs[catId];
    if (!config) return;
    config.questions.forEach((q, qi) => {
      const val = qi === 0 ? answers.q1 : answers.q2;
      if (!val) return;
      const values = Array.isArray(val) ? val : [val];
      values.forEach((v) => {
        const opt = q.options.find((o) => o.id === v);
        if (opt && prefHighlights.length < 4) prefHighlights.push(opt.label);
      });
    });
  });

  const interestIcons = selectedInterests.slice(0, 5).map((id) => {
    const config = categoryConfigs[id];
    return config ? config.icon : '';
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 24px 20px',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Celebration particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {PARTICLES.map((icon, i) => (
          <span
            key={i}
            className="material-symbols-rounded"
            style={{
              position: 'absolute',
              left: `${12 + i * 15}%`,
              top: '55%',
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.15)',
              animation: `floatUp 2.5s ease-out ${600 + i * 200}ms both`,
            }}
          >
            {icon}
          </span>
        ))}
      </div>

      {/* Spacer top */}
      <div style={{ flex: 1, zIndex: 1 }} />

      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          textAlign: 'center',
          lineHeight: '34px',
          margin: 0,
          marginBottom: 22,
          zIndex: 1,
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
        }}
      >
        Your Taste Profile
      </h1>

      {/* Profile Card */}
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.colors.profileGradientStart}, ${theme.colors.profileGradientEnd})`,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 18,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 340,
          zIndex: 1,
          overflow: 'hidden',
          animation: `scaleIn 500ms ${theme.animation.spring} 200ms both, glowPulse 3s ease-in-out 1.5s infinite`,
        }}
      >
        {/* Shimmer overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            borderRadius: 18,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
              animation: 'shimmerSweep 2.5s ease-in-out 800ms',
            }}
          />
        </div>

        {/* Vibe label */}
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            lineHeight: '34px',
            margin: 0,
            marginBottom: 18,
            minHeight: '1.4em',
          }}
        >
          {typedLabel}
          <span
            style={{
              opacity: typedLabel.length < profile.vibeLabel.length ? 1 : 0,
              transition: 'opacity 200ms',
              fontWeight: 300,
            }}
          >
            |
          </span>
        </h2>

        {/* Interest icon pills */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {interestIcons.map((icon, i) => (
            <span
              key={i}
              style={{
                background: theme.colors.tagBg,
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `scaleIn 300ms ${theme.animation.spring} ${500 + i * 80}ms both`,
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#bbb' }}>{icon}</span>
            </span>
          ))}
        </div>

        {/* Category summary */}
        {categorySummaries.length > 0 && (
          <p
            style={{
              fontSize: 14,
              color: '#999',
              textAlign: 'center',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: 14,
              animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 700ms both',
            }}
          >
            {categorySummaries.join(' \u00B7 ')}
          </p>
        )}

        {/* Preference highlights */}
        {prefHighlights.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 14,
              animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 800ms both',
            }}
          >
            {prefHighlights.map((h) => (
              <span
                key={h}
                style={{
                  background: theme.colors.tagBg,
                  border: `1px solid ${theme.colors.tagBorder}`,
                  borderRadius: 100,
                  padding: '6px 16px',
                  fontSize: 13,
                  color: '#bbb',
                  lineHeight: '18px',
                }}
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p
          style={{
            fontSize: 15,
            color: theme.colors.textMuted,
            textAlign: 'center',
            lineHeight: '22px',
            margin: 0,
            marginBottom: likedProducts.length > 0 ? 12 : 0,
            animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 900ms both',
          }}
        >
          {profile.description}
        </p>

        {/* Liked count */}
        {likedProducts.length > 0 && (
          <p
            style={{
              fontSize: 14,
              color: theme.colors.textTertiary,
              textAlign: 'center',
              lineHeight: '20px',
              margin: 0,
              animation: 'fadeIn 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 1000ms both',
            }}
          >
            {likedProducts.length} items liked, shaping your taste profile
          </p>
        )}
      </div>

      {/* Spacer bottom */}
      <div style={{ flex: 1, zIndex: 1 }} />

      {/* CTA */}
      <button
        onClick={onFinish}
        style={{
          width: '100%',
          maxWidth: 340,
          height: 56,
          flexShrink: 0,
          zIndex: 1,
          background: theme.colors.ctaPrimary,
          color: theme.colors.ctaPrimaryText,
          border: 'none',
          borderRadius: 100,
          fontSize: 18,
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '-0.2px',
          animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 1100ms both, gentlePulse 2s ease-in-out 2s infinite',
        }}
      >
        Enter the experience
      </button>
    </div>
  );
}
