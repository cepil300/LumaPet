import { RoomBackgroundId } from '../types/game';
import { RoomTransform } from './catRenderer';

export interface ItemFootprint {
  halfW: number;
  padBack: number;
  padFront: number;
}

export type FloorObstacle =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'rect'; minX: number; maxX: number; minY: number; maxY: number }
  | { kind: 'polygon'; points: ReadonlyArray<readonly [number, number]> };

export interface RoomAreaBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const BED_FOOTPRINT: ItemFootprint = {
  halfW: 0.048,
  padBack: 0.025,
  padFront: 0.018,
};

export const TUB_FOOTPRINT: ItemFootprint = {
  halfW: 0.048,
  padBack: 0.026,
  padFront: 0.018,
};

export const BOWL_FOOTPRINT: ItemFootprint = {
  halfW: 0.028,
  padBack: 0.014,
  padFront: 0.01,
};

const DEFAULT_ROOM_BOUNDS: RoomAreaBounds = {
  minX: 0.03,
  maxX: 0.97,
  minY: 0.56,
  maxY: 0.935,
};

/**
 * Garis batas paling bawah tembok (pertemuan tembok & lantai) pada tiap map
 * dalam koordinat ternormalisasi gambar ruangan (nx: 0..1, ny: 0..1).
 */
export function getWallFloorY(bgId: RoomBackgroundId, x: number): number {
  const cx = Math.max(0, Math.min(1, x));

  if (bgId === 'apartment') {
    // Tembok kiri miring turun ke sudut (0.193, 0.692), tembok belakang + jendela datar di 0.692,
    // jendela kanan miring turun dari (0.790, 0.692) ke (1.0, 0.880)
    if (cx < 0.193) {
      return 0.692 + ((0.193 - cx) / 0.193) * (0.808 - 0.692);
    }
    if (cx <= 0.79) {
      return 0.692;
    }
    return 0.692 + ((cx - 0.79) / (1 - 0.79)) * (0.88 - 0.692);
  }

  if (bgId === 'tatami') {
    // Dinding geser kiri miring turun ke sudut (0.198, 0.720), dinding & panggung tokonoma datar di 0.720,
    // jalur pintu shoji kanan miring turun dari (0.742, 0.720) ke (1.0, 0.962)
    if (cx < 0.198) {
      return 0.72 + ((0.198 - cx) / 0.198) * (0.875 - 0.72);
    }
    if (cx <= 0.742) {
      return 0.72;
    }
    return 0.72 + ((cx - 0.742) / (1 - 0.742)) * (0.962 - 0.72);
  }

  // classic_home:
  // Tembok hijau sage datar di 0.688 hingga sudut x=0.565, ceruk belakang di 0.640,
  // lalu garis bawah tembok jendela kanan miring turun dari (0.665, 0.642) ke (1.0, 0.876)
  if (cx <= 0.565) {
    return 0.688;
  }
  if (cx <= 0.665) {
    return 0.64;
  }
  return 0.642 + ((cx - 0.665) / (1 - 0.665)) * (0.876 - 0.642);
}

/**
 * Bentuk area perabotan rumah di lantai pada masing-masing map yang harus dihindari
 * agar item drag-and-drop mengikuti contour/shape objek di ruangan.
 */
