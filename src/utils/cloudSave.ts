import { FirebaseError } from 'firebase/app';
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AdultEvolutionBranch,
  BathItemId,
  CAT_BREEDS,
  CatAccessoryId,
  CatBathtubId,
  CatBedId,
  CatBreed,
  CatGlassesId,
  CatHatId,
  CatPersonality,
  CatScarfId,
  CatToyId,
  LifeStage,
  ManualSleepMode,
  RoomBackgroundId,
  SaveData,
  SleepMode,
  WeatherType,
} from '../types/game';

const COLLECTION_NAME = 'cloudSaves';
const MAX_CAT_NAME_LENGTH = 20;
const UID_PATTERN = /^[a-zA-Z0-9_-]+$/;

const ALLOWED_BREEDS: readonly CatBreed[] = ['oren', 'mochi', 'arang', 'abu'];
const ALLOWED_PERSONALITIES: readonly CatPersonality[] = ['playful', 'lazy', 'shy'];
const ALLOWED_WEATHERS: readonly WeatherType[] = ['cerah', 'hujan', 'malam'];
const ALLOWED_STAGES: readonly LifeStage[] = ['baby', 'child', 'teen', 'adult', 'senior'];
const ALLOWED_BRANCHES: readonly AdultEvolutionBranch[] = ['prima', 'mandiri', 'sensitif'];
const ALLOWED_BACKGROUNDS: readonly RoomBackgroundId[] = ['classic_home', 'apartment', 'tatami'];
const ALLOWED_BEDS: readonly CatBedId[] = [
  'kasur_kucing',
  'kasur_semangka',
  'keranjang_rajut',
  'kasur_donat',
  'tenda_kerajaan',
];
const ALLOWED_BATHTUBS: readonly CatBathtubId[] = [
  'bak_kucing',
  'bak_ikan',
  'bak_onsen',
  'bak_kerang',
  'bak_batu',
];
const ALLOWED_TOYS: readonly CatToyId[] = [
  'yarn_ball',
  'laser_pointer',
  'feather_wand',
  'toy_mouse',
];
const ALLOWED_HATS: readonly CatHatId[] = [
  'none',
  'beret_merah',
  'topi_pesta',
  'mahkota_emas',
];
const ALLOWED_GLASSES: readonly CatGlassesId[] = [
  'none',
  'kacamata_bulat',
  'kacamata_hitam',
  'kacamata_hati',
];
const ALLOWED_SCARVES: readonly CatScarfId[] = [
  'default',
  'syal_polkadot',
  'syal_garis',
  'dasi_kupu',
];
const ALLOWED_ACCESSORIES: readonly CatAccessoryId[] = [
  'beret_merah',
  'topi_pesta',
  'mahkota_emas',
  'kacamata_bulat',
  'kacamata_hitam',
  'kacamata_hati',
  'syal_polkadot',
  'syal_garis',
  'dasi_kupu',
];
const ALLOWED_SLEEP_MODES: readonly SleepMode[] = [
  'none',
  'power_nap',
  'full_rest',
  'auto_sleep',
];
const ALLOWED_BATH_ITEMS: readonly BathItemId[] = ['basic_soap', 'shampoo_foam', 'spa_bath'];
const ALLOWED_MANUAL_SLEEP: readonly ManualSleepMode[] = ['power_nap', 'full_rest'];

function clampNum(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.max(min, Math.min(max, val));
}

function nonNegNum(val: unknown, fallback = 0): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.max(0, val);
}

function finiteNum(val: unknown, fallback = 0): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return val;
}

function pickEnum<T extends string>(val: unknown, allowed: readonly T[], fallback: T): T {
  return typeof val === 'string' && (allowed as readonly string[]).includes(val)
    ? (val as T)
    : fallback;
}

function pickAllowlistedList<T extends string>(
  val: unknown,
  allowed: readonly T[],
  fallback: T[],
  maxLen: number
): T[] {
  if (!Array.isArray(val)) return [...fallback];
  const deduped: T[] = [];
  for (const item of val) {
    if (
      typeof item === 'string' &&
      (allowed as readonly string[]).includes(item) &&
      !deduped.includes(item as T)
    ) {
      deduped.push(item as T);
      if (deduped.length >= maxLen) break;
    }
  }
  return deduped.length > 0 ? deduped : [...fallback];
}

type SanitizedCloudSaveFields = Omit<Required<SaveData>, 'cooldownsUntil' | 'inventory'> & {
  inventory: {
    main_food: number;
    special_food: number;
    shampoo_foam: number;
    spa_bath: number;
  };
  cooldownsUntil: {
    snack: number;
    basicSoap: number;
    miniGame: number;
    interactivePlay: number;
    petShort: number;
    petFull: number;
    sleepManual: number;
  };
};

