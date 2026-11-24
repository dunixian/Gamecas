import Phaser from 'phaser';

export class CameraController {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private shakeIntensity = 0;

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.camera = scene.cameras.main;
    this.camera.setBounds(0, 0, worldWidth, worldHeight);
    this.camera.setRoundPixels(true);
  }

  public follow(target: Phaser.GameObjects.Components.Transform & Phaser.Physics.Arcade.Components.Velocity): void {
    this.camera.startFollow(target as unknown as Phaser.GameObjects.GameObject, true, 0.12, 0.14, -70, 30);
  }

  public update(dt: number, targetVx: number): void {
    // Subtle look-ahead along movement direction
    const targetOffsetX = Phaser.Math.Clamp(-targetVx * 0.16, -95, 55);
    this.camera.followOffset.x = Phaser.Math.Linear(this.camera.followOffset.x, targetOffsetX, Math.min(1, dt * 4));
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 20);
    }
  }

  public shake(durationMs = 140, intensity = 0.008): void {
    this.camera.shake(durationMs, intensity);
  }

  public flash(durationMs = 180, r = 255, g = 255, b = 255): void {
    this.camera.flash(durationMs, r, g, b, false);
  }
}
