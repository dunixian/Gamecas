import { WorldId } from '../game/GameConfig';
import { BaseWorldScene } from './BaseWorldScene';

export class WildlifeScene extends BaseWorldScene {
  constructor() {
    super('WildlifeScene');
  }

  protected getWorldId(): WorldId {
    return 3;
  }

  protected buildLevelGeometry(): void {
    const H = this.worldDef.worldHeight; // 960

    // Gerbang Masuk Flora & Fauna CAS Water Park + Sponsor + Kelapa Jumbo
    this.addPlatform(0, H - 130, 620, 130);
    this.addCasZooGate(200, H - 130);
    this.addCasSponsorBoard(430, H - 130);
    this.addPalmTree(570, H - 130);
    this.collectibles.spawnCoinArc(280, H - 190, 5, 46, 'coin_gold');
    this.collectibles.spawn(520, H - 185, 'power_coconut');

    // Pos Satwa 1: Gajah & Rusa Tutul CAS + Kepiting + Tawon
    this.addPlatform(620, H - 130, 560, 130);
    this.addWildlifeHabitat(880, H - 130, 'animal_elephant', 'Gajah & Rusa Tutul');
    this.add.image(1020, H - 166, 'animal_deer').setDepth(9);
    this.addEnemy(730, H - 150, 'crab', 650, 860, 105);
    this.addEnemy(990, H - 280, 'wasp', 820, 1140, 100);
    this.collectibles.spawn(1040, H - 235, 'diamond', true); // Harta 1
    this.collectibles.spawnCoinArc(690, H - 195, 5, 45, 'coin_gold');

    // Jembatan Kayu & Sungai Taman Satwa
    this.addPlatform(1180, H - 40, 540, 40);
    this.addWaterPool(1180, H - 110, 540, 70, 20);
    this.addCollapsingPlatform(1240, H - 165, 130);
    this.addCollapsingPlatform(1430, H - 195, 130);
    this.addEnemy(1430, H - 265, 'puffer', 1240, 1620, 75);
    this.collectibles.spawnCoinArc(1280, H - 245, 5, 50, 'coin_gold');

    // Pos Satwa 2: Jerapah & Ayam Merak + Menara Tangga Satu-Arah + Pistol Air
    this.addPlatform(1720, H - 150, 620, 150);
    this.addWildlifeHabitat(1980, H - 150, 'animal_giraffe', 'Jerapah & Ayam Merak');
    this.add.image(2160, H - 182, 'animal_peacock').setDepth(9);
    this.addEnemy(2190, H - 178, 'monkey', 2080, 2290, 70);
    this.addLadder(1780, H - 360, H - 150, 0x22c55e);
    this.addPlatform(1740, H - 360, 230, 26, undefined, undefined, true);
    this.collectibles.spawn(1820, H - 405, 'power_blaster');
    this.collectibles.spawn(1910, H - 405, 'ticket_mystery', true); // Harta 2
    this.collectibles.spawn(2220, H - 205, 'boost_speed');

    // Checkpoint: Pos Alam Satwa Cikole
    this.addPlatform(2340, H - 150, 420, 150);
    this.addCheckpoint(2420, H - 150, 'Pos Alam Satwa');
    this.addTreasureChest(2600, H - 170); // Harta 3
    this.addCasGazebo(2690, H - 150);

    // Gua Rimba, Monyet Pelempar Kelapa & Gerbang Waktu
    this.addPlatform(2760, H - 150, 860, 150);
    this.addEnemy(2980, H - 178, 'monkey', 2840, 3160, 75);
    this.addEnemy(3180, H - 170, 'crab', 3020, 3360, 120);
    this.addTimedGate(3480, H - 205, 3320, H - 156);
    this.addPlatform(3040, H - 300, 200, 26, undefined, undefined, true);
    this.collectibles.spawn(3140, H - 345, 'diamond', true); // Harta 4
    this.collectibles.spawnCoinArc(2920, H - 340, 6, 48, 'coin_gold');

    // Pos Satwa 3: Zebra & Rusa Timorensis
    this.addMovingPlatform(3760, H - 210, 140, 24, 90, 0, 1.7);
    this.addPlatform(3980, H - 150, 640, 150);
    this.addCasSponsorBoard(4070, H - 150);
    this.addWildlifeHabitat(4240, H - 150, 'animal_zebra', 'Zebra Cikole');
    this.addSpinner(4440, H - 240);
    this.addEnemy(4440, H - 310, 'wasp', 4280, 4590, 105);
    this.addPlatform(4400, H - 340, 190, 26, undefined, undefined, true);
    this.collectibles.spawn(4495, H - 385, 'ticket_normal', true); // Harta 5
    this.addTreasureChest(4120, H - 170); // Harta Bonus 6

    // Gerbang Keluar Taman Flora & Fauna + Mini-Boss Penjaga
    this.addPlatform(4620, H - 150, 480, 150);
    this.addEnemy(4740, H - 190, 'octo_bot', 4640, 4880, 95);
    this.collectibles.spawnCoinArc(4660, H - 215, 5, 45, 'coin_gold');
    this.addPalmTree(4980, H - 150);
    this.addExitGate(4920, H - 150);
  }
}
