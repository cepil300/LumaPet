import React from 'react';
import { BathItemId, CatAccessoryId, FoodItemId } from '../types/game';

interface IconProps {
  className?: string;
}

// --- PIXEL-ART SHOP TREAT ASSETS ---

export const SalmonTreatIcon: React.FC<IconProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    {/* Wooden plate */}
    <ellipse cx="16" cy="21" rx="13" ry="6.5" fill="#F5E6CC" stroke="#5E351B" strokeWidth="2" />
    <ellipse cx="16" cy="20" rx="10" ry="4.5" fill="#FFF8EC" />
    {/* Grilled Salmon Fillet */}
    <path
      d="M7 17C7 13 11.5 10 17.5 10C22.5 10 25 12.5 25 15.5C25 18.5 21 21 15 21C10 21 7 19.5 7 17Z"
      fill="#F2795A"
      stroke="#5E351B"
      strokeWidth="2"
    />
    {/* Salmon white fat stripes */}
    <path d="M11 12.5L13 19.5M15.5 11.2L17.5 19.8M20 11.5L21.5 18" stroke="#FFD6C9" strokeWidth="1.8" strokeLinecap="round" />
    {/* Grill marks */}
    <path d="M10 15.5L16 12.5M14 17.5L21 14" stroke="#A63C24" strokeWidth="1.4" strokeLinecap="round" />
    {/* Parsley garnish */}
    <circle cx="22.5" cy="18.5" r="2.2" fill="#4FA863" stroke="#2D6A4F" strokeWidth="1.2" />
  </svg>
);

export const MilkTreatIcon: React.FC<IconProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    {/* Saucer */}
    <ellipse cx="16" cy="24.5" rx="11.5" ry="3.5" fill="#DBEAFE" stroke="#475569" strokeWidth="1.8" />
    {/* Warm Milk Mug / Bowl */}
    <path
      d="M8.5 13H23.5L22 22.5C21.7 24.2 20.2 25 18.5 25H13.5C11.8 25 10.3 24.2 10 22.5L8.5 13Z"
      fill="#FFFDF9"
      stroke="#5E351B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Sky-blue stripe */}
    <path d="M9.6 18.5H22.4L22 21.5H10L9.6 18.5Z" fill="#7DD3FC" />
    {/* Warm milk surface */}
    <ellipse cx="16" cy="13" rx="7.5" ry="2.8" fill="#FFFFFF" stroke="#5E351B" strokeWidth="1.8" />
    {/* Steam wisps */}
    <path d="M12.5 8.5C12.5 7 13.8 6.5 13.5 5" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M16 8C16 6.2 17.4 5.8 17 4" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M19.5 8.8C19.5 7.3 20.8 6.8 20.5 5.2" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const CatnipTreatIcon: React.FC<IconProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    {/* Biscuit 1 (Fish shape) */}
    <path
      d="M5.5 18.5C7.5 14 12.5 13 17 15.5L21 12.5V22.5L17 19.5C12.5 22 7.5 21 5.5 18.5Z"
      fill="#E8A45C"
      stroke="#5E351B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Catnip green leaf speckles */}
    <circle cx="11" cy="17.5" r="1.3" fill="#2D6A4F" />
    <circle cx="14.5" cy="18.2" r="1.2" fill="#40916C" />
    {/* Biscuit 2 (Small behind) */}
    <path
      d="M14 10.5C15.8 7.8 19.5 7.2 22.8 9L25.8 6.8V14.2L22.8 12C19.5 13.8 15.8 13.2 14 10.5Z"
      fill="#F4C27F"
      stroke="#5E351B"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Little green catnip leaf */}
    <path
      d="M21 21C23.5 19.5 26.5 20.5 27.5 23C25 24.5 22 23.5 21 21Z"
      fill="#52B788"
      stroke="#2D6A4F"
      strokeWidth="1.5"
    />
  </svg>
);

// --- CUTE GHOST CAT FOR GAME OVER ---

