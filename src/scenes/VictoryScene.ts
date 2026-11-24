import Phaser from 'phaser';
import { AudioManager } from '../game/AudioManager';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(0x0f172a);
    AudioManager.playMusic('MUS_006');
  }
}
