import { AdultEvolutionBranch, LifeStage } from '../types/game';

/**
 * ============================================================================
 * KONFIGURASI BALANCING SIKLUS HIDUP TAMAGOTCHI (MUDAH DI-BALANCE)
 * ============================================================================
 * Skala waktu default: 60 menit waktu nyata = 73 jam waktu di dalam game (3 hari)
 * -> TIME_SCALE = 73 (1 detik nyata = 73 detik game; 60m * 73 = 4.380 menit game = 73 jam)
 * -> Catatan: Baby (1j) + Child (24j) + Teen (48j) = tepat 73 jam!
 */
export const TAMAGOTCHI_BALANCE_CONFIG = {
  /** Skala waktu default: 60 menit waktu nyata = 73 jam waktu game */
  defaultTimeScale: 73,

  /** 1 Level (1 Hati) setara 25 poin pada bar 0..100 */
  pointsPerLevel: 25,

  /** Jam awal saat bayi baru lahir (08:00 pagi Hari ke-1) */
  birthClockMinutes: 8 * 60,

  /** Jumlah kotoran yang memicu status sakit jika tidak dibersihkan */
  maxPoopsBeforeSick: 3,

  /** Durasi lapar 0% (menit game) sebelum memicu sakit */
  zeroHungerSickThresholdMin: 120, // 2 jam waktu game

  /** Durasi sakit tanpa obat (menit game) sebelum kondisi kritis fatal */
  untreatedSickFatalMin: 180, // 3 jam waktu game

  /** Hari kemunculan & batas usia Senior */
  seniorStartDay: 12,
  seniorMaxNaturalDay: 18,
} as const;

export interface StageLifecycleParams {
  id: LifeStage;
  /** Durasi fase dalam menit waktu game (0 = ditentukan oleh hari/akhir hayat) */
  durationGameMin: number;
  /** Menit waktu game agar Lapar turun 1 level (25 poin) */
  hungerLevelIntervalMin: number;
  /** Menit waktu game agar Bahagia turun 1 level (25 poin) */
  happinessLevelIntervalMin: number;
  /** Interval minimum & maksimum buang air (poop) dalam menit waktu game */
  poopIntervalMin: [number, number];
  /** Laju penurunan Kebersihan & Energi relatif terhadap fase */
  cleanlinessDrainPerGameMin: number;
  energyDrainPerGameMin: number;
}

/**
 * Parameter Timeline Pertumbuhan & Kecepatan Penurunan Statistik
 * (Mode 1x / 24 Jam Nonstop Tanpa Tidur)
 */
export const STAGE_LIFECYCLE_PARAMS: Record<LifeStage, StageLifecycleParams> = {
  baby: {
    id: 'baby',
    durationGameMin: 60, // 60 menit (1 jam)
    hungerLevelIntervalMin: 15, // -1 level tiap 15 menit
    happinessLevelIntervalMin: 15, // -1 level tiap 15 menit
    poopIntervalMin: [15, 20], // tiap 15-20 menit
    cleanlinessDrainPerGameMin: 0.36,
    energyDrainPerGameMin: 0.42,
  },
  child: {
    id: 'child',
    durationGameMin: 24 * 60, // 24 jam (Hari ke-1)
    hungerLevelIntervalMin: 50, // -1 level tiap 50 menit
    happinessLevelIntervalMin: 50, // -1 level tiap 50 menit
    poopIntervalMin: [120, 120], // tiap 2 jam
    cleanlinessDrainPerGameMin: 0.12,
    energyDrainPerGameMin: 0.16,
  },
  teen: {
    id: 'teen',
    durationGameMin: 48 * 60, // 48 jam (Hari ke-2 s/d ke-3)
    hungerLevelIntervalMin: 60, // -1 level tiap 60 menit
    happinessLevelIntervalMin: 60, // -1 level tiap 60 menit
    poopIntervalMin: [180, 180], // tiap 3 jam
    cleanlinessDrainPerGameMin: 0.1,
    energyDrainPerGameMin: 0.14,
  },
  adult: {
    id: 'adult',
    durationGameMin: 8 * 24 * 60, // 8 hari (Hari ke-4 s/d ke-11)
    hungerLevelIntervalMin: 82, // 75-90 menit (disesuaikan cabang evolusi)
    happinessLevelIntervalMin: 82, // 75-90 menit (disesuaikan cabang evolusi)
    poopIntervalMin: [180, 240], // tiap 3-4 jam
    cleanlinessDrainPerGameMin: 0.08,
    energyDrainPerGameMin: 0.11,
  },
  senior: {
    id: 'senior',
    durationGameMin: 0, // Hari ke-12 s/d ke-18 hingga akhir hayat
    hungerLevelIntervalMin: 22, // drastis tiap 20-30 menit
    happinessLevelIntervalMin: 26, // drastis tiap 20-30 menit
    poopIntervalMin: [90, 90], // tiap 1,5 jam
    cleanlinessDrainPerGameMin: 0.18,
    energyDrainPerGameMin: 0.24,
  },
};

