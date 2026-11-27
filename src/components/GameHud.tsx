import React, { useEffect, useState } from 'react';
import { Gamepad2, Heart, Lock, Moon, Sparkles, Sun, X } from 'lucide-react';
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
import { formatGameClock, getStatLevel } from '../utils/catCareSystem';
import { CatAvatarSvg } from './CatAvatarSvg';
import {
  BathItemIcon,
  CuteHealthStatIcon,
  FoodItemIcon,
  PetHandIcon,
  PixelPawCluster,
  PixelPlantIcon,
  ToyIcon,
} from './CuteGameIcons';

type ActionMenuTab = 'food' | 'bath' | 'play' | 'pet' | 'sleep' | null;

interface GameHudProps {
  hud: CatHudSnapshot;
  toolMode: ToolMode;
  shopOpen: boolean;
  onSelectTool: (mode: ToolMode) => void;
  onFeedItem: (foodId: FoodItemId) => void;
  onBuyFoodItem: (foodId: Exclude<FoodItemId, 'snack'>, useImmediately?: boolean) => void;
  onUseBathItem: (bathId: BathItemId) => void;
  onBuyBathItem: (bathId: Exclude<BathItemId, 'basic_soap'>, useImmediately?: boolean) => void;
  onStartSleep: (mode: ManualSleepMode) => void;
  onWakeUp: () => void;
  onStartInteractivePlay: () => void;
  onPetCat: (kind: 'short' | 'full') => void;
  onGiveMedicine: () => void;
  onToggleShop: () => void;
  onOpenLifeStage: () => void;
  onOpenMiniGame: () => void;
  onPause: () => void;
}

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
}) => {
  const isLow = critical || value < 20;
  const pct = Math.max(0, Math.min(100, value));
  const level5 = getStatLevel(value);

  return (
    <div
      className={`flex items-center gap-2.5 short:gap-1.5 min-w-[136px] sm:min-w-[162px] short:min-w-[104px]`}
    >
      <div className="w-9 h-9 short:w-6 short:h-6 rounded-md bg-[#FFFDF8] border-2 short:border-[1.5px] border-[#7A4928] shadow-[0_2px_0_#D8C29D] flex items-center justify-center shrink-0 p-1 short:p-0.5">
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

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1 leading-none mb-1.5 short:mb-0.5">
          <span className="font-display font-extrabold text-[13px] short:text-[10px] tracking-tight text-[#5A2D12] whitespace-nowrap">
            {label}
          </span>
          {statusTag ? (
            <span
              className={`text-[10px] short:text-[9px] font-extrabold uppercase tracking-wide whitespace-nowrap ${
                isLow ? 'text-[#B91C1C]' : 'text-[#B45309]'
              }`}
            >
              {statusTag}
            </span>
          ) : (
            <span className="text-[10px] short:text-[8.5px] font-bold text-[#7A4928]/75 tabular-nums whitespace-nowrap">
              {level5}/5
            </span>
          )}
        </div>

        <div
          className="relative w-full h-3 short:h-2 rounded-full bg-[#EFE2C8] border-2 short:border-[1.5px] overflow-hidden"
          style={{ borderColor: isLow ? '#B91C1C' : borderColor }}
        >
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              innerRim ? 'ring-1 ring-inset ring-[#FACC15]' : ''
            }`}
            style={{
              width: `${pct}%`,
              background: isLow
                ? 'linear-gradient(180deg, #F87171 0%, #DC2626 100%)'
                : fillGradient,
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 left-[20%] w-px bg-[#5A2D12]/20" />
          <div className="pointer-events-none absolute inset-y-0 left-[40%] w-px bg-[#5A2D12]/20" />
          <div className="pointer-events-none absolute inset-y-0 left-[60%] w-px bg-[#5A2D12]/20" />
          <div className="pointer-events-none absolute inset-y-0 left-[80%] w-px bg-[#5A2D12]/20" />
          <div className="pointer-events-none absolute inset-x-1 top-[1px] h-[2px] short:h-[1px] rounded-full bg-white/45" />
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
  onBuyFoodItem,
  onUseBathItem,
  onBuyBathItem,
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

  useEffect(() => {
    if (shopOpen) {
      setActiveMenu(null);
    }
  }, [shopOpen]);

  const isSleeping = hud.behavior === 'SLEEPING' || hud.sleepMode !== 'none';
  const isBathLocked = isSleeping;
  const isPlayDisabled = isSleeping || hud.isSick || hud.energy < 20 || hud.hunger <= 2;
  const isMedicineDisabled = !hud.isSick || hud.isRecovering;
  const activeToyMeta = CAT_TOYS.find((t) => t.id === hud.activeToy) ?? CAT_TOYS[0];
  const showHealthBar = hud.isSick || hud.isRecovering || hud.health < 100;
  const xpPercent = Math.max(
    4,
    Math.min(100, Math.round((hud.affectionXp / Math.max(1, hud.xpToNext)) * 100))
  );
  const isNgambek = hud.happiness < 40;
  const isDrowsyLight = !isSleeping && !hud.isSick && hud.drowsyStage === 'drowsy_light';
  const isDrowsyHeavy =
    !isSleeping &&
    !hud.isSick &&
    (hud.drowsyStage === 'drowsy_heavy' || hud.drowsyStage === 'exhausted');
  const dayPhaseLabel =
    hud.dayPhase === 'malam'
      ? 'Malam'
      : hud.isDusk
      ? 'Senja'
      : hud.dayPhase === 'siang'
      ? 'Siang'
      : 'Pagi';

  const toggleMenu = (tab: Exclude<ActionMenuTab, null>) => {
    setActiveMenu((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-5 short:px-3 short:py-2 safe-inset-hud">
      {activeMenu && (
        <div
          className="fixed inset-0 z-0 pointer-events-auto"
          onClick={() => setActiveMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* Top Perimeter Row */}
      <div className="relative z-10 flex flex-wrap short:flex-nowrap items-start justify-between gap-2.5 short:gap-2">
        {/* Top-Left: Warm Cream Pixel-Bordered Status Panel */}
        <div className="pointer-events-auto relative px-4 py-3 short:px-2.5 short:py-1.5 rounded-xl short:rounded-lg bg-[#FFF3D9] border-[3px] short:border-2 border-[#7A4928] shadow-[inset_0_2px_0_#FFFDF5,0_4px_0_#7A4928] short:shadow-[inset_0_1px_0_#FFFDF5,0_2.5px_0_#7A4928]">
          <PixelPawCluster className="w-7 h-4 absolute top-1 right-2 pointer-events-none opacity-80 short:hidden" />
          <PixelPawCluster className="w-6 h-3.5 absolute bottom-1 left-1.5 pointer-events-none opacity-65 -rotate-12 short:hidden" />
          <PixelPlantIcon className="w-7 h-7 absolute -bottom-2 -right-2 pointer-events-none drop-shadow-[0_2px_0_rgba(90,45,18,0.3)] short:hidden" />

          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 short:gap-x-2.5 short:gap-y-1.5 pr-1 short:pr-0">
            <PixelVitalMeter
              label="Kenyang"
              value={hud.hunger}
              iconSrc="/assets/ui/stat_hunger.png"
              fillGradient="linear-gradient(180deg, #FFB02E 0%, #F97316 100%)"
              borderColor="#9A4D18"
              statusTag={hud.hunger < 20 ? 'Kritis!' : hud.hunger < 40 ? 'Rewel!' : null}
              critical={hud.hunger < 20}
            />
            <PixelVitalMeter
              label="Bahagia"
              value={hud.happiness}
              iconSrc="/assets/ui/stat_happy.png"
              fillGradient="linear-gradient(180deg, #FF9BB4 0%, #F45B84 100%)"
              borderColor="#9E3E5B"
              statusTag={hud.happiness < 20 ? 'Stres!' : hud.happiness < 40 ? 'Ngambek' : null}
              critical={hud.happiness < 20}
            />
            <PixelVitalMeter
              label="Bersih"
              value={hud.cleanliness}
              iconSrc="/assets/ui/stat_clean.png"
              fillGradient="linear-gradient(180deg, #9EE7FF 0%, #38BDF8 100%)"
              borderColor="#4689A8"
              statusTag={hud.cleanliness < 15 ? 'Kritis!' : hud.cleanliness < 40 ? 'Kotor' : null}
              critical={hud.cleanliness < 15}
            />
            <PixelVitalMeter
              label="Energi"
              value={hud.energy}
              iconSrc="/assets/ui/stat_energy.png"
              fillGradient="linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%)"
              borderColor="#1E293B"
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
            <div className="mt-2.5 pt-2 short:mt-1.5 short:pt-1 border-t-2 border-[#7A4928]/15 pr-3 short:pr-0">
              <PixelVitalMeter
                label="Kesehatan"
                value={hud.health}
                iconNode={<CuteHealthStatIcon className="w-6 h-6 short:w-4 short:h-4" />}
                fillGradient="linear-gradient(180deg, #4ADE80 0%, #16A34A 100%)"
                borderColor="#2D6A4F"
                statusTag={hud.isRecovering ? 'Pulih' : hud.isSick ? 'Sakit!' : null}
                critical={hud.isSick && !hud.isRecovering}
              />
            </div>
          )}
        </div>

        {/* Top-Right: Cat Profile Card + Pause Button */}
        <div className="pointer-events-auto flex items-start gap-2 short:gap-1.5 shrink-0">
          <div className="relative px-3.5 py-2.5 short:px-2 short:py-1.5 rounded-xl short:rounded-lg bg-[#FFF3D9] border-[3px] short:border-2 border-[#7A4928] shadow-[inset_0_2px_0_#FFFDF5,0_4px_0_#7A4928] short:shadow-[inset_0_1px_0_#FFFDF5,0_2.5px_0_#7A4928] flex items-center gap-3 short:gap-2">
            <PixelPawCluster className="w-7 h-4 absolute top-1 right-2 pointer-events-none opacity-80 short:hidden" />
            <PixelPlantIcon className="w-6 h-6 absolute -bottom-2 -left-2 pointer-events-none drop-shadow-[0_2px_0_rgba(90,45,18,0.3)] short:hidden" />

            <div className="w-13 h-13 short:w-9 short:h-9 rounded-lg short:rounded-md bg-[#FFFDF8] border-[2.5px] short:border-[1.5px] border-[#7A4928] shadow-[0_2px_0_#D8C29D] flex items-center justify-center overflow-hidden shrink-0">
              <div className="short:scale-[0.74] flex items-center justify-center">
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

            <div className="min-w-0 pr-2 short:pr-0.5">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-display font-extrabold text-[17px] short:text-[13px] leading-tight text-[#5A2D12]">
                  {hud.name}
                </span>
                <button
                  type="button"
                  onClick={onOpenLifeStage}
                  title="Lihat Tahap Pertumbuhan & Evolusi"
                  className="inline-flex items-center gap-1 px-2 py-0.5 short:px-1.5 short:py-[1px] rounded-full bg-[#FEF3C7] border-[1.5px] border-[#D97706]/60 text-[11px] short:text-[9.5px] font-extrabold text-[#92400E] hover:bg-[#FDE68A] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 short:w-2.5 short:h-2.5 shrink-0" />
                  <span>{LIFE_STAGES[hud.lifeStage].shortLabel}</span>
                </button>
                <span className="text-xs short:text-[10px] font-bold text-[#3E6B48] truncate max-w-[110px] short:max-w-[70px]">
                  · {hud.moodLabel}
                </span>
              </div>

              <div className="flex items-center gap-3 short:gap-2 mt-1.5 short:mt-0.5 text-xs short:text-[10px] font-extrabold text-[#5A2D12] tabular-nums whitespace-nowrap">
                <span
                  className="inline-flex items-center gap-1 short:gap-0.5"
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
                    /* Ikon bulan & bintang */
                    <svg viewBox="0 0 24 24" className="w-4 h-4 short:w-3 short:h-3 shrink-0" aria-hidden="true">
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
                    /* Ikon matahari terik / senja */
                    <svg viewBox="0 0 24 24" className="w-4 h-4 short:w-3 short:h-3 shrink-0" aria-hidden="true">
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
                    /* Ikon matahari pagi */
                    <svg viewBox="0 0 24 24" className="w-4 h-4 short:w-3 short:h-3 shrink-0" aria-hidden="true">
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
                      className="w-4 h-4 short:w-3 short:h-3 shrink-0"
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
                  <span>
                    Hari {hud.day}
                    {hud.lifeStage === 'baby' ? ` (${Math.floor(hud.gameHours)}j)` : ''}
                    <span className="text-[#7A4928]/85 font-bold">
                      {' · '}
                      {formatGameClock(hud.gameHour)}{' '}
                      {hud.weather === 'hujan' ? `Hujan ${dayPhaseLabel}` : dayPhaseLabel}
                    </span>
                  </span>
                </span>

                <span className="inline-flex items-center gap-1 short:gap-0.5">
                  <img
                    src="/assets/ui/icon_coin.png"
                    alt=""
                    className="w-4 h-4 short:w-3 short:h-3 object-contain"
                    draggable={false}
                  />
                  <span>
                    {hud.coins}
                    <span className="short:hidden"> Koin</span>
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 short:gap-1 text-[#2D6A4F]">
                  <span>Lv.{hud.level}</span>
                  <span
                    className="w-12 h-3 short:w-8 short:h-2 rounded-sm bg-[#E9DEC4] border-2 short:border-[1.5px] border-[#3E6B48] overflow-hidden inline-block"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full bg-gradient-to-b from-[#6EE7B7] to-[#22C55E] transition-all duration-200"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 short:gap-1 shrink-0">
            <button
              type="button"
              onClick={onPause}
              className="min-w-[44px] min-h-[44px] short:min-w-[40px] short:min-h-[40px] flex items-center justify-center bg-transparent border-0 p-0 hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
              aria-label="Menu Jeda"
              title="Menu Jeda (Esc)"
            >
              <img
                src="/assets/ui/btn_pause.png"
                alt="Jeda"
                className="w-12 h-12 short:w-9 short:h-9 object-contain drop-shadow-[0_3px_0_rgba(90,45,18,0.28)]"
                draggable={false}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Warning Banner when Hungry, Dirty, Tired, Ngambek or Sick */}
      {hud.warningText && !activeMenu && (
        <div
          className={`relative z-10 self-center px-4 py-2 short:px-3 short:py-1 rounded-xl short:rounded-lg text-sm short:text-xs font-bold shadow-md border-2 ${
            hud.isSick
              ? 'bg-[#991B1B] text-white border-[#450A0A]'
              : 'bg-[#FFF3CD] text-[#78350F] border-[#B45309]/50'
          }`}
        >
          {hud.warningText}
        </div>
      )}

      {/* Bottom-Center: Action Popovers + Sleep Status + Floating Dock */}
      <div className="relative z-10 flex flex-col items-center gap-2 short:gap-1">
        {/* Active Timed Sleep Progress Bar */}
        {isSleeping && hud.sleepMode !== 'none' && hud.sleepRemainingSec > 0 && !activeMenu && (
          <div className="pointer-events-auto px-3.5 py-1.5 short:px-2.5 short:py-1 rounded-xl bg-[#1E3A8A]/95 border-2 border-[#93C5FD] text-[#EFF6FF] text-xs short:text-[10.5px] font-bold flex items-center gap-3 shadow-md tabular-nums">
            <Moon className="w-4 h-4 text-[#FDE68A] shrink-0" />
            <span>
              {hud.sleepMode === 'auto_sleep'
                ? 'Auto-Sleep (+35 Energi)'
                : hud.sleepMode === 'power_nap'
                ? 'Power Nap (+40 Energi)'
                : 'Tidur Penuh (+100 Energi)'}
              {' · '}
              {formatTimerMMSS(hud.sleepRemainingSec)}
            </span>
            <button
              type="button"
              onClick={onWakeUp}
              title="Bangunkan paksa sebelum selesai (-10 Bahagia)"
              className="px-2 py-0.5 rounded-md bg-[#FDE68A] text-[#5A2D12] font-extrabold hover:brightness-105 cursor-pointer whitespace-nowrap"
            >
              Bangunkan (-10 Bahagia)
            </button>
          </div>
        )}

        {/* Active Brush Mode Hint */}
        {toolMode === 'BRUSH' && !activeMenu && (
          <div className="pointer-events-auto px-3.5 py-1.5 short:px-2.5 short:py-1 rounded-xl bg-[#2B231E]/95 text-[#FFFBF2] text-xs short:text-[11px] font-medium flex items-center gap-3 short:gap-2 shadow-md">
            <span>Gosok-gosok tubuh kucing untuk membersihkan (+10 Bersih per gosokan)</span>
            <button
              type="button"
              onClick={() => onSelectTool('PET')}
              className="underline font-semibold text-[#FCD34D] hover:text-white whitespace-nowrap cursor-pointer"
            >
              Selesai
            </button>
          </div>
        )}

        {/* Action Submenu Popover */}
        {activeMenu && (
          <div className="pointer-events-auto w-full max-w-[460px] rounded-2xl bg-[#FFF4DC] border-[3px] border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8,0_8px_0_rgba(58,28,10,0.42)] p-3 short:p-2">
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b-2 border-[#7A4928]/15">
              <span className="font-display font-extrabold text-sm short:text-xs text-[#5A2D12]">
                {activeMenu === 'food'
                  ? 'Pilih Makanan'
                  : activeMenu === 'bath'
                  ? 'Pilih Perawatan Mandi'
                  : activeMenu === 'play'
                  ? 'Pilih Aktivitas Bermain'
                  : activeMenu === 'pet'
                  ? 'Elus-elus & Kasih Sayang'
                  : 'Tidur & Istirahat'}
              </span>
              <button
                type="button"
                onClick={() => setActiveMenu(null)}
                className="w-7 h-7 rounded-full bg-[#EFE2C8] border border-[#7A4928]/50 text-[#5A2D12] flex items-center justify-center hover:bg-[#FCE8C3] cursor-pointer"
                aria-label="Tutup menu aksi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeMenu === 'food' && (
              <div className="space-y-2">
                {FOOD_ITEMS.map((item) => {
                  const stock = item.isFree
                    ? 0
                    : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
                  const canAfford = hud.coins >= item.price;
                  const isHungerFull = hud.hunger >= 100;
                  const isHappyFull = hud.happiness >= 100;
                  const snackCd = item.isFree ? hud.cooldownsSec.snack : 0;
                  const freeBlocked = isHappyFull || snackCd > 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#EFE4CE] border border-[#D8C29D] flex items-center justify-center shrink-0">
                          <FoodItemIcon variant={item.id} className="w-8 h-8" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                              {item.shortName}
                            </span>
                            <span
                              className={`px-1.5 py-[1px] rounded text-[9px] font-extrabold shrink-0 ${
                                item.isFree
                                  ? 'bg-[#E9F2EC] text-[#1E4627]'
                                  : 'bg-[#FEF3C7] text-[#92400E]'
                              }`}
                            >
                              {item.isFree ? 'GRATIS · CD 2m' : stock > 0 ? `STOK ${stock}` : 'SHOP'}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-[#2D6A4F]">{item.description}</p>
                        </div>
                      </div>

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
                          {isHappyFull
                            ? 'Bahagia 100'
                            : snackCd > 0
                            ? formatTimerMMSS(snackCd)
                            : 'Beri Gratis'}
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
                          disabled={!canAfford || isHungerFull}
                          onClick={() => {
                            if (!canAfford || isHungerFull) return;
                            onSelectTool('PET');
                            onBuyFoodItem(item.id as Exclude<FoodItemId, 'snack'>, true);
                            setActiveMenu(null);
                          }}
                          className={`px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-black text-xs whitespace-nowrap shrink-0 inline-flex items-center gap-1 tabular-nums ${
                            canAfford && !isHungerFull
                              ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] cursor-pointer hover:brightness-105'
                              : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          }`}
                        >
                          {isHungerFull ? (
                            <span>Kenyang 100</span>
                          ) : (
                            <>
                              <img src="/assets/ui/icon_coin.png" alt="" className="w-3.5 h-3.5" draggable={false} />
                              <span>Beli · {item.price}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeMenu === 'bath' && (
              <div className="space-y-2">
                {isBathLocked && (
                  <p className="px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#60A5FA] text-[11px] font-bold text-[#1E3A8A]">
                    Kucing sedang tidur — mandi & sikat dikunci sampai bangun.
                  </p>
                )}

                {BATH_ITEMS.map((item) => {
                  const stock = item.isFree
                    ? 0
                    : hud.inventory[item.id as keyof ConsumableInventory] ?? 0;
                  const canAfford = hud.coins >= item.price;
                  const isCleanFull = hud.cleanliness >= 100;
                  const soapCd = item.isFree ? hud.cooldownsSec.basicSoap : 0;
                  const freeBlocked = isBathLocked || isCleanFull || soapCd > 0;
                  const shopUseBlocked = isBathLocked || isCleanFull;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#E6F4FE] border border-[#93C5FD] flex items-center justify-center shrink-0">
                          <BathItemIcon variant={item.id} className="w-8 h-8" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] truncate">
                              {item.shortName}
                            </span>
                            <span
                              className={`px-1.5 py-[1px] rounded text-[9px] font-extrabold shrink-0 ${
                                item.isFree
                                  ? 'bg-[#E9F2EC] text-[#1E4627]'
                                  : 'bg-[#FEF3C7] text-[#92400E]'
                              }`}
                            >
                              {item.isFree ? 'GRATIS · CD 3m' : stock > 0 ? `STOK ${stock}` : 'SHOP'}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-[#0369A1]">{item.description}</p>
                        </div>
                      </div>

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
                          {isBathLocked
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
                          {isBathLocked
                            ? 'Tidur'
                            : isCleanFull
                            ? `Bersih 100 (${stock})`
                            : `Pakai (${stock})`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford || shopUseBlocked}
                          onClick={() => {
                            if (!canAfford || shopUseBlocked) return;
                            onSelectTool('PET');
                            onBuyBathItem(item.id as Exclude<BathItemId, 'basic_soap'>, true);
                            setActiveMenu(null);
                          }}
                          className={`px-3 py-1.5 min-h-[38px] rounded-full border-2 font-display font-black text-xs whitespace-nowrap shrink-0 inline-flex items-center gap-1 tabular-nums ${
                            canAfford && !shopUseBlocked
                              ? 'bg-gradient-to-b from-[#FBBF49] to-[#E5861F] border-[#6E3B1B] text-[#5A2D12] cursor-pointer hover:brightness-105'
                              : 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          }`}
                        >
                          {isBathLocked ? (
                            <span>Tidur</span>
                          ) : isCleanFull ? (
                            <span>Bersih 100</span>
                          ) : (
                            <>
                              <img src="/assets/ui/icon_coin.png" alt="" className="w-3.5 h-3.5" draggable={false} />
                              <span>Beli · {item.price}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  disabled={isBathLocked || hud.cleanliness >= 100}
                  onClick={() => {
                    if (isBathLocked || hud.cleanliness >= 100) return;
                    onSelectTool(toolMode === 'BRUSH' ? 'PET' : 'BRUSH');
                    setActiveMenu(null);
                  }}
                  className={`w-full py-2 px-3 min-h-[38px] rounded-xl border-2 font-display font-extrabold text-xs ${
                    isBathLocked || hud.cleanliness >= 100
                      ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                      : 'bg-[#EFE2C8] border-[#7A4928]/50 text-[#5A2D12] hover:bg-[#FCE8C3] cursor-pointer'
                  }`}
                >
                  {isBathLocked
                    ? 'Mode Sikat Manual Terkunci (Tidur)'
                    : hud.cleanliness >= 100
                    ? 'Kebersihan Sudah Penuh (100)'
                    : toolMode === 'BRUSH'
                    ? 'Matikan Mode Sikat Manual'
                    : 'Mode Sikat Manual (+10 Bersih per gosokan)'}
                </button>
              </div>
            )}

            {activeMenu === 'play' && (() => {
              const interactiveCd = hud.cooldownsSec.interactivePlay;
              const miniCd = hud.cooldownsSec.miniGame;
              const interactiveBlocked =
                isSleeping ||
                hud.isSick ||
                hud.happiness >= 100 ||
                hud.energy <= 20 ||
                hud.hunger <= 2 ||
                interactiveCd > 0;
              const miniBlocked =
                !hud.miniGameUnlocked ||
                isSleeping ||
                hud.isSick ||
                hud.happiness >= 100 ||
                hud.energy < 20 ||
                hud.hunger <= 2 ||
                miniCd > 0;

              const interactiveLabel = isSleeping
                ? 'Tidur'
                : hud.isSick
                ? 'Sakit'
                : hud.happiness >= 100
                ? 'Bahagia 100'
                : hud.energy <= 20
                ? 'Energi ≤ 20'
                : hud.hunger <= 2
                ? 'Lapar'
                : interactiveCd > 0
                ? formatTimerMMSS(interactiveCd)
                : 'Main Sesi Penuh';

              const miniLabel = !hud.miniGameUnlocked
                ? 'Fase Anak+'
                : isSleeping
                ? 'Tidur'
                : hud.isSick
                ? 'Sakit'
                : hud.happiness >= 100
                ? 'Bahagia 100'
                : hud.energy < 20
                ? 'Energi < 20'
                : hud.hunger <= 2
                ? 'Lapar'
                : miniCd > 0
                ? formatTimerMMSS(miniCd)
                : 'Mulai';

              return (
                <div className="space-y-2">
                  {isSleeping ? (
                    <p className="px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#60A5FA] text-[11px] font-bold text-[#1E3A8A]">
                      Kucing sedang tidur — aktivitas bermain dikunci sampai bangun.
                    </p>
                  ) : (
                    <>
                      {hud.dayPhase === 'siang' && (
                        <p className="px-2.5 py-1.5 rounded-lg bg-[#FEF9C3] border border-[#CA8A04]/40 text-[11px] font-bold text-[#854D0E]">
                          Siang Hari: bonus +10% poin Bahagia saat bermain!
                        </p>
                      )}
                      {(isNgambek || isDrowsyHeavy || isDrowsyLight) && (
                        <p className="px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] border border-[#D97706]/50 text-[11px] font-bold text-[#92400E]">
                          {isDrowsyHeavy
                            ? 'Energi ≤ 20 (Sangat Ngantuk): Mainan Interaktif ditolak — segera tidurkan!'
                            : isDrowsyLight
                            ? `${
                                hud.dayPhase === 'malam'
                                  ? 'Energi ≤ 50 (Malam · Mulai Ngantuk)'
                                  : hud.weather === 'hujan'
                                  ? 'Energi ≤ 45 (Hujan · Mulai Ngantuk)'
                                  : 'Energi 21–40 (Mulai Ngantuk)'
                              }: konsumsi Energi aktivitas naik 1,15x.`
                            : 'Bahagia < 40 (Ngambek): efek Bahagia bermain lebih kecil sampai tenang.'}
                        </p>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                    <div className="min-w-0">
                      <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12]">
                        Mainan Interaktif ({activeToyMeta.name} · Dalam Rumah)
                      </p>
                      <p className="text-[11px] font-bold text-[#BE185D]">
                        +{ACTION_DELTAS.playInteractiveFull.happiness} Bahagia ·{' '}
                        {ACTION_DELTAS.playInteractiveFull.energy} Energi ·{' '}
                        {ACTION_DELTAS.playInteractiveFull.hunger} Kenyang ·{' '}
                        {ACTION_DELTAS.playInteractiveFull.cleanliness} Bersih · CD 2m
                      </p>
                    </div>
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

                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                    <div className="min-w-0">
                      <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] inline-flex items-center gap-1">
                        <Gamepad2 className="w-4 h-4 text-[#0284C7]" />
                        <span>Mini Game Kolam (Outdoor)</span>
                      </p>
                      <p className="text-[11px] font-bold text-[#0369A1]">
                        +{ACTION_DELTAS.playMiniGame.happiness + (hud.weather === 'hujan' ? 5 : 0)}{' '}
                        Bahagia{hud.weather === 'hujan' ? ' (+5 Hujan)' : ''} ·{' '}
                        {ACTION_DELTAS.playMiniGame.energy} Energi ·{' '}
                        {ACTION_DELTAS.playMiniGame.hunger} Kenyang ·{' '}
                        {ACTION_DELTAS.playMiniGame.cleanliness - (hud.weather === 'hujan' ? 2 : 0)}{' '}
                        Bersih{hud.weather === 'hujan' ? ' (-2 Hujan)' : ''} · CD 1m
                      </p>
                    </div>
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
                </div>
              );
            })()}

            {activeMenu === 'pet' && (() => {
              const petShortCd = hud.cooldownsSec.petShort;
              const petFullCd = hud.cooldownsSec.petFull;
              const isHappyFull = hud.happiness >= 100;
              const shortBlocked = isSleeping || isHappyFull || petShortCd > 0;
              const fullBlocked = isSleeping || isHappyFull || petFullCd > 0;

              return (
                <div className="space-y-2">
                  {hud.weather === 'hujan' && (
                    <p className="px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#60A5FA]/60 text-[11px] font-bold text-[#1E3A8A]">
                      Cuaca Hujan: elus-elus terasa lebih menenangkan saat rintik hujan (+0 Energi).
                    </p>
                  )}
                  {isNgambek && (
                    <p className="px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] border border-[#D97706]/50 text-[11px] font-bold text-[#92400E]">
                      Bahagia &lt; 40 (Ngambek): efek elus berkurang hingga mood kembali tenang.
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                    <div>
                      <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12]">
                        Elus-elus Singkat
                      </p>
                      <p className="text-[11px] font-bold text-[#BE185D]">
                        +{ACTION_DELTAS.petShort.happiness} Bahagia · +0 Energi · CD 30d
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={shortBlocked}
                      onClick={() => {
                        if (shortBlocked) return;
                        onSelectTool('PET');
                        onPetCat('short');
                        setActiveMenu(null);
                      }}
                      className={`px-3.5 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap tabular-nums ${
                        shortBlocked
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-gradient-to-b from-[#FB7185] to-[#E11D48] border-[#881337] text-white cursor-pointer hover:brightness-105'
                      }`}
                    >
                      {isSleeping
                        ? 'Tidur'
                        : isHappyFull
                        ? 'Bahagia 100'
                        : petShortCd > 0
                        ? formatTimerMMSS(petShortCd)
                        : 'Elus Singkat'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]">
                    <div>
                      <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12] inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48]" />
                        <span>Elus-elus Penuh / Kasih Sayang</span>
                      </p>
                      <p className="text-[11px] font-bold text-[#BE185D]">
                        +{ACTION_DELTAS.petFull.happiness} Bahagia · +0 Energi ·{' '}
                        {ACTION_DELTAS.petFull.hunger} Kenyang · CD 1m
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={fullBlocked}
                      onClick={() => {
                        if (fullBlocked) return;
                        onSelectTool('PET');
                        onPetCat('full');
                        setActiveMenu(null);
                      }}
                      className={`px-3.5 py-1.5 min-h-[38px] rounded-full border-2 font-display font-extrabold text-xs whitespace-nowrap tabular-nums ${
                        fullBlocked
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#7D8A83] cursor-not-allowed'
                          : 'bg-gradient-to-b from-[#F472B6] to-[#BE185D] border-[#831843] text-white cursor-pointer hover:brightness-105'
                      }`}
                    >
                      {isSleeping
                        ? 'Tidur'
                        : isHappyFull
                        ? 'Bahagia 100'
                        : petFullCd > 0
                        ? formatTimerMMSS(petFullCd)
                        : 'Kasih Sayang'}
                    </button>
                  </div>
                  <p className="text-[10.5px] font-semibold text-[#7A4928] text-center">
                    Tip: Klik kucing di ruangan untuk Elus Singkat, atau usap terus untuk Elus Penuh (+0 Energi).
                  </p>
                </div>
              );
            })()}

            {activeMenu === 'sleep' && (() => {
              const sleepCd = hud.cooldownsSec.sleepManual;
              const isEnergyFull = hud.energy >= 100;
              const isDaytimeTooFresh = hud.dayPhase !== 'malam' && hud.energy > 85;
              const isDaytimeBriefOnly =
                hud.dayPhase !== 'malam' && hud.energy > 70 && hud.energy <= 85;
              const sleepBonusNote =
                (hud.dayPhase === 'pagi'
                  ? 'Pagi Hari: bonus pemulihan Energi +10% saat tidur.'
                  : hud.dayPhase === 'malam'
                  ? 'Malam Hari: bonus pemulihan Energi +20% saat tidur.'
                  : 'Siang Hari: pemulihan Energi normal (+10% Pagi, +20% Malam).') +
                (hud.weather === 'hujan' ? ' · Hujan: ekstra +10% Energi tidur!' : '');

              return (
                <div className="space-y-2">
                  <p className="px-2.5 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#60A5FA]/60 text-[11px] font-bold text-[#1E3A8A]">
                    {sleepBonusNote}
                  </p>

                  {isSleeping && hud.sleepMode !== 'none' && (
                    <div className="p-2.5 rounded-xl bg-[#EFF6FF] border-2 border-[#60A5FA] flex items-center justify-between gap-2">
                      <div className="text-xs font-extrabold text-[#1E3A8A] tabular-nums">
                        {hud.sleepMode === 'auto_sleep'
                          ? 'Auto-Sleep'
                          : hud.sleepMode === 'power_nap'
                          ? 'Sedang Power Nap'
                          : 'Sedang Tidur Penuh'}
                        {' · Sisa '}
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
                  )}

                  {!isSleeping && sleepCd > 0 && (
                    <p className="px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] border border-[#D97706]/50 text-[11px] font-bold text-[#92400E] tabular-nums">
                      Cooldown tidur manual: {formatTimerMMSS(sleepCd)} sebelum bisa tidur lagi.
                    </p>
                  )}

                  {!isSleeping && isDaytimeTooFresh && (
                    <p className="px-2.5 py-1.5 rounded-lg bg-[#FEE2E2] border border-[#EF4444]/40 text-[11px] font-bold text-[#991B1B]">
                      Masih segar (&gt;85 Energi) di {dayPhaseLabel} — kucing menolak tidur.
                    </p>
                  )}

                  {!isSleeping && isDaytimeBriefOnly && (
                    <p className="px-2.5 py-1.5 rounded-lg bg-[#FEF3C7] border border-[#D97706]/50 text-[11px] font-bold text-[#92400E]">
                      Energi &gt;70 di {dayPhaseLabel} — hanya mau tidur sebentar (Power Nap 1,5 mnt).
                    </p>
                  )}

                  {SLEEP_OPTIONS.map((opt) => {
                    const briefMode = isDaytimeBriefOnly && opt.id === 'power_nap';
                    const optBlocked =
                      isSleeping ||
                      isEnergyFull ||
                      sleepCd > 0 ||
                      isDaytimeTooFresh ||
                      (isDaytimeBriefOnly && opt.id === 'full_rest');

                    const btnLabel = isSleeping
                      ? 'Tidur'
                      : isEnergyFull
                      ? 'Energi 100'
                      : sleepCd > 0
                      ? formatTimerMMSS(sleepCd)
                      : isDaytimeTooFresh
                      ? 'Segar (>85)'
                      : isDaytimeBriefOnly && opt.id === 'full_rest'
                      ? 'Energi >70'
                      : briefMode
                      ? 'Tidur Sebentar'
                      : opt.shortName;

                    return (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#C79C69]"
                      >
                        <div className="min-w-0">
                          <p className="font-display font-extrabold text-xs sm:text-sm text-[#5A2D12]">
                            {briefMode ? 'Tidur Sebentar (Energi >70)' : opt.name}
                          </p>
                          <p className="text-[11px] font-bold text-[#1D4ED8]">
                            {briefMode
                              ? '+20 Energi · +3 Bahagia · -3 Kenyang · 1,5 mnt · CD 3 mnt'
                              : `${opt.description} · ${opt.durationLabel}`}
                          </p>
                        </div>
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
                  })}

                  <p className="text-[10.5px] font-semibold text-[#7A4928] text-center">
                    Membangunkan paksa sebelum selesai memotong -10 Bahagia &amp; memicu cooldown.
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Bottom Action Dock */}
        <div className="pointer-events-auto flex items-center justify-center gap-2.5 sm:gap-4 short:gap-2 bg-transparent border-0 shadow-none p-1 short:p-0">
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
              isBathLocked
                ? 'Mandi dikunci saat kucing sedang tidur'
                : 'Menu Mandi & Kebersihan'
            }
            title={
              isBathLocked
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
              !hud.isSick
                ? 'Obat hanya bisa diberikan saat kucing sakit'
                : hud.isRecovering
                ? 'Kucing sedang pulih dari obat'
                : 'Beri Obat'
            }
            title={
              !hud.isSick
                ? 'Obat hanya bisa diberikan saat kucing sakit'
                : hud.isRecovering
                ? 'Kucing sedang dalam pemulihan'
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

          <button
            type="button"
            onClick={() => {
              setActiveMenu(null);
              onToggleShop();
            }}
            aria-label="Toko"
            title="Toko"
            className={`w-13 h-13 sm:w-15 sm:h-15 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
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
    </div>
  );
};
