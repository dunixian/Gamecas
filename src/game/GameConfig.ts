export type CharacterId = 'boy' | 'girl';

export type WorldId = 1 | 2 | 3 | 4;

export type DifficultyId = 'santai' | 'seru' | 'ekstrem';

export type ScreenState =
  | 'TITLE'
  | 'CHARACTER_SELECT'
  | 'LEVEL_SELECT'
  | 'SHOP'
  | 'SETTINGS'
  | 'HOW_TO_PLAY'
  | 'ABOUT_CAS'
  | 'LOADING'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export interface MissionDef {
  id: string;
  label: string;
  target: number;
  type: 'coins' | 'tickets' | 'exit' | 'challenge' | 'treasures' | 'habitats' | 'golden_tickets';
  rewardCoins: number;
}

export interface WorldDef {
  id: WorldId;
  code: string;
  sceneKey: string;
  name: string;
  subtitle: string;
  description: string;
  bgAsset: string;
  musicId: 'MUS_002' | 'MUS_003' | 'MUS_004' | 'MUS_005';
  accentColor: string;
  skyTop: number;
  skyBottom: number;
  waterColor: number;
  platformColor: number;
  platformTopColor: number;
  worldWidth: number;
  worldHeight: number;
  missions: MissionDef[];
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  portraitUrl: string;
  primaryColor: number;
  secondaryColor: number;
  hairColor: number;
  skinColor: number;
  tagline: string;
}

export interface ShopItemDef {
  id: string;
  name: string;
  category: 'outfit' | 'hat' | 'accessory' | 'upgrade' | 'consumable';
  price: number;
  description: string;
  effectLabel: string;
  colorHex: string;
  maxLevel?: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
}

export const CAS_PARK_INFO = {
  name: 'CAS Water Park',
  location: 'Cikole, Pandeglang – Banten',
  tagline: 'Sponsor Utama · Destinasi Liburan Keluarga Terbaik — Seru, Aman & Nyaman Untuk Semua Usia!',
  openHours: '07.00 s/d 17.00 WIB (Kolam & Water Park hingga 16.30 WIB)',
  whatsapp: '0857-1041-6308',
  website: 'https://games.caswaterpark.com',
  tickets: {
    weekday: 'Rp 20.000',
    weekend: 'Rp 30.000',
    promo: 'Diskon Rombongan: Tiap kelipatan 20 orang GRATIS 1 tiket (misal 60 gratis 3, dibayar 57)',
  },
  parking: [
    { label: 'Motor', price: 'Rp 5.000' },
    { label: 'Mobil', price: 'Rp 10.000' },
    { label: 'Bis', price: 'Rp 20.000' },
  ],
  freeFacilities: [
    'Seluruh Fasilitas Kolam Renang Semua Usia',
    'Wahana Water Park & Gurita Raksasa',
    'Fasilitas Gazebo Keluarga',
    'Aula Pertemuan',
    'Toilet Bersih',
    'Photospot Instagramable',
    'Taman Flora & Fauna (28 Satwa)',
  ],
  highlights: [
    'Parkir Luas & Aman',
    'Area Luas dengan Fasilitas Lengkap',
    'Aman dan Nyaman',
    'Cocok untuk Seluruh Kalangan',
    'Strategis di Pusat Kota Pandeglang',
  ],
  faunaSample: [
    'Sapi PO (Peranakan Ongole)',
    'Kerbau Putih',
    'Domba Merino',
    'Kambing Jawa',
    'Rusa Tutul & Rusa Timorensis',
    'Kera Ekor Panjang & Beruk',
    'Otter / Lingsang',
    'Garangan, Bajing & Musang',
    'Kancil, Marmut & Landak Jawa',
    'Angsa, Ayam Merak & Kalkun',
    'Ayam Mutiara & Ayam Pegar',
    'Lovebird, Parkit, Kenari & Kutilang',
    'Buaya Muara (Anak)',
  ],
  photos: {
    aerial: '/assets/aistudio/f1932531-a989-4cee-8624-87a7cf92e238_8f5cddbf.png',
    gate: '/assets/aistudio/56d3bd1a-2767-45aa-88dc-42d091aa667f_ae987ad5.png',
    fauna: '/assets/aistudio/d3c81d34-31e9-4168-863d-e823b16aed8d_a60b104c.png',
    promo: '/assets/aistudio/9a8bf9bc-c481-4b87-8700-549e11645680_ec65239e.png',
  },
};

