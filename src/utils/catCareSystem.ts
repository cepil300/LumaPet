import {
  AdultEvolutionBranch,
  AUTO_SLEEP_CONFIG,
  DayPhase,
  DrowsyStage,
  HungerSpeed,
  LIFE_STAGES,
  LifeStage,
  SLEEP_OPTIONS,
  SleepMode,
  WeatherType,
} from '../types/game';

export const BABY_TIME_SCALE_HOURS = 73; // 60 menit nyata = 73 jam game (3 hari game)
export const GAME_HOURS_PER_REAL_SEC = 73 / 3600; // 1 jam game ~ 49,3 detik nyata (1 hari ~ 19,73 mnt nyata)
export const INITIAL_GAME_HOUR = 7.0; // Mulai pukul 07:00 (Pagi)
export const POINTS_PER_STAT_LEVEL = 20; // Skala 0-100: 1 level = 20 poin (5/5 level)

export const SICK_START_HEALTH = 70;
export const SICK_SYMPTOM_CLEAR_HEALTH = 90;
export const HEALTH_RECOVERY_GAME_HOURS = 12;
export const HEALTH_RECOVERY_PER_GAME_HOUR = (100 - 1) / HEALTH_RECOVERY_GAME_HOURS; // 1% -> 100% dalam 12 jam waktu game
export const HEALTH_RECOVERY_PER_REAL_SEC =
  HEALTH_RECOVERY_PER_GAME_HOUR * GAME_HOURS_PER_REAL_SEC;
export const UNTREATED_SICK_DRAIN_PER_REAL_SEC =
  (SICK_START_HEALTH / HEALTH_RECOVERY_GAME_HOURS) * GAME_HOURS_PER_REAL_SEC;

// Default baseline rate untuk fallback jadwal notifikasi
export const OFFLINE_HUNGER_DECAY_PER_SEC = 20 / (50 * 60);
export const OFFLINE_HEALTH_DECAY_PER_SEC = 100 / (24 * 3600);

export const LOW_HUNGER_NOTIFICATION_MESSAGE =
  'Meow! Tingkat kenyang kucingmu tinggal di bawah 40%. Segera beri makan sebelum dia sakit!';

export interface StageDecayRates {
  hungerPerSec: number;
  happinessPerSec: number;
  cleanlinessPerSec: number;
  energyPerSec: number;
}

export interface OfflineDecayInput {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  health: number;
  isSick?: boolean;
  isRecovering?: boolean;
  lifeStage: LifeStage;
  stageElapsedSec: number;
  careMistakes: number;
  adultBranch: AdultEvolutionBranch;
  hungerSpeed: HungerSpeed;
  sleepMode?: SleepMode;
  sleepRemainingSec?: number;
  sleepDurationSec?: number;
  sleepTargetEnergy?: number;
  sleepTargetHappy?: number;
  sleepTargetHunger?: number;
  sleepTargetClean?: number;
  sleepAppliedEnergy?: number;
  sleepAppliedHappy?: number;
  sleepAppliedHunger?: number;
  sleepAppliedClean?: number;
  sleepCooldownUntil?: number;
  gameHour?: number;
  weather?: WeatherType;
  lastSavedTime?: number;
  now?: number;
}

