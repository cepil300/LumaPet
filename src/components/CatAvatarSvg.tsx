import React from 'react';
import {
  CAT_BREEDS,
  CatBreed,
  CatGlassesId,
  CatHatId,
  CatScarfId,
  LifeStage,
} from '../types/game';

interface CatAvatarSvgProps {
  breed: CatBreed;
  size?: number;
  hat?: CatHatId;
  glasses?: CatGlassesId;
  scarf?: CatScarfId;
  lifeStage?: LifeStage;
}

export const CatAvatarSvg: React.FC<CatAvatarSvgProps> = ({
  breed,
  size = 48,
  hat = 'none',
  glasses = 'none',
  scarf = 'default',
  lifeStage = 'adult',
}) => {
  const profile = CAT_BREEDS[breed] ?? CAT_BREEDS.oren;
  const isBaby = lifeStage === 'baby';
  const isChild = lifeStage === 'child';

  // Render Idle Frame 0 (row 4, col 0 of 6x8 sprite sheet: 2040x2080, cell 340x260)
  const cropBox = isBaby ? 210 : isChild ? 220 : 230;
  const sheetScale = size / cropBox;
  const bgW = Math.round(2040 * sheetScale);
  const bgH = Math.round(2080 * sheetScale);
  const offsetX = Math.round((isBaby ? -62 : isChild ? -55 : -48) * sheetScale);
  const offsetY = Math.round(-(4 * 260 + (isBaby ? 54 : isChild ? 40 : 26)) * sheetScale);
  const hasOverlay = hat !== 'none' || glasses !== 'none' || scarf !== 'default';
  const spriteUrl = isBaby
    ? profile.babySpriteSheet
    : isChild
    ? profile.childSpriteSheet
    : profile.spriteSheet;

  const glassesTransform = isBaby
    ? 'translate(145 81) scale(1.25)'
    : isChild
    ? 'translate(158 80) scale(1.3)'
    : 'translate(184 81) scale(1.38)';
  const hatBase = isBaby
    ? 'translate(142 40)'
    : isChild
    ? 'translate(154 36)'
    : 'translate(178 34)';
  const hatScale = isBaby ? 'scale(1.24)' : isChild ? 'scale(1.3)' : 'scale(1.38)';
  const scarfTransform = isBaby
    ? 'translate(115 114) scale(1.22)'
    : isChild
    ? 'translate(122 115) scale(1.28)'
    : 'translate(136 112) scale(1.38)';
  const bowtieTransform = isBaby
    ? 'translate(121 118) scale(1.22)'
    : isChild
    ? 'translate(128 119) scale(1.28)'
    : 'translate(143 116) scale(1.38)';

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${spriteUrl})`,
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        backgroundRepeat: 'no-repeat',
      }}
      className="relative shrink-0"
      role="img"
      aria-label={profile.label}
    >
      {hasOverlay && (
        <svg
          viewBox={`0 0 ${cropBox} ${cropBox}`}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          {scarf === 'syal_polkadot' && (
            <g transform={scarfTransform}>
              <path d="M-22 -6Q0 6 22 -3L20 7Q0 15 -20 5Z" fill="#3B82F6" stroke="#2B231E" strokeWidth="2.4" />
              <circle cx="-12" cy="1" r="2.3" fill="#FFFDF9" />
              <circle cx="0" cy="4" r="2.5" fill="#FFFDF9" />
              <circle cx="12" cy="2" r="2.3" fill="#FFFDF9" />
            </g>
          )}
          {scarf === 'syal_garis' && (
            <g transform={scarfTransform}>
              <path d="M-22 -6Q0 6 22 -3L20 7Q0 15 -20 5Z" fill="#22C55E" stroke="#2B231E" strokeWidth="2.4" />
              <path d="M-12 -1L-10 7M0 2L1 10M11 1L12 8" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
          {scarf === 'dasi_kupu' && (
            <g transform={bowtieTransform}>
              <path d="M-2 0L-15 -7V7Z" fill="#E11D48" stroke="#2B231E" strokeWidth="2.2" />
              <path d="M2 0L15 -7V7Z" fill="#E11D48" stroke="#2B231E" strokeWidth="2.2" />
              <rect x="-3.5" y="-4" width="7" height="8" rx="2.5" fill="#BE123C" stroke="#2B231E" strokeWidth="2" />
              <circle cx="0" cy="7.5" r="4.2" fill="#FACC15" stroke="#2B231E" strokeWidth="2" />
            </g>
          )}

          {glasses === 'kacamata_bulat' && (
            <g transform={glassesTransform}>
              <circle cx="-15" cy="0" r="11" fill="rgba(224,242,254,0.4)" stroke="#4E270F" strokeWidth="2.7" />
              <circle cx="15" cy="0" r="11" fill="rgba(224,242,254,0.4)" stroke="#4E270F" strokeWidth="2.7" />
              <path d="M-3.8 -1Q0 -4.5 3.8 -1" stroke="#4E270F" strokeWidth="2.6" fill="none" />
            </g>
          )}
          {glasses === 'kacamata_hitam' && (
            <g transform={glassesTransform}>
              <rect x="-26" y="-8" width="22" height="15" rx="4.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
              <rect x="4" y="-8" width="22" height="15" rx="4.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
              <path d="M-26 -5.5H26" stroke="#0F172A" strokeWidth="3.2" />
            </g>
          )}
          {glasses === 'kacamata_hati' && (
            <g transform={glassesTransform}>
              <path d="M-15 10C-28 1.5 -28 -10.5 -20.2 -10.5C-16.4 -10.5 -15 -6.5 -15 -5C-15 -6.5 -13.6 -10.5 -9.8 -10.5C-2 -10.5 -2 1.5 -15 10Z" fill="rgba(251,113,133,0.45)" stroke="#BE185D" strokeWidth="2.6" />
              <path d="M15 10C2 1.5 2 -10.5 9.8 -10.5C13.6 -10.5 15 -6.5 15 -5C15 -6.5 16.4 -10.5 20.2 -10.5C28 -10.5 28 1.5 15 10Z" fill="rgba(251,113,133,0.45)" stroke="#BE185D" strokeWidth="2.6" />
              <path d="M-4 -2H4" stroke="#BE185D" strokeWidth="2.6" />
            </g>
          )}

          {hat === 'beret_merah' && (
            <g transform={`${hatBase} rotate(-8) ${hatScale}`}>
              <path d="M0 -14L2 -19" stroke="#4E270F" strokeWidth="2.6" strokeLinecap="round" />
              <ellipse cx="0" cy="-5" rx="19" ry="10" fill="#DC2626" stroke="#4E270F" strokeWidth="2.4" />
              <rect x="-13" y="2" width="26" height="5" rx="2.5" fill="#991B1B" stroke="#4E270F" strokeWidth="2.2" />
            </g>
          )}
          {hat === 'topi_pesta' && (
            <g transform={`${hatBase} rotate(5) ${hatScale}`}>
              <path d="M-14 5L0 -25L14 5Z" fill="#6366F1" stroke="#2B231E" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M-7 -8H7M-10.5 -1H10.5" stroke="#FACC15" strokeWidth="2.5" />
              <rect x="-15" y="2" width="30" height="6" rx="3" fill="#FFFDF9" stroke="#2B231E" strokeWidth="2.2" />
              <circle cx="0" cy="-26" r="5" fill="#F472B6" stroke="#2B231E" strokeWidth="2" />
            </g>
          )}
          {hat === 'mahkota_emas' && (
            <g transform={`${hatBase} ${hatScale}`}>
              <path d="M-15 5L-17 -14L-7 -5L0 -18L7 -5L17 -14L15 5Z" fill="#FBBF24" stroke="#5E351B" strokeWidth="2.4" strokeLinejoin="round" />
              <rect x="-15" y="1" width="30" height="6" rx="2" fill="#F59E0B" stroke="#5E351B" strokeWidth="2.2" />
              <circle cx="0" cy="-3" r="3" fill="#EF4444" />
            </g>
          )}
        </svg>
      )}
    </div>
  );
};
