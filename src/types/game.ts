export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type CatBreed = 'oren' | 'mochi' | 'arang' | 'abu';

export type CatPersonality = 'playful' | 'lazy' | 'shy';

export type CatBehavior =
  | 'IDLE'
  | 'WALKING'
  | 'EATING'
  | 'PLAYING'
  | 'SLEEPING'
  | 'PURRING'
  | 'GROOMING'
  | 'STRETCHING'
  | 'ROLLING';

export type ToolMode = 'PET' | 'BRUSH' | 'TOY';

export type BowlTreatType =
  | 'kibble'
  | 'salmon'
  | 'milk'
  | 'catnip'
  | 'snack'
  | 'main_food'
  | 'special_food';

export type FoodItemId = 'snack' | 'main_food' | 'special_food';
export type BathItemId = 'basic_soap' | 'shampoo_foam' | 'spa_bath';
export type SleepMode = 'none' | 'power_nap' | 'full_rest' | 'auto_sleep';
export type DrowsyStage = 'fresh' | 'drowsy_light' | 'drowsy_heavy' | 'exhausted';
export type DayPhase = 'pagi' | 'siang' | 'malam';

export interface ActionCooldownsSec {
  snack: number;
  basicSoap: number;
  miniGame: number;
  interactivePlay: number;
  petShort: number;
  petFull: number;
  sleepManual: number;
}

export const INITIAL_COOLDOWNS: ActionCooldownsSec = {
  snack: 0,
  basicSoap: 0,
  miniGame: 0,
  interactivePlay: 0,
  petShort: 0,
  petFull: 0,
  sleepManual: 0,
};

export interface ConsumableInventory {
  main_food: number;
  special_food: number;
  shampoo_foam: number;
  spa_bath: number;
}

export const INITIAL_INVENTORY: ConsumableInventory = {
  main_food: 0,
  special_food: 0,
  shampoo_foam: 0,
  spa_bath: 0,
};

export interface FoodItemOption {
  id: FoodItemId;
  name: string;
  shortName: string;
  description: string;
  note: string;
  isFree: boolean;
  price: number;
  cooldownSec: number;
  hungerDelta: number;
  happinessDelta: number;
  energyDelta: number;
}

export const FOOD_ITEMS: FoodItemOption[] = [
  {
    id: 'snack',
    name: 'Camilan Ringan / Snack',
    shortName: 'Camilan Ringan',
    description: '+15 Kenyang · +10 Bahagia',
    note: 'Gratis (cooldown 2 mnt); ditolak jika Bahagia sudah 100.',
    isFree: true,
    price: 0,
    cooldownSec: 120,
    hungerDelta: 15,
    happinessDelta: 10,
    energyDelta: 0,
  },
  {
    id: 'main_food',
    name: 'Makanan Utama / Standar',
    shortName: 'Makanan Utama',
    description: '+30 Kenyang · +5 Bahagia',
    note: 'Stok Shop (tanpa cooldown); ditolak jika Kenyang sudah 100.',
    isFree: false,
    price: 10,
    cooldownSec: 0,
    hungerDelta: 30,
    happinessDelta: 5,
    energyDelta: 0,
  },
  {
    id: 'special_food',
    name: 'Makanan Spesial / Porsi Besar',
    shortName: 'Makanan Spesial',
    description: '+50 Kenyang · +15 Bahagia',
    note: 'Stok Shop (tanpa cooldown); ditolak jika Kenyang sudah 100.',
    isFree: false,
    price: 18,
    cooldownSec: 0,
    hungerDelta: 50,
    happinessDelta: 15,
    energyDelta: 0,
  },
];

export interface BathItemOption {
  id: BathItemId;
  name: string;
  shortName: string;
  description: string;
  note: string;
  isFree: boolean;
  price: number;
  cooldownSec: number;
  cleanlinessDelta: number;
  happinessDelta: number;
}

