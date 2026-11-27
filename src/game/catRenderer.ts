import {
  AdultEvolutionBranch,
  BowlTreatType,
  CAT_BREEDS,
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
}

export interface BowlRenderState {
  nx: number;
  ny: number;
  amount: number;
  treatType: BowlTreatType;
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

function pickSpriteFrame(cat: CatRenderState): { row: number; col: number } {
  // Slow down animation speed when sick or heavily drowsy (energy <= 20)
  const isDrowsyHeavy = !cat.isSick && cat.energy <= 20;
  const t = cat.isSick ? cat.animTime * 0.45 : isDrowsyHeavy ? cat.animTime * 0.56 : cat.animTime;

  if (cat.isSick && cat.behavior === 'SLEEPING') {
    return { row: 3, col: 2 };
  }

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
    case 'SLEEPING': {
      return { row: 3, col: 2 };
    }
    case 'ROLLING': {
      return { row: 7, col: Math.floor(t * 2.4) % 4 };
    }
    case 'WALKING': {
      const walkSpeed = cat.isSick ? 2.6 : cat.energy <= 20 ? 3.5 : cat.hunger <= 12 ? 4.8 : 7.2;
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

export function drawFoodBowl(
  ctx: CanvasRenderingContext2D,
  bowl: BowlRenderState,
  rt: RoomTransform
): void {
  const pos = roomToScreen(bowl.nx, bowl.ny, rt);
  const s = Math.max(0.55, rt.scale * 0.92);

  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.scale(s, s);

  ctx.fillStyle = 'rgba(38, 30, 22, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 36, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#EAE6DF';
  ctx.strokeStyle = '#312924';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-32, -3);
  ctx.bezierCurveTo(-30, 16, 30, 16, 32, -3);
  ctx.lineTo(27, -9);
  ctx.lineTo(-27, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = bowl.treatType === 'milk' ? '#60A5FA' : '#E88B38';
  ctx.beginPath();
  ctx.rect(-26, -1, 52, 5);
  ctx.fill();

  ctx.fillStyle = '#F7F4EE';
  ctx.beginPath();
  ctx.ellipse(0, -8, 30, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#CFC6B8';
  ctx.beginPath();
  ctx.ellipse(0, -8, 25, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (bowl.amount > 0.02) {
    const moundScale = 0.45 + 0.55 * bowl.amount;
    ctx.save();
    ctx.translate(0, -7);

    if (bowl.treatType === 'milk') {
      // Creamy warm milk pool
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(0, -1, 24 * Math.min(1, 0.5 + 0.5 * bowl.amount), 6 * Math.min(1, 0.5 + 0.5 * bowl.amount), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E0F2FE';
      ctx.beginPath();
      ctx.ellipse(-6, -2, 6, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (bowl.treatType === 'salmon' || bowl.treatType === 'special_food') {
      ctx.scale(moundScale, moundScale);
      ctx.fillStyle = '#F2795A';
      ctx.strokeStyle = '#312924';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(-6, -2, 13, 6.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(7, -1, 11.5, 5.8, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // White fat lines
      ctx.strokeStyle = '#FFD6C9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(-4, 1);
      ctx.moveTo(4, -3);
      ctx.lineTo(10, 1);
      ctx.stroke();
    } else if (bowl.treatType === 'catnip' || bowl.treatType === 'snack') {
      ctx.scale(moundScale, moundScale);
      const biscuits = [
        [-9, -1],
        [1, -3],
        [10, 0],
        [-3, 2],
      ];
      biscuits.forEach(([bx, by], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#E8A45C' : '#F4C27F';
        ctx.strokeStyle = '#312924';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(bx, by, 6, 3.8, i * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2D6A4F';
        ctx.beginPath();
        ctx.arc(bx - 1, by, 1.3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      ctx.scale(moundScale, moundScale);
      const nuggets = [
        [-11, -1],
        [-3, -4],
        [6, -3],
        [12, 0],
        [-7, 2],
        [2, 1],
        [8, 2],
      ];
      nuggets.forEach(([kx, ky], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#9C6234' : '#B57745';
        ctx.strokeStyle = '#312924';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(kx, ky, 5, 3.6, i * 0.4, 0, Math.PI * 2);
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

export function drawCat(
  ctx: CanvasRenderingContext2D,
  cat: CatRenderState,
  rt: RoomTransform,
  spriteSheets: Partial<Record<CatBreed, HTMLImageElement>>,
  babySpriteSheets?: Partial<Record<CatBreed, HTMLImageElement>>
): void {
  const screenPos = roomToScreen(cat.nx, cat.ny, rt);
  const s = Math.max(0.43, rt.scale * 0.72);
  const jumpPx = cat.z * rt.drawH;
  const stage: LifeStage = cat.lifeStage ?? 'adult';
  const isBabyStage = stage === 'baby';
  const babySheet = babySpriteSheets?.[cat.breed];
  const hasBabySheet = Boolean(
    isBabyStage && babySheet && babySheet.complete && babySheet.naturalWidth > 0
  );
  const sheet = hasBabySheet ? babySheet : spriteSheets[cat.breed];

  const isDrowsyHeavy =
    !cat.isSick &&
    (cat.drowsyStage
      ? cat.drowsyStage === 'drowsy_heavy' || cat.drowsyStage === 'exhausted'
      : cat.energy <= 20);
  const isDrowsyLight =
    !cat.isSick &&
    (cat.drowsyStage ? cat.drowsyStage === 'drowsy_light' : cat.energy > 20 && cat.energy <= 40);
  // Slow weak breathing slump, heavy step, and gentle head nod when sick or drowsy
  const weakSwayY =
    (cat.isSick || isDrowsyHeavy) && cat.behavior !== 'SLEEPING'
      ? Math.sin(cat.time * (cat.isSick ? 1.9 : 2.1)) * (cat.isSick ? 1.8 : 1.7) * s +
        (cat.behavior === 'WALKING'
          ? Math.abs(Math.sin(cat.time * 2.8)) * (cat.isSick ? 2.4 : 1.7) * s
          : 0)
      : isDrowsyLight && cat.behavior !== 'SLEEPING'
      ? Math.sin(cat.time * 2.2) * 0.75 * s
      : 0;
  const rollTilt =
    cat.behavior !== 'SLEEPING' && (cat.isSick || isDrowsyHeavy)
      ? cat.behavior === 'WALKING'
        ? Math.sin(cat.time * 2.8) * (cat.isSick ? 0.035 : 0.024)
        : Math.sin(cat.time * 1.9) * 0.028
      : 0;
  const sickDroopX =
    cat.isSick && cat.behavior !== 'SLEEPING'
      ? 1.035
      : isDrowsyHeavy && cat.behavior !== 'SLEEPING'
      ? 1.022
      : 1;
  const sickDroopY =
    cat.isSick && cat.behavior !== 'SLEEPING'
      ? 0.935
      : isDrowsyHeavy && cat.behavior !== 'SLEEPING'
      ? 0.956
      : 1;
  const rumbleScale =
    cat.isHungry && cat.hunger <= 15 && cat.behavior !== 'EATING' && !cat.isSick
      ? Math.sin(cat.time * 10) * 0.025
      : 0;

  ctx.save();

  // Recovery soft mint aura at feet
  if (cat.isRecovering) {
    const pulse = 0.85 + Math.sin(cat.time * 3.2) * 0.15;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - 2 * s, 76 * s * pulse, 22 * s * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (stage === 'adult' && cat.adultBranch === 'prima' && !cat.isSick) {
    const pulse = 0.9 + Math.sin(cat.time * 2.5) * 0.1;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.ellipse(screenPos.x, screenPos.y - 2 * s, 72 * s * pulse, 20 * s * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Floor shadow scaled per life stage
  const shadowSizeMult =
    stage === 'baby' ? 0.68 : stage === 'child' ? 0.74 : stage === 'teen' ? 0.86 : 1;
  const shadowScale = Math.max(0.45, 1 - cat.z * 2.2) * shadowSizeMult;
  ctx.fillStyle = 'rgba(35, 27, 20, 0.22)';
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y - 2 * s,
    66 * s * shadowScale,
    18 * s * shadowScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.translate(screenPos.x, screenPos.y - jumpPx + weakSwayY);

  // Floating status bubbles above cat
  if (cat.isSick) {
    drawSickIndicator(ctx, s * (stage === 'baby' ? 0.82 : stage === 'child' ? 0.88 : 1), cat.time);
  } else if (cat.isHungry && cat.behavior !== 'EATING' && cat.behavior !== 'SLEEPING') {
    drawHungryThoughtBubble(
      ctx,
      s * (stage === 'baby' ? 0.82 : stage === 'child' ? 0.88 : 1),
      cat.time
    );
  }

  ctx.rotate(rollTilt);
  ctx.scale(
    s * cat.facing * (cat.scaleX * sickDroopX + rumbleScale),
    s * (cat.scaleY * sickDroopY - rumbleScale * 0.7)
  );

  if (stage === 'child' || (isBabyStage && !hasBabySheet)) {
    drawKittenStageCat(ctx, cat, stage);
    ctx.restore();
    return;
  }

  if (sheet && sheet.complete && sheet.naturalWidth > 0) {
    const stageScaleX = isBabyStage
      ? 0.84
      : stage === 'teen'
      ? 0.84
      : stage === 'senior'
      ? 0.96
      : 1;
    const stageScaleY = isBabyStage
      ? 0.84
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

    if (cat.isSick && cat.behavior !== 'SLEEPING') {
      drawCatSickExpression(ctx, row, col, cat.breed, cat.time, isBabyStage);
    } else if ((isDrowsyHeavy || isDrowsyLight) && cat.behavior !== 'SLEEPING') {
      drawCatTiredExpression(
        ctx,
        row,
        col,
        cat.breed,
        cat.time,
        isDrowsyHeavy ? 'heavy' : 'light',
        isBabyStage
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
      isBabyStage
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
  const hasSpriteSheet = Boolean(sheet && sheet.complete && sheet.naturalWidth > 0);

  if (lifeStage === 'child' || (isBaby && !hasSpriteSheet)) {
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
    const stageMult = isBaby ? 1.12 : lifeStage === 'teen' ? 0.9 : lifeStage === 'senior' ? 0.97 : 1;
    if (isBaby) {
      ctx.translate(4, -6);
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
    drawCatAccessories(ctx, row, col, hat, glasses, scarf, 0, isBaby);
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
  const isSleeping = cat.behavior === 'SLEEPING';
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
  if (cat.isSick || isDrowsyHeavy || isDrowsyLight) {
    const isLight = !cat.isSick && isDrowsyLight;
    const lidHeight = isLight ? 3.1 : 4.6;
    const lidY = isLight ? -3.4 : -2.5;
    // Draw sick/drowsy droopy eyelids over kitten eyes
    ctx.save();
    ctx.translate(eyeCenterAnchor.x, eyeCenterAnchor.y);
    ctx.fillStyle = profile.primaryColor;
    ctx.strokeStyle = '#2B231E';
    ctx.lineWidth = isLight ? 1.8 : 2.2;
    ctx.beginPath();
    ctx.ellipse(-12, lidY, 8, lidHeight, cat.isSick ? -0.22 : 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(12, lidY, 8, lidHeight, cat.isSick ? 0.22 : 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Periodic sleepy yawn mouth when drowsy
    if (!cat.isSick && cat.behavior !== 'EATING') {
      const cycle = isLight ? 8.5 : 4.8;
      const phase = cat.time % cycle;
      if (phase < 1.05) {
        const open = Math.sin((phase / 1.05) * Math.PI);
        ctx.fillStyle = '#FB7185';
        ctx.strokeStyle = '#2B231E';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(1, 13.5, 4.2, Math.max(1.5, 5.2 * open), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
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
    case 3: // SLEEPING (row 3 col 2)
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
    case 3: // SLEEPING
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

function drawCatSickExpression(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  breed: CatBreed,
  time: number,
  isBaby = false
): void {
  const anchors = isBaby ? getBabyAccessoryAnchors(row, col) : getCatAccessoryAnchors(row, col);
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

function drawCatTiredExpression(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  breed: CatBreed,
  time: number,
  tier: 'light' | 'heavy' = 'heavy',
  isBaby = false
): void {
  const anchors = isBaby ? getBabyAccessoryAnchors(row, col) : getCatAccessoryAnchors(row, col);
  const a = anchors.glasses;
  const furColor = CAT_BREEDS[breed].primaryColor;
  const isLight = tier === 'light';
  const lidY = isLight ? -4.2 : -3;
  const lidH = isLight ? 3.2 : 5.0;
  const lashY = isLight ? -3.7 : -2.4;

  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rot);
  ctx.scale(a.scale, a.scale);

  // Mildly droopy (21-40) or heavily droopy (<=20) eyelids
  ctx.fillStyle = furColor;
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = isLight ? 1.8 : 2.2;
  ctx.beginPath();
  ctx.ellipse(-14, lidY, 8.8, lidH, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22.5, lashY);
  ctx.lineTo(-5.5, lashY);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(14, lidY, 8.8, lidH, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5.5, lashY);
  ctx.lineTo(22.5, lashY);
  ctx.stroke();

  // Periodic yawning oval mouth
  if (row !== 0) {
    const cycle = isLight ? 8.5 : 4.8;
    const phase = time % cycle;
    if (phase < 1.05) {
      const open = Math.sin((phase / 1.05) * Math.PI);
      ctx.fillStyle = '#FB7185';
      ctx.strokeStyle = '#2B231E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 14.5, 4.6, Math.max(1.5, 5.8 * open), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

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
  isBaby = false
): void {
  if (hat === 'none' && glasses === 'none' && scarf === 'default') return;
  const anchors = isBaby ? getBabyAccessoryAnchors(row, col) : getCatAccessoryAnchors(row, col);
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

function drawHungryThoughtBubble(ctx: CanvasRenderingContext2D, s: number, time: number): void {
  const bob = Math.sin(time * 2.8) * 3.5 * s;
  ctx.save();
  ctx.translate(46 * s, -148 * s + bob);
  ctx.scale(s, s);

  ctx.fillStyle = '#FFFDF9';
  ctx.strokeStyle = '#2B231E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-18, 22, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-10, 12, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-24, -22, 52, 32, 14);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, -6);
  ctx.lineTo(10, -6);
  ctx.moveTo(-4, -11);
  ctx.lineTo(-4, -1);
  ctx.moveTo(2, -11);
  ctx.lineTo(2, -1);
  ctx.moveTo(10, -6);
  ctx.lineTo(15, -11);
  ctx.moveTo(10, -6);
  ctx.lineTo(15, -1);
  ctx.stroke();

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
