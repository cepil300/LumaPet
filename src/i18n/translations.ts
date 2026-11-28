import {
  AdultEvolutionBranch,
  AppLanguage,
  BathItemId,
  CatAccessoryId,
  CatBathtubId,
  CatBedId,
  CatBreed,
  CatPersonality,
  CatToyId,
  FoodItemId,
  LifeStage,
  ManualSleepMode,
  RoomBackgroundId,
} from '../types/game';

export interface LanguageOption {
  id: AppLanguage;
  name: string;
  shortCode: string;
  flag: string;
  bcp47: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'id', name: 'Indonesia', shortCode: 'ID', flag: '🇮🇩', bcp47: 'id-ID' },
  { id: 'en', name: 'English', shortCode: 'EN', flag: '🇬🇧', bcp47: 'en-US' },
  { id: 'th', name: 'ไทย', shortCode: 'TH', flag: '🇹🇭', bcp47: 'th-TH' },
  { id: 'vi', name: 'Tiếng Việt', shortCode: 'VI', flag: '🇻🇳', bcp47: 'vi-VN' },
  { id: 'ms', name: 'Malaysia', shortCode: 'MS', flag: '🇲🇾', bcp47: 'ms-MY' },
];

export const VALID_LANGUAGES: ReadonlySet<AppLanguage> = new Set([
  'id',
  'en',
  'th',
  'vi',
  'ms',
]);

export function normalizeLanguage(raw: unknown): AppLanguage {
  if (typeof raw === 'string' && VALID_LANGUAGES.has(raw as AppLanguage)) {
    return raw as AppLanguage;
  }
  return 'id';
}

export interface TranslationCatalogEntry {
  name: string;
  shortName?: string;
  description: string;
}

export interface Translations {
  languageTitle: string;
  common: {
    back: string;
    done: string;
    close: string;
    yes: string;
    no: string;
    active: string;
    off: string;
    unsupported: string;
    enable: string;
    enabled: string;
    blocked: string;
    allow: string;
    coins: string;
    day: string;
    days: string;
    hourShort: string;
    minuteShort: string;
    secShort: string;
    use: string;
    usedEquipped: string;
    buy: string;
    buyInShop: string;
    giveFree: string;
    useFree: string;
    equip: string;
    unequip: string;
    unequipAll: string;
    all: string;
  };
  app: {
    docTitle: string;
    closedTitle: string;
    closedDesc: string;
    reopen: string;
    portraitTitle: string;
    portraitDesc: string;
    splashAria: string;
    cloudErrors: {
      popupBlocked: string;
      quota: string;
      generic: string;
    };
    lowHungerNotifTitle: string;
    lowHungerNotifBody: string;
  };
  title: {
    backdropAlt: string;
    subtitle: string;
    newGame: string;
    continue: string;
    noSaveYet: string;
    loadingCloud: string;
    settings: string;
    quit: string;
    quitConfirmTitle: string;
    quitConfirmBody: string;
    adoptTitle: string;
    catNameLabel: string;
    startPlaying: string;
    soundToggleOn: string;
    soundToggleOff: string;
    soundAlt: string;
    googleAccount: string;
    linkGoogle: string;
    linkGoogleHint: string;
    linkGoogleTooltip: string;
    manageCloudTooltip: string;
    connecting: string;
    cloudSyncing: string;
    cloudError: string;
    cloudConnected: string;
    cloudSaveReady: (name: string, day: number) => string;
    cloudAutoReady: string;
    reloadCloud: string;
    unlinkGoogle: string;
    closeAccountMenu: string;
    closeMessage: string;
  };
  settings: {
    title: string;
    subtitle: string;
    languageLabel: string;
    languageDesc: string;
    volumeTitle: string;
    volumeDesc: string;
    volumeAria: string;
    sfxTitle: string;
    sfxDesc: string;
    musicTitle: string;
    musicDesc: string;
    notifTitle: string;
    notifDesc: string;
    fullscreenTitle: string;
    fullscreenDesc: string;
    clearSave: string;
  };
  pause: {
    pausedTitle: string;
    settingsTitle: string;
    diedTitle: (name: string) => string;
    diedOldAge: (name: string, day: number) => string;
    diedSickness: (name: string) => string;
    careDuration: string;
    bond: string;
    ballCatches: string;
    savingCloud: string;
    savingAuto: string;
    cloudSaveActive: string;
    autoSaveActive: string;
    resume: string;
    quitGame: string;
    playAgain: string;
    mainMenu: string;
  };
  hud: {
    statusPanelLabel: string;
    profileCardLabel: string;
    hunger: string;
    happiness: string;
    cleanliness: string;
    energy: string;
    health: string;
    tags: {
      critical: string;
      cranky: string;
      stressed: string;
      sulking: string;
      dirty: string;
      exhausted: string;
      drowsyHeavy: string;
      drowsyLight: string;
      recoveringLethargic: (hp: number) => string;
      recovering: (hp: number) => string;
      sick: (hp: number) => string;
    };
    dayPhases: {
      pagi: string;
      siang: string;
      senja: string;
      malam: string;
    };
    rain: string;
    dayFormat: (day: number, extraHours: string, clock: string, weatherLabel: string) => string;
    phaseTooltip: {
      pagi: string;
      siang: (label: string) => string;
      malam: string;
      rainExtra: string;
    };
    viewLifeStageTooltip: string;
    pauseLabel: string;
    pauseTooltip: string;
    actionMenus: {
      food: string;
      pickFood: string;
      bath: string;
      pickBath: string;
      play: string;
      pickPlay: string;
      pet: string;
      pickPet: string;
      sleep: string;
      pickSleep: string;
      closeAria: string;
    };
    changeFoodTooltip: string;
    changeBathTooltip: string;
    changePlayTooltip: string;
    changePetTooltip: string;
    changeSleepTooltip: string;
    manualBrush: string;
    manualBrushDesc: string;
    brushDisable: string;
    brushUse: string;
    bathingShort: string;
    sleepingShort: string;
    cleanFull: (stock?: number) => string;
    hungerFull: (stock: number) => string;
    useWithStock: (stock: number) => string;
    toyPlayItem: (toyShort: string) => string;
    playDeltaLine: (happy: number, energy: number) => string;
    miniGamePond: string;
    miniGameLockedStage: string;
    sickShort: string;
    hungryShort: string;
    playBtn: string;
    startBtn: string;
    petShort: string;
    petShortDesc: (happy: number) => string;
    petFull: string;
    petFullDesc: (happy: number, hunger: number) => string;
    petShortBtn: string;
    petFullBtn: string;
    autoSleep: string;
    powerNap: string;
    fullRest: string;
    wakeUpPenalty: string;
    briefNap: string;
    briefNapDesc: string;
    freshGuard: string;
    energyAbove70: string;
    energy100: string;
    dock: {
      foodAria: string;
      foodTitle: string;
      bathLockedSleep: string;
      bathBathing: string;
      bathAria: string;
      bathTitle: string;
      playLockedSleep: string;
      playDisabledAria: string;
      playDisabledTitle: string;
      playAria: (toyName: string) => string;
      playTitle: string;
      petAria: string;
      petTitle: string;
      sleepAria: string;
      sleepTitle: string;
      medRecoveringAria: string;
      medHealthyAria: string;
      medAria: string;
      medRecoveringSickTitle: string;
      medRecoveringTitle: string;
      medHealthyTitle: string;
      medSickTitle: string;
      shopLabel: string;
    };
  };
  shop: {
    title: string;
    closeAria: string;
    tabs: {
      makanan: string;
      mandi: string;
      mainan: string;
      kostum: string;
      rumah: string;
      kasur: string;
    };
    sleepingNotice: string;
    bathingNotice: string;
    bathFilters: {
      all: string;
      tub: string;
      consumable: string;
    };
    bathTip: string;
    bedTip: string;
    bathConsumablesHeading: string;
    bathingBtn: string;
    sleepingBtn: string;
    costumeFilters: {
      all: string;
      hat: string;
      glasses: string;
    };
    slotLabels: {
      hat: string;
      glasses: string;
      scarf: string;
    };
  };
  minigame: {
    title: string;
    closeAria: string;
    prompt: (name: string) => string;
    rainBonusHint: string;
    scoreLabel: (score: number) => string;
    finishedTitle: (score: number) => string;
    rewardSummary: (coins: number, happy: number, rainExtra: boolean, cleanCost: number) => string;
    claimBtn: string;
  };
  lifestage: {
    title: string;
    phaseTitle: (name: string, stageLabel: string) => string;
    durationPrefix: (calendar: string, duration: string) => string;
    seniorAgeLabel: string;
    toNextStage: string;
    remainingBaby: (mins: number, hours: number) => string;
    remainingDaysHours: (days: number, hrs: number) => string;
    remainingHours: (hrs: number) => string;
    mistakesLabel: (count: number) => string;
    nowBadge: string;
    branchGuideTitle: string;
  };
  catalog: {
    breeds: Record<CatBreed, { label: string; personality: string }>;
    personalities: Record<CatPersonality, string>;
    foodItems: Record<FoodItemId, { name: string; shortName: string; description: string }>;
    bathItems: Record<BathItemId, { name: string; shortName: string; description: string }>;
    sleepOptions: Record<ManualSleepMode, { name: string; shortName: string; description: string }>;
    lifeStages: Record<
      LifeStage,
      { label: string; shortLabel: string; realDurationLabel: string; calendarLabel: string; decayNote: string }
    >;
    adultBranches: Record<
      AdultEvolutionBranch,
      { label: string; description: string; maxMistakesLabel: string }
    >;
    backgrounds: Record<RoomBackgroundId, TranslationCatalogEntry>;
    beds: Record<CatBedId, TranslationCatalogEntry>;
    bathtubs: Record<CatBathtubId, TranslationCatalogEntry>;
    toys: Record<CatToyId, { name: string; shortName: string; bonusText: string }>;
    accessories: Record<CatAccessoryId, { name: string }>;
  };
  stage: {
    moods: {
      calm: string;
      recoverBed: string;
      recoverSick: string;
      almostRecovered: string;
      sick: string;
      held: string;
      bathing: string;
      autoSleep: string;
      powerNap: string;
      deepSleep: string;
      dozing: string;
      eating: string;
      playingToy: (toyName: string) => string;
      rolling: string;
      purring: string;
      stretching: string;
      starving: string;
      hungryCranky: string;
      sulking: string;
      needsCleaning: string;
      veryDrowsy: string;
      gettingDrowsy: string;
      veryHappy: string;
    };
    warnings: {
      recovering: (name: string, health: number, sleeping: boolean) => string;
      sickOverwork: (name: string) => string;
      sickDirtyZero: (name: string) => string;
      sickChronicDirty: (name: string) => string;
      sickGeneric: (name: string, health: number) => string;
      autoSleep: (name: string, timer: string) => string;
      starving: (name: string) => string;
      veryHungry: (name: string) => string;
      veryDrowsy: (name: string, energy: number) => string;
      lateNightDrowsy: (name: string) => string;
      hungryCranky: (name: string) => string;
      veryDirty: (name: string) => string;
      gettingDirty: (name: string) => string;
      drowsyLight: (name: string, energy: number, tags: string) => string;
      sulking: (name: string) => string;
    };
    toasts: {
      bondLevelUp: (level: number) => string;
      coinGain: (coins: number) => string;
      evolutionExtra: (stageLabel: string, extra: string) => string;
      evolution: (stageLabel: string) => string;
      miniGameUnlocked: string;
      snackCooldown: (timer: string) => string;
      hungerFull: string;
      foodInBowlSleeping: (itemShort: string) => string;
      fedSuccess: (itemShort: string, hunger: number, happy: number) => string;
      bathCompleteSpa: (happy: number) => string;
      bathComplete: (clean: number, happy: number) => string;
      bathLockedSleep: string;
      bathAlreadyInProgress: (name: string) => string;
      cleanFull: string;
      soapCooldown: (timer: string) => string;
      bathImmediate: (itemShort: string) => string;
      bathWalking: (itemShort: string) => string;
      sleepingZzz: string;
      waitBathing: string;
      petCooldown: (isFull: boolean, timer: string) => string;
      petSuccess: (happy: number, isSulking: boolean, hungerDelta: number, isRain: boolean) => string;
      alreadySleeping: string;
      energyFull: string;
      tooFreshToSleep: string;
      onlyBriefNapAllowed: string;
      briefDayNapStart: (energy: number) => string;
      sleepStart: (shortName: string, mins: number, bonusText: string, desc: string) => string;
      sleepBonusMorning: string;
      sleepBonusNight: string;
      sleepBonusRain: string;
      sleepBonusLateNight: string;
      sleepInterrupted: string;
      miniGameNeedChild: string;
      playLockedSleep: string;
      miniGameNeedHeal: string;
      miniGameLowEnergy: string;
      tooHungry: string;
      miniGameCooldown: (timer: string) => string;
      bathingNow: string;
      playSickBlocked: string;
      playLowEnergyBlocked: string;
      playCooldown: (timer: string) => string;
      playLateNightNotice: (cost: string, happyFull: boolean) => string;
      playHappyFullDrowsy: (cost: string) => string;
      playHappyFull: string;
      playSulking: (happy: number, drowsyPenalty: boolean) => string;
      playDrowsyPenalty: (cost: string, midday: boolean) => string;
      playWeakened: (happy: number) => string;
      playMiddayBonus: (happy: number) => string;
      medAlreadyGiven: string;
      medNotNeeded: (name: string) => string;
      medGiven: string;
      miniGameSummaryFull: (e: number, hun: number, cln: number) => string;
      miniGameSummaryReduced: (happy: number, e: number, cln: number) => string;
      miniGameSummaryNormal: (happy: number, tags: string, e: number, hun: number, cln: number) => string;
      newBackground: (name: string) => string;
      newBed: (name: string) => string;
      newBathtub: (name: string) => string;
      newToy: (name: string) => string;
      newCostume: (name: string) => string;
      awaySummary: (hungerLost: number, healthLost: number) => string;
      phaseBannerPagi: string;
      phaseBannerSiang: string;
      phaseBannerMalam: string;
      rainStart: (phaseLabel: string) => string;
      rainStop: (phaseLabel: string) => string;
      newDayCoins: (day: number) => string;
      overworkSick: string;
      sleepCompleteAuto: (energy: number) => string;
      sleepCompletePower: (energy: number, happy: number) => string;
      sleepCompleteFull: (energy: number, happy: number) => string;
      drowsyNoticeNight: string;
      drowsyNoticeRain: string;
      drowsyNoticeNormal: string;
      drowsyHeavyLateNight: string;
      drowsyHeavyNormal: string;
      autoSleepStart: (energy: number) => string;
      sickCleared90: string;
      recovered100: (name: string) => string;
      becameSickHealth: (health: number, name: string) => string;
      becameSickDirtyZero: string;
      becameSickChronicDirty: string;
      playSessionComplete: (happy: number, energy: number, hunger: number) => string;
      brushLockedSleep: string;
      brushHint: string;
      brushFullWangi: string;
      brushGain: (pts: number) => string;
      lateNightNoZoom: string;
      playMiddayTag: string;
      rainTag: string;
    };
  };
}

