export const OFFLINE_MAX_SECONDS = 259200; // 3 hari = 259.200 detik
export const OFFLINE_HUNGER_DECAY_PER_SEC = 100 / OFFLINE_MAX_SECONDS;
// Jika kenyang turun di bawah 20% saat offline, kesehatan turun proporsional (100 poin per 24 jam kelaparan)
export const OFFLINE_HEALTH_DECAY_PER_SEC = 100 / 86400;

export const LOW_HUNGER_NOTIFICATION_MESSAGE =
  'Meow! Tingkat kenyang kucingmu tinggal 20%. Segera beri makan sebelum dia sakit!';

export interface OfflineDecayResult {
  elapsedSeconds: number;
  hunger: number;
  health: number;
  hungerLost: number;
  healthLost: number;
  dippedBelow20: boolean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function calculateOfflineDecay(
  initialHunger: number,
  initialHealth: number,
  lastSavedTime?: number,
  now = Date.now()
): OfflineDecayResult {
  if (!lastSavedTime || !Number.isFinite(lastSavedTime)) {
    return {
      elapsedSeconds: 0,
      hunger: clamp(initialHunger, 0, 100),
      health: clamp(initialHealth, 0, 100),
      hungerLost: 0,
      healthLost: 0,
      dippedBelow20: initialHunger < 20,
    };
  }

  const elapsedSeconds = Math.max(0, (now - lastSavedTime) / 1000);
  const startHunger = clamp(initialHunger, 0, 100);
  const startHealth = clamp(initialHealth, 0, 100);

  const rawHunger = startHunger - elapsedSeconds * OFFLINE_HUNGER_DECAY_PER_SEC;
  const newHunger = clamp(rawHunger, 0, 100);

  let secondsBelow20 = 0;
  if (startHunger <= 20) {
    secondsBelow20 = elapsedSeconds;
  } else if (newHunger < 20) {
    const secondsUntil20 = (startHunger - 20) / OFFLINE_HUNGER_DECAY_PER_SEC;
    secondsBelow20 = Math.max(0, elapsedSeconds - secondsUntil20);
  }

  const healthLost = secondsBelow20 * OFFLINE_HEALTH_DECAY_PER_SEC;
  const newHealth = clamp(startHealth - healthLost, 0, 100);

  return {
    elapsedSeconds,
    hunger: newHunger,
    health: newHealth,
    hungerLost: Math.max(0, startHunger - newHunger),
    healthLost: Math.max(0, startHealth - newHealth),
    dippedBelow20: newHunger < 20,
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
      icon: '/assets/ui/cat_logo_wink.png',
      tag: 'rumah-kucing-hunger-20',
    });
  } catch {
    // Fallback for browsers requiring ServiceWorkerRegistration.showNotification
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) =>
          reg.showNotification('Rumah Kucing', {
            body: LOW_HUNGER_NOTIFICATION_MESSAGE,
            icon: '/assets/ui/cat_logo_wink.png',
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
  if (currentHunger <= 20) return;

  const safeRate = drainPerSec > 0 ? drainPerSec : OFFLINE_HUNGER_DECAY_PER_SEC;
  const secondsUntil20 = (currentHunger - 20) / safeRate;
  // Clamp timeout delay within 32-bit signed int limit (~24.8 days)
  const delayMs = Math.max(1000, Math.min(2147483647, Math.round(secondsUntil20 * 1000)));

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
