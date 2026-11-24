import fs from 'fs';
import path from 'path';

const root = process.cwd();
const publicAssets = path.join(root, 'public', 'assets');
const manifestDir = path.join(root, 'public', 'manifest');

const dirs = [
  'characters',
  'characters/animations',
  'environments',
  'environments/pool',
  'environments/waterpark',
  'environments/wildlife',
  'environments/outbound',
  'facilities',
  'collectibles',
  'obstacles',
  'effects',
  'ui',
  'audio/music',
  'audio/sfx',
];

for (const d of dirs) {
  fs.mkdirSync(path.join(publicAssets, d), { recursive: true });
}
fs.mkdirSync(manifestDir, { recursive: true });

// Copy generated AI art assets into /public/assets/
const generatedCopies = [
  {
    src: 'src/assets/images/menu_tropical_backdrop_1795500160224.jpg',
    dest: 'ui/UI_002_menu_bg.jpg',
  },
  {
    src: 'src/assets/images/world_pool_bg_1795500161290.jpg',
    dest: 'environments/pool/ENV_001_swimming_pool_bg.jpg',
  },
  {
    src: 'src/assets/images/world_waterpark_bg_1795500161748.jpg',
    dest: 'environments/waterpark/ENV_005_waterpark_bg.jpg',
  },
  {
    src: 'src/assets/images/world_wildlife_bg_1795500162166.jpg',
    dest: 'environments/wildlife/ENV_010_tropical_jungle.jpg',
  },
  {
    src: 'src/assets/images/world_outbound_bg_1795500162999.jpg',
    dest: 'environments/outbound/ENV_015_outbound_entrance.jpg',
  },
  {
    src: 'src/assets/images/char_boy_portrait_1795500163113.jpg',
    dest: 'characters/CHAR_001_player_boy.jpg',
  },
  {
    src: 'src/assets/images/char_girl_portrait_1795500163940.jpg',
    dest: 'characters/CHAR_002_player_girl.jpg',
  },
];