export const BATH_ITEMS: BathItemOption[] = [
  {
    id: 'basic_soap',
    name: 'Sabun Dasar / Lap Basah',
    shortName: 'Sabun Dasar',
    description: '+35 Bersih · +5 Bahagia',
    note: 'Gratis (cooldown 3 mnt); ditolak jika Bersih sudah 100.',
    isFree: true,
    price: 0,
    cooldownSec: 180,
    cleanlinessDelta: 35,
    happinessDelta: 5,
  },
  {
    id: 'shampoo_foam',
    name: 'Shampo & Bath Foam',
    shortName: 'Shampo & Foam',
    description: '+60 Bersih · +10 Bahagia',
    note: 'Stok Shop (tanpa cooldown); ditolak jika Bersih sudah 100.',
    isFree: false,
    price: 12,
    cooldownSec: 0,
    cleanlinessDelta: 60,
    happinessDelta: 10,
  },
  {
    id: 'spa_bath',
    name: 'Mandi Spa / Bath Bomb',
    shortName: 'Mandi Spa',
    description: '+100 Bersih · +20 Bahagia',
    note: 'Stok Shop (tanpa cooldown); bersih penuh & cegah efek negatif.',
    isFree: false,
    price: 22,
    cooldownSec: 0,
    cleanlinessDelta: 100,
    happinessDelta: 20,
  },
];

export type ManualSleepMode = 'power_nap' | 'full_rest';

export interface SleepOption {
  id: ManualSleepMode;
  name: string;
  shortName: string;
  durationSec: number;
  durationLabel: string;
  cooldownAfterWakeSec: number;
  energyDelta: number;
  happinessDelta: number;
  hungerDelta: number;
  cleanlinessDelta: number;
  description: string;
}

export const SLEEP_OPTIONS: SleepOption[] = [
  {
    id: 'power_nap',
    name: 'Tidur Singkat (Power Nap)',
    shortName: 'Power Nap',
    durationSec: 180, // 3 menit nyata
    durationLabel: '3 mnt · CD 3 mnt',
    cooldownAfterWakeSec: 180, // 3 menit setelah bangun
    energyDelta: 40,
    happinessDelta: 5,
    hungerDelta: -5,
    cleanlinessDelta: 0,
    description: '+40 Energi · +5 Bahagia · -5 Kenyang',
  },
  {
    id: 'full_rest',
    name: 'Tidur Pulih Penuh',
    shortName: 'Tidur Penuh',
    durationSec: 600, // 10 menit nyata
    durationLabel: '10 mnt · CD 5 mnt',
    cooldownAfterWakeSec: 300, // 5 menit setelah bangun
    energyDelta: 100,
    happinessDelta: 10,
    hungerDelta: -12,
    cleanlinessDelta: -2,
    description: '+100 Energi · +10 Bahagia · -12 Kenyang · -2 Bersih',
  },
];

export const AUTO_SLEEP_CONFIG = {
  durationSec: 240, // 4 menit nyata (3-5 menit)
  energyDelta: 35, // Pulih minimal ke 30-40 poin
  happinessDelta: 0,
  hungerDelta: 0,
  cleanlinessDelta: 0,
} as const;

export const OVERWORK_SICK_SECONDS = 600; // 10 menit nyata bertahan di Energi 0

export const ACTION_DELTAS = {
  playMiniGame: {
    happiness: 25,
    energy: -10,
    hunger: -5,
    cleanliness: -3,
    cooldownSec: 60,
  },
  playInteractiveFull: {
    happiness: 45,
    energy: -15,
    hunger: -10,
    cleanliness: -6,
    cooldownSec: 120,
  },
  petShort: {
    happiness: 15,
    energy: 0,
    hunger: 0,
    cooldownSec: 30,
  },
  petFull: {
    happiness: 25,
    energy: 0,
    hunger: -2,
    cooldownSec: 60,
  },
} as const;

export type HungerSpeed = 'santai' | 'normal';

export type WeatherType = 'cerah' | 'hujan' | 'malam';

export type LifeStage = 'baby' | 'child' | 'teen' | 'adult' | 'senior';

export type AdultEvolutionBranch = 'prima' | 'mandiri' | 'sensitif';

export type DeathReason = 'sickness' | 'old_age' | null;

