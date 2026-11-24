import Phaser from 'phaser';
import { AudioManager } from '../game/AudioManager';
import { CameraController } from '../game/Camera';
import { CollectibleSystem } from '../game/CollectibleSystem';
import { WorldDef, WorldId } from '../game/GameConfig';
import { GameManager, ProceduralRunConfig } from '../game/GameManager';
import { EnemyKind } from '../game/LevelGenerator';
import { MissionSystem } from '../game/MissionSystem';
import { PlayerController, PlayerInput } from '../game/Player';
import { SaveManager } from '../game/SaveManager';
import { refreshEquippedCharacterTextures, registerCharacterAnimations } from '../game/TextureFactory';
import { WeatherSystem, WeatherType } from '../game/WeatherSystem';

interface MovingPlatEntry {
  rect: Phaser.GameObjects.Rectangle;
  topBar: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.Body;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  speed: number;
  phase: number;
  prevX: number;
  prevY: number;
}

interface CollapsingPlatEntry {
  rect: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.Body;
  originY: number;
  triggered: boolean;
}

interface WaterZone {
  bounds: Phaser.Geom.Rectangle;
  currentX: number;
  waveOverlay: Phaser.GameObjects.Graphics;
}

interface AutoTriggerEntry {
  x: number;
  y: number;
  radius: number;
  used: boolean;
  onTrigger: () => void;
}

interface ZiplineEntry {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pulley: Phaser.GameObjects.Arc;
}

interface RopeEntry {
  anchorX: number;
  anchorY: number;
  length: number;
  line: Phaser.GameObjects.Line;
  grab: Phaser.GameObjects.Arc;
}

interface EnemyEntry {
  sprite: Phaser.Physics.Arcade.Image;
  type: EnemyKind;
  minX: number;
  maxX: number;
  baseY: number;
  speed: number;
  dir: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  skillTimer: number;
  isInflated: boolean;
  swoopOffsetY: number;
  hpBar?: Phaser.GameObjects.Graphics;
}

interface SplashTrapEntry {
  x: number;
  y: number;
  geyser: Phaser.GameObjects.Rectangle;
  warnRing: Phaser.GameObjects.Arc;
  timer: number;
  cycleSec: number;
  active: boolean;
}

interface TippingBucketEntry {
  sprite: Phaser.GameObjects.Image;
  cascade: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
  timer: number;
  cycleSec: number;
  pouring: boolean;
}

interface TimedGateEntry {
  door: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.Body;
  switchObj: Phaser.GameObjects.Rectangle;
  openTimer: number;
  closedY: number;
}

export abstract class BaseWorldScene extends Phaser.Scene {
  protected worldDef!: WorldDef;
  protected player!: PlayerController;
  protected collectibles!: CollectibleSystem;
  protected missions!: MissionSystem;
  protected camCtrl!: CameraController;

  protected staticPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  protected oneWayPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  protected playerBullets!: Phaser.Physics.Arcade.Group;
  protected enemyBullets!: Phaser.Physics.Arcade.Group;

  protected movingPlatforms: MovingPlatEntry[] = [];
  protected collapsingPlatforms: CollapsingPlatEntry[] = [];
  protected waterZones: WaterZone[] = [];
  protected climbZones: Phaser.Geom.Rectangle[] = [];
  protected slideZones: Array<{ bounds: Phaser.Geom.Rectangle; isChallenge: boolean }> = [];
  protected wetFloorZones: Phaser.Geom.Rectangle[] = [];
  protected checkpoints: Array<{ x: number; y: number; flag: Phaser.GameObjects.Image; activated: boolean; label: string }> = [];
  protected autoTriggers: AutoTriggerEntry[] = [];
  protected ziplines: ZiplineEntry[] = [];
  protected ropes: RopeEntry[] = [];
  protected enemies: EnemyEntry[] = [];
  protected spinners: Phaser.Physics.Arcade.Image[] = [];
  protected splashTraps: SplashTrapEntry[] = [];
  protected tippingBuckets: TippingBucketEntry[] = [];
  protected timedGates: TimedGateEntry[] = [];
  protected bounceRings: Phaser.Physics.Arcade.Image[] = [];
  protected exitGate?: Phaser.Physics.Arcade.Image;

