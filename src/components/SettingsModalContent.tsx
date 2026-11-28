import React, { useEffect, useState } from 'react';
import { ArrowLeft, Globe, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { LANGUAGE_OPTIONS, getTranslations } from '../i18n/translations';
import { GameSettings } from '../types/game';
import {
  CareNotificationPermission,
  getCareNotificationPermission,
  requestCareNotificationPermission,
} from '../utils/catCareSystem';
import {
  isFullscreenActive,
  isFullscreenSupported,
  toggleImmersiveFullscreen,
} from '../utils/fullscreen';

interface SettingsModalContentProps {
  settings: GameSettings;
  onUpdateSettings: (next: Partial<GameSettings>) => void;
  onClose: () => void;
  onClearSave?: () => void;
  hasExistingSave?: boolean;
}

const CozySpeakerIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M4 9.5h4l5-4.2v13.4l-5-4.2H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
      fill="#E9A552"
      stroke="#5E2F12"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M16.2 8.8a4.5 4.5 0 0 1 0 6.4M18.8 6.4a7.8 7.8 0 0 1 0 11.2"
      fill="none"
      stroke="#5E2F12"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CozyMusicNotesIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M9 17.5V6.5l10-2v10.5"
      fill="none"
      stroke="#5E2F12"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 9.5l10-2" stroke="#5E2F12" strokeWidth="2" strokeLinecap="round" />
    <circle cx="6.8" cy="17.8" r="2.6" fill="#E9A552" stroke="#5E2F12" strokeWidth="1.8" />
    <circle cx="16.8" cy="15.6" r="2.6" fill="#E9A552" stroke="#5E2F12" strokeWidth="1.8" />
  </svg>
);

const CozyBowlIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M7.5 11c.5-2 2.2-3 4.5-3s4 1 4.5 3"
      fill="#D48C46"
      stroke="#5E2F12"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M4.5 11.5h15l1.3 5.5a1.5 1.5 0 0 1-1.46 1.85H4.66A1.5 1.5 0 0 1 3.2 17l1.3-5.5Z"
      fill="#F3C178"
      stroke="#5E2F12"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M6.5 14.5h11" stroke="#8C582E" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const PawSliderThumbIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <ellipse cx="16" cy="20.5" rx="7.5" ry="6" fill="#FFF7E2" stroke="#5E2F12" strokeWidth="2.2" />
    <ellipse cx="7.5" cy="13.5" rx="2.7" ry="3.3" transform="rotate(-18 7.5 13.5)" fill="#FFF7E2" stroke="#5E2F12" strokeWidth="2" />
    <ellipse cx="13" cy="9.5" rx="2.7" ry="3.4" transform="rotate(-6 13 9.5)" fill="#FFF7E2" stroke="#5E2F12" strokeWidth="2" />
    <ellipse cx="19" cy="9.5" rx="2.7" ry="3.4" transform="rotate(6 19 9.5)" fill="#FFF7E2" stroke="#5E2F12" strokeWidth="2" />
    <ellipse cx="24.5" cy="13.5" rx="2.7" ry="3.3" transform="rotate(18 24.5 13.5)" fill="#FFF7E2" stroke="#5E2F12" strokeWidth="2" />
    <ellipse cx="16" cy="20.5" rx="4.2" ry="3.2" fill="#B57B4C" />
    <circle cx="8" cy="13.7" r="1.1" fill="#B57B4C" />
    <circle cx="13" cy="9.8" r="1.1" fill="#B57B4C" />
    <circle cx="19" cy="9.8" r="1.1" fill="#B57B4C" />
    <circle cx="24" cy="13.7" r="1.1" fill="#B57B4C" />
  </svg>
);

