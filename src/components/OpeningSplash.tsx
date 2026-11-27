import React, { useEffect, useRef, useState } from 'react';

interface OpeningSplashProps {
  onFinish: () => void;
}

type SplashPhase = 'enter' | 'hold' | 'exit';

export const OpeningSplash: React.FC<OpeningSplashProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<SplashPhase>('enter');
  const finishedRef = useRef(false);

  const triggerExit = () => {
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
        src="/assets/aistudio/Gemini_Generated_Image_jwjhunjwjhunjwjh_b7645b81.jpg"
        alt="LumaPet"
        className={`w-full h-full max-w-[960px] max-h-[88dvh] object-contain px-6 transition-transform duration-1000 ease-out ${
          phase === 'enter' ? 'scale-95' : 'scale-100'
        }`}
        draggable={false}
      />
    </div>
  );
};
