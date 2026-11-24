import Phaser from 'phaser';
import { CHARACTERS, CharacterId } from './GameConfig';
import { SaveManager } from './SaveManager';

// Indeks frame (88x96 karakter 2D kartun ekspresif):
// 0-3: idle, 4-9: run, 10-11: jump, 12-15: doubleJump, 16-17: land,
// 18-21: swim, 22-25: climb, 26-27: slide, 28-29: fall,
// 30-33: victory, 34-35: damage, 36-37: collect
export const CHAR_FRAME_COUNT = 38;
export const CHAR_FRAME_W = 88;
export const CHAR_FRAME_H = 96;

export function buildAllProceduralTextures(scene: Phaser.Scene): void {
  buildCharacterSheet(scene, 'boy');
  buildCharacterSheet(scene, 'girl');
  buildWeaponAndProjectileTextures(scene);
  buildCollectibleTextures(scene);
  buildParticleTextures(scene);
  buildFacilityAndObstacleTextures(scene);
  buildEnemyTextures(scene);
  buildCasLandmarkTextures(scene);
  buildWildlifeTextures(scene);
}

export function refreshEquippedCharacterTextures(scene: Phaser.Scene): void {
  buildCharacterSheet(scene, 'boy');
  buildCharacterSheet(scene, 'girl');
}