const ID_TRANSLATIONS: Translations = {
  languageTitle: 'Bahasa',
  common: {
    back: 'Kembali',
    done: 'Selesai',
    close: 'Tutup',
    yes: 'Ya',
    no: 'Tidak',
    active: 'Aktif',
    off: 'Mati',
    unsupported: 'Tidak Didukung',
    enable: 'Aktifkan',
    enabled: 'Aktif',
    blocked: 'Diblokir',
    allow: 'Izinkan',
    coins: 'Koin',
    day: 'Hari',
    days: 'Hari',
    hourShort: 'j',
    minuteShort: 'mnt',
    secShort: 'd',
    use: 'Pakai',
    usedEquipped: 'Dipakai',
    buy: 'Beli',
    buyInShop: 'Beli di Toko',
    giveFree: 'Beri Gratis',
    useFree: 'Pakai Gratis',
    equip: 'Pasang',
    unequip: 'Lepas',
    unequipAll: 'Lepas Semua',
    all: 'Semua',
  },
  app: {
    docTitle: 'Rumah Kucing — Game Pelihara Kucing Virtual',
    closedTitle: 'Aplikasi Telah Ditutup',
    closedDesc: 'Terima kasih sudah bermain LumaPet. Kamu dapat menutup halaman ini.',
    reopen: 'Buka Kembali',
    portraitTitle: 'Mode Lanskap Diperlukan',
    portraitDesc: 'Putar perangkat Anda ke posisi miring (Landscape) untuk memainkan LumaPet.',
    splashAria: 'Pembukaan LumaPet',
    cloudErrors: {
      popupBlocked: 'Popup login Google diblokir browser. Izinkan popup lalu coba lagi.',
      quota: 'Kuota harian layanan Cloud Save telah tercapai dan akan direset besok.',
      generic: 'Gagal menyinkronkan Cloud Save. Periksa koneksi internetmu.',
    },
    lowHungerNotifTitle: 'Rumah Kucing',
    lowHungerNotifBody:
      'Meow! Tingkat kenyang kucingmu tinggal di bawah 40%. Segera beri makan sebelum dia sakit!',
  },
  title: {
    backdropAlt: 'Latar kamar tatami Rumah Kucing',
    subtitle: 'Rawat, elus, dan main bersama sahabat berbulu',
    newGame: 'Mulai Baru',
    continue: 'Lanjutkan',
    noSaveYet: 'Belum ada simpanan',
    loadingCloud: 'Memuat dari Cloud...',
    settings: 'Pengaturan',
    quit: 'Keluar',
    quitConfirmTitle: 'Apakah Anda yakin?',
    quitConfirmBody: 'Apakah Anda yakin ingin keluar dari permainan?',
    adoptTitle: 'Pilih Kucing untuk Diadopsi',
    catNameLabel: 'Nama Panggilan Kucing',
    startPlaying: 'Mulai Bermain',
    soundToggleOn: 'Nyalakan suara',
    soundToggleOff: 'Matikan suara',
    soundAlt: 'Suara',
    googleAccount: 'Akun Google',
    linkGoogle: 'Kaitkan Akun Google',
    linkGoogleHint: 'Cloud Save Otomatis',
    linkGoogleTooltip: 'Kaitkan akun Google untuk menyimpan dan memuat progres dari cloud',
    manageCloudTooltip: 'Kelola tautan akun Google & Cloud Save',
    connecting: 'Menghubungkan...',
    cloudSyncing: 'Sinkron Cloud...',
    cloudError: 'Gagal Sinkron',
    cloudConnected: 'Cloud Terhubung',
    cloudSaveReady: (name, day) => `Cloud Save siap: ${name} (Hari ke-${day})`,
    cloudAutoReady: 'Terhubung · Progres baru akan otomatis tersimpan ke cloud',
    reloadCloud: 'Muat Ulang dari Cloud',
    unlinkGoogle: 'Putuskan Akun Google',
    closeAccountMenu: 'Tutup info akun',
    closeMessage: 'Tutup pesan',
  },
  settings: {
    title: 'Pengaturan',
    subtitle: 'Sesuaikan suara, bahasa & notifikasi',
    languageLabel: 'Bahasa',
    languageDesc: 'Pilih bahasa tampilan game',
    volumeTitle: 'Volume Suara',
    volumeDesc: 'Atur persentase besar kecil suara game',
    volumeAria: 'Persentase volume suara',
    sfxTitle: 'Efek Suara (SFX)',
    sfxDesc: 'Meong, dengkuran & mainan',
    musicTitle: 'Musik Latar',
    musicDesc: 'Musik menu & dalam game',
    notifTitle: 'Notifikasi Makan',
    notifDesc: 'Ingatkan saat kenyang di bawah 40%',
    fullscreenTitle: 'Layar Penuh (Fullscreen)',
    fullscreenDesc: 'Sembunyikan status bar & navigasi perangkat',
    clearSave: 'Hapus Data Simpanan',
  },
  pause: {
    pausedTitle: 'Menu Jeda',
    settingsTitle: 'Pengaturan',
    diedTitle: (name) => `${name} Berpulang`,
    diedOldAge: (name, day) =>
      `${name} telah menua dengan penuh kasih dan berpulang dengan tenang setelah menemanimu hingga Hari ke-${day}.`,
    diedSickness: (name) =>
      `Arwah ${name} terbang tenang ke negeri awan karena sakitnya tidak sempat diobati.`,
    careDuration: 'Lama Merawat',
    bond: 'Ikatan',
    ballCatches: 'Tangkapan Bola',
    savingCloud: 'Menyimpan ke Cloud...',
    savingAuto: 'Menyimpan progres otomatis...',
    cloudSaveActive: 'Cloud Save Aktif · Tersimpan otomatis',
    autoSaveActive: 'Auto-Save Aktif · Tersimpan otomatis',
    resume: 'Lanjutkan',
    quitGame: 'Keluar Game',
    playAgain: 'Main Lagi',
    mainMenu: 'Menu Utama',
  },
  hud: {
    statusPanelLabel: 'Panel Status',
    profileCardLabel: 'Profil Kucing',
    hunger: 'Kenyang',
    happiness: 'Bahagia',
    cleanliness: 'Bersih',
    energy: 'Energi',
    health: 'Kesehatan',
    tags: {
      critical: 'Kritis!',
      cranky: 'Rewel!',
      stressed: 'Stres!',
      sulking: 'Ngambek',
      dirty: 'Kotor',
      exhausted: 'Kelelahan!',
      drowsyHeavy: 'Ngantuk Berat',
      drowsyLight: 'Ngantuk',
      recoveringLethargic: (hp) => `Pulih · Lemas (${hp}%)`,
      recovering: (hp) => `Pulih (${hp}%)`,
      sick: (hp) => `Sakit! (${hp}%)`,
    },
    dayPhases: {
      pagi: 'Pagi',
      siang: 'Siang',
      senja: 'Senja',
      malam: 'Malam',
    },
    rain: 'Hujan',
    dayFormat: (day, extraHours, clock, weatherLabel) =>
      `Hari ${day}${extraHours} · ${clock} ${weatherLabel}`,
    phaseTooltip: {
      pagi: 'Pagi (06:00–11:59) · Bonus tidur +10% Energi',
      siang: (label) => `${label} (12:00–17:59) · Main +10% Bahagia · Kenyang/Energi 1,1x`,
      malam: 'Malam (18:00–05:59) · Tidur +20% Energi · Energi 1,25x',
      rainExtra: ' | Hujan: Energi 1,15x · Tidur +10% · Ngantuk ≤45 · Di rumah Bahagia 0,9x',
    },
    viewLifeStageTooltip: 'Lihat Tahap Pertumbuhan & Evolusi',
    pauseLabel: 'Menu Jeda',
    pauseTooltip: 'Menu Jeda (Esc)',
    actionMenus: {
      food: 'Makanan',
      pickFood: 'Pilih Makanan',
      bath: 'Mandi',
      pickBath: 'Pilih Mandi',
      play: 'Bermain',
      pickPlay: 'Pilih Bermain',
      pet: 'Elus-elus',
      pickPet: 'Pilih Elus',
      sleep: 'Tidur',
      pickSleep: 'Pilih Tidur',
      closeAria: 'Tutup menu aksi',
    },
    changeFoodTooltip: 'Klik untuk ganti pilihan makanan',
    changeBathTooltip: 'Klik untuk ganti pilihan mandi',
    changePlayTooltip: 'Klik untuk ganti aktivitas bermain',
    changePetTooltip: 'Klik untuk ganti jenis elus',
    changeSleepTooltip: 'Klik untuk ganti pilihan tidur',
    manualBrush: 'Sikat Manual',
    manualBrushDesc: '+10 Bersih per gosokan',
    brushDisable: 'Matikan',
    brushUse: 'Pakai Sikat',
    bathingShort: 'Mandi...',
    sleepingShort: 'Tidur',
    cleanFull: (stock) => (stock !== undefined ? `Bersih 100 (${stock})` : 'Bersih 100'),
    hungerFull: (stock) => `Kenyang 100 (${stock})`,
    useWithStock: (stock) => `Pakai (${stock})`,
    toyPlayItem: (toyShort) => `Mainan (${toyShort})`,
    playDeltaLine: (happy, energy) => `+${happy} Bahagia · ${energy} Energi`,
    miniGamePond: 'Mini Game Kolam',
    miniGameLockedStage: 'Fase Anak+',
    sickShort: 'Sakit',
    hungryShort: 'Lapar',
    playBtn: 'Main',
    startBtn: 'Mulai',
    petShort: 'Elus Singkat',
    petShortDesc: (happy) => `+${happy} Bahagia`,
    petFull: 'Elus Penuh',
    petFullDesc: (happy, hunger) => `+${happy} Bahagia · ${hunger} Kenyang`,
    petShortBtn: 'Elus',
    petFullBtn: 'Kasih Sayang',
    autoSleep: 'Auto-Sleep',
    powerNap: 'Power Nap',
    fullRest: 'Tidur Penuh',
    wakeUpPenalty: 'Bangunkan (-10 Bahagia)',
    briefNap: 'Tidur Sebentar',
    briefNapDesc: '+20 Energi · 1,5 mnt',
    freshGuard: 'Segar (>85)',
    energyAbove70: 'Energi >70',
    energy100: 'Energi 100',
    dock: {
      foodAria: 'Menu Makanan',
      foodTitle: 'Makan (Camilan Gratis / Makanan Shop)',
      bathLockedSleep: 'Mandi dikunci saat kucing sedang tidur',
      bathBathing: 'Kucing sedang mandi di bak!',
      bathAria: 'Menu Mandi & Kebersihan',
      bathTitle: 'Mandi (Sabun Gratis / Shampo / Spa)',
      playLockedSleep: 'Bermain dikunci saat kucing sedang tidur',
      playDisabledAria: 'Tidak bisa bermain saat sakit atau Energi < 20',
      playDisabledTitle: 'Tidak bisa bermain (Sakit atau Energi < 20)',
      playAria: (toyName) => `Menu Bermain (${toyName})`,
      playTitle: 'Bermain (Mainan Interaktif / Mini Game)',
      petAria: 'Menu Elus-elus',
      petTitle: 'Elus-elus (+15 / +25 Bahagia · +0 Energi)',
      sleepAria: 'Menu Tidur & Istirahat',
      sleepTitle: 'Tidur & Istirahat (Power Nap / Tidur Penuh)',
      medRecoveringAria: 'Kucing sedang pulih dari obat',
      medHealthyAria: 'Obat hanya bisa diberikan saat kucing sakit',
      medAria: 'Beri Obat',
      medRecoveringSickTitle: 'Kucing sedang pemulihan (efek sakit hilang di 90%)',
      medRecoveringTitle: 'Kucing sedang pemulihan menuju 100%',
      medHealthyTitle: 'Obat hanya bisa diberikan saat kucing sakit',
      medSickTitle: 'Beri Obat (Kucing sedang sakit!)',
      shopLabel: 'Toko',
    },
  },
  shop: {
    title: 'Toko',
    closeAria: 'Tutup toko',
    tabs: {
      makanan: 'Makanan',
      mandi: 'Mandi',
      mainan: 'Mainan',
      kostum: 'Kostum',
      rumah: 'Rumah',
      kasur: 'Kasur',
    },
    sleepingNotice: 'Kucing sedang tidur — mandi dikunci sampai bangun.',
    bathingNotice: 'Kucing sedang mandi di dalam bak mandi!',
    bathFilters: {
      all: 'Semua',
      tub: 'Bak Mandi',
      consumable: 'Sabun & Spa',
    },
    bathTip: 'Tip: Seret bak mandi di lantai untuk memindahkan posisinya.',
    bedTip: 'Tip: Seret kasur di lantai untuk memindahkan posisinya.',
    bathConsumablesHeading: 'Sabun & Perawatan Mandi',
    bathingBtn: 'Sedang Mandi',
    sleepingBtn: 'Sedang Tidur',
    costumeFilters: {
      all: 'Semua',
      hat: 'Topi',
      glasses: 'Kacamata',
    },
    slotLabels: {
      hat: 'Topi Mini',
      glasses: 'Kacamata',
      scarf: 'Syal',
    },
  },
  minigame: {
    title: 'Mini-Game Tangkap Ikan',
    closeAria: 'Tutup Mini-Game',
    prompt: (name) => `Bantu ${name} tangkap ikan di kolam!`,
    rainBonusHint: '(Hujan: +5 Bahagia · -2 Bersih)',
    scoreLabel: (score) => `Skor: ${score}`,
    finishedTitle: (score) => `Selesai! Skor ${score} Poin`,
    rewardSummary: (coins, happy, rainExtra, cleanCost) =>
      `Hadiah: +${coins} Koin · +${happy} Bahagia${rainExtra ? ' (Hujan +5)' : ''} · -10 Energi · -5 Kenyang · -${cleanCost} Bersih · +12 XP Ikatan`,
    claimBtn: 'Ambil Hadiah',
  },
  lifestage: {
    title: 'Tahap Pertumbuhan',
    phaseTitle: (name, stageLabel) => `${name} · Fase ${stageLabel}`,
    durationPrefix: (calendar, duration) => `${calendar} · Durasi ${duration}`,
    seniorAgeLabel: 'Usia Senior (H.12–18)',
    toNextStage: 'Menuju Fase Berikutnya',
    remainingBaby: (mins, hours) => `Sisa ${mins}m · Jam ${hours}/73`,
    remainingDaysHours: (days, hrs) => `Sisa ${days}h ${hrs}j`,
    remainingHours: (hrs) => `Sisa ${hrs}j`,
    mistakesLabel: (count) => `Mistake: ${count}x`,
    nowBadge: 'Sekarang',
    branchGuideTitle:
      'Percabangan Evolusi Dewasa (berdasarkan Care Mistakes di fase Anak & Remaja)',
  },
  catalog: {
    breeds: {
      oren: { label: 'Tabby Oranye', personality: 'Lincah & doyan camilan' },
      mochi: { label: 'Putih Krem', personality: 'Manja & suka dipeluk' },
      arang: { label: 'Tuxedo Hitam', personality: 'Cerdas & jago tangkap bola' },
      abu: { label: 'Abu-Abu Silver', personality: 'Tenang & penuh rasa ingin tahu' },
    },
    personalities: {
      playful: 'Lincah',
      lazy: 'Santai',
      shy: 'Pemalu',
    },
    foodItems: {
      snack: {
        name: 'Camilan Ringan / Snack',
        shortName: 'Camilan Ringan',
        description: '+15 Kenyang · +10 Bahagia',
      },
      main_food: {
        name: 'Makanan Utama / Standar',
        shortName: 'Makanan Utama',
        description: '+30 Kenyang · +5 Bahagia',
      },
      special_food: {
        name: 'Makanan Spesial / Porsi Besar',
        shortName: 'Makanan Spesial',
        description: '+50 Kenyang · +15 Bahagia',
      },
    },
    bathItems: {
      basic_soap: {
        name: 'Sabun Dasar / Lap Basah',
        shortName: 'Sabun Dasar',
        description: '+35 Bersih · +5 Bahagia',
      },
      shampoo_foam: {
        name: 'Shampo & Bath Foam',
        shortName: 'Shampo & Foam',
        description: '+60 Bersih · +10 Bahagia',
      },
      spa_bath: {
        name: 'Mandi Spa / Bath Bomb',
        shortName: 'Mandi Spa',
        description: '+100 Bersih · +20 Bahagia',
      },
    },
    sleepOptions: {
      power_nap: {
        name: 'Tidur Singkat (Power Nap)',
        shortName: 'Power Nap',
        description: '+40 Energi · +5 Bahagia · -5 Kenyang',
      },
      full_rest: {
        name: 'Tidur Pulih Penuh',
        shortName: 'Tidur Penuh',
        description: '+100 Energi · +10 Bahagia · -12 Kenyang · -2 Bersih',
      },
    },
    lifeStages: {
      baby: {
        label: 'Bayi',
        shortLabel: 'Bayi',
        realDurationLabel: '60 menit',
        calendarLabel: 'Hari ke-0 s/d ke-3 (Jam 0–73)',
        decayNote: 'Kenyang/Bahagia -20/15m · Bersih -20/25m · Energi -20/18m',
      },
      child: {
        label: 'Anak',
        shortLabel: 'Anak',
        realDurationLabel: '24 jam',
        calendarLabel: 'Hari ke-1',
        decayNote: 'Kenyang/Bahagia -20/50m · Bersih -20/80m · Energi -20/60m',
      },
      teen: {
        label: 'Remaja',
        shortLabel: 'Remaja',
        realDurationLabel: '48 jam',
        calendarLabel: 'Hari ke-2 s/d ke-3',
        decayNote: 'Kenyang/Bahagia -20/60m · Bersih -20/95m · Energi -20/75m',
      },
      adult: {
        label: 'Dewasa',
        shortLabel: 'Dewasa',
        realDurationLabel: '8 hari',
        calendarLabel: 'Hari ke-4 s/d ke-11',
        decayNote: 'Kenyang/Bahagia -20/75–90m · Bersih -20/120–140m · Energi -20/90–110m',
      },
      senior: {
        label: 'Tua (Senior)',
        shortLabel: 'Tua',
        realDurationLabel: '7 hari (Wafat > Hari 18)',
        calendarLabel: 'Hari ke-12 s/d ke-18',
        decayNote: 'Kenyang/Bahagia -20/20–30m · Bersih -20/35–45m · Energi -20/25–35m',
      },
    },
    adultBranches: {
      prima: {
        label: 'Dewasa Prima',
        description: 'Terawat optimal: interval turun terlambat (90m/140m/110m) & +1 koin bonus.',
        maxMistakesLabel: '0–2 Care Mistakes',
      },
      mandiri: {
        label: 'Dewasa Mandiri',
        description: 'Tangkas dan seimbang dengan ketahanan tubuh standar (82,5m/130m/100m).',
        maxMistakesLabel: '3–5 Care Mistakes',
      },
      sensitif: {
        label: 'Dewasa Sensitif',
        description: 'Lebih manja dan cepat merasa lapar/kesepian (75m/120m/90m).',
        maxMistakesLabel: '6+ Care Mistakes',
      },
    },
    backgrounds: {
      apartment: {
        name: 'Apartemen Kota',
        description: 'Apartemen hangat dengan pemandangan kota dari jendela',
      },
      tatami: {
        name: 'Kamar Tatami',
        description: 'Kamar Jepang hangat berlantai tatami menghadap taman bambu',
      },
      classic_home: {
        name: 'Rumah Kayu Klasik',
        description: 'Ruang tamu sage hangat bawaan menghadap taman',
      },
    },
    beds: {
      kasur_semangka: {
        name: 'Kasur Semangka',
        description: 'Kasur buah semangka segar dengan daun hijau lucu',
      },
      keranjang_rajut: {
        name: 'Keranjang Rajut',
        description: 'Keranjang anyaman hangat dengan selimut kotak merah',
      },
      kasur_donat: {
        name: 'Kasur Donat',
        description: 'Kasur donat stroberi bertabur meses warna-warni',
      },
      tenda_kerajaan: {
        name: 'Tenda Kerajaan',
        description: 'Tenda tidur biru malam berhias bulan sabit emas',
      },
      kasur_kucing: {
        name: 'Kasur Kucing',
        description: 'Kasur kucing oranye bawaan dengan bantal merah empuk',
      },
    },
    bathtubs: {
      bak_kucing: {
        name: 'Bak Mandi Kucing',
        description: 'Bak mandi kucing bawaan dengan busa melimpah & shower ikan',
      },
      bak_ikan: {
        name: 'Bak Mandi Ikan',
        description: 'Bak ikan biru ceria lengkap dengan ikan hias & keran air',
      },
      bak_onsen: {
        name: 'Bak Kayu Onsen',
        description: 'Tong pemandian air hangat gaya Jepang dengan gayung kayu',
      },
      bak_kerang: {
        name: 'Bak Kerang',
        description: 'Bak kerang mutiara merah muda dengan shower laut & busa lembut',
      },
      bak_batu: {
        name: 'Bak Batu Alam',
        description: 'Kolam batu alami dengan pancuran bambu dan dedaunan segar',
      },
    },
    toys: {
      yarn_ball: {
        name: 'Bola Benang',
        shortName: 'Bola',
        bonusText: 'Seimbang · +14 Bahagia/tangkap',
      },
      laser_pointer: {
        name: 'Laser Pointer',
        shortName: 'Laser',
        bonusText: '+35% Bahagia · Lari cepat (+16 tangkap)',
      },
      feather_wand: {
        name: 'Tongkat Bulu',
        shortName: 'Bulu',
        bonusText: 'Hemat Energi 35% · +18 Bahagia/tangkap',
      },
      toy_mouse: {
        name: 'Tikus Mainan',
        shortName: 'Tikus',
        bonusText: 'Paling Hemat Energi · +3 Koin/tangkap',
      },
    },
    accessories: {
      beret_merah: { name: 'Baret Pelukis' },
      topi_pesta: { name: 'Topi Pesta Bintang' },
      mahkota_emas: { name: 'Mahkota Raja' },
      kacamata_bulat: { name: 'Kacamata Pintar' },
      kacamata_hitam: { name: 'Kacamata Keren' },
      kacamata_hati: { name: 'Kacamata Hati' },
      syal_polkadot: { name: 'Syal Polkadot' },
      syal_garis: { name: 'Syal Garis' },
      dasi_kupu: { name: 'Dasi Kupu-kupu' },
    },
  },
  stage: {
    moods: {
      calm: 'Tenang & Nyaman',
      recoverBed: 'Pemulihan 2x di Kasur',
      recoverSick: 'Pemulihan (Masih Sakit)',
      almostRecovered: 'Hampir Pulih Total',
      sick: 'Sedang Sakit',
      held: 'Sedang Digendong',
      bathing: 'Sedang Mandi',
      autoSleep: 'Tidur Otomatis',
      powerNap: 'Power Nap',
      deepSleep: 'Tidur Nyenyak',
      dozing: 'Santai di Lantai',
      eating: 'Lahap Makan',
      playingToy: (toyName) => `Main ${toyName}`,
      rolling: 'Berguling Lucu',
      purring: 'Sangat Manja',
      stretching: 'Meregangkan Badan',
      starving: 'Kelaparan!',
      hungryCranky: 'Rewel Minta Makan',
      sulking: 'Sedang Ngambek',
      needsCleaning: 'Perlu Dibersihkan',
      veryDrowsy: 'Sangat Ngantuk',
      gettingDrowsy: 'Mulai Ngantuk',
      veryHappy: 'Sangat Ceria',
    },
    warnings: {
      recovering: (name, health, sleeping) =>
        `${name} sedang masa pemulihan (${health}%) — efek sakit masih terasa hingga kesehatan mencapai 90%${
          sleeping ? ' · Pemulihan 2x lebih cepat di kasur!' : '.'
        }`,
      sickOverwork: (name) =>
        `Kelelahan / Overwork! ${name} jatuh sakit karena Energi 0 terlalu lama—segera beri obat sebelum kesehatan habis.`,
      sickDirtyZero: (name) =>
        `Kebersihan 0%! ${name} jatuh sakit—mandikan dan beri obat sebelum kesehatan habis.`,
      sickChronicDirty: (name) =>
        `${name} jatuh sakit karena terlalu sering kotor! Segera beri obat sebelum kesehatan habis.`,
      sickGeneric: (name, health) =>
        `${name} sedang sakit (${health}% Kesehatan)! Segera beri obat sebelum mencapai 0%.`,
      autoSleep: (name, timer) =>
        `Kelelahan total! ${name} masuk [AUTO-SLEEP] (${timer}) · Bermain & Mandi dikunci.`,
      starving: (name) => `${name} kelaparan (0%)! Kondisi memburuk—segera beri makan.`,
      veryHungry: (name) =>
        `${name} sangat lapar (<20%)! Kesehatannya mulai menurun—segera beri makan.`,
      veryDrowsy: (name, energy) =>
        `${name} sangat ngantuk (${energy}% Energi)! Mainan Interaktif ditolak—segera tidurkan.`,
      lateNightDrowsy: (name) =>
        `${name} mengantuk berat (01:00–06:00)! Menolak berlari & aktivitas menguras 5x energi. Tidurkan untuk pulih 3x lebih cepat.`,
      hungryCranky: (name) => `${name} mulai rewel minta makan (<40%)! Waktunya beri makan.`,
      veryDirty: (name) =>
        `${name} sangat kotor (<15%)! Kesehatannya menurun—segera mandikan.`,
      gettingDirty: (name) =>
        `${name} mulai kotor (<40%)! Bersihkan agar Bahagia tidak ikut turun.`,
      drowsyLight: (name, energy, tags) =>
        `${name} mulai ngantuk (${energy}% Energi${tags ? ` · ${tags}` : ''})! Konsumsi energi aktivitas naik 1,15x.`,
      sulking: (name) =>
        `${name} sedang ngambek (<40% Bahagia)! Efek main & elus berkurang sampai tenang.`,
    },
    toasts: {
      bondLevelUp: (level) => `Ikatan Lv. ${level}! +15 Koin`,
      coinGain: (coins) => `+${coins} Koin`,
      evolutionExtra: (stageLabel, extra) => `Evolusi: ${stageLabel} (${extra})!`,
      evolution: (stageLabel) => `Evolusi: Fase ${stageLabel}!`,
      miniGameUnlocked: 'Mini-Game Terbuka',
      snackCooldown: (timer) => `Camilan Gratis cooldown (${timer})`,
      hungerFull: 'Kenyang sudah penuh (100)!',
      foodInBowlSleeping: (itemShort) => `${itemShort} ditaruh di mangkuk (masih tidur)`,
      fedSuccess: (itemShort, hunger, happy) =>
        `${itemShort}: +${hunger} Kenyang · +${happy} Bahagia`,
      bathCompleteSpa: (happy) => `Bersih Penuh 100% · +${happy} Bahagia`,
      bathComplete: (clean, happy) => `+${clean} Bersih · +${happy} Bahagia`,
      bathLockedSleep: 'Mandi dikunci saat kucing sedang tidur!',
      bathAlreadyInProgress: (name) => `${name} sudah menuju / sedang mandi di bak!`,
      cleanFull: 'Bersih sudah penuh (100)!',
      soapCooldown: (timer) => `Sabun Dasar cooldown (${timer})`,
      bathImmediate: (itemShort) => `Langsung mandi (${itemShort})!`,
      bathWalking: (itemShort) => `Menuju bak mandi (${itemShort})...`,
      sleepingZzz: 'Zzz... Sedang tidur',
      waitBathing: 'Tunggu sebentar, sedang mandi!',
      petCooldown: (isFull, timer) =>
        `${isFull ? 'Kasih Sayang' : 'Elus Singkat'} cooldown (${timer})`,
      petSuccess: (happy, isSulking, hungerDelta, isRain) => {
        const sulkTag = isSulking ? ' (Ngambek)' : '';
        const hTag = hungerDelta < 0 ? ` · ${hungerDelta} Kenyang` : '';
        const rTag = isRain ? ' · Tenang saat hujan' : '';
        return `+${happy} Bahagia${sulkTag} · +0 Energi${hTag}${rTag}`;
      },
      alreadySleeping: 'Kucing sedang tidur!',
      energyFull: 'Energi sudah penuh (100)!',
      tooFreshToSleep: 'Masih segar (>85 Energi) di Pagi/Siang! Menolak tidur',
      onlyBriefNapAllowed: 'Energi >70 di Pagi/Siang! Hanya mau tidur sebentar',
      briefDayNapStart: (energy) =>
        `Masih cukup segar — tidur sebentar (1,5 mnt · +${energy} Energi)`,
      sleepStart: (shortName, mins, bonusText, desc) =>
        `${shortName} (${mins} mnt${bonusText}): ${desc}`,
      sleepBonusMorning: 'Pagi +10%',
      sleepBonusNight: 'Malam +20%',
      sleepBonusRain: 'Hujan +10%',
      sleepBonusLateNight: 'Pulih 3x',
      sleepInterrupted: 'Tidur terganggu! -10 Bahagia',
      miniGameNeedChild: 'Mini-Game terbuka mulai Fase Anak!',
      playLockedSleep: 'Bermain dikunci saat kucing sedang tidur!',
      miniGameNeedHeal: 'Sedang sakit — sembuhkan dulu sebelum Mini-Game!',
      miniGameLowEnergy: 'Energi < 20! Terlalu lemas untuk Mini-Game',
      tooHungry: 'Terlalu lapar! Beri makan dulu',
      miniGameCooldown: (timer) => `Mini-Game cooldown (${timer})`,
      bathingNow: 'Sedang mandi di bak!',
      playSickBlocked: 'Sedang sakit — Mainan Interaktif ditolak!',
      playLowEnergyBlocked: 'Sangat ngantuk (<=20 Energi)! Mainan Interaktif ditolak',
      playCooldown: (timer) => `Mainan Interaktif cooldown (${timer})`,
      playLateNightNotice: (cost, happyFull) =>
        `Mengantuk berat (01:00–06:00)! Energi main 5x (-${cost} Energi${
          happyFull ? ' · +0 Bahagia' : ''
        })`,
      playHappyFullDrowsy: (cost) =>
        `Mulai Ngantuk · Energi main 1,15x (-${cost} Energi · +0 Bahagia)`,
      playHappyFull: 'Bahagia penuh (100) · +0 Bahagia',
      playSulking: (happy, drowsyPenalty) =>
        `Ngambek (<40) · Main berkurang (+${happy} Bahagia${drowsyPenalty ? ' · Energi 1,15x' : ''})`,
      playDrowsyPenalty: (cost, midday) =>
        `Mulai Ngantuk · Energi main naik 1,15x (-${cost} Energi${midday ? ' · Bonus Siang +10%' : ''})`,
      playWeakened: (happy) => `Lemas · Main kurang maksimal (+${happy} Bahagia)`,
      playMiddayBonus: (happy) => `Main Siang! +${happy} Bahagia (Bonus +10%)`,
      medAlreadyGiven: 'Obat sudah diberikan · Sedang pulih bertahap',
      medNotNeeded: (name) => `${name} sedang sehat! Obat hanya saat sakit`,
      medGiven: 'Diberi Obat · Pemulihan dimulai (efek hilang di 90%)',
      miniGameSummaryFull: (e, hun, cln) =>
        `+0 Bahagia · -${e} Energi · -${hun} Kenyang · -${cln} Bersih`,
      miniGameSummaryReduced: (happy, e, cln) =>
        `+${happy} Bahagia (Berkurang) · -${e} Energi · -${cln} Bersih`,
      miniGameSummaryNormal: (happy, tags, e, hun, cln) =>
        `+${happy} Bahagia${tags} · -${e} Energi · -${hun} Kenyang · -${cln} Bersih`,
      newBackground: (name) => `Suasana Baru: ${name}!`,
      newBed: (name) => `Kasur Baru: ${name}!`,
      newBathtub: (name) => `Bak Mandi Baru: ${name}!`,
      newToy: (name) => `Mainan Baru: ${name}!`,
      newCostume: (name) => `Kostum Baru: ${name}!`,
      awaySummary: (hungerLost, healthLost) =>
        `Lama pergi · Kenyang -${hungerLost}%${healthLost >= 1 ? ` · Sehat -${healthLost}%` : ''}`,
      phaseBannerPagi: 'Pagi tiba (06:00) · Bonus tidur +10% Energi',
      phaseBannerSiang: 'Siang tiba (12:00) · Main +10% Bahagia',
      phaseBannerMalam: 'Malam tiba (18:00) · Bonus tidur +20% Energi',
      rainStart: (phaseLabel) => `Hujan ${phaseLabel} turun · Tidur +10% Energi`,
      rainStop: (phaseLabel) => `Hujan reda · Langit ${phaseLabel} cerah`,
      newDayCoins: (day) => `Hari ke-${day}! +10 Koin`,
      overworkSick: 'Overwork! Energi 0 terlalu lama — Kucing jatuh sakit!',
      sleepCompleteAuto: (energy) => `Auto-Sleep selesai! Energi pulih +${energy}`,
      sleepCompletePower: (energy, happy) =>
        `Power Nap selesai! +${energy} Energi · +${happy} Bahagia`,
      sleepCompleteFull: (energy, happy) =>
        `Tidur Penuh selesai! +${energy} Energi · +${happy} Bahagia`,
      drowsyNoticeNight: 'Mulai ngantuk (≤50 Energi · Malam) · Waktunya tidur!',
      drowsyNoticeRain: 'Mulai ngantuk (≤45 Energi · Hujan) · Syahdu untuk tidur!',
      drowsyNoticeNormal: 'Mulai ngantuk (21–40 Energi) · Istirahatkan yuk!',
      drowsyHeavyLateNight:
        'Pukul 01:00–06:00: Mengantuk berat! Menolak berlari · Tidur pulih 3x lebih cepat',
      drowsyHeavyNormal: 'Sangat ngantuk (1–20 Energi)! Segera tidurkan',
      autoSleepStart: (energy) => `Kelelahan Total! Masuk [AUTO-SLEEP] 4 mnt (+${energy} Energi)`,
      sickCleared90: 'Kesehatan 90%! Efek sakit hilang!',
      recovered100: (name) => `${name} Pulih Total 100%!`,
      becameSickHealth: (health, name) => `Kesehatan ${health}%! ${name} jatuh sakit!`,
      becameSickDirtyZero: 'Kebersihan 0%! Kucing jatuh sakit!',
      becameSickChronicDirty: 'Terlalu sering kotor! Kucing jatuh sakit',
      playSessionComplete: (happy, energy, hunger) =>
        `Main Selesai: +${happy} Bahagia · -${energy} Energi · -${hunger} Kenyang`,
      brushLockedSleep: 'Mandi & sikat dikunci saat kucing tidur!',
      brushHint: 'Gosok-gosok tubuh kucing (+10 Bersih)',
      brushFullWangi: 'Bersih 100%! Wangi ✨',
      brushGain: (pts) => `+${pts} Bersih`,
      lateNightNoZoom: 'Mengantuk berat (01:00–06:00)! Tidak mau berlari',
      playMiddayTag: 'Siang +10%',
      rainTag: 'Hujan +5',
    },
  },
};

