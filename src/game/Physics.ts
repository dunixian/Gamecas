import { PHYSICS_CONFIG } from './GameConfig';

export interface PlatformerState {
  coyoteTimerMs: number;
  jumpBufferTimerMs: number;
  jumpsRemaining: number;
  maxJumps: number;
  wasOnGround: boolean;
  inWater: boolean;
  isClimbing: boolean;
  isSliding: boolean;
  onZipline: boolean;
  onRope: boolean;
  waterCurrentX: number;
  wetFloorTimerMs: number;
  weatherSpeedMult: number;
  weatherWindX: number;
}

export function createInitialPlatformerState(): PlatformerState {
  return {
    coyoteTimerMs: 0,
    jumpBufferTimerMs: 0,
    jumpsRemaining: 2,
    maxJumps: 2,
    wasOnGround: false,
    inWater: false,
    isClimbing: false,
    isSliding: false,
    onZipline: false,
    onRope: false,
    waterCurrentX: 0,
    wetFloorTimerMs: 0,
    weatherSpeedMult: 1,
    weatherWindX: 0,
  };
}

export function stepHorizontalVelocity(params: {
  currentVx: number;
  dir: number;
  isRunning: boolean;
  onGround: boolean;
  inWater: boolean;
  onWetFloor: boolean;
  speedMultiplier: number;
  waterCurrentX: number;
  weatherWindX?: number;
  dt: number;
}): number {
  const {
    currentVx,
    dir,
    isRunning,
    onGround,
    inWater,
    onWetFloor,
    speedMultiplier,
    waterCurrentX,
    weatherWindX = 0,
    dt,
  } = params;
  const baseMax = (isRunning ? PHYSICS_CONFIG.maxRunSpeed : PHYSICS_CONFIG.maxWalkSpeed) * speedMultiplier;
  const maxSpd = inWater ? baseMax * 0.72 : onWetFloor ? baseMax * 1.18 : baseMax;
  const accel = (onGround ? PHYSICS_CONFIG.moveAccel : PHYSICS_CONFIG.airAccel) * (onWetFloor ? 0.55 : 1);
  const decel = (onGround ? PHYSICS_CONFIG.moveDecel : PHYSICS_CONFIG.airAccel * 0.65) * (onWetFloor ? 0.25 : 1);

  let vx = currentVx;
  const ambientForceX = waterCurrentX + (dir !== 0 ? weatherWindX : 0);
  const targetVx = dir * maxSpd + ambientForceX;

  if (dir !== 0) {
    if (vx < targetVx) {
      vx = Math.min(targetVx, vx + accel * dt);
    } else if (vx > targetVx) {
      vx = Math.max(targetVx, vx - accel * dt);
    }
  } else {
    const restTarget = waterCurrentX;
    if (vx < restTarget) {
      vx = Math.min(restTarget, vx + decel * dt);
    } else if (vx > restTarget) {
      vx = Math.max(restTarget, vx - decel * dt);
    }
  }
  return vx;
}
