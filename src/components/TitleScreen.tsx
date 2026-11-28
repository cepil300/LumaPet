import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  CAT_BREEDS,
  CatBreed,
  GameSettings,
  LIFE_STAGES,
  SaveData,
} from '../types/game';
import { CatAvatarSvg } from './CatAvatarSvg';
import {
  OrnateCornerFlourishes,
  PixelExitDoorIcon,
  PixelGearButtonIcon,
  PixelPawButtonIcon,
  PixelPlayButtonIcon,
} from './CuteGameIcons';
import { SettingsModalContent } from './SettingsModalContent';
import { CatEarsHeaderPlaque, CatPortraitMedallion } from './WoodPanelChrome';

type TitleSubView = 'MENU' | 'NEW_ADOPT' | 'SETTINGS';

interface TitleScreenProps {
  selectedBreed: CatBreed;
  onSelectBreed: (breed: CatBreed) => void;
  existingSave: SaveData | null;
  settings: GameSettings;
  onUpdateSettings: (next: Partial<GameSettings>) => void;
  onClearSave: () => void;
  onStartNew: (name: string, breed: CatBreed) => void;
  onContinueSave: () => void;
  onQuitApp: () => void;
}

interface TitleSpriteCatProps {
  sheet: string;
  row: number;
  col: number;
  className?: string;
  flipX?: boolean;
}