const EN_TRANSLATIONS: Translations = {
  languageTitle: 'Language',
  common: {
    back: 'Back',
    done: 'Done',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    active: 'On',
    off: 'Off',
    unsupported: 'Unsupported',
    enable: 'Enable',
    enabled: 'On',
    blocked: 'Blocked',
    allow: 'Allow',
    coins: 'Coins',
    day: 'Day',
    days: 'Days',
    hourShort: 'h',
    minuteShort: 'm',
    secShort: 's',
    use: 'Use',
    usedEquipped: 'Equipped',
    buy: 'Buy',
    buyInShop: 'Buy in Shop',
    giveFree: 'Give Free',
    useFree: 'Use Free',
    equip: 'Equip',
    unequip: 'Unequip',
    unequipAll: 'Remove All',
    all: 'All',
  },
  app: {
    docTitle: 'Rumah Kucing — Virtual Cat Care Game',
    closedTitle: 'App Closed',
    closedDesc: 'Thank you for playing LumaPet. You may close this page.',
    reopen: 'Reopen',
    portraitTitle: 'Landscape Mode Required',
    portraitDesc: 'Rotate your device horizontally (Landscape) to play LumaPet.',
    splashAria: 'LumaPet Opening',
    cloudErrors: {
      popupBlocked: 'Google login popup was blocked. Allow popups and try again.',
      quota: 'Daily Cloud Save quota reached and will reset tomorrow.',
      generic: 'Failed to sync Cloud Save. Check your internet connection.',
    },
    lowHungerNotifTitle: 'Rumah Kucing',
    lowHungerNotifBody:
      "Meow! Your cat's hunger is below 40%. Feed them soon before they get sick!",
  },
  title: {
    backdropAlt: 'Rumah Kucing tatami room backdrop',
    subtitle: 'Care, pet, and play with your furry companion',
    newGame: 'New Game',
    continue: 'Continue',
    noSaveYet: 'No save data yet',
    loadingCloud: 'Loading from Cloud...',
    settings: 'Settings',
    quit: 'Quit',
    quitConfirmTitle: 'Are you sure?',
    quitConfirmBody: 'Are you sure you want to quit the game?',
    adoptTitle: 'Choose a Cat to Adopt',
    catNameLabel: 'Cat Nickname',
    startPlaying: 'Start Playing',
    soundToggleOn: 'Turn sound on',
    soundToggleOff: 'Mute sound',
    soundAlt: 'Sound',
    googleAccount: 'Google Account',
    linkGoogle: 'Link Google Account',
    linkGoogleHint: 'Auto Cloud Save',
    linkGoogleTooltip: 'Link Google account to save and load progress from the cloud',
    manageCloudTooltip: 'Manage Google account link & Cloud Save',
    connecting: 'Connecting...',
    cloudSyncing: 'Syncing Cloud...',
    cloudError: 'Sync Failed',
    cloudConnected: 'Cloud Connected',
    cloudSaveReady: (name, day) => `Cloud Save ready: ${name} (Day ${day})`,
    cloudAutoReady: 'Connected · New progress will automatically save to cloud',
    reloadCloud: 'Reload from Cloud',
    unlinkGoogle: 'Unlink Google Account',
    closeAccountMenu: 'Close account info',
    closeMessage: 'Close message',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Adjust sound, language & notifications',
    languageLabel: 'Language',
    languageDesc: 'Choose game display language',
    volumeTitle: 'Sound Volume',
    volumeDesc: 'Adjust overall game audio volume',
    volumeAria: 'Sound volume percentage',
    sfxTitle: 'Sound Effects (SFX)',
    sfxDesc: 'Meows, purrs & toys',
    musicTitle: 'Background Music',
    musicDesc: 'Menu & in-game music',
    notifTitle: 'Feeding Notifications',
    notifDesc: 'Remind when hunger drops below 40%',
    fullscreenTitle: 'Fullscreen',
    fullscreenDesc: 'Hide device status bar & navigation',
    clearSave: 'Delete Save Data',
  },
  pause: {
    pausedTitle: 'Pause Menu',
    settingsTitle: 'Settings',
    diedTitle: (name) => `${name} Passed Away`,
    diedOldAge: (name, day) =>
      `${name} grew old surrounded by love and passed peacefully after staying with you until Day ${day}.`,
    diedSickness: (name) =>
      `${name}'s spirit drifted peacefully to the clouds because the illness went untreated.`,
    careDuration: 'Time Together',
    bond: 'Bond',
    ballCatches: 'Toy Catches',
    savingCloud: 'Saving to Cloud...',
    savingAuto: 'Auto-saving progress...',
    cloudSaveActive: 'Cloud Save Active · Auto-saved',
    autoSaveActive: 'Auto-Save Active · Saved automatically',
    resume: 'Resume',
    quitGame: 'Exit to Menu',
    playAgain: 'Play Again',
    mainMenu: 'Main Menu',
  },
  hud: {
    statusPanelLabel: 'Status Panel',
    profileCardLabel: 'Cat Profile',
    hunger: 'Hunger',
    happiness: 'Happy',
    cleanliness: 'Clean',
    energy: 'Energy',
    health: 'Health',
    tags: {
      critical: 'Critical!',
      cranky: 'Hungry!',
      stressed: 'Stressed!',
      sulking: 'Sulking',
      dirty: 'Dirty',
      exhausted: 'Exhausted!',
      drowsyHeavy: 'Very Sleepy',
      drowsyLight: 'Sleepy',
      recoveringLethargic: (hp) => `Healing · Weak (${hp}%)`,
      recovering: (hp) => `Healing (${hp}%)`,
      sick: (hp) => `Sick! (${hp}%)`,
    },
    dayPhases: {
      pagi: 'Morning',
      siang: 'Day',
      senja: 'Dusk',
      malam: 'Night',
    },
    rain: 'Rain',
    dayFormat: (day, extraHours, clock, weatherLabel) =>
      `Day ${day}${extraHours} · ${clock} ${weatherLabel}`,
    phaseTooltip: {
      pagi: 'Morning (06:00–11:59) · Sleep bonus +10% Energy',
      siang: (label) => `${label} (12:00–17:59) · Play +10% Happy · Hunger/Energy 1.1x`,
      malam: 'Night (18:00–05:59) · Sleep +20% Energy · Energy 1.25x',
      rainExtra: ' | Rain: Energy 1.15x · Sleep +10% · Sleepy ≤45 · Indoors Happy 0.9x',
    },
    viewLifeStageTooltip: 'View Growth & Evolution Stages',
    pauseLabel: 'Pause Menu',
    pauseTooltip: 'Pause Menu (Esc)',
    actionMenus: {
      food: 'Food',
      pickFood: 'Choose Food',
      bath: 'Bath',
      pickBath: 'Choose Bath',
      play: 'Play',
      pickPlay: 'Choose Activity',
      pet: 'Petting',
      pickPet: 'Choose Petting',
      sleep: 'Sleep',
      pickSleep: 'Choose Sleep',
      closeAria: 'Close action menu',
    },
    changeFoodTooltip: 'Click to change food option',
    changeBathTooltip: 'Click to change bath option',
    changePlayTooltip: 'Click to change play activity',
    changePetTooltip: 'Click to change petting style',
    changeSleepTooltip: 'Click to change sleep option',
    manualBrush: 'Manual Brush',
    manualBrushDesc: '+10 Clean per scrub',
    brushDisable: 'Turn Off',
    brushUse: 'Use Brush',
    bathingShort: 'Bathing...',
    sleepingShort: 'Sleeping',
    cleanFull: (stock) => (stock !== undefined ? `Clean 100 (${stock})` : 'Clean 100'),
    hungerFull: (stock) => `Full 100 (${stock})`,
    useWithStock: (stock) => `Use (${stock})`,
    toyPlayItem: (toyShort) => `Toy (${toyShort})`,
    playDeltaLine: (happy, energy) => `+${happy} Happy · ${energy} Energy`,
    miniGamePond: 'Pond Mini-Game',
    miniGameLockedStage: 'Child Stage+',
    sickShort: 'Sick',
    hungryShort: 'Hungry',
    playBtn: 'Play',
    startBtn: 'Start',
    petShort: 'Quick Pet',
    petShortDesc: (happy) => `+${happy} Happy`,
    petFull: 'Loving Cuddle',
    petFullDesc: (happy, hunger) => `+${happy} Happy · ${hunger} Hunger`,
    petShortBtn: 'Pet',
    petFullBtn: 'Cuddle',
    autoSleep: 'Auto-Sleep',
    powerNap: 'Power Nap',
    fullRest: 'Full Rest',
    wakeUpPenalty: 'Wake Up (-10 Happy)',
    briefNap: 'Brief Nap',
    briefNapDesc: '+20 Energy · 1.5m',
    freshGuard: 'Fresh (>85)',
    energyAbove70: 'Energy >70',
    energy100: 'Energy 100',
    dock: {
      foodAria: 'Food Menu',
      foodTitle: 'Feed (Free Snack / Shop Food)',
      bathLockedSleep: 'Bath is locked while sleeping',
      bathBathing: 'Cat is taking a bath!',
      bathAria: 'Bath & Cleanliness Menu',
      bathTitle: 'Bath (Free Soap / Shampoo / Spa)',
      playLockedSleep: 'Play is locked while sleeping',
      playDisabledAria: 'Cannot play while sick or Energy < 20',
      playDisabledTitle: 'Cannot play (Sick or Energy < 20)',
      playAria: (toyName) => `Play Menu (${toyName})`,
      playTitle: 'Play (Interactive Toy / Mini-Game)',
      petAria: 'Petting Menu',
      petTitle: 'Pet (+15 / +25 Happy · +0 Energy)',
      sleepAria: 'Sleep & Rest Menu',
      sleepTitle: 'Sleep & Rest (Power Nap / Full Rest)',
      medRecoveringAria: 'Cat is recovering with medicine',
      medHealthyAria: 'Medicine can only be given when sick',
      medAria: 'Give Medicine',
      medRecoveringSickTitle: 'Recovering (sickness clears at 90%)',
      medRecoveringTitle: 'Recovering toward 100% health',
      medHealthyTitle: 'Medicine can only be given when sick',
      medSickTitle: 'Give Medicine (Cat is sick!)',
      shopLabel: 'Shop',
    },
  },
  shop: {
    title: 'Shop',
    closeAria: 'Close shop',
    tabs: {
      makanan: 'Food',
      mandi: 'Bath',
      mainan: 'Toys',
      kostum: 'Outfits',
      rumah: 'Room',
      kasur: 'Beds',
    },
    sleepingNotice: 'Cat is sleeping — bath is locked until awake.',
    bathingNotice: 'Cat is taking a bath in the tub!',
    bathFilters: {
      all: 'All',
      tub: 'Bathtubs',
      consumable: 'Soap & Spa',
    },
    bathTip: 'Tip: Drag the bathtub on the floor to reposition it.',
    bedTip: 'Tip: Drag the bed on the floor to reposition it.',
    bathConsumablesHeading: 'Soaps & Bath Care',
    bathingBtn: 'Bathing',
    sleepingBtn: 'Sleeping',
    costumeFilters: {
      all: 'All',
      hat: 'Hats',
      glasses: 'Glasses',
    },
    slotLabels: {
      hat: 'Mini Hat',
      glasses: 'Glasses',
      scarf: 'Scarf',
    },
  },
  minigame: {
    title: 'Fish Catch Mini-Game',
    closeAria: 'Close Mini-Game',
    prompt: (name) => `Help ${name} catch fish in the pond!`,
    rainBonusHint: '(Rain: +5 Happy · -2 Clean)',
    scoreLabel: (score) => `Score: ${score}`,
    finishedTitle: (score) => `Finished! Score ${score} Pts`,
    rewardSummary: (coins, happy, rainExtra, cleanCost) =>
      `Reward: +${coins} Coins · +${happy} Happy${rainExtra ? ' (Rain +5)' : ''} · -10 Energy · -5 Hunger · -${cleanCost} Clean · +12 Bond XP`,
    claimBtn: 'Claim Reward',
  },
  lifestage: {
    title: 'Growth Stages',
    phaseTitle: (name, stageLabel) => `${name} · ${stageLabel} Stage`,
    durationPrefix: (calendar, duration) => `${calendar} · Duration ${duration}`,
    seniorAgeLabel: 'Senior Age (D.12–18)',
    toNextStage: 'Next Stage Progress',
    remainingBaby: (mins, hours) => `${mins}m left · Hr ${hours}/73`,
    remainingDaysHours: (days, hrs) => `${days}d ${hrs}h left`,
    remainingHours: (hrs) => `${hrs}h left`,
    mistakesLabel: (count) => `Mistakes: ${count}x`,
    nowBadge: 'Current',
    branchGuideTitle:
      'Adult Evolution Paths (based on Care Mistakes during Child & Teen)',
  },
  catalog: {
    breeds: {
      oren: { label: 'Orange Tabby', personality: 'Lively & loves snacks' },
      mochi: { label: 'Cream White', personality: 'Affectionate & cuddly' },
      arang: { label: 'Black Tuxedo', personality: 'Clever & great at catching' },
      abu: { label: 'Silver Grey', personality: 'Calm & curious' },
    },
    personalities: {
      playful: 'Playful',
      lazy: 'Relaxed',
      shy: 'Shy',
    },
    foodItems: {
      snack: {
        name: 'Light Snack',
        shortName: 'Light Snack',
        description: '+15 Hunger · +10 Happy',
      },
      main_food: {
        name: 'Standard Meal',
        shortName: 'Standard Meal',
        description: '+30 Hunger · +5 Happy',
      },
      special_food: {
        name: 'Special Feast',
        shortName: 'Special Feast',
        description: '+50 Hunger · +15 Happy',
      },
    },
    bathItems: {
      basic_soap: {
        name: 'Basic Soap / Wet Wipe',
        shortName: 'Basic Soap',
        description: '+35 Clean · +5 Happy',
      },
      shampoo_foam: {
        name: 'Shampoo & Bath Foam',
        shortName: 'Shampoo Foam',
        description: '+60 Clean · +10 Happy',
      },
      spa_bath: {
        name: 'Spa Bath / Bath Bomb',
        shortName: 'Spa Bath',
        description: '+100 Clean · +20 Happy',
      },
    },
    sleepOptions: {
      power_nap: {
        name: 'Quick Sleep (Power Nap)',
        shortName: 'Power Nap',
        description: '+40 Energy · +5 Happy · -5 Hunger',
      },
      full_rest: {
        name: 'Full Rest Sleep',
        shortName: 'Full Rest',
        description: '+100 Energy · +10 Happy · -12 Hunger · -2 Clean',
      },
    },
    lifeStages: {
      baby: {
        label: 'Baby',
        shortLabel: 'Baby',
        realDurationLabel: '60 mins',
        calendarLabel: 'Day 0 to 3 (Hr 0–73)',
        decayNote: 'Hunger/Happy -20/15m · Clean -20/25m · Energy -20/18m',
      },
      child: {
        label: 'Child',
        shortLabel: 'Child',
        realDurationLabel: '24 hrs',
        calendarLabel: 'Day 1',
        decayNote: 'Hunger/Happy -20/50m · Clean -20/80m · Energy -20/60m',
      },
      teen: {
        label: 'Teen',
        shortLabel: 'Teen',
        realDurationLabel: '48 hrs',
        calendarLabel: 'Day 2 to 3',
        decayNote: 'Hunger/Happy -20/60m · Clean -20/95m · Energy -20/75m',
      },
      adult: {
        label: 'Adult',
        shortLabel: 'Adult',
        realDurationLabel: '8 days',
        calendarLabel: 'Day 4 to 11',
        decayNote: 'Hunger/Happy -20/75–90m · Clean -20/120–140m · Energy -20/90–110m',
      },
      senior: {
        label: 'Senior',
        shortLabel: 'Senior',
        realDurationLabel: '7 days (Rest > Day 18)',
        calendarLabel: 'Day 12 to 18',
        decayNote: 'Hunger/Happy -20/20–30m · Clean -20/35–45m · Energy -20/25–35m',
      },
    },
    adultBranches: {
      prima: {
        label: 'Prime Adult',
        description: 'Optimal care: slower decay (90m/140m/110m) & +1 bonus coin.',
        maxMistakesLabel: '0–2 Care Mistakes',
      },
      mandiri: {
        label: 'Balanced Adult',
        description: 'Nimble & steady with standard stamina (82.5m/130m/100m).',
        maxMistakesLabel: '3–5 Care Mistakes',
      },
      sensitif: {
        label: 'Sensitive Adult',
        description: 'Needier and gets hungry/lonely faster (75m/120m/90m).',
        maxMistakesLabel: '6+ Care Mistakes',
      },
    },
    backgrounds: {
      apartment: {
        name: 'City Apartment',
        description: 'Warm apartment with a city skyline view from the window',
      },
      tatami: {
        name: 'Tatami Room',
        description: 'Cozy Japanese tatami room overlooking a bamboo garden',
      },
      classic_home: {
        name: 'Classic Wooden Home',
        description: 'Default warm sage living room facing the garden',
      },
    },
    beds: {
      kasur_semangka: {
        name: 'Watermelon Bed',
        description: 'Fresh watermelon cushion bed with cute green leaves',
      },
      keranjang_rajut: {
        name: 'Knit Basket',
        description: 'Warm woven basket with a red plaid blanket',
      },
      kasur_donat: {
        name: 'Donut Bed',
        description: 'Strawberry donut bed topped with colorful sprinkles',
      },
      tenda_kerajaan: {
        name: 'Royal Tent',
        description: 'Midnight blue sleeping tent adorned with golden crescents',
      },
      kasur_kucing: {
        name: 'Cat Bed',
        description: 'Default orange cat bed with a plush red pillow',
      },
    },
    bathtubs: {
      bak_kucing: {
        name: 'Cat Bathtub',
        description: 'Default cat tub with fluffy bubbles & fish shower',
      },
      bak_ikan: {
        name: 'Fish Bathtub',
        description: 'Cheerful blue fish tub with goldfish & tap spout',
      },
      bak_onsen: {
        name: 'Wooden Onsen Tub',
        description: 'Japanese-style warm wooden bath barrel with ladle',
      },
      bak_kerang: {
        name: 'Seashell Tub',
        description: 'Pink pearl shell tub with ocean shower & soft foam',
      },
      bak_batu: {
        name: 'Stone Nature Tub',
        description: 'Natural stone pool with bamboo spout and fresh leaves',
      },
    },
    toys: {
      yarn_ball: {
        name: 'Yarn Ball',
        shortName: 'Yarn',
        bonusText: 'Balanced · +14 Happy/catch',
      },
      laser_pointer: {
        name: 'Laser Pointer',
        shortName: 'Laser',
        bonusText: '+35% Happy · Fast chase (+16 catch)',
      },
      feather_wand: {
        name: 'Feather Wand',
        shortName: 'Feather',
        bonusText: '35% Less Energy · +18 Happy/catch',
      },
      toy_mouse: {
        name: 'Wind-Up Mouse',
        shortName: 'Mouse',
        bonusText: 'Lowest Energy Cost · +3 Coins/catch',
      },
    },
    accessories: {
      beret_merah: { name: 'Painter Beret' },
      topi_pesta: { name: 'Star Party Hat' },
      mahkota_emas: { name: 'Royal Crown' },
      kacamata_bulat: { name: 'Smart Glasses' },
      kacamata_hitam: { name: 'Cool Shades' },
      kacamata_hati: { name: 'Heart Glasses' },
      syal_polkadot: { name: 'Polkadot Scarf' },
      syal_garis: { name: 'Striped Scarf' },
      dasi_kupu: { name: 'Bow Tie' },
    },
  },
  stage: {
    moods: {
      calm: 'Calm & Cozy',
      recoverBed: '2x Recovery in Bed',
      recoverSick: 'Recovering (Still Sick)',
      almostRecovered: 'Almost Fully Healed',
      sick: 'Feeling Sick',
      held: 'Being Held',
      bathing: 'Taking a Bath',
      autoSleep: 'Auto-Sleeping',
      powerNap: 'Power Nap',
      deepSleep: 'Deep Sleep',
      dozing: 'Lounging on Floor',
      eating: 'Eating Happily',
      playingToy: (toyName) => `Playing ${toyName}`,
      rolling: 'Rolling Playfully',
      purring: 'Very Affectionate',
      stretching: 'Stretching',
      starving: 'Starving!',
      hungryCranky: 'Hungry & Cranky',
      sulking: 'Sulking',
      needsCleaning: 'Needs a Bath',
      veryDrowsy: 'Very Sleepy',
      gettingDrowsy: 'Getting Sleepy',
      veryHappy: 'Very Cheerful',
    },
    warnings: {
      recovering: (name, health, sleeping) =>
        `${name} is recovering (${health}%) — illness effects last until health reaches 90%${
          sleeping ? ' · 2x faster recovery in bed!' : '.'
        }`,
      sickOverwork: (name) =>
        `Overworked! ${name} got sick after staying at 0 Energy—give medicine before health runs out.`,
      sickDirtyZero: (name) =>
        `0% Cleanliness! ${name} got sick—bathe and give medicine before health runs out.`,
      sickChronicDirty: (name) =>
        `${name} got sick from being dirty too often! Give medicine before health runs out.`,
      sickGeneric: (name, health) =>
        `${name} is sick (${health}% Health)! Give medicine before reaching 0%.`,
      autoSleep: (name, timer) =>
        `Total exhaustion! ${name} entered [AUTO-SLEEP] (${timer}) · Play & Bath locked.`,
      starving: (name) => `${name} is starving (0%)! Condition worsening—feed immediately.`,
      veryHungry: (name) => `${name} is very hungry (<20%)! Health is dropping—feed soon.`,
      veryDrowsy: (name, energy) =>
        `${name} is very sleepy (${energy}% Energy)! Interactive play refused—put to sleep.`,
      lateNightDrowsy: (name) =>
        `${name} is heavily drowsy (01:00–06:00)! Refuses to run & activities cost 5x energy. Sleep for 3x faster recovery.`,
      hungryCranky: (name) => `${name} is getting cranky for food (<40%)! Time to eat.`,
      veryDirty: (name) => `${name} is very dirty (<15%)! Health is dropping—bathe soon.`,
      gettingDirty: (name) =>
        `${name} is getting dirty (<40%)! Clean up so Happiness doesn't drop.`,
      drowsyLight: (name, energy, tags) =>
        `${name} is getting sleepy (${energy}% Energy${tags ? ` · ${tags}` : ''})! Activity energy cost is 1.15x.`,
      sulking: (name) =>
        `${name} is sulking (<40% Happy)! Play & petting give reduced rewards until cheered up.`,
    },
    toasts: {
      bondLevelUp: (level) => `Bond Lv. ${level}! +15 Coins`,
      coinGain: (coins) => `+${coins} Coins`,
      evolutionExtra: (stageLabel, extra) => `Evolved: ${stageLabel} (${extra})!`,
      evolution: (stageLabel) => `Evolved: ${stageLabel} Stage!`,
      miniGameUnlocked: 'Mini-Game Unlocked',
      snackCooldown: (timer) => `Free Snack cooldown (${timer})`,
      hungerFull: 'Hunger is already full (100)!',
      foodInBowlSleeping: (itemShort) => `${itemShort} placed in bowl (still sleeping)`,
      fedSuccess: (itemShort, hunger, happy) =>
        `${itemShort}: +${hunger} Hunger · +${happy} Happy`,
      bathCompleteSpa: (happy) => `100% Sparkling Clean · +${happy} Happy`,
      bathComplete: (clean, happy) => `+${clean} Clean · +${happy} Happy`,
      bathLockedSleep: 'Bath is locked while sleeping!',
      bathAlreadyInProgress: (name) => `${name} is already heading to / in the tub!`,
      cleanFull: 'Cleanliness is already full (100)!',
      soapCooldown: (timer) => `Basic Soap cooldown (${timer})`,
      bathImmediate: (itemShort) => `Instant bath (${itemShort})!`,
      bathWalking: (itemShort) => `Heading to tub (${itemShort})...`,
      sleepingZzz: 'Zzz... Sleeping',
      waitBathing: 'Wait a moment, taking a bath!',
      petCooldown: (isFull, timer) =>
        `${isFull ? 'Loving Cuddle' : 'Quick Pet'} cooldown (${timer})`,
      petSuccess: (happy, isSulking, hungerDelta, isRain) => {
        const sulkTag = isSulking ? ' (Sulking)' : '';
        const hTag = hungerDelta < 0 ? ` · ${hungerDelta} Hunger` : '';
        const rTag = isRain ? ' · Cozy in rain' : '';
        return `+${happy} Happy${sulkTag} · +0 Energy${hTag}${rTag}`;
      },
      alreadySleeping: 'Cat is already sleeping!',
      energyFull: 'Energy is already full (100)!',
      tooFreshToSleep: 'Still fresh (>85 Energy) in daytime! Refuses sleep',
      onlyBriefNapAllowed: 'Energy >70 in daytime! Only wants a brief nap',
      briefDayNapStart: (energy) => `Still fairly fresh — brief nap (1.5m · +${energy} Energy)`,
      sleepStart: (shortName, mins, bonusText, desc) =>
        `${shortName} (${mins}m${bonusText}): ${desc}`,
      sleepBonusMorning: 'Morning +10%',
      sleepBonusNight: 'Night +20%',
      sleepBonusRain: 'Rain +10%',
      sleepBonusLateNight: '3x Recovery',
      sleepInterrupted: 'Sleep interrupted! -10 Happy',
      miniGameNeedChild: 'Mini-Game unlocks at Child Stage!',
      playLockedSleep: 'Play is locked while sleeping!',
      miniGameNeedHeal: 'Sick — heal first before Mini-Game!',
      miniGameLowEnergy: 'Energy < 20! Too tired for Mini-Game',
      tooHungry: 'Too hungry! Feed first',
      miniGameCooldown: (timer) => `Mini-Game cooldown (${timer})`,
      bathingNow: 'Taking a bath in the tub!',
      playSickBlocked: 'Feeling sick — Interactive Play refused!',
      playLowEnergyBlocked: 'Very sleepy (≤20 Energy)! Interactive Play refused',
      playCooldown: (timer) => `Interactive Play cooldown (${timer})`,
      playLateNightNotice: (cost, happyFull) =>
        `Late night drowsiness (01:00–06:00)! 5x energy cost (-${cost} Energy${
          happyFull ? ' · +0 Happy' : ''
        })`,
      playHappyFullDrowsy: (cost) =>
        `Getting Sleepy · 1.15x play cost (-${cost} Energy · +0 Happy)`,
      playHappyFull: 'Happiness full (100) · +0 Happy',
      playSulking: (happy, drowsyPenalty) =>
        `Sulking (<40) · Reduced gain (+${happy} Happy${drowsyPenalty ? ' · 1.15x Energy' : ''})`,
      playDrowsyPenalty: (cost, midday) =>
        `Getting Sleepy · 1.15x play cost (-${cost} Energy${midday ? ' · Day +10%' : ''})`,
      playWeakened: (happy) => `Tired · Reduced play gain (+${happy} Happy)`,
      playMiddayBonus: (happy) => `Daytime Play! +${happy} Happy (+10% Bonus)`,
      medAlreadyGiven: 'Medicine given · Recovering gradually',
      medNotNeeded: (name) => `${name} is healthy! Medicine is only for sickness`,
      medGiven: 'Medicine Given · Recovery started (clears at 90%)',
      miniGameSummaryFull: (e, hun, cln) =>
        `+0 Happy · -${e} Energy · -${hun} Hunger · -${cln} Clean`,
      miniGameSummaryReduced: (happy, e, cln) =>
        `+${happy} Happy (Reduced) · -${e} Energy · -${cln} Clean`,
      miniGameSummaryNormal: (happy, tags, e, hun, cln) =>
        `+${happy} Happy${tags} · -${e} Energy · -${hun} Hunger · -${cln} Clean`,
      newBackground: (name) => `New Room: ${name}!`,
      newBed: (name) => `New Bed: ${name}!`,
      newBathtub: (name) => `New Bathtub: ${name}!`,
      newToy: (name) => `New Toy: ${name}!`,
      newCostume: (name) => `New Outfit: ${name}!`,
      awaySummary: (hungerLost, healthLost) =>
        `While away · Hunger -${hungerLost}%${healthLost >= 1 ? ` · Health -${healthLost}%` : ''}`,
      phaseBannerPagi: 'Morning has arrived (06:00) · Sleep +10% Energy',
      phaseBannerSiang: 'Daytime has arrived (12:00) · Play +10% Happy',
      phaseBannerMalam: 'Night has fallen (18:00) · Sleep +20% Energy',
      rainStart: (phaseLabel) => `${phaseLabel} rain started · Sleep +10% Energy`,
      rainStop: (phaseLabel) => `Rain cleared · Clear ${phaseLabel.toLowerCase()} sky`,
      newDayCoins: (day) => `Day ${day}! +10 Coins`,
      overworkSick: 'Overwork! 0 Energy for too long — Cat fell sick!',
      sleepCompleteAuto: (energy) => `Auto-Sleep complete! Recovered +${energy} Energy`,
      sleepCompletePower: (energy, happy) =>
        `Power Nap complete! +${energy} Energy · +${happy} Happy`,
      sleepCompleteFull: (energy, happy) =>
        `Full Rest complete! +${energy} Energy · +${happy} Happy`,
      drowsyNoticeNight: 'Getting sleepy (≤50 Energy · Night) · Bedtime!',
      drowsyNoticeRain: 'Getting sleepy (≤45 Energy · Rain) · Cozy weather to nap!',
      drowsyNoticeNormal: 'Getting sleepy (21–40 Energy) · Time for a rest!',
      drowsyHeavyLateNight:
        '01:00–06:00: Heavily drowsy! Refuses running · Sleep heals 3x faster',
      drowsyHeavyNormal: 'Very sleepy (1–20 Energy)! Put to bed soon',
      autoSleepStart: (energy) => `Total Exhaustion! [AUTO-SLEEP] 4m (+${energy} Energy)`,
      sickCleared90: 'Health 90%! Sickness cleared!',
      recovered100: (name) => `${name} Fully Recovered 100%!`,
      becameSickHealth: (health, name) => `Health ${health}%! ${name} fell sick!`,
      becameSickDirtyZero: '0% Cleanliness! Cat fell sick!',
      becameSickChronicDirty: 'Dirty too often! Cat fell sick',
      playSessionComplete: (happy, energy, hunger) =>
        `Play Done: +${happy} Happy · -${energy} Energy · -${hunger} Hunger`,
      brushLockedSleep: 'Bath & brush locked while sleeping!',
      brushHint: 'Scrub the cat gently (+10 Clean)',
      brushFullWangi: '100% Clean! Fresh ✨',
      brushGain: (pts) => `+${pts} Clean`,
      lateNightNoZoom: 'Too sleepy (01:00–06:00)! Refuses to run',
      playMiddayTag: 'Day +10%',
      rainTag: 'Rain +5',
    },
  },
};

