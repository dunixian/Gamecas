import { Play, Shuffle, Star, X } from 'lucide-react';
import { useState } from 'react';
import { AudioManager } from '../game/AudioManager';
import { DifficultyId, WORLDS, WorldId } from '../game/GameConfig';
import { ProceduralRunConfig } from '../game/GameManager';
import { useSaveData } from '../hooks/useSaveData';

interface LevelSelectModalProps {
  onClose: () => void;
  onSelectWorld: (worldId: WorldId) => void;
  onStartProcedural: (config: ProceduralRunConfig) => void;
}

export function LevelSelectModal({ onClose, onSelectWorld, onStartProcedural }: LevelSelectModalProps) {
  const save = useSaveData();
  const [themeWorldId, setThemeWorldId] = useState<WorldId>(1);
  const [difficulty, setDifficulty] = useState<DifficultyId>('seru');

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-white/15 p-6 text-white shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Pilih Zona & Generator Level CAS Water Park</h2>
            <p className="text-sm text-slate-300">
              Seluruh 4 Dunia terbuka bebas! Kamu bisa gonta-ganti dunia kapan saja atau buat lintasan acak otomatis.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onClose();
            }}
            aria-label="Tutup pilihan dunia"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Generator Level Acak Otomatis */}
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/90 via-slate-800/90 to-emerald-950/80 border border-cyan-400/35 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-300 uppercase">
                <Shuffle className="h-4 w-4" />
                <span>Mode Generator Level Otomatis CAS</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white mt-0.5">
                Lintasan Acak Tanpa Batas · Variasi & Tingkat Kesulitan
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span>Stage Terbaik: <strong className="font-mono-num text-amber-300">{save.endlessBestStage}</strong></span>
              <span>Skor Tertinggi: <strong className="font-mono-num text-cyan-300">{save.endlessHighScore}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Tema Wahana CAS</label>
              <div className="grid grid-cols-2 gap-2">
                {WORLDS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setThemeWorldId(w.id)}
                    className={`rounded-xl px-2.5 py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                      themeWorldId === w.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                        : 'bg-slate-900/80 text-slate-200 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    D0{w.id}: {w.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Tingkat Kesulitan</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'santai', label: 'Santai' },
                    { id: 'seru', label: 'Seru' },
                    { id: 'ekstrem', label: 'Ekstrem' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`rounded-xl py-2.5 text-xs font-bold border transition-colors cursor-pointer ${
                      difficulty === d.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-900/80 text-slate-200 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                onStartProcedural({
                  themeWorldId,
                  difficulty,
                  stage: save.endlessBestStage,
                  seed: Date.now() % 1000000,
                });
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-sm font-bold text-slate-950 shadow-lg hover:brightness-105 cursor-pointer"
            >
              <Shuffle className="h-4 w-4" />
              <span>Buat Level Acak (Stage {save.endlessBestStage})</span>
            </button>
          </div>
        </div>

        {/* Daftar 4 Dunia Utama (Semua Terbuka) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {WORLDS.map((w) => {
            const prog = save.worldProgress[w.id];
            return (
              <div
                key={w.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-slate-800/80"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                  <img
                    src={w.bgAsset}
                    alt={w.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-bold tracking-wider text-cyan-300">{w.code} · TERBUKA</div>
                      <h3 className="font-display text-xl font-bold text-white">{w.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${s <= prog.stars ? 'fill-amber-400 text-amber-300' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-300 leading-relaxed">{w.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono-num">Rekor Koin: <strong className="text-amber-300">{prog.bestCoins}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">Tiket: <strong className="text-cyan-300">{prog.bestTickets}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">Misi: <strong className="text-emerald-300">{prog.completedMissions.length}/3</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      AudioManager.playSfx('SFX_001');
                      onSelectWorld(w.id);
                    }}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 text-sm font-bold text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-slate-950" />
                    <span>{prog.completed ? 'Mainkan Ulang' : 'Masuk Dunia'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