export const GhostCatSvg: React.FC<IconProps> = ({ className = 'w-24 h-24' }) => (
  <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
    {/* Golden angel halo */}
    <ellipse cx="48" cy="14" rx="16" ry="4.5" stroke="#F59E0B" strokeWidth="3" fill="#FEF3C7" fillOpacity="0.6" />
    {/* Cute floating sparkles */}
    <path d="M18 32L20 37L25 39L20 41L18 46L16 41L11 39L16 37L18 32Z" fill="#FDE68A" />
    <path d="M78 26L79.5 30L83.5 31.5L79.5 33L78 37L76.5 33L72.5 31.5L76.5 30L78 26Z" fill="#BFDBFE" />
    {/* Ghost kitty body with wavy sheet tail */}
    <path
      d="M25 46C25 34 33 25 48 25C63 25 71 34 71 46V74C71 76.5 68 77.5 66 75.5C63.5 73 60 73 57.5 75.5C55 78 51.5 78 49 75.5C46.5 73 43 73 40.5 75.5C38 78 34.5 78 32 75.5C29.5 73 25 74.5 25 74V46Z"
      fill="#F8FAFC"
      stroke="#64748B"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Cat ears */}
    <path d="M27 36L28 21L39 29Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M69 36L68 21L57 29Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M30 33L30.5 25L36.5 30Z" fill="#FBCFE8" />
    <path d="M66 33L65.5 25L59.5 30Z" fill="#FBCFE8" />
    {/* Gentle peaceful eyes & blush */}
    <path d="M36 46C37.5 48.5 40.5 48.5 42 46" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M54 46C55.5 48.5 58.5 48.5 60 46" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
    <ellipse cx="34" cy="51" rx="3.5" ry="2" fill="#FDA4AF" fillOpacity="0.6" />
    <ellipse cx="62" cy="51" rx="3.5" ry="2" fill="#FDA4AF" fillOpacity="0.6" />
    {/* Little pink nose & 'w' smile */}
    <path d="M46 50H50L48 52.5Z" fill="#F472B6" />
    <path d="M43.5 54C45 56 47 55.5 48 53.5C49 55.5 51 56 52.5 54" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
    {/* Tiny paws */}
    <ellipse cx="37" cy="61" rx="4" ry="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.6" />
    <ellipse cx="59" cy="61" rx="4" ry="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.6" />
  </svg>
);

// --- SMALL DECORATIVE PIXEL PAWS ---

export const PixelPawCluster: React.FC<IconProps> = ({ className = 'w-8 h-5' }) => (
  <svg viewBox="0 0 36 22" fill="none" className={className} aria-hidden="true">
    <g fill="#8B5A3C" opacity="0.85">
      <rect x="6" y="8" width="5" height="4" />
      <rect x="4" y="4" width="2.5" height="2.5" />
      <rect x="7.5" y="2.5" width="2.5" height="2.5" />
      <rect x="11" y="4" width="2.5" height="2.5" />
      <rect x="22" y="13" width="5" height="4" />
      <rect x="20" y="9" width="2.5" height="2.5" />
      <rect x="23.5" y="7.5" width="2.5" height="2.5" />
      <rect x="27" y="9" width="2.5" height="2.5" />
    </g>
  </svg>
);

export const CuteHealthStatIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="4" fill="#6EE7B7" stroke="#5E351B" strokeWidth="2" />
    <path d="M12 8V16M8 12H16" stroke="#1C2722" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const PixelPlantIcon: React.FC<IconProps> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} shapeRendering="crispEdges" aria-hidden="true">
    {/* Dark outline leaves */}
    <rect x="10" y="2" width="4" height="2" fill="#46321D" />
    <rect x="9" y="4" width="6" height="2" fill="#46321D" />
    <rect x="5" y="6" width="4" height="2" fill="#46321D" />
    <rect x="15" y="6" width="4" height="2" fill="#46321D" />
    <rect x="4" y="8" width="16" height="6" fill="#46321D" />
    {/* Green succulent leaves */}
    <rect x="10" y="4" width="4" height="10" fill="#7AC143" />
    <rect x="11" y="4" width="2" height="8" fill="#A3DC62" />
    <rect x="6" y="7" width="3" height="6" fill="#5D9C31" />
    <rect x="15" y="7" width="3" height="6" fill="#5D9C31" />
    <rect x="5" y="10" width="4" height="3" fill="#7AC143" />
    <rect x="15" y="10" width="4" height="3" fill="#7AC143" />
    <rect x="8" y="11" width="8" height="3" fill="#3F7A23" />
    {/* Terracotta pot */}
    <rect x="5" y="14" width="14" height="8" fill="#5E351B" />
    <rect x="6" y="15" width="12" height="2" fill="#D4845A" />
    <rect x="7" y="17" width="10" height="4" fill="#A95934" />
    <rect x="8" y="17" width="8" height="1" fill="#C97349" />
  </svg>
);

// --- SHOP BED & BACKGROUND ICONS ---

export const ClassicBedIcon: React.FC<IconProps> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <ellipse cx="18" cy="23" rx="13" ry="7.5" fill="#9BB89B" stroke="#5E351B" strokeWidth="2" />
    <ellipse cx="18" cy="20" rx="11" ry="5.5" fill="#B6D1B4" stroke="#5E351B" strokeWidth="1.5" />
    <path d="M12 18C14 21 22 21 24 18" stroke="#7A9A7A" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="18" cy="19.5" r="2" fill="#7A9A7A" />
  </svg>
);

