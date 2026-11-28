import {
  AdultEvolutionBranch,
  BowlTreatType,
  CAT_BATHTUBS,
  CAT_BREEDS,
  CatBathtubId,
  CatBedId,
  CatBehavior,
  CatBreed,
  CatGlassesId,
  CatHatId,
  CatScarfId,
  CatToyId,
  DrowsyStage,
  LifeStage,
  RoomBackgroundId,
  ToolMode,
} from '../types/game';

export interface Particle {
  active: boolean;
  kind:
    | 'heart'
    | 'sparkle'
    | 'heart_sparkle'
    | 'sleep_cloud'
    | 'dust_puff'
    | 'tear_drop'
    | 'bubble'
    | 'crumb'
    | 'zzz'
    | 'text';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  label?: string;
  swayAmp?: number;
  swayFreq?: number;
  phase?: number;
}

export interface RoomTransform {
  offsetX: number;
  offsetY: number;
  drawW: number;
  drawH: number;
  scale: number;
}

export interface CatRenderState {
  nx: number;
  ny: number;
  z: number;
  facing: 1 | -1;
  behavior: CatBehavior;
  breed: CatBreed;
  scaleX: number;
  scaleY: number;
  animTime: number;
  isSprinting: boolean;
  cleanliness: number;
  energy: number;
  hunger: number;
  happiness: number;
  isHungry: boolean;
  isSick: boolean;
  isRecovering: boolean;
  drowsyStage?: DrowsyStage;
  lifeStage?: LifeStage;
  adultBranch?: AdultEvolutionBranch;
  time: number;
  equippedHat?: CatHatId;
  equippedGlasses?: CatGlassesId;
  equippedScarf?: CatScarfId;
  isDragging?: boolean;
  dragSwing?: number;
  dragTime?: number;
  sleepingBed?: CatBedId;
  sleepingBedDragging?: boolean;
  sleepSpriteCol?: number;
}

export interface BowlRenderState {
  nx: number;
  ny: number;
  amount: number;
  treatType: BowlTreatType;
  isDragging?: boolean;
}

export interface ToyRenderState {
  active: boolean;
  toyId: CatToyId;
  nx: number;
  ny: number;
  z: number;
  rotation: number;
  facing?: 1 | -1;
  time?: number;
}

const CELL_W = 340;
const CELL_H = 260;

export function pickRandomSleepPoseCol(lifeStage?: LifeStage, prevCol?: number): number {
  const isYoungStage = lifeStage === 'baby' || lifeStage === 'child';
  const pool = isYoungStage ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];
  const candidates = prevCol !== undefined ? pool.filter((c) => c !== prevCol) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  return list[Math.floor(Math.random() * list.length)];
}

function pickSpriteFrame(cat: CatRenderState): { row: number; col: number } {
  // Slow down animation speed when sick or heavily drowsy
  const isDrowsyHeavy =
    !cat.isSick &&
    (cat.drowsyStage
      ? cat.drowsyStage === 'drowsy_heavy' || cat.drowsyStage === 'exhausted'
      : cat.energy <= 20);
  const isDrowsyLight =
    !cat.isSick &&
    (cat.drowsyStage ? cat.drowsyStage === 'drowsy_light' : cat.energy > 20 && cat.energy <= 40);
  const t = cat.isSick ? cat.animTime * 0.45 : isDrowsyHeavy ? cat.animTime * 0.56 : cat.animTime;

  switch (cat.behavior) {
    case 'EATING': {
      const frames = [0, 1, 2, 3, 2, 4, 5];
      return { row: 0, col: frames[Math.floor(t * 6.2) % frames.length] };
    }
    case 'GROOMING': {
      const frames = [0, 1, 2, 3, 4, 5];
      return { row: 1, col: frames[Math.floor(t * 4.6) % frames.length] };
    }
    case 'PURRING': {
      const frames = [2, 3, 4, 5];
      return { row: 1, col: frames[Math.floor(t * 5.2) % frames.length] };
    }
    case 'PLAYING': {
      if (cat.z > 0.008) {
        return { row: 2, col: 4 };
      }
      if (cat.isSprinting) {
        return { row: 6, col: Math.floor(t * 9.5) % 4 };
      }
      return { row: 2, col: Math.floor(t * 6.5) % 6 };
    }
    case 'SLEEPING':
    case 'DOZING': {
      return { row: 3, col: cat.sleepSpriteCol ?? 2 };
    }
    case 'ROLLING': {
      return { row: 7, col: Math.floor(t * 2.4) % 4 };
    }
    case 'WALKING': {
      const walkSpeed = cat.isSick
        ? 2.6
        : isDrowsyHeavy
        ? 3.5
        : cat.hunger <= 12
        ? 4.8
        : 7.2;
      return { row: 5, col: Math.floor(t * walkSpeed) % 5 };
    }
    case 'STRETCHING': {
      return { row: 7, col: Math.floor(t * 2.4) % 4 };
    }
    case 'IDLE':
    default: {
      if (cat.isSick) {
        return { row: 4, col: 0 };
      }
      if (isDrowsyHeavy) {
        return { row: 4, col: 0 };
      }
      if (isDrowsyLight) {
        const drowsySeq = [0, 0, 1, 0];
        return { row: 4, col: drowsySeq[Math.floor(t * 1.3) % drowsySeq.length] };
      }
      if (cat.isHungry) {
        const hungrySeq = [2, 3, 3, 4, 2, 3];
        return { row: 4, col: hungrySeq[Math.floor(t * 1.9) % hungrySeq.length] };
      }
      const seq = [0, 0, 1, 2, 3, 2, 0, 4, 0];
      return { row: 4, col: seq[Math.floor(t * 2.2) % seq.length] };
    }
  }
}

export function computeRoomTransform(
  viewW: number,
  viewH: number,
  imgW = 1600,
  imgH = 900
): RoomTransform {
  const scale = Math.max(viewW / imgW, viewH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const offsetX = (viewW - drawW) * 0.5;
  const isShortLandscape = viewH <= 540 && viewW > viewH;
  const offsetY = (viewH - drawH) * (isShortLandscape ? 0.84 : 0.72);
  return { offsetX, offsetY, drawW, drawH, scale };
}

export function roomToScreen(
  nx: number,
  ny: number,
  rt: RoomTransform
): { x: number; y: number } {
  return {
    x: rt.offsetX + nx * rt.drawW,
    y: rt.offsetY + ny * rt.drawH,
  };
}

export function screenToRoom(
  sx: number,
  sy: number,
  rt: RoomTransform
): { nx: number; ny: number } {
  return {
    nx: (sx - rt.offsetX) / rt.drawW,
    ny: (sy - rt.offsetY) / rt.drawH,
  };
}

export function drawRoomBackdrop(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  rt: RoomTransform,
  img: HTMLImageElement | null,
  timeOfDay: number,
  isSleeping: boolean,
  activeBackground: RoomBackgroundId = 'classic_home'
): void {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, rt.offsetX, rt.offsetY, rt.drawW, rt.drawH);
  } else {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, viewH * 0.65);
    if (activeBackground === 'apartment') {
      wallGrad.addColorStop(0, '#D49E8D');
      wallGrad.addColorStop(1, '#C48A79');
    } else if (activeBackground === 'tatami') {
      wallGrad.addColorStop(0, '#E9DFC6');
      wallGrad.addColorStop(1, '#DDD0B0');
    } else {
      wallGrad.addColorStop(0, '#E8EFE6');
      wallGrad.addColorStop(1, '#DCE6D9');
    }
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, viewW, viewH * 0.65);

    const floorGrad = ctx.createLinearGradient(0, viewH * 0.65, 0, viewH);
    if (activeBackground === 'tatami') {
      floorGrad.addColorStop(0, '#DCD49A');
      floorGrad.addColorStop(1, '#C7BD7D');
    } else {
      floorGrad.addColorStop(0, '#EAD2B0');
      floorGrad.addColorStop(1, '#D8B78C');
    }
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, viewH * 0.65, viewW, viewH * 0.35);
  }
}

