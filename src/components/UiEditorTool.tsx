import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Minus,
  Monitor,
  Move,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GameState } from '../types/game';

const UI_EDITOR_STORAGE_KEY = 'rumahkucing_ui_layout_v1';

export type UiViewportMode = 'desktop' | 'tablet' | 'mobile';

export interface UiElementOverride {
  id: string;
  label: string;
  screen: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  hidden?: boolean;
  text?: string;
  color?: string;
  bgColor?: string;
}

type ProfileOverridesMap = Record<UiViewportMode, Record<string, UiElementOverride>>;

interface StoredUiLayoutV2 {
  version: 2;
  profiles: ProfileOverridesMap;
}

interface UiEditorToolProps {
  gameState: GameState;
}

interface RectBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const VIEWPORT_META: {
  id: UiViewportMode;
  label: string;
  shortLabel: string;
}[] = [
  { id: 'desktop', label: 'Current Screen Size', shortLabel: 'Current Size' },
  { id: 'tablet', label: 'Tablet', shortLabel: 'Tablet' },
  { id: 'mobile', label: 'Mobile', shortLabel: 'Mobile' },
];

function detectViewportMode(): UiViewportMode {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w <= 540 || h <= 500) return 'mobile';
  if (w <= 850) return 'tablet';
  return 'desktop';
}

function emptyProfiles(): ProfileOverridesMap {
  return {
    desktop: {},
    tablet: {},
    mobile: {},
  };
}

function readLayoutStore(): ProfileOverridesMap {
  try {
    const raw = localStorage.getItem(UI_EDITOR_STORAGE_KEY);
    if (!raw) return emptyProfiles();
    const parsed = JSON.parse(raw) as Partial<StoredUiLayoutV2> & Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return emptyProfiles();

    if (parsed.version === 2 && parsed.profiles && typeof parsed.profiles === 'object') {
      const p = parsed.profiles as Partial<ProfileOverridesMap>;
      return {
        desktop: p.desktop && typeof p.desktop === 'object' ? p.desktop : {},
        tablet: p.tablet && typeof p.tablet === 'object' ? p.tablet : {},
        mobile: p.mobile && typeof p.mobile === 'object' ? p.mobile : {},
      };
    }

    // Migrate legacy flat v1 overrides into desktop only so tablet & mobile stay isolated
    const legacyDesktop: Record<string, UiElementOverride> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (v && typeof v === 'object' && 'x' in v && 'y' in v) {
        legacyDesktop[k] = v as UiElementOverride;
      }
    }
    return {
      desktop: legacyDesktop,
      tablet: {},
      mobile: {},
    };
  } catch {
    return emptyProfiles();
  }
}

function getScreenKey(gameState: GameState): string {
  return gameState === 'TITLE_MENU' ? 'TITLE_MENU' : 'PLAYING';
}

function getCssPath(el: HTMLElement): string {
  const parts: string[] = [];
  let cur: HTMLElement | null = el;
  const root = document.getElementById('root');
  while (cur && cur !== root && cur !== document.body) {
    const tag = cur.tagName.toLowerCase();
    const parent: HTMLElement | null = cur.parentElement;
    if (!parent) break;
    const sameTagSiblings = Array.from(parent.children).filter(
      (c) => c.tagName.toLowerCase() === tag
    );
    const idx = sameTagSiblings.indexOf(cur) + 1;
    parts.unshift(`${tag}:nth-of-type(${Math.max(1, idx)})`);
    cur = parent;
  }
  return parts.join(' > ');
}

function resolveElementMeta(el: HTMLElement, screen: string): { id: string; label: string } {
  const explicitId = el.getAttribute('data-ui-id');
  const explicitLabel = el.getAttribute('data-ui-label');
  if (explicitId) {
    return {
      id: `id:${explicitId}`,
      label: explicitLabel || explicitId,
    };
  }
  const path = getCssPath(el);
  const tag = el.tagName.toLowerCase();
  const aria = el.getAttribute('aria-label') || el.getAttribute('title');
  const rawText = (el.textContent || '').trim().replace(/\s+/g, ' ');
  const fallbackLabel =
    aria ||
    (rawText && rawText.length <= 24 ? rawText : '') ||
    `${tag.toUpperCase()}`;
  return {
    id: `sel:${screen}:${path}`,
    label: fallbackLabel,
  };
}

function findElementById(id: string, currentScreen: string): HTMLElement | null {
  if (id.startsWith('id:')) {
    const key = id.slice(3);
    return document.querySelector<HTMLElement>(`[data-ui-id="${CSS.escape(key)}"]`);
  }
  if (id.startsWith('sel:')) {
    const rest = id.slice(4);
    const colonIdx = rest.indexOf(':');
    if (colonIdx === -1) return null;
    const screen = rest.slice(0, colonIdx);
    const selector = rest.slice(colonIdx + 1);
    if (screen !== currentScreen || !selector) return null;
    const root = document.getElementById('root');
    if (!root) return null;
    try {
      return root.querySelector<HTMLElement>(selector);
    } catch {
      return null;
    }
  }
  return null;
}

