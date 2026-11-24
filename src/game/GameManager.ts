import Phaser from 'phaser';
import { DifficultyId, WorldId } from './GameConfig';
import { MissionProgressItem } from './MissionSystem';
import { WeatherInfo } from './WeatherSystem';

export interface TouchInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
  shootJustPressed: boolean;
  run: boolean;
}

export interface ProceduralRunConfig {
  themeWorldId: WorldId;
  difficulty: DifficultyId;
  stage: number;
  seed: number;
}

export interface HudSnapshot {
  worldId: WorldId;
  worldName: string;
  isProcedural: boolean;
  proceduralStage?: number;
  difficulty?: DifficultyId;
  coins: number;
  tickets: number;
  diamonds: number;
  keys: number;
  health: number;
  maxHealth: number;
  powerTier: 1 | 2 | 3; // 1=Normal, 2=Kelapa Jumbo (Besar), 3=Pistol Air (Blaster)
  comboCount: number;
  score: number;
  enemiesDefeated: number;
  hasShield: boolean;
  magnetTimer: number;
  speedTimer: number;
  progressPct: number;
  checkpointReached: boolean;
  checkpointLabel: string;
  weather: WeatherInfo;
  toastMessage: string | null;
  missions: MissionProgressItem[];
}

export interface VictorySummary {
  worldId: WorldId;
  worldName: string;
  isProcedural: boolean;
  proceduralConfig?: ProceduralRunConfig;
  coinsCollected: number;
  ticketsCollected: number;
  diamondsCollected: number;
  enemiesDefeated: number;
  score: number;
  missions: MissionProgressItem[];
  stars: number;
  missionRewardCoins: number;
  newlyUnlockedWorld: WorldId | null;
  newAchievements: string[];
}

export interface GameOverSummary {
  worldId: WorldId;
  worldName: string;
  isProcedural: boolean;
  proceduralConfig?: ProceduralRunConfig;
  coinsCollected: number;
  ticketsCollected: number;
  enemiesDefeated: number;
  score: number;
  reason: string;
}

type Listener<T> = (payload: T) => void;

class GameManagerClass {
  private game: Phaser.Game | null = null;
  private activeWorldId: WorldId = 1;
  private activeMode: 'story' | 'procedural' = 'story';
  private proceduralConfig: ProceduralRunConfig = {
    themeWorldId: 1,
    difficulty: 'seru',
    stage: 1,
    seed: Date.now(),
  };

  private hudListeners: Set<Listener<HudSnapshot>> = new Set();
  private loadListeners: Set<Listener<number>> = new Set();
  private victoryListeners: Set<Listener<VictorySummary>> = new Set();
  private gameOverListeners: Set<Listener<GameOverSummary>> = new Set();
  private readyListeners: Set<() => void> = new Set();

