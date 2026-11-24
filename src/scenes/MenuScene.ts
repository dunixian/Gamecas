import Phaser from 'phaser';
import { AudioManager } from '../game/AudioManager';

export class MenuScene extends Phaser.Scene {
  private bgImage?: Phaser.GameObjects.Image;

  constructor() {
    super('MenuScene');
  }

  public create(): void {
    const { width, height } = this.scale;
    if (this.textures.exists('bg_menu')) {
      this.bgImage = this.add.image(width / 2, height / 2, 'bg_menu');
      const scale = Math.max(width / this.bgImage.width, height / this.bgImage.height);
      this.bgImage.setScale(scale);
    } else {
      this.cameras.main.setBackgroundColor(0x0891b2);
    }

    AudioManager.playMusic('MUS_001');
  }
}