const ROOM_FURNITURE_OBSTACLES: Record<RoomBackgroundId, FloorObstacle[]> = {
  classic_home: [
    // Meja bulat kecil & lampu di kiri
    { kind: 'rect', minX: 0.0, maxX: 0.096, minY: 0.66, maxY: 0.908 },
    // Bantal duduk bundar hijau (pouf) — mengikuti shape bundar elips
    { kind: 'ellipse', cx: 0.138, cy: 0.772, rx: 0.088, ry: 0.086 },
    // Rak buku kayu
    { kind: 'rect', minX: 0.31, maxX: 0.456, minY: 0.66, maxY: 0.728 },
    // Pot tanaman monstera berkaki kayu
    { kind: 'ellipse', cx: 0.508, cy: 0.706, rx: 0.036, ry: 0.028 },
    // Sudut ceruk & kursi kayu di lorong jendela belakang
    { kind: 'rect', minX: 0.565, maxX: 0.668, minY: 0.6, maxY: 0.678 },
  ],
  apartment: [
    // Meja kayu lampu di sudut kiri (polygon mengikuti perspektif kaki meja)
    {
      kind: 'polygon',
      points: [
        [0.0, 0.74],
        [0.144, 0.79],
        [0.144, 0.855],
        [0.095, 0.888],
        [0.0, 0.885],
      ],
    },
  ],
  tatami: [
    // Lampu lantai andon di sudut kiri
    { kind: 'rect', minX: 0.194, maxX: 0.244, minY: 0.7, maxY: 0.755 },
    // Sekat lipat 3 panel (byobu)
    { kind: 'rect', minX: 0.242, maxX: 0.314, minY: 0.7, maxY: 0.738 },
    // Lemari kayu rendah (tansu)
    { kind: 'rect', minX: 0.316, maxX: 0.493, minY: 0.7, maxY: 0.746 },
  ],
};

