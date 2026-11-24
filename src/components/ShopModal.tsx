import { Check, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { AudioManager } from '../game/AudioManager';
import { SHOP_ITEMS, ShopItemDef } from '../game/GameConfig';
import { SaveManager } from '../game/SaveManager';
import { useSaveData } from '../hooks/useSaveData';

interface ShopModalProps {
  onClose: () => void;
}

type CategoryFilter = 'all' | ShopItemDef['category'];

export function ShopModal({ onClose }: ShopModalProps) {
  const save = useSaveData();
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [confirmItem, setConfirmItem] = useState<ShopItemDef | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const visibleItems = filter === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === filter);

  const getPrice = (item: ShopItemDef) => {
    if (item.category === 'upgrade') {
      const lvl = item.id === 'upg_jump' ? save.jumpUpgradeLevel : save.speedUpgradeLevel;
      return item.price * (lvl + 1);
    }
    return item.price;
  };

  const handleAction = (item: ShopItemDef) => {
    AudioManager.playSfx('SFX_001');
    const isOwnedCosmetic =
      (item.category === 'outfit' || item.category === 'hat' || item.category === 'accessory') &&
      save.purchasedItems.includes(item.id);

    if (isOwnedCosmetic) {
      SaveManager.equipCosmetic(item.id);
      setFeedback(`Perlengkapan diperbarui: ${item.name}`);
      return;
    }

    setConfirmItem(item);
  };

  const confirmPurchase = () => {
    if (!confirmItem) return;
    const res = SaveManager.purchaseItem(confirmItem.id);
    if (res.ok) {
      AudioManager.playSfx('SFX_009');
      setFeedback(`Berhasil membeli ${confirmItem.name}!`);
    } else {
      AudioManager.playSfx('SFX_014');
      setFeedback('Koin tidak mencukupi atau level sudah maksimal');
    }
    setConfirmItem(null);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-white/15 p-6 text-white shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-amber-400" />
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Toko Petualang CAS</h2>
              <p className="text-sm text-slate-300">Kustomisasi karakter dan tingkatkan kemampuan lompat, lari, serta perisai.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Saldo Kamu</div>
              <div className="font-mono-num text-lg font-bold text-amber-300">{save.coins} Koin</div>
            </div>
            <button
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                onClose();
              }}
              aria-label="Tutup toko"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-white/10">
          {([
            ['all', 'Semua'],
            ['outfit', 'Kostum'],
            ['hat', 'Topi'],
            ['accessory', 'Aksesori'],
            ['upgrade', 'Peningkatan'],
            ['consumable', 'Powerup'],
          ] as Array<[CategoryFilter, string]>).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                setFilter(key);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === key ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {feedback && (
          <div className="mt-3 rounded-xl bg-emerald-950/70 border border-emerald-400/40 px-4 py-2 text-xs font-semibold text-emerald-200">
            {feedback}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {visibleItems.map((item) => {
            const price = getPrice(item);
            const isOwned = save.purchasedItems.includes(item.id);
            const isEquipped =
              save.equippedOutfit === item.id || save.equippedHat === item.id || save.equippedAccessory === item.id;
            const upgradeLvl =
              item.id === 'upg_jump' ? save.jumpUpgradeLevel : item.id === 'upg_speed' ? save.speedUpgradeLevel : 0;
            const maxed = item.category === 'upgrade' && upgradeLvl >= (item.maxLevel ?? 3);
            const consumableCount =
              item.id === 'con_shield'
                ? save.inventory.shields
                : item.id === 'con_magnet'
                ? save.inventory.magnets
                : item.id === 'con_life'
                ? save.inventory.extraLives
                : 0;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl bg-slate-800/80 border border-white/10 p-4 space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-9 w-9 shrink-0 rounded-lg border border-white/20"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{item.name}</h3>
                        <div className="text-[11px] text-cyan-300">
                          {item.effectLabel}
                          {item.category === 'upgrade' ? ` · Lv.${upgradeLvl}/${item.maxLevel}` : ''}
                          {item.category === 'consumable' ? ` · Dimiliki: ${consumableCount}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <button
                  type="button"
                  disabled={maxed || (!isOwned && save.coins < price)}
                  onClick={() => handleAction(item)}
                  className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    maxed
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : isEquipped
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : isOwned
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      : save.coins >= price
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {maxed ? (
                    <span>Level Maksimal</span>
                  ) : isEquipped ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Dipakai (Lepas)</span>
                    </>
                  ) : isOwned ? (
                    <span>Pakai Item</span>
                  ) : (
                    <span className="font-mono-num">Beli · {price} Koin</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {confirmItem && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/20 p-6 text-white shadow-2xl space-y-4">
              <h3 className="font-display text-xl font-bold">Konfirmasi Pembelian</h3>
              <p className="text-sm text-slate-300">
                Beli <strong className="text-white">{confirmItem.name}</strong> seharga{' '}
                <strong className="font-mono-num text-amber-300">{getPrice(confirmItem)} Koin</strong>?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmItem(null)}
                  className="h-10 rounded-xl bg-slate-800 px-4 text-sm font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmPurchase}
                  className="h-10 rounded-xl bg-amber-400 px-5 text-sm font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
                >
                  Konfirmasi Beli
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