export interface PoopSpot {
  id: number;
  nx: number;
  ny: number;
}

/**
 * Mengembalikan interval penurunan Lapar & Bahagia (menit game per 1 level = 25 poin)
 */
export function getStatLevelIntervalsMin(
  stage: LifeStage,
  adultBranch: AdultEvolutionBranch
): { hungerMin: number; happinessMin: number } {
  const base = STAGE_LIFECYCLE_PARAMS[stage];
  if (stage === 'adult') {
    if (adultBranch === 'prima') {
      return { hungerMin: 90, happinessMin: 90 };
    }
    if (adultBranch === 'mandiri') {
      return { hungerMin: 82, happinessMin: 82 };
    }
    return { hungerMin: 75, happinessMin: 75 };
  }
  return {
    hungerMin: base.hungerLevelIntervalMin,
    happinessMin: base.happinessLevelIntervalMin,
  };
}

/**
 * Mengembalikan laju penurunan Lapar & Bahagia per detik WAKTU GAME
 */
export function getStatDecayPerGameSec(
  stage: LifeStage,
  adultBranch: AdultEvolutionBranch
): { hungerPerGameSec: number; happinessPerGameSec: number } {
  const { hungerMin, happinessMin } = getStatLevelIntervalsMin(stage, adultBranch);
  const pts = TAMAGOTCHI_BALANCE_CONFIG.pointsPerLevel;
  return {
    hungerPerGameSec: pts / (hungerMin * 60),
    happinessPerGameSec: pts / (happinessMin * 60),
  };
}

/**
 * Mengacak interval waktu buang air (menit game) sesuai fase hidup
 */
export function rollPoopIntervalGameMin(stage: LifeStage): number {
  const [minM, maxM] = STAGE_LIFECYCLE_PARAMS[stage].poopIntervalMin;
  if (minM >= maxM) return minM;
  return minM + Math.random() * (maxM - minM);
}

/**
 * Menghitung hari di dalam game berdasarkan total menit waktu game sejak lahir:
 * - 0..60m: Bayi (Hari 1)
 * - 60..1500m: Anak (24 jam / Hari ke-1)
 * - 1500..4380m: Remaja (48 jam / Hari ke-2 s/d ke-3)
 * - 4380..15900m: Dewasa (8 hari / Hari ke-4 s/d ke-11)
 * - >= 15900m: Tua / Senior (Hari ke-12 s/d ke-18)
 */
export function computeGameDayFromTotalMinutes(totalGameMinutes: number): number {
  if (totalGameMinutes < STAGE_LIFECYCLE_PARAMS.baby.durationGameMin) {
    return 1;
  }
  const minutesAfterBaby = totalGameMinutes - STAGE_LIFECYCLE_PARAMS.baby.durationGameMin;
  return 1 + Math.floor(minutesAfterBaby / (24 * 60));
}

/**
 * Mengubah total menit waktu game menjadi tampilan jam (HH:MM) & progress siang/malam (0..1)
 */
export function computeGameClock(totalGameMinutes: number): {
  day: number;
  hour: number;
  minute: number;
  clockText: string;
  timeOfDay: number;
} {
  const day = computeGameDayFromTotalMinutes(totalGameMinutes);
  const clockTotalMin =
    (TAMAGOTCHI_BALANCE_CONFIG.birthClockMinutes + Math.floor(totalGameMinutes)) % (24 * 60);
  const hour = Math.floor(clockTotalMin / 60);
  const minute = clockTotalMin % 60;
  const clockText = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const timeOfDay = clockTotalMin / (24 * 60);
  return { day, hour, minute, clockText, timeOfDay };
}