for (const item of generatedCopies) {
  const srcPath = path.join(root, item.src);
  const destPath = path.join(publicAssets, item.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}

function writeSvg(relPath, width, height, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>\n`;
  fs.writeFileSync(path.join(publicAssets, relPath), svg, 'utf8');
}

function writeWav(relPath, durationSec, freqBase, mode = 'melody') {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20); // Linear PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  const scale = [1, 1.122, 1.26, 1.498, 1.682, 2];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t / 0.02) * Math.min(1, (durationSec - t) / 0.05);
    let sample = 0;
    if (mode === 'melody') {
      const step = Math.floor(t * 4) % scale.length;
      const f = freqBase * scale[step];
      const subEnv = Math.exp(-((t * 4) % 1) * 3.5);
      sample = (Math.sin(2 * Math.PI * f * t) * 0.45 + Math.sin(2 * Math.PI * f * 0.5 * t) * 0.25) * subEnv;
    } else if (mode === 'chirp') {
      const f = freqBase + (t / durationSec) * freqBase * 0.8;
      sample = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 8) * 0.55;
    } else if (mode === 'splash') {
      const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      sample = noise * Math.exp(-t * 6) * 0.35 + Math.sin(2 * Math.PI * freqBase * t) * Math.exp(-t * 10) * 0.3;
    } else {
      sample = Math.sin(2 * Math.PI * freqBase * t) * Math.exp(-t * 5) * 0.5;
    }
    const val = Math.max(-1, Math.min(1, sample * env));
    buffer.writeInt16LE(Math.floor(val * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(publicAssets, relPath), buffer);
}

const manifest = [];

function register(id, name, relPath, format, width, height, frames, level, description) {
  manifest.push({
    id,
    name,
    path: `/assets/${relPath}`,
    format,
    dimensions: `${width}x${height}`,
    frames,
    level,
    description,
  });
}

// Register AI-generated assets
register('CHAR_001', 'Player Boy', 'characters/CHAR_001_player_boy.jpg', 'jpg', 1024, 1024, 1, 'all', 'Cheerful boy adventurer portrait in aqua & orange CAS vest');
register('CHAR_002', 'Player Girl', 'characters/CHAR_002_player_girl.jpg', 'jpg', 1024, 1024, 1, 'all', 'Cheerful girl adventurer portrait in coral & turquoise CAS tunic');
register('ENV_001', 'Swimming Pool Background', 'environments/pool/ENV_001_swimming_pool_bg.jpg', 'jpg', 1920, 1080, 1, 1, 'Sunny tropical pool resort background');
register('ENV_005', 'Waterpark Background', 'environments/waterpark/ENV_005_waterpark_bg.jpg', 'jpg', 1920, 1080, 1, 2, 'Waterpark giant spiral slides and bucket tower background');
register('ENV_010', 'Tropical Jungle', 'environments/wildlife/ENV_010_tropical_jungle.jpg', 'jpg', 1920, 1080, 1, 3, 'Sunlit wildlife park jungle sanctuary background');
register('ENV_015', 'Outbound Entrance', 'environments/outbound/ENV_015_outbound_entrance.jpg', 'jpg', 1920, 1080, 1, 4, 'Mountain forest canopy zipline and suspension bridges background');
register('UI_002', 'Main Menu Background', 'ui/UI_002_menu_bg.jpg', 'jpg', 1920, 1080, 1, 'menu', 'CAS Waterpark Adventure Park key art backdrop');

// Character Animation SVG Sheets
const charAnims = [
  ['CHAR_003', 'Idle Animation', 'characters/animations/CHAR_003_idle.svg', 4, '#06B6D4'],
  ['CHAR_004', 'Running Animation', 'characters/animations/CHAR_004_run.svg', 6, '#0EA5E9'],
  ['CHAR_005', 'Jumping Animation', 'characters/animations/CHAR_005_jump.svg', 2, '#22D3EE'],
  ['CHAR_006', 'Double Jump Animation', 'characters/animations/CHAR_006_double_jump.svg', 4, '#38BDF8'],
  ['CHAR_007', 'Landing Animation', 'characters/animations/CHAR_007_land.svg', 2, '#0284C7'],
  ['CHAR_008', 'Swimming Animation', 'characters/animations/CHAR_008_swim.svg', 4, '#0891B2'],
  ['CHAR_009', 'Climbing Animation', 'characters/animations/CHAR_009_climb.svg', 4, '#10B981'],
  ['CHAR_010', 'Sliding Animation', 'characters/animations/CHAR_010_slide.svg', 2, '#F97316'],
  ['CHAR_011', 'Falling Animation', 'characters/animations/CHAR_011_fall.svg', 2, '#FB923C'],
  ['CHAR_012', 'Victory Animation', 'characters/animations/CHAR_012_victory.svg', 4, '#FACC15'],
  ['CHAR_013', 'Damage Animation', 'characters/animations/CHAR_013_damage.svg', 2, '#EF4444'],
  ['CHAR_014', 'Coin Pickup Animation', 'characters/animations/CHAR_014_coin_pickup.svg', 3, '#F59E0B'],
  ['CHAR_015', 'Ticket Pickup Animation', 'characters/animations/CHAR_015_ticket_pickup.svg', 3, '#EC4899'],
];

for (const [id, name, rel, frames, color] of charAnims) {
  let body = '';
  for (let f = 0; f < frames; f++) {
    const x = f * 64 + 32;
    const bob = (f % 2) * 3;
    body += `<g transform="translate(${x}, ${32 - bob})"><circle cx="0" cy="-12" r="10" fill="#FDE68A" stroke="#0F172A" stroke-width="2"/><rect x="-10" y="-1" width="20" height="22" rx="6" fill="${color}" stroke="#0F172A" stroke-width="2"/><circle cx="-3" cy="-13" r="1.8" fill="#0F172A"/><circle cx="4" cy="-13" r="1.8" fill="#0F172A"/></g>`;
  }
  writeSvg(rel, frames * 64, 64, body);
  register(id, name, rel, 'svg', frames * 64, 64, frames, 'all', `${name} sprite strip`);
}

// Remaining Environment SVGs
const envSvgs = [
  ['ENV_002', 'Pool Landscape', 'environments/pool/ENV_002_pool_landscape.svg', 1, '#0EA5E9', '#FDE047'],
  ['ENV_003', 'Animated Pool Water', 'environments/pool/ENV_003_pool_water.svg', 1, '#22D3EE', '#E0F2FE'],
  ['ENV_004', 'Underwater Environment', 'environments/pool/ENV_004_underwater.svg', 1, '#0369A1', '#67E8F9'],
  ['ENV_006', 'Giant Water Slides', 'environments/waterpark/ENV_006_giant_slides.svg', 2, '#F97316', '#38BDF8'],
  ['ENV_007', 'Wave Pool', 'environments/waterpark/ENV_007_wave_pool.svg', 2, '#0284C7', '#BAE6FD'],
  ['ENV_008', 'Lazy River', 'environments/waterpark/ENV_008_lazy_river.svg', 2, '#06B6D4', '#A7F3D0'],
  ['ENV_009', 'Zoo Entrance', 'environments/wildlife/ENV_009_zoo_entrance.svg', 3, '#15803D', '#FBBF24'],
  ['ENV_011', 'Elephant Habitat', 'environments/wildlife/ENV_011_elephant_habitat.svg', 3, '#16A34A', '#94A3B8'],
  ['ENV_012', 'Giraffe Habitat', 'environments/wildlife/ENV_012_giraffe_habitat.svg', 3, '#65A30D', '#F59E0B'],
  ['ENV_013', 'Zebra Habitat', 'environments/wildlife/ENV_013_zebra_habitat.svg', 3, '#22C55E', '#E2E8F0'],
  ['ENV_014', 'Safari Landscape', 'environments/wildlife/ENV_014_safari_landscape.svg', 3, '#059669', '#FCD34D'],
  ['ENV_016', 'Rope Adventure Zone', 'environments/outbound/ENV_016_rope_zone.svg', 4, '#B45309', '#FDE68A'],
  ['ENV_017', 'Climbing Zone', 'environments/outbound/ENV_017_climbing_zone.svg', 4, '#475569', '#FB923C'],
  ['ENV_018', 'Flying Fox Area', 'environments/outbound/ENV_018_flying_fox.svg', 4, '#0F766E', '#FACC15'],
  ['ENV_019', 'Suspension Bridge', 'environments/outbound/ENV_019_suspension_bridge.svg', 4, '#92400E', '#34D399'],
  ['ENV_020', 'Mountain Forest', 'environments/outbound/ENV_020_mountain_forest.svg', 4, '#065F46', '#F97316'],
];

for (const [id, name, rel, lvl, c1, c2] of envSvgs) {
  writeSvg(rel, 256, 128, `<rect width="256" height="128" rx="12" fill="${c1}"/><path d="M0 96 Q64 72 128 96 T256 96 V128 H0 Z" fill="${c2}" opacity="0.75"/>`);
  register(id, name, rel, 'svg', 256, 128, 1, lvl, `${name} scenery layer`);
}

// Facilities FAC_001..FAC_024
const facilities = [
  ['FAC_001', 'Swimming Pool', 1, '#06B6D4'],
  ['FAC_002', "Children's Pool", 1, '#38BDF8'],
  ['FAC_003', 'Small Water Slide', 1, '#F97316'],
  ['FAC_004', 'Spiral Water Slide', 2, '#EC4899'],
  ['FAC_005', 'Diving Board', 1, '#FACC15'],
  ['FAC_006', 'Pool Ladder', 1, '#E2E8F0'],
  ['FAC_007', 'Inflatable Ring', 1, '#FB7185'],
  ['FAC_008', 'Giant Water Slide', 2, '#3B82F6'],
  ['FAC_009', 'Wave Machine', 2, '#0EA5E9'],
  ['FAC_010', 'Water Bucket', 2, '#EF4444'],
  ['FAC_011', 'Zoo Entrance Gate', 3, '#B45309'],
  ['FAC_012', 'Elephant Shelter', 3, '#64748B'],
  ['FAC_013', 'Giraffe Shelter', 3, '#D97706'],
  ['FAC_014', 'Zebra Shelter', 3, '#334155'],
  ['FAC_015', 'Animal Feeding Station', 3, '#22C55E'],
  ['FAC_016', 'Safari Jeep', 3, '#EAB308'],
  ['FAC_017', 'Wooden Bridge', 3, '#92400E'],
  ['FAC_018', 'Rope Bridge', 4, '#A16207'],
  ['FAC_019', 'Flying Fox', 4, '#0D9488'],
  ['FAC_020', 'Climbing Wall', 4, '#475569'],
  ['FAC_021', 'Rope Ladder', 4, '#CA8A04'],
  ['FAC_022', 'Balance Beam', 4, '#78350F'],
  ['FAC_023', 'Swinging Rope', 4, '#B45309'],
  ['FAC_024', 'Checkpoint Gate', 'all', '#10B981'],
];

for (const [id, name, lvl, color] of facilities) {
  const rel = `facilities/${id}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.svg`;
  writeSvg(rel, 96, 96, `<rect x="8" y="8" width="80" height="80" rx="16" fill="${color}" stroke="#0F172A" stroke-width="3"/><circle cx="48" cy="48" r="20" fill="#FFFFFF" opacity="0.28"/>`);
  register(id, name, rel, 'svg', 96, 96, 1, lvl, `${name} interactive facility`);
}

// Collectibles ITEM_001..ITEM_015
const items = [
  ['ITEM_001', 'Bronze Coin', '#D97706'],
  ['ITEM_002', 'Silver Coin', '#CBD5E1'],
  ['ITEM_003', 'Gold Coin', '#FACC15'],
  ['ITEM_004', 'Normal Ticket', '#38BDF8'],
  ['ITEM_005', 'VIP Ticket', '#A855F7'],
  ['ITEM_006', 'Golden Ticket', '#F59E0B'],
  ['ITEM_007', 'Mystery Ticket', '#EC4899'],
  ['ITEM_008', 'Treasure Chest', '#B45309'],
  ['ITEM_009', 'Golden Key', '#EAB308'],
  ['ITEM_010', 'Diamond', '#22D3EE'],
  ['ITEM_011', 'Energy Booster', '#10B981'],
  ['ITEM_012', 'Speed Booster', '#F97316'],
  ['ITEM_013', 'Extra Life', '#EF4444'],
  ['ITEM_014', 'Coin Magnet', '#6366F1'],
  ['ITEM_015', 'Shield', '#06B6D4'],
];

for (const [id, name, color] of items) {
  const rel = `collectibles/${id}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.svg`;
  writeSvg(rel, 48, 48, `<circle cx="24" cy="24" r="18" fill="${color}" stroke="#0F172A" stroke-width="3"/><circle cx="19" cy="18" r="5" fill="#FFFFFF" opacity="0.45"/>`);
  register(id, name, rel, 'svg', 48, 48, 1, 'all', `${name} collectible`);
}

// Obstacles OBS_001..OBS_012
const obstacles = [
  ['OBS_001', 'Wet Floor', '#38BDF8'],
  ['OBS_002', 'Moving Platform', '#0284C7'],
  ['OBS_003', 'Water Current', '#06B6D4'],
  ['OBS_004', 'Rotating Obstacle', '#EF4444'],
  ['OBS_005', 'Falling Log', '#78350F'],
  ['OBS_006', 'Swinging Rope', '#D97706'],
  ['OBS_007', 'Moving Bridge', '#92400E'],
  ['OBS_008', 'Collapsing Platform', '#B45309'],
  ['OBS_009', 'Splash Trap', '#0EA5E9'],
  ['OBS_010', 'Rolling Barrel', '#A16207'],
  ['OBS_011', 'Moving Animal', '#F59E0B'],
  ['OBS_012', 'Timed Gate', '#64748B'],
];

for (const [id, name, color] of obstacles) {
  const rel = `obstacles/${id}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.svg`;
  writeSvg(rel, 64, 64, `<rect x="6" y="16" width="52" height="32" rx="8" fill="${color}" stroke="#0F172A" stroke-width="3"/>`);
  register(id, name, rel, 'svg', 64, 64, 1, 'all', `${name} obstacle`);
}

// Effects FX
const effects = [
  ['FX_001', 'Water Splash Particles', 'effects/FX_001_water_splash.svg', '#38BDF8'],
  ['FX_002', 'Coin Burst Particles', 'effects/FX_002_coin_burst.svg', '#FACC15'],
  ['FX_003', 'Bubble Trail', 'effects/FX_003_bubbles.svg', '#BAE6FD'],
];
for (const [id, name, rel, color] of effects) {
  writeSvg(rel, 48, 48, `<circle cx="16" cy="24" r="7" fill="${color}"/><circle cx="32" cy="18" r="5" fill="${color}"/><circle cx="28" cy="34" r="4" fill="${color}"/>`);
  register(id, name, rel, 'svg', 48, 48, 1, 'all', `${name} particle sprite`);
}

// UI SVGs (UI_001, UI_003..UI_025)
const uiIds = [
  ['UI_001', 'Game Logo', '#06B6D4'],
  ['UI_003', 'Play Button', '#10B981'],
  ['UI_004', 'Pause Button', '#0284C7'],
  ['UI_005', 'Resume Button', '#10B981'],
  ['UI_006', 'Restart Button', '#F97316'],
  ['UI_007', 'Home Button', '#64748B'],
  ['UI_008', 'Left Arrow', '#0EA5E9'],
  ['UI_009', 'Right Arrow', '#0EA5E9'],
  ['UI_010', 'Jump Button', '#F59E0B'],
  ['UI_011', 'Action Button', '#EC4899'],
  ['UI_012', 'Coin Counter', '#FACC15'],
  ['UI_013', 'Ticket Counter', '#A855F7'],
  ['UI_014', 'Health Indicator', '#EF4444'],
  ['UI_015', 'Progress Bar', '#22D3EE'],
  ['UI_016', 'Mission Panel', '#0F172A'],
  ['UI_017', 'Victory Screen', '#FACC15'],
  ['UI_018', 'Game Over Screen', '#EF4444'],
  ['UI_019', 'Level Selection', '#0284C7'],
  ['UI_020', 'Settings Panel', '#475569'],
  ['UI_021', 'Sound Button', '#0EA5E9'],
  ['UI_022', 'Music Button', '#8B5CF6'],
  ['UI_023', 'Loading Screen', '#0891B2'],
  ['UI_024', 'Checkpoint Indicator', '#10B981'],
  ['UI_025', 'Map Button', '#14B8A6'],
];

for (const [id, name, color] of uiIds) {
  const rel = `ui/${id}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.svg`;
  writeSvg(rel, 64, 64, `<rect x="6" y="6" width="52" height="52" rx="14" fill="${color}" stroke="#FFFFFF" stroke-width="3"/>`);
  register(id, name, rel, 'svg', 64, 64, 1, 'ui', `${name} interface asset`);
}

// Music WAV files MUS_001..MUS_007
const musicTracks = [
  ['MUS_001', 'Main Menu Theme', 'audio/music/MUS_001_main_menu.wav', 4.0, 261.63, 'menu'],
  ['MUS_002', 'Swimming Pool Theme', 'audio/music/MUS_002_swimming_pool.wav', 4.0, 293.66, 1],
  ['MUS_003', 'Water Park Theme', 'audio/music/MUS_003_water_park.wav', 4.0, 329.63, 2],
  ['MUS_004', 'Wildlife Park Theme', 'audio/music/MUS_004_wildlife_park.wav', 4.0, 246.94, 3],
  ['MUS_005', 'Outbound Theme', 'audio/music/MUS_005_outbound.wav', 4.0, 349.23, 4],
  ['MUS_006', 'Victory Theme', 'audio/music/MUS_006_victory.wav', 2.5, 392.0, 'all'],
  ['MUS_007', 'Game Over Theme', 'audio/music/MUS_007_game_over.wav', 2.0, 196.0, 'all'],
];

for (const [id, name, rel, dur, freq, lvl] of musicTracks) {
  writeWav(rel, dur, freq, 'melody');
  register(id, name, rel, 'wav', 1, 1, 1, lvl, `${name} tropical loop`);
}

// SFX WAV files SFX_001..SFX_024
const sfxList = [
  ['SFX_001', 'Button Click', 0.12, 660, 'tone'],
  ['SFX_002', 'Jump', 0.18, 340, 'chirp'],
  ['SFX_003', 'Double Jump', 0.22, 480, 'chirp'],
  ['SFX_004', 'Landing', 0.12, 160, 'tone'],
  ['SFX_005', 'Running', 0.08, 210, 'tone'],
  ['SFX_006', 'Coin Pickup', 0.18, 880, 'chirp'],
  ['SFX_007', 'Ticket Pickup', 0.28, 720, 'melody'],
  ['SFX_008', 'Golden Ticket Pickup', 0.45, 920, 'melody'],
  ['SFX_009', 'Treasure Chest', 0.4, 580, 'melody'],
  ['SFX_010', 'Water Splash', 0.3, 300, 'splash'],
  ['SFX_011', 'Swimming', 0.2, 240, 'splash'],
  ['SFX_012', 'Slide', 0.35, 520, 'chirp'],
  ['SFX_013', 'Falling', 0.35, 420, 'tone'],
  ['SFX_014', 'Damage', 0.25, 140, 'tone'],
  ['SFX_015', 'Checkpoint', 0.35, 620, 'melody'],
  ['SFX_016', 'Level Unlock', 0.5, 760, 'melody'],
  ['SFX_017', 'Victory', 0.8, 523, 'melody'],
  ['SFX_018', 'Game Over', 0.6, 220, 'tone'],
  ['SFX_019', 'Animal Ambient', 0.4, 380, 'chirp'],
  ['SFX_020', 'Jungle Ambient', 0.4, 280, 'splash'],
  ['SFX_021', 'Water Ambient', 0.4, 200, 'splash'],
  ['SFX_022', 'Rope Swing', 0.25, 310, 'chirp'],
  ['SFX_023', 'Flying Fox', 0.4, 540, 'chirp'],
  ['SFX_024', 'Collectible Magnet', 0.22, 680, 'chirp'],
];

for (const [id, name, dur, freq, mode] of sfxList) {
  const rel = `audio/sfx/${id}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.wav`;
  writeWav(rel, dur, freq, mode);
  register(id, name, rel, 'wav', 1, 1, 1, 'all', `${name} sound effect`);
}

fs.writeFileSync(path.join(manifestDir, 'asset-manifest.json'), JSON.stringify({
  project: 'CAS Waterpark - Adventure Park: The Lost Tickets',
  domain: 'https://games.caswaterpark.com',
  generatedAt: new Date().toISOString(),
  totalAssets: manifest.length,
  assets: manifest,
}, null, 2));

console.log(`Generated ${manifest.length} manifest entries and verified files in public/assets.`);