export interface OfflineDecayResult {
  elapsedSeconds: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  health: number;
  isSick: boolean;
  isRecovering: boolean;
  lifeStage: LifeStage;
  stageElapsedSec: number;
  adultBranch: AdultEvolutionBranch;
  day: number;
  gameHours: number;
  gameHour: number;
  dayPhase: DayPhase;
  sleepMode: SleepMode;
  sleepRemainingSec: number;
  sleepDurationSec: number;
  sleepTargetEnergy: number;
  sleepTargetHappy: number;
  sleepTargetHunger: number;
  sleepTargetClean: number;
  sleepAppliedEnergy: number;
  sleepAppliedHappy: number;
  sleepAppliedHunger: number;
  sleepAppliedClean: number;
  sleepCooldownUntil: number;
  passedAwayOfOldAge: boolean;
  hungerLost: number;
  healthLost: number;
  dippedBelow40: boolean;
  dippedBelow20: boolean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function getDayPhaseFromHour(gameHour: number): DayPhase {
  const h = ((gameHour % 24) + 24) % 24;
  if (h >= 6 && h < 12) return 'pagi';
  if (h >= 12 && h < 18) return 'siang';
  return 'malam';
}

export function isDuskHour(gameHour: number): boolean {
  const h = ((gameHour % 24) + 24) % 24;
  return h >= 16.5 && h < 18;
}

export function formatGameClock(gameHour: number): string {
  const hNorm = ((gameHour % 24) + 24) % 24;
  let hh = Math.floor(hNorm);
  let mm = Math.floor((hNorm - hh) * 60);
  if (mm >= 60) {
    mm = 0;
    hh = (hh + 1) % 24;
  }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export interface DayPhaseMultipliers {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  sleepEnergyMult: number;
  playHappyMult: number;
}

export function getDayPhaseMultipliers(dayPhase: DayPhase): DayPhaseMultipliers {
  switch (dayPhase) {
    case 'pagi':
      return {
        hunger: 1.0,
        happiness: 1.0,
        cleanliness: 1.0,
        energy: 1.0,
        sleepEnergyMult: 1.1, // Bonus pemulihan Energi +10% saat tidur pagi
        playHappyMult: 1.0,
      };
    case 'siang':
      return {
        hunger: 1.1, // Laju penurunan Kenyang & Energi 1,1x
        happiness: 1.0,
        cleanliness: 1.0,
        energy: 1.1,
        sleepEnergyMult: 1.0,
        playHappyMult: 1.1, // Bonus +10% Bahagia saat aksi Bermain
      };
    case 'malam':
      return {
        hunger: 0.85, // Penurunan Kenyang & Bahagia 0,85x
        happiness: 0.85,
        cleanliness: 1.0,
        energy: 1.25, // Penurunan Energi 1,25x (kantuk alami)
        sleepEnergyMult: 1.2, // Bonus pemulihan Energi +20% saat tidur malam
        playHappyMult: 1.0,
      };
  }
}

export interface WeatherMultipliers {
  energy: number;
  sleepEnergyMult: number;
  indoorHappyNormal: number;
  indoorHappyBadStats: number;
  idleOrSleepHunger: number;
  outdoorPlayHappyBonus: number;
  outdoorPlayCleanPenalty: number;
}

export function getWeatherMultipliers(weather: WeatherType): WeatherMultipliers {
  if (weather === 'hujan') {
    return {
      energy: 1.15, // Udara dingin/syahdu -> Energi turun 1,15x
      sleepEnergyMult: 1.1, // Pemulihan Energi saat tidur +10%
      indoorHappyNormal: 0.9, // Di dalam rumah nyaman -> Bahagia turun lebih lambat (0,9x)
      indoorHappyBadStats: 1.35, // Jika Bersih/Kenyang < 40 saat hujan -> mood lebih cepat turun
      idleOrSleepHunger: 1.1, // Tidur/berdiam lama saat udara dingin -> Kenyang sedikit lebih cepat
      outdoorPlayHappyBonus: 5, // Main outdoor saat hujan -> +5 Bahagia ekstra
      outdoorPlayCleanPenalty: 2, // Main outdoor saat hujan -> -2 Bersih tambahan
    };
  }
  return {
    energy: 1.0,
    sleepEnergyMult: 1.0,
    indoorHappyNormal: 1.0,
    indoorHappyBadStats: 1.0,
    idleOrSleepHunger: 1.0,
    outdoorPlayHappyBonus: 0,
    outdoorPlayCleanPenalty: 0,
  };
}

export function getDrowsyStage(
  energy: number,
  dayPhase: DayPhase = 'pagi',
  weather: WeatherType = 'cerah'
): DrowsyStage {
  if (energy <= 0) return 'exhausted';
  if (energy <= 20) return 'drowsy_heavy';
  const lightThreshold = Math.max(
    dayPhase === 'malam' ? 50 : 40,
    weather === 'hujan' ? 45 : 40
  );
  if (energy <= lightThreshold) return 'drowsy_light';
  return 'fresh';
}

export function getStatLevel(value: number): number {
  const clamped = clamp(value, 0, 100);
  if (clamped <= 0) return 0;
  return Math.min(5, Math.ceil(clamped / POINTS_PER_STAT_LEVEL));
}

export function getStageDecayRatesPerSec(
  stage: LifeStage,
  stageElapsedSec: number,
  adultBranch: AdultEvolutionBranch,
  hungerSpeed: HungerSpeed = 'normal'
): StageDecayRates {
  const speedMult = hungerSpeed === 'santai' ? 0.8 : 1.0;

  let hungerMin = 50;
  let happinessMin = 50;
  let cleanlinessMin = 80;
  let energyMin = 40;

  switch (stage) {
    case 'baby':
      // Bayi: 60 menit | Kenyang 15m, Bahagia 15m, Bersih 25m, Energi 18m
      hungerMin = 15;
      happinessMin = 15;
      cleanlinessMin = 25;
      energyMin = 18;
      break;
    case 'child':
      // Anak: 24 jam | Kenyang 50m, Bahagia 50m, Bersih 80m, Energi 60m
      hungerMin = 50;
      happinessMin = 50;
      cleanlinessMin = 80;
      energyMin = 60;
      break;
    case 'teen':
      // Remaja: 48 jam | Kenyang 60m, Bahagia 60m, Bersih 95m, Energi 75m
      hungerMin = 60;
      happinessMin = 60;
      cleanlinessMin = 95;
      energyMin = 75;
      break;
    case 'adult':
      // Dewasa: 8 hari | Kenyang/Bahagia 75-90m, Bersih 120-140m, Energi 90-110m
      if (adultBranch === 'prima') {
        hungerMin = 90;
        happinessMin = 90;
        cleanlinessMin = 140;
        energyMin = 110;
      } else if (adultBranch === 'sensitif') {
        hungerMin = 75;
        happinessMin = 75;
        cleanlinessMin = 120;
        energyMin = 90;
      } else {
        hungerMin = 82.5;
        happinessMin = 82.5;
        cleanlinessMin = 130;
        energyMin = 100;
      }
      break;
    case 'senior': {
      // Senior: Hari 12-18 | Kenyang/Bahagia 20-30m, Bersih 35-45m, Energi 25-35m
      const dur = Math.max(1, LIFE_STAGES.senior.durationSec);
      const ageProgress = clamp(stageElapsedSec / dur, 0, 1);
      const branchShift = adultBranch === 'prima' ? -0.15 : adultBranch === 'sensitif' ? 0.15 : 0;
      const factor = clamp(ageProgress + branchShift, 0, 1);
      hungerMin = 30 - 10 * factor;
      happinessMin = 30 - 10 * factor;
      cleanlinessMin = 45 - 10 * factor;
      energyMin = 35 - 10 * factor;
      break;
    }
  }

  return {
    hungerPerSec: (POINTS_PER_STAT_LEVEL / (hungerMin * 60)) * speedMult,
    happinessPerSec: (POINTS_PER_STAT_LEVEL / (happinessMin * 60)) * speedMult,
    cleanlinessPerSec: (POINTS_PER_STAT_LEVEL / (cleanlinessMin * 60)) * speedMult,
    energyPerSec: (POINTS_PER_STAT_LEVEL / (energyMin * 60)) * speedMult,
  };
}

export function computeCalendarDayAndHour(
  stage: LifeStage,
  stageElapsedSec: number
): { day: number; gameHours: number } {
  const sec = Math.max(0, stageElapsedSec);
  switch (stage) {
    case 'baby': {
      const babyDur = LIFE_STAGES.baby.durationSec;
      const gameHours = clamp((sec / babyDur) * BABY_TIME_SCALE_HOURS, 0, BABY_TIME_SCALE_HOURS);
      const day = Math.min(3, Math.floor(gameHours / 24));
      return { day, gameHours };
    }
    case 'child': {
      return { day: 1, gameHours: (sec / 3600) % 24 };
    }
    case 'teen': {
      const dayOffset = Math.min(1, Math.floor(sec / 86400));
      return { day: 2 + dayOffset, gameHours: (sec / 3600) % 24 };
    }
    case 'adult': {
      const dayOffset = Math.min(7, Math.floor(sec / 86400));
      return { day: 4 + dayOffset, gameHours: (sec / 3600) % 24 };
    }
    case 'senior': {
      const dayOffset = Math.min(6, Math.floor(sec / 86400));
      return { day: 12 + dayOffset, gameHours: (sec / 3600) % 24 };
    }
  }
}

export function calculateOfflineDecay(input: OfflineDecayInput): OfflineDecayResult {
  const now = input.now ?? Date.now();
  const startHunger = clamp(input.hunger, 0, 100);
  const startHappiness = clamp(input.happiness, 0, 100);
  const startClean = clamp(input.cleanliness, 0, 100);
  const startEnergy = clamp(input.energy, 0, 100);
  const startHealth = clamp(input.health, 0, 100);
  let isRecovering = Boolean(input.isRecovering) && startHealth < 100;
  let isSick =
    Boolean(input.isSick) ||
    startHealth <= SICK_START_HEALTH ||
    (isRecovering && startHealth < SICK_SYMPTOM_CLEAR_HEALTH);

  let stage: LifeStage = input.lifeStage;
  let stageElapsed = Math.max(0, input.stageElapsedSec);
  let branch: AdultEvolutionBranch = input.adultBranch;

  let sleepMode: SleepMode = input.sleepMode ?? 'none';
  let sleepRemainingSec = Math.max(0, input.sleepRemainingSec ?? 0);
  let sleepDurationSec = Math.max(0, input.sleepDurationSec ?? 0);
  let sleepTargetEnergy = Math.max(0, input.sleepTargetEnergy ?? 0);
  let sleepTargetHappy = Math.max(0, input.sleepTargetHappy ?? 0);
  let sleepTargetHunger = Math.min(0, input.sleepTargetHunger ?? 0);
  let sleepTargetClean = Math.min(0, input.sleepTargetClean ?? 0);
  let sleepAppliedEnergy = Math.max(0, input.sleepAppliedEnergy ?? 0);
  let sleepAppliedHappy = Math.max(0, input.sleepAppliedHappy ?? 0);
  let sleepAppliedHunger = Math.min(0, input.sleepAppliedHunger ?? 0);
  let sleepAppliedClean = Math.min(0, input.sleepAppliedClean ?? 0);
  let sleepCooldownUntil = Math.max(0, input.sleepCooldownUntil ?? 0);
  let gameHour =
    typeof input.gameHour === 'number' && Number.isFinite(input.gameHour)
      ? ((input.gameHour % 24) + 24) % 24
      : INITIAL_GAME_HOUR;

  if (sleepMode !== 'none' && sleepDurationSec <= 0) {
    if (sleepMode === 'auto_sleep') {
      sleepDurationSec = AUTO_SLEEP_CONFIG.durationSec;
      sleepTargetEnergy = AUTO_SLEEP_CONFIG.energyDelta;
      sleepTargetHappy = AUTO_SLEEP_CONFIG.happinessDelta;
      sleepTargetHunger = AUTO_SLEEP_CONFIG.hungerDelta;
      sleepTargetClean = AUTO_SLEEP_CONFIG.cleanlinessDelta;
    } else {
      const opt = SLEEP_OPTIONS.find((o) => o.id === sleepMode);
      if (opt) {
        sleepDurationSec = opt.durationSec;
        sleepTargetEnergy = opt.energyDelta;
        sleepTargetHappy = opt.happinessDelta;
        sleepTargetHunger = opt.hungerDelta;
        sleepTargetClean = opt.cleanlinessDelta;
      }
    }
  }

  if (!input.lastSavedTime || !Number.isFinite(input.lastSavedTime)) {
    const cal = computeCalendarDayAndHour(stage, stageElapsed);
    return {
      elapsedSeconds: 0,
      hunger: startHunger,
      happiness: startHappiness,
      cleanliness: startClean,
      energy: startEnergy,
      health: startHealth,
      isSick,
      isRecovering,
      lifeStage: stage,
      stageElapsedSec: stageElapsed,
      adultBranch: branch,
      day: cal.day,
      gameHours: cal.gameHours,
      gameHour,
      dayPhase: getDayPhaseFromHour(gameHour),
      sleepMode,
      sleepRemainingSec,
      sleepDurationSec,
      sleepTargetEnergy,
      sleepTargetHappy,
      sleepTargetHunger,
      sleepTargetClean,
      sleepAppliedEnergy,
      sleepAppliedHappy,
      sleepAppliedHunger,
      sleepAppliedClean,
      sleepCooldownUntil,
      passedAwayOfOldAge: false,
      hungerLost: 0,
      healthLost: 0,
      dippedBelow40: startHunger < 40,
      dippedBelow20: startHunger < 20,
    };
  }

  const elapsedSeconds = Math.max(0, (now - input.lastSavedTime) / 1000);
  let simClockMs = input.lastSavedTime;
  let remaining = elapsedSeconds;
  let hunger = startHunger;
  let happiness = startHappiness;
  let cleanliness = startClean;
  let energy = startEnergy;
  let health = startHealth;
  let passedAwayOfOldAge = false;

  // Step through elapsed time in chunks up to stage boundaries, sleep boundaries, or 5-minute slices
  while (remaining > 0.5) {
    const stageDur = LIFE_STAGES[stage].durationSec;
    const timeLeftInStage = Math.max(0, stageDur - stageElapsed);
    const activeSleepMeta =
      sleepMode === 'power_nap' || sleepMode === 'full_rest'
        ? SLEEP_OPTIONS.find((opt) => opt.id === sleepMode)
        : sleepMode === 'auto_sleep'
        ? {
            id: 'auto_sleep' as const,
            durationSec: AUTO_SLEEP_CONFIG.durationSec,
            cooldownAfterWakeSec: 0,
            energyDelta: AUTO_SLEEP_CONFIG.energyDelta,
            happinessDelta: AUTO_SLEEP_CONFIG.happinessDelta,
            hungerDelta: AUTO_SLEEP_CONFIG.hungerDelta,
            cleanlinessDelta: AUTO_SLEEP_CONFIG.cleanlinessDelta,
          }
        : undefined;
    const sleepSliceCap =
      activeSleepMeta && sleepRemainingSec > 0 ? sleepRemainingSec : Number.POSITIVE_INFINITY;
    const step = Math.min(remaining, Math.max(1, timeLeftInStage), sleepSliceCap, 300);

    const dayPhase = getDayPhaseFromHour(gameHour);
    const phaseMult = getDayPhaseMultipliers(dayPhase);
    const weatherMult = getWeatherMultipliers(input.weather ?? 'cerah');
    const rates = getStageDecayRatesPerSec(stage, stageElapsed, branch, input.hungerSpeed);
    const prevHunger = hunger;

    if (activeSleepMeta && sleepRemainingSec > 0) {
      const dur = Math.max(1, sleepDurationSec || activeSleepMeta.durationSec);
      const tEnergy = sleepTargetEnergy > 0 ? sleepTargetEnergy : activeSleepMeta.energyDelta;
      const tHappy = sleepTargetHappy > 0 ? sleepTargetHappy : activeSleepMeta.happinessDelta;
      const tHunger = sleepTargetHunger < 0 ? sleepTargetHunger : activeSleepMeta.hungerDelta;
      const tClean = sleepTargetClean < 0 ? sleepTargetClean : activeSleepMeta.cleanlinessDelta;

      const eGain = (tEnergy / dur) * step;
      const hGain = (tHappy / dur) * step;
      const hunDelta = (tHunger / dur) * step;
      const clnDelta = (tClean / dur) * step;
      energy = clamp(energy + eGain, 0, 100);
      happiness = clamp(happiness + hGain, 0, 100);
      hunger = clamp(hunger + hunDelta, 0, 100);
      cleanliness = clamp(cleanliness + clnDelta, 0, 100);
      sleepAppliedEnergy += eGain;
      sleepAppliedHappy += hGain;
      sleepAppliedHunger += hunDelta;
      sleepAppliedClean += clnDelta;
      hunger = clamp(
        hunger - step * rates.hungerPerSec * phaseMult.hunger * weatherMult.idleOrSleepHunger * 0.25,
        0,
        100
      );
      sleepRemainingSec = Math.max(0, sleepRemainingSec - step);
      if (sleepRemainingSec <= 0.01) {
        const remE = Math.max(0, tEnergy - sleepAppliedEnergy);
        const remH = Math.max(0, tHappy - sleepAppliedHappy);
        const remHun = Math.min(0, tHunger - sleepAppliedHunger);
        const remCln = Math.min(0, tClean - sleepAppliedClean);
        energy = clamp(energy + remE, 0, 100);
        happiness = clamp(happiness + remH, 0, 100);
        hunger = clamp(hunger + remHun, 0, 100);
        cleanliness = clamp(cleanliness + remCln, 0, 100);
        if (activeSleepMeta.cooldownAfterWakeSec > 0) {
          sleepCooldownUntil = Math.max(
            sleepCooldownUntil,
            simClockMs + step * 1000 + activeSleepMeta.cooldownAfterWakeSec * 1000
          );
        }
        sleepMode = 'none';
        sleepRemainingSec = 0;
        sleepDurationSec = 0;
        sleepTargetEnergy = 0;
        sleepTargetHappy = 0;
        sleepTargetHunger = 0;
        sleepTargetClean = 0;
        sleepAppliedEnergy = 0;
        sleepAppliedHappy = 0;
        sleepAppliedHunger = 0;
        sleepAppliedClean = 0;
      }
    } else {
      hunger = clamp(hunger - step * rates.hungerPerSec * phaseMult.hunger, 0, 100);
      cleanliness = clamp(cleanliness - step * rates.cleanlinessPerSec * phaseMult.cleanliness, 0, 100);
      energy = clamp(
        energy - step * rates.energyPerSec * phaseMult.energy * weatherMult.energy,
        0,
        100
      );

      const badStatsDuringRain = hunger < 40 || cleanliness < 40;
      const rainHappyFactor = badStatsDuringRain
        ? weatherMult.indoorHappyBadStats
        : weatherMult.indoorHappyNormal;
      const effHappyRate = rates.happinessPerSec * phaseMult.happiness * rainHappyFactor;
      const extraHappyDrain =
        ((hunger < 40 ? effHappyRate * 0.4 : 0) +
          (cleanliness < 40 ? rates.cleanlinessPerSec * 0.6 : 0)) *
        rainHappyFactor;
      happiness = clamp(
        happiness - step * (effHappyRate + extraHappyDrain),
        0,
        100
      );
    }

    // Health penalty / recovery during absence
    if (isRecovering) {
      health = clamp(health + step * HEALTH_RECOVERY_PER_REAL_SEC, 0, 100);
      if (health >= SICK_SYMPTOM_CLEAR_HEALTH) {
        isSick = false;
      }
      if (health >= 100) {
        health = 100;
        isRecovering = false;
        isSick = false;
      }
    } else {
      if (isSick) {
        health = clamp(health - step * UNTREATED_SICK_DRAIN_PER_REAL_SEC, 0, 100);
      }
      if (prevHunger <= 0 || hunger <= 0) {
        health = clamp(health - step * (100 / (16 * 3600)), 0, 100);
      } else if (hunger < 20) {
        health = clamp(health - step * (100 / (36 * 3600)), 0, 100);
      }
      if (cleanliness <= 0) {
        health = clamp(health - step * (100 / (24 * 3600)), 0, 100);
        if (!isSick) {
          health = Math.min(health, SICK_START_HEALTH);
          isSick = true;
        }
      }
      if (!isSick && health <= SICK_START_HEALTH) {
        isSick = true;
      }
    }

    stageElapsed += step;
    remaining -= step;
    simClockMs += step * 1000;
    gameHour = (gameHour + step * GAME_HOURS_PER_REAL_SEC) % 24;

    if (stageElapsed >= stageDur) {
      if (stage === 'baby') {
        stage = 'child';
        stageElapsed = 0;
      } else if (stage === 'child') {
        stage = 'teen';
        stageElapsed = 0;
      } else if (stage === 'teen') {
        branch =
          input.careMistakes <= 2
            ? 'prima'
            : input.careMistakes <= 5
            ? 'mandiri'
            : 'sensitif';
        stage = 'adult';
        stageElapsed = 0;
      } else if (stage === 'adult') {
        stage = 'senior';
        stageElapsed = 0;
      } else if (stage === 'senior') {
        stageElapsed = stageDur;
        passedAwayOfOldAge = true;
        break;
      }
    }
  }

  const cal = computeCalendarDayAndHour(stage, stageElapsed);
  return {
    elapsedSeconds,
    hunger,
    happiness,
    cleanliness,
    energy,
    health,
    isSick,
    isRecovering,
    lifeStage: stage,
    stageElapsedSec: stageElapsed,
    adultBranch: branch,
    day: cal.day,
    gameHours: cal.gameHours,
    gameHour,
    dayPhase: getDayPhaseFromHour(gameHour),
    sleepMode,
    sleepRemainingSec,
    sleepDurationSec,
    sleepTargetEnergy,
    sleepTargetHappy,
    sleepTargetHunger,
    sleepTargetClean,
    sleepAppliedEnergy,
    sleepAppliedHappy,
    sleepAppliedHunger,
    sleepAppliedClean,
    sleepCooldownUntil,
    passedAwayOfOldAge,
    hungerLost: Math.max(0, startHunger - hunger),
    healthLost: Math.max(0, startHealth - health),
    dippedBelow40: hunger < 40,
    dippedBelow20: hunger < 20,
  };
}

export type CareNotificationPermission = NotificationPermission | 'unsupported';

let lowHungerTimerId: number | null = null;
let notifiedSinceLastFeed = false;

export function getCareNotificationPermission(): CareNotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestCareNotificationPermission(): Promise<CareNotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function sendLowHungerNotification(): void {
  if (notifiedSinceLastFeed) return;
  notifiedSinceLastFeed = true;
  clearLowHungerNotificationSchedule();

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification('Rumah Kucing', {
      body: LOW_HUNGER_NOTIFICATION_MESSAGE,
      icon: '/assets/aistudio/image_e0ece965.png',
      tag: 'rumah-kucing-hunger-20',
    });
  } catch {
    // Fallback for browsers requiring ServiceWorkerRegistration.showNotification
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) =>
          reg.showNotification('Rumah Kucing', {
            body: LOW_HUNGER_NOTIFICATION_MESSAGE,
            icon: '/assets/aistudio/image_e0ece965.png',
            tag: 'rumah-kucing-hunger-20',
          })
        )
        .catch(() => {
          // Ignore if no service worker registered
        });
    }
  }
}

