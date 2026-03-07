import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { theme, safeTop } from '../theme';
import { categoryConfigs, genericBudgetTiers } from '../data/categoryConfig';
import type { CategoryAnswerSet } from '../utils/profileLogic';


export interface CategoryQuestionsHandle {
  goBack: () => void;
  getCurrentIdx: () => number;
}

interface CategoryQuestionsProps {
  selectedInterests: string[];
  categoryAnswers: Record<string, CategoryAnswerSet>;
  onCategoryAnswersChange: (answers: Record<string, CategoryAnswerSet>) => void;
  onNext: () => void;
  onBack: () => void;
  totalSteps: number;
  onCategoryIdxChange?: (idx: number) => void;
}

const CategoryQuestions = forwardRef<CategoryQuestionsHandle, CategoryQuestionsProps>(function CategoryQuestions({
  selectedInterests,
  categoryAnswers,
  onCategoryAnswersChange,
  onNext,
  onBack,
  totalSteps,
  onCategoryIdxChange,
}, ref) {
  const categories = selectedInterests.length > 0 ? selectedInterests : ['_generic'];
  const isGeneric = categories[0] === '_generic';
  const total = categories.length;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [slideDir, setSlideDir] = useState<'enter' | 'exit' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Local state for current page
  const currentCat = categories[currentIdx];
  const config = isGeneric ? null : categoryConfigs[currentCat];
  const budgetTiers = config ? config.budgetTiers : genericBudgetTiers;

  const existing = categoryAnswers[currentCat];
  const [selectedBudget, setSelectedBudget] = useState<string | null>(existing?.budget ?? null);
  const [q1Answer, setQ1Answer] = useState<string | string[] | null>(existing?.q1 ?? null);
  const [q2Answer, setQ2Answer] = useState<string | string[] | null>(existing?.q2 ?? null);

  // Restore answers and scroll to top when navigating between categories
  useEffect(() => {
    const ex = categoryAnswers[categories[currentIdx]];
    setSelectedBudget(ex?.budget ?? null);
    setQ1Answer(ex?.q1 ?? null);
    setQ2Answer(ex?.q2 ?? null);
    scrollRef.current?.scrollTo(0, 0);
    onCategoryIdxChange?.(currentIdx);
  }, [currentIdx, categoryAnswers, categories, onCategoryIdxChange]);

  const saveCurrentAnswers = () => {
    const updated = {
      ...categoryAnswers,
      [currentCat]: { budget: selectedBudget, q1: q1Answer, q2: q2Answer },
    };
    onCategoryAnswersChange(updated);
    return updated;
  };

  const handleContinue = () => {
    saveCurrentAnswers();
    if (currentIdx < total - 1) {
      setSlideDir('exit');
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
        setSlideDir('enter');
      }, 200);
    } else {
      onNext();
    }
  };

  const goBack = () => {
    saveCurrentAnswers();
    if (currentIdx > 0) {
      setSlideDir('exit');
      setTimeout(() => {
        setCurrentIdx((i) => i - 1);
        setSlideDir('enter');
      }, 200);
    } else {
      onBack();
    }
  };

  useImperativeHandle(ref, () => ({ goBack, getCurrentIdx: () => currentIdx }));


  const toggleChip = (
    questionIdx: number,
    multiSelect: boolean,
    value: string,
  ) => {
    const getter = questionIdx === 0 ? q1Answer : q2Answer;
    const setter = questionIdx === 0 ? setQ1Answer : setQ2Answer;

    if (multiSelect) {
      const arr = Array.isArray(getter) ? getter : [];
      setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
    } else {
      setter(getter === value ? null : value);
    }
  };

  const isChipSelected = (questionIdx: number, multiSelect: boolean, value: string): boolean => {
    const current = questionIdx === 0 ? q1Answer : q2Answer;
    if (multiSelect) return Array.isArray(current) && current.includes(value);
    return current === value;
  };

  const title = isGeneric
    ? 'What feels right for a special piece?'
    : `Tell us about ${config!.name}`;

  const progressStep = 2 + currentIdx + 1;

  const chipStyle = (sel: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: sel ? '#1a1a1a' : theme.colors.surface,
    border: `1.5px solid ${sel ? '#fff' : '#333'}`,
    borderRadius: 22,
    padding: '9px 15px',
    cursor: 'pointer',
    transition: 'background 150ms ease, border-color 150ms ease',
    boxShadow: sel ? '0 0 10px rgba(255,255,255,0.06)' : 'none',
    flexShrink: 0,
  });

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
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: theme.spacing.screenPadding,
          paddingTop: safeTop(68),
          paddingBottom: 0,
        }}
      >
        <div
          key={currentIdx}
          style={{
            animation: slideDir === 'enter'
              ? 'pairEnterFromRight 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both'
              : slideDir === 'exit'
                ? 'pairExitToLeft 250ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards'
                : 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 80ms both',
          }}
        >
          {/* Category headline */}
          {!isGeneric && config && (
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: 0,
                marginBottom: 8,
              }}
            >
              {config.name}
            </p>
          )}

          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              lineHeight: '32px',
              margin: 0,
              marginBottom: 6,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: theme.colors.textMuted,
              lineHeight: '20px',
              margin: 0,
              marginBottom: 20,
            }}
          >
            {isGeneric
              ? "We'll curate around what feels right."
              : 'This helps us find the best matches for you.'}
          </p>

          {/* Budget tiers — chips */}
          <div style={{ marginBottom: 18 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.colors.textSecondary,
                margin: 0,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Budget range
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {budgetTiers.map((tier) => {
                const sel = selectedBudget === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedBudget(sel ? null : tier.id)}
                    style={chipStyle(sel)}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: sel ? '#fff' : '#bbb',
                        lineHeight: '18px',
                        transition: 'color 150ms ease',
                      }}
                    >
                      {tier.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context questions — chips */}
          {config?.questions.map((question, qi) => (
            <div key={question.id} style={{ marginBottom: 18 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: theme.colors.textSecondary,
                  margin: 0,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {question.label}
                {question.multiSelect && (
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6, color: '#555' }}>
                    pick any
                  </span>
                )}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {question.options.map((opt) => {
                  const sel = isChipSelected(qi, question.multiSelect, opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleChip(qi, question.multiSelect, opt.id)}
                      style={chipStyle(sel)}
                    >
                      {opt.icon && (
                        <span
                          className="material-symbols-rounded"
                          style={{
                            fontSize: 19,
                            color: sel ? '#fff' : '#888',
                            transition: 'color 150ms ease',
                          }}
                        >
                          {opt.icon}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: sel ? '#fff' : '#bbb',
                          lineHeight: '18px',
                          transition: 'color 150ms ease',
                        }}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        style={{
          flexShrink: 0,
          padding: `14px ${theme.spacing.screenPadding} calc(4px + env(safe-area-inset-bottom, 0px))`,
          background: `linear-gradient(to top, ${theme.colors.background} 70%, transparent)`,
        }}
      >
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            height: 52,
            background: theme.colors.ctaPrimary,
            color: theme.colors.ctaPrimaryText,
            border: 'none',
            borderRadius: 100,
            fontSize: 17,
            fontWeight: 500,
            cursor: 'pointer',
            animation: 'fadeInUp 400ms cubic-bezier(0.25, 0.1, 0.25, 1) 320ms both',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
});

export default CategoryQuestions;
