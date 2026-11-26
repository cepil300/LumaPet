import React, { useEffect, useRef } from 'react';
import { drawCatPortrait } from '../game/catRenderer';
import {
  CAT_BREEDS,
  CatBreed,
  CatGlassesId,
  CatHatId,
  CatScarfId,
  LifeStage,
} from '../types/game';
import { SinglePawBadgeIcon } from './CuteGameIcons';

interface CatEarsHeaderPlaqueProps {
  title: string;
  className?: string;
}

export const CatEarsHeaderPlaque: React.FC<CatEarsHeaderPlaqueProps> = ({
  title,
  className = '',
}) => (
  <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
    {/* Left Cat Ear */}
    <svg
      viewBox="0 0 44 34"
      className="absolute -top-5 left-4 short:-top-3.5 short:left-3 w-11 h-9 short:w-8 short:h-6 pointer-events-none"
      aria-hidden="true"
    >
      <path
        d="M5 32L12 4L38 22Z"
        fill="#D9904E"
        stroke="#5E2F12"
        strokeWidth="3.8"
        strokeLinejoin="round"
      />
      <path d="M12 26L15 11L28 21Z" fill="#F9A8A8" />
    </svg>

    {/* Right Cat Ear */}
    <svg
      viewBox="0 0 44 34"
      className="absolute -top-5 right-4 short:-top-3.5 short:right-3 w-11 h-9 short:w-8 short:h-6 pointer-events-none"
      aria-hidden="true"
    >
      <path
        d="M39 32L32 4L6 22Z"
        fill="#D9904E"
        stroke="#5E2F12"
        strokeWidth="3.8"
        strokeLinejoin="round"
      />
      <path d="M32 26L29 11L16 21Z" fill="#F9A8A8" />
    </svg>

    {/* Cream & Wood Header Plaque */}
    <div className="relative z-10 inline-flex items-center gap-2.5 short:gap-1.5 px-4 py-1.5 short:px-3 short:py-1 rounded-full bg-[#FFF8E8] border-[3px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_4px_0_#5E2F12] short:shadow-[inset_0_1px_0_#FFFFFF,0_2.5px_0_#5E2F12]">
      <SinglePawBadgeIcon className="w-6 h-6 short:w-4 short:h-4 shrink-0" />
      <h2 className="font-display font-extrabold text-xl sm:text-2xl short:text-base tracking-tight text-[#5A2D12] whitespace-nowrap leading-none">
        {title}
      </h2>
      <SinglePawBadgeIcon className="w-6 h-6 short:w-4 short:h-4 shrink-0" />
    </div>
  </div>
);

interface CatPortraitMedallionProps {
  breed: CatBreed;
  hat?: CatHatId;
  glasses?: CatGlassesId;
  scarf?: CatScarfId;
  lifeStage?: LifeStage;
  className?: string;
}

export const CatPortraitMedallion: React.FC<CatPortraitMedallionProps> = ({
  breed,
  hat = 'none',
  glasses = 'none',
  scarf = 'default',
  lifeStage = 'adult',
  className = 'w-44 h-44 short:w-28 short:h-28',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const logicalSize = 180;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const img = new Image();
    img.src =
      lifeStage === 'baby'
        ? CAT_BREEDS[breed].babySpriteSheet
        : CAT_BREEDS[breed].spriteSheet;

    const render = () => {
      drawCatPortrait(ctx, logicalSize, breed, hat, glasses, scarf, img, lifeStage);
    };

    if (img.complete && img.naturalWidth > 0) {
      render();
    } else {
      img.onload = render;
      render();
    }
  }, [breed, hat, glasses, scarf, lifeStage]);

  return (
    <div
      className={`rounded-full wood-modal-frame p-2.5 short:p-1.5 border-[3px] short:border-2 border-[#5E2F12] shadow-[inset_0_2px_0_rgba(255,235,205,0.45),0_6px_0_rgba(64,31,10,0.45)] shrink-0 ${className}`}
    >
      <div className="w-full h-full rounded-full bg-[#FFF7E2] border-[2.5px] short:border-2 border-[#5E2F12] shadow-[inset_0_3px_6px_rgba(94,47,18,0.16)] overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
