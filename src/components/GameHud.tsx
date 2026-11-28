import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Gamepad2, Heart, Lock, Moon, Sparkles, Sun, X } from 'lucide-react';
import { getTranslations } from '../i18n/translations';
import {
  ACTION_DELTAS,
  AppLanguage,
  BATH_ITEMS,
  BathItemId,
  CAT_TOYS,
  CatHudSnapshot,
  ConsumableInventory,
  FOOD_ITEMS,
  FoodItemId,
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
  language?: AppLanguage;
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
      className={`flex items-center gap-1 mobile:gap-0.5 rounded-md mobile:rounded bg-[#F9EDD4]/85 border border-[#D4B483] px-1 py-0.5 mobile:px-0.5 mobile:py-[1px] shadow-[inset_0_1px_0_rgba(255,253,248,0.85)] shrink-0 ${
        fullWidth ? 'w-full' : 'w-[78px] mobile:w-[50px]'
      }`}
    >
      {/* Wooden Square Icon Frame */}
      <div className="w-4 h-4 mobile:w-2.5 mobile:h-2.5 rounded mobile:rounded-[2px] wood-modal-frame p-[1px] mobile:p-[0.5px] border mobile:border-[0.5px] border-[#5E2F12] shadow-[0_1px_0_rgba(94,47,18,0.28)] shrink-0">
        <div className="w-full h-full rounded-[2px] mobile:rounded-[1.5px] bg-[#FFF8E6] border border-[#7A4928]/70 flex items-center justify-center p-[1px]">
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
        <div className="flex items-baseline justify-between gap-0.5 leading-none mb-0.5 mobile:mb-[1px] min-w-0">
          <span className="font-display font-extrabold text-[7px] mobile:text-[5px] tracking-tight text-[#5A2D12] whitespace-nowrap shrink-0">
            {label}
          </span>
          {statusTag && (
            <OverflowRunningText
              text={statusTag}
              align="right"
              className={`text-[5.5px] mobile:text-[4.5px] font-extrabold uppercase tracking-wide flex-1 ${
                isLow ? 'text-[#B91C1C]' : 'text-[#B45309]'
              }`}
            />
          )}
        </div>

        <div
          className="relative w-full h-1.5 mobile:h-[3px] rounded-full bg-[#EFE0C1] border mobile:border-[0.5px] overflow-hidden shadow-inner"
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
          <div className="pointer-events-none absolute inset-y-0 left-[20%] w-[1px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-y-0 left-[40%] w-[1px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-y-0 left-[60%] w-[1px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-y-0 left-[80%] w-[1px] bg-[#5A2D12]/30" />
          <div className="pointer-events-none absolute inset-x-0.5 top-[0.5px] h-[1px] rounded-full bg-white/45" />
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
  language = 'id',
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
  const t = getTranslations(language);

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
  const activeToyMeta = CAT_TOYS.find((toy) => toy.id === hud.activeToy) ?? CAT_TOYS[0];
  const activeToyLoc = t.catalog.toys[activeToyMeta.id];
  const showHealthBar = hud.isSick || hud.isRecovering || hud.health < 100;
  const dayPhaseLabel =
    hud.dayPhase === 'malam'
      ? t.hud.dayPhases.malam
      : hud.isDusk
      ? t.hud.dayPhases.senja
      : hud.dayPhase === 'siang'
      ? t.hud.dayPhases.siang
      : t.hud.dayPhases.pagi;

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
          data-ui-label={t.hud.statusPanelLabel}
          className="pointer-events-auto wood-modal-frame rounded-md mobile:rounded p-0.5 mobile:p-[1px] border-[1.5px] mobile:border border-[#5E2F12] shadow-[inset_0_1px_0_rgba(255,235,205,0.45),0_2px_0_rgba(58,28,10,0.4)]"
        >
          <div className="relative rounded-[5px] mobile:rounded-[3px] bg-[#FFF8E8] border mobile:border-[0.5px] border-[#6E3B1B] shadow-[inset_0_1px_0_#FFFFFF] px-1 py-0.5 mobile:px-0.5 mobile:py-[1px]">
            <PixelPawCluster className="w-3 h-2 absolute top-[1px] right-0.5 pointer-events-none opacity-65 mobile:hidden" />

            <div className="grid grid-cols-2 gap-[3px] mobile:gap-[1.5px]">
              <PixelVitalMeter
                label={t.hud.hunger}
                value={hud.hunger}
                iconSrc="/assets/ui/stat_hunger.png"
                fillGradient="linear-gradient(180deg, #FFB53D 0%, #F97316 100%)"
                borderColor="#7A4928"
                statusTag={
                  hud.hunger < 20
                    ? t.hud.tags.critical
                    : hud.hunger < 40
                    ? t.hud.tags.cranky
                    : null
                }
                critical={hud.hunger < 20}
              />
              <PixelVitalMeter
                label={t.hud.happiness}
                value={hud.happiness}
                iconSrc="/assets/ui/stat_happy.png"
                fillGradient="linear-gradient(180deg, #FF93AD 0%, #F2587E 100%)"
                borderColor="#9E3E5B"
                statusTag={
                  hud.happiness < 20
                    ? t.hud.tags.stressed
                    : hud.happiness < 40
                    ? t.hud.tags.sulking
                    : null
                }
                critical={hud.happiness < 20}
              />
              <PixelVitalMeter
                label={t.hud.cleanliness}
                value={hud.cleanliness}
                iconSrc="/assets/ui/stat_clean.png"
                fillGradient="linear-gradient(180deg, #8EE2FF 0%, #38BDF8 100%)"
                borderColor="#3D7F9E"
                statusTag={
                  hud.cleanliness < 15
                    ? t.hud.tags.critical
                    : hud.cleanliness < 40
                    ? t.hud.tags.dirty
                    : null
                }
                critical={hud.cleanliness < 15}
              />
              <PixelVitalMeter
                label={t.hud.energy}
                value={hud.energy}
                iconSrc="/assets/ui/stat_energy.png"
                fillGradient="linear-gradient(180deg, #FFE26A 0%, #F4B62A 100%)"
                borderColor="#1E3A5F"
                innerRim
                statusTag={
                  hud.drowsyStage === 'exhausted' || hud.energy <= 0
                    ? t.hud.tags.exhausted
                    : hud.drowsyStage === 'drowsy_heavy'
                    ? t.hud.tags.drowsyHeavy
                    : hud.drowsyStage === 'drowsy_light'
                    ? t.hud.tags.drowsyLight
                    : null
                }
                critical={hud.energy <= 20}
              />
            </div>

            {showHealthBar && (
              <div className="mt-1 mobile:mt-0.5">
                <PixelVitalMeter
                  label={t.hud.health}
                  value={hud.health}
                  iconNode={<CuteHealthStatIcon className="w-3 h-3 mobile:w-2 mobile:h-2" />}
                  fillGradient="linear-gradient(180deg, #4ADE80 0%, #16A34A 100%)"
                  borderColor="#2D6A4F"
                  fullWidth
                  statusTag={
                    hud.isRecovering
                      ? hud.isSick
                        ? t.hud.tags.recoveringLethargic(hud.health)
                        : t.hud.tags.recovering(hud.health)
                      : hud.isSick
                      ? t.hud.tags.sick(hud.health)
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
            data-ui-label={t.hud.profileCardLabel}
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
                        ? t.hud.phaseTooltip.pagi
                        : hud.dayPhase === 'siang'
                        ? t.hud.phaseTooltip.siang(dayPhaseLabel)
                        : t.hud.phaseTooltip.malam) +
                      (hud.weather === 'hujan' ? t.hud.phaseTooltip.rainExtra : '')
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
                        aria-label={t.hud.rain}
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
                      text={t.hud.dayFormat(
                        hud.day,
                        hud.lifeStage === 'baby'
                          ? ` (${Math.floor(hud.gameHours)}${t.common.hourShort})`
                          : '',
                        formatGameClock(hud.gameHour),
                        hud.weather === 'hujan' ? `${t.hud.rain} ${dayPhaseLabel}` : dayPhaseLabel
                      )}
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
                      title={t.hud.viewLifeStageTooltip}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 mobile:px-1 mobile:py-0 rounded-full bg-gradient-to-b from-[#FFE686] to-[#F2B538] border-[1.5px] mobile:border border-[#8C582E] shadow-[inset_0_1px_0_#FFF8D2] text-[10px] mobile:text-[7.5px] font-extrabold text-[#4E270F] hover:brightness-105 transition-all cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-2.5 h-2.5 mobile:w-2 mobile:h-2 shrink-0" />
                      <span>{t.catalog.lifeStages[hud.lifeStage].shortLabel}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 mobile:px-1 mobile:py-0 rounded-full bg-gradient-to-b from-[#FFE686] to-[#F2B538] border-[1.5px] mobile:border border-[#8C582E] shadow-[inset_0_1px_0_#FFF8D2] text-[10px] mobile:text-[7.5px] font-extrabold text-[#4E270F] shrink-0">
                      <Sparkles className="w-2.5 h-2.5 mobile:w-2 mobile:h-2 shrink-0" />
                      <span>{t.catalog.lifeStages[hud.lifeStage].shortLabel}</span>
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
                      <span className="mobile:hidden"> {t.common.coins}</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            data-ui-id="hud-pause-btn"
            data-ui-label={t.hud.pauseLabel}
            className="flex flex-col items-end gap-1.5 mobile:gap-1 shrink-0"
          >
            <button
              type="button"
              onClick={onPause}
              className="min-w-[40px] min-h-[40px] mobile:min-w-[28px] mobile:min-h-[28px] flex items-center justify-center bg-transparent border-0 p-0 hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
              aria-label={t.hud.pauseLabel}
              title={t.hud.pauseTooltip}
            >
              <img
                src="/assets/ui/btn_pause.png"
                alt={t.hud.pauseLabel}
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
                    ? t.hud.actionMenus.pickFood
                    : t.hud.actionMenus.food
                  : activeMenu === 'bath'
                  ? itemPickerOpen
                    ? t.hud.actionMenus.pickBath
                    : t.hud.actionMenus.bath
                  : activeMenu === 'play'
                  ? itemPickerOpen
                    ? t.hud.actionMenus.pickPlay
                    : t.hud.actionMenus.play
                  : activeMenu === 'pet'
                  ? itemPickerOpen
                    ? t.hud.actionMenus.pickPet
                    : t.hud.actionMenus.pet
                  : itemPickerOpen
                  ? t.hud.actionMenus.pickSleep
                  : t.hud.actionMenus.sleep}
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveMenu(null);
                  setItemPickerOpen(false);
                }}
                className="w-7 h-7 rounded-full bg-[#EFE2C8] border border-[#7A4928]/50 text-[#5A2D12] flex items-center justify-center hover:bg-[#FCE8C3] cursor-pointer"
                aria-label={t.hud.actionMenus.closeAria}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeMenu === 'food' && (() => {
              if (itemPickerOpen) {
                return (
                  <div className="space-y-1.5">
                    {FOOD_ITEMS.map((item) => {
                      const foodLoc = t.catalog.foodItems[item.id];
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
                                {foodLoc.shortName}
                              </p>
                              <p className="text-[11px] font-bold text-[#2D6A4F] truncate">
                                {foodLoc.description}
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
              const foodLoc = t.catalog.foodItems[item.id];
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
                    title={t.hud.changeFoodTooltip}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center shrink-0">
                      <FoodItemIcon variant={item.id} className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {foodLoc.shortName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#2D6A4F] truncate">
                        {foodLoc.description}
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
                      {snackCd > 0 ? formatTimerMMSS(snackCd) : t.common.giveFree}
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
                      {isHungerFull ? t.hud.hungerFull(stock) : t.hud.useWithStock(stock)}
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
                      {t.common.buyInShop}
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
                      const bathLoc = t.catalog.bathItems[item.id];
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
                                {bathLoc.shortName}
                              </p>
                              <p className="text-[11px] font-bold text-[#0369A1] truncate">
                                {bathLoc.description}
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
                            {t.hud.manualBrush}
                          </p>
                          <p className="text-[11px] font-bold text-[#0369A1] truncate">
                            {t.hud.manualBrushDesc}
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
                      title={t.hud.changeBathTooltip}
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
                            {t.hud.manualBrush}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                        </div>
                        <p className="text-[11px] font-bold text-[#0369A1] truncate">
                          {t.hud.manualBrushDesc}
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
                        ? t.hud.bathingShort
                        : isSleeping
                        ? t.hud.sleepingShort
                        : hud.cleanliness >= 100
                        ? t.hud.cleanFull()
                        : toolMode === 'BRUSH'
                        ? t.hud.brushDisable
                        : t.hud.brushUse}
                    </button>
                  </div>
                );
              }

              const item = BATH_ITEMS.find((b) => b.id === selectedBathId) ?? BATH_ITEMS[0];
              const bathLoc = t.catalog.bathItems[item.id];
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
                    title={t.hud.changeBathTooltip}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#E6F4FE] border border-[#93C5FD] flex items-center justify-center shrink-0">
                      <BathItemIcon variant={item.id} className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {bathLoc.shortName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#0369A1] truncate">
                        {bathLoc.description}
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
                        ? t.hud.bathingShort
                        : isSleeping
                        ? t.hud.sleepingShort
                        : isCleanFull
                        ? t.hud.cleanFull()
                        : soapCd > 0
                        ? formatTimerMMSS(soapCd)
                        : t.common.useFree}
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
                        ? t.hud.bathingShort
                        : isSleeping
                        ? t.hud.sleepingShort
                        : isCleanFull
                        ? t.hud.cleanFull(stock)
                        : t.hud.useWithStock(stock)}
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
                      {t.common.buyInShop}
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
                ? t.hud.sleepingShort
                : hud.isSick
                ? t.hud.sickShort
                : hud.energy <= 20
                ? `${t.hud.energy} ≤ 20`
                : hud.hunger <= 2
                ? t.hud.hungryShort
                : interactiveCd > 0
                ? formatTimerMMSS(interactiveCd)
                : t.hud.playBtn;

              const miniLabel = !hud.miniGameUnlocked
                ? t.hud.miniGameLockedStage
                : isSleeping
                ? t.hud.sleepingShort
                : hud.isSick
                ? t.hud.sickShort
                : hud.energy < 20
                ? `${t.hud.energy} < 20`
                : hud.hunger <= 2
                ? t.hud.hungryShort
                : miniCd > 0
                ? formatTimerMMSS(miniCd)
                : t.hud.startBtn;

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
                            {t.hud.toyPlayItem(activeToyLoc.shortName)}
                          </p>
                          <p className="text-[11px] font-bold text-[#BE185D] truncate">
                            {t.hud.playDeltaLine(
                              isHappyFull ? 0 : ACTION_DELTAS.playInteractiveFull.happiness,
                              ACTION_DELTAS.playInteractiveFull.energy
                            )}
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
                            {t.hud.miniGamePond}
                          </p>
                          <p className="text-[11px] font-bold text-[#0369A1] truncate">
                            {t.hud.playDeltaLine(
                              isHappyFull
                                ? 0
                                : ACTION_DELTAS.playMiniGame.happiness +
                                    (hud.weather === 'hujan' ? 5 : 0),
                              ACTION_DELTAS.playMiniGame.energy
                            )}
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
                      title={t.hud.changePlayTooltip}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#E0F2FE] border border-[#7DD3FC] flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-5 h-5 text-[#0284C7]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            {t.hud.miniGamePond}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                        </div>
                        <p className="text-[11px] font-bold text-[#0369A1] truncate">
                          {t.hud.playDeltaLine(
                            isHappyFull
                              ? 0
                              : ACTION_DELTAS.playMiniGame.happiness +
                                  (hud.weather === 'hujan' ? 5 : 0),
                            ACTION_DELTAS.playMiniGame.energy
                          )}
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
                    title={t.hud.changePlayTooltip}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center shrink-0 p-1">
                      <ToyIcon variant={hud.activeToy} className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {t.hud.toyPlayItem(activeToyLoc.shortName)}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#BE185D] truncate">
                        {t.hud.playDeltaLine(
                          isHappyFull ? 0 : ACTION_DELTAS.playInteractiveFull.happiness,
                          ACTION_DELTAS.playInteractiveFull.energy
                        )}
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
                            {t.hud.petShort}
                          </p>
                          <p className="text-[11px] font-bold text-[#BE185D] truncate">
                            {t.hud.petShortDesc(ACTION_DELTAS.petShort.happiness)}
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
                            {t.hud.petFull}
                          </p>
                          <p className="text-[11px] font-bold text-[#BE185D] truncate">
                            {t.hud.petFullDesc(
                              ACTION_DELTAS.petFull.happiness,
                              ACTION_DELTAS.petFull.hunger
                            )}
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
                      title={t.hud.changePetTooltip}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-[#E11D48] fill-[#E11D48]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                            {t.hud.petFull}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                        </div>
                        <p className="text-[11px] font-bold text-[#BE185D] truncate">
                          {t.hud.petFullDesc(
                            ACTION_DELTAS.petFull.happiness,
                            ACTION_DELTAS.petFull.hunger
                          )}
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
                        ? t.hud.sleepingShort
                        : petFullCd > 0
                        ? formatTimerMMSS(petFullCd)
                        : t.hud.petFullBtn}
                    </button>
                  </div>
                );
              }

              return (
                <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                  <button
                    type="button"
                    onClick={() => setItemPickerOpen(true)}
                    title={t.hud.changePetTooltip}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FFE4E6] border border-[#FDA4AF] flex items-center justify-center shrink-0 p-1">
                      <PetHandIcon className="w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {t.hud.petShort}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#BE185D] truncate">
                        {t.hud.petShortDesc(ACTION_DELTAS.petShort.happiness)}
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
                      ? t.hud.sleepingShort
                      : petShortCd > 0
                      ? formatTimerMMSS(petShortCd)
                      : t.hud.petShortBtn}
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
                        ? t.hud.autoSleep
                        : hud.sleepMode === 'power_nap'
                        ? t.hud.powerNap
                        : t.hud.fullRest}
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
                      {t.hud.wakeUpPenalty}
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
                      const optLoc = t.catalog.sleepOptions[opt.id];
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
                                {briefMode ? t.hud.briefNap : optLoc.shortName}
                              </p>
                              <p className="text-[11px] font-bold text-[#1D4ED8] truncate">
                                {briefMode ? t.hud.briefNapDesc : optLoc.description}
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
              const optLoc = t.catalog.sleepOptions[opt.id];
              const briefMode = isDaytimeBriefOnly && opt.id === 'power_nap';
              const optBlocked =
                isSleeping ||
                isEnergyFull ||
                isDaytimeTooFresh ||
                (isDaytimeBriefOnly && opt.id === 'full_rest');

              const btnLabel = isSleeping
                ? t.hud.sleepingShort
                : isEnergyFull
                ? t.hud.energy100
                : isDaytimeTooFresh
                ? t.hud.freshGuard
                : isDaytimeBriefOnly && opt.id === 'full_rest'
                ? t.hud.energyAbove70
                : briefMode
                ? t.hud.briefNap
                : optLoc.shortName;

              return (
                <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                  <button
                    type="button"
                    onClick={() => setItemPickerOpen(true)}
                    title={t.hud.changeSleepTooltip}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg hover:bg-[#FFF5DF] p-1 -m-1 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] flex items-center justify-center shrink-0">
                      <Moon className="w-5 h-5 text-[#1D4ED8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                          {briefMode ? t.hud.briefNap : optLoc.shortName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#7A4928] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-[#1D4ED8] truncate">
                        {briefMode ? t.hud.briefNapDesc : optLoc.description}
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
            aria-label={t.hud.dock.foodAria}
            title={t.hud.dock.foodTitle}
            className={`relative w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              activeMenu === 'food' ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <img
              src="/assets/ui/icon_feed.png"
              alt={t.hud.actionMenus.food}
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
                ? t.hud.dock.bathBathing
                : isSleeping
                ? t.hud.dock.bathLockedSleep
                : t.hud.dock.bathAria
            }
            title={
              hud.isBathing
                ? t.hud.dock.bathBathing
                : isSleeping
                ? t.hud.dock.bathLockedSleep
                : t.hud.dock.bathTitle
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
              alt={t.hud.actionMenus.bath}
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
                ? t.hud.dock.playLockedSleep
                : isPlayDisabled
                ? t.hud.dock.playDisabledAria
                : t.hud.dock.playAria(activeToyLoc.name)
            }
            title={
              isSleeping
                ? t.hud.dock.playLockedSleep
                : isPlayDisabled
                ? t.hud.dock.playDisabledTitle
                : t.hud.dock.playTitle
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
                alt={activeToyLoc.name}
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
            aria-label={t.hud.dock.petAria}
            title={t.hud.dock.petTitle}
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
            aria-label={t.hud.dock.sleepAria}
            title={t.hud.dock.sleepTitle}
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              isSleeping || activeMenu === 'sleep' ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <img
              src="/assets/ui/icon_sleep.png"
              alt={t.hud.actionMenus.sleep}
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
                ? t.hud.dock.medRecoveringAria
                : !hud.isSick
                ? t.hud.dock.medHealthyAria
                : t.hud.dock.medAria
            }
            title={
              hud.isRecovering
                ? hud.isSick
                  ? t.hud.dock.medRecoveringSickTitle
                  : t.hud.dock.medRecoveringTitle
                : !hud.isSick
                ? t.hud.dock.medHealthyTitle
                : t.hud.dock.medSickTitle
            }
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center transition-transform ${
              isMedicineDisabled
                ? 'opacity-45 grayscale cursor-not-allowed'
                : 'hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 cursor-pointer animate-bounce'
            }`}
          >
            <img
              src="/assets/ui/icon_medicine.png"
              alt={t.hud.dock.medAria}
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
        <div className="pointer-events-auto absolute right-0 bottom-0 flex items-end z-20">
          <button
            type="button"
            data-ui-id="hud-shop-btn"
            data-ui-label={t.hud.dock.shopLabel}
            onClick={() => {
              setActiveMenu(null);
              onToggleShop();
            }}
            aria-label={t.hud.dock.shopLabel}
            title={t.hud.dock.shopLabel}
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              shopOpen ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <img
              src="/assets/ui/icon_shop.png"
              alt={t.hud.dock.shopLabel}
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
    </div>
  );
};
