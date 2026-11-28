/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { soundEngine } from './audio/soundEngine';
import { DevTestingPanel } from './components/DevTestingPanel';
import { GameHud } from './components/GameHud';
import { LifeStageModal } from './components/LifeStageModal';
import { MiniGameModal } from './components/MiniGameModal';
import { OpeningSplash } from './components/OpeningSplash';
import { AutoSaveStatus, PauseAndEndModal } from './components/PauseAndEndModal';
import { ShopDrawer } from './components/ShopDrawer';
import { TitleScreen } from './components/TitleScreen';
import { UiEditorTool } from './components/UiEditorTool';
import { CatStageCanvas, CatStageHandle } from './game/CatStageCanvas';
import {
  BathItemId,
  CatAccessoryId,
  CatBathtubId,
  CatBedId,
  CatBreed,
  CatHudSnapshot,
  CatToyId,
  DevQuickAction,
  DevStatePatch,
  DevTimeScale,
  FoodItemId,
  GameSettings,
  GameState,
  INITIAL_COOLDOWNS,
  INITIAL_INVENTORY,
  LIFE_STAGES,
  ManualSleepMode,
  RoomBackgroundId,
  SAVE_STORAGE_KEY,
  SaveData,
  SETTINGS_STORAGE_KEY,
  ToolMode,
} from './types/game';
import {
  clearLowHungerNotificationSchedule,
  getCareNotificationPermission,
  requestCareNotificationPermission,
} from './utils/catCareSystem';
import {
  isFullscreenActive,
  isTouchOrAndroid,
  requestImmersiveFullscreen,
} from './utils/fullscreen';

const INITIAL_HUD: CatHudSnapshot = {
  name: 'Oren',
  breed: 'oren',
  behavior: 'IDLE',
  hunger: 86,
  happiness: 88,
  cleanliness: 92,
  energy: 88,
  health: 100,
  isHungry: false,
  isSick: false,
  isRecovering: false,
  affectionXp: 0,
  xpToNext: 40,
  level: 1,
  coins: 35,
  day: 0,
  gameHours: 0,
  gameHour: 7,
  dayPhase: 'pagi',
  isDusk: false,
  timeOfDay: 7 / 24,
  weather: 'cerah',
  lifeStage: 'baby',
  stageElapsedSec: 0,
  stageDurationSec: LIFE_STAGES.baby.durationSec,
  careMistakes: 0,
  adultBranch: 'prima',
  miniGameUnlocked: false,
  deathReason: null,
  personality: 'playful',
  bowlAmount: 0,
  freeFeedCooldownSec: 0,
  totalCatches: 0,
  totalPets: 0,
  activeBackground: 'classic_home',
  unlockedBackgrounds: ['classic_home'],
  activeBed: 'kasur_kucing',
  unlockedBeds: ['kasur_kucing'],
  activeBathtub: 'bak_kucing',
  unlockedBathtubs: ['bak_kucing'],
  isBathing: false,
  activeToy: 'yarn_ball',
  unlockedToys: ['yarn_ball'],
  equippedHat: 'none',
  equippedGlasses: 'none',
  equippedScarf: 'default',
  unlockedAccessories: [],
  inventory: { ...INITIAL_INVENTORY },
  sleepMode: 'none',
  sleepRemainingSec: 0,
  sleepDurationSec: 0,
  drowsyStage: 'fresh',
  cooldownsSec: { ...INITIAL_COOLDOWNS },
  moodLabel: 'Tenang & Nyaman',
  warningText: null,
};

function readSavedCat(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveData;
    if (!parsed || typeof parsed.name !== 'string' || !parsed.breed) return null;
    return parsed;
  } catch {
    return null;
  }
}

const DEFAULT_SETTINGS: GameSettings = {
  muted: false,
  sfxMuted: false,
  musicMuted: false,
  volume: 100,
  hungerSpeed: 'normal',
};

function readSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    const legacyMuted = Boolean(parsed.muted);
    const sfxMuted =
      typeof parsed.sfxMuted === 'boolean' ? parsed.sfxMuted : legacyMuted;
    const musicMuted =
      typeof parsed.musicMuted === 'boolean' ? parsed.musicMuted : legacyMuted;
    const volume =
      typeof parsed.volume === 'number' && Number.isFinite(parsed.volume)
        ? Math.max(0, Math.min(100, Math.round(parsed.volume)))
        : 100;
    return {
      muted: sfxMuted && musicMuted,
      sfxMuted,
      musicMuted,
      volume,
      hungerSpeed: DEFAULT_SETTINGS.hungerSpeed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function checkTouchPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  const isCoarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const isAndroidUa = /android/i.test(navigator.userAgent || '');
  return (isCoarse || isAndroidUa) && window.innerHeight > window.innerWidth;
}

export default function App() {
  const stageRef = useRef<CatStageHandle | null>(null);
  const [openingDone, setOpeningDone] = useState(false);
  const [appClosed, setAppClosed] = useState(false);
  const [isTouchPortrait, setIsTouchPortrait] = useState<boolean>(() => checkTouchPortrait());
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [selectedBreed, setSelectedBreed] = useState<CatBreed>('oren');
  const [toolMode, setToolMode] = useState<ToolMode>('PET');
  const [shopOpen, setShopOpen] = useState(false);
  const [lifeStageOpen, setLifeStageOpen] = useState(false);
  const [miniGameOpen, setMiniGameOpen] = useState(false);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [devTimeScale, setDevTimeScale] = useState<DevTimeScale>(1);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const saveTimerRef = useRef<{ settle: number | null; clear: number | null }>({
    settle: null,
    clear: null,
  });
  const [settings, setSettings] = useState<GameSettings>(() => {
    const s = readSettings();
    soundEngine.applySettings(s);
    return s;
  });
  const [hud, setHud] = useState<CatHudSnapshot>(INITIAL_HUD);
  const [existingSave, setExistingSave] = useState<SaveData | null>(() => readSavedCat());

  const persistProgress = useCallback(() => {
    if (!stageRef.current) return;
    if (saveTimerRef.current.settle) window.clearTimeout(saveTimerRef.current.settle);
    if (saveTimerRef.current.clear) window.clearTimeout(saveTimerRef.current.clear);
    setAutoSaveStatus('saving');
    try {
      const data = stageRef.current.getSaveData();
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
      setExistingSave(data);
      setLastSavedAt(Date.now());
      saveTimerRef.current.settle = window.setTimeout(() => {
        setAutoSaveStatus('saved');
        saveTimerRef.current.clear = window.setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2200);
      }, 280);
    } catch {
      setAutoSaveStatus('idle');
    }
  }, []);

  const handleUpdateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next: GameSettings = { ...prev, ...patch };
      if (
        typeof patch.muted === 'boolean' &&
        patch.sfxMuted === undefined &&
        patch.musicMuted === undefined
      ) {
        next.sfxMuted = patch.muted;
        next.musicMuted = patch.muted;
      } else {
        next.muted = next.sfxMuted && next.musicMuted;
      }
      next.volume = Math.max(0, Math.min(100, Math.round(next.volume)));
      soundEngine.applySettings(next);
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const handleClearSave = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setExistingSave(null);
  }, []);

  const handleStartNew = useCallback((name: string, breed: CatBreed) => {
    soundEngine.unlock();
    if (isTouchOrAndroid()) {
      void requestImmersiveFullscreen();
    }
    if (getCareNotificationPermission() === 'default') {
      void requestCareNotificationPermission();
    }
    stageRef.current?.resetCat(name, breed);
    setToolMode('PET');
    setShopOpen(false);
    setGameState('PLAYING');
    soundEngine.playMeow(1.05);
  }, []);

  const handleContinueSave = useCallback(() => {
    if (!existingSave) return;
    soundEngine.unlock();
    if (isTouchOrAndroid()) {
      void requestImmersiveFullscreen();
    }
    if (getCareNotificationPermission() === 'default') {
      void requestCareNotificationPermission();
    }
    stageRef.current?.loadFromSave(existingSave);
    setToolMode('PET');
    setShopOpen(false);
    setGameState('PLAYING');
    soundEngine.playMeow(1.0);
  }, [existingSave]);

  const handleQuitApp = useCallback(() => {
    soundEngine.stopMusic();
    soundEngine.setRainAmbience(false);
    const capApp = (
      window as unknown as {
        Capacitor?: { Plugins?: { App?: { exitApp?: () => void } } };
      }
    ).Capacitor?.Plugins?.App;
    if (capApp?.exitApp) {
      capApp.exitApp();
    }
    try {
      window.close();
    } catch {
      // Ignore if browser blocks script close
    }
    setAppClosed(true);
  }, []);

  const handleFeedItem = useCallback(
    (foodId: FoodItemId) => {
      setToolMode('PET');
      if (stageRef.current?.feedItem(foodId)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleBuyFoodItem = useCallback(
    (foodId: Exclude<FoodItemId, 'snack'>, useImmediately = false) => {
      setToolMode('PET');
      if (stageRef.current?.buyFoodItem(foodId, useImmediately)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleUseBathItem = useCallback(
    (bathId: BathItemId) => {
      setToolMode('PET');
      if (stageRef.current?.useBathItem(bathId)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleBuyBathItem = useCallback(
    (bathId: Exclude<BathItemId, 'basic_soap'>, useImmediately = false) => {
      setToolMode('PET');
      if (stageRef.current?.buyBathItem(bathId, useImmediately)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleStartSleep = useCallback(
    (mode: ManualSleepMode) => {
      setToolMode('PET');
      if (stageRef.current?.startSleep(mode)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleWakeUp = useCallback(() => {
    setToolMode('PET');
    stageRef.current?.wakeUp();
    persistProgress();
  }, [persistProgress]);

  const handleToggleSleep = useCallback(() => {
    setToolMode('PET');
    stageRef.current?.toggleSleep();
    persistProgress();
  }, [persistProgress]);

  const handleOpenMiniGame = useCallback(() => {
    if (stageRef.current?.canStartMiniGame()) {
      setMiniGameOpen(true);
    }
  }, []);

  const handleStartInteractivePlay = useCallback(() => {
    stageRef.current?.startInteractivePlay();
  }, []);

  const handlePetCat = useCallback(
    (kind: 'short' | 'full') => {
      setToolMode('PET');
      stageRef.current?.petCat(kind);
      persistProgress();
    },
    [persistProgress]
  );

  const handleGiveMedicine = useCallback(() => {
    setToolMode('PET');
    stageRef.current?.giveMedicine();
  }, []);

  const handleSelectBackground = useCallback(
    (bgId: RoomBackgroundId) => {
      if (stageRef.current?.buyOrEquipBackground(bgId)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleSelectBed = useCallback(
    (bedId: CatBedId) => {
      if (stageRef.current?.buyOrEquipBed(bedId)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleSelectBathtub = useCallback(
    (tubId: CatBathtubId) => {
      if (stageRef.current?.buyOrEquipBathtub(tubId)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleSelectToy = useCallback(
    (toyId: CatToyId) => {
      if (stageRef.current?.buyOrEquipToy(toyId)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleSelectAccessory = useCallback(
    (accId: CatAccessoryId) => {
      if (stageRef.current?.buyOrEquipAccessory(accId)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleUnequipAllAccessories = useCallback(() => {
    stageRef.current?.unequipAllAccessories();
    persistProgress();
  }, [persistProgress]);

  const handleMiniGameComplete = useCallback(
    (coinsEarned: number, happinessGain: number) => {
      stageRef.current?.applyMiniGameReward(coinsEarned, happinessGain);
      persistProgress();
    },
    [persistProgress]
  );

  const handleDevPatchState = useCallback((patch: DevStatePatch) => {
    stageRef.current?.applyDevPatch(patch);
  }, []);

  const handleDevQuickAction = useCallback(
    (action: DevQuickAction) => {
      stageRef.current?.devAction(action);
      if (action === 'unlock_all_shop' || action === 'fill_inventory' || action === 'reset_cooldowns') {
        persistProgress();
      }
    },
    [persistProgress]
  );

  const handleGameOver = useCallback((finalSnapshot: CatHudSnapshot) => {
    clearLowHungerNotificationSchedule();
    setHud(finalSnapshot);
    setShopOpen(false);
    setLifeStageOpen(false);
    setMiniGameOpen(false);
    setDevPanelOpen(false);
    setDevTimeScale(1);
    setToolMode('PET');
    setGameState('GAME_OVER');
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
      setExistingSave(null);
    } catch {
      // Ignore
    }
  }, []);

  const handleRestartSameCat = useCallback(() => {
    stageRef.current?.resetCat(hud.name, hud.breed);
    setToolMode('PET');
    setShopOpen(false);
    setLifeStageOpen(false);
    setMiniGameOpen(false);
    setDevPanelOpen(false);
    setDevTimeScale(1);
    setGameState('PLAYING');
    soundEngine.playMeow(1.05);
  }, [hud.name, hud.breed]);

  const handleReturnToTitle = useCallback(() => {
    if (gameState !== 'GAME_OVER') {
      persistProgress();
    }
    setShopOpen(false);
    setLifeStageOpen(false);
    setMiniGameOpen(false);
    setDevPanelOpen(false);
    setDevTimeScale(1);
    setToolMode('PET');
    setGameState('TITLE_MENU');
  }, [gameState, persistProgress]);

  useEffect(() => {
    if (!openingDone || appClosed) {
      soundEngine.stopMusic();
      return;
    }
    if (gameState === 'TITLE_MENU') {
      soundEngine.playMusic('menu', 0.38);
    } else if (gameState === 'PLAYING') {
      soundEngine.playMusic('ingame', 0.32);
    } else if (gameState === 'PAUSED') {
      soundEngine.playMusic('ingame', 0.14);
    } else {
      soundEngine.stopMusic();
    }
  }, [gameState, openingDone, appClosed]);

  useEffect(() => {
    const isRainPlayable =
      openingDone &&
      !appClosed &&
      hud.weather === 'hujan' &&
      (gameState === 'PLAYING' || gameState === 'PAUSED');
    if (isRainPlayable) {
      soundEngine.setRainAmbience(true, gameState === 'PAUSED' ? 0.18 : 0.45);
    } else {
      soundEngine.setRainAmbience(false);
    }
  }, [hud.weather, gameState, openingDone, appClosed]);

  useEffect(() => {
    const tryLockLandscape = () => {
      const orient = screen.orientation as
        | (ScreenOrientation & { lock?: (orientation: string) => Promise<void> })
        | undefined;
      orient?.lock?.('landscape')?.catch(() => {});
      setIsTouchPortrait(checkTouchPortrait());
    };
    tryLockLandscape();
    if (isTouchOrAndroid()) {
      void requestImmersiveFullscreen();
    }
    window.addEventListener('resize', tryLockLandscape);
    window.addEventListener('orientationchange', tryLockLandscape);
    const handleFirstGesture = () => {
      soundEngine.unlock();
      if (isTouchOrAndroid() && !isFullscreenActive()) {
        void requestImmersiveFullscreen();
      } else {
        tryLockLandscape();
      }
    };
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    return () => {
      window.removeEventListener('resize', tryLockLandscape);
      window.removeEventListener('orientationchange', tryLockLandscape);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const id = window.setInterval(() => {
      persistProgress();
    }, 5000);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        persistProgress();
      }
    };
    const handleUnload = () => {
      persistProgress();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [gameState, persistProgress]);

  useEffect(() => {
    if (gameState !== 'PLAYING' && gameState !== 'PAUSED') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (miniGameOpen) {
          setMiniGameOpen(false);
        } else if (lifeStageOpen) {
          setLifeStageOpen(false);
        } else if (shopOpen) {
          setShopOpen(false);
        } else if (devPanelOpen) {
          setDevPanelOpen(false);
        } else if (gameState === 'PLAYING') {
          persistProgress();
          setGameState('PAUSED');
        } else {
          setGameState('PLAYING');
        }
        return;
      }

      if (gameState !== 'PLAYING') return;

      const isSleepingNow = hud.behavior === 'SLEEPING' || hud.sleepMode !== 'none';
      const canInteractiveKey =
        !isSleepingNow &&
        !hud.isSick &&
        hud.energy > 20 &&
        hud.hunger > 2 &&
        hud.cooldownsSec.interactivePlay === 0;

      if (e.key === '1') {
        handleFeedItem('snack');
      } else if (e.key === '2') {
        if (!isSleepingNow && hud.cleanliness < 100) {
          setToolMode((prev) => (prev === 'BRUSH' ? 'PET' : 'BRUSH'));
        }
      } else if (e.key === '3') {
        if (canInteractiveKey) {
          setToolMode('TOY');
        }
        handleStartInteractivePlay();
      } else if (e.key === '4') {
        handleToggleSleep();
      } else if (e.key === '5') {
        handleGiveMedicine();
      } else if (e.key === '6') {
        setShopOpen((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (canInteractiveKey) {
          setToolMode('TOY');
        }
        handleStartInteractivePlay();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    shopOpen,
    lifeStageOpen,
    miniGameOpen,
    devPanelOpen,
    hud.behavior,
    hud.sleepMode,
    hud.cleanliness,
    hud.isSick,
    hud.energy,
    hud.hunger,
    hud.cooldownsSec.interactivePlay,
    persistProgress,
    handleFeedItem,
    handleStartInteractivePlay,
    handleToggleSleep,
    handleGiveMedicine,
  ]);

  return (
    <main className="relative w-screen h-dvh overflow-hidden bg-[#1F2B26]">
      <CatStageCanvas
        ref={stageRef}
        gameState={gameState}
        toolMode={toolMode}
        previewBreed={selectedBreed}
        hungerSpeed={settings.hungerSpeed}
        devTimeScale={devTimeScale}
        onHudUpdate={setHud}
        onGameOver={handleGameOver}
        onToySessionEnd={() => setToolMode((prev) => (prev === 'TOY' ? 'PET' : prev))}
        onBatheComplete={() => setToolMode((prev) => (prev === 'BRUSH' ? 'PET' : prev))}
        onAutoSaveNeeded={persistProgress}
      />

      {gameState === 'TITLE_MENU' && !appClosed && (
        <TitleScreen
          selectedBreed={selectedBreed}
          onSelectBreed={setSelectedBreed}
          existingSave={existingSave}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClearSave={handleClearSave}
          onStartNew={handleStartNew}
          onContinueSave={handleContinueSave}
          onQuitApp={handleQuitApp}
        />
      )}

      {gameState === 'PLAYING' && (
        <>
          <GameHud
            hud={hud}
            toolMode={toolMode}
            shopOpen={shopOpen}
            onSelectTool={setToolMode}
            onFeedItem={handleFeedItem}
            onUseBathItem={handleUseBathItem}
            onStartSleep={handleStartSleep}
            onWakeUp={handleWakeUp}
            onStartInteractivePlay={handleStartInteractivePlay}
            onPetCat={handlePetCat}
            onGiveMedicine={handleGiveMedicine}
            onToggleShop={() => setShopOpen((prev) => !prev)}
            onOpenLifeStage={() => setLifeStageOpen(true)}
            onOpenMiniGame={handleOpenMiniGame}
            onPause={() => {
              persistProgress();
              setGameState('PAUSED');
            }}
          />
          <ShopDrawer
            open={shopOpen}
            hud={hud}
            onClose={() => setShopOpen(false)}
            onFeedItem={handleFeedItem}
            onBuyFoodItem={handleBuyFoodItem}
            onUseBathItem={handleUseBathItem}
            onBuyBathItem={handleBuyBathItem}
            onSelectBackground={handleSelectBackground}
            onSelectBed={handleSelectBed}
            onSelectBathtub={handleSelectBathtub}
            onSelectToy={handleSelectToy}
            onSelectAccessory={handleSelectAccessory}
            onUnequipAllAccessories={handleUnequipAllAccessories}
          />
          <LifeStageModal
            open={lifeStageOpen}
            hud={hud}
            onClose={() => setLifeStageOpen(false)}
          />
          <MiniGameModal
            open={miniGameOpen}
            catName={hud.name}
            isRaining={hud.weather === 'hujan'}
            happinessFull={hud.happiness >= 100}
            onClose={() => setMiniGameOpen(false)}
            onComplete={handleMiniGameComplete}
          />
          <DevTestingPanel
            open={devPanelOpen}
            onToggleOpen={() => setDevPanelOpen((prev) => !prev)}
            hud={hud}
            devTimeScale={devTimeScale}
            onChangeTimeScale={setDevTimeScale}
            onPatchState={handleDevPatchState}
            onQuickAction={handleDevQuickAction}
            onStartSleep={handleStartSleep}
            onSaveNow={persistProgress}
          />
        </>
      )}

      <PauseAndEndModal
        gameState={gameState}
        hud={hud}
        settings={settings}
        autoSaveStatus={autoSaveStatus}
        lastSavedAt={lastSavedAt}
        onResume={() => setGameState('PLAYING')}
        onUpdateSettings={handleUpdateSettings}
        onRestartSameCat={handleRestartSameCat}
        onReturnToTitle={handleReturnToTitle}
      />

      {openingDone && !appClosed && <UiEditorTool gameState={gameState} />}

      {!openingDone && !appClosed && (
        <OpeningSplash onFinish={() => setOpeningDone(true)} />
      )}

      {appClosed && (
        <div className="fixed inset-0 z-[110] bg-[#16201C] text-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center gap-4">
          <img
            src="/assets/aistudio/image_e0ece965.png"
            alt="LumaPet"
            className="h-24 w-24 rounded-[19.5%] object-contain opacity-95"
            draggable={false}
          />
          <div>
            <h2 className="font-display text-xl font-extrabold">Aplikasi Telah Ditutup</h2>
            <p className="text-sm text-[#D1DCD6] mt-1">
              Terima kasih sudah bermain LumaPet. Kamu dapat menutup halaman ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAppClosed(false)}
            className="px-5 py-2.5 rounded-xl bg-[#2D6A4F] border-2 border-[#74C69D]/50 text-white font-display font-bold text-sm hover:brightness-110 cursor-pointer"
          >
            Buka Kembali
          </button>
        </div>
      )}

      {isTouchPortrait && !appClosed && (
        <div className="fixed inset-0 z-[120] bg-[#16201C]/98 text-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center gap-4">
          <RotateCw className="w-12 h-12 text-[#FBBF24] animate-spin" style={{ animationDuration: '4s' }} />
          <div>
            <h2 className="font-display text-xl font-extrabold">Mode Lanskap Diperlukan</h2>
            <p className="text-sm text-[#D1DCD6] mt-1 max-w-xs">
              Putar perangkat Anda ke posisi miring (Landscape) untuk memainkan LumaPet.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