const TH_TRANSLATIONS: Translations = {
  languageTitle: 'ภาษา',
  common: {
    back: 'ย้อนกลับ',
    done: 'เสร็จสิ้น',
    close: 'ปิด',
    yes: 'ใช่',
    no: 'ไม่',
    active: 'เปิด',
    off: 'ปิด',
    unsupported: 'ไม่รองรับ',
    enable: 'เปิดใช้งาน',
    enabled: 'เปิด',
    blocked: 'ถูกบล็อก',
    allow: 'อนุญาต',
    coins: 'เหรียญ',
    day: 'วัน',
    days: 'วัน',
    hourShort: 'ชม.',
    minuteShort: 'น.',
    secShort: 'วิ',
    use: 'ใช้',
    usedEquipped: 'กำลังใช้',
    buy: 'ซื้อ',
    buyInShop: 'ซื้อที่ร้านค้า',
    giveFree: 'ให้ฟรี',
    useFree: 'ใช้ฟรี',
    equip: 'สวมใส่',
    unequip: 'ถอดออก',
    unequipAll: 'ถอดทั้งหมด',
    all: 'ทั้งหมด',
  },
  app: {
    docTitle: 'Rumah Kucing — เกมเลี้ยงแมวเสมือนจริง',
    closedTitle: 'ปิดแอปพลิเคชันแล้ว',
    closedDesc: 'ขอบคุณที่เล่น LumaPet คุณสามารถปิดหน้านี้ได้',
    reopen: 'เปิดอีกครั้ง',
    portraitTitle: 'ต้องใช้โหมดแนวนอน',
    portraitDesc: 'โปรดหมุนอุปกรณ์ของคุณเป็นแนวนอน (Landscape) เพื่อเล่น LumaPet',
    splashAria: 'เปิดเกม LumaPet',
    cloudErrors: {
      popupBlocked: 'ป๊อปอัปเข้าสู่ระบบ Google ถูกบล็อก โปรดอนุญาตป๊อปอัปแล้วลองใหม่',
      quota: 'โควตาการบันทึกคลาวด์รายวันเต็มแล้ว และจะรีเซ็ตในวันพรุ่งนี้',
      generic: 'ซิงค์ Cloud Save ไม่สำเร็จ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
    },
    lowHungerNotifTitle: 'Rumah Kucing',
    lowHungerNotifBody: 'เมี้ยว! ความอิ่มของน้องแมวต่ำกว่า 40% แล้ว รีบให้อาหารก่อนจะป่วยนะ!',
  },
  title: {
    backdropAlt: 'ฉากหลังห้องเสื่อทาทามิ Rumah Kucing',
    subtitle: 'ดูแล ลูบหัว และเล่นกับเพื่อนขนฟูแสนน่ารัก',
    newGame: 'เริ่มเกมใหม่',
    continue: 'เล่นต่อ',
    noSaveYet: 'ยังไม่มีข้อมูลบันทึก',
    loadingCloud: 'กำลังโหลดจากคลาวด์...',
    settings: 'ตั้งค่า',
    quit: 'ออก',
    quitConfirmTitle: 'คุณแน่ใจหรือไม่?',
    quitConfirmBody: 'คุณต้องการออกจากเกมใช่หรือไม่?',
    adoptTitle: 'เลือกแมวเพื่อรับเลี้ยง',
    catNameLabel: 'ชื่อเล่นน้องแมว',
    startPlaying: 'เริ่มเล่น',
    soundToggleOn: 'เปิดเสียง',
    soundToggleOff: 'ปิดเสียง',
    soundAlt: 'เสียง',
    googleAccount: 'บัญชี Google',
    linkGoogle: 'เชื่อมบัญชี Google',
    linkGoogleHint: 'บันทึกคลาวด์อัตโนมัติ',
    linkGoogleTooltip: 'เชื่อมบัญชี Google เพื่อบันทึกและโหลดความคืบหน้าจากคลาวด์',
    manageCloudTooltip: 'จัดการบัญชี Google และ Cloud Save',
    connecting: 'กำลังเชื่อมต่อ...',
    cloudSyncing: 'กำลังซิงค์คลาวด์...',
    cloudError: 'ซิงค์ล้มเหลว',
    cloudConnected: 'เชื่อมต่อคลาวด์แล้ว',
    cloudSaveReady: (name, day) => `Cloud Save พร้อม: ${name} (วันที่ ${day})`,
    cloudAutoReady: 'เชื่อมต่อแล้ว · ความคืบหน้าใหม่จะบันทึกขึ้นคลาวด์อัตโนมัติ',
    reloadCloud: 'โหลดใหม่จากคลาวด์',
    unlinkGoogle: 'ยกเลิกเชื่อมบัญชี Google',
    closeAccountMenu: 'ปิดข้อมูลบัญชี',
    closeMessage: 'ปิดข้อความ',
  },
  settings: {
    title: 'ตั้งค่า',
    subtitle: 'ปรับเสียง ภาษา และการแจ้งเตือน',
    languageLabel: 'ภาษา',
    languageDesc: 'เลือกภาษาที่แสดงในเกม',
    volumeTitle: 'ระดับเสียง',
    volumeDesc: 'ปรับระดับความดังของเสียงในเกม',
    volumeAria: 'เปอร์เซ็นต์ระดับเสียง',
    sfxTitle: 'เสียงเอฟเฟกต์ (SFX)',
    sfxDesc: 'เสียงร้อง เคลิ้ม และของเล่น',
    musicTitle: 'เพลงประกอบ',
    musicDesc: 'เพลงหน้าเมนูและในเกม',
    notifTitle: 'แจ้งเตือนให้อาหาร',
    notifDesc: 'เตือนเมื่อความอิ่มต่ำกว่า 40%',
    fullscreenTitle: 'เต็มหน้าจอ (Fullscreen)',
    fullscreenDesc: 'ซ่อนแถบสถานะและปุ่มนำทางของอุปกรณ์',
    clearSave: 'ลบข้อมูลที่บันทึกไว้',
  },
  pause: {
    pausedTitle: 'หยุดชั่วคราว',
    settingsTitle: 'ตั้งค่า',
    diedTitle: (name) => `${name} จากไปแล้ว`,
    diedOldAge: (name, day) =>
      `${name} เติบโตและแก่ชราอย่างมีความสุข ก่อนจากไปอย่างสงบหลังจากอยู่เคียงข้างคุณถึงวันที่ ${day}`,
    diedSickness: (name) =>
      `ดวงวิญญาณของ ${name} ล่องลอยสู่สรวงสวรรค์อย่างสงบเพราะไม่ได้รับการรักษาทันเวลา`,
    careDuration: 'ระยะเวลาดูแล',
    bond: 'ความผูกพัน',
    ballCatches: 'จับของเล่น',
    savingCloud: 'กำลังบันทึกลงคลาวด์...',
    savingAuto: 'กำลังบันทึกอัตโนมัติ...',
    cloudSaveActive: 'Cloud Save ทำงาน · บันทึกอัตโนมัติแล้ว',
    autoSaveActive: 'Auto-Save ทำงาน · บันทึกอัตโนมัติแล้ว',
    resume: 'เล่นต่อ',
    quitGame: 'ออกเกม',
    playAgain: 'เล่นอีกครั้ง',
    mainMenu: 'เมนูหลัก',
  },
  hud: {
    statusPanelLabel: 'แผงสถานะ',
    profileCardLabel: 'โปรไฟล์แมว',
    hunger: 'อิ่ม',
    happiness: 'สุข',
    cleanliness: 'สะอาด',
    energy: 'พลัง',
    health: 'สุขภาพ',
    tags: {
      critical: 'วิกฤต!',
      cranky: 'งอแง!',
      stressed: 'เครียด!',
      sulking: 'งอน',
      dirty: 'สกปรก',
      exhausted: 'หมดแรง!',
      drowsyHeavy: 'ง่วงมาก',
      drowsyLight: 'เริ่มง่วง',
      recoveringLethargic: (hp) => `ฟื้นตัว · เพลีย (${hp}%)`,
      recovering: (hp) => `กำลังฟื้น (${hp}%)`,
      sick: (hp) => `ป่วย! (${hp}%)`,
    },
    dayPhases: {
      pagi: 'เช้า',
      siang: 'กลางวัน',
      senja: 'เย็น',
      malam: 'กลางคืน',
    },
    rain: 'ฝนตก',
    dayFormat: (day, extraHours, clock, weatherLabel) =>
      `วันที่ ${day}${extraHours} · ${clock} ${weatherLabel}`,
    phaseTooltip: {
      pagi: 'เช้า (06:00–11:59) · โบนัสนอน +10% พลัง',
      siang: (label) => `${label} (12:00–17:59) · เล่น +10% สุข · อิ่ม/พลังลด 1.1x`,
      malam: 'กลางคืน (18:00–05:59) · นอน +20% พลัง · พลังลด 1.25x',
      rainExtra: ' | ฝนตก: พลังลด 1.15x · นอน +10% · ง่วง ≤45 · ในบ้านสุขลดช้า 0.9x',
    },
    viewLifeStageTooltip: 'ดูช่วงวัยและการเติบโต',
    pauseLabel: 'เมนูหยุดเกม',
    pauseTooltip: 'เมนูหยุดเกม (Esc)',
    actionMenus: {
      food: 'อาหาร',
      pickFood: 'เลือกอาหาร',
      bath: 'อาบน้ำ',
      pickBath: 'เลือกวิธีอาบน้ำ',
      play: 'เล่น',
      pickPlay: 'เลือกกิจกรรมเล่น',
      pet: 'ลูบตัว',
      pickPet: 'เลือกวิธีลูบ',
      sleep: 'นอน',
      pickSleep: 'เลือกการนอน',
      closeAria: 'ปิดเมนูกิจกรรม',
    },
    changeFoodTooltip: 'คลิกเพื่อเปลี่ยนตัวเลือกอาหาร',
    changeBathTooltip: 'คลิกเพื่อเปลี่ยนตัวเลือกอาบน้ำ',
    changePlayTooltip: 'คลิกเพื่อเปลี่ยนกิจกรรมเล่น',
    changePetTooltip: 'คลิกเพื่อเปลี่ยนวิธีลูบ',
    changeSleepTooltip: 'คลิกเพื่อเปลี่ยนตัวเลือกการนอน',
    manualBrush: 'แปรงขนด้วยมือ',
    manualBrushDesc: '+10 สะอาด ต่อครั้งที่ถู',
    brushDisable: 'ปิดแปรง',
    brushUse: 'ใช้แปรง',
    bathingShort: 'กำลังอาบ...',
    sleepingShort: 'หลับอยู่',
    cleanFull: (stock) => (stock !== undefined ? `สะอาด 100 (${stock})` : 'สะอาด 100'),
    hungerFull: (stock) => `อิ่ม 100 (${stock})`,
    useWithStock: (stock) => `ใช้ (${stock})`,
    toyPlayItem: (toyShort) => `ของเล่น (${toyShort})`,
    playDeltaLine: (happy, energy) => `+${happy} สุข · ${energy} พลัง`,
    miniGamePond: 'มินิเกมบ่อปลา',
    miniGameLockedStage: 'วัยเด็กขึ้นไป',
    sickShort: 'ป่วย',
    hungryShort: 'หิว',
    playBtn: 'เล่น',
    startBtn: 'เริ่ม',
    petShort: 'ลูบเบาๆ',
    petShortDesc: (happy) => `+${happy} สุข`,
    petFull: 'กอดเอาใจ',
    petFullDesc: (happy, hunger) => `+${happy} สุข · ${hunger} อิ่ม`,
    petShortBtn: 'ลูบ',
    petFullBtn: 'เอาใจ',
    autoSleep: 'หลับอัตโนมัติ',
    powerNap: 'งีบสั้น',
    fullRest: 'นอนเต็มอิ่ม',
    wakeUpPenalty: 'ปลุก (-10 สุข)',
    briefNap: 'งีบแป๊บเดียว',
    briefNapDesc: '+20 พลัง · 1.5 น.',
    freshGuard: 'สดชื่น (>85)',
    energyAbove70: 'พลัง >70',
    energy100: 'พลังเต็ม 100',
    dock: {
      foodAria: 'เมนูอาหาร',
      foodTitle: 'ให้อาหาร (ขนมฟรี / อาหารจากร้านค้า)',
      bathLockedSleep: 'ล็อกการอาบน้ำขณะแมวหลับ',
      bathBathing: 'แมวกำลังอาบน้ำในอ่าง!',
      bathAria: 'เมนูอาบน้ำและความสะอาด',
      bathTitle: 'อาบน้ำ (สบู่ฟรี / แชมพู / สปา)',
      playLockedSleep: 'ล็อกการเล่นขณะแมวหลับ',
      playDisabledAria: 'เล่นไม่ได้ขณะป่วยหรือพลัง < 20',
      playDisabledTitle: 'เล่นไม่ได้ (ป่วยหรือพลัง < 20)',
      playAria: (toyName) => `เมนูเล่น (${toyName})`,
      playTitle: 'เล่น (ของเล่น / มินิเกม)',
      petAria: 'เมนูลูบตัว',
      petTitle: 'ลูบตัว (+15 / +25 สุข · +0 พลัง)',
      sleepAria: 'เมนูนอนหลับพักผ่อน',
      sleepTitle: 'นอนพัก (งีบสั้น / นอนเต็มอิ่ม)',
      medRecoveringAria: 'แมวกำลังฟื้นตัวจากยา',
      medHealthyAria: 'ให้ยาได้เฉพาะตอนแมวป่วยเท่านั้น',
      medAria: 'ให้ยา',
      medRecoveringSickTitle: 'กำลังฟื้นตัว (หายป่วยที่ 90%)',
      medRecoveringTitle: 'กำลังฟื้นฟูสุขภาพสู่ 100%',
      medHealthyTitle: 'ให้ยาได้เฉพาะตอนแมวป่วยเท่านั้น',
      medSickTitle: 'ให้ยา (น้องแมวกำลังป่วย!)',
      shopLabel: 'ร้านค้า',
    },
  },
  shop: {
    title: 'ร้านค้า',
    closeAria: 'ปิดร้านค้า',
    tabs: {
      makanan: 'อาหาร',
      mandi: 'อาบน้ำ',
      mainan: 'ของเล่น',
      kostum: 'แฟชั่น',
      rumah: 'ห้อง',
      kasur: 'ที่นอน',
    },
    sleepingNotice: 'แมวกำลังหลับ — ล็อกการอาบน้ำจนกว่าจะตื่น',
    bathingNotice: 'แมวกำลังอาบน้ำอยู่ในอ่าง!',
    bathFilters: {
      all: 'ทั้งหมด',
      tub: 'อ่างอาบน้ำ',
      consumable: 'สบู่และสปา',
    },
    bathTip: 'เคล็ดลับ: ลากอ่างอาบน้ำบนพื้นเพื่อย้ายตำแหน่งได้',
    bedTip: 'เคล็ดลับ: ลากที่นอนบนพื้นเพื่อย้ายตำแหน่งได้',
    bathConsumablesHeading: 'สบู่และชุดอาบน้ำ',
    bathingBtn: 'กำลังอาบน้ำ',
    sleepingBtn: 'กำลังหลับ',
    costumeFilters: {
      all: 'ทั้งหมด',
      hat: 'หมวก',
      glasses: 'แว่นตา',
    },
    slotLabels: {
      hat: 'หมวกจิ๋ว',
      glasses: 'แว่นตา',
      scarf: 'ผ้าพันคอ',
    },
  },
  minigame: {
    title: 'มินิเกมจับปลา',
    closeAria: 'ปิดมินิเกม',
    prompt: (name) => `ช่วย ${name} จับปลาในบ่อน้ำ!`,
    rainBonusHint: '(ฝนตก: +5 สุข · -2 สะอาด)',
    scoreLabel: (score) => `คะแนน: ${score}`,
    finishedTitle: (score) => `จบเกม! ได้ ${score} คะแนน`,
    rewardSummary: (coins, happy, rainExtra, cleanCost) =>
      `รางวัล: +${coins} เหรียญ · +${happy} สุข${rainExtra ? ' (ฝนตก +5)' : ''} · -10 พลัง · -5 อิ่ม · -${cleanCost} สะอาด · +12 XP ความผูกพัน`,
    claimBtn: 'รับรางวัล',
  },
  lifestage: {
    title: 'ช่วงวัยและการเติบโต',
    phaseTitle: (name, stageLabel) => `${name} · วัย${stageLabel}`,
    durationPrefix: (calendar, duration) => `${calendar} · ระยะเวลา ${duration}`,
    seniorAgeLabel: 'วัยชรา (วันที่ 12–18)',
    toNextStage: 'ความคืบหน้าสู่วัยถัดไป',
    remainingBaby: (mins, hours) => `เหลือ ${mins}น. · ชม. ${hours}/73`,
    remainingDaysHours: (days, hrs) => `เหลือ ${days}ว. ${hrs}ชม.`,
    remainingHours: (hrs) => `เหลือ ${hrs}ชม.`,
    mistakesLabel: (count) => `พลาด: ${count} ครั้ง`,
    nowBadge: 'ปัจจุบัน',
    branchGuideTitle: 'สายวิวัฒนาการวัยผู้ใหญ่ (ขึ้นกับ Care Mistakes ช่วงวัยเด็กและวัยรุ่น)',
  },
  catalog: {
    breeds: {
      oren: { label: 'ส้มลายสลิด', personality: 'ร่าเริงและชอบกินขนม' },
      mochi: { label: 'ขาวครีม', personality: 'ขี้อ้อนและชอบกอด' },
      arang: { label: 'ทักซิโด้ดำ', personality: 'ฉลาดและจับของเล่นเก่ง' },
      abu: { label: 'เทาเงิน', personality: 'สงบและขี้สงสัย' },
    },
    personalities: {
      playful: 'ขี้เล่น',
      lazy: 'ชิลๆ',
      shy: 'ขี้อาย',
    },
    foodItems: {
      snack: {
        name: 'ขนมทานเล่น',
        shortName: 'ขนมทานเล่น',
        description: '+15 อิ่ม · +10 สุข',
      },
      main_food: {
        name: 'อาหารมื้อหลัก',
        shortName: 'อาหารหลัก',
        description: '+30 อิ่ม · +5 สุข',
      },
      special_food: {
        name: 'อาหารพิเศษจานใหญ่',
        shortName: 'อาหารพิเศษ',
        description: '+50 อิ่ม · +15 สุข',
      },
    },
    bathItems: {
      basic_soap: {
        name: 'สบู่พื้นฐาน / ผ้าเปียก',
        shortName: 'สบู่พื้นฐาน',
        description: '+35 สะอาด · +5 สุข',
      },
      shampoo_foam: {
        name: 'แชมพูและโฟมอาบน้ำ',
        shortName: 'แชมพูโฟม',
        description: '+60 สะอาด · +10 สุข',
      },
      spa_bath: {
        name: 'อาบน้ำสปา / บาธบอมบ์',
        shortName: 'อาบน้ำสปา',
        description: '+100 สะอาด · +20 สุข',
      },
    },
    sleepOptions: {
      power_nap: {
        name: 'งีบสั้น (Power Nap)',
        shortName: 'งีบสั้น',
        description: '+40 พลัง · +5 สุข · -5 อิ่ม',
      },
      full_rest: {
        name: 'นอนพักเต็มอิ่ม',
        shortName: 'นอนเต็มอิ่ม',
        description: '+100 พลัง · +10 สุข · -12 อิ่ม · -2 สะอาด',
      },
    },
    lifeStages: {
      baby: {
        label: 'ทารก',
        shortLabel: 'ทารก',
        realDurationLabel: '60 นาที',
        calendarLabel: 'วันที่ 0–3 (ชม. 0–73)',
        decayNote: 'อิ่ม/สุข -20/15น. · สะอาด -20/25น. · พลัง -20/18น.',
      },
      child: {
        label: 'เด็ก',
        shortLabel: 'เด็ก',
        realDurationLabel: '24 ชม.',
        calendarLabel: 'วันที่ 1',
        decayNote: 'อิ่ม/สุข -20/50น. · สะอาด -20/80น. · พลัง -20/60น.',
      },
      teen: {
        label: 'วัยรุ่น',
        shortLabel: 'วัยรุ่น',
        realDurationLabel: '48 ชม.',
        calendarLabel: 'วันที่ 2–3',
        decayNote: 'อิ่ม/สุข -20/60น. · สะอาด -20/95น. · พลัง -20/75น.',
      },
      adult: {
        label: 'ผู้ใหญ่',
        shortLabel: 'ผู้ใหญ่',
        realDurationLabel: '8 วัน',
        calendarLabel: 'วันที่ 4–11',
        decayNote: 'อิ่ม/สุข -20/75–90น. · สะอาด -20/120–140น. · พลัง -20/90–110น.',
      },
      senior: {
        label: 'ชรา',
        shortLabel: 'ชรา',
        realDurationLabel: '7 วัน (จากไป > วันที่ 18)',
        calendarLabel: 'วันที่ 12–18',
        decayNote: 'อิ่ม/สุข -20/20–30น. · สะอาด -20/35–45น. · พลัง -20/25–35น.',
      },
    },
    adultBranches: {
      prima: {
        label: 'ผู้ใหญ่สมบูรณ์',
        description: 'ดูแลยอดเยี่ยม: ค่าสถานะลดช้า (90/140/110 น.) และโบนัส +1 เหรียญ',
        maxMistakesLabel: '0–2 ครั้งพลาด',
      },
      mandiri: {
        label: 'ผู้ใหญ่สมดุล',
        description: 'คล่องแคล่วสมดุล ความทนทานระดับมาตรฐาน (82.5/130/100 น.)',
        maxMistakesLabel: '3–5 ครั้งพลาด',
      },
      sensitif: {
        label: 'ผู้ใหญ่อ่อนไหว',
        description: 'ขี้อ้อนกว่าปกติ และหิวหรือเหงาเร็วขึ้น (75/120/90 น.)',
        maxMistakesLabel: '6+ ครั้งพลาด',
      },
    },
    backgrounds: {
      apartment: {
        name: 'อพาร์ตเมนต์ในเมือง',
        description: 'ห้องพักแสนอบอุ่นพร้อมวิวเมืองนอกหน้าต่าง',
      },
      tatami: {
        name: 'ห้องเสื่อทาทามิ',
        description: 'ห้องญี่ปุ่นอบอุ่นปูเสื่อทาทามิชมสวนไผ่',
      },
      classic_home: {
        name: 'บ้านไม้คลาสสิก',
        description: 'ห้องนั่งเล่นสีเซจอบอุ่นพร้อมวิวสวน',
      },
    },
    beds: {
      kasur_semangka: {
        name: 'ที่นอนแตงโม',
        description: 'เบาะแตงโมสดใสพร้อมใบไม้เขียวน่ารัก',
      },
      keranjang_rajut: {
        name: 'ตะกร้าถักไหมพรม',
        description: 'ตะกร้าสานแสนอบอุ่นพร้อมผ้าห่มลายสก๊อตแดง',
      },
      kasur_donat: {
        name: 'ที่นอนโดนัท',
        description: 'เบาะโดนัทสตรอว์เบอร์รีโรยเกล็ดน้ำตาลหลากสี',
      },
      tenda_kerajaan: {
        name: 'เต็นท์เจ้าชาย',
        description: 'เต็นท์นอนสีน้ำเงินราตรีประดับพระจันทร์เสี้ยวทอง',
      },
      kasur_kucing: {
        name: 'เบาะแมวเหมียว',
        description: 'เบาะแมวสีส้มมาตรฐานพร้อมหมอนแดงนุ่มนิ่ม',
      },
    },
    bathtubs: {
      bak_kucing: {
        name: 'อ่างอาบน้ำแมว',
        description: 'อ่างแมวพื้นฐานพร้อมฟองนุ่มและฝักบัวปลา',
      },
      bak_ikan: {
        name: 'อ่างอาบน้ำปลา',
        description: 'อ่างปลาสีฟ้าสดใสพร้อมปลาทองและก๊อกน้ำ',
      },
      bak_onsen: {
        name: 'ถังไม้ออนเซ็น',
        description: 'ถังอาบน้ำอุ่นสไตล์ญี่ปุ่นพร้อมกระบวยไม้',
      },
      bak_kerang: {
        name: 'อ่างเปลือกหอย',
        description: 'อ่างเปลือกหอยมุกสีชมพูพร้อมฟองนุ่มละมุน',
      },
      bak_batu: {
        name: 'อ่างหินธรรมชาติ',
        description: 'บ่อหินธรรมชาติพร้อมรางน้ำไม้ไผ่และใบไม้สด',
      },
    },
    toys: {
      yarn_ball: {
        name: 'ลูกบอลไหมพรม',
        shortName: 'ไหมพรม',
        bonusText: 'สมดุล · +14 สุข/ครั้ง',
      },
      laser_pointer: {
        name: 'เลเซอร์พอยน์เตอร์',
        shortName: 'เลเซอร์',
        bonusText: '+35% สุข · วิ่งไว (+16 จับ)',
      },
      feather_wand: {
        name: 'ไม้ตกแมวขนนก',
        shortName: 'ขนนก',
        bonusText: 'ประหยัดพลัง 35% · +18 สุข/ครั้ง',
      },
      toy_mouse: {
        name: 'หนูไขลาน',
        shortName: 'หนู',
        bonusText: 'ประหยัดพลังที่สุด · +3 เหรียญ/ครั้ง',
      },
    },
    accessories: {
      beret_merah: { name: 'หมวกเบเรต์จิตรกร' },
      topi_pesta: { name: 'หมวกปาร์ตี้ดาว' },
      mahkota_emas: { name: 'มงกุฎราชา' },
      kacamata_bulat: { name: 'แว่นตากลม' },
      kacamata_hitam: { name: 'แว่นกันแดดเท่ๆ' },
      kacamata_hati: { name: 'แว่นหัวใจ' },
      syal_polkadot: { name: 'ผ้าพันคอลายจุด' },
      syal_garis: { name: 'ผ้าพันคอลายทาง' },
      dasi_kupu: { name: 'โบว์หูกระต่าย' },
    },
  },
  stage: {
    moods: {
      calm: 'สงบและสบายใจ',
      recoverBed: 'ฟื้นตัว 2 เท่าบนเตียง',
      recoverSick: 'กำลังฟื้น (ยังป่วย)',
      almostRecovered: 'เกือบหายดีแล้ว',
      sick: 'กำลังป่วย',
      held: 'กำลังถูกอุ้ม',
      bathing: 'กำลังอาบน้ำ',
      autoSleep: 'หลับอัตโนมัติ',
      powerNap: 'งีบสั้น',
      deepSleep: 'หลับสนิท',
      dozing: 'นอนเล่นบนพื้น',
      eating: 'กินอย่างเอร็ดอร่อย',
      playingToy: (toyName) => `เล่น${toyName}`,
      rolling: 'กลิ้งเล่นน่ารัก',
      purring: 'อ้อนสุดๆ',
      stretching: 'บิดขี้เกียจ',
      starving: 'หิวจัด!',
      hungryCranky: 'งอแงขอกิน',
      sulking: 'กำลังงอน',
      needsCleaning: 'ควรอาบน้ำ',
      veryDrowsy: 'ง่วงนอนมาก',
      gettingDrowsy: 'เริ่มง่วง',
      veryHappy: 'ร่าเริงสุดๆ',
    },
    warnings: {
      recovering: (name, health, sleeping) =>
        `${name} กำลังฟื้นตัว (${health}%) — อาการป่วยจะหายเมื่อสุขภาพถึง 90%${
          sleeping ? ' · ฟื้นตัวไวขึ้น 2 เท่าบนเตียง!' : ''
        }`,
      sickOverwork: (name) =>
        `ทำงานหนักเกินไป! ${name} ป่วยเพราะพลัง 0 นานเกินไป — รีบให้ยาก่อนสุขภาพหมด`,
      sickDirtyZero: (name) =>
        `ความสะอาด 0%! ${name} ป่วยแล้ว — อาบน้ำและให้ยาก่อนสุขภาพหมด`,
      sickChronicDirty: (name) =>
        `${name} ป่วยเพราะสกปรกบ่อยเกินไป! รีบให้ยาก่อนสุขภาพหมด`,
      sickGeneric: (name, health) =>
        `${name} กำลังป่วย (สุขภาพ ${health}%)! รีบให้ยาก่อนถึง 0%`,
      autoSleep: (name, timer) =>
        `หมดแรงแล้ว! ${name} เข้าสู่ [หลับอัตโนมัติ] (${timer}) · ล็อกการเล่นและอาบน้ำ`,
      starving: (name) => `${name} หิวจัด (0%)! อาการแย่ลง — รีบให้อาหารทันที`,
      veryHungry: (name) => `${name} หิวมาก (<20%)! สุขภาพเริ่มลด — รีบให้อาหาร`,
      veryDrowsy: (name, energy) =>
        `${name} ง่วงมาก (พลัง ${energy}%)! ปฏิเสธการเล่น — พาไปนอนเลย`,
      lateNightDrowsy: (name) =>
        `${name} ง่วงจัดช่วงดึก (01:00–06:00)! ไม่ยอมวิ่งและใช้พลัง 5 เท่า นอนเพื่อฟื้น 3 เท่า`,
      hungryCranky: (name) => `${name} เริ่มงอแงหิวข้าว (<40%)! ได้เวลาให้อาหาร`,
      veryDirty: (name) => `${name} สกปรกมาก (<15%)! สุขภาพเริ่มลด — รีบอาบน้ำ`,
      gettingDirty: (name) => `${name} เริ่มสกปรก (<40%)! อาบน้ำเพื่อไม่ให้ความสุขลด`,
      drowsyLight: (name, energy, tags) =>
        `${name} เริ่มง่วง (พลัง ${energy}%${tags ? ` · ${tags}` : ''})! กิจกรรมใช้พลังเพิ่ม 1.15x`,
      sulking: (name) => `${name} กำลังงอน (<40% สุข)! ผลจากการเล่นและลูบลดลงชั่วคราว`,
    },
    toasts: {
      bondLevelUp: (level) => `ความผูกพัน Lv. ${level}! +15 เหรียญ`,
      coinGain: (coins) => `+${coins} เหรียญ`,
      evolutionExtra: (stageLabel, extra) => `วิวัฒนาการ: วัย${stageLabel} (${extra})!`,
      evolution: (stageLabel) => `วิวัฒนาการ: วัย${stageLabel}!`,
      miniGameUnlocked: 'ปลดล็อกมินิเกม',
      snackCooldown: (timer) => `ขนมฟรีคูลดาวน์ (${timer})`,
      hungerFull: 'ความอิ่มเต็ม 100 แล้ว!',
      foodInBowlSleeping: (itemShort) => `วาง ${itemShort} ในชามแล้ว (ยังหลับอยู่)`,
      fedSuccess: (itemShort, hunger, happy) => `${itemShort}: +${hunger} อิ่ม · +${happy} สุข`,
      bathCompleteSpa: (happy) => `สะอาดเอี่ยม 100% · +${happy} สุข`,
      bathComplete: (clean, happy) => `+${clean} สะอาด · +${happy} สุข`,
      bathLockedSleep: 'ล็อกการอาบน้ำขณะหลับ!',
      bathAlreadyInProgress: (name) => `${name} กำลังเดินไป/อาบน้ำในอ่างอยู่แล้ว!`,
      cleanFull: 'ความสะอาดเต็ม 100 แล้ว!',
      soapCooldown: (timer) => `สบู่พื้นฐานคูลดาวน์ (${timer})`,
      bathImmediate: (itemShort) => `อาบน้ำทันที (${itemShort})!`,
      bathWalking: (itemShort) => `กำลังเดินไปอ่างอาบน้ำ (${itemShort})...`,
      sleepingZzz: 'Zzz... กำลังหลับ',
      waitBathing: 'รอสักครู่ กำลังอาบน้ำ!',
      petCooldown: (isFull, timer) => `${isFull ? 'กอดเอาใจ' : 'ลูบเบาๆ'} คูลดาวน์ (${timer})`,
      petSuccess: (happy, isSulking, hungerDelta, isRain) => {
        const sulkTag = isSulking ? ' (งอนอยู่)' : '';
        const hTag = hungerDelta < 0 ? ` · ${hungerDelta} อิ่ม` : '';
        const rTag = isRain ? ' · อบอุ่นกลางสายฝน' : '';
        return `+${happy} สุข${sulkTag} · +0 พลัง${hTag}${rTag}`;
      },
      alreadySleeping: 'แมวกำลังหลับอยู่!',
      energyFull: 'พลังเต็ม 100 แล้ว!',
      tooFreshToSleep: 'ยังสดชื่น (>85 พลัง) ในตอนกลางวัน! ไม่ยอมนอน',
      onlyBriefNapAllowed: 'พลัง >70 ตอนกลางวัน! ยอมงีบสั้นเท่านั้น',
      briefDayNapStart: (energy) => `ยังสดชื่นอยู่ — งีบสั้น (1.5 น. · +${energy} พลัง)`,
      sleepStart: (shortName, mins, bonusText, desc) =>
        `${shortName} (${mins} น.${bonusText}): ${desc}`,
      sleepBonusMorning: 'เช้า +10%',
      sleepBonusNight: 'คืน +20%',
      sleepBonusRain: 'ฝน +10%',
      sleepBonusLateNight: 'ฟื้น 3x',
      sleepInterrupted: 'ถูกปลุกระหว่างหลับ! -10 สุข',
      miniGameNeedChild: 'มินิเกมปลดล็อกในวัยเด็ก!',
      playLockedSleep: 'ล็อกการเล่นขณะหลับ!',
      miniGameNeedHeal: 'กำลังป่วย — รักษาให้หายก่อนเล่นมินิเกม!',
      miniGameLowEnergy: 'พลัง < 20! เหนื่อยเกินกว่าจะเล่นมินิเกม',
      tooHungry: 'หิวเกินไป! ให้อาหารก่อน',
      miniGameCooldown: (timer) => `มินิเกมคูลดาวน์ (${timer})`,
      bathingNow: 'กำลังอาบน้ำอยู่ในอ่าง!',
      playSickBlocked: 'กำลังป่วย — งดเล่นของเล่น!',
      playLowEnergyBlocked: 'ง่วงมาก (≤20 พลัง)! งดเล่นของเล่น',
      playCooldown: (timer) => `ของเล่นคูลดาวน์ (${timer})`,
      playLateNightNotice: (cost, happyFull) =>
        `ง่วงจัดช่วงดึก (01:00–06:00)! ใช้พลัง 5x (-${cost} พลัง${happyFull ? ' · +0 สุข' : ''})`,
      playHappyFullDrowsy: (cost) => `เริ่มง่วง · เล่นใช้พลัง 1.15x (-${cost} พลัง · +0 สุข)`,
      playHappyFull: 'ความสุขเต็ม 100 · +0 สุข',
      playSulking: (happy, drowsyPenalty) =>
        `งอน (<40) · ได้ผลน้อยลง (+${happy} สุข${drowsyPenalty ? ' · พลัง 1.15x' : ''})`,
      playDrowsyPenalty: (cost, midday) =>
        `เริ่มง่วง · ใช้พลัง 1.15x (-${cost} พลัง${midday ? ' · โบนัสกลางวัน +10%' : ''})`,
      playWeakened: (happy) => `อ่อนเพลีย · ได้ผลลดลง (+${happy} สุข)`,
      playMiddayBonus: (happy) => `เล่นกลางวัน! +${happy} สุข (โบนัส +10%)`,
      medAlreadyGiven: 'ให้ยาแล้ว · กำลังค่อยๆ ฟื้นตัว',
      medNotNeeded: (name) => `${name} แข็งแรงดี! ใช้ยาเมื่อป่วยเท่านั้น`,
      medGiven: 'ให้ยาแล้ว · เริ่มฟื้นตัว (หายป่วยที่ 90%)',
      miniGameSummaryFull: (e, hun, cln) => `+0 สุข · -${e} พลัง · -${hun} อิ่ม · -${cln} สะอาด`,
      miniGameSummaryReduced: (happy, e, cln) =>
        `+${happy} สุข (ลดลง) · -${e} พลัง · -${cln} สะอาด`,
      miniGameSummaryNormal: (happy, tags, e, hun, cln) =>
        `+${happy} สุข${tags} · -${e} พลัง · -${hun} อิ่ม · -${cln} สะอาด`,
      newBackground: (name) => `ห้องใหม่: ${name}!`,
      newBed: (name) => `ที่นอนใหม่: ${name}!`,
      newBathtub: (name) => `อ่างอาบน้ำใหม่: ${name}!`,
      newToy: (name) => `ของเล่นใหม่: ${name}!`,
      newCostume: (name) => `แฟชั่นใหม่: ${name}!`,
      awaySummary: (hungerLost, healthLost) =>
        `ไม่อยู่นาน · อิ่ม -${hungerLost}%${healthLost >= 1 ? ` · สุขภาพ -${healthLost}%` : ''}`,
      phaseBannerPagi: 'เช้าแล้ว (06:00) · นอนเพิ่มพลัง +10%',
      phaseBannerSiang: 'กลางวันแล้ว (12:00) · เล่น +10% สุข',
      phaseBannerMalam: 'ค่ำแล้ว (18:00) · นอนเพิ่มพลัง +20%',
      rainStart: (phaseLabel) => `ฝนตกช่วง${phaseLabel} · นอน +10% พลัง`,
      rainStop: (phaseLabel) => `ฝนหยุดแล้ว · ท้องฟ้า${phaseLabel}สดใส`,
      newDayCoins: (day) => `วันที่ ${day}! +10 เหรียญ`,
      overworkSick: 'ทำงานหนักเกินไป! พลัง 0 นานเกิน — แมวป่วยแล้ว!',
      sleepCompleteAuto: (energy) => `หลับอัตโนมัติเสร็จสิ้น! ฟื้น +${energy} พลัง`,
      sleepCompletePower: (energy, happy) => `งีบสั้นเสร็จสิ้น! +${energy} พลัง · +${happy} สุข`,
      sleepCompleteFull: (energy, happy) => `นอนเต็มอิ่มเสร็จสิ้น! +${energy} พลัง · +${happy} สุข`,
      drowsyNoticeNight: 'เริ่มง่วง (≤50 พลัง · กลางคืน) · ได้เวลานอน!',
      drowsyNoticeRain: 'เริ่มง่วง (≤45 พลัง · ฝนตก) · อากาศน่านอน!',
      drowsyNoticeNormal: 'เริ่มง่วง (21–40 พลัง) · พักผ่อนกันเถอะ!',
      drowsyHeavyLateNight: '01:00–06:00: ง่วงจัด! ไม่ยอมวิ่ง · นอนฟื้นไวขึ้น 3 เท่า',
      drowsyHeavyNormal: 'ง่วงมาก (1–20 พลัง)! รีบพาเข้านอน',
      autoSleepStart: (energy) => `หมดแรงสุดขีด! [หลับอัตโนมัติ] 4 น. (+${energy} พลัง)`,
      sickCleared90: 'สุขภาพ 90%! อาการป่วยหายแล้ว!',
      recovered100: (name) => `${name} หายดี 100% แล้ว!`,
      becameSickHealth: (health, name) => `สุขภาพ ${health}%! ${name} ป่วยแล้ว!`,
      becameSickDirtyZero: 'ความสะอาด 0%! แมวป่วยแล้ว!',
      becameSickChronicDirty: 'สกปรกบ่อยเกินไป! แมวป่วยแล้ว',
      playSessionComplete: (happy, energy, hunger) =>
        `เล่นเสร็จแล้ว: +${happy} สุข · -${energy} พลัง · -${hunger} อิ่ม`,
      brushLockedSleep: 'ล็อกการแปรงขนขณะหลับ!',
      brushHint: 'ถูตัวแมวเบาๆ (+10 สะอาด)',
      brushFullWangi: 'สะอาด 100%! หอมฟุ้ง ✨',
      brushGain: (pts) => `+${pts} สะอาด`,
      lateNightNoZoom: 'ง่วงจัด (01:00–06:00)! ไม่ยอมวิ่ง',
      playMiddayTag: 'กลางวัน +10%',
      rainTag: 'ฝนตก +5',
    },
  },
};

