import { CheckCircle2, Globe, Home, Info, Play, RotateCcw, Shuffle, Star, Volume2, VolumeX } from 'lucide-react';
import { AudioManager } from '../game/AudioManager';
import { WorldId } from '../game/GameConfig';
import { GameOverSummary, ProceduralRunConfig, VictorySummary } from '../game/GameManager';
import { SaveManager } from '../game/SaveManager';
import { useSaveData } from '../hooks/useSaveData';

export function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6">
      <div className="font-display text-3xl font-bold text-cyan-300">CAS WATER PARK</div>
      <div className="mt-1 text-sm text-slate-300">Menyiapkan wahana Cikole, Pandeglang...</div>
      <div className="mt-6 h-3 w-72 overflow-hidden rounded-full bg-slate-800 border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-transform duration-150 origin-left"
          style={{ transform: `scaleX(${Math.max(0.05, progress / 100)})` }}
        />
      </div>
      <div className="mt-2 font-mono-num text-xs text-slate-400">{progress}%</div>
    </div>
  );
}

export function PauseModal({
  onResume,
  onRestart,
  onSwitchWorld,
  onOpenAbout,
  onReturnMenu,
}: {
  onResume: () => void;
  onRestart: () => void;
  onSwitchWorld: () => void;
  onOpenAbout: () => void;
  onReturnMenu: () => void;
}) {
  const save = useSaveData();

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/15 p-6 text-white shadow-2xl space-y-5">
        <h2 className="font-display text-2xl font-bold text-center">Permainan Dijeda</h2>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onResume();
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>Lanjutkan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onSwitchWorld();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/90 font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            <span>Ganti Dunia / Level Acak</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onRestart();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 font-semibold text-white hover:bg-slate-700 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Ulangi Lintasan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onOpenAbout();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700/80 font-semibold text-white hover:bg-emerald-600 cursor-pointer"
          >
            <Info className="h-4 w-4" />
            <span>Tentang CAS Water Park</span>
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                SaveManager.updateAudio({ musicMuted: !save.audio.musicMuted });
                AudioManager.syncVolumes();
              }}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              {save.audio.musicMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-300" />}
              <span>{save.audio.musicMuted ? 'Musik Mati' : 'Musik Aktif'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                SaveManager.updateAudio({ sfxMuted: !save.audio.sfxMuted });
                AudioManager.syncVolumes();
              }}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              {save.audio.sfxMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-amber-300" />}
              <span>{save.audio.sfxMuted ? 'Efek Mati' : 'Efek Aktif'}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onReturnMenu();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-800/70 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function VictoryModal({
  summary,
  onNextWorld,
  onNextProcedural,
  onReplay,
  onReturnMenu,
}: {
  summary: VictorySummary;
  onNextWorld: (nextId: WorldId) => void;
  onNextProcedural: (nextConfig: ProceduralRunConfig) => void;
  onReplay: () => void;
  onReturnMenu: () => void;
}) {
  const hasNext = !summary.isProcedural && summary.worldId < 4;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-400/35 p-6 text-white shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold tracking-wider text-cyan-300">
            {summary.isProcedural
              ? `STAGE ACAK ${summary.proceduralConfig?.stage ?? 1} SELESAI`
              : `DUNIA 0${summary.worldId} SELESAI`}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-300">{summary.worldName}</h2>
          <div className="flex items-center justify-center gap-2 pt-1">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`h-8 w-8 ${s <= summary.stars ? 'fill-amber-400 text-amber-300' : 'text-slate-700'}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-xl bg-slate-950/70 p-3 text-center border border-white/10">
          <div>
            <div className="text-[11px] text-slate-400">Skor</div>
            <div className="font-mono-num text-base font-bold text-white">{summary.score}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Koin</div>
            <div className="font-mono-num text-base font-bold text-amber-300">{summary.coinsCollected}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Tiket</div>
            <div className="font-mono-num text-base font-bold text-cyan-300">{summary.ticketsCollected}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Musuh</div>
            <div className="font-mono-num text-base font-bold text-emerald-300">{summary.enemiesDefeated}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          {summary.missions.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${m.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className={m.completed ? 'text-white' : 'text-slate-400'}>{m.label}</span>
              </span>
              <span className="font-mono-num text-slate-300">
                {m.current}/{m.target}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5 pt-1">
          {summary.isProcedural && summary.proceduralConfig && (
            <button
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                const nextStage = summary.proceduralConfig!.stage + 1;
                const themes: WorldId[] = [1, 2, 3, 4];
                onNextProcedural({
                  themeWorldId: themes[(nextStage - 1) % themes.length],
                  difficulty: summary.proceduralConfig!.difficulty,
                  stage: nextStage,
                  seed: Date.now() % 1000000,
                });
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 font-bold text-slate-950 hover:brightness-105 cursor-pointer"
            >
              <Shuffle className="h-4 w-4" />
              <span>Buat Stage Acak Berikutnya (Stage {summary.proceduralConfig.stage + 1})</span>
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                onNextWorld((summary.worldId + 1) as WorldId);
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>Dunia Berikutnya</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                onReplay();
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-semibold text-white hover:bg-slate-700 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Ulangi</span>
            </button>
            <button
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                onReturnMenu();
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameOverModal({
  summary,
  onRetry,
  onReturnMenu,
}: {
  summary: GameOverSummary;
  onRetry: () => void;
  onReturnMenu: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-rose-400/35 p-6 text-white shadow-2xl space-y-5 text-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-rose-400">Terpeleset!</h2>
          <p className="mt-1 text-sm text-slate-300">{summary.reason}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-950/70 p-3 border border-white/10">
          <div>
            <div className="text-[11px] text-slate-400">Skor</div>
            <div className="font-mono-num text-base font-bold text-white">{summary.score}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Koin</div>
            <div className="font-mono-num text-base font-bold text-amber-300">{summary.coinsCollected}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Musuh</div>
            <div className="font-mono-num text-base font-bold text-emerald-300">{summary.enemiesDefeated}</div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onRetry();
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Coba Lagi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onReturnMenu();
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-800 font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
}
