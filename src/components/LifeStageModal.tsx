import React from 'react';
import { Sparkles, X } from 'lucide-react';
import {
  ADULT_BRANCHES,
  AdultEvolutionBranch,
  CatHudSnapshot,
  LIFE_STAGES,
  LifeStage,
} from '../types/game';
import { OrnateCornerFlourishes } from './CuteGameIcons';
import { CatEarsHeaderPlaque, CatPortraitMedallion } from './WoodPanelChrome';

interface LifeStageModalProps {
  open: boolean;
  hud: CatHudSnapshot;
  onClose: () => void;
}

const STAGE_ORDER: LifeStage[] = ['baby', 'child', 'teen', 'adult', 'senior'];

export const LifeStageModal: React.FC<LifeStageModalProps> = ({ open, hud, onClose }) => {
  if (!open) return null;

  const currentIdx = STAGE_ORDER.indexOf(hud.lifeStage);
  const currentMeta = LIFE_STAGES[hud.lifeStage];
  const pct =
    hud.stageDurationSec > 0
      ? Math.min(100, Math.round((hud.stageElapsedSec / hud.stageDurationSec) * 100))
      : 100;

  const formatRemaining = (): string => {
    const remainSec = Math.max(0, hud.stageDurationSec - hud.stageElapsedSec);
    if (hud.lifeStage === 'baby') {
      const mins = Math.ceil(remainSec / 60);
      return `Sisa ${mins}m · Jam ${Math.floor(hud.gameHours)}/73`;
    }
    const totalHours = Math.ceil(remainSec / 3600);
    if (totalHours >= 48) {
      const days = Math.floor(totalHours / 24);
      const hrs = totalHours % 24;
      return `Sisa ${days}h ${hrs}j`;
    }
    return `Sisa ${totalHours}j`;
  };

  return (
    <div
      className="fixed inset-0 z-30 bg-[#18221D]/60 flex items-center justify-center p-3 sm:p-5 short:p-2 safe-inset-hud"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[740px] short:max-w-[650px] mt-4 short:mt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-6 sm:-top-7 short:-top-4 left-1/2 -translate-x-1/2 z-20">
          <CatEarsHeaderPlaque title="Tahap Pertumbuhan" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 short:-top-2 short:-right-2 z-30 w-10 h-10 short:w-8 short:h-8 rounded-full bg-gradient-to-b from-[#F47B6A] to-[#D64B3B] border-[2.5px] border-[#5E2F12] shadow-[0_3px_0_#5E2F12] text-white flex items-center justify-center hover:brightness-105 active:translate-y-0.5 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5 short:w-4 short:h-4 stroke-[3]" />
        </button>

        <div className="wood-modal-frame rounded-3xl short:rounded-2xl p-2.5 short:p-2 border-[3px] short:border-2 border-[#5E2F12] shadow-[inset_0_2px_0_rgba(255,235,205,0.45),0_8px_0_rgba(58,28,10,0.45)]">
          <div className="relative rounded-2xl short:rounded-xl bg-[#FFF6E3] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8] px-4 pb-4 pt-8 sm:px-5 sm:pb-5 sm:pt-9 short:px-3.5 short:pb-3 short:pt-6 max-h-[84dvh] short:max-h-[88dvh] overflow-y-auto">
            <OrnateCornerFlourishes className="short:w-3 short:h-3" />

            {/* Current Stage Summary */}
            <div className="parchment-banner rounded-xl border-2 border-[#8C582E] p-3 short:p-2 mb-3.5 short:mb-2 flex flex-col sm:flex-row short:flex-row items-center justify-between gap-3 short:gap-2">
              <div className="flex items-center gap-3 short:gap-2 min-w-0">
                <CatPortraitMedallion
                  breed={hud.breed}
                  hat={hud.equippedHat}
                  glasses={hud.equippedGlasses}
                  scarf={hud.equippedScarf}
                  lifeStage={hud.lifeStage}
                  className="w-16 h-16 short:w-12 short:h-12"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-black text-base short:text-sm text-[#4A2510]">
                      {hud.name} · Fase {currentMeta.label}
                    </span>
                    {hud.lifeStage === 'adult' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] border border-[#D97706] text-[11px] short:text-[9.5px] font-extrabold text-[#92400E]">
                        {ADULT_BRANCHES[hud.adultBranch].label}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] short:text-[10px] font-bold text-[#8C4A1F] mt-0.5">
                    {currentMeta.calendarLabel} · Durasi {currentMeta.realDurationLabel}
                  </p>
                  <p className="text-xs short:text-[10.5px] font-semibold text-[#6E4423] mt-0.5">
                    {currentMeta.decayNote}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-56 short:w-48 shrink-0">
                <div className="flex items-center justify-between text-[11px] short:text-[10px] font-extrabold text-[#5A2D12] mb-1">
                  <span>
                    {hud.lifeStage === 'senior'
                      ? 'Usia Senior (H.12–18)'
                      : 'Menuju Fase Berikutnya'}
                  </span>
                  <span className="tabular-nums">{pct}%</span>
                </div>
                <div className="w-full h-3 short:h-2.5 rounded-full bg-[#EFE2C8] border-2 border-[#7A4928] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F59E0B] to-[#22C55E] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] short:text-[9.5px] font-bold text-[#7A4928] mt-1 flex items-center justify-between gap-2">
                  <span className="tabular-nums">{formatRemaining()}</span>
                  <span className="font-black text-[#4A2510] tabular-nums">
                    Mistake: {hud.careMistakes}x
                  </span>
                </p>
              </div>
            </div>

            {/* 5 Life Stages Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-5 short:grid-cols-5 gap-2.5 short:gap-1.5 mb-3.5 short:mb-2">
              {STAGE_ORDER.map((stageKey, idx) => {
                const meta = LIFE_STAGES[stageKey];
                const isCurrent = hud.lifeStage === stageKey;
                const isUnlocked = idx <= currentIdx;
                return (
                  <div
                    key={stageKey}
                    className={`rounded-xl border-2 p-2 short:p-1.5 flex flex-col items-center text-center transition-all ${
                      isCurrent
                        ? 'bg-[#FFFDF8] border-[#2D6A4F] ring-2 ring-[#6EE7B7] shadow-[0_3px_0_#2D6A4F]'
                        : isUnlocked
                        ? 'bg-[#FFFDF8] border-[#8C582E]/50'
                        : 'bg-[#F5E9CE]/70 border-[#8C582E]/25 opacity-75'
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 short:w-12 short:h-12 rounded-xl overflow-hidden border-2 border-[#7A4928]/40 bg-[#FFF7E2] flex items-center justify-center mb-1.5 short:mb-1 shrink-0">
                      {stageKey === 'baby' || stageKey === 'child' || !meta.imgSrc ? (
                        <CatPortraitMedallion
                          breed={hud.breed}
                          hat={hud.equippedHat}
                          glasses={hud.equippedGlasses}
                          scarf={hud.equippedScarf}
                          lifeStage={
                            stageKey === 'baby'
                              ? 'baby'
                              : stageKey === 'child'
                              ? 'child'
                              : 'adult'
                          }
                          className="w-full h-full !p-0.5 !border-0 !shadow-none"
                        />
                      ) : (
                        <img
                          src={meta.imgSrc}
                          alt={meta.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      )}
                    </div>
                    <span className="font-display font-extrabold text-xs short:text-[10.5px] text-[#4A2510] leading-tight">
                      {meta.shortLabel}
                    </span>
                    <span className="text-[10px] short:text-[8.5px] font-bold text-[#7A4928] leading-tight mt-0.5">
                      {meta.realDurationLabel}
                    </span>
                    <span className="text-[9.5px] short:text-[8px] text-[#8C582E] leading-tight">
                      {meta.calendarLabel}
                    </span>
                    {isCurrent && (
                      <span className="mt-1 px-1.5 py-0.5 rounded-full bg-[#2D6A4F] text-white text-[9px] font-extrabold">
                        Sekarang
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Adult Evolution Branching Guide */}
            <div className="rounded-xl bg-[#FFFDF8] border-2 border-[#8C582E]/35 p-2.5 short:p-2">
              <p className="font-display font-extrabold text-xs short:text-[11px] text-[#5A2D12] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Percabangan Evolusi Dewasa (berdasarkan Care Mistakes di fase Anak & Remaja)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 short:grid-cols-3 gap-2 short:gap-1.5">
                {(['prima', 'mandiri', 'sensitif'] as AdultEvolutionBranch[]).map((bKey) => {
                  const b = ADULT_BRANCHES[bKey];
                  const active = hud.lifeStage === 'adult' && hud.adultBranch === bKey;
                  return (
                    <div
                      key={bKey}
                      className={`rounded-lg border p-2 short:p-1.5 text-left ${
                        active
                          ? 'bg-[#ECFDF5] border-[#2D6A4F]'
                          : 'bg-[#FFF8EA] border-[#8C582E]/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-display font-extrabold text-[11px] short:text-[10px] text-[#4A2510]">
                          {b.label}
                        </span>
                        <span className="text-[10px] short:text-[9px] font-bold text-[#92400E] whitespace-nowrap">
                          {b.maxMistakesLabel}
                        </span>
                      </div>
                      <p className="text-[10.5px] short:text-[9px] text-[#6E4423] mt-0.5 leading-snug">
                        {b.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
