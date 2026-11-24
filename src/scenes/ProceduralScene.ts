import { WORLDS, WorldId } from '../game/GameConfig';
import { GameManager, ProceduralRunConfig } from '../game/GameManager';
import { generateProceduralLevel } from '../game/LevelGenerator';
import { BaseWorldScene } from './BaseWorldScene';

export class ProceduralScene extends BaseWorldScene {
  private procConfig!: ProceduralRunConfig;

  constructor() {
    super('ProceduralScene');
  }

  protected getWorldId(): WorldId {
    const cfg = (this.game.registry.get('procedural_config') as ProceduralRunConfig | undefined) ?? GameManager.getProceduralConfig();
    this.procConfig = cfg;
    return cfg.themeWorldId;
  }

  protected isProceduralRun(): boolean {
    return true;
  }

  protected getProceduralConfig(): ProceduralRunConfig {
    return this.procConfig;
  }

  protected getCustomWorldName(): string {
    const base = WORLDS.find((w) => w.id === this.procConfig.themeWorldId)?.name ?? 'CAS Water Park';
    const diffLabel =
      this.procConfig.difficulty === 'santai' ? 'Santai' : this.procConfig.difficulty === 'ekstrem' ? 'Ekstrem' : 'Seru';
    return `Acak Stage ${this.procConfig.stage} (${diffLabel}) · ${base}`;
  }

  protected buildLevelGeometry(): void {
    const level = generateProceduralLevel(this.procConfig);

    // Sesuaikan ukuran dunia dengan hasil generator
    this.worldDef = {
      ...this.worldDef,
      worldWidth: level.worldWidth,
      worldHeight: level.worldHeight,
    };

    for (const p of level.platforms) {
      this.addPlatform(p.x, p.y, p.w, p.h, undefined, undefined, Boolean(p.oneWay));
    }
    for (const mp of level.movingPlatforms) {
      this.addMovingPlatform(mp.x, mp.y, mp.w, mp.h, mp.dx, mp.dy, mp.speed);
    }
    for (const cp of level.collapsingPlatforms) {
      this.addCollapsingPlatform(cp.x, cp.y, cp.w);
    }
    for (const wp of level.waterPools) {
      this.addWaterPool(wp.x, wp.y, wp.w, wp.h, wp.currentX);
    }
    for (const l of level.ladders) {
      this.addLadder(l.x, l.topY, l.bottomY);
    }
    for (const sl of level.slides) {
      this.addWaterSlide(sl.x, sl.y, sl.w, sl.h, sl.isChallenge);
    }
    for (const z of level.ziplines) {
      this.addZipline(z.x1, z.y1, z.x2, z.y2);
    }
    for (const br of level.bounceRings) {
      if (br.kind === 'ring') this.addInflatableRing(br.x, br.y);
      else this.addDivingBoard(br.x, br.y);
    }
    for (const st of level.splashTraps) {
      this.addSplashTrap(st.x, st.y, st.cycleSec);
    }
    for (const tb of level.tippingBuckets) {
      this.addTippingBucket(tb.x, tb.y, tb.cycleSec);
    }
    for (const ch of level.chests) {
      this.addTreasureChest(ch.x, ch.y);
    }
    for (const hb of level.habitats) {
      this.addWildlifeHabitat(hb.x, hb.y, hb.animalKey, hb.name);
    }
    for (const col of level.collectibles) {
      this.collectibles.spawn(col.x, col.y, col.kind, Boolean(col.isTreasure));
    }
    for (const en of level.enemies) {
      this.addEnemy(en.x, en.y, en.type, en.minX, en.maxX, en.speed);
    }
    for (const cp of level.checkpoints) {
      this.addCheckpoint(cp.x, cp.y, cp.label);
    }
    for (const lm of level.landmarks) {
      if (lm.kind === 'palm') this.addPalmTree(lm.x, lm.y);
      if (lm.kind === 'gazebo') this.addCasGazebo(lm.x, lm.y);
      if (lm.kind === 'octopus') this.addCasOctopus(lm.x, lm.y);
      if (lm.kind === 'zoo_gate') this.addCasZooGate(lm.x, lm.y);
      if (lm.kind === 'sponsor') this.addCasSponsorBoard(lm.x, lm.y);
    }
    this.addExitGate(level.exitX, level.exitY);
  }
}