export interface LifeStageMeta {
  id: LifeStage;
  label: string;
  shortLabel: string;
  durationSec: number;
  realDurationLabel: string;
  calendarLabel: string;
  description: string;
  decayNote: string;
  imgSrc?: string;
}

export const LIFE_STAGES: Record<LifeStage, LifeStageMeta> = {
  baby: {
    id: 'baby',
    label: 'Bayi',
    shortLabel: 'Bayi',
    durationSec: 60 * 60, // 60 menit nyata (Jam 0–73, Hari 0–3)
    realDurationLabel: '60 menit',
    calendarLabel: 'Hari ke-0 s/d ke-3 (Jam 0–73)',
    description: 'Baru lahir, sangat menggemaskan namun butuh perhatian ekstra.',
    decayNote: 'Kenyang/Bahagia -20/15m · Bersih -20/25m · Energi -20/18m',
    imgSrc: '/src/assets/images/cat_stage_baby_1795704818280.jpg',
  },
  child: {
    id: 'child',
    label: 'Anak',
    shortLabel: 'Anak',
    durationSec: 24 * 60 * 60, // 24 jam nyata (Hari ke-1)
    realDurationLabel: '24 jam',
    calendarLabel: 'Hari ke-1',
    description: 'Aktif dan penuh rasa ingin tahu! Mini-game sudah bisa dimainkan.',
    decayNote: 'Kenyang/Bahagia -20/50m · Bersih -20/80m · Energi -20/60m',
    imgSrc: '/src/assets/images/cat_stage_child_1795704819143.jpg',
  },
  teen: {
    id: 'teen',
    label: 'Remaja',
    shortLabel: 'Remaja',
    durationSec: 48 * 60 * 60, // 48 jam nyata (Hari ke-2 s/d ke-3)
    realDurationLabel: '48 jam',
    calendarLabel: 'Hari ke-2 s/d ke-3',
    description: 'Fase penentuan evolusi dewasa berdasarkan riwayat perawatanmu.',
    decayNote: 'Kenyang/Bahagia -20/60m · Bersih -20/95m · Energi -20/75m',
    imgSrc: '/src/assets/images/cat_stage_teen_1795704819351.jpg',
  },
  adult: {
    id: 'adult',
    label: 'Dewasa',
    shortLabel: 'Dewasa',
    durationSec: 8 * 24 * 60 * 60, // 8 hari nyata (Hari ke-4 s/d ke-11)
    realDurationLabel: '8 hari',
    calendarLabel: 'Hari ke-4 s/d ke-11',
    description: 'Bentuk dewasa penuh sesuai hasil perawatan fase Anak & Remaja.',
    decayNote: 'Kenyang/Bahagia -20/75–90m · Bersih -20/120–140m · Energi -20/90–110m',
  },
  senior: {
    id: 'senior',
    label: 'Tua (Senior)',
    shortLabel: 'Tua',
    durationSec: 7 * 24 * 60 * 60, // 7 hari nyata (Hari ke-12 s/d ke-18, lalu Wafat)
    realDurationLabel: '7 hari (Wafat > Hari 18)',
    calendarLabel: 'Hari ke-12 s/d ke-18',
    description: 'Kucing senior yang bijak dan manja di hari ke-12 hingga hari ke-18.',
    decayNote: 'Kenyang/Bahagia -20/20–30m · Bersih -20/35–45m · Energi -20/25–35m',
    imgSrc: '/src/assets/images/cat_stage_senior_1795704819383.jpg',
  },
};

export const ADULT_BRANCHES: Record<
  AdultEvolutionBranch,
  { id: AdultEvolutionBranch; label: string; description: string; maxMistakesLabel: string }
