import { BookOpen, Globe, Info, Play, Settings, ShoppingBag, User } from 'lucide-react';
import { useEffect } from 'react';
import { AudioManager } from '../game/AudioManager';
import { CAS_PARK_INFO, CHARACTERS } from '../game/GameConfig';
import { useSaveData } from '../hooks/useSaveData';

interface TitleScreenProps {
  onPlay: () => void;
  onOpenCharacters: () => void;
  onOpenWorlds: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onOpenAboutCas: () => void;
}

export function TitleScreen({
  onPlay,
  onOpenCharacters,
  onOpenWorlds,
  onOpenShop,
  onOpenSettings,
  onOpenHowToPlay,
  onOpenAboutCas,
}: TitleScreenProps) {
  const save = useSaveData();
  const activeChar = CHARACTERS[save.selectedCharacter];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        AudioManager.unlock();
        AudioManager.playSfx('SFX_001');
        onPlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPlay]);

  const clickWrap = (fn: () => void) => () => {
    AudioManager.unlock();
    AudioManager.playSfx('SFX_001');
    fn();
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Latar Belakang Foto Asli Gerbang Satwa CAS Water Park */}
      <img
        src={CAS_PARK_INFO.photos.gate}
        alt="Gerbang Masuk CAS Water Park Cikole Pandeglang"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlay kontras di sisi kiri agar tipografi & logo terbaca jelas tanpa menutupi gerbang satwa di kanan */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/65 to-slate-950/15" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between p-5 sm:p-10 lg:p-14">
        {/* Baris Atas: Profil Pemain & Pengaturan */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <img
              src={activeChar.portraitUrl}
              alt={activeChar.name}
              referrerPolicy="no-referrer"
              className="h-11 w-11 rounded-xl object-cover border-2 border-amber-400/70 shadow-md"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white">{activeChar.name}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="font-mono-num text-amber-300 font-bold">{save.coins} Koin</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="font-mono-num text-cyan-300 font-bold">{save.totalTickets} Tiket</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clickWrap(onOpenAboutCas)}
              className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600/90 px-4 text-sm font-semibold text-white border border-emerald-300/30 hover:bg-emerald-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Info className="h-4 w-4" />
              <span>Tentang CAS</span>
            </button>
            <button
              type="button"
              onClick={clickWrap(onOpenSettings)}
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-950/80 px-4 text-sm font-semibold text-white border border-white/20 hover:bg-slate-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Settings className="h-4 w-4 text-cyan-300" />
              <span>Pengaturan</span>
            </button>
          </div>
        </div>

        {/* Lockup Logo Ikonik CAS WATER PARK (C merah, A kuning, S hijau) */}
        <div className="max-w-xl space-y-5">
          <div>
            <svg viewBox="0 0 540 175" className="w-full max-w-lg drop-shadow-2xl" aria-label="CAS Water Park Cikole Pandeglang - Tiket Yang Hilang">
              <text
                x="4"
                y="62"
                fill="#EF4444"
                stroke="#FFFFFF"
                strokeWidth="11"
                paintOrder="stroke"
                fontFamily="Fredoka, sans-serif"
                fontWeight="700"
                fontSize="68"
              >
                C
              </text>
              <text
                x="56"
                y="62"
                fill="#FACC15"
                stroke="#FFFFFF"
                strokeWidth="11"
                paintOrder="stroke"
                fontFamily="Fredoka, sans-serif"
                fontWeight="700"
                fontSize="68"
              >
                A
              </text>
              <text
                x="110"
                y="62"
                fill="#22C55E"
                stroke="#FFFFFF"
                strokeWidth="11"
                paintOrder="stroke"
                fontFamily="Fredoka, sans-serif"
                fontWeight="700"
                fontSize="68"
              >
                S
              </text>
              <text
                x="170"
                y="58"
                fill="#38BDF8"
                stroke="#0F172A"
                strokeWidth="7"
                paintOrder="stroke"
                fontFamily="Fredoka, sans-serif"
                fontWeight="700"
                fontSize="44"
              >
                WATER
              </text>
              <text
                x="325"
                y="58"
                fill="#F97316"
                stroke="#0F172A"
                strokeWidth="7"
                paintOrder="stroke"
                fontFamily="Fredoka, sans-serif"
                fontWeight="700"
                fontSize="44"
              >
                PARK
              </text>
              <text
                x="6"
                y="114"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="6"
                paintOrder="stroke"
                fontFamily="Fredoka, sans-serif"
                fontWeight="700"
                fontSize="34"
              >
                PETUALANGAN TIKET HILANG
              </text>
              <text
                x="8"
                y="148"
                fill="#FDE047"
                stroke="#0F172A"
                strokeWidth="4"
                paintOrder="stroke"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="700"
                fontSize="18"
                letterSpacing="2"
              >
                CIKOLE · PANDEGLANG - BANTEN
              </text>
            </svg>
            <p className="mt-1 max-w-md text-sm sm:text-base text-slate-200 leading-relaxed">
              Jelajahi Kolam Renang, Water Park Gurita Raksasa, Taman Flora & Fauna, dan Outbound Cikole dalam petualangan seru untuk semua usia!
            </p>
          </div>

          {/* Tombol Mulai & Menu Navigasi */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={clickWrap(onPlay)}
              className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 font-display text-xl font-bold text-slate-950 shadow-xl hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="h-6 w-6 fill-slate-950" />
              <span>Mulai Petualangan</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={clickWrap(onOpenCharacters)}
                className="flex h-11 items-center gap-2 rounded-xl bg-slate-950/80 px-4 text-sm font-semibold text-white border border-white/20 hover:bg-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                <User className="h-4 w-4 text-cyan-300" />
                <span>Karakter</span>
              </button>
              <button
                type="button"
                onClick={clickWrap(onOpenWorlds)}
                className="flex h-11 items-center gap-2 rounded-xl bg-slate-950/80 px-4 text-sm font-semibold text-white border border-white/20 hover:bg-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Globe className="h-4 w-4 text-emerald-300" />
                <span>Pilih Dunia & Level Acak</span>
              </button>
              <button
                type="button"
                onClick={clickWrap(onOpenShop)}
                className="flex h-11 items-center gap-2 rounded-xl bg-slate-950/80 px-4 text-sm font-semibold text-white border border-white/20 hover:bg-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="h-4 w-4 text-amber-300" />
                <span>Toko</span>
              </button>
              <button
                type="button"
                onClick={clickWrap(onOpenHowToPlay)}
                className="flex h-11 items-center gap-2 rounded-xl bg-slate-950/80 px-4 text-sm font-semibold text-white border border-white/20 hover:bg-slate-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="h-4 w-4 text-sky-300" />
                <span>Cara Bermain</span>
              </button>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Petunjuk Kontrol & Domain */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <span>A/D Gerak · W/S Panjat Tangga · Spasi Lompat · F / Klik Tembak Pistol Air · Sponsor Utama: CAS Water Park</span>
          <span className="font-medium text-cyan-300">games.caswaterpark.com · Cikole, Pandeglang</span>
        </div>
      </div>
    </div>
  );
}
