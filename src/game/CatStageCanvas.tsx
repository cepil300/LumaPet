import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { soundEngine } from '../audio/soundEngine';
import {
  ACTION_DELTAS,
  AdultEvolutionBranch,
  AUTO_SLEEP_CONFIG,
  BATH_ITEMS,
  BathItemId,
  BowlTreatType,
  CAT_ACCESSORIES,
  CAT_BATHTUBS,
  CAT_BEDS,
  CAT_BREEDS,
  CAT_TOYS,
  CatAccessoryId,
  CatBathtubId,
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
  ConsumableInventory,
  DayPhase,
  DeathReason,
  DevQuickAction,
  DevStatePatch,
  DevTimeScale,
  DrowsyStage,
  FOOD_ITEMS,
  FoodItemId,
  GameState,
  HungerSpeed,
  INITIAL_INVENTORY,
  LIFE_STAGES,
  LifeStage,
  ManualSleepMode,
  OVERWORK_SICK_SECONDS,
  ROOM_BACKGROUNDS,
  RoomBackgroundId,
  SLEEP_OPTIONS,
  SaveData,
  ShopItem,
  SleepMode,
  ToolMode,
  WeatherType,
} from '../types/game';
import {
  calculateOfflineDecay,
  clearLowHungerNotificationSchedule,
  computeCalendarDayAndHour,
  GAME_HOURS_PER_REAL_SEC,
  getDayPhaseFromHour,
  getDayPhaseMultipliers,
  getDrowsyStage,
  getStageDecayRatesPerSec,
  getWeatherMultipliers,
  HEALTH_RECOVERY_PER_REAL_SEC,
  INITIAL_GAME_HOUR,
  isDuskHour,
  resetLowHungerNotificationAfterFeed,
  scheduleLowHungerNotification,
  sendLowHungerNotification,
  setLowHungerNotifiedFlag,
  SICK_START_HEALTH,
  SICK_SYMPTOM_CLEAR_HEALTH,
  UNTREATED_SICK_DRAIN_PER_REAL_SEC,
} from '../utils/catCareSystem';
import {
  BowlRenderState,
  CatRenderState,
  computeRoomTransform,
  drawCat,
  drawCatBathtub,
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
  BED_FOOTPRINT,
  computeScreenRoomBounds,
  constrainItemPlacement,
  FloorObstacle,
  TUB_FOOTPRINT,
} from './roomPlacement';
import {
  createWeatherFxState,
  drawRoomWeatherBackdrop,
  drawScreenWeatherOverlay,
  stepWeatherFx,
} from './weatherSystem';

export interface CatStageHandle {
  feedRegular: () => boolean;
  feedItem: (foodId: FoodItemId) => boolean;
  buyFoodItem: (foodId: Exclude<FoodItemId, 'snack'>, useImmediately?: boolean) => boolean;
  useBathItem: (bathId: BathItemId) => boolean;
  buyBathItem: (bathId: Exclude<BathItemId, 'basic_soap'>, useImmediately?: boolean) => boolean;
  startSleep: (mode: ManualSleepMode) => boolean;
  wakeUp: () => void;
  toggleSleep: () => void;
  tossToy: (targetNx?: number, targetNy?: number) => void;
  startInteractivePlay: () => void;
  canStartMiniGame: () => boolean;
  petCat: (kind: 'short' | 'full') => void;
  giveMedicine: () => void;
  applyMiniGameReward: (coinsEarned: number, happinessGain?: number) => void;
  applyShopItem: (item: ShopItem) => boolean;
  buyOrEquipBackground: (bgId: RoomBackgroundId) => boolean;
  buyOrEquipBed: (bedId: CatBedId) => boolean;
  buyOrEquipBathtub: (tubId: CatBathtubId) => boolean;
  buyOrEquipToy: (toyId: CatToyId) => boolean;
  buyOrEquipAccessory: (accId: CatAccessoryId) => boolean;
  unequipAllAccessories: () => void;
  getSaveData: () => SaveData;
  resetCat: (name: string, breed: CatBreed) => void;
  loadFromSave: (save: SaveData) => void;
  applyDevPatch: (patch: DevStatePatch) => void;
  devAction: (action: DevQuickAction) => void;
}

interface CatStageCanvasProps {
  gameState: GameState;
  toolMode: ToolMode;
  previewBreed: CatBreed;
  hungerSpeed: HungerSpeed;
  devTimeScale?: DevTimeScale;
  onHudUpdate: (snapshot: CatHudSnapshot) => void;
  onGameOver: (finalSnapshot: CatHudSnapshot) => void;
  onToySessionEnd?: () => void;
  onBatheComplete?: () => void;
  onAutoSaveNeeded?: () => void;
}

const DEFAULT_BED_POS = { nx: 0.265, ny: 0.805 };
const DEFAULT_TUB_POS = { nx: 0.745, ny: 0.815 };
const BOWL_POS = { nx: 0.43, ny: 0.748 };
const FLOOR_BOUNDS = { minX: 0.15, maxX: 0.84, minY: 0.68, maxY: 0.89 };
const BATH_ANIM_DURATION_SEC = 10.0;
const PARTICLE_POOL_SIZE = 96;
const PLAY_SESSION_SECONDS = 10;
const FREE_COIN_REWARD_COOLDOWN_MS = 90 * 1000;
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

