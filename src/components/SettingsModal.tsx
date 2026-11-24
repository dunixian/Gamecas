import { Award, Music, RotateCcw, Volume2, X } from 'lucide-react';
import { useState } from 'react';
import { AudioManager } from '../game/AudioManager';
import { ACHIEVEMENTS } from '../game/GameConfig';
import { SaveManager } from '../game/SaveManager';
import { useSaveData } from '../hooks/useSaveData';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const save = useSaveData();
  const [confirmReset, setConfirmReset] = useState(false);

  const updateAudio = (partial: Partial<typeof save.audio>) => {
    SaveManager.updateAudio(partial);
    AudioManager.syncVolumes();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/15 p-6 text-white shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
          <h2 className="font-display text-2xl font-bold text-white">Audio, Pencapaian & Simpanan</h2>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onClose();
            }}
            aria-label="Tutup pengaturan"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-cyan-300">Musik & Efek Suara</h3>
          <div className="space-y-3 rounded-xl bg-slate-800/70 p-4 border border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Music className="h-4 w-4 text-cyan-300" />
                <span>Volume Musik</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={save.audio.musicVolume}
                  onChange={(e) => updateAudio({ musicVolume: Number(e.target.value) })}
                  className="w-32 accent-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => updateAudio({ musicMuted: !save.audio.musicMuted })}
                  className={`h-8 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                    save.audio.musicMuted ? 'bg-rose-500/80 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {save.audio.musicMuted ? 'Mati' : 'Aktif'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Volume2 className="h-4 w-4 text-amber-300" />
                <span>Efek Suara (SFX)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={save.audio.sfxVolume}
                  onChange={(e) => updateAudio({ sfxVolume: Number(e.target.value) })}
                  className="w-32 accent-amber-400"
                />
                <button
                  type="button"
                  onClick={() => updateAudio({ sfxMuted: !save.audio.sfxMuted })}
                  className={`h-8 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                    save.audio.sfxMuted ? 'bg-rose-500/80 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {save.audio.sfxMuted ? 'Mati' : 'Aktif'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Award className="h-4 w-4" />
              <span>Pencapaian ({save.achievements.length}/{ACHIEVEMENTS.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = save.achievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`rounded-xl p-3 border text-xs ${
                    unlocked ? 'bg-emerald-950/40 border-emerald-400/40 text-white' : 'bg-slate-800/50 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{a.title}</span>
                    <span className="font-mono-num text-amber-300">+{a.rewardCoins}</span>
                  </div>
                  <p className="mt-1 text-[11px]">{a.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">Progres permainan tersimpan otomatis di perangkat ini.</span>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-rose-950/80 px-4 text-xs font-bold text-rose-200 border border-rose-500/40 hover:bg-rose-900 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Hapus Progres</span>
          </button>
        </div>

        {confirmReset && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-rose-400/40 p-6 text-white space-y-4">
              <h3 className="font-display text-xl font-bold text-rose-300">Hapus Semua Progres?</h3>
              <p className="text-sm text-slate-300">
                Tindakan ini akan menghapus seluruh koin, dunia terbuka, kostum toko, dan bintang misi secara permanen.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="h-10 rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    SaveManager.resetProgress();
                    setConfirmReset(false);
                  }}
                  className="h-10 rounded-xl bg-rose-500 px-4 text-sm font-bold text-white hover:bg-rose-400 cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
