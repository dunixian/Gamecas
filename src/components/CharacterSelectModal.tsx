import { Check, X } from 'lucide-react';
import { AudioManager } from '../game/AudioManager';
import { CHARACTERS, CharacterId, SHOP_ITEMS } from '../game/GameConfig';
import { SaveManager } from '../game/SaveManager';
import { useSaveData } from '../hooks/useSaveData';

interface CharacterSelectModalProps {
  onClose: () => void;
  onConfirmPlay: () => void;
}

export function CharacterSelectModal({ onClose, onConfirmPlay }: CharacterSelectModalProps) {
  const save = useSaveData();

  const selectChar = (id: CharacterId) => {
    AudioManager.playSfx('SFX_001');
    SaveManager.setCharacter(id);
  };

  const outfitName = SHOP_ITEMS.find((i) => i.id === save.equippedOutfit)?.name ?? 'Seragam Standar CAS';
  const hatName = SHOP_ITEMS.find((i) => i.id === save.equippedHat)?.name ?? 'Tidak Ada';
  const accName = SHOP_ITEMS.find((i) => i.id === save.equippedAccessory)?.name ?? 'Tidak Ada';

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-white/15 p-6 text-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Pilih Karakter Petualang</h2>
            <p className="text-sm text-slate-300">Pilih Raka atau Sari dan lihat perlengkapan CAS yang sedang dipakai.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onClose();
            }}
            aria-label="Tutup pilihan karakter"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {(['boy', 'girl'] as CharacterId[]).map((id) => {
            const c = CHARACTERS[id];
            const selected = save.selectedCharacter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectChar(id)}
                className={`group flex flex-col items-center rounded-2xl p-5 text-left transition-all cursor-pointer border ${
                  selected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-lg'
                    : 'bg-slate-800/70 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-white/20 bg-slate-950">
                  <img
                    src={c.portraitUrl}
                    alt={`${c.name} - ${c.title}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  {selected && (
                    <span className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="mt-4 w-full text-center">
                  <div className="font-display text-xl font-bold text-white">{c.name}</div>
                  <div className="text-xs font-medium text-cyan-300">{c.title}</div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{c.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950/60 px-4 py-3 text-xs text-slate-300 border border-white/10">
          <span>Kostum: <strong className="text-white">{outfitName}</strong></span>
          <span>Topi: <strong className="text-white">{hatName}</strong></span>
          <span>Aksesori: <strong className="text-white">{accName}</strong></span>
          <span className="font-mono-num">Lompat Lv.{save.jumpUpgradeLevel} · Lari Lv.{save.speedUpgradeLevel}</span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onClose();
            }}
            className="h-11 rounded-xl bg-slate-800 px-5 text-sm font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onConfirmPlay();
            }}
            className="h-11 rounded-xl bg-amber-400 px-6 text-sm font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
          >
            Pilih Dunia & Main
          </button>
        </div>
      </div>
    </div>
  );
}
