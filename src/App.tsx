import { useState, useCallback, useRef, useMemo, useLayoutEffect, type ReactNode } from 'react';
import PhoneFrame from './components/PhoneFrame';
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingGateScreen from './screens/OnboardingGateScreen';
import GenderScreen from './screens/GenderScreen';
import LifestyleScreen from './screens/LifestyleScreen';
import LifestyleTypeScreen from './screens/LifestyleTypeScreen';
import KidsScreen from './screens/KidsScreen';
import InterestsScreen from './screens/InterestsScreen';
import SubcategoryScreen from './screens/SubcategoryScreen';
import RefineYourTaste from './screens/RefineYourTaste';
import NotificationsScreen from './screens/NotificationsScreen';
import TailoringScreen from './screens/TailoringScreen';
import { theme, safeTop } from './theme';


type Screen =
  | 'welcome'
  | 'onboardingGate'
  | 'gender'
  | 'lifestyle'
  | 'kids'
  | 'lifestyleType'
  | 'interests'
  | 'subcategory'
  | 'products'
  | 'notifications'
  | 'tailoring';

// Screen order for reference
// const SCREEN_ORDER: Screen[] = ['welcome', 'gender', 'interests', 'subcategory', 'products', 'tailoring'];

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [exitingScreen, setExitingScreen] = useState<Screen | null>(null);
  // Snapshot of the exiting screen's JSX - keeps old state visible during transition
  const [exitingContent, setExitingContent] = useState<ReactNode>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const transitionRef = useRef<number | null>(null);
  // Onboarding state
  const [gender, setGender] = useState<string | null>(null);
  const [lifestyle, setLifestyle] = useState<string | null>(null);
  const [lifestyleType, setLifestyleType] = useState<string | null>(null);
  const [kidsCount, setKidsCount] = useState<number>(2);
  const [kidsAges, setKidsAges] = useState<(number | null)[]>([null, null]);
  const [kidsNames, setKidsNames] = useState<(string | null)[]>([null, null]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<string, string[]>>({});
  // Free-form "custom" text per category, captured when user picks the Custom tile on a Subcategory screen.
  const [customByCategory, setCustomByCategory] = useState<Record<string, string>>({});
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // Track which interest category we're currently processing (subcategory + products)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Step map:
  //   gender · lifestyle · [kids if family] · lifestyleType · interests
  //   · subcategory (one per selected category) · products (unified) · notifications
  const catCount = Math.max(selectedInterests.length, 1);
  const hasKidsStep = lifestyle === 'family';
  const totalSteps = 6 + (hasKidsStep ? 1 : 0) + catCount;

  // Ref to renderScreen so goTo can capture a snapshot of the current screen's JSX
  // before state updates propagate (keeps the exit animation visually consistent).
  const renderScreenRef = useRef<((s: Screen) => ReactNode) | null>(null);

  const goTo = useCallback(
    (next: Screen, dir: 'forward' | 'back') => {
      if (transitionRef.current) return;
      setDirection(dir);
      // Snapshot the current screen's JSX using state values at call time
      const snapshot = renderScreenRef.current ? renderScreenRef.current(screen) : null;
      setExitingContent(snapshot);
      setExitingScreen(screen);
      setScreen(next);
      setOverlayVisible(false);
      transitionRef.current = window.setTimeout(() => {
        setExitingScreen(null);
        setExitingContent(null);
        transitionRef.current = null;
      }, 400);
    },
    [screen],
  );

  // Navigation handlers
  const handleWelcomeNext = useCallback(() => goTo('onboardingGate', 'forward'), [goTo]);
  const handleGateStart = useCallback(() => goTo('gender', 'forward'), [goTo]);
  // Skipping onboarding jumps straight to the final Tailoring screen (baseline experience).
  const handleGateSkip = useCallback(() => goTo('tailoring', 'forward'), [goTo]);
  const handleGenderNext = useCallback(() => goTo('lifestyle', 'forward'), [goTo]);
  const handleGenderBack = useCallback(() => goTo('onboardingGate', 'back'), [goTo]);
  const handleLifestyleNext = useCallback(
    () => goTo(lifestyle === 'family' ? 'kids' : 'lifestyleType', 'forward'),
    [goTo, lifestyle],
  );
  const handleLifestyleBack = useCallback(() => goTo('gender', 'back'), [goTo]);
  const handleKidsNext = useCallback(() => goTo('lifestyleType', 'forward'), [goTo]);
  const handleKidsBack = useCallback(() => goTo('lifestyle', 'back'), [goTo]);
  const handleKidsSkip = useCallback(() => {
    // Clear any partially-entered ages/names so downstream screens treat it as "no kids data".
    setKidsAges(Array(kidsCount).fill(null));
    setKidsNames(Array(kidsCount).fill(null));
    goTo('lifestyleType', 'forward');
  }, [goTo, kidsCount]);
  const handleLifestyleTypeNext = useCallback(() => goTo('interests', 'forward'), [goTo]);
  const handleLifestyleTypeBack = useCallback(
    () => goTo(lifestyle === 'family' ? 'kids' : 'lifestyle', 'back'),
    [goTo, lifestyle],
  );

  const handleInterestsNext = useCallback(() => {
    if (selectedInterests.length > 0) {
      setCurrentCategoryIndex(0);
      goTo('subcategory', 'forward');
    } else {
      // No interests picked → skip subcategories and go to the unified products swipe
      goTo('products', 'forward');
    }
  }, [goTo, selectedInterests]);

  const handleInterestsBack = useCallback(() => goTo('lifestyleType', 'back'), [goTo]);

  // Flow: subcategory for each selected category sequentially → unified products swipe
  //       → notifications → tailoring

  const handleSubcategoryNext = useCallback(() => {
    if (currentCategoryIndex < selectedInterests.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      goTo('subcategory', 'forward');
    } else {
      goTo('products', 'forward');
    }
  }, [goTo, currentCategoryIndex, selectedInterests]);

  // Skip keeps the same forward behavior (advance or land on products).
  const handleSubcategorySkip = handleSubcategoryNext;

  const handleSubcategoryBack = useCallback(() => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      goTo('subcategory', 'back');
    } else {
      goTo('interests', 'back');
    }
  }, [goTo, currentCategoryIndex]);

  const handleProductsNext = useCallback(() => goTo('notifications', 'forward'), [goTo]);

  const handleProductsBack = useCallback(() => {
    // Back from unified products → last selected category's subcategory (or interests if none)
    if (selectedInterests.length > 0) {
      setCurrentCategoryIndex(selectedInterests.length - 1);
      goTo('subcategory', 'back');
    } else {
      goTo('interests', 'back');
    }
  }, [goTo, selectedInterests]);

  const handleNotificationsNext = useCallback(() => goTo('tailoring', 'forward'), [goTo]);
  const handleNotificationsBack = useCallback(() => goTo('products', 'back'), [goTo]);

  // Nav visibility - welcome and tailoring render without top nav
  const showBack = screen !== 'welcome' && screen !== 'tailoring';
  const showHelp = screen !== 'welcome' && screen !== 'tailoring';

  const handleBack = useCallback(() => {
    switch (screen) {
      case 'onboardingGate': goTo('welcome', 'back'); break;
      case 'gender': handleGenderBack(); break;
      case 'lifestyle': handleLifestyleBack(); break;
      case 'kids': handleKidsBack(); break;
      case 'lifestyleType': handleLifestyleTypeBack(); break;
      case 'interests': handleInterestsBack(); break;
      case 'subcategory': handleSubcategoryBack(); break;
      case 'products': handleProductsBack(); break;
      case 'notifications': handleNotificationsBack(); break;
    }
  }, [screen, goTo, handleGenderBack, handleLifestyleBack, handleKidsBack, handleLifestyleTypeBack, handleInterestsBack, handleSubcategoryBack, handleProductsBack, handleNotificationsBack]);

  const handleTailoringComplete = useCallback(() => {
    /* Navigate to chat or next experience */
  }, []);

  // Current category for subcategory + products screens
  const currentCategoryId = selectedInterests[currentCategoryIndex] || '';

  // Unified swipe: pass ALL selected interests and their subcategories.
  // Memoized so the deck doesn't reshuffle on unrelated re-renders.
  const productsSelectedInterests = useMemo(
    () => [...selectedInterests],
    [selectedInterests],
  );
  const productsSubcategoriesMap = useMemo(
    () => {
      const map: Record<string, string[]> = {};
      for (const id of selectedInterests) {
        map[id] = subcategoriesByCategory[id] || [];
      }
      return map;
    },
    [selectedInterests, subcategoriesByCategory],
  );

  const renderScreen = (s: Screen): ReactNode => {
    switch (s) {
      case 'welcome':
        return <WelcomeScreen onNext={handleWelcomeNext} />;
      case 'onboardingGate':
        return (
          <OnboardingGateScreen
            onStart={handleGateStart}
            onSkip={handleGateSkip}
            onClose={() => goTo('welcome', 'back')}
          />
        );
      case 'gender':
        return (
          <GenderScreen
            onNext={handleGenderNext}
            gender={gender}
            onGenderChange={setGender}
          />
        );
      case 'lifestyle':
        return (
          <LifestyleScreen
            onNext={handleLifestyleNext}
            lifestyle={lifestyle}
            onLifestyleChange={setLifestyle}
          />
        );
      case 'kids':
        return (
          <KidsScreen
            onNext={handleKidsNext}
            onSkip={handleKidsSkip}
            kidsCount={kidsCount}
            onKidsCountChange={setKidsCount}
            kidsAges={kidsAges}
            onKidsAgesChange={setKidsAges}
            kidsNames={kidsNames}
            onKidsNamesChange={setKidsNames}
          />
        );
      case 'lifestyleType':
        return (
          <LifestyleTypeScreen
            onNext={handleLifestyleTypeNext}
            lifestyle={lifestyle}
            kidsAges={kidsAges}
            lifestyleType={lifestyleType}
            onLifestyleTypeChange={(v) => setLifestyleType(v || null)}
          />
        );
      case 'interests':
        return (
          <InterestsScreen
            onNext={handleInterestsNext}
            selectedInterests={selectedInterests}
            onSelectionsChange={setSelectedInterests}
            gender={gender}
          />
        );
      case 'subcategory':
        return (
          <SubcategoryScreen
            key={currentCategoryId}
            onNext={handleSubcategoryNext}
            onSkip={handleSubcategorySkip}
            categoryId={currentCategoryId}
            selectedSubcategories={subcategoriesByCategory[currentCategoryId] || []}
            onSelectionsChange={(subs) => setSubcategoriesByCategory(prev => ({ ...prev, [currentCategoryId]: subs }))}
            customText={customByCategory[currentCategoryId] || ''}
            onCustomTextChange={(text) => setCustomByCategory(prev => ({ ...prev, [currentCategoryId]: text }))}
            gender={gender}
          />
        );
      case 'products': {
        // Unified swipe deck: every selected category × subcategory in one stack
        return (
          <RefineYourTaste
            onNext={handleProductsNext}
            selectedInterests={productsSelectedInterests}
            subcategoriesByCategory={productsSubcategoriesMap}
            likedProducts={likedProducts}
            onLikedChange={setLikedProducts}
            onOverlayChange={setOverlayVisible}
            gender={gender}
          />
        );
      }
      case 'notifications':
        return <NotificationsScreen onNext={handleNotificationsNext} />;
      case 'tailoring':
        return <TailoringScreen onComplete={handleTailoringComplete} />;
    }
  };

  // Keep the ref updated so goTo can capture snapshots using current render's state.
  // useLayoutEffect runs synchronously after render but before paint, so the ref is
  // always fresh when goTo reads it in response to a user action.
  useLayoutEffect(() => {
    renderScreenRef.current = renderScreen;
  });

  // Progress bar calculation
  // Steps: gender(1) + lifestyle(2) + interests(3) + (subcategory+products) per category
  const getProgressPct = () => {
    const base = (() => {
      const kidsOffset = hasKidsStep ? 1 : 0;
      switch (screen) {
        case 'gender': return 1;
        case 'lifestyle': return 2;
        case 'kids': return 3;
        case 'lifestyleType': return 3 + kidsOffset;
        case 'interests': return 4 + kidsOffset;
        case 'subcategory': return 4 + kidsOffset + currentCategoryIndex + 1;
        case 'products': return 4 + kidsOffset + catCount + 1;
        case 'notifications': return 4 + kidsOffset + catCount + 2;
        default: return 0; // welcome, onboardingGate, tailoring
      }
    })();
    return (base / totalSteps) * 100;
  };

  const enterAnim = direction === 'forward' ? 'screenEnterFromRight' : 'screenEnterFromLeft';
  const exitAnim = direction === 'forward' ? 'screenExitToLeft' : 'screenExitToRight';

  return (
    <PhoneFrame>
      {/* Persistent background */}
      <div style={{ position: 'absolute', inset: 0, background: theme.colors.background }} />

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
            {exitingContent ?? renderScreen(exitingScreen)}
          </div>
        )}
        <div
          key={(screen === 'subcategory' || screen === 'products') ? `${screen}-${currentCategoryId}` : screen}
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

      {/* Persistent top nav bar - matches Figma: back arrow, center text, Help.
          Hidden on 'onboardingGate' which renders its own modal-style close button. */}
      {screen !== 'welcome' && screen !== 'onboardingGate' && screen !== 'tailoring' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            background: theme.colors.background,
            pointerEvents: 'none',
            display: overlayVisible ? 'none' : 'block',
          }}
        >
          {/* Nav row: back + center + help */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${safeTop(16)} 20px 12px`,
            }}
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              aria-label="Back"
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
                pointerEvents: showBack ? 'auto' : 'none',
              }}
            >
              <svg width="8" height="15" viewBox="0 0 8 15" fill="none">
                <path
                  d="M7 1L1 7.5L7 14"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Center text - counter on products screen */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {screen === 'products' && likedProducts.length > 0 && (
                <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>
                  {likedProducts.length} liked
                </span>
              )}
            </div>

            {/* Finish later - escape hatch to the baseline experience */}
            <button
              onClick={() => goTo('tailoring', 'forward')}
              aria-label="Finish personalization later"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 500,
                color: '#cdcdcd',
                lineHeight: '44px',
                padding: '0 4px',
                minHeight: 44,
                opacity: showHelp ? 1 : 0,
                pointerEvents: showHelp ? 'auto' : 'none',
              }}
            >
              Finish later
            </button>
          </div>

          {/* Full-width progress bar - thin line below nav */}
          <div
            style={{
              width: '100%',
              height: 3.4,
              background: '#212020',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${getProgressPct()}%`,
                background: '#f0f0f0',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Help overlay - bottom sheet style */}
      {helpOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setHelpOpen(false)}
            style={{
              position: 'absolute', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.75)',
              animation: 'backdropFadeIn 200ms ease both',
            }}
          />
          {/* Sheet */}
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 301,
              background: '#111',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85%',
              display: 'flex',
              flexDirection: 'column',
              animation: 'sheetSlideUp 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333' }} />
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 0' }}>
              {/* FAQ cards */}
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '0 0 10px', letterSpacing: '0.5px' }}>FAQ</p>
              {[
                { icon: 'diamond', q: 'What is VIP?', a: 'AI-powered concierge for the world\'s finest luxury goods, tailored to your taste.' },
                { icon: 'tune', q: 'How does personalization work?', a: 'Every selection trains the AI. The more you engage, the better your recommendations.' },
                { icon: 'shield', q: 'Is my data private?', a: 'Encrypted and never shared. Update or reset your preferences anytime.' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: '#1a1a1a', borderRadius: 12, padding: '14px 16px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#888' }}>{s.icon}</span>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', margin: 0 }}>{s.q}</p>
                  </div>
                  <p style={{ fontSize: 13, color: '#999', margin: '6px 0 0', lineHeight: '18px', paddingLeft: 26 }}>{s.a}</p>
                </div>
              ))}

              {/* Contact section */}
              <p style={{ fontSize: 11, fontWeight: 500, color: '#666', textTransform: 'uppercase', margin: '20px 0 10px', letterSpacing: '0.5px' }}>Contact</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  { icon: 'chat', label: 'Live Chat', sub: '24/7' },
                  { icon: 'call', label: 'WhatsApp', sub: 'Instant' },
                  { icon: 'mail', label: 'Email', sub: 'Reply within 1 hour' },
                ].map((c, i) => (
                  <button
                    key={i}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '16px 8px', background: '#1a1a1a', border: 'none', borderRadius: 12, cursor: 'pointer',
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#fff', opacity: 0.6 }}>{c.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{c.label}</span>
                    <span style={{ fontSize: 11, color: '#666' }}>{c.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Close */}
            <div style={{ flexShrink: 0, padding: `12px 20px calc(24px + env(safe-area-inset-bottom, 0px))` }}>
              <button
                onClick={() => setHelpOpen(false)}
                style={{
                  width: '100%', height: 44, background: '#242424', color: '#fff',
                  border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </PhoneFrame>
  );
}

export default App;