function isSimpleEditableTextElement(el: HTMLElement): boolean {
  if (
    el.tagName === 'IMG' ||
    el.tagName === 'SVG' ||
    el.tagName === 'CANVAS' ||
    el.tagName === 'INPUT'
  ) {
    return false;
  }
  if (el.children.length === 0) {
    return (el.textContent || '').trim().length > 0;
  }
  return false;
}

function applyOverrideToDom(el: HTMLElement, ov: UiElementOverride | undefined) {
  if (!ov) {
    el.style.translate = '';
    el.style.scale = '';
    el.style.opacity = '';
    el.style.pointerEvents = '';
    el.style.color = '';
    el.style.backgroundColor = '';
    const origDisplay = el.getAttribute('data-ui-orig-display');
    if (origDisplay !== null) {
      el.style.display = origDisplay;
      el.removeAttribute('data-ui-orig-display');
    }
    const origText = el.getAttribute('data-ui-orig-text');
    if (origText !== null) {
      el.textContent = origText;
      el.removeAttribute('data-ui-orig-text');
    }
    return;
  }

  const hasMove = ov.x !== 0 || ov.y !== 0;
  const hasScale = Math.abs(ov.scale - 1) > 0.001;

  if (hasMove || hasScale) {
    const computedDisplay = window.getComputedStyle(el).display;
    if (computedDisplay === 'inline') {
      if (el.getAttribute('data-ui-orig-display') === null) {
        el.setAttribute('data-ui-orig-display', el.style.display || '');
      }
      el.style.display = 'inline-block';
    }
  } else {
    const origDisplay = el.getAttribute('data-ui-orig-display');
    if (origDisplay !== null) {
      el.style.display = origDisplay;
      el.removeAttribute('data-ui-orig-display');
    }
  }

  el.style.translate = hasMove ? `${ov.x}px ${ov.y}px` : '';
  el.style.scale = hasScale ? String(ov.scale) : '';
  el.style.opacity = ov.hidden ? '0' : ov.opacity < 0.999 ? String(ov.opacity) : '';
  el.style.pointerEvents = ov.hidden ? 'none' : '';
  el.style.color = ov.color || '';
  el.style.backgroundColor = ov.bgColor || '';

  if (typeof ov.text === 'string' && isSimpleEditableTextElement(el)) {
    if (el.getAttribute('data-ui-orig-text') === null) {
      el.setAttribute('data-ui-orig-text', el.textContent ?? '');
    }
    if (el.textContent !== ov.text) {
      el.textContent = ov.text;
    }
  } else if (ov.text === undefined) {
    const origText = el.getAttribute('data-ui-orig-text');
    if (origText !== null) {
      el.textContent = origText;
      el.removeAttribute('data-ui-orig-text');
    }
  }
}

