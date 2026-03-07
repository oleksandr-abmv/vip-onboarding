import { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from 'react';
import { theme, safeTop } from '../theme';
import ProgressBar from '../components/ProgressBar';
import BudgetRangeSlider from '../components/BudgetRangeSlider';
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

  // Parse existing budget into range indices
  const parseBudgetRange = (budget: CategoryAnswerSet['budget']): [number, number] => {
    if (Array.isArray(budget)) return budget;
    return [0, budgetTiers.length - 1]; // default: full range
  };

  const [budgetRange, setBudgetRange] = useState<[number, number]>(() => parseBudgetRange(existing?.budget));
  const [q1Answer, setQ1Answer] = useState<string | string[] | null>(existing?.q1 ?? null);
  const [q2Answer, setQ2Answer] = useState<string | string[] | null>(existing?.q2 ?? null);

  // Restore answers and scroll to top when navigating between categories
  useEffect(() => {
    const ex = categoryAnswers[categories[currentIdx]];
    const tiers = (isGeneric ? null : categoryConfigs[categories[currentIdx]])
      ? categoryConfigs[categories[currentIdx]].budgetTiers
      : genericBudgetTiers;
    if (ex?.budget && Array.isArray(ex.budget)) {
      setBudgetRange(ex.budget);
    } else {
      setBudgetRange([0, tiers.length - 1]);
    }
    setQ1Answer(ex?.q1 ?? null);
    setQ2Answer(ex?.q2 ?? null);
    scrollRef.current?.scrollTo(0, 0);
    onCategoryIdxChange?.(currentIdx);
  }, [currentIdx, categoryAnswers, categories, onCategoryIdxChange, isGeneric]);

  const saveCurrentAnswers = () => {
    const updated = {
      ...categoryAnswers,
      [currentCat]: { budget: budgetRange as [number, number], q1: q1Answer, q2: q2Answer },
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

  const handleBudgetChange = useCallback((min: number, max: number) => {
    setBudgetRange([min, max]);
  }, []);

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
      <ProgressBar step={progressStep} totalSteps={totalSteps} />

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
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              lineHeight: '32px',
              margin: 0,
              marginBottom: 8,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 15,
              color: theme.colors.textMuted,
              lineHeight: '22px',
              margin: 0,
              marginBottom: 22,
            }}
          >
            {isGeneric
              ? "We'll curate around what feels right."
              : 'This helps us find the best matches for you.'}
          </p>

          {/* Budget range slider */}
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: theme.colors.textSecondary,
                margin: 0,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Budget range
            </p>
            <BudgetRangeSlider
              tiers={budgetTiers}
              selectedMin={budgetRange[0]}
              selectedMax={budgetRange[1]}
              onChange={handleBudgetChange}
            />
          </div>

          {/* Context questions */}
          {config?.questions.map((question, qi) => (
            <div key={question.id} style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.colors.textSecondary,
                  margin: 0,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {question.label}
                {question.multiSelect && (
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6, color: '#555' }}>
                    select multiple
                  </span>
                )}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {question.options.map((opt) => {
                  const sel = isChipSelected(qi, question.multiSelect, opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleChip(qi, question.multiSelect, opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: sel ? '#1a1a1a' : theme.colors.surface,
                        border: `1.5px solid ${sel ? '#fff' : '#333'}`,
                        borderRadius: 12,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        transition: 'border-color 150ms ease, background 150ms ease',
                      }}
                    >
                      {opt.icon && (
                        <span
                          className="material-symbols-rounded"
                          style={{
                            fontSize: 22,
                            color: sel ? '#fff' : '#666',
                            transition: 'color 150ms ease',
                            flexShrink: 0,
                          }}
                        >
                          {opt.icon}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          color: sel ? theme.colors.textPrimary : '#bbb',
                          lineHeight: '20px',
                          flex: 1,
                          textAlign: 'left',
                        }}
                      >
                        {opt.label}
                      </span>
                      {sel && (
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#000' }}>
                            check
                          </span>
                        </div>
                      )}
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