export function drawCatBed(
  ctx: CanvasRenderingContext2D,
  bedId: CatBedId,
  nx: number,
  ny: number,
  rt: RoomTransform,
  bedImgs: Partial<Record<CatBedId, HTMLImageElement>>,
  isDragging = false
): void {
  const pos = roomToScreen(nx, ny, rt);
  const s = Math.max(0.58, rt.scale * 0.96);
  const liftY = isDragging ? 14 * s : 0;

  ctx.save();

  // Floor placement indicator & shadow when dragging
  if (isDragging) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.78)';
    ctx.fillStyle = 'rgba(38, 30, 22, 0.22)';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 8 * s, 82 * s, 26 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.fillStyle = 'rgba(38, 30, 22, 0.16)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 8 * s, 72 * s, 21 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const img = bedImgs[bedId];
  const scaleMult = isDragging ? 1.07 : 1.0;

  ctx.translate(pos.x, pos.y - liftY);
  ctx.scale(s * scaleMult, s * scaleMult);

  if (img && img.complete && img.naturalWidth > 0) {
    const targetW = bedId === 'tenda_kerajaan' ? 168 : 158;
    const targetH = targetW * (img.naturalHeight / img.naturalWidth);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, -targetW / 2, -targetH * 0.82, targetW, targetH);
    ctx.imageSmoothingEnabled = true;
  } else {
    // Fallback cushion while image loads
    ctx.fillStyle = '#F29D38';
    ctx.strokeStyle = '#312924';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, -10, 68, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export interface BedSleepLayout {
  dx: number;
  dy: number;
  catScaleMult: number;
}

export const CAT_BED_SLEEP_LAYOUT: Record<CatBedId, BedSleepLayout> = {
  kasur_kucing: { dx: 0, dy: -31, catScaleMult: 0.88 },
  kasur_semangka: { dx: -5, dy: -32, catScaleMult: 0.88 },
  keranjang_rajut: { dx: -6, dy: -38, catScaleMult: 0.85 },
  kasur_donat: { dx: 0, dy: -39, catScaleMult: 0.82 },
  tenda_kerajaan: { dx: -17, dy: 1, catScaleMult: 0.72 },
};

export function getCatBedSleepAnchor(
  bedId: CatBedId,
  rt: RoomTransform,
  isBedDragging = false
): { dx: number; dy: number; catScaleMult: number } {
  const layout = CAT_BED_SLEEP_LAYOUT[bedId] ?? CAT_BED_SLEEP_LAYOUT.kasur_kucing;
  const bedScale = Math.max(0.58, rt.scale * 0.96);
  const dragScale = isBedDragging ? 1.07 : 1.0;
  const liftY = isBedDragging ? 14 * bedScale : 0;
  return {
    dx: layout.dx * bedScale * dragScale,
    dy: layout.dy * bedScale * dragScale - liftY,
    catScaleMult: layout.catScaleMult * dragScale,
  };
}

export function drawCatBathtub(
  ctx: CanvasRenderingContext2D,
  tubId: CatBathtubId,
  nx: number,
  ny: number,
  rt: RoomTransform,
  tubImgs: Partial<Record<CatBathtubId, HTMLImageElement>>,
  isDragging = false,
  bathState?: {
    active: boolean;
    breed: CatBreed;
    frameCol: number;
    bathSheets: Partial<Record<CatBreed, HTMLImageElement>>;
  }
): void {
  const pos = roomToScreen(nx, ny, rt);
  const s = Math.max(0.58, rt.scale * 0.96);
  const liftY = isDragging ? 14 * s : 0;

  ctx.save();

  if (isDragging) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.fillStyle = 'rgba(38, 30, 22, 0.22)';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 8 * s, 82 * s, 26 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.fillStyle = 'rgba(38, 30, 22, 0.17)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 8 * s, 72 * s, 21 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const scaleMult = isDragging ? 1.07 : 1.0;
  ctx.translate(pos.x, pos.y - liftY);
  ctx.scale(s * scaleMult, s * scaleMult);

  const tubMeta = CAT_BATHTUBS.find((t) => t.id === tubId) ?? CAT_BATHTUBS[0];
  const bathSheet = bathState?.active ? bathState.bathSheets[bathState.breed] : undefined;

  if (
    bathState?.active &&
    bathSheet &&
    bathSheet.complete &&
    bathSheet.naturalWidth > 0 &&
    bathSheet.naturalHeight > 0
  ) {
    const cols = 4;
    const rows = 5;
    const cellW = bathSheet.naturalWidth / cols;
    const cellH = bathSheet.naturalHeight / rows;
    const col = Math.max(0, Math.min(cols - 1, Math.floor(bathState.frameCol)));
    const row = Math.max(0, Math.min(rows - 1, tubMeta.spriteRow));
    const spriteCellLayout: Record<CatBathtubId, { width: number; anchorY: number }> = {
      bak_kucing: { width: 209, anchorY: 0.851 },
      bak_ikan: { width: 212, anchorY: 0.879 },
      bak_onsen: { width: 212, anchorY: 0.871 },
      bak_kerang: { width: 218, anchorY: 0.865 },
      bak_batu: { width: 198, anchorY: 0.859 },
    };
    const layout = spriteCellLayout[tubId] ?? spriteCellLayout.bak_kucing;
    const targetW = layout.width;
    const targetH = targetW * (cellH / cellW);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
      bathSheet,
      col * cellW,
      row * cellH,
      cellW,
      cellH,
      -targetW / 2,
      -targetH * layout.anchorY,
      targetW,
      targetH
    );
  } else {
    const img = tubImgs[tubId];
    if (img && img.complete && img.naturalWidth > 0) {
      const targetW =
        tubId === 'bak_ikan'
          ? 166
          : tubId === 'bak_batu'
          ? 156
          : tubId === 'bak_kerang'
          ? 152
          : tubId === 'bak_onsen'
          ? 142
          : 148;
      const targetH = targetW * (img.naturalHeight / img.naturalWidth);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, -targetW / 2, -targetH * 0.83, targetW, targetH);
    } else {
      ctx.fillStyle = '#BAE6FD';
      ctx.strokeStyle = '#312924';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(0, -14, 64, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawFoodBowl(
  ctx: CanvasRenderingContext2D,
  bowl: BowlRenderState,
  rt: RoomTransform
): void {
  const pos = roomToScreen(bowl.nx, bowl.ny, rt);
  const s = Math.max(0.55, rt.scale * 0.92);
  const isDragging = Boolean(bowl.isDragging);
  const liftY = isDragging ? 11 * s : 0;

  ctx.save();

  if (isDragging) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.fillStyle = 'rgba(38, 30, 22, 0.22)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 13 * s, 44 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.fillStyle = 'rgba(38, 30, 22, 0.20)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 13 * s, 38 * s, 11.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const scaleMult = isDragging ? 1.08 : 1.0;
  ctx.translate(pos.x, pos.y - liftY);
  ctx.scale(s * scaleMult, s * scaleMult);

  const outline = '#241219';
  const bodyOrange = '#EB6B11';
  const bodyHighlight = '#F68D2E';
  const bodyShadow = '#C84E0A';
  const creamWhite = '#FFFDF7';
  const creamShade = '#EDE3D4';

  // Helper path for flared trapezoidal-rounded bowl silhouette (matches taskbar icon)
  const traceBowlOuter = () => {
    ctx.beginPath();
    ctx.moveTo(-29, -8);
    ctx.bezierCurveTo(-32, -2, -35, 4, -35, 8);
    ctx.bezierCurveTo(-35, 15.5, -18, 18.5, 0, 18.5);
    ctx.bezierCurveTo(18, 18.5, 35, 15.5, 35, 8);
    ctx.bezierCurveTo(35, 4, 32, -2, 29, -8);
    ctx.closePath();
  };

  // Main orange bowl body with warm directional shading
  traceBowlOuter();
  const bodyGrad = ctx.createLinearGradient(-34, -8, 34, 14);
  bodyGrad.addColorStop(0, bodyHighlight);
  bodyGrad.addColorStop(0.28, bodyOrange);
  bodyGrad.addColorStop(0.82, bodyOrange);
  bodyGrad.addColorStop(1, bodyShadow);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Clip inside bowl body for crisp white bottom trim band & front fish badge
  ctx.save();
  traceBowlOuter();
  ctx.clip();

  // Left glossy orange highlight strip
  ctx.fillStyle = 'rgba(255, 220, 165, 0.28)';
  ctx.beginPath();
  ctx.ellipse(-22, 3, 4.5, 9, -0.18, 0, Math.PI * 2);
  ctx.fill();

  // Cream-white lower trim band (wrapping along the bottom curve like the taskbar bowl)
  ctx.fillStyle = creamWhite;
  ctx.beginPath();
  ctx.moveTo(-37, 6.2);
  ctx.bezierCurveTo(-22, 11.8, 22, 11.8, 37, 6.2);
  ctx.lineTo(37, 10.6);
  ctx.bezierCurveTo(22, 16.2, -22, 16.2, -37, 10.6);
  ctx.closePath();
  ctx.fill();

  // Subtle shading on right edge of white bottom trim
  ctx.fillStyle = creamShade;
  ctx.fillRect(18, 6, 19, 11);

  // Dark crisp seam below white bottom band (orange base lip below the white stripe)
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-36, 10.6);
  ctx.bezierCurveTo(-22, 16.2, 22, 16.2, 36, 10.6);
  ctx.stroke();

  // Front centered white rounded rectangular badge
  const bx = -13.5;
  const by = -1.2;
  const bw = 27;
  const bh = 12.2;
  const br = 3.2;
  ctx.fillStyle = creamWhite;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + bw - br, by);
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
  ctx.lineTo(bx + bw, by + bh - br);
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
  ctx.lineTo(bx + br, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
  ctx.lineTo(bx, by + br);
  ctx.quadraticCurveTo(bx, by, bx + br, by);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cute orange fish emblem centered inside the white badge
  ctx.fillStyle = bodyOrange;
  ctx.beginPath();
  ctx.ellipse(-1.4, by + bh * 0.5, 5.2, 3.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fish tail fin on the right
  ctx.beginPath();
  ctx.moveTo(2.8, by + bh * 0.5);
  ctx.lineTo(7.4, by + bh * 0.5 - 2.9);
  ctx.lineTo(7.4, by + bh * 0.5 + 2.9);
  ctx.closePath();
  ctx.fill();
  // Tiny cream fish eye dot
  ctx.fillStyle = creamWhite;
  ctx.beginPath();
  ctx.arc(-4.0, by + bh * 0.5 - 0.6, 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Crisp outer stroke of the bowl body
  traceBowlOuter();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Cream-white upper rim ellipse
  ctx.fillStyle = creamWhite;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, -8.5, 29.5, 8.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Dark roasted interior bowl cavity
  ctx.fillStyle = '#522614';
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(0, -8.5, 24.8, 6.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Deeper shadow inside empty cavity
  ctx.fillStyle = '#3B190C';
  ctx.beginPath();
  ctx.ellipse(0, -7.8, 21.5, 4.4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (bowl.amount > 0.02) {
    const moundScale = 0.45 + 0.55 * bowl.amount;
    ctx.save();
    ctx.translate(0, -8.2);

    if (bowl.treatType === 'milk') {
      // Creamy warm milk pool inside orange fish-badge bowl
      const milkScale = Math.min(1, 0.52 + 0.48 * bowl.amount);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, -0.3, 23.5 * milkScale, 5.6 * milkScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.ellipse(-6, -1.5, 6.5 * milkScale, 1.6 * milkScale, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (bowl.treatType === 'salmon' || bowl.treatType === 'special_food') {
      // Rich kibble base + silver-blue fish & salmon chunks like taskbar icon
      ctx.scale(moundScale, moundScale);
      // Warm golden-brown kibble mound base
      ctx.fillStyle = '#B8662B';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-22, 1.5);
      ctx.quadraticCurveTo(-18, -8, -4, -9.5);
      ctx.quadraticCurveTo(6, -10.5, 16, -6);
      ctx.quadraticCurveTo(22, -2, 22, 1.5);
      ctx.quadraticCurveTo(0, 5.2, -22, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Kibble texture dots
      ctx.fillStyle = '#D98943';
      for (const [kx, ky] of [
        [-11, -2],
        [-3, -5],
        [4, -3],
        [-7, 1],
      ]) {
        ctx.beginPath();
        ctx.arc(kx, ky, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cute blue-silver fish sticking out on the right (matching taskbar icon!)
      ctx.save();
      ctx.translate(10, -4.5);
      ctx.rotate(-0.68);
      ctx.fillStyle = '#8DBCD0';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.7;
      // Tail fin
      ctx.beginPath();
      ctx.moveTo(6.5, 0);
      ctx.lineTo(12.5, -4.2);
      ctx.lineTo(11.2, 0);
      ctx.lineTo(12.5, 4.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Fish body
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5, 4.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fish scale stripes
      ctx.strokeStyle = '#5F8EA4';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-1, -2.5);
      ctx.lineTo(-1, 2.5);
      ctx.moveTo(2.5, -2.2);
      ctx.lineTo(2.5, 2.2);
      ctx.stroke();
      // Fish eye
      ctx.fillStyle = outline;
      ctx.beginPath();
      ctx.arc(-4.2, -0.6, 1.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Small peeking fish head on the left side (like taskbar icon!)
      ctx.save();
      ctx.translate(-12, -2.2);
      ctx.rotate(0.42);
      ctx.fillStyle = '#8DBCD0';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.6, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = outline;
      ctx.beginPath();
      ctx.arc(-1.2, -0.6, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (bowl.treatType === 'catnip' || bowl.treatType === 'snack') {
      ctx.scale(moundScale, moundScale);
      // Warm kibble base + crunchy biscuit treats
      ctx.fillStyle = '#B8662B';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.ellipse(0, -1, 19, 5.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const biscuits = [
        [-9, -2.2],
        [1, -4.0],
        [10, -1.5],
        [-2, 0.8],
      ];
      biscuits.forEach(([bx2, by2], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#E89E52' : '#F4BE76';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(bx2, by2, 5.5, 3.4, i * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (bowl.treatType === 'catnip') {
          ctx.fillStyle = '#2D6A4F';
          ctx.beginPath();
          ctx.arc(bx2 - 0.8, by2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else {
      // Standard kibble mound matching taskbar brown-orange pile
      ctx.scale(moundScale, moundScale);
      ctx.fillStyle = '#A85B24';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-21, 1.5);
      ctx.quadraticCurveTo(-16, -7.2, 0, -8.5);
      ctx.quadraticCurveTo(16, -7.2, 21, 1.5);
      ctx.quadraticCurveTo(0, 4.8, -21, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const nuggets = [
        [-11, -1.2],
        [-3, -4.4],
        [6, -3.5],
        [12, -0.5],
        [-5, 1.2],
        [3, 0.8],
      ];
      nuggets.forEach(([kx, ky], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#C97A39' : '#DF914C';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(kx, ky, 4.6, 3.1, i * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  ctx.restore();
}

export function drawYarnToy(
  ctx: CanvasRenderingContext2D,
  toy: ToyRenderState,
  rt: RoomTransform
): void {
  if (!toy.active) return;
  const pos = roomToScreen(toy.nx, toy.ny, rt);
  const s = Math.max(0.6, rt.scale * 0.95);
  const liftY = toy.z * rt.drawH;
  const t = toy.time ?? 0;

  ctx.save();

  if (toy.toyId === 'laser_pointer') {
    const pulse = 1 + Math.sin(t * 14) * 0.22;
    // Soft red beam from upper corner
    const beamGrad = ctx.createLinearGradient(pos.x + 95 * s, pos.y - 160 * s, pos.x, pos.y);
    beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
    beamGrad.addColorStop(0.65, 'rgba(239, 68, 68, 0.14)');
    beamGrad.addColorStop(1, 'rgba(248, 113, 113, 0.42)');
    ctx.strokeStyle = beamGrad;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(pos.x + 95 * s, pos.y - 160 * s);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Glowing floor halo
    const glow = ctx.createRadialGradient(pos.x, pos.y, 1, pos.x, pos.y, 24 * s * pulse);
    glow.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    glow.addColorStop(0.35, 'rgba(239, 68, 68, 0.35)');
    glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, 24 * s * pulse, 12 * s * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crisp hot center dot
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, 7.5 * s * pulse, 4.5 * s * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF2F2';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, 3.6 * s, 2.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  const shadowScale = Math.max(0.35, 1 - toy.z * 2.5);
  ctx.fillStyle = 'rgba(38, 30, 22, 0.2)';
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y + 8 * s, 20 * s * shadowScale, 7 * s * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(pos.x, pos.y - liftY);
  ctx.scale(s, s);

  if (toy.toyId === 'feather_wand') {
    const flutter = Math.sin(t * 9) * 0.16;
    // Wooden wand angled above
    ctx.save();
    ctx.strokeStyle = '#3B2313';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(46, -68);
    ctx.quadraticCurveTo(18, -48, 2, -26);
    ctx.stroke();

    ctx.strokeStyle = '#C97B42';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(46, -68);
    ctx.quadraticCurveTo(18, -48, 2, -26);
    ctx.stroke();

    // String down to feather cluster
    ctx.strokeStyle = '#FFFDF8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(2, -26);
    ctx.quadraticCurveTo(-4, -14, 0, -4);
    ctx.stroke();

    // Fluttering colorful feathers
    ctx.rotate(flutter);
    const feathers = [
      { angle: -0.55, color: '#2DD4BF', len: 18 },
      { angle: 0.05, color: '#FB7185', len: 20 },
      { angle: 0.6, color: '#FBBF24', len: 17 },
    ];
    feathers.forEach((f) => {
      ctx.save();
      ctx.rotate(f.angle);
      ctx.fillStyle = f.color;
      ctx.strokeStyle = '#2B221E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, f.len * 0.5, 5.5, f.len * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Bell at knot
    ctx.fillStyle = '#FCD34D';
    ctx.strokeStyle = '#2B221E';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -3, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    return;
  }

  if (toy.toyId === 'toy_mouse') {
    const face = toy.facing ?? 1;
    const wiggle = Math.sin(t * 16) * 0.06;
    ctx.scale(face, 1);
    ctx.rotate(wiggle);

    // Wavy pink tail behind (left since facing +1 is right)
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.quadraticCurveTo(-24, Math.sin(t * 14) * 5 - 4, -30, -3);
    ctx.stroke();

    // Spinning wind-up brass key on back
    const keySpin = Math.cos(t * 14);
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(-2, -18);
    ctx.stroke();
    ctx.fillStyle = '#FDE68A';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(-2 - 4 * keySpin, -20, Math.max(1.5, Math.abs(4 * keySpin)), 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-2 + 4 * keySpin, -20, Math.max(1.5, Math.abs(4 * keySpin)), 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Plush mouse body
    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#2B221E';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soft belly highlight
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(2, -2, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute round ear
    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#2B221E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(8, -10, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#F9A8D4';
    ctx.beginPath();
    ctx.arc(8, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye & pink nose
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(11.5, -2.5, 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(17, 1, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  // Default: Yarn ball
  ctx.rotate(toy.rotation);

  ctx.fillStyle = '#EA6B5C';
  ctx.strokeStyle = '#2B221E';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F8A89D';
  ctx.beginPath();
  ctx.arc(-5, -5, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#9E2F23';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.arc(0, 0, 13, -0.4, 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(2, -1, 11, 2.2, 4.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-12, -4);
  ctx.quadraticCurveTo(0, 6, 13, -3);
  ctx.stroke();

  ctx.restore();
}

export const CAT_DRAG_SCRUFF_LOCAL_Y = -222;

export function getCatStageScale(stage: LifeStage = 'adult'): number {
  switch (stage) {
    case 'baby':
      return 0.64;
    case 'child':
      return 0.76;
    case 'teen':
      return 0.86;
    case 'senior':
      return 0.96;
    default:
      return 1;
  }
}

function pickDragSpriteFrame(swing: number, dragTime: number, animTime: number): number {
  if (dragTime < 0.34 && Math.abs(swing) < 0.28) {
    return 0;
  }
  if (swing >= 0.52) return 2;
  if (swing >= 0.16) return 1;
  if (swing <= -0.52) return 6;
  if (swing <= -0.22) return 5;
  if (swing <= -0.09) return 7;
  return Math.floor(animTime * 1.8) % 2 === 0 ? 3 : 4;
}

function getDragAccessoryAnchors(frameCol: number): CatAccessoryAnchors {
  const headTilts: Record<number, { dx: number; dy: number; rot: number }> = {
    0: { dx: 0, dy: 0, rot: 0 },
    1: { dx: -4, dy: 2, rot: 0.08 },
    2: { dx: -6, dy: 6, rot: 0.15 },
    3: { dx: 0, dy: 0, rot: 0 },
    4: { dx: 0, dy: 0, rot: 0 },
    5: { dx: 5, dy: 4, rot: -0.1 },
    6: { dx: 7, dy: 7, rot: -0.15 },
    7: { dx: 2, dy: 1, rot: -0.04 },
  };
  const t = headTilts[frameCol] ?? headTilts[3];
  return {
    hat: { x: t.dx, y: 16 + t.dy, rot: t.rot, scale: 1 },
    glasses: { x: t.dx, y: 42 + t.dy, rot: t.rot, scale: 1 },
    scarf: { x: 0, y: 0, rot: 0, scale: 1 },
  };
}

export function drawCat(
  ctx: CanvasRenderingContext2D,
  cat: CatRenderState,
  rt: RoomTransform,
  spriteSheets: Partial<Record<CatBreed, HTMLImageElement>>,
  babySpriteSheets?: Partial<Record<CatBreed, HTMLImageElement>>,
  childSpriteSheets?: Partial<Record<CatBreed, HTMLImageElement>>,
  dragSpriteSheets?: Partial<Record<CatBreed, HTMLImageElement>>
): void {
  const screenPos = roomToScreen(cat.nx, cat.ny, rt);
  const s = Math.max(0.43, rt.scale * 0.72);
  const jumpPx = cat.z * rt.drawH;
  const stage: LifeStage = cat.lifeStage ?? 'adult';

  if (cat.isDragging) {
    const dragSheet = dragSpriteSheets?.[cat.breed];
    if (dragSheet && dragSheet.complete && dragSheet.naturalWidth > 0) {
      const stageScale = getCatStageScale(stage);
      const shadowSizeMult =
        stage === 'baby' ? 0.68 : stage === 'child' ? 0.74 : stage === 'teen' ? 0.86 : 1;
      const shadowScale = Math.max(0.28, 0.78 - cat.z * 1.1) * shadowSizeMult;

      ctx.save();
      ctx.fillStyle = 'rgba(35, 27, 20, 0.2)';
      ctx.beginPath();
      ctx.ellipse(
        screenPos.x,
        screenPos.y - 2 * s,
        52 * s * shadowScale,
        14 * s * shadowScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.translate(screenPos.x, screenPos.y - jumpPx);
      ctx.scale(s * stageScale, s * stageScale);

      const swing = Math.max(-1.25, Math.min(1.25, cat.dragSwing ?? 0));
      const frameCol = pickDragSpriteFrame(swing, cat.dragTime ?? 0, cat.time);
      const cols = 8;
      const cellW = dragSheet.naturalWidth / cols;
      const cellH = dragSheet.naturalHeight;
      const drawW = 122;
      const drawH = drawW * (cellH / cellW);

      ctx.translate(0, CAT_DRAG_SCRUFF_LOCAL_Y);
      ctx.rotate(swing * 0.11);

      ctx.imageSmoothingEnabled = true;
      if (cat.isSick) {
        ctx.filter = 'saturate(0.55) brightness(0.93) contrast(0.95)';
      } else if (stage === 'senior') {
        ctx.filter = 'saturate(0.82) brightness(1.03) contrast(0.97)';
      }

      ctx.drawImage(
        dragSheet,
        frameCol * cellW,
        0,
        cellW,
        cellH,
        -drawW / 2,
        -drawH * 0.006,
        drawW,
        drawH
      );
      ctx.filter = 'none';

      drawAccessoryAtAnchors(
        ctx,
        getDragAccessoryAnchors(frameCol),
        cat.equippedHat ?? 'none',
        cat.equippedGlasses ?? 'none',
        'default',
        cat.time
      );

      ctx.restore();
      return;
    }
  }
  const isBabyStage = stage === 'baby';
  const isChildStage = stage === 'child';
  const babySheet = babySpriteSheets?.[cat.breed];
  const childSheet = childSpriteSheets?.[cat.breed];
  const hasBabySheet = Boolean(
    isBabyStage && babySheet && babySheet.complete && babySheet.naturalWidth > 0
  );
  const hasChildSheet = Boolean(
    isChildStage && childSheet && childSheet.complete && childSheet.naturalWidth > 0
  );
  const sheet = hasBabySheet
    ? babySheet
    : hasChildSheet
    ? childSheet
    : spriteSheets[cat.breed];

  const isDrowsyHeavy =
    !cat.isSick &&
    (cat.drowsyStage
      ? cat.drowsyStage === 'drowsy_heavy' || cat.drowsyStage === 'exhausted'
      : cat.energy <= 20);
  const isDrowsyLight =
    !cat.isSick &&
    (cat.drowsyStage ? cat.drowsyStage === 'drowsy_light' : cat.energy > 20 && cat.energy <= 40);
  const isRestingPose = cat.behavior === 'SLEEPING' || cat.behavior === 'DOZING';
  // Slow weak breathing slump, heavy step, and gentle head nod when sick or drowsy
  const weakSwayY =
    (cat.isSick || isDrowsyHeavy) && !isRestingPose
      ? Math.sin(cat.time * (cat.isSick ? 1.9 : 2.1)) * (cat.isSick ? 1.8 : 1.7) * s +
        (cat.behavior === 'WALKING'
          ? Math.abs(Math.sin(cat.time * 2.8)) * (cat.isSick ? 2.4 : 1.7) * s
          : 0)
      : isDrowsyLight && !isRestingPose
      ? Math.sin(cat.time * 2.2) * 0.75 * s
      : 0;
  const rollTilt =
    !isRestingPose && (cat.isSick || isDrowsyHeavy)
      ? cat.behavior === 'WALKING'
        ? Math.sin(cat.time * 2.8) * (cat.isSick ? 0.035 : 0.024)
        : Math.sin(cat.time * 1.9) * 0.028
      : 0;
  const sickDroopX =
    cat.isSick && !isRestingPose
      ? 1.035
      : isDrowsyHeavy && !isRestingPose
      ? 1.022
      : 1;
  const sickDroopY =
    cat.isSick && !isRestingPose
      ? 0.935
      : isDrowsyHeavy && !isRestingPose
      ? 0.956
      : 1;
  const rumbleScale =
    cat.isHungry && cat.hunger <= 15 && cat.behavior !== 'EATING' && !cat.isSick && !isRestingPose
      ? Math.sin(cat.time * 10) * 0.025
      : 0;

  const bedSleepAnchor =
    cat.behavior === 'SLEEPING' && cat.sleepingBed
      ? getCatBedSleepAnchor(cat.sleepingBed, rt, cat.sleepingBedDragging)
      : null;
  const anchorX = bedSleepAnchor ? screenPos.x + bedSleepAnchor.dx : screenPos.x;
  const anchorY = bedSleepAnchor ? screenPos.y + bedSleepAnchor.dy : screenPos.y;
  const bedCatMult = bedSleepAnchor ? bedSleepAnchor.catScaleMult : 1;

  ctx.save();

  // Recovery soft mint aura at feet
  if (cat.isRecovering) {
    const pulse = 0.85 + Math.sin(cat.time * 3.2) * 0.15;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.ellipse(
      anchorX,
      anchorY - 2 * s * bedCatMult,
      76 * s * bedCatMult * pulse,
      22 * s * bedCatMult * pulse,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  } else if (stage === 'adult' && cat.adultBranch === 'prima' && !cat.isSick) {
    const pulse = 0.9 + Math.sin(cat.time * 2.5) * 0.1;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.ellipse(
      anchorX,
      anchorY - 2 * s * bedCatMult,
      72 * s * bedCatMult * pulse,
      20 * s * bedCatMult * pulse,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Floor / cushion shadow scaled per life stage
  const shadowSizeMult =
    stage === 'baby' ? 0.68 : stage === 'child' ? 0.74 : stage === 'teen' ? 0.86 : 1;
  const shadowScale = Math.max(0.45, 1 - cat.z * 2.2) * shadowSizeMult;
  ctx.fillStyle = bedSleepAnchor ? 'rgba(35, 27, 20, 0.14)' : 'rgba(35, 27, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(
    anchorX,
    anchorY - 2 * s * bedCatMult,
    (bedSleepAnchor ? 46 : 66) * s * bedCatMult * shadowScale,
    (bedSleepAnchor ? 12 : 18) * s * bedCatMult * shadowScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.translate(anchorX, anchorY - jumpPx + weakSwayY);

  ctx.save();
  ctx.rotate(rollTilt);
  ctx.scale(
    s * bedCatMult * cat.facing * (cat.scaleX * sickDroopX + rumbleScale),
    s * bedCatMult * (cat.scaleY * sickDroopY - rumbleScale * 0.7)
  );

  if ((isChildStage && !hasChildSheet) || (isBabyStage && !hasBabySheet)) {
    drawKittenStageCat(ctx, cat, stage);
    ctx.restore();
    const fallbackScale =
      s * bedCatMult * (stage === 'baby' ? 0.82 : stage === 'child' ? 0.88 : 1);
    if (cat.isSick) {
      drawSickIndicator(ctx, fallbackScale, cat.time);
    } else {
      const emote = pickCatEmoteKind(cat, isDrowsyLight, isDrowsyHeavy);
      if (emote) {
        drawEmoteBubble(
          ctx,
          emote.kind,
          fallbackScale,
          cat.time,
          emote.alpha,
          emote.popScale,
          cat.behavior === 'DOZING',
          cat.hunger <= 15
        );
      }
    }
    ctx.restore();
    return;
  }

  if (sheet && sheet.complete && sheet.naturalWidth > 0) {
    const stageScaleX = isBabyStage
      ? 0.84
      : isChildStage
      ? 0.9
      : stage === 'teen'
      ? 0.84
      : stage === 'senior'
      ? 0.96
      : 1;
    const stageScaleY = isBabyStage
      ? 0.84
      : isChildStage
      ? 0.9
      : stage === 'teen'
      ? 0.88
      : stage === 'senior'
      ? 0.96
      : 1;
    ctx.save();
    ctx.scale(stageScaleX, stageScaleY);

    const { row, col } = pickSpriteFrame(cat);
    const sx = col * CELL_W;
    const sy = row * CELL_H;
    const drawW = CELL_W * 0.72;
    const drawH = CELL_H * 0.72;

    ctx.imageSmoothingEnabled = true;
    if (cat.isSick) {
      ctx.filter = 'saturate(0.55) brightness(0.93) contrast(0.95)';
    } else if (stage === 'senior') {
      ctx.filter = 'saturate(0.82) brightness(1.03) contrast(0.97)';
    }
    ctx.drawImage(
      sheet,
      sx,
      sy,
      CELL_W,
      CELL_H,
      -drawW / 2,
      -drawH + 10,
      drawW,
      drawH
    );
    ctx.filter = 'none';

    // Subtle dirt smudges when cleanliness is low
    if (cat.cleanliness < 45) {
      const alpha = Math.min(0.65, (45 - cat.cleanliness) / 45);
      ctx.fillStyle = `rgba(110, 86, 62, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(-18, -56, 5.5, 0, Math.PI * 2);
      ctx.arc(-6, -42, 4, 0, Math.PI * 2);
      ctx.arc(-28, -44, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (stage === 'senior') {
      drawCatSeniorFeatures(ctx, row, col, cat.time);
    }

    const anchorStage: 'baby' | 'child' | 'adult' = isBabyStage
      ? 'baby'
      : isChildStage
      ? 'child'
      : 'adult';

    if (cat.isSick && !isRestingPose) {
      drawCatSickExpression(ctx, row, col, cat.breed, cat.time, anchorStage);
    } else if ((isDrowsyHeavy || isDrowsyLight) && !isRestingPose) {
      drawCatTiredExpression(
        ctx,
        row,
        col,
        cat.breed,
        cat.time,
        isDrowsyHeavy ? 'heavy' : 'light',
        anchorStage
      );
    }

    drawCatAccessories(
      ctx,
      row,
      col,
      cat.equippedHat ?? 'none',
      cat.equippedGlasses ?? 'none',
      cat.equippedScarf ?? 'default',
      cat.time,
      anchorStage
    );
    ctx.restore();
  } else {
    const profile = CAT_BREEDS[cat.breed];
    ctx.fillStyle = profile.primaryColor;
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -45, 45, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();

  // Floating status / emote bubble above the cat's head (always upright and on top of hat/ears)
  const bubbleScale =
    s *
    bedCatMult *
    (stage === 'baby' ? 0.82 : stage === 'child' ? 0.88 : stage === 'teen' ? 0.94 : 1);
  if (cat.isSick) {
    drawSickIndicator(ctx, bubbleScale, cat.time);
  } else {
    const emote = pickCatEmoteKind(cat, isDrowsyLight, isDrowsyHeavy);
    if (emote) {
      drawEmoteBubble(
        ctx,
        emote.kind,
        bubbleScale,
        cat.time,
        emote.alpha,
        emote.popScale,
        cat.behavior === 'DOZING',
        cat.hunger <= 15
      );
    }
  }

  ctx.restore();
}

export function drawCatPortrait(
  ctx: CanvasRenderingContext2D,
  size: number,
  breed: CatBreed,
  hat: CatHatId,
  glasses: CatGlassesId,
  scarf: CatScarfId,
  sheet: HTMLImageElement | null,
  lifeStage: LifeStage = 'adult'
): void {
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  const s = size / 196;
  ctx.translate(size * 0.48, size * 0.86);
  ctx.scale(s, s);

  const isBaby = lifeStage === 'baby';
  const isChild = lifeStage === 'child';
  const hasSpriteSheet = Boolean(sheet && sheet.complete && sheet.naturalWidth > 0);

  if ((isChild && !hasSpriteSheet) || (isBaby && !hasSpriteSheet)) {
    const scaleBoost = isBaby ? 1.48 : 1.18;
    ctx.save();
    ctx.translate(4, isBaby ? 6 : 2);
    ctx.scale(scaleBoost, scaleBoost);
    drawKittenStageCat(
      ctx,
      {
        nx: 0.5,
        ny: 0.8,
        z: 0,
        facing: 1,
        behavior: 'IDLE',
        breed,
        scaleX: 1,
        scaleY: 1,
        animTime: 0,
        isSprinting: false,
        cleanliness: 100,
        energy: 100,
        hunger: 100,
        happiness: 100,
        isHungry: false,
        isSick: false,
        isRecovering: false,
        lifeStage,
        time: 0,
        equippedHat: hat,
        equippedGlasses: glasses,
        equippedScarf: scarf,
      },
      lifeStage
    );
    ctx.restore();
    ctx.restore();
    return;
  }

  const row = 4;
  const col = 0;
  if (sheet && sheet.complete && sheet.naturalWidth > 0) {
    const stageMult = isBaby
      ? 1.12
      : isChild
      ? 1.04
      : lifeStage === 'teen'
      ? 0.9
      : lifeStage === 'senior'
      ? 0.97
      : 1;
    if (isBaby) {
      ctx.translate(4, -6);
    } else if (isChild) {
      ctx.translate(2, -3);
    }
    ctx.scale(stageMult, stageMult);
    const drawW = CELL_W * 0.72;
    const drawH = CELL_H * 0.72;
    ctx.imageSmoothingEnabled = true;
    if (lifeStage === 'senior') {
      ctx.filter = 'saturate(0.82) brightness(1.03)';
    }
    ctx.drawImage(
      sheet,
      col * CELL_W,
      row * CELL_H,
      CELL_W,
      CELL_H,
      -drawW / 2,
      -drawH + 10,
      drawW,
      drawH
    );
    ctx.filter = 'none';
    if (lifeStage === 'senior') {
      drawCatSeniorFeatures(ctx, row, col, 0);
    }
    drawCatAccessories(
      ctx,
      row,
      col,
      hat,
      glasses,
      scarf,
      0,
      isBaby ? 'baby' : isChild ? 'child' : 'adult'
    );
  } else {
    const profile = CAT_BREEDS[breed];
    ctx.fillStyle = profile.primaryColor;
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -50, 42, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawKittenStageCat(
  ctx: CanvasRenderingContext2D,
  cat: CatRenderState,
  stage: 'baby' | 'child'
): void {
  const profile = CAT_BREEDS[cat.breed];
  const isBaby = stage === 'baby';
  const isDrowsyHeavy =
    !cat.isSick &&
    (cat.drowsyStage
      ? cat.drowsyStage === 'drowsy_heavy' || cat.drowsyStage === 'exhausted'
      : cat.energy <= 20);
  const isDrowsyLight =
    !cat.isSick &&
    (cat.drowsyStage ? cat.drowsyStage === 'drowsy_light' : cat.energy > 20 && cat.energy <= 40);
  const t = cat.isSick ? cat.animTime * 0.45 : isDrowsyHeavy ? cat.animTime * 0.56 : cat.animTime;
  const isSleeping = cat.behavior === 'SLEEPING' || cat.behavior === 'DOZING';
  const isWalking = cat.behavior === 'WALKING' || cat.behavior === 'PLAYING';
  const isEating = cat.behavior === 'EATING';
  const isPurring = cat.behavior === 'PURRING';

  const stageScale = isBaby ? 0.64 : 0.81;
  ctx.save();
  ctx.scale(stageScale, stageScale);

  if (cat.isSick) {
    ctx.filter = 'saturate(0.58) brightness(0.94)';
  }

  const walkSwing = isWalking ? Math.sin(t * (cat.isSprinting ? 14 : 9)) : 0;
  const breathe = Math.sin(t * (isSleeping ? 2.1 : 3.4)) * 1.4;
  const tailWag = Math.sin(t * (isPurring ? 7 : 3.5)) * (isBaby ? 0.18 : 0.28);

  if (isSleeping) {
    // Cozy curled sleeping kitten
    ctx.save();
    ctx.translate(0, -18 + breathe * 0.4);
    ctx.fillStyle = profile.primaryColor;
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 3;
    // Curled tail
    ctx.beginPath();
    ctx.arc(-28, 2, 18, Math.PI * 0.3, Math.PI * 1.45);
    ctx.lineWidth = isBaby ? 11 : 13;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2B231E';
    ctx.stroke();
    ctx.lineWidth = isBaby ? 7 : 9;
    ctx.strokeStyle = profile.primaryColor;
    ctx.stroke();

    // Curled oval body
    ctx.fillStyle = profile.primaryColor;
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-6, 0, isBaby ? 38 : 44, isBaby ? 22 : 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head resting on front paws
    const hx = 22;
    const hy = -6;
    const hr = isBaby ? 27 : 26;
    // Ears
    ctx.beginPath();
    ctx.moveTo(hx - 18, hy - 14);
    ctx.lineTo(hx - 23, hy - (isBaby ? 34 : 39));
    ctx.lineTo(hx - 4, hy - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx + 6, hy - 22);
    ctx.lineTo(hx + 21, hy - (isBaby ? 34 : 39));
    ctx.lineTo(hx + 20, hy - 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head circle
    ctx.beginPath();
    ctx.ellipse(hx, hy, hr + 3, hr - 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cream muzzle
    ctx.fillStyle = profile.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(hx + 4, hy + 8, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Closed peaceful eyes
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(hx - 6, hy - 1, 5.5, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hx + 12, hy - 1, 5.5, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Tiny pink nose
    ctx.fillStyle = profile.noseColor;
    ctx.beginPath();
    ctx.arc(hx + 5, hy + 5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.filter = 'none';
    drawAccessoryAtAnchors(
      ctx,
      {
        hat: { x: hx, y: hy - hr - 2, rot: 0.04, scale: 0.92 },
        glasses: { x: hx + 3, y: hy, rot: 0, scale: 0.94 },
        scarf: { x: 4, y: 12, rot: 0.06, scale: 0.85 },
      },
      cat.equippedHat ?? 'none',
      cat.equippedGlasses ?? 'none',
      cat.equippedScarf ?? 'default',
      cat.time
    );
    ctx.restore();
    ctx.restore();
    return;
  }

  // Standing / walking / eating kitten proportions
  const bodyRx = isBaby ? 32 : 36;
  const bodyRy = isBaby ? 23 : 24;
  const bodyX = -8;
  const bodyY = (isBaby ? -36 : -44) + breathe * 0.5;
  const headX = (isBaby ? 14 : 18) + (isEating ? 6 : 0);
  const headY = (isBaby ? -74 : -84) + (isEating ? 24 : 0) + breathe * 0.7;
  const headRx = isBaby ? 32 : 28;
  const headRy = isBaby ? 28 : 25;

  // Tail behind body
  ctx.save();
  ctx.translate(bodyX - bodyRx + 6, bodyY - 4);
  ctx.rotate(tailWag);
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = isBaby ? 12 : 14;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-18, isBaby ? -14 : -26, isBaby ? -22 : -16, isBaby ? -26 : -46);
  ctx.stroke();
  ctx.strokeStyle = profile.primaryColor;
  ctx.lineWidth = isBaby ? 7.5 : 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-18, isBaby ? -14 : -26, isBaby ? -22 : -16, isBaby ? -26 : -46);
  ctx.stroke();
  ctx.restore();

  // Back legs
  const legH = isBaby ? 18 : 24;
  const legW = isBaby ? 10 : 9.5;
  const drawLeg = (lx: number, offset: number, shade: boolean) => {
    ctx.fillStyle = shade ? profile.accentColor : profile.primaryColor;
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.roundRect(lx - legW / 2 + offset, -legH - 2, legW, legH + 2, 5);
    ctx.fill();
    ctx.stroke();
    // Cute white/cream paw tip
    ctx.fillStyle = profile.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(lx + offset + 1, -2.5, legW * 0.62, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  drawLeg(bodyX - 18, -walkSwing * 7, true);
  drawLeg(bodyX + 14, walkSwing * 7, true);

  // Chubby kitten body
  ctx.fillStyle = profile.primaryColor;
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(bodyX, bodyY, bodyRx, bodyRy, isEating ? 0.14 : -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cream chest / belly patch
  ctx.fillStyle = profile.secondaryColor;
  ctx.beginPath();
  ctx.ellipse(bodyX + 12, bodyY + 4, bodyRx * 0.45, bodyRy * 0.65, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Tabby stripes for oren/abu
  if (cat.breed === 'oren' || cat.breed === 'abu') {
    ctx.strokeStyle = profile.accentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bodyX - 14, bodyY - bodyRy + 5);
    ctx.lineTo(bodyX - 12, bodyY - 6);
    ctx.moveTo(bodyX - 4, bodyY - bodyRy + 3);
    ctx.lineTo(bodyX - 3, bodyY - 5);
    ctx.stroke();
  }

  // Front legs
  drawLeg(bodyX - 11, walkSwing * 7, false);
  drawLeg(bodyX + 20, -walkSwing * 7, false);

  // Ears
  const earTipH = isBaby ? 17 : 22;
  ctx.fillStyle = profile.primaryColor;
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  // Left ear
  ctx.beginPath();
  ctx.moveTo(headX - headRx * 0.72, headY - headRy * 0.48);
  ctx.lineTo(headX - headRx * 0.85, headY - headRy - earTipH);
  ctx.lineTo(headX - headRx * 0.18, headY - headRy * 0.86);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = profile.earInnerColor;
  ctx.beginPath();
  ctx.moveTo(headX - headRx * 0.65, headY - headRy * 0.58);
  ctx.lineTo(headX - headRx * 0.72, headY - headRy - earTipH * 0.6);
  ctx.lineTo(headX - headRx * 0.28, headY - headRy * 0.82);
  ctx.closePath();
  ctx.fill();

  // Right ear
  ctx.fillStyle = profile.primaryColor;
  ctx.beginPath();
  ctx.moveTo(headX + headRx * 0.18, headY - headRy * 0.86);
  ctx.lineTo(headX + headRx * 0.82, headY - headRy - earTipH);
  ctx.lineTo(headX + headRx * 0.74, headY - headRy * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = profile.earInnerColor;
  ctx.beginPath();
  ctx.moveTo(headX + headRx * 0.28, headY - headRy * 0.82);
  ctx.lineTo(headX + headRx * 0.7, headY - headRy - earTipH * 0.6);
  ctx.lineTo(headX + headRx * 0.64, headY - headRy * 0.56);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.fillStyle = profile.primaryColor;
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(headX, headY, headRx, headRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Forehead M stripes for tabby
  if (cat.breed === 'oren' || cat.breed === 'abu') {
    ctx.strokeStyle = profile.accentColor;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(headX - 4, headY - headRy + 4);
    ctx.lineTo(headX - 3, headY - headRy + 12);
    ctx.moveTo(headX + 4, headY - headRy + 3);
    ctx.lineTo(headX + 4, headY - headRy + 11);
    ctx.moveTo(headX + 12, headY - headRy + 5);
    ctx.lineTo(headX + 11, headY - headRy + 12);
    ctx.stroke();
  }

  // Soft cream muzzle/cheeks
  ctx.fillStyle = profile.secondaryColor;
  ctx.beginPath();
  ctx.ellipse(headX + 5, headY + 9, headRx * 0.58, headRy * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sparkling big kitten eyes (blinking periodically or closed-happy when purring)
  const eyeCenterY = headY - 2;
  const leftEyeX = headX - 8;
  const rightEyeX = headX + 17;
  const blink = !cat.isSick && (Math.floor(t * 2.5) % 13 === 0);

  if (isPurring || blink) {
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeCenterY + 1, 5.5, Math.PI + 0.3, -0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightEyeX, eyeCenterY + 1, 5.5, Math.PI + 0.3, -0.3);
    ctx.stroke();
  } else {
    const eyeR = isBaby ? 6.4 : 5.4;
    [leftEyeX, rightEyeX].forEach((ex) => {
      ctx.fillStyle = profile.eyeColor;
      ctx.beginPath();
      ctx.arc(ex, eyeCenterY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      // Big anime sparkle highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ex - 2, eyeCenterY - 2.1, eyeR * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 1.8, eyeCenterY + 1.8, eyeR * 0.16, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 114, 182, 0.34)';
  ctx.beginPath();
  ctx.ellipse(leftEyeX - 7, eyeCenterY + 9, 4.5, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(rightEyeX + 6, eyeCenterY + 9, 4.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pink nose & ":3" mouth
  ctx.fillStyle = profile.noseColor;
  ctx.beginPath();
  ctx.arc(headX + 5.5, headY + 6, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(headX + 2.5, headY + 10.5, 3.2, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(headX + 8.5, headY + 10.5, 3.2, 0, Math.PI);
  ctx.stroke();

  // Cute tiny whiskers
  ctx.strokeStyle = '#3F2E26';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(headX - 18, headY + 6);
  ctx.lineTo(headX - 28, headY + 4);
  ctx.moveTo(headX - 18, headY + 11);
  ctx.lineTo(headX - 28, headY + 12);
  ctx.moveTo(headX + 24, headY + 6);
  ctx.lineTo(headX + 34, headY + 4);
  ctx.moveTo(headX + 24, headY + 11);
  ctx.lineTo(headX + 34, headY + 12);
  ctx.stroke();

  // Dirt smudges if dirty
  if (cat.cleanliness < 45) {
    const alpha = Math.min(0.65, (45 - cat.cleanliness) / 45);
    ctx.fillStyle = `rgba(110, 86, 62, ${alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(bodyX - 6, bodyY - 2, 4.5, 0, Math.PI * 2);
    ctx.arc(bodyX + 8, bodyY + 6, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.filter = 'none';

  const eyeCenterAnchor = { x: headX + 4.5, y: eyeCenterY };
  if (cat.isSick) {
    // Draw sick droopy eyelids over kitten eyes
    ctx.save();
    ctx.translate(eyeCenterAnchor.x, eyeCenterAnchor.y);
    ctx.fillStyle = profile.primaryColor;
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(-12, -2.5, 8, 4.6, -0.22, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(12, -2.5, 8, 4.6, 0.22, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if ((isDrowsyHeavy || isDrowsyLight) && !isPurring && !isSleeping) {
    const isLight = isDrowsyLight;
    const droop = computeSleepyDroop(cat.time, isLight);
    const pal = SLEEPY_LID_PALETTE[cat.breed];
    const eyeR = isBaby ? 6.6 : 5.7;
    ctx.save();
    ctx.translate(eyeCenterAnchor.x, eyeCenterAnchor.y);
    drawSleepyEyelid(ctx, -12.5, 0, eyeR + 0.6, eyeR, droop, isLight, pal, 0.04);
    drawSleepyEyelid(ctx, 12.5, 0, eyeR + 0.6, eyeR, droop, isLight, pal, -0.04);
    ctx.restore();
  }

  drawAccessoryAtAnchors(
    ctx,
    {
      hat: { x: headX + 2, y: headY - headRy - 3, rot: -0.02, scale: isBaby ? 0.88 : 0.94 },
      glasses: { x: eyeCenterAnchor.x, y: eyeCenterAnchor.y, rot: 0, scale: isBaby ? 0.9 : 0.94 },
      scarf: { x: bodyX + 12, y: bodyY - 12, rot: 0.05, scale: isBaby ? 0.82 : 0.9 },
    },
    cat.equippedHat ?? 'none',
    cat.equippedGlasses ?? 'none',
    cat.equippedScarf ?? 'default',
    cat.time
  );

  ctx.restore();
}

function drawCatSeniorFeatures(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  time: number
): void {
  const anchors = getCatAccessoryAnchors(row, col);
  const g = anchors.glasses;
  const s = anchors.scarf;

  // Snowy white eyebrows & long white wise whiskers
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.rot);
  ctx.scale(g.scale, g.scale);

  // Fluffy white eyebrows
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-14, -10.5, 7.5, 3.2, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(14, -10.5, 7.5, 3.2, 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White muzzle cheeks
  ctx.fillStyle = 'rgba(248, 250, 252, 0.72)';
  ctx.beginPath();
  ctx.ellipse(-7, 13, 8.5, 4.5, -0.15, 0, Math.PI * 2);
  ctx.ellipse(7, 13, 8.5, 4.5, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Long white senior whiskers
  const sway = Math.sin(time * 2) * 0.8;
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 2.0;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 11);
  ctx.quadraticCurveTo(-24, 12 + sway, -31, 16 + sway);
  ctx.moveTo(-14, 14);
  ctx.quadraticCurveTo(-23, 17, -29, 21);
  ctx.moveTo(14, 11);
  ctx.quadraticCurveTo(24, 12 + sway, 31, 16 + sway);
  ctx.moveTo(14, 14);
  ctx.quadraticCurveTo(23, 17, 29, 21);
  ctx.stroke();

  ctx.restore();

  // Little golden collar charm for senior cat
  ctx.save();
  ctx.translate(s.x + 6, s.y + 4);
  ctx.scale(s.scale, s.scale);
  ctx.fillStyle = '#FBBF24';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 6, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

interface CatAccessoryAnchors {
  hat: { x: number; y: number; rot: number; scale: number };
  glasses: { x: number; y: number; rot: number; scale: number };
  scarf: { x: number; y: number; rot: number; scale: number };
}

function getCatAccessoryAnchors(row: number, col: number): CatAccessoryAnchors {
  switch (row) {
    case 0: // EATING
      if (col === 5) {
        return {
          hat: { x: 44, y: -130, rot: -0.02, scale: 0.98 },
          glasses: { x: 48, y: -97, rot: 0, scale: 1 },
          scarf: { x: 10, y: -76, rot: 0.04, scale: 0.96 },
        };
      }
      return {
        hat: { x: 40, y: -80, rot: 0.12, scale: 0.96 },
        glasses: { x: 45, y: -43, rot: 0.1, scale: 0.96 },
        scarf: { x: 2, y: -59, rot: 0.1, scale: 0.95 },
      };
    case 1: // GROOMING / PURRING sitting
      if (col === 0) {
        return {
          hat: { x: 28, y: -141, rot: -0.04, scale: 0.98 },
          glasses: { x: 30.5, y: -104, rot: -0.02, scale: 0.96 },
          scarf: { x: -4, y: -85, rot: 0.03, scale: 0.96 },
        };
      }
      return {
        hat: { x: 29, y: -144, rot: -0.03, scale: 0.98 },
        glasses: { x: 32, y: -105, rot: -0.02, scale: 0.96 },
        scarf: { x: -3, y: -84, rot: 0.03, scale: 0.96 },
      };
    case 2: // PLAYING crouch / pounce
      if (col >= 4) {
        return {
          hat: { x: 40, y: -88, rot: 0.08, scale: 0.96 },
          glasses: { x: 44.5, y: -53, rot: 0.06, scale: 0.94 },
          scarf: { x: 2, y: -57, rot: 0.08, scale: 0.96 },
        };
      }
      return {
        hat: { x: 43, y: -104, rot: 0.04, scale: 0.98 },
        glasses: { x: 46, y: -70, rot: 0.03, scale: 0.98 },
        scarf: { x: 8, y: -64, rot: 0.05, scale: 0.96 },
      };
    case 3: // SLEEPING (excluding col 5 belly-up)
      if (col === 1) {
        return {
          hat: { x: -16, y: -134, rot: -0.22, scale: 0.94 },
          glasses: { x: -12, y: -102, rot: -0.22, scale: 0.92 },
          scarf: { x: -8, y: -76, rot: -0.15, scale: 0.9 },
        };
      }
      if (col === 3 || col === 4) {
        return {
          hat: { x: -14, y: -120, rot: -0.24, scale: 0.94 },
          glasses: { x: -10, y: -90, rot: -0.24, scale: 0.92 },
          scarf: { x: -6, y: -64, rot: -0.16, scale: 0.9 },
        };
      }
      return {
        hat: { x: 42, y: -84, rot: 0.04, scale: 0.94 },
        glasses: { x: 44.5, y: -45, rot: 0.02, scale: 0.9 },
        scarf: { x: 2, y: -38, rot: 0.08, scale: 0.9 },
      };
    case 5: // WALKING
      return {
        hat: { x: 42, y: -130, rot: 0.02, scale: 1 },
        glasses: { x: 46.5, y: -94, rot: 0.01, scale: 1 },
        scarf: { x: 12, y: -72, rot: 0.05, scale: 1 },
      };
    case 6: // PLAYING sprint
      if (col >= 2) {
        return {
          hat: { x: 63, y: -120, rot: 0.08, scale: 0.98 },
          glasses: { x: 68, y: -84, rot: 0.06, scale: 0.98 },
          scarf: { x: 30, y: -68, rot: 0.1, scale: 0.96 },
        };
      }
      return {
        hat: { x: 61, y: -117, rot: 0.1, scale: 0.98 },
        glasses: { x: 66.5, y: -82, rot: 0.08, scale: 0.98 },
        scarf: { x: 29, y: -65, rot: 0.12, scale: 0.96 },
      };
    case 7: // STRETCHING
      if (col === 0) {
        return {
          hat: { x: 51, y: -153, rot: -0.02, scale: 1 },
          glasses: { x: 56, y: -112, rot: 0, scale: 1 },
          scarf: { x: 14, y: -84, rot: 0.02, scale: 1 },
        };
      }
      if (col === 3) {
        return {
          hat: { x: 68, y: -135, rot: 0.04, scale: 0.98 },
          glasses: { x: 73, y: -97, rot: 0.03, scale: 1 },
          scarf: { x: 28, y: -72, rot: 0.06, scale: 0.98 },
        };
      }
      return {
        hat: { x: 45, y: -108, rot: 0.08, scale: 0.98 },
        glasses: { x: 49, y: -62, rot: 0.05, scale: 0.98 },
        scarf: { x: 8, y: -57, rot: 0.08, scale: 0.96 },
      };
    case 4: // IDLE
    default:
      return {
        hat: { x: 40, y: -134, rot: -0.03, scale: 1 },
        glasses: { x: 44.5, y: -100, rot: 0, scale: 1 },
        scarf: { x: 10, y: -78, rot: 0.04, scale: 1 },
      };
  }
}

function getBabyAccessoryAnchors(row: number, col: number): CatAccessoryAnchors {
  switch (row) {
    case 0: // EATING
      if (col >= 3) {
        return {
          hat: { x: 33, y: -98, rot: 0.02, scale: 0.88 },
          glasses: { x: 34, y: -67, rot: 0.02, scale: 0.88 },
          scarf: { x: 4, y: -50, rot: 0.06, scale: 0.85 },
        };
      }
      return {
        hat: { x: 32, y: -88, rot: 0.08, scale: 0.88 },
        glasses: { x: 33, y: -56, rot: 0.06, scale: 0.88 },
        scarf: { x: 4, y: -46, rot: 0.08, scale: 0.85 },
      };
    case 1: // GROOMING / PURRING sitting
      return {
        hat: { x: 22, y: -110, rot: -0.02, scale: 0.88 },
        glasses: { x: 24, y: -79, rot: -0.02, scale: 0.86 },
        scarf: { x: -2, y: -56, rot: 0.03, scale: 0.85 },
      };
    case 2: // PLAYING
      if (col >= 4) {
        return {
          hat: { x: 33, y: -76, rot: 0.06, scale: 0.88 },
          glasses: { x: 35, y: -42, rot: 0.05, scale: 0.88 },
          scarf: { x: 8, y: -42, rot: 0.08, scale: 0.85 },
        };
      }
      return {
        hat: { x: 30, y: -96, rot: 0.04, scale: 0.88 },
        glasses: { x: 32, y: -60, rot: 0.03, scale: 0.88 },
        scarf: { x: 6, y: -46, rot: 0.06, scale: 0.85 },
      };
    case 3: // SLEEPING (excluding col 5 belly-up)
      if (col === 0) {
        return {
          hat: { x: 22, y: -92, rot: 0.14, scale: 0.86 },
          glasses: { x: 24, y: -62, rot: 0.12, scale: 0.84 },
          scarf: { x: 8, y: -44, rot: 0.1, scale: 0.82 },
        };
      }
      if (col === 1) {
        return {
          hat: { x: -14, y: -102, rot: -0.22, scale: 0.84 },
          glasses: { x: -10, y: -74, rot: -0.22, scale: 0.82 },
          scarf: { x: -6, y: -52, rot: -0.15, scale: 0.8 },
        };
      }
      if (col === 3 || col === 4) {
        return {
          hat: { x: -12, y: -93, rot: -0.24, scale: 0.84 },
          glasses: { x: -8, y: -66, rot: -0.24, scale: 0.82 },
          scarf: { x: -4, y: -45, rot: -0.16, scale: 0.8 },
        };
      }
      return {
        hat: { x: 28, y: -62, rot: 0.04, scale: 0.84 },
        glasses: { x: 30, y: -34, rot: 0.02, scale: 0.82 },
        scarf: { x: 0, y: -28, rot: 0.08, scale: 0.8 },
      };
    case 5: // WALKING
      return {
        hat: { x: 32, y: -102, rot: 0.02, scale: 0.9 },
        glasses: { x: 34, y: -74, rot: 0.01, scale: 0.9 },
        scarf: { x: 8, y: -50, rot: 0.05, scale: 0.86 },
      };
    case 6: // SPRINT
      return {
        hat: { x: 58, y: -94, rot: 0.08, scale: 0.9 },
        glasses: { x: 62, y: -67, rot: 0.06, scale: 0.9 },
        scarf: { x: 26, y: -48, rot: 0.1, scale: 0.86 },
      };
    case 7: // STRETCHING
      if (col === 0) {
        return {
          hat: { x: 32, y: -116, rot: -0.02, scale: 0.9 },
          glasses: { x: 34, y: -86, rot: 0, scale: 0.9 },
          scarf: { x: 10, y: -56, rot: 0.04, scale: 0.86 },
        };
      }
      if (col === 3) {
        return {
          hat: { x: 44, y: -114, rot: 0.03, scale: 0.9 },
          glasses: { x: 46, y: -84, rot: 0.02, scale: 0.9 },
          scarf: { x: 16, y: -54, rot: 0.06, scale: 0.86 },
        };
      }
      return {
        hat: { x: 30, y: -82, rot: 0.06, scale: 0.88 },
        glasses: { x: 32, y: -52, rot: 0.05, scale: 0.88 },
        scarf: { x: 6, y: -42, rot: 0.08, scale: 0.85 },
      };
    case 4: // IDLE
    default:
      return {
        hat: { x: 26, y: -110, rot: -0.02, scale: 0.9 },
        glasses: { x: 28, y: -81, rot: 0, scale: 0.9 },
        scarf: { x: 6, y: -54, rot: 0.04, scale: 0.86 },
      };
  }
}

function getStageAccessoryAnchors(
  row: number,
  col: number,
  stageMode: 'baby' | 'child' | 'adult'
): CatAccessoryAnchors {
  if (stageMode === 'baby') return getBabyAccessoryAnchors(row, col);
  if (stageMode === 'adult') return getCatAccessoryAnchors(row, col);
  const b = getBabyAccessoryAnchors(row, col);
  const a = getCatAccessoryAnchors(row, col);
  const lerp = (v1: number, v2: number) => v1 + (v2 - v1) * 0.52;
  return {
    hat: {
      x: lerp(b.hat.x, a.hat.x),
      y: lerp(b.hat.y, a.hat.y),
      rot: lerp(b.hat.rot, a.hat.rot),
      scale: lerp(b.hat.scale, a.hat.scale),
    },
    glasses: {
      x: lerp(b.glasses.x, a.glasses.x),
      y: lerp(b.glasses.y, a.glasses.y),
      rot: lerp(b.glasses.rot, a.glasses.rot),
      scale: lerp(b.glasses.scale, a.glasses.scale),
    },
    scarf: {
      x: lerp(b.scarf.x, a.scarf.x),
      y: lerp(b.scarf.y, a.scarf.y),
      rot: lerp(b.scarf.rot, a.scarf.rot),
      scale: lerp(b.scarf.scale, a.scarf.scale),
    },
  };
}

function drawCatSickExpression(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  breed: CatBreed,
  time: number,
  stageMode: 'baby' | 'child' | 'adult' = 'adult'
): void {
  const anchors = getStageAccessoryAnchors(row, col, stageMode);
  const a = anchors.glasses;
  const furColor = CAT_BREEDS[breed].primaryColor;

  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rot);
  ctx.scale(a.scale, a.scale);

  // Tired dark circles under eyes
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.48)';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(-14, 4.5, 7.5, 0.25, Math.PI - 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(14, 4.5, 7.5, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Heavy half-closed droopy eyelids covering top half of eyes
  ctx.fillStyle = furColor;
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = 2.3;
  // Left droopy lid (slanted down outward)
  ctx.beginPath();
  ctx.ellipse(-14, -3.5, 9.2, 5.2, -0.22, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22.5, -1.5);
  ctx.quadraticCurveTo(-14, -4.5, -5.5, -5.2);
  ctx.stroke();

  // Right droopy lid (slanted down outward)
  ctx.beginPath();
  ctx.ellipse(14, -3.5, 9.2, 5.2, 0.22, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5.5, -5.2);
  ctx.quadraticCurveTo(14, -4.5, 22.5, -1.5);
  ctx.stroke();

  // Soft pale/feverish cheek blush
  ctx.fillStyle = 'rgba(248, 113, 113, 0.28)';
  ctx.beginPath();
  ctx.ellipse(-20, 8, 5.5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(20, 8, 5.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wobbly queasy mouth below nose
  const quiver = Math.sin(time * 9) * 0.6;
  ctx.strokeStyle = '#3F2E26';
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(-6, 14 + quiver);
  ctx.quadraticCurveTo(-3, 11.5, 0, 14);
  ctx.quadraticCurveTo(3, 16.2, 6, 13.5 - quiver);
  ctx.stroke();

  // Animated blue sweat drop at temple
  const dropOffset = (time * 8) % 6;
  ctx.fillStyle = '#7DD3FC';
  ctx.strokeStyle = '#0369A1';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-27, -14 + dropOffset);
  ctx.quadraticCurveTo(-23, -8 + dropOffset, -27, -5.5 + dropOffset);
  ctx.quadraticCurveTo(-31, -8 + dropOffset, -27, -14 + dropOffset);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

interface EyeBox {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

interface StageEyeAnchors {
  left: EyeBox;
  right: EyeBox;
  rot: number;
}

const SLEEPY_LID_PALETTE: Record<
  CatBreed,
  { furTop: string; furCrease: string; outline: string; underEye: string }
> = {
  oren: {
    furTop: '#ED7F1C',
    furCrease: '#C95E16',
    outline: '#482224',
    underEye: 'rgba(130, 52, 24, 0.16)',
  },
  mochi: {
    furTop: '#DCD4C6',
    furCrease: '#B8AEA0',
    outline: '#3B3133',
    underEye: 'rgba(120, 108, 102, 0.15)',
  },
  arang: {
    furTop: '#464E5D',
    furCrease: '#2E3440',
    outline: '#1B1E26',
    underEye: 'rgba(20, 24, 34, 0.24)',
  },
  abu: {
    furTop: '#8492A8',
    furCrease: '#647288',
    outline: '#363034',
    underEye: 'rgba(65, 76, 98, 0.20)',
  },
};

function getAdultEyeAnchors(row: number, col: number): StageEyeAnchors | null {
  switch (row) {
    case 0: // EATING (cols 2, 3, 5 already have closed eyes)
      if (col === 2 || col === 3 || col === 5) return null;
      return {
        left: { x: 33.5, y: -62.2, rx: 7.4, ry: 6.4 },
        right: { x: 59.0, y: -61.8, rx: 6.6, ry: 6.0 },
        rot: 0.04,
      };
    case 1: // GROOMING / PURRING (cols 1..4 already have closed/happy eyes)
      if (col >= 1 && col <= 4) return null;
      if (col === 0) {
        return {
          left: { x: 17.5, y: -108.5, rx: 7.4, ry: 6.6 },
          right: { x: 47.0, y: -107.5, rx: 6.8, ry: 6.2 },
          rot: -0.02,
        };
      }
      return {
        left: { x: 19.0, y: -111.5, rx: 7.4, ry: 6.6 },
        right: { x: 48.0, y: -112.5, rx: 6.8, ry: 6.2 },
        rot: -0.02,
      };
    case 2: // PLAYING (col 5 has closed left eye)
      if (col === 5) return null;
      if (col >= 4) {
        return {
          left: { x: 30.2, y: -56.4, rx: 7.2, ry: 6.2 },
          right: { x: 59.6, y: -56.4, rx: 6.2, ry: 5.8 },
          rot: 0.02,
        };
      }
      return {
        left: { x: 33.2, y: -74.0, rx: 7.4, ry: 6.5 },
        right: { x: 64.2, y: -72.0, rx: 6.5, ry: 6.0 },
        rot: 0.04,
      };
    case 3: // SLEEPING
      return null;
    case 4: // IDLE (cols 2 & 3 are already squinting/closed)
      if (col === 2 || col === 3) return null;
      return {
        left: { x: 29.8, y: -103.8, rx: 7.6, ry: 6.8 },
        right: { x: 59.2, y: -102.6, rx: 6.6, ry: 6.2 },
        rot: 0.02,
      };
    case 5: // WALKING
      return {
        left: { x: 32.8, y: -102.2, rx: 7.5, ry: 6.8 },
        right: { x: 63.0, y: -101.2, rx: 6.6, ry: 6.2 },
        rot: 0.02,
      };
    case 6: // SPRINT
      return {
        left: { x: 58.0, y: -86.5, rx: 7.4, ry: 6.6 },
        right: { x: 86.0, y: -86.5, rx: 6.6, ry: 6.2 },
        rot: 0.02,
      };
    case 7: // STRETCHING (cols 1..3 have closed/winking eyes)
      if (col >= 1) return null;
      return {
        left: { x: 34.5, y: -115.5, rx: 7.5, ry: 6.8 },
        right: { x: 65.0, y: -114.5, rx: 6.6, ry: 6.2 },
        rot: 0.02,
      };
    default:
      return null;
  }
}

function getBabyEyeAnchors(row: number, col: number): StageEyeAnchors | null {
  switch (row) {
    case 0: // EATING
      if (col >= 3) {
        return {
          left: { x: 18.2, y: -67.6, rx: 7.0, ry: 6.4 },
          right: { x: 46.0, y: -64.8, rx: 6.4, ry: 6.0 },
          rot: 0.06,
        };
      }
      return {
        left: { x: 17.5, y: -54.0, rx: 7.0, ry: 6.4 },
        right: { x: 43.5, y: -51.5, rx: 6.4, ry: 6.0 },
        rot: 0.06,
      };
    case 1: // GROOMING / PURRING
      if (col >= 1 && col <= 4) return null;
      return {
        left: { x: 9.2, y: -76.3, rx: 7.0, ry: 6.4 },
        right: { x: 37.0, y: -76.3, rx: 6.4, ry: 6.0 },
        rot: 0,
      };
    case 2: // PLAYING
      if (col === 5) return null;
      if (col >= 4) {
        return {
          left: { x: 25.1, y: -73.3, rx: 6.8, ry: 6.2 },
          right: { x: 50.0, y: -71.5, rx: 6.2, ry: 5.8 },
          rot: 0.04,
        };
      }
      return {
        left: { x: 23.4, y: -57.4, rx: 7.0, ry: 6.4 },
        right: { x: 48.5, y: -55.6, rx: 6.4, ry: 6.0 },
        rot: 0.04,
      };
    case 3: // SLEEPING
      return null;
    case 4: // IDLE
      return {
        left: { x: 14.8, y: -76.0, rx: 7.2, ry: 6.6 },
        right: { x: 41.6, y: -79.2, rx: 6.5, ry: 6.2 },
        rot: -0.06,
      };
    case 5: // WALKING
      return {
        left: { x: 21.0, y: -72.0, rx: 7.0, ry: 6.4 },
        right: { x: 48.6, y: -71.2, rx: 6.4, ry: 6.0 },
        rot: 0.02,
      };
    case 6: // SPRINT
      return {
        left: { x: 44.5, y: -63.8, rx: 7.0, ry: 6.4 },
        right: { x: 72.0, y: -61.2, rx: 6.4, ry: 6.0 },
        rot: 0.05,
      };
    case 7: // STRETCHING
      if (col >= 1) return null;
      return {
        left: { x: 23.2, y: -86.3, rx: 7.0, ry: 6.5 },
        right: { x: 53.0, y: -86.2, rx: 6.4, ry: 6.1 },
        rot: 0,
      };
    default:
      return null;
  }
}

function getStageEyeAnchors(
  row: number,
  col: number,
  stageMode: 'baby' | 'child' | 'adult'
): StageEyeAnchors | null {
  if (stageMode === 'baby') return getBabyEyeAnchors(row, col);
  if (stageMode === 'adult') return getAdultEyeAnchors(row, col);
  const b = getBabyEyeAnchors(row, col);
  const a = getAdultEyeAnchors(row, col);
  if (!b || !a) return null;
  const lerpX = (v1: number, v2: number) => v1 + (v2 - v1) * 0.38;
  const lerpY = (v1: number, v2: number) => v1 + (v2 - v1) * 0.48;
  return {
    left: {
      x: lerpX(b.left.x, a.left.x),
      y: lerpY(b.left.y, a.left.y),
      rx: lerpY(b.left.rx, a.left.rx),
      ry: lerpY(b.left.ry, a.left.ry),
    },
    right: {
      x: lerpX(b.right.x, a.right.x),
      y: lerpY(b.right.y, a.right.y),
      rx: lerpY(b.right.rx, a.right.rx),
      ry: lerpY(b.right.ry, a.right.ry),
    },
    rot: lerpY(b.rot, a.rot),
  };
}

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

function computeSleepyDroop(time: number, isLight: boolean): number {
  const baseDroop = isLight ? 0.36 : 0.56;
  const breathe = Math.sin(time * 2.0) * (isLight ? 0.035 : 0.05);
  const cycle = isLight ? 4.4 : 2.85;
  const blinkDur = isLight ? 0.86 : 1.25;
  const phase = ((time % cycle) + cycle) % cycle;

  let blinkAmt = 0;
  if (phase < blinkDur) {
    const p = phase / blinkDur;
    if (p < 0.38) {
      // Slow heavy lid sinking shut
      blinkAmt = smoothstep(p / 0.38);
    } else if (p < 0.64) {
      // Brief peaceful shut pause
      blinkAmt = 1;
    } else {
      // Lazy lift back to heavy-lidded state
      blinkAmt = 1 - smoothstep((p - 0.64) / 0.36);
    }
  } else if (!isLight) {
    // Subtle extra drowsy nod mid-cycle when heavily sleepy
    const nodStart = blinkDur + 0.55;
    const nodDur = 0.55;
    if (phase >= nodStart && phase < nodStart + nodDur) {
      blinkAmt = 0.45 * Math.sin(((phase - nodStart) / nodDur) * Math.PI);
    }
  }

  return Math.max(0.28, Math.min(1, baseDroop + breathe + (1 - baseDroop - breathe) * blinkAmt));
}

function drawSleepyEyelid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  droop: number,
  isLight: boolean,
  pal: { furTop: string; furCrease: string; outline: string; underEye: string },
  tilt: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  // Subtle under-eye drowsy shadow crescent
  ctx.strokeStyle = pal.underEye;
  ctx.lineWidth = isLight ? 1.4 : 1.9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 1.4, rx * 0.82, 0.32, Math.PI - 0.32);
  ctx.stroke();

  // Compute organic curved lid position (0 = top of eye, 1 = peacefully closed crescent)
  const lidY = -ry + droop * (ry * 1.66);
  const curveSag = droop > 0.72 ? 1.8 + (droop - 0.72) * 3.8 : 0.7 + droop * 1.1;

  // Clip strictly inside the eye oval so the eyelid never spills onto forehead/cheeks
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, rx + 0.9, ry + 0.9, 0, 0, Math.PI * 2);
  ctx.clip();

  const grad = ctx.createLinearGradient(0, -ry - 1, 0, lidY + curveSag + 1);
  grad.addColorStop(0, pal.furTop);
  grad.addColorStop(0.76, pal.furTop);
  grad.addColorStop(1, pal.furCrease);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-rx - 2, -ry - 2);
  ctx.lineTo(rx + 2, -ry - 2);
  ctx.lineTo(rx + 2, lidY);
  ctx.quadraticCurveTo(0, lidY + curveSag, -rx - 2, lidY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Soft curved sleepy lash / eyelid crease line (organic downward sleepy arc)
  const edgeSpan = rx * (0.95 - droop * 0.06);
  ctx.strokeStyle = pal.outline;
  ctx.lineWidth = isLight ? 1.85 : 2.15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-edgeSpan, lidY - 0.2);
  ctx.quadraticCurveTo(0, lidY + curveSag, edgeSpan, lidY + 0.15);
  ctx.stroke();

  ctx.restore();
}

function drawCatTiredExpression(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  breed: CatBreed,
  time: number,
  tier: 'light' | 'heavy' = 'heavy',
  stageMode: 'baby' | 'child' | 'adult' = 'adult'
): void {
  const eyeAnchors = getStageEyeAnchors(row, col, stageMode);
  if (!eyeAnchors) return;

  const isLight = tier === 'light';
  const droop = computeSleepyDroop(time, isLight);
  const pal = SLEEPY_LID_PALETTE[breed];

  ctx.save();
  drawSleepyEyelid(
    ctx,
    eyeAnchors.left.x,
    eyeAnchors.left.y,
    eyeAnchors.left.rx,
    eyeAnchors.left.ry,
    droop,
    isLight,
    pal,
    eyeAnchors.rot + 0.04
  );
  drawSleepyEyelid(
    ctx,
    eyeAnchors.right.x,
    eyeAnchors.right.y,
    eyeAnchors.right.rx,
    eyeAnchors.right.ry,
    droop,
    isLight,
    pal,
    eyeAnchors.rot - 0.04
  );
  ctx.restore();
}

function drawCatAccessories(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  hat: CatHatId,
  glasses: CatGlassesId,
  scarf: CatScarfId,
  time: number,
  stageMode: 'baby' | 'child' | 'adult' = 'adult'
): void {
  if (hat === 'none' && glasses === 'none' && scarf === 'default') return;
  const anchors = getStageAccessoryAnchors(row, col, stageMode);
  drawAccessoryAtAnchors(ctx, anchors, hat, glasses, scarf, time);
}

function drawAccessoryAtAnchors(
  ctx: CanvasRenderingContext2D,
  anchors: CatAccessoryAnchors,
  hat: CatHatId,
  glasses: CatGlassesId,
  scarf: CatScarfId,
  time: number
): void {
  if (hat === 'none' && glasses === 'none' && scarf === 'default') return;

  // 1. Scarf / Bowtie around collar
  if (scarf !== 'default') {
    const a = anchors.scarf;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.scale(a.scale, a.scale);

    if (scarf === 'syal_polkadot' || scarf === 'syal_garis') {
      const isPolka = scarf === 'syal_polkadot';
      // Fluttering tail behind neck
      ctx.fillStyle = isPolka ? '#2563EB' : '#16A34A';
      ctx.strokeStyle = '#2B231E';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.quadraticCurveTo(-24, 4, -27, 13);
      ctx.lineTo(-16, 15);
      ctx.quadraticCurveTo(-13, 8, -4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Main curved neck wrap
      ctx.fillStyle = isPolka ? '#3B82F6' : '#22C55E';
      ctx.beginPath();
      ctx.moveTo(-22, -6);
      ctx.quadraticCurveTo(0, 6, 22, -3);
      ctx.lineTo(20, 7);
      ctx.quadraticCurveTo(0, 15, -20, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (isPolka) {
        ctx.fillStyle = '#FFFDF9';
        const dots: Array<[number, number, number]> = [
          [-14, 0, 2.3],
          [-4, 4, 2.5],
          [7, 4.5, 2.3],
          [15, 1, 2.1],
          [-18, 9, 2.0],
        ];
        dots.forEach(([dx, dy, r]) => {
          ctx.beginPath();
          ctx.arc(dx, dy, r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-13, -1);
        ctx.lineTo(-11, 7);
        ctx.moveTo(-2, 2);
        ctx.lineTo(-1, 10);
        ctx.moveTo(9, 1);
        ctx.lineTo(10, 9);
        ctx.moveTo(-19, 7);
        ctx.lineTo(-15, 11);
        ctx.stroke();
      }
    } else if (scarf === 'dasi_kupu') {
      // Neat dark strap
      ctx.strokeStyle = '#2B231E';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-18, -3);
      ctx.quadraticCurveTo(2, 6, 20, -1);
      ctx.stroke();

      // Bowtie wings centered slightly forward (+6)
      ctx.translate(6, 4);
      ctx.fillStyle = '#E11D48';
      ctx.strokeStyle = '#2B231E';
      ctx.lineWidth = 2.2;
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-15, -7);
      ctx.lineTo(-15, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right wing
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(15, -7);
      ctx.lineTo(15, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Center knot + golden bell
      ctx.fillStyle = '#BE123C';
      ctx.beginPath();
      ctx.roundRect(-3.5, -4, 7, 8, 2.5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(0, 7.5, 4.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.arc(-1.2, 6.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 2. Cute Glasses over eyes
  if (glasses !== 'none') {
    const a = anchors.glasses;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.scale(a.scale, a.scale);

    // Temple arm going back toward left ear
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-26, -1);
    ctx.lineTo(-37, -5);
    ctx.stroke();

    if (glasses === 'kacamata_bulat') {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
      ctx.strokeStyle = '#4E270F';
      ctx.lineWidth = 2.7;
      ctx.beginPath();
      ctx.arc(-15, 0, 11.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(15, 0, 11.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bridge
      ctx.beginPath();
      ctx.moveTo(-3.8, -1);
      ctx.quadraticCurveTo(0, -4.5, 3.8, -1);
      ctx.stroke();
    } else if (glasses === 'kacamata_hitam') {
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-26, -8, 22, 15, 4.5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(4, -8, 22, 15, 4.5);
      ctx.fill();
      ctx.stroke();
      // Top frame bar
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-26, -5.5);
      ctx.lineTo(26, -5.5);
      ctx.stroke();
      // Cool diagonal glint
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-21, -4);
      ctx.lineTo(-15, 2);
      ctx.moveTo(9, -4);
      ctx.lineTo(15, 2);
      ctx.stroke();
    } else if (glasses === 'kacamata_hati') {
      const drawHeartLens = (cx: number) => {
        ctx.save();
        ctx.translate(cx, 0);
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.bezierCurveTo(-13, 1.5, -13, -10.5, -5.2, -10.5);
        ctx.bezierCurveTo(-1.4, -10.5, 0, -6.5, 0, -5);
        ctx.bezierCurveTo(0, -6.5, 1.4, -10.5, 5.2, -10.5);
        ctx.bezierCurveTo(13, -10.5, 13, 1.5, 0, 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(251, 113, 133, 0.42)';
        ctx.fill();
        ctx.strokeStyle = '#BE185D';
        ctx.lineWidth = 2.6;
        ctx.stroke();
        ctx.restore();
      };
      drawHeartLens(-15);
      drawHeartLens(15);
      ctx.strokeStyle = '#BE185D';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.lineTo(4, -2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 3. Cute Mini Hat between ears
  if (hat !== 'none') {
    const a = anchors.hat;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.scale(a.scale, a.scale);

    if (hat === 'beret_merah') {
      ctx.rotate(-0.14);
      // Stem
      ctx.strokeStyle = '#4E270F';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(2, -19);
      ctx.stroke();
      // Plump beret dome
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#4E270F';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, -5, 19, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Band
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.roundRect(-13, 2, 26, 5, 2.5);
      ctx.fill();
      ctx.stroke();
      // Highlight
      ctx.fillStyle = '#FCA5A5';
      ctx.beginPath();
      ctx.ellipse(-6, -8, 5, 2.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'topi_pesta') {
      ctx.rotate(0.08);
      // Cone body
      ctx.fillStyle = '#6366F1';
      ctx.strokeStyle = '#2B231E';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-14, 5);
      ctx.lineTo(0, -25);
      ctx.lineTo(14, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Festive stripes
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-7, -8);
      ctx.lineTo(7, -8);
      ctx.moveTo(-10.5, -1);
      ctx.lineTo(10.5, -1);
      ctx.stroke();
      // Pompom
      ctx.fillStyle = '#F472B6';
      ctx.strokeStyle = '#2B231E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -26, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fluffy bottom rim
      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      ctx.roundRect(-15, 2, 30, 6, 3);
      ctx.fill();
      ctx.stroke();
    } else if (hat === 'mahkota_emas') {
      const shimmer = 0.85 + Math.sin(time * 4) * 0.15;
      ctx.fillStyle = '#FBBF24';
      ctx.strokeStyle = '#5E351B';
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-15, 5);
      ctx.lineTo(-17, -14);
      ctx.lineTo(-7, -5);
      ctx.lineTo(0, -18);
      ctx.lineTo(7, -5);
      ctx.lineTo(17, -14);
      ctx.lineTo(15, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crown base band
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(-15, 1, 30, 6, 2);
      ctx.fill();
      ctx.stroke();

      // Jewels
      ctx.globalAlpha = shimmer;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -3, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(-9, -1, 2.3, 0, Math.PI * 2);
      ctx.arc(9, -1, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

type EmoteBubbleKind = 'hungry' | 'sleepy' | 'happy';

interface EmoteBubbleDecision {
  kind: EmoteBubbleKind;
  alpha: number;
  popScale: number;
}

function pickCatEmoteKind(
  cat: CatRenderState,
  isDrowsyLight: boolean,
  isDrowsyHeavy: boolean
): EmoteBubbleDecision | null {
  if (cat.isSick || cat.isDragging || cat.behavior === 'SLEEPING') {
    return null;
  }

  const isRestingOnFloor = cat.behavior === 'DOZING';
  const isSleepyState =
    isDrowsyHeavy ||
    isDrowsyLight ||
    cat.drowsyStage === 'exhausted' ||
    cat.energy <= 35;

  // 1. Urgent hungry need
  if (cat.isHungry && cat.behavior !== 'EATING' && !isRestingOnFloor) {
    return { kind: 'hungry', alpha: 1, popScale: 1 };
  }

  // 2. Sleepy / drowsy need
  if (isSleepyState) {
    return { kind: 'sleepy', alpha: 1, popScale: 1 };
  }

  // 3. Happy / joyful state (immediate during active joy, gentle periodic pulse when passively happy)
  if (isRestingOnFloor) return null;

  const isActiveJoy =
    cat.behavior === 'PURRING' ||
    cat.behavior === 'PLAYING' ||
    cat.behavior === 'ROLLING' ||
    (cat.behavior === 'EATING' && cat.happiness >= 55);

  if (isActiveJoy) {
    return { kind: 'happy', alpha: 1, popScale: 1 };
  }

  if (cat.happiness >= 78) {
    const cycleDuration = 8.5;
    const visibleDuration = 4.2;
    const phase = ((cat.time % cycleDuration) + cycleDuration) % cycleDuration;
    if (phase > visibleDuration) return null;

    let alpha = 1;
    let popScale = 1;
    if (phase < 0.35) {
      const p = phase / 0.35;
      alpha = p;
      // Soft spring pop-in
      popScale = 0.65 + 0.35 * Math.sin((p * Math.PI) / 2) + 0.08 * Math.sin(p * Math.PI);
    } else if (phase > visibleDuration - 0.45) {
      const p = (visibleDuration - phase) / 0.45;
      alpha = Math.max(0, p);
      popScale = 0.85 + 0.15 * p;
    }
    return { kind: 'happy', alpha, popScale };
  }

  return null;
}

function drawFourPointSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string,
  rotation = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.34;
    const a = (i * Math.PI) / 4;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawEmoteBubble(
  ctx: CanvasRenderingContext2D,
  kind: EmoteBubbleKind,
  s: number,
  time: number,
  alpha: number,
  popScale: number,
  isLowPose: boolean,
  isUrgentHungry: boolean
): void {
  const bob = Math.sin(time * 2.8) * 3.5 * s;
  const baseY = (isLowPose ? -114 : -144) * s + bob;
  const baseX = (isLowPose ? 34 : 42) * s;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(baseX, baseY);
  ctx.scale(s * popScale, s * popScale);

  // Ascending thought dots with subtle offset bobbing
  const dot1Y = 22 + Math.sin(time * 3.2 - 0.9) * 1.1;
  const dot2Y = 12 + Math.sin(time * 3.2 - 0.4) * 1.4;

  ctx.fillStyle = '#FFFDF8';
  ctx.strokeStyle = '#4E270F';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(-18, dot1Y, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-10, dot2Y, 5.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gentle breathing squish on main bubble
  const squishX = 1 + Math.sin(time * 3.1) * 0.024;
  const squishY = 1 - Math.sin(time * 3.1) * 0.024;
  ctx.save();
  ctx.translate(2, -4);
  ctx.scale(squishX, squishY);

  // Soft warm shadow
  ctx.fillStyle = 'rgba(45, 25, 12, 0.16)';
  ctx.beginPath();
  ctx.roundRect(-26, -19, 54, 36, 15);
  ctx.fill();

  // Outer cream bubble
  ctx.fillStyle = '#FFFDF8';
  ctx.strokeStyle = '#4E270F';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(-27, -21, 54, 36, 15);
  ctx.fill();
  ctx.stroke();

  // Pastel inner tint matching the emote mood
  ctx.fillStyle =
    kind === 'hungry'
      ? '#FFF3DC'
      : kind === 'sleepy'
      ? '#EAF3FF'
      : '#FFEBF0';
  ctx.beginPath();
  ctx.roundRect(-23.5, -17.5, 47, 29, 12);
  ctx.fill();

  if (kind === 'hungry') {
    // Animated cute orange fish + rising aroma curls
    const wiggleSpeed = isUrgentHungry ? 7.8 : 4.8;
    const fishTilt = Math.sin(time * wiggleSpeed) * (isUrgentHungry ? 0.14 : 0.08);
    const fishBob = Math.sin(time * (wiggleSpeed * 0.8)) * 1.2;

    // Rising warm aroma wisps
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const p = ((time * 0.85 + i * 0.5) % 1 + 1) % 1;
      const wx = -6 + i * 11 + Math.sin(p * Math.PI * 2) * 1.4;
      const wy = -9 - p * 6.5;
      ctx.save();
      ctx.globalAlpha *= Math.sin(p * Math.PI);
      ctx.beginPath();
      ctx.moveTo(wx, wy + 2.5);
      ctx.quadraticCurveTo(wx - 1.5, wy + 1, wx, wy - 1);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(1, -1 + fishBob);
    ctx.rotate(fishTilt);

    // Wagging tail fin
    const tailWag = Math.sin(time * 9) * 0.22;
    ctx.save();
    ctx.translate(-9, 0);
    ctx.rotate(tailWag);
    ctx.fillStyle = '#FB923C';
    ctx.strokeStyle = '#9A3412';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, -5.5);
    ctx.quadraticCurveTo(-5, 0, -7, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Fish body
    ctx.fillStyle = '#FDBA74';
    ctx.strokeStyle = '#9A3412';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(1, 0, 10.5, 6.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top belly highlight
    ctx.fillStyle = '#FFF7ED';
    ctx.beginPath();
    ctx.ellipse(2, -2.1, 6.2, 2.1, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Gill line + cute eye
    ctx.strokeStyle = '#9A3412';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(3.5, 0, 3.2, Math.PI * 0.65, Math.PI * 1.35);
    ctx.stroke();

    ctx.fillStyle = '#4E270F';
    ctx.beginPath();
    ctx.arc(6.8, -1.2, 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (kind === 'sleepy') {
    // Cozy gently rocking crescent moon + floating Zzz loop
    const moonRock = Math.sin(time * 2.1) * 0.14;
    ctx.save();
    ctx.translate(-8, -3);
    ctx.rotate(moonRock);
    ctx.fillStyle = '#FBBF24';
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(0, 0, 8.2, Math.PI * 0.25, Math.PI * 1.75, false);
    ctx.arc(3.4, -1.6, 6.4, Math.PI * 1.62, Math.PI * 0.38, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Staggered animated rising Z's
    const zCount = 2;
    for (let i = 0; i < zCount; i++) {
      const p = ((time * 0.72 + i * 0.5) % 1 + 1) % 1;
      const zx = 3 + p * 11 + Math.sin(p * Math.PI * 2) * 1.2;
      const zy = 4 - p * 14;
      const zScale = 0.72 + p * 0.45;
      ctx.save();
      ctx.globalAlpha *= Math.sin(p * Math.PI);
      ctx.translate(zx, zy);
      ctx.scale(zScale, zScale);
      ctx.fillStyle = '#2563EB';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.4;
      ctx.font = '800 11px "Bricolage Grotesque", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText('Z', 0, 0);
      ctx.fillText('Z', 0, 0);
      ctx.restore();
    }
  } else {
    // Happy: bouncing pulsing heart + twinkling sparkles
    const beat = Math.pow(Math.max(0, Math.sin(time * 4.8)), 2);
    const heartScale = 0.94 + beat * 0.2;
    const heartTilt = Math.sin(time * 3.1) * 0.08;
    const heartBounceY = -beat * 1.8;

    // Two twinkling 4-point sparkles
    const s1 = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 5.2));
    const s2 = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 5.2 + Math.PI * 0.9));
    drawFourPointSparkle(ctx, -13.5, -8.5, 4.4 * s1, '#FBBF24', time * 1.1);
    drawFourPointSparkle(ctx, 13.5, -9, 4.0 * s2, '#F59E0B', -time * 1.2);

    ctx.save();
    ctx.translate(0, -1 + heartBounceY);
    ctx.rotate(heartTilt);
    ctx.scale(heartScale, heartScale);

    ctx.fillStyle = '#F43F5E';
    ctx.strokeStyle = '#9F1239';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(0, 7.5);
    ctx.bezierCurveTo(-11, 0.5, -10.5, -9.5, -4.5, -9.5);
    ctx.bezierCurveTo(-1.4, -9.5, 0, -6.4, 0, -5.2);
    ctx.bezierCurveTo(0, -6.4, 1.4, -9.5, 4.5, -9.5);
    ctx.bezierCurveTo(10.5, -9.5, 11, 0.5, 0, 7.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glossy heart shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(-4.2, -5.4, 1.9, 1.1, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}

function drawSickIndicator(ctx: CanvasRenderingContext2D, s: number, time: number): void {
  const bob = Math.sin(time * 1.8) * 2.5 * s;
  ctx.save();
  ctx.translate(0, -138 * s + bob);
  ctx.scale(s, s);

  // Slow dizzy stars
  for (let i = 0; i < 3; i++) {
    const angle = time * 1.6 + (i * Math.PI * 2) / 3;
    const dx = Math.cos(angle) * 22;
    const dy = Math.sin(angle) * 6;
    ctx.fillStyle = i % 2 === 0 ? '#FBBF24' : '#93C5FD';
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(dx, dy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Fever thermometer icon
  ctx.translate(38, -6);
  ctx.fillStyle = '#FFFDF9';
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-6, -16, 12, 26, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, 5, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-1.8, -10, 3.6, 13);

  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, pool: Particle[]): void {
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (!p.active) continue;

    const progress = p.life / Math.max(0.001, p.maxLife);
    const fadeOut = Math.max(0, 1 - progress);
    const isInstantKind = p.kind === 'crumb' || p.kind === 'text';
    const fadeIn = isInstantKind ? 1 : Math.min(1, progress / 0.18);
    const alpha = Math.max(0, Math.min(1, fadeIn * fadeOut));

    const swayX =
      p.swayAmp && p.swayFreq
        ? Math.sin(p.life * p.swayFreq + (p.phase ?? 0)) * p.swayAmp
        : 0;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x + swayX, p.y);

    if (p.kind === 'heart') {
      const s = p.size;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s, -s * 0.35, -s * 0.5, -s * 1.05, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.5, -s * 1.05, s, -s * 0.35, 0, s * 0.35);
      ctx.fill();
    } else if (p.kind === 'heart_sparkle') {
      const s = p.size;
      const pulse = 0.92 + Math.sin(p.life * 6 + (p.phase ?? 0)) * 0.1;
      ctx.save();
      ctx.scale(pulse, pulse);
      // Warm glowing heart
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(255, 253, 248, 0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.36);
      ctx.bezierCurveTo(-s, -s * 0.34, -s * 0.5, -s * 1.05, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.5, -s * 1.05, s, -s * 0.34, 0, s * 0.36);
      ctx.fill();
      ctx.stroke();

      // Tiny twin sparkle stars flanking the heart
      const sp1 = s * 0.44;
      ctx.fillStyle = '#FDE68A';
      ctx.save();
      ctx.translate(-s * 0.95, -s * 0.65);
      ctx.beginPath();
      ctx.moveTo(0, -sp1);
      ctx.quadraticCurveTo(sp1 * 0.22, -sp1 * 0.22, sp1, 0);
      ctx.quadraticCurveTo(sp1 * 0.22, sp1 * 0.22, 0, sp1);
      ctx.quadraticCurveTo(-sp1 * 0.22, sp1 * 0.22, -sp1, 0);
      ctx.quadraticCurveTo(-sp1 * 0.22, -sp1 * 0.22, 0, -sp1);
      ctx.fill();
      ctx.restore();

      const sp2 = s * 0.32;
      ctx.save();
      ctx.translate(s * 0.92, -s * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, -sp2);
      ctx.quadraticCurveTo(sp2 * 0.22, -sp2 * 0.22, sp2, 0);
      ctx.quadraticCurveTo(sp2 * 0.22, sp2 * 0.22, 0, sp2);
      ctx.quadraticCurveTo(-sp2 * 0.22, sp2 * 0.22, -sp2, 0);
      ctx.quadraticCurveTo(-sp2 * 0.22, -sp2 * 0.22, 0, -sp2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    } else if (p.kind === 'sleep_cloud') {
      const s = p.size;
      const grow = 0.85 + Math.min(0.28, progress * 0.35);
      ctx.save();
      ctx.scale(grow, grow);
      ctx.fillStyle = p.color || 'rgba(232, 244, 255, 0.92)';
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.42)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-s * 0.55, s * 0.12, s * 0.44, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.14, s * 0.58, 0, Math.PI * 2);
      ctx.arc(s * 0.58, s * 0.1, s * 0.46, 0, Math.PI * 2);
      ctx.arc(0, s * 0.22, s * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner soft highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.beginPath();
      ctx.arc(-s * 0.12, -s * 0.22, s * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'dust_puff') {
      const s = p.size;
      const grow = 0.75 + progress * 0.55;
      ctx.save();
      ctx.scale(grow, grow);
      ctx.fillStyle = p.color || 'rgba(148, 128, 98, 0.55)';
      ctx.beginPath();
      ctx.arc(-s * 0.32, s * 0.1, s * 0.48, 0, Math.PI * 2);
      ctx.arc(s * 0.26, -s * 0.12, s * 0.44, 0, Math.PI * 2);
      ctx.arc(0, s * 0.16, s * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.kind === 'tear_drop') {
      const s = p.size;
      ctx.fillStyle = p.color || '#7DD3FC';
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.45)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.85);
      ctx.quadraticCurveTo(s * 0.72, s * 0.15, 0, s * 0.65);
      ctx.quadraticCurveTo(-s * 0.72, s * 0.15, 0, -s * 0.85);
      ctx.fill();
      ctx.stroke();
    } else if (p.kind === 'sparkle') {
      const s = p.size;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.2, -s * 0.2, s, 0);
      ctx.quadraticCurveTo(s * 0.2, s * 0.2, 0, s);
      ctx.quadraticCurveTo(-s * 0.2, s * 0.2, -s, 0);
      ctx.quadraticCurveTo(-s * 0.2, -s * 0.2, 0, -s);
      ctx.fill();
    } else if (p.kind === 'bubble') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = 'rgba(220, 248, 255, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (p.kind === 'crumb') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'zzz') {
      ctx.font = `700 ${Math.round(p.size)}px "Bricolage Grotesque", sans-serif`;
      ctx.fillStyle = '#F4F1EA';
      ctx.strokeStyle = '#2B231E';
      ctx.lineWidth = 3;
      ctx.strokeText('Z', 0, 0);
      ctx.fillText('Z', 0, 0);
    } else if (p.kind === 'text' && p.label) {
      ctx.font = `700 ${Math.round(p.size)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(30, 26, 22, 0.8)';
      ctx.lineWidth = 3.5;
      ctx.strokeText(p.label, 0, 0);
      ctx.fillStyle = p.color;
      ctx.fillText(p.label, 0, 0);
    }

    ctx.restore();
  }
}

export function drawToolCursorHint(
  ctx: CanvasRenderingContext2D,
  pointerX: number,
  pointerY: number,
  tool: ToolMode,
  visible: boolean,
  activeToy: CatToyId = 'yarn_ball'
): void {
  if (!visible || tool !== 'TOY') return;
  ctx.save();
  ctx.translate(pointerX, pointerY);

  if (activeToy === 'laser_pointer') {
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (activeToy === 'feather_wand') {
    ctx.strokeStyle = '#0D9488';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
  } else if (activeToy === 'toy_mouse') {
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
