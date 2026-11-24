import { WorldId } from '../game/GameConfig';
import { BaseWorldScene } from './BaseWorldScene';

export class WaterparkScene extends BaseWorldScene {
  constructor() {
    super('WaterparkScene');
  }

  protected getWorldId(): WorldId {
    return 2;
  }

  protected buildLevelGeometry(): void {
    const H = this.worldDef.worldHeight; // 960

    // Plaza Water Park CAS + Sponsor + Kelapa Jumbo
    this.addPlatform(0, H - 120, 580, 120);
    this.addCasGazebo(200, H - 120);
    this.addCasSponsorBoard(410, H - 120);
    this.addPalmTree(540, H - 120);
    this.collectibles.spawnCoinArc(220, H - 180, 5, 45, 'coin_gold');
    this.collectibles.spawn(490, H - 180, 'power_coconut');

    // Kolam Arus & Gurita Merah Raksasa Ikonik CAS Water Park
    this.addPlatform(580, H - 40, 760, 40);
    this.addWaterPool(580, H - 150, 760, 110, 65);
    this.addCasOctopus(960, H - 148);
    this.addInflatableRing(760, H - 155);
    this.addInflatableRing(1120, H - 155);
    this.addEnemy(830, H - 220, 'puffer', 660, 1020, 72);
    this.addEnemy(1180, H - 225, 'puffer', 1020, 1290, 78);
    this.collectibles.spawnCoinArc(700, H - 220, 6, 48, 'coin_gold');
    this.addPlatform(880, H - 295, 190, 24, undefined, undefined, true);
    this.collectibles.spawn(975, H - 340, 'ticket_vip'); // Tiket VIP 1

    // Menara Seluncuran Spiral Kuning-Hijau + Tangga Satu-Arah + Pistol Air
    this.addPlatform(1340, H - 150, 440, 150);
    this.addEnemy(1560, H - 170, 'crab', 1380, 1730, 115);
    this.addLadder(1410, H - 410, H - 150);
    this.addPlatform(1370, H - 410, 230, 26, undefined, undefined, true);
    this.collectibles.spawn(1445, H - 455, 'power_blaster');
    this.collectibles.spawn(1530, H - 455, 'ticket_vip'); // Tiket VIP 2
    this.addWaterSlide(1590, H - 380, 280, 46, true);
    this.collectibles.spawnCoinArc(1620, H - 425, 5, 48, 'coin_gold');

    // Kolam Ombak & Menara Ember Tumpah Koboi CAS
    this.addPlatform(1780, H - 50, 920, 50);
    this.addWaterPool(1780, H - 165, 920, 115, -55);
    this.addMovingPlatform(1960, H - 245, 140, 24, 100, 0, 1.8);
    this.addTippingBucket(2240, H - 360, 3.8);
    this.addPlatform(2180, H - 210, 160, 24, undefined, undefined, true);
    this.addMovingPlatform(2480, H - 275, 140, 24, 0, 70, 1.7);
    this.addEnemy(2060, H - 330, 'wasp', 1860, 2350, 105);
    this.collectibles.spawn(2260, H - 255, 'ticket_vip'); // Tiket VIP 3
    this.collectibles.spawnCoinArc(1920, H - 110, 5, 52, 'coin_silver');
    this.collectibles.spawn(2540, H - 340, 'boost_energy');

    // Menara Checkpoint Water Park
    this.addPlatform(2700, H - 180, 420, 180);
    this.addCheckpoint(2780, H - 180, 'Menara Ember Koboi');
    this.addTreasureChest(2960, H - 200);
    this.collectibles.spawn(2880, H - 230, 'power_blaster');
    this.addPalmTree(3060, H - 180);

    // Jalur Atas & Jebakan Cipratan
    this.addPlatform(3180, H - 250, 240, 26, undefined, undefined, true);
    this.addSplashTrap(3300, H - 250, 2.9);
    this.collectibles.spawnCoinArc(3200, H - 310, 4, 48, 'coin_gold');

    this.addMovingPlatform(3560, H - 290, 130, 24, 90, 0, 1.9);
    this.addPlatform(3760, H - 360, 240, 26, undefined, undefined, true);
    this.addSpinner(3880, H - 410);
    this.addEnemy(3880, H - 430, 'wasp', 3680, 4050, 110);
    this.collectibles.spawn(3880, H - 475, 'ticket_vip'); // Tiket VIP 4

    // Dek Seluncuran Akhir + Mini-Boss Gurita Waterpark
    this.addPlatform(3120, H - 110, 1680, 110);
    this.addCasSponsorBoard(3260, H - 110);
    this.addWetFloor(3350, H - 110, 200);
    this.addEnemy(3660, H - 130, 'crab', 3520, 3840, 115);
    this.addEnemy(3920, H - 130, 'monkey', 3820, 4020, 65);
    this.addWaterSlide(4020, H - 270, 240, 42, true);
    this.collectibles.spawnCoinArc(4060, H - 315, 5, 44, 'coin_gold');
    this.addDivingBoard(4340, H - 140);
    this.addPlatform(4440, H - 300, 180, 26, undefined, undefined, true);
    this.collectibles.spawn(4530, H - 345, 'ticket_vip'); // Tiket VIP 5
    this.addEnemy(4480, H - 150, 'octo_bot', 4360, 4610, 95);

    // Gerbang Keluar Water Park
    this.addPalmTree(4720, H - 110);
    this.addExitGate(4660, H - 110);
  }
}