> = {
  prima: {
    id: 'prima',
    label: 'Dewasa Prima',
    description: 'Terawat optimal: interval turun terlambat (90m/140m/110m) & +1 koin bonus.',
    maxMistakesLabel: '0–2 Care Mistakes',
  },
  mandiri: {
    id: 'mandiri',
    label: 'Dewasa Mandiri',
    description: 'Tangkas dan seimbang dengan ketahanan tubuh standar (82,5m/130m/100m).',
    maxMistakesLabel: '3–5 Care Mistakes',
  },
  sensitif: {
    id: 'sensitif',
    label: 'Dewasa Sensitif',
    description: 'Lebih manja dan cepat merasa lapar/kesepian (75m/120m/90m).',
    maxMistakesLabel: '6+ Care Mistakes',
  },
};

export type RoomBackgroundId = 'classic_home' | 'apartment' | 'tatami';

export type CatBedId =
  | 'kasur_kucing'
  | 'kasur_semangka'
  | 'keranjang_rajut'
  | 'kasur_donat'
  | 'tenda_kerajaan';

export type CatToyId =
  | 'yarn_ball'
  | 'laser_pointer'
  | 'feather_wand'
  | 'toy_mouse';

export type CatAccessorySlot = 'hat' | 'glasses' | 'scarf';

export type CatHatId = 'none' | 'beret_merah' | 'topi_pesta' | 'mahkota_emas';

export type CatGlassesId =
  | 'none'
  | 'kacamata_bulat'
  | 'kacamata_hitam'
  | 'kacamata_hati';

export type CatScarfId =
  | 'default'
  | 'syal_polkadot'
  | 'syal_garis'
  | 'dasi_kupu';

export type CatAccessoryId =
  | Exclude<CatHatId, 'none'>
  | Exclude<CatGlassesId, 'none'>
  | Exclude<CatScarfId, 'default'>;

export interface GameSettings {
  muted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
  volume: number;
  hungerSpeed: HungerSpeed;
}

export interface BreedProfile {
  id: CatBreed;
  label: string;
  defaultName: string;
  personality: string;
  spriteSheet: string;
  babySpriteSheet: string;
  childSpriteSheet: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  earInnerColor: string;
  noseColor: string;
  eyeColor: string;
  scarfColor: string;
}

export const CAT_BREEDS: Record<CatBreed, BreedProfile> = {
  oren: {
    id: 'oren',
    label: 'Tabby Oranye',
    defaultName: 'Oren',
    personality: 'Lincah & doyan camilan',
    spriteSheet: '/assets/sprites/cat_oren.png',
    babySpriteSheet: '/assets/sprites/baby_oren.png',
    childSpriteSheet: '/assets/sprites/child_oren.png',
    primaryColor: '#E88B38',
    secondaryColor: '#FFF3E0',
    accentColor: '#B8591C',
    earInnerColor: '#F4A6A6',
    noseColor: '#E57A84',
    eyeColor: '#2B231E',
    scarfColor: '#B43832',
  },
  mochi: {
    id: 'mochi',
    label: 'Putih Krem',
    defaultName: 'Mochi',
    personality: 'Manja & suka dipeluk',
    spriteSheet: '/assets/sprites/cat_mochi.png',
    babySpriteSheet: '/assets/sprites/baby_mochi.png',
    childSpriteSheet: '/assets/sprites/child_mochi.png',
    primaryColor: '#F5ECE0',
    secondaryColor: '#FFFDF9',
    accentColor: '#D6C2AA',
    earInnerColor: '#F5B0B6',
    noseColor: '#EC828D',
    eyeColor: '#2B231E',
    scarfColor: '#3B7A57',
  },
  arang: {
    id: 'arang',
    label: 'Tuxedo Hitam',
    defaultName: 'Arang',
    personality: 'Cerdas & jago tangkap bola',
    spriteSheet: '/assets/sprites/cat_arang.png',
    babySpriteSheet: '/assets/sprites/baby_arang.png',
    childSpriteSheet: '/assets/sprites/child_arang.png',
    primaryColor: '#343942',
    secondaryColor: '#F7F7F5',
    accentColor: '#1F2329',
    earInnerColor: '#D9939B',
    noseColor: '#E58A94',
    eyeColor: '#2B231E',
    scarfColor: '#D99B26',
  },
  abu: {
    id: 'abu',
    label: 'Abu-Abu Silver',
    defaultName: 'Abu',
    personality: 'Tenang & penuh rasa ingin tahu',
    spriteSheet: '/assets/sprites/cat_abu.png',
    babySpriteSheet: '/assets/sprites/baby_abu.png',
    childSpriteSheet: '/assets/sprites/child_abu.png',
    primaryColor: '#98A4B3',
    secondaryColor: '#F2F4F7',
    accentColor: '#697686',
    earInnerColor: '#E4A1A8',
    noseColor: '#E2848E',
    eyeColor: '#2B231E',
    scarfColor: '#3C7A96',
  },
};