export function clearLowHungerNotificationSchedule(): void {
  if (lowHungerTimerId !== null && typeof window !== 'undefined') {
    window.clearTimeout(lowHungerTimerId);
    lowHungerTimerId = null;
  }
}

export function scheduleLowHungerNotification(
  currentHunger: number,
  drainPerSec: number = OFFLINE_HUNGER_DECAY_PER_SEC
): void {
  clearLowHungerNotificationSchedule();
  if (typeof window === 'undefined') return;
  if (notifiedSinceLastFeed) return;
  if (currentHunger < 40) return;

  const safeRate = drainPerSec > 0 ? drainPerSec : OFFLINE_HUNGER_DECAY_PER_SEC;
  const secondsUntil40 = (currentHunger - 40) / safeRate;
  // Clamp timeout delay within 32-bit signed int limit (~24.8 days)
  const delayMs = Math.max(1000, Math.min(2147483647, Math.round(secondsUntil40 * 1000)));

  lowHungerTimerId = window.setTimeout(() => {
    lowHungerTimerId = null;
    sendLowHungerNotification();
  }, delayMs);
}

export function resetLowHungerNotificationAfterFeed(
  estimatedHunger: number,
  drainPerSec: number = OFFLINE_HUNGER_DECAY_PER_SEC
): void {
  notifiedSinceLastFeed = false;
  scheduleLowHungerNotification(estimatedHunger, drainPerSec);
}

export function setLowHungerNotifiedFlag(notified: boolean): void {
  notifiedSinceLastFeed = notified;
}
