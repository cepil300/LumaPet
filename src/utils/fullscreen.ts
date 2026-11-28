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
    isNativePlatform?: () => boolean;
    Plugins?: {
      SystemBars?: {
        hide?: (opts?: { bar?: string }) => Promise<void>;
        show?: (opts?: { bar?: string }) => Promise<void>;
        setStyle?: (opts?: { style?: string }) => Promise<void>;
      };
      StatusBar?: {
        hide?: () => Promise<void>;
        show?: () => Promise<void>;
        setOverlaysWebView?: (opts: { overlay: boolean }) => Promise<void>;
      };
      NavigationBar?: {
        hide?: () => Promise<void>;
        show?: () => Promise<void>;
        setTransparency?: (opts: { isTransparent: boolean }) => Promise<void>;
      };
    };
  };
};

export function isTouchOrAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  const isCoarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const isAnyCoarse = window.matchMedia?.('(any-pointer: coarse)').matches ?? false;
  const hasTouch = (navigator.maxTouchPoints ?? 0) > 0;
  const isMobileUa = /android|iphone|ipad|ipod/i.test(navigator.userAgent || '');
  return isCoarse || isAnyCoarse || hasTouch || isMobileUa;
}

export function isNativeAndroidWrapper(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as CapacitorWindow).Capacitor;
  if (!cap) return false;
  return Boolean(
    cap.isNativePlatform?.() ||
      cap.Plugins?.SystemBars ||
      cap.Plugins?.StatusBar ||
      cap.Plugins?.NavigationBar
  );
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

export function hideNativeAndroidSystemBars(): void {
  if (typeof window === 'undefined') return;
  try {
    const capPlugins = (window as CapacitorWindow).Capacitor?.Plugins;
    if (!capPlugins) return;
    void capPlugins.SystemBars?.hide?.()?.catch(() => {});
    void capPlugins.StatusBar?.setOverlaysWebView?.({ overlay: true })?.catch(() => {});
    void capPlugins.StatusBar?.hide?.()?.catch(() => {});
    void capPlugins.NavigationBar?.setTransparency?.({ isTransparent: true })?.catch(() => {});
    void capPlugins.NavigationBar?.hide?.()?.catch(() => {});
  } catch {
    // Ignore native bridge unavailability
  }
}

export function lockLandscapeOrientation(): void {
  if (typeof screen === 'undefined') return;
  try {
    const orient = screen.orientation as
      | (ScreenOrientation & { lock?: (orientation: string) => Promise<void> })
      | undefined;
    void orient?.lock?.('landscape')?.catch(() => {});
  } catch {
    // Ignore orientation lock failure on desktop or unsupported browsers
  }
}

let userOptedOutFullscreen = false;

export function isFullscreenOptedOut(): boolean {
  return userOptedOutFullscreen;
}

export async function requestImmersiveFullscreen(explicit = false): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (explicit) {
    userOptedOutFullscreen = false;
  } else if (userOptedOutFullscreen) {
    return isFullscreenActive();
  }

  // Trigger browser Fullscreen API synchronously BEFORE any await so the active
  // user gesture token (click / touchend / pointerup) is preserved on Android Chrome.
  let fullscreenPromise: Promise<void> | undefined;
  try {
    const doc = document as FullscreenDoc;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const el = document.documentElement as FullscreenEl;
      if (el.requestFullscreen) {
        fullscreenPromise = el.requestFullscreen({ navigationUI: 'hide' }).catch(() =>
          el.requestFullscreen()
        );
      } else if (el.webkitRequestFullscreen) {
        const res = el.webkitRequestFullscreen();
        if (res && typeof (res as Promise<void>).catch === 'function') {
          fullscreenPromise = (res as Promise<void>).catch(() => {});
        }
      }
    }
  } catch {
    // Browser may require a direct user gesture or disallow fullscreen in iframe
  }

  hideNativeAndroidSystemBars();
  lockLandscapeOrientation();

  if (fullscreenPromise) {
    try {
      await fullscreenPromise;
      lockLandscapeOrientation();
    } catch {
      // Ignore fullscreen rejection
    }
  }

  return isFullscreenActive();
}

export async function exitImmersiveFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  userOptedOutFullscreen = true;
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
  return requestImmersiveFullscreen(true);
}
