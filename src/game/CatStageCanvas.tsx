import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { soundEngine } from '../audio/soundEngine';
import {
  AdultEvolutionBranch,
  BowlTreatType,
  CAT_ACCESSORIES,
  CAT_BEDS,
  CAT_BREEDS,
  CAT_TOYS,
  CatAccessoryId,
  CatBedId,
  CatBehavior,
  CatBreed,
  CatGlassesId,
  CatHatId,
  CatHudSnapshot,
  CatPersonality,
  CatScarfId,
  CatToyId,
  CatToyOption,
  GameState,
  HungerSpeed,
  LIFE_STAGES,
  LifeStage,
  ROOM_BACKGROUNDS,
  RoomBackgroundId,
  SaveData,
  ShopItem,
  ToolMode,
  WeatherType,
} from '../types/game';
import {
  calculateOfflineDecay,
  clearLowHungerNotificationSchedule,
  OFFLINE_HUNGER_DECAY_PER_SEC,
  resetLowHungerNotificationAfterFeed,
  scheduleLowHungerNotification,
  sendLowHungerNotification,
  setLowHungerNotifiedFlag,
} from '../utils/catCareSystem';
import {
  BowlRenderState,
  CatRenderState,
  computeRoomTransform,
  drawCat,
  drawCatBed,
  drawFoodBowl,
  drawParticles,
  drawRoomBackdrop,
  drawToolCursorHint,
  drawYarnToy,
  Particle,
  RoomTransform,
  roomToScreen,
  screenToRoom,
  ToyRenderState,
} from './catRenderer';
import {
  createWeatherFxState,
  drawRoomWeatherBackdrop,
  drawScreenWeatherOverlay,
  stepWeatherFx,
} from './weatherSystem';

export interface CatStageHandle {
  feedRegular: () => boolean;
  toggleSleep: () => void;
  tossToy: (targetNx?: number, targetNy?: number) => void;
  giveMedicine: () => void;
  applyMiniGameReward: (coinsEarned: number, happinessGain: number) => void;
  applyShopItem: (item: ShopItem) => boolean;
  buyOrEquipBackground: (bgId: RoomBackgroundId) => boolean;
  buyOrEquipBed: (bedId: CatBedId) => boolean;
  buyOrEquipToy: (toyId: CatToyId) => boolean;
  buyOrEquipAccessory: (accId: CatAccessoryId) => boolean;
  unequipAllAccessories: () => void;
  getSaveData: () => SaveData;
  resetCat: (name: string, breed: CatBreed) => void;
  loadFromSave: (save: SaveData) => void;
}

interface CatStageCanvasProps {
  gameState: GameState;
  toolMode: ToolMode;
  previewBreed: CatBreed;
  hungerSpeed: HungerSpeed;
  onHudUpdate: (snapshot: CatHudSnapshot) => void;
  onGameOver: (finalSnapshot: CatHudSnapshot) => void;
  onToySessionEnd?: () => void;
  onBatheComplete?: () => void;
  onAutoSaveNeeded?: () => void;
}

const DEFAULT_BED_POS = { nx: 0.145, ny: 0.765 };
const BOWL_POS = { nx: 0.43, ny: 0.748 };
const FLOOR_BOUNDS = { minX: 0.15, maxX: 0.84, minY: 0.68, maxY: 0.89 };
const BED_BOUNDS = { minX: 0.11, maxX: 0.87, minY: 0.67, maxY: 0.90 };
const PARTICLE_POOL_SIZE = 96;
const PLAY_SESSION_SECONDS = 5;
const FREE_FEED_COOLDOWN_MS = 5 * 60 * 1000;
const FREE_FEED_HUNGER_POINTS = 25;
const BRUSH_STROKE_PX = 48;
const BRUSH_POINTS_PER_STROKE = 10;
const CHRONIC_DIRTY_STRIKES = 3;

const PERSONALITIES: CatPersonality[] = ['playful', 'lazy', 'shy'];

const PERSONALITY_MODS: Record<
  CatPersonality,
  {
    energyDrain: number;
    sleepGain: number;
    ballHappy: number;
    petHappy: number;
    meowIntervalAdd: number;
    zoomieCutoff: number;
  }
> = {
  playful: {
    energyDrain: 1.08,
    sleepGain: 0.95,
    ballHappy: 1.18,
    petHappy: 1.05,
    meowIntervalAdd: 0,
    zoomieCutoff: 0.6,
  },
  lazy: {
    energyDrain: 0.82,
    sleepGain: 1.16,
    ballHappy: 0.9,
    petHappy: 1.0,
    meowIntervalAdd: 1.5,
    zoomieCutoff: 0.42,
  },
  shy: {
    energyDrain: 0.95,
    sleepGain: 1.0,
    ballHappy: 0.92,
    petHappy: 1.22,
    meowIntervalAdd: 2.8,
    zoomieCutoff: 0.48,
  },
};

function randomPersonality(): CatPersonality {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
}

function normalizeBedId(raw?: string): CatBedId {
  switch (raw) {
    case 'kasur_semangka':
    case 'cloud_pastel':
      return 'kasur_semangka';
    case 'keranjang_rajut':
    case 'rattan_knit':
      return 'keranjang_rajut';
    case 'kasur_donat':
      return 'kasur_donat';
    case 'tenda_kerajaan':
    case 'royal_sofa':
      return 'tenda_kerajaan';
    default:
      return 'kasur_kucing';
  }
}

function normalizeToyId(raw?: string): CatToyId {
  switch (raw) {
    case 'laser_pointer':
    case 'feather_wand':
    case 'toy_mouse':
    case 'yarn_ball':
      return raw;
    default:
      return 'yarn_ball';
  }
}

