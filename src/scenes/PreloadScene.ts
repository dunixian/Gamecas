import Phaser from 'phaser';
import { WORLDS } from '../game/GameConfig';
import { GameManager } from '../game/GameManager';
import { buildAllProceduralTextures, registerCharacterAnimations } from '../game/TextureFactory';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  public preload(): void {
    this.load.on('progress', (val: number) => {
      GameManager.emitLoadProgress(Math.round(val * 90));
    });

    for (const world of WORLDS) {
      this.load.image(`bg_world_${world.id}`, world.bgAsset);
    }
    this.load.image('bg_menu', '/assets/ui/UI_002_menu_bg.jpg');
  }

  public create(): void {
    buildAllProceduralTextures(this);
    registerCharacterAnimations(this, 'boy');
    registerCharacterAnimations(this, 'girl');
    GameManager.emitLoadProgress(100);
    GameManager.emitPreloadReady();
    this.scene.start('MenuScene');
  }
}
