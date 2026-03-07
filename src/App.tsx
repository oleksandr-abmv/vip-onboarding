import { useState, useCallback, useRef, useMemo } from 'react';
import PhoneFrame from './components/PhoneFrame';
import WelcomeScreen from './screens/WelcomeScreen';
import GenderScreen from './screens/GenderScreen';
import InterestsScreen from './screens/InterestsScreen';
import CategoryQuestions from './screens/CategoryQuestions';
import type { CategoryQuestionsHandle } from './screens/CategoryQuestions';
import ProductPicks from './screens/ProductPicks';
import TasteProfile from './screens/TasteProfile';
import TailoringScreen from './screens/TailoringScreen';
import { theme, safeTop } from './theme';
import { computeProfile } from './utils/profileLogic';
import type { CategoryAnswerSet } from './utils/profileLogic';
import { categoryConfigs } from './data/categoryConfig';


type Screen = 'welcome' | 'gender' | 'interests' | 'categoryQuestions' | 'products' | 'profile' | 'tailoring';

const SCREEN_ORDER: Screen[] = ['welcome', 'gender', 'interests', 'categoryQuestions', 'products', 'profile', 'tailoring'];

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [exitingScreen, setExitingScreen] = useState<Screen | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const transitionRef = useRef<number | null>(null);
  const categoryQuestionsRef = useRef<CategoryQuestionsHandle>(null);

  // Onboarding state
  const [gender, setGender] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [categoryAnswers, setCategoryAnswers] = useState<Record<string, CategoryAnswerSet>>({});
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);

  // Total steps: gender + interests + categoryQuestions + products + profile
  const totalSteps = 5;

  const profile = useMemo(
    () => computeProfile(categoryAnswers, likedProducts, selectedInterests),
    [categoryAnswers, likedProducts, selectedInterests],
  );

  const goTo = useCallback(
    (next: Screen, dir: 'forward' | 'back') => {
      if (transitionRef.current) return;
      setDirection(dir);
      setExitingScreen(screen);
      setScreen(next);
      transitionRef.current = window.setTimeout(() => {
        setExitingScreen(null);
        transitionRef.current = null;
      }, 400);
    },
    [screen],
  );

  // Navigation handlers
  const handleWelcomeNext = useCallback(() => goTo('gender', 'forward'), [goTo]);
  const handleGenderNext = useCallback(() => goTo('interests', 'forward'), [goTo]);
  const handleGenderBack = useCallback(() => goTo('welcome', 'back'), [goTo]);
  const handleInterestsNext = useCallback(() => goTo('categoryQuestions', 'forward'), [goTo]);
  const handleInterestsBack = useCallback(() => goTo('gender', 'back'), [goTo]);
  const handleCategoryNext = useCallback(() => goTo('products', 'forward'), [goTo]);
  const handleCategoryBack = useCallback(() => goTo('interests', 'back'), [goTo]);
  const handleProductsNext = useCallback(() => goTo('profile', 'forward'), [goTo]);
  const handleProductsBack = useCallback(() => goTo('categoryQuestions', 'back'), [goTo]);
  const handleProfileNext = useCallback(() => goTo('tailoring', 'forward'), [goTo]);

  const handleSkip = useCallback(() => {
    const idx = SCREEN_ORDER.indexOf(screen);
    const next = SCREEN_ORDER[idx + 1];
    if (next) goTo(next, 'forward');
  }, [screen, goTo]);

  // Nav visibility — hidden on welcome, profile, and tailoring
  const showBack = screen !== 'welcome' && screen !== 'tailoring';
  const showSkip = screen !== 'welcome' && screen !== 'gender' && screen !== 'profile' && screen !== 'tailoring';

  const handleBack = useCallback(() => {
    switch (screen) {
      case 'gender': handleGenderBack(); break;
      case 'interests': handleInterestsBack(); break;
      case 'categoryQuestions': categoryQuestionsRef.current?.goBack(); break;
      case 'products': handleProductsBack(); break;
      case 'profile': goTo('products', 'back'); break;
    }
  }, [screen, handleGenderBack, handleInterestsBack, handleCategoryBack, handleProductsBack]);

  const handleTailoringComplete = useCallback(() => {
    /* Navigate to chat or next experience */
  }, []);

  const renderScreen = (s: Screen) => {
    switch (s) {
      case 'welcome':
        return <WelcomeScreen onNext={handleWelcomeNext} />;
      case 'gender':
        return (
          <GenderScreen
            onNext={handleGenderNext}
            gender={gender}
            onGenderChange={setGender}
            totalSteps={totalSteps}
          />
        );
      case 'interests':
        return (
          <InterestsScreen
            onNext={handleInterestsNext}
            selectedInterests={selectedInterests}
            onSelectionsChange={setSelectedInterests}
            totalSteps={totalSteps}
          />
        );
      case 'categoryQuestions':
        return (
          <CategoryQuestions
            ref={categoryQuestionsRef}
            selectedInterests={selectedInterests}
            categoryAnswers={categoryAnswers}
            onCategoryAnswersChange={setCategoryAnswers}
            onNext={handleCategoryNext}
            onBack={handleCategoryBack}
            totalSteps={totalSteps}
            onCategoryIdxChange={setCurrentCategoryIdx}
          />
        );
      case 'products':
        return (
          <ProductPicks
            onNext={handleProductsNext}
            selectedInterests={selectedInterests}
            likedProducts={likedProducts}
            onLikedChange={setLikedProducts}
            totalSteps={totalSteps}
          />
        );
      case 'profile':
        return (
          <TasteProfile
            profile={profile}
            selectedInterests={selectedInterests}
            categoryAnswers={categoryAnswers}
            likedProducts={likedProducts}
            onFinish={handleProfileNext}
            totalSteps={totalSteps}
          />
        );
      case 'tailoring':
        return <TailoringScreen onComplete={handleTailoringComplete} />;
    }
  };

  const enterAnim = direction === 'forward' ? 'screenEnterFromRight' : 'screenEnterFromLeft';
  const exitAnim = direction === 'forward' ? 'screenExitToLeft' : 'screenExitToRight';

  return (
    <PhoneFrame>
      {/* Persistent background */}
      <div style={{ position: 'absolute', inset: 0, background: theme.colors.background }} />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: screen !== 'welcome' && screen !== 'tailoring' ? 1 : 0,
          transition: 'opacity 600ms ease',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 70%)',
        }}
      />

      {/* Screen content area */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {exitingScreen && (
          <div
            key={`exit-${exitingScreen}`}
            style={{
              position: 'absolute',
              inset: 0,
              animation: `${exitAnim} 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {renderScreen(exitingScreen)}
          </div>
        )}
        <div
          key={screen}
          style={{
            position: 'absolute',
            inset: 0,
            animation: exitingScreen
              ? `${enterAnim} 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`
              : 'none',
            zIndex: 2,
          }}
        >
          {renderScreen(screen)}
        </div>
      </div>

      {/* Persistent top nav bar with gradient background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${safeTop(16)} 20px 12px`,
          background: screen === 'welcome' ? 'transparent' : `linear-gradient(to bottom, ${theme.colors.background} 60%, transparent)`,
          pointerEvents: 'none',
        }}
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: showBack ? 'pointer' : 'default',
            padding: 0,
            opacity: showBack ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: showBack ? 'auto' : 'none',
          }}
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path
              d="M9 1L1 9L9 17"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Progress bar in nav center */}
        {screen !== 'welcome' && screen !== 'tailoring' && (() => {
          let currentStep = 0;
          switch (screen) {
            case 'gender': currentStep = 1; break;
            case 'interests': currentStep = 2; break;
            case 'categoryQuestions': currentStep = 3; break;
            case 'products': currentStep = 4; break;
            case 'profile': currentStep = 5; break;
          }
          const pct = (currentStep / totalSteps) * 100;
          return (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 3,
                borderRadius: 1.5,
                background: '#333',
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 1.5,
                  background: '#fff',
                  transition: 'width 300ms ease',
                }}
              />
            </div>
          );
        })()}

        {/* Skip button */}
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            cursor: showSkip ? 'pointer' : 'default',
            fontSize: 16,
            fontWeight: 500,
            color: theme.colors.textMuted,
            lineHeight: '44px',
            padding: '0 4px',
            minHeight: 44,
            opacity: showSkip ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: showSkip ? 'auto' : 'none',
          }}
        >
          Skip
        </button>
      </div>
    </PhoneFrame>
  );
}

export default App;