const VI_TRANSLATIONS: Translations = {
  languageTitle: 'Ngôn ngữ',
  common: {
    back: 'Quay lại',
    done: 'Xong',
    close: 'Đóng',
    yes: 'Có',
    no: 'Không',
    active: 'Bật',
    off: 'Tắt',
    unsupported: 'Không hỗ trợ',
    enable: 'Bật lên',
    enabled: 'Bật',
    blocked: 'Đã chặn',
    allow: 'Cho phép',
    coins: 'Xu',
    day: 'Ngày',
    days: 'Ngày',
    hourShort: 'g',
    minuteShort: 'ph',
    secShort: 'gi',
    use: 'Dùng',
    usedEquipped: 'Đang dùng',
    buy: 'Mua',
    buyInShop: 'Mua ở Cửa hàng',
    giveFree: 'Cho miễn phí',
    useFree: 'Dùng miễn phí',
    equip: 'Trang bị',
    unequip: 'Tháo ra',
    unequipAll: 'Tháo tất cả',
    all: 'Tất cả',
  },
  app: {
    docTitle: 'Rumah Kucing — Game Nuôi Mèo Ảo',
    closedTitle: 'Đã Đóng Ứng Dụng',
    closedDesc: 'Cảm ơn bạn đã chơi LumaPet. Bạn có thể đóng trang này.',
    reopen: 'Mở Lại',
    portraitTitle: 'Cần Chế Độ Ngang',
    portraitDesc: 'Vui lòng xoay ngang thiết bị (Landscape) để chơi LumaPet.',
    splashAria: 'Mở đầu LumaPet',
    cloudErrors: {
      popupBlocked: 'Cửa sổ đăng nhập Google bị chặn. Hãy cho phép popup và thử lại.',
      quota: 'Đã đạt hạn mức Cloud Save hàng ngày và sẽ đặt lại vào ngày mai.',
      generic: 'Không thể đồng bộ Cloud Save. Hãy kiểm tra kết nối mạng.',
    },
    lowHungerNotifTitle: 'Rumah Kucing',
    lowHungerNotifBody: 'Meow! Độ no của mèo dưới 40% rồi. Hãy cho ăn ngay trước khi bé bị ốm!',
  },
  title: {
    backdropAlt: 'Phông nền phòng tatami Rumah Kucing',
    subtitle: 'Chăm sóc, vuốt ve và vui chơi cùng người bạn lông xù',
    newGame: 'Chơi Mới',
    continue: 'Tiếp Tục',
    noSaveYet: 'Chưa có dữ liệu lưu',
    loadingCloud: 'Đang tải từ Cloud...',
    settings: 'Cài Đặt',
    quit: 'Thoát',
    quitConfirmTitle: 'Bạn có chắc không?',
    quitConfirmBody: 'Bạn có chắc muốn thoát khỏi trò chơi?',
    adoptTitle: 'Chọn Mèo Để Nhận Nuôi',
    catNameLabel: 'Tên Gọi Của Mèo',
    startPlaying: 'Bắt Đầu Chơi',
    soundToggleOn: 'Bật âm thanh',
    soundToggleOff: 'Tắt âm thanh',
    soundAlt: 'Âm thanh',
    googleAccount: 'Tài khoản Google',
    linkGoogle: 'Liên kết Google',
    linkGoogleHint: 'Tự động lưu Cloud',
    linkGoogleTooltip: 'Liên kết tài khoản Google để lưu và tải tiến trình từ đám mây',
    manageCloudTooltip: 'Quản lý tài khoản Google & Cloud Save',
    connecting: 'Đang kết nối...',
    cloudSyncing: 'Đang đồng bộ...',
    cloudError: 'Lỗi đồng bộ',
    cloudConnected: 'Đã kết nối Cloud',
    cloudSaveReady: (name, day) => `Cloud Save sẵn sàng: ${name} (Ngày ${day})`,
    cloudAutoReady: 'Đã kết nối · Tiến trình mới sẽ tự động lưu lên đám mây',
    reloadCloud: 'Tải lại từ Cloud',
    unlinkGoogle: 'Hủy liên kết Google',
    closeAccountMenu: 'Đóng thông tin tài khoản',
    closeMessage: 'Đóng thông báo',
  },
  settings: {
    title: 'Cài Đặt',
    subtitle: 'Điều chỉnh âm thanh, ngôn ngữ & thông báo',
    languageLabel: 'Ngôn ngữ',
    languageDesc: 'Chọn ngôn ngữ hiển thị trong game',
    volumeTitle: 'Âm Lượng',
    volumeDesc: 'Điều chỉnh mức âm lượng trò chơi',
    volumeAria: 'Phần trăm âm lượng',
    sfxTitle: 'Hiệu Ứng Âm Thanh',
    sfxDesc: 'Tiếng kêu, rừ rừ & đồ chơi',
    musicTitle: 'Nhạc Nền',
    musicDesc: 'Nhạc menu & trong game',
    notifTitle: 'Thông Báo Cho Ăn',
    notifDesc: 'Nhắc khi độ no xuống dưới 40%',
    fullscreenTitle: 'Toàn Màn Hình',
    fullscreenDesc: 'Ẩn thanh trạng thái & điều hướng thiết bị',
    clearSave: 'Xóa Dữ Liệu Đã Lưu',
  },
  pause: {
    pausedTitle: 'Tạm Dừng',
    settingsTitle: 'Cài Đặt',
    diedTitle: (name) => `${name} Đã Qua Đời`,
    diedOldAge: (name, day) =>
      `${name} đã già đi trong yêu thương và ra đi thanh thản sau khi ở bên bạn đến Ngày ${day}.`,
    diedSickness: (name) =>
      `Linh hồn ${name} đã bay về trời bình yên vì bệnh tình không kịp chữa trị.`,
    careDuration: 'Thời Gian Chăm',
    bond: 'Gắn Kết',
    ballCatches: 'Bắt Đồ Chơi',
    savingCloud: 'Đang lưu lên Cloud...',
    savingAuto: 'Đang tự động lưu...',
    cloudSaveActive: 'Cloud Save Bật · Đã tự động lưu',
    autoSaveActive: 'Auto-Save Bật · Đã tự động lưu',
    resume: 'Tiếp Tục',
    quitGame: 'Về Menu',
    playAgain: 'Chơi Lại',
    mainMenu: 'Menu Chính',
  },
  hud: {
    statusPanelLabel: 'Bảng Trạng Thái',
    profileCardLabel: 'Hồ Sơ Mèo',
    hunger: 'No',
    happiness: 'Vui',
    cleanliness: 'Sạch',
    energy: 'Năng lượng',
    health: 'Sức khỏe',
    tags: {
      critical: 'Nguy cấp!',
      cranky: 'Đòi ăn!',
      stressed: 'Căng thẳng!',
      sulking: 'Dỗi rồi',
      dirty: 'Bẩn',
      exhausted: 'Kiệt sức!',
      drowsyHeavy: 'Rất buồn ngủ',
      drowsyLight: 'Buồn ngủ',
      recoveringLethargic: (hp) => `Hồi phục · Yếu (${hp}%)`,
      recovering: (hp) => `Đang hồi (${hp}%)`,
      sick: (hp) => `Ốm! (${hp}%)`,
    },
    dayPhases: {
      pagi: 'Sáng',
      siang: 'Trưa',
      senja: 'Chiều',
      malam: 'Đêm',
    },
    rain: 'Mưa',
    dayFormat: (day, extraHours, clock, weatherLabel) =>
      `Ngày ${day}${extraHours} · ${clock} ${weatherLabel}`,
    phaseTooltip: {
      pagi: 'Buổi Sáng (06:00–11:59) · Ngủ thưởng +10% Năng lượng',
      siang: (label) => `${label} (12:00–17:59) · Chơi +10% Vui · No/Năng lượng 1.1x`,
      malam: 'Ban Đêm (18:00–05:59) · Ngủ +20% Năng lượng · Năng lượng 1.25x',
      rainExtra: ' | Mưa: Năng lượng 1.15x · Ngủ +10% · Buồn ngủ ≤45 · Trong nhà Vui 0.9x',
    },
    viewLifeStageTooltip: 'Xem Giai Đoạn Phát Triển & Tiến Hóa',
    pauseLabel: 'Menu Tạm Dừng',
    pauseTooltip: 'Menu Tạm Dừng (Esc)',
    actionMenus: {
      food: 'Thức ăn',
      pickFood: 'Chọn Thức ăn',
      bath: 'Tắm rửa',
      pickBath: 'Chọn Cách tắm',
      play: 'Chơi đùa',
      pickPlay: 'Chọn Hoạt động',
      pet: 'Vuốt ve',
      pickPet: 'Chọn Kiểu vuốt',
      sleep: 'Ngủ nghỉ',
      pickSleep: 'Chọn Kiểu ngủ',
      closeAria: 'Đóng menu hành động',
    },
    changeFoodTooltip: 'Nhấn để đổi loại thức ăn',
    changeBathTooltip: 'Nhấn để đổi cách tắm',
    changePlayTooltip: 'Nhấn để đổi trò chơi',
    changePetTooltip: 'Nhấn để đổi kiểu vuốt ve',
    changeSleepTooltip: 'Nhấn để đổi giấc ngủ',
    manualBrush: 'Chải Lông Thủ Công',
    manualBrushDesc: '+10 Sạch mỗi lần chà',
    brushDisable: 'Tắt chổi',
    brushUse: 'Dùng chổi',
    bathingShort: 'Đang tắm...',
    sleepingShort: 'Đang ngủ',
    cleanFull: (stock) => (stock !== undefined ? `Sạch 100 (${stock})` : 'Sạch 100'),
    hungerFull: (stock) => `No 100 (${stock})`,
    useWithStock: (stock) => `Dùng (${stock})`,
    toyPlayItem: (toyShort) => `Đồ chơi (${toyShort})`,
    playDeltaLine: (happy, energy) => `+${happy} Vui · ${energy} Năng lượng`,
    miniGamePond: 'Mini Game Ao Cá',
    miniGameLockedStage: 'Từ Tuổi Nhỏ+',
    sickShort: 'Đang ốm',
    hungryShort: 'Đói',
    playBtn: 'Chơi',
    startBtn: 'Bắt đầu',
    petShort: 'Vuốt Nhẹ',
    petShortDesc: (happy) => `+${happy} Vui`,
    petFull: 'Ôm Ấp Yêu Thương',
    petFullDesc: (happy, hunger) => `+${happy} Vui · ${hunger} No`,
    petShortBtn: 'Vuốt',
    petFullBtn: 'Yêu thương',
    autoSleep: 'Tự Ngủ',
    powerNap: 'Ngủ Ngắn',
    fullRest: 'Ngủ Sâu',
    wakeUpPenalty: 'Đánh thức (-10 Vui)',
    briefNap: 'Chợp Mắt Nhanh',
    briefNapDesc: '+20 Năng lượng · 1.5 ph',
    freshGuard: 'Tỉnh táo (>85)',
    energyAbove70: 'Năng lượng >70',
    energy100: 'Đầy 100',
    dock: {
      foodAria: 'Menu Thức ăn',
      foodTitle: 'Cho ăn (Bánh miễn phí / Đồ ăn cửa hàng)',
      bathLockedSleep: 'Khóa tắm khi mèo đang ngủ',
      bathBathing: 'Mèo đang tắm trong bồn!',
      bathAria: 'Menu Tắm & Vệ sinh',
      bathTitle: 'Tắm (Xà phòng miễn phí / Dầu gội / Spa)',
      playLockedSleep: 'Khóa chơi khi mèo đang ngủ',
      playDisabledAria: 'Không thể chơi khi ốm hoặc Năng lượng < 20',
      playDisabledTitle: 'Không thể chơi (Ốm hoặc Năng lượng < 20)',
      playAria: (toyName) => `Menu Chơi (${toyName})`,
      playTitle: 'Chơi (Đồ chơi tương tác / Mini Game)',
      petAria: 'Menu Vuốt ve',
      petTitle: 'Vuốt ve (+15 / +25 Vui · +0 Năng lượng)',
      sleepAria: 'Menu Ngủ & Nghỉ ngơi',
      sleepTitle: 'Ngủ & Nghỉ (Ngủ ngắn / Ngủ sâu)',
      medRecoveringAria: 'Mèo đang hồi phục nhờ thuốc',
      medHealthyAria: 'Chỉ dùng thuốc khi mèo bị ốm',
      medAria: 'Cho Uống Thuốc',
      medRecoveringSickTitle: 'Đang hồi phục (hết ốm ở mức 90%)',
      medRecoveringTitle: 'Đang hồi phục sức khỏe lên 100%',
      medHealthyTitle: 'Chỉ dùng thuốc khi mèo bị ốm',
      medSickTitle: 'Cho uống thuốc (Mèo đang ốm!)',
      shopLabel: 'Cửa hàng',
    },
  },
  shop: {
    title: 'Cửa Hàng',
    closeAria: 'Đóng cửa hàng',
    tabs: {
      makanan: 'Đồ ăn',
      mandi: 'Tắm',
      mainan: 'Đồ chơi',
      kostum: 'Trang phục',
      rumah: 'Phòng',
      kasur: 'Giường',
    },
    sleepingNotice: 'Mèo đang ngủ — khóa tắm cho đến khi thức dậy.',
    bathingNotice: 'Mèo đang tắm trong bồn!',
    bathFilters: {
      all: 'Tất cả',
      tub: 'Bồn tắm',
      consumable: 'Xà phòng & Spa',
    },
    bathTip: 'Mẹo: Kéo bồn tắm trên sàn để đổi vị trí.',
    bedTip: 'Mẹo: Kéo giường trên sàn để đổi vị trí.',
    bathConsumablesHeading: 'Xà phòng & Chăm sóc tắm',
    bathingBtn: 'Đang tắm',
    sleepingBtn: 'Đang ngủ',
    costumeFilters: {
      all: 'Tất cả',
      hat: 'Mũ',
      glasses: 'Kính',
    },
    slotLabels: {
      hat: 'Mũ nhỏ',
      glasses: 'Kính mắt',
      scarf: 'Khăn quàng',
    },
  },
  minigame: {
    title: 'Mini-Game Bắt Cá',
    closeAria: 'Đóng Mini-Game',
    prompt: (name) => `Giúp ${name} bắt cá dưới ao!`,
    rainBonusHint: '(Mưa: +5 Vui · -2 Sạch)',
    scoreLabel: (score) => `Điểm: ${score}`,
    finishedTitle: (score) => `Hoàn thành! Đạt ${score} Điểm`,
    rewardSummary: (coins, happy, rainExtra, cleanCost) =>
      `Thưởng: +${coins} Xu · +${happy} Vui${rainExtra ? ' (Mưa +5)' : ''} · -10 Năng lượng · -5 No · -${cleanCost} Sạch · +12 XP Gắn kết`,
    claimBtn: 'Nhận Thưởng',
  },
  lifestage: {
    title: 'Giai Đoạn Phát Triển',
    phaseTitle: (name, stageLabel) => `${name} · Giai đoạn ${stageLabel}`,
    durationPrefix: (calendar, duration) => `${calendar} · Thời lượng ${duration}`,
    seniorAgeLabel: 'Tuổi Già (Ng.12–18)',
    toNextStage: 'Tiến độ lên giai đoạn mới',
    remainingBaby: (mins, hours) => `Còn ${mins}ph · Giờ ${hours}/73`,
    remainingDaysHours: (days, hrs) => `Còn ${days}ng ${hrs}g`,
    remainingHours: (hrs) => `Còn ${hrs}g`,
    mistakesLabel: (count) => `Lỗi chăm: ${count}x`,
    nowBadge: 'Hiện tại',
    branchGuideTitle: 'Nhánh Tiến Hóa Trưởng Thành (dựa theo Care Mistakes ở tuổi Nhỏ & Thiếu niên)',
  },
  catalog: {
    breeds: {
      oren: { label: 'Mướp Cam', personality: 'Năng động & mê ăn vặt' },
      mochi: { label: 'Trắng Kem', personality: 'Nũng nịu & thích ôm' },
      arang: { label: 'Tuxedo Đen', personality: 'Thông minh & bắt bóng giỏi' },
      abu: { label: 'Xám Bạc', personality: 'Điềm tĩnh & tò mò' },
    },
    personalities: {
      playful: 'Tinh nghịch',
      lazy: 'Thư thái',
      shy: 'Nhút nhát',
    },
    foodItems: {
      snack: {
        name: 'Đồ Ăn Nhẹ',
        shortName: 'Đồ Ăn Nhẹ',
        description: '+15 No · +10 Vui',
      },
      main_food: {
        name: 'Bữa Chính Tiêu Chuẩn',
        shortName: 'Bữa Chính',
        description: '+30 No · +5 Vui',
      },
      special_food: {
        name: 'Bữa Tiệc Đặc Biệt',
        shortName: 'Bữa Đặc Biệt',
        description: '+50 No · +15 Vui',
      },
    },
    bathItems: {
      basic_soap: {
        name: 'Xà Phòng Cơ Bản',
        shortName: 'Xà Phòng Cơ Bản',
        description: '+35 Sạch · +5 Vui',
      },
      shampoo_foam: {
        name: 'Sữa Tắm Tạo Bọt',
        shortName: 'Sữa Tắm Bọt',
        description: '+60 Sạch · +10 Vui',
      },
      spa_bath: {
        name: 'Tắm Spa / Bom Tắm',
        shortName: 'Tắm Spa',
        description: '+100 Sạch · +20 Vui',
      },
    },
    sleepOptions: {
      power_nap: {
        name: 'Ngủ Ngắn (Power Nap)',
        shortName: 'Ngủ Ngắn',
        description: '+40 Năng lượng · +5 Vui · -5 No',
      },
      full_rest: {
        name: 'Ngủ Sâu Đầy Đủ',
        shortName: 'Ngủ Sâu',
        description: '+100 Năng lượng · +10 Vui · -12 No · -2 Sạch',
      },
    },
    lifeStages: {
      baby: {
        label: 'Sơ Sinh',
        shortLabel: 'Sơ Sinh',
        realDurationLabel: '60 phút',
        calendarLabel: 'Ngày 0–3 (Giờ 0–73)',
        decayNote: 'No/Vui -20/15ph · Sạch -20/25ph · Năng lượng -20/18ph',
      },
      child: {
        label: 'Mèo Con',
        shortLabel: 'Mèo Con',
        realDurationLabel: '24 giờ',
        calendarLabel: 'Ngày 1',
        decayNote: 'No/Vui -20/50ph · Sạch -20/80ph · Năng lượng -20/60ph',
      },
      teen: {
        label: 'Thiếu Niên',
        shortLabel: 'Thiếu Niên',
        realDurationLabel: '48 giờ',
        calendarLabel: 'Ngày 2–3',
        decayNote: 'No/Vui -20/60ph · Sạch -20/95ph · Năng lượng -20/75ph',
      },
      adult: {
        label: 'Trưởng Thành',
        shortLabel: 'Trưởng Thành',
        realDurationLabel: '8 ngày',
        calendarLabel: 'Ngày 4–11',
        decayNote: 'No/Vui -20/75–90ph · Sạch -20/120–140ph · Năng lượng -20/90–110ph',
      },
      senior: {
        label: 'Cao Tuổi',
        shortLabel: 'Cao Tuổi',
        realDurationLabel: '7 ngày (Qua đời > Ngày 18)',
        calendarLabel: 'Ngày 12–18',
        decayNote: 'No/Vui -20/20–30ph · Sạch -20/35–45ph · Năng lượng -20/25–35ph',
      },
    },
    adultBranches: {
      prima: {
        label: 'Trưởng Thành Ưu Tú',
        description: 'Chăm sóc tối ưu: giảm chậm (90ph/140ph/110ph) & thưởng +1 xu.',
        maxMistakesLabel: '0–2 Lỗi chăm',
      },
      mandiri: {
        label: 'Trưởng Thành Cân Bằng',
        description: 'Nhanh nhẹn, ổn định với thể lực tiêu chuẩn (82.5ph/130ph/100ph).',
        maxMistakesLabel: '3–5 Lỗi chăm',
      },
      sensitif: {
        label: 'Trưởng Thành Nhạy Cảm',
        description: 'Dễ đói, dễ cô đơn hơn và cần nhiều quan tâm (75ph/120ph/90ph).',
        maxMistakesLabel: '6+ Lỗi chăm',
      },
    },
    backgrounds: {
      apartment: {
        name: 'Căn Hộ Thành Phố',
        description: 'Căn hộ ấm áp ngắm toàn cảnh thành phố qua cửa sổ',
      },
      tatami: {
        name: 'Phòng Tatami',
        description: 'Phòng Nhật ấm cúng lát chiếu tatami nhìn ra vườn trúc',
      },
      classic_home: {
        name: 'Nhà Gỗ Cổ Điển',
        description: 'Phòng khách xanh xô thơm mặc định hướng ra khu vườn',
      },
    },
    beds: {
      kasur_semangka: {
        name: 'Đệm Dưa Hấu',
        description: 'Đệm dưa hấu tươi mát kèm lá xanh đáng yêu',
      },
      keranjang_rajut: {
        name: 'Giỏ Đan Ấm Áp',
        description: 'Giỏ mây đan ấm áp kèm chăn ca-rô đỏ',
      },
      kasur_donat: {
        name: 'Đệm Bánh Donut',
        description: 'Đệm donut dâu tây phủ cốm nhiều màu sắc',
      },
      tenda_kerajaan: {
        name: 'Lều Hoàng Gia',
        description: 'Lều ngủ xanh đêm trang trí trăng lưỡi liềm vàng',
      },
      kasur_kucing: {
        name: 'Đệm Mèo Cam',
        description: 'Đệm mèo cam mặc định kèm gối đỏ êm ái',
      },
    },
    bathtubs: {
      bak_kucing: {
        name: 'Bồn Tắm Mèo',
        description: 'Bồn tắm mặc định với nhiều bọt & vòi sen hình cá',
      },
      bak_ikan: {
        name: 'Bồn Tắm Cá',
        description: 'Bồn cá xanh tươi vui kèm cá cảnh & vòi nước',
      },
      bak_onsen: {
        name: 'Thùng Gỗ Onsen',
        description: 'Bồn tắm nước nóng kiểu Nhật kèm gáo gỗ',
      },
      bak_kerang: {
        name: 'Bồn Vỏ Sò',
        description: 'Bồn ngọc trai hồng với vòi sen biển & bọt mịn',
      },
      bak_batu: {
        name: 'Bồn Đá Tự Nhiên',
        description: 'Hồ đá thiên nhiên với ống nước tre và lá tươi',
      },
    },
    toys: {
      yarn_ball: {
        name: 'Cuộn Len',
        shortName: 'Len',
        bonusText: 'Cân bằng · +14 Vui/lần bắt',
      },
      laser_pointer: {
        name: 'Đèn Laser',
        shortName: 'Laser',
        bonusText: '+35% Vui · Chạy nhanh (+16 bắt)',
      },
      feather_wand: {
        name: 'Cần Câu Lông Vũ',
        shortName: 'Lông vũ',
        bonusText: 'Tiết kiệm 35% Năng lượng · +18 Vui/lần',
      },
      toy_mouse: {
        name: 'Chuột Lên Dây',
        shortName: 'Chuột',
        bonusText: 'Tiết kiệm nhất · +3 Xu/lần bắt',
      },
    },
    accessories: {
      beret_merah: { name: 'Mũ Nồi Họa Sĩ' },
      topi_pesta: { name: 'Mũ Tiệc Ngôi Sao' },
      mahkota_emas: { name: 'Vương Miện Vàng' },
      kacamata_bulat: { name: 'Kính Tròn Thông Minh' },
      kacamata_hitam: { name: 'Kính Râm Sành Điệu' },
      kacamata_hati: { name: 'Kính Trái Tim' },
      syal_polkadot: { name: 'Khăn Chấm Bi' },
      syal_garis: { name: 'Khăn Kẻ Sọc' },
      dasi_kupu: { name: 'Nơ Cổ' },
    },
  },
  stage: {
    moods: {
      calm: 'Thoải mái & Êm ấm',
      recoverBed: 'Hồi phục 2x trên Giường',
      recoverSick: 'Đang hồi (Vẫn còn ốm)',
      almostRecovered: 'Sắp khỏe hoàn toàn',
      sick: 'Đang bị ốm',
      held: 'Đang được bế',
      bathing: 'Đang tắm',
      autoSleep: 'Tự động ngủ',
      powerNap: 'Ngủ ngắn',
      deepSleep: 'Ngủ sâu',
      dozing: 'Thư giãn trên sàn',
      eating: 'Đang ăn ngon lành',
      playingToy: (toyName) => `Chơi ${toyName}`,
      rolling: 'Lăn lộn đáng yêu',
      purring: 'Rất quấn chủ',
      stretching: 'Đang vươn vai',
      starving: 'Đói lả!',
      hungryCranky: 'Đói đòi ăn',
      sulking: 'Đang dỗi',
      needsCleaning: 'Cần tắm rửa',
      veryDrowsy: 'Rất buồn ngủ',
      gettingDrowsy: 'Hơi buồn ngủ',
      veryHappy: 'Rất vui vẻ',
    },
    warnings: {
      recovering: (name, health, sleeping) =>
        `${name} đang hồi phục (${health}%) — triệu chứng ốm hết khi sức khỏe đạt 90%${
          sleeping ? ' · Hồi phục nhanh 2x trên giường!' : '.'
        }`,
      sickOverwork: (name) =>
        `Kiệt sức! ${name} bị ốm do cạn năng lượng quá lâu — hãy cho uống thuốc ngay.`,
      sickDirtyZero: (name) => `Độ sạch 0%! ${name} bị ốm — hãy tắm và cho uống thuốc ngay.`,
      sickChronicDirty: (name) =>
        `${name} bị ốm vì bẩn quá thường xuyên! Hãy cho uống thuốc ngay.`,
      sickGeneric: (name, health) =>
        `${name} đang bị ốm (${health}% Sức khỏe)! Cho uống thuốc trước khi về 0%.`,
      autoSleep: (name, timer) =>
        `Kiệt sức hoàn toàn! ${name} vào chế độ [TỰ NGỦ] (${timer}) · Khóa Chơi & Tắm.`,
      starving: (name) => `${name} đang đói lả (0%)! Tình trạng xấu đi — hãy cho ăn ngay.`,
      veryHungry: (name) => `${name} rất đói (<20%)! Sức khỏe đang giảm — hãy cho ăn ngay.`,
      veryDrowsy: (name, energy) =>
        `${name} rất buồn ngủ (${energy}% Năng lượng)! Từ chối chơi — hãy cho đi ngủ.`,
      lateNightDrowsy: (name) =>
        `${name} buồn ngủ nặng (01:00–06:00)! Từ chối chạy & tốn 5x năng lượng. Ngủ để hồi nhanh 3x.`,
      hungryCranky: (name) => `${name} bắt đầu đòi ăn (<40%)! Đến giờ ăn rồi.`,
      veryDirty: (name) => `${name} rất bẩn (<15%)! Sức khỏe đang giảm — hãy tắm ngay.`,
      gettingDirty: (name) => `${name} hơi bẩn (<40%)! Vệ sinh để niềm vui không giảm.`,
      drowsyLight: (name, energy, tags) =>
        `${name} hơi buồn ngủ (${energy}% Năng lượng${tags ? ` · ${tags}` : ''})! Hoạt động tốn 1.15x năng lượng.`,
      sulking: (name) => `${name} đang dỗi (<40% Vui)! Hiệu quả chơi & vuốt giảm đến khi nguôi.`,
    },
    toasts: {
      bondLevelUp: (level) => `Gắn kết Lv. ${level}! +15 Xu`,
      coinGain: (coins) => `+${coins} Xu`,
      evolutionExtra: (stageLabel, extra) => `Tiến hóa: ${stageLabel} (${extra})!`,
      evolution: (stageLabel) => `Tiến hóa: Giai đoạn ${stageLabel}!`,
      miniGameUnlocked: 'Mở khóa Mini-Game',
      snackCooldown: (timer) => `Đồ ăn nhẹ hồi chiêu (${timer})`,
      hungerFull: 'Độ no đã đầy (100)!',
      foodInBowlSleeping: (itemShort) => `Đã đặt ${itemShort} vào bát (đang ngủ)`,
      fedSuccess: (itemShort, hunger, happy) => `${itemShort}: +${hunger} No · +${happy} Vui`,
      bathCompleteSpa: (happy) => `Sạch tinh tươm 100% · +${happy} Vui`,
      bathComplete: (clean, happy) => `+${clean} Sạch · +${happy} Vui`,
      bathLockedSleep: 'Khóa tắm khi mèo đang ngủ!',
      bathAlreadyInProgress: (name) => `${name} đang đi tới / đang tắm trong bồn!`,
      cleanFull: 'Độ sạch đã đầy (100)!',
      soapCooldown: (timer) => `Xà phòng cơ bản hồi chiêu (${timer})`,
      bathImmediate: (itemShort) => `Tắm ngay (${itemShort})!`,
      bathWalking: (itemShort) => `Đang tới bồn tắm (${itemShort})...`,
      sleepingZzz: 'Zzz... Đang ngủ',
      waitBathing: 'Đợi một chút, đang tắm!',
      petCooldown: (isFull, timer) => `${isFull ? 'Ôm ấp' : 'Vuốt nhẹ'} hồi chiêu (${timer})`,
      petSuccess: (happy, isSulking, hungerDelta, isRain) => {
        const sulkTag = isSulking ? ' (Đang dỗi)' : '';
        const hTag = hungerDelta < 0 ? ` · ${hungerDelta} No` : '';
        const rTag = isRain ? ' · Ấm áp ngày mưa' : '';
        return `+${happy} Vui${sulkTag} · +0 Năng lượng${hTag}${rTag}`;
      },
      alreadySleeping: 'Mèo đang ngủ rồi!',
      energyFull: 'Năng lượng đã đầy (100)!',
      tooFreshToSleep: 'Còn tỉnh táo (>85 Năng lượng) ban ngày! Từ chối ngủ',
      onlyBriefNapAllowed: 'Năng lượng >70 ban ngày! Chỉ muốn chợp mắt nhanh',
      briefDayNapStart: (energy) => `Còn khá tỉnh — chợp mắt nhanh (1.5 ph · +${energy} Năng lượng)`,
      sleepStart: (shortName, mins, bonusText, desc) =>
        `${shortName} (${mins} ph${bonusText}): ${desc}`,
      sleepBonusMorning: 'Sáng +10%',
      sleepBonusNight: 'Đêm +20%',
      sleepBonusRain: 'Mưa +10%',
      sleepBonusLateNight: 'Hồi 3x',
      sleepInterrupted: 'Giấc ngủ bị gián đoạn! -10 Vui',
      miniGameNeedChild: 'Mini-Game mở khóa từ giai đoạn Mèo Con!',
      playLockedSleep: 'Khóa chơi khi mèo đang ngủ!',
      miniGameNeedHeal: 'Đang ốm — hãy chữa khỏi trước khi chơi Mini-Game!',
      miniGameLowEnergy: 'Năng lượng < 20! Quá mệt để chơi Mini-Game',
      tooHungry: 'Quá đói! Cho ăn trước đã',
      miniGameCooldown: (timer) => `Mini-Game hồi chiêu (${timer})`,
      bathingNow: 'Đang tắm trong bồn!',
      playSickBlocked: 'Đang ốm — Từ chối chơi đồ chơi!',
      playLowEnergyBlocked: 'Quá buồn ngủ (≤20 Năng lượng)! Từ chối chơi',
      playCooldown: (timer) => `Đồ chơi hồi chiêu (${timer})`,
      playLateNightNotice: (cost, happyFull) =>
        `Đêm khuya buồn ngủ (01:00–06:00)! Tốn 5x (-${cost} Năng lượng${happyFull ? ' · +0 Vui' : ''})`,
      playHappyFullDrowsy: (cost) =>
        `Hơi buồn ngủ · Chơi tốn 1.15x (-${cost} Năng lượng · +0 Vui)`,
      playHappyFull: 'Niềm vui đầy (100) · +0 Vui',
      playSulking: (happy, drowsyPenalty) =>
        `Đang dỗi (<40) · Giảm hiệu quả (+${happy} Vui${drowsyPenalty ? ' · Năng lượng 1.15x' : ''})`,
      playDrowsyPenalty: (cost, midday) =>
        `Hơi buồn ngủ · Chơi tốn 1.15x (-${cost} Năng lượng${midday ? ' · Trưa +10%' : ''})`,
      playWeakened: (happy) => `Mệt mỏi · Giảm hiệu quả chơi (+${happy} Vui)`,
      playMiddayBonus: (happy) => `Chơi Ban Ngày! +${happy} Vui (Thưởng +10%)`,
      medAlreadyGiven: 'Đã cho thuốc · Đang hồi phục dần',
      medNotNeeded: (name) => `${name} đang khỏe mạnh! Chỉ dùng thuốc khi ốm`,
      medGiven: 'Đã Cho Thuốc · Bắt đầu hồi phục (hết ốm ở 90%)',
      miniGameSummaryFull: (e, hun, cln) =>
        `+0 Vui · -${e} Năng lượng · -${hun} No · -${cln} Sạch`,
      miniGameSummaryReduced: (happy, e, cln) =>
        `+${happy} Vui (Giảm) · -${e} Năng lượng · -${cln} Sạch`,
      miniGameSummaryNormal: (happy, tags, e, hun, cln) =>
        `+${happy} Vui${tags} · -${e} Năng lượng · -${hun} No · -${cln} Sạch`,
      newBackground: (name) => `Phòng Mới: ${name}!`,
      newBed: (name) => `Giường Mới: ${name}!`,
      newBathtub: (name) => `Bồn Tắm Mới: ${name}!`,
      newToy: (name) => `Đồ Chơi Mới: ${name}!`,
      newCostume: (name) => `Trang Phục Mới: ${name}!`,
      awaySummary: (hungerLost, healthLost) =>
        `Vắng mặt lâu · No -${hungerLost}%${healthLost >= 1 ? ` · Sức khỏe -${healthLost}%` : ''}`,
      phaseBannerPagi: 'Trời sáng rồi (06:00) · Ngủ thưởng +10% Năng lượng',
      phaseBannerSiang: 'Buổi trưa rồi (12:00) · Chơi +10% Vui',
      phaseBannerMalam: 'Trời tối rồi (18:00) · Ngủ thưởng +20% Năng lượng',
      rainStart: (phaseLabel) => `Mưa buổi ${phaseLabel.toLowerCase()} · Ngủ +10% Năng lượng`,
      rainStop: (phaseLabel) => `Mưa tạnh · Trời ${phaseLabel.toLowerCase()} quang đãng`,
      newDayCoins: (day) => `Ngày ${day}! +10 Xu`,
      overworkSick: 'Làm việc quá sức! Cạn năng lượng quá lâu — Mèo bị ốm!',
      sleepCompleteAuto: (energy) => `Tự ngủ hoàn tất! Hồi +${energy} Năng lượng`,
      sleepCompletePower: (energy, happy) => `Ngủ ngắn xong! +${energy} Năng lượng · +${happy} Vui`,
      sleepCompleteFull: (energy, happy) => `Ngủ sâu xong! +${energy} Năng lượng · +${happy} Vui`,
      drowsyNoticeNight: 'Hơi buồn ngủ (≤50 Năng lượng · Đêm) · Đến giờ ngủ!',
      drowsyNoticeRain: 'Hơi buồn ngủ (≤45 Năng lượng · Mưa) · Trời mưa dễ ngủ!',
      drowsyNoticeNormal: 'Hơi buồn ngủ (21–40 Năng lượng) · Nghỉ ngơi chút nhé!',
      drowsyHeavyLateNight: '01:00–06:00: Buồn ngủ nặng! Không chịu chạy · Ngủ hồi nhanh 3x',
      drowsyHeavyNormal: 'Rất buồn ngủ (1–20 Năng lượng)! Hãy cho đi ngủ',
      autoSleepStart: (energy) => `Kiệt sức hoàn toàn! [TỰ NGỦ] 4ph (+${energy} Năng lượng)`,
      sickCleared90: 'Sức khỏe 90%! Đã hết triệu chứng ốm!',
      recovered100: (name) => `${name} Hồi Phục Hoàn Toàn 100%!`,
      becameSickHealth: (health, name) => `Sức khỏe ${health}%! ${name} bị ốm rồi!`,
      becameSickDirtyZero: 'Độ sạch 0%! Mèo bị ốm rồi!',
      becameSickChronicDirty: 'Bẩn quá thường xuyên! Mèo bị ốm',
      playSessionComplete: (happy, energy, hunger) =>
        `Chơi Xong: +${happy} Vui · -${energy} Năng lượng · -${hunger} No`,
      brushLockedSleep: 'Khóa tắm & chải khi mèo đang ngủ!',
      brushHint: 'Chải nhẹ lên thân mèo (+10 Sạch)',
      brushFullWangi: 'Sạch 100%! Thơm tho ✨',
      brushGain: (pts) => `+${pts} Sạch`,
      lateNightNoZoom: 'Buồn ngủ nặng (01:00–06:00)! Không chịu chạy',
      playMiddayTag: 'Trưa +10%',
      rainTag: 'Mưa +5',
    },
  },
};

