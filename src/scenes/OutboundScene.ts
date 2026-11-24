import { WorldId } from '../game/GameConfig';
import { BaseWorldScene } from './BaseWorldScene';

export class OutboundScene extends BaseWorldScene {
  constructor() {
    super('OutboundScene');
  }

  protected getWorldId(): WorldId {
    return 4;
  }

  protected buildLevelGeometry(): void {
    const H = this.worldDef.worldHeight; // 1040

    // Basecamp Outbound Cikole + Sponsor + Kelapa Jumbo
    this.addPlatform(0, H - 140, 560, 140);
    this.addCasGazebo(180, H - 140);
    this.addCasSponsorBoard(380, H - 140);
    this.addPalmTree(520, H - 140);
    this.collectibles.spawnCoinArc(220, H - 200, 6, 46, 'coin_gold');
    this.collectibles.spawn(480, H - 195, 'power_coconut');

    // Menara Dinding Panjat (Tangga Satu-Arah) + Tiket Emas 1 + Pistol Air
    this.addPlatform(560, H - 140, 420, 140);
    this.addEnemy(770, H - 160, 'crab', 620, 930, 120);
    this.addLadder(650, H - 440, H - 140, 0xf97316);
    this.addPlatform(600, H - 440, 260, 26, undefined, undefined, true);
    this.collectibles.spawn(690, H - 485, 'power_blaster');
    this.collectibles.spawn(780, H - 485, 'ticket_golden'); // Tiket Emas 1
    this.collectibles.spawnCoinArc(660, H - 260, 4, 48, 'coin_gold');

    // Flying Fox 1 melintasi Jurang Pandeglang
    this.addPlatform(880, H - 380, 160, 26, undefined, undefined, true);
    this.addZipline(980, H - 455, 1660, H - 365);
    this.addEnemy(1320, H - 460, 'wasp', 1120, 1520, 105);
    this.collectibles.spawnCoinArc(1140, H - 420, 7, 65, 'coin_gold');

    // Balok Keseimbangan & Jembatan Gantung
    this.addPlatform(1620, H - 270, 260, 30);
    this.addEnemy(1760, H - 298, 'monkey', 1650, 1850, 70);
    this.addCollapsingPlatform(1940, H - 270, 130);
    this.addCollapsingPlatform(2140, H - 300, 130);
    this.addPlatform(2330, H - 320, 320, 30);
    this.addSpinner(2490, H - 390);
    this.addEnemy(2480, H - 430, 'wasp', 2340, 2620, 110);
    this.collectibles.spawn(2490, H - 460, 'ticket_golden'); // Tiket Emas 2
    this.collectibles.spawn(2400, H - 370, 'magnet');

    // Checkpoint: Menara Kanopi Cikole
    this.addPlatform(2680, H - 220, 440, 220);
    this.addCheckpoint(2760, H - 220, 'Menara Kanopi Cikole');
    this.addTreasureChest(2940, H - 240);
    this.collectibles.spawn(3040, H - 275, 'extra_life');

    // Ayunan Tali Rimba
    this.addSwingingRope(3320, H - 470, 175);
    this.collectibles.spawnCoinArc(3240, H - 290, 5, 48, 'coin_gold');
    this.addPlatform(3500, H - 250, 260, 30);
    this.addEnemy(3630, H - 270, 'crab', 3520, 3730, 115);
    this.addMovingPlatform(3880, H - 280, 140, 24, 110, 0, 2.0);

    // Tangga Tali Satu-Arah & Gerbang Waktu
    this.addPlatform(4060, H - 220, 520, 220);
    this.addEnemy(4250, H - 248, 'monkey', 4110, 4390, 80);
    this.addTimedGate(4480, H - 275, 4340, H - 226);
    this.addLadder(4140, H - 480, H - 220, 0xfacc15);
    this.addPlatform(4100, H - 480, 270, 26, undefined, undefined, true);
    this.collectibles.spawn(4240, H - 525, 'ticket_golden'); // Tiket Emas 3
    this.collectibles.spawn(4330, H - 525, 'power_blaster');
    this.collectibles.spawnCoinArc(4150, H - 340, 5, 46, 'coin_gold');

    // Flying Fox Terakhir Menuju Puncak
    this.addZipline(4480, H - 430, 5020, H - 350);
    this.collectibles.spawnCoinArc(4600, H - 410, 6, 60, 'coin_gold');

    // Puncak Grand Finale CAS Water Park + Mini-Boss Penjaga Puncak
    this.addPlatform(4980, H - 240, 520, 240);
    this.addCasSponsorBoard(5070, H - 240);
    this.addTreasureChest(5140, H - 260);
    this.addEnemy(5240, H - 280, 'octo_bot', 5060, 5350, 105);
    this.collectibles.spawn(5220, H - 330, 'ticket_golden'); // Tiket Emas 4
    this.collectibles.spawn(5280, H - 330, 'diamond', true);
    this.addPalmTree(5450, H - 240);
    this.addExitGate(5390, H - 240);
  }
}