  protected coinsCollected = 0;
  protected ticketsCollected = 0;
  protected goldenTicketsCollected = 0;
  protected diamondsCollected = 0;
  protected treasuresCollected = 0;
  protected habitatsVisited = 0;
  protected keysHeld = 0;
  protected score = 0;
  protected comboCount = 0;
  protected comboTimer = 0;
  protected enemiesDefeated = 0;
  protected slideChallengeDone = false;
  protected finished = false;
  protected toastMessage: string | null = null;
  protected toastTimer = 0;
  protected checkpointLabel = 'Area Awal';
  protected checkpointReached = false;

  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
    f: Phaser.Input.Keyboard.Key;
    j: Phaser.Input.Keyboard.Key;
  };

  private pointerShootQueued = false;
  private hudSyncTimer = 0;
  private wasInWater = false;
  private hitstopTimer = 0;
  private bgParallax?: Phaser.GameObjects.TileSprite;
  private clouds: Phaser.GameObjects.Ellipse[] = [];
  private skyBanners: Phaser.GameObjects.Image[] = [];
  protected weatherSystem!: WeatherSystem;

  constructor(key: string) {
    super(key);
  }

  protected abstract getWorldId(): WorldId;
  protected abstract buildLevelGeometry(): void;

  protected isProceduralRun(): boolean {
    return false;
  }

  protected getProceduralConfig(): ProceduralRunConfig | undefined {
    return undefined;
  }

  protected getCustomWorldName(): string {
    return this.worldDef.name;
  }

  public create(): void {
    this.movingPlatforms = [];
    this.collapsingPlatforms = [];
    this.waterZones = [];
    this.climbZones = [];
    this.slideZones = [];
    this.wetFloorZones = [];
    this.checkpoints = [];
    this.autoTriggers = [];
    this.ziplines = [];
    this.ropes = [];
    this.enemies = [];
    this.spinners = [];
    this.splashTraps = [];
    this.tippingBuckets = [];
    this.timedGates = [];
    this.bounceRings = [];
    this.clouds = [];
    this.skyBanners = [];

    this.coinsCollected = 0;
    this.ticketsCollected = 0;
    this.goldenTicketsCollected = 0;
    this.diamondsCollected = 0;
    this.treasuresCollected = 0;
    this.habitatsVisited = 0;
    this.keysHeld = 0;
    this.score = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.enemiesDefeated = 0;
    this.slideChallengeDone = false;
    this.finished = false;
    this.toastMessage = null;
    this.toastTimer = 0;
    this.checkpointReached = false;
    this.wasInWater = false;
    this.hitstopTimer = 0;
    this.pointerShootQueued = false;

    const save = SaveManager.getData();
    refreshEquippedCharacterTextures(this);
    registerCharacterAnimations(this, save.selectedCharacter);

    const worldId = this.getWorldId();
    this.worldDef = this.registry.get(`world_${worldId}`) as WorldDef;
    this.missions = new MissionSystem(this.worldDef);
    this.checkpointLabel = this.isProceduralRun()
      ? `Acak · Stage ${this.getProceduralConfig()?.stage ?? 1}`
      : `${this.worldDef.code} · Awal`;

    this.staticPlatforms = this.physics.add.staticGroup();
    this.oneWayPlatforms = this.physics.add.staticGroup();
    this.collectibles = new CollectibleSystem(this);
    this.playerBullets = this.physics.add.group({ allowGravity: true });
    this.enemyBullets = this.physics.add.group({ allowGravity: true });

    this.player = new PlayerController(this, 120, this.worldDef.worldHeight - 210, save.selectedCharacter);

    this.buildLevelGeometry();

    // Update physics world bounds after procedural level potentially overrides worldDef dimensions
    this.physics.world.setBounds(0, 0, this.worldDef.worldWidth, this.worldDef.worldHeight);
    this.createParallaxBackdrop();

    const weatherOrder: WeatherType[] = ['sunny', 'breeze', 'drizzle', 'breeze'];
    const initialWeather: WeatherType = this.isProceduralRun()
      ? (['sunny', 'breeze', 'drizzle'] as WeatherType[])[((this.getProceduralConfig()?.stage ?? 1) - 1) % 3]
      : weatherOrder[(worldId - 1) % weatherOrder.length];
    this.weatherSystem = new WeatherSystem(this, initialWeather, (info) => {
      this.showToast(`Cuaca Berganti: ${info.label} (${info.effectLabel})`, 2.4);
      this.pushHudSnapshot();
    });

    this.camCtrl = new CameraController(this, this.worldDef.worldWidth, this.worldDef.worldHeight);
    this.camCtrl.follow(this.player.sprite);

    this.setupCollisions();
    this.setupKeyboard();
    AudioManager.playMusic(this.worldDef.musicId);

    this.showToast(`Selamat Datang di ${this.getCustomWorldName()}!`, 2.6);
    this.pushHudSnapshot();
  }

  private createParallaxBackdrop(): void {
    const { width, height } = this.scale;
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-10);
    sky.fillGradientStyle(this.worldDef.skyTop, this.worldDef.skyTop, this.worldDef.skyBottom, this.worldDef.skyBottom, 1);
    sky.fillRect(0, 0, width * 2, height * 2);

    const bgKey = `bg_world_${this.worldDef.id}`;
    if (this.textures.exists(bgKey)) {
      const tex = this.textures.get(bgKey).getSourceImage() as HTMLImageElement;
      const scaleY = height / tex.height;
      this.bgParallax = this.add
        .tileSprite(0, 0, width, height, bgKey)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(-8)
        .setAlpha(0.38);
      this.bgParallax.setTileScale(scaleY, scaleY);
    }

    // Banner Sponsor Utama CAS WATER PARK di langit background permainan
    if (this.textures.exists('cas_sky_banner')) {
      for (let bx = 360; bx < this.worldDef.worldWidth; bx += 960) {
        const banner = this.add
          .image(bx, 122, 'cas_sky_banner')
          .setDepth(-4)
          .setScrollFactor(0.45)
          .setAlpha(0.95);
        this.tweens.add({
          targets: banner,
          y: 132,
          duration: 2400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.skyBanners.push(banner);
      }
    }

    for (let i = 0; i < 14; i++) {
      const cx = i * 440 + 140;
      const cy = Phaser.Math.Between(65, 210);
      const cloud = this.add.ellipse(cx, cy, Phaser.Math.Between(115, 195), 42, 0xffffff, 0.52).setDepth(-5).setScrollFactor(0.25);
      this.clouds.push(cloud);
    }
  }

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (kb) {
      this.keys = {
        left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        shift: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        f: kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        j: kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      };
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && !this.finished && this.player.powerTier === 3) {
        this.pointerShootQueued = true;
      }
    });
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player.sprite, this.staticPlatforms);

    // Platform Satu-Arah (di atas tangga & jembatan atas): bisa ditembus dari bawah & saat memanjat!
    this.physics.add.collider(
      this.player.sprite,
      this.oneWayPlatforms,
      undefined,
      (playerObj, platObj) => {
        if (this.player.state.isClimbing) return false;
        const pBody = (playerObj as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
        const platBody = (platObj as Phaser.GameObjects.Rectangle).body as Phaser.Physics.Arcade.StaticBody;
        const prevBottom = pBody.prev.y + pBody.height;
        return pBody.velocity.y >= -15 && prevBottom <= platBody.top + 14;
      }
    );

    this.physics.add.overlap(this.player.sprite, this.collectibles.group, (_p, itemObj) => {
      const item = itemObj as Phaser.Physics.Arcade.Image;
      if (!item.active) return;
      const res = this.collectibles.collect(item, this.player);
      this.coinsCollected += res.coinsAdded;
      this.ticketsCollected += res.ticketsAdded;
      this.goldenTicketsCollected += res.goldenTicketsAdded;
      this.diamondsCollected += res.diamondsAdded;
      this.keysHeld += res.keysAdded;
      this.treasuresCollected += res.treasuresAdded;
      this.score += res.scoreAdded;

      if (res.coinsAdded > 0) this.missions.updateByType('coins', this.coinsCollected);
      if (res.ticketsAdded > 0) this.missions.updateByType('tickets', this.ticketsCollected);
      if (res.goldenTicketsAdded > 0) this.missions.updateByType('golden_tickets', this.goldenTicketsCollected);
      if (res.treasuresAdded > 0) this.missions.updateByType('treasures', this.treasuresCollected);

      if (res.toast) this.showToast(res.toast, 2.4);
      this.pushHudSnapshot();
    });

    for (const ring of this.bounceRings) {
      this.physics.add.collider(this.player.sprite, ring, () => {
        const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        if (pBody.touching.down || pBody.blocked.down) {
          this.player.bounce(-695);
          AudioManager.playSfx('SFX_002');
          this.tweens.add({ targets: ring, scaleY: 0.72, duration: 90, yoyo: true });
        }
      });
    }

    // Peluru Pistol Air memantul di lantai & mengalahkan musuh
    this.physics.add.collider(this.playerBullets, this.staticPlatforms, (bulletObj) => {
      const b = bulletObj as Phaser.Physics.Arcade.Image;
      if (!b.active) return;
      const bBody = b.body as Phaser.Physics.Arcade.Body;
      if (bBody.blocked.left || bBody.blocked.right) {
        this.spawnSplashPop(b.x, b.y, 'particle_bubble');
        b.destroy();
      } else if (bBody.blocked.down) {
        bBody.setVelocityY(-240);
      }
    });

    this.physics.add.collider(this.enemyBullets, this.staticPlatforms, (projObj) => {
      const p = projObj as Phaser.Physics.Arcade.Image;
      if (!p.active) return;
      this.spawnSplashPop(p.x, p.y, 'particle_dust');
      p.destroy();
    });

    this.physics.add.overlap(this.player.sprite, this.enemyBullets, (_pl, projObj) => {
      const p = projObj as Phaser.Physics.Arcade.Image;
      if (!p.active) return;
      const sx = p.x;
      this.spawnSplashPop(p.x, p.y, 'particle_dust');
      p.destroy();
      this.handleHazardHit(sx);
    });

    for (const enemy of this.enemies) {
      this.physics.add.overlap(this.player.sprite, enemy.sprite, () => {
        if (!enemy.alive || this.finished) return;
        const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        const eBody = enemy.sprite.body as Phaser.Physics.Arcade.Body;
        // Cek apakah pemain menginjak dari atas (gaya Mario)
        const isStomping =
          pBody.velocity.y > 35 &&
          pBody.bottom <= eBody.center.y + 18 &&
          !(enemy.type === 'puffer' && enemy.isInflated);

        if (isStomping) {
          this.player.bounce(-440);
          this.damageEnemy(enemy, this.player.powerTier >= 2 ? 2 : 1, 'Injak');
        } else {
          this.handleHazardHit(enemy.sprite.x);
        }
      });

      this.physics.add.overlap(this.playerBullets, enemy.sprite, (_e, bulletObj) => {
        if (!enemy.alive) return;
        const b = bulletObj as Phaser.Physics.Arcade.Image;
        if (!b.active) return;
        this.spawnSplashPop(b.x, b.y, 'particle_bubble');
        b.destroy();
        this.damageEnemy(enemy, 1, 'Pistol Air');
      });
    }

    for (const sp of this.spinners) {
      this.physics.add.overlap(this.player.sprite, sp, () => this.handleHazardHit(sp.x));
    }

    if (this.exitGate) {
      this.physics.add.overlap(this.player.sprite, this.exitGate, () => this.handleReachExit());
    }
  }

  private damageEnemy(enemy: EnemyEntry, dmg: number, sourceLabel: string): void {
    if (!enemy.alive) return;
    enemy.hp -= dmg;
    AudioManager.playSfx('SFX_010');

    if (enemy.hp > 0) {
      this.tweens.add({ targets: enemy.sprite, alpha: 0.4, duration: 80, yoyo: true, repeat: 2 });
      this.drawBossHpBar(enemy);
      this.spawnFloatingBanner(enemy.sprite.x, enemy.sprite.y - 38, `Sisa ${enemy.hp} HP!`, '#FACC15');
      return;
    }

    enemy.alive = false;
    if (enemy.hpBar) enemy.hpBar.destroy();
    const ex = enemy.sprite.x;
    const ey = enemy.sprite.y;

    this.comboCount += 1;
    this.comboTimer = 3.6;
    this.enemiesDefeated += 1;
    const bonusPts = (enemy.type === 'octo_bot' ? 400 : 120) * Math.min(5, this.comboCount);
    this.score += bonusPts;

    this.spawnSplashPop(ex, ey, 'particle_sparkle');
    this.spawnFloatingBanner(
      ex,
      ey - 22,
      this.comboCount > 1 ? `${sourceLabel}! KOMBO x${this.comboCount} +${bonusPts}` : `+${bonusPts}`,
      '#38BDF8'
    );

    // Jatuhkan koin hadiah
    const dropCount = enemy.type === 'octo_bot' ? 5 : 2;
    for (let i = 0; i < dropCount; i++) {
      this.collectibles.spawn(ex + (i - Math.floor(dropCount / 2)) * 26, ey - 18, i % 2 === 0 ? 'coin_gold' : 'coin_silver');
    }

    if (enemy.type === 'octo_bot') {
      this.missions.updateByType('challenge', 1);
      this.showToast('Penjaga Gurita Kalah! Gerbang Terbuka!', 2.2);
    }

    this.tweens.add({
      targets: enemy.sprite,
      scaleY: 0.15,
      scaleX: 1.4,
      alpha: 0,
      duration: 210,
      onComplete: () => enemy.sprite.destroy(),
    });
    this.pushHudSnapshot();
  }

  protected handleHazardHit(sourceX: number): void {
    if (this.finished) return;
    const knockDir = this.player.sprite.x < sourceX ? -1 : 1;
    const prevTier = this.player.powerTier;
    const damaged = this.player.takeDamage(1, knockDir);
    if (!damaged && prevTier > this.player.powerTier) {
      this.showToast('Power-Up Melindungi Nyawamu!', 1.8);
      this.pushHudSnapshot();
      return;
    }
    if (damaged) {
      this.hitstopTimer = 0.055;
      this.comboCount = 0;
      this.pushHudSnapshot();
      if (this.player.health <= 0) {
        this.triggerGameOver('Energi petualanganmu habis!');
      }
    }
  }

  protected handleReachExit(): void {
    if (this.finished) return;
    this.finished = true;
    this.missions.updateByType('exit', 1);
    if (this.worldDef.id === 4) {
      this.missions.updateByType('challenge', 1);
    }

    const stars = this.missions.getStars();
    const completedMissionIds = this.missions.getCompletedMissionIds();
    const missionRewardCoins = this.missions.getEarnedRewardCoins();

    const procCfg = this.getProceduralConfig();
    if (this.isProceduralRun() && procCfg) {
      SaveManager.recordProceduralCompletion({
        stage: procCfg.stage,
        score: this.score,
        coinsCollected: this.coinsCollected,
        ticketsCollected: this.ticketsCollected,
        enemiesDefeated: this.enemiesDefeated,
      });

      AudioManager.playSfx('SFX_017');
      this.player.sprite.play(`${this.player.charId}_victory`, true);
      (this.player.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

      this.time.delayedCall(550, () => {
        this.scene.pause();
        GameManager.emitVictory({
          worldId: this.worldDef.id,
          worldName: this.getCustomWorldName(),
          isProcedural: true,
          proceduralConfig: procCfg,
          coinsCollected: this.coinsCollected,
          ticketsCollected: this.ticketsCollected,
          diamondsCollected: this.diamondsCollected,
          enemiesDefeated: this.enemiesDefeated,
          score: this.score,
          missions: this.missions.getStatus(),
          stars,
          missionRewardCoins,
          newlyUnlockedWorld: null,
          newAchievements: [],
        });
      });
      return;
    }

    const { newlyUnlockedWorld, newAchievements } = SaveManager.recordWorldCompletion({
      worldId: this.worldDef.id,
      coinsCollected: this.coinsCollected,
      ticketsCollected: this.ticketsCollected,
      diamondsCollected: this.diamondsCollected,
      completedMissionIds,
      stars,
      missionRewardCoins,
      enemiesDefeated: this.enemiesDefeated,
    });

    AudioManager.playSfx('SFX_017');
    if (newlyUnlockedWorld) {
      AudioManager.playSfx('SFX_016');
    }
    this.player.sprite.play(`${this.player.charId}_victory`, true);
    (this.player.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    this.time.delayedCall(550, () => {
      this.scene.pause();
      GameManager.emitVictory({
        worldId: this.worldDef.id,
        worldName: this.getCustomWorldName(),
        isProcedural: false,
        coinsCollected: this.coinsCollected,
        ticketsCollected: this.ticketsCollected,
        diamondsCollected: this.diamondsCollected,
        enemiesDefeated: this.enemiesDefeated,
        score: this.score,
        missions: this.missions.getStatus(),
        stars,
        missionRewardCoins,
        newlyUnlockedWorld,
        newAchievements,
      });
    });
  }

  protected triggerGameOver(reason: string): void {
    if (this.finished) return;
    this.finished = true;
    AudioManager.playSfx('SFX_018');
    this.scene.pause();
    GameManager.emitGameOver({
      worldId: this.worldDef.id,
      worldName: this.getCustomWorldName(),
      isProcedural: this.isProceduralRun(),
      proceduralConfig: this.getProceduralConfig(),
      coinsCollected: this.coinsCollected,
      ticketsCollected: this.ticketsCollected,
      enemiesDefeated: this.enemiesDefeated,
      score: this.score,
      reason,
    });
  }

  public update(_time: number, delta: number): void {
    if (this.finished) return;
    const dtMs = Math.min(delta, 50);
    const dt = dtMs / 1000;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
      return;
    }

    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) this.comboCount = 0;
    }

    if (this.bgParallax) {
      this.bgParallax.tilePositionX = this.cameras.main.scrollX * 0.25;
    }

    this.weatherSystem.update(dt, _time / 1000);
    const weatherInfo = this.weatherSystem.getCurrentInfo();
    this.player.state.weatherSpeedMult = weatherInfo.speedMultiplier;
    this.player.state.weatherWindX = weatherInfo.windForceX;

    const cloudSpeedMult = this.weatherSystem.getCloudSpeedMultiplier();
    const isDrizzle = weatherInfo.type === 'drizzle';
    for (const c of this.clouds) {
      c.x -= 12 * cloudSpeedMult * dt;
      c.setFillStyle(isDrizzle ? 0xcbd5e1 : 0xffffff, isDrizzle ? 0.66 : 0.52);
      if (c.x < -120) c.x = this.worldDef.worldWidth + 120;
    }

    const touch = GameManager.touchInput;
    const upHeld = Boolean(this.keys?.up.isDown || this.keys?.w.isDown || touch.up);
    const downHeld = Boolean(this.keys?.down.isDown || this.keys?.s.isDown || touch.down);

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const pBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;

    let activeClimbZone: Phaser.Geom.Rectangle | null = null;
    for (const cz of this.climbZones) {
      if (cz.contains(px, py) || cz.contains(px, pBody.bottom - 4) || cz.contains(px, pBody.bottom + 8)) {
        activeClimbZone = cz;
        break;
      }
    }

    // Jika pemain memanjat tangga dengan W/Up, jangan langsung dianggap loncat bersamaan
    const canUpJump = !activeClimbZone && !this.player.state.isClimbing;
    const jumpDown = Boolean(
      this.keys?.space.isDown || touch.jumpHeld || (canUpJump && (this.keys?.w.isDown || this.keys?.up.isDown))
    );
    const jumpJust = Boolean(
      (this.keys &&
        (Phaser.Input.Keyboard.JustDown(this.keys.space) ||
          (canUpJump && (Phaser.Input.Keyboard.JustDown(this.keys.w) || Phaser.Input.Keyboard.JustDown(this.keys.up))))) ||
        touch.jumpJustPressed
    );

    const shootJust = Boolean(
      (this.keys && (Phaser.Input.Keyboard.JustDown(this.keys.f) || Phaser.Input.Keyboard.JustDown(this.keys.j))) ||
        this.pointerShootQueued ||
        touch.shootJustPressed
    );
    this.pointerShootQueued = false;
    touch.shootJustPressed = false;

    const input: PlayerInput = {
      left: Boolean(this.keys?.left.isDown || this.keys?.a.isDown || touch.left),
      right: Boolean(this.keys?.right.isDown || this.keys?.d.isDown || touch.right),
      up: upHeld,
      down: downHeld,
      run: Boolean(this.keys?.shift.isDown || touch.run),
      jumpHeld: jumpDown,
      jumpJustPressed: jumpJust,
      shootJustPressed: shootJust,
    };

    if (shootJust) {
      const shot = this.player.shootWaterBlaster();
      if (shot) {
        const b = this.playerBullets.create(shot.x, shot.y, 'proj_water') as Phaser.Physics.Arcade.Image;
        b.setDepth(22);
        const bBody = b.body as Phaser.Physics.Arcade.Body;
        bBody.setVelocity(shot.vx, shot.vy);
        bBody.setBounce(0.6);
        bBody.setGravityY(-650);
        this.time.delayedCall(1500, () => {
          if (b.active) b.destroy();
        });
      }
    }

    // Platform bergerak
    for (const mp of this.movingPlatforms) {
      mp.phase += mp.speed * dt;
      const nx = mp.startX + Math.sin(mp.phase) * mp.dx;
      const ny = mp.startY + Math.cos(mp.phase) * mp.dy;
      const deltaX = nx - mp.prevX;
      const deltaY = ny - mp.prevY;
      mp.rect.setPosition(nx, ny);
      mp.topBar.setPosition(nx, ny - mp.rect.height / 2 + 4);
      mp.body.updateFromGameObject();
      this.physics.collide(this.player.sprite, mp.rect);

      if (
        pBody.blocked.down &&
        Math.abs(px - nx) <= mp.rect.width * 0.55 &&
        Math.abs(pBody.bottom - mp.body.top) <= 12
      ) {
        this.player.sprite.x += deltaX;
        this.player.sprite.y += deltaY;
      }
      mp.prevX = nx;
      mp.prevY = ny;
    }

    // Platform rapuh
    for (const cp of this.collapsingPlatforms) {
      if (cp.rect.visible) {
        this.physics.collide(this.player.sprite, cp.rect, () => {
          if (!cp.triggered && (pBody.blocked.down || pBody.touching.down)) {
            cp.triggered = true;
            this.tweens.add({
              targets: cp.rect,
              x: cp.rect.x + 4,
              duration: 55,
              yoyo: true,
              repeat: 5,
              onComplete: () => {
                cp.rect.setVisible(false);
                cp.body.enable = false;
                this.time.delayedCall(2800, () => {
                  cp.rect.setVisible(true);
                  cp.rect.y = cp.originY;
                  cp.body.enable = true;
                  cp.body.updateFromGameObject();
                  cp.triggered = false;
                });
              },
            });
          }
        });
      }
    }

    // Gerbang waktu otomatis terbuka saat injak tombol hijau
    for (const gate of this.timedGates) {
      if (gate.door.visible) {
        this.physics.collide(this.player.sprite, gate.door);
      }
      if (Phaser.Math.Distance.Between(px, py, gate.switchObj.x, gate.switchObj.y) < 42) {
        if (gate.openTimer <= 0) {
          AudioManager.playSfx('SFX_015');
          this.showToast('Gerbang Waktu Terbuka Otomatis!', 1.6);
        }
        gate.openTimer = 5.5;
      }
      if (gate.openTimer > 0) {
        gate.openTimer -= dt;
        gate.door.y = Phaser.Math.Linear(gate.door.y, gate.closedY - 110, dt * 8);
        gate.body.updateFromGameObject();
      } else {
        gate.door.y = Phaser.Math.Linear(gate.door.y, gate.closedY, dt * 6);
        gate.body.updateFromGameObject();
      }
    }

    // Zona Kolam Air
    let inWater = false;
    for (const wz of this.waterZones) {
      if (wz.bounds.contains(px, py + 12)) {
        inWater = true;
        this.player.state.waterCurrentX = wz.currentX;
      }
    }
    if (inWater && !this.wasInWater) {
      AudioManager.playSfx('SFX_010');
      this.player.emitBurst('particle_splash', 8);
    }
    this.wasInWater = inWater;
    this.player.state.inWater = inWater;

    for (const wf of this.wetFloorZones) {
      if (wf.contains(px, pBody.bottom)) {
        this.player.state.wetFloorTimerMs = 150;
      }
    }

    for (const sz of this.slideZones) {
      if (sz.bounds.contains(px, py)) {
        this.player.startSlide(0.55);
        if (sz.isChallenge && !this.slideChallengeDone) {
          this.slideChallengeDone = true;
          this.missions.updateByType('challenge', 1);
          this.showToast('Tantangan Seluncuran Selesai!', 2.4);
          AudioManager.playSfx('SFX_016');
        }
      }
    }

    for (const z of this.ziplines) {
      if (!this.player.state.onZipline && Phaser.Math.Distance.Between(px, py, z.x1, z.y1 + 20) < 52) {
        this.player.attachZipline(z.x1, z.y1, z.x2, z.y2);
      }
    }

    for (const r of this.ropes) {
      if (
        !this.player.state.onRope &&
        !pBody.blocked.down &&
        Phaser.Math.Distance.Between(px, py, r.grab.x, r.grab.y) < 46 &&
        pBody.velocity.y > -60
      ) {
        this.player.attachRope(r.anchorX, r.anchorY, r.length);
      }
    }

    // AI Musuh Bervariasi + Skill Unik
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      this.updateEnemySkill(enemy, px, py, dt);
    }

    for (const sp of this.spinners) {
      sp.angle += 170 * dt;
    }

    for (const st of this.splashTraps) {
      st.timer = (st.timer + dt) % st.cycleSec;
      const phase = st.timer / st.cycleSec;
      st.warnRing.setVisible(phase > 0.5 && phase < 0.72);
      st.warnRing.setScale(0.8 + (phase - 0.5) * 2.5);
      st.active = phase >= 0.72;
      st.geyser.setVisible(st.active);
      if (st.active && Phaser.Geom.Rectangle.Overlaps(pBody as unknown as Phaser.Geom.Rectangle, st.geyser.getBounds())) {
        this.handleHazardHit(st.x);
      }
    }

    for (const tb of this.tippingBuckets) {
      tb.timer = (tb.timer + dt) % tb.cycleSec;
      const phase = tb.timer / tb.cycleSec;
      if (phase > 0.68 && phase < 0.85) {
        tb.sprite.angle = Math.sin((phase - 0.68) * 60) * 10;
      } else if (phase >= 0.85) {
        if (!tb.pouring) {
          tb.pouring = true;
          AudioManager.playSfx('SFX_010');
        }
        tb.sprite.angle = 36;
        tb.cascade.setVisible(true);
        if (Phaser.Geom.Rectangle.Overlaps(this.player.sprite.getBounds(), tb.cascade.getBounds())) {
          this.handleHazardHit(tb.x);
        }
      } else {
        tb.pouring = false;
        tb.sprite.angle = 0;
        tb.cascade.setVisible(false);
      }
    }

    for (const cp of this.checkpoints) {
      if (!cp.activated && Math.abs(px - cp.x) < 48 && Math.abs(py - cp.y) < 75) {
        cp.activated = true;
        this.player.setCheckpoint(cp.x, cp.y - 24);
        this.checkpointReached = true;
        this.checkpointLabel = cp.label;
        AudioManager.playSfx('SFX_015');
        this.showToast(`Checkpoint Tercapai: ${cp.label}`, 2.0);
        this.tweens.add({ targets: cp.flag, y: cp.flag.y - 10, duration: 220, yoyo: true });
      }
    }

    // Interaksi OTOMATIS untuk Peti Harta & Pos Satwa (Tanpa perlu tekan E!)
    for (const trig of this.autoTriggers) {
      if (trig.used) continue;
      if (Phaser.Math.Distance.Between(px, py, trig.x, trig.y) <= trig.radius) {
        trig.used = true;
        trig.onTrigger();
      }
    }

    if (py > this.worldDef.worldHeight - 28) {
      const damaged = this.player.takeDamage(1, 0);
      if (damaged && this.player.health <= 0) {
        this.triggerGameOver('Kamu terjatuh dari lintasan petualangan!');
        return;
      }
      AudioManager.playSfx('SFX_013');
      this.player.respawnAtCheckpoint();
      this.showToast('Kembali ke Checkpoint', 1.6);
    }

    this.player.update(dtMs, input, activeClimbZone);
    this.collectibles.updateMagnet(this.player, dt);
    this.camCtrl.update(dt, pBody.velocity.x);

    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastMessage = null;
    }

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.08) {
      this.hudSyncTimer = 0;
      this.pushHudSnapshot();
    }
  }

  private updateEnemySkill(e: EnemyEntry, px: number, py: number, dt: number): void {
    e.skillTimer += dt;
    const distX = px - e.sprite.x;
    const dist = Phaser.Math.Distance.Between(px, py, e.sprite.x, e.sprite.y);

    if (e.type === 'crab') {
      // Skill Kepiting: lari cepat (dash) saat sejajar dengan pemain!
      const isAligned = Math.abs(py - e.sprite.y) < 55 && Math.abs(distX) < 250;
      const mult = isAligned ? 1.85 : 1.0;
      if (isAligned) {
        e.dir = distX >= 0 ? 1 : -1;
        e.sprite.setTint(0xfca5a5);
      } else {
        e.sprite.clearTint();
      }
      e.sprite.x += e.dir * e.speed * mult * dt;
    } else if (e.type === 'puffer') {
      // Skill Ikan Buntal: mengambang & mengembang berduri setiap ~2.8 detik
      e.sprite.x += e.dir * e.speed * dt;
      const cycle = e.skillTimer % 2.8;
      e.isInflated = cycle > 1.75;
      const targetScale = e.isInflated ? 1.42 : 1.0;
      e.sprite.setScale(Phaser.Math.Linear(e.sprite.scaleX, targetScale, dt * 8));
      if (e.isInflated) {
        e.sprite.setTint(0xfda4af);
      } else {
        e.sprite.clearTint();
      }
      e.sprite.y = e.baseY + Math.sin(e.skillTimer * 3.2) * 14;
    } else if (e.type === 'wasp') {
      // Skill Tawon: terbang & menyambar ke bawah saat pemain mendekat
      e.sprite.x += e.dir * e.speed * dt;
      const swoopTarget = dist < 240 ? Math.min(55, Math.max(-20, py - e.baseY)) : 0;
      e.swoopOffsetY = Phaser.Math.Linear(e.swoopOffsetY, swoopTarget, dt * 3.6);
      e.sprite.y = e.baseY + Math.sin(e.skillTimer * 5.2) * 16 + e.swoopOffsetY;
    } else if (e.type === 'monkey') {
      // Skill Monyet: berpatroli & melempar kelapa ke pemain setiap 2.5 detik
      e.sprite.x += e.dir * e.speed * dt;
      if (dist < 470 && e.skillTimer >= 2.5) {
        e.skillTimer = 0;
        e.sprite.setFlipX(distX < 0);
        const dirSign = distX < 0 ? -1 : 1;
        const proj = this.enemyBullets.create(e.sprite.x + dirSign * 20, e.sprite.y - 12, 'proj_coconut') as Phaser.Physics.Arcade.Image;
        proj.setDepth(18);
        const pBody = proj.body as Phaser.Physics.Arcade.Body;
        pBody.setVelocity(dirSign * 240, -320);
        this.time.delayedCall(2600, () => {
          if (proj.active) proj.destroy();
        });
      }
    } else if (e.type === 'octo_bot') {
      // Skill Mini-Boss Gurita CAS: melompat & menyemburkan gelembung air ke dua arah
      e.sprite.x += e.dir * e.speed * dt;
      e.sprite.y = e.baseY - Math.abs(Math.sin(e.skillTimer * 2.1)) * 28;
      this.drawBossHpBar(e);
      if (dist < 560 && e.skillTimer >= 2.4) {
        e.skillTimer = 0;
        for (const vx of [-230, 0, 230]) {
          const proj = this.enemyBullets.create(e.sprite.x, e.sprite.y - 14, 'proj_coconut') as Phaser.Physics.Arcade.Image;
          proj.setDepth(18).setTint(0x38bdf8);
          (proj.body as Phaser.Physics.Arcade.Body).setVelocity(vx, -360);
          this.time.delayedCall(2400, () => {
            if (proj.active) proj.destroy();
          });
        }
      }
    }

    if (e.sprite.x <= e.minX) {
      e.sprite.x = e.minX;
      e.dir = 1;
    } else if (e.sprite.x >= e.maxX) {
      e.sprite.x = e.maxX;
      e.dir = -1;
    }
    if (e.type !== 'monkey') {
      e.sprite.setFlipX(e.dir < 0);
    }
  }

  private drawBossHpBar(e: EnemyEntry): void {
    if (!e.hpBar) {
      e.hpBar = this.add.graphics().setDepth(25);
    }
    e.hpBar.clear();
    const w = 54;
    const x = e.sprite.x - w / 2;
    const y = e.sprite.y - 54;
    e.hpBar.fillStyle(0x0f172a, 0.85);
    e.hpBar.fillRoundedRect(x - 2, y - 2, w + 4, 10, 4);
    e.hpBar.fillStyle(0xef4444, 1);
    e.hpBar.fillRoundedRect(x, y, Math.max(0, (e.hp / e.maxHp) * w), 6, 3);
  }

  private spawnSplashPop(x: number, y: number, tex: string): void {
    for (let i = 0; i < 6; i++) {
      const p = this.add.image(x, y, tex).setDepth(26);
      const ang = (i / 6) * Math.PI * 2;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * 30,
        y: y + Math.sin(ang) * 30 - 8,
        alpha: 0,
        scale: 0.2,
        duration: 280,
        onComplete: () => p.destroy(),
      });
    }
  }

  private spawnFloatingBanner(x: number, y: number, text: string, color: string): void {
    const txt = this.add
      .text(x, y, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color,
        stroke: '#0F172A',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(32);
    this.tweens.add({
      targets: txt,
      y: y - 42,
      alpha: 0,
      duration: 700,
      onComplete: () => txt.destroy(),
    });
  }

  protected showToast(msg: string, durationSec = 2.0): void {
    this.toastMessage = msg;
    this.toastTimer = durationSec;
  }

  protected pushHudSnapshot(): void {
    const progressPct = Math.min(100, Math.max(0, Math.round((this.player.sprite.x / (this.worldDef.worldWidth - 180)) * 100)));
    const proc = this.getProceduralConfig();
    GameManager.emitHud({
      worldId: this.worldDef.id,
      worldName: this.getCustomWorldName(),
      isProcedural: this.isProceduralRun(),
      proceduralStage: proc?.stage,
      difficulty: proc?.difficulty,
      coins: this.coinsCollected,
      tickets: this.ticketsCollected,
      diamonds: this.diamondsCollected,
      keys: this.keysHeld,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      powerTier: this.player.powerTier,
      comboCount: this.comboCount,
      score: this.score,
      enemiesDefeated: this.enemiesDefeated,
      hasShield: this.player.hasShield,
      magnetTimer: Math.ceil(this.player.magnetTimer),
      speedTimer: Math.ceil(this.player.speedTimer),
      progressPct,
      checkpointReached: this.checkpointReached,
      checkpointLabel: this.checkpointLabel,
      weather: this.weatherSystem.getCurrentInfo(),
      toastMessage: this.toastMessage,
      missions: this.missions.getStatus(),
    });
  }

  // ---- Helper Pembangun Level & Landmark CAS ----
  protected addPlatform(x: number, y: number, w: number, h: number, color?: number, topColor?: number, oneWay = false): void {
    const base = this.add.rectangle(x + w / 2, y + h / 2, w, h, color ?? this.worldDef.platformColor).setDepth(5);
    base.setStrokeStyle(2, 0x0f172a, 0.28);
    this.add.rectangle(x + w / 2, y + 5, w, 10, topColor ?? this.worldDef.platformTopColor).setDepth(6);
    this.physics.add.existing(base, true);
    if (oneWay) {
      this.oneWayPlatforms.add(base);
    } else {
      this.staticPlatforms.add(base);
    }
  }

  protected addMovingPlatform(x: number, y: number, w: number, h: number, dx: number, dy: number, speed = 1.6): void {
    const rect = this.add.rectangle(x, y, w, h, 0xf97316).setDepth(7).setStrokeStyle(2, 0x0f172a, 0.35);
    const topBar = this.add.rectangle(x, y - h / 2 + 4, w, 8, 0xfef08a).setDepth(8);
    this.physics.add.existing(rect, false);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.movingPlatforms.push({ rect, topBar, body, startX: x, startY: y, dx, dy, speed, phase: 0, prevX: x, prevY: y });
  }

  protected addCollapsingPlatform(x: number, y: number, w = 110): void {
    const rect = this.add.rectangle(x + w / 2, y + 12, w, 24, 0xb45309).setDepth(7).setStrokeStyle(2, 0x451a03);
    this.physics.add.existing(rect, false);
    const body = rect.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.collapsingPlatforms.push({ rect, body, originY: y + 12, triggered: false });
  }

  protected addWaterPool(x: number, y: number, w: number, h: number, currentX = 0): void {
    const fill = this.add.rectangle(x + w / 2, y + h / 2, w, h, this.worldDef.waterColor, 0.48).setDepth(12);
    fill.setStrokeStyle(2, 0x67e8f9, 0.7);
    const waveOverlay = this.add.graphics().setDepth(13);
    waveOverlay.fillStyle(0xe0f2fe, 0.65);
    for (let wx = x + 12; wx < x + w - 12; wx += 36) {
      waveOverlay.fillRoundedRect(wx, y + 3, 20, 4, 2);
    }
    this.waterZones.push({
      bounds: new Phaser.Geom.Rectangle(x, y, w, h),
      currentX,
      waveOverlay,
    });
  }

  protected addInflatableRing(x: number, y: number): void {
    const ring = this.physics.add.image(x, y, 'inflatable_ring').setImmovable(true).setDepth(14);
    (ring.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.tweens.add({ targets: ring, y: y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.bounceRings.push(ring);
  }

  protected addDivingBoard(x: number, y: number): void {
    const board = this.physics.add.image(x, y, 'diving_board').setImmovable(true).setDepth(14);
    (board.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.bounceRings.push(board);
  }

  protected addLadder(x: number, topY: number, bottomY: number, color = 0xfef08a): void {
    const h = bottomY - topY;
    const g = this.add.graphics().setDepth(8);
    g.lineStyle(5, 0x0f172a);
    g.lineBetween(x - 13, topY, x - 13, bottomY);
    g.lineBetween(x + 13, topY, x + 13, bottomY);
    g.lineStyle(3.5, color);
    g.lineBetween(x - 13, topY, x - 13, bottomY);
    g.lineBetween(x + 13, topY, x + 13, bottomY);
    for (let ry = topY + 14; ry < bottomY; ry += 22) {
      g.lineBetween(x - 13, ry, x + 13, ry);
    }
    // Zone mulai sedikit di atas dek (topY - 10) agar bisa memanjat hingga ke atas dek dan turun dengan panah bawah
    this.climbZones.push(new Phaser.Geom.Rectangle(x - 26, topY - 10, 52, h + 18));
  }

  protected addWaterSlide(x: number, y: number, w: number, h: number, isChallenge = false): void {
    const g = this.add.graphics().setDepth(9);
    g.fillStyle(0xf97316, 0.92);
    g.fillRoundedRect(x, y, w, h, 14);
    g.fillStyle(0x22c55e, 0.85);
    g.fillRoundedRect(x + 4, y + 4, w - 8, h - 8, 12);
    g.fillStyle(0x38bdf8, 0.72);
    g.fillRoundedRect(x + 10, y + 8, w - 20, h - 16, 10);
    this.slideZones.push({ bounds: new Phaser.Geom.Rectangle(x, y - 16, w, h + 16), isChallenge });
  }

  protected addWetFloor(x: number, y: number, w: number): void {
    this.add.rectangle(x + w / 2, y - 3, w, 6, 0x38bdf8, 0.85).setDepth(10);
    this.wetFloorZones.push(new Phaser.Geom.Rectangle(x, y - 14, w, 24));
  }

  protected addEnemy(x: number, y: number, type: EnemyKind, minX: number, maxX: number, speed?: number): void {
    const texMap: Record<EnemyKind, string> = {
      crab: 'enemy_crab',
      puffer: 'enemy_puffer',
      wasp: 'enemy_wasp',
      monkey: 'enemy_monkey',
      octo_bot: 'enemy_octo_bot',
    };
    const defaultSpeed: Record<EnemyKind, number> = {
      crab: 100,
      puffer: 65,
      wasp: 95,
      monkey: 55,
      octo_bot: 90,
    };
    const maxHp = type === 'octo_bot' ? 3 : 1;
    const sprite = this.physics.add.image(x, y, texMap[type]).setDepth(16).setImmovable(true);
    (sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.enemies.push({
      sprite,
      type,
      minX,
      maxX,
      baseY: y,
      speed: speed ?? defaultSpeed[type],
      dir: 1,
      hp: maxHp,
      maxHp,
      alive: true,
      skillTimer: Math.random() * 1.4,
      isInflated: false,
      swoopOffsetY: 0,
    });
  }

  protected addPatrolHazard(x: number, y: number, minX: number, maxX: number, tex: string, speed = 95): void {
    if (tex === 'obstacle_crab' || tex === 'enemy_crab') {
      this.addEnemy(x, y, 'crab', minX, maxX, speed);
      return;
    }
    const sprite = this.physics.add.image(x, y, tex).setDepth(16).setImmovable(true);
    (sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.enemies.push({
      sprite,
      type: 'crab',
      minX,
      maxX,
      baseY: y,
      speed,
      dir: 1,
      hp: 1,
      maxHp: 1,
      alive: true,
      skillTimer: 0,
      isInflated: false,
      swoopOffsetY: 0,
    });
  }

  protected addSpinner(x: number, y: number): void {
    const sp = this.physics.add.image(x, y, 'obstacle_spinner').setDepth(16).setImmovable(true);
    (sp.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.spinners.push(sp);
  }

  protected addSplashTrap(x: number, y: number, cycleSec = 3.2): void {
    const geyser = this.add.rectangle(x, y - 48, 32, 96, 0x38bdf8, 0.82).setDepth(15).setVisible(false);
    const warnRing = this.add.circle(x, y - 4, 18, 0xfef08a, 0.35).setStrokeStyle(2, 0xfacc15).setDepth(14).setVisible(false);
    this.splashTraps.push({ x, y, geyser, warnRing, timer: 0, cycleSec, active: false });
  }

  protected addTippingBucket(x: number, y: number, cycleSec = 4.0): void {
    const sprite = this.add.image(x, y, 'tipping_bucket').setDepth(15);
    const cascade = this.add.rectangle(x + 12, y + 90, 48, 130, 0x38bdf8, 0.72).setDepth(14).setVisible(false);
    this.tippingBuckets.push({ sprite, cascade, x, y, timer: 0, cycleSec, pouring: false });
  }

  protected addTimedGate(gateX: number, gateY: number, switchX: number, switchY: number): void {
    const door = this.add.rectangle(gateX, gateY, 24, 110, 0x64748b).setDepth(14).setStrokeStyle(2, 0x0f172a);
    this.physics.add.existing(door, false);
    const body = door.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    const switchObj = this.add.rectangle(switchX, switchY, 34, 12, 0x10b981).setDepth(14).setStrokeStyle(2, 0x0f172a);
    this.timedGates.push({ door, body, switchObj, openTimer: 0, closedY: gateY });
  }

  protected addTreasureChest(x: number, y: number): void {
    const chest = this.add.image(x, y, 'chest_closed').setDepth(14);
    this.autoTriggers.push({
      x,
      y,
      radius: 56,
      used: false,
      onTrigger: () => {
        chest.setTexture('chest_open');
        AudioManager.playSfx('SFX_009');
        this.coinsCollected += 20;
        this.treasuresCollected += 1;
        this.score += 180;
        this.missions.updateByType('coins', this.coinsCollected);
        this.missions.updateByType('treasures', this.treasuresCollected);
        this.player.emitBurst('particle_sparkle', 10);
        this.showToast('Peti Harta Terbuka Otomatis! +20 Koin', 2.2);
        this.pushHudSnapshot();
      },
    });
  }

  protected addZipline(x1: number, y1: number, x2: number, y2: number): void {
    const g = this.add.graphics().setDepth(9);
    g.lineStyle(4, 0x334155);
    g.lineBetween(x1, y1, x2, y2);
    const pulley = this.add.circle(x1, y1, 10, 0xfacc15).setStrokeStyle(2, 0x0f172a).setDepth(12);
    this.ziplines.push({ x1, y1, x2, y2, pulley });
  }

  protected addSwingingRope(anchorX: number, anchorY: number, length: number): void {
    const line = this.add.line(0, 0, anchorX, anchorY, anchorX, anchorY + length, 0xd97706).setOrigin(0, 0).setLineWidth(4).setDepth(11);
    const grab = this.add.circle(anchorX, anchorY + length, 10, 0xfacc15).setStrokeStyle(2, 0x0f172a).setDepth(12);
    this.ropes.push({ anchorX, anchorY, length, line, grab });
  }

  protected addCheckpoint(x: number, y: number, label: string): void {
    const flag = this.add.image(x, y - 36, 'checkpoint_flag').setDepth(11);
    this.checkpoints.push({ x, y, flag, activated: false, label });
  }

  protected addExitGate(x: number, y: number): void {
    this.exitGate = this.physics.add.image(x, y - 62, 'exit_gate').setImmovable(true).setDepth(12);
    (this.exitGate.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
  }

  protected addPalmTree(x: number, groundY: number): void {
    this.add.image(x, groundY - 82, 'palm_tree').setDepth(3);
  }

  protected addCasSponsorBoard(x: number, groundY: number): void {
    this.add.image(x, groundY - 58, 'cas_sponsor_board').setDepth(3);
  }

  protected addCasGazebo(x: number, groundY: number): void {
    this.add.image(x, groundY - 50, 'cas_gazebo').setDepth(4);
  }

  protected addCasZooGate(x: number, groundY: number): void {
    this.add.image(x, groundY - 66, 'cas_zoo_gate').setDepth(4);
  }

  protected addCasOctopus(x: number, groundY: number): void {
    const oct = this.add.image(x, groundY - 62, 'cas_octopus').setDepth(4);
    this.tweens.add({
      targets: oct,
      scaleY: 1.05,
      scaleX: 0.97,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  protected addWildlifeHabitat(x: number, groundY: number, animalKey: string, name: string): void {
    const animal = this.add.image(x + 58, groundY - 42, animalKey).setDepth(9);
    this.tweens.add({ targets: animal, y: animal.y - 6, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const station = this.add.image(x - 36, groundY - 24, 'feeding_station').setDepth(11);
    this.autoTriggers.push({
      x: station.x,
      y: station.y,
      radius: 68,
      used: false,
      onTrigger: () => {
        AudioManager.playSfx('SFX_019');
        this.habitatsVisited += 1;
        this.coinsCollected += 15;
        this.score += 160;
        this.missions.updateByType('habitats', this.habitatsVisited);
        this.missions.updateByType('coins', this.coinsCollected);
        this.player.emitBurst('particle_sparkle', 8);
        this.showToast(`Pos Satwa ${name} Dijelajahi! +15 Koin`, 2.2);
        this.pushHudSnapshot();
      },
    });
  }
}