const MS_TRANSLATIONS: Translations = {
  languageTitle: 'Bahasa',
  common: {
    back: 'Kembali',
    done: 'Selesai',
    close: 'Tutup',
    yes: 'Ya',
    no: 'Tidak',
    active: 'Aktif',
    off: 'Mati',
    unsupported: 'Tidak Disokong',
    enable: 'Aktifkan',
    enabled: 'Aktif',
    blocked: 'Disekat',
    allow: 'Benarkan',
    coins: 'Syiling',
    day: 'Hari',
    days: 'Hari',
    hourShort: 'j',
    minuteShort: 'min',
    secShort: 's',
    use: 'Guna',
    usedEquipped: 'Dipakai',
    buy: 'Beli',
    buyInShop: 'Beli di Kedai',
    giveFree: 'Beri Percuma',
    useFree: 'Guna Percuma',
    equip: 'Pakai',
    unequip: 'Tanggalkan',
    unequipAll: 'Tanggalkan Semua',
    all: 'Semua',
  },
  app: {
    docTitle: 'Rumah Kucing — Permainan Bela Kucing Maya',
    closedTitle: 'Aplikasi Telah Ditutup',
    closedDesc: 'Terima kasih kerana bermain LumaPet. Anda boleh menutup halaman ini.',
    reopen: 'Buka Semula',
    portraitTitle: 'Mod Landskap Diperlukan',
    portraitDesc: 'Putar peranti anda ke kedudukan melintang (Landscape) untuk bermain LumaPet.',
    splashAria: 'Pembukaan LumaPet',
    cloudErrors: {
      popupBlocked: 'Popup log masuk Google disekat pelayar. Benarkan popup dan cuba lagi.',
      quota: 'Kuota harian Cloud Save telah penuh dan akan ditetapkan semula esok.',
      generic: 'Gagal menyegerakkan Cloud Save. Semak sambungan internet anda.',
    },
    lowHungerNotifTitle: 'Rumah Kucing',
    lowHungerNotifBody:
      'Meow! Tahap kenyang kucing anda di bawah 40%. Segera beri makan sebelum ia sakit!',
  },
  title: {
    backdropAlt: 'Latar bilik tatami Rumah Kucing',
    subtitle: 'Jaga, belai, dan bermain bersama sahabat berbulu anda',
    newGame: 'Mula Baru',
    continue: 'Teruskan',
    noSaveYet: 'Belum ada simpanan',
    loadingCloud: 'Memuatkan dari Cloud...',
    settings: 'Tetapan',
    quit: 'Keluar',
    quitConfirmTitle: 'Adakah anda pasti?',
    quitConfirmBody: 'Adakah anda pasti mahu keluar daripada permainan?',
    adoptTitle: 'Pilih Kucing untuk Dipelihara',
    catNameLabel: 'Nama Panggilan Kucing',
    startPlaying: 'Mula Bermain',
    soundToggleOn: 'Hidupkan bunyi',
    soundToggleOff: 'Matikan bunyi',
    soundAlt: 'Bunyi',
    googleAccount: 'Akaun Google',
    linkGoogle: 'Pautkan Akaun Google',
    linkGoogleHint: 'Cloud Save Automatik',
    linkGoogleTooltip: 'Pautkan akaun Google untuk menyimpan dan memuatkan kemajuan dari awan',
    manageCloudTooltip: 'Urus pautan akaun Google & Cloud Save',
    connecting: 'Menyambung...',
    cloudSyncing: 'Menyegerak Cloud...',
    cloudError: 'Gagal Segerak',
    cloudConnected: 'Cloud Disambungkan',
    cloudSaveReady: (name, day) => `Cloud Save sedia: ${name} (Hari ke-${day})`,
    cloudAutoReady: 'Disambungkan · Kemajuan baharu akan disimpan automatik ke awan',
    reloadCloud: 'Muat Semula dari Cloud',
    unlinkGoogle: 'Putuskan Akaun Google',
    closeAccountMenu: 'Tutup info akaun',
    closeMessage: 'Tutup mesej',
  },
  settings: {
    title: 'Tetapan',
    subtitle: 'Laraskan bunyi, bahasa & pemberitahuan',
    languageLabel: 'Bahasa',
    languageDesc: 'Pilih bahasa paparan permainan',
    volumeTitle: 'Kelantangan Bunyi',
    volumeDesc: 'Laraskan peratusan kelantangan bunyi permainan',
    volumeAria: 'Peratusan kelantangan bunyi',
    sfxTitle: 'Kesan Bunyi (SFX)',
    sfxDesc: 'Ngiauan, dengkur & mainan',
    musicTitle: 'Muzik Latar',
    musicDesc: 'Muzik menu & dalam permainan',
    notifTitle: 'Pemberitahuan Makan',
    notifDesc: 'Ingatkan apabila kenyang di bawah 40%',
    fullscreenTitle: 'Skrin Penuh (Fullscreen)',
    fullscreenDesc: 'Sembunyikan bar status & navigasi peranti',
    clearSave: 'Padam Data Simpanan',
  },
  pause: {
    pausedTitle: 'Menu Jeda',
    settingsTitle: 'Tetapan',
    diedTitle: (name) => `${name} Telah Pergi`,
    diedOldAge: (name, day) =>
      `${name} telah menua dengan penuh kasih sayang dan pergi dengan tenang selepas menemani anda hingga Hari ke-${day}.`,
    diedSickness: (name) =>
      `Roh ${name} terbang tenang ke negeri awan kerana sakitnya tidak sempat dirawat.`,
    careDuration: 'Tempoh Bela',
    bond: 'Ikatan',
    ballCatches: 'Tangkapan Bola',
    savingCloud: 'Menyimpan ke Cloud...',
    savingAuto: 'Menyimpan kemajuan automatik...',
    cloudSaveActive: 'Cloud Save Aktif · Disimpan automatik',
    autoSaveActive: 'Auto-Save Aktif · Disimpan automatik',
    resume: 'Teruskan',
    quitGame: 'Keluar Permainan',
    playAgain: 'Main Lagi',
    mainMenu: 'Menu Utama',
  },
  hud: {
    statusPanelLabel: 'Panel Status',
    profileCardLabel: 'Profil Kucing',
    hunger: 'Kenyang',
    happiness: 'Gembira',
    cleanliness: 'Bersih',
    energy: 'Tenaga',
    health: 'Kesihatan',
    tags: {
      critical: 'Kritikal!',
      cranky: 'Meragam!',
      stressed: 'Tertekan!',
      sulking: 'Merajuk',
      dirty: 'Kotor',
      exhausted: 'Keletihan!',
      drowsyHeavy: 'Mengantuk Teruk',
      drowsyLight: 'Mengantuk',
      recoveringLethargic: (hp) => `Pulih · Lemah (${hp}%)`,
      recovering: (hp) => `Pulih (${hp}%)`,
      sick: (hp) => `Sakit! (${hp}%)`,
    },
    dayPhases: {
      pagi: 'Pagi',
      siang: 'Siang',
      senja: 'Senja',
      malam: 'Malam',
    },
    rain: 'Hujan',
    dayFormat: (day, extraHours, clock, weatherLabel) =>
      `Hari ${day}${extraHours} · ${clock} ${weatherLabel}`,
    phaseTooltip: {
      pagi: 'Pagi (06:00–11:59) · Bonus tidur +10% Tenaga',
      siang: (label) => `${label} (12:00–17:59) · Main +10% Gembira · Kenyang/Tenaga 1.1x`,
      malam: 'Malam (18:00–05:59) · Tidur +20% Tenaga · Tenaga 1.25x',
      rainExtra: ' | Hujan: Tenaga 1.15x · Tidur +10% · Mengantuk ≤45 · Dalam rumah Gembira 0.9x',
    },
    viewLifeStageTooltip: 'Lihat Fasa Pertumbuhan & Evolusi',
    pauseLabel: 'Menu Jeda',
    pauseTooltip: 'Menu Jeda (Esc)',
    actionMenus: {
      food: 'Makanan',
      pickFood: 'Pilih Makanan',
      bath: 'Mandi',
      pickBath: 'Pilih Mandi',
      play: 'Bermain',
      pickPlay: 'Pilih Aktiviti',
      pet: 'Belai',
      pickPet: 'Pilih Belaian',
      sleep: 'Tidur',
      pickSleep: 'Pilih Tidur',
      closeAria: 'Tutup menu tindakan',
    },
    changeFoodTooltip: 'Klik untuk tukar pilihan makanan',
    changeBathTooltip: 'Klik untuk tukar pilihan mandi',
    changePlayTooltip: 'Klik untuk tukar aktiviti bermain',
    changePetTooltip: 'Klik untuk tukar jenis belaian',
    changeSleepTooltip: 'Klik untuk tukar pilihan tidur',
    manualBrush: 'Berus Manual',
    manualBrushDesc: '+10 Bersih setiap gosokan',
    brushDisable: 'Matikan',
    brushUse: 'Guna Berus',
    bathingShort: 'Mandi...',
    sleepingShort: 'Tidur',
    cleanFull: (stock) => (stock !== undefined ? `Bersih 100 (${stock})` : 'Bersih 100'),
    hungerFull: (stock) => `Kenyang 100 (${stock})`,
    useWithStock: (stock) => `Guna (${stock})`,
    toyPlayItem: (toyShort) => `Mainan (${toyShort})`,
    playDeltaLine: (happy, energy) => `+${happy} Gembira · ${energy} Tenaga`,
    miniGamePond: 'Mini Game Kolam',
    miniGameLockedStage: 'Fasa Anak+',
    sickShort: 'Sakit',
    hungryShort: 'Lapar',
    playBtn: 'Main',
    startBtn: 'Mula',
    petShort: 'Belai Ringkas',
    petShortDesc: (happy) => `+${happy} Gembira`,
    petFull: 'Belai Penuh',
    petFullDesc: (happy, hunger) => `+${happy} Gembira · ${hunger} Kenyang`,
    petShortBtn: 'Belai',
    petFullBtn: 'Kasih Sayang',
    autoSleep: 'Auto-Tidur',
    powerNap: 'Tidur Sekejap',
    fullRest: 'Tidur Penuh',
    wakeUpPenalty: 'Kejutkan (-10 Gembira)',
    briefNap: 'Rehat Singkat',
    briefNapDesc: '+20 Tenaga · 1.5 min',
    freshGuard: 'Segar (>85)',
    energyAbove70: 'Tenaga >70',
    energy100: 'Tenaga 100',
    dock: {
      foodAria: 'Menu Makanan',
      foodTitle: 'Makan (Snek Percuma / Makanan Kedai)',
      bathLockedSleep: 'Mandi dikunci semasa kucing tidur',
      bathBathing: 'Kucing sedang mandi di tab!',
      bathAria: 'Menu Mandi & Kebersihan',
      bathTitle: 'Mandi (Sabun Percuma / Syampu / Spa)',
      playLockedSleep: 'Bermain dikunci semasa kucing tidur',
      playDisabledAria: 'Tidak boleh bermain semasa sakit atau Tenaga < 20',
      playDisabledTitle: 'Tidak boleh bermain (Sakit atau Tenaga < 20)',
      playAria: (toyName) => `Menu Bermain (${toyName})`,
      playTitle: 'Bermain (Mainan Interaktif / Mini Game)',
      petAria: 'Menu Belai',
      petTitle: 'Belai (+15 / +25 Gembira · +0 Tenaga)',
      sleepAria: 'Menu Tidur & Rehat',
      sleepTitle: 'Tidur & Rehat (Tidur Sekejap / Tidur Penuh)',
      medRecoveringAria: 'Kucing sedang pulih daripada ubat',
      medHealthyAria: 'Ubat hanya boleh diberi apabila kucing sakit',
      medAria: 'Beri Ubat',
      medRecoveringSickTitle: 'Kucing sedang pulih (kesan sakit hilang di 90%)',
      medRecoveringTitle: 'Kucing sedang pulih ke arah 100%',
      medHealthyTitle: 'Ubat hanya boleh diberi apabila kucing sakit',
      medSickTitle: 'Beri Ubat (Kucing sedang sakit!)',
      shopLabel: 'Kedai',
    },
  },
  shop: {
    title: 'Kedai',
    closeAria: 'Tutup kedai',
    tabs: {
      makanan: 'Makanan',
      mandi: 'Mandi',
      mainan: 'Mainan',
      kostum: 'Kostum',
      rumah: 'Rumah',
      kasur: 'Tilam',
    },
    sleepingNotice: 'Kucing sedang tidur — mandi dikunci sehingga bangun.',
    bathingNotice: 'Kucing sedang mandi di dalam tab mandi!',
    bathFilters: {
      all: 'Semua',
      tub: 'Tab Mandi',
      consumable: 'Sabun & Spa',
    },
    bathTip: 'Tip: Seret tab mandi di lantai untuk mengalih kedudukannya.',
    bedTip: 'Tip: Seret tilam di lantai untuk mengalih kedudukannya.',
    bathConsumablesHeading: 'Sabun & Penjagaan Mandi',
    bathingBtn: 'Sedang Mandi',
    sleepingBtn: 'Sedang Tidur',
    costumeFilters: {
      all: 'Semua',
      hat: 'Topi',
      glasses: 'Cermin Mata',
    },
    slotLabels: {
      hat: 'Topi Mini',
      glasses: 'Cermin Mata',
      scarf: 'Skaf',
    },
  },
  minigame: {
    title: 'Mini-Game Tangkap Ikan',
    closeAria: 'Tutup Mini-Game',
    prompt: (name) => `Bantu ${name} tangkap ikan di kolam!`,
    rainBonusHint: '(Hujan: +5 Gembira · -2 Bersih)',
    scoreLabel: (score) => `Skor: ${score}`,
    finishedTitle: (score) => `Tamat! Skor ${score} Mata`,
    rewardSummary: (coins, happy, rainExtra, cleanCost) =>
      `Ganjaran: +${coins} Syiling · +${happy} Gembira${rainExtra ? ' (Hujan +5)' : ''} · -10 Tenaga · -5 Kenyang · -${cleanCost} Bersih · +12 XP Ikatan`,
    claimBtn: 'Tuntut Ganjaran',
  },
  lifestage: {
    title: 'Fasa Pertumbuhan',
    phaseTitle: (name, stageLabel) => `${name} · Fasa ${stageLabel}`,
    durationPrefix: (calendar, duration) => `${calendar} · Tempoh ${duration}`,
    seniorAgeLabel: 'Usia Warga Emas (H.12–18)',
    toNextStage: 'Menuju Fasa Seterusnya',
    remainingBaby: (mins, hours) => `Baki ${mins}m · Jam ${hours}/73`,
    remainingDaysHours: (days, hrs) => `Baki ${days}h ${hrs}j`,
    remainingHours: (hrs) => `Baki ${hrs}j`,
    mistakesLabel: (count) => `Kesilapan: ${count}x`,
    nowBadge: 'Sekarang',
    branchGuideTitle:
      'Cabang Evolusi Dewasa (berdasarkan Care Mistakes pada fasa Anak & Remaja)',
  },
  catalog: {
    breeds: {
      oren: { label: 'Tabby Oren', personality: 'Cergas & gemar snek' },
      mochi: { label: 'Putih Krim', personality: 'Manja & suka dipeluk' },
      arang: { label: 'Tuxedo Hitam', personality: 'Bijak & handal tangkap bola' },
      abu: { label: 'Kelabu Perak', personality: 'Tenang & penuh rasa ingin tahu' },
    },
    personalities: {
      playful: 'Cergas',
      lazy: 'Santai',
      shy: 'Pemalu',
    },
    foodItems: {
      snack: {
        name: 'Snek Ringan',
        shortName: 'Snek Ringan',
        description: '+15 Kenyang · +10 Gembira',
      },
      main_food: {
        name: 'Makanan Utama',
        shortName: 'Makanan Utama',
        description: '+30 Kenyang · +5 Gembira',
      },
      special_food: {
        name: 'Makanan Istimewa / Saiz Besar',
        shortName: 'Makanan Istimewa',
        description: '+50 Kenyang · +15 Gembira',
      },
    },
    bathItems: {
      basic_soap: {
        name: 'Sabun Asas / Tisu Basah',
        shortName: 'Sabun Asas',
        description: '+35 Bersih · +5 Gembira',
      },
      shampoo_foam: {
        name: 'Syampu & Buih Mandian',
        shortName: 'Syampu & Buih',
        description: '+60 Bersih · +10 Gembira',
      },
      spa_bath: {
        name: 'Mandi Spa / Bom Mandian',
        shortName: 'Mandi Spa',
        description: '+100 Bersih · +20 Gembira',
      },
    },
    sleepOptions: {
      power_nap: {
        name: 'Tidur Sekejap (Power Nap)',
        shortName: 'Tidur Sekejap',
        description: '+40 Tenaga · +5 Gembira · -5 Kenyang',
      },
      full_rest: {
        name: 'Tidur Rehat Penuh',
        shortName: 'Tidur Penuh',
        description: '+100 Tenaga · +10 Gembira · -12 Kenyang · -2 Bersih',
      },
    },
    lifeStages: {
      baby: {
        label: 'Bayi',
        shortLabel: 'Bayi',
        realDurationLabel: '60 minit',
        calendarLabel: 'Hari ke-0 hingga ke-3 (Jam 0–73)',
        decayNote: 'Kenyang/Gembira -20/15m · Bersih -20/25m · Tenaga -20/18m',
      },
      child: {
        label: 'Anak',
        shortLabel: 'Anak',
        realDurationLabel: '24 jam',
        calendarLabel: 'Hari ke-1',
        decayNote: 'Kenyang/Gembira -20/50m · Bersih -20/80m · Tenaga -20/60m',
      },
      teen: {
        label: 'Remaja',
        shortLabel: 'Remaja',
        realDurationLabel: '48 jam',
        calendarLabel: 'Hari ke-2 hingga ke-3',
        decayNote: 'Kenyang/Gembira -20/60m · Bersih -20/95m · Tenaga -20/75m',
      },
      adult: {
        label: 'Dewasa',
        shortLabel: 'Dewasa',
        realDurationLabel: '8 hari',
        calendarLabel: 'Hari ke-4 hingga ke-11',
        decayNote: 'Kenyang/Gembira -20/75–90m · Bersih -20/120–140m · Tenaga -20/90–110m',
      },
      senior: {
        label: 'Tua (Warga Emas)',
        shortLabel: 'Tua',
        realDurationLabel: '7 hari (Pergi > Hari 18)',
        calendarLabel: 'Hari ke-12 hingga ke-18',
        decayNote: 'Kenyang/Gembira -20/20–30m · Bersih -20/35–45m · Tenaga -20/25–35m',
      },
    },
    adultBranches: {
      prima: {
        label: 'Dewasa Prima',
        description: 'Dijaga rapi: susut lebih perlahan (90m/140m/110m) & +1 syiling bonus.',
        maxMistakesLabel: '0–2 Care Mistakes',
      },
      mandiri: {
        label: 'Dewasa Berdikari',
        description: 'Tangkas dan seimbang dengan ketahanan standard (82.5m/130m/100m).',
        maxMistakesLabel: '3–5 Care Mistakes',
      },
      sensitif: {
        label: 'Dewasa Sensitif',
        description: 'Lebih manja dan cepat berasa lapar atau sunyi (75m/120m/90m).',
        maxMistakesLabel: '6+ Care Mistakes',
      },
    },
    backgrounds: {
      apartment: {
        name: 'Apartmen Bandar',
        description: 'Apartmen hangat dengan pemandangan bandar dari tingkap',
      },
      tatami: {
        name: 'Bilik Tatami',
        description: 'Bilik Jepun hangat berlantai tatami menghadap taman buluh',
      },
      classic_home: {
        name: 'Rumah Kayu Klasik',
        description: 'Ruang tamu sage hangat lalai menghadap taman',
      },
    },
    beds: {
      kasur_semangka: {
        name: 'Tilam Tembikai',
        description: 'Tilam buah tembikai segar dengan daun hijau comel',
      },
      keranjang_rajut: {
        name: 'Bakul Anyaman',
        description: 'Bakul anyaman hangat dengan selimut kotak merah',
      },
      kasur_donat: {
        name: 'Tilam Donat',
        description: 'Tilam donat strawberi bertabur taburan warna-warni',
      },
      tenda_kerajaan: {
        name: 'Khemah Diraja',
        description: 'Khemah tidur biru malam berhias bulan sabit emas',
      },
      kasur_kucing: {
        name: 'Tilam Kucing',
        description: 'Tilam kucing oren lalai dengan bantal merah empuk',
      },
    },
    bathtubs: {
      bak_kucing: {
        name: 'Tab Mandi Kucing',
        description: 'Tab mandi kucing lalai dengan buih banyak & pancuran ikan',
      },
      bak_ikan: {
        name: 'Tab Mandi Ikan',
        description: 'Tab ikan biru ceria lengkap dengan ikan hiasan & paip air',
      },
      bak_onsen: {
        name: 'Tab Kayu Onsen',
        description: 'Tong mandian air suam gaya Jepun dengan gayung kayu',
      },
      bak_kerang: {
        name: 'Tab Kerang',
        description: 'Tab kerang mutiara merah jambu dengan pancuran laut & buih lembut',
      },
      bak_batu: {
        name: 'Tab Batu Alam',
        description: 'Kolam batu semula jadi dengan pancuran buluh dan dedaun segar',
      },
    },
    toys: {
      yarn_ball: {
        name: 'Bola Benang',
        shortName: 'Bola',
        bonusText: 'Seimbang · +14 Gembira/tangkap',
      },
      laser_pointer: {
        name: 'Penunjuk Laser',
        shortName: 'Laser',
        bonusText: '+35% Gembira · Lari pantas (+16 tangkap)',
      },
      feather_wand: {
        name: 'Tongkat Bulu',
        shortName: 'Bulu',
        bonusText: 'Jimat Tenaga 35% · +18 Gembira/tangkap',
      },
      toy_mouse: {
        name: 'Tikus Mainan',
        shortName: 'Tikus',
        bonusText: 'Paling Jimat Tenaga · +3 Syiling/tangkap',
      },
    },
    accessories: {
      beret_merah: { name: 'Beret Pelukis' },
      topi_pesta: { name: 'Topi Parti Bintang' },
      mahkota_emas: { name: 'Mahkota Raja' },
      kacamata_bulat: { name: 'Cermin Mata Pintar' },
      kacamata_hitam: { name: 'Cermin Mata Hitam' },
      kacamata_hati: { name: 'Cermin Mata Hati' },
      syal_polkadot: { name: 'Skaf Polkadot' },
      syal_garis: { name: 'Skaf Berjalur' },
      dasi_kupu: { name: 'Tali Leher Kupu-kupu' },
    },
  },
  stage: {
    moods: {
      calm: 'Tenang & Selesa',
      recoverBed: 'Pemulihan 2x di Tilam',
      recoverSick: 'Pemulihan (Masih Sakit)',
      almostRecovered: 'Hampir Pulih Sepenuhnya',
      sick: 'Sedang Sakit',
      held: 'Sedang Didukung',
      bathing: 'Sedang Mandi',
      autoSleep: 'Tidur Automatik',
      powerNap: 'Tidur Sekejap',
      deepSleep: 'Tidur Nyenyak',
      dozing: 'Santai di Lantai',
      eating: 'Berselera Makan',
      playingToy: (toyName) => `Main ${toyName}`,
      rolling: 'Bergolek Comel',
      purring: 'Sangat Manja',
      stretching: 'Meregangkan Badan',
      starving: 'Kelaparan!',
      hungryCranky: 'Meragam Minta Makan',
      sulking: 'Sedang Merajuk',
      needsCleaning: 'Perlu Dibersihkan',
      veryDrowsy: 'Sangat Mengantuk',
      gettingDrowsy: 'Mula Mengantuk',
      veryHappy: 'Sangat Ceria',
    },
    warnings: {
      recovering: (name, health, sleeping) =>
        `${name} sedang dalam pemulihan (${health}%) — kesan sakit kekal sehingga kesihatan mencapai 90%${
          sleeping ? ' · Pemulihan 2x lebih pantas di tilam!' : '.'
        }`,
      sickOverwork: (name) =>
        `Keletihan! ${name} jatuh sakit kerana Tenaga 0 terlalu lama — segera beri ubat sebelum kesihatan habis.`,
      sickDirtyZero: (name) =>
        `Kebersihan 0%! ${name} jatuh sakit — mandikan dan beri ubat sebelum kesihatan habis.`,
      sickChronicDirty: (name) =>
        `${name} jatuh sakit kerana terlalu kerap kotor! Segera beri ubat sebelum kesihatan habis.`,
      sickGeneric: (name, health) =>
        `${name} sedang sakit (${health}% Kesihatan)! Segera beri ubat sebelum mencapai 0%.`,
      autoSleep: (name, timer) =>
        `Keletihan melampau! ${name} masuk [AUTO-TIDUR] (${timer}) · Main & Mandi dikunci.`,
      starving: (name) => `${name} kelaparan (0%)! Keadaan merosot — segera beri makan.`,
      veryHungry: (name) => `${name} sangat lapar (<20%)! Kesihatannya mula menurun — segera beri makan.`,
      veryDrowsy: (name, energy) =>
        `${name} sangat mengantuk (${energy}% Tenaga)! Mainan Interaktif ditolak — segera tidurkan.`,
      lateNightDrowsy: (name) =>
        `${name} sangat mengantuk (01:00–06:00)! Enggan berlari & aktiviti guna 5x tenaga. Tidurkan untuk pulih 3x lebih pantas.`,
      hungryCranky: (name) => `${name} mula meragam minta makan (<40%)! Masa untuk makan.`,
      veryDirty: (name) => `${name} sangat kotor (<15%)! Kesihatannya menurun — segera mandikan.`,
      gettingDirty: (name) => `${name} mula kotor (<40%)! Bersihkan agar Gembira tidak turut turun.`,
      drowsyLight: (name, energy, tags) =>
        `${name} mula mengantuk (${energy}% Tenaga${tags ? ` · ${tags}` : ''})! Penggunaan tenaga naik 1.15x.`,
      sulking: (name) =>
        `${name} sedang merajuk (<40% Gembira)! Kesan main & belai berkurang sehingga tenang.`,
    },
    toasts: {
      bondLevelUp: (level) => `Ikatan Lv. ${level}! +15 Syiling`,
      coinGain: (coins) => `+${coins} Syiling`,
      evolutionExtra: (stageLabel, extra) => `Evolusi: ${stageLabel} (${extra})!`,
      evolution: (stageLabel) => `Evolusi: Fasa ${stageLabel}!`,
      miniGameUnlocked: 'Mini-Game Dibuka',
      snackCooldown: (timer) => `Snek Percuma tempoh bertenang (${timer})`,
      hungerFull: 'Kenyang sudah penuh (100)!',
      foodInBowlSleeping: (itemShort) => `${itemShort} diletak dalam mangkuk (masih tidur)`,
      fedSuccess: (itemShort, hunger, happy) => `${itemShort}: +${hunger} Kenyang · +${happy} Gembira`,
      bathCompleteSpa: (happy) => `Bersih Penuh 100% · +${happy} Gembira`,
      bathComplete: (clean, happy) => `+${clean} Bersih · +${happy} Gembira`,
      bathLockedSleep: 'Mandi dikunci semasa kucing tidur!',
      bathAlreadyInProgress: (name) => `${name} sudah menuju / sedang mandi di tab!`,
      cleanFull: 'Bersih sudah penuh (100)!',
      soapCooldown: (timer) => `Sabun Asas tempoh bertenang (${timer})`,
      bathImmediate: (itemShort) => `Terus mandi (${itemShort})!`,
      bathWalking: (itemShort) => `Menuju tab mandi (${itemShort})...`,
      sleepingZzz: 'Zzz... Sedang tidur',
      waitBathing: 'Tunggu sebentar, sedang mandi!',
      petCooldown: (isFull, timer) =>
        `${isFull ? 'Kasih Sayang' : 'Belai Ringkas'} tempoh bertenang (${timer})`,
      petSuccess: (happy, isSulking, hungerDelta, isRain) => {
        const sulkTag = isSulking ? ' (Merajuk)' : '';
        const hTag = hungerDelta < 0 ? ` · ${hungerDelta} Kenyang` : '';
        const rTag = isRain ? ' · Tenang semasa hujan' : '';
        return `+${happy} Gembira${sulkTag} · +0 Tenaga${hTag}${rTag}`;
      },
      alreadySleeping: 'Kucing sedang tidur!',
      energyFull: 'Tenaga sudah penuh (100)!',
      tooFreshToSleep: 'Masih segar (>85 Tenaga) pada Siang! Enggan tidur',
      onlyBriefNapAllowed: 'Tenaga >70 pada Siang! Hanya mahu tidur sekejap',
      briefDayNapStart: (energy) => `Masih agak segar — tidur sekejap (1.5 min · +${energy} Tenaga)`,
      sleepStart: (shortName, mins, bonusText, desc) =>
        `${shortName} (${mins} min${bonusText}): ${desc}`,
      sleepBonusMorning: 'Pagi +10%',
      sleepBonusNight: 'Malam +20%',
      sleepBonusRain: 'Hujan +10%',
      sleepBonusLateNight: 'Pulih 3x',
      sleepInterrupted: 'Tidur terganggu! -10 Gembira',
      miniGameNeedChild: 'Mini-Game dibuka bermula Fasa Anak!',
      playLockedSleep: 'Bermain dikunci semasa kucing tidur!',
      miniGameNeedHeal: 'Sedang sakit — sembuhkan dahulu sebelum Mini-Game!',
      miniGameLowEnergy: 'Tenaga < 20! Terlalu lemah untuk Mini-Game',
      tooHungry: 'Terlalu lapar! Beri makan dahulu',
      miniGameCooldown: (timer) => `Mini-Game tempoh bertenang (${timer})`,
      bathingNow: 'Sedang mandi di tab!',
      playSickBlocked: 'Sedang sakit — Mainan Interaktif ditolak!',
      playLowEnergyBlocked: 'Sangat mengantuk (≤20 Tenaga)! Mainan Interaktif ditolak',
      playCooldown: (timer) => `Mainan Interaktif tempoh bertenang (${timer})`,
      playLateNightNotice: (cost, happyFull) =>
        `Mengantuk teruk (01:00–06:00)! Tenaga main 5x (-${cost} Tenaga${happyFull ? ' · +0 Gembira' : ''})`,
      playHappyFullDrowsy: (cost) =>
        `Mula Mengantuk · Tenaga main 1.15x (-${cost} Tenaga · +0 Gembira)`,
      playHappyFull: 'Gembira penuh (100) · +0 Gembira',
      playSulking: (happy, drowsyPenalty) =>
        `Merajuk (<40) · Kesan kurang (+${happy} Gembira${drowsyPenalty ? ' · Tenaga 1.15x' : ''})`,
      playDrowsyPenalty: (cost, midday) =>
        `Mula Mengantuk · Tenaga main naik 1.15x (-${cost} Tenaga${midday ? ' · Bonus Siang +10%' : ''})`,
      playWeakened: (happy) => `Lemah · Main kurang maksimum (+${happy} Gembira)`,
      playMiddayBonus: (happy) => `Main Siang! +${happy} Gembira (Bonus +10%)`,
      medAlreadyGiven: 'Ubat sudah diberi · Sedang pulih berperingkat',
      medNotNeeded: (name) => `${name} sihat! Ubat hanya apabila sakit`,
      medGiven: 'Diberi Ubat · Pemulihan bermula (kesan hilang di 90%)',
      miniGameSummaryFull: (e, hun, cln) =>
        `+0 Gembira · -${e} Tenaga · -${hun} Kenyang · -${cln} Bersih`,
      miniGameSummaryReduced: (happy, e, cln) =>
        `+${happy} Gembira (Berkurang) · -${e} Tenaga · -${cln} Bersih`,
      miniGameSummaryNormal: (happy, tags, e, hun, cln) =>
        `+${happy} Gembira${tags} · -${e} Tenaga · -${hun} Kenyang · -${cln} Bersih`,
      newBackground: (name) => `Suasana Baharu: ${name}!`,
      newBed: (name) => `Tilam Baharu: ${name}!`,
      newBathtub: (name) => `Tab Mandi Baharu: ${name}!`,
      newToy: (name) => `Mainan Baharu: ${name}!`,
      newCostume: (name) => `Kostum Baharu: ${name}!`,
      awaySummary: (hungerLost, healthLost) =>
        `Lama tiada · Kenyang -${hungerLost}%${healthLost >= 1 ? ` · Sihat -${healthLost}%` : ''}`,
      phaseBannerPagi: 'Pagi tiba (06:00) · Bonus tidur +10% Tenaga',
      phaseBannerSiang: 'Siang tiba (12:00) · Main +10% Gembira',
      phaseBannerMalam: 'Malam tiba (18:00) · Bonus tidur +20% Tenaga',
      rainStart: (phaseLabel) => `Hujan ${phaseLabel} turun · Tidur +10% Tenaga`,
      rainStop: (phaseLabel) => `Hujan reda · Langit ${phaseLabel} cerah`,
      newDayCoins: (day) => `Hari ke-${day}! +10 Syiling`,
      overworkSick: 'Keletihan! Tenaga 0 terlalu lama — Kucing jatuh sakit!',
      sleepCompleteAuto: (energy) => `Auto-Tidur selesai! Tenaga pulih +${energy}`,
      sleepCompletePower: (energy, happy) =>
        `Tidur Sekejap selesai! +${energy} Tenaga · +${happy} Gembira`,
      sleepCompleteFull: (energy, happy) =>
        `Tidur Penuh selesai! +${energy} Tenaga · +${happy} Gembira`,
      drowsyNoticeNight: 'Mula mengantuk (≤50 Tenaga · Malam) · Masa untuk tidur!',
      drowsyNoticeRain: 'Mula mengantuk (≤45 Tenaga · Hujan) · Nyaman untuk tidur!',
      drowsyNoticeNormal: 'Mula mengantuk (21–40 Tenaga) · Jom berehat!',
      drowsyHeavyLateNight:
        'Pukul 01:00–06:00: Mengantuk teruk! Enggan berlari · Tidur pulih 3x lebih pantas',
      drowsyHeavyNormal: 'Sangat mengantuk (1–20 Tenaga)! Segera tidurkan',
      autoSleepStart: (energy) => `Keletihan Melampau! Masuk [AUTO-TIDUR] 4 min (+${energy} Tenaga)`,
      sickCleared90: 'Kesihatan 90%! Kesan sakit hilang!',
      recovered100: (name) => `${name} Pulih Sepenuhnya 100%!`,
      becameSickHealth: (health, name) => `Kesihatan ${health}%! ${name} jatuh sakit!`,
      becameSickDirtyZero: 'Kebersihan 0%! Kucing jatuh sakit!',
      becameSickChronicDirty: 'Terlalu kerap kotor! Kucing jatuh sakit',
      playSessionComplete: (happy, energy, hunger) =>
        `Main Selesai: +${happy} Gembira · -${energy} Tenaga · -${hunger} Kenyang`,
      brushLockedSleep: 'Mandi & berus dikunci semasa kucing tidur!',
      brushHint: 'Gosok badan kucing (+10 Bersih)',
      brushFullWangi: 'Bersih 100%! Wangi ✨',
      brushGain: (pts) => `+${pts} Bersih`,
      lateNightNoZoom: 'Mengantuk teruk (01:00–06:00)! Enggan berlari',
      playMiddayTag: 'Siang +10%',
      rainTag: 'Hujan +5',
    },
  },
};

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  id: ID_TRANSLATIONS,
  en: EN_TRANSLATIONS,
  th: TH_TRANSLATIONS,
  vi: VI_TRANSLATIONS,
  ms: MS_TRANSLATIONS,
};

export function getTranslations(lang: AppLanguage): Translations {
  return TRANSLATIONS[lang] ?? ID_TRANSLATIONS;
}

export function getLanguageMeta(lang: AppLanguage): LanguageOption {
  return LANGUAGE_OPTIONS.find((l) => l.id === lang) ?? LANGUAGE_OPTIONS[0];
}