export interface ShopItem {
  id: 'salmon' | 'milk' | 'catnip';
  name: string;
  description: string;
  price: number;
  hungerDelta: number;
  happinessDelta: number;
  energyDelta: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'salmon',
    name: 'Salmon Panggang',
    description: '+45 Kenyang · +18 Bahagia',
    price: 15,
    hungerDelta: 45,
    happinessDelta: 18,
    energyDelta: 0,
  },
  {
    id: 'milk',
    name: 'Susu Hangat',
    description: '+25 Kenyang · +24 Energi',
    price: 12,
    hungerDelta: 25,
    happinessDelta: 8,
    energyDelta: 24,
  },
  {
    id: 'catnip',
    name: 'Biskuit Catnip',
    description: '+18 Kenyang · +34 Bahagia',
    price: 18,
    hungerDelta: 18,
    happinessDelta: 34,
    energyDelta: 0,
  },
];

export interface RoomBackgroundOption {
  id: RoomBackgroundId;
  name: string;
  description: string;
  price: number;
  src: string;
}

export const ROOM_BACKGROUNDS: RoomBackgroundOption[] = [
  {
    id: 'apartment',
    name: 'Apartemen Kota',
    description: 'Apartemen hangat dengan pemandangan kota dari jendela',
    price: 1,
    src: '/src/assets/images/apartment_room_backdrop_1795667705189.jpg',
  },
  {
    id: 'tatami',
    name: 'Kamar Tatami',
    description: 'Kamar Jepang hangat berlantai tatami menghadap taman bambu',
    price: 25,
    src: '/assets/aistudio/image_8ba7ea28.png',
  },
  {
    id: 'classic_home',
    name: 'Rumah Kayu Klasik',
    description: 'Ruang tamu sage hangat bawaan menghadap taman',
    price: 0,
    src: '/src/assets/images/cat_room_backdrop_1795664209999.jpg',
  },
];

export interface CatBedOption {
  id: CatBedId;
  name: string;
  description: string;
  price: number;
  imgSrc: string;
}

export const CAT_BEDS: CatBedOption[] = [
  {
    id: 'kasur_semangka',
    name: 'Kasur Semangka',
    description: 'Kasur buah semangka segar dengan daun hijau lucu',
    price: 18,
    imgSrc: '/assets/beds/bed_watermelon.png',
  },
  {
    id: 'keranjang_rajut',
    name: 'Keranjang Rajut',
    description: 'Keranjang anyaman hangat dengan selimut kotak merah',
    price: 24,
    imgSrc: '/assets/beds/bed_basket.png',
  },
  {
    id: 'kasur_donat',
    name: 'Kasur Donat',
    description: 'Kasur donat stroberi bertabur meses warna-warni',
    price: 30,
    imgSrc: '/assets/beds/bed_donut.png',
  },
  {
    id: 'tenda_kerajaan',
    name: 'Tenda Kerajaan',
    description: 'Tenda tidur biru malam berhias bulan sabit emas',
    price: 40,
    imgSrc: '/assets/beds/bed_tent.png',
  },
  {
    id: 'kasur_kucing',
    name: 'Kasur Kucing',
    description: 'Kasur kucing oranye bawaan dengan bantal merah empuk',
    price: 0,
    imgSrc: '/assets/beds/bed_cat.png',
  },
];

export interface CatToyOption {
  id: CatToyId;
  name: string;
  shortName: string;
  description: string;
  bonusText: string;
  price: number;
  energyDrainMult: number;
  hungerDrainMult: number;
  happinessRateMult: number;
  catchHappiness: number;
  catchCoins: number;
}

