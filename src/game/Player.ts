import Phaser from 'phaser';
import { AudioManager } from './AudioManager';
import { CharacterId, PHYSICS_CONFIG } from './GameConfig';
import { GameManager } from './GameManager';
import { createInitialPlatformerState, PlatformerState, stepHorizontalVelocity } from './Physics';
import { SaveManager } from './SaveManager';

export interface PlayerInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  run: boolean;
  jumpJustPressed: boolean;
  jumpHeld: boolean;
  shootJustPressed: boolean;
}

export class PlayerController {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public blasterSprite: Phaser.GameObjects.Image;
  public state: PlatformerState;
  public charId: CharacterId;
  public health: number;
  public maxHealth: number;
  public powerTier: 1 | 2 | 3 = 1;
  public hasShield = false;
  public magnetTimer = 0;
  public speedTimer = 0;
  public invulnTimer = 0;
  public respawnX: number;
  public respawnY: number;
  public shieldRing: Phaser.GameObjects.Arc;
  public magnetRing: Phaser.GameObjects.Arc;
  public jumboRing: Phaser.GameObjects.Arc;

  private scene: Phaser.Scene;
  private ziplineTarget: { x1: number; y1: number; x2: number; y2: number } | null = null;
  private ziplineProgress = 0;
  private ropeAnchor: { x: number; y: number; len: number; angle: number; angVel: number } | null = null;
  private slideTimer = 0;
  private collectAnimTimer = 0;
  private trailTimer = 0;
  private shootCooldown = 0;
  private blasterRecoil = 0;
  private climbExitCooldown = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, charId: CharacterId) {
    this.scene = scene;
    this.charId = charId;
    this.respawnX = x;
    this.respawnY = y;
    this.state = createInitialPlatformerState();

    const save = SaveManager.getData();
    this.maxHealth = 3 + (save.inventory.extraLives > 0 ? 1 : 0);
    if (save.inventory.extraLives > 0) {
      SaveManager.consumeInventoryItem('extraLives');
    }
    this.health = this.maxHealth;

    if (save.inventory.shields > 0) {
      SaveManager.consumeInventoryItem('shields');
      this.hasShield = true;
    }
    if (save.inventory.magnets > 0) {
      SaveManager.consumeInventoryItem('magnets');
      this.magnetTimer = 25;
    }

    this.sprite = scene.physics.add.sprite(x, y, `char_${charId}_sheet`, 0);
    this.sprite.setDepth(20);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(32, 60);
    body.setOffset(28, 28);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(680, PHYSICS_CONFIG.maxFallSpeed);

    this.blasterSprite = scene.add.image(x + 22, y + 6, 'water_blaster_held').setDepth(22).setVisible(false);

    this.shieldRing = scene.add.circle(x, y, 44, 0x22d3ee, 0.14).setStrokeStyle(2.5, 0x67e8f9, 0.85).setDepth(21);
    this.shieldRing.setVisible(this.hasShield);

    this.magnetRing = scene.add.circle(x, y, 52, 0x818cf8, 0.08).setStrokeStyle(2, 0xa5b4fc, 0.7).setDepth(19);
    this.magnetRing.setVisible(this.magnetTimer > 0);

    this.jumboRing = scene.add.circle(x, y, 36, 0x4ade80, 0.1).setStrokeStyle(2, 0xfacc15, 0.65).setDepth(19).setVisible(false);

    this.sprite.play(`${charId}_idle`);
  }

  private getTierBaseScale(): number {
    return this.powerTier >= 2 ? 1.2 : 1.0;
  }

  public upgradePowerTier(targetTier: 2 | 3): { upgraded: boolean; bonusCoins: number } {
    if (targetTier === 2) {
      if (this.powerTier >= 2) {
        return { upgraded: false, bonusCoins: 15 };
      }
      this.setPowerTier(2);
      return { upgraded: true, bonusCoins: 0 };
    }
    if (this.powerTier >= 3) {
      return { upgraded: false, bonusCoins: 20 };
    }
    this.setPowerTier(3);
    return { upgraded: true, bonusCoins: 0 };
  }

  public setPowerTier(tier: 1 | 2 | 3): void {
    this.powerTier = tier;
    const s = this.getTierBaseScale();
    this.sprite.setScale(s);
    this.blasterSprite.setVisible(tier === 3);
    this.jumboRing.setVisible(tier >= 2);
    this.jumboRing.setScale(tier === 3 ? 1.15 : 1.0);
    this.emitRingPulse(tier === 3 ? 0x38bdf8 : tier === 2 ? 0x4ade80 : 0x94a3b8);
    if (tier >= 2) {
      this.squash(1.18, 1.18);
    }
  }

  public shootWaterBlaster(): { x: number; y: number; vx: number; vy: number } | null {
    if (this.powerTier < 3 || this.shootCooldown > 0) return null;
    this.shootCooldown = 0.24;
    this.blasterRecoil = 1;
    const dir = this.sprite.flipX ? -1 : 1;
    AudioManager.playSfx('SFX_011');
    return {
      x: this.sprite.x + dir * 32,
      y: this.sprite.y + 4,
      vx: dir * 640,
      vy: -135,
    };
  }

  public setCheckpoint(x: number, y: number): void {
    this.respawnX = x;
    this.respawnY = y;
  }

  public triggerCollectPose(): void {
    this.collectAnimTimer = 0.22;
  }

  public startSlide(durationSec = 0.7): void {
    if (this.slideTimer > 0) return;
    this.slideTimer = durationSec;
    this.state.isSliding = true;
    AudioManager.playSfx('SFX_012');
    const dir = this.sprite.flipX ? -1 : 1;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(dir * PHYSICS_CONFIG.slideSpeed);
  }

  public attachZipline(x1: number, y1: number, x2: number, y2: number): void {
    if (this.state.onZipline) return;
    this.state.onZipline = true;
    this.ziplineTarget = { x1, y1, x2, y2 };
    this.ziplineProgress = 0;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);
    AudioManager.playSfx('SFX_023');
  }

  public attachRope(anchorX: number, anchorY: number, length: number): void {
    if (this.state.onRope) return;
    this.state.onRope = true;
    this.ropeAnchor = {
      x: anchorX,
      y: anchorY,
      len: length,
      angle: -0.65,
      angVel: 2.2,
    };
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);
    AudioManager.playSfx('SFX_022');
  }

  public bounce(velY: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(velY);
    this.state.jumpsRemaining = 1;
    this.squash(0.82, 1.2);
    this.emitRingPulse(0xfacc15);
  }

  public takeDamage(amount = 1, knockDir = -1): boolean {
    if (this.invulnTimer > 0) return false;

    if (this.hasShield) {
      this.hasShield = false;
      this.shieldRing.setVisible(false);
      this.invulnTimer = 1.1;
      AudioManager.playSfx('SFX_010');
      this.emitRingPulse(0x22d3ee);
      this.scene.cameras.main.shake(110, 0.006);
      return false;
    }

    // Mekanik gaya Mario: jika punya Pistol Air (Tier 3) atau Mode Jumbo (Tier 2), turun tier tanpa kehilangan hati!
    if (this.powerTier === 3) {
      this.setPowerTier(2);
      this.invulnTimer = 1.4;
      AudioManager.playSfx('SFX_014');
      this.scene.cameras.main.shake(130, 0.008);
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(knockDir * 210, -300);
      return false;
    }
    if (this.powerTier === 2) {
      this.setPowerTier(1);
      this.invulnTimer = 1.4;
      AudioManager.playSfx('SFX_014');
      this.scene.cameras.main.shake(130, 0.008);
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(knockDir * 210, -300);
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    this.invulnTimer = 1.45;
    AudioManager.playSfx('SFX_014');
    this.scene.cameras.main.shake(160, 0.01);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(knockDir * 220, -340);
    this.sprite.play(`${this.charId}_damage`, true);
    return true;
  }

  public respawnAtCheckpoint(): void {
    this.sprite.setPosition(this.respawnX, this.respawnY);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAllowGravity(true);
    this.state.onZipline = false;
    this.state.onRope = false;
    this.state.isClimbing = false;
    this.invulnTimer = 1.2;
  }

  public update(dtMs: number, input: PlayerInput, activeClimbZone: Phaser.Geom.Rectangle | null): void {
    const dt = dtMs / 1000;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const save = SaveManager.getData();

    const speedMult =
      (1 + save.speedUpgradeLevel * 0.1) *
      (this.speedTimer > 0 ? 1.32 : 1) *
      this.state.weatherSpeedMult;
    const jumpMult = 1 + save.jumpUpgradeLevel * 0.1;

    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - dt);
      this.sprite.setAlpha(Math.floor(this.invulnTimer * 16) % 2 === 0 ? 0.45 : 1);
    } else {
      this.sprite.setAlpha(1);
    }

    if (this.shootCooldown > 0) this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    if (this.climbExitCooldown > 0) this.climbExitCooldown = Math.max(0, this.climbExitCooldown - dt);
    if (this.blasterRecoil > 0) this.blasterRecoil = Math.max(0, this.blasterRecoil - dt * 8);
    if (this.magnetTimer > 0) this.magnetTimer = Math.max(0, this.magnetTimer - dt);
    if (this.speedTimer > 0) this.speedTimer = Math.max(0, this.speedTimer - dt);
    if (this.collectAnimTimer > 0) this.collectAnimTimer = Math.max(0, this.collectAnimTimer - dt);

    const dirSign = this.sprite.flipX ? -1 : 1;
    this.blasterSprite.setVisible(this.powerTier === 3 && !this.state.isClimbing);
    this.blasterSprite.setFlipX(this.sprite.flipX);
    this.blasterSprite.setPosition(
      this.sprite.x + dirSign * (24 - this.blasterRecoil * 6),
      this.sprite.y + 7
    );
    this.blasterSprite.setScale(this.powerTier >= 2 ? 1.15 : 1.0);

    this.shieldRing.setPosition(this.sprite.x, this.sprite.y);
    this.shieldRing.setVisible(this.hasShield);
    this.magnetRing.setPosition(this.sprite.x, this.sprite.y);
    this.magnetRing.setVisible(this.magnetTimer > 0);
    if (this.magnetTimer > 0) {
      this.magnetRing.setScale(0.95 + Math.sin(this.scene.time.now * 0.008) * 0.1);
    }
    this.jumboRing.setPosition(this.sprite.x, this.sprite.y);
    this.jumboRing.setVisible(this.powerTier >= 2);
    if (this.powerTier >= 2) {
      this.jumboRing.setStrokeStyle(2, this.powerTier === 3 ? 0x38bdf8 : 0xfacc15, 0.55);
    }

    // Mode Zipline / Flying Fox
    if (this.state.onZipline && this.ziplineTarget) {
      const { x1, y1, x2, y2 } = this.ziplineTarget;
      const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
      this.ziplineProgress += (PHYSICS_CONFIG.ziplineSpeed * dt) / Math.max(1, dist);
      const t = Math.min(1, this.ziplineProgress);
      this.sprite.setPosition(Phaser.Math.Linear(x1, x2, t), Phaser.Math.Linear(y1, y2, t) + 32);
      this.sprite.setFlipX(x2 < x1);
      this.playSafe(`${this.charId}_slide`);
      this.trailTimer += dt;
      if (this.trailTimer > 0.06) {
        this.trailTimer = 0;
        this.emitBurst('particle_sparkle', 1);
      }
      if (t >= 1 || input.jumpJustPressed) {
        this.state.onZipline = false;
        this.ziplineTarget = null;
        body.setAllowGravity(true);
        body.setVelocity(x2 >= x1 ? 260 : -260, -240);
        this.state.jumpsRemaining = 1;
      }
      return;
    }

    // Mode Ayunan Tali
    if (this.state.onRope && this.ropeAnchor) {
      const r = this.ropeAnchor;
      const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      r.angVel += (-4.2 * Math.sin(r.angle) + steer * 2.4) * dt;
      r.angVel *= 0.995;
      r.angle += r.angVel * dt;
      const px = r.x + Math.sin(r.angle) * r.len;
      const py = r.y + Math.cos(r.angle) * r.len;
      this.sprite.setPosition(px, py);
      this.sprite.setFlipX(r.angVel < 0);
      this.playSafe(`${this.charId}_climb`);
      if (input.jumpJustPressed) {
        this.state.onRope = false;
        body.setAllowGravity(true);
        body.setVelocity(r.angVel * 190 + steer * 150, -450 * jumpMult);
        this.state.jumpsRemaining = 1;
        AudioManager.playSfx('SFX_002');
      }
      return;
    }

    const onGround = body.blocked.down || body.touching.down;

    if (onGround && !this.state.wasOnGround && body.velocity.y >= 0) {
      AudioManager.playSfx('SFX_004');
      this.squash(1.16, 0.84);
      this.emitBurst('particle_dust', 5);
    }
    this.state.wasOnGround = onGround;

    if (onGround) {
      this.state.coyoteTimerMs = PHYSICS_CONFIG.coyoteTimeMs;
      this.state.jumpsRemaining = this.state.maxJumps;
    } else {
      this.state.coyoteTimerMs = Math.max(0, this.state.coyoteTimerMs - dtMs);
    }

    if (input.jumpJustPressed) {
      this.state.jumpBufferTimerMs = PHYSICS_CONFIG.jumpBufferMs;
    } else {
      this.state.jumpBufferTimerMs = Math.max(0, this.state.jumpBufferTimerMs - dtMs);
    }

    // Sistem Panjat Tangga Mulus (naik tembus platform atas & bisa turun dari dek atas)
    if (activeClimbZone && ((input.up && this.climbExitCooldown <= 0) || input.down)) {
      this.state.isClimbing = true;
    } else if (!activeClimbZone) {
      this.state.isClimbing = false;
    }

    if (this.state.isClimbing && activeClimbZone) {
      body.setAllowGravity(false);
      body.setGravityY(0);
      const climbY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      const climbX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      if (climbX === 0) {
        this.sprite.x = Phaser.Math.Linear(this.sprite.x, activeClimbZone.centerX, dt * 10);
      }
      body.setVelocity(climbX * 165, climbY * PHYSICS_CONFIG.climbSpeed);
      this.state.jumpsRemaining = this.state.maxJumps;

      // Mencapai ujung atas tangga: melangkah mulus ke atas dek tanpa menempel lagi
      if (input.up && body.bottom <= activeClimbZone.top + 14) {
        this.state.isClimbing = false;
        this.climbExitCooldown = 0.28;
        body.setAllowGravity(true);
        body.setVelocityY(-230);
      } else if (input.down && onGround && body.bottom >= activeClimbZone.bottom - 10) {
        this.state.isClimbing = false;
        body.setAllowGravity(true);
      } else if (input.jumpJustPressed) {
        this.state.isClimbing = false;
        this.climbExitCooldown = 0.22;
        body.setAllowGravity(true);
        body.setVelocityY(PHYSICS_CONFIG.jumpVelocity * jumpMult);
        AudioManager.playSfx('SFX_002');
      }

      if (climbY !== 0 || climbX !== 0) {
        this.playSafe(`${this.charId}_climb`);
      } else if (this.sprite.anims.isPlaying) {
        this.sprite.anims.pause();
      }
      GameManager.touchInput.jumpJustPressed = false;
      return;
    } else {
      body.setAllowGravity(true);
    }

    if (this.slideTimer > 0) {
      this.slideTimer = Math.max(0, this.slideTimer - dt);
      if (this.slideTimer === 0) this.state.isSliding = false;
    }

    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir !== 0) {
      this.sprite.setFlipX(dir < 0);
    }

    if (!this.state.isSliding) {
      const nextVx = stepHorizontalVelocity({
        currentVx: body.velocity.x,
        dir,
        isRunning: input.run || this.speedTimer > 0,
        onGround,
        inWater: this.state.inWater,
        onWetFloor: this.state.wetFloorTimerMs > 0,
        speedMultiplier: speedMult,
        waterCurrentX: this.state.waterCurrentX,
        weatherWindX: this.state.weatherWindX,
        dt,
      });
      body.setVelocityX(nextVx);
    }

    if (this.state.inWater) {
      body.setGravityY(-PHYSICS_CONFIG.gravity + PHYSICS_CONFIG.swimGravity);
      if (input.jumpJustPressed || input.up) {
        body.setVelocityY(PHYSICS_CONFIG.swimUpVelocity);
        AudioManager.playSfx('SFX_011');
        this.emitBurst('particle_bubble', 4);
      }
      this.state.jumpsRemaining = this.state.maxJumps;
    } else {
      body.setGravityY(0);
      if (this.state.jumpBufferTimerMs > 0) {
        if (this.state.coyoteTimerMs > 0) {
          body.setVelocityY(PHYSICS_CONFIG.jumpVelocity * jumpMult);
          this.state.coyoteTimerMs = 0;
          this.state.jumpBufferTimerMs = 0;
          this.state.jumpsRemaining = this.state.maxJumps - 1;
          AudioManager.playSfx('SFX_002');
          this.squash(0.84, 1.18);
          this.emitBurst('particle_dust', 4);
        } else if (this.state.jumpsRemaining > 0) {
          body.setVelocityY(PHYSICS_CONFIG.doubleJumpVelocity * jumpMult);
          this.state.jumpsRemaining -= 1;
          this.state.jumpBufferTimerMs = 0;
          AudioManager.playSfx('SFX_003');
          this.squash(0.85, 1.16);
          this.emitRingPulse(0x38bdf8);
          this.emitBurst('particle_sparkle', 7);
          this.playSafe(`${this.charId}_doubleJump`, true);
        }
      }

      if (!input.jumpHeld && body.velocity.y < -140) {
        body.setVelocityY(body.velocity.y * PHYSICS_CONFIG.jumpCutMultiplier);
      }
    }

    if (onGround && Math.abs(body.velocity.x) > 250) {
      this.trailTimer += dt;
      if (this.trailTimer > 0.08) {
        this.trailTimer = 0;
        this.emitBurst(this.speedTimer > 0 ? 'particle_sparkle' : 'particle_dust', 1);
      }
    }

    if (this.collectAnimTimer > 0) {
      this.playSafe(`${this.charId}_collect`);
    } else if (this.state.isSliding) {
      this.playSafe(`${this.charId}_slide`);
    } else if (this.state.inWater) {
      this.playSafe(`${this.charId}_swim`);
    } else if (!onGround) {
      if (body.velocity.y < 0) {
        if (this.sprite.anims.currentAnim?.key !== `${this.charId}_doubleJump`) {
          this.playSafe(`${this.charId}_jump`);
        }
      } else {
        this.playSafe(`${this.charId}_fall`);
      }
    } else if (Math.abs(body.velocity.x) > 25) {
      this.playSafe(`${this.charId}_run`);
      if (Math.abs(body.velocity.x) > 120) {
        AudioManager.playSfx('SFX_005');
      }
    } else {
      this.playSafe(`${this.charId}_idle`);
    }

    this.state.waterCurrentX = 0;
    this.state.wetFloorTimerMs = Math.max(0, this.state.wetFloorTimerMs - dtMs);
    GameManager.touchInput.jumpJustPressed = false;
  }

  private playSafe(key: string, restart = false): void {
    if (!this.scene.anims.exists(key)) return;
    if (this.sprite.anims.isPaused) this.sprite.anims.resume();
    if (restart || this.sprite.anims.currentAnim?.key !== key) {
      this.sprite.play(key, true);
    }
  }

  public squash(sx: number, sy: number): void {
    const base = this.getTierBaseScale();
    this.sprite.setScale(sx * base, sy * base);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: base,
      scaleY: base,
      duration: 150,
      ease: 'Back.easeOut',
    });
  }

  public emitRingPulse(color: number): void {
    const ring = this.scene.add.circle(this.sprite.x, this.sprite.y + 18, 12, color, 0.25).setStrokeStyle(3, color, 0.9).setDepth(24);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.3,
      alpha: 0,
      duration: 240,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  public emitBurst(texture: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.image(this.sprite.x, this.sprite.y + 18, texture).setDepth(25);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.FloatBetween(35, 115);
      this.scene.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * speed,
        y: p.y + Math.sin(angle) * speed - 18,
        alpha: 0,
        scale: 0.25,
        duration: 380,
        onComplete: () => p.destroy(),
      });
    }
  }
}
