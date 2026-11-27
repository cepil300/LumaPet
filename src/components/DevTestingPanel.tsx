import React, { useState } from 'react';
import {
  Clock,
  CloudRain,
  Coins,
  FastForward,
  HeartPulse,
  Moon,
  RotateCcw,
  Save,
  Skull,
  Sparkles,
  Sun,
  Unlock,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  ADULT_BRANCHES,
  AdultEvolutionBranch,
  CAT_BREEDS,
  CatBreed,
  CatHudSnapshot,
  CatPersonality,
  DevQuickAction,
  DevStatePatch,
  DevTimeScale,
  LIFE_STAGES,
  LifeStage,
  ManualSleepMode,
} from '../types/game';
import { formatGameClock } from '../utils/catCareSystem';

type DevTab = 'status' | 'time_age' | 'economy';

interface DevTestingPanelProps {
  open: boolean;
  onToggleOpen: () => void;
  hud: CatHudSnapshot;
  devTimeScale: DevTimeScale;
  onChangeTimeScale: (scale: DevTimeScale) => void;
  onPatchState: (patch: DevStatePatch) => void;
  onQuickAction: (action: DevQuickAction) => void;
  onStartSleep: (mode: ManualSleepMode) => void;
  onSaveNow: () => void;
}

const STAT_QUICK_VALUES = [0, 19, 39, 50, 80, 100];
const LIFE_STAGE_ORDER: LifeStage[] = ['baby', 'child', 'teen', 'adult', 'senior'];
const TIME_SCALES: DevTimeScale[] = [1, 5, 20, 60];
const DAY_PRESETS = [0, 1, 2, 4, 12, 18];