const TitleSpriteCat: React.FC<TitleSpriteCatProps> = ({
  sheet,
  row,
  col,
  className = '',
  flipX = false,
}) => (
  <div
    className={`pointer-events-none select-none ${className}`}
    style={{
      backgroundImage: `url('${sheet}')`,
      backgroundSize: '600% 800%',
      backgroundPosition: `${(col / 5) * 100}% ${(row / 7) * 100}%`,
      backgroundRepeat: 'no-repeat',
      transform: flipX ? 'scaleX(-1)' : undefined,
      filter: 'drop-shadow(0 6px 4px rgba(45, 25, 12, 0.24))',
    }}
    aria-hidden="true"
  />
);

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedBreed,
  onSelectBreed,
  existingSave,
  settings,
  onUpdateSettings,
  onClearSave,
  onStartNew,
  onContinueSave,
  onQuitApp,
}) => {
  const [subView, setSubView] = useState<TitleSubView>('MENU');
  const [quitConfirmOpen, setQuitConfirmOpen] = useState(false);
  const [catName, setCatName] = useState(CAT_BREEDS[selectedBreed].defaultName);
  const [tick, setTick] = useState(0);

  const handleBreedPick = (breed: CatBreed) => {
    onSelectBreed(breed);
    setCatName(CAT_BREEDS[breed].defaultName);
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % 240);
    }, 240);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Enter' && subView === 'NEW_ADOPT') {
          e.preventDefault();
          onStartNew(catName, selectedBreed);
        }
        return;
      }
      if (e.key === 'Escape' && quitConfirmOpen) {
        e.preventDefault();
        setQuitConfirmOpen(false);
        return;
      }
      if (e.key === 'Escape' && subView !== 'MENU') {
        e.preventDefault();
        setSubView('MENU');
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && subView === 'MENU' && !quitConfirmOpen) {
        e.preventDefault();
        if (existingSave) {
          onContinueSave();
        } else {
          setSubView('NEW_ADOPT');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [subView, quitConfirmOpen, catName, selectedBreed, existingSave, onStartNew, onContinueSave]);

  const sleepCol = 2;
  const playCol = [0, 1, 2, 3, 4, 5][tick % 6];
  const stretchCol = [0, 1, 2, 3][Math.floor(tick / 2) % 4];
  const sitCol = [2, 3, 4, 5][Math.floor(tick / 2) % 4];

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between overflow-hidden">
      {/* Bright Tatami Room Backdrop */}
      <img
        src="/assets/aistudio/image_8ba7ea28.png"
        alt="Latar kamar tatami Rumah Kucing"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        draggable={false}
      />

      {/* Living Pixel Cats inside the Tatami Room */}
      <div className="hidden md:block short:opacity-90 absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Decorative Food Bowl on bottom-left floor */}
        <img
          src="/assets/ui/icon_feed.png"
          alt=""
          className="absolute left-[14%] bottom-[10%] short:left-[10%] short:bottom-[19%] w-14 h-14 short:w-9 short:h-9 object-contain drop-shadow-[0_4px_3px_rgba(45,25,12,0.3)]"
          draggable={false}
        />

        {/* Cat sitting on the wooden cabinet */}
        <TitleSpriteCat
          sheet="/assets/sprites/cat_mochi.png"
          row={1}
          col={sitCol}
          className="absolute left-[43%] top-[43%] short:top-[44%] w-28 h-22 short:w-18 short:h-14"
        />

        {/* Silver kitty chasing yarn ball on center tatami */}
        <div className="absolute left-[48%] bottom-[16%] short:bottom-[21%] flex items-end gap-0">
          <TitleSpriteCat
            sheet="/assets/sprites/cat_abu.png"
            row={2}
            col={playCol}
            className="w-36 h-28 short:w-22 short:h-18"
          />
          <img
            src="/assets/ui/icon_ball.png"
            alt=""
            className="w-12 h-12 short:w-8 short:h-8 -ml-4 short:-ml-2.5 mb-2 object-contain drop-shadow-[0_4px_3px_rgba(45,25,12,0.28)]"
            draggable={false}
          />
        </div>

        {/* Sleeping orange tabby with floating zZ */}
        <div className="absolute left-[65%] bottom-[12%] short:bottom-[19%]">
          <div className="relative">
            <span className="absolute -top-3 right-3 short:-top-2 short:right-1 px-1.5 py-0.5 rounded-lg bg-[#E0F2FE]/90 border-2 border-[#4E270F] text-[#0369A1] font-display font-extrabold text-xs short:text-[10px] animate-bounce">
              zZ
            </span>
            <TitleSpriteCat
              sheet="/assets/sprites/cat_oren.png"
              row={3}
              col={sleepCol}
              className="w-36 h-28 short:w-22 short:h-18"
            />
          </div>
        </div>

        {/* Stretching kitty on the sunlit bamboo veranda */}
        <TitleSpriteCat
          sheet="/assets/sprites/cat_oren.png"
          row={7}
          col={stretchCol}
          flipX
          className="hidden lg:block short:block absolute right-[4%] bottom-[17%] short:bottom-[21%] w-36 h-28 short:w-22 short:h-18"
        />
      </div>

      {/* Top-Right: Square Sound Button (absolute so it doesn't consume vertical hero space on short screens) */}
      <div
        data-ui-id="title-sound-btn"
        data-ui-label="Tombol Suara"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 short:top-2 short:right-3 z-20 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => onUpdateSettings({ muted: !settings.muted })}
          className="relative min-w-[44px] min-h-[44px] flex items-center justify-center bg-transparent border-0 p-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label={settings.muted ? 'Nyalakan suara' : 'Matikan suara'}
          title={settings.muted ? 'Nyalakan suara' : 'Matikan suara'}
        >
          <img
            src="/assets/ui/btn_sound.png"
            alt="Suara"
            className={`w-12 h-12 short:w-9 short:h-9 object-contain drop-shadow-[0_3px_0_rgba(78,39,15,0.35)] ${
              settings.muted ? 'opacity-75 grayscale-[30%]' : ''
            }`}
            draggable={false}
          />
          {settings.muted && (
            <svg
              viewBox="0 0 48 48"
              className="absolute inset-0 m-auto w-12 h-12 short:w-9 short:h-9 pointer-events-none"
              aria-hidden="true"
            >
              <line
                x1="11"
                y1="11"
                x2="37"
                y2="37"
                stroke="#DC2626"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Center Hero Title Lockup + Optional Submenu Modal */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-start short:justify-center pt-10 sm:pt-12 short:pt-2 px-4 short:px-3">
        {/* Centered Cat Logo + Title Lockup */}
        <div
          className={`flex flex-col items-center text-center select-none ${
            subView !== 'MENU' ? 'short:hidden' : ''
          }`}
        >
          <h1
            data-ui-id="title-logo"
            data-ui-label="Logo LumaPet"
            className="relative m-0 flex items-center justify-center"
          >
            <img
              src="/assets/aistudio/image_e0ece965.png"
              alt="LumaPet"
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 short:w-20 short:h-20 max-w-[88vw] rounded-[19.5%] object-contain drop-shadow-[0_6px_0_rgba(78,39,15,0.34)]"
              draggable={false}
            />
          </h1>

          <p
            data-ui-id="title-subtitle"
            data-ui-label="Subjudul"
            className="mt-2 short:mt-1 font-display font-bold text-sm sm:text-base md:text-lg short:text-xs text-[#FFFDF7] menu-text-outline"
          >
            Rawat, elus, dan main bersama sahabat berbulu
          </p>
        </div>

        {/* Subviews (Adopt / Settings / Quit) */}
        {subView !== 'MENU' && (
          <div className="w-full max-w-[440px] short:max-w-[560px] mt-4 short:mt-0 max-h-[88dvh] short:max-h-[92dvh] overflow-y-auto">
            {subView === 'NEW_ADOPT' && (
              <div className="wood-menu-panel rounded-2xl short:rounded-xl border-[3px] border-[#6E3B1B] shadow-[inset_0_3px_0_#FFFBF2,0_6px_0_#6E3B1B] p-5 short:p-3.5">
                <div className="flex items-center justify-between mb-3 short:mb-2">
                  <h2 className="font-display text-lg short:text-base font-extrabold text-[#5A2D12]">
                    Pilih Kucing untuk Diadopsi
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSubView('MENU')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7A4928] hover:text-[#5A2D12] py-1.5 px-2.5 min-h-[36px] rounded-lg bg-[#FFFDF8] border-2 border-[#6E3B1B]/30 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 short:grid-cols-4 gap-2 mb-4 short:mb-2.5">
                  {(Object.keys(CAT_BREEDS) as CatBreed[]).map((breedKey) => {
                    const b = CAT_BREEDS[breedKey];
                    const active = selectedBreed === breedKey;
                    return (
                      <button
                        key={breedKey}
                        type="button"
                        onClick={() => handleBreedPick(breedKey)}
                        className={`flex flex-col items-center text-center p-2 short:p-1.5 rounded-xl border-2 transition-colors min-h-[44px] cursor-pointer ${
                          active
                            ? 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] shadow-[0_2px_0_#2D6A4F]'
                            : 'bg-[#FFFDF8] border-[#6E3B1B]/25 text-[#5A2D12] hover:bg-[#FFF3D9]'
                        }`}
                      >
                        <div className="short:scale-[0.82] short:-my-1 flex items-center justify-center">
                          <CatAvatarSvg breed={breedKey} size={46} lifeStage="baby" />
                        </div>
                        <span className="mt-1 short:mt-0.5 text-xs short:text-[11px] font-bold whitespace-nowrap">
                          {b.defaultName}
                        </span>
                        <span className="text-[11px] short:text-[10px] text-[#7A4928] leading-tight mt-0.5">
                          {b.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="short:grid short:grid-cols-[1fr_auto] short:items-end short:gap-3">
                  <div className="mb-4 short:mb-0">
                    <label
                      htmlFor="cat-name-input"
                      className="block text-xs short:text-[11px] font-bold text-[#5A2D12] mb-1.5 short:mb-1"
                    >
                      Nama Panggilan Kucing ·{' '}
                      <span className="font-medium text-[#7A4928]">
                        {CAT_BREEDS[selectedBreed].personality}
                      </span>
                    </label>
                    <input
                      id="cat-name-input"
                      type="text"
                      maxLength={16}
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder={CAT_BREEDS[selectedBreed].defaultName}
                      className="w-full px-3.5 py-2.5 short:py-2 min-h-[44px] short:min-h-[40px] rounded-xl bg-[#FFFDF8] border-2 border-[#6E3B1B]/40 text-sm font-semibold text-[#5A2D12] focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartNew(catName, selectedBreed)}
                    className="w-full short:w-auto px-6 py-3 short:px-5 short:py-2 min-h-[48px] short:min-h-[42px] rounded-xl bg-gradient-to-b from-[#EE8B3B] to-[#D4671F] border-[3px] border-[#5E2F12] shadow-[0_3px_0_#5E2F12] text-white font-display font-black text-base short:text-sm hover:brightness-105 transition-all whitespace-nowrap cursor-pointer menu-text-outline"
                  >
                    Mulai Bermain
                  </button>
                </div>
              </div>
            )}

            {subView === 'SETTINGS' && (
              <div className="fixed inset-0 z-30 bg-[#18221D]/55 flex items-center justify-center p-4 short:p-2.5 safe-inset-hud">
                <div className="flex flex-col md:flex-row short:flex-row items-center justify-center gap-4 sm:gap-6 short:gap-3.5 w-full max-w-[780px] short:max-w-[660px]">
                  <CatPortraitMedallion
                    breed={existingSave?.breed ?? selectedBreed}
                    hat={existingSave?.equippedHat ?? 'none'}
                    glasses={existingSave?.equippedGlasses ?? 'none'}
                    scarf={existingSave?.equippedScarf ?? 'default'}
                    lifeStage={existingSave?.lifeStage ?? 'baby'}
                    className="w-36 h-36 sm:w-48 sm:h-48 short:w-28 short:h-28"
                  />

                  <div className="relative flex-1 w-full max-w-[540px] short:max-w-[490px] mt-3 md:mt-0 short:mt-0">
                    <div className="absolute -top-6 sm:-top-7 short:-top-4 left-1/2 -translate-x-1/2 z-20">
                      <CatEarsHeaderPlaque title="Pengaturan" />
                    </div>

                    <div className="wood-modal-frame rounded-3xl short:rounded-2xl p-2.5 sm:p-3 short:p-2 border-[3px] short:border-2 border-[#5E2F12] shadow-[inset_0_2px_0_rgba(255,235,205,0.45),0_8px_0_rgba(58,28,10,0.45)]">
                      <div className="relative rounded-2xl short:rounded-xl bg-[#FFF6E3] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8] px-4 pb-4 pt-8 sm:px-6 sm:pb-5 sm:pt-9 short:px-3.5 short:pb-3 short:pt-6 max-h-[82dvh] short:max-h-[86dvh] overflow-y-auto">
                        <OrnateCornerFlourishes className="short:w-3 short:h-3" />
                        <SettingsModalContent
                          settings={settings}
                          onUpdateSettings={onUpdateSettings}
                          onClose={() => setSubView('MENU')}
                          onClearSave={onClearSave}
                          hasExistingSave={Boolean(existingSave)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Area: Keluar at bottom-left & 3 horizontal main buttons centered */}
      {subView === 'MENU' && (
        <div className="relative z-10 px-4 sm:px-8 pb-5 sm:pb-7 short:px-3 short:pb-2.5 pt-1 flex flex-col-reverse sm:flex-row items-center justify-center gap-3 short:gap-2 safe-inset-hud">
          {/* Bottom-Left Compact Keluar Button */}
          <button
            type="button"
            data-ui-id="title-quit-btn"
            data-ui-label="Tombol Keluar"
            onClick={() => setQuitConfirmOpen(true)}
            className="sm:absolute short:absolute sm:left-6 sm:bottom-6 short:left-3 short:bottom-2.5 flex flex-col items-center gap-1 short:gap-0.5 min-w-[44px] min-h-[44px] group cursor-pointer bg-transparent border-0 p-0"
            aria-label="Keluar"
          >
            <span className="w-12 h-12 short:w-9 short:h-9 rounded-xl short:rounded-lg bg-[#FFF6E5] border-[3px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_3px_0_#6E3B1B] flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform">
              <PixelExitDoorIcon className="w-7 h-7 short:w-5 short:h-5" />
            </span>
            <span className="font-display font-black text-xs short:text-[10px] text-[#FFFDF7] menu-text-outline">
              Keluar
            </span>
          </button>

          {/* Centered Horizontal Action Row: Mulai Baru | Lanjutkan | Pengaturan */}
          <div
            data-ui-id="title-action-row"
            data-ui-label="Baris Tombol Menu"
            className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-5 short:gap-2.5"
          >
            {/* 1. Mulai Baru */}
            <button
              type="button"
              data-ui-id="title-new-btn"
              data-ui-label="Tombol Mulai Baru"
              onClick={() => setSubView('NEW_ADOPT')}
              className="px-5 py-2.5 short:px-3.5 short:py-1.5 min-h-[54px] short:min-h-[44px] rounded-2xl short:rounded-xl bg-gradient-to-b from-[#EE8B3B] to-[#D4671F] border-[3px] short:border-2 border-[#5E2F12] ring-2 ring-white/85 shadow-[inset_0_2px_0_#FBB876,0_4px_0_#5E2F12,0_8px_14px_rgba(35,18,6,0.28)] hover:brightness-105 active:translate-y-0.5 transition-all inline-flex items-center gap-2.5 short:gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <PixelPawButtonIcon className="w-8 h-8 short:w-5 short:h-5 shrink-0" />
              <span className="font-display font-black text-lg sm:text-xl short:text-sm text-[#FFF8EB] menu-text-outline">
                Mulai Baru
              </span>
            </button>

            {/* 2. Lanjutkan (Center Featured Button) */}
            <button
              type="button"
              data-ui-id="title-continue-btn"
              data-ui-label="Tombol Lanjutkan"
              disabled={!existingSave}
              onClick={onContinueSave}
              className={`px-6 sm:px-7 py-2.5 short:px-4 short:py-1.5 min-h-[64px] short:min-h-[48px] rounded-2xl short:rounded-xl border-[3px] short:border-2 ring-2 ring-white/90 transition-all inline-flex items-center gap-3 short:gap-2 whitespace-nowrap ${
                existingSave
                  ? 'bg-gradient-to-b from-[#7BB453] to-[#4D8130] border-[#385926] shadow-[inset_0_2px_0_#B4E08E,0_5px_0_#385926,0_10px_18px_rgba(35,18,6,0.3)] hover:brightness-105 active:translate-y-0.5 cursor-pointer'
                  : 'bg-[#E8DEC9] border-[#968368] text-[#7D6E59] shadow-[0_4px_0_#968368] cursor-not-allowed opacity-90'
              }`}
            >
              <PixelPlayButtonIcon className="w-8 h-8 short:w-6 short:h-6 shrink-0" />
              <span className="flex flex-col items-start text-left leading-tight">
                <span
                  className={`font-display font-black text-xl sm:text-2xl short:text-base ${
                    existingSave ? 'text-[#FFFDF8] menu-text-outline' : 'text-[#6E5F4B]'
                  }`}
                >
                  Lanjutkan
                </span>
                <span
                  className={`text-xs short:text-[10px] font-bold tabular-nums truncate max-w-[170px] short:max-w-[130px] ${
                    existingSave ? 'text-[#FFFDF8] menu-text-outline' : 'text-[#7D6E59]'
                  }`}
                >
                  {existingSave
                    ? `${existingSave.name} · ${LIFE_STAGES[existingSave.lifeStage ?? 'baby'].shortLabel} · Hari ${existingSave.day}`
                    : 'Belum ada simpanan'}
                </span>
              </span>
            </button>

            {/* 3. Pengaturan */}
            <button
              type="button"
              data-ui-id="title-settings-btn"
              data-ui-label="Tombol Pengaturan"
              onClick={() => setSubView('SETTINGS')}
              className="px-5 py-2.5 short:px-3.5 short:py-1.5 min-h-[54px] short:min-h-[44px] rounded-2xl short:rounded-xl bg-gradient-to-b from-[#F5E4C8] to-[#DFC096] border-[3px] short:border-2 border-[#5E2F12] ring-2 ring-white/85 shadow-[0_4px_0_#5E2F12,0_8px_14px_rgba(35,18,6,0.28)] hover:brightness-105 active:translate-y-0.5 transition-all inline-flex items-center gap-2.5 short:gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <PixelGearButtonIcon className="w-7 h-7 short:w-5 short:h-5 shrink-0" />
              <span className="font-display font-black text-lg sm:text-xl short:text-sm text-[#FFF8EB] menu-text-outline">
                Pengaturan
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Quit Confirmation Modal */}
      {quitConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quit-confirm-title"
          className="fixed inset-0 z-40 bg-[#18221D]/65 backdrop-blur-[2px] flex items-center justify-center p-4"
        >
          <div className="w-full max-w-[360px] wood-menu-panel rounded-2xl border-[3px] border-[#6E3B1B] shadow-[inset_0_3px_0_#FFFBF2,0_8px_0_#5E2F12,0_16px_32px_rgba(0,0,0,0.45)] p-5 text-center space-y-4">
            <div className="flex justify-center">
              <CatAvatarSvg breed={selectedBreed} size={56} lifeStage="baby" />
            </div>
            <div>
              <h2
                id="quit-confirm-title"
                className="font-display text-xl font-extrabold text-[#5A2D12]"
              >
                Apakah Anda yakin?
              </h2>
              <p className="text-sm font-medium text-[#7A4928] mt-1">
                Apakah Anda yakin ingin keluar dari permainan?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onQuitApp}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-b from-[#F47B6A] to-[#D64B3B] border-[2.5px] border-[#6E241C] shadow-[inset_0_2px_0_#FCA5A5,0_3px_0_#6E241C] text-white font-display font-extrabold text-sm hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer menu-text-outline"
              >
                Ya
              </button>
              <button
                type="button"
                onClick={() => setQuitConfirmOpen(false)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-b from-[#7BB453] to-[#4D8130] border-[2.5px] border-[#385926] shadow-[inset_0_2px_0_#B4E08E,0_3px_0_#385926] text-white font-display font-extrabold text-sm hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer menu-text-outline"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
