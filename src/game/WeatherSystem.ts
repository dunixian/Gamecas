import Phaser from 'phaser';
import { AudioManager } from './AudioManager';

export type WeatherType = 'sunny' | 'drizzle' | 'breeze';

export interface WeatherInfo {
  type: WeatherType;
  label: string;
  effectLabel: string;
  speedMultiplier: number;
  windForceX: number;
}

export const WEATHER_DEFINITIONS: Record<WeatherType, WeatherInfo> = {
  sunny: {
    type: 'sunny',
    label: 'Cerah Tropis',
    effectLabel: '+5% Gerak',
    speedMultiplier: 1.05,
    windForceX: 0,
  },
  drizzle: {
    type: 'drizzle',
    label: 'Gerimis Ringan',
    effectLabel: '-6% Gerak',
    speedMultiplier: 0.94,
    windForceX: 0,
  },
  breeze: {
    type: 'breeze',
    label: 'Angin Tropis',
    effectLabel: '+8% Gerak',
    speedMultiplier: 1.08,
    windForceX: 16,
  },
};

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface LeafParticle {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  rotSpeed: number;
  swayPhase: number;
}

interface WindStreak {
  x: number;
  y: number;
  w: number;
  speed: number;
  alpha: number;
}

export class WeatherSystem {
  private scene: Phaser.Scene;
  private current: WeatherType;
  private cycleTimer: number;
  private readonly cycleDurationSec = 24;

  // Lapisan visual screen-space
  private tintOverlay: Phaser.GameObjects.Rectangle;
  private sunOrb: Phaser.GameObjects.Arc;
  private sunRays: Phaser.GameObjects.Graphics;
  private weatherGfx: Phaser.GameObjects.Graphics;

  private sunIntensity = 0;
  private drizzleIntensity = 0;
  private breezeIntensity = 0;

  private rainDrops: RainDrop[] = [];
  private windStreaks: WindStreak[] = [];
  private leaves: LeafParticle[] = [];
  private onWeatherChange?: (info: WeatherInfo) => void;

