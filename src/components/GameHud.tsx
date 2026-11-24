import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CheckCircle2, Circle, CloudRain, Crosshair, Flag, Heart, Pause, Shield, Sparkles, Sun, Volume2, VolumeX, Wind, Zap } from 'lucide-react';
import { useState } from 'react';
import { AudioManager } from '../game/AudioManager';
import { GameManager, HudSnapshot } from '../game/GameManager';
import { SaveManager } from '../game/SaveManager';
import { useSaveData } from '../hooks/useSaveData';

interface GameHudProps {
  hud: HudSnapshot;
  onPause: () => void;
}

export function GameHud({ hud, onPause }: GameHudProps) {
  const save = useSaveData();
  const [missionsExpanded, setMissionsExpanded] = useState(true);
  const muted = save.audio.musicMuted && save.audio.sfxMuted;

  const toggleMuteAll = () => {
    const next = !muted;
    SaveManager.updateAudio({ musicMuted: next, sfxMuted: next });
    AudioManager.syncVolumes();
  };

  const bindTouch = (btn: 'left' | 'right' | 'up' | 'down' | 'jump' | 'run' | 'shoot') => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      AudioManager.unlock();
      GameManager.setTouchButton(btn, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      GameManager.setTouchButton(btn, false);
    },
    onPointerCancel: () => GameManager.setTouchButton(btn, false),
    onPointerLeave: () => GameManager.setTouchButton(btn, false),
  });

  const tierLabel =
    hud.powerTier === 3 ? 'Pistol Air CAS' : hud.powerTier === 2 ? 'Mode Jumbo' : 'Normal';
  const tierColor =
    hud.powerTier === 3
      ? 'text-cyan-300 border-cyan-400/40 bg-cyan-950/70'
      : hud.powerTier === 2
        ? 'text-emerald-300 border-emerald-400/40 bg-emerald-950/70'
        : 'text-slate-300 border-white/10 bg-slate-900/70';

  const weatherBadgeStyle =
    hud.weather.type === 'sunny'
      ? 'text-amber-200 border-amber-400/35 bg-amber-950/55'
      : hud.weather.type === 'drizzle'
        ? 'text-sky-200 border-sky-400/35 bg-sky-950/65'
        : 'text-emerald-200 border-emerald-400/35 bg-emerald-950/55';

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-4">
      {/* Klaster HUD Atas */}
      <div className="flex items-start justify-between gap-3">
        {/* Kiri Atas: Nyawa, Koin, Tiket, Skor, Mode Power-Up */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-950/85 px-3.5 py-2 text-white shadow-lg border border-white/15">
            <div className="flex items-center gap-1" aria-label={`Nyawa ${hud.health} dari ${hud.maxHealth}`}>
              {Array.from({ length: hud.maxHealth }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`h-5 w-5 ${idx < hud.health ? 'fill-rose-500 text-rose-400' : 'fill-slate-800 text-slate-600'}`}
                />
              ))}
            </div>

            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            <div className="flex items-center gap-1.5">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
                <circle cx="12" cy="12" r="5" fill="#FEF08A" />
              </svg>
              <span className="font-mono-num text-sm font-bold text-amber-300">{hud.coins}</span>
            </div>

            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            <div className="flex items-center gap-1.5">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="3" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
                <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
              </svg>
              <span className="font-mono-num text-sm font-bold text-cyan-300">{hud.tickets}</span>
            </div>

            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Skor</span>
              <span className="font-mono-num font-bold text-white">{hud.score}</span>
              {hud.comboCount > 1 && (
                <span className="font-mono-num font-bold text-amber-300">x{hud.comboCount}</span>
              )}
            </div>

            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${tierColor}`}>
              {tierLabel}
            </span>

            {hud.hasShield && (
              <>
                <span className="h-4 w-px bg-white/20" aria-hidden="true" />
                <span className="flex items-center gap-1 text-xs font-semibold text-cyan-300">
                  <Shield className="h-4 w-4" /> Perisai
                </span>
              </>
            )}
            {hud.magnetTimer > 0 && (
              <>
                <span className="h-4 w-px bg-white/20" aria-hidden="true" />
                <span className="font-mono-num flex items-center gap-1 text-xs font-semibold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" /> {hud.magnetTimer}d
                </span>
              </>
            )}
            {hud.speedTimer > 0 && (
              <>
                <span className="h-4 w-px bg-white/20" aria-hidden="true" />
                <span className="font-mono-num flex items-center gap-1 text-xs font-semibold text-orange-300">
                  <Zap className="h-3.5 w-3.5" /> {hud.speedTimer}d
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-3 rounded-xl bg-slate-950/80 px-3.5 py-1.5 text-xs text-slate-200 border border-white/10 max-w-md">
              <span className="font-semibold text-white truncate">
                {hud.isProcedural ? `Mode Acak S${hud.proceduralStage ?? 1}` : `D0${hud.worldId}`} · {hud.worldName}
              </span>
              <div className="h-2 flex-1 min-w-[65px] overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-transform duration-150 origin-left"
                  style={{ transform: `scaleX(${Math.max(0.02, hud.progressPct / 100)})` }}
                />
              </div>
              <span className="font-mono-num text-cyan-300 font-bold">{hud.progressPct}%</span>
            </div>

            <div
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${weatherBadgeStyle}`}
              title={`Cuaca saat ini: ${hud.weather.label} (${hud.weather.effectLabel})`}
            >
              {hud.weather.type === 'sunny' && <Sun className="h-3.5 w-3.5 text-amber-300 shrink-0" />}
              {hud.weather.type === 'drizzle' && <CloudRain className="h-3.5 w-3.5 text-sky-300 shrink-0" />}
              {hud.weather.type === 'breeze' && <Wind className="h-3.5 w-3.5 text-emerald-300 shrink-0" />}
              <span>{hud.weather.label}</span>
              <span className="font-mono-num opacity-85">({hud.weather.effectLabel})</span>
            </div>
          </div>
        </div>

        {/* Kanan Atas: Misi + Audio + Jeda */}
        <div className="flex flex-col items-end gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMuteAll}
              aria-label={muted ? 'Nyalakan suara' : 'Bisukan suara'}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/85 text-white border border-white/15 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5 text-cyan-300" />}
            </button>
            <button
              type="button"
              onClick={() => {
                AudioManager.playSfx('SFX_001');
                onPause();
              }}
              aria-label="Jeda permainan"
              className="flex h-11 items-center gap-2 rounded-xl bg-slate-950/85 px-4 text-sm font-semibold text-white border border-white/15 hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Pause className="h-4 w-4" />
              <span className="hidden sm:inline">Jeda</span>
            </button>
          </div>

          <div className="pointer-events-auto rounded-xl bg-slate-950/82 px-3.5 py-2.5 text-white border border-white/15 w-64 hidden md:block">
            <button
              type="button"
              onClick={() => setMissionsExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-bold tracking-wide text-amber-300 cursor-pointer"
            >
              <span>Sponsor: CAS Water Park</span>
              <span className="font-mono-num text-slate-300">
                {hud.missions.filter((m) => m.completed).length}/{hud.missions.length}
              </span>
            </button>
            {missionsExpanded && (
              <ul className="mt-2 space-y-1.5">
                {hud.missions.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 truncate">
                      {m.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      )}
                      <span className={m.completed ? 'line-through text-slate-400 truncate' : 'text-slate-100 truncate'}>
                        {m.label}
                      </span>
                    </span>
                    <span className="font-mono-num shrink-0 text-slate-300">
                      {m.current}/{m.target}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between gap-1.5 text-[11px] text-emerald-300">
              <span className="flex items-center gap-1.5 truncate">
                <Flag className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{hud.checkpointLabel}</span>
              </span>
              {hud.powerTier === 3 && <span className="text-cyan-300 font-bold shrink-0">F: Tembak</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi Tengah */}
      <div className="flex flex-col items-center gap-2">
        {hud.toastMessage && (
          <div className="rounded-xl bg-amber-400 px-4 py-1.5 text-sm font-bold text-slate-950 shadow-lg">
            {hud.toastMessage}
          </div>
        )}
      </div>

      {/* Kontrol Sentuh Android / Mobile Multi-Touch (Termasuk Panjat Tangga Atas/Bawah & Tembak Pistol Air) */}
      <div className="flex items-end justify-between gap-4 pb-1 lg:hidden">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Gerak Kiri"
            {...bindTouch('left')}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/80 text-white border-2 border-white/25 active:scale-95 active:bg-cyan-500 active:text-slate-950 touch-none"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              aria-label="Naik Tangga"
              {...bindTouch('up')}
              className="flex h-11 w-12 items-center justify-center rounded-xl bg-slate-950/80 text-emerald-300 border border-white/25 active:scale-95 active:bg-emerald-400 active:text-slate-950 touch-none"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Turun Tangga"
              {...bindTouch('down')}
              className="flex h-11 w-12 items-center justify-center rounded-xl bg-slate-950/80 text-amber-300 border border-white/25 active:scale-95 active:bg-amber-400 active:text-slate-950 touch-none"
            >
              <ArrowDown className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Gerak Kanan"
            {...bindTouch('right')}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/80 text-white border-2 border-white/25 active:scale-95 active:bg-cyan-500 active:text-slate-950 touch-none"
          >
            <ArrowRight className="h-7 w-7" />
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          {hud.powerTier === 3 && (
            <button
              type="button"
              aria-label="Tembak Pistol Air"
              {...bindTouch('shoot')}
              className="flex h-14 px-4 items-center justify-center gap-1.5 rounded-2xl bg-cyan-500 text-sm font-bold text-slate-950 border-2 border-white shadow-lg active:scale-95 touch-none"
            >
              <Crosshair className="h-5 w-5" />
              <span>Tembak</span>
            </button>
          )}
          <button
            type="button"
            aria-label="Lompat"
            {...bindTouch('jump')}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 border-2 border-white shadow-lg active:scale-95 touch-none"
          >
            <ArrowUp className="h-8 w-8 stroke-[2.75]" />
          </button>
        </div>
      </div>
    </div>
  );
}
