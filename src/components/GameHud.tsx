import React from 'react';
import { Gamepad2, Lock, Sparkles } from 'lucide-react';
import { CAT_TOYS, CatHudSnapshot, LIFE_STAGES, ToolMode } from '../types/game';
import { CatAvatarSvg } from './CatAvatarSvg';
import {
  CuteHealthStatIcon,
  PixelPawCluster,
  PixelPlantIcon,
  ToyIcon,
} from './CuteGameIcons';

interface GameHudProps {
  hud: CatHudSnapshot;
  toolMode: ToolMode;
  shopOpen: boolean;
  onSelectTool: (mode: ToolMode) => void;
  onFeed: () => void;
  onToggleSleep: () => void;
  onTossToy: () => void;
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
  const isLow = critical || value <= 22;
  const pct = Math.max(0, Math.min(100, value));

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
          {statusTag && (
            <span
              className={`text-[10px] short:text-[9px] font-extrabold uppercase tracking-wide whitespace-nowrap ${
                isLow ? 'text-[#B91C1C]' : 'text-[#2D6A4F]'
              }`}
            >
              {statusTag}
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
          <div className="pointer-events-none absolute inset-x-1 top-[1px] h-[2px] short:h-[1px] rounded-full bg-white/45" />
        </div>
      </div>
    </div>
  );
};

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  toolMode,
  shopOpen,
  onSelectTool,
  onFeed,
  onToggleSleep,
  onTossToy,
  onGiveMedicine,
  onToggleShop,
  onOpenLifeStage,
  onOpenMiniGame,
  onPause,
}) => {
  const isSleeping = hud.behavior === 'SLEEPING';
  const isPlayDisabled = hud.energy < 20 || hud.hunger < 20;
  const isMedicineDisabled = !hud.isSick || hud.isRecovering;
  const freeFeedCooldownSec = hud.freeFeedCooldownSec ?? 0;
  const isFeedDisabled = freeFeedCooldownSec > 0;
  const feedCooldownLabel = `${Math.floor(freeFeedCooldownSec / 60)}:${String(
    freeFeedCooldownSec % 60
  ).padStart(2, '0')}`;
  const activeToyMeta = CAT_TOYS.find((t) => t.id === hud.activeToy) ?? CAT_TOYS[0];
  const showHealthBar = hud.isSick || hud.isRecovering || hud.health < 100;
  const xpPercent = Math.max(
    4,
    Math.min(100, Math.round((hud.affectionXp / Math.max(1, hud.xpToNext)) * 100))
  );

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-5 short:px-3 short:py-2 safe-inset-hud">
      {/* Top Perimeter Row */}
      <div className="flex flex-wrap short:flex-nowrap items-start justify-between gap-2.5 short:gap-2">
        {/* Top-Left: Warm Cream Pixel-Bordered Status Panel */}
        <div className="pointer-events-auto relative px-4 py-3 short:px-2.5 short:py-1.5 rounded-xl short:rounded-lg bg-[#FFF3D9] border-[3px] short:border-2 border-[#7A4928] shadow-[inset_0_2px_0_#FFFDF5,0_4px_0_#7A4928] short:shadow-[inset_0_1px_0_#FFFDF5,0_2.5px_0_#7A4928]">
          {/* Decorative corner paws & potted plant */}
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
              statusTag={hud.hunger < 20 ? 'Kritis!' : hud.isHungry ? 'Lapar' : null}
              critical={hud.hunger < 20}
            />
            <PixelVitalMeter
              label="Bahagia"
              value={hud.happiness}
              iconSrc="/assets/ui/stat_happy.png"
              fillGradient="linear-gradient(180deg, #FF9BB4 0%, #F45B84 100%)"
              borderColor="#9E3E5B"
              statusTag={hud.happiness < 20 ? 'Stres!' : hud.happiness <= 25 ? 'Sedih' : null}
              critical={hud.happiness < 20}
            />
            <PixelVitalMeter
              label="Bersih"
              value={hud.cleanliness}
              iconSrc="/assets/ui/stat_clean.png"
              fillGradient="linear-gradient(180deg, #9EE7FF 0%, #38BDF8 100%)"
              borderColor="#4689A8"
              statusTag={hud.cleanliness < 15 ? 'Kritis!' : hud.cleanliness < 25 ? 'Kotor' : null}
              critical={hud.cleanliness < 15}
            />
            <PixelVitalMeter
              label="Energi"
              value={hud.energy}
              iconSrc="/assets/ui/stat_energy.png"
              fillGradient="linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%)"
              borderColor="#1E293B"
              innerRim
              statusTag={hud.energy < 20 ? 'Lelah' : null}
              critical={hud.energy < 20}
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
                statusTag={
                  hud.isRecovering
                    ? 'Pulih'
                    : hud.isSick
                    ? 'Sakit!'
                    : null
                }
                critical={hud.isSick && !hud.isRecovering}
              />
            </div>
          )}
        </div>

        {/* Top-Right: Cat Profile Card + Square Sound & Pause Buttons */}
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
                    hud.weather === 'hujan'
                      ? 'Cuaca: Hujan'
                      : hud.weather === 'malam'
                      ? 'Cuaca: Malam'
                      : 'Cuaca: Cerah'
                  }
                >
                  {hud.weather === 'hujan' ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 short:w-3 short:h-3 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 15h10a4 4 0 0 0 .6-7.95A5 5 0 0 0 8 6.5a4 4 0 0 0-1 8.5Z"
                        fill="#93C5FD"
                        stroke="#1E3A8A"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.5 18l-1 3M12.5 18l-1 3M16.5 18l-1 3"
                        stroke="#2563EB"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : hud.weather === 'malam' ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 short:w-3 short:h-3 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M19 14.5A7 7 0 0 1 9.5 5a7 7 0 1 0 9.5 9.5Z"
                        fill="#FDE047"
                        stroke="#713F12"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <img
                      src="/assets/ui/icon_sun.png"
                      alt=""
                      className="w-4 h-4 short:w-3 short:h-3 object-contain"
                      draggable={false}
                    />
                  )}
                  <span>
                    Hari {hud.day}
                    <span className="text-[#7A4928]/80 font-bold">
                      {' · '}
                      {hud.weather === 'hujan'
                        ? 'Hujan'
                        : hud.weather === 'malam'
                        ? 'Malam'
                        : 'Cerah'}
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
            <div className="flex items-center gap-1.5 short:gap-1">
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
      </div>

      {/* Warning Banner when Hungry or Sick */}
      {hud.warningText && (
        <div
          className={`self-center px-4 py-2 short:px-3 short:py-1 rounded-xl short:rounded-lg text-sm short:text-xs font-bold shadow-md border-2 ${
            hud.isSick
              ? 'bg-[#991B1B] text-white border-[#450A0A]'
              : 'bg-[#FFF3CD] text-[#78350F] border-[#B45309]/50'
          }`}
        >
          {hud.warningText}
        </div>
      )}

      {/* Bottom-Center: Icon-Only Floating Dock */}
      <div className="flex flex-col items-center gap-2 short:gap-1">
        {toolMode === 'BRUSH' && (
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

        <div className="pointer-events-auto flex items-center justify-center gap-3 sm:gap-5 short:gap-2.5 bg-transparent border-0 shadow-none p-1 short:p-0">
          <button
            type="button"
            disabled={isFeedDisabled}
            onClick={onFeed}
            aria-label={
              isFeedDisabled
                ? `Makanan gratis siap dalam ${feedCooldownLabel}`
                : 'Beri Makan (+25 Kenyang)'
            }
            title={
              isFeedDisabled
                ? `Makanan gratis siap dalam ${feedCooldownLabel}`
                : 'Beri Makan Gratis (+25 Kenyang, cooldown 5 menit)'
            }
            className={`relative w-14 h-14 sm:w-16 sm:h-16 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center transition-transform ${
              isFeedDisabled
                ? 'opacity-50 grayscale cursor-not-allowed'
                : 'hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 cursor-pointer'
            }`}
          >
            <img
              src="/assets/ui/icon_feed.png"
              alt="Beri Makan"
              className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]"
              draggable={false}
            />
            {isFeedDisabled && (
              <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-md bg-[#3B1E0E]/95 border border-[#FCD34D]/80 text-[#FFFBEB] text-[10px] short:text-[8.5px] font-extrabold leading-tight tabular-nums shadow-sm whitespace-nowrap">
                {feedCooldownLabel}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTool(toolMode === 'BRUSH' ? 'PET' : 'BRUSH')}
            aria-label="Mandikan Kucing"
            title="Gosok-gosok untuk membersihkan (+10 Bersih per gosokan)"
            className={`w-14 h-14 sm:w-16 sm:h-16 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              toolMode === 'BRUSH' ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <img
              src="/assets/ui/icon_brush.png"
              alt="Mandikan"
              className={`w-full h-full object-contain ${
                toolMode === 'BRUSH'
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
              onSelectTool('TOY');
              onTossToy();
            }}
            aria-label={
              isPlayDisabled
                ? `Tidak bisa diajak main (butuh Energi & Kenyang minimal 20)`
                : `Main ${activeToyMeta.name}`
            }
            title={
              isPlayDisabled
                ? 'Energi atau Kenyang di bawah 20 — kucing menolak bermain'
                : `Main ${activeToyMeta.name}`
            }
            className={`w-14 h-14 sm:w-16 sm:h-16 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center transition-transform ${
              isPlayDisabled
                ? 'opacity-45 grayscale cursor-not-allowed'
                : 'hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 cursor-pointer'
            } ${!isPlayDisabled && toolMode === 'TOY' ? '-translate-y-2 short:-translate-y-1 scale-110' : ''}`}
          >
            {hud.activeToy === 'yarn_ball' ? (
              <img
                src="/assets/ui/icon_ball.png"
                alt={activeToyMeta.name}
                className={`w-full h-full object-contain ${
                  !isPlayDisabled && toolMode === 'TOY'
                    ? 'drop-shadow-[0_0_10px_rgba(244,114,182,0.95)]'
                    : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
                }`}
                draggable={false}
              />
            ) : (
              <ToyIcon
                variant={hud.activeToy}
                className={`w-full h-full ${
                  !isPlayDisabled && toolMode === 'TOY'
                    ? 'drop-shadow-[0_0_10px_rgba(244,114,182,0.95)]'
                    : 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.28)]'
                }`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleSleep}
            aria-label={isSleeping ? 'Bangunkan' : 'Tidur'}
            title={isSleeping ? 'Bangunkan' : 'Tidur'}
            className={`w-14 h-14 sm:w-16 sm:h-16 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
              isSleeping ? '-translate-y-2 short:-translate-y-1 scale-110' : ''
            }`}
          >
            <img
              src="/assets/ui/icon_sleep.png"
              alt="Tidur"
              className={`w-full h-full object-contain ${
                isSleeping
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
            className={`w-14 h-14 sm:w-16 sm:h-16 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center transition-transform ${
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
            disabled={!hud.miniGameUnlocked}
            onClick={() => {
              if (!hud.miniGameUnlocked) return;
              onOpenMiniGame();
            }}
            aria-label={
              hud.miniGameUnlocked
                ? 'Mini-Game Tangkap Ikan'
                : 'Mini-Game terbuka pada fase Anak'
            }
            title={
              hud.miniGameUnlocked
                ? 'Mini-Game Tangkap Ikan'
                : 'Mini-Game terbuka mulai fase Anak (5 menit)'
            }
            className={`relative w-12 h-12 sm:w-14 sm:h-14 short:w-10 short:h-10 rounded-2xl short:rounded-xl border-[2.5px] short:border-2 flex items-center justify-center transition-transform ${
              hud.miniGameUnlocked
                ? 'bg-gradient-to-b from-[#7DD3FC] to-[#0284C7] border-[#0C4A6E] shadow-[inset_0_2px_0_#E0F2FE,0_4px_0_#0C4A6E] text-white hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 cursor-pointer'
                : 'bg-[#E5DEC9]/90 border-[#7A4928]/60 text-[#7A4928] opacity-65 cursor-not-allowed'
            }`}
          >
            <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 short:w-5 short:h-5" />
            {!hud.miniGameUnlocked && (
              <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-md bg-[#3B1E0E]/95 border border-[#FCD34D]/80 text-[#FFFBEB] text-[9px] short:text-[8px] font-extrabold leading-tight inline-flex items-center gap-0.5 whitespace-nowrap">
                <Lock className="w-2.5 h-2.5" />
                Anak+
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleShop}
            aria-label="Toko"
            title="Toko"
            className={`w-14 h-14 sm:w-16 sm:h-16 short:w-11 short:h-11 bg-transparent border-0 p-0 flex items-center justify-center hover:-translate-y-1.5 hover:scale-105 active:translate-y-0 transition-transform cursor-pointer ${
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