export interface OfflineLifecycleInput {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  health: number;
  isSick: boolean;
  lifeStage: LifeStage;
  stageElapsedSec: number; // disimpan dalam detik WAKTU GAME
  totalGameMinutes: number;
  careMistakes: number;
  adultBranch: AdultEvolutionBranch;
  poopCount: number;
  poopTimerMin: number;
  zeroHungerDurationMin: number;
  untreatedSickMin: number;
  timeScale: number;
  lastSavedTime?: number;
  now?: number;
}

export interface OfflineLifecycleResult {
  elapsedRealSeconds: number;
  elapsedGameMinutes: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  health: number;
  isSick: boolean;
  lifeStage: LifeStage;
  stageElapsedSec: number;
  totalGameMinutes: number;
  day: number;
  careMistakes: number;
  adultBranch: AdultEvolutionBranch;
  newPoopsAdded: number;
  poopTimerMin: number;
  zeroHungerDurationMin: number;
  untreatedSickMin: number;
  evolvedStages: LifeStage[];
  hungerLost: number;
  healthLost: number;
  diedOffline: boolean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Simulasi akurat saat game dibuka kembali berdasarkan LastSavedTimestamp & TimeScale
 */
export function simulateOfflineLifecycle(input: OfflineLifecycleInput): OfflineLifecycleResult {
  const now = input.now ?? Date.now();
  const elapsedRealSeconds =
    input.lastSavedTime && Number.isFinite(input.lastSavedTime)
      ? Math.max(0, (now - input.lastSavedTime) / 1000)
      : 0;

  const scale = input.timeScale > 0 ? input.timeScale : TAMAGOTCHI_BALANCE_CONFIG.defaultTimeScale;
  const elapsedGameMinutes = (elapsedRealSeconds * scale) / 60;

  let hunger = clamp(input.hunger, 0, 100);
  let happiness = clamp(input.happiness, 0, 100);
  let cleanliness = clamp(input.cleanliness, 0, 100);
  let energy = clamp(input.energy, 0, 100);
  let health = clamp(input.health, 0, 100);
  let isSick = input.isSick;
  let lifeStage = input.lifeStage;
  let stageElapsedSec = Math.max(0, input.stageElapsedSec);
  let totalGameMinutes = Math.max(0, input.totalGameMinutes);
  let careMistakes = Math.max(0, input.careMistakes);
  let adultBranch = input.adultBranch;
  let poopCount = Math.max(0, input.poopCount);
  let poopTimerMin = input.poopTimerMin > 0 ? input.poopTimerMin : rollPoopIntervalGameMin(lifeStage);
  let zeroHungerDurationMin = Math.max(0, input.zeroHungerDurationMin);
  let untreatedSickMin = Math.max(0, input.untreatedSickMin);

  const startHunger = hunger;
  const startHealth = health;
  const evolvedStages: LifeStage[] = [];
  let newPoopsAdded = 0;
  let diedOffline = false;

  if (elapsedGameMinutes < 0.25) {
    return {
      elapsedRealSeconds,
      elapsedGameMinutes,
      hunger,
      happiness,
      cleanliness,
      energy,
      health,
      isSick,
      lifeStage,
      stageElapsedSec,
      totalGameMinutes,
      day: computeGameDayFromTotalMinutes(totalGameMinutes),
      careMistakes,
      adultBranch,
      newPoopsAdded: 0,
      poopTimerMin,
      zeroHungerDurationMin,
      untreatedSickMin,
      evolvedStages,
      hungerLost: 0,
      healthLost: 0,
      diedOffline: false,
    };
  }

  // Simulasikan per langkah 5 menit game (maksimal 20 hari waktu game) agar ringan namun presisi
  const cappedGameMinutes = Math.min(elapsedGameMinutes, 20 * 24 * 60);
  const stepMin = 5;
  let remaining = cappedGameMinutes;

  while (remaining > 0) {
    const dtMin = Math.min(stepMin, remaining);
    remaining -= dtMin;
    const dtGameSec = dtMin * 60;

    totalGameMinutes += dtMin;
    stageElapsedSec += dtGameSec;
    const currentDay = computeGameDayFromTotalMinutes(totalGameMinutes);

    // 1. Penurunan Lapar & Bahagia sesuai fase
    const { hungerPerGameSec, happinessPerGameSec } = getStatDecayPerGameSec(
      lifeStage,
      adultBranch
    );
    const stressMult = happiness < 20 ? 1.5 : 1.0;
    hunger = clamp(hunger - hungerPerGameSec * dtGameSec * stressMult, 0, 100);
    const stageParams = STAGE_LIFECYCLE_PARAMS[lifeStage];
    happiness = clamp(happiness - happinessPerGameSec * dtGameSec, 0, 100);
    cleanliness = clamp(cleanliness - stageParams.cleanlinessDrainPerGameMin * dtMin, 0, 100);
    energy = clamp(energy - stageParams.energyDrainPerGameMin * dtMin, 0, 100);

    // 2. Buang Air (Poop)
    poopTimerMin -= dtMin;
    if (poopTimerMin <= 0) {
      poopTimerMin = rollPoopIntervalGameMin(lifeStage);
      if (poopCount < 6) {
        poopCount += 1;
        newPoopsAdded += 1;
      }
      cleanliness = clamp(cleanliness - 6, 0, 100);
    }

    // 3. Care mistakes saat offline jika fase Child/Teen dibiarkan kritis
    if ((lifeStage === 'child' || lifeStage === 'teen') && (hunger <= 0 || happiness <= 0)) {
      if (Math.floor(totalGameMinutes / 60) !== Math.floor((totalGameMinutes - dtMin) / 60)) {
        careMistakes += 1;
      }
    }

    // 4. Pemicu sakit
    if (hunger <= 0) {
      zeroHungerDurationMin += dtMin;
    } else {
      zeroHungerDurationMin = 0;
    }

    if (
      !isSick &&
      (cleanliness <= 0 ||
        poopCount >= TAMAGOTCHI_BALANCE_CONFIG.maxPoopsBeforeSick ||
        zeroHungerDurationMin >= TAMAGOTCHI_BALANCE_CONFIG.zeroHungerSickThresholdMin)
    ) {
      isSick = true;
      health = Math.min(health, 45);
    }

    // 5. Dampak ke kesehatan & kematian
    if (isSick) {
      untreatedSickMin += dtMin;
      health = clamp(health - dtMin * 0.45, 0, 100);
      if (untreatedSickMin >= TAMAGOTCHI_BALANCE_CONFIG.untreatedSickFatalMin) {
        health = 0;
      }
    } else {
      untreatedSickMin = 0;
      if (hunger <= 0) {
        health = clamp(health - dtMin * 0.25, 0, 100);
      }
      if (cleanliness < 15) {
        health = clamp(health - dtMin * 0.15, 0, 100);
      }
    }

    // Senior batas usia alami Hari ke-18
    if (
      lifeStage === 'senior' &&
      currentDay >= TAMAGOTCHI_BALANCE_CONFIG.seniorMaxNaturalDay
    ) {
      health = 0;
    }

    if (health <= 0) {
      diedOffline = true;
      break;
    }

    // 6. Cek Evolusi Fase
    if (
      lifeStage === 'baby' &&
      stageElapsedSec >= STAGE_LIFECYCLE_PARAMS.baby.durationGameMin * 60
    ) {
      lifeStage = 'child';
      stageElapsedSec = 0;
      evolvedStages.push('child');
    } else if (
      lifeStage === 'child' &&
      stageElapsedSec >= STAGE_LIFECYCLE_PARAMS.child.durationGameMin * 60
    ) {
      lifeStage = 'teen';
      stageElapsedSec = 0;
      evolvedStages.push('teen');
    } else if (
      lifeStage === 'teen' &&
      stageElapsedSec >= STAGE_LIFECYCLE_PARAMS.teen.durationGameMin * 60
    ) {
      adultBranch = careMistakes <= 2 ? 'prima' : careMistakes <= 5 ? 'mandiri' : 'sensitif';
      lifeStage = 'adult';
      stageElapsedSec = 0;
      evolvedStages.push('adult');
    } else if (
      lifeStage === 'adult' &&
      currentDay >= TAMAGOTCHI_BALANCE_CONFIG.seniorStartDay
    ) {
      lifeStage = 'senior';
      stageElapsedSec = 0;
      evolvedStages.push('senior');
    }
  }

  return {
    elapsedRealSeconds,
    elapsedGameMinutes,
    hunger,
    happiness,
    cleanliness,
    energy,
    health,
    isSick,
    lifeStage,
    stageElapsedSec,
    totalGameMinutes,
    day: computeGameDayFromTotalMinutes(totalGameMinutes),
    careMistakes,
    adultBranch,
    newPoopsAdded,
    poopTimerMin,
    zeroHungerDurationMin,
    untreatedSickMin,
    evolvedStages,
    hungerLost: Math.max(0, startHunger - hunger),
    healthLost: Math.max(0, startHealth - health),
    diedOffline,
  };
}
