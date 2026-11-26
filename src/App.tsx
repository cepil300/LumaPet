/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { GameHud } from './components/GameHud';
import { LifeStageModal } from './components/LifeStageModal';
import { MiniGameModal } from './components/MiniGameModal';
import { AutoSaveStatus, PauseAndEndModal } from './components/PauseAndEndModal';
import { ShopDrawer } from './components/ShopDrawer';
import { TitleScreen } from './components/TitleScreen';
import { CatStageCanvas, CatStageHandle } from './game/CatStageCanvas';
import {
  CatAccessoryId,
  CatBedId,
  CatBreed,
  CatHudSnapshot,
  CatToyId,
  GameSettings,
  GameState,
  LIFE_STAGES,
  RoomBackgroundId,
  SAVE_STORAGE_KEY,
  SaveData,
  SETTINGS_STORAGE_KEY,
  ShopItem,
  ToolMode,
} from './types/game';
import {
  clearLowHungerNotificationSchedule,
  getCareNotificationPermission,
  requestCareNotificationPermission,
} from './utils/catCareSystem';

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
  day: 1,
  timeOfDay: 0.14,
  weather: 'cerah',
  lifeStage: 'baby',
  stageElapsedSec: 0,
  stageDurationSec: LIFE_STAGES.baby.durationSec,
  careMistakes: 0,
  adultBranch: 'prima',
  miniGameUnlocked: false,
  bowlAmount: 0,
  freeFeedCooldownSec: 0,
  totalCatches: 0,
  totalPets: 0,
  activeBackground: 'classic_home',
  unlockedBackgrounds: ['classic_home'],
  activeBed: 'kasur_kucing',
  unlockedBeds: ['kasur_kucing'],
  activeToy: 'yarn_ball',
  unlockedToys: ['yarn_ball'],
  equippedHat: 'none',
  equippedGlasses: 'none',
  equippedScarf: 'default',
  unlockedAccessories: [],
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
  hungerSpeed: 'santai',
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
      hungerSpeed: parsed.hungerSpeed === 'normal' ? 'normal' : 'santai',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function App() {
  const stageRef = useRef<CatStageHandle | null>(null);
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [selectedBreed, setSelectedBreed] = useState<CatBreed>('oren');
  const [toolMode, setToolMode] = useState<ToolMode>('PET');
  const [shopOpen, setShopOpen] = useState(false);
  const [lifeStageOpen, setLifeStageOpen] = useState(false);
  const [miniGameOpen, setMiniGameOpen] = useState(false);
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
    if (getCareNotificationPermission() === 'default') {
      void requestCareNotificationPermission();
    }
    stageRef.current?.loadFromSave(existingSave);
    setToolMode('PET');
    setShopOpen(false);
    setGameState('PLAYING');
    soundEngine.playMeow(1.0);
  }, [existingSave]);

  const handleFeed = useCallback(() => {
    setToolMode('PET');
    if (stageRef.current?.feedRegular()) {
      persistProgress();
    }
  }, [persistProgress]);

  const handleToggleSleep = useCallback(() => {
    setToolMode('PET');
    stageRef.current?.toggleSleep();
  }, []);

  const handleTossToy = useCallback(() => {
    stageRef.current?.tossToy();
  }, []);

  const handleGiveMedicine = useCallback(() => {
    setToolMode('PET');
    stageRef.current?.giveMedicine();
  }, []);

  const handleBuyItem = useCallback(
    (item: ShopItem) => {
      if (stageRef.current?.applyShopItem(item)) {
        persistProgress();
      }
    },
    [persistProgress]
  );

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

  const handleGameOver = useCallback((finalSnapshot: CatHudSnapshot) => {
    clearLowHungerNotificationSchedule();
    setHud(finalSnapshot);
    setShopOpen(false);
    setLifeStageOpen(false);
    setMiniGameOpen(false);
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
    setToolMode('PET');
    setGameState('TITLE_MENU');
  }, [gameState, persistProgress]);

  useEffect(() => {
    if (gameState === 'TITLE_MENU') {
      soundEngine.playMusic('menu', 0.38);
    } else if (gameState === 'PLAYING') {
      soundEngine.playMusic('ingame', 0.32);
    } else if (gameState === 'PAUSED') {
      soundEngine.playMusic('ingame', 0.14);
    } else {
      soundEngine.stopMusic();
    }
  }, [gameState]);

  useEffect(() => {
    const handleFirstGesture = () => {
      soundEngine.unlock();
    };
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    return () => {
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
        } else if (gameState === 'PLAYING') {
          persistProgress();
          setGameState('PAUSED');
        } else {
          setGameState('PLAYING');
        }
        return;
      }

      if (gameState !== 'PLAYING') return;

      if (e.key === '1') {
        handleFeed();
      } else if (e.key === '2') {
        setToolMode((prev) => (prev === 'BRUSH' ? 'PET' : 'BRUSH'));
      } else if (e.key === '3') {
        if (hud.energy >= 20 && hud.hunger >= 20) {
          setToolMode('TOY');
        }
        handleTossToy();
      } else if (e.key === '4') {
        handleToggleSleep();
      } else if (e.key === '5') {
        handleGiveMedicine();
      } else if (e.key === '6') {
        setShopOpen((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        if (hud.energy >= 20 && hud.hunger >= 20) {
          setToolMode('TOY');
        }
        handleTossToy();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    shopOpen,
    lifeStageOpen,
    miniGameOpen,
    hud.energy,
    hud.hunger,
    persistProgress,
    handleFeed,
    handleTossToy,
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
        onHudUpdate={setHud}
        onGameOver={handleGameOver}
        onToySessionEnd={() => setToolMode((prev) => (prev === 'TOY' ? 'PET' : prev))}
        onBatheComplete={() => setToolMode((prev) => (prev === 'BRUSH' ? 'PET' : prev))}
        onAutoSaveNeeded={persistProgress}
      />

      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          selectedBreed={selectedBreed}
          onSelectBreed={setSelectedBreed}
          existingSave={existingSave}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClearSave={handleClearSave}
          onStartNew={handleStartNew}
          onContinueSave={handleContinueSave}
        />
      )}

      {gameState === 'PLAYING' && (
        <>
          <GameHud
            hud={hud}
            toolMode={toolMode}
            shopOpen={shopOpen}
            onSelectTool={setToolMode}
            onFeed={handleFeed}
            onToggleSleep={handleToggleSleep}
            onTossToy={handleTossToy}
            onGiveMedicine={handleGiveMedicine}
            onToggleShop={() => setShopOpen((prev) => !prev)}
            onOpenLifeStage={() => setLifeStageOpen(true)}
            onOpenMiniGame={() => setMiniGameOpen(true)}
            onPause={() => {
              persistProgress();
              setGameState('PAUSED');
            }}
          />
          <ShopDrawer
            open={shopOpen}
            hud={hud}
            onClose={() => setShopOpen(false)}
            onBuyItem={handleBuyItem}
            onSelectBackground={handleSelectBackground}
            onSelectBed={handleSelectBed}
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
            onClose={() => setMiniGameOpen(false)}
            onComplete={handleMiniGameComplete}
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
    </main>
  );
}
