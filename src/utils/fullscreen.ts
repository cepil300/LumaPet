type FullscreenDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
};

type FullscreenEl = HTMLElement & {
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void> | void;
};

type CapacitorWindow = Window & {
  Capacitor?: {
    Plugins?: {
      StatusBar?: {
        hide?: () => Promise<void>;
        show?: () => Promise<void>;
        setOverlaysWebView?: (opts: { overlay: boolean }) => Promise<void>;
      };
      NavigationBar?: {
        hide?: () => Promise<void>;
        show?: () => Promise<void>;
      };
    };
  };
};

export function isTouchOrAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  const isCoarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const isMobileUa = /android|iphone|ipad|ipod/i.test(navigator.userAgent || '');
  return isCoarse || isMobileUa;
}

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as FullscreenDoc;
  if (doc.fullscreenElement || doc.webkitFullscreenElement) return true;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(display-mode: fullscreen)').matches;
  }
  return false;
}

export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as FullscreenDoc;
  const el = document.documentElement as FullscreenEl;
  return Boolean(
    doc.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      el.requestFullscreen ||
      el.webkitRequestFullscreen
  );
}

export async function requestImmersiveFullscreen(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  try {
    const capPlugins = (window as CapacitorWindow).Capacitor?.Plugins;
    await capPlugins?.StatusBar?.setOverlaysWebView?.({ overlay: true }).catch(() => {});
    await capPlugins?.StatusBar?.hide?.().catch(() => {});
    await capPlugins?.NavigationBar?.hide?.().catch(() => {});
  } catch {
    // Ignore native bridge unavailability
  }

  try {
    const doc = document as FullscreenDoc;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const el = document.documentElement as FullscreenEl;
      if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: 'hide' }).catch(async () => {
          await el.requestFullscreen();
        });
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
    }
  } catch {
    // Browser may require a direct user gesture or disallow fullscreen in iframe
  }

  try {
    const orient = screen.orientation as
      | (ScreenOrientation & { lock?: (orientation: string) => Promise<void> })
      | undefined;
    await orient?.lock?.('landscape')?.catch(() => {});
  } catch {
    // Ignore orientation lock failure on desktop
  }

  return isFullscreenActive();
}

export async function exitImmersiveFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    const doc = document as FullscreenDoc;
    if (doc.fullscreenElement && doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch {
    // Ignore exit fullscreen failure
  }
}

export async function toggleImmersiveFullscreen(): Promise<boolean> {
  if (isFullscreenActive()) {
    await exitImmersiveFullscreen();
    return false;
  }
  return requestImmersiveFullscreen();
}