export const CloudBedIcon: React.FC<IconProps> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <path
      d="M7 22C5 22 4 19.5 6 17.5C6.5 14 10 12.5 13 14C15 11.5 21 11.5 23 14C26 12.5 29.5 14 30 17.5C32 19.5 31 22 29 22C29 25 25.5 27 18 27C10.5 27 7 25 7 22Z"
      fill="#BAE6FD"
      stroke="#5E351B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="18" cy="21" rx="9" ry="4" fill="#FFFDF9" />
    <path d="M18 17.5L18.8 19.2L20.6 19.4L19.2 20.6L19.6 22.4L18 21.5L16.4 22.4L16.8 20.6L15.4 19.4L17.2 19.2Z" fill="#FBBF24" />
  </svg>
);

export const RattanBedIcon: React.FC<IconProps> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <path
      d="M5 19C5 24.5 10.5 28 18 28C25.5 28 31 24.5 31 19L29 14H7L5 19Z"
      fill="#D49A5A"
      stroke="#5E351B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="18" cy="15.5" rx="11.5" ry="4.5" fill="#FFF8EC" stroke="#5E351B" strokeWidth="1.8" />
    <path d="M9 21L13 24M16 21L20 24M23 21L27 24" stroke="#9C6234" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const RoyalSofaBedIcon: React.FC<IconProps> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <path
      d="M6 16C6 12.5 11 10 18 10C25 10 30 12.5 30 16V23C30 25.5 27 27 24 27H12C9 27 6 25.5 6 23V16Z"
      fill="#9F3B4D"
      stroke="#5E351B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect x="9.5" y="18" width="17" height="6.5" rx="3" fill="#FFF3D9" stroke="#FBBF24" strokeWidth="1.5" />
    <circle cx="14" cy="14" r="1.2" fill="#FBBF24" />
    <circle cx="18" cy="13.5" r="1.2" fill="#FBBF24" />
    <circle cx="22" cy="14" r="1.2" fill="#FBBF24" />
  </svg>
);

export const RoomBgIcon: React.FC<
  IconProps & { variant: 'classic_home' | 'apartment' | 'tatami' }
> = ({ className = 'w-12 h-10', variant }) => {
  if (variant === 'apartment') {
    return (
      <svg viewBox="0 0 40 32" fill="none" className={className} aria-hidden="true">
        <rect x="2" y="2" width="36" height="28" rx="4" fill="#B67C6D" stroke="#5E351B" strokeWidth="2" />
        <rect x="20" y="5" width="14" height="17" fill="#CFEAFE" stroke="#5E351B" strokeWidth="1.6" />
        <rect x="22" y="12" width="3" height="10" fill="#94A3B8" />
        <rect x="26" y="9" width="4" height="13" fill="#CBD5E1" />
        <rect x="31" y="14" width="2" height="8" fill="#64748B" />
        <rect x="4" y="22" width="32" height="6" fill="#E8B982" />
        <rect x="6" y="9" width="11" height="2" fill="#E8B982" />
      </svg>
    );
  }
  if (variant === 'tatami') {
    return (
      <svg viewBox="0 0 40 32" fill="none" className={className} aria-hidden="true">
        <rect x="2" y="2" width="36" height="28" rx="4" fill="#E6D7B9" stroke="#5E351B" strokeWidth="2" />
        <rect x="15" y="6" width="11" height="15" fill="#B5C6A8" stroke="#5E351B" strokeWidth="1.3" />
        <rect x="18.5" y="8" width="4" height="10" fill="#FFFDF5" stroke="#8B6F47" strokeWidth="0.9" />
        <rect x="27" y="5" width="9" height="17" fill="#DCFCE7" stroke="#5E351B" strokeWidth="1.4" />
        <path d="M31 20V8M33.5 20V10" stroke="#4D7C0F" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="4" y="22" width="32" height="6" fill="#D4CA90" stroke="#5E351B" strokeWidth="1.2" />
        <line x1="16" y1="22" x2="14" y2="28" stroke="#3F6212" strokeWidth="1.2" />
        <line x1="27" y1="22" x2="29" y2="28" stroke="#3F6212" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 32" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="36" height="28" rx="4" fill="#8EA687" stroke="#5E351B" strokeWidth="2" />
      <rect x="21" y="5" width="13" height="16" fill="#DBEAFE" stroke="#5E351B" strokeWidth="1.6" />
      <circle cx="28" cy="15" r="5" fill="#86EFAC" />
      <rect x="4" y="22" width="32" height="6" fill="#E6C9A2" />
      <rect x="7" y="13" width="9" height="9" fill="#B98A5C" stroke="#5E351B" strokeWidth="1.4" />
    </svg>
  );
};

// --- TITLE MENU PIXEL ICONS ---

export const PixelWinkingCatHead: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} shapeRendering="crispEdges" aria-hidden="true">
    {/* Ears */}
    <path d="M5 13L7 4L13 9H19L25 4L27 13C28 19 24 24 16 24C8 24 4 19 5 13Z" fill="#EA8A36" stroke="#4E270F" strokeWidth="2" strokeLinejoin="round" />
    <path d="M7.5 11L8.2 6.8L11.8 9.6Z" fill="#F9A8D4" />
    <path d="M24.5 11L23.8 6.8L20.2 9.6Z" fill="#F9A8D4" />
    {/* Forehead stripes */}
    <rect x="15" y="9" width="2" height="4" fill="#B44D18" />
    <rect x="12" y="10" width="2" height="2" fill="#B44D18" />
    <rect x="18" y="10" width="2" height="2" fill="#B44D18" />
    {/* Eyes (left open, right winking) */}
    <rect x="10" y="14" width="2.5" height="3" rx="1" fill="#2B1B12" />
    <rect x="10.4" y="14.4" width="1" height="1" fill="#FFFFFF" />
    <path d="M19.5 15.5C20.5 14.2 22 14.2 23 15.5" stroke="#2B1B12" strokeWidth="2" strokeLinecap="round" />
    {/* Blush */}
    <rect x="7.5" y="17" width="3" height="2" fill="#FB7185" opacity="0.7" />
    <rect x="21.5" y="17" width="3" height="2" fill="#FB7185" opacity="0.7" />
    {/* Muzzle & smile */}
    <ellipse cx="16" cy="19.5" rx="4.5" ry="2.8" fill="#FFF3D9" />
    <path d="M15 17.5H17L16 18.8Z" fill="#E57A84" />
    <path d="M13.8 19.6C14.8 20.6 15.6 20.4 16 19.3C16.4 20.4 17.2 20.6 18.2 19.6" stroke="#4E270F" strokeWidth="1.3" strokeLinecap="round" />
    {/* Red scarf */}
    <path d="M9 23.5H23L25 27.5H14L11 29L9 26.5Z" fill="#C93B32" stroke="#4E270F" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

