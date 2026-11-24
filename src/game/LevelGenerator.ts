import { CollectibleKind } from './CollectibleSystem';
import { DifficultyId, WorldId } from './GameConfig';

export type EnemyKind = 'crab' | 'puffer' | 'wasp' | 'monkey' | 'octo_bot';

export interface GeneratedPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
  oneWay?: boolean;
}

export interface GeneratedMovingPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  speed: number;
}

export interface GeneratedEnemy {
  x: number;
  y: number;
  type: EnemyKind;
  minX: number;
  maxX: number;
  speed?: number;
}

export interface GeneratedCollectible {
  x: number;
  y: number;
  kind: CollectibleKind;
  isTreasure?: boolean;
}

export interface GeneratedLevel {
  worldWidth: number;
  worldHeight: number;
  platforms: GeneratedPlatform[];
  movingPlatforms: GeneratedMovingPlatform[];
  collapsingPlatforms: Array<{ x: number; y: number; w: number }>;
  waterPools: Array<{ x: number; y: number; w: number; h: number; currentX: number }>;
  ladders: Array<{ x: number; topY: number; bottomY: number }>;
  slides: Array<{ x: number; y: number; w: number; h: number; isChallenge: boolean }>;
  ziplines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  bounceRings: Array<{ x: number; y: number; kind: 'ring' | 'board' }>;
  splashTraps: Array<{ x: number; y: number; cycleSec: number }>;
  tippingBuckets: Array<{ x: number; y: number; cycleSec: number }>;
  chests: Array<{ x: number; y: number }>;
  habitats: Array<{ x: number; y: number; animalKey: string; name: string }>;
  collectibles: GeneratedCollectible[];
  enemies: GeneratedEnemy[];
  checkpoints: Array<{ x: number; y: number; label: string }>;
  landmarks: Array<{ x: number; y: number; kind: 'palm' | 'gazebo' | 'octopus' | 'zoo_gate' | 'sponsor' }>;
  exitX: number;
  exitY: number;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateProceduralLevel(params: {
  themeWorldId: WorldId;
  difficulty: DifficultyId;
  stage: number;
  seed: number;
}): GeneratedLevel {
  const { themeWorldId, difficulty, stage, seed } = params;
  const rng = mulberry32(seed + stage * 7919 + themeWorldId * 131);
  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  const diffMult = difficulty === 'santai' ? 0.8 : difficulty === 'ekstrem' ? 1.35 : 1.05;
  const enemyMult = Math.min(1.8, diffMult + (stage - 1) * 0.08);
  const chunkCount = Math.min(11, 6 + Math.floor(stage * 0.7) + (difficulty === 'ekstrem' ? 2 : 0));

  const H = 960;
  const level: GeneratedLevel = {
    worldWidth: 4800,
    worldHeight: H,
    platforms: [],
    movingPlatforms: [],
    collapsingPlatforms: [],
    waterPools: [],
    ladders: [],
    slides: [],
    ziplines: [],
    bounceRings: [],
    splashTraps: [],
    tippingBuckets: [],
    chests: [],
    habitats: [],
    collectibles: [],
    enemies: [],
    checkpoints: [],
    landmarks: [],
    exitX: 4600,
    exitY: H - 140,
  };

  const addCoinArc = (startX: number, y: number, count: number, kind: CollectibleKind = 'coin_gold') => {
    for (let i = 0; i < count; i++) {
      const arc = Math.sin((i / Math.max(1, count - 1)) * Math.PI) * 34;
      level.collectibles.push({ x: startX + i * 44, y: y - arc, kind });
    }
  };

  // Zona Awal Aman + Power-Up Kelapa Jumbo CAS pertama
  level.platforms.push({ x: 0, y: H - 130, w: 620, h: 130 });
  level.landmarks.push({ x: 185, y: H - 130, kind: themeWorldId === 3 ? 'zoo_gate' : 'gazebo' });
  level.landmarks.push({ x: 460, y: H - 130, kind: 'sponsor' });
  level.landmarks.push({ x: 560, y: H - 130, kind: 'palm' });
  addCoinArc(250, H - 190, 5, 'coin_silver');
  level.collectibles.push({ x: 500, y: H - 190, kind: 'power_coconut' });

  let cursorX = 620;
  const deckY = H - 140;
  let blasterPlaced = false;
  let checkpointPlaced = false;

  const ticketKinds: CollectibleKind[] =
    themeWorldId === 2 ? ['ticket_vip', 'ticket_normal'] : themeWorldId === 4 ? ['ticket_golden', 'ticket_vip'] : ['ticket_normal', 'ticket_mystery'];

  const animalChoices = [
    { key: 'animal_elephant', name: 'Gajah CAS' },
    { key: 'animal_deer', name: 'Rusa Tutul' },
    { key: 'animal_giraffe', name: 'Jerapah Cikole' },
    { key: 'animal_zebra', name: 'Zebra Pandeglang' },
    { key: 'animal_peacock', name: 'Ayam Merak' },
  ];

  for (let c = 0; c < chunkCount; c++) {
    // Sisipkan Checkpoint di pertengahan
    if (!checkpointPlaced && c >= Math.floor(chunkCount / 2)) {
      checkpointPlaced = true;
      level.platforms.push({ x: cursorX, y: deckY - 10, w: 460, h: 150 });
      level.checkpoints.push({ x: cursorX + 110, y: deckY - 10, label: `Pos Tengah Stage ${stage}` });
      level.chests.push({ x: cursorX + 260, y: deckY - 30 });
      level.collectibles.push({ x: cursorX + 360, y: deckY - 75, kind: blasterPlaced ? 'shield' : 'power_blaster' });
      blasterPlaced = true;
      level.landmarks.push({ x: cursorX + 390, y: deckY - 10, kind: 'sponsor' });
      cursorX += 460;
      continue;
    }

    const pattern = randInt(0, 4);

    if (pattern === 0) {
      // Kolam Air + Ban Pelampung + Ikan Buntal + Dek Atas
      const w = randInt(560, 720);
      level.platforms.push({ x: cursorX, y: H - 45, w, h: 45 });
      level.waterPools.push({ x: cursorX, y: H - 150, w, h: 105, currentX: rng() > 0.5 ? 32 : -32 });
      level.bounceRings.push({ x: cursorX + w * 0.32, y: H - 155, kind: 'ring' });
      level.bounceRings.push({ x: cursorX + w * 0.68, y: H - 155, kind: 'ring' });
      level.platforms.push({ x: cursorX + w * 0.35, y: H - 305, w: 200, h: 24, oneWay: true });
      level.collectibles.push({
        x: cursorX + w * 0.35 + 100,
        y: H - 350,
        kind: ticketKinds[c % ticketKinds.length],
        isTreasure: true,
      });
      addCoinArc(cursorX + 120, H - 210, 5, 'coin_gold');

      // Ikan buntal berpatroli di atas kolam
      const pufferCount = difficulty === 'santai' ? 1 : 2;
      for (let p = 0; p < pufferCount; p++) {
        const px = cursorX + 160 + p * 230;
        level.enemies.push({ x: px, y: H - 210, type: 'puffer', minX: px - 80, maxX: px + 80, speed: 65 * enemyMult });
      }
      if (themeWorldId === 2 && rng() > 0.35) {
        level.landmarks.push({ x: cursorX + w * 0.5, y: H - 150, kind: 'octopus' });
      }
      cursorX += w;
    } else if (pattern === 1) {
      // Menara Tangga Satu-Arah + Seluncuran Air + Musuh Patroli
      const w = 680;
      level.platforms.push({ x: cursorX, y: deckY, w, h: 140 });
      level.ladders.push({ x: cursorX + 105, topY: H - 390, bottomY: deckY });
      level.platforms.push({ x: cursorX + 65, y: H - 390, w: 230, h: 24, oneWay: true });
      level.slides.push({ x: cursorX + 295, y: H - 360, w: 240, h: 42, isChallenge: true });
      addCoinArc(cursorX + 315, H - 405, 5, 'coin_gold');

      if (!blasterPlaced) {
        level.collectibles.push({ x: cursorX + 185, y: H - 435, kind: 'power_blaster' });
        blasterPlaced = true;
      } else {
        level.collectibles.push({ x: cursorX + 185, y: H - 435, kind: ticketKinds[c % ticketKinds.length] });
      }

      level.enemies.push({
        x: cursorX + 360,
        y: deckY - 20,
        type: 'crab',
        minX: cursorX + 200,
        maxX: cursorX + w - 60,
        speed: 110 * enemyMult,
      });
      level.enemies.push({
        x: cursorX + 490,
        y: H - 445,
        type: 'wasp',
        minX: cursorX + 340,
        maxX: cursorX + 620,
        speed: 95 * enemyMult,
      });
      if (rng() > 0.4) {
        level.tippingBuckets.push({ x: cursorX + 540, y: H - 340, cycleSec: Math.max(2.6, 3.9 - stage * 0.1) });
      }
      cursorX += w;
    } else if (pattern === 2) {
      // Jalur Platform Bergerak + Tawon + Monyet Pelempar Kelapa
      const w = 660;
      level.platforms.push({ x: cursorX, y: deckY, w: 190, h: 140 });
      level.movingPlatforms.push({ x: cursorX + 300, y: H - 230, w: 140, h: 24, dx: 70, dy: 0, speed: 1.5 * diffMult });
      level.collapsingPlatforms.push({ x: cursorX + 430, y: H - 270, w: 120 });
      level.platforms.push({ x: cursorX + 540, y: deckY, w: 220, h: 140 });

      level.enemies.push({
        x: cursorX + 640,
        y: deckY - 28,
        type: 'monkey',
        minX: cursorX + 580,
        maxX: cursorX + 710,
        speed: 65 * enemyMult,
      });
      level.enemies.push({
        x: cursorX + 330,
        y: H - 340,
        type: 'wasp',
        minX: cursorX + 210,
        maxX: cursorX + 480,
        speed: 105 * enemyMult,
      });
      addCoinArc(cursorX + 240, H - 300, 5, 'coin_gold');
      level.collectibles.push({ x: cursorX + 610, y: deckY - 60, kind: 'diamond', isTreasure: true });
      cursorX += 760;
    } else if (pattern === 3) {
      // Dek Satwa & Harta Karun CAS + Kepiting + Jebakan Cipratan
      const w = 640;
      level.platforms.push({ x: cursorX, y: deckY, w, h: 140 });
      const animal = animalChoices[(c + themeWorldId) % animalChoices.length];
      level.habitats.push({ x: cursorX + 220, y: deckY, animalKey: animal.key, name: animal.name });
      level.splashTraps.push({ x: cursorX + 430, y: deckY, cycleSec: Math.max(2.3, 3.2 - stage * 0.08) });
      level.chests.push({ x: cursorX + 520, y: deckY - 20 });
      level.enemies.push({
        x: cursorX + 340,
        y: deckY - 20,
        type: 'crab',
        minX: cursorX + 260,
        maxX: cursorX + 580,
        speed: 120 * enemyMult,
      });
      if (difficulty !== 'santai') {
        level.enemies.push({
          x: cursorX + 150,
          y: deckY - 20,
          type: 'crab',
          minX: cursorX + 60,
          maxX: cursorX + 240,
          speed: 105 * enemyMult,
        });
      }
      level.landmarks.push({ x: cursorX + 580, y: deckY, kind: 'palm' });
      cursorX += w;
    } else {
      // Flying Fox Zipline Melintasi Kolam + Bonus Koin Udara
      level.platforms.push({ x: cursorX, y: deckY, w: 220, h: 140 });
      level.ladders.push({ x: cursorX + 90, topY: H - 410, bottomY: deckY });
      level.platforms.push({ x: cursorX + 50, y: H - 410, w: 180, h: 24, oneWay: true });
      level.ziplines.push({ x1: cursorX + 190, y1: H - 465, x2: cursorX + 740, y2: H - 360 });
      addCoinArc(cursorX + 280, H - 420, 6, 'coin_gold');

      level.platforms.push({ x: cursorX + 220, y: H - 45, w: 460, h: 45 });
      level.waterPools.push({ x: cursorX + 220, y: H - 140, w: 460, h: 95, currentX: 40 });
      level.enemies.push({
        x: cursorX + 430,
        y: H - 230,
        type: 'puffer',
        minX: cursorX + 280,
        maxX: cursorX + 600,
        speed: 75 * enemyMult,
      });
      level.platforms.push({ x: cursorX + 680, y: deckY, w: 240, h: 140 });
      level.collectibles.push({ x: cursorX + 780, y: deckY - 60, kind: 'boost_energy' });
      cursorX += 920;
    }
  }

  // Arena Penjaga Akhir (Mini-Boss Gurita CAS) sebelum Gerbang Keluar
  const bossArenaW = 760;
  level.platforms.push({ x: cursorX, y: deckY, w: bossArenaW, h: 140 });
  level.landmarks.push({ x: cursorX + 140, y: deckY, kind: 'sponsor' });
  level.collectibles.push({ x: cursorX + 110, y: deckY - 65, kind: 'power_blaster' });
  level.enemies.push({
    x: cursorX + 410,
    y: deckY - 40,
    type: 'octo_bot',
    minX: cursorX + 240,
    maxX: cursorX + 560,
    speed: 95 * enemyMult,
  });
  addCoinArc(cursorX + 280, deckY - 120, 5, 'coin_gold');
  level.collectibles.push({ x: cursorX + 590, y: deckY - 65, kind: 'ticket_golden', isTreasure: true });
  level.landmarks.push({ x: cursorX + 695, y: deckY, kind: 'palm' });

  level.exitX = cursorX + 660;
  level.exitY = deckY;
  level.worldWidth = cursorX + bossArenaW;

  return level;
}