export const PHYSICS_CONFIG = {
  gravity: 1380,
  moveAccel: 2400,
  moveDecel: 2800,
  airAccel: 1700,
  maxWalkSpeed: 310,
  maxRunSpeed: 425,
  jumpVelocity: -600,
  doubleJumpVelocity: -530,
  jumpCutMultiplier: 0.54,
  coyoteTimeMs: 135,
  jumpBufferMs: 140,
  swimGravity: 300,
  swimUpVelocity: -335,
  climbSpeed: 240,
  slideSpeed: 560,
  ziplineSpeed: 510,
  maxFallSpeed: 880,
};

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  boy: {
    id: 'boy',
    name: 'Raka',
    title: 'Penjelajah Kolam CAS',
    portraitUrl: '/assets/characters/CHAR_001_player_boy.jpg',
    primaryColor: 0x06b6d4,
    secondaryColor: 0xf97316,
    hairColor: 0x713f12,
    skinColor: 0xfbd3a8,
    tagline: 'Perenang tangkas & jagoan Pistol Air CAS Water Park Pandeglang.',
  },
  girl: {
    id: 'girl',
    name: 'Sari',
    title: 'Sahabat Flora & Fauna',
    portraitUrl: '/assets/characters/CHAR_002_player_girl.jpg',
    primaryColor: 0xf43f5e,
    secondaryColor: 0x14b8a6,
    hairColor: 0x5c2d0c,
    skinColor: 0xfad0a5,
    tagline: 'Penjaga satwa Cikole yang lincah menaklukkan tangga, zipline & rintangan.',
  },
};