export const CAT_TOYS: CatToyOption[] = [
  {
    id: 'yarn_ball',
    name: 'Bola Benang',
    shortName: 'Bola',
    description: 'Bola benang klasik yang memantul seru di lantai.',
    bonusText: 'Seimbang · +14 Bahagia/tangkap',
    price: 0,
    energyDrainMult: 3.0,
    hungerDrainMult: 2.8,
    happinessRateMult: 1.0,
    catchHappiness: 14,
    catchCoins: 2,
  },
  {
    id: 'laser_pointer',
    name: 'Laser Pointer',
    shortName: 'Laser',
    description: 'Titik cahaya merah lincah yang mengikuti arah kursor.',
    bonusText: '+35% Bahagia · Lari cepat (+16 tangkap)',
    price: 22,
    energyDrainMult: 3.4,
    hungerDrainMult: 2.9,
    happinessRateMult: 1.35,
    catchHappiness: 16,
    catchCoins: 2,
  },
  {
    id: 'feather_wand',
    name: 'Tongkat Bulu',
    shortName: 'Bulu',
    description: 'Tongkat bulu melayang dengan lompatan akrobatik.',
    bonusText: 'Hemat Energi 35% · +18 Bahagia/tangkap',
    price: 28,
    energyDrainMult: 1.95,
    hungerDrainMult: 2.2,
    happinessRateMult: 1.3,
    catchHappiness: 18,
    catchCoins: 2,
  },
  {
    id: 'toy_mouse',
    name: 'Tikus Mainan',
    shortName: 'Tikus',
    description: 'Tikus putar otomatis yang berlari sendiri di ruangan.',
    bonusText: 'Paling Hemat Energi · +3 Koin/tangkap',
    price: 35,
    energyDrainMult: 1.65,
    hungerDrainMult: 1.8,
    happinessRateMult: 1.15,
    catchHappiness: 15,
    catchCoins: 3,
  },
];

export interface CatAccessoryOption {
  id: CatAccessoryId;
  slot: CatAccessorySlot;
  name: string;
  description: string;
  price: number;
}

export const CAT_ACCESSORIES: CatAccessoryOption[] = [
  {
    id: 'beret_merah',
    slot: 'hat',
    name: 'Baret Pelukis',
    description: 'Topi baret merah mungil yang anggun di kepala.',
    price: 12,
  },
  {
    id: 'topi_pesta',
    slot: 'hat',
    name: 'Topi Pesta Bintang',
    description: 'Topi kerucut ceria bermotif bintang & pompom.',
    price: 15,
  },
  {
    id: 'mahkota_emas',
    slot: 'hat',
    name: 'Mahkota Raja',
    description: 'Mahkota emas mini bertatahkan permata berkilau.',
    price: 28,
  },
  {
    id: 'kacamata_bulat',
    slot: 'glasses',
    name: 'Kacamata Pintar',
    description: 'Bingkai bulat klasik untuk tampilan kutu buku.',
    price: 12,
  },
  {
    id: 'kacamata_hitam',
    slot: 'glasses',
    name: 'Kacamata Keren',
    description: 'Kacamata hitam santai bergaya kucing selebriti.',
    price: 16,
  },
  {
    id: 'kacamata_hati',
    slot: 'glasses',
    name: 'Kacamata Hati',
    description: 'Kacamata bingkai hati merah muda yang menggemaskan.',
    price: 20,
  },
];

