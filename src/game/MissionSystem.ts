import { MissionDef, WorldDef } from './GameConfig';

export interface MissionProgressItem {
  id: string;
  label: string;
  current: number;
  target: number;
  completed: boolean;
  rewardCoins: number;
}

export class MissionSystem {
  private world: WorldDef;
  private progress: Map<string, number> = new Map();

  constructor(world: WorldDef) {
    this.world = world;
    for (const m of world.missions) {
      this.progress.set(m.id, 0);
    }
  }

  public updateByType(type: MissionDef['type'], value: number, mode: 'set' | 'add' = 'set'): boolean {
    let newlyCompleted = false;
    for (const m of this.world.missions) {
      if (m.type !== type) continue;
      const prev = this.progress.get(m.id) ?? 0;
      const next = mode === 'add' ? prev + value : Math.max(prev, value);
      const clamped = Math.min(m.target, next);
      if (prev < m.target && clamped >= m.target) {
        newlyCompleted = true;
      }
      this.progress.set(m.id, clamped);
    }
    return newlyCompleted;
  }

  public getStatus(): MissionProgressItem[] {
    return this.world.missions.map((m) => {
      const current = this.progress.get(m.id) ?? 0;
      return {
        id: m.id,
        label: m.label,
        current,
        target: m.target,
        completed: current >= m.target,
        rewardCoins: m.rewardCoins,
      };
    });
  }

  public getCompletedMissionIds(): string[] {
    return this.getStatus()
      .filter((m) => m.completed)
      .map((m) => m.id);
  }

  public getEarnedRewardCoins(): number {
    return this.getStatus()
      .filter((m) => m.completed)
      .reduce((acc, m) => acc + m.rewardCoins, 0);
  }

  public getStars(): number {
    const completedCount = this.getCompletedMissionIds().length;
    if (completedCount >= 3) return 3;
    if (completedCount === 2) return 2;
    return 1;
  }
}