function pointInPolygon(x: number, y: number, pts: ReadonlyArray<readonly [number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0];
    const yi = pts[i][1];
    const xj = pts[j][0];
    const yj = pts[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function itemOverlapsObstacle(
  nx: number,
  ny: number,
  fp: ItemFootprint,
  obs: FloorObstacle
): boolean {
  const cyItem = ny - (fp.padBack - fp.padFront) * 0.5;
  const ryItem = (fp.padBack + fp.padFront) * 0.5;

  if (obs.kind === 'ellipse') {
    const dx = (nx - obs.cx) / (obs.rx + fp.halfW);
    const dy = (cyItem - obs.cy) / (obs.ry + ryItem);
    return dx * dx + dy * dy < 1;
  }

  if (obs.kind === 'rect') {
    const qx = Math.max(obs.minX, Math.min(obs.maxX, nx));
    const qy = Math.max(obs.minY, Math.min(obs.maxY, cyItem));
    const dx = (nx - qx) / fp.halfW;
    const dy = (cyItem - qy) / ryItem;
    return dx * dx + dy * dy < 1;
  }

  // Polygon: uji pusat & 12 titik keliling elips alas item + cek titik sudut poligon di dalam elips item
  if (pointInPolygon(nx, cyItem, obs.points)) return true;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const px = nx + Math.cos(angle) * fp.halfW;
    const py = cyItem + Math.sin(angle) * ryItem;
    if (pointInPolygon(px, py, obs.points)) return true;
  }
  for (const [vx, vy] of obs.points) {
    const dx = (vx - nx) / fp.halfW;
    const dy = (vy - cyItem) / ryItem;
    if (dx * dx + dy * dy < 1) return true;
  }
  return false;
}

export function computeScreenRoomBounds(
  rt: RoomTransform,
  viewW: number,
  viewH: number
): RoomAreaBounds {
  if (viewW <= 0 || viewH <= 0 || rt.drawW <= 0 || rt.drawH <= 0) {
    return DEFAULT_ROOM_BOUNDS;
  }
  const minX = Math.max(0.02, (28 - rt.offsetX) / rt.drawW);
  const maxX = Math.min(0.98, (viewW - 28 - rt.offsetX) / rt.drawW);
  const minY = Math.max(0.55, (40 - rt.offsetY) / rt.drawH);
  const maxY = Math.min(0.935, (viewH - 22 - rt.offsetY) / rt.drawH);
  if (maxX <= minX + 0.1 || maxY <= minY + 0.06) {
    return DEFAULT_ROOM_BOUNDS;
  }
  return { minX, maxX, minY, maxY };
}

export function isPlacementValid(
  bgId: RoomBackgroundId,
  nx: number,
  ny: number,
  fp: ItemFootprint,
  bounds: RoomAreaBounds = DEFAULT_ROOM_BOUNDS,
  extraObstacles: FloorObstacle[] = []
): boolean {
  if (nx < bounds.minX + fp.halfW || nx > bounds.maxX - fp.halfW) return false;
  if (ny + fp.padFront > bounds.maxY) return false;
  if (ny - fp.padBack < bounds.minY) return false;

  const cyItem = ny - (fp.padBack - fp.padFront) * 0.5;
  const ryItem = (fp.padBack + fp.padFront) * 0.5;

  // Pastikan seluruh tepi belakang alas elips item berada di bawah garis tembok paling bawah
  const sampleFracs = [-1, -0.5, 0, 0.5, 1];
  for (const t of sampleFracs) {
    const sx = nx + t * fp.halfW;
    const ellipseTopY = cyItem - ryItem * Math.sqrt(Math.max(0, 1 - t * t));
    if (ellipseTopY < getWallFloorY(bgId, sx)) {
      return false;
    }
  }

  const furniture = ROOM_FURNITURE_OBSTACLES[bgId];
  for (const obs of furniture) {
    if (itemOverlapsObstacle(nx, ny, fp, obs)) return false;
  }
  for (const obs of extraObstacles) {
    if (itemOverlapsObstacle(nx, ny, fp, obs)) return false;
  }

  return true;
}

export function constrainItemPlacement(
  bgId: RoomBackgroundId,
  targetNx: number,
  targetNy: number,
  fp: ItemFootprint,
  bounds: RoomAreaBounds = DEFAULT_ROOM_BOUNDS,
  extraObstacles: FloorObstacle[] = [],
  fallback?: { nx: number; ny: number }
): { nx: number; ny: number } {
  const minCenterX = bounds.minX + fp.halfW;
  const maxCenterX = Math.max(minCenterX, bounds.maxX - fp.halfW);
  const minCenterY = bounds.minY + fp.padBack;
  const maxCenterY = Math.max(minCenterY, bounds.maxY - fp.padFront);

  const tx = Math.max(minCenterX, Math.min(maxCenterX, targetNx));
  const ty = Math.max(minCenterY, Math.min(maxCenterY, targetNy));

  if (isPlacementValid(bgId, tx, ty, fp, bounds, extraObstacles)) {
    return { nx: tx, ny: ty };
  }

  let bestNx = tx;
  let bestNy = ty;
  let bestDistSq = Infinity;

  const consider = (cx: number, cy: number) => {
    if (cx < minCenterX || cx > maxCenterX || cy < minCenterY || cy > maxCenterY) return;
    const dx = cx - tx;
    const dy = cy - ty;
    const dSq = dx * dx + dy * dy;
    if (dSq >= bestDistSq) return;
    if (isPlacementValid(bgId, cx, cy, fp, bounds, extraObstacles)) {
      bestDistSq = dSq;
      bestNx = cx;
      bestNy = cy;
    }
  };

  // Coba geser vertikal tepat di bawah garis tembok pada x target
  const wallYCenter = Math.max(
    getWallFloorY(bgId, tx - fp.halfW),
    getWallFloorY(bgId, tx),
    getWallFloorY(bgId, tx + fp.halfW)
  );
  consider(tx, Math.min(maxCenterY, wallYCenter + fp.padBack + 0.002));

  // Coba geser horizontal di y target (membantu saat menabrak tembok miring atau perabotan samping)
  for (let step = 0.006; step <= 0.22; step += 0.008) {
    consider(tx - step, ty);
    consider(tx + step, ty);
  }

  // Pencarian cincin konsentris halus untuk menemukan titik lantai terdekat yang valid
  const radii: number[] = [];
  for (let r = 0.005; r <= 0.06; r += 0.005) radii.push(r);
  for (let r = 0.07; r <= 0.28; r += 0.012) radii.push(r);

  const angles = 24;
  for (const r of radii) {
    if (r * r >= bestDistSq) break;
    for (let i = 0; i < angles; i++) {
      const a = (i / angles) * Math.PI * 2;
      consider(tx + Math.cos(a) * r, ty + Math.sin(a) * r);
    }
  }

  if (bestDistSq < Infinity) {
    return { nx: bestNx, ny: bestNy };
  }

  if (fallback && isPlacementValid(bgId, fallback.nx, fallback.ny, fp, bounds, extraObstacles)) {
    return fallback;
  }

  // Fallback darurat ke titik tengah lantai ruangan yang pasti aman
  return { nx: 0.56, ny: 0.82 };
}
