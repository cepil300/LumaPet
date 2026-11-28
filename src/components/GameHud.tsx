import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Gamepad2, Heart, Lock, Moon, Sparkles, Sun, X } from 'lucide-react';
import {
  ACTION_DELTAS,
  BATH_ITEMS,
  BathItemId,
  CAT_TOYS,
  CatHudSnapshot,
  ConsumableInventory,
  FOOD_ITEMS,
  FoodItemId,
  LIFE_STAGES,
  ManualSleepMode,
  SLEEP_OPTIONS,
  ToolMode,
} from '../types/game';
import { formatGameClock } from '../utils/catCareSystem';
import { CatAvatarSvg } from './CatAvatarSvg';
import {
  BathItemIcon,
  CuteHealthStatIcon,
  FoodItemIcon,
  PetHandIcon,
  PixelPawCluster,
  ToyIcon,
} from './CuteGameIcons';

type ActionMenuTab = 'food' | 'bath' | 'play' | 'pet' | 'sleep' | null;
type BathChoiceId = BathItemId | 'manual_brush';
type PlayChoiceId = 'interactive' | 'minigame';
type PetChoiceId = 'short' | 'full';

interface GameHudProps {
  hud: CatHudSnapshot;
  toolMode: ToolMode;
  shopOpen: boolean;
  onSelectTool: (mode: ToolMode) => void;
  onFeedItem: (foodId: FoodItemId) => void;
  onUseBathItem: (bathId: BathItemId) => void;
  onStartSleep: (mode: ManualSleepMode) => void;
  onWakeUp: () => void;
  onStartInteractivePlay: () => void;
  onPetCat: (kind: 'short' | 'full') => void;
  onGiveMedicine: () => void;
  onToggleShop: () => void;
  onOpenLifeStage?: () => void;
  onOpenMiniGame: () => void;
  onPause: () => void;
}

interface OverflowRunningTextProps {
  text: string;
  className?: string;
  align?: 'left' | 'right';
}

