import { WorldId } from '../game/GameConfig';
import { BaseWorldScene } from './BaseWorldScene';

export class PoolScene extends BaseWorldScene {
  constructor() {
    super('PoolScene');
  }

  protected getWorldId(): WorldId {
    return 1;
  }

  protected buildLevelGeometry(): void {
    const H = this.worldDef.worldHeight; // 900

    // Gerbang Awal, Sponsor CAS & Power-Up Kelapa Jumbo
    this.addPlatform(0, H - 120, 680, 120);
    this.addCasZooGate(175, H - 120);
    this.addCasSponsorBoard(475, H - 120);
    this.addPalmTree(615, H - 120);
    this.collectibles.spawnCoinArc(260, H - 180, 5, 45, 'coin_silver');
    this.collectibles.spawn(520, H - 170, 'power_coconut');

    // Kolam Anak + Ikan Buntal + Dek Satu-Arah
    this.addPlatform(680, H - 60, 480, 60);
    this.addWaterPool(680, H - 120, 480, 60);
    this.addInflatableRing(860, H - 125);
    this.addEnemy(920, H - 190, 'puffer', 740, 1080, 65);
    this.collectibles.spawnCoinArc(760, H - 170, 4, 48, 'coin_gold');
    this.addPlatform(820, H - 250, 150, 24, undefined, undefined, true);
    this.collectibles.spawn(895, H - 295, 'ticket_normal'); // Tiket 1

    // Dek Lifeguard + Kepiting + Tawon + Papan Loncat
    this.addPlatform(1160, H - 140, 560, 140);
    this.addWetFloor(1250, H - 140, 160);
    this.addEnemy(1350, H - 160, 'crab', 1220, 1490, 95);
    this.addEnemy(1560, H - 160, 'crab', 1460, 1650, 105);
    this.addEnemy(1460, H - 290, 'wasp', 1290, 1660, 95);
    this.addDivingBoard(1670, H - 170);
    this.collectibles.spawnCoinArc(1520, H - 250, 4, 42, 'coin_gold');

    // Gazebo Atas + Power-Up Pistol Air CAS
    this.addPlatform(1780, H - 310, 260, 26, undefined, undefined, true);
    this.addPlatform(2110, H - 360, 240, 26, undefined, undefined, true);
    this.collectibles.spawn(1900, H - 355, 'power_blaster');
    this.collectibles.spawn(2230, H - 405, 'ticket_normal'); // Tiket 2

    // Kolam Utama & Lorong Bawah Air
    this.addPlatform(1720, H - 40, 1080, 40);
    this.addWaterPool(1720, H - 180, 1080, 140, 25);
    this.addInflatableRing(1960, H - 185);
    this.addInflatableRing(2360, H - 185);
    this.addLadder(1755, H - 185, H - 45);
    this.addEnemy(2040, H - 240, 'puffer', 1840, 2240, 75);
    this.addEnemy(2480, H - 245, 'puffer', 2280, 2700, 80);
    this.collectibles.spawnCoinArc(1880, H - 90, 6, 52, 'coin_gold');
    this.collectibles.spawn(2220, H - 85, 'diamond', true);
    this.collectibles.spawnCoinArc(2420, H - 90, 5, 50, 'coin_silver');

    // Checkpoint 1: Dek Gazebo CAS
    this.addPlatform(2800, H - 160, 460, 160);
    this.addCheckpoint(2880, H - 160, 'Gazebo Kolam Utama');
    this.addCasGazebo(3110, H - 160);
    this.addTreasureChest(3020, H - 180);
    this.collectibles.spawn(2950, H - 210, 'shield');

    // Menara Tangga Satu-Arah + Seluncuran Mini + Platform Bergerak
    this.addLadder(3210, H - 340, H - 160);
    this.addPlatform(3170, H - 340, 210, 26, undefined, undefined, true);
    this.addWaterSlide(3360, H - 320, 220, 42, false);
    this.addMovingPlatform(3650, H - 220, 140, 24, 95, 0, 1.5);
    this.collectibles.spawnCoinArc(3380, H - 360, 4, 46, 'coin_gold');
    this.collectibles.spawn(3250, H - 385, 'power_blaster');

    // Platform Tiket Tersembunyi + Mini-Boss Penjaga Kolam
    this.addPlatform(3840, H - 290, 220, 26, undefined, undefined, true);
    this.collectibles.spawn(3950, H - 340, 'ticket_normal'); // Tiket 3
    this.addPlatform(3560, H - 130, 840, 130);
    this.addCasSponsorBoard(3720, H - 130);
    this.addSplashTrap(3760, H - 130, 3.0);
    this.addEnemy(3960, H - 150, 'crab', 3820, 4080, 110);
    this.addEnemy(4120, H - 170, 'octo_bot', 3980, 4220, 80);
    this.collectibles.spawnCoinArc(3880, H - 190, 4, 46, 'coin_gold');

    // Gerbang Keluar Kolam
    this.addPalmTree(4290, H - 130);
    this.addExitGate(4240, H - 130);
  }
}