export const PixelPawButtonIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#FFF3D9" stroke="#5E2F12" strokeWidth="2" />
    <ellipse cx="12" cy="14.5" rx="4.2" ry="3.2" fill="#F48FB1" stroke="#5E2F12" strokeWidth="1.4" />
    <circle cx="7.5" cy="10" r="1.7" fill="#F48FB1" stroke="#5E2F12" strokeWidth="1.3" />
    <circle cx="10.5" cy="7.8" r="1.7" fill="#F48FB1" stroke="#5E2F12" strokeWidth="1.3" />
    <circle cx="13.8" cy="7.8" r="1.7" fill="#F48FB1" stroke="#5E2F12" strokeWidth="1.3" />
    <circle cx="16.5" cy="10" r="1.7" fill="#F48FB1" stroke="#5E2F12" strokeWidth="1.3" />
  </svg>
);

export const PixelPlayButtonIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M7 5L19 12L7 19V5Z" fill="#DCFCE7" stroke="#2D4A1F" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

export const PixelGearButtonIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M10.5 3H13.5L14.2 5.4C14.8 5.6 15.4 5.9 15.9 6.2L18.1 5L20.2 7.1L19 9.3C19.3 9.8 19.6 10.4 19.8 11L22 11.7V14.7L19.8 15.4C19.6 16 19.3 16.6 19 17.1L20.2 19.3L18.1 21.4L15.9 20.2C15.4 20.5 14.8 20.8 14.2 21L13.5 23H10.5L9.8 21C9.2 20.8 8.6 20.5 8.1 20.2L5.9 21.4L3.8 19.3L5 17.1C4.7 16.6 4.4 16 4.2 15.4L2 14.7V11.7L4.2 11C4.4 10.4 4.7 9.8 5 9.3L3.8 7.1L5.9 5L8.1 6.2C8.6 5.9 9.2 5.6 9.8 5.4L10.5 3Z"
      fill="#A86B3E"
      stroke="#4E270F"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13.2" r="3" fill="#FFF3D9" stroke="#4E270F" strokeWidth="1.6" />
  </svg>
);

export const PixelExitDoorIcon: React.FC<IconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="3" width="11" height="18" rx="1.5" fill="#C97E49" stroke="#4E270F" strokeWidth="1.8" />
    <rect x="6" y="5" width="7" height="14" fill="#A65E2E" />
    <circle cx="11.5" cy="12" r="1.2" fill="#FDE68A" />
    <path d="M14 12H21M18 9L21 12L18 15" stroke="#4E270F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- TOY CHEST ICONS ---