  public touchInput: TouchInputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jumpHeld: false,
    jumpJustPressed: false,
    shootJustPressed: false,
    run: false,
  };

  public registerGame(game: Phaser.Game): void {
    this.game = game;
  }

  public unregisterGame(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  public getGame(): Phaser.Game | null {
    return this.game;
  }

  public getActiveWorldId(): WorldId {
    return this.activeWorldId;
  }

  public getProceduralConfig(): ProceduralRunConfig {
    return this.proceduralConfig;
  }

  private stopAllPlayableScenes(): void {
    if (!this.game) return;
    for (const key of ['PoolScene', 'WaterparkScene', 'WildlifeScene', 'OutboundScene', 'ProceduralScene']) {
      if (this.game.scene.isActive(key) || this.game.scene.isPaused(key)) {
        this.game.scene.stop(key);
      }
    }
  }

  public startWorld(worldId: WorldId): void {
    this.activeMode = 'story';
    this.activeWorldId = worldId;
    this.resetTouchInput();
    if (!this.game) return;
    const sceneMap: Record<WorldId, string> = {
      1: 'PoolScene',
      2: 'WaterparkScene',
      3: 'WildlifeScene',
      4: 'OutboundScene',
    };
    this.stopAllPlayableScenes();
    this.game.scene.start(sceneMap[worldId]);
  }

  public startProceduralLevel(config: ProceduralRunConfig): void {
    this.activeMode = 'procedural';
    this.activeWorldId = config.themeWorldId;
    this.proceduralConfig = config;
    this.resetTouchInput();
    if (!this.game) return;
    this.stopAllPlayableScenes();
    this.game.registry.set('procedural_config', config);
    this.game.scene.start('ProceduralScene');
  }

  public pauseActiveWorld(): void {
    if (!this.game) return;
    const sceneKey = this.getActiveSceneKey();
    if (this.game.scene.isActive(sceneKey)) {
      this.game.scene.pause(sceneKey);
    }
  }

  public resumeActiveWorld(): void {
    if (!this.game) return;
    const sceneKey = this.getActiveSceneKey();
    if (this.game.scene.isPaused(sceneKey)) {
      this.game.scene.resume(sceneKey);
    }
  }

  public stopActiveWorld(): void {
    if (!this.game) return;
    this.stopAllPlayableScenes();
    if (this.game.scene.isSleeping('MenuScene') || !this.game.scene.isActive('MenuScene')) {
      this.game.scene.start('MenuScene');
    }
  }

  public restartActiveWorld(): void {
    if (this.activeMode === 'procedural') {
      this.startProceduralLevel(this.proceduralConfig);
    } else {
      this.startWorld(this.activeWorldId);
    }
  }

  public getActiveSceneKey(): string {
    if (this.activeMode === 'procedural') return 'ProceduralScene';
    const sceneMap: Record<WorldId, string> = {
      1: 'PoolScene',
      2: 'WaterparkScene',
      3: 'WildlifeScene',
      4: 'OutboundScene',
    };
    return sceneMap[this.activeWorldId];
  }

  public resetTouchInput(): void {
    this.touchInput.left = false;
    this.touchInput.right = false;
    this.touchInput.up = false;
    this.touchInput.down = false;
    this.touchInput.jumpHeld = false;
    this.touchInput.jumpJustPressed = false;
    this.touchInput.shootJustPressed = false;
    this.touchInput.run = false;
  }

  public setTouchButton(button: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'shoot', pressed: boolean): void {
    if (button === 'left') this.touchInput.left = pressed;
    if (button === 'right') this.touchInput.right = pressed;
    if (button === 'up') this.touchInput.up = pressed;
    if (button === 'down') this.touchInput.down = pressed;
    if (button === 'run') this.touchInput.run = pressed;
    if (button === 'jump') {
      if (pressed && !this.touchInput.jumpHeld) {
        this.touchInput.jumpJustPressed = true;
      }
      this.touchInput.jumpHeld = pressed;
    }
    if (button === 'shoot' && pressed) {
      this.touchInput.shootJustPressed = true;
    }
  }

  public emitHud(snapshot: HudSnapshot): void {
    this.hudListeners.forEach((fn) => fn(snapshot));
  }

  public emitLoadProgress(progress: number): void {
    this.loadListeners.forEach((fn) => fn(progress));
  }

  public emitPreloadReady(): void {
    this.readyListeners.forEach((fn) => fn());
  }

  public emitVictory(summary: VictorySummary): void {
    this.victoryListeners.forEach((fn) => fn(summary));
  }

  public emitGameOver(summary: GameOverSummary): void {
    this.gameOverListeners.forEach((fn) => fn(summary));
  }

  public onHud(fn: Listener<HudSnapshot>): () => void {
    this.hudListeners.add(fn);
    return () => this.hudListeners.delete(fn);
  }

  public onLoadProgress(fn: Listener<number>): () => void {
    this.loadListeners.add(fn);
    return () => this.loadListeners.delete(fn);
  }

  public onPreloadReady(fn: () => void): () => void {
    this.readyListeners.add(fn);
    return () => this.readyListeners.delete(fn);
  }

  public onVictory(fn: Listener<VictorySummary>): () => void {
    this.victoryListeners.add(fn);
    return () => this.victoryListeners.delete(fn);
  }

  public onGameOver(fn: Listener<GameOverSummary>): () => void {
    this.gameOverListeners.add(fn);
    return () => this.gameOverListeners.delete(fn);
  }
}

export const GameManager = new GameManagerClass();
