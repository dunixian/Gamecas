import { Compass, Gamepad2, Sparkles, X } from 'lucide-react';
import { AudioManager } from '../game/AudioManager';

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/15 p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="font-display text-2xl font-bold">Cara Bermain CAS Water Park</h2>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onClose();
            }}
            aria-label="Tutup panduan"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl bg-slate-800/70 p-4 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <Gamepad2 className="h-4 w-4" />
              <span>Kontrol Keyboard & Android</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li><strong className="text-white">A / D atau Panah Kiri/Kanan:</strong> Gerak ke samping</li>
              <li><strong className="text-white">Spasi:</strong> Lompat, Lompat Ganda, Berenang</li>
              <li><strong className="text-white">W / S atau Panah Atas/Bawah:</strong> Naik & Turun Tangga</li>
              <li><strong className="text-white">F / Klik Layar / Tombol Tembak:</strong> Tembak Pistol Air (Tier 3)</li>
              <li><strong className="text-white">Shift:</strong> Lari cepat di area dek</li>
            </ul>
          </div>

          <div className="rounded-xl bg-slate-800/70 p-4 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Compass className="h-4 w-4" />
              <span>Senjata & Musuh Bervariasi</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li><strong className="text-white">Kelapa Jumbo (Tier 2):</strong> Membesarkan karakter & tahan 1 benturan</li>
              <li><strong className="text-white">Pistol Air CAS (Tier 3):</strong> Menembak gelembung air memantul</li>
              <li><strong className="text-white">Injak Musuh dari Atas:</strong> Kalahkan Kepiting, Tawon, Monyet & Gurita</li>
              <li><strong className="text-white">Peti & Pos Satwa Otomatis:</strong> Cukup dekati tanpa tekan tombol E</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-slate-800/70 p-4 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
            <Sparkles className="h-4 w-4" />
            <span>Cuaca Dinamis, Ganti Dunia & Level Acak Otomatis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cuaca taman berubah dinamis sepanjang petualangan: <strong className="text-amber-300">Cerah Tropis</strong> (+5% kecepatan), <strong className="text-emerald-300">Angin Tropis</strong> (+8% kecepatan & angin sejuk), dan <strong className="text-sky-300">Gerimis Ringan</strong> (-6% kecepatan). Seluruh 4 dunia terbuka bebas dan dapat dijelajahi bersama Mode Generator Level Acak!
          </p>
        </div>
      </div>
    </div>
  );
}