export function sanitizeSaveDataFields(save: SaveData): SanitizedCloudSaveFields {
  const breed = pickEnum(save.breed, ALLOWED_BREEDS, 'oren');
  const rawName = typeof save.name === 'string' ? save.name.trim() : '';
  const name = (rawName || CAT_BREEDS[breed].defaultName).slice(0, MAX_CAT_NAME_LENGTH);
  const now = Date.now();
  const gameHour =
    typeof save.gameHour === 'number' && Number.isFinite(save.gameHour)
      ? ((save.gameHour % 24) + 24) % 24
      : 7;

  return {
    name,
    breed,
    personality: pickEnum(save.personality, ALLOWED_PERSONALITIES, 'playful'),
    hunger: clampNum(save.hunger, 0, 100, 86),
    happiness: clampNum(save.happiness, 0, 100, 88),
    cleanliness: clampNum(save.cleanliness, 0, 100, 92),
    energy: clampNum(save.energy, 0, 100, 88),
    health: clampNum(save.health, 0, 100, 100),
    isSick: Boolean(save.isSick),
    isRecovering: Boolean(save.isRecovering),
    affectionXp: nonNegNum(save.affectionXp, 0),
    level: Math.max(1, Math.floor(nonNegNum(save.level, 1))),
    coins: Math.floor(nonNegNum(save.coins, 0)),
    day: Math.floor(nonNegNum(save.day, 0)),
    gameHour: clampNum(gameHour, 0, 24, 7),
    timeOfDay: clampNum(save.timeOfDay, 0, 1, gameHour / 24),
    weather: pickEnum(save.weather, ALLOWED_WEATHERS, 'cerah'),
    lifeStage: pickEnum(save.lifeStage, ALLOWED_STAGES, 'baby'),
    stageElapsedSec: nonNegNum(save.stageElapsedSec, 0),
    careMistakes: Math.floor(nonNegNum(save.careMistakes, 0)),
    adultBranch: pickEnum(save.adultBranch, ALLOWED_BRANCHES, 'prima'),
    totalCatches: Math.floor(nonNegNum(save.totalCatches, 0)),
    totalPets: Math.floor(nonNegNum(save.totalPets, 0)),
    activeBackground: pickEnum(save.activeBackground, ALLOWED_BACKGROUNDS, 'classic_home'),
    unlockedBackgrounds: pickAllowlistedList(
      save.unlockedBackgrounds,
      ALLOWED_BACKGROUNDS,
      ['classic_home'],
      10
    ),
    activeBed: pickEnum(save.activeBed, ALLOWED_BEDS, 'kasur_kucing'),
    unlockedBeds: pickAllowlistedList(save.unlockedBeds, ALLOWED_BEDS, ['kasur_kucing'], 10),
    activeBathtub: pickEnum(save.activeBathtub, ALLOWED_BATHTUBS, 'bak_kucing'),
    unlockedBathtubs: pickAllowlistedList(
      save.unlockedBathtubs,
      ALLOWED_BATHTUBS,
      ['bak_kucing'],
      10
    ),
    activeToy: pickEnum(save.activeToy, ALLOWED_TOYS, 'yarn_ball'),
    unlockedToys: pickAllowlistedList(save.unlockedToys, ALLOWED_TOYS, ['yarn_ball'], 10),
    equippedHat: pickEnum(save.equippedHat, ALLOWED_HATS, 'none'),
    equippedGlasses: pickEnum(save.equippedGlasses, ALLOWED_GLASSES, 'none'),
    equippedScarf: pickEnum(save.equippedScarf, ALLOWED_SCARVES, 'default'),
    unlockedAccessories: pickAllowlistedList(
      save.unlockedAccessories,
      ALLOWED_ACCESSORIES,
      [],
      20
    ),
    inventory: {
      main_food: Math.floor(clampNum(save.inventory?.main_food, 0, 9999, 0)),
      special_food: Math.floor(clampNum(save.inventory?.special_food, 0, 9999, 0)),
      shampoo_foam: Math.floor(clampNum(save.inventory?.shampoo_foam, 0, 9999, 0)),
      spa_bath: Math.floor(clampNum(save.inventory?.spa_bath, 0, 9999, 0)),
    },
    sleepMode: pickEnum(save.sleepMode, ALLOWED_SLEEP_MODES, 'none'),
    sleepRemainingSec: nonNegNum(save.sleepRemainingSec, 0),
    sleepDurationSec: nonNegNum(save.sleepDurationSec, 0),
    sleepTargetEnergy: finiteNum(save.sleepTargetEnergy, 0),
    sleepTargetHappy: finiteNum(save.sleepTargetHappy, 0),
    sleepTargetHunger: finiteNum(save.sleepTargetHunger, 0),
    sleepTargetClean: finiteNum(save.sleepTargetClean, 0),
    sleepAppliedEnergy: finiteNum(save.sleepAppliedEnergy, 0),
    sleepAppliedHappy: finiteNum(save.sleepAppliedHappy, 0),
    sleepAppliedHunger: finiteNum(save.sleepAppliedHunger, 0),
    sleepAppliedClean: finiteNum(save.sleepAppliedClean, 0),
    zeroEnergyElapsedSec: nonNegNum(save.zeroEnergyElapsedSec, 0),
    cooldownsUntil: {
      snack: nonNegNum(save.cooldownsUntil?.snack, 0),
      basicSoap: nonNegNum(save.cooldownsUntil?.basicSoap, 0),
      miniGame: nonNegNum(save.cooldownsUntil?.miniGame, 0),
      interactivePlay: nonNegNum(save.cooldownsUntil?.interactivePlay, 0),
      petShort: nonNegNum(save.cooldownsUntil?.petShort, 0),
      petFull: nonNegNum(save.cooldownsUntil?.petFull, 0),
      sleepManual: nonNegNum(save.cooldownsUntil?.sleepManual, 0),
    },
    bedNx: clampNum(save.bedNx, 0, 1, 0.2),
    bedNy: clampNum(save.bedNy, 0, 1, 0.78),
    tubNx: clampNum(save.tubNx, 0, 1, 0.8),
    tubNy: clampNum(save.tubNy, 0, 1, 0.72),
    bowlNx: clampNum(save.bowlNx, 0, 1, 0.34),
    bowlNy: clampNum(save.bowlNy, 0, 1, 0.82),
    lastBathItemId: pickEnum(save.lastBathItemId, ALLOWED_BATH_ITEMS, 'basic_soap'),
    lastSleepMode: pickEnum(save.lastSleepMode, ALLOWED_MANUAL_SLEEP, 'power_nap'),
    lastFreeFeedAt: nonNegNum(save.lastFreeFeedAt, 0),
    lowCleanlinessStrikes: Math.floor(nonNegNum(save.lowCleanlinessStrikes, 0)),
    wasUnder25Clean: Boolean(save.wasUnder25Clean),
    lastSavedTime: nonNegNum(save.lastSavedTime, now),
    savedAt: nonNegNum(save.savedAt, now),
  };
}

