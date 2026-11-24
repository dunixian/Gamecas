import { ACHIEVEMENTS, CharacterId, SHOP_ITEMS, WorldId } from './GameConfig';

export interface InventoryData {
  shields: number;
  magnets: number;
  extraLives: number;
  speedBoosters: number;
  energyBoosters: number;
}

export interface AudioSettings {
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
}

export interface WorldProgress {
  completed: boolean;
  stars: number;
  bestCoins: number;
  bestTickets: number;
  completedMissions: string[];
}

export interface SaveData {
  version: number;
  selectedCharacter: CharacterId;
  coins: number;
  lifetimeCoins: number;
  totalTickets: number;
  diamonds: number;
  unlockedWorlds: WorldId[];
  purchasedItems: string[];
  equippedOutfit: string | null;
  equippedHat: string | null;
  equippedAccessory: string | null;
  jumpUpgradeLevel: number;
  speedUpgradeLevel: number;
  endlessBestStage: number;
  endlessHighScore: number;
  enemiesDefeatedTotal: number;
  inventory: InventoryData;
  worldProgress: Record<WorldId, WorldProgress>;
  achievements: string[];
  audio: AudioSettings;
}

const SAVE_KEY = 'cas_waterpark_adventure_save_v1';

function createDefaultSave(): SaveData {
  return {
    version: 2,
    selectedCharacter: 'boy',
    coins: 50,
    lifetimeCoins: 50,
    totalTickets: 0,
    diamonds: 0,
    // Seluruh 4 dunia langsung terbuka agar pemain bebas memilih dan gonta-ganti dunia kapan saja!
    unlockedWorlds: [1, 2, 3, 4],
    purchasedItems: [],
    equippedOutfit: null,
    equippedHat: null,
    equippedAccessory: null,
    jumpUpgradeLevel: 0,
    speedUpgradeLevel: 0,
    endlessBestStage: 1,
    endlessHighScore: 0,
    enemiesDefeatedTotal: 0,
    inventory: {
      shields: 1,
      magnets: 1,
      extraLives: 0,
      speedBoosters: 1,
      energyBoosters: 1,
    },
    worldProgress: {
      1: { completed: false, stars: 0, bestCoins: 0, bestTickets: 0, completedMissions: [] },
      2: { completed: false, stars: 0, bestCoins: 0, bestTickets: 0, completedMissions: [] },
      3: { completed: false, stars: 0, bestCoins: 0, bestTickets: 0, completedMissions: [] },
      4: { completed: false, stars: 0, bestCoins: 0, bestTickets: 0, completedMissions: [] },
    },
    achievements: [],
    audio: {
      musicVolume: 0.55,
      sfxVolume: 0.75,
      musicMuted: false,
      sfxMuted: false,
    },
  };
}

