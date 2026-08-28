export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover' | 'level_up';

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  twinkleOffset: number;
  twinkleSpeed: number;
}

export interface MeteorVertex {
  angle: number;
  dist: number;
}

export type MeteorType = 'standard' | 'fast_dart' | 'giant_rock' | 'plasma_crystal';

export interface Meteor {
  id: string;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  radius: number;
  speed: number;
  horizontalDrift: number;
  rotation: number;
  rotationSpeed: number;
  vertices: MeteorVertex[];
  color: string;
  glowColor: string;
  coreColor: string;
  type: MeteorType;
  points: number;
  hp: number;
  maxHp: number;
  isNearMissed: boolean;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  damage: number;
}

export type PowerUpType = 'shield' | 'slow_motion' | 'double_score' | 'blast_wave';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  radius: number;
  speed: number;
  type: PowerUpType;
  duration: number;
  rotation: number;
  color: string;
  icon: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'ring' | 'laser';
}

export interface LaserBeam {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  alpha: number;
  color: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

export interface Player {
  x: number;
  y: number;
  targetX: number;
  width: number;
  height: number;
  tilt: number;
  speed: number;
  hasShield: boolean;
  shieldCount: number;
  shieldPulse: number;
  invulnerableTime: number;
  color: string;
}

export type PerkRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Perk {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  rarity: PerkRarity;
  apply?: (state: ActivePerkState) => void;
}

export interface ActivePerkState {
  // Common mods
  speedBoost: number; // e.g. 1.15
  scoreRateMultiplier: number; // e.g. 1.10
  sizeScale: number; // e.g. 0.90
  hitboxScale: number; // e.g. 0.88
  dangerRadar: boolean;
  nearMissBonus: number; // additional points
  dropRateBoost: number;
  meteorSpeedReduction: number; // e.g. 0.08
  
  // Rare mods
  hasPermanentShield: boolean;
  permanentSlowFactor: number; // e.g. 0.85
  scoreMultiplierBonus: number; // e.g. +0.3
  repulsorAura: boolean;
  powerUpDurationBoost: number; // e.g. 1.5
  dodgeReflexBlink: boolean;
  agilityBoost: number;
  salvageScorePerMeteor: number;

  // Epic mods
  shieldRegenTimer: number;
  shieldRegenInterval: number; // in seconds (e.g. 45)
  periodicPulseTimer: number;
  periodicPulseInterval: number; // e.g. 30
  bossFreeze: number; // e.g. 0.35 slow on fast/giants
  laserInterceptor: boolean;
  laserTimer: number;
  quantumPhaseChance: number; // e.g. 0.20
  hyperSiphon: boolean;
  twinAegis: boolean;

  // Legendary mods
  singularityTimer: number;
  singularityInterval: number; // 25
  hasPhoenixRevive: boolean;
  phoenixUsed: boolean;
  chronoDomainReady: boolean;
  supernovaTimer: number;
  supernovaInterval: number; // 15
  godspeedMultiplier: number; // x3
  celestialBastion: boolean;

  // Mythic / Ultra-Rare (5% chance) Plasma Cannon Blaster
  hasPlasmaBlaster: boolean;
  blasterFireRate: number; // shots per sec
  blasterDamage: number;

  // Selected Perks List
  selectedPerkIds: string[];
}

export interface BackgroundTheme {
  nameAr: string;
  nameEn: string;
  level: number;
  grad1: string;
  grad2: string;
  grad3: string;
  nebulaGlow: string;
  starColors: string[];
}

export interface GameStats {
  score: number;
  highScore: number;
  meteorsDodged: number;
  nearMisses: number;
  survivalTime: number;
  speedMultiplier: number;
  scoreMultiplier: number;
  currentLevel: number;
  nextMilestone: number;
  activePowerUp: {
    type: PowerUpType;
    remaining: number;
    maxDuration: number;
  } | null;
}

export type Language = 'ar' | 'en';
