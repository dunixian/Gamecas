import Phaser from 'phaser';

export class CharacterScene extends Phaser.Scene {
  constructor() {
    super('CharacterScene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(0x0f172a);
  }
}
