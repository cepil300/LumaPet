import { RoomBackgroundId, WeatherType } from '../types/game';
import { RoomTransform, roomToScreen } from './catRenderer';

export interface RainDropParticle {
  nx: number;
  ny: number;
  len: number;
  speed: number;
  alpha: number;
}

export interface GlassDroplet {
  nx: number;
  ny: number;
  vy: number;
  radius: number;
  alpha: number;
}

export interface RainSplash {
  nx: number;
  ny: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface SunMote {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
}

export interface NightStar {
  nx: number;
  ny: number;
  size: number;
  phase: number;
}

export interface WeatherFxState {
  weather: WeatherType;
  prevWeather: WeatherType;
  weatherFade: number; // 0..1 transition from prevWeather -> weather
  time: number;
  lightningFlash: number;
  rainDrops: RainDropParticle[];
  glassDroplets: GlassDroplet[];
  splashes: RainSplash[];
  sunMotes: SunMote[];
  stars: NightStar[];
}

interface HouseWeatherProfile {
  windowPolygons: Array<Array<[number, number]>>;
  diffusedPolygons?: Array<Array<[number, number]>>;
  sillLines: Array<[[number, number], [number, number]]>;
  hasGlass: boolean;
  rainAngle: number;
  sunOrigin: { nx: number; ny: number };
  sunSpreadPolygons: Array<Array<[number, number]>>;
  lampPos: { nx: number; ny: number };
  cityLightsArea?: { minX: number; maxX: number; minY: number; maxY: number };
  gardenFirefliesArea?: { minX: number; maxX: number; minY: number; maxY: number };
}

const HOUSE_PROFILES: Record<RoomBackgroundId, HouseWeatherProfile> = {
  classic_home: {
    windowPolygons: [
      // Small back window
      [
        [0.688, 0.258],
        [0.742, 0.195],
        [0.742, 0.533],
        [0.688, 0.506],
      ],
      // Large foreground right window
      [
        [0.798, 0.165],
        [1.0, 0.008],
        [1.0, 0.768],
        [0.798, 0.628],
      ],
    ],
    sillLines: [
      [
        [0.688, 0.504],
        [0.742, 0.530],
      ],
      [
        [0.798, 0.625],
        [0.996, 0.764],
      ],
    ],
    hasGlass: true,
    rainAngle: -0.18,
    sunOrigin: { nx: 0.9, ny: 0.2 },
    sunSpreadPolygons: [
      [
        [0.798, 0.18],
        [0.98, 0.04],
        [0.86, 0.94],
        [0.44, 0.94],
      ],
      [
        [0.688, 0.26],
        [0.742, 0.21],
        [0.68, 0.66],
        [0.56, 0.66],
      ],
    ],
    lampPos: { nx: 0.03, ny: 0.63 },
  },
  apartment: {
    windowPolygons: [
      // Back floor-to-ceiling city windows
      [
        [0.583, 0.112],
        [0.785, 0.112],
        [0.785, 0.678],
        [0.583, 0.678],
      ],
      // Angled right floor-to-ceiling city windows
      [
        [0.795, 0.095],
        [1.0, 0.0],
        [1.0, 0.858],
        [0.795, 0.692],
      ],
    ],
    sillLines: [
      [
        [0.585, 0.676],
        [0.783, 0.676],
      ],
      [
        [0.796, 0.690],
        [0.996, 0.852],
      ],
    ],
    hasGlass: true,
    rainAngle: -0.24,
    sunOrigin: { nx: 0.78, ny: 0.16 },
    sunSpreadPolygons: [
      [
        [0.585, 0.12],
        [0.98, 0.04],
        [0.92, 0.98],
        [0.45, 0.94],
      ],
    ],
    lampPos: { nx: 0.075, ny: 0.61 },
    cityLightsArea: { minX: 0.59, maxX: 0.98, minY: 0.43, maxY: 0.68 },
  },
  tatami: {
    windowPolygons: [
      // Open engawa bamboo garden doorway
      [
        [0.816, 0.258],
        [0.958, 0.180],
        [0.958, 0.805],
        [0.816, 0.728],
      ],
    ],
    diffusedPolygons: [
      // Translucent sliding shoji screen left
      [
        [0.748, 0.225],
        [0.816, 0.258],
        [0.816, 0.625],
        [0.748, 0.605],
      ],
      // Upper shoji transom panes
      [
        [0.748, 0.085],
        [0.96, 0.0],
        [0.96, 0.175],
        [0.748, 0.215],
      ],
    ],
    sillLines: [
      [
        [0.818, 0.722],
        [0.956, 0.796],
      ],
      [
        [0.835, 0.665],
        [0.942, 0.715],
      ],
    ],
    hasGlass: false,
    rainAngle: -0.11,
    sunOrigin: { nx: 0.89, ny: 0.22 },
    sunSpreadPolygons: [
      [
        [0.816, 0.26],
        [0.958, 0.19],
        [0.84, 0.96],
        [0.50, 0.94],
      ],
    ],
    lampPos: { nx: 0.213, ny: 0.595 },
    gardenFirefliesArea: { minX: 0.822, maxX: 0.952, minY: 0.34, maxY: 0.72 },
  },
};

export function createWeatherFxState(): WeatherFxState {
  const rainDrops: RainDropParticle[] = Array.from({ length: 95 }, () => ({
    nx: 0.56 + Math.random() * 0.45,
    ny: Math.random() * 0.85,
    len: 0.032 + Math.random() * 0.038,
    speed: 0.75 + Math.random() * 0.55,
    alpha: 0.38 + Math.random() * 0.45,
  }));

  const glassDroplets: GlassDroplet[] = Array.from({ length: 26 }, () => ({
    nx: 0.58 + Math.random() * 0.41,
    ny: 0.08 + Math.random() * 0.7,
    vy: 0.02 + Math.random() * 0.055,
    radius: 1.4 + Math.random() * 1.8,
    alpha: 0.32 + Math.random() * 0.35,
  }));

  const splashes: RainSplash[] = Array.from({ length: 18 }, () => ({
    nx: 0.75,
    ny: 0.7,
    life: 1,
    maxLife: 0.3,
    size: 4,
  }));

  const sunMotes: SunMote[] = Array.from({ length: 24 }, () => ({
    nx: 0.35 + Math.random() * 0.6,
    ny: 0.16 + Math.random() * 0.72,
    vx: -0.008 - Math.random() * 0.012,
    vy: -0.005 + Math.random() * 0.01,
    radius: 1.5 + Math.random() * 2.2,
    phase: Math.random() * Math.PI * 2,
  }));

  const stars: NightStar[] = Array.from({ length: 26 }, () => ({
    nx: 0.58 + Math.random() * 0.41,
    ny: 0.03 + Math.random() * 0.32,
    size: 1.0 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
  }));

  return {
    weather: 'cerah',
    prevWeather: 'cerah',
    weatherFade: 1,
    time: 0,
    lightningFlash: 0,
    rainDrops,
    glassDroplets,
    splashes,
    sunMotes,
    stars,
  };
}

function getWeatherWeight(fx: WeatherFxState, target: WeatherType): number {
  if (fx.weather === target && fx.prevWeather === target) return 1;
  if (fx.weather === target) return fx.weatherFade;
  if (fx.prevWeather === target) return 1 - fx.weatherFade;
  return 0;
}

export function stepWeatherFx(
  fx: WeatherFxState,
  dt: number,
  activeBackground: RoomBackgroundId
): void {
  fx.time += dt;
  if (fx.weatherFade < 1) {
    fx.weatherFade = Math.min(1, fx.weatherFade + dt / 2.4);
  }
  fx.lightningFlash = Math.max(0, fx.lightningFlash - dt * 3.4);

  const profile = HOUSE_PROFILES[activeBackground];
  const rainWeight = getWeatherWeight(fx, 'hujan');
  const sunWeight = getWeatherWeight(fx, 'cerah');

  if (rainWeight > 0.02) {
    for (let i = 0; i < fx.rainDrops.length; i++) {
      const d = fx.rainDrops[i];
      d.ny += d.speed * dt;
      d.nx += d.speed * profile.rainAngle * dt;
      if (d.ny > 0.88 || d.nx < 0.55) {
        d.ny = -0.02 - Math.random() * 0.14;
        d.nx = 0.57 + Math.random() * 0.48;
      }
    }

    if (profile.hasGlass) {
      for (let i = 0; i < fx.glassDroplets.length; i++) {
        const g = fx.glassDroplets[i];
        g.ny += g.vy * dt;
        if (g.ny > 0.84) {
          g.ny = 0.04 + Math.random() * 0.18;
          g.nx = 0.58 + Math.random() * 0.41;
        }
      }
    }

    for (let i = 0; i < fx.splashes.length; i++) {
      const sp = fx.splashes[i];
      sp.life += dt;
      if (sp.life >= sp.maxLife) {
        const sill = profile.sillLines[i % profile.sillLines.length];
        const t = Math.random();
        sp.nx = sill[0][0] + (sill[1][0] - sill[0][0]) * t;
        sp.ny = sill[0][1] + (sill[1][1] - sill[0][1]) * t;
        sp.life = 0;
        sp.maxLife = 0.22 + Math.random() * 0.22;
        sp.size = 3.2 + Math.random() * 3.2;
      }
    }
  }

  if (sunWeight > 0.02) {
    for (let i = 0; i < fx.sunMotes.length; i++) {
      const m = fx.sunMotes[i];
      m.nx += m.vx * dt;
      m.ny += (m.vy + Math.sin(fx.time * 1.4 + m.phase) * 0.006) * dt;
      if (m.nx < 0.24 || m.ny < 0.12 || m.ny > 0.94) {
        m.nx = 0.72 + Math.random() * 0.24;
        m.ny = 0.18 + Math.random() * 0.58;
      }
    }
  }
}

function buildPolygonsPath(
  ctx: CanvasRenderingContext2D,
  polygons: Array<Array<[number, number]>>,
  rt: RoomTransform
): void {
  ctx.beginPath();
  polygons.forEach((poly) => {
    poly.forEach(([nx, ny], idx) => {
      const p = roomToScreen(nx, ny, rt);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
  });
}

export function drawRoomWeatherBackdrop(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  rt: RoomTransform,
  activeBackground: RoomBackgroundId,
  fx: WeatherFxState,
  isSleeping: boolean
): void {
  const profile = HOUSE_PROFILES[activeBackground];
  const rainWeight = getWeatherWeight(fx, 'hujan');
  const nightWeight = getWeatherWeight(fx, 'malam');
  const sunWeight = getWeatherWeight(fx, 'cerah');
  const s = Math.max(0.6, rt.scale);

  // 1. Interior ambient color grading by weather (plus sleeping nap dim)
  if (rainWeight > 0.01) {
    ctx.fillStyle = `rgba(38, 60, 86, ${(0.22 * rainWeight).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
  if (nightWeight > 0.01) {
    ctx.fillStyle = `rgba(16, 28, 52, ${(0.36 * nightWeight).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
  if (isSleeping && nightWeight < 0.5) {
    ctx.fillStyle = `rgba(22, 34, 48, ${(0.22 * (1 - nightWeight * 0.7)).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  // 2. House-specific window / outdoor weather effects (clipped to this house's openings)
  if (rainWeight > 0.01) {
    // Main open windows / garden view
    ctx.save();
    buildPolygonsPath(ctx, profile.windowPolygons, rt);
    ctx.clip();

    // Overcast storm sky tint inside windows
    ctx.fillStyle = `rgba(36, 62, 92, ${(0.42 * rainWeight).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);

    if (fx.lightningFlash > 0.01) {
      ctx.fillStyle = `rgba(224, 242, 254, ${(0.55 * fx.lightningFlash * rainWeight).toFixed(3)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // Crisp falling rain streaks inside that house's windows / garden
    ctx.lineCap = 'round';
    for (let i = 0; i < fx.rainDrops.length; i++) {
      const d = fx.rainDrops[i];
      const p1 = roomToScreen(d.nx, d.ny, rt);
      const p2 = roomToScreen(
        d.nx + d.len * profile.rainAngle,
        d.ny + d.len,
        rt
      );
      ctx.strokeStyle = `rgba(214, 236, 255, ${(d.alpha * rainWeight * 0.85).toFixed(3)})`;
      ctx.lineWidth = (1.3 + (i % 3) * 0.35) * s;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Rain splashes along window sills / tatami engawa deck & garden stones
    for (let i = 0; i < fx.splashes.length; i++) {
      const sp = fx.splashes[i];
      const prog = sp.life / Math.max(0.01, sp.maxLife);
      if (prog > 1) continue;
      const pos = roomToScreen(sp.nx, sp.ny, rt);
      const alpha = (1 - prog) * 0.72 * rainWeight;
      ctx.strokeStyle = `rgba(224, 242, 254, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.ellipse(
        pos.x,
        pos.y,
        sp.size * (0.5 + prog * 1.1) * s,
        sp.size * 0.35 * (0.5 + prog * 0.8) * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Rain droplets trickling down window glass (classic_home & apartment only)
    if (profile.hasGlass) {
      for (let i = 0; i < fx.glassDroplets.length; i++) {
        const g = fx.glassDroplets[i];
        const gp = roomToScreen(g.nx, g.ny, rt);
        ctx.fillStyle = `rgba(224, 242, 254, ${(g.alpha * rainWeight).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(gp.x, gp.y, g.radius * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(224, 242, 254, ${(g.alpha * 0.45 * rainWeight).toFixed(3)})`;
        ctx.lineWidth = 1.0 * s;
        ctx.beginPath();
        ctx.moveTo(gp.x, gp.y - g.radius * s);
        ctx.lineTo(gp.x, gp.y - (g.radius + 7) * s);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Soft diffused rain behind translucent shoji screens (tatami house)
    if (profile.diffusedPolygons && profile.diffusedPolygons.length > 0) {
      ctx.save();
      buildPolygonsPath(ctx, profile.diffusedPolygons, rt);
      ctx.clip();
      ctx.fillStyle = `rgba(42, 68, 98, ${(0.28 * rainWeight).toFixed(3)})`;
      ctx.fillRect(0, 0, viewW, viewH);
      for (let i = 0; i < fx.rainDrops.length; i += 2) {
        const d = fx.rainDrops[i];
        const p1 = roomToScreen(d.nx, d.ny, rt);
        const p2 = roomToScreen(d.nx + d.len * profile.rainAngle, d.ny + d.len, rt);
        ctx.strokeStyle = `rgba(214, 236, 255, ${(d.alpha * rainWeight * 0.3).toFixed(3)})`;
        ctx.lineWidth = 2.0 * s;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Night sky, stars, city lights / garden fireflies inside house windows
  if (nightWeight > 0.01) {
    ctx.save();
    buildPolygonsPath(ctx, profile.windowPolygons, rt);
    ctx.clip();

    ctx.fillStyle = `rgba(11, 22, 48, ${(0.56 * nightWeight).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);

    // Twinkling stars
    for (let i = 0; i < fx.stars.length; i++) {
      const st = fx.stars[i];
      const sp = roomToScreen(st.nx, st.ny, rt);
      const twinkle = (0.45 + 0.55 * Math.sin(fx.time * 2.4 + st.phase)) * nightWeight;
      ctx.fillStyle = `rgba(254, 249, 195, ${twinkle.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, st.size * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Apartment: warm lit skyline building windows at night
    if (profile.cityLightsArea) {
      const area = profile.cityLightsArea;
      for (let i = 0; i < 22; i++) {
        const lx = area.minX + ((i * 73) % 100) / 100 * (area.maxX - area.minX);
        const ly = area.minY + ((i * 41) % 100) / 100 * (area.maxY - area.minY);
        const lp = roomToScreen(lx, ly, rt);
        const flicker = 0.55 + 0.35 * Math.sin(fx.time * 1.2 + i);
        ctx.fillStyle = `rgba(253, 224, 71, ${(flicker * nightWeight).toFixed(3)})`;
        ctx.fillRect(lp.x, lp.y, 4.2 * s, 3.0 * s);
      }
    }

    // Tatami: gentle drifting fireflies in bamboo garden at night
    if (profile.gardenFirefliesArea) {
      const area = profile.gardenFirefliesArea;
      for (let i = 0; i < 8; i++) {
        const fxNx =
          area.minX +
          (area.maxX - area.minX) * (0.2 + 0.6 * (0.5 + 0.5 * Math.sin(fx.time * 0.7 + i * 1.7)));
        const fxNy =
          area.minY +
          (area.maxY - area.minY) * (0.2 + 0.6 * (0.5 + 0.5 * Math.cos(fx.time * 0.9 + i * 2.3)));
        const fp = roomToScreen(fxNx, fxNy, rt);
        const glowA = (0.45 + 0.55 * Math.sin(fx.time * 3.1 + i)) * nightWeight;
        ctx.fillStyle = `rgba(217, 249, 157, ${glowA.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 2.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    if (profile.diffusedPolygons && profile.diffusedPolygons.length > 0) {
      ctx.save();
      buildPolygonsPath(ctx, profile.diffusedPolygons, rt);
      ctx.clip();
      ctx.fillStyle = `rgba(15, 28, 56, ${(0.34 * nightWeight).toFixed(3)})`;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.restore();
    }
  }

  // Sunny golden rays streaming through this house's windows
  if (sunWeight > 0.01) {
    ctx.save();
    const sunPt = roomToScreen(profile.sunOrigin.nx, profile.sunOrigin.ny, rt);
    const floorPt = roomToScreen(0.55, 0.9, rt);
    const beamGrad = ctx.createLinearGradient(sunPt.x, sunPt.y, floorPt.x, floorPt.y);
    beamGrad.addColorStop(0, `rgba(255, 243, 196, ${(0.20 * sunWeight).toFixed(3)})`);
    beamGrad.addColorStop(0.55, `rgba(253, 224, 130, ${(0.11 * sunWeight).toFixed(3)})`);
    beamGrad.addColorStop(1, 'rgba(253, 224, 130, 0)');
    ctx.fillStyle = beamGrad;
    buildPolygonsPath(ctx, profile.sunSpreadPolygons, rt);
    ctx.fill();

    // Floating warm sunlit motes
    for (let i = 0; i < fx.sunMotes.length; i++) {
      const m = fx.sunMotes[i];
      const mp = roomToScreen(m.nx, m.ny, rt);
      const twinkle = (0.32 + 0.38 * Math.sin(fx.time * 2.1 + m.phase)) * sunWeight;
      ctx.fillStyle = `rgba(255, 248, 214, ${twinkle.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, m.radius * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Warm indoor lamp glow at night or when sleeping
  if (nightWeight > 0.05 || isSleeping) {
    const lampStrength = Math.max(nightWeight, isSleeping ? 0.65 : 0);
    const lamp = roomToScreen(profile.lampPos.nx, profile.lampPos.ny, rt);
    const glowR = 270 * rt.scale;
    const glow = ctx.createRadialGradient(lamp.x, lamp.y, 10, lamp.x, lamp.y, glowR);
    glow.addColorStop(0, `rgba(255, 214, 130, ${(0.40 * lampStrength).toFixed(3)})`);
    glow.addColorStop(0.5, `rgba(255, 194, 95, ${(0.14 * lampStrength).toFixed(3)})`);
    glow.addColorStop(1, 'rgba(255, 194, 95, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, viewW, viewH);
  }
}

export function drawScreenWeatherOverlay(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  rt: RoomTransform,
  activeBackground: RoomBackgroundId,
  fx: WeatherFxState
): void {
  const rainWeight = getWeatherWeight(fx, 'hujan');
  const nightWeight = getWeatherWeight(fx, 'malam');
  const sunWeight = getWeatherWeight(fx, 'cerah');
  const profile = HOUSE_PROFILES[activeBackground];

  // Subtle screen-level atmospheric overlay while playing
  if (rainWeight > 0.01) {
    ctx.save();
    // Cool rainy mood screen veil + subtle edge vignette
    const vig = ctx.createRadialGradient(
      viewW * 0.5,
      viewH * 0.5,
      Math.min(viewW, viewH) * 0.3,
      viewW * 0.5,
      viewH * 0.5,
      Math.max(viewW, viewH) * 0.72
    );
    vig.addColorStop(0, 'rgba(30, 58, 95, 0)');
    vig.addColorStop(1, `rgba(15, 29, 48, ${(0.24 * rainWeight).toFixed(3)})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, viewW, viewH);

    // Subtle lightning flash shimmer across screen
    if (fx.lightningFlash > 0.01) {
      ctx.fillStyle = `rgba(224, 242, 254, ${(0.18 * fx.lightningFlash * rainWeight).toFixed(3)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // Soft rain-mist glow drifting near the house's window side
    const winPt = roomToScreen(profile.sunOrigin.nx, 0.45, rt);
    const mistGrad = ctx.createRadialGradient(
      winPt.x,
      winPt.y,
      10,
      winPt.x,
      winPt.y,
      Math.max(viewW, viewH) * 0.42
    );
    mistGrad.addColorStop(0, `rgba(147, 197, 253, ${(0.12 * rainWeight).toFixed(3)})`);
    mistGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.restore();
  }

  if (nightWeight > 0.01) {
    ctx.save();
    const vig = ctx.createRadialGradient(
      viewW * 0.5,
      viewH * 0.48,
      Math.min(viewW, viewH) * 0.28,
      viewW * 0.5,
      viewH * 0.48,
      Math.max(viewW, viewH) * 0.75
    );
    vig.addColorStop(0, 'rgba(10, 18, 40, 0)');
    vig.addColorStop(1, `rgba(8, 14, 34, ${(0.34 * nightWeight).toFixed(3)})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.restore();
  }

  if (sunWeight > 0.01) {
    ctx.save();
    const sunPt = roomToScreen(profile.sunOrigin.nx, profile.sunOrigin.ny, rt);
    const sunGlow = ctx.createRadialGradient(
      sunPt.x,
      sunPt.y,
      12,
      sunPt.x,
      sunPt.y,
      Math.max(viewW, viewH) * 0.55
    );
    sunGlow.addColorStop(0, `rgba(255, 240, 175, ${(0.14 * sunWeight).toFixed(3)})`);
    sunGlow.addColorStop(0.55, `rgba(254, 215, 120, ${(0.05 * sunWeight).toFixed(3)})`);
    sunGlow.addColorStop(1, 'rgba(254, 215, 120, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.restore();
  }
}