export const WORLDS: WorldDef[] = [
  {
    id: 1,
    code: 'DUNIA 01',
    sceneKey: 'PoolScene',
    name: 'Petualangan Kolam Renang',
    subtitle: 'Kolam Utama, Gazebo Tropis & Lorong Bawah Air',
    description:
      'Melompat melintasi dek kolam renang CAS Water Park, naiki tangga menara, ambil Kelapa Jumbo & Pistol Air untuk kalahkan musuh kolam!',
    bgAsset: '/assets/environments/pool/ENV_001_swimming_pool_bg.jpg',
    musicId: 'MUS_002',
    accentColor: '#06B6D4',
    skyTop: 0x0284c7,
    skyBottom: 0xbae6fd,
    waterColor: 0x06b6d4,
    platformColor: 0xe2e8f0,
    platformTopColor: 0x38bdf8,
    worldWidth: 4400,
    worldHeight: 900,
    missions: [
      { id: 'w1_coins', label: 'Kumpulkan 50 koin', target: 50, type: 'coins', rewardCoins: 25 },
      { id: 'w1_tickets', label: 'Temukan 3 tiket tersembunyi', target: 3, type: 'tickets', rewardCoins: 40 },
      { id: 'w1_exit', label: 'Capai gerbang keluar kolam', target: 1, type: 'exit', rewardCoins: 35 },
    ],
  },
  {
    id: 2,
    code: 'DUNIA 02',
    sceneKey: 'WaterparkScene',
    name: 'Wahana Water Park Gurita',
    subtitle: 'Gurita Raksasa, Ember Koboi & Seluncuran Spiral',
    description:
      'Meluncur di menara spiral kuning-hijau, tembak balon berduri dengan Pistol Air, lewati Gurita Merah ikonik CAS Water Park, dan buru tiket VIP!',
    bgAsset: '/assets/environments/waterpark/ENV_005_waterpark_bg.jpg',
    musicId: 'MUS_003',
    accentColor: '#F97316',
    skyTop: 0x0ea5e9,
    skyBottom: 0xfef08a,
    waterColor: 0x0284c7,
    platformColor: 0xfed7aa,
    platformTopColor: 0xf97316,
    worldWidth: 4800,
    worldHeight: 960,
    missions: [
      { id: 'w2_coins', label: 'Kumpulkan 75 koin', target: 75, type: 'coins', rewardCoins: 35 },
      { id: 'w2_vip', label: 'Temukan 5 tiket VIP', target: 5, type: 'tickets', rewardCoins: 50 },
      { id: 'w2_slide', label: 'Selesaikan tantangan seluncuran', target: 1, type: 'challenge', rewardCoins: 45 },
    ],
  },
  {
    id: 3,
    code: 'DUNIA 03',
    sceneKey: 'WildlifeScene',
    name: 'Taman Flora & Fauna CAS',
    subtitle: 'Gerbang Satwa, Rusa Tutul, Merak & Gajah',
    description:
      'Masuki Gerbang Satwa CAS Water Park! Kunjungi habitat Rusa Tutul, Ayam Merak, Gajah, Jerapah & Zebra, waspadai monyet nakal & tawon rimba.',
    bgAsset: '/assets/environments/wildlife/ENV_010_tropical_jungle.jpg',
    musicId: 'MUS_004',
    accentColor: '#10B981',
    skyTop: 0x059669,
    skyBottom: 0xfde68a,
    waterColor: 0x0d9488,
    platformColor: 0x78350f,
    platformTopColor: 0x22c55e,
    worldWidth: 5100,
    worldHeight: 960,
    missions: [
      { id: 'w3_coins', label: 'Kumpulkan 100 koin', target: 100, type: 'coins', rewardCoins: 45 },
      { id: 'w3_treasure', label: 'Temukan 5 harta tersembunyi', target: 5, type: 'treasures', rewardCoins: 60 },
      { id: 'w3_wildlife', label: 'Jelajahi 3 pos satwa CAS', target: 3, type: 'habitats', rewardCoins: 55 },
    ],
  },
  {
    id: 4,
    code: 'DUNIA 04',
    sceneKey: 'OutboundScene',
    name: 'Petualangan Outbound Cikole',
    subtitle: 'Flying Fox, Jembatan Tali & Puncak Harta Karun',
    description:
      'Panjat dinding tebing, berayun di tali rimba, meluncur cepat di Flying Fox melintasi lembah Pandeglang, dan kalahkan penjaga puncak!',
    bgAsset: '/assets/environments/outbound/ENV_015_outbound_entrance.jpg',
    musicId: 'MUS_005',
    accentColor: '#EAB308',
    skyTop: 0x9a3412,
    skyBottom: 0xfdba74,
    waterColor: 0x0369a1,
    platformColor: 0x57534e,
    platformTopColor: 0xd97706,
    worldWidth: 5500,
    worldHeight: 1040,
    missions: [
      { id: 'w4_coins', label: 'Kumpulkan 150 koin', target: 150, type: 'coins', rewardCoins: 65 },
      { id: 'w4_golden', label: 'Temukan semua 4 Tiket Emas', target: 4, type: 'golden_tickets', rewardCoins: 90 },
      { id: 'w4_finale', label: 'Tuntaskan tantangan puncak akhir', target: 1, type: 'challenge', rewardCoins: 100 },
    ],
  },
];