export const ToyIcon: React.FC<
  IconProps & { variant: 'yarn_ball' | 'laser_pointer' | 'feather_wand' | 'toy_mouse' }
> = ({ className = 'w-11 h-11', variant }) => {
  switch (variant) {
    case 'laser_pointer':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path
            d="M7 25L20 12L24 16L11 29C9.8 30.2 8 30.2 6.8 29C5.6 27.8 5.8 26.2 7 25Z"
            fill="#64748B"
            stroke="#3B2313"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect
            x="20"
            y="11"
            width="5"
            height="5"
            rx="1"
            transform="rotate(45 20 11)"
            fill="#CBD5E1"
            stroke="#3B2313"
            strokeWidth="1.6"
          />
          <circle cx="14.5" cy="21.5" r="1.8" fill="#EF4444" stroke="#3B2313" strokeWidth="1.2" />
          <path d="M24 12L30 6" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2 2" />
          <circle cx="30" cy="6" r="3.4" fill="#FCA5A5" />
          <circle cx="30" cy="6" r="1.8" fill="#EF4444" />
        </svg>
      );
    case 'feather_wand':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M7 29L22 10" stroke="#A96432" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M7 29L22 10" stroke="#E8B982" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M22 10Q25 14 23 19" stroke="#7A4928" strokeWidth="1.4" strokeLinecap="round" />
          {/* Colorful feathers */}
          <path
            d="M23 18C27 15 31 16 31 20C29 22 25 22 23 18Z"
            fill="#2DD4BF"
            stroke="#3B2313"
            strokeWidth="1.5"
          />
          <path
            d="M22 18C20 22 22 27 26 27C27 24 25 20 22 18Z"
            fill="#FB7185"
            stroke="#3B2313"
            strokeWidth="1.5"
          />
          <path
            d="M23 19C25 21 29 23 30 26C27 26 24 24 23 19Z"
            fill="#FBBF24"
            stroke="#3B2313"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'toy_mouse':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          {/* Tail */}
          <path d="M26 23C30 23 32 19 29 17" stroke="#F472B6" strokeWidth="2.2" strokeLinecap="round" />
          {/* Wind-up key */}
          <path d="M18 11V15" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="15.8" cy="9.5" r="2.3" stroke="#D97706" strokeWidth="1.8" fill="#FDE68A" />
          <circle cx="20.2" cy="9.5" r="2.3" stroke="#D97706" strokeWidth="1.8" fill="#FDE68A" />
          {/* Mouse body */}
          <ellipse cx="17.5" cy="21.5" rx="9.5" ry="6.5" fill="#94A3B8" stroke="#3B2313" strokeWidth="2" />
          {/* Ears */}
          <circle cx="12.5" cy="15.5" r="3.2" fill="#94A3B8" stroke="#3B2313" strokeWidth="1.8" />
          <circle cx="12.5" cy="15.5" r="1.5" fill="#F9A8D4" />
          {/* Nose & Eye */}
          <circle cx="10.8" cy="20.2" r="1.2" fill="#1E293B" />
          <circle cx="8" cy="22" r="1.6" fill="#F472B6" />
        </svg>
      );
    case 'yarn_ball':
    default:
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M24 26C28 28 31 25 32 22" stroke="#EA6B5C" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="17" cy="18" r="10.5" fill="#EA6B5C" stroke="#3B2313" strokeWidth="2" />
          <circle cx="13.5" cy="14.5" r="3.5" fill="#F8A89D" />
          <path d="M9.5 14.5Q17 20 25 13.5" stroke="#9E2F23" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M11 23Q18 17 24 23.5" stroke="#9E2F23" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M14 9Q19 16 14.5 27" stroke="#9E2F23" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
};

// --- ACCESSORY & COSTUME SHOP ICONS ---

