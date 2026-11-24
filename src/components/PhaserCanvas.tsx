import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { PHYSICS_CONFIG, WORLDS } from '../game/GameConfig';
import { GameManager } from '../game/GameManager';
import { BootScene } from '../scenes/BootScene';
import { CharacterScene } from '../scenes/CharacterScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { LevelSelectScene } from '../scenes/LevelSelectScene';
import { MenuScene } from '../scenes/MenuScene';
import { OutboundScene } from '../scenes/OutboundScene';
import { PoolScene } from '../scenes/PoolScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { ProceduralScene } from '../scenes/ProceduralScene';
import { VictoryScene } from '../scenes/VictoryScene';
import { WaterparkScene } from '../scenes/WaterparkScene';
import { WildlifeScene } from '../scenes/WildlifeScene';

export function PhaserCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1280,
      height: 720,
      backgroundColor: '#0891b2',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: PHYSICS_CONFIG.gravity },
          debug: false,
        },
      },
      scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        CharacterScene,
        LevelSelectScene,
        PoolScene,
        WaterparkScene,
        WildlifeScene,
        OutboundScene,
        ProceduralScene,
        VictoryScene,
        GameOverScene,
      ],
    };

    const game = new Phaser.Game(config);
    for (const w of WORLDS) {
      game.registry.set(`world_${w.id}`, w);
    }
    GameManager.registerGame(game);

    const handleBlur = () => {
      GameManager.resetTouchInput();
      for (const scene of game.scene.getScenes(true)) {
        scene.input?.keyboard?.resetKeys();
      }
    };
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
      GameManager.unregisterGame();
    };
  }, []);

  return <div ref={containerRef} id="phaser-root" className="w-full h-full overflow-hidden" />;
}