function getToyOption(id: CatToyId): CatToyOption {
  return CAT_TOYS.find((t) => t.id === id) ?? CAT_TOYS[0];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export const CatStageCanvas = forwardRef<CatStageHandle, CatStageCanvasProps>(
  (
    {
      gameState,
      toolMode,
      previewBreed,
      hungerSpeed,
      onHudUpdate,
      onGameOver,
      onToySessionEnd,
      onBatheComplete,
      onAutoSaveNeeded,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const backdropImgsRef = useRef<Partial<Record<RoomBackgroundId, HTMLImageElement>>>({});
    const bedImgsRef = useRef<Partial<Record<CatBedId, HTMLImageElement>>>({});
    const spriteSheetsRef = useRef<Partial<Record<CatBreed, HTMLImageElement>>>({});
    const babySpriteSheetsRef = useRef<Partial<Record<CatBreed, HTMLImageElement>>>({});
    const gameStateRef = useRef<GameState>(gameState);
    const toolModeRef = useRef<ToolMode>(toolMode);
    const previewBreedRef = useRef<CatBreed>(previewBreed);
    const hungerSpeedRef = useRef<HungerSpeed>(hungerSpeed);
    const onToySessionEndRef = useRef(onToySessionEnd);
    const onBatheCompleteRef = useRef(onBatheComplete);
    const onAutoSaveNeededRef = useRef(onAutoSaveNeeded);

    gameStateRef.current = gameState;
    toolModeRef.current = toolMode;
    previewBreedRef.current = previewBreed;
    hungerSpeedRef.current = hungerSpeed;
    onToySessionEndRef.current = onToySessionEnd;
    onBatheCompleteRef.current = onBatheComplete;
    onAutoSaveNeededRef.current = onAutoSaveNeeded;

    const simRef = useRef({
      name: 'Oren',
      breed: 'oren' as CatBreed,
      personality: 'playful' as CatPersonality,
      behavior: 'IDLE' as CatBehavior,
      nx: 0.52,
      ny: 0.78,
      z: 0,
      vz: 0,
      targetNx: 0.52,
      targetNy: 0.78,
      facing: 1 as 1 | -1,
      scaleX: 1,
      scaleY: 1,
      isSprinting: false,
      idleZoomies: false,
      idleDecisionTimer: 2.0,
      eatTickTimer: 0,
      purrDecayTimer: 0,
      groomTimer: 0,
      stretchTimer: 0,
      rollTimer: 0,
      zzzTimer: 0,
      petCoinCooldown: 0,
      brushCoinCooldown: 0,
      brushScrubAccum: 0,
      brushStrokeCooldown: 0,
      brushHintCooldown: 0,
      healParticleTimer: 0,
      moodParticleTimer: 0.6,
      hungryMeowTimer: 4,
      idleMeowTimer: 5.5,
      hitstopTimer: 0,
      shakeIntensity: 0,
      time: 0,

      // Stats
      hunger: 86,
      happiness: 86,
      cleanliness: 90,
      energy: 88,
      health: 100,
      isSick: false,
      sickReason: null as 'health' | 'dirty_zero' | 'chronic_dirty' | null,
      lowCleanlinessStrikes: 0,
      wasUnder25Clean: false,
      dirtyStayTimer: 0,
      cleanHealthyTimer: 0,
      chronicSickCheckTimer: 4.0,
      recoveryTimer: 0,
      starveGraceTimer: 0,
      affectionXp: 0,
      level: 1,
      coins: 35,
      day: 1,
      timeOfDay: 0.15,
      weather: 'cerah' as WeatherType,
      weatherTimer: 32,
      lightningTimer: 7.5,
      weatherFx: createWeatherFxState(),
      lifeStage: 'baby' as LifeStage,
      stageElapsedSec: 0,
      careMistakes: 0,
      careMistakeCooldown: 0,
      adultBranch: 'prima' as AdultEvolutionBranch,
      totalCatches: 0,
      totalPets: 0,

      // Room, Bed, Toy & Accessory customization
      activeBackground: 'classic_home' as RoomBackgroundId,
      unlockedBackgrounds: ['classic_home'] as RoomBackgroundId[],
      activeBed: 'kasur_kucing' as CatBedId,
      unlockedBeds: ['kasur_kucing'] as CatBedId[],
      activeToy: 'yarn_ball' as CatToyId,
      unlockedToys: ['yarn_ball'] as CatToyId[],
      equippedHat: 'none' as CatHatId,
      equippedGlasses: 'none' as CatGlassesId,
      equippedScarf: 'default' as CatScarfId,
      unlockedAccessories: [] as CatAccessoryId[],
      bedNx: DEFAULT_BED_POS.nx,
      bedNy: DEFAULT_BED_POS.ny,

      // Bed drag state
      bedDragCandidate: false,
      isDraggingBed: false,
      bedDragStartX: 0,
      bedDragStartY: 0,
      bedDragOffsetNx: 0,
      bedDragOffsetNy: 0,

      // Bowl
      bowlAmount: 0,
      bowlTreatType: 'kibble' as BowlTreatType,
      mealHungerRemaining: 0,
      lastFreeFeedTime: 0,
      pendingTreatBonus: { happiness: 0, energy: 0 },

      // Active Toy
      toy: {
        active: false,
        nx: 0.65,
        ny: 0.8,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        rotation: 0,
        facing: 1 as 1 | -1,
        lifeTimer: 0,
        catchCooldown: 0,
      },

      // Pointer tracking
      pointerDown: false,
      pointerInside: false,
      pointerX: 0,
      pointerY: 0,
      lastPointerX: 0,
      lastPointerY: 0,
      lastRoomTransform: computeRoomTransform(1280, 720),
      particles: Array.from({ length: PARTICLE_POOL_SIZE }, (): Particle => ({
        active: false,
        kind: 'heart',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 10,
        color: '#E57A84',
      })),
    });

    const spawnParticle = (
      kind: Particle['kind'],
      x: number,
      y: number,
      opts?: Partial<Particle>
    ) => {
      const pool = simRef.current.particles;
      let slot = pool.find((p) => !p.active);
      if (!slot) {
        slot = pool[0];
      }
      slot.active = true;
      slot.kind = kind;
      slot.x = x;
      slot.y = y;
      slot.vx = opts?.vx ?? (Math.random() - 0.5) * 32;
      slot.vy = opts?.vy ?? -48 - Math.random() * 25;
      slot.life = 0;
      slot.maxLife = opts?.maxLife ?? 1.0;
      slot.size = opts?.size ?? 10;
      slot.color = opts?.color ?? '#E57A84';
      slot.label = opts?.label;
      slot.swayAmp = opts?.swayAmp;
      slot.swayFreq = opts?.swayFreq;
      slot.phase = opts?.phase;
    };

    const addXpAndCoins = (xpGain: number, coinGain: number, popupX?: number, popupY?: number) => {
      const s = simRef.current;
      const bonusCoin =
        coinGain >= 2 && s.lifeStage === 'adult' && s.adultBranch === 'prima' ? 1 : 0;
      const totalCoinGain = coinGain + bonusCoin;
      s.affectionXp += xpGain;
      s.coins += totalCoinGain;
      const needed = s.level * 40;
      if (s.affectionXp >= needed) {
        s.affectionXp -= needed;
        s.level += 1;
        s.coins += 15;
        soundEngine.playChime();
        const pos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
        spawnParticle('text', pos.x, pos.y - 45, {
          label: `Ikatan Lv. ${s.level}! +15 Koin`,
          color: '#FDE68A',
          size: 16,
          vy: -36,
          maxLife: 1.8,
        });
        for (let i = 0; i < 8; i++) {
          spawnParticle('sparkle', pos.x + (Math.random() - 0.5) * 60, pos.y - 20, {
            color: '#FBBF24',
            size: 9 + Math.random() * 5,
            vx: (Math.random() - 0.5) * 90,
            vy: -40 - Math.random() * 60,
            maxLife: 1.1,
          });
        }
      } else if (totalCoinGain > 0 && popupX !== undefined && popupY !== undefined) {
        spawnParticle('text', popupX, popupY - 26, {
          label: `+${totalCoinGain} Koin`,
          color: '#FDE68A',
          size: 14,
          vy: -38,
          maxLife: 1.0,
        });
      }
    };

    const celebrateStageEvolution = (nextStage: LifeStage, extraNote?: string) => {
      const s = simRef.current;
      const meta = LIFE_STAGES[nextStage];
      soundEngine.playChime();
      soundEngine.playMeow(nextStage === 'child' ? 1.18 : nextStage === 'senior' ? 0.88 : 1.02);
      const pos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
      spawnParticle('text', pos.x, pos.y - 48, {
        label: extraNote
          ? `Evolusi: ${meta.label} (${extraNote})!`
          : `Evolusi: Fase ${meta.label}!`,
        color: '#FDE68A',
        size: 15,
        vy: -30,
        maxLife: 2.3,
      });
      for (let i = 0; i < 10; i++) {
        spawnParticle('sparkle', pos.x + (Math.random() - 0.5) * 70, pos.y - 16, {
          color: i % 2 === 0 ? '#FBBF24' : '#F472B6',
          size: 8 + Math.random() * 5,
          vx: (Math.random() - 0.5) * 90,
          vy: -38 - Math.random() * 55,
          maxLife: 1.2,
        });
      }
      onHudUpdate(buildSnapshot());
      onAutoSaveNeededRef.current?.();
    };

    const buildSnapshot = (): CatHudSnapshot => {
      const s = simRef.current;
      const isHungry = s.hunger <= 30;
      const isRecovering = s.recoveryTimer > 0;

      let moodLabel = 'Tenang & Nyaman';
      if (isRecovering) moodLabel = 'Pulih Perlahan';
      else if (s.isSick) moodLabel = 'Sedang Sakit';
      else if (s.behavior === 'SLEEPING') moodLabel = 'Tidur Nyenyak';
      else if (s.behavior === 'EATING') moodLabel = 'Lahap Makan';
      else if (s.behavior === 'PLAYING' && s.toy.active) {
        moodLabel = `Main ${getToyOption(s.activeToy).name}`;
      }
      else if (s.behavior === 'ROLLING') moodLabel = 'Berguling Lucu';
      else if (s.behavior === 'PURRING') moodLabel = 'Sangat Manja';
      else if (s.behavior === 'STRETCHING') moodLabel = 'Meregangkan Badan';
      else if (s.hunger <= 12) moodLabel = 'Kelaparan!';
      else if (isHungry) moodLabel = 'Mulai Lapar';
      else if (s.cleanliness < 25) moodLabel = 'Perlu Disisir';
      else if (s.energy < 22) moodLabel = 'Mengantuk';
      else if (s.happiness > 82) moodLabel = 'Sangat Ceria';

      let warningText: string | null = null;
      if (s.isSick && !isRecovering) {
        if (s.sickReason === 'dirty_zero') {
          warningText = `Kebersihan 0%! ${s.name} jatuh sakit—mandikan dan beri obat.`;
        } else if (s.sickReason === 'chronic_dirty') {
          warningText = `${s.name} jatuh sakit karena terlalu sering kotor! Segera beri obat.`;
        } else {
          warningText = `${s.name} sedang sakit (lemas & berjalan lambat)! Segera beri obat.`;
        }
      } else if (s.hunger < 20 && s.bowlAmount <= 0.02) {
        warningText = `${s.name} sangat lapar (<20%)! Kesehatannya mulai menurun—segera beri makan.`;
      } else if (s.hunger <= 30 && s.bowlAmount <= 0.02) {
        warningText = `Perut ${s.name} keroncongan! Waktunya beri makan.`;
      } else if (s.cleanliness < 15) {
        warningText = `${s.name} sangat kotor (<15%)! Kesehatannya menurun—segera mandikan.`;
      }

      const freeFeedCooldownSec =
        s.lastFreeFeedTime > 0
          ? Math.max(
              0,
              Math.ceil((FREE_FEED_COOLDOWN_MS - (Date.now() - s.lastFreeFeedTime)) / 1000)
            )
          : 0;

      return {
        name: s.name,
        breed: s.breed,
        behavior: s.behavior,
        hunger: Math.round(s.hunger),
        happiness: Math.round(s.happiness),
        cleanliness: Math.round(s.cleanliness),
        energy: Math.round(s.energy),
        health: Math.round(s.health),
        isHungry,
        isSick: s.isSick,
        isRecovering,
        affectionXp: Math.round(s.affectionXp),
        xpToNext: s.level * 40,
        level: s.level,
        coins: s.coins,
        day: s.day,
        timeOfDay: s.timeOfDay,
        weather: s.weather,
        lifeStage: s.lifeStage,
        stageElapsedSec: s.stageElapsedSec,
        stageDurationSec: LIFE_STAGES[s.lifeStage].durationSec,
        careMistakes: s.careMistakes,
        adultBranch: s.adultBranch,
        miniGameUnlocked: s.lifeStage !== 'baby',
        bowlAmount: s.bowlAmount,
        freeFeedCooldownSec,
        totalCatches: s.totalCatches,
        totalPets: s.totalPets,
        activeBackground: s.activeBackground,
        unlockedBackgrounds: [...s.unlockedBackgrounds],
        activeBed: s.activeBed,
        unlockedBeds: [...s.unlockedBeds],
        activeToy: s.activeToy,
        unlockedToys: [...s.unlockedToys],
        equippedHat: s.equippedHat,
        equippedGlasses: s.equippedGlasses,
        equippedScarf: s.equippedScarf,
        unlockedAccessories: [...s.unlockedAccessories],
        moodLabel,
        warningText,
      };
    };

    const tossToyInternal = (targetNx?: number, targetNy?: number) => {
      const s = simRef.current;
      soundEngine.unlock();

      // Batasan Aksi: jika energi < 20 atau kenyang < 20, kucing menolak bermain
      if (s.energy < 20 || s.hunger < 20) {
        s.toy.active = false;
        if (s.behavior === 'PLAYING') s.behavior = 'IDLE';
        soundEngine.playMeow(0.84);
        const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: s.energy < 20 ? 'Terlalu lelah untuk main!' : 'Terlalu lapar untuk main!',
          color: '#FCA5A5',
          size: 14,
          vy: -28,
          maxLife: 1.35,
        });
        onToySessionEndRef.current?.();
        return;
      }

      if (s.behavior === 'SLEEPING' || s.behavior === 'ROLLING') {
        s.behavior = 'IDLE';
        s.z = 0;
        s.vz = 0;
        soundEngine.playMeow(1.08);
      }
      s.idleZoomies = false;
      const tx = clamp(targetNx ?? 0.28 + Math.random() * 0.48, FLOOR_BOUNDS.minX, FLOOR_BOUNDS.maxX);
      const ty = clamp(targetNy ?? 0.72 + Math.random() * 0.14, FLOOR_BOUNDS.minY, FLOOR_BOUNDS.maxY);

      const isFreshSession = !s.toy.active || s.toy.lifeTimer <= 0.05;
      s.toy.active = true;
      if (isFreshSession) {
        s.toy.lifeTimer = PLAY_SESSION_SECONDS;
      }

      if (s.activeToy === 'laser_pointer') {
        s.toy.nx = tx;
        s.toy.ny = ty;
        s.toy.z = 0;
        s.toy.vx = 0;
        s.toy.vy = 0;
        s.toy.vz = 0;
        s.toy.catchCooldown = 0.18;
        soundEngine.playChime();
        return;
      }

      if (isFreshSession) {
        s.toy.nx = clamp(s.nx + (s.nx > 0.5 ? -0.22 : 0.22), FLOOR_BOUNDS.minX, FLOOR_BOUNDS.maxX);
        s.toy.ny = clamp(s.ny, FLOOR_BOUNDS.minY, FLOOR_BOUNDS.maxY);
      }

      if (s.activeToy === 'feather_wand') {
        s.toy.z = 0.055;
        s.toy.vx = clamp((tx - s.toy.nx) * 1.4, -0.45, 0.45);
        s.toy.vy = clamp((ty - s.toy.ny) * 1.4, -0.22, 0.22);
        s.toy.vz = 0;
        s.toy.catchCooldown = 0.22;
        soundEngine.playBounce();
        return;
      }

      if (s.activeToy === 'toy_mouse') {
        s.toy.z = 0;
        const dx = tx - s.toy.nx;
        const dy = ty - s.toy.ny;
        const rawDir = dx >= 0 ? 1 : -1;
        const len = Math.max(0.05, Math.hypot(dx, dy));
        const vx = (dx / len) * 0.155;
        s.toy.vx = Math.abs(vx) < 0.09 ? rawDir * 0.13 : vx;
        s.toy.vy = clamp((dy / len) * 0.075, -0.065, 0.065);
        s.toy.vz = 0;
        s.toy.facing = s.toy.vx >= 0 ? 1 : -1;
        s.toy.catchCooldown = 0.22;
        soundEngine.playBounce();
        return;
      }

      s.toy.z = 0.06;
      s.toy.vx = clamp((tx - s.toy.nx) * 1.45, -0.55, 0.55);
      s.toy.vy = clamp((ty - s.toy.ny) * 1.45, -0.25, 0.25);
      s.toy.vz = 0.22;
      s.toy.catchCooldown = 0.22;
      soundEngine.playBounce();
    };

    useImperativeHandle(ref, () => ({
      feedRegular: (): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        const now = Date.now();
        const elapsed = now - s.lastFreeFeedTime;
        if (s.lastFreeFeedTime > 0 && elapsed < FREE_FEED_COOLDOWN_MS) {
          const remainSec = Math.max(1, Math.ceil((FREE_FEED_COOLDOWN_MS - elapsed) / 1000));
          const mins = Math.floor(remainSec / 60);
          const secs = remainSec % 60;
          soundEngine.playBounce();
          const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: `Makanan gratis siap ${mins}m ${secs.toString().padStart(2, '0')}d`,
            color: '#FDE68A',
            size: 13,
            vy: -26,
            maxLife: 1.35,
          });
          onHudUpdate(buildSnapshot());
          return false;
        }

        s.lastFreeFeedTime = now;
        s.bowlAmount = 1;
        s.bowlTreatType = 'kibble';
        s.mealHungerRemaining = FREE_FEED_HUNGER_POINTS;
        s.pendingTreatBonus = { happiness: 6, energy: 0 };
        s.idleZoomies = false;
        if (s.behavior === 'SLEEPING' || s.behavior === 'ROLLING') {
          s.behavior = 'WALKING';
        }
        s.targetNx = BOWL_POS.nx + 0.06;
        s.targetNy = BOWL_POS.ny;
        soundEngine.playMeow(1.05);
        resetLowHungerNotificationAfterFeed(
          Math.min(100, s.hunger + FREE_FEED_HUNGER_POINTS),
          OFFLINE_HUNGER_DECAY_PER_SEC
        );
        const bowlScr = roomToScreen(BOWL_POS.nx, BOWL_POS.ny, s.lastRoomTransform);
        spawnParticle('sparkle', bowlScr.x, bowlScr.y - 18, {
          color: '#F59E0B',
          size: 8,
          maxLife: 0.7,
        });
        onHudUpdate(buildSnapshot());
        return true;
      },

      toggleSleep: () => {
        const s = simRef.current;
        soundEngine.unlock();
        s.idleZoomies = false;
        if (s.behavior === 'SLEEPING') {
          s.behavior = 'STRETCHING';
          s.stretchTimer = 1.4;
          s.scaleX = 1.08;
          s.scaleY = 0.92;
          soundEngine.playMeow(0.95);
        } else {
          s.toy.active = false;
          s.behavior = 'WALKING';
          s.targetNx = s.bedNx;
          s.targetNy = s.bedNy;
          s.idleDecisionTimer = -99;
          soundEngine.playSleep();
        }
      },

      tossToy: (tx?: number, ty?: number) => {
        tossToyInternal(tx, ty);
      },

      giveMedicine: () => {
        const s = simRef.current;
        soundEngine.unlock();
        if (!s.isSick) {
          soundEngine.playBounce();
          const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: `${s.name} sedang sehat! Obat hanya saat sakit`,
            color: '#FDE68A',
            size: 13,
            vy: -26,
            maxLife: 1.35,
          });
          return;
        }
        if (s.recoveryTimer > 0) {
          soundEngine.playBounce();
          const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: 'Obat sudah diberikan · Sedang pulih',
            color: '#6EE7B7',
            size: 13,
            vy: -26,
            maxLife: 1.2,
          });
          return;
        }

        s.recoveryTimer = 16;
        s.starveGraceTimer = 0;
        s.lowCleanlinessStrikes = 0;
        s.dirtyStayTimer = 0;
        s.sickReason = null;
        s.health = Math.min(100, s.health + 12);
        s.happiness = clamp(s.happiness + 6, 0, 100);
        soundEngine.playChime();
        const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: 'Diberi Obat · Pulih Perlahan',
          color: '#6EE7B7',
          size: 14,
          vy: -28,
          maxLife: 1.5,
        });
        for (let i = 0; i < 6; i++) {
          spawnParticle('sparkle', catPos.x + (Math.random() - 0.5) * 45, catPos.y - 12, {
            color: '#34D399',
            size: 8 + Math.random() * 4,
            vx: (Math.random() - 0.5) * 55,
            vy: -32 - Math.random() * 40,
            maxLife: 1.0,
          });
        }
        onHudUpdate(buildSnapshot());
      },

      applyMiniGameReward: (coinsEarned: number, happinessGain: number) => {
        const s = simRef.current;
        soundEngine.unlock();
        s.happiness = clamp(s.happiness + happinessGain, 0, 100);
        s.energy = clamp(s.energy - 8, 0, 100);
        const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
        addXpAndCoins(12, Math.max(0, coinsEarned), catPos.x, catPos.y);
        if (coinsEarned > 0 || happinessGain > 0) {
          soundEngine.playChime();
          for (let i = 0; i < 6; i++) {
            spawnParticle('heart_sparkle', catPos.x + (Math.random() - 0.5) * 52, catPos.y - 10, {
              color: '#F472B6',
              size: 8,
              vx: (Math.random() - 0.5) * 40,
              vy: -32 - Math.random() * 20,
              maxLife: 1.0,
            });
          }
        }
        onHudUpdate(buildSnapshot());
      },

      applyShopItem: (item: ShopItem): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        if (s.coins < item.price) return false;

        s.coins -= item.price;
        s.bowlAmount = 1;
        s.bowlTreatType = item.id;
        s.hunger = clamp(s.hunger + item.hungerDelta * 0.4, 0, 100);
        s.mealHungerRemaining = Math.max(0, Math.round(item.hungerDelta * 0.6));
        s.pendingTreatBonus = {
          happiness: item.happinessDelta,
          energy: item.energyDelta,
        };
        s.idleZoomies = false;
        if (s.behavior === 'SLEEPING' || s.behavior === 'ROLLING') {
          s.behavior = 'WALKING';
        }
        s.targetNx = BOWL_POS.nx + 0.06;
        s.targetNy = BOWL_POS.ny;
        soundEngine.playMeow(1.15);
        soundEngine.playChime();
        resetLowHungerNotificationAfterFeed(
          Math.min(100, s.hunger + item.hungerDelta * 0.6),
          OFFLINE_HUNGER_DECAY_PER_SEC
        );
        onHudUpdate(buildSnapshot());
        return true;
      },

      buyOrEquipBackground: (bgId: RoomBackgroundId): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        if (s.unlockedBackgrounds.includes(bgId)) {
          s.activeBackground = bgId;
          soundEngine.playChime();
          onHudUpdate(buildSnapshot());
          return true;
        }
        const option = ROOM_BACKGROUNDS.find((b) => b.id === bgId);
        if (!option || s.coins < option.price) return false;
        s.coins -= option.price;
        s.unlockedBackgrounds = [...s.unlockedBackgrounds, bgId];
        s.activeBackground = bgId;
        soundEngine.playChime();
        const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: `Suasana Baru: ${option.name}!`,
          color: '#FDE68A',
          size: 14,
          vy: -28,
          maxLife: 1.5,
        });
        onHudUpdate(buildSnapshot());
        return true;
      },

      buyOrEquipBed: (bedId: CatBedId): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        if (s.unlockedBeds.includes(bedId)) {
          s.activeBed = bedId;
          soundEngine.playChime();
          onHudUpdate(buildSnapshot());
          return true;
        }
        const option = CAT_BEDS.find((b) => b.id === bedId);
        if (!option || s.coins < option.price) return false;
        s.coins -= option.price;
        s.unlockedBeds = [...s.unlockedBeds, bedId];
        s.activeBed = bedId;
        soundEngine.playChime();
        const bedPos = roomToScreen(s.bedNx, s.bedNy - 0.04, s.lastRoomTransform);
        spawnParticle('text', bedPos.x, bedPos.y - 34, {
          label: `Kasur Baru: ${option.name}!`,
          color: '#A7F3D0',
          size: 14,
          vy: -28,
          maxLife: 1.5,
        });
        onHudUpdate(buildSnapshot());
        return true;
      },

      buyOrEquipToy: (toyId: CatToyId): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        if (s.unlockedToys.includes(toyId)) {
          s.activeToy = toyId;
          soundEngine.playChime();
          if (s.toy.active) {
            tossToyInternal(s.toy.nx, s.toy.ny);
          }
          onHudUpdate(buildSnapshot());
          return true;
        }
        const option = CAT_TOYS.find((t) => t.id === toyId);
        if (!option || s.coins < option.price) return false;
        s.coins -= option.price;
        s.unlockedToys = [...s.unlockedToys, toyId];
        s.activeToy = toyId;
        soundEngine.playChime();
        const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: `Mainan Baru: ${option.name}!`,
          color: '#FDE68A',
          size: 14,
          vy: -28,
          maxLife: 1.5,
        });
        if (s.toy.active) {
          tossToyInternal(s.toy.nx, s.toy.ny);
        }
        onHudUpdate(buildSnapshot());
        return true;
      },

      buyOrEquipAccessory: (accId: CatAccessoryId): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        const option = CAT_ACCESSORIES.find((a) => a.id === accId);
        if (!option) return false;

        const isUnlocked = s.unlockedAccessories.includes(accId);
        if (!isUnlocked) {
          if (s.coins < option.price) return false;
          s.coins -= option.price;
          s.unlockedAccessories = [...s.unlockedAccessories, accId];
        }

        if (option.slot === 'hat') {
          const nextHat = s.equippedHat === accId ? 'none' : (accId as CatHatId);
          s.equippedHat = nextHat;
        } else if (option.slot === 'glasses') {
          const nextGlasses = s.equippedGlasses === accId ? 'none' : (accId as CatGlassesId);
          s.equippedGlasses = nextGlasses;
        } else {
          const nextScarf = s.equippedScarf === accId ? 'default' : (accId as CatScarfId);
          s.equippedScarf = nextScarf;
        }

        const isNowEquipped =
          s.equippedHat === accId ||
          s.equippedGlasses === accId ||
          s.equippedScarf === accId;

        if (!isUnlocked) {
          soundEngine.playChime();
          const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: `Kostum Baru: ${option.name}!`,
            color: '#FDE68A',
            size: 14,
            vy: -28,
            maxLife: 1.5,
          });
          for (let i = 0; i < 5; i++) {
            spawnParticle('sparkle', catPos.x + (Math.random() - 0.5) * 44, catPos.y - 12, {
              color: '#FBBF24',
              size: 7 + Math.random() * 4,
              vx: (Math.random() - 0.5) * 65,
              vy: -30 - Math.random() * 40,
              maxLife: 0.9,
            });
          }
        } else if (isNowEquipped) {
          soundEngine.playChime();
        } else {
          soundEngine.playBounce();
        }

        onHudUpdate(buildSnapshot());
        return true;
      },

      unequipAllAccessories: () => {
        const s = simRef.current;
        soundEngine.unlock();
        s.equippedHat = 'none';
        s.equippedGlasses = 'none';
        s.equippedScarf = 'default';
        soundEngine.playBounce();
        onHudUpdate(buildSnapshot());
      },

      getSaveData: (): SaveData => {
        const s = simRef.current;
        const now = Date.now();
        return {
          name: s.name,
          breed: s.breed,
          personality: s.personality,
          hunger: s.hunger,
          happiness: s.happiness,
          cleanliness: s.cleanliness,
          energy: s.energy,
          health: s.health,
          isSick: s.isSick,
          affectionXp: s.affectionXp,
          level: s.level,
          coins: s.coins,
          day: s.day,
          timeOfDay: s.timeOfDay,
          weather: s.weather,
          lifeStage: s.lifeStage,
          stageElapsedSec: s.stageElapsedSec,
          careMistakes: s.careMistakes,
          adultBranch: s.adultBranch,
          totalCatches: s.totalCatches,
          totalPets: s.totalPets,
          activeBackground: s.activeBackground,
          unlockedBackgrounds: [...s.unlockedBackgrounds],
          activeBed: s.activeBed,
          unlockedBeds: [...s.unlockedBeds],
          activeToy: s.activeToy,
          unlockedToys: [...s.unlockedToys],
          equippedHat: s.equippedHat,
          equippedGlasses: s.equippedGlasses,
          equippedScarf: s.equippedScarf,
          unlockedAccessories: [...s.unlockedAccessories],
          bedNx: s.bedNx,
          bedNy: s.bedNy,
          lastFreeFeedAt: s.lastFreeFeedTime > 0 ? s.lastFreeFeedTime : undefined,
          lowCleanlinessStrikes: s.lowCleanlinessStrikes,
          wasUnder25Clean: s.wasUnder25Clean,
          lastSavedTime: now,
          savedAt: now,
        };
      },

      resetCat: (name: string, breed: CatBreed) => {
        const s = simRef.current;
        s.name = name.trim() || CAT_BREEDS[breed].defaultName;
        s.breed = breed;
        s.personality = randomPersonality();
        s.behavior = 'IDLE';
        s.nx = 0.52;
        s.ny = 0.78;
        s.z = 0;
        s.vz = 0;
        s.targetNx = 0.52;
        s.targetNy = 0.78;
        s.facing = 1;
        s.scaleX = 1;
        s.scaleY = 1;
        s.isSprinting = false;
        s.idleZoomies = false;
        s.hunger = 86;
        s.happiness = 88;
        s.cleanliness = 92;
        s.energy = 88;
        s.health = 100;
        s.isSick = false;
        s.sickReason = null;
        s.lowCleanlinessStrikes = 0;
        s.wasUnder25Clean = false;
        s.dirtyStayTimer = 0;
        s.cleanHealthyTimer = 0;
        s.chronicSickCheckTimer = 4.0;
        s.brushScrubAccum = 0;
        s.brushStrokeCooldown = 0;
        s.brushHintCooldown = 0;
        s.recoveryTimer = 0;
        s.starveGraceTimer = 0;
        s.affectionXp = 0;
        s.level = 1;
        s.coins = 35;
        s.day = 1;
        s.timeOfDay = 0.14;
        s.weather = 'cerah';
        s.weatherTimer = 32;
        s.lightningTimer = 7.5;
        s.weatherFx.weather = 'cerah';
        s.weatherFx.prevWeather = 'cerah';
        s.weatherFx.weatherFade = 1;
        s.weatherFx.lightningFlash = 0;
        s.lifeStage = 'baby';
        s.stageElapsedSec = 0;
        s.careMistakes = 0;
        s.careMistakeCooldown = 0;
        s.adultBranch = 'prima';
        s.totalCatches = 0;
        s.totalPets = 0;
        s.activeBackground = 'classic_home';
        s.unlockedBackgrounds = ['classic_home'];
        s.activeBed = 'kasur_kucing';
        s.unlockedBeds = ['kasur_kucing'];
        s.activeToy = 'yarn_ball';
        s.unlockedToys = ['yarn_ball'];
        s.equippedHat = 'none';
        s.equippedGlasses = 'none';
        s.equippedScarf = 'default';
        s.unlockedAccessories = [];
        s.bedNx = DEFAULT_BED_POS.nx;
        s.bedNy = DEFAULT_BED_POS.ny;
        s.bedDragCandidate = false;
        s.isDraggingBed = false;
        s.bowlAmount = 0;
        s.bowlTreatType = 'kibble';
        s.mealHungerRemaining = 0;
        s.lastFreeFeedTime = 0;
        s.toy.active = false;
        s.toy.catchCooldown = 0;
        s.idleDecisionTimer = 1.6;
        s.idleMeowTimer = 5.5;
        resetLowHungerNotificationAfterFeed(s.hunger, OFFLINE_HUNGER_DECAY_PER_SEC);
        onHudUpdate(buildSnapshot());
      },

      loadFromSave: (save: SaveData) => {
        const s = simRef.current;
        s.name = save.name;
        s.breed = save.breed in CAT_BREEDS ? save.breed : 'oren';
        s.personality =
          save.personality && save.personality in PERSONALITY_MODS
            ? save.personality
            : randomPersonality();

        const offline = calculateOfflineDecay(
          save.hunger,
          save.health ?? 100,
          save.lastSavedTime ?? save.savedAt
        );
        s.hunger = offline.hunger;
        s.happiness = save.happiness;
        s.cleanliness = save.cleanliness;
        s.energy = save.energy;
        s.health = offline.health;
        s.lowCleanlinessStrikes =
          typeof save.lowCleanlinessStrikes === 'number' &&
          Number.isFinite(save.lowCleanlinessStrikes)
            ? Math.max(0, save.lowCleanlinessStrikes)
            : 0;
        s.wasUnder25Clean = Boolean(save.wasUnder25Clean);
        s.dirtyStayTimer = 0;
        s.cleanHealthyTimer = 0;
        s.chronicSickCheckTimer = 4.0;
        s.brushScrubAccum = 0;
        s.brushStrokeCooldown = 0;
        s.brushHintCooldown = 0;
        if (s.cleanliness <= 0) {
          s.cleanliness = 0;
          s.health = Math.min(s.health, 44);
          s.sickReason = 'dirty_zero';
        } else {
          s.sickReason = s.health < 50 ? 'health' : null;
        }
        s.isSick = s.health < 50 || Boolean(save.isSick && s.health < 50);
        s.recoveryTimer = 0;
        s.starveGraceTimer = 0;
        s.affectionXp = save.affectionXp;
        s.level = save.level;
        s.coins = save.coins;
        s.day = save.day;
        s.timeOfDay = save.timeOfDay;
        const loadedWeather: WeatherType =
          save.weather === 'hujan' || save.weather === 'malam' || save.weather === 'cerah'
            ? save.weather
            : save.timeOfDay > 0.75
            ? 'malam'
            : 'cerah';
        s.weather = loadedWeather;
        s.weatherTimer = 30;
        s.lightningTimer = 7.5;
        s.weatherFx.weather = loadedWeather;
        s.weatherFx.prevWeather = loadedWeather;
        s.weatherFx.weatherFade = 1;
        s.weatherFx.lightningFlash = 0;
        const validStages: LifeStage[] = ['baby', 'child', 'teen', 'adult', 'senior'];
        s.lifeStage =
          save.lifeStage && validStages.includes(save.lifeStage)
            ? save.lifeStage
            : save.day >= 10
            ? 'senior'
            : save.day >= 3
            ? 'adult'
            : 'baby';
        s.stageElapsedSec =
          typeof save.stageElapsedSec === 'number' && Number.isFinite(save.stageElapsedSec)
            ? Math.max(0, save.stageElapsedSec)
            : 0;
        s.careMistakes =
          typeof save.careMistakes === 'number' && Number.isFinite(save.careMistakes)
            ? Math.max(0, save.careMistakes)
            : 0;
        s.careMistakeCooldown = 0;
        s.adultBranch =
          save.adultBranch === 'prima' ||
          save.adultBranch === 'mandiri' ||
          save.adultBranch === 'sensitif'
            ? save.adultBranch
            : 'prima';
        s.totalCatches = save.totalCatches;
        s.totalPets = save.totalPets;
        s.activeBackground = save.activeBackground ?? 'classic_home';
        s.unlockedBackgrounds =
          save.unlockedBackgrounds && save.unlockedBackgrounds.length > 0
            ? save.unlockedBackgrounds
            : ['classic_home'];
        s.activeBed = normalizeBedId(save.activeBed);
        s.unlockedBeds =
          save.unlockedBeds && save.unlockedBeds.length > 0
            ? Array.from(new Set(save.unlockedBeds.map((id) => normalizeBedId(id))))
            : ['kasur_kucing'];
        if (!s.unlockedBeds.includes('kasur_kucing')) {
          s.unlockedBeds.push('kasur_kucing');
        }
        s.activeToy = normalizeToyId(save.activeToy);
        s.unlockedToys =
          save.unlockedToys && save.unlockedToys.length > 0
            ? Array.from(new Set(save.unlockedToys.map((id) => normalizeToyId(id))))
            : ['yarn_ball'];
        if (!s.unlockedToys.includes('yarn_ball')) {
          s.unlockedToys.push('yarn_ball');
        }
        const validAccIds = new Set(CAT_ACCESSORIES.map((a) => a.id));
        s.unlockedAccessories = Array.isArray(save.unlockedAccessories)
          ? Array.from(new Set(save.unlockedAccessories.filter((id) => validAccIds.has(id))))
          : [];
        s.equippedHat =
          save.equippedHat && save.equippedHat !== 'none' && s.unlockedAccessories.includes(save.equippedHat)
            ? save.equippedHat
            : 'none';
        s.equippedGlasses =
          save.equippedGlasses &&
          save.equippedGlasses !== 'none' &&
          s.unlockedAccessories.includes(save.equippedGlasses)
            ? save.equippedGlasses
            : 'none';
        s.equippedScarf =
          save.equippedScarf &&
          save.equippedScarf !== 'default' &&
          s.unlockedAccessories.includes(save.equippedScarf)
            ? save.equippedScarf
            : 'default';
        s.bedNx = clamp(save.bedNx ?? DEFAULT_BED_POS.nx, BED_BOUNDS.minX, BED_BOUNDS.maxX);
        s.bedNy = clamp(save.bedNy ?? DEFAULT_BED_POS.ny, BED_BOUNDS.minY, BED_BOUNDS.maxY);
        s.bedDragCandidate = false;
        s.isDraggingBed = false;
        s.behavior = 'IDLE';
        s.nx = 0.52;
        s.ny = 0.78;
        s.z = 0;
        s.vz = 0;
        s.idleZoomies = false;
        s.bowlAmount = 0;
        s.bowlTreatType = 'kibble';
        s.mealHungerRemaining = 0;
        s.lastFreeFeedTime =
          typeof save.lastFreeFeedAt === 'number' && Number.isFinite(save.lastFreeFeedAt)
            ? save.lastFreeFeedAt
            : 0;
        s.toy.active = false;
        s.toy.catchCooldown = 0;
        s.idleMeowTimer = 5.5;

        setLowHungerNotifiedFlag(false);
        if (s.hunger <= 20) {
          sendLowHungerNotification();
        } else {
          scheduleLowHungerNotification(s.hunger, OFFLINE_HUNGER_DECAY_PER_SEC);
        }

        if (offline.elapsedSeconds >= 60 && offline.hungerLost >= 1) {
          const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
          const healthNote =
            offline.healthLost >= 1 ? ` · Sehat -${Math.round(offline.healthLost)}%` : '';
          spawnParticle('text', catPos.x, catPos.y - 36, {
            label: `Lama pergi · Kenyang -${Math.round(offline.hungerLost)}%${healthNote}`,
            color: offline.dippedBelow20 ? '#FCA5A5' : '#FDE68A',
            size: 13,
            vy: -24,
            maxLife: 2.2,
          });
        }

        onHudUpdate(buildSnapshot());
      },
    }));

    useEffect(() => {
      ROOM_BACKGROUNDS.forEach((bg) => {
        const img = new Image();
        img.src = bg.src;
        backdropImgsRef.current[bg.id] = img;
      });

      CAT_BEDS.forEach((bed) => {
        const img = new Image();
        img.src = bed.imgSrc;
        bedImgsRef.current[bed.id] = img;
      });

      (Object.keys(CAT_BREEDS) as CatBreed[]).forEach((breedKey) => {
        const sheetImg = new Image();
        sheetImg.src = CAT_BREEDS[breedKey].spriteSheet;
        spriteSheetsRef.current[breedKey] = sheetImg;

        const babySheetImg = new Image();
        babySheetImg.src = CAT_BREEDS[breedKey].babySpriteSheet;
        babySpriteSheetsRef.current[breedKey] = babySheetImg;
      });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animId = 0;
      let lastTime = performance.now();
      let hudSyncAccum = 0;
      let gameOverFired = false;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      resize();
      window.addEventListener('resize', resize);

      const handleBlur = () => {
        simRef.current.pointerDown = false;
      };
      window.addEventListener('blur', handleBlur);

      const step = (now: number) => {
        const rawDt = (now - lastTime) / 1000;
        lastTime = now;
        const dt = Math.min(rawDt, 0.05);
        const s = simRef.current;
        const gState = gameStateRef.current;

        if (gState === 'PLAYING' && s.health > 5) {
          gameOverFired = false;
        }

        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const rt: RoomTransform = computeRoomTransform(viewW, viewH);
        s.lastRoomTransform = rt;

        if (gState === 'PLAYING' || gState === 'TITLE_MENU') {
          if (s.hitstopTimer > 0) {
            s.hitstopTimer = Math.max(0, s.hitstopTimer - dt);
          } else {
            s.time += dt;
            s.petCoinCooldown = Math.max(0, s.petCoinCooldown - dt);
            s.brushCoinCooldown = Math.max(0, s.brushCoinCooldown - dt);
            s.brushStrokeCooldown = Math.max(0, s.brushStrokeCooldown - dt);
            s.brushHintCooldown = Math.max(0, s.brushHintCooldown - dt);
            s.shakeIntensity = Math.max(0, s.shakeIntensity - dt * 22);
            s.toy.catchCooldown = Math.max(0, s.toy.catchCooldown - dt);

            s.scaleX += (1 - s.scaleX) * Math.min(1, dt * 12);
            s.scaleY += (1 - s.scaleY) * Math.min(1, dt * 12);

            if (gState === 'TITLE_MENU') {
              s.breed = previewBreedRef.current;
              if (s.behavior === 'IDLE') {
                s.idleDecisionTimer -= dt;
                if (s.idleDecisionTimer <= 0) {
                  s.idleDecisionTimer = 2.6 + Math.random() * 2.5;
                  const roll = Math.random();
                  if (roll < 0.52) {
                    s.idleZoomies = Math.random() < 0.35;
                    s.targetNx = 0.42 + Math.random() * 0.35;
                    s.targetNy = 0.72 + Math.random() * 0.14;
                    s.behavior = s.idleZoomies ? 'PLAYING' : 'WALKING';
                  } else if (roll < 0.78) {
                    s.behavior = 'GROOMING';
                    s.groomTimer = 2.0;
                  } else {
                    s.behavior = 'STRETCHING';
                    s.stretchTimer = 1.6;
                  }
                }
              }
            }

            if (gState === 'PLAYING') {
              stepWeatherFx(s.weatherFx, dt, s.activeBackground);

              const targetTod =
                s.weather === 'malam' ? 0.88 : s.weather === 'hujan' ? 0.56 : 0.22;
              s.timeOfDay += (targetTod - s.timeOfDay) * Math.min(1, dt * 0.45);

              if (s.weather === 'hujan') {
                s.lightningTimer -= dt;
                if (s.lightningTimer <= 0) {
                  s.lightningTimer = 6.5 + Math.random() * 8.0;
                  s.weatherFx.lightningFlash = 0.85;
                }
              }

              s.weatherTimer -= dt;
              if (s.weatherTimer <= 0) {
                const prevW = s.weather;
                let nextWeather: WeatherType = 'cerah';
                if (prevW === 'cerah') {
                  nextWeather = Math.random() < 0.58 ? 'hujan' : 'malam';
                } else if (prevW === 'hujan') {
                  nextWeather = Math.random() < 0.55 ? 'malam' : 'cerah';
                } else {
                  nextWeather = 'cerah';
                  s.day += 1;
                  s.coins += 10;
                  soundEngine.playChime();
                  const pos = roomToScreen(s.nx, s.ny - 0.1, rt);
                  spawnParticle('text', pos.x, pos.y - 30, {
                    label: `Hari ke-${s.day}! +10 Koin`,
                    color: '#A7F3D0',
                    size: 16,
                    vy: -32,
                    maxLife: 1.8,
                  });
                }

                s.weatherFx.prevWeather = prevW;
                s.weather = nextWeather;
                s.weatherFx.weather = nextWeather;
                s.weatherFx.weatherFade = 0;
                s.weatherTimer = 30 + Math.random() * 14;

                const weatherNotice =
                  nextWeather === 'hujan'
                    ? 'Cuaca: Hujan turun'
                    : nextWeather === 'malam'
                    ? 'Cuaca: Malam tiba'
                    : 'Cuaca: Pagi cerah';
                const weatherColor =
                  nextWeather === 'hujan'
                    ? '#93C5FD'
                    : nextWeather === 'malam'
                    ? '#C4B5FD'
                    : '#FDE68A';
                spawnParticle('text', viewW * 0.5, Math.max(82, viewH * 0.18), {
                  label: weatherNotice,
                  color: weatherColor,
                  size: 14,
                  vx: 0,
                  vy: -16,
                  maxLife: 2.0,
                });
              }

              // Tahap Pertumbuhan (Life Stages) & Care Mistakes
              s.stageElapsedSec += dt;
              s.careMistakeCooldown = Math.max(0, s.careMistakeCooldown - dt);

              if (
                (s.lifeStage === 'child' || s.lifeStage === 'teen') &&
                s.careMistakeCooldown <= 0 &&
                (s.hunger < 15 || s.cleanliness < 15 || s.happiness < 15 || s.isSick)
              ) {
                s.careMistakes += 1;
                s.careMistakeCooldown = 40;
              }

              if (s.lifeStage === 'baby' && s.stageElapsedSec >= LIFE_STAGES.baby.durationSec) {
                s.lifeStage = 'child';
                s.stageElapsedSec = 0;
                celebrateStageEvolution('child', 'Mini-Game Terbuka');
              } else if (
                s.lifeStage === 'child' &&
                s.stageElapsedSec >= LIFE_STAGES.child.durationSec
              ) {
                s.lifeStage = 'teen';
                s.stageElapsedSec = 0;
                celebrateStageEvolution('teen');
              } else if (
                s.lifeStage === 'teen' &&
                s.stageElapsedSec >= LIFE_STAGES.teen.durationSec
              ) {
                const branch: AdultEvolutionBranch =
                  s.careMistakes <= 2 ? 'prima' : s.careMistakes <= 5 ? 'mandiri' : 'sensitif';
                s.adultBranch = branch;
                s.lifeStage = 'adult';
                s.stageElapsedSec = 0;
                const branchTitle =
                  branch === 'prima'
                    ? 'Dewasa Prima'
                    : branch === 'mandiri'
                    ? 'Dewasa Mandiri'
                    : 'Dewasa Sensitif';
                celebrateStageEvolution('adult', branchTitle);
              } else if (s.lifeStage === 'adult' && s.day >= 10) {
                s.lifeStage = 'senior';
                s.stageElapsedSec = 0;
                celebrateStageEvolution('senior');
              }

              const stageDecayMult =
                s.lifeStage === 'baby'
                  ? 1.45
                  : s.lifeStage === 'child'
                  ? 1.1
                  : s.lifeStage === 'teen'
                  ? 1.05
                  : s.lifeStage === 'senior'
                  ? 1.38
                  : s.adultBranch === 'prima'
                  ? 0.85
                  : 1.0;

              const baseHungerDecay =
                (hungerSpeedRef.current === 'santai' ? 0.16 : 0.28) * stageDecayMult;
              const pMod = PERSONALITY_MODS[s.personality];
              // Efek Stres: jika bahagia < 20, penurunan kenyang & energi 1.5x lebih cepat
              const stressMult = s.happiness < 20 ? 1.5 : 1.0;

              if (s.behavior === 'SLEEPING') {
                // Saat tidur, energi pulih cepat (+2.5/detik) hingga 100
                s.energy = clamp(s.energy + dt * 2.5, 0, 100);
                s.hunger = clamp(s.hunger - dt * baseHungerDecay * 0.5 * stressMult, 0, 100);
                const sleepHappyPenalty =
                  (s.hunger < 25 ? 0.4 : 0) + (s.cleanliness < 25 ? 0.3 : 0);
                s.happiness = clamp(
                  s.happiness - dt * (0.12 * stageDecayMult + sleepHappyPenalty),
                  0,
                  100
                );
                s.cleanliness = clamp(s.cleanliness - dt * 0.12 * stageDecayMult, 0, 100);

                s.zzzTimer -= dt;
                if (s.zzzTimer <= 0) {
                  s.zzzTimer = 0.95;
                  const pScale = Math.max(0.55, rt.scale * 0.85);
                  const cPos = roomToScreen(s.nx + 0.02, s.ny - 0.055, rt);
                  spawnParticle('zzz', cPos.x + (Math.random() - 0.5) * 14 * pScale, cPos.y, {
                    vx: 11 * pScale,
                    vy: -26 * pScale,
                    size: 15 * pScale,
                    maxLife: 1.65,
                    swayAmp: 5 * pScale,
                    swayFreq: 2.6,
                    phase: Math.random() * Math.PI * 2,
                  });
                  spawnParticle(
                    'sleep_cloud',
                    cPos.x + (Math.random() - 0.5) * 44 * pScale,
                    cPos.y - 6 * pScale,
                    {
                      color: 'rgba(224, 242, 254, 0.92)',
                      vx: (Math.random() - 0.3) * 10 * pScale,
                      vy: -19 * pScale,
                      size: (11 + Math.random() * 4) * pScale,
                      maxLife: 2.0,
                      swayAmp: 7 * pScale,
                      swayFreq: 2.0,
                      phase: Math.random() * Math.PI * 2,
                    }
                  );
                }

                if (s.energy >= 100) {
                  s.energy = 100;
                  s.behavior = 'STRETCHING';
                  s.stretchTimer = 1.4;
                  soundEngine.playMeow(1.02);
                }
              } else {
                const isBallPlay = s.behavior === 'PLAYING' && s.toy.active;
                const toyOpt = getToyOption(s.activeToy);
                const playEnergyMult = isBallPlay ? toyOpt.energyDrainMult : 1.0;
                const playHungerMult = isBallPlay ? toyOpt.hungerDrainMult : 1.0;
                const hungryEnergyMult = s.hunger <= 10 ? 2.8 : s.hunger <= 30 ? 2.1 : 1.0;
                const baseEnergyDrain = 0.45 * pMod.energyDrain * stageDecayMult;
                const sensitiveHappyMult =
                  s.lifeStage === 'adult' && s.adultBranch === 'sensitif' ? 1.15 : 1.0;

                s.hunger = clamp(
                  s.hunger - dt * baseHungerDecay * playHungerMult * stressMult,
                  0,
                  100
                );
                s.cleanliness = clamp(s.cleanliness - dt * 0.28 * stageDecayMult, 0, 100);
                s.energy = clamp(
                  s.energy - dt * baseEnergyDrain * playEnergyMult * hungryEnergyMult * stressMult,
                  0,
                  100
                );

                // Dampak ke Bahagia
                if (isBallPlay) {
                  s.happiness = clamp(
                    s.happiness + dt * 1.6 * toyOpt.happinessRateMult * pMod.ballHappy,
                    0,
                    100
                  );
                } else {
                  const happyPenalty =
                    (s.hunger < 25 ? 0.4 : 0) +
                    (s.cleanliness < 25 ? 0.3 : 0) +
                    (s.energy < 20 ? 0.3 : 0);
                  s.happiness = clamp(
                    s.happiness - dt * (0.4 * stageDecayMult * sensitiveHappyMult + happyPenalty),
                    0,
                    100
                  );
                }

                // Batasan Aksi saat bermain: jika energi < 20 atau kenyang < 20, hentikan sesi main
                if (s.toy.active && (s.energy < 20 || s.hunger < 20)) {
                  s.toy.active = false;
                  if (s.behavior === 'PLAYING') s.behavior = 'IDLE';
                  onToySessionEndRef.current?.();
                }

                // Kelelahan Ekstrem: jika energi <= 0, otomatis tertidur dan bahagia -5
                if (s.energy <= 0) {
                  s.energy = 0;
                  s.toy.active = false;
                  s.idleZoomies = false;
                  s.behavior = 'SLEEPING';
                  s.facing = 1;
                  s.happiness = clamp(s.happiness - 5, 0, 100);
                  soundEngine.playSleep();
                  const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                  spawnParticle('text', catPos.x, catPos.y - 34, {
                    label: 'Kelelahan! Tertidur (-5 Bahagia)',
                    color: '#93C5FD',
                    size: 14,
                    vy: -28,
                    maxLife: 1.6,
                  });
                  onToySessionEndRef.current?.();
                }
              }

              // Kirim pengingat notifikasi saat kenyang menyentuh 20%
              if (s.hunger <= 20) {
                sendLowHungerNotification();
              }

              // Cute periodic meow when idle / wandering calmly
              if (
                !s.isSick &&
                !s.toy.active &&
                s.hunger > 20 &&
                (s.behavior === 'IDLE' ||
                  s.behavior === 'ROLLING' ||
                  s.behavior === 'STRETCHING' ||
                  s.behavior === 'WALKING')
              ) {
                s.idleMeowTimer -= dt;
                if (s.idleMeowTimer <= 0) {
                  s.idleMeowTimer = 7.5 + pMod.meowIntervalAdd + Math.random() * 6.5;
                  soundEngine.playCuteIdleMeow();
                }
              }

              // Hungry sad meow reminder
              if (s.hunger <= 20 && s.behavior !== 'EATING' && s.behavior !== 'SLEEPING') {
                s.hungryMeowTimer -= dt;
                if (s.hungryMeowTimer <= 0) {
                  s.hungryMeowTimer = 8.5;
                  soundEngine.playMeow(0.84);
                }
              }

              // Dampak ke Kesehatan & Pemulihan Obat
              if (s.recoveryTimer > 0) {
                s.recoveryTimer = Math.max(0, s.recoveryTimer - dt);
                const healRate = s.hunger > 20 ? 5.2 : 3.2;
                s.health = clamp(s.health + dt * healRate, 0, 100);
                s.happiness = clamp(s.happiness + dt * 0.9, 0, 100);

                s.healParticleTimer -= dt;
                if (s.healParticleTimer <= 0) {
                  s.healParticleTimer = 0.6;
                  const pScale = Math.max(0.55, rt.scale * 0.85);
                  const cPos = roomToScreen(s.nx, s.ny - 0.05, rt);
                  const kind = Math.random() < 0.4 ? 'heart_sparkle' : 'sparkle';
                  spawnParticle(
                    kind,
                    cPos.x + (Math.random() - 0.5) * 52 * pScale,
                    cPos.y - 10 * pScale,
                    {
                      color: '#34D399',
                      size: (kind === 'heart_sparkle' ? 8.5 : 8) * pScale,
                      vx: (Math.random() - 0.5) * 14 * pScale,
                      vy: -30 * pScale,
                      maxLife: 1.05,
                      swayAmp: 5 * pScale,
                      swayFreq: 3.0,
                      phase: Math.random() * Math.PI * 2,
                    }
                  );
                }
              } else {
                const healthDrain =
                  (s.hunger < 20 ? 0.35 : 0) + (s.cleanliness < 15 ? 0.2 : 0);
                if (healthDrain > 0) {
                  s.health = clamp(s.health - dt * healthDrain, 0, 100);
                }
              }

              // Regenerasi Kesehatan: jika kenyang, bersih, energi, dan bahagia > 75 secara bersamaan
              if (
                s.hunger > 75 &&
                s.cleanliness > 75 &&
                s.energy > 75 &&
                s.happiness > 75 &&
                s.health < 100
              ) {
                s.health = clamp(s.health + dt * 0.5, 0, 100);
              }

              // Pelacakan riwayat kebersihan rendah (< 25) & pemicu sakit
              if (s.cleanliness < 25) {
                if (!s.wasUnder25Clean) {
                  s.wasUnder25Clean = true;
                  s.lowCleanlinessStrikes += 1;
                }
                s.dirtyStayTimer += dt;
                if (s.dirtyStayTimer >= 25) {
                  s.dirtyStayTimer = 0;
                  s.lowCleanlinessStrikes += 1;
                }
                s.cleanHealthyTimer = 0;
              } else {
                s.dirtyStayTimer = 0;
                if (s.cleanliness >= 30) {
                  s.wasUnder25Clean = false;
                }
                if (s.cleanliness >= 90 && !s.isSick) {
                  s.cleanHealthyTimer += dt;
                  if (s.cleanHealthyTimer >= 45 && s.lowCleanlinessStrikes > 0) {
                    s.cleanHealthyTimer = 0;
                    s.lowCleanlinessStrikes -= 1;
                  }
                }
              }

              // Kucing langsung sakit ketika kebersihan menjadi 0
              if (s.cleanliness <= 0 && s.recoveryTimer <= 0) {
                s.cleanliness = 0;
                if (!s.isSick) {
                  s.health = Math.min(s.health, 44);
                  s.isSick = true;
                  s.sickReason = 'dirty_zero';
                  soundEngine.playMeow(0.76);
                  const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                  spawnParticle('text', catPos.x, catPos.y - 36, {
                    label: 'Kebersihan 0%! Kucing jatuh sakit!',
                    color: '#FCA5A5',
                    size: 14,
                    vy: -26,
                    maxLife: 1.7,
                  });
                }
              }

              // Jika kebersihan terlalu sering di bawah 25, kucing bisa sakit acak walau kebersihan 100%
              if (
                s.lowCleanlinessStrikes >= CHRONIC_DIRTY_STRIKES &&
                !s.isSick &&
                s.recoveryTimer <= 0
              ) {
                s.chronicSickCheckTimer -= dt;
                if (s.chronicSickCheckTimer <= 0) {
                  s.chronicSickCheckTimer = 4.0;
                  const sickChance = Math.min(
                    0.45,
                    0.14 + (s.lowCleanlinessStrikes - CHRONIC_DIRTY_STRIKES) * 0.08
                  );
                  if (Math.random() < sickChance) {
                    s.health = Math.min(s.health, 44);
                    s.isSick = true;
                    s.sickReason = 'chronic_dirty';
                    s.lowCleanlinessStrikes = Math.max(0, s.lowCleanlinessStrikes - 2);
                    soundEngine.playMeow(0.76);
                    const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                    spawnParticle('text', catPos.x, catPos.y - 36, {
                      label: 'Terlalu sering kotor! Kucing jatuh sakit',
                      color: '#FCA5A5',
                      size: 14,
                      vy: -26,
                      maxLife: 1.7,
                    });
                  }
                }
              }

              // Jika kesehatan < 50, kucing masuk status Sakit
              s.isSick = s.health < 50;
              if (!s.isSick) {
                s.sickReason = null;
              } else if (!s.sickReason) {
                s.sickReason = 'health';
              }

              if (s.health <= 0 && !gameOverFired) {
                gameOverFired = true;
                clearLowHungerNotificationSchedule();
                onGameOver(buildSnapshot());
              }

              // Ambient mood-based particles around the cat
              if (s.behavior !== 'SLEEPING' && s.recoveryTimer <= 0) {
                s.moodParticleTimer -= dt;
                if (s.moodParticleTimer <= 0) {
                  const pScale = Math.max(0.55, rt.scale * 0.85);
                  const catCenter = roomToScreen(s.nx, s.ny - 0.06, rt);
                  const ox = (Math.random() - 0.5) * 68 * pScale;
                  const oy = (Math.random() - 0.5) * 28 * pScale;

                  if (s.isSick) {
                    s.moodParticleTimer = 1.15;
                    const useTear = Math.random() < 0.45;
                    spawnParticle(useTear ? 'tear_drop' : 'dust_puff', catCenter.x + ox, catCenter.y + oy, {
                      color: useTear ? '#93C5FD' : 'rgba(148, 163, 184, 0.55)',
                      size: (useTear ? 6.5 : 8) * pScale,
                      vx: (Math.random() - 0.5) * 10 * pScale,
                      vy: (useTear ? 14 : -16) * pScale,
                      maxLife: 1.25,
                      swayAmp: 4 * pScale,
                      swayFreq: 2.4,
                      phase: Math.random() * Math.PI * 2,
                    });
                  } else if (s.cleanliness < 30) {
                    s.moodParticleTimer = 0.85;
                    spawnParticle('dust_puff', catCenter.x + ox, catCenter.y + 8 * pScale + oy * 0.6, {
                      color: 'rgba(148, 128, 98, 0.58)',
                      size: (7.5 + Math.random() * 3) * pScale,
                      vx: (Math.random() - 0.5) * 14 * pScale,
                      vy: (-18 - Math.random() * 10) * pScale,
                      maxLife: 1.3,
                      swayAmp: 6 * pScale,
                      swayFreq: 2.5,
                      phase: Math.random() * Math.PI * 2,
                    });
                  } else if (s.energy < 25) {
                    s.moodParticleTimer = 1.05;
                    const useZ = Math.random() < 0.35;
                    spawnParticle(
                      useZ ? 'zzz' : 'sleep_cloud',
                      catCenter.x + ox * 0.8,
                      catCenter.y - 16 * pScale + oy * 0.4,
                      {
                        color: 'rgba(224, 242, 254, 0.88)',
                        size: (useZ ? 11 : 9.5) * pScale,
                        vx: 6 * pScale,
                        vy: -16 * pScale,
                        maxLife: 1.5,
                        swayAmp: 5 * pScale,
                        swayFreq: 2.1,
                        phase: Math.random() * Math.PI * 2,
                      }
                    );
                  } else if (s.happiness <= 30) {
                    s.moodParticleTimer = 1.1;
                    spawnParticle('tear_drop', catCenter.x + ox * 0.8, catCenter.y - 10 * pScale, {
                      color: '#7DD3FC',
                      size: 6.5 * pScale,
                      vx: (Math.random() - 0.5) * 8 * pScale,
                      vy: 16 * pScale,
                      maxLife: 1.15,
                      swayAmp: 3 * pScale,
                      swayFreq: 3.0,
                      phase: Math.random() * Math.PI * 2,
                    });
                  } else if (s.hunger <= 30 && s.behavior !== 'EATING') {
                    s.moodParticleTimer = 1.25;
                    spawnParticle('dust_puff', catCenter.x + ox * 0.75, catCenter.y + oy * 0.5, {
                      color: 'rgba(251, 146, 60, 0.46)',
                      size: 7.5 * pScale,
                      vx: (Math.random() - 0.5) * 14 * pScale,
                      vy: -16 * pScale,
                      maxLife: 1.1,
                      swayAmp: 5 * pScale,
                      swayFreq: 2.8,
                      phase: Math.random() * Math.PI * 2,
                    });
                  } else if (
                    s.behavior === 'PURRING' ||
                    (s.behavior === 'PLAYING' && s.toy.active) ||
                    s.behavior === 'EATING' ||
                    s.happiness >= 75
                  ) {
                    const isActiveJoy =
                      s.behavior === 'PURRING' ||
                      (s.behavior === 'PLAYING' && s.toy.active) ||
                      s.behavior === 'EATING';
                    s.moodParticleTimer = isActiveJoy ? 0.44 : 0.78;
                    const r = Math.random();
                    const kind = r < 0.42 ? 'heart_sparkle' : r < 0.72 ? 'heart' : 'sparkle';
                    const palette =
                      kind === 'sparkle'
                        ? ['#FDE68A', '#FBBF24', '#F9A8D4']
                        : ['#FB7185', '#F472B6', '#EC6A76'];
                    const color = palette[Math.floor(Math.random() * palette.length)];
                    spawnParticle(
                      kind,
                      catCenter.x + ox,
                      catCenter.y - 10 * pScale + oy * 0.5,
                      {
                        color,
                        size: (kind === 'heart_sparkle' ? 8.5 : kind === 'heart' ? 7.5 : 7) * pScale,
                        vx: (Math.random() - 0.5) * 14 * pScale,
                        vy: (-26 - Math.random() * 14) * pScale,
                        maxLife: 1.25,
                        swayAmp: (6 + Math.random() * 4) * pScale,
                        swayFreq: 2.8 + Math.random() * 1.2,
                        phase: Math.random() * Math.PI * 2,
                      }
                    );
                  } else {
                    s.moodParticleTimer = 1.8;
                    spawnParticle('sparkle', catCenter.x + ox, catCenter.y - 6 * pScale + oy, {
                      color: '#FDE68A',
                      size: 6 * pScale,
                      vx: (Math.random() - 0.5) * 10 * pScale,
                      vy: -18 * pScale,
                      maxLife: 1.15,
                      swayAmp: 4 * pScale,
                      swayFreq: 2.2,
                      phase: Math.random() * Math.PI * 2,
                    });
                  }
                }
              }
            }

            // Active Toy physics
            if (s.toy.active) {
              s.toy.lifeTimer -= dt;

              if (s.activeToy === 'laser_pointer') {
                s.toy.z = 0;
                s.toy.vx = 0;
                s.toy.vy = 0;
              } else if (s.activeToy === 'feather_wand') {
                s.toy.nx += s.toy.vx * dt;
                s.toy.ny += s.toy.vy * dt;
                s.toy.vx *= Math.pow(0.18, dt);
                s.toy.vy *= Math.pow(0.18, dt);
                s.toy.z = clamp(0.055 + Math.sin(s.time * 4.2) * 0.014, 0.02, 0.12);
              } else if (s.activeToy === 'toy_mouse') {
                s.toy.vy = clamp(s.toy.vy + Math.sin(s.time * 2.4) * 0.03 * dt, -0.065, 0.065);
                if (Math.abs(s.toy.vx) < 0.1) {
                  s.toy.vx = (s.toy.facing || 1) * 0.145;
                } else {
                  s.toy.vx = Math.sign(s.toy.vx) * 0.145;
                }
                s.toy.nx += s.toy.vx * dt;
                s.toy.ny += s.toy.vy * dt;
                s.toy.z = 0;
                if (Math.abs(s.toy.vx) > 0.03) {
                  s.toy.facing = s.toy.vx >= 0 ? 1 : -1;
                }
              } else {
                s.toy.nx += s.toy.vx * dt;
                s.toy.ny += s.toy.vy * dt;
                s.toy.rotation += (s.toy.vx * 18 + s.toy.vy * 8) * dt;

                s.toy.vz -= 1.05 * dt;
                s.toy.z += s.toy.vz * dt;
                if (s.toy.z <= 0) {
                  s.toy.z = 0;
                  if (Math.abs(s.toy.vz) > 0.08) {
                    s.toy.vz = -s.toy.vz * 0.56;
                    soundEngine.playBounce();
                  } else {
                    s.toy.vz = 0;
                  }
                  s.toy.vx *= Math.pow(0.24, dt);
                  s.toy.vy *= Math.pow(0.24, dt);
                }
                s.toy.z = clamp(s.toy.z, 0, 0.16);
              }

              if (s.toy.nx < FLOOR_BOUNDS.minX) {
                s.toy.nx = FLOOR_BOUNDS.minX;
                s.toy.vx = Math.abs(s.toy.vx) * (s.activeToy === 'toy_mouse' ? 1 : 0.78);
              } else if (s.toy.nx > FLOOR_BOUNDS.maxX) {
                s.toy.nx = FLOOR_BOUNDS.maxX;
                s.toy.vx = -Math.abs(s.toy.vx) * (s.activeToy === 'toy_mouse' ? 1 : 0.78);
              }
              if (s.toy.ny < FLOOR_BOUNDS.minY) {
                s.toy.ny = FLOOR_BOUNDS.minY;
                s.toy.vy = Math.abs(s.toy.vy) * (s.activeToy === 'toy_mouse' ? 1 : 0.78);
              } else if (s.toy.ny > FLOOR_BOUNDS.maxY) {
                s.toy.ny = FLOOR_BOUNDS.maxY;
                s.toy.vy = -Math.abs(s.toy.vy) * (s.activeToy === 'toy_mouse' ? 1 : 0.78);
              }

              if (s.activeToy === 'toy_mouse' && Math.abs(s.toy.vx) > 0.03) {
                s.toy.facing = s.toy.vx >= 0 ? 1 : -1;
              }

              if (s.toy.lifeTimer <= 0) {
                s.toy.active = false;
                if (s.behavior === 'PLAYING') s.behavior = 'IDLE';
                onToySessionEndRef.current?.();
              }
            }

            // Cat vertical physics
            if (s.z > 0 || s.vz !== 0) {
              s.vz -= 1.65 * dt;
              s.z += s.vz * dt;
              if (s.z <= 0) {
                s.z = 0;
                s.vz = 0;
                s.scaleX = 1.12;
                s.scaleY = 0.89;
              } else if (s.z > 0.085) {
                s.z = 0.085;
                if (s.vz > 0) s.vz = 0;
              }
            }

            // Cat Behavior State Machine
            s.isSprinting = false;
            if (s.behavior === 'PURRING') {
              s.purrDecayTimer -= dt;
              if (s.purrDecayTimer <= 0) {
                s.behavior = 'IDLE';
              }
            } else if (s.behavior === 'STRETCHING') {
              s.stretchTimer -= dt;
              if (s.stretchTimer <= 0) {
                s.behavior = 'IDLE';
              }
            } else if (s.behavior === 'ROLLING') {
              s.rollTimer -= dt;
              if (s.rollTimer <= 0) {
                s.behavior = 'IDLE';
              }
            } else if (s.behavior === 'EATING') {
              if (s.bowlAmount <= 0.01) {
                s.bowlAmount = 0;
                if (s.mealHungerRemaining > 0) {
                  s.hunger = clamp(s.hunger + s.mealHungerRemaining, 0, 100);
                  s.mealHungerRemaining = 0;
                }
                s.behavior = 'GROOMING';
                s.groomTimer = 2.0;
                if (s.pendingTreatBonus.happiness > 0 || s.pendingTreatBonus.energy > 0) {
                  s.happiness = clamp(s.happiness + s.pendingTreatBonus.happiness, 0, 100);
                  s.energy = clamp(s.energy + s.pendingTreatBonus.energy, 0, 100);
                  s.pendingTreatBonus = { happiness: 0, energy: 0 };
                }
                if (s.hunger > 20) {
                  resetLowHungerNotificationAfterFeed(s.hunger, OFFLINE_HUNGER_DECAY_PER_SEC);
                }
                addXpAndCoins(8, 2);
              } else {
                s.eatTickTimer -= dt;
                const stepBowl = Math.min(s.bowlAmount, dt * 0.24);
                s.bowlAmount = Math.max(0, s.bowlAmount - stepBowl);
                if (s.bowlTreatType === 'kibble') {
                  const gain = Math.min(s.mealHungerRemaining, stepBowl * FREE_FEED_HUNGER_POINTS);
                  s.mealHungerRemaining = Math.max(0, s.mealHungerRemaining - gain);
                  s.hunger = clamp(s.hunger + gain, 0, 100);
                } else {
                  const gain = Math.min(s.mealHungerRemaining, dt * 11);
                  s.mealHungerRemaining = Math.max(0, s.mealHungerRemaining - gain);
                  s.hunger = clamp(s.hunger + gain, 0, 100);
                }
                if (s.eatTickTimer <= 0) {
                  s.eatTickTimer = 0.42;
                  const bPos = roomToScreen(BOWL_POS.nx, BOWL_POS.ny - 0.02, rt);
                  spawnParticle('crumb', bPos.x + (Math.random() - 0.5) * 14, bPos.y, {
                    color:
                      s.bowlTreatType === 'salmon'
                        ? '#F2795A'
                        : s.bowlTreatType === 'milk'
                        ? '#FFFFFF'
                        : '#9C6234',
                    size: 3.2,
                    vx: (Math.random() - 0.5) * 45,
                    vy: -35 - Math.random() * 20,
                    maxLife: 0.45,
                  });
                }
              }
            } else if (s.behavior === 'GROOMING') {
              s.groomTimer -= dt;
              if (s.groomTimer <= 0) {
                s.behavior = 'IDLE';
              }
            } else if (s.behavior !== 'SLEEPING') {
              if (
                gState === 'PLAYING' &&
                s.toy.active &&
                s.energy >= 20 &&
                s.hunger >= 20 &&
                !s.isSick
              ) {
                s.idleZoomies = false;
                s.behavior = 'PLAYING';
                s.targetNx = clamp(s.toy.nx, FLOOR_BOUNDS.minX, FLOOR_BOUNDS.maxX);
                s.targetNy = clamp(s.toy.ny, FLOOR_BOUNDS.minY, FLOOR_BOUNDS.maxY);
              } else if (
                gState === 'PLAYING' &&
                s.bowlAmount > 0.05 &&
                s.hunger < 99 &&
                s.idleDecisionTimer > -50
              ) {
                s.idleZoomies = false;
                s.behavior = 'WALKING';
                s.targetNx = BOWL_POS.nx + 0.06;
                s.targetNy = BOWL_POS.ny;
              }

              const dx = s.targetNx - s.nx;
              const dy = s.targetNy - s.ny;
              const dist = Math.hypot(dx, dy);

              if (s.behavior === 'WALKING' || s.behavior === 'PLAYING') {
                const isChasingBall = s.behavior === 'PLAYING' && s.toy.active;
                const isRunning = isChasingBall || s.idleZoomies;
                const catchDist = isChasingBall && s.activeToy === 'toy_mouse' ? 0.056 : 0.032;
                s.isSprinting = isRunning && (dist > 0.05 || s.idleZoomies);

                // Sakit -> lemas dan berjalan jauh lebih lambat
                const sickSlowFactor = s.isSick ? 0.42 : s.hunger <= 15 ? 0.72 : 1;
                const speed =
                  (isRunning ? (s.isSprinting ? 0.3 : 0.24) : 0.125) * sickSlowFactor;

                if (dist > catchDist) {
                  const stepDist = Math.min(dist, speed * dt);
                  s.nx += (dx / dist) * stepDist;
                  s.ny += (dy / dist) * stepDist;
                  if (Math.abs(dx) > 0.014) {
                    s.facing = dx >= 0 ? 1 : -1;
                  }
                } else {
                  if (isChasingBall) {
                    if (s.toy.catchCooldown <= 0 && s.z <= 0.008) {
                      const toyOpt = getToyOption(s.activeToy);
                      s.toy.catchCooldown = s.activeToy === 'laser_pointer' ? 0.55 : 0.7;
                      s.vz =
                        s.activeToy === 'feather_wand'
                          ? 0.165
                          : s.activeToy === 'laser_pointer'
                          ? 0.125
                          : 0.135;
                      s.scaleX = 0.9;
                      s.scaleY = 1.14;
                      s.hitstopTimer = 0.03;
                      s.shakeIntensity = 2.5;
                      soundEngine.playCatch();

                      const destNx =
                        s.nx < 0.5
                          ? 0.56 + Math.random() * 0.22
                          : 0.22 + Math.random() * 0.22;
                      const destNy =
                        FLOOR_BOUNDS.minY +
                        0.03 +
                        Math.random() * (FLOOR_BOUNDS.maxY - FLOOR_BOUNDS.minY - 0.06);
                      const kx = destNx - s.toy.nx;
                      const ky = destNy - s.toy.ny;
                      const kLen = Math.max(0.05, Math.hypot(kx, ky));

                      if (s.activeToy === 'laser_pointer') {
                        s.toy.nx = destNx;
                        s.toy.ny = destNy;
                      } else if (s.activeToy === 'feather_wand') {
                        s.toy.vx = (kx / kLen) * 0.34;
                        s.toy.vy = (ky / kLen) * 0.16;
                      } else if (s.activeToy === 'toy_mouse') {
                        const rawDir = kx >= 0 ? 1 : -1;
                        s.toy.vx = rawDir * 0.165;
                        s.toy.vy = clamp((ky / kLen) * 0.065, -0.06, 0.06);
                        s.toy.facing = s.toy.vx >= 0 ? 1 : -1;
                      } else {
                        s.toy.vx = (kx / kLen) * 0.48;
                        s.toy.vy = (ky / kLen) * 0.22;
                        s.toy.vz = 0.2;
                        s.toy.z = 0.03;
                      }

                      s.happiness = clamp(
                        s.happiness + toyOpt.catchHappiness * PERSONALITY_MODS[s.personality].ballHappy,
                        0,
                        100
                      );
                      s.totalCatches += 1;

                      const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                      addXpAndCoins(10, toyOpt.catchCoins, catPos.x, catPos.y);
                      const sparkleColor =
                        s.activeToy === 'laser_pointer'
                          ? '#FCA5A5'
                          : s.activeToy === 'feather_wand'
                          ? '#2DD4BF'
                          : s.activeToy === 'toy_mouse'
                          ? '#FDE68A'
                          : '#F472B6';
                      for (let i = 0; i < 4; i++) {
                        spawnParticle('sparkle', catPos.x + (Math.random() - 0.5) * 34, catPos.y, {
                          color: sparkleColor,
                          size: 7 + Math.random() * 4,
                          vx: (Math.random() - 0.5) * 70,
                          vy: -30 - Math.random() * 50,
                          maxLife: 0.75,
                        });
                      }
                    }
                  } else if (s.idleDecisionTimer < -50) {
                    s.behavior = 'SLEEPING';
                    s.facing = 1;
                    s.idleDecisionTimer = 3.0;
                  } else if (
                    s.bowlAmount > 0.05 &&
                    Math.hypot(s.nx - (BOWL_POS.nx + 0.06), s.ny - BOWL_POS.ny) < 0.035 &&
                    s.hunger < 99
                  ) {
                    s.behavior = 'EATING';
                    s.facing = -1;
                    s.eatTickTimer = 0.1;
                  } else {
                    s.idleZoomies = false;
                    s.behavior = 'IDLE';
                  }
                }
              } else if (s.behavior === 'IDLE') {
                s.idleDecisionTimer -= dt;
                if (s.idleDecisionTimer <= 0) {
                  const lazyExtra = s.personality === 'lazy' ? 1.0 : 0;
                  s.idleDecisionTimer = s.isSick
                    ? 4.0 + Math.random() * 2.5
                    : 2.5 + lazyExtra + Math.random() * 3.0;
                  if (s.isSick) {
                    // Saat sakit, kucing lemas tapi sesekali tetap melangkah pelan
                    if (Math.random() < 0.38) {
                      s.idleZoomies = false;
                      s.targetNx = clamp(
                        s.nx + (Math.random() - 0.5) * 0.24,
                        FLOOR_BOUNDS.minX + 0.04,
                        FLOOR_BOUNDS.maxX - 0.04
                      );
                      s.targetNy = clamp(
                        s.ny + (Math.random() - 0.5) * 0.1,
                        FLOOR_BOUNDS.minY + 0.02,
                        FLOOR_BOUNDS.maxY - 0.02
                      );
                      s.behavior = 'WALKING';
                    }
                  } else {
                    const roll = Math.random();
                    if (roll < 0.36) {
                      s.idleZoomies = false;
                      s.targetNx =
                        FLOOR_BOUNDS.minX + 0.06 + Math.random() * (FLOOR_BOUNDS.maxX - FLOOR_BOUNDS.minX - 0.12);
                      s.targetNy =
                        FLOOR_BOUNDS.minY + 0.03 + Math.random() * (FLOOR_BOUNDS.maxY - FLOOR_BOUNDS.minY - 0.06);
                      s.behavior = 'WALKING';
                    } else if (
                      roll < PERSONALITY_MODS[s.personality].zoomieCutoff &&
                      s.energy > 35
                    ) {
                      // Playful cat zoomies (berlari)
                      s.idleZoomies = true;
                      s.targetNx =
                        FLOOR_BOUNDS.minX + 0.06 + Math.random() * (FLOOR_BOUNDS.maxX - FLOOR_BOUNDS.minX - 0.12);
                      s.targetNy =
                        FLOOR_BOUNDS.minY + 0.03 + Math.random() * (FLOOR_BOUNDS.maxY - FLOOR_BOUNDS.minY - 0.06);
                      s.behavior = 'PLAYING';
                    } else if (roll < 0.8) {
                      s.behavior = 'GROOMING';
                      s.groomTimer = 2.1;
                    } else {
                      s.behavior = 'STRETCHING';
                      s.stretchTimer = 1.6;
                    }
                  }
                }
              }
            }

            if (s.behavior !== 'SLEEPING') {
              s.nx = clamp(s.nx, FLOOR_BOUNDS.minX, FLOOR_BOUNDS.maxX);
              s.ny = clamp(s.ny, FLOOR_BOUNDS.minY, FLOOR_BOUNDS.maxY);
            }

            for (let i = 0; i < s.particles.length; i++) {
              const p = s.particles[i];
              if (!p.active) continue;
              p.life += dt;
              if (p.life >= p.maxLife) {
                p.active = false;
                continue;
              }
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              if (p.kind === 'crumb') {
                p.vy += 180 * dt;
              }
            }
          }
        }

        // --- RENDER FRAME ---
        ctx.clearRect(0, 0, viewW, viewH);
        ctx.save();
        if (s.shakeIntensity > 0.1) {
          const sx = (Math.random() - 0.5) * s.shakeIntensity * 2;
          const sy = (Math.random() - 0.5) * s.shakeIntensity * 2;
          ctx.translate(sx, sy);
        }

        drawRoomBackdrop(
          ctx,
          viewW,
          viewH,
          rt,
          backdropImgsRef.current[s.activeBackground] ?? null,
          s.timeOfDay,
          s.behavior === 'SLEEPING',
          s.activeBackground
        );

        if (gState === 'PLAYING' || gState === 'PAUSED') {
          drawRoomWeatherBackdrop(
            ctx,
            viewW,
            viewH,
            rt,
            s.activeBackground,
            s.weatherFx,
            s.behavior === 'SLEEPING'
          );
        }

        const bowlState: BowlRenderState = {
          nx: BOWL_POS.nx,
          ny: BOWL_POS.ny,
          amount: s.bowlAmount,
          treatType: s.bowlTreatType,
        };

        const toyState: ToyRenderState = {
          active: s.toy.active,
          toyId: s.activeToy,
          nx: s.toy.nx,
          ny: s.toy.ny,
          z: s.toy.z,
          rotation: s.toy.rotation,
          facing: s.toy.facing,
          time: s.time,
        };

        const catState: CatRenderState = {
          nx: s.nx,
          ny: s.ny,
          z: s.z,
          facing: s.facing,
          behavior: s.behavior,
          breed: s.breed,
          scaleX: s.scaleX,
          scaleY: s.scaleY,
          animTime: s.time,
          isSprinting: s.isSprinting,
          cleanliness: s.cleanliness,
          energy: s.energy,
          hunger: s.hunger,
          happiness: s.happiness,
          isHungry: s.hunger <= 30,
          isSick: s.isSick,
          isRecovering: s.recoveryTimer > 0,
          lifeStage: s.lifeStage,
          adultBranch: s.adultBranch,
          time: s.time,
          equippedHat: s.equippedHat,
          equippedGlasses: s.equippedGlasses,
          equippedScarf: s.equippedScarf,
        };

        const roomObjects: Array<{ y: number; draw: () => void }> = [
          {
            y: s.bedNy - 0.015,
            draw: () =>
              drawCatBed(
                ctx,
                s.activeBed,
                s.bedNx,
                s.bedNy,
                rt,
                bedImgsRef.current,
                s.isDraggingBed
              ),
          },
          { y: bowlState.ny, draw: () => drawFoodBowl(ctx, bowlState, rt) },
        ];
        if (toyState.active) {
          roomObjects.push({ y: toyState.ny, draw: () => drawYarnToy(ctx, toyState, rt) });
        }
        roomObjects.sort((a, b) => a.y - b.y);
        roomObjects.forEach((d) => d.draw());

        // Karakter kucing selalu berada di atas semua objek ruangan (aksesori tetap di atas kucing)
        drawCat(ctx, catState, rt, spriteSheetsRef.current, babySpriteSheetsRef.current);

        drawParticles(ctx, s.particles);

        if (gState === 'PLAYING' || gState === 'PAUSED') {
          drawScreenWeatherOverlay(
            ctx,
            viewW,
            viewH,
            rt,
            s.activeBackground,
            s.weatherFx
          );
        }
        if (gState === 'PLAYING') {
          drawToolCursorHint(
            ctx,
            s.pointerX,
            s.pointerY,
            toolModeRef.current,
            s.pointerInside,
            s.activeToy
          );
        }

        ctx.restore();

        hudSyncAccum += dt;
        if (hudSyncAccum >= 0.1) {
          hudSyncAccum = 0;
          if (gState === 'PLAYING') {
            onHudUpdate(buildSnapshot());
          }
        }

        animId = requestAnimationFrame(step);
      };

      animId = requestAnimationFrame(step);
      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('blur', handleBlur);
      };
    }, []);

    const isPointOnBed = (px: number, py: number, rt: RoomTransform): boolean => {
      const s = simRef.current;
      const bedScr = roomToScreen(s.bedNx, s.bedNy - 0.03, rt);
      const bedRadius = 74 * Math.max(0.65, rt.scale);
      return Math.hypot(px - bedScr.x, py - bedScr.y) <= bedRadius;
    };

    const updateCanvasCursor = (px: number, py: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gState = gameStateRef.current;
      if (gState !== 'PLAYING') {
        canvas.style.cursor = 'default';
        return;
      }
      const mode = toolModeRef.current;
      const s = simRef.current;
      if (mode === 'BRUSH') {
        canvas.style.cursor = "url('/assets/ui/cursor_brush.png') 10 10, grab";
      } else if (mode === 'TOY') {
        canvas.style.cursor = 'crosshair';
      } else if (s.isDraggingBed) {
        canvas.style.cursor = 'grabbing';
      } else if (isPointOnBed(px, py, s.lastRoomTransform)) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'pointer';
      }
    };

    const handlePointerInteraction = (clientX: number, clientY: number, isClick: boolean) => {
      if (gameStateRef.current !== 'PLAYING') return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;

      const s = simRef.current;
      const rt = s.lastRoomTransform;
      const catScr = roomToScreen(s.nx, s.ny - 0.045, rt);
      const hitRadius = 72 * Math.max(0.7, rt.scale);
      const distToCat = Math.hypot(px - catScr.x, py - catScr.y);

      const moveDist = Math.hypot(px - s.lastPointerX, py - s.lastPointerY);
      s.lastPointerX = px;
      s.lastPointerY = py;

      const mode = toolModeRef.current;
      const pMod = PERSONALITY_MODS[s.personality];

      if (mode === 'TOY' && isClick) {
        const roomPt = screenToRoom(px, py, rt);
        tossToyInternal(roomPt.nx, roomPt.ny);
        return;
      }

      if (distToCat <= hitRadius) {
        if (mode === 'BRUSH') {
          if (isClick) {
            s.brushScrubAccum = 0;
            soundEngine.unlock();
            if (s.cleanliness >= 99.5) {
              s.cleanliness = 100;
              spawnParticle('text', catScr.x, catScr.y - 34, {
                label: 'Sudah Bersih 100%!',
                color: '#A7F3D0',
                size: 13,
                vy: -26,
                maxLife: 1.0,
              });
              onBatheCompleteRef.current?.();
              onHudUpdate(buildSnapshot());
            } else if (s.brushHintCooldown <= 0) {
              s.brushHintCooldown = 0.9;
              soundEngine.playBrush();
              spawnParticle('text', catScr.x, catScr.y - 34, {
                label: 'Gosok-gosok tubuh kucing (+10 Bersih)',
                color: '#BAE6FD',
                size: 13,
                vy: -24,
                maxLife: 1.1,
              });
            }
            return;
          }

          if (moveDist >= 1.5) {
            soundEngine.unlock();
            if (s.cleanliness >= 99.5) {
              if (s.brushStrokeCooldown <= 0) {
                s.brushStrokeCooldown = 0.7;
                s.cleanliness = 100;
                soundEngine.playBrush();
                spawnParticle('text', catScr.x, catScr.y - 34, {
                  label: 'Sudah Bersih 100%!',
                  color: '#A7F3D0',
                  size: 13,
                  vy: -26,
                  maxLife: 1.0,
                });
                onBatheCompleteRef.current?.();
                onHudUpdate(buildSnapshot());
              }
              return;
            }

            s.brushScrubAccum += Math.min(moveDist, 26);
            if (Math.random() < 0.25) {
              spawnParticle(
                'bubble',
                px + (Math.random() - 0.5) * 18,
                py + (Math.random() - 0.5) * 14,
                {
                  size: 3.5 + Math.random() * 3,
                  vx: (Math.random() - 0.5) * 24,
                  vy: -26 - Math.random() * 16,
                  maxLife: 0.65,
                }
              );
            }

            if (s.brushScrubAccum >= BRUSH_STROKE_PX && s.brushStrokeCooldown <= 0) {
              s.brushScrubAccum = 0;
              s.brushStrokeCooldown = 0.24;

              s.cleanliness = clamp(s.cleanliness + BRUSH_POINTS_PER_STROKE, 0, 100);
              s.happiness = clamp(s.happiness - 0.5, 0, 100);
              if (s.behavior === 'SLEEPING') {
                s.z = 0;
                s.vz = 0;
              }
              s.behavior = 'GROOMING';
              s.groomTimer = 1.0;
              s.scaleX = 1.05;
              s.scaleY = 0.95;
              soundEngine.playBrush();

              for (let i = 0; i < 5; i++) {
                spawnParticle(
                  'bubble',
                  catScr.x + (Math.random() - 0.5) * 52,
                  catScr.y - 12 + (Math.random() - 0.5) * 30,
                  {
                    size: 5 + Math.random() * 4.5,
                    vx: (Math.random() - 0.5) * 38,
                    vy: -36 - Math.random() * 22,
                    maxLife: 0.9,
                  }
                );
              }

              const reachedFull = s.cleanliness >= 100;
              spawnParticle('text', catScr.x, catScr.y - 36, {
                label: reachedFull ? 'Bersih 100%! Wangi ✨' : `+${BRUSH_POINTS_PER_STROKE} Bersih`,
                color: reachedFull ? '#A7F3D0' : '#93C5FD',
                size: 14,
                vy: -28,
                maxLife: 1.15,
              });

              if (s.brushCoinCooldown <= 0) {
                s.brushCoinCooldown = 1.8;
                addXpAndCoins(4, 1, catScr.x, catScr.y - 54);
              }
              if (reachedFull) {
                soundEngine.playMeow(1.06);
                onBatheCompleteRef.current?.();
              }
              onHudUpdate(buildSnapshot());
            }
          }
        } else {
          if (isClick || moveDist > 6) {
            soundEngine.unlock();
            if (isClick) {
              soundEngine.playMeow(s.isSick ? 0.82 : 1.06);
              s.scaleX = 1.08;
              s.scaleY = 0.93;
            } else {
              soundEngine.playPurr();
            }
            s.behavior = 'PURRING';
            s.purrDecayTimer = 1.1;
            s.happiness = clamp(s.happiness + (isClick ? 4 : 1.4) * pMod.petHappy, 0, 100);
            s.totalPets += isClick ? 1 : 0;

            spawnParticle('heart', px + (Math.random() - 0.5) * 24, py - 14, {
              color: '#EC6A76',
              size: 9 + Math.random() * 4,
              vy: -42 - Math.random() * 18,
              maxLife: 0.95,
            });

            if (s.petCoinCooldown <= 0) {
              s.petCoinCooldown = 1.5;
              s.totalPets += 1;
              addXpAndCoins(4, 1, catScr.x, catScr.y - 32);
            }
          }
        }
      } else if (isClick && mode === 'PET') {
        const roomPt = screenToRoom(px, py, rt);
        if (
          roomPt.nx >= FLOOR_BOUNDS.minX &&
          roomPt.nx <= FLOOR_BOUNDS.maxX &&
          roomPt.ny >= FLOOR_BOUNDS.minY &&
          roomPt.ny <= FLOOR_BOUNDS.maxY &&
          s.behavior !== 'SLEEPING'
        ) {
          s.idleZoomies = false;
          s.targetNx = roomPt.nx;
          s.targetNy = roomPt.ny;
          s.behavior = 'WALKING';
          s.idleDecisionTimer = 3.5;
        }
      }
    };

    return (
      <canvas
        ref={canvasRef}
        style={{
          cursor:
            gameState === 'PLAYING' && toolMode === 'BRUSH'
              ? "url('/assets/ui/cursor_brush.png') 10 10, grab"
              : undefined,
        }}
        className="block w-full h-full touch-none"
        onPointerEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          simRef.current.pointerInside = true;
          simRef.current.pointerX = px;
          simRef.current.pointerY = py;
          simRef.current.lastPointerX = px;
          simRef.current.lastPointerY = py;
          updateCanvasCursor(px, py);
        }}
        onPointerLeave={() => {
          simRef.current.pointerInside = false;
          simRef.current.pointerDown = false;
          simRef.current.brushScrubAccum = 0;
          simRef.current.bedDragCandidate = false;
          simRef.current.isDraggingBed = false;
        }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          const s = simRef.current;
          s.pointerDown = true;
          s.pointerX = px;
          s.pointerY = py;

          if (
            gameStateRef.current === 'PLAYING' &&
            toolModeRef.current === 'PET' &&
            isPointOnBed(px, py, s.lastRoomTransform)
          ) {
            const rt = s.lastRoomTransform;
            const roomPt = screenToRoom(px, py, rt);
            const catScr = roomToScreen(s.nx, s.ny - 0.045, rt);
            const hitRadius = 72 * Math.max(0.7, rt.scale);
            const distToCat = Math.hypot(px - catScr.x, py - catScr.y);

            s.bedDragCandidate = true;
            s.bedDragStartX = px;
            s.bedDragStartY = py;
            s.bedDragOffsetNx = s.bedNx - roomPt.nx;
            s.bedDragOffsetNy = s.bedNy - roomPt.ny;
            if (distToCat > hitRadius) {
              s.isDraggingBed = true;
              soundEngine.unlock();
            }
            updateCanvasCursor(px, py);
            return;
          }

          handlePointerInteraction(e.clientX, e.clientY, true);
          updateCanvasCursor(px, py);
        }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          const s = simRef.current;
          s.pointerX = px;
          s.pointerY = py;

          if (s.bedDragCandidate && s.pointerDown) {
            if (!s.isDraggingBed && Math.hypot(px - s.bedDragStartX, py - s.bedDragStartY) > 6) {
              s.isDraggingBed = true;
              soundEngine.unlock();
            }
            if (s.isDraggingBed) {
              const roomPt = screenToRoom(px, py, s.lastRoomTransform);
              s.bedNx = clamp(roomPt.nx + s.bedDragOffsetNx, BED_BOUNDS.minX, BED_BOUNDS.maxX);
              s.bedNy = clamp(roomPt.ny + s.bedDragOffsetNy, BED_BOUNDS.minY, BED_BOUNDS.maxY);
              if (s.behavior === 'SLEEPING') {
                s.nx = s.bedNx;
                s.ny = s.bedNy;
              } else if (s.behavior === 'WALKING' && s.idleDecisionTimer < -50) {
                s.targetNx = s.bedNx;
                s.targetNy = s.bedNy;
              }
              updateCanvasCursor(px, py);
              return;
            }
          }

          if (
            gameStateRef.current === 'PLAYING' &&
            toolModeRef.current === 'TOY' &&
            s.toy.active &&
            s.toy.lifeTimer > 0
          ) {
            if (s.activeToy === 'laser_pointer' && s.behavior !== 'SLEEPING' && !s.isSick) {
              const roomPt = screenToRoom(px, py, s.lastRoomTransform);
              s.toy.nx = clamp(roomPt.nx, FLOOR_BOUNDS.minX, FLOOR_BOUNDS.maxX);
              s.toy.ny = clamp(roomPt.ny, FLOOR_BOUNDS.minY, FLOOR_BOUNDS.maxY);
              s.toy.z = 0;
            } else if (
              s.activeToy === 'feather_wand' &&
              s.pointerDown &&
              s.behavior !== 'SLEEPING' &&
              !s.isSick
            ) {
              const roomPt = screenToRoom(px, py, s.lastRoomTransform);
              s.toy.vx = clamp((roomPt.nx - s.toy.nx) * 3.5, -0.45, 0.45);
              s.toy.vy = clamp((roomPt.ny - s.toy.ny) * 3.5, -0.25, 0.25);
            }
          }

          if (s.pointerDown || toolModeRef.current === 'BRUSH') {
            handlePointerInteraction(e.clientX, e.clientY, false);
          }
          updateCanvasCursor(px, py);
        }}
        onPointerUp={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          const s = simRef.current;
          const wasCandidate = s.bedDragCandidate;
          const wasDragging = s.isDraggingBed;
          s.pointerDown = false;
          s.brushScrubAccum = 0;
          s.bedDragCandidate = false;
          s.isDraggingBed = false;

          if (wasDragging) {
            soundEngine.playBounce();
            const bedScr = roomToScreen(s.bedNx, s.bedNy, s.lastRoomTransform);
            for (let i = 0; i < 4; i++) {
              spawnParticle('sparkle', bedScr.x + (Math.random() - 0.5) * 60, bedScr.y, {
                color: '#FDE68A',
                size: 7,
                vx: (Math.random() - 0.5) * 45,
                vy: -25 - Math.random() * 25,
                maxLife: 0.65,
              });
            }
          } else if (wasCandidate) {
            handlePointerInteraction(e.clientX, e.clientY, true);
          }
          updateCanvasCursor(px, py);
        }}
      />
    );
  }
);

CatStageCanvas.displayName = 'CatStageCanvas';