function normalizeBathtubId(raw?: string): CatBathtubId {
  switch (raw) {
    case 'bak_ikan':
    case 'bak_onsen':
    case 'bak_kerang':
    case 'bak_batu':
    case 'bak_kucing':
      return raw;
    default:
      return 'bak_kucing';
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

function formatCooldownMMSS(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const CatStageCanvas = forwardRef<CatStageHandle, CatStageCanvasProps>(
  (
    {
      gameState,
      toolMode,
      previewBreed,
      hungerSpeed,
      devTimeScale = 1,
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
    const tubImgsRef = useRef<Partial<Record<CatBathtubId, HTMLImageElement>>>({});
    const spriteSheetsRef = useRef<Partial<Record<CatBreed, HTMLImageElement>>>({});
    const babySpriteSheetsRef = useRef<Partial<Record<CatBreed, HTMLImageElement>>>({});
    const childSpriteSheetsRef = useRef<Partial<Record<CatBreed, HTMLImageElement>>>({});
    const bathSpriteSheetsRef = useRef<Partial<Record<CatBreed, HTMLImageElement>>>({});
    const gameStateRef = useRef<GameState>(gameState);
    const toolModeRef = useRef<ToolMode>(toolMode);
    const previewBreedRef = useRef<CatBreed>(previewBreed);
    const hungerSpeedRef = useRef<HungerSpeed>(hungerSpeed);
    const devTimeScaleRef = useRef<DevTimeScale>(devTimeScale);
    const onToySessionEndRef = useRef(onToySessionEnd);
    const onBatheCompleteRef = useRef(onBatheComplete);
    const onAutoSaveNeededRef = useRef(onAutoSaveNeeded);

    gameStateRef.current = gameState;
    toolModeRef.current = toolMode;
    previewBreedRef.current = previewBreed;
    hungerSpeedRef.current = hungerSpeed;
    devTimeScaleRef.current = devTimeScale;
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
      petActionCooldown: 0,
      petRubAccum: 0,
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
      sickReason: null as 'health' | 'dirty_zero' | 'chronic_dirty' | 'overwork' | null,
      lowCleanlinessStrikes: 0,
      wasUnder25Clean: false,
      dirtyStayTimer: 0,
      cleanHealthyTimer: 0,
      chronicSickCheckTimer: 4.0,
      isRecovering: false,
      starveGraceTimer: 0,
      starveZeroTimer: 0,
      zeroEnergyElapsedSec: 0,
      autoSleepRetryTimer: 0,
      lastDrowsyNoticeTier: 'fresh' as DrowsyStage,
      deathReason: null as DeathReason,
      pendingOldAgeGameOver: false,
      affectionXp: 0,
      level: 1,
      coins: 35,
      day: 0,
      gameHour: INITIAL_GAME_HOUR,
      lastDayPhaseNotice: 'pagi' as DayPhase,
      timeOfDay: INITIAL_GAME_HOUR / 24,
      weather: 'cerah' as WeatherType,
      weatherTimer: 95,
      lightningTimer: 7.5,
      weatherFx: createWeatherFxState(),
      lifeStage: 'baby' as LifeStage,
      stageElapsedSec: 0,
      careMistakes: 0,
      careMistakeCooldown: 0,
      adultBranch: 'prima' as AdultEvolutionBranch,
      totalCatches: 0,
      totalPets: 0,

      // Consumable Inventory, Sleep Session & Real-time Action Cooldowns
      inventory: { ...INITIAL_INVENTORY } as ConsumableInventory,
      sleepMode: 'none' as SleepMode,
      sleepRemainingSec: 0,
      sleepDurationSec: 0,
      sleepTargetEnergy: 0,
      sleepTargetHappy: 0,
      sleepTargetHunger: 0,
      sleepTargetClean: 0,
      sleepAppliedEnergy: 0,
      sleepAppliedHappy: 0,
      sleepAppliedHunger: 0,
      sleepAppliedClean: 0,
      lastFreeBathTime: 0,
      cooldownsUntil: {
        snack: 0,
        basicSoap: 0,
        miniGame: 0,
        interactivePlay: 0,
        petShort: 0,
        petFull: 0,
        sleepManual: 0,
      },

      // Room, Bed, Bathtub, Toy & Accessory customization
      activeBackground: 'classic_home' as RoomBackgroundId,
      unlockedBackgrounds: ['classic_home'] as RoomBackgroundId[],
      activeBed: 'kasur_kucing' as CatBedId,
      unlockedBeds: ['kasur_kucing'] as CatBedId[],
      activeBathtub: 'bak_kucing' as CatBathtubId,
      unlockedBathtubs: ['bak_kucing'] as CatBathtubId[],
      activeToy: 'yarn_ball' as CatToyId,
      unlockedToys: ['yarn_ball'] as CatToyId[],
      equippedHat: 'none' as CatHatId,
      equippedGlasses: 'none' as CatGlassesId,
      equippedScarf: 'default' as CatScarfId,
      unlockedAccessories: [] as CatAccessoryId[],
      bedNx: DEFAULT_BED_POS.nx,
      bedNy: DEFAULT_BED_POS.ny,
      tubNx: DEFAULT_TUB_POS.nx,
      tubNy: DEFAULT_TUB_POS.ny,

      // Bed & Bathtub drag state
      bedDragCandidate: false,
      isDraggingBed: false,
      bedDragStartX: 0,
      bedDragStartY: 0,
      bedDragOffsetNx: 0,
      bedDragOffsetNy: 0,
      tubDragCandidate: false,
      isDraggingTub: false,
      tubDragStartX: 0,
      tubDragStartY: 0,
      tubDragOffsetNx: 0,
      tubDragOffsetNy: 0,

      // Bathing walk + tub animation state
      walkingToBath: false,
      pendingBathId: null as BathItemId | null,
      isBathing: false,
      bathTimer: 0,
      bathDuration: BATH_ANIM_DURATION_SEC,
      bathParticleTimer: 0,
      bathMidSoundPlayed: false,
      activeBathItemId: null as BathItemId | null,

      // Bowl
      bowlAmount: 0,
      bowlTreatType: 'snack' as BowlTreatType,
      mealHungerRemaining: 0,
      mealHappyRemaining: 0,
      mealEnergyRemaining: 0,
      lastFreeFeedTime: 0,
      pendingTreatBonus: { happiness: 0, energy: 0 },

      // Active Toy & Play Session Tracking
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
      playSession: {
        active: false,
        targetHappiness: 0,
        appliedHappiness: 0,
        targetEnergyCost: 0,
        appliedEnergyCost: 0,
        targetHungerCost: 0,
        appliedHungerCost: 0,
        targetCleanCost: 0,
        appliedCleanCost: 0,
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

    const getPlayEffectiveness = (): { mult: number; reason: 'none' | 'ngambek' | 'lemas' | 'both' } => {
      const s = simRef.current;
      const ngambek = s.happiness < 40;
      const lemas = s.energy < 20;
      if (ngambek && lemas) return { mult: 0.4, reason: 'both' };
      if (ngambek) return { mult: 0.55, reason: 'ngambek' };
      if (lemas) return { mult: 0.55, reason: 'lemas' };
      return { mult: 1.0, reason: 'none' };
    };

    const getPetEffectiveness = (): { mult: number; isNgambek: boolean } => {
      const s = simRef.current;
      const isNgambek = s.happiness < 40;
      return { mult: isNgambek ? 0.6 : 1.0, isNgambek };
    };

    const flushPendingBowlMeal = () => {
      const s = simRef.current;
      if (s.mealHungerRemaining > 0) {
        s.hunger = clamp(s.hunger + s.mealHungerRemaining, 0, 100);
        s.mealHungerRemaining = 0;
      }
      if (s.mealHappyRemaining > 0 || s.mealEnergyRemaining > 0) {
        s.happiness = clamp(s.happiness + s.mealHappyRemaining, 0, 100);
        s.energy = clamp(s.energy + s.mealEnergyRemaining, 0, 100);
        s.mealHappyRemaining = 0;
        s.mealEnergyRemaining = 0;
      }
      if (s.pendingTreatBonus.happiness > 0 || s.pendingTreatBonus.energy > 0) {
        s.happiness = clamp(s.happiness + s.pendingTreatBonus.happiness, 0, 100);
        s.energy = clamp(s.energy + s.pendingTreatBonus.energy, 0, 100);
        s.pendingTreatBonus = { happiness: 0, energy: 0 };
      }
    };

    const buildSnapshot = (): CatHudSnapshot => {
      const s = simRef.current;
      const now = Date.now();
      const isHungry = s.hunger < 40;
      const isRecovering = s.isRecovering;
      const { gameHours } = computeCalendarDayAndHour(s.lifeStage, s.stageElapsedSec);
      const dayPhase = getDayPhaseFromHour(s.gameHour);
      const isDusk = isDuskHour(s.gameHour);
      const drowsyStage = getDrowsyStage(s.energy, dayPhase, s.weather);

      const cooldownsSec = {
        snack: Math.max(0, Math.ceil((s.cooldownsUntil.snack - now) / 1000)),
        basicSoap: Math.max(0, Math.ceil((s.cooldownsUntil.basicSoap - now) / 1000)),
        miniGame: Math.max(0, Math.ceil((s.cooldownsUntil.miniGame - now) / 1000)),
        interactivePlay: Math.max(0, Math.ceil((s.cooldownsUntil.interactivePlay - now) / 1000)),
        petShort: Math.max(0, Math.ceil((s.cooldownsUntil.petShort - now) / 1000)),
        petFull: Math.max(0, Math.ceil((s.cooldownsUntil.petFull - now) / 1000)),
        sleepManual: Math.max(0, Math.ceil((s.cooldownsUntil.sleepManual - now) / 1000)),
      };

      let moodLabel = 'Tenang & Nyaman';
      if (isRecovering && s.isSick) moodLabel = 'Pemulihan (Masih Sakit)';
      else if (isRecovering) moodLabel = 'Hampir Pulih Total';
      else if (s.isSick) moodLabel = 'Sedang Sakit';
      else if (s.isBathing || s.walkingToBath) moodLabel = 'Sedang Mandi';
      else if (s.behavior === 'SLEEPING') {
        moodLabel =
          s.sleepMode === 'auto_sleep'
            ? 'Tidur Otomatis'
            : s.sleepMode === 'power_nap'
            ? 'Power Nap'
            : 'Tidur Nyenyak';
      } else if (s.behavior === 'EATING') moodLabel = 'Lahap Makan';
      else if (s.behavior === 'PLAYING' && s.toy.active) {
        moodLabel = `Main ${getToyOption(s.activeToy).name}`;
      } else if (s.behavior === 'ROLLING') moodLabel = 'Berguling Lucu';
      else if (s.behavior === 'PURRING') moodLabel = 'Sangat Manja';
      else if (s.behavior === 'STRETCHING') moodLabel = 'Meregangkan Badan';
      else if (s.hunger <= 0) moodLabel = 'Kelaparan!';
      else if (isHungry) moodLabel = 'Rewel Minta Makan';
      else if (s.happiness < 40) moodLabel = 'Sedang Ngambek';
      else if (s.cleanliness < 40) moodLabel = 'Perlu Dibersihkan';
      else if (drowsyStage === 'drowsy_heavy' || drowsyStage === 'exhausted') {
        moodLabel = 'Sangat Ngantuk';
      } else if (drowsyStage === 'drowsy_light') {
        moodLabel = 'Mulai Ngantuk';
      } else if (s.happiness > 82) moodLabel = 'Sangat Ceria';

      let warningText: string | null = null;
      if (s.isSick && isRecovering) {
        warningText = `${s.name} sedang masa pemulihan (${Math.round(
          s.health
        )}%) — efek sakit masih terasa hingga kesehatan mencapai 90%.`;
      } else if (s.isSick && !isRecovering) {
        if (s.sickReason === 'overwork') {
          warningText = `Kelelahan / Overwork! ${s.name} jatuh sakit karena Energi 0 terlalu lama—segera beri obat sebelum kesehatan habis.`;
        } else if (s.sickReason === 'dirty_zero') {
          warningText = `Kebersihan 0%! ${s.name} jatuh sakit—mandikan dan beri obat sebelum kesehatan habis.`;
        } else if (s.sickReason === 'chronic_dirty') {
          warningText = `${s.name} jatuh sakit karena terlalu sering kotor! Segera beri obat sebelum kesehatan habis.`;
        } else {
          warningText = `${s.name} sedang sakit (${Math.round(
            s.health
          )}% Kesehatan)! Segera beri obat sebelum mencapai 0%.`;
        }
      } else if (s.behavior === 'SLEEPING' && s.sleepMode === 'auto_sleep') {
        warningText = `Kelelahan total! ${s.name} masuk [AUTO-SLEEP] (${formatCooldownMMSS(
          s.sleepRemainingSec
        )}) · Bermain & Mandi dikunci.`;
      } else if (s.hunger <= 0 && s.bowlAmount <= 0.02) {
        warningText = `${s.name} kelaparan (0%)! Kondisi memburuk—segera beri makan.`;
      } else if (s.hunger < 20 && s.bowlAmount <= 0.02) {
        warningText = `${s.name} sangat lapar (<20%)! Kesehatannya mulai menurun—segera beri makan.`;
      } else if (s.energy <= 20 && s.behavior !== 'SLEEPING') {
        warningText = `${s.name} sangat ngantuk (${Math.round(
          s.energy
        )}% Energi)! Mainan Interaktif ditolak—segera tidurkan.`;
      } else if (s.hunger < 40 && s.bowlAmount <= 0.02) {
        warningText = `${s.name} mulai rewel minta makan (<40%)! Waktunya beri makan.`;
      } else if (s.cleanliness < 15) {
        warningText = `${s.name} sangat kotor (<15%)! Kesehatannya menurun—segera mandikan.`;
      } else if (s.cleanliness < 40) {
        warningText = `${s.name} mulai kotor (<40%)! Bersihkan agar Bahagia tidak ikut turun.`;
      } else if (drowsyStage === 'drowsy_light' && s.behavior !== 'SLEEPING') {
        const ctxTags = [
          dayPhase === 'malam' ? 'Malam' : '',
          s.weather === 'hujan' ? 'Hujan' : '',
        ]
          .filter(Boolean)
          .join(' · ');
        warningText = `${s.name} mulai ngantuk (${Math.round(
          s.energy
        )}% Energi${ctxTags ? ` · ${ctxTags}` : ''})! Konsumsi energi aktivitas naik 1,15x.`;
      } else if (s.happiness < 40) {
        warningText = `${s.name} sedang ngambek (<40% Bahagia)! Efek main & elus berkurang sampai tenang.`;
      }

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
        gameHours,
        gameHour: s.gameHour,
        dayPhase,
        isDusk,
        timeOfDay: s.timeOfDay,
        weather: s.weather,
        lifeStage: s.lifeStage,
        stageElapsedSec: s.stageElapsedSec,
        stageDurationSec: LIFE_STAGES[s.lifeStage].durationSec,
        careMistakes: s.careMistakes,
        adultBranch: s.adultBranch,
        miniGameUnlocked: s.lifeStage !== 'baby',
        deathReason: s.deathReason,
        personality: s.personality,
        bowlAmount: s.bowlAmount,
        freeFeedCooldownSec: cooldownsSec.snack,
        totalCatches: s.totalCatches,
        totalPets: s.totalPets,
        activeBackground: s.activeBackground,
        unlockedBackgrounds: [...s.unlockedBackgrounds],
        activeBed: s.activeBed,
        unlockedBeds: [...s.unlockedBeds],
        activeBathtub: s.activeBathtub,
        unlockedBathtubs: [...s.unlockedBathtubs],
        isBathing: s.isBathing || s.walkingToBath,
        activeToy: s.activeToy,
        unlockedToys: [...s.unlockedToys],
        equippedHat: s.equippedHat,
        equippedGlasses: s.equippedGlasses,
        equippedScarf: s.equippedScarf,
        unlockedAccessories: [...s.unlockedAccessories],
        inventory: { ...s.inventory },
        sleepMode: s.sleepMode,
        sleepRemainingSec: Math.max(0, Math.ceil(s.sleepRemainingSec)),
        sleepDurationSec: s.sleepDurationSec,
        drowsyStage,
        cooldownsSec,
        moodLabel,
        warningText,
      };
    };

    const getRoomPlacementBounds = () => {
      const canvas = canvasRef.current;
      const s = simRef.current;
      const vw = canvas ? canvas.clientWidth : 0;
      const vh = canvas ? canvas.clientHeight : 0;
      return computeScreenRoomBounds(s.lastRoomTransform, vw, vh);
    };

    const constrainBedPos = (
      nx: number,
      ny: number,
      fallback?: { nx: number; ny: number }
    ) => {
      const s = simRef.current;
      const obstacles: FloorObstacle[] = [
        { kind: 'ellipse', cx: BOWL_POS.nx, cy: BOWL_POS.ny, rx: 0.036, ry: 0.018 },
        { kind: 'ellipse', cx: s.tubNx, cy: s.tubNy, rx: 0.048, ry: 0.022 },
      ];
      return constrainItemPlacement(
        s.activeBackground,
        nx,
        ny,
        BED_FOOTPRINT,
        getRoomPlacementBounds(),
        obstacles,
        fallback
      );
    };

    const constrainTubPos = (
      nx: number,
      ny: number,
      fallback?: { nx: number; ny: number }
    ) => {
      const s = simRef.current;
      const obstacles: FloorObstacle[] = [
        { kind: 'ellipse', cx: BOWL_POS.nx, cy: BOWL_POS.ny, rx: 0.036, ry: 0.018 },
        { kind: 'ellipse', cx: s.bedNx, cy: s.bedNy, rx: 0.048, ry: 0.022 },
      ];
      return constrainItemPlacement(
        s.activeBackground,
        nx,
        ny,
        TUB_FOOTPRINT,
        getRoomPlacementBounds(),
        obstacles,
        fallback
      );
    };

    const reconcileDraggablePositions = () => {
      const s = simRef.current;
      const nextBed = constrainBedPos(s.bedNx, s.bedNy);
      s.bedNx = nextBed.nx;
      s.bedNy = nextBed.ny;
      const nextTub = constrainTubPos(s.tubNx, s.tubNy);
      s.tubNx = nextTub.nx;
      s.tubNy = nextTub.ny;

      if (s.isBathing) {
        s.nx = s.tubNx;
        s.ny = s.tubNy;
      } else if (s.walkingToBath) {
        s.targetNx = s.tubNx;
        s.targetNy = s.tubNy;
      } else if (s.behavior === 'SLEEPING') {
        s.nx = s.bedNx;
        s.ny = s.bedNy;
      } else if (s.behavior === 'WALKING' && s.idleDecisionTimer < -50) {
        s.targetNx = s.bedNx;
        s.targetNy = s.bedNy;
      }
    };

    const feedItemInternal = (foodId: FoodItemId): boolean => {
      const s = simRef.current;
      soundEngine.unlock();
      const item = FOOD_ITEMS.find((f) => f.id === foodId);
      if (!item) return false;

      const now = Date.now();
      const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);

      if (item.isFree) {
        // Camilan Ringan: cooldown 2 menit nyata; ditolak jika Bahagia sudah 100
        if (Math.round(s.happiness) >= 100) {
          soundEngine.playBounce();
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: 'Bahagia sudah 100! Camilan ditolak',
            color: '#FCA5A5',
            size: 13.5,
            vy: -26,
            maxLife: 1.4,
          });
          return false;
        }
        if (s.cooldownsUntil.snack > now) {
          const rem = Math.ceil((s.cooldownsUntil.snack - now) / 1000);
          soundEngine.playBounce();
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: `Camilan Gratis cooldown (${formatCooldownMMSS(rem)})`,
            color: '#FDE68A',
            size: 13.5,
            vy: -26,
            maxLife: 1.4,
          });
          return false;
        }
        s.cooldownsUntil.snack = now + item.cooldownSec * 1000;
      } else {
        // Makanan Shop: tanpa cooldown (dibatasi stok); ditolak jika Kenyang sudah 100
        if (Math.round(s.hunger) >= 100) {
          soundEngine.playBounce();
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: 'Kenyang sudah penuh (100)!',
            color: '#FCA5A5',
            size: 13.5,
            vy: -26,
            maxLife: 1.4,
          });
          return false;
        }
        const key = foodId as keyof ConsumableInventory;
        if (s.inventory[key] <= 0) return false;
        s.inventory = { ...s.inventory, [key]: s.inventory[key] - 1 };
      }

      flushPendingBowlMeal();

      s.bowlAmount = 1;
      s.bowlTreatType = item.id;
      s.mealHungerRemaining = item.hungerDelta;
      s.mealHappyRemaining = item.happinessDelta;
      s.mealEnergyRemaining = item.energyDelta;
      s.pendingTreatBonus = { happiness: 0, energy: 0 };
      s.idleZoomies = false;

      if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
        // Jangan bangunkan paksa saat memberi makan; makanan menunggu di mangkuk
        const bowlScr = roomToScreen(BOWL_POS.nx, BOWL_POS.ny, s.lastRoomTransform);
        spawnParticle('sparkle', bowlScr.x, bowlScr.y - 18, {
          color: '#F59E0B',
          size: 8,
          maxLife: 0.75,
        });
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: `${item.shortName} ditaruh di mangkuk (masih tidur)`,
          color: '#FDE68A',
          size: 13,
          vy: -26,
          maxLife: 1.5,
        });
        onHudUpdate(buildSnapshot());
        return true;
      }

      if (s.behavior === 'ROLLING' || s.behavior === 'PURRING') {
        s.behavior = 'WALKING';
        s.z = 0;
        s.vz = 0;
      }
      s.targetNx = BOWL_POS.nx + 0.06;
      s.targetNy = BOWL_POS.ny;
      soundEngine.playMeow(1.08);

      const stageRates = getStageDecayRatesPerSec(
        s.lifeStage,
        s.stageElapsedSec,
        s.adultBranch,
        hungerSpeedRef.current
      );
      resetLowHungerNotificationAfterFeed(
        Math.min(100, s.hunger + item.hungerDelta),
        stageRates.hungerPerSec
      );

      const bowlScr = roomToScreen(BOWL_POS.nx, BOWL_POS.ny, s.lastRoomTransform);
      spawnParticle('sparkle', bowlScr.x, bowlScr.y - 18, {
        color: '#F59E0B',
        size: 8,
        maxLife: 0.75,
      });
      spawnParticle('text', catPos.x, catPos.y - 34, {
        label: `${item.shortName}: +${item.hungerDelta} Kenyang · +${item.happinessDelta} Bahagia`,
        color: '#FDE68A',
        size: 13,
        vy: -28,
        maxLife: 1.5,
      });

      onHudUpdate(buildSnapshot());
      return true;
    };

    const completeBathSession = (spawnEffects: boolean) => {
      const s = simRef.current;
      const bathId = s.activeBathItemId ?? s.pendingBathId;
      s.walkingToBath = false;
      s.pendingBathId = null;
      s.isBathing = false;
      s.bathTimer = 0;
      s.bathMidSoundPlayed = false;
      s.activeBathItemId = null;

      if (!bathId) return;
      const item = BATH_ITEMS.find((b) => b.id === bathId);
      if (!item) return;

      const now = Date.now();
      s.cleanliness = clamp(s.cleanliness + item.cleanlinessDelta, 0, 100);
      s.happiness = clamp(s.happiness + item.happinessDelta, 0, 100);
      if (bathId === 'spa_bath') {
        s.cleanliness = 100;
        s.lowCleanlinessStrikes = 0;
        s.wasUnder25Clean = false;
        s.dirtyStayTimer = 0;
      }

      // Place cat cleanly beside the bathtub when stepping out
      s.nx = clamp(
        s.tubNx + (s.tubNx > 0.5 ? -0.1 : 0.1),
        FLOOR_BOUNDS.minX,
        FLOOR_BOUNDS.maxX
      );
      s.ny = clamp(s.tubNy + 0.02, FLOOR_BOUNDS.minY, FLOOR_BOUNDS.maxY);
      s.z = 0;
      s.vz = 0;
      s.behavior = 'IDLE';
      s.idleDecisionTimer = 1.8;

      const tubPos = roomToScreen(s.tubNx, s.tubNy - 0.06, s.lastRoomTransform);
      if (spawnEffects) {
        soundEngine.playMeow(1.06);
        soundEngine.playChime();
        const bubbleCount = bathId === 'spa_bath' ? 12 : bathId === 'shampoo_foam' ? 9 : 6;
        for (let i = 0; i < bubbleCount; i++) {
          spawnParticle(
            i % 3 === 0 && bathId === 'spa_bath' ? 'sparkle' : 'bubble',
            tubPos.x + (Math.random() - 0.5) * 72,
            tubPos.y - 12 + (Math.random() - 0.5) * 34,
            {
              color: bathId === 'spa_bath' ? '#F9A8D4' : '#BAE6FD',
              size: 5 + Math.random() * 5,
              vx: (Math.random() - 0.5) * 44,
              vy: -32 - Math.random() * 24,
              maxLife: 1.0,
            }
          );
        }
        spawnParticle('text', tubPos.x, tubPos.y - 44, {
          label:
            bathId === 'spa_bath'
              ? `Bersih Penuh 100% · +${item.happinessDelta} Bahagia`
              : `+${item.cleanlinessDelta} Bersih · +${item.happinessDelta} Bahagia`,
          color: bathId === 'spa_bath' ? '#FBCFE8' : '#BAE6FD',
          size: 13.5,
          vy: -28,
          maxLife: 1.55,
        });
      }

      const canRewardCoins =
        !item.isFree || now - s.lastFreeBathTime >= FREE_COIN_REWARD_COOLDOWN_MS;
      if (canRewardCoins) {
        if (item.isFree) s.lastFreeBathTime = now;
        addXpAndCoins(6, 1, tubPos.x, tubPos.y - 62);
      }

      onBatheCompleteRef.current?.();
      onHudUpdate(buildSnapshot());
      onAutoSaveNeededRef.current?.();
    };

    const enterBathtub = () => {
      const s = simRef.current;
      s.walkingToBath = false;
      s.activeBathItemId = s.pendingBathId ?? 'basic_soap';
      s.pendingBathId = null;
      s.isBathing = true;
      s.bathTimer = BATH_ANIM_DURATION_SEC;
      s.bathDuration = BATH_ANIM_DURATION_SEC;
      s.bathParticleTimer = 0.12;
      s.bathMidSoundPlayed = false;
      s.nx = s.tubNx;
      s.ny = s.tubNy;
      s.z = 0;
      s.vz = 0;
      s.behavior = 'GROOMING';
      soundEngine.playBrush();
      const tubPos = roomToScreen(s.tubNx, s.tubNy - 0.05, s.lastRoomTransform);
      for (let i = 0; i < 6; i++) {
        spawnParticle('bubble', tubPos.x + (Math.random() - 0.5) * 56, tubPos.y - 10, {
          color: '#BAE6FD',
          size: 4.5 + Math.random() * 4.5,
          vx: (Math.random() - 0.5) * 34,
          vy: -26 - Math.random() * 20,
          maxLife: 0.9,
        });
      }
      onHudUpdate(buildSnapshot());
    };

    const useBathItemInternal = (bathId: BathItemId): boolean => {
      const s = simRef.current;
      soundEngine.unlock();
      const item = BATH_ITEMS.find((b) => b.id === bathId);
      if (!item) return false;

      const now = Date.now();
      const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);

      if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Mandi dikunci saat kucing sedang tidur!',
          color: '#FCA5A5',
          size: 13.5,
          vy: -26,
          maxLife: 1.4,
        });
        return false;
      }

      if (s.isBathing || s.walkingToBath) {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: `${s.name} sudah menuju / sedang mandi di bak!`,
          color: '#BAE6FD',
          size: 13.5,
          vy: -26,
          maxLife: 1.35,
        });
        return false;
      }

      if (Math.round(s.cleanliness) >= 100) {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Bersih sudah penuh (100)!',
          color: '#A7F3D0',
          size: 13.5,
          vy: -26,
          maxLife: 1.4,
        });
        return false;
      }

      if (item.isFree) {
        if (s.cooldownsUntil.basicSoap > now) {
          const rem = Math.ceil((s.cooldownsUntil.basicSoap - now) / 1000);
          soundEngine.playBounce();
          spawnParticle('text', catPos.x, catPos.y - 36, {
            label: `Sabun Dasar cooldown (${formatCooldownMMSS(rem)})`,
            color: '#FDE68A',
            size: 13.5,
            vy: -26,
            maxLife: 1.4,
          });
          return false;
        }
        s.cooldownsUntil.basicSoap = now + item.cooldownSec * 1000;
      } else {
        const key = bathId as keyof ConsumableInventory;
        if (s.inventory[key] <= 0) return false;
        s.inventory = { ...s.inventory, [key]: s.inventory[key] - 1 };
      }

      // Cancel active play/zoomies and walk to the bathtub
      s.toy.active = false;
      s.playSession.active = false;
      s.idleZoomies = false;
      onToySessionEndRef.current?.();

      s.pendingBathId = bathId;
      s.walkingToBath = true;
      s.z = 0;
      s.vz = 0;
      s.behavior = 'WALKING';
      s.targetNx = s.tubNx;
      s.targetNy = s.tubNy;
      soundEngine.playMeow(1.08);
      if (bathId !== 'basic_soap') {
        soundEngine.playChime();
      }

      spawnParticle('text', catPos.x, catPos.y - 36, {
        label: `Menuju bak mandi (${item.shortName})...`,
        color: '#BAE6FD',
        size: 13,
        vy: -26,
        maxLife: 1.35,
      });

      onHudUpdate(buildSnapshot());
      return true;
    };

    const petCatInternal = (kind: 'short' | 'full'): boolean => {
      const s = simRef.current;
      soundEngine.unlock();
      const now = Date.now();
      const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);

      if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Zzz... Sedang tidur',
          color: '#BFDBFE',
          size: 13.5,
          vy: -24,
          maxLife: 1.2,
        });
        return false;
      }

      if (s.isBathing || s.walkingToBath) {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Tunggu sebentar, sedang mandi!',
          color: '#BAE6FD',
          size: 13.5,
          vy: -24,
          maxLife: 1.2,
        });
        return false;
      }

      if (Math.round(s.happiness) >= 100) {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Bahagia sudah penuh (100)!',
          color: '#FCA5A5',
          size: 13.5,
          vy: -26,
          maxLife: 1.4,
        });
        return false;
      }

      const cdUntil = kind === 'full' ? s.cooldownsUntil.petFull : s.cooldownsUntil.petShort;
      if (cdUntil > now) {
        const rem = Math.ceil((cdUntil - now) / 1000);
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: `${kind === 'full' ? 'Kasih Sayang' : 'Elus Singkat'} cooldown (${formatCooldownMMSS(rem)})`,
          color: '#FDE68A',
          size: 13,
          vy: -26,
          maxLife: 1.35,
        });
        return false;
      }

      const base = kind === 'full' ? ACTION_DELTAS.petFull : ACTION_DELTAS.petShort;
      const { mult, isNgambek } = getPetEffectiveness();
      const happyGain = Math.max(1, Math.round(base.happiness * mult));

      if (kind === 'full') {
        s.cooldownsUntil.petFull = now + base.cooldownSec * 1000;
      } else {
        s.cooldownsUntil.petShort = now + base.cooldownSec * 1000;
      }

      // Energi tidak lagi bertambah dari Elus-elus (+0 Energi); Kasih Sayang: -2 Kenyang
      s.happiness = clamp(s.happiness + happyGain, 0, 100);
      if (base.hunger !== 0) {
        s.hunger = clamp(s.hunger + base.hunger, 0, 100);
      }
      const isRainSoothing = s.weather === 'hujan';
      s.totalPets += 1;
      s.z = 0;
      s.vz = 0;
      s.behavior = 'PURRING';
      s.purrDecayTimer = (kind === 'full' ? 1.8 : 1.25) + (isRainSoothing ? 0.5 : 0);
      s.scaleX = 1.08;
      s.scaleY = 0.93;

      if (kind === 'full') {
        soundEngine.playPurr();
        soundEngine.playChime();
      } else {
        soundEngine.playMeow(s.isSick ? 0.85 : 1.08);
      }

      const heartCount = (kind === 'full' ? 7 : 4) + (isRainSoothing ? 2 : 0);
      for (let i = 0; i < heartCount; i++) {
        spawnParticle(
          i % 2 === 0 ? 'heart' : 'heart_sparkle',
          catPos.x + (Math.random() - 0.5) * 48,
          catPos.y - 12 + (Math.random() - 0.5) * 18,
          {
            color: '#EC6A76',
            size: 8.5 + Math.random() * 3.5,
            vx: (Math.random() - 0.5) * 26,
            vy: -38 - Math.random() * 20,
            maxLife: 1.0,
          }
        );
      }

      const hungerSuffix = base.hunger < 0 ? ` · ${base.hunger} Kenyang` : '';
      const rainSuffix = isRainSoothing ? ' · Tenang saat hujan' : '';
      spawnParticle('text', catPos.x, catPos.y - 36, {
        label: isNgambek
          ? `+${happyGain} Bahagia (Ngambek) · +0 Energi${hungerSuffix}${rainSuffix}`
          : `+${happyGain} Bahagia · +0 Energi${hungerSuffix}${rainSuffix}`,
        color: isNgambek ? '#FDE68A' : '#FBCFE8',
        size: 13.5,
        vy: -28,
        maxLife: 1.5,
      });

      if (s.petCoinCooldown <= 0) {
        s.petCoinCooldown = 2.5;
        addXpAndCoins(kind === 'full' ? 8 : 5, 1, catPos.x, catPos.y - 56);
      }
      onHudUpdate(buildSnapshot());
      return true;
    };

    const startSleepInternal = (mode: ManualSleepMode): boolean => {
      const s = simRef.current;
      soundEngine.unlock();
      const now = Date.now();
      const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);

      if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Kucing sedang tidur!',
          color: '#BFDBFE',
          size: 13.5,
          vy: -26,
          maxLife: 1.3,
        });
        return false;
      }

      if (Math.round(s.energy) >= 100) {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Energi sudah penuh (100)!',
          color: '#FCA5A5',
          size: 13.5,
          vy: -26,
          maxLife: 1.4,
        });
        return false;
      }

      if (s.cooldownsUntil.sleepManual > now) {
        const rem = Math.ceil((s.cooldownsUntil.sleepManual - now) / 1000);
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: `Cooldown tidur manual (${formatCooldownMMSS(rem)})`,
          color: '#FDE68A',
          size: 13.5,
          vy: -26,
          maxLife: 1.4,
        });
        return false;
      }

      const dayPhase = getDayPhaseFromHour(s.gameHour);
      const phaseMult = getDayPhaseMultipliers(dayPhase);
      const weatherMult = getWeatherMultipliers(s.weather);
      const sleepEnergyMult = phaseMult.sleepEnergyMult * weatherMult.sleepEnergyMult;

      if (dayPhase !== 'malam' && s.energy > 85) {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Masih segar (>85 Energi) di Pagi/Siang! Menolak tidur',
          color: '#FCA5A5',
          size: 13,
          vy: -26,
          maxLife: 1.55,
        });
        return false;
      }

      if (dayPhase !== 'malam' && s.energy > 70 && mode === 'full_rest') {
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Energi >70 di Pagi/Siang! Hanya mau tidur sebentar',
          color: '#FDE68A',
          size: 13,
          vy: -26,
          maxLife: 1.55,
        });
        return false;
      }

      if (s.isBathing || s.walkingToBath) {
        completeBathSession(false);
      }

      const opt = SLEEP_OPTIONS.find((o) => o.id === mode) ?? SLEEP_OPTIONS[0];
      const isBriefDayNap = dayPhase !== 'malam' && s.energy > 70 && mode === 'power_nap';

      s.toy.active = false;
      s.playSession.active = false;
      s.idleZoomies = false;
      onToySessionEndRef.current?.();
      onBatheCompleteRef.current?.();

      s.sleepMode = opt.id;
      if (isBriefDayNap) {
        s.sleepDurationSec = 90;
        s.sleepRemainingSec = 90;
        s.sleepTargetEnergy = Math.round(20 * sleepEnergyMult * 10) / 10;
        s.sleepTargetHappy = 3;
        s.sleepTargetHunger = -3;
        s.sleepTargetClean = 0;
      } else {
        s.sleepDurationSec = opt.durationSec;
        s.sleepRemainingSec = opt.durationSec;
        s.sleepTargetEnergy = Math.round(opt.energyDelta * sleepEnergyMult * 10) / 10;
        s.sleepTargetHappy = opt.happinessDelta;
        s.sleepTargetHunger = opt.hungerDelta;
        s.sleepTargetClean = opt.cleanlinessDelta;
      }
      s.sleepAppliedEnergy = 0;
      s.sleepAppliedHappy = 0;
      s.sleepAppliedHunger = 0;
      s.sleepAppliedClean = 0;

      s.behavior = 'WALKING';
      s.targetNx = s.bedNx;
      s.targetNy = s.bedNy;
      s.idleDecisionTimer = -99;

      const sleepBonusTags = [
        dayPhase === 'pagi' ? 'Pagi +10%' : dayPhase === 'malam' ? 'Malam +20%' : '',
        s.weather === 'hujan' ? 'Hujan +10%' : '',
      ].filter(Boolean);
      const sleepBonusTag = sleepBonusTags.length > 0 ? ` · Bonus ${sleepBonusTags.join(' & ')}` : '';
      soundEngine.playSleep();
      spawnParticle('text', catPos.x, catPos.y - 36, {
        label: isBriefDayNap
          ? `Masih cukup segar — tidur sebentar (1,5 mnt · +${Math.round(s.sleepTargetEnergy)} Energi)`
          : `${opt.shortName} (${Math.round(opt.durationSec / 60)} mnt${sleepBonusTag}): ${opt.description}`,
        color: '#BFDBFE',
        size: 13,
        vy: -26,
        maxLife: 1.75,
      });
      onHudUpdate(buildSnapshot());
      return true;
    };

    const wakeUpInternal = () => {
      const s = simRef.current;
      soundEngine.unlock();
      if (s.behavior !== 'SLEEPING' && s.sleepMode === 'none') return;

      const prevMode = s.sleepMode;
      const wasInterrupted = s.sleepRemainingSec > 0.5;
      const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);

      if (wasInterrupted) {
        s.happiness = clamp(s.happiness - 10, 0, 100);
        spawnParticle('text', catPos.x, catPos.y - 36, {
          label: 'Tidur terganggu! -10 Bahagia',
          color: '#FCA5A5',
          size: 14,
          vy: -28,
          maxLife: 1.6,
        });
      }

      if (prevMode === 'power_nap' || prevMode === 'full_rest') {
        const opt = SLEEP_OPTIONS.find((o) => o.id === prevMode);
        const cdSec = opt?.cooldownAfterWakeSec ?? (prevMode === 'power_nap' ? 180 : 300);
        s.cooldownsUntil.sleepManual = Date.now() + cdSec * 1000;
      } else if (prevMode === 'auto_sleep' && s.energy <= 0.5) {
        s.autoSleepRetryTimer = 15;
      }

      s.sleepMode = 'none';
      s.sleepRemainingSec = 0;
      s.sleepDurationSec = 0;
      s.sleepTargetEnergy = 0;
      s.sleepTargetHappy = 0;
      s.sleepTargetHunger = 0;
      s.sleepTargetClean = 0;
      s.sleepAppliedEnergy = 0;
      s.sleepAppliedHappy = 0;
      s.sleepAppliedHunger = 0;
      s.sleepAppliedClean = 0;

      if (s.behavior === 'SLEEPING' || (s.behavior === 'WALKING' && s.idleDecisionTimer < -50)) {
        s.behavior = 'STRETCHING';
        s.stretchTimer = 1.4;
        s.idleDecisionTimer = 2.0;
        s.scaleX = 1.08;
        s.scaleY = 0.92;
        soundEngine.playMeow(0.95);
      }
      onHudUpdate(buildSnapshot());
    };

    const canStartMiniGameInternal = (showNotice = true): boolean => {
      const s = simRef.current;
      const now = Date.now();
      const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
      let errMsg: string | null = null;

      if (s.lifeStage === 'baby') {
        errMsg = 'Mini-Game terbuka mulai Fase Anak!';
      } else if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
        errMsg = 'Bermain dikunci saat kucing sedang tidur!';
      } else if (s.isSick) {
        errMsg = 'Sedang sakit — sembuhkan dulu sebelum Mini-Game!';
      } else if (s.energy < 20) {
        errMsg = 'Energi < 20! Terlalu lemas untuk Mini-Game';
      } else if (s.hunger <= 2) {
        errMsg = 'Terlalu lapar! Beri makan dulu';
      } else if (s.cooldownsUntil.miniGame > now) {
        const rem = Math.ceil((s.cooldownsUntil.miniGame - now) / 1000);
        errMsg = `Mini-Game cooldown (${formatCooldownMMSS(rem)})`;
      }

      if (errMsg) {
        if (showNotice) {
          soundEngine.playBounce();
          spawnParticle('text', catPos.x, catPos.y - 36, {
            label: errMsg,
            color: '#FCA5A5',
            size: 13.5,
            vy: -26,
            maxLife: 1.45,
          });
        }
        return false;
      }
      return true;
    };

    const tossToyInternal = (targetNx?: number, targetNy?: number) => {
      const s = simRef.current;
      soundEngine.unlock();
      const now = Date.now();
      const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);

      if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
        s.toy.active = false;
        s.playSession.active = false;
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: 'Bermain dikunci saat kucing sedang tidur!',
          color: '#FCA5A5',
          size: 13.5,
          vy: -28,
          maxLife: 1.45,
        });
        onToySessionEndRef.current?.();
        return;
      }

      if (s.isBathing || s.walkingToBath) {
        s.toy.active = false;
        s.playSession.active = false;
        soundEngine.playBounce();
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: 'Sedang mandi di bak!',
          color: '#BAE6FD',
          size: 13.5,
          vy: -28,
          maxLife: 1.35,
        });
        onToySessionEndRef.current?.();
        return;
      }

      const isFreshSession = !s.toy.active || s.toy.lifeTimer <= 0.05;

      if (isFreshSession) {
        let blockReason: string | null = null;
        if (s.isSick) {
          blockReason = 'Sedang sakit — Mainan Interaktif ditolak!';
        } else if (s.energy <= 20) {
          blockReason = 'Sangat ngantuk (<=20 Energi)! Mainan Interaktif ditolak';
        } else if (s.hunger <= 2) {
          blockReason = 'Terlalu lapar! Beri makan dulu';
        } else if (s.cooldownsUntil.interactivePlay > now) {
          const rem = Math.ceil((s.cooldownsUntil.interactivePlay - now) / 1000);
          blockReason = `Mainan Interaktif cooldown (${formatCooldownMMSS(rem)})`;
        }

        if (blockReason) {
          s.toy.active = false;
          s.playSession.active = false;
          if (s.behavior === 'PLAYING') s.behavior = 'IDLE';
          soundEngine.playMeow(0.8);
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: blockReason,
            color: '#FCA5A5',
            size: 13.5,
            vy: -28,
            maxLife: 1.5,
          });
          onToySessionEndRef.current?.();
          return;
        }
      }

      if (s.behavior === 'ROLLING') {
        s.behavior = 'IDLE';
        s.z = 0;
        s.vz = 0;
      }
      s.idleZoomies = false;
      const tx = clamp(targetNx ?? 0.28 + Math.random() * 0.48, FLOOR_BOUNDS.minX, FLOOR_BOUNDS.maxX);
      const ty = clamp(targetNy ?? 0.72 + Math.random() * 0.14, FLOOR_BOUNDS.minY, FLOOR_BOUNDS.maxY);

      s.toy.active = true;
      if (isFreshSession) {
        s.cooldownsUntil.interactivePlay = now + ACTION_DELTAS.playInteractiveFull.cooldownSec * 1000;
        s.toy.lifeTimer = PLAY_SESSION_SECONDS;
        const { mult, reason } = getPlayEffectiveness();
        const dayPhase = getDayPhaseFromHour(s.gameHour);
        const phaseMult = getDayPhaseMultipliers(dayPhase);
        const drowsyStage = getDrowsyStage(s.energy, dayPhase, s.weather);
        const isDrowsyPenalty = drowsyStage === 'drowsy_light' || drowsyStage === 'drowsy_heavy';
        const actEnergyMult = isDrowsyPenalty ? 1.15 : 1.0;
        const isHappyAlreadyFull = Math.round(s.happiness) >= 100;
        const targetHappy = isHappyAlreadyFull
          ? 0
          : Math.max(
              8,
              Math.round(ACTION_DELTAS.playInteractiveFull.happiness * mult * phaseMult.playHappyMult)
            );
        const targetCost = Math.abs(ACTION_DELTAS.playInteractiveFull.energy) * actEnergyMult;
        s.playSession = {
          active: true,
          targetHappiness: targetHappy,
          appliedHappiness: 0,
          targetEnergyCost: targetCost,
          appliedEnergyCost: 0,
          targetHungerCost: Math.abs(ACTION_DELTAS.playInteractiveFull.hunger),
          appliedHungerCost: 0,
          targetCleanCost: Math.abs(ACTION_DELTAS.playInteractiveFull.cleanliness),
          appliedCleanCost: 0,
        };
        if (isHappyAlreadyFull) {
          spawnParticle('text', catPos.x, catPos.y - 36, {
            label: isDrowsyPenalty
              ? `Mulai Ngantuk · Energi main 1,15x (-${targetCost.toFixed(1)} Energi · +0 Bahagia)`
              : 'Bahagia penuh (100) · +0 Bahagia',
            color: '#FDE68A',
            size: 13,
            vy: -24,
            maxLife: 1.65,
          });
        } else if (reason !== 'none' || isDrowsyPenalty || phaseMult.playHappyMult > 1) {
          const middayBonus = phaseMult.playHappyMult > 1 ? ' · Bonus Siang +10%' : '';
          const reasonLabel =
            reason === 'ngambek'
              ? `Ngambek (<40) · Main berkurang (+${targetHappy} Bahagia${isDrowsyPenalty ? ' · Energi 1,15x' : ''})`
              : isDrowsyPenalty
              ? `Mulai Ngantuk · Energi main naik 1,15x (-${targetCost.toFixed(1)} Energi${middayBonus})`
              : reason !== 'none'
              ? `Lemas · Main kurang maksimal (+${targetHappy} Bahagia)`
              : `Main Siang! +${targetHappy} Bahagia (Bonus +10%)`;
          spawnParticle('text', catPos.x, catPos.y - 36, {
            label: reasonLabel,
            color: reason === 'none' && !isDrowsyPenalty ? '#FDE047' : '#FDE68A',
            size: 13,
            vy: -24,
            maxLife: 1.65,
          });
        }
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
      feedRegular: (): boolean => feedItemInternal('snack'),

      feedItem: (foodId: FoodItemId): boolean => feedItemInternal(foodId),

      buyFoodItem: (foodId: Exclude<FoodItemId, 'snack'>, useImmediately = false): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        const item = FOOD_ITEMS.find((f) => f.id === foodId);
        if (!item || s.coins < item.price) return false;
        if (useImmediately && Math.round(s.hunger) >= 100) {
          const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
          soundEngine.playBounce();
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: 'Kenyang sudah penuh (100)!',
            color: '#FCA5A5',
            size: 13.5,
            vy: -26,
            maxLife: 1.4,
          });
          return false;
        }
        s.coins -= item.price;
        s.inventory = { ...s.inventory, [foodId]: s.inventory[foodId] + 1 };
        soundEngine.playChime();
        if (useImmediately) {
          return feedItemInternal(foodId);
        }
        onHudUpdate(buildSnapshot());
        return true;
      },

      useBathItem: (bathId: BathItemId): boolean => useBathItemInternal(bathId),

      buyBathItem: (bathId: Exclude<BathItemId, 'basic_soap'>, useImmediately = false): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        const item = BATH_ITEMS.find((b) => b.id === bathId);
        if (!item || s.coins < item.price) return false;
        if (
          useImmediately &&
          (s.behavior === 'SLEEPING' ||
            s.sleepMode !== 'none' ||
            s.isBathing ||
            s.walkingToBath ||
            Math.round(s.cleanliness) >= 100)
        ) {
          const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
          soundEngine.playBounce();
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label:
              s.behavior === 'SLEEPING' || s.sleepMode !== 'none'
                ? 'Mandi dikunci saat tidur!'
                : s.isBathing || s.walkingToBath
                ? 'Sedang mandi di bak!'
                : 'Bersih sudah penuh (100)!',
            color: '#FCA5A5',
            size: 13.5,
            vy: -26,
            maxLife: 1.4,
          });
          return false;
        }
        s.coins -= item.price;
        s.inventory = { ...s.inventory, [bathId]: s.inventory[bathId] + 1 };
        soundEngine.playChime();
        if (useImmediately) {
          return useBathItemInternal(bathId);
        }
        onHudUpdate(buildSnapshot());
        return true;
      },

      startSleep: (mode: ManualSleepMode): boolean => startSleepInternal(mode),

      wakeUp: () => {
        wakeUpInternal();
      },

      toggleSleep: () => {
        const s = simRef.current;
        if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
          wakeUpInternal();
        } else {
          startSleepInternal('power_nap');
        }
      },

      tossToy: (tx?: number, ty?: number) => {
        tossToyInternal(tx, ty);
      },

      startInteractivePlay: () => {
        tossToyInternal();
      },

      canStartMiniGame: (): boolean => canStartMiniGameInternal(true),

      petCat: (kind: 'short' | 'full') => {
        petCatInternal(kind);
      },

      giveMedicine: () => {
        const s = simRef.current;
        soundEngine.unlock();
        if (s.isRecovering) {
          soundEngine.playBounce();
          const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
          spawnParticle('text', catPos.x, catPos.y - 34, {
            label: 'Obat sudah diberikan · Sedang pulih bertahap',
            color: '#6EE7B7',
            size: 13,
            vy: -26,
            maxLife: 1.25,
          });
          return;
        }
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

        s.isRecovering = true;
        s.starveGraceTimer = 0;
        s.lowCleanlinessStrikes = 0;
        s.dirtyStayTimer = 0;
        s.happiness = clamp(s.happiness + 4, 0, 100);
        soundEngine.playChime();
        const catPos = roomToScreen(s.nx, s.ny - 0.06, s.lastRoomTransform);
        spawnParticle('text', catPos.x, catPos.y - 34, {
          label: 'Diberi Obat · Pemulihan dimulai (efek hilang di 90%)',
          color: '#6EE7B7',
          size: 13.5,
          vy: -28,
          maxLife: 1.65,
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

      applyMiniGameReward: (coinsEarned: number, happinessGain?: number) => {
        const s = simRef.current;
        soundEngine.unlock();
        const now = Date.now();
        if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none' || s.energy < 20) {
          onHudUpdate(buildSnapshot());
          return;
        }
        s.cooldownsUntil.miniGame = now + ACTION_DELTAS.playMiniGame.cooldownSec * 1000;

        const baseHappy = happinessGain ?? ACTION_DELTAS.playMiniGame.happiness;
        const { mult, reason } = getPlayEffectiveness();
        const dayPhase = getDayPhaseFromHour(s.gameHour);
        const phaseMult = getDayPhaseMultipliers(dayPhase);
        const weatherMult = getWeatherMultipliers(s.weather);
        const drowsyStage = getDrowsyStage(s.energy, dayPhase, s.weather);
        const isHappyFull = Math.round(s.happiness) >= 100;
        const finalHappy = isHappyFull
          ? 0
          : Math.max(
              5,
              Math.round((baseHappy + weatherMult.outdoorPlayHappyBonus) * mult * phaseMult.playHappyMult)
            );
        const isDrowsyPenalty = drowsyStage === 'drowsy_light' || drowsyStage === 'drowsy_heavy';
        const energyCost =
          Math.round(
            Math.abs(ACTION_DELTAS.playMiniGame.energy) * (isDrowsyPenalty ? 1.15 : 1) * 10
          ) / 10;
        const hungerCost = Math.abs(ACTION_DELTAS.playMiniGame.hunger);
        const cleanCost =
          Math.abs(ACTION_DELTAS.playMiniGame.cleanliness) + weatherMult.outdoorPlayCleanPenalty;

        if (finalHappy > 0) {
          s.happiness = clamp(s.happiness + finalHappy, 0, 100);
        }
        s.energy = clamp(s.energy - energyCost, 0, 100);
        s.hunger = clamp(s.hunger - hungerCost, 0, 100);
        s.cleanliness = clamp(s.cleanliness - cleanCost, 0, 100);

        const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);
        addXpAndCoins(12, Math.max(0, coinsEarned), catPos.x, catPos.y);

        const bonusTags = isHappyFull
          ? []
          : [
              phaseMult.playHappyMult > 1 ? 'Siang +10%' : '',
              s.weather === 'hujan' ? 'Hujan +5' : '',
            ].filter(Boolean);
        const bonusTag = bonusTags.length > 0 ? ` (${bonusTags.join(' · ')})` : '';
        spawnParticle('text', catPos.x, catPos.y - 38, {
          label: isHappyFull
            ? `+0 Bahagia · -${energyCost} Energi · -${hungerCost} Kenyang · -${cleanCost} Bersih`
            : reason !== 'none'
            ? `+${finalHappy} Bahagia (Berkurang) · -${energyCost} Energi · -${cleanCost} Bersih`
            : `+${finalHappy} Bahagia${bonusTag} · -${energyCost} Energi · -${hungerCost} Kenyang · -${cleanCost} Bersih`,
          color: isHappyFull || reason !== 'none' || isDrowsyPenalty ? '#FDE68A' : '#FBCFE8',
          size: 13.5,
          vy: -28,
          maxLife: 1.6,
        });

        if (coinsEarned > 0 || finalHappy > 0) {
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
        s.mealHungerRemaining = item.hungerDelta;
        s.mealHappyRemaining = item.happinessDelta;
        s.mealEnergyRemaining = item.energyDelta;
        s.pendingTreatBonus = { happiness: 0, energy: 0 };
        s.idleZoomies = false;
        if (s.behavior === 'SLEEPING' || s.behavior === 'ROLLING') {
          s.behavior = 'WALKING';
        }
        s.targetNx = BOWL_POS.nx + 0.06;
        s.targetNy = BOWL_POS.ny;
        soundEngine.playMeow(1.15);
        soundEngine.playChime();
        const stageRates = getStageDecayRatesPerSec(
          s.lifeStage,
          s.stageElapsedSec,
          s.adultBranch,
          hungerSpeedRef.current
        );
        resetLowHungerNotificationAfterFeed(
          Math.min(100, s.hunger + item.hungerDelta),
          stageRates.hungerPerSec
        );
        onHudUpdate(buildSnapshot());
        return true;
      },

      buyOrEquipBackground: (bgId: RoomBackgroundId): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        if (s.unlockedBackgrounds.includes(bgId)) {
          s.activeBackground = bgId;
          reconcileDraggablePositions();
          soundEngine.playChime();
          onHudUpdate(buildSnapshot());
          return true;
        }
        const option = ROOM_BACKGROUNDS.find((b) => b.id === bgId);
        if (!option || s.coins < option.price) return false;
        s.coins -= option.price;
        s.unlockedBackgrounds = [...s.unlockedBackgrounds, bgId];
        s.activeBackground = bgId;
        reconcileDraggablePositions();
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

      buyOrEquipBathtub: (tubId: CatBathtubId): boolean => {
        const s = simRef.current;
        soundEngine.unlock();
        if (s.unlockedBathtubs.includes(tubId)) {
          s.activeBathtub = tubId;
          soundEngine.playChime();
          onHudUpdate(buildSnapshot());
          return true;
        }
        const option = CAT_BATHTUBS.find((t) => t.id === tubId);
        if (!option || s.coins < option.price) return false;
        s.coins -= option.price;
        s.unlockedBathtubs = [...s.unlockedBathtubs, tubId];
        s.activeBathtub = tubId;
        soundEngine.playChime();
        const tubPos = roomToScreen(s.tubNx, s.tubNy - 0.04, s.lastRoomTransform);
        spawnParticle('text', tubPos.x, tubPos.y - 34, {
          label: `Bak Mandi Baru: ${option.name}!`,
          color: '#BAE6FD',
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
        if (s.isBathing || s.walkingToBath) {
          // Ensure pending bath rewards aren't lost if saved/closed mid-bath
          const pendingId = s.activeBathItemId ?? s.pendingBathId;
          if (pendingId) {
            const item = BATH_ITEMS.find((b) => b.id === pendingId);
            if (item) {
              s.cleanliness = clamp(s.cleanliness + item.cleanlinessDelta, 0, 100);
              s.happiness = clamp(s.happiness + item.happinessDelta, 0, 100);
              s.pendingBathId = null;
              s.activeBathItemId = null;
            }
          }
        }
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
          isRecovering: s.isRecovering,
          affectionXp: s.affectionXp,
          level: s.level,
          coins: s.coins,
          day: s.day,
          gameHour: s.gameHour,
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
          activeBathtub: s.activeBathtub,
          unlockedBathtubs: [...s.unlockedBathtubs],
          activeToy: s.activeToy,
          unlockedToys: [...s.unlockedToys],
          equippedHat: s.equippedHat,
          equippedGlasses: s.equippedGlasses,
          equippedScarf: s.equippedScarf,
          unlockedAccessories: [...s.unlockedAccessories],
          inventory: { ...s.inventory },
          sleepMode: s.sleepMode,
          sleepRemainingSec: s.sleepRemainingSec,
          sleepDurationSec: s.sleepDurationSec,
          sleepTargetEnergy: s.sleepTargetEnergy,
          sleepTargetHappy: s.sleepTargetHappy,
          sleepTargetHunger: s.sleepTargetHunger,
          sleepTargetClean: s.sleepTargetClean,
          sleepAppliedEnergy: s.sleepAppliedEnergy,
          sleepAppliedHappy: s.sleepAppliedHappy,
          sleepAppliedHunger: s.sleepAppliedHunger,
          sleepAppliedClean: s.sleepAppliedClean,
          zeroEnergyElapsedSec: s.zeroEnergyElapsedSec,
          cooldownsUntil: { ...s.cooldownsUntil },
          bedNx: s.bedNx,
          bedNy: s.bedNy,
          tubNx: s.tubNx,
          tubNy: s.tubNy,
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
        s.petActionCooldown = 0;
        s.petRubAccum = 0;
        s.isRecovering = false;
        s.starveGraceTimer = 0;
        s.starveZeroTimer = 0;
        s.zeroEnergyElapsedSec = 0;
        s.autoSleepRetryTimer = 0;
        s.lastDrowsyNoticeTier = 'fresh';
        s.deathReason = null;
        s.pendingOldAgeGameOver = false;
        s.affectionXp = 0;
        s.level = 1;
        s.coins = 35;
        s.day = 0;
        s.gameHour = INITIAL_GAME_HOUR;
        s.lastDayPhaseNotice = getDayPhaseFromHour(INITIAL_GAME_HOUR);
        s.timeOfDay = INITIAL_GAME_HOUR / 24;
        s.weather = 'cerah';
        s.weatherTimer = 95;
        s.lightningTimer = 7.5;
        s.weatherFx.weather = 'cerah';
        s.weatherFx.prevWeather = 'cerah';
        s.weatherFx.weatherFade = 1;
        s.weatherFx.lightningFlash = 0;
        s.weatherFx.gameHour = INITIAL_GAME_HOUR;
        s.weatherFx.duskWeight = 0;
        s.weatherFx.nightCycleWeight = 0;
        s.lifeStage = 'baby';
        s.stageElapsedSec = 0;
        s.careMistakes = 0;
        s.careMistakeCooldown = 0;
        s.adultBranch = 'prima';
        s.totalCatches = 0;
        s.totalPets = 0;
        s.inventory = { ...INITIAL_INVENTORY };
        s.sleepMode = 'none';
        s.sleepRemainingSec = 0;
        s.sleepDurationSec = 0;
        s.sleepTargetEnergy = 0;
        s.sleepTargetHappy = 0;
        s.sleepTargetHunger = 0;
        s.sleepTargetClean = 0;
        s.sleepAppliedEnergy = 0;
        s.sleepAppliedHappy = 0;
        s.sleepAppliedHunger = 0;
        s.sleepAppliedClean = 0;
        s.lastFreeBathTime = 0;
        s.cooldownsUntil = {
          snack: 0,
          basicSoap: 0,
          miniGame: 0,
          interactivePlay: 0,
          petShort: 0,
          petFull: 0,
          sleepManual: 0,
        };
        s.activeBackground = 'classic_home';
        s.unlockedBackgrounds = ['classic_home'];
        s.activeBed = 'kasur_kucing';
        s.unlockedBeds = ['kasur_kucing'];
        s.activeBathtub = 'bak_kucing';
        s.unlockedBathtubs = ['bak_kucing'];
        s.activeToy = 'yarn_ball';
        s.unlockedToys = ['yarn_ball'];
        s.equippedHat = 'none';
        s.equippedGlasses = 'none';
        s.equippedScarf = 'default';
        s.unlockedAccessories = [];
        s.bedNx = DEFAULT_BED_POS.nx;
        s.bedNy = DEFAULT_BED_POS.ny;
        s.tubNx = DEFAULT_TUB_POS.nx;
        s.tubNy = DEFAULT_TUB_POS.ny;
        s.bedDragCandidate = false;
        s.isDraggingBed = false;
        s.tubDragCandidate = false;
        s.isDraggingTub = false;
        s.walkingToBath = false;
        s.pendingBathId = null;
        s.isBathing = false;
        s.bathTimer = 0;
        s.bathMidSoundPlayed = false;
        s.activeBathItemId = null;
        s.bowlAmount = 0;
        s.bowlTreatType = 'snack';
        s.mealHungerRemaining = 0;
        s.mealHappyRemaining = 0;
        s.mealEnergyRemaining = 0;
        s.lastFreeFeedTime = 0;
        s.toy.active = false;
        s.toy.catchCooldown = 0;
        s.playSession.active = false;
        s.idleDecisionTimer = 1.6;
        s.idleMeowTimer = 5.5;
        const initRates = getStageDecayRatesPerSec('baby', 0, 'prima', hungerSpeedRef.current);
        resetLowHungerNotificationAfterFeed(s.hunger, initRates.hungerPerSec);
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

        const validStages: LifeStage[] = ['baby', 'child', 'teen', 'adult', 'senior'];
        const initialStage: LifeStage =
          save.lifeStage && validStages.includes(save.lifeStage)
            ? save.lifeStage
            : save.day >= 12
            ? 'senior'
            : save.day >= 4
            ? 'adult'
            : 'baby';
        const initialStageElapsed =
          typeof save.stageElapsedSec === 'number' && Number.isFinite(save.stageElapsedSec)
            ? Math.max(0, save.stageElapsedSec)
            : 0;
        const initialMistakes =
          typeof save.careMistakes === 'number' && Number.isFinite(save.careMistakes)
            ? Math.max(0, save.careMistakes)
            : 0;
        const initialBranch: AdultEvolutionBranch =
          save.adultBranch === 'prima' ||
          save.adultBranch === 'mandiri' ||
          save.adultBranch === 'sensitif'
            ? save.adultBranch
            : 'prima';

        const initialGameHour =
          typeof save.gameHour === 'number' && Number.isFinite(save.gameHour)
            ? ((save.gameHour % 24) + 24) % 24
            : typeof save.timeOfDay === 'number' && Number.isFinite(save.timeOfDay)
            ? ((save.timeOfDay * 24) % 24 + 24) % 24
            : INITIAL_GAME_HOUR;

        const loadedWeather: WeatherType = save.weather === 'hujan' ? 'hujan' : 'cerah';
        const offline = calculateOfflineDecay({
          hunger: save.hunger,
          happiness: save.happiness,
          cleanliness: save.cleanliness,
          energy: save.energy,
          health: save.health ?? 100,
          isSick: save.isSick,
          isRecovering: save.isRecovering,
          lifeStage: initialStage,
          stageElapsedSec: initialStageElapsed,
          careMistakes: initialMistakes,
          adultBranch: initialBranch,
          hungerSpeed: hungerSpeedRef.current,
          sleepMode: save.sleepMode ?? 'none',
          sleepRemainingSec: save.sleepRemainingSec ?? 0,
          sleepDurationSec: save.sleepDurationSec ?? 0,
          sleepTargetEnergy: save.sleepTargetEnergy ?? 0,
          sleepTargetHappy: save.sleepTargetHappy ?? 0,
          sleepTargetHunger: save.sleepTargetHunger ?? 0,
          sleepTargetClean: save.sleepTargetClean ?? 0,
          sleepAppliedEnergy: save.sleepAppliedEnergy ?? 0,
          sleepAppliedHappy: save.sleepAppliedHappy ?? 0,
          sleepAppliedHunger: save.sleepAppliedHunger ?? 0,
          sleepAppliedClean: save.sleepAppliedClean ?? 0,
          sleepCooldownUntil: save.cooldownsUntil?.sleepManual ?? 0,
          gameHour: initialGameHour,
          weather: loadedWeather,
          lastSavedTime: save.lastSavedTime ?? save.savedAt,
        });
        s.hunger = offline.hunger;
        s.happiness = offline.happiness;
        s.cleanliness = offline.cleanliness;
        s.energy = offline.energy;
        s.health = offline.health;
        s.inventory = {
          main_food: Math.max(0, Math.floor(save.inventory?.main_food ?? 0)),
          special_food: Math.max(0, Math.floor(save.inventory?.special_food ?? 0)),
          shampoo_foam: Math.max(0, Math.floor(save.inventory?.shampoo_foam ?? 0)),
          spa_bath: Math.max(0, Math.floor(save.inventory?.spa_bath ?? 0)),
        };
        s.sleepMode = offline.sleepMode;
        s.sleepRemainingSec = offline.sleepRemainingSec;
        s.sleepDurationSec = offline.sleepDurationSec;
        s.sleepTargetEnergy = offline.sleepTargetEnergy;
        s.sleepTargetHappy = offline.sleepTargetHappy;
        s.sleepTargetHunger = offline.sleepTargetHunger;
        s.sleepTargetClean = offline.sleepTargetClean;
        s.sleepAppliedEnergy = offline.sleepAppliedEnergy;
        s.sleepAppliedHappy = offline.sleepAppliedHappy;
        s.sleepAppliedHunger = offline.sleepAppliedHunger;
        s.sleepAppliedClean = offline.sleepAppliedClean;
        s.cooldownsUntil = {
          snack: Math.max(0, save.cooldownsUntil?.snack ?? 0),
          basicSoap: Math.max(0, save.cooldownsUntil?.basicSoap ?? 0),
          miniGame: Math.max(0, save.cooldownsUntil?.miniGame ?? 0),
          interactivePlay: Math.max(0, save.cooldownsUntil?.interactivePlay ?? 0),
          petShort: Math.max(0, save.cooldownsUntil?.petShort ?? 0),
          petFull: Math.max(0, save.cooldownsUntil?.petFull ?? 0),
          sleepManual: Math.max(
            0,
            offline.sleepCooldownUntil,
            save.cooldownsUntil?.sleepManual ?? 0
          ),
        };
        s.zeroEnergyElapsedSec =
          s.energy <= 0.5 && typeof save.zeroEnergyElapsedSec === 'number'
            ? Math.max(0, save.zeroEnergyElapsedSec)
            : 0;
        s.autoSleepRetryTimer = 0;
        s.lastDrowsyNoticeTier = getDrowsyStage(s.energy, offline.dayPhase, loadedWeather);

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
        s.petActionCooldown = 0;
        s.petRubAccum = 0;
        s.isRecovering = offline.isRecovering;
        s.isSick = offline.isSick;
        if (s.cleanliness <= 0 && !s.isRecovering) {
          s.cleanliness = 0;
          s.health = Math.min(s.health, SICK_START_HEALTH);
          s.isSick = true;
          s.sickReason = 'dirty_zero';
        } else {
          s.sickReason = s.isSick ? 'health' : null;
        }
        s.starveGraceTimer = 0;
        s.starveZeroTimer = s.hunger <= 0 ? 10 : 0;
        s.deathReason = offline.passedAwayOfOldAge ? 'old_age' : null;
        s.pendingOldAgeGameOver = offline.passedAwayOfOldAge;
        s.affectionXp = save.affectionXp;
        s.level = save.level;
        s.coins = save.coins;
        s.day = offline.day;
        s.gameHour = offline.gameHour;
        s.lastDayPhaseNotice = offline.dayPhase;
        s.timeOfDay = offline.gameHour / 24;
        s.weather = loadedWeather;
        s.weatherTimer = loadedWeather === 'hujan' ? 140 : 120;
        s.lightningTimer = 7.5;
        s.weatherFx.weather = loadedWeather;
        s.weatherFx.prevWeather = loadedWeather;
        s.weatherFx.weatherFade = 1;
        s.weatherFx.lightningFlash = 0;
        s.weatherFx.gameHour = offline.gameHour;
        s.lifeStage = offline.lifeStage;
        s.stageElapsedSec = offline.stageElapsedSec;
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
        s.activeBathtub = normalizeBathtubId(save.activeBathtub);
        s.unlockedBathtubs =
          save.unlockedBathtubs && save.unlockedBathtubs.length > 0
            ? Array.from(new Set(save.unlockedBathtubs.map((id) => normalizeBathtubId(id))))
            : ['bak_kucing'];
        if (!s.unlockedBathtubs.includes('bak_kucing')) {
          s.unlockedBathtubs.push('bak_kucing');
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
        s.bedNx = save.bedNx ?? DEFAULT_BED_POS.nx;
        s.bedNy = save.bedNy ?? DEFAULT_BED_POS.ny;
        s.tubNx = save.tubNx ?? DEFAULT_TUB_POS.nx;
        s.tubNy = save.tubNy ?? DEFAULT_TUB_POS.ny;
        reconcileDraggablePositions();
        s.bedDragCandidate = false;
        s.isDraggingBed = false;
        s.tubDragCandidate = false;
        s.isDraggingTub = false;
        s.walkingToBath = false;
        s.pendingBathId = null;
        s.isBathing = false;
        s.bathTimer = 0;
        s.bathMidSoundPlayed = false;
        s.activeBathItemId = null;
        if (s.sleepMode !== 'none') {
          s.behavior = 'SLEEPING';
          s.nx = s.bedNx;
          s.ny = s.bedNy;
          s.facing = 1;
        } else {
          s.behavior = 'IDLE';
          s.nx = 0.52;
          s.ny = 0.78;
        }
        s.z = 0;
        s.vz = 0;
        s.idleZoomies = false;
        s.bowlAmount = 0;
        s.bowlTreatType = 'snack';
        s.mealHungerRemaining = 0;
        s.mealHappyRemaining = 0;
        s.mealEnergyRemaining = 0;
        s.lastFreeFeedTime =
          typeof save.lastFreeFeedAt === 'number' && Number.isFinite(save.lastFreeFeedAt)
            ? save.lastFreeFeedAt
            : 0;
        s.toy.active = false;
        s.toy.catchCooldown = 0;
        s.playSession.active = false;
        s.idleMeowTimer = 5.5;

        const loadedRates = getStageDecayRatesPerSec(
          s.lifeStage,
          s.stageElapsedSec,
          s.adultBranch,
          hungerSpeedRef.current
        );
        setLowHungerNotifiedFlag(false);
        if (s.hunger < 40) {
          sendLowHungerNotification();
        } else {
          scheduleLowHungerNotification(s.hunger, loadedRates.hungerPerSec);
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

      applyDevPatch: (patch: DevStatePatch) => {
        const s = simRef.current;
        if (typeof patch.hunger === 'number') s.hunger = clamp(patch.hunger, 0, 100);
        if (typeof patch.happiness === 'number') s.happiness = clamp(patch.happiness, 0, 100);
        if (typeof patch.cleanliness === 'number') s.cleanliness = clamp(patch.cleanliness, 0, 100);
        if (typeof patch.energy === 'number') {
          s.energy = clamp(patch.energy, 0, 100);
          if (s.energy > 0) {
            s.zeroEnergyElapsedSec = 0;
          }
        }
        if (typeof patch.health === 'number') {
          s.health = clamp(patch.health, 0, 100);
          if (s.health <= SICK_START_HEALTH) {
            s.isSick = true;
            s.sickReason = s.sickReason ?? 'health';
          } else if (s.health >= SICK_SYMPTOM_CLEAR_HEALTH) {
            s.isSick = false;
            s.sickReason = null;
          }
          if (s.health >= 100) {
            s.isRecovering = false;
          }
        }
        if (typeof patch.isSick === 'boolean') {
          s.isSick = patch.isSick;
          if (patch.isSick) {
            s.health = Math.min(s.health, SICK_START_HEALTH);
            s.sickReason = patch.sickReason ?? s.sickReason ?? 'health';
            s.isRecovering = false;
          } else {
            s.health = Math.max(s.health, 100);
            s.sickReason = null;
            s.isRecovering = false;
            s.lowCleanlinessStrikes = 0;
            s.starveZeroTimer = 0;
            s.zeroEnergyElapsedSec = 0;
          }
        }
        if (typeof patch.coins === 'number') {
          s.coins = Math.max(0, Math.round(patch.coins));
        }
        if (typeof patch.level === 'number') {
          s.level = Math.max(1, Math.round(patch.level));
        }
        if (typeof patch.affectionXp === 'number') {
          s.affectionXp = Math.max(0, Math.round(patch.affectionXp));
        }
        if (patch.breed && patch.breed in CAT_BREEDS) {
          s.breed = patch.breed;
        }
        if (patch.personality && patch.personality in PERSONALITY_MODS) {
          s.personality = patch.personality;
        }
        if (typeof patch.careMistakes === 'number') {
          s.careMistakes = Math.max(0, Math.round(patch.careMistakes));
        }
        if (patch.adultBranch) {
          s.adultBranch = patch.adultBranch;
        }
        if (typeof patch.gameHour === 'number' && Number.isFinite(patch.gameHour)) {
          const normHour = ((patch.gameHour % 24) + 24) % 24;
          s.gameHour = normHour;
          s.timeOfDay = normHour / 24;
          s.weatherFx.gameHour = normHour;
          s.lastDayPhaseNotice = getDayPhaseFromHour(normHour);
        }
        if (patch.weather) {
          const nextW: WeatherType = patch.weather === 'hujan' ? 'hujan' : 'cerah';
          s.weatherFx.prevWeather = s.weather;
          s.weather = nextW;
          s.weatherFx.weather = nextW;
          s.weatherFx.weatherFade = 0;
          s.weatherTimer = nextW === 'hujan' ? 160 : 180;
        }
        if (patch.lifeStage) {
          s.lifeStage = patch.lifeStage;
          s.stageElapsedSec = 0;
          s.day = computeCalendarDayAndHour(patch.lifeStage, 0).day;
        }
        if (typeof patch.stageProgressPct === 'number') {
          const pct = clamp(patch.stageProgressPct, 0, 99.5) / 100;
          s.stageElapsedSec = LIFE_STAGES[s.lifeStage].durationSec * pct;
          s.day = computeCalendarDayAndHour(s.lifeStage, s.stageElapsedSec).day;
        }
        if (typeof patch.day === 'number' && Number.isFinite(patch.day)) {
          const targetDay = Math.max(0, Math.min(18, Math.round(patch.day)));
          if (targetDay === 0) {
            s.lifeStage = 'baby';
            s.stageElapsedSec = 0;
          } else if (targetDay === 1) {
            s.lifeStage = 'child';
            s.stageElapsedSec = 0;
          } else if (targetDay <= 3) {
            s.lifeStage = 'teen';
            s.stageElapsedSec = (targetDay - 2) * 86400;
          } else if (targetDay <= 11) {
            s.lifeStage = 'adult';
            s.stageElapsedSec = (targetDay - 4) * 86400;
          } else {
            s.lifeStage = 'senior';
            s.stageElapsedSec = (targetDay - 12) * 86400;
          }
          s.day = targetDay;
        }
        if (typeof patch.bowlAmount === 'number') {
          s.bowlAmount = clamp(patch.bowlAmount, 0, 1);
          if (s.bowlAmount > 0 && s.mealHungerRemaining <= 0) {
            s.mealHungerRemaining = 25;
            s.mealHappyRemaining = 5;
          }
        }
        if (patch.inventory) {
          s.inventory = { ...s.inventory, ...patch.inventory };
        }

        s.lastDrowsyNoticeTier = getDrowsyStage(
          s.energy,
          getDayPhaseFromHour(s.gameHour),
          s.weather
        );
        if (s.hunger >= 40) {
          const rates = getStageDecayRatesPerSec(
            s.lifeStage,
            s.stageElapsedSec,
            s.adultBranch,
            hungerSpeedRef.current
          );
          resetLowHungerNotificationAfterFeed(s.hunger, rates.hungerPerSec);
        }
        onHudUpdate(buildSnapshot());
      },

      devAction: (action: DevQuickAction) => {
        const s = simRef.current;
        const now = Date.now();
        const catPos = roomToScreen(s.nx, s.ny - 0.08, s.lastRoomTransform);

        const advanceOfflineBySec = (sec: number, label: string) => {
          const offline = calculateOfflineDecay({
            hunger: s.hunger,
            happiness: s.happiness,
            cleanliness: s.cleanliness,
            energy: s.energy,
            health: s.health,
            isSick: s.isSick,
            isRecovering: s.isRecovering,
            lifeStage: s.lifeStage,
            stageElapsedSec: s.stageElapsedSec,
            careMistakes: s.careMistakes,
            adultBranch: s.adultBranch,
            hungerSpeed: hungerSpeedRef.current,
            sleepMode: s.sleepMode,
            sleepRemainingSec: s.sleepRemainingSec,
            sleepDurationSec: s.sleepDurationSec,
            sleepTargetEnergy: s.sleepTargetEnergy,
            sleepTargetHappy: s.sleepTargetHappy,
            sleepTargetHunger: s.sleepTargetHunger,
            sleepTargetClean: s.sleepTargetClean,
            sleepAppliedEnergy: s.sleepAppliedEnergy,
            sleepAppliedHappy: s.sleepAppliedHappy,
            sleepAppliedHunger: s.sleepAppliedHunger,
            sleepAppliedClean: s.sleepAppliedClean,
            sleepCooldownUntil: s.cooldownsUntil.sleepManual,
            gameHour: s.gameHour,
            weather: s.weather,
            lastSavedTime: now - sec * 1000,
            now,
          });
          s.hunger = offline.hunger;
          s.happiness = offline.happiness;
          s.cleanliness = offline.cleanliness;
          s.energy = offline.energy;
          s.health = offline.health;
          s.isSick = offline.isSick;
          s.isRecovering = offline.isRecovering;
          if (!s.isSick) {
            s.sickReason = null;
          } else if (!s.sickReason) {
            s.sickReason = 'health';
          }
          s.lifeStage = offline.lifeStage;
          s.stageElapsedSec = offline.stageElapsedSec;
          s.adultBranch = offline.adultBranch;
          s.day = offline.day;
          s.gameHour = offline.gameHour;
          s.timeOfDay = offline.gameHour / 24;
          s.weatherFx.gameHour = offline.gameHour;
          s.lastDayPhaseNotice = offline.dayPhase;
          s.sleepMode = offline.sleepMode;
          s.sleepRemainingSec = offline.sleepRemainingSec;
          s.sleepDurationSec = offline.sleepDurationSec;
          s.sleepTargetEnergy = offline.sleepTargetEnergy;
          s.sleepTargetHappy = offline.sleepTargetHappy;
          s.sleepTargetHunger = offline.sleepTargetHunger;
          s.sleepTargetClean = offline.sleepTargetClean;
          s.sleepAppliedEnergy = offline.sleepAppliedEnergy;
          s.sleepAppliedHappy = offline.sleepAppliedHappy;
          s.sleepAppliedHunger = offline.sleepAppliedHunger;
          s.sleepAppliedClean = offline.sleepAppliedClean;
          if (s.sleepMode === 'none' && s.behavior === 'SLEEPING') {
            s.behavior = 'IDLE';
          }
          if (offline.passedAwayOfOldAge) {
            s.deathReason = 'old_age';
            s.pendingOldAgeGameOver = true;
          }
          spawnParticle('text', catPos.x, catPos.y - 38, {
            label: `[DEV] ${label}`,
            color: '#FDE68A',
            size: 13.5,
            vy: -26,
            maxLife: 1.5,
          });
        };

        switch (action) {
          case 'reset_cooldowns':
            s.cooldownsUntil = {
              snack: 0,
              basicSoap: 0,
              miniGame: 0,
              interactivePlay: 0,
              petShort: 0,
              petFull: 0,
              sleepManual: 0,
            };
            s.lastFreeFeedTime = 0;
            s.lastFreeBathTime = 0;
            s.autoSleepRetryTimer = 0;
            soundEngine.playChime();
            spawnParticle('text', catPos.x, catPos.y - 34, {
              label: '[DEV] Semua Cooldown Direset',
              color: '#A7F3D0',
              size: 13.5,
              vy: -26,
              maxLife: 1.4,
            });
            break;

          case 'unlock_all_shop':
            s.unlockedBackgrounds = ROOM_BACKGROUNDS.map((b) => b.id);
            s.unlockedBeds = CAT_BEDS.map((b) => b.id);
            s.unlockedBathtubs = CAT_BATHTUBS.map((t) => t.id);
            s.unlockedToys = CAT_TOYS.map((t) => t.id);
            s.unlockedAccessories = CAT_ACCESSORIES.map((a) => a.id);
            soundEngine.playChime();
            spawnParticle('text', catPos.x, catPos.y - 34, {
              label: '[DEV] Semua Item Shop Terbuka!',
              color: '#FDE68A',
              size: 13.5,
              vy: -26,
              maxLife: 1.4,
            });
            break;

          case 'fill_inventory':
            s.inventory = {
              main_food: s.inventory.main_food + 5,
              special_food: s.inventory.special_food + 5,
              shampoo_foam: s.inventory.shampoo_foam + 5,
              spa_bath: s.inventory.spa_bath + 5,
            };
            soundEngine.playChime();
            spawnParticle('text', catPos.x, catPos.y - 34, {
              label: '[DEV] +5 Semua Stok Makanan & Mandi',
              color: '#A7F3D0',
              size: 13.5,
              vy: -26,
              maxLife: 1.4,
            });
            break;

          case 'advance_time_10m':
            advanceOfflineBySec(600, 'Simulasi +10 Menit Nyata');
            break;

          case 'advance_time_1h':
            advanceOfflineBySec(3600, 'Simulasi +1 Jam Nyata');
            break;

          case 'advance_time_6h':
            advanceOfflineBySec(21600, 'Simulasi +6 Jam Nyata');
            break;

          case 'evolve_next':
            if (s.lifeStage === 'baby') {
              s.lifeStage = 'child';
              s.stageElapsedSec = 0;
              s.day = 1;
              celebrateStageEvolution('child', 'Mini-Game Terbuka');
            } else if (s.lifeStage === 'child') {
              s.lifeStage = 'teen';
              s.stageElapsedSec = 0;
              s.day = 2;
              celebrateStageEvolution('teen');
            } else if (s.lifeStage === 'teen') {
              const branch: AdultEvolutionBranch =
                s.careMistakes <= 2 ? 'prima' : s.careMistakes <= 5 ? 'mandiri' : 'sensitif';
              s.adultBranch = branch;
              s.lifeStage = 'adult';
              s.stageElapsedSec = 0;
              s.day = 4;
              celebrateStageEvolution(
                'adult',
                branch === 'prima'
                  ? 'Dewasa Prima'
                  : branch === 'mandiri'
                  ? 'Dewasa Mandiri'
                  : 'Dewasa Sensitif'
              );
            } else if (s.lifeStage === 'adult') {
              s.lifeStage = 'senior';
              s.stageElapsedSec = 0;
              s.day = 12;
              celebrateStageEvolution('senior');
            } else {
              s.deathReason = 'old_age';
              s.pendingOldAgeGameOver = true;
            }
            break;

          case 'trigger_auto_sleep':
            s.energy = 0;
            s.autoSleepRetryTimer = 0;
            if (s.behavior === 'SLEEPING') {
              s.behavior = 'IDLE';
              s.sleepMode = 'none';
            }
            break;

          case 'wake_up_free':
            s.sleepMode = 'none';
            s.sleepRemainingSec = 0;
            s.sleepDurationSec = 0;
            s.sleepTargetEnergy = 0;
            s.sleepTargetHappy = 0;
            s.sleepTargetHunger = 0;
            s.sleepTargetClean = 0;
            s.sleepAppliedEnergy = 0;
            s.sleepAppliedHappy = 0;
            s.sleepAppliedHunger = 0;
            s.sleepAppliedClean = 0;
            s.behavior = 'IDLE';
            s.idleDecisionTimer = 1.5;
            soundEngine.playChime();
            break;

          case 'trigger_lightning':
            if (s.weather !== 'hujan') {
              s.weatherFx.prevWeather = s.weather;
              s.weather = 'hujan';
              s.weatherFx.weather = 'hujan';
              s.weatherFx.weatherFade = 0;
              s.weatherTimer = 150;
            }
            s.weatherFx.lightningFlash = 0.95;
            break;

          case 'heal_instant':
            s.health = 100;
            s.isSick = false;
            s.sickReason = null;
            s.isRecovering = false;
            s.lowCleanlinessStrikes = 0;
            s.starveZeroTimer = 0;
            s.zeroEnergyElapsedSec = 0;
            soundEngine.playChime();
            spawnParticle('text', catPos.x, catPos.y - 34, {
              label: '[DEV] Sehat Sempurna (100)',
              color: '#6EE7B7',
              size: 13.5,
              vy: -26,
              maxLife: 1.4,
            });
            break;

          case 'force_game_over_sick':
            s.health = 0;
            s.isSick = true;
            s.deathReason = 'sickness';
            break;

          case 'force_game_over_old':
            s.lifeStage = 'senior';
            s.day = 18;
            s.deathReason = 'old_age';
            s.pendingOldAgeGameOver = true;
            break;
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

      CAT_BATHTUBS.forEach((tub) => {
        const img = new Image();
        img.src = tub.imgSrc;
        tubImgsRef.current[tub.id] = img;
      });

      (Object.keys(CAT_BREEDS) as CatBreed[]).forEach((breedKey) => {
        const sheetImg = new Image();
        sheetImg.src = CAT_BREEDS[breedKey].spriteSheet;
        spriteSheetsRef.current[breedKey] = sheetImg;

        const babySheetImg = new Image();
        babySheetImg.src = CAT_BREEDS[breedKey].babySpriteSheet;
        babySpriteSheetsRef.current[breedKey] = babySheetImg;

        const childSheetImg = new Image();
        childSheetImg.src = CAT_BREEDS[breedKey].childSpriteSheet;
        childSpriteSheetsRef.current[breedKey] = childSheetImg;

        const bathSheetImg = new Image();
        bathSheetImg.src = CAT_BREEDS[breedKey].bathSpriteSheet;
        bathSpriteSheetsRef.current[breedKey] = bathSheetImg;
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
        simRef.current.lastRoomTransform = computeRoomTransform(w, h);
        reconcileDraggablePositions();
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

        if (gState === 'PLAYING' && s.health > 5 && !s.pendingOldAgeGameOver) {
          gameOverFired = false;
        }
        if (gState === 'PLAYING' && s.pendingOldAgeGameOver && !gameOverFired) {
          s.pendingOldAgeGameOver = false;
          s.deathReason = 'old_age';
          gameOverFired = true;
          clearLowHungerNotificationSchedule();
          onGameOver(buildSnapshot());
          return;
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
            s.petActionCooldown = Math.max(0, s.petActionCooldown - dt);
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
              const tScale = Math.max(1, devTimeScaleRef.current);
              const simDt = dt * tScale;

              if (tScale > 1) {
                const shiftMs = (tScale - 1) * dt * 1000;
                const keys = Object.keys(s.cooldownsUntil) as Array<keyof typeof s.cooldownsUntil>;
                const nowMs = Date.now();
                for (const k of keys) {
                  if (s.cooldownsUntil[k] > nowMs) {
                    s.cooldownsUntil[k] = Math.max(nowMs, s.cooldownsUntil[k] - shiftMs);
                  }
                }
              }

              // Siklus 24 jam game (60 menit nyata = 3 hari game / 73 jam -> ~49,3 detik nyata / jam game)
              s.gameHour = (s.gameHour + simDt * GAME_HOURS_PER_REAL_SEC) % 24;
              s.timeOfDay = s.gameHour / 24;
              stepWeatherFx(s.weatherFx, dt, s.activeBackground, s.gameHour);

              const currentDayPhase = getDayPhaseFromHour(s.gameHour);
              if (currentDayPhase !== s.lastDayPhaseNotice) {
                s.lastDayPhaseNotice = currentDayPhase;
                const phaseBanner =
                  currentDayPhase === 'pagi'
                    ? 'Pagi tiba (06:00) · Bonus tidur +10% Energi'
                    : currentDayPhase === 'siang'
                    ? 'Siang tiba (12:00) · Main +10% Bahagia'
                    : 'Malam tiba (18:00) · Bonus tidur +20% Energi';
                const phaseColor =
                  currentDayPhase === 'malam' ? '#C4B5FD' : '#FDE68A';
                spawnParticle('text', viewW * 0.5, Math.max(82, viewH * 0.18), {
                  label: phaseBanner,
                  color: phaseColor,
                  size: 14,
                  vx: 0,
                  vy: -16,
                  maxLife: 2.2,
                });
              }

              if (s.weather === 'hujan') {
                s.lightningTimer -= simDt;
                if (s.lightningTimer <= 0) {
                  s.lightningTimer = 6.5 + Math.random() * 8.0;
                  s.weatherFx.lightningFlash = 0.85;
                }
              }

              s.weatherTimer -= simDt;
              if (s.weatherTimer <= 0) {
                const prevW = s.weather;
                const nextWeather: WeatherType =
                  prevW === 'cerah' ? (Math.random() < 0.65 ? 'hujan' : 'cerah') : 'cerah';

                s.weatherFx.prevWeather = prevW;
                s.weather = nextWeather;
                s.weatherFx.weather = nextWeather;
                s.weatherFx.weatherFade = 0;
                // Durasi hujan & cerah beberapa menit nyata (2–3,5 menit nyata)
                s.weatherTimer =
                  nextWeather === 'hujan'
                    ? 120 + Math.random() * 60
                    : 130 + Math.random() * 80;

                if (nextWeather !== prevW) {
                  const phaseLabelNotice =
                    currentDayPhase === 'pagi'
                      ? 'Pagi'
                      : currentDayPhase === 'malam'
                      ? 'Malam'
                      : 'Siang';
                  spawnParticle('text', viewW * 0.5, Math.max(82, viewH * 0.18), {
                    label:
                      nextWeather === 'hujan'
                        ? `Hujan ${phaseLabelNotice} turun · Tidur +10% Energi`
                        : `Hujan reda · Langit ${phaseLabelNotice} cerah`,
                    color: nextWeather === 'hujan' ? '#93C5FD' : '#FDE68A',
                    size: 14,
                    vx: 0,
                    vy: -16,
                    maxLife: 2.2,
                  });
                }
              }

              // Tahap Pertumbuhan (Life Stages), Kalender Game & Care Mistakes
              s.stageElapsedSec += simDt;
              s.careMistakeCooldown = Math.max(0, s.careMistakeCooldown - simDt);

              if (
                (s.lifeStage === 'child' || s.lifeStage === 'teen') &&
                s.careMistakeCooldown <= 0 &&
                (s.hunger < 20 || s.cleanliness < 20 || s.happiness < 20 || (s.isSick && !s.isRecovering))
              ) {
                s.careMistakes += 1;
                s.careMistakeCooldown = 45;
              }

              let transitionedStage = false;
              if (s.lifeStage === 'baby' && s.stageElapsedSec >= LIFE_STAGES.baby.durationSec) {
                s.lifeStage = 'child';
                s.stageElapsedSec = 0;
                s.day = 1;
                transitionedStage = true;
                celebrateStageEvolution('child', 'Mini-Game Terbuka');
              } else if (
                s.lifeStage === 'child' &&
                s.stageElapsedSec >= LIFE_STAGES.child.durationSec
              ) {
                s.lifeStage = 'teen';
                s.stageElapsedSec = 0;
                s.day = 2;
                transitionedStage = true;
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
                s.day = 4;
                transitionedStage = true;
                const branchTitle =
                  branch === 'prima'
                    ? 'Dewasa Prima'
                    : branch === 'mandiri'
                    ? 'Dewasa Mandiri'
                    : 'Dewasa Sensitif';
                celebrateStageEvolution('adult', branchTitle);
              } else if (
                s.lifeStage === 'adult' &&
                s.stageElapsedSec >= LIFE_STAGES.adult.durationSec
              ) {
                s.lifeStage = 'senior';
                s.stageElapsedSec = 0;
                s.day = 12;
                transitionedStage = true;
                celebrateStageEvolution('senior');
              } else if (
                s.lifeStage === 'senior' &&
                s.stageElapsedSec >= LIFE_STAGES.senior.durationSec &&
                !gameOverFired
              ) {
                s.deathReason = 'old_age';
                gameOverFired = true;
                clearLowHungerNotificationSchedule();
                onGameOver(buildSnapshot());
              }

              // Kalender Game (Baby: Hari 0-3 / Jam 0-73, Child: 1, Teen: 2-3, Adult: 4-11, Senior: 12-18)
              if (!transitionedStage && !gameOverFired) {
                const { day: nextCalDay } = computeCalendarDayAndHour(
                  s.lifeStage,
                  s.stageElapsedSec
                );
                if (nextCalDay > s.day) {
                  s.day = nextCalDay;
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
              }

              const rates = getStageDecayRatesPerSec(
                s.lifeStage,
                s.stageElapsedSec,
                s.adultBranch,
                hungerSpeedRef.current
              );
              const dayPhase = getDayPhaseFromHour(s.gameHour);
              const phaseMult = getDayPhaseMultipliers(dayPhase);
              const weatherMult = getWeatherMultipliers(s.weather);
              const pMod = PERSONALITY_MODS[s.personality];
              // Efek Stres: jika bahagia < 20, penurunan kenyang & energi lebih cepat
              const stressMult = s.happiness < 20 ? 1.35 : 1.0;

              if (s.autoSleepRetryTimer > 0) {
                s.autoSleepRetryTimer = Math.max(0, s.autoSleepRetryTimer - simDt);
              }

              // Track durasi Energi == 0 untuk pemicu Overwork (>= 10 menit nyata)
              if (s.energy <= 0.5) {
                s.zeroEnergyElapsedSec += simDt;
              } else if (s.energy >= 5) {
                s.zeroEnergyElapsedSec = 0;
              }

              if (
                s.zeroEnergyElapsedSec >= OVERWORK_SICK_SECONDS &&
                !s.isSick &&
                !s.isRecovering
              ) {
                s.health = Math.min(s.health, SICK_START_HEALTH);
                s.isSick = true;
                s.isRecovering = false;
                s.sickReason = 'overwork';
                s.zeroEnergyElapsedSec = 0;
                soundEngine.playMeow(0.76);
                const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                spawnParticle('text', catPos.x, catPos.y - 36, {
                  label: 'Overwork! Energi 0 terlalu lama — Kucing jatuh sakit!',
                  color: '#FCA5A5',
                  size: 13.5,
                  vy: -26,
                  maxLife: 1.9,
                });
              }

              if (s.behavior === 'SLEEPING') {
                if (s.sleepMode !== 'none' && s.sleepDurationSec > 0) {
                  const stepSec = Math.min(simDt, s.sleepRemainingSec);
                  s.sleepRemainingSec = Math.max(0, s.sleepRemainingSec - stepSec);
                  const eStep = (s.sleepTargetEnergy / s.sleepDurationSec) * stepSec;
                  const hStep = (s.sleepTargetHappy / s.sleepDurationSec) * stepSec;
                  const hunStep = (s.sleepTargetHunger / s.sleepDurationSec) * stepSec;
                  const clnStep = (s.sleepTargetClean / s.sleepDurationSec) * stepSec;

                  s.energy = clamp(s.energy + eStep, 0, 100);
                  s.happiness = clamp(s.happiness + hStep, 0, 100);
                  s.hunger = clamp(s.hunger + hunStep, 0, 100);
                  s.cleanliness = clamp(s.cleanliness + clnStep, 0, 100);

                  s.sleepAppliedEnergy += eStep;
                  s.sleepAppliedHappy += hStep;
                  s.sleepAppliedHunger += hunStep;
                  s.sleepAppliedClean += clnStep;

                  s.hunger = clamp(
                    s.hunger -
                      simDt *
                        rates.hungerPerSec *
                        phaseMult.hunger *
                        weatherMult.idleOrSleepHunger *
                        0.25 *
                        stressMult,
                    0,
                    100
                  );
                  s.cleanliness = clamp(
                    s.cleanliness - simDt * rates.cleanlinessPerSec * phaseMult.cleanliness * 0.25,
                    0,
                    100
                  );
                } else {
                  s.energy = clamp(s.energy + simDt * 1.4 * weatherMult.sleepEnergyMult, 0, 100);
                  s.hunger = clamp(
                    s.hunger -
                      simDt *
                        rates.hungerPerSec *
                        phaseMult.hunger *
                        weatherMult.idleOrSleepHunger *
                        0.5 *
                        stressMult,
                    0,
                    100
                  );
                  const rainHappyFactor =
                    s.hunger < 40 || s.cleanliness < 40
                      ? weatherMult.indoorHappyBadStats
                      : weatherMult.indoorHappyNormal;
                  const baseSleepHappy =
                    rates.happinessPerSec * phaseMult.happiness * rainHappyFactor;
                  const sleepHappyPenalty =
                    ((s.hunger < 40 ? baseSleepHappy * 0.4 : 0) +
                      (s.cleanliness < 40 ? 0.015 : 0)) *
                    rainHappyFactor;
                  s.happiness = clamp(
                    s.happiness - simDt * (baseSleepHappy * 0.5 + sleepHappyPenalty),
                    0,
                    100
                  );
                  s.cleanliness = clamp(
                    s.cleanliness - simDt * rates.cleanlinessPerSec * phaseMult.cleanliness * 0.5,
                    0,
                    100
                  );
                }

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

                if (s.sleepMode !== 'none' && s.sleepRemainingSec <= 0) {
                  const remE = Math.max(0, s.sleepTargetEnergy - s.sleepAppliedEnergy);
                  const remH = Math.max(0, s.sleepTargetHappy - s.sleepAppliedHappy);
                  const remHun = Math.min(0, s.sleepTargetHunger - s.sleepAppliedHunger);
                  const remCln = Math.min(0, s.sleepTargetClean - s.sleepAppliedClean);
                  s.energy = clamp(s.energy + remE, 0, 100);
                  s.happiness = clamp(s.happiness + remH, 0, 100);
                  s.hunger = clamp(s.hunger + remHun, 0, 100);
                  s.cleanliness = clamp(s.cleanliness + remCln, 0, 100);

                  const completedMode = s.sleepMode;
                  const doneEnergyGain = Math.round(s.sleepTargetEnergy);
                  const doneHappyGain = Math.round(s.sleepTargetHappy);
                  if (completedMode === 'power_nap' || completedMode === 'full_rest') {
                    const opt = SLEEP_OPTIONS.find((o) => o.id === completedMode);
                    const cdSec =
                      opt?.cooldownAfterWakeSec ?? (completedMode === 'power_nap' ? 180 : 300);
                    s.cooldownsUntil.sleepManual = Date.now() + cdSec * 1000;
                  }

                  s.sleepMode = 'none';
                  s.sleepRemainingSec = 0;
                  s.sleepDurationSec = 0;
                  s.sleepTargetEnergy = 0;
                  s.sleepTargetHappy = 0;
                  s.sleepTargetHunger = 0;
                  s.sleepTargetClean = 0;
                  s.sleepAppliedEnergy = 0;
                  s.sleepAppliedHappy = 0;
                  s.sleepAppliedHunger = 0;
                  s.sleepAppliedClean = 0;
                  s.behavior = 'STRETCHING';
                  s.stretchTimer = 1.4;
                  s.idleDecisionTimer = 2.0;
                  soundEngine.playMeow(1.04);
                  soundEngine.playChime();
                  const cPos = roomToScreen(s.nx, s.ny - 0.08, rt);
                  spawnParticle('text', cPos.x, cPos.y - 36, {
                    label:
                      completedMode === 'auto_sleep'
                        ? `Auto-Sleep selesai! Energi pulih +${doneEnergyGain}`
                        : completedMode === 'power_nap'
                        ? `Power Nap selesai! +${doneEnergyGain} Energi · +${doneHappyGain} Bahagia`
                        : `Tidur Penuh selesai! +${doneEnergyGain} Energi · +${doneHappyGain} Bahagia`,
                    color: '#BFDBFE',
                    size: 13.5,
                    vy: -28,
                    maxLife: 1.8,
                  });
                } else if (s.sleepMode === 'none' && s.energy >= 100) {
                  s.energy = 100;
                  s.behavior = 'STRETCHING';
                  s.stretchTimer = 1.4;
                  s.idleDecisionTimer = 2.0;
                  soundEngine.playMeow(1.02);
                }
              } else {
                // Mode siklus normal Pagi–Siang–Malam + Cuaca Hujan sesuai fase usia
                const isBallPlay = s.behavior === 'PLAYING' && s.toy.active;
                const hungryEnergyMult = s.hunger <= 0 ? 1.7 : s.hunger < 20 ? 1.35 : 1.0;
                const isColdIdle =
                  s.behavior === 'IDLE' ||
                  s.behavior === 'GROOMING' ||
                  s.behavior === 'PURRING' ||
                  s.behavior === 'STRETCHING' ||
                  s.behavior === 'ROLLING';
                const coldHungerMult = isColdIdle ? weatherMult.idleOrSleepHunger : 1.0;

                s.hunger = clamp(
                  s.hunger - simDt * rates.hungerPerSec * phaseMult.hunger * coldHungerMult * stressMult,
                  0,
                  100
                );
                s.cleanliness = clamp(
                  s.cleanliness - simDt * rates.cleanlinessPerSec * phaseMult.cleanliness,
                  0,
                  100
                );

                if (isBallPlay && s.playSession.active) {
                  const happyRem = Math.max(
                    0,
                    s.playSession.targetHappiness - s.playSession.appliedHappiness
                  );
                  const energyRem = Math.max(
                    0,
                    s.playSession.targetEnergyCost - s.playSession.appliedEnergyCost
                  );
                  const hungerRem = Math.max(
                    0,
                    s.playSession.targetHungerCost - s.playSession.appliedHungerCost
                  );
                  const cleanRem = Math.max(
                    0,
                    s.playSession.targetCleanCost - s.playSession.appliedCleanCost
                  );

                  const hStep = Math.min(
                    happyRem,
                    (s.playSession.targetHappiness / PLAY_SESSION_SECONDS) * dt
                  );
                  const eStep = Math.min(
                    energyRem,
                    (s.playSession.targetEnergyCost / PLAY_SESSION_SECONDS) * dt
                  );
                  const hunStep = Math.min(
                    hungerRem,
                    (s.playSession.targetHungerCost / PLAY_SESSION_SECONDS) * dt
                  );
                  const clnStep = Math.min(
                    cleanRem,
                    (s.playSession.targetCleanCost / PLAY_SESSION_SECONDS) * dt
                  );

                  s.happiness = clamp(s.happiness + hStep, 0, 100);
                  s.playSession.appliedHappiness += hStep;
                  s.energy = clamp(s.energy - eStep, 0, 100);
                  s.playSession.appliedEnergyCost += eStep;
                  s.hunger = clamp(s.hunger - hunStep, 0, 100);
                  s.playSession.appliedHungerCost += hunStep;
                  s.cleanliness = clamp(s.cleanliness - clnStep, 0, 100);
                  s.playSession.appliedCleanCost += clnStep;
                } else {
                  s.energy = clamp(
                    s.energy -
                      simDt *
                        rates.energyPerSec *
                        phaseMult.energy *
                        weatherMult.energy *
                        pMod.energyDrain *
                        hungryEnergyMult *
                        stressMult,
                    0,
                    100
                  );
                  // Bahagia: saat hujan di dalam rumah turun 0,9x, namun jika Bersih/Kenyang < 40 mood turun lebih cepat
                  const badStatsDuringRain = s.hunger < 40 || s.cleanliness < 40;
                  const rainHappyFactor = badStatsDuringRain
                    ? weatherMult.indoorHappyBadStats
                    : weatherMult.indoorHappyNormal;
                  const baseHappyRate = rates.happinessPerSec * phaseMult.happiness * rainHappyFactor;
                  const happyPenalty =
                    ((s.hunger < 20
                      ? baseHappyRate * 0.75
                      : s.hunger < 40
                      ? baseHappyRate * 0.35
                      : 0) +
                      (s.cleanliness < 20 ? 0.045 : s.cleanliness < 40 ? 0.022 : 0) +
                      (s.energy <= 20 ? 0.018 : 0)) *
                    rainHappyFactor;
                  s.happiness = clamp(
                    s.happiness - simDt * (baseHappyRate + happyPenalty),
                    0,
                    100
                  );
                }

                // Hentikan sesi bermain hanya jika sakit atau kondisi fisik habis total
                if (s.toy.active && (s.isSick || s.energy <= 0.5 || s.hunger <= 2)) {
                  s.toy.active = false;
                  s.playSession.active = false;
                  if (s.behavior === 'PLAYING') s.behavior = 'IDLE';
                  onToySessionEndRef.current?.();
                }

                // Notifikasi transisi level ngantuk (<=50 Malam, <=45 Hujan, <=40 Cerah Pagi/Siang)
                const nextDrowsyTier = getDrowsyStage(s.energy, dayPhase, s.weather);
                if (nextDrowsyTier !== s.lastDrowsyNoticeTier) {
                  if (nextDrowsyTier === 'drowsy_light' && s.lastDrowsyNoticeTier === 'fresh') {
                    const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                    spawnParticle('text', catPos.x, catPos.y - 34, {
                      label:
                        dayPhase === 'malam'
                          ? 'Mulai ngantuk (≤50 Energi · Malam) · Waktunya tidur!'
                          : s.weather === 'hujan'
                          ? 'Mulai ngantuk (≤45 Energi · Hujan) · Syahdu untuk tidur!'
                          : 'Mulai ngantuk (21–40 Energi) · Istirahatkan yuk!',
                      color: '#FDE68A',
                      size: 13,
                      vy: -24,
                      maxLife: 1.7,
                    });
                  } else if (
                    nextDrowsyTier === 'drowsy_heavy' &&
                    (s.lastDrowsyNoticeTier === 'fresh' || s.lastDrowsyNoticeTier === 'drowsy_light')
                  ) {
                    const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                    spawnParticle('text', catPos.x, catPos.y - 34, {
                      label: 'Sangat ngantuk (1–20 Energi)! Segera tidurkan',
                      color: '#FCA5A5',
                      size: 13.5,
                      vy: -24,
                      maxLife: 1.8,
                    });
                  }
                  s.lastDrowsyNoticeTier = nextDrowsyTier;
                }

                // Fase Kelelahan Total (Energi == 0): otomatis masuk [AUTO-SLEEP] 4 menit
                if (s.energy <= 0 && s.autoSleepRetryTimer <= 0) {
                  if (s.isBathing || s.walkingToBath) {
                    completeBathSession(false);
                  }
                  const autoEnergyTarget =
                    Math.round(
                      AUTO_SLEEP_CONFIG.energyDelta *
                        phaseMult.sleepEnergyMult *
                        weatherMult.sleepEnergyMult *
                        10
                    ) / 10;
                  s.energy = 0;
                  s.toy.active = false;
                  s.playSession.active = false;
                  s.idleZoomies = false;
                  onToySessionEndRef.current?.();
                  onBatheCompleteRef.current?.();
                  s.sleepMode = 'auto_sleep';
                  s.sleepDurationSec = AUTO_SLEEP_CONFIG.durationSec;
                  s.sleepRemainingSec = AUTO_SLEEP_CONFIG.durationSec;
                  s.sleepTargetEnergy = autoEnergyTarget;
                  s.sleepTargetHappy = AUTO_SLEEP_CONFIG.happinessDelta;
                  s.sleepTargetHunger = AUTO_SLEEP_CONFIG.hungerDelta;
                  s.sleepTargetClean = AUTO_SLEEP_CONFIG.cleanlinessDelta;
                  s.sleepAppliedEnergy = 0;
                  s.sleepAppliedHappy = 0;
                  s.sleepAppliedHunger = 0;
                  s.sleepAppliedClean = 0;
                  s.behavior = 'SLEEPING';
                  s.facing = 1;
                  soundEngine.playSleep();
                  const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                  spawnParticle('text', catPos.x, catPos.y - 34, {
                    label: `Kelelahan Total! Masuk [AUTO-SLEEP] 4 mnt (+${Math.round(autoEnergyTarget)} Energi)`,
                    color: '#93C5FD',
                    size: 13.5,
                    vy: -28,
                    maxLife: 1.8,
                  });
                }
              }

              // Kirim pengingat notifikasi saat kenyang menyentuh di bawah 40%
              if (s.hunger < 40) {
                sendLowHungerNotification();
              }

              // Cute periodic meow when idle / wandering calmly
              if (
                !s.isSick &&
                !s.toy.active &&
                s.hunger >= 40 &&
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

              // Kenyang < 40: mulai memanggil/rewel minta makan
              if (s.hunger < 40 && s.behavior !== 'EATING' && s.behavior !== 'SLEEPING') {
                s.hungryMeowTimer -= dt;
                if (s.hungryMeowTimer <= 0) {
                  s.hungryMeowTimer = s.hunger < 20 ? 7.0 : 10.5;
                  soundEngine.playMeow(s.hunger < 20 ? 0.82 : 0.92);
                }
              }

              // Menyentuh 0 terlalu lama membuat kondisi memburuk
              if (s.hunger <= 0) {
                s.starveZeroTimer += simDt;
              } else {
                s.starveZeroTimer = 0;
              }

              // Dampak ke Kesehatan & Pemulihan Obat (1% -> 100% dalam 12 jam waktu game; efek sakit hilang di 90%)
              if (s.isRecovering) {
                const prevHealth = s.health;
                s.health = clamp(s.health + simDt * HEALTH_RECOVERY_PER_REAL_SEC, 0, 100);
                s.happiness = clamp(s.happiness + simDt * 0.25, 0, 100);

                if (prevHealth < SICK_SYMPTOM_CLEAR_HEALTH && s.health >= SICK_SYMPTOM_CLEAR_HEALTH) {
                  s.isSick = false;
                  s.sickReason = null;
                  soundEngine.playChime();
                  const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                  spawnParticle('text', catPos.x, catPos.y - 36, {
                    label: 'Kesehatan 90%! Efek sakit hilang!',
                    color: '#6EE7B7',
                    size: 14,
                    vy: -26,
                    maxLife: 1.75,
                  });
                }

                if (s.health >= 100) {
                  s.health = 100;
                  s.isRecovering = false;
                  s.isSick = false;
                  s.sickReason = null;
                  soundEngine.playMeow(1.08);
                  const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                  spawnParticle('text', catPos.x, catPos.y - 36, {
                    label: `${s.name} Pulih Total 100%!`,
                    color: '#34D399',
                    size: 14.5,
                    vy: -28,
                    maxLife: 1.85,
                  });
                }

                s.healParticleTimer -= dt;
                if (s.healParticleTimer <= 0) {
                  s.healParticleTimer = 0.85;
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
                let healthDrain = s.isSick ? UNTREATED_SICK_DRAIN_PER_REAL_SEC : 0;
                if (s.cleanliness < 15) {
                  healthDrain += 0.16;
                }
                if (s.hunger <= 0 && s.starveZeroTimer > 30) {
                  healthDrain += 0.24;
                  s.happiness = clamp(s.happiness - simDt * 0.12, 0, 100);
                  if (s.starveZeroTimer > 75 && !s.isSick) {
                    s.health = Math.min(s.health, SICK_START_HEALTH);
                    s.isSick = true;
                    s.sickReason = 'health';
                    soundEngine.playMeow(0.76);
                  }
                } else if (s.hunger < 20) {
                  healthDrain += 0.05;
                }
                if (healthDrain > 0) {
                  s.health = clamp(s.health - simDt * healthDrain, 0, 100);
                }

                // Jika kesehatan turun hingga <= 70%, kucing masuk status Sakit
                if (!s.isSick && s.health <= SICK_START_HEALTH) {
                  s.isSick = true;
                  s.sickReason = s.sickReason ?? 'health';
                  soundEngine.playMeow(0.76);
                  const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                  spawnParticle('text', catPos.x, catPos.y - 36, {
                    label: `Kesehatan ${Math.round(s.health)}%! ${s.name} jatuh sakit!`,
                    color: '#FCA5A5',
                    size: 14,
                    vy: -26,
                    maxLife: 1.7,
                  });
                }
              }

              // Regenerasi Kesehatan alami: hanya jika tidak sedang sakit/pemulihan dan seluruh stat > 75
              if (
                !s.isSick &&
                !s.isRecovering &&
                s.hunger > 75 &&
                s.cleanliness > 75 &&
                s.energy > 75 &&
                s.happiness > 75 &&
                s.health < 100
              ) {
                s.health = clamp(s.health + simDt * 0.5, 0, 100);
              }

              // Pelacakan riwayat kebersihan rendah (< 25) & pemicu sakit
              if (s.cleanliness < 25) {
                if (!s.wasUnder25Clean) {
                  s.wasUnder25Clean = true;
                  s.lowCleanlinessStrikes += 1;
                }
                s.dirtyStayTimer += simDt;
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
                  s.cleanHealthyTimer += simDt;
                  if (s.cleanHealthyTimer >= 45 && s.lowCleanlinessStrikes > 0) {
                    s.cleanHealthyTimer = 0;
                    s.lowCleanlinessStrikes -= 1;
                  }
                }
              }

              // Kucing langsung sakit ketika kebersihan menjadi 0
              if (s.cleanliness <= 0 && !s.isRecovering) {
                s.cleanliness = 0;
                if (!s.isSick) {
                  s.health = Math.min(s.health, SICK_START_HEALTH);
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
                !s.isRecovering
              ) {
                s.chronicSickCheckTimer -= dt;
                if (s.chronicSickCheckTimer <= 0) {
                  s.chronicSickCheckTimer = 4.0;
                  const sickChance = Math.min(
                    0.45,
                    0.14 + (s.lowCleanlinessStrikes - CHRONIC_DIRTY_STRIKES) * 0.08
                  );
                  if (Math.random() < sickChance) {
                    s.health = Math.min(s.health, SICK_START_HEALTH);
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

              // Selama masa pemulihan, efek sakit bertahan hingga kesehatan >= 90%
              if (s.isRecovering) {
                s.isSick = s.health < SICK_SYMPTOM_CLEAR_HEALTH;
              }
              if (!s.isSick) {
                s.sickReason = null;
              } else if (!s.sickReason) {
                s.sickReason = 'health';
              }

              if (s.health <= 0 && !gameOverFired) {
                s.deathReason = 'sickness';
                gameOverFired = true;
                clearLowHungerNotificationSchedule();
                onGameOver(buildSnapshot());
              }

              // Ambient mood-based particles around the cat (efek sakit tetap tampil hingga 90%)
              if (s.behavior !== 'SLEEPING' && (s.isSick || !s.isRecovering)) {
                s.moodParticleTimer -= dt;
                if (s.moodParticleTimer <= 0) {
                  const pScale = Math.max(0.55, rt.scale * 0.85);
                  const catCenter = roomToScreen(s.nx, s.ny - 0.06, rt);
                  const ox = (Math.random() - 0.5) * 68 * pScale;
                  const oy = (Math.random() - 0.5) * 28 * pScale;

                  const ambientDrowsy = getDrowsyStage(
                    s.energy,
                    getDayPhaseFromHour(s.gameHour),
                    s.weather
                  );

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
                  } else if (s.cleanliness < 40) {
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
                  } else if (ambientDrowsy === 'drowsy_light' || ambientDrowsy === 'drowsy_heavy') {
                    const heavy = ambientDrowsy === 'drowsy_heavy';
                    s.moodParticleTimer = heavy ? 1.0 : 1.75;
                    const useZ = Math.random() < (heavy ? 0.38 : 0.22);
                    spawnParticle(
                      useZ ? 'zzz' : 'sleep_cloud',
                      catCenter.x + ox * 0.8,
                      catCenter.y - 16 * pScale + oy * 0.4,
                      {
                        color: 'rgba(224, 242, 254, 0.88)',
                        size: (useZ ? (heavy ? 11 : 9) : heavy ? 9.5 : 7.5) * pScale,
                        vx: 6 * pScale,
                        vy: -16 * pScale,
                        maxLife: heavy ? 1.5 : 1.2,
                        swayAmp: 5 * pScale,
                        swayFreq: 2.1,
                        phase: Math.random() * Math.PI * 2,
                      }
                    );
                  } else if (s.happiness < 40) {
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
                  } else if (s.hunger < 40 && s.behavior !== 'EATING') {
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
                if (s.playSession.active) {
                  const remH = Math.max(
                    0,
                    s.playSession.targetHappiness - s.playSession.appliedHappiness
                  );
                  const remE = Math.max(
                    0,
                    s.playSession.targetEnergyCost - s.playSession.appliedEnergyCost
                  );
                  const remHun = Math.max(
                    0,
                    s.playSession.targetHungerCost - s.playSession.appliedHungerCost
                  );
                  const remCln = Math.max(
                    0,
                    s.playSession.targetCleanCost - s.playSession.appliedCleanCost
                  );
                  s.happiness = clamp(s.happiness + remH, 0, 100);
                  s.energy = clamp(s.energy - remE, 0, 100);
                  s.hunger = clamp(s.hunger - remHun, 0, 100);
                  s.cleanliness = clamp(s.cleanliness - remCln, 0, 100);
                  const catPos = roomToScreen(s.nx, s.ny - 0.06, rt);
                  spawnParticle('text', catPos.x, catPos.y - 34, {
                    label: `Main Selesai: +${s.playSession.targetHappiness} Bahagia · -${Math.round(
                      s.playSession.targetEnergyCost
                    )} Energi · -${s.playSession.targetHungerCost} Kenyang`,
                    color: '#FBCFE8',
                    size: 13,
                    vy: -28,
                    maxLife: 1.55,
                  });
                  s.playSession.active = false;
                }
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
            if (s.isBathing) {
              s.nx = s.tubNx;
              s.ny = s.tubNy;
              s.bathTimer -= dt;
              s.bathParticleTimer -= dt;
              const elapsedFrac =
                1 - Math.max(0, s.bathTimer) / Math.max(0.01, s.bathDuration);
              if (!s.bathMidSoundPlayed && elapsedFrac >= 0.45) {
                s.bathMidSoundPlayed = true;
                soundEngine.playBrush();
              }
              if (s.bathParticleTimer <= 0) {
                s.bathParticleTimer = 0.28;
                const tubPos = roomToScreen(s.tubNx, s.tubNy - 0.05, rt);
                spawnParticle(
                  Math.random() < 0.28 ? 'sparkle' : 'bubble',
                  tubPos.x + (Math.random() - 0.5) * 64,
                  tubPos.y - 16 + (Math.random() - 0.5) * 26,
                  {
                    color: s.activeBathItemId === 'spa_bath' ? '#F9A8D4' : '#BAE6FD',
                    size: 4.5 + Math.random() * 4.5,
                    vx: (Math.random() - 0.5) * 32,
                    vy: -28 - Math.random() * 20,
                    maxLife: 0.95,
                  }
                );
              }
              if (s.bathTimer <= 0) {
                completeBathSession(true);
              }
            } else if (s.behavior === 'PURRING') {
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
                flushPendingBowlMeal();
                s.behavior = 'GROOMING';
                s.groomTimer = 2.0;
                if (s.hunger >= 40) {
                  const eatRates = getStageDecayRatesPerSec(
                    s.lifeStage,
                    s.stageElapsedSec,
                    s.adultBranch,
                    hungerSpeedRef.current
                  );
                  resetLowHungerNotificationAfterFeed(s.hunger, eatRates.hungerPerSec);
                }
                const isFreeMeal = s.bowlTreatType === 'snack' || s.bowlTreatType === 'kibble';
                const now = Date.now();
                if (!isFreeMeal || now - s.lastFreeFeedTime >= FREE_COIN_REWARD_COOLDOWN_MS) {
                  if (isFreeMeal) s.lastFreeFeedTime = now;
                  addXpAndCoins(8, 2);
                } else {
                  addXpAndCoins(4, 0);
                }
              } else {
                s.eatTickTimer -= dt;
                const prevBowl = s.bowlAmount;
                const stepBowl = Math.min(s.bowlAmount, dt * 0.34);
                s.bowlAmount = Math.max(0, s.bowlAmount - stepBowl);
                const frac = prevBowl > 0 ? stepBowl / prevBowl : 1;

                const hGain = s.mealHungerRemaining * frac;
                s.mealHungerRemaining = Math.max(0, s.mealHungerRemaining - hGain);
                s.hunger = clamp(s.hunger + hGain, 0, 100);

                const hapGain = s.mealHappyRemaining * frac;
                s.mealHappyRemaining = Math.max(0, s.mealHappyRemaining - hapGain);
                s.happiness = clamp(s.happiness + hapGain, 0, 100);

                const enGain = s.mealEnergyRemaining * frac;
                s.mealEnergyRemaining = Math.max(0, s.mealEnergyRemaining - enGain);
                s.energy = clamp(s.energy + enGain, 0, 100);

                if (s.eatTickTimer <= 0) {
                  s.eatTickTimer = 0.42;
                  const bPos = roomToScreen(BOWL_POS.nx, BOWL_POS.ny - 0.02, rt);
                  spawnParticle('crumb', bPos.x + (Math.random() - 0.5) * 14, bPos.y, {
                    color:
                      s.bowlTreatType === 'salmon' || s.bowlTreatType === 'special_food'
                        ? '#F2795A'
                        : s.bowlTreatType === 'milk'
                        ? '#FFFFFF'
                        : s.bowlTreatType === 'snack'
                        ? '#F4C27F'
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
                s.energy > 2 &&
                s.hunger > 2 &&
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
                s.idleDecisionTimer > -50 &&
                !s.walkingToBath &&
                !s.isBathing
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

                // Sakit atau energi <= 20 -> tampak lemas & berjalan lebih lambat
                const sickSlowFactor = s.isSick
                  ? 0.42
                  : s.energy <= 20
                  ? 0.52
                  : s.hunger <= 15
                  ? 0.72
                  : 1;
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

                      if (s.playSession.active) {
                        const happyRem = Math.max(
                          0,
                          s.playSession.targetHappiness - s.playSession.appliedHappiness
                        );
                        const burstH = Math.min(
                          happyRem,
                          Math.max(2, Math.round(s.playSession.targetHappiness * 0.2))
                        );
                        if (burstH > 0) {
                          s.happiness = clamp(s.happiness + burstH, 0, 100);
                          s.playSession.appliedHappiness += burstH;
                        }
                      } else if (Math.round(s.happiness) < 100) {
                        s.happiness = clamp(
                          s.happiness + toyOpt.catchHappiness * PERSONALITY_MODS[s.personality].ballHappy,
                          0,
                          100
                        );
                      }
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
                  } else if (s.walkingToBath) {
                    enterBathtub();
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
          drowsyStage: getDrowsyStage(s.energy, getDayPhaseFromHour(s.gameHour), s.weather),
          hunger: s.hunger,
          happiness: s.happiness,
          isHungry: s.hunger < 40,
          isSick: s.isSick,
          isRecovering: s.isRecovering,
          lifeStage: s.lifeStage,
          adultBranch: s.adultBranch,
          time: s.time,
          equippedHat: s.equippedHat,
          equippedGlasses: s.equippedGlasses,
          equippedScarf: s.equippedScarf,
        };

        const bathProgress = s.isBathing
          ? clamp(1 - s.bathTimer / Math.max(0.01, s.bathDuration), 0, 0.999)
          : 0;
        const bathFrameCol =
          bathProgress < 0.14
            ? 0
            : bathProgress < 0.34
            ? 1
            : bathProgress < 0.5
            ? 2
            : bathProgress < 0.65
            ? 1
            : bathProgress < 0.8
            ? 2
            : 3;

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
          {
            y: s.tubNy - 0.015,
            draw: () =>
              drawCatBathtub(
                ctx,
                s.activeBathtub,
                s.tubNx,
                s.tubNy,
                rt,
                tubImgsRef.current,
                s.isDraggingTub,
                s.isBathing
                  ? {
                      active: true,
                      breed: s.breed,
                      frameCol: bathFrameCol,
                      bathSheets: bathSpriteSheetsRef.current,
                    }
                  : undefined
              ),
          },
          { y: bowlState.ny, draw: () => drawFoodBowl(ctx, bowlState, rt) },
        ];
        if (toyState.active) {
          roomObjects.push({ y: toyState.ny, draw: () => drawYarnToy(ctx, toyState, rt) });
        }
        roomObjects.sort((a, b) => a.y - b.y);
        roomObjects.forEach((d) => d.draw());

        // Karakter kucing selalu berada di atas semua objek ruangan (dan hilang saat masuk ke bak mandi)
        if (!s.isBathing) {
          drawCat(
            ctx,
            catState,
            rt,
            spriteSheetsRef.current,
            babySpriteSheetsRef.current,
            childSpriteSheetsRef.current
          );
        }

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

    const isPointOnTub = (px: number, py: number, rt: RoomTransform): boolean => {
      const s = simRef.current;
      const tubScr = roomToScreen(s.tubNx, s.tubNy - 0.03, rt);
      const tubRadius = 74 * Math.max(0.65, rt.scale);
      return Math.hypot(px - tubScr.x, py - tubScr.y) <= tubRadius;
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
      } else if (s.isDraggingBed || s.isDraggingTub) {
        canvas.style.cursor = 'grabbing';
      } else if (
        isPointOnBed(px, py, s.lastRoomTransform) ||
        isPointOnTub(px, py, s.lastRoomTransform)
      ) {
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

      if (s.isBathing || s.walkingToBath) {
        if (mode === 'BRUSH' && (distToCat <= hitRadius || isPointOnTub(px, py, rt))) {
          if (moveDist > 2 && Math.random() < 0.3) {
            soundEngine.unlock();
            spawnParticle(
              'bubble',
              px + (Math.random() - 0.5) * 20,
              py + (Math.random() - 0.5) * 16,
              {
                size: 4 + Math.random() * 3.5,
                vx: (Math.random() - 0.5) * 26,
                vy: -28 - Math.random() * 18,
                maxLife: 0.7,
              }
            );
          }
          return;
        }
        if (isClick && s.brushHintCooldown <= 0) {
          s.brushHintCooldown = 1.0;
          const tubScr = roomToScreen(s.tubNx, s.tubNy - 0.05, rt);
          spawnParticle('text', tubScr.x, tubScr.y - 34, {
            label: 'Sedang mandi di bak!',
            color: '#BAE6FD',
            size: 13,
            vy: -24,
            maxLife: 1.05,
          });
        }
        return;
      }

      if (mode === 'TOY' && isClick) {
        const roomPt = screenToRoom(px, py, rt);
        tossToyInternal(roomPt.nx, roomPt.ny);
        return;
      }

      if (distToCat <= hitRadius) {
        if (mode === 'BRUSH') {
          if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
            if (isClick || s.brushHintCooldown <= 0) {
              s.brushHintCooldown = 1.2;
              soundEngine.playBounce();
              spawnParticle('text', catScr.x, catScr.y - 34, {
                label: 'Mandi & sikat dikunci saat kucing tidur!',
                color: '#FCA5A5',
                size: 13.5,
                vy: -26,
                maxLife: 1.35,
              });
              onBatheCompleteRef.current?.();
            }
            return;
          }

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
          if (s.behavior === 'SLEEPING' || s.sleepMode !== 'none') {
            if (isClick && s.petActionCooldown <= 0) {
              s.petActionCooldown = 1.2;
              soundEngine.playBounce();
              spawnParticle('text', catScr.x, catScr.y - 34, {
                label: 'Zzz... Sedang tidur',
                color: '#BFDBFE',
                size: 13.5,
                vy: -24,
                maxLife: 1.2,
              });
            }
            return;
          }

          if (isClick) {
            if (s.petActionCooldown <= 0) {
              s.petActionCooldown = 1.6;
              petCatInternal('short');
            } else {
              soundEngine.unlock();
              soundEngine.playPurr();
              s.behavior = 'PURRING';
              s.purrDecayTimer = 1.0;
              spawnParticle('heart', px + (Math.random() - 0.5) * 24, py - 14, {
                color: '#EC6A76',
                size: 9 + Math.random() * 4,
                vy: -42 - Math.random() * 18,
                maxLife: 0.95,
              });
            }
          } else if (moveDist > 2) {
            soundEngine.unlock();
            s.petRubAccum += Math.min(moveDist, 28);
            s.behavior = 'PURRING';
            s.purrDecayTimer = 1.1;
            if (Math.random() < 0.28) {
              soundEngine.playPurr();
              spawnParticle('heart', px + (Math.random() - 0.5) * 24, py - 14, {
                color: '#EC6A76',
                size: 8.5 + Math.random() * 3,
                vy: -38 - Math.random() * 16,
                maxLife: 0.85,
              });
            }
            if (s.petRubAccum >= 140 && s.petActionCooldown <= 0) {
              s.petRubAccum = 0;
              s.petActionCooldown = 1.8;
              petCatInternal('full');
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
          simRef.current.petRubAccum = 0;
          simRef.current.bedDragCandidate = false;
          simRef.current.isDraggingBed = false;
          simRef.current.tubDragCandidate = false;
          simRef.current.isDraggingTub = false;
        }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          const s = simRef.current;
          s.pointerDown = true;
          s.pointerX = px;
          s.pointerY = py;

          if (gameStateRef.current === 'PLAYING' && toolModeRef.current === 'PET') {
            const rt = s.lastRoomTransform;
            const onBed = isPointOnBed(px, py, rt);
            const onTub = isPointOnTub(px, py, rt);
            if (onBed || onTub) {
              const bedScr = roomToScreen(s.bedNx, s.bedNy - 0.03, rt);
              const tubScr = roomToScreen(s.tubNx, s.tubNy - 0.03, rt);
              const pickTub =
                onTub &&
                (!onBed ||
                  Math.hypot(px - tubScr.x, py - tubScr.y) <=
                    Math.hypot(px - bedScr.x, py - bedScr.y));

              const roomPt = screenToRoom(px, py, rt);
              const catScr = roomToScreen(s.nx, s.ny - 0.045, rt);
              const hitRadius = 72 * Math.max(0.7, rt.scale);
              const distToCat = Math.hypot(px - catScr.x, py - catScr.y);

              if (pickTub) {
                s.tubDragCandidate = true;
                s.tubDragStartX = px;
                s.tubDragStartY = py;
                s.tubDragOffsetNx = s.tubNx - roomPt.nx;
                s.tubDragOffsetNy = s.tubNy - roomPt.ny;
                if (distToCat > hitRadius || s.isBathing) {
                  s.isDraggingTub = true;
                  soundEngine.unlock();
                }
              } else {
                s.bedDragCandidate = true;
                s.bedDragStartX = px;
                s.bedDragStartY = py;
                s.bedDragOffsetNx = s.bedNx - roomPt.nx;
                s.bedDragOffsetNy = s.bedNy - roomPt.ny;
                if (distToCat > hitRadius) {
                  s.isDraggingBed = true;
                  soundEngine.unlock();
                }
              }
              updateCanvasCursor(px, py);
              return;
            }
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

          if (s.tubDragCandidate && s.pointerDown) {
            if (!s.isDraggingTub && Math.hypot(px - s.tubDragStartX, py - s.tubDragStartY) > 6) {
              s.isDraggingTub = true;
              soundEngine.unlock();
            }
            if (s.isDraggingTub) {
              const roomPt = screenToRoom(px, py, s.lastRoomTransform);
              const nextTub = constrainTubPos(
                roomPt.nx + s.tubDragOffsetNx,
                roomPt.ny + s.tubDragOffsetNy,
                { nx: s.tubNx, ny: s.tubNy }
              );
              s.tubNx = nextTub.nx;
              s.tubNy = nextTub.ny;
              if (s.isBathing) {
                s.nx = s.tubNx;
                s.ny = s.tubNy;
              } else if (s.walkingToBath) {
                s.targetNx = s.tubNx;
                s.targetNy = s.tubNy;
              }
              updateCanvasCursor(px, py);
              return;
            }
          }

          if (s.bedDragCandidate && s.pointerDown) {
            if (!s.isDraggingBed && Math.hypot(px - s.bedDragStartX, py - s.bedDragStartY) > 6) {
              s.isDraggingBed = true;
              soundEngine.unlock();
            }
            if (s.isDraggingBed) {
              const roomPt = screenToRoom(px, py, s.lastRoomTransform);
              const nextBed = constrainBedPos(
                roomPt.nx + s.bedDragOffsetNx,
                roomPt.ny + s.bedDragOffsetNy,
                { nx: s.bedNx, ny: s.bedNy }
              );
              s.bedNx = nextBed.nx;
              s.bedNy = nextBed.ny;
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
          const wasBedCandidate = s.bedDragCandidate;
          const wasDraggingBed = s.isDraggingBed;
          const wasTubCandidate = s.tubDragCandidate;
          const wasDraggingTub = s.isDraggingTub;
          s.pointerDown = false;
          s.brushScrubAccum = 0;
          s.petRubAccum = 0;
          s.bedDragCandidate = false;
          s.isDraggingBed = false;
          s.tubDragCandidate = false;
          s.isDraggingTub = false;

          if (wasDraggingTub) {
            soundEngine.playBounce();
            const tubScr = roomToScreen(s.tubNx, s.tubNy, s.lastRoomTransform);
            for (let i = 0; i < 4; i++) {
              spawnParticle('sparkle', tubScr.x + (Math.random() - 0.5) * 60, tubScr.y, {
                color: '#7DD3FC',
                size: 7,
                vx: (Math.random() - 0.5) * 45,
                vy: -25 - Math.random() * 25,
                maxLife: 0.65,
              });
            }
            onAutoSaveNeededRef.current?.();
          } else if (wasDraggingBed) {
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
            onAutoSaveNeededRef.current?.();
          } else if (wasBedCandidate || wasTubCandidate) {
            handlePointerInteraction(e.clientX, e.clientY, true);
          }
          updateCanvasCursor(px, py);
        }}
      />
    );
  }
);

CatStageCanvas.displayName = 'CatStageCanvas';