export const SettingsModalContent: React.FC<SettingsModalContentProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onClearSave,
  hasExistingSave = false,
}) => {
  const [notifPerm, setNotifPerm] = useState<CareNotificationPermission>(() =>
    getCareNotificationPermission()
  );
  const [fullscreenOn, setFullscreenOn] = useState<boolean>(() => isFullscreenActive());
  const fullscreenAvailable = isFullscreenSupported();
  const t = getTranslations(settings.language);

  useEffect(() => {
    const syncFullscreen = () => setFullscreenOn(isFullscreenActive());
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    window.addEventListener('resize', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
      window.removeEventListener('resize', syncFullscreen);
    };
  }, []);

  const handleRequestNotif = async () => {
    const res = await requestCareNotificationPermission();
    setNotifPerm(res);
  };

  const handleToggleFullscreen = async () => {
    const next = await toggleImmersiveFullscreen();
    setFullscreenOn(next);
  };

  return (
    <div className="space-y-3 short:space-y-2">
      {/* Top Subtitle + Back Button */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-[13px] short:text-[11px] font-bold text-[#7A4928]">
          {t.settings.subtitle}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-display font-extrabold text-[#5A2D12] py-1.5 px-3 min-h-[36px] short:min-h-[32px] rounded-xl bg-gradient-to-b from-[#F8E7BE] to-[#DFBC7B] border-2 border-[#6E3B1B] shadow-[inset_0_1.5px_0_#FFFBF0,0_2.5px_0_#6E3B1B] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t.common.back}</span>
        </button>
      </div>

      {/* Bahasa / Language Selector Card */}
      <div className="p-3.5 sm:p-4 short:p-2.5 rounded-2xl short:rounded-xl bg-[#FFFDF4] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_2px_0_rgba(110,59,27,0.12)] space-y-2 short:space-y-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#5E2F12] shrink-0" />
            <p className="font-display text-sm sm:text-base short:text-xs font-extrabold text-[#4E270F]">
              {t.settings.languageLabel}
            </p>
          </div>
          <p className="text-xs short:text-[10px] font-medium text-[#7A4928] mt-0.5">
            {t.settings.languageDesc}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 short:grid-cols-5 gap-1.5">
          {LANGUAGE_OPTIONS.map((opt) => {
            const active = settings.language === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateSettings({ language: opt.id })}
                aria-pressed={active}
                className={`px-2 py-1.5 min-h-[36px] short:min-h-[30px] rounded-xl border-2 text-[11px] sm:text-xs short:text-[10.5px] font-display font-extrabold inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-b from-[#458E53] to-[#276135] border-[#1A4223] shadow-[inset_0_1.5px_0_#7CD18A,0_2.5px_0_#1A4223] text-white'
                    : 'bg-[#FFF8EA] border-[#C79C69] text-[#5A2D12] hover:bg-[#FCEEC8]'
                }`}
              >
                <span className="leading-none shrink-0" aria-hidden="true">
                  {opt.flag}
                </span>
                <span className="truncate">{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Volume Suara Card */}
      <div className="p-3.5 sm:p-4 short:p-2.5 rounded-2xl short:rounded-xl bg-[#FFFDF4] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_2px_0_rgba(110,59,27,0.12)] space-y-2.5 short:space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CozySpeakerIcon className="w-5 h-5 short:w-4 short:h-4 shrink-0" />
              <p className="font-display text-sm sm:text-base short:text-xs font-extrabold text-[#4E270F]">
                {t.settings.volumeTitle}
              </p>
            </div>
            <p className="text-xs short:text-[10px] font-medium text-[#7A4928] mt-0.5">
              {t.settings.volumeDesc}
            </p>
          </div>
          <span className="px-3 py-1 short:px-2.5 short:py-0.5 rounded-xl bg-gradient-to-b from-[#FFE684] to-[#F2B83C] border-2 border-[#6E3B1B] shadow-[inset_0_1.5px_0_#FFF8CC,0_2px_0_#6E3B1B] text-xs sm:text-sm font-display font-black text-[#4E270F] tabular-nums shrink-0">
            {settings.volume}%
          </span>
        </div>

        {/* Custom Forest Green Track + Paw Print Handle */}
        <div className="relative h-8 short:h-6 flex items-center select-none">
          <div className="w-full h-3 short:h-2.5 rounded-full bg-[#E6D9BE] border border-[#6E3B1B]/30 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-b from-[#3B8258] to-[#265E3D] transition-[width] duration-75"
              style={{ width: `${settings.volume}%` }}
            />
          </div>
          <div
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-75 drop-shadow-[0_2px_2px_rgba(78,39,15,0.3)]"
            style={{
              left: `clamp(14px, ${settings.volume}%, calc(100% - 14px))`,
            }}
          >
            <PawSliderThumbIcon className="w-7 h-7 short:w-5 short:h-5" />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
            aria-label={t.settings.volumeAria}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Efek Suara (SFX) & Musik Latar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 short:grid-cols-2 gap-2.5 short:gap-2">
        <div className="flex items-center justify-between gap-2.5 p-3 short:p-2 rounded-2xl short:rounded-xl bg-[#FFFDF4] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_2px_0_rgba(110,59,27,0.12)]">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CozySpeakerIcon className="w-4 h-4 shrink-0" />
              <p className="font-display text-sm short:text-xs font-extrabold text-[#4E270F] truncate">
                {t.settings.sfxTitle}
              </p>
            </div>
            <p className="text-[11px] short:text-[10px] font-medium text-[#7A4928] leading-tight mt-0.5">
              {t.settings.sfxDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ sfxMuted: !settings.sfxMuted })}
            className={`px-3.5 py-1.5 min-h-[38px] short:min-h-[32px] rounded-xl text-xs font-display font-extrabold border-2 transition-all whitespace-nowrap cursor-pointer shrink-0 active:translate-y-0.5 ${
              settings.sfxMuted
                ? 'bg-gradient-to-b from-[#E5E3DC] to-[#C2C0B8] border-[#78756E] shadow-[inset_0_1.5px_0_#F8F7F4,0_2.5px_0_#78756E] text-[#57544D]'
                : 'bg-gradient-to-b from-[#458E53] to-[#276135] border-[#1A4223] shadow-[inset_0_1.5px_0_#7CD18A,0_2.5px_0_#1A4223] text-white hover:brightness-105'
            }`}
          >
            {settings.sfxMuted ? t.common.off : t.common.active}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2.5 p-3 short:p-2 rounded-2xl short:rounded-xl bg-[#FFFDF4] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_2px_0_rgba(110,59,27,0.12)]">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CozyMusicNotesIcon className="w-4 h-4 shrink-0" />
              <p className="font-display text-sm short:text-xs font-extrabold text-[#4E270F] truncate">
                {t.settings.musicTitle}
              </p>
            </div>
            <p className="text-[11px] short:text-[10px] font-medium text-[#7A4928] leading-tight mt-0.5">
              {t.settings.musicDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ musicMuted: !settings.musicMuted })}
            className={`px-3.5 py-1.5 min-h-[38px] short:min-h-[32px] rounded-xl text-xs font-display font-extrabold border-2 transition-all whitespace-nowrap cursor-pointer shrink-0 active:translate-y-0.5 ${
              settings.musicMuted
                ? 'bg-gradient-to-b from-[#E5E3DC] to-[#C2C0B8] border-[#78756E] shadow-[inset_0_1.5px_0_#F8F7F4,0_2.5px_0_#78756E] text-[#57544D]'
                : 'bg-gradient-to-b from-[#458E53] to-[#276135] border-[#1A4223] shadow-[inset_0_1.5px_0_#7CD18A,0_2.5px_0_#1A4223] text-white hover:brightness-105'
            }`}
          >
            {settings.musicMuted ? t.common.off : t.common.active}
          </button>
        </div>
      </div>

      {/* Notifikasi Makan Card */}
      <div className="flex items-center justify-between gap-3 p-3.5 short:p-2.5 rounded-2xl short:rounded-xl bg-[#FFFDF4] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_2px_0_rgba(110,59,27,0.12)]">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <CozyBowlIcon className="w-4 h-4 shrink-0" />
            <p className="font-display text-sm short:text-xs font-extrabold text-[#4E270F]">
              {t.settings.notifTitle}
            </p>
          </div>
          <p className="text-xs short:text-[10px] font-medium text-[#7A4928] mt-0.5">
            {t.settings.notifDesc}
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
          className={`px-4 py-2 min-h-[38px] short:min-h-[32px] rounded-xl text-xs font-display font-extrabold border-2 transition-all whitespace-nowrap shrink-0 ${
            notifPerm === 'granted'
              ? 'bg-gradient-to-b from-[#458E53] to-[#276135] border-[#1A4223] shadow-[inset_0_1.5px_0_#7CD18A,0_2.5px_0_#1A4223] text-white cursor-default'
              : notifPerm === 'denied' || notifPerm === 'unsupported'
              ? 'bg-gradient-to-b from-[#DCDAD5] to-[#B7B5AF] border-[#78756E] shadow-[inset_0_1.5px_0_#F3F2EE,0_2.5px_0_#78756E] text-[#69665F] cursor-not-allowed'
              : 'bg-gradient-to-b from-[#FFE684] to-[#F2B83C] border-[#6E3B1B] shadow-[inset_0_1.5px_0_#FFF8CC,0_2.5px_0_#6E3B1B] text-[#4E270F] hover:brightness-105 cursor-pointer active:translate-y-0.5'
          }`}
        >
          {notifPerm === 'granted'
            ? t.common.enabled
            : notifPerm === 'denied'
            ? t.common.blocked
            : notifPerm === 'unsupported'
            ? t.common.unsupported
            : t.common.allow}
        </button>
      </div>

      {/* Layar Penuh (Fullscreen) Card */}
      <div className="flex items-center justify-between gap-3 p-3.5 short:p-2.5 rounded-2xl short:rounded-xl bg-[#FFFDF4] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_2px_0_rgba(110,59,27,0.12)]">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {fullscreenOn ? (
              <Minimize2 className="w-4 h-4 text-[#5E2F12] shrink-0" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[#5E2F12] shrink-0" />
            )}
            <p className="font-display text-sm short:text-xs font-extrabold text-[#4E270F]">
              {t.settings.fullscreenTitle}
            </p>
          </div>
          <p className="text-xs short:text-[10px] font-medium text-[#7A4928] mt-0.5">
            {t.settings.fullscreenDesc}
          </p>
        </div>
        <button
          type="button"
          disabled={!fullscreenAvailable}
          onClick={handleToggleFullscreen}
          className={`px-4 py-2 min-h-[38px] short:min-h-[32px] rounded-xl text-xs font-display font-extrabold border-2 transition-all whitespace-nowrap shrink-0 active:translate-y-0.5 ${
            !fullscreenAvailable
              ? 'bg-gradient-to-b from-[#DCDAD5] to-[#B7B5AF] border-[#78756E] shadow-[inset_0_1.5px_0_#F3F2EE,0_2.5px_0_#78756E] text-[#69665F] cursor-not-allowed'
              : fullscreenOn
              ? 'bg-gradient-to-b from-[#458E53] to-[#276135] border-[#1A4223] shadow-[inset_0_1.5px_0_#7CD18A,0_2.5px_0_#1A4223] text-white hover:brightness-105 cursor-pointer'
              : 'bg-gradient-to-b from-[#FFE684] to-[#F2B83C] border-[#6E3B1B] shadow-[inset_0_1.5px_0_#FFF8CC,0_2.5px_0_#6E3B1B] text-[#4E270F] hover:brightness-105 cursor-pointer'
          }`}
        >
          {!fullscreenAvailable
            ? t.common.unsupported
            : fullscreenOn
            ? t.common.enabled
            : t.common.enable}
        </button>
      </div>

      {/* Selesai CTA Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full px-5 py-3 short:py-2 min-h-[48px] short:min-h-[40px] rounded-2xl short:rounded-xl bg-gradient-to-b from-[#468E54] to-[#276135] border-[2.5px] border-[#1A4223] shadow-[inset_0_2px_0_#7AD088,0_4px_0_#1A4223] text-white font-display font-extrabold text-base short:text-sm hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
      >
        {t.common.done}
      </button>

      {/* Optional Clear Save button on Title Menu */}
      {hasExistingSave && onClearSave && (
        <button
          type="button"
          onClick={onClearSave}
          className="w-full px-4 py-2 min-h-[40px] rounded-xl bg-[#FFFDF8] border-2 border-[#DC2626]/40 text-[#B91C1C] text-xs font-bold hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.settings.clearSave}</span>
        </button>
      )}
    </div>
  );
};