export const UiEditorTool: React.FC<UiEditorToolProps> = ({ gameState }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [cornerPos, setCornerPos] = useState<'bottom' | 'top'>('bottom');
  const [stepPx, setStepPx] = useState<1 | 5 | 15>(5);
  const [copied, setCopied] = useState(false);

  const [detectedMode, setDetectedMode] = useState<UiViewportMode>(() => detectViewportMode());
  const [autoFollowViewport, setAutoFollowViewport] = useState(true);
  const [manualMode, setManualMode] = useState<UiViewportMode>(() => detectViewportMode());
  const activeMode: UiViewportMode = autoFollowViewport ? detectedMode : manualMode;

  const [profiles, setProfiles] = useState<ProfileOverridesMap>(() => readLayoutStore());
  const overrides = useMemo(() => profiles[activeMode], [profiles, activeMode]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [selectedRect, setSelectedRect] = useState<RectBox | null>(null);
  const [hoverRect, setHoverRect] = useState<RectBox | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string>('');
  const [canEditText, setCanEditText] = useState(false);
  const [currentOrigText, setCurrentOrigText] = useState('');
  const [quickTargets, setQuickTargets] = useState<{ id: string; label: string }[]>([]);

  const selectedElRef = useRef<HTMLElement | null>(null);
  const appliedElementsRef = useRef<Set<HTMLElement>>(new Set());
  const dragSessionRef = useRef<{
    kind: 'move' | 'scale';
    id: string;
    label: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origScale: number;
    centerX: number;
    centerY: number;
    startDist: number;
    moved: boolean;
  } | null>(null);

  const screenKey = getScreenKey(gameState);

  const persistProfiles = useCallback((next: ProfileOverridesMap) => {
    try {
      const payload: StoredUiLayoutV2 = {
        version: 2,
        profiles: next,
      };
      localStorage.setItem(UI_EDITOR_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  const updateOverride = useCallback(
    (id: string, label: string, updater: (prev: UiElementOverride) => UiElementOverride) => {
      setProfiles((prevProfiles) => {
        const modeOverrides = prevProfiles[activeMode];
        const current: UiElementOverride = modeOverrides[id] ?? {
          id,
          label,
          screen: screenKey,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
        };
        const updated = updater(current);
        const isClean =
          updated.x === 0 &&
          updated.y === 0 &&
          Math.abs(updated.scale - 1) < 0.001 &&
          Math.abs(updated.opacity - 1) < 0.001 &&
          !updated.hidden &&
          updated.text === undefined &&
          !updated.color &&
          !updated.bgColor;
        const nextModeOverrides = { ...modeOverrides };
        if (isClean) {
          delete nextModeOverrides[id];
        } else {
          nextModeOverrides[id] = updated;
        }
        const nextProfiles: ProfileOverridesMap = {
          ...prevProfiles,
          [activeMode]: nextModeOverrides,
        };
        persistProfiles(nextProfiles);
        return nextProfiles;
      });
    },
    [activeMode, persistProfiles, screenKey]
  );

  // Track viewport size changes so Current Size / Tablet / Mobile automatically isolate
  useEffect(() => {
    const onResize = () => {
      setDetectedMode(detectViewportMode());
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const refreshQuickTargets = useCallback(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-ui-id]'));
    const list: { id: string; label: string }[] = [];
    const seen = new Set<string>();
    for (const n of nodes) {
      const uid = n.getAttribute('data-ui-id');
      if (!uid) continue;
      const id = `id:${uid}`;
      if (seen.has(id)) continue;
      seen.add(id);
      list.push({
        id,
        label: n.getAttribute('data-ui-label') || uid,
      });
    }
    setQuickTargets(list);
  }, []);

  const syncSelectedRect = useCallback(() => {
    const el = selectedElRef.current;
    if (!el || !document.contains(el)) {
      setSelectedRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setSelectedRect({
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    });
  }, []);

  const selectDomElement = useCallback(
    (el: HTMLElement | null) => {
      if (!el) {
        selectedElRef.current = null;
        setSelectedId(null);
        setSelectedLabel('');
        setSelectedRect(null);
        setCanEditText(false);
        setCurrentOrigText('');
        return;
      }
      const meta = resolveElementMeta(el, screenKey);
      selectedElRef.current = el;
      setSelectedId(meta.id);
      setSelectedLabel(meta.label);
      const editable = isSimpleEditableTextElement(el);
      setCanEditText(editable);
      setCurrentOrigText(
        el.getAttribute('data-ui-orig-text') ?? (el.textContent || '').trim()
      );
      const r = el.getBoundingClientRect();
      setSelectedRect({
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      });
    },
    [screenKey]
  );

  // Clear previously touched DOM elements not in the active profile, then apply active profile overrides
  const applyAllOverrides = useCallback(() => {
    const activeSet = new Set<HTMLElement>();
    for (const [id, ov] of Object.entries(overrides)) {
      const el = findElementById(id, screenKey);
      if (el) {
        activeSet.add(el);
        applyOverrideToDom(el, ov);
      }
    }

    for (const prevEl of appliedElementsRef.current) {
      if (!activeSet.has(prevEl) && document.contains(prevEl)) {
        applyOverrideToDom(prevEl, undefined);
      }
    }
    appliedElementsRef.current = activeSet;
    syncSelectedRect();
  }, [overrides, screenKey, syncSelectedRect]);

  useEffect(() => {
    applyAllOverrides();
    refreshQuickTargets();
  }, [applyAllOverrides, refreshQuickTargets, gameState]);

  // Re-apply when DOM changes (modals/subviews opening)
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    let rafId = 0;
    const observer = new MutationObserver(() => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        applyAllOverrides();
        refreshQuickTargets();
      });
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [applyAllOverrides, refreshQuickTargets]);

  // Keep selected rect synced on resize/scroll
  useEffect(() => {
    if (!editMode) return;
    const onResize = () => syncSelectedRect();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [editMode, syncSelectedRect]);

  // Clear selection when screen switches
  useEffect(() => {
    selectDomElement(null);
    setHoverRect(null);
  }, [screenKey, selectDomElement]);

  // Capture-phase interactive inspect, drag-to-move, and corner drag-to-scale when editMode is ON
  useEffect(() => {
    if (!editMode) {
      setHoverRect(null);
      return;
    }

    const pickTargetElement = (rawTarget: EventTarget | null): HTMLElement | null => {
      if (!(rawTarget instanceof HTMLElement)) return null;
      if (rawTarget.closest('[data-ui-editor-root="true"]')) return null;
      if (rawTarget.closest('[data-ui-overlay="true"]')) return null;
      const root = document.getElementById('root');
      if (!root || !root.contains(rawTarget)) return null;
      if (rawTarget.tagName === 'CANVAS') return null;
      if (rawTarget.id === 'root' || rawTarget.tagName === 'MAIN') return null;
      const tagged = rawTarget.closest<HTMLElement>('[data-ui-id]');
      if (!tagged) {
        const rect = rawTarget.getBoundingClientRect();
        if (rect.width > window.innerWidth * 0.85 && rect.height > window.innerHeight * 0.85) {
          return null;
        }
      }
      if (tagged) {
        if (
          rawTarget.tagName === 'IMG' ||
          rawTarget.tagName === 'SVG' ||
          rawTarget.tagName === 'PATH' ||
          rawTarget.tagName === 'SPAN'
        ) {
          return tagged;
        }
      }
      if (
        rawTarget.tagName === 'PATH' ||
        rawTarget.tagName === 'CIRCLE' ||
        rawTarget.tagName === 'LINE'
      ) {
        const svg = rawTarget.closest<HTMLElement>('svg');
        return svg || tagged || rawTarget;
      }
      return rawTarget;
    };

    const onPointerMove = (e: PointerEvent) => {
      const drag = dragSessionRef.current;
      if (drag) {
        e.preventDefault();
        e.stopPropagation();
        if (drag.kind === 'move') {
          const dx = Math.round(e.clientX - drag.startX);
          const dy = Math.round(e.clientY - drag.startY);
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.moved = true;
          updateOverride(drag.id, drag.label, (prev) => ({
            ...prev,
            x: drag.origX + dx,
            y: drag.origY + dy,
          }));
        } else if (drag.kind === 'scale') {
          const dist = Math.hypot(e.clientX - drag.centerX, e.clientY - drag.centerY);
          const ratio = dist / Math.max(12, drag.startDist);
          const nextScale = Math.max(
            0.3,
            Math.min(2.5, Math.round(drag.origScale * ratio * 100) / 100)
          );
          drag.moved = true;
          updateOverride(drag.id, drag.label, (prev) => ({
            ...prev,
            scale: nextScale,
          }));
        }
        return;
      }

      const candidate = pickTargetElement(e.target);
      if (!candidate || candidate === selectedElRef.current) {
        setHoverRect(null);
        return;
      }
      const r = candidate.getBoundingClientRect();
      const meta = resolveElementMeta(candidate, screenKey);
      setHoverRect({ left: r.left, top: r.top, width: r.width, height: r.height });
      setHoverLabel(meta.label);
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-ui-editor-root="true"]')) return;

      const scaleHandle = target?.closest('[data-ui-scale-handle="true"]');
      if (scaleHandle && selectedElRef.current && selectedId) {
        e.preventDefault();
        e.stopPropagation();
        const r = selectedElRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const curOv = overrides[selectedId];
        dragSessionRef.current = {
          kind: 'scale',
          id: selectedId,
          label: selectedLabel,
          startX: e.clientX,
          startY: e.clientY,
          origX: curOv?.x ?? 0,
          origY: curOv?.y ?? 0,
          origScale: curOv?.scale ?? 1,
          centerX: cx,
          centerY: cy,
          startDist: Math.hypot(e.clientX - cx, e.clientY - cy),
          moved: false,
        };
        return;
      }

      const candidate = pickTargetElement(e.target);
      if (!candidate) return;

      e.preventDefault();
      e.stopPropagation();

      selectDomElement(candidate);
      const meta = resolveElementMeta(candidate, screenKey);
      const curOv = overrides[meta.id];
      const r = candidate.getBoundingClientRect();
      dragSessionRef.current = {
        kind: 'move',
        id: meta.id,
        label: meta.label,
        startX: e.clientX,
        startY: e.clientY,
        origX: curOv?.x ?? 0,
        origY: curOv?.y ?? 0,
        origScale: curOv?.scale ?? 1,
        centerX: r.left + r.width / 2,
        centerY: r.top + r.height / 2,
        startDist: 1,
        moved: false,
      };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (dragSessionRef.current) {
        e.preventDefault();
        e.stopPropagation();
        dragSessionRef.current = null;
        window.requestAnimationFrame(syncSelectedRect);
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-ui-editor-root="true"]')) return;
      if (target?.closest('[data-ui-overlay="true"]')) return;
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('pointermove', onPointerMove, true);
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('click', onClickCapture, true);
    return () => {
      window.removeEventListener('pointermove', onPointerMove, true);
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointerup', onPointerUp, true);
      window.removeEventListener('click', onClickCapture, true);
    };
  }, [
    editMode,
    overrides,
    screenKey,
    selectDomElement,
    selectedId,
    selectedLabel,
    syncSelectedRect,
    updateOverride,
  ]);

  const currentOv: UiElementOverride | null = selectedId
    ? overrides[selectedId] ?? {
        id: selectedId,
        label: selectedLabel,
        screen: screenKey,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      }
    : null;

  const handleSelectParent = () => {
    const cur = selectedElRef.current;
    if (!cur) return;
    const parent = cur.parentElement;
    const root = document.getElementById('root');
    if (!parent || parent === root || parent === document.body || parent.tagName === 'MAIN') {
      return;
    }
    selectDomElement(parent);
  };

  const handleResetSelected = () => {
    if (!selectedId) return;
    const el = selectedElRef.current || findElementById(selectedId, screenKey);
    if (el) applyOverrideToDom(el, undefined);
    setProfiles((prev) => {
      const nextMode = { ...prev[activeMode] };
      delete nextMode[selectedId];
      const next = { ...prev, [activeMode]: nextMode };
      persistProfiles(next);
      return next;
    });
    window.requestAnimationFrame(syncSelectedRect);
  };

  const handleResetCurrentProfile = () => {
    for (const id of Object.keys(overrides)) {
      const el = findElementById(id, screenKey);
      if (el) applyOverrideToDom(el, undefined);
    }
    setProfiles((prev) => {
      const next = { ...prev, [activeMode]: {} };
      persistProfiles(next);
      return next;
    });
    window.requestAnimationFrame(syncSelectedRect);
  };

  const handleCopyCss = async () => {
    if (!currentOv) return;
    const modeLabel =
      VIEWPORT_META.find((m) => m.id === activeMode)?.label ?? activeMode;
    const lines = [
      `/* ${currentOv.label} [${modeLabel}] (${currentOv.id}) */`,
      `translate: ${currentOv.x}px ${currentOv.y}px;`,
      `scale: ${currentOv.scale};`,
    ];
    if (currentOv.opacity < 0.999) lines.push(`opacity: ${currentOv.opacity};`);
    if (currentOv.color) lines.push(`color: ${currentOv.color};`);
    if (currentOv.bgColor) lines.push(`background-color: ${currentOv.bgColor};`);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard errors
    }
  };

  const handlePickQuickTarget = (id: string, label: string) => {
    const el = findElementById(id, screenKey);
    if (el) {
      selectDomElement(el);
    } else {
      setSelectedId(id);
      setSelectedLabel(label);
    }
  };

  const handleSelectProfileTab = (mode: UiViewportMode) => {
    if (mode === detectedMode) {
      setAutoFollowViewport(true);
    } else {
      setAutoFollowViewport(false);
    }
    setManualMode(mode);
  };

  const modifiedCount = Object.keys(overrides).length;
  const activeModeLabel =
    VIEWPORT_META.find((m) => m.id === activeMode)?.shortLabel ?? 'Current Size';
  const cornerClasses =
    cornerPos === 'bottom'
      ? 'right-3 bottom-3 sm:right-4 sm:bottom-4'
      : 'right-3 top-16 sm:right-4 sm:top-20';

  return (
    <>
      {/* Live Selection & Hover Highlight Overlay (only when Edit Mode is active) */}
      {editMode && hoverRect && (
        <div
          data-ui-overlay="true"
          className="fixed z-40 pointer-events-none border-2 border-dashed border-sky-400 rounded-md bg-sky-400/10"
          style={{
            left: hoverRect.left - 2,
            top: hoverRect.top - 2,
            width: Math.max(8, hoverRect.width + 4),
            height: Math.max(8, hoverRect.height + 4),
          }}
        >
          <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-sky-500 text-white text-[10px] font-bold whitespace-nowrap shadow">
            {hoverLabel}
          </span>
        </div>
      )}

      {editMode && selectedRect && currentOv && (
        <div
          data-ui-overlay="true"
          className="fixed z-40 pointer-events-none border-2 border-[#F59E0B] rounded-md shadow-[0_0_0_1px_rgba(15,23,42,0.75)]"
          style={{
            left: selectedRect.left - 3,
            top: selectedRect.top - 3,
            width: Math.max(12, selectedRect.width + 6),
            height: Math.max(12, selectedRect.height + 6),
          }}
        >
          {/* Floating Info Badge */}
          <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-[#F59E0B] text-[#0F172A] text-[10px] font-extrabold whitespace-nowrap shadow flex items-center gap-1.5 tabular-nums">
            <span>{currentOv.label}</span>
            <span className="opacity-80">
              {currentOv.x},{currentOv.y} · {Math.round(currentOv.scale * 100)}%
            </span>
          </div>

          {/* Bottom-Right Drag-to-Scale Corner Handle */}
          <button
            type="button"
            data-ui-scale-handle="true"
            title="Tarik untuk Perbesar / Perkecil"
            aria-label="Tarik untuk Perbesar atau Perkecil"
            className="pointer-events-auto absolute -right-2.5 -bottom-2.5 w-5 h-5 rounded-full bg-[#F59E0B] border-2 border-[#0F172A] shadow-md flex items-center justify-center cursor-nwse-resize hover:scale-110 transition-transform"
          >
            <Maximize2 className="w-2.5 h-2.5 text-[#0F172A]" />
          </button>
        </div>
      )}

      {/* Collapsed Right-Corner Trigger Button */}
      {!drawerOpen && (
        <button
          type="button"
          data-ui-editor-root="true"
          onClick={() => {
            setDrawerOpen(true);
            setIsMinimized(false);
            setEditMode(true);
          }}
          title="Buka Tool Edit, Geser & Skala UI"
          className={`fixed ${cornerClasses} z-50 pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-[#0F172A]/95 hover:bg-[#1E293B] text-[#FDE68A] border-2 border-[#F59E0B] shadow-[0_6px_18px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#FBBF24] shrink-0" />
          <span className="font-display font-extrabold text-xs whitespace-nowrap">
            Edit UI
          </span>
          {modifiedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-[#0F172A] text-[10px] font-black tabular-nums leading-none">
              {modifiedCount}
            </span>
          )}
        </button>
      )}

      {/* Minimized Left-Edge Icon (~20% visible at screen edge so canvas stays unobstructed) */}
      {drawerOpen && isMinimized && (
        <button
          type="button"
          data-ui-editor-root="true"
          onClick={() => setIsMinimized(false)}
          title="Buka kembali Editor UI"
          aria-label="Buka kembali Editor UI"
          className="fixed left-0 bottom-20 sm:bottom-24 z-50 pointer-events-auto w-14 h-12 -translate-x-[80%] hover:-translate-x-[68%] rounded-r-2xl bg-[#0F172A]/95 text-[#FDE68A] border-2 border-l-0 border-[#F59E0B] shadow-[4px_4px_16px_rgba(0,0,0,0.45)] flex items-center justify-end pr-1.5 transition-transform cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#FBBF24] shrink-0" />
        </button>
      )}

      {/* Expanded Right-Corner UI Editor Panel */}
      {drawerOpen && !isMinimized && (
        <aside
          data-ui-editor-root="true"
          onKeyDown={(e) => e.stopPropagation()}
          aria-label="Tool Edit UI"
          className={`fixed ${cornerClasses} z-50 pointer-events-auto w-[min(92vw,324px)] max-h-[82dvh] flex flex-col rounded-2xl bg-[#0F172A]/95 text-[#F8FAFC] border-2 border-[#F59E0B] shadow-[0_14px_38px_rgba(0,0,0,0.58)] backdrop-blur-md overflow-hidden`}
        >
          {/* Header */}
          <div className="px-3 py-2.5 bg-[#1E293B] border-b border-slate-700 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <SlidersHorizontal className="w-4 h-4 text-[#FBBF24] shrink-0" />
                <span className="font-display font-extrabold text-xs sm:text-sm text-[#FDE68A] whitespace-nowrap">
                  Editor UI
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-[9.5px] font-bold text-sky-300 whitespace-nowrap">
                  {activeModeLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setEditMode((v) => !v)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                    editMode
                      ? 'bg-emerald-500 text-[#0F172A]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {editMode ? 'Edit: ON' : 'Edit: OFF'}
                </button>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate">
                {editMode
                  ? 'Tarik elemen untuk geser · sudut untuk skala'
                  : 'Aktifkan Edit untuk pilih elemen di layar'}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                title="Minimize Editor UI ke pinggir kiri"
                aria-label="Minimize Editor UI ke pinggir kiri"
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-[#FDE68A] flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCornerPos((p) => (p === 'bottom' ? 'top' : 'bottom'))}
                title={
                  cornerPos === 'bottom'
                    ? 'Pindah ke Pojok Kanan Atas'
                    : 'Pindah ke Pojok Kanan Bawah'
                }
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                {cornerPos === 'bottom' ? (
                  <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setIsMinimized(false);
                  setDrawerOpen(false);
                }}
                aria-label="Tutup Editor UI"
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <>
              {/* Isolated Viewport Profile Tabs: Current Size | Tablet | Mobile */}
              <div className="px-2.5 py-2 bg-[#121B2D] border-b border-slate-700/80 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mode Layar Terpisah
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoFollowViewport((v) => !v)}
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold cursor-pointer ${
                      autoFollowViewport
                        ? 'bg-sky-500/20 border border-sky-400/50 text-sky-200'
                        : 'bg-slate-800 border border-slate-600 text-slate-400'
                    }`}
                  >
                    {autoFollowViewport ? 'Auto: ON' : 'Auto: OFF'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {VIEWPORT_META.map((mode) => {
                    const isSelected = activeMode === mode.id;
                    const count = Object.keys(profiles[mode.id]).length;
                    const IconComp =
                      mode.id === 'desktop'
                        ? Monitor
                        : mode.id === 'tablet'
                        ? Tablet
                        : Smartphone;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleSelectProfileTab(mode.id)}
                        className={`py-1.5 px-1.5 rounded-lg text-[10.5px] font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors border ${
                          isSelected
                            ? 'bg-[#F59E0B] border-[#FBBF24] text-[#0F172A]'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <IconComp className="w-3 h-3 shrink-0" />
                        <span className="truncate">{mode.shortLabel}</span>
                        {count > 0 && (
                          <span
                            className={`px-1 rounded text-[9px] tabular-nums ${
                              isSelected
                                ? 'bg-[#0F172A]/20 text-[#0F172A]'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Target Chips */}
              {quickTargets.length > 0 && (
                <div className="px-2.5 py-2 bg-[#162033] border-b border-slate-700/80 shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Elemen Cepat ({screenKey === 'TITLE_MENU' ? 'Menu Awal' : 'Dalam Game'})
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-[64px] overflow-y-auto">
                    {quickTargets.map((item) => {
                      const isActive = selectedId === item.id;
                      const isEdited = Boolean(overrides[item.id]);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handlePickQuickTarget(item.id, item.label)}
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-colors cursor-pointer border ${
                            isActive
                              ? 'bg-[#F59E0B] border-[#FBBF24] text-[#0F172A]'
                              : isEdited
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 hover:bg-amber-500/30'
                              : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                {!currentOv ? (
                  <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 text-center space-y-2">
                    <Move className="w-6 h-6 text-[#FBBF24] mx-auto" />
                    <p className="font-bold text-slate-200 text-xs">
                      Belum ada elemen dipilih
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Perubahan pada mode{' '}
                      <span className="text-[#FDE68A] font-bold">{activeModeLabel}</span>{' '}
                      hanya berlaku untuk mode ini dan tidak mengubah mode layar lain.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Selected Element Header + Parent Step Up */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/90 border border-slate-700">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Elemen · {activeModeLabel}
                        </p>
                        <p className="font-extrabold text-[#FDE68A] truncate">
                          {currentOv.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={handleSelectParent}
                          title="Pilih container induk (Parent)"
                          className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[10.5px] font-bold text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                          <span>Induk</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyCss}
                          title="Salin CSS posisi & skala"
                          className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[10.5px] font-bold text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copied ? 'Disalin' : 'CSS'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Geser (Move X, Y) */}
                    <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                          <Move className="w-3.5 h-3.5 text-[#FBBF24]" />
                          Geser Posisi
                        </span>
                        <div className="flex items-center gap-1">
                          {([1, 5, 15] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setStepPx(s)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums cursor-pointer ${
                                stepPx === s
                                  ? 'bg-[#F59E0B] text-[#0F172A]'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              {s}px
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* D-Pad */}
                        <div className="grid grid-cols-3 gap-1 w-[92px] shrink-0">
                          <span />
                          <button
                            type="button"
                            onClick={() =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                y: p.y - stepPx,
                              }))
                            }
                            aria-label="Geser atas"
                            className="h-7 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span />
                          <button
                            type="button"
                            onClick={() =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                x: p.x - stepPx,
                              }))
                            }
                            aria-label="Geser kiri"
                            className="h-7 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                x: 0,
                                y: 0,
                              }))
                            }
                            title="Reset Posisi (0, 0)"
                            className="h-7 rounded bg-slate-900 hover:bg-slate-700 text-[9px] font-extrabold text-[#FDE68A] flex items-center justify-center cursor-pointer"
                          >
                            0,0
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                x: p.x + stepPx,
                              }))
                            }
                            aria-label="Geser kanan"
                            className="h-7 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <span />
                          <button
                            type="button"
                            onClick={() =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                y: p.y + stepPx,
                              }))
                            }
                            aria-label="Geser bawah"
                            className="h-7 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <span />
                        </div>

                        {/* Numeric X / Y Inputs */}
                        <div className="flex-1 space-y-1.5">
                          <label className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-300">
                            <span>X (px)</span>
                            <input
                              type="number"
                              value={currentOv.x}
                              onChange={(e) =>
                                updateOverride(currentOv.id, currentOv.label, (p) => ({
                                  ...p,
                                  x: Math.round(Number(e.target.value) || 0),
                                }))
                              }
                              className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-right font-mono text-[#FDE68A]"
                            />
                          </label>
                          <label className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-300">
                            <span>Y (px)</span>
                            <input
                              type="number"
                              value={currentOv.y}
                              onChange={(e) =>
                                updateOverride(currentOv.id, currentOv.label, (p) => ({
                                  ...p,
                                  y: Math.round(Number(e.target.value) || 0),
                                }))
                              }
                              className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-right font-mono text-[#FDE68A]"
                            />
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Perbesar / Perkecil (Scale) */}
                    <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                          Perbesar / Perkecil
                        </span>
                        <span className="font-mono font-bold text-[#FDE68A] tabular-nums">
                          {Math.round(currentOv.scale * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateOverride(currentOv.id, currentOv.label, (p) => ({
                              ...p,
                              scale: Math.max(0.3, Math.round((p.scale - 0.05) * 100) / 100),
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Perkecil (-5%)"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                          <span>Kecil</span>
                        </button>

                        <input
                          type="range"
                          min={30}
                          max={250}
                          step={1}
                          value={Math.round(currentOv.scale * 100)}
                          onChange={(e) =>
                            updateOverride(currentOv.id, currentOv.label, (p) => ({
                              ...p,
                              scale: Number(e.target.value) / 100,
                            }))
                          }
                          aria-label="Skala elemen UI"
                          className="flex-1 accent-[#F59E0B] cursor-pointer"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            updateOverride(currentOv.id, currentOv.label, (p) => ({
                              ...p,
                              scale: Math.min(2.5, Math.round((p.scale + 0.05) * 100) / 100),
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold inline-flex items-center gap-1 cursor-pointer"
                          title="Perbesar (+5%)"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Besar</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-1">
                        {[0.75, 0.9, 1, 1.15, 1.35].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                scale: preset,
                              }))
                            }
                            className={`py-1 rounded text-[10px] font-bold tabular-nums cursor-pointer ${
                              Math.abs(currentOv.scale - preset) < 0.015
                                ? 'bg-[#F59E0B] text-[#0F172A]'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            {Math.round(preset * 100)}%
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Edit Text, Opacity, Visibility & Colors */}
                    <section className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                          Edit Tampilan
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateOverride(currentOv.id, currentOv.label, (p) => ({
                              ...p,
                              hidden: !p.hidden,
                            }))
                          }
                          className={`px-2 py-1 rounded-lg text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                            currentOv.hidden
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                        >
                          {currentOv.hidden ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Disembunyikan</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Tampil</span>
                            </>
                          )}
                        </button>
                      </div>

                      {canEditText && (
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-300">
                            Edit Teks
                          </label>
                          <input
                            type="text"
                            value={currentOv.text ?? currentOrigText}
                            onChange={(e) =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                text: e.target.value,
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-xs font-semibold text-white focus:outline-none focus:border-[#F59E0B]"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10.5px] font-bold text-slate-300">
                          <span>Transparansi (Opacity)</span>
                          <span className="font-mono text-[#FDE68A]">
                            {Math.round(currentOv.opacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={Math.round(currentOv.opacity * 100)}
                          onChange={(e) =>
                            updateOverride(currentOv.id, currentOv.label, (p) => ({
                              ...p,
                              opacity: Number(e.target.value) / 100,
                            }))
                          }
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-[10.5px] font-bold text-slate-300">
                          <span>Warna Teks</span>
                          <input
                            type="color"
                            value={currentOv.color || '#FFFDF7'}
                            onChange={(e) =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                color: e.target.value,
                              }))
                            }
                            className="w-6 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                          />
                        </label>
                        <label className="flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-[10.5px] font-bold text-slate-300">
                          <span>Latar</span>
                          <input
                            type="color"
                            value={currentOv.bgColor || '#FFF3D9'}
                            onChange={(e) =>
                              updateOverride(currentOv.id, currentOv.label, (p) => ({
                                ...p,
                                bgColor: e.target.value,
                              }))
                            }
                            className="w-6 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                          />
                        </label>
                      </div>
                    </section>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-3 py-2 bg-[#1E293B] border-t border-slate-700 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!selectedId || !overrides[selectedId]}
                  onClick={handleResetSelected}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                    selectedId && overrides[selectedId]
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>Reset Elemen</span>
                </button>

                <button
                  type="button"
                  disabled={modifiedCount === 0}
                  onClick={handleResetCurrentProfile}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                    modifiedCount > 0
                      ? 'bg-rose-600/85 hover:bg-rose-500 text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset {activeModeLabel} ({modifiedCount})</span>
                </button>
              </div>
            </>
        </aside>
      )}
    </>
  );
};