export function extractSaveDataFromDoc(raw: Record<string, unknown>): SaveData | null {
  if (!raw || typeof raw.name !== 'string' || typeof raw.breed !== 'string') {
    return null;
  }
  const sanitized = sanitizeSaveDataFields(raw as unknown as SaveData);
  return {
    ...sanitized,
    lastFreeFeedAt: sanitized.lastFreeFeedAt > 0 ? sanitized.lastFreeFeedAt : undefined,
  };
}

export async function loadCloudSave(
  uid: string
): Promise<{ save: SaveData | null; exists: boolean }> {
  if (!UID_PATTERN.test(uid)) {
    throw new Error('ID pengguna tidak valid.');
  }
  const path = `${COLLECTION_NAME}/${uid}`;
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, uid));
    if (!snap.exists()) {
      return { save: null, exists: false };
    }
    const save = extractSaveDataFromDoc(snap.data() as Record<string, unknown>);
    return { save, exists: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCloudSave(
  uid: string,
  save: SaveData,
  knownExists?: boolean
): Promise<boolean> {
  if (!UID_PATTERN.test(uid)) {
    throw new Error('ID pengguna tidak valid.');
  }
  const path = `${COLLECTION_NAME}/${uid}`;
  const docRef = doc(db, COLLECTION_NAME, uid);
  const fields = sanitizeSaveDataFields(save);

  let shouldUpdate = knownExists;
  if (shouldUpdate === undefined) {
    try {
      const snap = await getDoc(docRef);
      shouldUpdate = snap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  if (shouldUpdate) {
    try {
      await updateDoc(docRef, {
        ...fields,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'not-found') {
        shouldUpdate = false;
      } else {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  }

  try {
    await setDoc(docRef, {
      ...fields,
      ownerId: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCloudSave(uid: string): Promise<void> {
  if (!UID_PATTERN.test(uid)) {
    throw new Error('ID pengguna tidak valid.');
  }
  const path = `${COLLECTION_NAME}/${uid}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
