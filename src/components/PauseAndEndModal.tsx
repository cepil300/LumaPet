import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  LogOut,
  Play,
  Settings,
} from 'lucide-react';
import {
  CatHudSnapshot,
  GameSettings,
  GameState,
  HungerSpeed,
  LIFE_STAGES,
} from '../types/game';
import {
  CareNotificationPermission,
  getCareNotificationPermission,
  requestCareNotificationPermission,
} from '../utils/catCareSystem';
import {
  GhostCatSvg,
  OrnateCornerFlourishes,
  ShopShirtTabIcon,
} from './CuteGameIcons';
import {
  CatEarsHeaderPlaque,
  CatPortraitMedallion,
} from './WoodPanelChrome';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved';

interface PauseAndEndModalProps {
  gameState: GameState;
  hud: CatHudSnapshot;
  settings: GameSettings;
  autoSaveStatus: AutoSaveStatus;
  lastSavedAt: number | null;
  onResume: () => void;
  onUpdateSettings: (next: Partial<GameSettings>) => void;
  onRestartSameCat: () => void;
  onReturnToTitle: () => void;
}

export const PauseAndEndModal: React.FC<PauseAndEndModalProps> = ({
  gameState,
  hud,
  settings,
  autoSaveStatus,
  lastSavedAt,
  onResume,
  onUpdateSettings,
  onRestartSameCat,
  onReturnToTitle,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [notifPerm, setNotifPerm] = useState<CareNotificationPermission>(() =>
    getCareNotificationPermission()
  );

  const handleRequestNotif = async () => {
    const res = await requestCareNotificationPermission();
    setNotifPerm(res);
  };

  if (gameState !== 'PAUSED' && gameState !== 'GAME_OVER') return null;

  const isGameOver = gameState === 'GAME_OVER';
  const savedTimeText = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div className="fixed inset-0 z-30 bg-[#18221D]/62 flex items-center justify-center p-4 short:p-2.5 safe-inset-hud">
      <div className="flex flex-col md:flex-row short:flex-row items-center justify-center gap-4 sm:gap-6 short:gap-3.5 w-full max-w-[780px] short:max-w-[660px]">
        {/* Left Floating Circular Cat Medallion */}
        {isGameOver ? (
          <div className="rounded-full wood-modal-frame p-2.5 short:p-1.5 border-[3px] short:border-2 border-[#5E2F12] shadow-[inset_0_2px_0_rgba(255,235,205,0.45),0_6px_0_rgba(64,31,10,0.45)] shrink-0 w-36 h-36 sm:w-48 sm:h-48 short:w-28 short:h-28">
            <div className="w-full h-full rounded-full bg-[#EEF4FF] border-[2.5px] short:border-2 border-[#5E2F12] shadow-inner flex items-center justify-center overflow-hidden">
              <GhostCatSvg className="w-28 h-28 sm:w-36 sm:h-36 short:w-20 short:h-20 animate-float-ghost" />
            </div>
          </div>
        ) : (
          <CatPortraitMedallion
            breed={hud.breed}
            hat={hud.equippedHat}
            glasses={hud.equippedGlasses}
            scarf={hud.equippedScarf}
            lifeStage={hud.lifeStage}
            className="w-36 h-36 sm:w-48 sm:h-48 short:w-28 short:h-28"
          />
        )}

        {/* Right Wooden Plank Modal Panel */}
        <div className="relative flex-1 w-full max-w-[540px] short:max-w-[490px] mt-3 md:mt-0 short:mt-0">
          {/* Overlapping Top Cat Ears Header Plaque */}
          <div className="absolute -top-6 sm:-top-7 short:-top-4 left-1/2 -translate-x-1/2 z-20">
            <CatEarsHeaderPlaque
              title={
                isGameOver
                  ? `${hud.name} Berpulang`
                  : showSettings
                  ? 'Pengaturan'
                  : 'Menu Jeda'
              }
            />
          </div>

          <div className="wood-modal-frame rounded-3xl short:rounded-2xl p-2.5 sm:p-3 short:p-2 border-[3px] short:border-2 border-[#5E2F12] shadow-[inset_0_2px_0_rgba(255,235,205,0.45),0_8px_0_rgba(58,28,10,0.45)]">
            <div className="relative rounded-2xl short:rounded-xl bg-[#FFF6E3] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8] px-4 pb-4 pt-8 sm:px-6 sm:pb-5 sm:pt-9 short:px-3.5 short:pb-3 short:pt-6 max-h-[82dvh] short:max-h-[86dvh] overflow-y-auto">
              <OrnateCornerFlourishes className="short:w-3 short:h-3" />

              {showSettings && !isGameOver ? (
                <div className="space-y-3 short:space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs short:text-[11px] font-bold text-[#7A4928]">
                      Sesuaikan suara, laju lapar & notifikasi
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#5A2D12] py-1.5 px-2.5 rounded-lg bg-[#FFFDF8] border-2 border-[#7A4928]/40 hover:bg-[#FDECC8] cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali</span>
                    </button>
                  </div>

                  <div className="p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#8C582E]/35 space-y-2 short:space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm short:text-xs font-bold text-[#5A2D12]">Volume Suara</p>
                        <p className="text-xs short:text-[10px] text-[#7A4928]">
                          Atur persentase besar kecil suara game
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#FFF3D9] border border-[#8C582E]/35 text-xs font-extrabold text-[#5A2D12] tabular-nums">
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
                    <div className="flex items-center justify-between gap-2 p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#8C582E]/35">
                      <div className="min-w-0">
                        <p className="text-sm short:text-xs font-bold text-[#5A2D12]">Efek Suara (SFX)</p>
                        <p className="text-[11px] short:text-[10px] text-[#7A4928] leading-tight">
                          Meong, dengkuran &amp; mainan
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ sfxMuted: !settings.sfxMuted })}
                        className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold border-2 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                          settings.sfxMuted
                            ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#5B6B63]'
                            : 'bg-[#2D6A4F] border-[#1B4332] text-white'
                        }`}
                      >
                        {settings.sfxMuted ? 'Mati' : 'Aktif'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#8C582E]/35">
                      <div className="min-w-0">
                        <p className="text-sm short:text-xs font-bold text-[#5A2D12]">Musik Latar</p>
                        <p className="text-[11px] short:text-[10px] text-[#7A4928] leading-tight">
                          Musik menu &amp; dalam game
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateSettings({ musicMuted: !settings.musicMuted })}
                        className={`px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-bold border-2 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                          settings.musicMuted
                            ? 'bg-[#E5E3DC] border-[#BDB7AC] text-[#5B6B63]'
                            : 'bg-[#2D6A4F] border-[#1B4332] text-white'
                        }`}
                      >
                        {settings.musicMuted ? 'Mati' : 'Aktif'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#8C582E]/35">
                    <p className="text-sm short:text-xs font-bold text-[#5A2D12] mb-2 short:mb-1.5">
                      Laju Rasa Lapar
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['santai', 'normal'] as HungerSpeed[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => onUpdateSettings({ hungerSpeed: mode })}
                          className={`px-3 py-2 short:py-1.5 min-h-[38px] rounded-lg text-xs font-bold border-2 transition-colors cursor-pointer ${
                            settings.hungerSpeed === mode
                              ? 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722]'
                              : 'bg-[#FAF8F2] border-[#8C582E]/25 text-[#7A4928]'
                          }`}
                        >
                          {mode === 'santai' ? 'Santai (Sangat Lama)' : 'Normal (Lama)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 short:p-2 rounded-xl bg-[#FFFDF8] border-2 border-[#8C582E]/35">
                    <div>
                      <p className="text-sm short:text-xs font-bold text-[#5A2D12]">
                        Notifikasi Makan
                      </p>
                      <p className="text-xs short:text-[10px] text-[#7A4928]">
                        Ingatkan saat kenyang tinggal 20%
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={
                        notifPerm === 'granted' ||
                        notifPerm === 'denied' ||
                        notifPerm === 'unsupported'
                      }
                      onClick={handleRequestNotif}
                      className={`px-3.5 py-2 min-h-[38px] rounded-lg text-xs font-bold border-2 transition-colors whitespace-nowrap ${
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

                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="w-full px-5 py-2.5 short:py-2 min-h-[44px] short:min-h-[38px] rounded-xl bg-gradient-to-b from-[#458E53] to-[#2B6639] border-2 border-[#1E4627] shadow-[inset_0_2px_0_#78C785,0_3px_0_#1E4627] text-white font-display font-extrabold text-sm hover:brightness-105 transition-all cursor-pointer"
                  >
                    Selesai
                  </button>
                </div>
              ) : (
                <>
                  {isGameOver && (
                    <p className="text-center text-sm short:text-xs font-semibold text-[#6B4A35] mb-3 short:mb-2">
                      Arwah {hud.name} terbang tenang ke negeri awan karena sakitnya tidak sempat diobati.
                    </p>
                  )}

                  {/* Parchment Scroll Summary Banner */}
                  <div className="parchment-banner rounded-xl short:rounded-lg border-2 border-[#8C582E] px-3 py-3 sm:px-5 sm:py-3.5 short:px-2.5 short:py-2 mb-3 short:mb-2 grid grid-cols-3 divide-x divide-[#8C582E]/30 text-center">
                    <div className="px-1">
                      <p className="text-xs short:text-[10px] font-bold text-[#6E4423]">
                        Lama Merawat
                      </p>
                      <p className="font-display font-black text-lg sm:text-xl short:text-sm text-[#4A2510] tabular-nums mt-0.5">
                        {hud.day} Hari · {LIFE_STAGES[hud.lifeStage].shortLabel}
                      </p>
                    </div>
                    <div className="px-1">
                      <p className="text-xs short:text-[10px] font-bold text-[#6E4423] inline-flex items-center justify-center gap-1">
                        <ShopShirtTabIcon className="w-4 h-4 short:w-3 short:h-3 shrink-0" />
                        <span>Ikatan</span>
                      </p>
                      <p className="font-display font-black text-lg sm:text-xl short:text-sm text-[#4A2510] tabular-nums mt-0.5">
                        Lv. {hud.level}
                      </p>
                    </div>
                    <div className="px-1">
                      <p className="text-xs short:text-[10px] font-bold text-[#6E4423]">
                        Tangkapan Bola
                      </p>
                      <p className="font-display font-black text-lg sm:text-xl short:text-sm text-[#4A2510] tabular-nums mt-0.5">
                        {hud.totalCatches}x
                      </p>
                    </div>
                  </div>

                  {!isGameOver && (
                    <div className="mb-3 short:mb-2 px-3 py-2 short:py-1 rounded-xl bg-[#ECFDF5] border-2 border-[#2D6A4F]/40 flex items-center justify-between gap-2 text-xs short:text-[10.5px] font-bold text-[#166534]">
                      <span className="inline-flex items-center gap-1.5">
                        {autoSaveStatus === 'saving' ? (
                          <Loader2 className="w-4 h-4 short:w-3.5 short:h-3.5 animate-spin text-[#15803D]" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 short:w-3.5 short:h-3.5 text-[#16A34A]" />
                        )}
                        <span>
                          {autoSaveStatus === 'saving'
                            ? 'Menyimpan progres otomatis...'
                            : 'Auto-Save Aktif · Tersimpan otomatis'}
                        </span>
                      </span>
                      {savedTimeText && (
                        <span className="tabular-nums text-[11px] short:text-[9.5px] text-[#15803D]/80">
                          {savedTimeText}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons (Auto-Save replaces Manual Save) */}
                  {!isGameOver ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 short:grid-cols-2 gap-3 short:gap-2">
                      <button
                        type="button"
                        onClick={onResume}
                        className="sm:col-span-2 short:col-span-2 w-full px-4 py-3 short:px-3 short:py-2 min-h-[52px] short:min-h-[42px] rounded-xl bg-gradient-to-b from-[#458E53] to-[#2B6639] border-[2.5px] short:border-2 border-[#1E4627] shadow-[inset_0_2px_0_#78C785,0_4px_0_#1E4627] short:shadow-[inset_0_1px_0_#78C785,0_2.5px_0_#1E4627] text-white font-display font-extrabold text-base short:text-sm hover:brightness-105 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-5 h-5 short:w-4 short:h-4 fill-white shrink-0" />
                        <span>Lanjutkan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSettings(true)}
                        className="w-full px-4 py-3 short:px-3 short:py-2 min-h-[52px] short:min-h-[42px] rounded-xl bg-gradient-to-b from-[#F2D59B] to-[#D4A762] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFF3D9,0_4px_0_#6E3B1B] short:shadow-[inset_0_1px_0_#FFF3D9,0_2.5px_0_#6E3B1B] text-[#5A2D12] font-display font-extrabold text-base short:text-sm hover:brightness-105 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-5 h-5 short:w-4 short:h-4 text-[#6E3B1B] shrink-0" />
                        <span>Pengaturan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowSettings(false);
                          onReturnToTitle();
                        }}
                        className="w-full px-4 py-3 short:px-3 short:py-2 min-h-[52px] short:min-h-[42px] rounded-xl bg-gradient-to-b from-[#F47B6A] to-[#D64B3B] border-[2.5px] short:border-2 border-[#6E241C] shadow-[inset_0_2px_0_#FCA5A5,0_4px_0_#6E241C] short:shadow-[inset_0_1px_0_#FCA5A5,0_2.5px_0_#6E241C] text-white font-display font-extrabold text-base short:text-sm hover:brightness-105 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-5 h-5 short:w-4 short:h-4 shrink-0" />
                        <span>Keluar Game</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 short:grid-cols-2 gap-3 short:gap-2">
                      <button
                        type="button"
                        onClick={onRestartSameCat}
                        className="w-full px-4 py-3 short:px-3 short:py-2 min-h-[52px] short:min-h-[42px] rounded-xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FDE68A,0_4px_0_#6E3B1B] text-white font-display font-extrabold text-base short:text-sm hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        Main Lagi
                      </button>
                      <button
                        type="button"
                        onClick={onReturnToTitle}
                        className="w-full px-4 py-3 short:px-3 short:py-2 min-h-[52px] short:min-h-[42px] rounded-xl bg-gradient-to-b from-[#FDF0C6] to-[#E6C77E] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF5,0_4px_0_#6E3B1B] text-[#5A2D12] font-display font-extrabold text-base short:text-sm hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        Menu Utama
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
