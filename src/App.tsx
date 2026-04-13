import { useState, useCallback, useRef } from 'react';
import PhoneFrame from './components/PhoneFrame';
import WelcomeScreen from './screens/WelcomeScreen';
import GenderScreen from './screens/GenderScreen';
import LifestyleScreen from './screens/LifestyleScreen';
import InterestsScreen from './screens/InterestsScreen';
import SubcategoryScreen from './screens/SubcategoryScreen';
import RefineYourTaste from './screens/RefineYourTaste';
import TailoringScreen from './screens/TailoringScreen';
import { theme, safeTop } from './theme';


type Screen = 'welcome' | 'gender' | 'lifestyle' | 'interests' | 'subcategory' | 'products' | 'tailoring';

// Screen order for reference
// const SCREEN_ORDER: Screen[] = ['welcome', 'gender', 'interests', 'subcategory', 'products', 'tailoring'];

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [exitingScreen, setExitingScreen] = useState<Screen | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const transitionRef = useRef<number | null>(null);
  // Onboarding state
  const [gender, setGender] = useState<string | null>(null);
  const [lifestyle, setLifestyle] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<string, string[]>>({});
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // Track which interest category we're currently processing (subcategory + products)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Total steps: gender + lifestyle + interests + (subcategory + products) per category
  const catCount = Math.max(selectedInterests.length, 1);
  const totalSteps = 3 + catCount * 2;

  const goTo = useCallback(
    (next: Screen, dir: 'forward' | 'back') => {
      if (transitionRef.current) return;
      setDirection(dir);
      setExitingScreen(screen);
      setScreen(next);
      setOverlayVisible(false);
      transitionRef.current = window.setTimeout(() => {
        setExitingScreen(null);
        transitionRef.current = null;
      }, 400);
    },
    [screen],
  );

  // Navigation handlers
  const handleWelcomeNext = useCallback(() => goTo('gender', 'forward'), [goTo]);
  const handleGenderNext = useCallback(() => goTo('lifestyle', 'forward'), [goTo]);
  const handleGenderBack = useCallback(() => goTo('welcome', 'back'), [goTo]);
  const handleLifestyleNext = useCallback(() => goTo('interests', 'forward'), [goTo]);
  const handleLifestyleBack = useCallback(() => goTo('gender', 'back'), [goTo]);

  const handleInterestsNext = useCallback(() => {
    if (selectedInterests.length > 0) {
      setCurrentCategoryIndex(0);
      goTo('subcategory', 'forward');
    } else {
      goTo('tailoring', 'forward');
    }
  }, [goTo, selectedInterests]);

  const handleInterestsBack = useCallback(() => goTo('lifestyle', 'back'), [goTo]);

  // Flow: for each category → subcategory → products → next category → ... → tailoring

  // After picking subcategories for a category, go to that category's products
  const handleSubcategoryNext = useCallback(() => {
    goTo('products', 'forward');
  }, [goTo]);

  // Skip subcategories for this category — still go to products for it
  const handleSubcategorySkip = useCallback(() => {
    goTo('products', 'forward');
  }, [goTo]);

  // Back from subcategory: previous category's products, or interests if first
  const handleSubcategoryBack = useCallback(() => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      goTo('products', 'back');
    } else {
      goTo('interests', 'back');
    }
  }, [goTo, currentCategoryIndex]);

  // After liking products for a category, go to next category or tailoring
  const handleProductsNext = useCallback(() => {
    if (currentCategoryIndex < selectedInterests.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      goTo('subcategory', 'forward');
    } else {
      goTo('tailoring', 'forward');
    }
  }, [goTo, currentCategoryIndex, selectedInterests]);

  // Back from products: same category's subcategory
  const handleProductsBack = useCallback(() => {
    goTo('subcategory', 'back');
  }, [goTo]);

  // Nav visibility
  const showBack = screen !== 'welcome' && screen !== 'tailoring';
  const showHelp = screen !== 'welcome' && screen !== 'tailoring';

  const handleBack = useCallback(() => {
    switch (screen) {
      case 'gender': handleGenderBack(); break;
      case 'lifestyle': handleLifestyleBack(); break;
      case 'interests': handleInterestsBack(); break;
      case 'subcategory': handleSubcategoryBack(); break;
      case 'products': handleProductsBack(); break;
    }
  }, [screen, handleGenderBack, handleInterestsBack, handleSubcategoryBack, handleProductsBack]);

  const handleTailoringComplete = useCallback(() => {
    /* Navigate to chat or next experience */
  }, []);

  // Current category for subcategory + products screens
  const currentCategoryId = selectedInterests[currentCategoryIndex] || '';

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
            gender={gender}
          />
        );
      case 'products': {
        // Show products for the CURRENT category only
        const catSubs = subcategoriesByCategory[currentCategoryId] || [];
        return (
          <RefineYourTaste
            key={`products-${currentCategoryId}`}
            onNext={handleProductsNext}
            selectedInterests={[currentCategoryId]}
            subcategoriesByCategory={{ [currentCategoryId]: catSubs }}
            likedProducts={likedProducts}
            onLikedChange={setLikedProducts}
            onOverlayChange={setOverlayVisible}
            gender={gender}
          />
        );
      }
      case 'tailoring':
        return <TailoringScreen onComplete={handleTailoringComplete} />;
    }
  };

  // Progress bar calculation
  // Steps: gender(1) + lifestyle(2) + interests(3) + (subcategory+products) per category
  const getProgressPct = () => {
    const base = (() => {
      switch (screen) {
        case 'gender': return 1;
        case 'lifestyle': return 2;
        case 'interests': return 3;
        case 'subcategory': return 3 + currentCategoryIndex * 2 + 1;
        case 'products': return 3 + currentCategoryIndex * 2 + 2;
        default: return 0;
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
            {renderScreen(exitingScreen)}
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

      {/* Persistent top nav bar — matches Figma: back arrow, center text, Help */}
      {screen !== 'welcome' && screen !== 'tailoring' && (
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

            {/* Center text — counter on products screen */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {screen === 'products' && likedProducts.length > 0 && (
                <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>
                  {likedProducts.length} liked
                </span>
              )}
            </div>

            {/* Help button */}
            <button
              onClick={() => setHelpOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 500,
                color: '#cdcdcd',
                lineHeight: '44px',
                padding: '0 4px',
                minHeight: 44,
                opacity: showHelp ? 1 : 0,
                pointerEvents: showHelp ? 'auto' : 'none',
              }}
            >
              Help
            </button>
          </div>

          {/* Full-width progress bar — thin line below nav */}
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

      {/* Help overlay — bottom sheet style */}
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
