import { useState, useCallback, useRef } from 'react';
import PhoneFrame from './components/PhoneFrame';
import StatusBar from './components/StatusBar';
import HomeIndicator from './components/HomeIndicator';
import GenderSelection from './screens/GenderSelection';
import InterestsSelection from './screens/InterestsSelection';
import BrandsSelection from './screens/BrandsSelection';
import HowToSelect from './screens/HowToSelect';
import TailoringExperience from './screens/TailoringExperience';

type Screen = 'gender' | 'interests' | 'brands' | 'tailoring';

const SCREENS: Screen[] = ['gender', 'interests', 'brands', 'tailoring'];

function App() {
  const [screen, setScreen] = useState<Screen>('gender');
  const [showHowTo, setShowHowTo] = useState(false);
  const [exitingScreen, setExitingScreen] = useState<Screen | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const transitionRef = useRef<number | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set(),
  );

  const currentIndex = SCREENS.indexOf(screen);

  const goTo = useCallback(
    (next: Screen, dir: 'forward' | 'back') => {
      if (transitionRef.current) return;
      setDirection(dir);
      setExitingScreen(screen);
      setScreen(next);
      if (next === 'brands') {
        setTimeout(() => setShowHowTo(true), 350);
      }
      transitionRef.current = window.setTimeout(() => {
        setExitingScreen(null);
        transitionRef.current = null;
      }, 350);
    },
    [screen],
  );

  const handleNext = useCallback(() => {
    const next = SCREENS[currentIndex + 1];
    if (next) goTo(next, 'forward');
  }, [currentIndex, goTo]);

  const handleBack = useCallback(() => {
    const prev = SCREENS[currentIndex - 1];
    if (prev) goTo(prev, 'back');
  }, [currentIndex, goTo]);

  const handleSkip = useCallback(() => {
    if (screen === 'brands') {
      goTo('tailoring', 'forward');
    } else {
      handleNext();
    }
  }, [screen, goTo, handleNext]);

  const showBack = screen !== 'gender' && screen !== 'tailoring';
  const showSkip = screen !== 'tailoring';

  const renderScreen = (s: Screen) => {
    switch (s) {
      case 'gender':
        return <GenderSelection onNext={handleNext} />;
      case 'interests':
        return (
          <InterestsSelection
            onNext={handleNext}
            onSelectionsChange={setSelectedInterests}
          />
        );
      case 'brands':
        return (
          <BrandsSelection
            onNext={handleNext}
            selectedInterests={selectedInterests}
          />
        );
      case 'tailoring':
        return <TailoringExperience />;
    }
  };

  const enterAnim =
    direction === 'forward' ? 'screenEnterFromRight' : 'screenEnterFromLeft';
  const exitAnim =
    direction === 'forward' ? 'screenExitToLeft' : 'screenExitToRight';

  return (
    <PhoneFrame>
      {/* Persistent background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(143.5deg, #111111 21%, #0c0c0c 83%)',
        }}
      />

      {/* Screen content area */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {/* Exiting screen */}
        {exitingScreen && (
          <div
            key={`exit-${exitingScreen}`}
            style={{
              position: 'absolute',
              inset: 0,
              animation: `${exitAnim} 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {renderScreen(exitingScreen)}
          </div>
        )}

        {/* Current screen */}
        <div
          key={screen}
          style={{
            position: 'absolute',
            inset: 0,
            animation: exitingScreen
              ? `${enterAnim} 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`
              : 'none',
            zIndex: 2,
          }}
        >
          {renderScreen(screen)}
        </div>
      </div>

      {/* Persistent chrome — always visible above content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          pointerEvents: 'none',
        }}
      >
        <StatusBar />
        <HomeIndicator />
      </div>

      {/* Persistent back button */}
      <button
        onClick={handleBack}
        style={{
          position: 'absolute',
          top: 67,
          left: 20,
          width: 28,
          height: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: showBack ? 'pointer' : 'default',
          zIndex: 30,
          padding: 0,
          opacity: showBack ? 1 : 0,
          transition: 'opacity 0.3s ease',
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

      {/* Persistent skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: 70,
          right: 20,
          background: 'none',
          border: 'none',
          cursor: showSkip ? 'pointer' : 'default',
          fontSize: 16,
          fontWeight: 500,
          color: '#cdcdcd',
          lineHeight: '22px',
          zIndex: 30,
          padding: 0,
          opacity: showSkip ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showSkip ? 'auto' : 'none',
        }}
      >
        Skip
      </button>

      {/* How to Select modal overlay */}
      {showHowTo && <HowToSelect onClose={() => setShowHowTo(false)} />}
    </PhoneFrame>
  );
}

export default App;
