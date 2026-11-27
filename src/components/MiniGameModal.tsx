import React, { useEffect, useRef, useState } from 'react';
import { Fish, Sparkles, Trophy, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { OrnateCornerFlourishes } from './CuteGameIcons';
import { CatEarsHeaderPlaque } from './WoodPanelChrome';

interface MiniGameModalProps {
  open: boolean;
  catName: string;
  isRaining?: boolean;
  onClose: () => void;
  onComplete: (coinsEarned: number, happinessGain: number) => void;
}

interface PondTarget {
  id: number;
  xPct: number;
  yPct: number;
  kind: 'fish' | 'golden' | 'star';
  points: number;
}

const GAME_DURATION_SEC = 20;

export const MiniGameModal: React.FC<MiniGameModalProps> = ({
  open,
  catName,
  isRaining = false,
  onClose,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<PondTarget[]>([]);
  const [finished, setFinished] = useState(false);
  const nextIdRef = useRef(1);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    setTimeLeft(GAME_DURATION_SEC);
    setScore(0);
    scoreRef.current = 0;
    setFinished(false);
    setTargets([
      { id: 1, xPct: 26, yPct: 48, kind: 'fish', points: 2 },
      { id: 2, xPct: 68, yPct: 60, kind: 'golden', points: 4 },
    ]);
    nextIdRef.current = 3;

    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawnId = window.setInterval(() => {
      setTargets((prev) => {
        const kept = prev.slice(-3);
        const r = Math.random();
        const kind: PondTarget['kind'] = r < 0.22 ? 'golden' : r < 0.45 ? 'star' : 'fish';
        const points = kind === 'golden' ? 4 : kind === 'star' ? 3 : 2;
        return [
          ...kept,
          {
            id: nextIdRef.current++,
            xPct: 14 + Math.random() * 72,
            yPct: 18 + Math.random() * 64,
            kind,
            points,
          },
        ];
      });
    }, 780);

    return () => {
      window.clearInterval(timerId);
      window.clearInterval(spawnId);
    };
  }, [open]);

  if (!open) return null;

  const coinsReward = Math.min(24, Math.max(2, Math.round(score / 2)));
  const happyReward = isRaining ? 30 : 25;
  const cleanCostDisplay = isRaining ? 5 : 3;

  const handleCatch = (target: PondTarget) => {
    if (finished) return;
    soundEngine.unlock();
    soundEngine.playCatch();
    scoreRef.current += target.points;
    setScore(scoreRef.current);
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
  };

  const handleFinishClaim = () => {
    onComplete(coinsReward, 25);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 bg-[#18221D]/65 flex items-center justify-center p-3 sm:p-5 short:p-2 safe-inset-hud">
      <div className="relative w-full max-w-[560px] short:max-w-[520px] mt-4 short:mt-2">
        <div className="absolute -top-6 sm:-top-7 short:-top-4 left-1/2 -translate-x-1/2 z-20">
          <CatEarsHeaderPlaque title="Mini-Game Tangkap Ikan" />
        </div>

        <button
          type="button"
          onClick={finished ? handleFinishClaim : onClose}
          className="absolute -top-3 -right-3 short:-top-2 short:-right-2 z-30 w-10 h-10 short:w-8 short:h-8 rounded-full bg-gradient-to-b from-[#F47B6A] to-[#D64B3B] border-[2.5px] border-[#5E2F12] shadow-[0_3px_0_#5E2F12] text-white flex items-center justify-center hover:brightness-105 cursor-pointer"
          aria-label="Tutup Mini-Game"
        >
          <X className="w-5 h-5 short:w-4 short:h-4 stroke-[3]" />
        </button>

        <div className="wood-modal-frame rounded-3xl short:rounded-2xl p-2.5 short:p-2 border-[3px] short:border-2 border-[#5E2F12] shadow-[inset_0_2px_0_rgba(255,235,205,0.45),0_8px_0_rgba(58,28,10,0.45)]">
          <div className="relative rounded-2xl short:rounded-xl bg-[#FFF6E3] border-[2.5px] short:border-2 border-[#6E3B1B] shadow-[inset_0_2px_0_#FFFDF8] px-4 pb-4 pt-8 short:px-3.5 short:pb-3 short:pt-6">
            <OrnateCornerFlourishes className="short:w-3 short:h-3" />

            <div className="flex items-center justify-between gap-3 mb-2.5 short:mb-1.5 text-xs short:text-[11px] font-extrabold text-[#5A2D12]">
              <span>
                Bantu {catName} tangkap ikan di kolam!
                {isRaining && (
                  <span className="ml-1.5 text-[#0369A1]">(Hujan: +5 Bahagia · -2 Bersih)</span>
                )}
              </span>
              <div className="flex items-center gap-2.5 tabular-nums">
                <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-[#D97706]">
                  Skor: {score}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full border ${
                    timeLeft <= 5
                      ? 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B]'
                      : 'bg-[#E0F2FE] border-[#0284C7] text-[#075985]'
                  }`}
                >
                  {timeLeft}d
                </span>
              </div>
            </div>

            {!finished ? (
              <div
                className={`relative w-full h-52 sm:h-60 short:h-40 rounded-2xl border-2 border-[#1E4627]/40 overflow-hidden shadow-inner select-none ${
                  isRaining
                    ? 'bg-gradient-to-b from-[#64748B] via-[#475569] to-[#0284C7]'
                    : 'bg-gradient-to-b from-[#BAE6FD] via-[#7DD3FC] to-[#38BDF8]'
                }`}
              >
                {/* Subtle water ripples & rain effect */}
                <div className="pointer-events-none absolute inset-x-6 top-6 h-1 rounded-full bg-white/35" />
                <div className="pointer-events-none absolute inset-x-14 bottom-8 h-1 rounded-full bg-white/30" />
                {isRaining && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-35"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(108deg, rgba(224,242,254,0.55) 0px, rgba(224,242,254,0.55) 1.5px, transparent 1.5px, transparent 18px)',
                    }}
                  />
                )}

                {targets.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleCatch(t)}
                    style={{ left: `${t.xPct}%`, top: `${t.yPct}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-13 h-13 short:w-10 short:h-10 rounded-full border-2 flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-transform cursor-pointer ${
                      t.kind === 'golden'
                        ? 'bg-gradient-to-b from-[#FEF08A] to-[#F59E0B] border-[#92400E] text-[#78350F]'
                        : t.kind === 'star'
                        ? 'bg-gradient-to-b from-[#FBCFE8] to-[#F472B6] border-[#9D174D] text-white'
                        : 'bg-gradient-to-b from-[#FFFDF8] to-[#FED7AA] border-[#9A3412] text-[#EA580C]'
                    }`}
                  >
                    {t.kind === 'star' ? (
                      <Sparkles className="w-6 h-6 short:w-5 short:h-5" />
                    ) : (
                      <Fish className="w-6 h-6 short:w-5 short:h-5" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="parchment-banner rounded-2xl border-2 border-[#8C582E] p-4 short:p-3 text-center space-y-3 short:space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 short:w-10 short:h-10 rounded-full bg-[#FEF3C7] border-2 border-[#D97706] text-[#B45309]">
                  <Trophy className="w-6 h-6 short:w-5 short:h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg short:text-base text-[#4A2510]">
                    Selesai! Skor {score} Poin
                  </h3>
                  <p className="text-xs short:text-[11px] font-bold text-[#6E4423] mt-0.5">
                    Hadiah: +{coinsReward} Koin · +{happyReward} Bahagia{isRaining ? ' (Hujan +5)' : ''} · -10 Energi · -5 Kenyang · -{cleanCostDisplay} Bersih · +12 XP Ikatan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinishClaim}
                  className="w-full px-5 py-2.5 short:py-2 min-h-[44px] short:min-h-[38px] rounded-xl bg-gradient-to-b from-[#458E53] to-[#2B6639] border-2 border-[#1E4627] shadow-[inset_0_2px_0_#78C785,0_3px_0_#1E4627] text-white font-display font-extrabold text-sm hover:brightness-105 cursor-pointer"
                >
                  Ambil Hadiah
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