export const AccessoryIcon: React.FC<IconProps & { variant: CatAccessoryId }> = ({
  className = 'w-11 h-11',
  variant,
}) => {
  switch (variant) {
    case 'beret_merah':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M18 11L19.5 7.5" stroke="#4E270F" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="18" cy="18" rx="12" ry="6.5" transform="rotate(-10 18 18)" fill="#DC2626" stroke="#4E270F" strokeWidth="2" />
          <rect x="9.5" y="22" width="17" height="4" rx="2" fill="#991B1B" stroke="#4E270F" strokeWidth="1.8" />
          <ellipse cx="14" cy="15.5" rx="3.2" ry="1.4" transform="rotate(-12 14 15.5)" fill="#FCA5A5" />
        </svg>
      );
    case 'topi_pesta':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M10 26L18 8L26 26H10Z" fill="#6366F1" stroke="#2B231E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M13.5 19H22.5M12 22.5H24" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
          <rect x="9" y="25" width="18" height="4.5" rx="2.2" fill="#FFFDF9" stroke="#2B231E" strokeWidth="1.8" />
          <circle cx="18" cy="7.5" r="3.4" fill="#F472B6" stroke="#2B231E" strokeWidth="1.8" />
        </svg>
      );
    case 'mahkota_emas':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path
            d="M7 25L6 13L13 18.5L18 10L23 18.5L30 13L29 25H7Z"
            fill="#FBBF24"
            stroke="#5E351B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect x="7" y="23" width="22" height="4.5" rx="1.5" fill="#F59E0B" stroke="#5E351B" strokeWidth="1.8" />
          <circle cx="18" cy="19.5" r="2.2" fill="#EF4444" />
          <circle cx="11.5" cy="20.5" r="1.6" fill="#38BDF8" />
          <circle cx="24.5" cy="20.5" r="1.6" fill="#38BDF8" />
        </svg>
      );
    case 'kacamata_bulat':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="11" cy="19" r="5.8" fill="#E0F2FE" fillOpacity="0.6" stroke="#4E270F" strokeWidth="2.2" />
          <circle cx="25" cy="19" r="5.8" fill="#E0F2FE" fillOpacity="0.6" stroke="#4E270F" strokeWidth="2.2" />
          <path d="M16.8 18.5Q18 16.5 19.2 18.5" stroke="#4E270F" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M5.2 17.5L3.5 15M30.8 17.5L32.5 15" stroke="#4E270F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'kacamata_hitam':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <rect x="4.5" y="14" width="11.5" height="8.5" rx="2.8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <rect x="20" y="14" width="11.5" height="8.5" rx="2.8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <path d="M4.5 15.5H31.5" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M7.5 16.5L10.5 19.8M23 16.5L26 19.8" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'kacamata_hati':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path
            d="M11 24.2C6 20 5.5 14 9 14C10.5 14 11 15.8 11 16.4C11 15.8 11.5 14 13 14C16.5 14 16 20 11 24.2Z"
            fill="#FB7185"
            fillOpacity="0.55"
            stroke="#BE185D"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M25 24.2C20 20 19.5 14 23 14C24.5 14 25 15.8 25 16.4C25 15.8 25.5 14 27 14C30.5 14 30 20 25 24.2Z"
            fill="#FB7185"
            fillOpacity="0.55"
            stroke="#BE185D"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M16 17H20" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'syal_polkadot':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M11 19L7 29L14 30L17 21" fill="#2563EB" stroke="#2B231E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M6 12C11 17 25 17 30 12L29 19C24 24 12 24 7 19L6 12Z" fill="#3B82F6" stroke="#2B231E" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="12" cy="17.5" r="1.6" fill="#FFFFFF" />
          <circle cx="18.5" cy="19.5" r="1.7" fill="#FFFFFF" />
          <circle cx="24.5" cy="17.5" r="1.5" fill="#FFFFFF" />
          <circle cx="11.5" cy="25.5" r="1.4" fill="#FFFFFF" />
        </svg>
      );
    case 'syal_garis':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M11 19L7 29L14 30L17 21" fill="#16A34A" stroke="#2B231E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M6 12C11 17 25 17 30 12L29 19C24 24 12 24 7 19L6 12Z" fill="#22C55E" stroke="#2B231E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M11 15L12 21.5M18 16.5V23M24.5 15L23.5 21.5M10 24.5L14.5 26" stroke="#FACC15" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'dasi_kupu':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <path d="M16 17L7 11V23L16 17Z" fill="#E11D48" stroke="#2B231E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M20 17L29 11V23L20 17Z" fill="#E11D48" stroke="#2B231E" strokeWidth="2" strokeLinejoin="round" />
          <rect x="15" y="13.5" width="6" height="7" rx="2" fill="#BE123C" stroke="#2B231E" strokeWidth="1.8" />
          <circle cx="18" cy="24.5" r="3.6" fill="#FACC15" stroke="#2B231E" strokeWidth="1.8" />
          <circle cx="17" cy="23.5" r="1" fill="#FEF9C3" />
        </svg>
      );
  }
};

// --- SHOP & PAUSE MODAL DECORATIVE ICONS ---

export const SinglePawBadgeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="#F5DFBA" stroke="#9A6234" strokeWidth="1.8" />
    <ellipse cx="12" cy="14.5" rx="3.4" ry="2.6" fill="#7A4928" />
    <circle cx="8.2" cy="10.5" r="1.4" fill="#7A4928" />
    <circle cx="10.8" cy="8.7" r="1.4" fill="#7A4928" />
    <circle cx="13.5" cy="8.7" r="1.4" fill="#7A4928" />
    <circle cx="16" cy="10.5" r="1.4" fill="#7A4928" />
  </svg>
);

