import React, { useEffect, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { LANGUAGE_OPTIONS, getLanguageMeta, getTranslations } from '../i18n/translations';
import { AppLanguage } from '../types/game';

interface LanguageMenuButtonProps {
  language: AppLanguage;
  onSelectLanguage: (language: AppLanguage) => void;
  variant: 'title' | 'hud';
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export const LanguageMenuButton: React.FC<LanguageMenuButtonProps> = ({
  language,
  onSelectLanguage,
  variant,
  className = '',
  onOpenChange,
}) => {
  const [open, setOpen] = useState(false);
  const t = getTranslations(language);
  const activeMeta = getLanguageMeta(language);

  const setMenuOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open]);

  const isTitle = variant === 'title';

  return (
    <div className={`relative ${className}`}>
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <div
          role="menu"
          aria-label={t.languageTitle}
          className="absolute right-0 bottom-full mb-2 z-40 w-48 sm:w-52 rounded-2xl bg-[#FFF6E3] border-[2.5px] border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8,0_6px_0_#5E2F12,0_14px_24px_rgba(0,0,0,0.35)] p-2 space-y-1"
        >
          <div className="px-2 py-1 border-b border-[#6E3B1B]/20 flex items-center justify-between">
            <span className="font-display font-extrabold text-xs text-[#5A2D12]">
              {t.languageTitle}
            </span>
            <span className="text-[10px] font-bold text-[#7A4928]">{activeMeta.shortCode}</span>
          </div>

          <div className="space-y-1">
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = opt.id === language;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    onSelectLanguage(opt.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 min-h-[38px] short:min-h-[32px] rounded-xl border-2 text-left text-xs font-display font-extrabold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E9F2EC] border-[#2D6A4F] text-[#1C2722] shadow-[0_2px_0_#2D6A4F]'
                      : 'bg-[#FFFDF8] border-[#C79C69]/55 text-[#5A2D12] hover:bg-[#FFF3D9]'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span className="text-sm leading-none shrink-0" aria-hidden="true">
                      {opt.flag}
                    </span>
                    <span className="truncate">{opt.name}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        data-ui-id={isTitle ? 'title-language-btn' : 'hud-language-btn'}
        data-ui-label={t.languageTitle}
        onClick={() => setMenuOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.languageTitle}: ${activeMeta.name}`}
        title={`${t.languageTitle}: ${activeMeta.name}`}
        className={`flex flex-col items-center gap-1 short:gap-0.5 group cursor-pointer bg-transparent border-0 p-0 ${
          isTitle ? 'min-w-[44px] min-h-[44px]' : 'min-w-[42px] min-h-[42px]'
        }`}
      >
        <span
          className={`relative rounded-xl short:rounded-lg bg-[#FFF6E5] border-[3px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFFFF,0_3px_0_#6E3B1B] flex flex-col items-center justify-center group-hover:scale-105 group-active:scale-95 transition-transform ${
            isTitle
              ? 'w-12 h-12 short:w-9 short:h-9'
              : 'w-11 h-11 sm:w-12 sm:h-12 short:w-9 short:h-9'
          } ${open ? 'ring-2 ring-[#FBBF24]' : ''}`}
        >
          <Globe
            className={`text-[#5E2F12] ${
              isTitle ? 'w-5 h-5 short:w-4 short:h-4' : 'w-4 h-4 sm:w-5 sm:h-5 short:w-4 short:h-4'
            }`}
          />
          <span className="text-[9px] short:text-[8px] font-display font-black leading-none text-[#7A4928] mt-0.5">
            {activeMeta.shortCode}
          </span>
        </span>
        <span
          className={`font-display font-black text-[#FFFDF7] menu-text-outline leading-none ${
            isTitle ? 'text-xs short:text-[10px]' : 'text-[10px] sm:text-[11px] short:text-[9px]'
          }`}
        >
          {t.languageTitle}
        </span>
      </button>
    </div>
  );
};
