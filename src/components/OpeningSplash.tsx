import React, { useEffect, useRef, useState } from 'react';
import { isTouchOrAndroid, requestImmersiveFullscreen } from '../utils/fullscreen';

interface OpeningSplashProps {
  onFinish: () => void;
}

type SplashPhase = 'enter' | 'hold' | 'exit';

export const OpeningSplash: React.FC<OpeningSplashProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<SplashPhase>('enter');
  const finishedRef = useRef(false);

  const triggerExit = () => {
    if (isTouchOrAndroid()) {
      void requestImmersiveFullscreen();
    }
    setPhase((prev) => (prev === 'exit' ? prev : 'exit'));
  };

  useEffect(() => {
    const enterRaf = window.requestAnimationFrame(() => {
      setPhase('hold');
    });

    const exitTimer = window.setTimeout(() => {
      setPhase('exit');
    }, 2350);

    return () => {
      window.cancelAnimationFrame(enterRaf);
      window.clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'exit') return;
    const doneTimer = window.setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish();
      }
    }, 800);
    return () => window.clearTimeout(doneTimer);
  }, [phase, onFinish]);

  useEffect(() => {
    const onKeyDown = () => triggerExit();
    window.addEventListener('keydown', onKeyDown, { once: true });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      onClick={triggerExit}
      onTouchEnd={triggerExit}
      onPointerUp={triggerExit}
      aria-label="Pembukaan LumaPet"
      className={`fixed inset-0 z-[100] bg-[#FFFFFF] flex items-center justify-center transition-opacity duration-700 ease-in-out select-none ${
        phase === 'exit'
          ? 'opacity-0 pointer-events-none'
          : 'opacity-100 cursor-pointer'
      }`}
    >
      <img
        src="/assets/lumapet_logo.png"
        alt="LumaPet"
        className={`w-[min(86vw,540px)] sm:w-[min(80vw,620px)] h-auto max-h-[65dvh] object-contain transition-all duration-700 ease-out ${
          phase === 'enter' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        draggable={false}
      />
    </div>
  );
};