function buildCharacterSheet(scene: Phaser.Scene, charId: CharacterId): void {
  const key = `char_${charId}_sheet`;
  const fw = CHAR_FRAME_W;
  const fh = CHAR_FRAME_H;
  const totalW = fw * CHAR_FRAME_COUNT;

  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }

  const canvasTex = scene.textures.createCanvas(key, totalW, fh);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();
  const def = CHARACTERS[charId];
  const save = SaveManager.getData();

  let shirtTop = charId === 'boy' ? '#0EA5E9' : '#FB7185';
  let shirtBot = charId === 'boy' ? '#0369A1' : '#BE123C';
  let shortsCol = charId === 'boy' ? '#F97316' : '#0D9488';
  let trimCol = '#FEF08A';

  if (save.equippedOutfit === 'outfit_aqua') {
    shirtTop = '#38BDF8';
    shirtBot = '#0284C7';
    shortsCol = '#FACC15';
  } else if (save.equippedOutfit === 'outfit_safari') {
    shirtTop = '#34D399';
    shirtBot = '#047857';
    shortsCol = '#92400E';
  } else if (save.equippedOutfit === 'outfit_golden') {
    shirtTop = '#FBBF24';
    shirtBot = '#B45309';
    shortsCol = '#1E293B';
    trimCol = '#FFFFFF';
  }

  const hairHex = '#' + def.hairColor.toString(16).padStart(6, '0');
  const skinHex = '#' + def.skinColor.toString(16).padStart(6, '0');

  for (let f = 0; f < CHAR_FRAME_COUNT; f++) {
    const ox = f * fw;
    ctx.save();
    ctx.translate(ox + fw / 2, fh / 2 + 8);

    let legAngle = 0;
    let armAngle = 0;
    let bodyY = 0;
    let bodyRot = 0;
    let scaleX = 1;
    let scaleY = 1;
    let scarfFlutter = 0;
    let expression: 'happy' | 'effort' | 'hurt' | 'win' = 'happy';

    if (f <= 3) {
      const p = (f / 4) * Math.PI * 2;
      bodyY = Math.sin(p) * 1.6;
      armAngle = Math.sin(p) * 0.08;
      scarfFlutter = Math.sin(p) * 2;
    } else if (f <= 9) {
      const p = ((f - 4) / 6) * Math.PI * 2;
      legAngle = Math.sin(p) * 0.72;
      armAngle = -Math.sin(p) * 0.68;
      bodyY = -Math.abs(Math.cos(p)) * 4;
      bodyRot = 0.09;
      scarfFlutter = Math.sin(p) * 4 + 4;
    } else if (f <= 11) {
      bodyY = -4;
      armAngle = -0.9;
      legAngle = 0.42;
      scaleX = 0.94;
      scaleY = 1.07;
      scarfFlutter = 6;
    } else if (f <= 15) {
      bodyRot = ((f - 12) / 4) * Math.PI * 2;
      armAngle = -1.0;
      expression = 'effort';
      scarfFlutter = 8;
    } else if (f <= 17) {
      bodyY = 4;
      scaleX = 1.12;
      scaleY = 0.89;
    } else if (f <= 21) {
      const p = ((f - 18) / 4) * Math.PI * 2;
      bodyRot = 0.45;
      armAngle = Math.sin(p) * 0.9;
      legAngle = Math.cos(p) * 0.48;
      scarfFlutter = 4;
    } else if (f <= 25) {
      const p = ((f - 22) / 4) * Math.PI * 2;
      armAngle = -1.25 + Math.sin(p) * 0.55;
      legAngle = Math.cos(p) * 0.52;
      expression = 'effort';
    } else if (f <= 27) {
      bodyRot = -0.34;
      bodyY = 5;
      legAngle = 0.68;
      armAngle = -0.65;
      scarfFlutter = 9;
    } else if (f <= 29) {
      armAngle = -1.05;
      legAngle = 0.28;
      bodyY = -2;
      expression = 'effort';
      scarfFlutter = 7;
    } else if (f <= 33) {
      bodyY = -Math.abs(Math.sin(((f - 30) / 4) * Math.PI)) * 6;
      armAngle = -1.35;
      expression = 'win';
      scarfFlutter = 5;
    } else if (f <= 35) {
      bodyRot = -0.24;
      expression = 'hurt';
    } else {
      bodyY = -4;
      armAngle = -0.95;
      expression = 'win';
    }

    // Bayangan pijakan
    ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
    ctx.beginPath();
    ctx.ellipse(0, 34, 15, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(0, bodyY);
    ctx.rotate(bodyRot);
    ctx.scale(scaleX, scaleY);

    // Ransel petualang 2D dengan resleting & tali
    ctx.fillStyle = shortsCol;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -10);
    ctx.quadraticCurveTo(-22, -9, -22, 2);
    ctx.quadraticCurveTo(-22, 13, -11, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = trimCol;
    ctx.fillRect(-19, -4, 6, 4);

    // Kaki Belakang (celana, betis kulit, sepatu sneakers)
    drawLimbLeg(ctx, -4, 12, -legAngle, shortsCol, skinHex, shirtBot, '#E2E8F0', true);

    // Tangan Belakang (lengan baju + tangan)
    drawLimbArm(ctx, -10, -6, -armAngle, shirtBot, skinHex, true);

    // Badan / Kaos berkerah dengan lipatan baju
    const torsoGrad = ctx.createLinearGradient(0, -10, 0, 15);
    torsoGrad.addColorStop(0, shirtTop);
    torsoGrad.addColorStop(1, shirtBot);
    ctx.fillStyle = torsoGrad;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-11, -9);
    ctx.quadraticCurveTo(0, -11, 11, -9);
    ctx.lineTo(13, 12);
    ctx.quadraticCurveTo(0, 15, -13, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sabuk & Emblem CAS
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-12, 8, 24, 4);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-3, 7.5, 6, 5);
    // Kerah baju V-neck
    ctx.fillStyle = trimCol;
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(0, -2);
    ctx.lineTo(6, -9);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Kaki Depan
    drawLimbLeg(ctx, 4, 12, legAngle, shortsCol, skinHex, shirtTop, '#FFFFFF', false);

    // Syal aksesori berkibar
    if (save.equippedAccessory === 'acc_scarf') {
      ctx.fillStyle = '#F43F5E';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-11, -10);
      ctx.lineTo(11, -10);
      ctx.lineTo(10, -5);
      ctx.lineTo(-11, -5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, -7);
      ctx.quadraticCurveTo(-22 - scarfFlutter, -2, -25 - scarfFlutter, 6);
      ctx.lineTo(-15 - scarfFlutter * 0.4, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Leher
    ctx.fillStyle = skinHex;
    ctx.fillRect(-4, -14, 8, 6);

    // Kepala Kartun 2D Kontur Alami (pipi, dagu, telinga)
    const headGrad = ctx.createRadialGradient(-3, -27, 2, 0, -24, 17);
    headGrad.addColorStop(0, '#FFF5E9');
    headGrad.addColorStop(0.65, skinHex);
    headGrad.addColorStop(1, '#DF9F70');
    ctx.fillStyle = headGrad;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-13, -24);
    ctx.quadraticCurveTo(-14, -38, 0, -39);
    ctx.quadraticCurveTo(15, -38, 15, -24);
    ctx.quadraticCurveTo(14, -12, 2, -11);
    ctx.quadraticCurveTo(-12, -11, -13, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Telinga kiri
    ctx.fillStyle = skinHex;
    ctx.beginPath();
    ctx.arc(-13.5, -22, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rona pipi hangat
    ctx.fillStyle = 'rgba(244, 63, 94, 0.24)';
    ctx.beginPath();
    ctx.ellipse(-6, -18, 3.2, 1.9, 0, 0, Math.PI * 2);
    ctx.ellipse(10, -18, 3.2, 1.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rambut 2D berlapis
    ctx.fillStyle = hairHex;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    if (charId === 'girl') {
      // Kuncir belakang dinamis
      ctx.beginPath();
      ctx.moveTo(-11, -29);
      ctx.quadraticCurveTo(-24, -32 - scarfFlutter * 0.2, -23, -18 - scarfFlutter * 0.2);
      ctx.quadraticCurveTo(-17, -15, -12, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Ikat rambut merah muda
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(-12, -28, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Poni rambut depan
      ctx.fillStyle = hairHex;
      ctx.beginPath();
      ctx.moveTo(-14, -24);
      ctx.quadraticCurveTo(-14, -40, 2, -40);
      ctx.quadraticCurveTo(16, -39, 15, -26);
      ctx.quadraticCurveTo(8, -31, 3, -26);
      ctx.quadraticCurveTo(-4, -31, -14, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Rambut petualang jabrik Raka
      ctx.beginPath();
      ctx.moveTo(-14, -24);
      ctx.lineTo(-14, -33);
      ctx.lineTo(-9, -40);
      ctx.lineTo(-4, -34);
      ctx.lineTo(2, -42);
      ctx.lineTo(7, -34);
      ctx.lineTo(13, -39);
      ctx.lineTo(15, -26);
      ctx.quadraticCurveTo(6, -31, -2, -29);
      ctx.quadraticCurveTo(-9, -31, -14, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Mata & Alis Ekspresif (menghadap kanan sebagai default)
    if (expression === 'hurt') {
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-3, -25);
      ctx.lineTo(1, -21);
      ctx.moveTo(1, -25);
      ctx.lineTo(-3, -21);
      ctx.moveTo(7, -25);
      ctx.lineTo(11, -21);
      ctx.moveTo(11, -25);
      ctx.lineTo(7, -21);
      ctx.stroke();
    } else {
      // Alis
      ctx.strokeStyle = hairHex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -28);
      ctx.lineTo(2, -28.5);
      ctx.moveTo(6, -28.5);
      ctx.lineTo(12, -28);
      ctx.stroke();

      // Bola mata putih
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-0.5, -22.5, 3, 3.8, 0, 0, Math.PI * 2);
      ctx.ellipse(9, -22.5, 3, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Pupil + iris
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(0.5, -22.2, 2.1, 0, Math.PI * 2);
      ctx.arc(10, -22.2, 2.1, 0, Math.PI * 2);
      ctx.fill();
      // Kilau mata
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(1.2, -23.4, 0.9, 0, Math.PI * 2);
      ctx.arc(10.7, -23.4, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hidung kecil
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(5, -19, 1.5, -0.5, 1.4);
    ctx.stroke();

    // Mulut
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    if (expression === 'hurt') {
      ctx.arc(4, -13, 3.2, Math.PI, 0);
      ctx.stroke();
    } else if (expression === 'win') {
      ctx.fillStyle = '#EF4444';
      ctx.arc(4, -16, 4.2, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.arc(4, -16.5, 4.2, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    // Kacamata Selam
    if (save.equippedAccessory === 'acc_goggles') {
      ctx.fillStyle = '#38BDF8';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8;
      ctx.fillRect(-13, -32, 28, 3);
      ctx.beginPath();
      ctx.roundRect(-5, -34, 9, 6, 2.5);
      ctx.roundRect(6, -34, 9, 6, 2.5);
      ctx.fill();
      ctx.stroke();
    }

    // Topi Terpasang
    if (save.equippedHat === 'hat_sunvisor') {
      ctx.fillStyle = '#06B6D4';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, -42, 29, 9, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(3, -36, 17, 4.5, 2);
      ctx.fill();
      ctx.stroke();
    } else if (save.equippedHat === 'hat_safari') {
      ctx.fillStyle = '#D97706';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-19, -37, 38, 5, 2.5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-10, -45, 21, 10, 4);
      ctx.fill();
      ctx.stroke();
    } else if (save.equippedHat === 'hat_crown') {
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-11, -36);
      ctx.lineTo(-11, -46);
      ctx.lineTo(-4, -40);
      ctx.lineTo(1, -49);
      ctx.lineTo(6, -40);
      ctx.lineTo(12, -46);
      ctx.lineTo(12, -36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Tangan Depan (paling atas secara visual)
    drawLimbArm(ctx, 10, -6, armAngle, shirtTop, skinHex, false);

    ctx.restore();
  }

  canvasTex.refresh();
  for (let i = 0; i < CHAR_FRAME_COUNT; i++) {
    canvasTex.add(i, 0, i * fw, 0, fw, fh);
  }
}

function drawLimbLeg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  shortsCol: string,
  skinHex: string,
  shoeAccent: string,
  shoeBody: string,
  isBack: boolean
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;

  // Celana pendek
  ctx.fillStyle = isBack ? shadeColor(shortsCol, -25) : shortsCol;
  ctx.beginPath();
  ctx.moveTo(-5, -1);
  ctx.lineTo(5, -1);
  ctx.lineTo(5.5, 9);
  ctx.lineTo(-5.5, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Betis
  ctx.fillStyle = isBack ? shadeColor(skinHex, -18) : skinHex;
  ctx.fillRect(-3.5, 9, 7, 6);
  ctx.strokeRect(-3.5, 9, 7, 6);

  // Sepatu Sneakers 2D
  ctx.fillStyle = shoeBody;
  ctx.beginPath();
  ctx.moveTo(-5, 14);
  ctx.lineTo(5, 14);
  ctx.quadraticCurveTo(11, 15, 11, 20);
  ctx.lineTo(-5, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Sol karet & aksen
  ctx.fillStyle = shoeAccent;
  ctx.fillRect(-4, 15, 9, 2.5);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-5, 19, 16, 2.5);

  ctx.restore();
}

function drawLimbArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  sleeveCol: string,
  skinHex: string,
  isBack: boolean
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2;

  // Lengan baju
  ctx.fillStyle = sleeveCol;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(4.5, 8);
  ctx.lineTo(-4.5, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lengan bawah
  ctx.fillStyle = isBack ? shadeColor(skinHex, -16) : skinHex;
  ctx.fillRect(-3, 8, 6, 8);
  ctx.strokeRect(-3, 8, 6, 8);

  // Telapak tangan bulat
  ctx.beginPath();
  ctx.arc(0, 17, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function buildWeaponAndProjectileTextures(scene: Phaser.Scene): void {
  // Pistol Air CAS yang digenggam karakter saat Tier 3
  makeCanvasTex(scene, 'water_blaster_held', 42, 26, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    // Gagang
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(6, 13);
    ctx.lineTo(13, 13);
    ctx.lineTo(10, 24);
    ctx.lineTo(4, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tangki air transparan
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.roundRect(10, 2, 16, 8, 3);
    ctx.fill();
    ctx.stroke();
    // Badan pistol air
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.moveTo(3, 8);
    ctx.lineTo(31, 8);
    ctx.lineTo(31, 16);
    ctx.lineTo(3, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Moncong semprot kuning
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(31, 9, 8, 6);
    ctx.strokeRect(31, 9, 8, 6);
  });

  // Peluru Gelembung Air Pemain
  makeCanvasTex(scene, 'proj_water', 26, 26, (ctx) => {
    const grad = ctx.createRadialGradient(10, 9, 2, 13, 13, 11);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.45, '#38BDF8');
    grad.addColorStop(1, '#0284C7');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(13, 13, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(9.5, 9.5, 2.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Kelapa Lemparan Monyet
  makeCanvasTex(scene, 'proj_coconut', 24, 24, (ctx) => {
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(12, 12, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(9, 9, 1.5, 0, Math.PI * 2);
    ctx.arc(13, 8, 1.5, 0, Math.PI * 2);
    ctx.arc(11, 12, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function registerCharacterAnimations(scene: Phaser.Scene, charId: CharacterId): void {
  const key = `char_${charId}_sheet`;
  const defs: Array<[string, number, number, number, number]> = [
    [`${charId}_idle`, 0, 3, 7, -1],
    [`${charId}_run`, 4, 9, 15, -1],
    [`${charId}_jump`, 10, 11, 10, 0],
    [`${charId}_doubleJump`, 12, 15, 18, 0],
    [`${charId}_land`, 16, 17, 14, 0],
    [`${charId}_swim`, 18, 21, 9, -1],
    [`${charId}_climb`, 22, 25, 9, -1],
    [`${charId}_slide`, 26, 27, 9, -1],
    [`${charId}_fall`, 28, 29, 9, -1],
    [`${charId}_victory`, 30, 33, 9, -1],
    [`${charId}_damage`, 34, 35, 10, 0],
    [`${charId}_collect`, 36, 37, 12, 0],
  ];
  for (const [animKey, start, end, frameRate, repeat] of defs) {
    if (scene.anims.exists(animKey)) scene.anims.remove(animKey);
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(key, { start, end }),
      frameRate,
      repeat,
    });
  }
}

function buildCollectibleTextures(scene: Phaser.Scene): void {
  // Koin ber-relief 2D dengan efek kilap
  const coins: Array<[string, string, string, string]> = [
    ['coin_bronze', '#B45309', '#F59E0B', '#FDE68A'],
    ['coin_silver', '#64748B', '#CBD5E1', '#F8FAFC'],
    ['coin_gold', '#D97706', '#FACC15', '#FEF9C3'],
  ];
  for (const [k, rim, fill, hi] of coins) {
    makeCanvasTex(scene, k, 34, 34, (ctx) => {
      ctx.fillStyle = rim;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(17, 17, 13.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(17, 17, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hi;
      ctx.beginPath();
      ctx.arc(13, 13, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rim;
      ctx.fillRect(15.5, 10.5, 3, 13);
    });
  }

  // Tiket bergerigi 2D khas taman hiburan
  const tickets: Array<[string, string, string]> = [
    ['ticket_normal', '#38BDF8', '#0369A1'],
    ['ticket_vip', '#A855F7', '#6B21A8'],
    ['ticket_golden', '#FACC15', '#B45309'],
    ['ticket_mystery', '#EC4899', '#9D174D'],
  ];
  for (const [k, fill, border] of tickets) {
    makeCanvasTex(scene, k, 46, 32, (ctx) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(4, 5);
      ctx.lineTo(42, 5);
      ctx.lineTo(42, 12);
      ctx.arc(42, 16, 4, -Math.PI / 2, Math.PI / 2, true);
      ctx.lineTo(42, 27);
      ctx.lineTo(4, 27);
      ctx.lineTo(4, 20);
      ctx.arc(4, 16, 4, Math.PI / 2, -Math.PI / 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = border;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(9, 9, 28, 14);
      ctx.setLineDash([]);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CAS', 23, 16);
    });
  }

  // Power-Up Tier 2 (gaya Jamur Mario): Kelapa Jumbo CAS
  makeCanvasTex(scene, 'power_coconut', 44, 44, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.3;
    // Sedotan oranye
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(26, 13);
    ctx.lineTo(31, 4);
    ctx.lineTo(38, 6);
    ctx.lineTo(36, 9);
    ctx.lineTo(32, 8);
    ctx.lineTo(29, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Buah kelapa hijau segar
    const grad = ctx.createRadialGradient(17, 21, 3, 22, 26, 15);
    grad.addColorStop(0, '#86EFAC');
    grad.addColorStop(0.55, '#22C55E');
    grad.addColorStop(1, '#15803D');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(22, 26, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tutup kelapa krem + label panah naik
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(22, 16, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(22, 21);
    ctx.lineTo(28, 28);
    ctx.lineTo(24, 28);
    ctx.lineTo(24, 34);
    ctx.lineTo(20, 34);
    ctx.lineTo(20, 28);
    ctx.lineTo(16, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Power-Up Tier 3 (gaya Bunga Api Mario): Pistol Air CAS
  makeCanvasTex(scene, 'power_blaster', 48, 38, (ctx) => {
    ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.beginPath();
    ctx.arc(24, 19, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    // Gagang
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(11, 20);
    ctx.lineTo(18, 20);
    ctx.lineTo(15, 33);
    ctx.lineTo(8, 33);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Tangki air atas
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.roundRect(14, 6, 18, 9, 3);
    ctx.fill();
    ctx.stroke();
    // Bodi blaster
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.roundRect(7, 13, 30, 10, 4);
    ctx.fill();
    ctx.stroke();
    // Moncong kuning
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(37, 14, 7, 8);
    ctx.strokeRect(37, 14, 7, 8);
  });

  makeCanvasTex(scene, 'diamond', 36, 36, (ctx) => {
    ctx.fillStyle = '#22D3EE';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(18, 3);
    ctx.lineTo(32, 14);
    ctx.lineTo(18, 33);
    ctx.lineTo(4, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#BAE6FD';
    ctx.beginPath();
    ctx.moveTo(18, 6);
    ctx.lineTo(25, 14);
    ctx.lineTo(18, 26);
    ctx.lineTo(11, 14);
    ctx.closePath();
    ctx.fill();
  });

  makeCanvasTex(scene, 'key_gold', 34, 34, (ctx) => {
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(10, 17, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(16, 15, 14, 4, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(23, 19, 3, 5);
    ctx.fillRect(27, 19, 3, 6);
  });

  makeCanvasTex(scene, 'chest_closed', 54, 44, (ctx) => {
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(5, 12, 44, 28, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#B45309';
    ctx.fillRect(7, 13, 40, 10);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(5, 21, 44, 5);
    ctx.fillRect(23, 17, 8, 12);
    ctx.strokeRect(23, 17, 8, 12);
  });

  makeCanvasTex(scene, 'chest_open', 54, 44, (ctx) => {
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(5, 20, 44, 20, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(19, 18, 6, 0, Math.PI * 2);
    ctx.arc(27, 15, 7, 0, Math.PI * 2);
    ctx.arc(35, 18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  const powerups: Array<[string, string, string]> = [
    ['boost_energy', '#10B981', '+'],
    ['boost_speed', '#F97316', '⚡'],
    ['extra_life', '#EF4444', '♥'],
    ['magnet', '#6366F1', 'M'],
    ['shield', '#06B6D4', '★'],
  ];
  for (const [k, color, letter] of powerups) {
    makeCanvasTex(scene, k, 36, 36, (ctx) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(18, 18, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, 18, 19);
    });
  }
}

function buildParticleTextures(scene: Phaser.Scene): void {
  const particles: Array<[string, string]> = [
    ['particle_splash', '#BAE6FD'],
    ['particle_bubble', '#E0F2FE'],
    ['particle_sparkle', '#FDE047'],
    ['particle_leaf', '#4ADE80'],
    ['particle_dust', '#F1F5F9'],
  ];
  for (const [k, color] of particles) {
    makeCanvasTex(scene, k, 14, 14, (ctx) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(7, 7, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function buildFacilityAndObstacleTextures(scene: Phaser.Scene): void {
  // Ban Pelampung Donat Merah-Kuning
  makeCanvasTex(scene, 'inflatable_ring', 70, 34, (ctx) => {
    ctx.fillStyle = '#FB7185';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(35, 17, 32, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(16, 6, 9, 22);
    ctx.fillRect(45, 6, 9, 22);
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.ellipse(35, 17, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  makeCanvasTex(scene, 'diving_board', 92, 28, (ctx) => {
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(2, 5, 88, 11, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 16, 24, 9);
    ctx.strokeRect(6, 16, 24, 9);
  });

  makeCanvasTex(scene, 'checkpoint_flag', 50, 78, (ctx) => {
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.fillRect(8, 6, 6, 68);
    ctx.strokeRect(8, 6, 6, 68);
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(14, 10);
    ctx.lineTo(46, 21);
    ctx.lineTo(14, 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  makeCanvasTex(scene, 'exit_gate', 106, 128, (ctx) => {
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(6, 10, 94, 114, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#22D3EE';
    ctx.beginPath();
    ctx.roundRect(20, 30, 66, 90, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KELUAR CAS', 53, 24);
  });

  makeCanvasTex(scene, 'obstacle_spinner', 58, 58, (ctx) => {
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(29, 29);
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.roundRect(-5, -25, 10, 50, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(29, 29, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  makeCanvasTex(scene, 'obstacle_barrel', 44, 44, (ctx) => {
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(22, 22, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, 22, 10, 0, Math.PI * 2);
    ctx.stroke();
  });

  makeCanvasTex(scene, 'tipping_bucket', 84, 68, (ctx) => {
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(14, 14);
    ctx.lineTo(70, 14);
    ctx.lineTo(60, 58);
    ctx.lineTo(24, 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(18, 20, 48, 9);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(3, 5, 22, 4);
    ctx.fillRect(8, 1, 12, 6);
  });

  makeCanvasTex(scene, 'feeding_station', 66, 50, (ctx) => {
    ctx.fillStyle = '#15803D';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(4, 22, 58, 24, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(24, 16, 7, 0, Math.PI * 2);
    ctx.arc(40, 15, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function buildEnemyTextures(scene: Phaser.Scene): void {
  // 1. Kepiting Pantai (Patroli + Dash)
  makeCanvasTex(scene, 'enemy_crab', 56, 42, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    // 6 kaki kepiting bersendi
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(28 + sx * 12, 24 + i * 3);
        ctx.lineTo(28 + sx * (21 + i * 2), 28 + i * 3);
        ctx.lineTo(28 + sx * (24 + i * 2), 37);
        ctx.stroke();
      }
    }
    // Capit besar kiri & kanan
    ctx.fillStyle = '#F97316';
    for (const cx of [10, 46]) {
      ctx.beginPath();
      ctx.arc(cx, 12, 6.5, 0.3, Math.PI * 1.7);
      ctx.lineTo(cx, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Cangkang merah cerah
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(13, 25);
    ctx.quadraticCurveTo(28, 10, 43, 25);
    ctx.quadraticCurveTo(41, 34, 28, 34);
    ctx.quadraticCurveTo(15, 34, 13, 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Mata tangkai
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(22, 16, 3.8, 0, Math.PI * 2);
    ctx.arc(34, 16, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(22.5, 16, 1.8, 0, Math.PI * 2);
    ctx.arc(34.5, 16, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Ikan Buntal Berduri (Mengambang + Mengembang Periodik)
  makeCanvasTex(scene, 'enemy_puffer', 52, 48, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    // Duri sekeliling
    ctx.fillStyle = '#FACC15';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const bx = 26 + Math.cos(a) * 14;
      const by = 24 + Math.sin(a) * 14;
      const tx = 26 + Math.cos(a) * 23;
      const ty = 24 + Math.sin(a) * 23;
      ctx.beginPath();
      ctx.moveTo(bx - Math.sin(a) * 4, by + Math.cos(a) * 4);
      ctx.lineTo(tx, ty);
      ctx.lineTo(bx + Math.sin(a) * 4, by - Math.cos(a) * 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Badan ikan
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(26, 24, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(26, 29, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Mata galak
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(20, 20, 4, 0, Math.PI * 2);
    ctx.arc(32, 20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(21, 20, 2, 0, Math.PI * 2);
    ctx.arc(31, 20, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Tawon Taman Tropis (Terbang + Menyambar ke Bawah)
  makeCanvasTex(scene, 'enemy_wasp', 54, 42, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    // Sayap transparan
    ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
    ctx.beginPath();
    ctx.ellipse(24, 11, 10, 6, -0.4, 0, Math.PI * 2);
    ctx.ellipse(33, 12, 9, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Sengat belakang
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(6, 25);
    ctx.lineTo(14, 22);
    ctx.lineTo(14, 29);
    ctx.closePath();
    ctx.fill();
    // Badan bergaris kuning-hitam
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(26, 25, 13, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(20, 17, 4, 16);
    ctx.fillRect(28, 17, 4, 16);
    // Kepala & mata
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(41, 23, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(44, 22, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Monyet Nakal Cikole (Melempar Kelapa)
  makeCanvasTex(scene, 'enemy_monkey', 56, 58, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    // Ekor melingkar
    ctx.beginPath();
    ctx.moveTo(15, 42);
    ctx.quadraticCurveTo(3, 35, 7, 20);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#78350F';
    ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#0F172A';
    // Telinga
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.arc(17, 17, 6, 0, Math.PI * 2);
    ctx.arc(39, 17, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Badan & kaki
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.ellipse(28, 39, 13, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.ellipse(28, 40, 8, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Kepala
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.arc(28, 19, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Moncong krem
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.ellipse(28, 23, 9, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Mata jahil
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(24, 17, 3, 0, Math.PI * 2);
    ctx.arc(32, 17, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(24, 17, 1.6, 0, Math.PI * 2);
    ctx.arc(32, 17, 1.6, 0, Math.PI * 2);
    ctx.fill();
    // Kelapa di tangan
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.arc(45, 34, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // 5. Mini-Boss Penjaga Gurita Merah CAS (3 HP, Lompat + Sembur Gelembung)
  makeCanvasTex(scene, 'enemy_octo_bot', 86, 80, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.6;
    for (const tx of [-28, -14, 0, 14, 28]) {
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.moveTo(43 + tx * 0.4, 48);
      ctx.quadraticCurveTo(43 + tx * 1.1, 62, 43 + tx, 75);
      ctx.lineTo(43 + tx + 9, 75);
      ctx.quadraticCurveTo(43 + tx * 1.05 + 8, 60, 43 + tx * 0.4 + 8, 48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.ellipse(43, 33, 27, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Mahkota penjaga
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(27, 12);
    ctx.lineTo(29, 3);
    ctx.lineTo(37, 9);
    ctx.lineTo(43, 2);
    ctx.lineTo(49, 9);
    ctx.lineTo(57, 3);
    ctx.lineTo(59, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Mata bos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(33, 33, 6.5, 0, Math.PI * 2);
    ctx.arc(53, 33, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(34, 33, 3.2, 0, Math.PI * 2);
    ctx.arc(52, 33, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function buildCasLandmarkTextures(scene: Phaser.Scene): void {
  // Pohon Kelapa 2D bergerigi tajam
  makeCanvasTex(scene, 'palm_tree', 120, 165, (ctx) => {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    // Batang bersegmen
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.moveTo(52, 162);
    ctx.quadraticCurveTo(48, 100, 56, 48);
    ctx.lineTo(66, 48);
    ctx.quadraticCurveTo(60, 100, 68, 162);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Daun kelapa bertingkat
    const fronds = [
      { cx: 30, cy: 48, rx: 32, ry: 10, rot: -0.35 },
      { cx: 90, cy: 48, rx: 32, ry: 10, rot: 0.35 },
      { cx: 38, cy: 30, rx: 28, ry: 9, rot: -0.75 },
      { cx: 82, cy: 30, rx: 28, ry: 9, rot: 0.75 },
      { cx: 60, cy: 22, rx: 22, ry: 9, rot: 0 },
    ];
    ctx.fillStyle = '#22C55E';
    for (const fr of fronds) {
      ctx.save();
      ctx.translate(fr.cx, fr.cy);
      ctx.rotate(fr.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, fr.rx, fr.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    // Buah kelapa di bawah daun
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(54, 48, 6, 0, Math.PI * 2);
    ctx.arc(65, 48, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Banner Sponsor di Langit
  makeCanvasTex(scene, 'cas_sky_banner', 350, 120, (ctx) => {
    ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
    ctx.beginPath();
    ctx.ellipse(175, 58, 164, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 52px Fredoka, sans-serif';

    const letters: Array<[string, number, string]> = [
      ['C', 115, '#EF4444'],
      ['A', 175, '#FACC15'],
      ['S', 235, '#22C55E'],
    ];
    for (const [ch, lx, col] of letters) {
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#FFFFFF';
      ctx.strokeText(ch, lx, 38);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0F172A';
      ctx.strokeText(ch, lx, 38);
      ctx.fillStyle = col;
      ctx.fillText(ch, lx, 38);
    }

    ctx.font = 'bold 26px Fredoka, sans-serif';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeText('WATER PARK', 175, 78);
    ctx.fillStyle = '#0284C7';
    ctx.fillText('WATER', 127, 78);
    ctx.fillStyle = '#F97316';
    ctx.fillText('PARK', 219, 78);

    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.strokeText('SPONSOR UTAMA · CIKOLE PANDEGLANG', 175, 104);
    ctx.fillText('SPONSOR UTAMA · CIKOLE PANDEGLANG', 175, 104);
  });

  // Papan Sponsor Promo Wisata di Latar Belakang Permainan (Referensi Foto 4)
  makeCanvasTex(scene, 'cas_sponsor_board', 290, 118, (ctx) => {
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.fillRect(36, 92, 12, 26);
    ctx.strokeRect(36, 92, 12, 26);
    ctx.fillRect(242, 92, 12, 26);
    ctx.strokeRect(242, 92, 12, 26);

    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.roundRect(6, 6, 278, 90, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(12, 12, 266, 78, 8);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('SPONSOR UTAMA WISATA KELUARGA', 145, 25);

    ctx.font = 'bold 20px Fredoka, sans-serif';
    ctx.fillStyle = '#EF4444';
    ctx.fillText('CAS', 56, 46);
    ctx.fillStyle = '#0284C7';
    ctx.fillText('WATER', 126, 46);
    ctx.fillStyle = '#F97316';
    ctx.fillText('PARK', 200, 46);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Weekday Rp 20rb · Weekend Rp 30rb', 145, 65);
    ctx.fillStyle = '#15803D';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Cikole Pandeglang · WA 0857-1041-6308', 145, 81);
  });

  // Patung Gurita Merah Raksasa CAS Water Park
  makeCanvasTex(scene, 'cas_octopus', 148, 132, (ctx) => {
    const tentacleCols = [-52, -32, -12, 12, 32, 52];
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.6;
    for (const tx of tentacleCols) {
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(74 + tx * 0.35, 76);
      ctx.quadraticCurveTo(74 + tx * 1.15, 92, 74 + tx, 124);
      ctx.lineTo(74 + tx + 11, 124);
      ctx.quadraticCurveTo(74 + tx * 1.1 + 10, 92, 74 + tx * 0.35 + 10, 76);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(74 + tx * 0.85, 106, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.ellipse(74, 48, 38, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(60, 52, 8, 0, Math.PI * 2);
    ctx.arc(88, 52, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(62, 52, 4, 0, Math.PI * 2);
    ctx.arc(86, 52, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Gazebo Tropis CAS Water Park
  makeCanvasTex(scene, 'cas_gazebo', 120, 104, (ctx) => {
    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.fillRect(16, 48, 8, 52);
    ctx.strokeRect(16, 48, 8, 52);
    ctx.fillRect(96, 48, 8, 52);
    ctx.strokeRect(96, 48, 8, 52);
    ctx.fillRect(10, 88, 100, 12);
    ctx.strokeRect(10, 88, 100, 12);
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.moveTo(4, 52);
    ctx.lineTo(60, 10);
    ctx.lineTo(116, 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Gerbang Satwa CAS Water Park (referensi Foto 2)
  makeCanvasTex(scene, 'cas_zoo_gate', 220, 136, (ctx) => {
    ctx.fillStyle = '#15803D';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(12, 44, 196, 90, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(64, 68, 92, 66, 6);
    ctx.fill();
    ctx.fillStyle = '#D97706';
    ctx.fillRect(36, 48, 14, 86);
    ctx.strokeRect(36, 48, 14, 86);
    ctx.fillRect(170, 48, 14, 86);
    ctx.strokeRect(170, 48, 14, 86);
    ctx.fillStyle = '#78716C';
    ctx.beginPath();
    ctx.roundRect(8, 32, 204, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('CAS WATER PARK', 110, 56);
    ctx.fillText('CAS WATER PARK', 110, 56);
  });
}

function buildWildlifeTextures(scene: Phaser.Scene): void {
  // Gajah Ramah CAS (2D kontur jelas dengan gading & belalai melengkung)
  makeCanvasTex(scene, 'animal_elephant', 102, 82, (ctx) => {
    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(14, 42);
    ctx.quadraticCurveTo(14, 20, 42, 20);
    ctx.quadraticCurveTo(66, 20, 74, 30);
    ctx.quadraticCurveTo(86, 30, 88, 48);
    ctx.quadraticCurveTo(89, 58, 95, 52);
    ctx.lineTo(95, 58);
    ctx.quadraticCurveTo(80, 64, 78, 44);
    ctx.lineTo(66, 44);
    ctx.lineTo(66, 74);
    ctx.lineTo(54, 74);
    ctx.lineTo(54, 56);
    ctx.lineTo(30, 56);
    ctx.lineTo(30, 74);
    ctx.lineTo(18, 74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Telinga besar
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.ellipse(54, 32, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Gading putih
    ctx.fillStyle = '#FEF9C3';
    ctx.beginPath();
    ctx.moveTo(74, 42);
    ctx.quadraticCurveTo(86, 46, 90, 38);
    ctx.lineTo(84, 48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Mata
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(73, 28, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Jerapah CAS
  makeCanvasTex(scene, 'animal_giraffe', 82, 112, (ctx) => {
    ctx.fillStyle = '#FBBF24';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(16, 62);
    ctx.quadraticCurveTo(28, 52, 42, 54);
    ctx.lineTo(44, 18);
    ctx.lineTo(62, 14);
    ctx.lineTo(64, 24);
    ctx.lineTo(52, 26);
    ctx.lineTo(52, 62);
    ctx.lineTo(50, 104);
    ctx.lineTo(42, 104);
    ctx.lineTo(42, 74);
    ctx.lineTo(24, 74);
    ctx.lineTo(24, 104);
    ctx.lineTo(16, 104);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.arc(28, 63, 4, 0, Math.PI * 2);
    ctx.arc(39, 64, 3.5, 0, Math.PI * 2);
    ctx.arc(48, 36, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(57, 17, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Zebra CAS
  makeCanvasTex(scene, 'animal_zebra', 86, 72, (ctx) => {
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(14, 34);
    ctx.quadraticCurveTo(32, 26, 46, 28);
    ctx.lineTo(50, 10);
    ctx.lineTo(72, 12);
    ctx.lineTo(72, 20);
    ctx.lineTo(58, 22);
    ctx.lineTo(56, 46);
    ctx.lineTo(52, 66);
    ctx.lineTo(44, 66);
    ctx.lineTo(44, 48);
    ctx.lineTo(24, 48);
    ctx.lineTo(24, 66);
    ctx.lineTo(16, 66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(24, 30, 4, 16);
    ctx.fillRect(34, 29, 4, 17);
    ctx.fillRect(44, 29, 4, 17);
    ctx.beginPath();
    ctx.arc(65, 15, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Rusa Tutul CAS
  makeCanvasTex(scene, 'animal_deer', 80, 74, (ctx) => {
    ctx.fillStyle = '#D97706';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(16, 36);
    ctx.quadraticCurveTo(32, 28, 46, 30);
    ctx.lineTo(48, 12);
    ctx.lineTo(66, 13);
    ctx.lineTo(66, 21);
    ctx.lineTo(55, 23);
    ctx.lineTo(54, 48);
    ctx.lineTo(49, 68);
    ctx.lineTo(42, 68);
    ctx.lineTo(42, 50);
    ctx.lineTo(25, 50);
    ctx.lineTo(25, 68);
    ctx.lineTo(18, 68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#78350F';
    ctx.beginPath();
    ctx.moveTo(50, 12);
    ctx.lineTo(46, 3);
    ctx.moveTo(56, 12);
    ctx.lineTo(60, 3);
    ctx.stroke();
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(26, 37, 2.6, 0, Math.PI * 2);
    ctx.arc(34, 41, 2.5, 0, Math.PI * 2);
    ctx.arc(41, 36, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(60, 16, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Ayam Merak CAS
  makeCanvasTex(scene, 'animal_peacock', 76, 72, (ctx) => {
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(32, 34, 26, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(20, 20, 4, 0, Math.PI * 2);
    ctx.arc(32, 15, 4, 0, Math.PI * 2);
    ctx.arc(44, 20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.ellipse(38, 44, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(45, 22, 8, 20);
    ctx.strokeRect(45, 22, 8, 20);
    ctx.beginPath();
    ctx.arc(50, 20, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(57, 19);
    ctx.lineTo(65, 21);
    ctx.lineTo(57, 23);
    ctx.closePath();
    ctx.fill();
  });
}

function makeCanvasTex(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  draw(ctx);
  tex.refresh();
}

function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
