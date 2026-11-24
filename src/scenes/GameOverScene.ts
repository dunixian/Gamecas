import Phaser from 'phaser';
import { AudioManager } from '../game/AudioManager';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(0x0f172a);
    AudioManager.playMusic('MUS_007');
  }
}