class SaveManagerClass {
  private data: SaveData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return createDefaultSave();
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const def = createDefaultSave();
      return {
        ...def,
        ...parsed,
        // Pastikan semua 4 dunia selalu terbuka untuk eksplorasi bebas
        unlockedWorlds: [1, 2, 3, 4],
        inventory: { ...def.inventory, ...(parsed.inventory || {}) },
        audio: { ...def.audio, ...(parsed.audio || {}) },
        worldProgress: {
          1: { ...def.worldProgress[1], ...(parsed.worldProgress?.[1] || {}) },
          2: { ...def.worldProgress[2], ...(parsed.worldProgress?.[2] || {}) },
          3: { ...def.worldProgress[3], ...(parsed.worldProgress?.[3] || {}) },
          4: { ...def.worldProgress[4], ...(parsed.worldProgress?.[4] || {}) },
        },
      };
    } catch {
      return createDefaultSave();
    }
  }

  public getData(): SaveData {
    return this.data;
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private persist(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore storage quota errors
    }
    this.listeners.forEach((fn) => fn());
  }

  public setCharacter(character: CharacterId): void {
    this.data.selectedCharacter = character;
    this.persist();
  }

  public updateAudio(partial: Partial<AudioSettings>): void {
    this.data.audio = { ...this.data.audio, ...partial };
    this.persist();
  }

  public addCoins(amount: number): void {
    if (amount <= 0) return;
    this.data.coins += amount;
    this.data.lifetimeCoins += amount;
    this.checkGlobalAchievements();
    this.persist();
  }

  public consumeInventoryItem(key: keyof InventoryData): boolean {
    if (this.data.inventory[key] <= 0) return false;
    this.data.inventory[key] -= 1;
    this.persist();
    return true;
  }

  public purchaseItem(itemId: string): { ok: boolean; reason?: string } {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return { ok: false, reason: 'Item tidak ditemukan' };

    if (item.category === 'upgrade') {
      const currentLevel = item.id === 'upg_jump' ? this.data.jumpUpgradeLevel : this.data.speedUpgradeLevel;
      const maxLevel = item.maxLevel ?? 3;
      if (currentLevel >= maxLevel) return { ok: false, reason: 'Level sudah maksimal' };
      const cost = item.price * (currentLevel + 1);
      if (this.data.coins < cost) return { ok: false, reason: 'Koin tidak mencukupi' };
      this.data.coins -= cost;
      if (item.id === 'upg_jump') this.data.jumpUpgradeLevel += 1;
      else this.data.speedUpgradeLevel += 1;
    } else if (item.category === 'consumable') {
      if (this.data.coins < item.price) return { ok: false, reason: 'Koin tidak mencukupi' };
      this.data.coins -= item.price;
      if (item.id === 'con_shield') this.data.inventory.shields += 1;
      if (item.id === 'con_magnet') this.data.inventory.magnets += 1;
      if (item.id === 'con_life') this.data.inventory.extraLives += 1;
    } else {
      if (this.data.purchasedItems.includes(item.id)) {
        this.equipCosmetic(item.id);
        return { ok: true };
      }
      if (this.data.coins < item.price) return { ok: false, reason: 'Koin tidak mencukupi' };
      this.data.coins -= item.price;
      this.data.purchasedItems.push(item.id);
      this.equipCosmetic(item.id);
    }

    this.unlockAchievement('shopaholic');
    this.persist();
    return { ok: true };
  }

  public equipCosmetic(itemId: string): void {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    if (item.category === 'outfit') {
      this.data.equippedOutfit = this.data.equippedOutfit === itemId ? null : itemId;
    } else if (item.category === 'hat') {
      this.data.equippedHat = this.data.equippedHat === itemId ? null : itemId;
    } else if (item.category === 'accessory') {
      this.data.equippedAccessory = this.data.equippedAccessory === itemId ? null : itemId;
    }
    this.persist();
  }

  public recordProceduralCompletion(params: {
    stage: number;
    score: number;
    coinsCollected: number;
    ticketsCollected: number;
    enemiesDefeated: number;
  }): void {
    this.data.endlessBestStage = Math.max(this.data.endlessBestStage, params.stage + 1);
    this.data.endlessHighScore = Math.max(this.data.endlessHighScore, params.score);
    this.data.coins += params.coinsCollected;
    this.data.lifetimeCoins += params.coinsCollected;
    this.data.totalTickets += params.ticketsCollected;
    this.data.enemiesDefeatedTotal += params.enemiesDefeated;
    this.unlockAchievement('blaster_ace');
    this.checkGlobalAchievements();
    this.persist();
  }

  public recordWorldCompletion(params: {
    worldId: WorldId;
    coinsCollected: number;
    ticketsCollected: number;
    diamondsCollected: number;
    completedMissionIds: string[];
    stars: number;
    missionRewardCoins: number;
    enemiesDefeated?: number;
  }): { newlyUnlockedWorld: WorldId | null; newAchievements: string[] } {
    const {
      worldId,
      coinsCollected,
      ticketsCollected,
      diamondsCollected,
      completedMissionIds,
      stars,
      missionRewardCoins,
      enemiesDefeated = 0,
    } = params;
    const prev = this.data.worldProgress[worldId];

    const newMissions = completedMissionIds.filter((id) => !prev.completedMissions.includes(id));
    const mergedMissions = Array.from(new Set([...prev.completedMissions, ...completedMissionIds]));

    this.data.worldProgress[worldId] = {
      completed: true,
      stars: Math.max(prev.stars, stars),
      bestCoins: Math.max(prev.bestCoins, coinsCollected),
      bestTickets: Math.max(prev.bestTickets, ticketsCollected),
      completedMissions: mergedMissions,
    };

    const earnedCoins = coinsCollected + (newMissions.length > 0 ? missionRewardCoins : 0);
    this.data.coins += earnedCoins;
    this.data.lifetimeCoins += earnedCoins;
    this.data.totalTickets += ticketsCollected;
    this.data.diamonds += diamondsCollected;
    this.data.enemiesDefeatedTotal += enemiesDefeated;

    const beforeAchievements = [...this.data.achievements];
    if (worldId === 1) this.unlockAchievement('first_splash');
    if (worldId === 2) this.unlockAchievement('slide_master');
    if (worldId === 3) this.unlockAchievement('safari_friend');
    if (worldId === 4) this.unlockAchievement('outbound_hero');
    this.checkGlobalAchievements();

    const newAchievements = this.data.achievements.filter((a) => !beforeAchievements.includes(a));
    this.persist();
    return { newlyUnlockedWorld: null, newAchievements };
  }

  private checkGlobalAchievements(): void {
    if (this.data.lifetimeCoins >= 250) this.unlockAchievement('coin_collector');
    if (this.data.totalTickets >= 10) this.unlockAchievement('ticket_finder');
  }

  private unlockAchievement(id: string): void {
    if (this.data.achievements.includes(id)) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;
    this.data.achievements.push(id);
    this.data.coins += def.rewardCoins;
    this.data.lifetimeCoins += def.rewardCoins;
  }

  public resetProgress(): void {
    const audio = { ...this.data.audio };
    this.data = createDefaultSave();
    this.data.audio = audio;
    this.persist();
  }
}

export const SaveManager = new SaveManagerClass();