export const PixelStarBadgeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
      fill="#FBBF24"
      stroke="#5E2F12"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12 5.2L13.5 8.5L10.5 9.2L12 5.2Z" fill="#FEF3C7" />
  </svg>
);

export const ShopShirtTabIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M7 5L3.5 8.5L6 11.5L7.5 10V19.5H16.5V10L18 11.5L20.5 8.5L17 5H14.5C14 6.5 13 7.2 12 7.2C11 7.2 10 6.5 9.5 5H7Z"
      fill="#F9A858"
      stroke="#5E2F12"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13.5" r="1.6" fill="#FFFDF8" />
  </svg>
);

export const ShopHouseTabIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M3 11.5L12 4L21 11.5" stroke="#5E2F12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 10.5V19.5H18.5V10.5L12 5.2L5.5 10.5Z" fill="#FFF3D9" stroke="#5E2F12" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M3 11.5L12 4L21 11.5H18.5L12 6.2L5.5 11.5H3Z" fill="#D96846" />
    <rect x="10" y="13.5" width="4" height="6" rx="0.8" fill="#A65E2E" stroke="#5E2F12" strokeWidth="1.4" />
  </svg>
);

export const ShopBedTabIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M3.5 17V9.5M20.5 17V12" stroke="#5E2F12" strokeWidth="2.2" strokeLinecap="round" />
    <rect x="4" y="12.5" width="16" height="4" rx="1" fill="#C97E49" stroke="#5E2F12" strokeWidth="1.6" />
    <rect x="5" y="10" width="5" height="3" rx="1.2" fill="#FFFDF8" stroke="#5E2F12" strokeWidth="1.4" />
    <path d="M10.5 10.5H19C19.8 10.5 20.3 11.2 20.3 12V13.5H10.5V10.5Z" fill="#EF6C6C" stroke="#5E2F12" strokeWidth="1.4" />
  </svg>
);

export const OrnateCornerFlourishes: React.FC<{ className?: string }> = ({ className = '' }) => (
  <>
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`pointer-events-none absolute top-1.5 left-1.5 w-4 h-4 ${className}`}
      aria-hidden="true"
    >
      <path d="M2 14V5C2 3.3 3.3 2 5 2H14" stroke="#B68049" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="5.5" cy="5.5" r="1.4" fill="#B68049" />
    </svg>
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`pointer-events-none absolute top-1.5 right-1.5 w-4 h-4 -scale-x-100 ${className}`}
      aria-hidden="true"
    >
      <path d="M2 14V5C2 3.3 3.3 2 5 2H14" stroke="#B68049" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="5.5" cy="5.5" r="1.4" fill="#B68049" />
    </svg>
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`pointer-events-none absolute bottom-1.5 left-1.5 w-4 h-4 -scale-y-100 ${className}`}
      aria-hidden="true"
    >
      <path d="M2 14V5C2 3.3 3.3 2 5 2H14" stroke="#B68049" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="5.5" cy="5.5" r="1.4" fill="#B68049" />
    </svg>
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`pointer-events-none absolute bottom-1.5 right-1.5 w-4 h-4 -scale-x-100 -scale-y-100 ${className}`}
      aria-hidden="true"
    >
      <path d="M2 14V5C2 3.3 3.3 2 5 2H14" stroke="#B68049" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="5.5" cy="5.5" r="1.4" fill="#B68049" />
    </svg>
  </>
);

export const FoodItemIcon: React.FC<IconProps & { variant: FoodItemId }> = ({
  className = 'w-12 h-12',
  variant,
}) => {
  if (variant === 'snack') {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path
          d="M5 17.5C7 13 12 12 16.5 14.5L20.5 11.5V21.5L16.5 18.5C12 21 7 20 5 17.5Z"
          fill="#F4C27F"
          stroke="#5E351B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="10.5" cy="16.5" r="1.2" fill="#5E351B" />
        <path
          d="M14.5 9.5C16.2 7 19.8 6.5 23 8.2L26 6V13.4L23 11.2C19.8 13 16.2 12.5 14.5 9.5Z"
          fill="#E8A45C"
          stroke="#5E351B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="22" r="2.2" fill="#FDE68A" stroke="#5E351B" strokeWidth="1.4" />
      </svg>
    );
  }
  if (variant === 'main_food') {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path
          d="M5 19H27L25 26C24.6 27.2 23.4 28 22 28H10C8.6 28 7.4 27.2 7 26L5 19Z"
          fill="#E88B38"
          stroke="#5E351B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <ellipse cx="16" cy="18.5" rx="11" ry="3.6" fill="#FFFDF5" stroke="#5E351B" strokeWidth="2" />
        <circle cx="11.5" cy="16.5" r="2.4" fill="#9C6234" stroke="#5E351B" strokeWidth="1.3" />
        <circle cx="16" cy="14.8" r="2.6" fill="#B57745" stroke="#5E351B" strokeWidth="1.3" />
        <circle cx="20.5" cy="16.5" r="2.4" fill="#9C6234" stroke="#5E351B" strokeWidth="1.3" />
        <circle cx="14" cy="17.8" r="2.1" fill="#C98A54" stroke="#5E351B" strokeWidth="1.2" />
        <circle cx="18.5" cy="17.8" r="2.1" fill="#C98A54" stroke="#5E351B" strokeWidth="1.2" />
      </svg>
    );
  }
  return <SalmonTreatIcon className={className} />;
};