export const SHOP_ITEMS: ShopItemDef[] = [
  {
    id: 'outfit_aqua',
    name: 'Seragam Penjaga Kolam',
    category: 'outfit',
    price: 40,
    description: 'Rompi penyelamat biru-kuning cerah khas lifeguard CAS Water Park.',
    effectLabel: 'Kostum Kosmetik',
    colorHex: '#0EA5E9',
  },
  {
    id: 'outfit_safari',
    name: 'Jaket Penjaga Satwa',
    category: 'outfit',
    price: 75,
    description: 'Seragam hijau rimba untuk menjelajah Taman Flora & Fauna Cikole.',
    effectLabel: 'Kostum Kosmetik',
    colorHex: '#10B981',
  },
  {
    id: 'outfit_golden',
    name: 'Kostum Juara VIP Emas',
    category: 'outfit',
    price: 140,
    description: 'Setelan eksklusif bertema emas kebanggaan petualang CAS Water Park.',
    effectLabel: 'Kostum Kosmetik',
    colorHex: '#F59E0B',
  },
  {
    id: 'hat_sunvisor',
    name: 'Topi Pantai Tropis',
    category: 'hat',
    price: 30,
    description: 'Topi biru segar pelindung terik matahari Pandeglang.',
    effectLabel: 'Aksesori Kepala',
    colorHex: '#06B6D4',
  },
  {
    id: 'hat_safari',
    name: 'Topi Rimba Cikole',
    category: 'hat',
    price: 60,
    description: 'Topi penjelajah klasik tahan angin untuk area satwa & outbound.',
    effectLabel: 'Aksesori Kepala',
    colorHex: '#D97706',
  },
  {
    id: 'hat_crown',
    name: 'Mahkota Raja Waterpark',
    category: 'hat',
    price: 120,
    description: 'Mahkota emas berkilau tanda penakluk seluruh wahana CAS.',
    effectLabel: 'Aksesori Kepala',
    colorHex: '#EAB308',
  },
  {
    id: 'acc_goggles',
    name: 'Kacamata Selam Turbo',
    category: 'accessory',
    price: 35,
    description: 'Kacamata renang jernih untuk menyelami kolam dan lorong air.',
    effectLabel: 'Aksesori',
    colorHex: '#38BDF8',
  },
  {
    id: 'acc_scarf',
    name: 'Syal Angin Outbound',
    category: 'accessory',
    price: 55,
    description: 'Syal merah menyala yang berkibar gagah saat meluncur di Flying Fox.',
    effectLabel: 'Aksesori',
    colorHex: '#F43F5E',
  },
  {
    id: 'upg_jump',
    name: 'Sepatu Pegas Hidro',
    category: 'upgrade',
    price: 65,
    description: 'Meningkatkan tinggi lompatan & lompatan ganda sebesar +10% per level.',
    effectLabel: '+10% Tinggi Lompat',
    colorHex: '#8B5CF6',
    maxLevel: 3,
  },
  {
    id: 'upg_speed',
    name: 'Sneakers Lari Cepat',
    category: 'upgrade',
    price: 65,
    description: 'Meningkatkan kecepatan lari & berenang sebesar +10% per level.',
    effectLabel: '+10% Kecepatan',
    colorHex: '#F97316',
    maxLevel: 3,
  },
  {
    id: 'con_shield',
    name: 'Perisai Gelembung',
    category: 'consumable',
    price: 25,
    description: 'Melindungi karakter dari 1 kali benturan rintangan.',
    effectLabel: '+1 Perisai Aktif',
    colorHex: '#22D3EE',
  },
  {
    id: 'con_magnet',
    name: 'Jimat Magnet Koin',
    category: 'consumable',
    price: 30,
    description: 'Menarik koin dan berlian di sekitar karakter secara otomatis.',
    effectLabel: '+1 Magnet Koin',
    colorHex: '#6366F1',
  },
  {
    id: 'con_life',
    name: 'Hati Cadangan',
    category: 'consumable',
    price: 35,
    description: 'Menambah +1 kapasitas hati saat memulai petualangan berikutnya.',
    effectLabel: '+1 Hati Tambahan',
    colorHex: '#EF4444',
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_splash', title: 'Cipratan Pertama', description: 'Selesaikan Dunia 01: Petualangan Kolam Renang', rewardCoins: 30 },
  { id: 'slide_master', title: 'Jagoan Seluncuran', description: 'Selesaikan Dunia 02: Wahana Water Park Gurita', rewardCoins: 45 },
  { id: 'safari_friend', title: 'Sahabat Satwa CAS', description: 'Selesaikan Dunia 03: Taman Flora & Fauna CAS', rewardCoins: 60 },
  { id: 'outbound_hero', title: 'Pahlawan Outbound', description: 'Selesaikan Dunia 04: Petualangan Outbound Cikole', rewardCoins: 100 },
  { id: 'coin_collector', title: 'Pemburu Harta', description: 'Kumpulkan total 250 koin sepanjang permainan', rewardCoins: 50 },
  { id: 'ticket_finder', title: 'Penyelamat Tiket', description: 'Temukan 10 tiket masuk CAS Water Park', rewardCoins: 50 },
  { id: 'shopaholic', title: 'Gaya Petualang', description: 'Beli item pertama di Toko CAS Water Park', rewardCoins: 20 },
  { id: 'blaster_ace', title: 'Jagoan Pistol Air', description: 'Selesaikan level Mode Acak Generator CAS', rewardCoins: 55 },
];
