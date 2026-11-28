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
      aria-label="Pembukaan LumaPet"
      className={`fixed inset-0 z-[100] bg-[#FFFFFF] flex items-center justify-center transition-opacity duration-700 ease-in-out select-none ${
        phase === 'hold'
          ? 'opacity-100 cursor-pointer'
          : phase === 'exit'
          ? 'opacity-0 pointer-events-none'
          : 'opacity-0'
      }`}
    >
      <img
        src="/assets/aistudio/image_e0ece965.png"
        alt="LumaPet"
        className={`w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-h-[72dvh] object-contain transition-transform duration-1000 ease-out ${
          phase === 'enter' ? 'scale-95' : 'scale-100'
        }`}
        draggable={false}
      />
    </div>
  );
};