export interface CatHudSnapshot {
  name: string;
  breed: CatBreed;
  behavior: CatBehavior;
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  health: number;
  isHungry: boolean;
  isSick: boolean;
  isRecovering: boolean;
  affectionXp: number;
  xpToNext: number;
  level: number;
  coins: number;
  day: number;
  gameHours: number;
  gameHour: number;
  dayPhase: DayPhase;
  isDusk: boolean;
  timeOfDay: number;
  weather: WeatherType;
  lifeStage: LifeStage;
  stageElapsedSec: number;
  stageDurationSec: number;
  careMistakes: number;
  adultBranch: AdultEvolutionBranch;
  miniGameUnlocked: boolean;
  deathReason: DeathReason;
  personality: CatPersonality;
  bowlAmount: number;
  freeFeedCooldownSec: number;
  totalCatches: number;
  totalPets: number;
  activeBackground: RoomBackgroundId;
  unlockedBackgrounds: RoomBackgroundId[];
  activeBed: CatBedId;
  unlockedBeds: CatBedId[];
  activeToy: CatToyId;
  unlockedToys: CatToyId[];
  equippedHat: CatHatId;
  equippedGlasses: CatGlassesId;
  equippedScarf: CatScarfId;
  unlockedAccessories: CatAccessoryId[];
  inventory: ConsumableInventory;
  sleepMode: SleepMode;
  sleepRemainingSec: number;
  sleepDurationSec: number;
  drowsyStage: DrowsyStage;
  cooldownsSec: ActionCooldownsSec;
  moodLabel: string;
  warningText: string | null;
}

export type DevTimeScale = 1 | 5 | 20 | 60;

export interface DevStatePatch {
  hunger?: number;
  happiness?: number;
  cleanliness?: number;
  energy?: number;
  health?: number;
  isSick?: boolean;
  sickReason?: 'health' | 'dirty_zero' | 'chronic_dirty' | 'overwork' | null;
  coins?: number;
  level?: number;
  affectionXp?: number;
  day?: number;
  gameHour?: number;
  weather?: WeatherType;
  lifeStage?: LifeStage;
  stageProgressPct?: number;
  adultBranch?: AdultEvolutionBranch;
  careMistakes?: number;
  breed?: CatBreed;
  personality?: CatPersonality;
  bowlAmount?: number;
  inventory?: Partial<ConsumableInventory>;
}

export type DevQuickAction =
  | 'reset_cooldowns'
  | 'unlock_all_shop'
  | 'fill_inventory'
  | 'advance_time_10m'
  | 'advance_time_1h'
  | 'advance_time_6h'
  | 'evolve_next'
  | 'trigger_auto_sleep'
  | 'wake_up_free'
  | 'trigger_lightning'
  | 'heal_instant'
  | 'force_game_over_sick'
  | 'force_game_over_old';

export interface SaveData {
  name: string;
  breed: CatBreed;
  personality?: CatPersonality;
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  health?: number;
  isSick?: boolean;
  isRecovering?: boolean;
  affectionXp: number;
  level: number;
  coins: number;
  day: number;
  gameHour?: number;
  timeOfDay: number;
  weather?: WeatherType;
  lifeStage?: LifeStage;
  stageElapsedSec?: number;
  careMistakes?: number;
  adultBranch?: AdultEvolutionBranch;
  totalCatches: number;
  totalPets: number;
  activeBackground?: RoomBackgroundId;
  unlockedBackgrounds?: RoomBackgroundId[];
  activeBed?: CatBedId;
  unlockedBeds?: CatBedId[];
  activeToy?: CatToyId;
  unlockedToys?: CatToyId[];
  equippedHat?: CatHatId;
  equippedGlasses?: CatGlassesId;
  equippedScarf?: CatScarfId;
  unlockedAccessories?: CatAccessoryId[];
  inventory?: Partial<ConsumableInventory>;
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
  zeroEnergyElapsedSec?: number;
  cooldownsUntil?: {
    snack?: number;
    basicSoap?: number;
    miniGame?: number;
    interactivePlay?: number;
    petShort?: number;
    petFull?: number;
    sleepManual?: number;
  };
  bedNx?: number;
  bedNy?: number;
  lastFreeFeedAt?: number;
  lowCleanlinessStrikes?: number;
  wasUnder25Clean?: boolean;
  lastSavedTime?: number;
  savedAt: number;
}

export const SAVE_STORAGE_KEY = 'rumah_kucing_save_v1';
export const SETTINGS_STORAGE_KEY = 'rumah_kucing_settings_v1';
export const ROOM_BACKDROP_SRC = '/src/assets/images/cat_room_backdrop_1795664209999.jpg';
