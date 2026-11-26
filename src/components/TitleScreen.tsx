import React, { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import {
  CAT_BREEDS,
  CatBreed,
  GameSettings,
  HungerSpeed,
  LIFE_STAGES,
  SaveData,
} from '../types/game';
import { CatAvatarSvg } from './CatAvatarSvg';
import {
  CareNotificationPermission,
  getCareNotificationPermission,
  requestCareNotificationPermission,
} from '../utils/catCareSystem';
import {
  PixelExitDoorIcon,
  PixelGearButtonIcon,
  PixelPawButtonIcon,
  PixelPlayButtonIcon,
} from './CuteGameIcons';

type TitleSubView = 'MENU' | 'NEW_ADOPT' | 'SETTINGS' | 'QUIT';

interface TitleScreenProps {
  selectedBreed: CatBreed;
  onSelectBreed: (breed: CatBreed) => void;
  existingSave: SaveData | null;
  settings: GameSettings;
  onUpdateSettings: (next: Partial<GameSettings>) => void;
  onClearSave: () => void;
  onStartNew: (name: string, breed: CatBreed) => void;
  onContinueSave: () => void;
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
}) => {
  const [subView, setSubView] = useState<TitleSubView>('MENU');
  const [catName, setCatName] = useState(CAT_BREEDS[selectedBreed].defaultName);
  const [tick, setTick] = useState(0);
  const [notifPerm, setNotifPerm] = useState<CareNotificationPermission>(() =>
    getCareNotificationPermission()
  );

  const handleRequestNotif = async () => {
    const res = await requestCareNotificationPermission();
    setNotifPerm(res);
  };

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
      if (e.key === 'Escape' && subView !== 'MENU') {
        e.preventDefault();
        setSubView('MENU');
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && subView === 'MENU') {
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
  }, [subView, catName, selectedBreed, existingSave, onStartNew, onContinueSave]);

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
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 short:top-2 short:right-3 z-20 flex items-center gap-2">
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
          <img
            src="/assets/ui/cat_logo_wink.png"
            alt="Logo Kucing"
            className="w-20 h-18 sm:w-24 sm:h-22 short:w-12 short:h-11 object-contain -mb-2 short:-mb-1 drop-shadow-[0_4px_0_rgba(78,39,15,0.35)]"
            draggable={false}
          />

          <div className="relative inline-block">
            {/* Cat Ears behind R & g */}
            <svg
              viewBox="0 0 42 32"
              className="absolute -top-4 left-0.5 short:-top-2.5 short:left-0 w-10 h-8 short:w-6 short:h-5 pointer-events-none"
              aria-hidden="true"
            >
              <path
                d="M4 30L10 4L34 20Z"
                fill="#F59E0B"
                stroke="#4E270F"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M10 24L13 10L25 19Z" fill="#F9A8D4" />
            </svg>
            <svg
              viewBox="0 0 42 32"
              className="absolute -top-4 right-0 short:-top-2.5 w-10 h-8 short:w-6 short:h-5 pointer-events-none"
              aria-hidden="true"
            >
              <path
                d="M38 30L32 4L8 20Z"
                fill="#F59E0B"
                stroke="#4E270F"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M32 24L29 10L17 19Z" fill="#F9A8D4" />
            </svg>

            <h1 className="relative font-display font-black text-4xl sm:text-5xl md:text-[56px] short:text-[32px] leading-none tracking-tight text-[#F6A637] title-text-outline">
              Rumah Kucing
            </h1>
          </div>

          <p className="mt-2 short:mt-1 font-display font-bold text-sm sm:text-base md:text-lg short:text-xs text-[#FFFDF7] menu-text-outline">
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
              <div className="wood-menu-panel rounded-2xl short:rounded-xl border-[3px] border-[#6E3B1B] shadow-[inset_0_3px_0_#FFFBF2,0_6px_0_#6E3B1B] p-5 short:p-3.5 space-y-4 short:space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg short:text-base font-extrabold text-[#5A2D12]">
                    Pengaturan
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

                <div className="p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#6E3B1B]/25 space-y-2 short:space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm short:text-xs font-bold text-[#5A2D12]">Volume Suara</p>
                      <p className="text-xs short:text-[10.5px] text-[#7A4928]">
                        Atur persentase besar kecil suara game
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#FFF3D9] border border-[#6E3B1B]/30 text-xs font-extrabold text-[#5A2D12] tabular-nums">
                      {settings.volume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={settings.volume}
                    onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
                    aria-label="Persentase volume suara"
                    className="w-full h-2.5 rounded-full bg-[#EFE2C8] accent-[#2D6A4F] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 short:grid-cols-2 gap-2.5 short:gap-2">
                  <div className="flex items-center justify-between gap-2.5 p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#6E3B1B]/25">
                    <div className="min-w-0">
                      <p className="text-sm short:text-xs font-bold text-[#5A2D12]">Efek Suara (SFX)</p>
                      <p className="text-[11px] short:text-[10px] text-[#7A4928] leading-tight">
                        Meong, dengkuran &amp; mainan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ sfxMuted: !settings.sfxMuted })}
                      className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer border-2 shrink-0 ${
                        settings.sfxMuted
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#5B6B63]'
                          : 'bg-[#2D6A4F] border-[#1B4332] text-white'
                      }`}
                    >
                      {settings.sfxMuted ? 'Mati' : 'Aktif'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2.5 p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#6E3B1B]/25">
                    <div className="min-w-0">
                      <p className="text-sm short:text-xs font-bold text-[#5A2D12]">Musik Latar</p>
                      <p className="text-[11px] short:text-[10px] text-[#7A4928] leading-tight">
                        Musik menu &amp; dalam game
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ musicMuted: !settings.musicMuted })}
                      className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer border-2 shrink-0 ${
                        settings.musicMuted
                          ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#5B6B63]'
                          : 'bg-[#2D6A4F] border-[#1B4332] text-white'
                      }`}
                    >
                      {settings.musicMuted ? 'Mati' : 'Aktif'}
                    </button>
                  </div>
                </div>

                <div className="p-3 short:p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#6E3B1B]/25">
                  <p className="text-sm short:text-xs font-bold text-[#5A2D12] mb-2 short:mb-1.5">
                    Laju Rasa Lapar
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['santai', 'normal'] as HungerSpeed[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => onUpdateSettings({ hungerSpeed: mode })}
                        className={`px-3 py-2 short:py-1.5 min-h-[40px] rounded-lg text-xs font-bold border-2 transition-colors cursor-pointer ${
                          settings.hungerSpeed === mode
                            ? 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722]'
                            : 'bg-[#FAF8F2] border-[#6E3B1B]/20 text-[#7A4928]'
                        }`}
                      >
                        {mode === 'santai' ? 'Santai (Lebih Lambat)' : 'Standar (Sesuai Skala)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 short:p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#6E3B1B]/25">
                  <div className="flex items-center justify-between gap-2 mb-2 short:mb-1.5">
                    <p className="text-sm short:text-xs font-bold text-[#5A2D12]">
                      Skala Waktu (TimeScale)
                    </p>
                    <span className="text-[11px] font-extrabold text-[#2D6A4F] tabular-nums">
                      {settings.timeScale}x
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { value: 73, label: '60m = 73 Jam' },
                      { value: 1, label: '1:1 Real-Time' },
                      { value: 60, label: '1m = 1 Jam' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onUpdateSettings({ timeScale: opt.value })}
                        className={`px-2 py-2 short:py-1.5 min-h-[38px] rounded-lg text-[11px] font-bold border-2 transition-colors cursor-pointer ${
                          settings.timeScale === opt.value
                            ? 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722]'
                            : 'bg-[#FAF8F2] border-[#6E3B1B]/20 text-[#7A4928]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 p-3 short:p-2.5 rounded-xl bg-[#FFFDF8] border-2 border-[#6E3B1B]/25">
                  <div>
                    <p className="text-sm short:text-xs font-bold text-[#5A2D12]">Notifikasi Makan</p>
                    <p className="text-xs short:text-[11px] text-[#7A4928]">
                      Ingatkan saat kenyang tinggal 20%
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={notifPerm === 'granted' || notifPerm === 'denied' || notifPerm === 'unsupported'}
                    onClick={handleRequestNotif}
                    className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-bold transition-colors whitespace-nowrap border-2 ${
                      notifPerm === 'granted'
                        ? 'bg-[#2D6A4F] border-[#1B4332] text-white cursor-default'
                        : notifPerm === 'denied' || notifPerm === 'unsupported'
                        ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#5B6B63] cursor-not-allowed'
                        : 'bg-[#FFF3D9] border-[#7A4928] text-[#5A2D12] hover:bg-[#FDE68A] cursor-pointer'
                    }`}
                  >
                    {notifPerm === 'granted'
                      ? 'Aktif'
                      : notifPerm === 'denied'
                      ? 'Diblokir'
                      : notifPerm === 'unsupported'
                      ? 'Tidak Didukung'
                      : 'Izinkan'}
                  </button>
                </div>

                {existingSave && (
                  <button
                    type="button"
                    onClick={onClearSave}
                    className="w-full px-4 py-2.5 short:py-2 min-h-[44px] short:min-h-[40px] rounded-xl bg-[#FFFDF8] border-2 border-[#DC2626]/40 text-[#B91C1C] text-xs font-bold hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Hapus Data Simpanan</span>
                  </button>
                )}
              </div>
            )}

            {subView === 'QUIT' && (
              <div className="wood-menu-panel rounded-2xl short:rounded-xl border-[3px] border-[#6E3B1B] shadow-[inset_0_3px_0_#FFFBF2,0_6px_0_#6E3B1B] p-6 short:p-4 text-center space-y-4 short:space-y-2.5">
                <div className="flex justify-center">
                  <CatAvatarSvg breed={selectedBreed} size={56} lifeStage="baby" />
                </div>
                <div>
                  <h2 className="font-display text-xl short:text-lg font-extrabold text-[#5A2D12]">
                    Sampai Jumpa Lagi!
                  </h2>
                  <p className="text-sm short:text-xs font-medium text-[#7A4928] mt-1">
                    Terima kasih sudah bermain di Rumah Kucing. Kamu dapat menutup halaman ini atau kembali ke menu utama.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubView('MENU')}
                  className="w-full px-5 py-3 short:py-2 min-h-[46px] short:min-h-[42px] rounded-xl bg-gradient-to-b from-[#699A4E] to-[#4E7B37] border-[3px] border-[#385926] text-white font-display font-bold text-sm hover:brightness-105 transition-all cursor-pointer menu-text-outline"
                >
                  Kembali ke Menu Utama
                </button>
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
            onClick={() => setSubView('QUIT')}
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
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-5 short:gap-2.5">
            {/* 1. Mulai Baru */}
            <button
              type="button"
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
    </div>
  );
};