export const DevTestingPanel: React.FC<DevTestingPanelProps> = ({
  open,
  onToggleOpen,
  hud,
  devTimeScale,
  onChangeTimeScale,
  onPatchState,
  onQuickAction,
  onStartSleep,
  onSaveNow,
}) => {
  const [tab, setTab] = useState<DevTab>('status');

  const stageProgressPct = Math.min(
    99.5,
    Math.round((hud.stageElapsedSec / Math.max(1, hud.stageDurationSec)) * 1000) / 10
  );

  const isSleeping = hud.behavior === 'SLEEPING' || hud.sleepMode !== 'none';

  return (
    <>
      {/* Temporary Developer Testing Toggle Button on the Left Side */}
      {!open && (
        <button
          type="button"
          onClick={onToggleOpen}
          title="Buka Panel Developer Testing (Sementara)"
          className="fixed left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center gap-1 px-2.5 py-2.5 rounded-xl bg-[#1E293B]/95 hover:bg-[#0F172A] text-[#FDE68A] border-2 border-[#F59E0B] shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Wrench className="w-4 h-4 text-[#FBBF24]" />
          <span className="text-[10px] font-extrabold tracking-wide leading-tight text-center">
            Dev
            <br />
            Test
          </span>
          {devTimeScale > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-[#F59E0B] text-[#0F172A] text-[9px] font-black tabular-nums">
              {devTimeScale}x
            </span>
          )}
        </button>
      )}

      {/* Left-Side Developer Testing Drawer */}
      {open && (
        <aside
          aria-label="Panel Developer Testing"
          className="fixed left-2 sm:left-3 top-16 sm:top-20 bottom-16 sm:bottom-20 w-[min(92vw,372px)] z-40 pointer-events-auto flex flex-col rounded-2xl bg-[#0F172A]/95 text-[#F8FAFC] border-2 border-[#F59E0B] shadow-[0_14px_38px_rgba(0,0,0,0.55)] backdrop-blur-md overflow-hidden"
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-[#1E293B] border-b border-slate-700 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <span className="font-display font-extrabold text-sm text-[#FDE68A] truncate">
                  Developer Testing
                </span>
                <span className="px-1.5 py-[1px] rounded bg-[#F59E0B]/20 border border-[#F59E0B]/50 text-[9px] font-bold text-[#FBBF24]">
                  SEMENTARA
                </span>
              </div>
              <p className="text-[10.5px] text-slate-300 font-semibold mt-0.5 tabular-nums truncate">
                Hari {hud.day} · {LIFE_STAGES[hud.lifeStage].shortLabel} ·{' '}
                {formatGameClock(hud.gameHour)} ·{' '}
                {hud.weather === 'hujan' ? 'Hujan' : 'Cerah'} · {devTimeScale}x
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleOpen}
              aria-label="Tutup Panel Developer Testing"
              className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1.5 bg-[#162033] border-b border-slate-700/80 shrink-0">
            <button
              type="button"
              onClick={() => setTab('status')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                tab === 'status'
                  ? 'bg-[#F59E0B] text-[#0F172A]'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Status &amp; Tidur
            </button>
            <button
              type="button"
              onClick={() => setTab('time_age')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                tab === 'time_age'
                  ? 'bg-[#F59E0B] text-[#0F172A]'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Hari, Usia &amp; Cuaca
            </button>
            <button
              type="button"
              onClick={() => setTab('economy')}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                tab === 'economy'
                  ? 'bg-[#F59E0B] text-[#0F172A]'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Koin, Item &amp; Uji
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
            {tab === 'status' && (
              <>
                {/* Quick Presets */}
                <section className="space-y-1.5">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Preset Kondisi Cepat
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onPatchState({
                          hunger: 100,
                          happiness: 100,
                          cleanliness: 100,
                          energy: 100,
                          health: 100,
                          isSick: false,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Semua Penuh (100)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onPatchState({
                          hunger: 35,
                          happiness: 35,
                          cleanliness: 35,
                          energy: 35,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Rewel / Ngambek (35)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onPatchState({
                          hunger: 15,
                          happiness: 15,
                          cleanliness: 12,
                          energy: 15,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Kritis (&lt;20)
                    </button>
                    <button
                      type="button"
                      onClick={() => onPatchState({ energy: 43 })}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600/90 hover:bg-sky-500 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Energi 43 (Uji Ngantuk)
                    </button>
                  </div>
                </section>

                {/* Individual Stat Sliders */}
                {(
                  [
                    { key: 'hunger', label: 'Kenyang', value: hud.hunger, accent: 'accent-orange-400' },
                    { key: 'happiness', label: 'Bahagia', value: hud.happiness, accent: 'accent-pink-400' },
                    { key: 'cleanliness', label: 'Bersih', value: hud.cleanliness, accent: 'accent-sky-400' },
                    { key: 'energy', label: 'Energi', value: hud.energy, accent: 'accent-blue-500' },
                    { key: 'health', label: 'Kesehatan', value: hud.health, accent: 'accent-emerald-400' },
                  ] as const
                ).map((stat) => (
                  <section
                    key={stat.key}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-100">{stat.label}</span>
                      <span className="font-mono font-bold text-[#FDE68A] tabular-nums">
                        {stat.value} / 100
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stat.value}
                      onChange={(e) =>
                        onPatchState({ [stat.key]: Number(e.target.value) })
                      }
                      className={`w-full cursor-pointer ${stat.accent}`}
                    />
                    <div className="grid grid-cols-6 gap-1">
                      {STAT_QUICK_VALUES.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => onPatchState({ [stat.key]: val })}
                          className={`py-1 rounded text-[10px] font-bold tabular-nums cursor-pointer ${
                            stat.value === val
                              ? 'bg-[#F59E0B] text-[#0F172A]'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}

                {/* Sickness & Sleep Controls */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                      Status Sakit
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        hud.isSick
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {hud.isSick ? 'SAKIT' : 'SEHAT'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onQuickAction('heal_instant')}
                      className="py-1.5 px-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[10.5px] cursor-pointer"
                    >
                      Sehat 100
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onPatchState({ isSick: true, sickReason: 'health' })
                      }
                      className="py-1.5 px-2 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-[10.5px] cursor-pointer"
                    >
                      Buat Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onPatchState({ bowlAmount: hud.bowlAmount > 0 ? 0 : 1 })
                      }
                      className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-[10.5px] cursor-pointer"
                    >
                      {hud.bowlAmount > 0 ? 'Kosong Mangkuk' : 'Isi Mangkuk'}
                    </button>
                  </div>
                </section>

                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-sky-400" />
                      Kontrol Tidur
                    </span>
                    <span className="text-[10px] font-bold text-sky-300">
                      {isSleeping ? `Tidur (${hud.sleepMode})` : hud.drowsyStage}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onStartSleep('power_nap')}
                      className="py-1.5 px-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white font-bold text-[10.5px] cursor-pointer"
                    >
                      Power Nap
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartSleep('full_rest')}
                      className="py-1.5 px-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-[10.5px] cursor-pointer"
                    >
                      Tidur Penuh
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('trigger_auto_sleep')}
                      className="py-1.5 px-2 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-[10.5px] cursor-pointer"
                    >
                      Picu Auto-Sleep
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('wake_up_free')}
                      className="py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold text-[10.5px] cursor-pointer"
                    >
                      Bangun Bebas
                    </button>
                  </div>
                </section>
              </>
            )}

            {tab === 'time_age' && (
              <>
                {/* Time Speed Multiplier */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                      <FastForward className="w-3.5 h-3.5 text-[#FBBF24]" />
                      Kecepatan Simulasi
                    </span>
                    <span className="font-mono font-bold text-[#FDE68A]">
                      {devTimeScale}x
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TIME_SCALES.map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => onChangeTimeScale(scale)}
                        className={`py-1.5 rounded-lg font-extrabold text-[11px] tabular-nums cursor-pointer ${
                          devTimeScale === scale
                            ? 'bg-[#F59E0B] text-[#0F172A]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {scale}x
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onQuickAction('advance_time_10m')}
                      className="py-1.5 px-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sky-200 font-bold text-[10.5px] cursor-pointer"
                    >
                      +10 Mnt Nyata
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('advance_time_1h')}
                      className="py-1.5 px-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sky-200 font-bold text-[10.5px] cursor-pointer"
                    >
                      +1 Jam Nyata
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('advance_time_6h')}
                      className="py-1.5 px-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sky-200 font-bold text-[10.5px] cursor-pointer"
                    >
                      +6 Jam Nyata
                    </button>
                  </div>
                </section>

                {/* Day & Life Stage */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Hari &amp; Usia Kucing
                    </span>
                    <span className="font-mono font-bold text-[#FDE68A]">
                      Hari {hud.day} ({LIFE_STAGES[hud.lifeStage].shortLabel})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPatchState({ day: Math.max(0, hud.day - 1) })}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                    >
                      -1 Hari
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={18}
                      value={hud.day}
                      onChange={(e) => onPatchState({ day: Number(e.target.value) })}
                      className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-600 text-center font-mono font-bold text-[#FDE68A]"
                    />
                    <button
                      type="button"
                      onClick={() => onPatchState({ day: Math.min(18, hud.day + 1) })}
                      className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                    >
                      +1 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('evolve_next')}
                      className="flex-1 py-1 px-2 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white font-extrabold text-[10.5px] cursor-pointer truncate"
                    >
                      Evolusi &gt;&gt;
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-1">
                    {DAY_PRESETS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => onPatchState({ day: d })}
                        className={`py-1 rounded text-[10px] font-bold tabular-nums cursor-pointer ${
                          hud.day === d
                            ? 'bg-[#F59E0B] text-[#0F172A]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        H{d}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-1">
                    {LIFE_STAGE_ORDER.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => onPatchState({ lifeStage: stage })}
                        className={`py-1.5 px-1 rounded-lg text-[10.5px] font-extrabold cursor-pointer ${
                          hud.lifeStage === stage
                            ? 'bg-emerald-500 text-[#0F172A]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {LIFE_STAGES[stage].shortLabel}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10.5px] font-semibold text-slate-300">
                      <span>Progres Fase Saat Ini</span>
                      <span className="font-mono text-[#FDE68A]">{stageProgressPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={99}
                      step={1}
                      value={Math.floor(stageProgressPct)}
                      onChange={(e) =>
                        onPatchState({ stageProgressPct: Number(e.target.value) })
                      }
                      className="w-full cursor-pointer accent-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/70">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-1">
                        Cabang Dewasa
                      </p>
                      <div className="flex gap-1">
                        {(Object.keys(ADULT_BRANCHES) as AdultEvolutionBranch[]).map(
                          (b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => onPatchState({ adultBranch: b })}
                              className={`flex-1 py-1 rounded text-[10px] font-bold capitalize cursor-pointer ${
                                hud.adultBranch === b
                                  ? 'bg-[#F59E0B] text-[#0F172A]'
                                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                              }`}
                            >
                              {b}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-1">
                        Care Mistakes: {hud.careMistakes}
                      </p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onPatchState({
                              careMistakes: Math.max(0, hud.careMistakes - 1),
                            })
                          }
                          className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onPatchState({ careMistakes: hud.careMistakes + 1 })
                          }
                          className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => onPatchState({ careMistakes: 0 })}
                          className="flex-1 py-1 rounded bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                        >
                          0
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Time of Day & Weather */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-yellow-300" />
                      Jam Game (Pagi–Siang–Malam)
                    </span>
                    <span className="font-mono font-bold text-[#FDE68A]">
                      {formatGameClock(hud.gameHour)} (
                      {hud.dayPhase === 'malam'
                        ? 'Malam'
                        : hud.isDusk
                        ? 'Senja'
                        : hud.dayPhase === 'siang'
                        ? 'Siang'
                        : 'Pagi'}
                      )
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={23.75}
                    step={0.25}
                    value={hud.gameHour}
                    onChange={(e) => onPatchState({ gameHour: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-amber-400"
                  />
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { h: 7, label: '07 Pagi' },
                      { h: 13, label: '13 Siang' },
                      { h: 17, label: '17 Senja' },
                      { h: 21, label: '21 Malam' },
                      { h: 2, label: '02 Dini' },
                    ].map((t) => (
                      <button
                        key={t.h}
                        type="button"
                        onClick={() => onPatchState({ gameHour: t.h })}
                        className="py-1 px-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold text-slate-200 cursor-pointer"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                      Cuaca
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPatchState({ weather: 'cerah' })}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                          hud.weather === 'cerah'
                            ? 'bg-amber-400 text-[#0F172A]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        <Sun className="w-3 h-3" />
                        Cerah
                      </button>
                      <button
                        type="button"
                        onClick={() => onPatchState({ weather: 'hujan' })}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold inline-flex items-center gap-1 cursor-pointer ${
                          hud.weather === 'hujan'
                            ? 'bg-sky-400 text-[#0F172A]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        <CloudRain className="w-3 h-3" />
                        Hujan
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickAction('trigger_lightning')}
                        title="Picu kilat hujan sekarang"
                        className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        Petir
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}

            {tab === 'economy' && (
              <>
                {/* Coins & Level */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-yellow-400" />
                      Koin &amp; Level Ikatan
                    </span>
                    <span className="font-mono font-bold text-[#FDE68A]">
                      {hud.coins} Koin · Lv.{hud.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPatchState({ coins: Math.max(0, hud.coins - 50) })}
                      className="py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => onPatchState({ coins: hud.coins + 50 })}
                      className="py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white font-bold cursor-pointer"
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      onClick={() => onPatchState({ coins: hud.coins + 500 })}
                      className="py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0F172A] font-extrabold cursor-pointer"
                    >
                      +500
                    </button>
                    <button
                      type="button"
                      onClick={() => onPatchState({ coins: 0 })}
                      className="py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                    >
                      Set 0
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPatchState({ level: Math.max(1, hud.level - 1) })}
                      className="py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                    >
                      -1 Level
                    </button>
                    <button
                      type="button"
                      onClick={() => onPatchState({ level: hud.level + 1 })}
                      className="py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      +1 Level
                    </button>
                    <button
                      type="button"
                      onClick={() => onPatchState({ affectionXp: hud.affectionXp + 20 })}
                      className="py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold cursor-pointer"
                    >
                      +20 XP
                    </button>
                  </div>
                </section>

                {/* Inventory, Unlocks & Cooldowns */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <p className="font-extrabold text-slate-100">
                    Stok, Shop &amp; Cooldown
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onQuickAction('fill_inventory')}
                      className="py-2 px-3 rounded-lg bg-emerald-600/85 hover:bg-emerald-500 text-white font-bold text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>+5 Semua Stok Makanan &amp; Mandi</span>
                      <span className="text-[10px] font-mono opacity-90">
                        {hud.inventory.main_food}/{hud.inventory.special_food}/
                        {hud.inventory.shampoo_foam}/{hud.inventory.spa_bath}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('unlock_all_shop')}
                      className="py-2 px-3 rounded-lg bg-indigo-600/85 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Buka Semua Ruangan, Kasur, Mainan &amp; Kostum</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('reset_cooldowns')}
                      className="py-2 px-3 rounded-lg bg-sky-600/85 hover:bg-sky-500 text-white font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Semua Cooldown (00:00)</span>
                    </button>
                  </div>
                </section>

                {/* Breed & Personality */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <p className="font-extrabold text-slate-100">Ras &amp; Kepribadian</p>
                  <div className="grid grid-cols-4 gap-1">
                    {(Object.keys(CAT_BREEDS) as CatBreed[]).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onPatchState({ breed: b })}
                        className={`py-1 rounded text-[10.5px] font-bold capitalize cursor-pointer ${
                          hud.breed === b
                            ? 'bg-[#F59E0B] text-[#0F172A]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['playful', 'lazy', 'shy'] as CatPersonality[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onPatchState({ personality: p })}
                        className={`py-1 rounded text-[10.5px] font-bold capitalize cursor-pointer ${
                          hud.personality === p
                            ? 'bg-emerald-500 text-[#0F172A]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Save & Game Over Tests */}
                <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <p className="font-extrabold text-slate-100">Save &amp; Uji Game Over</p>
                  <button
                    type="button"
                    onClick={onSaveNow}
                    className="w-full py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Save Sekarang</span>
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onQuickAction('force_game_over_sick')}
                      className="py-1.5 px-2 rounded-lg bg-rose-700/85 hover:bg-rose-600 text-white font-bold text-[10.5px] inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Skull className="w-3.5 h-3.5" />
                      <span>Test Wafat (Sakit)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAction('force_game_over_old')}
                      className="py-1.5 px-2 rounded-lg bg-purple-700/85 hover:bg-purple-600 text-white font-bold text-[10.5px] inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Skull className="w-3.5 h-3.5" />
                      <span>Test Wafat (Tua)</span>
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </aside>
      )}
    </>
  );
};
