import Phaser from 'phaser';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(0x0c4a6e);
  }
}
