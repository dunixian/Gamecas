import { Car, CheckCircle2, Clock, MapPin, Phone, Sparkles, Ticket, Trees, X } from 'lucide-react';
import { useState } from 'react';
import { AudioManager } from '../game/AudioManager';
import { CAS_PARK_INFO } from '../game/GameConfig';

interface AboutCasModalProps {
  onClose: () => void;
}

export function AboutCasModal({ onClose }: AboutCasModalProps) {
  const [activePhoto, setActivePhoto] = useState<'gate' | 'aerial' | 'promo' | 'fauna'>('gate');

  const photoMap = {
    gate: { src: CAS_PARK_INFO.photos.gate, caption: 'Gerbang Satwa Ikonik CAS Water Park Pandeglang' },
    aerial: { src: CAS_PARK_INFO.photos.aerial, caption: 'Panorama Udara Kolam Renang & Wahana CAS Water Park' },
    promo: { src: CAS_PARK_INFO.photos.promo, caption: 'Wahana Gurita Raksasa, Ember Koboi & Info Resmi' },
    fauna: { src: CAS_PARK_INFO.photos.fauna, caption: 'Koleksi 28 Satwa Taman Flora & Fauna CAS Water Park' },
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/88 p-3 sm:p-5">
      <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-white/15 p-5 sm:p-6 text-white shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-bold tracking-wider text-cyan-300">TENTANG TAMAN WISATA RESMI</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              CAS Water Park · Cikole, Pandeglang
            </h2>
            <p className="mt-1 text-sm text-slate-300">{CAS_PARK_INFO.tagline}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              AudioManager.playSfx('SFX_001');
              onClose();
            }}
            aria-label="Tutup informasi CAS Water Park"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Galeri Foto Asli CAS Water Park */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-950">
              <img
                src={photoMap[activePhoto].src}
                alt={photoMap[activePhoto].caption}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3">
                <p className="text-xs font-semibold text-white">{photoMap[activePhoto].caption}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([
                ['gate', 'Gerbang Satwa'],
                ['aerial', 'Kolam Udara'],
                ['promo', 'Wahana Air'],
                ['fauna', 'Flora & Fauna'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    AudioManager.playSfx('SFX_001');
                    setActivePhoto(key);
                  }}
                  className={`rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                    activePhoto === key ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/15 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photoMap[key].src}
                    alt={label}
                    referrerPolicy="no-referrer"
                    className="h-14 w-full object-cover"
                  />
                  <div className="bg-slate-950 px-2 py-1 text-[11px] font-semibold text-center truncate">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Tiket, Jam Buka, Parkir, Kontak */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="rounded-2xl bg-slate-800/75 border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <Ticket className="h-4 w-4" />
                <span>Harga Tiket Masuk</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-950/70 p-3 border border-white/10">
                  <div className="text-[11px] text-slate-400">Senin – Jumat (Weekday)</div>
                  <div className="font-mono-num text-lg font-bold text-emerald-300">{CAS_PARK_INFO.tickets.weekday}</div>
                </div>
                <div className="rounded-xl bg-slate-950/70 p-3 border border-white/10">
                  <div className="text-[11px] text-slate-400">Sabtu – Minggu (Weekend)</div>
                  <div className="font-mono-num text-lg font-bold text-rose-300">{CAS_PARK_INFO.tickets.weekend}</div>
                </div>
              </div>
              <p className="text-xs text-cyan-200 leading-relaxed">{CAS_PARK_INFO.tickets.promo}</p>
            </div>

            <div className="rounded-2xl bg-slate-800/75 border border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                <Car className="h-4 w-4" />
                <span>Tiket Parkir & Jam Operasional</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200">
                {CAS_PARK_INFO.parking.map((p) => (
                  <span key={p.label} className="font-mono-num">
                    {p.label}: <strong className="text-white">{p.price}</strong>
                  </span>
                ))}
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-300 pt-1">
                <Clock className="h-4 w-4 shrink-0 text-amber-300 mt-0.5" />
                <span>Buka Setiap Hari: <strong className="text-white">{CAS_PARK_INFO.openHours}</strong></span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-300 mt-0.5" />
                <span>Lokasi: <strong className="text-white">{CAS_PARK_INFO.location}</strong> (Strategis di pusat kota Pandeglang)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold pt-1">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="font-mono-num">Info & Booking WhatsApp: {CAS_PARK_INFO.whatsapp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fasilitas Gratis & Koleksi Flora Fauna */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-800/65 border border-white/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>Sudah Termasuk Gratis di Dalam Area</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
              {CAS_PARK_INFO.freeFacilities.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-white/10 text-xs text-slate-300">
              Keunggulan: {CAS_PARK_INFO.highlights.join(' · ')}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800/65 border border-white/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Trees className="h-4 w-4" />
              <span>Taman Flora & Fauna — Alam Satwa Kita Bersama</span>
            </div>
            <p className="text-xs text-slate-300">
              Terdapat 28 jenis satwa edukatif yang bisa dikunjungi langsung di CAS Water Park Cikole:
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-200">
              {CAS_PARK_INFO.faunaSample.map((s) => (
                <span key={s}>· {s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
