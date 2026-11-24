import { useCallback, useEffect, useState } from 'react';
import { AboutCasModal } from './components/AboutCasModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { GameHud } from './components/GameHud';
import { GameOverModal, LoadingOverlay, PauseModal, VictoryModal } from './components/GameModals';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PhaserCanvas } from './components/PhaserCanvas';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { TitleScreen } from './components/TitleScreen';
import { AudioManager } from './game/AudioManager';
import { ScreenState, WorldId } from './game/GameConfig';
import { GameManager, GameOverSummary, HudSnapshot, ProceduralRunConfig, VictorySummary } from './game/GameManager';
import { WEATHER_DEFINITIONS } from './game/WeatherSystem';

const INITIAL_HUD: HudSnapshot = {
  worldId: 1,
  worldName: 'Petualangan Kolam Renang',
  isProcedural: false,
  coins: 0,
  tickets: 0,
  diamonds: 0,
  keys: 0,
  health: 3,
  maxHealth: 3,
  powerTier: 1,
  comboCount: 0,
  score: 0,
  enemiesDefeated: 0,
  hasShield: false,
  magnetTimer: 0,
  speedTimer: 0,
  progressPct: 0,
  checkpointReached: false,
  checkpointLabel: 'Awal',
  weather: WEATHER_DEFINITIONS.sunny,
  toastMessage: null,
  missions: [],
};

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('LOADING');
  const [aboutReturnScreen, setAboutReturnScreen] = useState<ScreenState>('TITLE');
  const [levelReturnScreen, setLevelReturnScreen] = useState<ScreenState>('TITLE');
  const [loadProgress, setLoadProgress] = useState(10);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [victory, setVictory] = useState<VictorySummary | null>(null);
  const [gameOver, setGameOver] = useState<GameOverSummary | null>(null);

  useEffect(() => {
    const unsubLoad = GameManager.onLoadProgress((p) => setLoadProgress(p));
    const unsubReady = GameManager.onPreloadReady(() => setScreen('TITLE'));
    const unsubHud = GameManager.onHud((snap) => setHud(snap));
    const unsubVic = GameManager.onVictory((sum) => {
      setVictory(sum);
      setScreen('VICTORY');
      AudioManager.playMusic('MUS_006');
    });
    const unsubOver = GameManager.onGameOver((sum) => {
      setGameOver(sum);
      setScreen('GAME_OVER');
      AudioManager.playMusic('MUS_007');
    });

    return () => {
      unsubLoad();
      unsubReady();
      unsubHud();
      unsubVic();
      unsubOver();
    };
  }, []);

  const startWorld = useCallback((worldId: WorldId) => {
    AudioManager.unlock();
    setVictory(null);
    setGameOver(null);
    setScreen('PLAYING');
    GameManager.startWorld(worldId);
  }, []);

  const startProcedural = useCallback((config: ProceduralRunConfig) => {
    AudioManager.unlock();
    setVictory(null);
    setGameOver(null);
    setScreen('PLAYING');
    GameManager.startProceduralLevel(config);
  }, []);

  const pauseGame = useCallback(() => {
    GameManager.pauseActiveWorld();
    setScreen('PAUSED');
  }, []);

  const resumeGame = useCallback(() => {
    GameManager.resumeActiveWorld();
    setScreen('PLAYING');
  }, []);

  const restartWorld = useCallback(() => {
    setVictory(null);
    setGameOver(null);
    setScreen('PLAYING');
    GameManager.restartActiveWorld();
  }, []);

  const returnToMenu = useCallback(() => {
    GameManager.stopActiveWorld();
    AudioManager.playMusic('MUS_001');
    setVictory(null);
    setGameOver(null);
    setScreen('TITLE');
  }, []);

  const handlePlayFromTitle = useCallback(() => {
    startWorld(GameManager.getActiveWorldId());
  }, [startWorld]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && screen === 'PLAYING') {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        if (screen === 'PLAYING') pauseGame();
        else if (screen === 'PAUSED') resumeGame();
        else if (screen === 'ABOUT_CAS') setScreen(aboutReturnScreen);
        else if (screen === 'LEVEL_SELECT') setScreen(levelReturnScreen);
        else if (
          screen === 'CHARACTER_SELECT' ||
          screen === 'SHOP' ||
          screen === 'SETTINGS' ||
          screen === 'HOW_TO_PLAY'
        ) {
          setScreen('TITLE');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, aboutReturnScreen, levelReturnScreen, pauseGame, resumeGame]);

  const inGameplay =
    screen === 'PLAYING' ||
    screen === 'PAUSED' ||
    screen === 'VICTORY' ||
    screen === 'GAME_OVER' ||
    (screen === 'ABOUT_CAS' && aboutReturnScreen === 'PAUSED') ||
    (screen === 'LEVEL_SELECT' && levelReturnScreen === 'PAUSED');

  return (
    <main
      className="relative h-screen w-screen overflow-hidden bg-slate-950"
      onPointerDown={() => AudioManager.unlock()}
    >
      <div className={`absolute inset-0 ${inGameplay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <PhaserCanvas />
      </div>

      {screen === 'LOADING' && <LoadingOverlay progress={loadProgress} />}

      {screen === 'TITLE' && (
        <TitleScreen
          onPlay={handlePlayFromTitle}
          onOpenCharacters={() => setScreen('CHARACTER_SELECT')}
          onOpenWorlds={() => {
            setLevelReturnScreen('TITLE');
            setScreen('LEVEL_SELECT');
          }}
          onOpenShop={() => setScreen('SHOP')}
          onOpenSettings={() => setScreen('SETTINGS')}
          onOpenHowToPlay={() => setScreen('HOW_TO_PLAY')}
          onOpenAboutCas={() => {
            setAboutReturnScreen('TITLE');
            setScreen('ABOUT_CAS');
          }}
        />
      )}

      {screen === 'PLAYING' && <GameHud hud={hud} onPause={pauseGame} />}

      {screen === 'CHARACTER_SELECT' && (
        <CharacterSelectModal
          onClose={() => setScreen('TITLE')}
          onConfirmPlay={() => {
            setLevelReturnScreen('TITLE');
            setScreen('LEVEL_SELECT');
          }}
        />
      )}
      {screen === 'LEVEL_SELECT' && (
        <LevelSelectModal
          onClose={() => setScreen(levelReturnScreen)}
          onSelectWorld={startWorld}
          onStartProcedural={startProcedural}
        />
      )}
      {screen === 'SHOP' && <ShopModal onClose={() => setScreen('TITLE')} />}
      {screen === 'SETTINGS' && <SettingsModal onClose={() => setScreen('TITLE')} />}
      {screen === 'HOW_TO_PLAY' && <HowToPlayModal onClose={() => setScreen('TITLE')} />}
      {screen === 'ABOUT_CAS' && <AboutCasModal onClose={() => setScreen(aboutReturnScreen)} />}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={resumeGame}
          onRestart={restartWorld}
          onSwitchWorld={() => {
            setLevelReturnScreen('PAUSED');
            setScreen('LEVEL_SELECT');
          }}
          onOpenAbout={() => {
            setAboutReturnScreen('PAUSED');
            setScreen('ABOUT_CAS');
          }}
          onReturnMenu={returnToMenu}
        />
      )}
      {screen === 'VICTORY' && victory && (
        <VictoryModal
          summary={victory}
          onNextWorld={startWorld}
          onNextProcedural={startProcedural}
          onReplay={restartWorld}
          onReturnMenu={returnToMenu}
        />
      )}
      {screen === 'GAME_OVER' && gameOver && (
        <GameOverModal summary={gameOver} onRetry={restartWorld} onReturnMenu={returnToMenu} />
      )}
    </main>
  );
}