  constructor(
    scene: Phaser.Scene,
    initialWeather: WeatherType = 'sunny',
    onWeatherChange?: (info: WeatherInfo) => void
  ) {
    this.scene = scene;
    this.current = initialWeather;
    this.cycleTimer = this.cycleDurationSec;
    this.onWeatherChange = onWeatherChange;

    this.sunIntensity = initialWeather === 'sunny' ? 1 : 0;
    this.drizzleIntensity = initialWeather === 'drizzle' ? 1 : 0;
    this.breezeIntensity = initialWeather === 'breeze' ? 1 : 0;

    const { width, height } = scene.scale;

    this.tintOverlay = scene.add
      .rectangle(0, 0, width * 2, height * 2, 0x0f172a, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(27);

    this.sunRays = scene.add.graphics().setScrollFactor(0).setDepth(-3);
    this.sunOrb = scene.add
      .circle(width - 110, 86, 42, 0xfef08a, 0.85)
      .setScrollFactor(0)
      .setDepth(-3)
      .setAlpha(this.sunIntensity);

    this.weatherGfx = scene.add.graphics().setScrollFactor(0).setDepth(28);

    // Inisialisasi tetes gerimis
    for (let i = 0; i < 65; i++) {
      this.rainDrops.push({
        x: Math.random() * 1600,
        y: Math.random() * 900,
        len: Phaser.Math.Between(12, 22),
        speed: Phaser.Math.Between(480, 680),
      });
    }

    // Inisialisasi hembusan garis angin tropis
    for (let i = 0; i < 14; i++) {
      this.windStreaks.push({
        x: Math.random() * 1600,
        y: Math.random() * 720,
        w: Phaser.Math.Between(55, 130),
        speed: Phaser.Math.Between(360, 560),
        alpha: Phaser.Math.FloatBetween(0.18, 0.42),
      });
    }

    // Inisialisasi daun tropis beterbangan
    const leafTex = scene.textures.exists('particle_leaf') ? 'particle_leaf' : 'particle_sparkle';
    for (let i = 0; i < 12; i++) {
      const sprite = scene.add
        .image(Math.random() * 1400, Math.random() * 720, leafTex)
        .setScrollFactor(0)
        .setDepth(28)
        .setScale(Phaser.Math.FloatBetween(0.75, 1.35))
        .setAlpha(this.breezeIntensity);
      this.leaves.push({
        sprite,
        vx: Phaser.Math.Between(160, 290),
        vy: Phaser.Math.Between(28, 70),
        rotSpeed: Phaser.Math.FloatBetween(-3.5, 3.5),
        swayPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  public getCurrentInfo(): WeatherInfo {
    return WEATHER_DEFINITIONS[this.current];
  }

  public getCloudSpeedMultiplier(): number {
    if (this.current === 'breeze') return 3.4;
    if (this.current === 'drizzle') return 1.6;
    return 1.0;
  }

  public setWeather(next: WeatherType, silent = false): void {
    if (this.current === next) return;
    this.current = next;
    this.cycleTimer = this.cycleDurationSec;
    if (!silent) {
      AudioManager.playSfx('SFX_015');
      this.onWeatherChange?.(WEATHER_DEFINITIONS[next]);
    }
  }

  public update(dt: number, elapsedSec: number): void {
    this.cycleTimer -= dt;
    if (this.cycleTimer <= 0) {
      const order: WeatherType[] = ['sunny', 'breeze', 'drizzle'];
      const candidates = order.filter((w) => w !== this.current);
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      this.setWeather(next, false);
    }

    // Transisi halus intensitas tiap cuaca
    const fadeSpeed = dt * 0.85;
    this.sunIntensity = Phaser.Math.Linear(this.sunIntensity, this.current === 'sunny' ? 1 : 0, fadeSpeed);
    this.drizzleIntensity = Phaser.Math.Linear(this.drizzleIntensity, this.current === 'drizzle' ? 1 : 0, fadeSpeed);
    this.breezeIntensity = Phaser.Math.Linear(this.breezeIntensity, this.current === 'breeze' ? 1 : 0, fadeSpeed);

    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    // Update overlay warna atmosfer
    if (this.drizzleIntensity > 0.04) {
      this.tintOverlay.setFillStyle(0x0f172a, 0.19 * this.drizzleIntensity);
    } else if (this.breezeIntensity > 0.04) {
      this.tintOverlay.setFillStyle(0x06b6d4, 0.06 * this.breezeIntensity);
    } else {
      this.tintOverlay.setFillStyle(0xfef08a, 0.05 * this.sunIntensity);
    }

    // Matahari & berkas sinar cerah
    this.sunOrb.setPosition(w - 108, 86);
    this.sunOrb.setAlpha(this.sunIntensity * (0.8 + Math.sin(elapsedSec * 2) * 0.1));
    this.sunOrb.setScale(0.95 + Math.sin(elapsedSec * 1.6) * 0.06);

    this.sunRays.clear();
    if (this.sunIntensity > 0.03) {
      this.sunRays.fillStyle(0xfef08a, 0.1 * this.sunIntensity);
      for (let i = 0; i < 3; i++) {
        const spread = 80 + i * 110 + Math.sin(elapsedSec * 0.9 + i) * 20;
        this.sunRays.fillTriangle(w - 95, 76, w - 260 - spread, h, w - 120 - spread, h);
      }
    }

    this.weatherGfx.clear();

    // Efek Gerimis Ringan
    if (this.drizzleIntensity > 0.03) {
      this.weatherGfx.lineStyle(1.8, 0xbae6fd, 0.55 * this.drizzleIntensity);
      for (const drop of this.rainDrops) {
        drop.x -= drop.speed * 0.22 * dt;
        drop.y += drop.speed * dt;
        if (drop.y > h + 20) {
          drop.y = -20;
          drop.x = Math.random() * (w + 260);
        }
        if (drop.x < -40) {
          drop.x = w + 40;
        }
        this.weatherGfx.lineBetween(drop.x, drop.y, drop.x - drop.len * 0.24, drop.y + drop.len);
      }
    }

    // Efek Angin Tropis & Daun Beterbangan
    if (this.breezeIntensity > 0.03) {
      for (const st of this.windStreaks) {
        st.x += st.speed * dt;
        if (st.x > w + 120) {
          st.x = -st.w - 40;
          st.y = Math.random() * (h * 0.88);
        }
        this.weatherGfx.lineStyle(2, 0xe0f2fe, st.alpha * this.breezeIntensity);
        this.weatherGfx.lineBetween(st.x, st.y, st.x + st.w, st.y - 4);
      }
    }

    for (const leaf of this.leaves) {
      leaf.sprite.setAlpha(this.breezeIntensity * 0.9);
      if (this.breezeIntensity <= 0.03) continue;
      leaf.swayPhase += dt * 3.8;
      leaf.sprite.x += leaf.vx * dt;
      leaf.sprite.y += (leaf.vy + Math.sin(leaf.swayPhase) * 32) * dt;
      leaf.sprite.rotation += leaf.rotSpeed * dt;

      if (leaf.sprite.x > w + 30) {
        leaf.sprite.x = -30;
        leaf.sprite.y = Math.random() * (h * 0.85);
      }
      if (leaf.sprite.y > h + 20) {
        leaf.sprite.y = -20;
      }
    }
  }
}