export const BathItemIcon: React.FC<IconProps & { variant: BathItemId }> = ({
  className = 'w-12 h-12',
  variant,
}) => {
  if (variant === 'basic_soap') {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <rect
          x="5"
          y="13"
          width="18"
          height="11"
          rx="4.5"
          transform="rotate(-8 5 13)"
          fill="#BAE6FD"
          stroke="#5E351B"
          strokeWidth="2"
        />
        <rect
          x="8.5"
          y="15.5"
          width="11"
          height="4.5"
          rx="2"
          transform="rotate(-8 8.5 15.5)"
          fill="#E0F2FE"
        />
        <circle cx="24" cy="10" r="3" fill="#FFFDF9" stroke="#38BDF8" strokeWidth="1.6" />
        <circle cx="27" cy="16" r="2" fill="#FFFDF9" stroke="#38BDF8" strokeWidth="1.4" />
        <circle cx="19" cy="8" r="1.8" fill="#FFFDF9" stroke="#38BDF8" strokeWidth="1.4" />
      </svg>
    );
  }
  if (variant === 'shampoo_foam') {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
        <path d="M16 4V9M13 4H20" stroke="#5E351B" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="13" y="8" width="6" height="3.5" rx="1" fill="#FDE68A" stroke="#5E351B" strokeWidth="1.6" />
        <rect
          x="9.5"
          y="11.5"
          width="13"
          height="16"
          rx="4"
          fill="#7DD3FC"
          stroke="#5E351B"
          strokeWidth="2"
        />
        <rect x="12" y="15.5" width="8" height="6.5" rx="1.5" fill="#FFFDF9" />
        <circle cx="24.5" cy="11" r="2.8" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" />
        <circle cx="7" cy="16" r="2.2" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="17.5" r="9.5" fill="#FBCFE8" stroke="#5E351B" strokeWidth="2" />
      <path d="M7 17.5Q16 21 25 17.5" stroke="#F472B6" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12.5" cy="14" r="2" fill="#FFFDF9" fillOpacity="0.8" />
      <circle cx="24" cy="8.5" r="2.4" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.4" />
      <circle cx="8" cy="10" r="2" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.4" />
      <path d="M16 4L17 6.5L19.5 7.5L17 8.5L16 11L15 8.5L12.5 7.5L15 6.5L16 4Z" fill="#FBBF24" />
    </svg>
  );
};

export const PetHandIcon: React.FC<IconProps> = ({ className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
    <circle cx="18" cy="18" r="15.5" fill="#FFF3D9" stroke="#5E2F12" strokeWidth="2.4" />
    <path
      d="M18 27.5C18 27.5 8.5 21.5 8.5 14.8C8.5 11.8 10.8 9.6 13.6 9.6C15.4 9.6 17 10.6 18 12.1C19 10.6 20.6 9.6 22.4 9.6C25.2 9.6 27.5 11.8 27.5 14.8C27.5 21.5 18 27.5 18 27.5Z"
      fill="#F45B84"
      stroke="#5E2F12"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="13.5" cy="14" rx="2" ry="1.2" transform="rotate(-25 13.5 14)" fill="#FFC4D6" />
  </svg>
);

export const ShopBathTabIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 13H20L18.5 18.5C18 19.8 16.8 20.5 15.5 20.5H8.5C7.2 20.5 6 19.8 5.5 18.5L4 13Z"
      fill="#93C5FD"
      stroke="#5E2F12"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M3 13H21" stroke="#5E2F12" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="8.5" r="2.2" fill="#FFFDF9" stroke="#38BDF8" strokeWidth="1.5" />
    <circle cx="14.5" cy="6.5" r="2.5" fill="#FFFDF9" stroke="#38BDF8" strokeWidth="1.5" />
    <circle cx="18" cy="9.5" r="1.6" fill="#FFFDF9" stroke="#38BDF8" strokeWidth="1.3" />
  </svg>
);