const OverflowRunningText: React.FC<OverflowRunningTextProps> = ({
  text,
  className = '',
  align = 'left',
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [overflowState, setOverflowState] = useState<{ isOverflowing: boolean; textWidth: number }>({
    isOverflowing: false,
    textWidth: 0,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const textEl = textRef.current;
      if (!container || !textEl) return;
      const textWidth = Math.ceil(textEl.getBoundingClientRect().width);
      const containerWidth = Math.floor(container.clientWidth);
      const isOverflowing = containerWidth > 0 && textWidth > containerWidth + 1;
      setOverflowState((prev) =>
        prev.isOverflowing === isOverflowing && Math.abs(prev.textWidth - textWidth) <= 1
          ? prev
          : { isOverflowing, textWidth }
      );
    };

    measure();
    if (typeof ResizeObserver === 'undefined' || !containerRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [text]);

  const durationSec = Math.max(3.6, (overflowState.textWidth + 24) / 26);
  const alignClass = !overflowState.isOverflowing && align === 'right' ? 'text-right' : 'text-left';

  return (
    <span
      ref={containerRef}
      className={`relative block overflow-hidden whitespace-nowrap min-w-0 ${alignClass} ${className}`}
    >
      {overflowState.isOverflowing ? (
        <span
          className="inline-flex whitespace-nowrap animate-marquee-ltr will-change-transform"
          style={{ animationDuration: `${durationSec.toFixed(2)}s` }}
        >
          <span className="pr-6">
            <span ref={textRef} className="inline-block whitespace-nowrap">
              {text}
            </span>
          </span>
          <span className="pr-6" aria-hidden="true">
            {text}
          </span>
        </span>
      ) : (
        <span ref={textRef} className="inline-block whitespace-nowrap">
          {text}
        </span>
      )}
    </span>
  );
};

interface PixelVitalMeterProps {
  label: string;
  value: number;
  iconSrc?: string;
  iconNode?: React.ReactNode;
  fillGradient: string;
  borderColor: string;
  innerRim?: boolean;
  statusTag?: string | null;
  critical?: boolean;
  fullWidth?: boolean;
}

const PixelVitalMeter: React.FC<PixelVitalMeterProps> = ({
  label,
  value,
  iconSrc,
  iconNode,
  fillGradient,
  borderColor,
  innerRim,
  statusTag,
  critical,
  fullWidth,
}) => {
  const isLow = critical || value < 20;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`flex items-center gap-2 mobile:gap-1 rounded-xl mobile:rounded-lg bg-[#F9EDD4]/85 border border-[#D4B483] px-2 py-1.5 mobile:px-1 mobile:py-0.5 shadow-[inset_0_1px_0_rgba(255,253,248,0.85)] shrink-0 ${
        fullWidth ? 'w-full' : 'w-[154px] mobile:w-[98px]'
      }`}
    >
      {/* Wooden Square Icon Frame */}
      <div className="w-8 h-8 mobile:w-5 mobile:h-5 rounded-lg mobile:rounded-md wood-modal-frame p-[2px] mobile:p-[1px] border-[2px] mobile:border border-[#5E2F12] shadow-[0_2px_0_rgba(94,47,18,0.28)] shrink-0">
        <div className="w-full h-full rounded-[5px] mobile:rounded-[3px] bg-[#FFF8E6] border border-[#7A4928]/70 flex items-center justify-center p-0.5">
          {iconSrc ? (
            <img
              src={iconSrc}
              alt={label}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            iconNode
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1 leading-none mb-1 mobile:mb-0.5 min-w-0">
          <span className="font-display font-extrabold text-[12.5px] mobile:text-[8.5px] tracking-tight text-[#5A2D12] whitespace-nowrap shrink-0">
            {label}
          </span>
          {statusTag && (
            <OverflowRunningText
              text={statusTag}
              align="right"
              className={`text-[9px] mobile:text-[7px] font-extrabold uppercase tracking-wide flex-1 ${
                isLow ? 'text-[#B91C1C]' : 'text-[#B45309]'
              }`}
            />
          )}
        </div>

        <div
          className="relative w-full h-3 mobile:h-1.5 rounded-full bg-[#EFE0C1] border-[1.5px] mobile:border overflow-hidden shadow-inner"
          style={{ borderColor: isLow ? '#B91C1C' : borderColor }}
        >
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              innerRim ? 'ring-1 ring-inset ring-[#FEF08A]/70' : ''
            }`}
            style={{
              width: `${pct}%`,
              background: isLow
                ? 'linear-gradient(180deg, #F87171 0%, #DC2626 100%)'
                : fillGradient,
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 left-[20%] w-[1.5px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-y-0 left-[40%] w-[1.5px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-y-0 left-[60%] w-[1.5px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-y-0 left-[80%] w-[1.5px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-x-1 top-[1px] h-[2px] mobile:h-[1px] rounded-full bg-white/45" />
        </div>
      </div>
    </div>
  );
};

function formatTimerMMSS(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  toolMode,
  shopOpen,
  onSelectTool,
  onFeedItem,
  onUseBathItem,
  onStartSleep,
  onWakeUp,
  onStartInteractivePlay,
  onPetCat,
  onGiveMedicine,
  onToggleShop,
  onOpenLifeStage,
  onOpenMiniGame,
  onPause,
}) => {
  const [activeMenu, setActiveMenu] = useState<ActionMenuTab>(null);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<FoodItemId>('snack');
  const [selectedBathId, setSelectedBathId] = useState<BathChoiceId>('basic_soap');
  const [selectedPlayId, setSelectedPlayId] = useState<PlayChoiceId>('interactive');
  const [selectedPetId, setSelectedPetId] = useState<PetChoiceId>('short');
  const [selectedSleepId, setSelectedSleepId] = useState<ManualSleepMode>('power_nap');

  useEffect(() => {
    if (shopOpen) {
      setActiveMenu(null);
      setItemPickerOpen(false);
    }
  }, [shopOpen]);

  const isSleeping = hud.behavior === 'SLEEPING' || hud.sleepMode !== 'none';
  const isBathLocked = isSleeping || hud.isBathing;
  const isPlayDisabled =
    isSleeping || hud.isBathing || hud.isSick || hud.energy < 20 || hud.hunger <= 2;
  const isMedicineDisabled = !hud.isSick || hud.isRecovering;
  const activeToyMeta = CAT_TOYS.find((t) => t.id === hud.activeToy) ?? CAT_TOYS[0];
  const showHealthBar = hud.isSick || hud.isRecovering || hud.health < 100;
  const dayPhaseLabel =
    hud.dayPhase === 'malam'
      ? 'Malam'
      : hud.isDusk
      ? 'Senja'
      : hud.dayPhase === 'siang'
      ? 'Siang'
      : 'Pagi';

  const moodPillClass = hud.isSick
    ? 'bg-[#FEE2E2] text-[#991B1B]'
    : hud.hunger < 40 || hud.happiness < 40 || hud.cleanliness < 40
    ? 'bg-[#FEF3C7] text-[#92400E]'
    : 'bg-[#C4EBD0] text-[#1D5132]';

  const toggleMenu = (tab: Exclude<ActionMenuTab, null>) => {
    setItemPickerOpen(false);
    setActiveMenu((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-5 mobile:px-2 mobile:py-1.5 safe-inset-hud">
      {activeMenu && (
        <div
          className="fixed inset-0 z-0 pointer-events-auto"
          onClick={() => setActiveMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* Top Perimeter Row */}
      <div className="relative z-10 flex flex-wrap short:flex-nowrap items-start justify-between gap-2 mobile:gap-1">
        {/* Top-Left: Wooden Frame Status Panel (Image 2 style) */}
        <div
          data-ui-id="hud-status-panel"
          data-ui-label="Panel Status"
          className="pointer-events-auto wood-modal-frame rounded-xl mobile:rounded-lg p-1 mobile:p-0.5 border-[2.5px] mobile:border-[1.5px] border-[#5E2F12] shadow-[inset_0_1.5px_0_rgba(255,235,205,0.45),0_3px_0_rgba(58,28,10,0.4)]"
        >
          <div className="relative rounded-lg mobile:rounded-md bg-[#FFF8E8] border-[1.5px] mobile:border border-[#6E3B1B] shadow-[inset_0_1.5px_0_#FFFFFF] px-2 py-1.5 mobile:px-1 mobile:py-0.5">
            <PixelPawCluster className="w-6 h-3.5 absolute top-0.5 right-1 pointer-events-none opacity-65 mobile:hidden" />

            <div className="grid grid-cols-2 gap-1.5 mobile:gap-0.5">
              <PixelVitalMeter
                label="Kenyang"
                value={hud.hunger}
                iconSrc="/assets/ui/stat_hunger.png"
                fillGradient="linear-gradient(180deg, #FFB53D 0%, #F97316 100%)"
                borderColor="#7A4928"
                statusTag={hud.hunger < 20 ? 'Kritis!' : hud.hunger < 40 ? 'Rewel!' : null}
                critical={hud.hunger < 20}
              />
              <PixelVitalMeter
                label="Bahagia"
                value={hud.happiness}
                iconSrc="/assets/ui/stat_happy.png"
                fillGradient="linear-gradient(180deg, #FF93AD 0%, #F2587E 100%)"
                borderColor="#9E3E5B"
                statusTag={hud.happiness < 20 ? 'Stres!' : hud.happiness < 40 ? 'Ngambek' : null}
                critical={hud.happiness < 20}
              />
              <PixelVitalMeter
                label="Bersih"
                value={hud.cleanliness}
                iconSrc="/assets/ui/stat_clean.png"
                fillGradient="linear-gradient(180deg, #8EE2FF 0%, #38BDF8 100%)"
                borderColor="#3D7F9E"
                statusTag={hud.cleanliness < 15 ? 'Kritis!' : hud.cleanliness < 40 ? 'Kotor' : null}
                critical={hud.cleanliness < 15}
              />
              <PixelVitalMeter
                label="Energi"
                value={hud.energy}
                iconSrc="/assets/ui/stat_energy.png"
                fillGradient="linear-gradient(180deg, #FFE26A 0%, #F4B62A 100%)"
                borderColor="#1E3A5F"
                innerRim
                statusTag={
                  hud.drowsyStage === 'exhausted' || hud.energy <= 0
                    ? 'Kelelahan!'
                    : hud.drowsyStage === 'drowsy_heavy'
                    ? 'Ngantuk Berat'
                    : hud.drowsyStage === 'drowsy_light'
                    ? 'Ngantuk'
                    : null
                }
                critical={hud.energy <= 20}
              />
            </div>

            {showHealthBar && (
              <div className="mt-2 mobile:mt-1">
                <PixelVitalMeter
                  label="Kesehatan"
                  value={hud.health}
                  iconNode={<CuteHealthStatIcon className="w-6 h-6 mobile:w-3.5 mobile:h-3.5" />}
                  fillGradient="linear-gradient(180deg, #4ADE80 0%, #16A34A 100%)"
                  borderColor="#2D6A4F"
                  fullWidth
                  statusTag={
                    hud.isRecovering
                      ? hud.isSick
                        ? `Pulih · Lemas (${hud.health}%)`
                        : `Pulih (${hud.health}%)`
                      : hud.isSick
                      ? `Sakit! (${hud.health}%)`
                      : `${hud.health}%`
                  }
                  critical={hud.isSick && !hud.isRecovering}
                />
              </div>
            )}
          </div>
        </div>

        {/* Top-Right: Wooden Frame Cat Profile Card (Image 1 style) + Pause Button */}
        <div className="pointer-events-auto flex items-start gap-1.5 mobile:gap-1 shrink-0 ml-auto">
          <div
            data-ui-id="hud-profile-card"
            data-ui-label="Profil Kucing"
            className="wood-modal-frame rounded-xl mobile:rounded-lg p-1 mobile:p-0.5 border-[2.5px] mobile:border-[1.5px] border-[#5E2F12] shadow-[inset_0_1.5px_0_rgba(255,235,205,0.45),0_3px_0_rgba(58,28,10,0.4)]"
          >
            <div className="relative rounded-lg mobile:rounded-md bg-[#FFF8E8] border-[1.5px] mobile:border border-[#6E3B1B] shadow-[inset_0_1.5px_0_#FFFFFF] px-2 py-1.5 mobile:px-1 mobile:py-0.5 flex items-center gap-2 mobile:gap-1">
              <PixelPawCluster className="w-6 h-3.5 absolute top-0.5 right-1 pointer-events-none opacity-65 mobile:hidden" />

              {/* Circular Wooden Medallion Cat Avatar */}
              <div className="w-12 h-12 mobile:w-7 mobile:h-7 rounded-full wood-modal-frame p-[2px] mobile:p-[1px] border-[2px] mobile:border border-[#5E2F12] shadow-[0_2px_0_rgba(94,47,18,0.3)] shrink-0">
                <div className="w-full h-full rounded-full bg-[#F8EBD0] border mobile:border border-[#6E3B1B] flex items-center justify-center overflow-hidden">
                  <div className="scale-[0.84] mobile:scale-[0.48] flex items-center justify-center">
                    <CatAvatarSvg
                      breed={hud.breed}
                      size={46}
                      hat={hud.equippedHat}
                      glasses={hud.equippedGlasses}
                      scarf={hud.equippedScarf}
                      lifeStage={hud.lifeStage}
                    />
                  </div>
                </div>
              </div>

              {/* Right Content: 2 Clean Rows (fixed width so card never resizes) */}
              <div className="w-[216px] mobile:w-[154px] min-w-0 flex flex-col gap-1 mobile:gap-0.5 pr-0.5 mobile:pr-0">
                {/* Row 1: Name + Day/Time/Weather Pill */}
                <div className="flex items-center justify-between gap-1.5 mobile:gap-0.5 whitespace-nowrap min-w-0">
                  <OverflowRunningText
                    text={hud.name}
                    className="font-display font-extrabold text-[17px] mobile:text-[10.5px] leading-none text-[#4E270F] flex-1"
                  />

                  <span
                    className="inline-flex items-center gap-1 mobile:gap-0.5 px-2 py-0.5 mobile:px-1 mobile:py-0 rounded-full bg-[#FFF7E2] border-[1.5px] mobile:border border-[#8C582E] text-[10px] mobile:text-[7.5px] font-extrabold text-[#4E270F] tabular-nums shadow-[inset_0_1px_0_#FFFFFF] shrink-0 max-w-[146px] mobile:max-w-[104px] min-w-0"
                    title={
                      (hud.dayPhase === 'pagi'
                        ? 'Pagi (06:00–11:59) · Bonus tidur +10% Energi'
                        : hud.dayPhase === 'siang'
                        ? `${hud.isDusk ? 'Senja' : 'Siang'} (12:00–17:59) · Main +10% Bahagia · Kenyang/Energi 1,1x`
                        : 'Malam (18:00–05:59) · Tidur +20% Energi · Energi 1,25x') +
                      (hud.weather === 'hujan'
                        ? ' | Hujan: Energi 1,15x · Tidur +10% · Ngantuk ≤45 · Di rumah Bahagia 0,9x'
                        : '')
                    }
                  >
                    {hud.dayPhase === 'malam' ? (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 mobile:w-2 mobile:h-2 shrink-0" aria-hidden="true">
                        <path
                          d="M17.8 14.8A6.8 6.8 0 0 1 9.2 6.2a6.8 6.8 0 1 0 8.6 8.6Z"
                          fill="#FDE047"
                          stroke="#713F12"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17.5 4.2l.55 1.4 1.4.55-1.4.55-.55 1.4-.55-1.4-1.4-.55 1.4-.55Z"
                          fill="#FDE047"
                        />
                      </svg>
                    ) : hud.dayPhase === 'siang' ? (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 mobile:w-2 mobile:h-2 shrink-0" aria-hidden="true">
                        <circle
                          cx="12"
                          cy="12"
                          r="4.6"
                          fill={hud.isDusk ? '#FB923C' : '#FACC15'}
                          stroke={hud.isDusk ? '#9A3412' : '#B45309'}
                          strokeWidth="1.6"
                        />
                        <path
                          d="M12 2.2v2.4M12 19.4v2.4M2.2 12h2.4M19.4 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7"
                          stroke={hud.isDusk ? '#EA580C' : '#D97706'}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 mobile:w-2 mobile:h-2 shrink-0" aria-hidden="true">
                        <path
                          d="M6 16a6 6 0 0 1 12 0"
                          fill="#FDE047"
                          stroke="#B45309"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M3 16.5h18M12 4.5v2.2M6.2 7.4l1.5 1.5M17.8 7.4l-1.5 1.5"
                          stroke="#D97706"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    {hud.weather === 'hujan' && (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3 h-3 mobile:w-2 mobile:h-2 shrink-0"
                        aria-label="Hujan"
                      >
                        <path
                          d="M7 14h10a3.8 3.8 0 0 0 .6-7.55A4.8 4.8 0 0 0 8 6a3.8 3.8 0 0 0-1 8Z"
                          fill="#93C5FD"
                          stroke="#1E3A8A"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 17.5l-.8 2.5M13 17.5l-.8 2.5M17 17.5l-.8 2.5"
                          stroke="#2563EB"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    <OverflowRunningText
                      text={`Hari ${hud.day}${
                        hud.lifeStage === 'baby' ? ` (${Math.floor(hud.gameHours)}j)` : ''
                      } · ${formatGameClock(hud.gameHour)} ${
                        hud.weather === 'hujan' ? `Hujan ${dayPhaseLabel}` : dayPhaseLabel
                      }`}
                      className="flex-1 min-w-0"
                    />
                  </span>
                </div>

                {/* Row 2: Golden Stage Pill + Mint Mood Pill + Golden Coin Pill */}
                <div className="flex items-center gap-1 mobile:gap-0.5 whitespace-nowrap min-w-0">
                  {onOpenLifeStage ? (
                    <button
                      type="button"
                      onClick={onOpenLifeStage}
                      title="Lihat Tahap Pertumbuhan & Evolusi"
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 mobile:px-1 mobile:py-0 rounded-full bg-gradient-to-b from-[#FFE686] to-[#F2B538] border-[1.5px] mobile:border border-[#8C582E] shadow-[inset_0_1px_0_#FFF8D2] text-[10px] mobile:text-[7.5px] font-extrabold text-[#4E270F] hover:brightness-105 transition-all cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-2.5 h-2.5 mobile:w-2 mobile:h-2 shrink-0" />
                      <span>{LIFE_STAGES[hud.lifeStage].shortLabel}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 mobile:px-1 mobile:py-0 rounded-full bg-gradient-to-b from-[#FFE686] to-[#F2B538] border-[1.5px] mobile:border border-[#8C582E] shadow-[inset_0_1px_0_#FFF8D2] text-[10px] mobile:text-[7.5px] font-extrabold text-[#4E270F] shrink-0">
                      <Sparkles className="w-2.5 h-2.5 mobile:w-2 mobile:h-2 shrink-0" />
                      <span>{LIFE_STAGES[hud.lifeStage].shortLabel}</span>
                    </span>
                  )}

                  <span
                    className={`flex-1 min-w-0 inline-flex items-center gap-1 mobile:gap-0.5 px-2 py-0.5 mobile:px-1 mobile:py-0 rounded-full text-[10px] mobile:text-[7.5px] font-extrabold ${moodPillClass}`}
                  >
                    {isSleeping && (
                      <span className="font-display font-black text-[9px] mobile:text-[7px] tracking-tighter shrink-0">
                        zZ
                      </span>
                    )}
                    <OverflowRunningText text={hud.moodLabel} className="flex-1 min-w-0" />
                  </span>

                  <span className="inline-flex items-center gap-1 mobile:gap-0.5 px-2 py-0.5 mobile:px-1 mobile:py-0 rounded-full bg-[#FFFDF6] border-[1.5px] mobile:border border-[#6E3B1B] ring-1 ring-inset ring-[#F3C548] text-[11px] mobile:text-[7.5px] font-display font-extrabold text-[#4E270F] tabular-nums shrink-0">
                    <img
                      src="/assets/ui/icon_coin.png"
                      alt=""
                      className="w-3.5 h-3.5 mobile:w-2.5 mobile:h-2.5 object-contain"
                      draggable={false}
                    />
                    <span>
                      {hud.coins}
                      <span className="mobile:hidden"> Koin</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            data-ui-id="hud-pause-btn"
            data-ui-label="Tombol Jeda"
            className="flex flex-col items-end gap-1.5 mobile:gap-1 shrink-0"
          >
            <button
              type="button"
              onClick={onPause}
              className="min-w-[40px] min-h-[40px] mobile:min-w-[28px] mobile:min-h-[28px] flex items-center justify-center bg-transparent border-0 p-0 hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
              aria-label="Menu Jeda"
              title="Menu Jeda (Esc)"
            >
              <img
                src="/assets/ui/btn_pause.png"
                alt="Jeda"
                className="w-10 h-10 mobile:w-7 mobile:h-7 object-contain drop-shadow-[0_3px_0_rgba(90,45,18,0.28)]"
                draggable={false}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom-Center: Action Popovers + Floating Dock */}
      <div className="relative z-10 flex flex-col items-center gap-2 short:gap-1 mt-auto">
        {/* Action Submenu Popover (Compact Single-Item View + Click-to-Switch Picker) */}
        {activeMenu && (
          <div className="pointer-events-auto w-full max-w-[380px] rounded-2xl bg-[#FFF4DC] border-[3px] border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8,0_8px_0_rgba(58,28,10,0.42)] p-2.5 short:p-2">
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b-2 border-[#7A4928]/15">
              <span className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12]">
                {activeMenu === 'food'
                  ? itemPickerOpen
                    ? 'Pilih Makanan'
                    : 'Makanan'
                  : activeMenu === 'bath'
                  ? itemPickerOpen
                    ? 'Pilih Mandi'
                    : 'Mandi'
                  : activeMenu === 'play'
                  ? itemPickerOpen
                    ? 'Pilih Bermain'
                    : 'Bermain'
                  : activeMenu === 'pet'
                  ? itemPickerOpen
                    ? 'Pilih Elus'
                    : 'Elus-elus'
                  : itemPickerOpen
                  ? 'Pilih Tidur'
                  : 'Tidur'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveMenu(null);
                  setItemPickerOpen(false);
                }}
                className="w-7 h-7 rounded-full bg-[#EFE2C8] border border-[#7A4928]/50 text-[#5A2D12] flex items-center justify-center hover:bg-[#FCE8C3] cursor-pointer"
                aria-label="Tutup menu aksi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeMenu === 'food' && (() => {
              if (itemPickerOpen) {
                return (
                  <div className="space-y-1.5">
                    {FOOD_ITEMS.map((item) => {
                      const isSelected = selectedFoodId === item.id;
                      const stock = item.isFree
                        ? null
                        : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedFoodId(item.id);
                            setItemPickerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                              : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center shrink-0">
                              <FoodItemIcon variant={item.id} className="w-7 h-7" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                                {item.shortName}
                              </p>
                              <p className="text-[11px] font-bold text-[#2D6A4F] truncate">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {stock !== null && (
                              <span className="text-xs font-extrabold text-[#7A4928] tabular-nums">
                                ({stock})
                              </span>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-[#2D6A4F]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              }

              const item = FOOD_ITEMS.find((f) => f.id === selectedFoodId) ?? FOOD_ITEMS[0];
              const stock = item.isFree
                ? 0
                : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
              const isHungerFull = hud.hunger >= 100;
              const snackCd = item.isFree ? hud.cooldownsSec.snack : 0;
              const freeBlocked = snackCd > 0;

              return (
                <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                  <button
                    type="button"
                    onClick={() => setItemPickerOpen(true)}
                    title="Klik untuk ganti pilihan makanan"
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center shrink-0">
                      <FoodItemIcon variant={item.id} className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {item.shortName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#2D6A4F] truncate">
                        {item.description}
                      </p>
                    </div>
                  </button>

                  {item.isFree ? (
                    <button
                      type="button"
                      disabled={freeBlocked}
                      onClick={() => {
                        if (freeBlocked) return;
                        onSelectTool('PET');
                        onFeedItem('snack');
                        setActiveMenu(null);
                      }}
                      className={`px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                        freeBlocked
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white cursor-pointer hover:brightness-105'
                      }`}
                    >
                      {snackCd > 0 ? formatTimerMMSS(snackCd) : 'Beri Gratis'}
                    </button>
                  ) : stock > 0 ? (
                    <button
                      type="button"
                      disabled={isHungerFull}
                      onClick={() => {
                        if (isHungerFull) return;
                        onSelectTool('PET');
                        onFeedItem(item.id);
                        setActiveMenu(null);
                      }}
                      className={`px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                        isHungerFull
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] cursor-pointer hover:bg-[#D4E6DA]'
                      }`}
                    >
                      {isHungerFull ? `Kenyang 100 (${stock})` : `Pakai (${stock})`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        setItemPickerOpen(false);
                        onToggleShop();
                      }}
                      className="px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] cursor-pointer hover:brightness-105"
                    >
                      Beli di Toko
                    </button>
                  )}
                </div>
              );
            })()}

            {activeMenu === 'bath' && (() => {
              if (itemPickerOpen) {
                return (
                  <div className="space-y-1.5">
                    {BATH_ITEMS.map((item) => {
                      const isSelected = selectedBathId === item.id;
                      const stock = item.isFree
                        ? null
                        : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedBathId(item.id);
                            setItemPickerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                              : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#E6F4FE] border border-[#93C5FD] flex items-center justify-center shrink-0">
                              <BathItemIcon variant={item.id} className="w-7 h-7" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                                {item.shortName}
                              </p>
                              <p className="text-[11px] font-bold text-[#0369A1] truncate">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {stock !== null && (
                              <span className="text-xs font-extrabold text-[#7A4928] tabular-nums">
                                ({stock})
                              </span>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-[#2D6A4F]" />}
                          </div>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBathId('manual_brush');
                        setItemPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        selectedBathId === 'manual_brush'
                          ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                          : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center shrink-0 p-1">
                          <img
                            src="/assets/ui/icon_brush.png"
                            alt=""
                            className="w-full h-full object-contain"
                            draggable={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Sikat Manual
                          </p>
                          <p className="text-[11px] font-bold text-[#0369A1] truncate">
                            +10 Bersih per gosokan
                          </p>
                        </div>
                      </div>
                      {selectedBathId === 'manual_brush' && (
                        <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              }

              if (selectedBathId === 'manual_brush') {
                const brushBlocked = isBathLocked || hud.cleanliness >= 100;
                return (
                  <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                    <button
                      type="button"
                      onClick={() => setItemPickerOpen(true)}
                      title="Klik untuk ganti pilihan mandi"
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center shrink-0 p-1">
                        <img
                          src="/assets/ui/icon_brush.png"
                          alt=""
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Sikat Manual
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                        </div>
                        <p className="text-[11px] font-bold text-[#0369A1] truncate">
                          +10 Bersih per gosokan
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      disabled={brushBlocked}
                      onClick={() => {
                        if (brushBlocked) return;
                        onSelectTool(toolMode === 'BRUSH' ? 'PET' : 'BRUSH');
                        setActiveMenu(null);
                      }}
                      className={`px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 ${
                        brushBlocked
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-[#EFE2C8] border-[#7A4928]/60 text-[#5A2D12] hover:bg-[#FCE8C3] cursor-pointer'
                      }`}
                    >
                      {hud.isBathing
                        ? 'Mandi...'
                        : isSleeping
                        ? 'Tidur'
                        : hud.cleanliness >= 100
                        ? 'Bersih 100'
                        : toolMode === 'BRUSH'
                        ? 'Matikan'
                        : 'Pakai Sikat'}
                    </button>
                  </div>
                );
              }

              const item = BATH_ITEMS.find((b) => b.id === selectedBathId) ?? BATH_ITEMS[0];
              const stock = item.isFree
                ? 0
                : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
              const isCleanFull = hud.cleanliness >= 100;
              const soapCd = item.isFree ? hud.cooldownsSec.basicSoap : 0;
              const freeBlocked = isBathLocked || isCleanFull || soapCd > 0;
              const shopUseBlocked = isBathLocked || isCleanFull;

              return (
                <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                  <button
                    type="button"
                    onClick={() => setItemPickerOpen(true)}
                    title="Klik untuk ganti pilihan mandi"
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#E6F4FE] border border-[#93C5FD] flex items-center justify-center shrink-0">
                      <BathItemIcon variant={item.id} className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {item.shortName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#0369A1] truncate">
                        {item.description}
                      </p>
                    </div>
                  </button>

                  {item.isFree ? (
                    <button
                      type="button"
                      disabled={freeBlocked}
                      onClick={() => {
                        if (freeBlocked) return;
                        onSelectTool('PET');
                        onUseBathItem('basic_soap');
                        setActiveMenu(null);
                      }}
                      className={`px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                        freeBlocked
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-gradient-to-b from-[#4B9B59] to-[#2E6F3E] border-[#1E4627] text-white cursor-pointer hover:brightness-105'
                      }`}
                    >
                      {hud.isBathing
                        ? 'Mandi...'
                        : isSleeping
                        ? 'Tidur'
                        : isCleanFull
                        ? 'Bersih 100'
                        : soapCd > 0
                        ? formatTimerMMSS(soapCd)
                        : 'Pakai Gratis'}
                    </button>
                  ) : stock > 0 ? (
                    <button
                      type="button"
                      disabled={shopUseBlocked}
                      onClick={() => {
                        if (shopUseBlocked) return;
                        onSelectTool('PET');
                        onUseBathItem(item.id);
                        setActiveMenu(null);
                      }}
                      className={`px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                        shopUseBlocked
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] cursor-pointer hover:bg-[#D4E6DA]'
                      }`}
                    >
                      {hud.isBathing
                        ? 'Mandi...'
                        : isSleeping
                        ? 'Tidur'
                        : isCleanFull
                        ? `Bersih 100 (${stock})`
                        : `Pakai (${stock})`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        setItemPickerOpen(false);
                        onToggleShop();
                      }}
                      className="px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] cursor-pointer hover:brightness-105"
                    >
                      Beli di Toko
                    </button>
                  )}
                </div>
              );
            })()}

            {activeMenu === 'play' && (() => {
              const interactiveCd = hud.cooldownsSec.interactivePlay;
              const miniCd = hud.cooldownsSec.miniGame;
              const isHappyFull = hud.happiness >= 100;
              const interactiveBlocked =
                isSleeping ||
                hud.isSick ||
                hud.energy <= 20 ||
                hud.hunger <= 2 ||
                interactiveCd > 0;
              const miniBlocked =
                !hud.miniGameUnlocked ||
                isSleeping ||
                hud.isSick ||
                hud.energy < 20 ||
                hud.hunger <= 2 ||
                miniCd > 0;

              const interactiveLabel = isSleeping
                ? 'Tidur'
                : hud.isSick
                ? 'Sakit'
                : hud.energy <= 20
                ? 'Energi ≤ 20'
                : hud.hunger <= 2
                ? 'Lapar'
                : interactiveCd > 0
                ? formatTimerMMSS(interactiveCd)
                : 'Main';

              const miniLabel = !hud.miniGameUnlocked
                ? 'Fase Anak+'
                : isSleeping
                ? 'Tidur'
                : hud.isSick
                ? 'Sakit'
                : hud.energy < 20
                ? 'Energi < 20'
                : hud.hunger <= 2
                ? 'Lapar'
                : miniCd > 0
                ? formatTimerMMSS(miniCd)
                : 'Mulai';

              if (itemPickerOpen) {
                return (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlayId('interactive');
                        setItemPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        selectedPlayId === 'interactive'
                          ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                          : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center shrink-0 p-1">
                          <ToyIcon variant={hud.activeToy} className="w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Mainan ({activeToyMeta.shortName})
                          </p>
                          <p className="text-[11px] font-bold text-[#BE185D] truncate">
                            +{isHappyFull ? 0 : ACTION_DELTAS.playInteractiveFull.happiness} Bahagia ·{' '}
                            {ACTION_DELTAS.playInteractiveFull.energy} Energi
                          </p>
                        </div>
                      </div>
                      {selectedPlayId === 'interactive' && (
                        <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlayId('minigame');
                        setItemPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        selectedPlayId === 'minigame'
                          ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                          : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-center shrink-0">
                          <Gamepad2 className="w-5 h-5 text-[#0284C7]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Mini Game Kolam
                          </p>
                          <p className="text-[11px] font-bold text-[#0369A1] truncate">
                            +{isHappyFull ? 0 : ACTION_DELTAS.playMiniGame.happiness + (hud.weather === 'hujan' ? 5 : 0)}{' '}
                            Bahagia · {ACTION_DELTAS.playMiniGame.energy} Energi
                          </p>
                        </div>
                      </div>
                      {selectedPlayId === 'minigame' && (
                        <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              }

              if (selectedPlayId === 'minigame') {
                return (
                  <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                    <button
                      type="button"
                      onClick={() => setItemPickerOpen(true)}
                      title="Klik untuk ganti aktivitas bermain"
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-5 h-5 text-[#0284C7]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Mini Game Kolam
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                        </div>
                        <p className="text-[11px] font-bold text-[#0369A1] truncate">
                          +{isHappyFull ? 0 : ACTION_DELTAS.playMiniGame.happiness + (hud.weather === 'hujan' ? 5 : 0)}{' '}
                          Bahagia · {ACTION_DELTAS.playMiniGame.energy} Energi
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      disabled={miniBlocked}
                      onClick={() => {
                        if (miniBlocked) return;
                        setActiveMenu(null);
                        onOpenMiniGame();
                      }}
                      className={`px-3.5 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 inline-flex items-center gap-1 tabular-nums ${
                        !miniBlocked
                          ? 'bg-gradient-to-b from-[#38BDF8] to-[#0284C7] border-[#0C4A6E] text-white cursor-pointer hover:brightness-105'
                          : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                      }`}
                    >
                      {!hud.miniGameUnlocked && <Lock className="w-3.5 h-3.5" />}
                      <span>{miniLabel}</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                  <button
                    type="button"
                    onClick={() => setItemPickerOpen(true)}
                    title="Klik untuk ganti aktivitas bermain"
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center shrink-0 p-1">
                      <ToyIcon variant={hud.activeToy} className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          Mainan ({activeToyMeta.shortName})
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#BE185D] truncate">
                        +{isHappyFull ? 0 : ACTION_DELTAS.playInteractiveFull.happiness} Bahagia ·{' '}
                        {ACTION_DELTAS.playInteractiveFull.energy} Energi
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={interactiveBlocked}
                    onClick={() => {
                      if (interactiveBlocked) return;
                      onSelectTool('TOY');
                      onStartInteractivePlay();
                      setActiveMenu(null);
                    }}
                    className={`px-3.5 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                      interactiveBlocked
                        ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                        : 'bg-gradient-to-b from-[#F472B6] to-[#DB2777] border-[#831843] text-white cursor-pointer hover:brightness-105'
                    }`}
                  >
                    {interactiveLabel}
                  </button>
                </div>
              );
            })()}

            {activeMenu === 'pet' && (() => {
              const petShortCd = hud.cooldownsSec.petShort;
              const petFullCd = hud.cooldownsSec.petFull;
              const shortBlocked = isSleeping || petShortCd > 0;
              const fullBlocked = isSleeping || petFullCd > 0;

              if (itemPickerOpen) {
                return (
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPetId('short');
                        setItemPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        selectedPetId === 'short'
                          ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                          : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#FFE4E6] border border-[#FDA4AF] flex items-center justify-center shrink-0 p-1">
                          <PetHandIcon className="w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Elus Singkat
                          </p>
                          <p className="text-[11px] font-bold text-[#BE185D] truncate">
                            +{ACTION_DELTAS.petShort.happiness} Bahagia
                          </p>
                        </div>
                      </div>
                      {selectedPetId === 'short' && (
                        <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPetId('full');
                        setItemPickerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                        selectedPetId === 'full'
                          ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                          : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center shrink-0">
                          <Heart className="w-5 h-5 text-[#E11D48] fill-[#E11D48]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Elus Penuh
                          </p>
                          <p className="text-[11px] font-bold text-[#BE185D] truncate">
                            +{ACTION_DELTAS.petFull.happiness} Bahagia · {ACTION_DELTAS.petFull.hunger} Kenyang
                          </p>
                        </div>
                      </div>
                      {selectedPetId === 'full' && (
                        <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              }

              if (selectedPetId === 'full') {
                return (
                  <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                    <button
                      type="button"
                      onClick={() => setItemPickerOpen(true)}
                      title="Klik untuk ganti jenis elus"
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-[#E11D48] fill-[#E11D48]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            Elus Penuh
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                        </div>
                        <p className="text-[11px] font-bold text-[#BE185D] truncate">
                          +{ACTION_DELTAS.petFull.happiness} Bahagia · {ACTION_DELTAS.petFull.hunger} Kenyang
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      disabled={fullBlocked}
                      onClick={() => {
                        if (fullBlocked) return;
                        onSelectTool('PET');
                        onPetCat('full');
                        setActiveMenu(null);
                      }}
                      className={`px-3.5 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                        fullBlocked
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-gradient-to-b from-[#F472B6] to-[#BE185D] border-[#831843] text-white cursor-pointer hover:brightness-105'
                      }`}
                    >
                      {isSleeping
                        ? 'Tidur'
                        : petFullCd > 0
                        ? formatTimerMMSS(petFullCd)
                        : 'Kasih Sayang'}
                    </button>
                  </div>
                );
              }

              return (
                <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                  <button
                    type="button"
                    onClick={() => setItemPickerOpen(true)}
                    title="Klik untuk ganti jenis elus"
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FFE4E6] border border-[#FDA4AF] flex items-center justify-center shrink-0 p-1">
                      <PetHandIcon className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          Elus Singkat
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#BE185D] truncate">
                        +{ACTION_DELTAS.petShort.happiness} Bahagia
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={shortBlocked}
                    onClick={() => {
                      if (shortBlocked) return;
                      onSelectTool('PET');
                      onPetCat('short');
                      setActiveMenu(null);
                    }}
                    className={`px-3.5 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                      shortBlocked
                        ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                        : 'bg-gradient-to-b from-[#FB7185] to-[#E11D48] border-[#881337] text-white cursor-pointer hover:brightness-105'
                    }`}
                  >
                    {isSleeping
                      ? 'Tidur'
                      : petShortCd > 0
                      ? formatTimerMMSS(petShortCd)
                      : 'Elus'}
                  </button>
                </div>
              );
            })()}

            {activeMenu === 'sleep' && (() => {
              if (isSleeping && hud.sleepMode !== 'none') {
                return (
                  <div className="p-2.5 rounded-xl bg-[#EFF6FF] border-2 border-[#60A5FA] flex items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-[#1E3A8A] tabular-nums">
                      {hud.sleepMode === 'auto_sleep'
                        ? 'Auto-Sleep'
                        : hud.sleepMode === 'power_nap'
                        ? 'Power Nap'
                        : 'Tidur Penuh'}
                      {' · '}
                      {formatTimerMMSS(hud.sleepRemainingSec)}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onWakeUp();
                        setActiveMenu(null);
                      }}
                      className="px-3 py-1.5 min-h-[36px] rounded-full bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-2 border-[#6E3B1B] text-[#5A2D12] font-display font-extrabold text-xs whitespace-nowrap cursor-pointer"
                    >
                      <Sun className="w-3.5 h-3.5 inline mr-1" />
                      Bangunkan (-10 Bahagia)
                    </button>
                  </div>
                );
              }

              const isEnergyFull = hud.energy >= 100;
              const isDaytimeTooFresh = hud.dayPhase !== 'malam' && hud.energy > 85;
              const isDaytimeBriefOnly =
                hud.dayPhase !== 'malam' && hud.energy > 70 && hud.energy <= 85;

              if (itemPickerOpen) {
                return (
                  <div className="space-y-1.5">
                    {SLEEP_OPTIONS.map((opt) => {
                      const isSelected = selectedSleepId === opt.id;
                      const briefMode = isDaytimeBriefOnly && opt.id === 'power_nap';
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedSleepId(opt.id);
                            setItemPickerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F2FBF5] border-[#2D6A4F]'
                              : 'bg-[#FFFDF8] border-[#C79C69] hover:bg-[#FEF8E8]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] flex items-center justify-center shrink-0">
                              <Moon className="w-5 h-5 text-[#1D4ED8]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                                {briefMode ? 'Tidur Sebentar' : opt.shortName}
                              </p>
                              <p className="text-[11px] font-bold text-[#1D4ED8] truncate">
                                {briefMode ? '+20 Energi · 1,5 mnt' : opt.description}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                );
              }

              const opt = SLEEP_OPTIONS.find((s) => s.id === selectedSleepId) ?? SLEEP_OPTIONS[0];
              const briefMode = isDaytimeBriefOnly && opt.id === 'power_nap';
              const optBlocked =
                isSleeping ||
                isEnergyFull ||
                isDaytimeTooFresh ||
                (isDaytimeBriefOnly && opt.id === 'full_rest');

              const btnLabel = isSleeping
                ? 'Tidur'
                : isEnergyFull
                ? 'Energi 100'
                : isDaytimeTooFresh
                ? 'Segar (>85)'
                : isDaytimeBriefOnly && opt.id === 'full_rest'
                ? 'Energi >70'
                : briefMode
                ? 'Tidur Sebentar'
                : opt.shortName;

              return (
                <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                  <button
                    type="button"
                    onClick={() => setItemPickerOpen(true)}
                    title="Klik untuk ganti pilihan tidur"
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] flex items-center justify-center shrink-0">
                      <Moon className="w-5 h-5 text-[#1D4ED8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {briefMode ? 'Tidur Sebentar' : opt.shortName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#1D4ED8] truncate">
                        {briefMode ? '+20 Energi · 1,5 mnt' : opt.description}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={optBlocked}
                    onClick={() => {
                      if (optBlocked) return;
                      onSelectTool('PET');
                      onStartSleep(opt.id);
                      setActiveMenu(null);
                    }}
                    className={`px-3.5 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap shrink-0 tabular-nums ${
                      optBlocked
                        ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                        : 'bg-gradient-to-b from-[#60A5FA] to-[#2563EB] border-[#1E3A8A] text-white cursor-pointer hover:brightness-105'
                    }`}
                  >
                    {btnLabel}
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* Bottom Action Dock */}
        <div
          data-ui-id="hud-action-dock"
          data-ui-label="Dock Aksi Bawah"
          className="pointer-events-auto flex items-center justify-center gap-2.5 sm:gap-4 short:gap-2 bg-transparent border-0 shadow-none p-1 short:p-0"
        >
          <button
            type="button"
            onClick={() => toggleMenu('food')}
            aria-label="Menu Makanan"
            title="Makan (Camilan Gratis / Makanan Shop)"
            className={`relative w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              activeMenu === 'food' ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <img
              src="/assets/ui/icon_feed.png"
              alt="Makan"
              className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]"
              draggable={false}
            />
          </button>

          <button
            type="button"
            disabled={isBathLocked}
            onClick={() => {
              if (isBathLocked) return;
              toggleMenu('bath');
            }}
            aria-label={
              hud.isBathing
                ? 'Kucing sedang mandi di bak'
                : isSleeping
                ? 'Mandi dikunci saat kucing sedang tidur'
                : 'Menu Mandi & Kebersihan'
            }
            title={
              hud.isBathing
                ? 'Kucing sedang mandi di bak!'
                : isSleeping
                ? 'Mandi dikunci saat kucing sedang tidur'
                : 'Mandi (Sabun Gratis / Shampo / Spa)'
            }
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center transition-transform ${
              isBathLocked
                ? 'opacity-45 grayscale cursor-not-allowed'
                : 'hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 cursor-pointer'
            } ${
              !isBathLocked && (activeMenu === 'bath' || toolMode === 'BRUSH')
                ? '-translate-y-2 short:-translate-y-1 scale-110'
                : ''
            }`}
          >
            <img
              src="/assets/ui/icon_brush.png"
              alt="Mandi"
              className={`w-full h-full object-contain ${
                !isBathLocked && (toolMode === 'BRUSH' || activeMenu === 'bath')
                  ? 'drop-shadow-[0_0_10px_rgba(125,211,252,0.95)]'
                  : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
              }`}
              draggable={false}
            />
          </button>

          <button
            type="button"
            disabled={isPlayDisabled}
            onClick={() => {
              if (isPlayDisabled) return;
              toggleMenu('play');
            }}
            aria-label={
              isSleeping
                ? 'Bermain dikunci saat kucing sedang tidur'
                : isPlayDisabled
                ? 'Tidak bisa bermain saat sakit atau Energi < 20'
                : `Menu Bermain (${activeToyMeta.name})`
            }
            title={
              isSleeping
                ? 'Bermain dikunci saat kucing sedang tidur'
                : isPlayDisabled
                ? 'Tidak bisa bermain (Sakit atau Energi < 20)'
                : 'Bermain (Mainan Interaktif / Mini Game)'
            }
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center transition-transform ${
              isPlayDisabled
                ? 'opacity-45 grayscale cursor-not-allowed'
                : 'hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 cursor-pointer'
            } ${
              !isPlayDisabled && (toolMode === 'TOY' || activeMenu === 'play')
                ? '-translate-y-2 short:-translate-y-1 scale-110'
                : ''
            }`}
          >
            {hud.activeToy === 'yarn_ball' ? (
              <img
                src="/assets/ui/icon_ball.png"
                alt={activeToyMeta.name}
                className={`w-full h-full object-contain ${
                  !isPlayDisabled && (toolMode === 'TOY' || activeMenu === 'play')
                    ? 'drop-shadow-[0_0_10px_rgba(244,114,182,0.95)]'
                    : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
                }`}
                draggable={false}
              />
            ) : (
              <ToyIcon
                variant={hud.activeToy}
                className={`w-full h-full ${
                  !isPlayDisabled && (toolMode === 'TOY' || activeMenu === 'play')
                    ? 'drop-shadow-[0_0_10px_rgba(244,114,182,0.95)]'
                    : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
                }`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => toggleMenu('pet')}
            aria-label="Menu Elus-elus"
            title="Elus-elus (+15 / +25 Bahagia · +0 Energi)"
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              activeMenu === 'pet' ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <PetHandIcon
              className={`w-full h-full ${
                activeMenu === 'pet'
                  ? 'drop-shadow-[0_0_10px_rgba(244,91,132,0.95)]'
                  : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => toggleMenu('sleep')}
            aria-label="Menu Tidur & Istirahat"
            title="Tidur & Istirahat (Power Nap / Tidur Penuh)"
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              isSleeping || activeMenu === 'sleep' ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <img
              src="/assets/ui/icon_sleep.png"
              alt="Tidur"
              className={`w-full h-full object-contain ${
                isSleeping || activeMenu === 'sleep'
                  ? 'drop-shadow-[0_0_10px_rgba(250,204,21,0.95)]'
                  : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
              }`}
              draggable={false}
            />
          </button>

          <button
            type="button"
            disabled={isMedicineDisabled}
            onClick={() => {
              if (isMedicineDisabled) return;
              setActiveMenu(null);
              onGiveMedicine();
            }}
            aria-label={
              hud.isRecovering
                ? 'Kucing sedang pulih dari obat'
                : !hud.isSick
                ? 'Obat hanya bisa diberikan saat kucing sakit'
                : 'Beri Obat'
            }
            title={
              hud.isRecovering
                ? hud.isSick
                  ? 'Kucing sedang pemulihan (efek sakit hilang di 90%)'
                  : 'Kucing sedang pemulihan menuju 100%'
                : !hud.isSick
                ? 'Obat hanya bisa diberikan saat kucing sakit'
                : 'Beri Obat (Kucing sedang sakit!)'
            }
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center transition-transform ${
              isMedicineDisabled
                ? 'opacity-45 grayscale cursor-not-allowed'
                : 'hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 cursor-pointer animate-bounce'
            }`}
          >
            <img
              src="/assets/ui/icon_medicine.png"
              alt="Beri Obat"
              className={`w-full h-full object-contain ${
                !isMedicineDisabled
                  ? 'drop-shadow-[0_0_12px_rgba(52,211,153,1)]'
                  : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
              }`}
              draggable={false}
            />
          </button>
        </div>

        {/* Bottom-Right: Shop Button */}
        <button
          type="button"
          data-ui-id="hud-shop-btn"
          data-ui-label="Tombol Toko"
          onClick={() => {
            setActiveMenu(null);
            onToggleShop();
          }}
          aria-label="Toko"
          title="Toko"
          className={`pointer-events-auto absolute right-0 bottom-0 w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
            shopOpen ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
          }`}
        >
          <img
            src="/assets/ui/icon_shop.png"
            alt="Toko"
            className={`w-full h-full object-contain ${
              shopOpen
                ? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]'
                : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
            }`}
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
};
