import Phaser from 'phaser';
import { AudioManager } from './AudioManager';
import { PlayerController } from './Player';

export type CollectibleKind =
  | 'coin_bronze'
  | 'coin_silver'
  | 'coin_gold'
  | 'ticket_normal'
  | 'ticket_vip'
  | 'ticket_golden'
  | 'ticket_mystery'
  | 'diamond'
  | 'key_gold'
  | 'boost_energy'
  | 'boost_speed'
  | 'extra_life'
  | 'magnet'
  | 'shield'
  | 'power_coconut'
  | 'power_blaster';

export interface CollectibleOutcome {
  coinsAdded: number;
  ticketsAdded: number;
  goldenTicketsAdded: number;
  diamondsAdded: number;
  keysAdded: number;
  treasuresAdded: number;
  scoreAdded: number;
  toast?: string;
}

export class CollectibleSystem {
  public group: Phaser.Physics.Arcade.Group;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ allowGravity: false, immovable: true });
  }

  public spawn(x: number, y: number, kind: CollectibleKind, isTreasureItem = false): Phaser.Physics.Arcade.Image {
    const item = this.group.create(x, y, kind) as Phaser.Physics.Arcade.Image;
    item.setDepth(15);
    item.setData('kind', kind);
    item.setData('isTreasureItem', isTreasureItem);

    this.scene.tweens.add({
      targets: item,
      y: y - 7,
      duration: Phaser.Math.Between(850, 1250),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return item;
  }

  public spawnCoinArc(startX: number, y: number, count: number, spacing = 42, kind: CollectibleKind = 'coin_gold'): void {
    for (let i = 0; i < count; i++) {
      const arcOffset = Math.sin((i / Math.max(1, count - 1)) * Math.PI) * 32;
      this.spawn(startX + i * spacing, y - arcOffset, kind);
    }
  }

  public updateMagnet(player: PlayerController, dt: number): void {
    if (player.magnetTimer <= 0) return;
    const px = player.sprite.x;
    const py = player.sprite.y;
    for (const child of this.group.getChildren()) {
      const item = child as Phaser.Physics.Arcade.Image;
      if (!item.active) continue;
      const kind = item.getData('kind') as CollectibleKind;
      if (!kind.startsWith('coin_') && kind !== 'diamond') continue;
      const dist = Phaser.Math.Distance.Between(px, py, item.x, item.y);
      if (dist < 245 && dist > 6) {
        const angle = Phaser.Math.Angle.Between(item.x, item.y, px, py);
        item.x += Math.cos(angle) * 380 * dt;
        item.y += Math.sin(angle) * 380 * dt;
      }
    }
  }

  public collect(item: Phaser.Physics.Arcade.Image, player: PlayerController): CollectibleOutcome {
    const kind = item.getData('kind') as CollectibleKind;
    const isTreasure = Boolean(item.getData('isTreasureItem'));
    const ix = item.x;
    const iy = item.y;
    item.destroy();

    player.triggerCollectPose();
    this.spawnPickupFeedback(ix, iy, kind);

    const out: CollectibleOutcome = {
      coinsAdded: 0,
      ticketsAdded: 0,
      goldenTicketsAdded: 0,
      diamondsAdded: 0,
      keysAdded: 0,
      treasuresAdded: isTreasure ? 1 : 0,
      scoreAdded: 0,
    };

    switch (kind) {
      case 'coin_bronze':
        out.coinsAdded = 1;
        out.scoreAdded = 10;
        this.spawnFloatingText(ix, iy, '+1', '#FDE68A');
        AudioManager.playSfx('SFX_006');
        break;
      case 'coin_silver':
        out.coinsAdded = 3;
        out.scoreAdded = 30;
        this.spawnFloatingText(ix, iy, '+3', '#F8FAFC');
        AudioManager.playSfx('SFX_006');
        break;
      case 'coin_gold':
        out.coinsAdded = 5;
        out.scoreAdded = 50;
        this.spawnFloatingText(ix, iy, '+5', '#FACC15');
        AudioManager.playSfx('SFX_006');
        break;
      case 'ticket_normal':
        out.ticketsAdded = 1;
        out.scoreAdded = 150;
        out.toast = 'Tiket Masuk Ditemukan!';
        this.spawnFloatingText(ix, iy, 'TIKET!', '#38BDF8');
        AudioManager.playSfx('SFX_007');
        break;
      case 'ticket_vip':
        out.ticketsAdded = 1;
        out.coinsAdded = 10;
        out.scoreAdded = 220;
        out.toast = 'Tiket VIP Ditemukan! (+10 Koin)';
        this.spawnFloatingText(ix, iy, 'VIP +10', '#E879F9');
        AudioManager.playSfx('SFX_007');
        break;
      case 'ticket_golden':
        out.ticketsAdded = 1;
        out.goldenTicketsAdded = 1;
        out.coinsAdded = 20;
        out.scoreAdded = 350;
        out.toast = 'Tiket Emas Diklaim! (+20 Koin)';
        this.spawnFloatingText(ix, iy, 'EMAS +20', '#FACC15');
        AudioManager.playSfx('SFX_008');
        break;
      case 'ticket_mystery':
        out.ticketsAdded = 1;
        out.coinsAdded = 15;
        out.scoreAdded = 260;
        out.toast = 'Tiket Misteri Ditemukan! (+15 Koin)';
        this.spawnFloatingText(ix, iy, 'MISTERI!', '#F472B6');
        AudioManager.playSfx('SFX_008');
        break;
      case 'diamond':
        out.diamondsAdded = 1;
        out.coinsAdded = 15;
        out.treasuresAdded = 1;
        out.scoreAdded = 250;
        out.toast = 'Berlian Berkilau! (+15 Koin)';
        this.spawnFloatingText(ix, iy, 'BERLIAN +15', '#22D3EE');
        AudioManager.playSfx('SFX_009');
        break;
      case 'key_gold':
        out.keysAdded = 1;
        out.scoreAdded = 100;
        out.toast = 'Kunci Emas Diambil!';
        AudioManager.playSfx('SFX_007');
        break;
      case 'boost_energy':
        player.health = Math.min(player.maxHealth, player.health + 1);
        out.scoreAdded = 80;
        out.toast = 'Energi Pulih (+1 Hati)';
        this.spawnFloatingText(ix, iy, '+1 HATI', '#34D399');
        AudioManager.playSfx('SFX_007');
        break;
      case 'boost_speed':
        player.speedTimer = 10;
        out.scoreAdded = 80;
        out.toast = 'Lari Cepat Hidro Aktif!';
        this.spawnFloatingText(ix, iy, 'CEPAT!', '#FB923C');
        AudioManager.playSfx('SFX_012');
        break;
      case 'extra_life':
        player.maxHealth = Math.min(5, player.maxHealth + 1);
        player.health = player.maxHealth;
        out.scoreAdded = 180;
        out.toast = 'Kapasitas Hati Bertambah!';
        this.spawnFloatingText(ix, iy, '+1 MAX', '#F87171');
        AudioManager.playSfx('SFX_008');
        break;
      case 'magnet':
        player.magnetTimer = 15;
        out.scoreAdded = 80;
        out.toast = 'Magnet Koin Aktif!';
        this.spawnFloatingText(ix, iy, 'MAGNET!', '#818CF8');
        AudioManager.playSfx('SFX_024');
        break;
      case 'shield':
        player.hasShield = true;
        out.scoreAdded = 100;
        out.toast = 'Perisai Gelembung Siap!';
        this.spawnFloatingText(ix, iy, 'PERISAI!', '#22D3EE');
        AudioManager.playSfx('SFX_015');
        break;
      case 'power_coconut': {
        const res = player.upgradePowerTier(2);
        out.coinsAdded = res.bonusCoins;
        out.scoreAdded = res.upgraded ? 200 : 120;
        out.toast = res.upgraded
          ? 'Kelapa Jumbo CAS! Karakter Membesar & Tahan 1 Benturan!'
          : 'Bonus Kelapa Jumbo! (+15 Koin)';
        this.spawnFloatingText(ix, iy, res.upgraded ? 'MODE JUMBO!' : '+15 KOIN', '#4ADE80');
        AudioManager.playSfx('SFX_008');
        break;
      }
      case 'power_blaster': {
        const res = player.upgradePowerTier(3);
        out.coinsAdded = res.bonusCoins;
        out.scoreAdded = res.upgraded ? 300 : 160;
        out.toast = res.upgraded
          ? 'Pistol Air CAS Aktif! Tekan F / Klik untuk Tembak!'
          : 'Isi Ulang Pistol Air! (+20 Koin)';
        this.spawnFloatingText(ix, iy, res.upgraded ? 'PISTOL AIR!' : '+20 KOIN', '#38BDF8');
        AudioManager.playSfx('SFX_016');
        break;
      }
    }

    return out;
  }

  private spawnFloatingText(x: number, y: number, label: string, color: string): void {
    const txt = this.scene.add
      .text(x, y - 10, label, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color,
        stroke: '#0F172A',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(32);

    this.scene.tweens.add({
      targets: txt,
      y: y - 48,
      alpha: 0,
      duration: 620,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  private spawnPickupFeedback(x: number, y: number, kind: CollectibleKind): void {
    const tex =
      kind.startsWith('ticket') || kind === 'diamond' || kind.startsWith('power_')
        ? 'particle_sparkle'
        : 'particle_bubble';
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.image(x, y, tex).setDepth(30);
      const ang = (i / 8) * Math.PI * 2;
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * 34,
        y: y + Math.sin(ang) * 34 - 10,
        alpha: 0,
        scale: 0.2,
        duration: 320,
        onComplete: () => p.destroy(),
      });
    }
  }
}
