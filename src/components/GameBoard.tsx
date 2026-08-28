import React, { useRef, useEffect, useCallback } from 'react';
import { GameStatus, Star, Meteor, Particle, FloatingText, Player, PowerUp, GameStats, Language, ActivePerkState, Bullet } from '../types';
import { soundManager } from '../utils/audio';
import { BACKGROUND_THEMES, getThemeForLevel } from '../data/perks';

interface GameBoardProps {
  status: GameStatus;
  difficulty: 'normal' | 'hyper';
  lang: Language;
  stats: GameStats;
  perkState: ActivePerkState;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  onGameOver: () => void;
  onMilestoneReached: (newLevel: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  status,
  difficulty,
  lang,
  stats,
  perkState,
  onUpdateStats,
  onGameOver,
  onMilestoneReached
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Synchronized state refs for unhindered 60-120fps engine execution
  const isPlayingRef = useRef<boolean>(status === 'playing');
  const statusRef = useRef<GameStatus>(status);
  const prevStatusRef = useRef<GameStatus>(status);
  const difficultyRef = useRef<'normal' | 'hyper'>(difficulty);
  const langRef = useRef<Language>(lang);
  const perkStateRef = useRef<ActivePerkState>(perkState);
  const nextMilestoneRef = useRef<number>(1000);
  const lastMilestoneScoreRef = useRef<number>(0);

  // Active game session statistics ref to decouple physics loop from React state updates
  const sessionStatsRef = useRef({
    score: 0,
    survivalTime: 0,
    speedMultiplier: difficulty === 'hyper' ? 1.4 : 1,
    scoreMultiplier: 1,
    meteorsDodged: 0,
    nearMisses: 0,
    themeLevel: 1,
    activePowerUp: null as GameStats['activePowerUp']
  });

  // Keep references updated
  useEffect(() => {
    statusRef.current = status;
    isPlayingRef.current = status === 'playing';
  }, [status]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    perkStateRef.current = perkState;
    if (perkState.hasPermanentShield && entitiesRef.current.player) {
      entitiesRef.current.player.hasShield = true;
    }

    // Dynamic Milestone Step: Scales with point gain rate / score multipliers (Base 1,000 pts)
    const scoreRateBoost = Math.max(0, (perkState.scoreRateMultiplier - 1));
    const multBoost = Math.max(0, perkState.scoreMultiplierBonus);
    const godspeedBoost = perkState.godspeedMultiplier > 1 ? (perkState.godspeedMultiplier - 1) : 0;
    const totalScoreBonusRatio = scoreRateBoost + multBoost + godspeedBoost;
    const dynamicStep = Math.round(1000 * (1 + totalScoreBonusRatio));

    const targetThreshold = lastMilestoneScoreRef.current + dynamicStep;
    if (targetThreshold > sessionStatsRef.current.score) {
      nextMilestoneRef.current = Math.max(nextMilestoneRef.current, targetThreshold);
    }
  }, [perkState]);

  // Main Entities Engine Store
  const entitiesRef = useRef<{
    width: number;
    height: number;
    stars: Star[];
    meteors: Meteor[];
    bullets: Bullet[];
    powerUps: PowerUp[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    player: Player;
    spawnTimer: number;
    powerUpSpawnTimer: number;
    shakeAmount: number;
    lastTime: number;
    hudSyncTimer: number;
    slowMotionFactor: number;
    empWaveRadius: number | null;
    laserBeam: { x1: number; y1: number; x2: number; y2: number; life: number } | null;
    singularity: { x: number; y: number; radius: number; life: number } | null;
    supernovaFlash: number;
    shieldHitsLeft: number;
    shieldRegenCountdown: number;
    laserCountdown: number;
    pulseCountdown: number;
    singularityCountdown: number;
    supernovaCountdown: number;
    blasterTimer: number;
  }>({
    width: 400,
    height: 700,
    stars: [],
    meteors: [],
    bullets: [],
    powerUps: [],
    particles: [],
    floatingTexts: [],
    player: {
      x: 200,
      y: 600,
      targetX: 200,
      width: 40,
      height: 52,
      tilt: 0,
      speed: 0,
      hasShield: false,
      shieldPulse: 0,
      invulnerableTime: 0,
      color: '#06b6d4',
      trail: []
    },
    spawnTimer: 0,
    powerUpSpawnTimer: 0,
    shakeAmount: 0,
    lastTime: performance.now(),
    hudSyncTimer: 0,
    slowMotionFactor: 1,
    empWaveRadius: null,
    laserBeam: null,
    singularity: null,
    supernovaFlash: 0,
    shieldHitsLeft: 1,
    shieldRegenCountdown: 0,
    laserCountdown: 2.5,
    pulseCountdown: 25,
    singularityCountdown: 20,
    supernovaCountdown: 15,
    blasterTimer: 0
  });

  // Initialize starfield with current theme colors
  const initStars = useCallback((w: number, h: number, theme = BACKGROUND_THEMES[0]) => {
    const stars: Star[] = [];
    const starColors = theme.starColors;
    for (let i = 0; i < 85; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.4 + 0.6,
        speed: Math.random() * 1.8 + 0.4,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.02
      });
    }
    entitiesRef.current.stars = stars;
  }, []);

  // Spawn Meteor with craggy irregular polygon geometry
  const spawnMeteor = useCallback(() => {
    const e = entitiesRef.current;
    const baseMult = difficultyRef.current === 'hyper' ? 1.35 : 1;
    const perks = perkStateRef.current;
    const speedMult = sessionStatsRef.current.speedMultiplier * baseMult * perks.permanentSlowFactor * (1 - perks.meteorSpeedReduction);

    const roll = Math.random();
    let type: Meteor['type'] = 'standard';
    let radius = Math.random() * 5 + 12; // 12 to 17px
    let speed = (Math.random() * 2.2 + 3.2) * speedMult;
    let points = 20;
    let color = '#f97316';
    let glowColor = 'rgba(249, 115, 22, 0.8)';
    let coreColor = '#ffedd5';
    let maxHp = 2; // standard meteor takes 2 hits

    if (roll < 0.22) {
      // Fast Dart Meteor (Small and Fast -> 1 Hit Kill)
      type = 'fast_dart';
      radius = Math.random() * 3 + 8; // 8 to 11px
      speed = (Math.random() * 3.5 + 5.5) * speedMult * (1 - perks.bossFreeze * 0.5);
      points = 40;
      color = '#ec4899';
      glowColor = 'rgba(236, 72, 153, 0.9)';
      coreColor = '#fdf2f8';
      maxHp = 1;
    } else if (roll < 0.38) {
      // Giant Boulder Meteor (Reduced from 28-50px to 18-24px for balanced mobile play)
      type = 'giant_rock';
      radius = Math.random() * 6 + 18; // 18 to 24px
      speed = (Math.random() * 1.5 + 2.0) * speedMult * (1 - perks.bossFreeze);
      points = 50;
      color = '#eab308';
      glowColor = 'rgba(234, 179, 8, 0.85)';
      coreColor = '#fefce8';
      maxHp = 4;
    } else if (roll < 0.48) {
      // Rare Plasma Crystal Meteor (Crystal -> 3 Hits)
      type = 'plasma_crystal';
      radius = Math.random() * 4 + 11; // 11 to 15px
      speed = (Math.random() * 2.5 + 4.0) * speedMult;
      points = 60;
      color = '#a855f7';
      glowColor = 'rgba(168, 85, 247, 0.9)';
      coreColor = '#faf5ff';
      maxHp = 3;
    }

    // Intelligent spacing: Calculate candidate X positions to guarantee safe clearance between meteors
    const minMargin = radius + 15;
    const maxMargin = e.width - radius - 15;
    const topMeteors = e.meteors.filter(m => m.y < 160);

    let chosenX = Math.random() * (maxMargin - minMargin) + minMargin;
    let maxDistToNearest = -1;

    for (let attempt = 0; attempt < 14; attempt++) {
      const candX = Math.random() * (maxMargin - minMargin) + minMargin;
      let minGap = Infinity;

      for (const tm of topMeteors) {
        const gap = Math.abs(candX - tm.x);
        if (gap < minGap) minGap = gap;
      }

      // Safe clearance: candidate radius + existing meteor radius + spacing cushion
      const desiredClearance = radius + 34;
      if (minGap >= desiredClearance) {
        chosenX = candX;
        break;
      }

      if (minGap > maxDistToNearest) {
        maxDistToNearest = minGap;
        chosenX = candX;
      }
    }

    const x = chosenX;
    // Stagger vertical spawn height so they don't form an impassable solid horizontal wall
    const y = -radius - 20 - Math.random() * 35;

    // Generate irregular polygon vertices
    const vertexCount = Math.floor(Math.random() * 4) + 6;
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const dist = radius * (0.75 + Math.random() * 0.45);
      vertices.push({ angle, dist });
    }

    const horizontalDrift = (Math.random() - 0.5) * (speedMult * 0.8);

    e.meteors.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      prevX: x,
      prevY: y,
      radius,
      speed,
      horizontalDrift,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.06,
      vertices,
      color,
      glowColor,
      coreColor,
      type,
      points,
      hp: maxHp,
      maxHp,
      isNearMissed: false
    });
  }, []);

  // Spawn Power-Up Orb
  const spawnPowerUp = useCallback(() => {
    const e = entitiesRef.current;
    const types: PowerUp['type'][] = ['shield', 'slow_motion', 'double_score', 'blast_wave'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const radius = 18;
    const x = Math.random() * (e.width - radius * 4) + radius * 2;

    let color = '#06b6d4';
    let icon = '🛡️';

    if (chosenType === 'slow_motion') {
      color = '#a855f7';
      icon = '⏳';
    } else if (chosenType === 'double_score') {
      color = '#eab308';
      icon = '⚡';
    } else if (chosenType === 'blast_wave') {
      color = '#ec4899';
      icon = '💥';
    }

    const boost = perkStateRef.current.powerUpDurationBoost || 1;

    e.powerUps.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y: -radius - 10,
      radius,
      speed: 2.2,
      type: chosenType,
      duration: chosenType === 'blast_wave' ? 0.5 : 6 * boost,
      rotation: 0,
      color,
      icon
    });
  }, []);

  // Create explosion particles blast
  const createExplosion = useCallback((x: number, y: number, primaryColor: string, count = 35) => {
    const e = entitiesRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      const colors = [primaryColor, '#ffffff', '#06b6d4', '#ec4899', '#fef08a'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      e.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        shape: Math.random() < 0.3 ? 'spark' : 'circle'
      });
    }

    // Shockwave expansion ring
    e.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 10,
      color: primaryColor,
      alpha: 0.9,
      decay: 0.035,
      shape: 'ring'
    });
  }, []);

  // Activate PowerUp effect
  const activatePowerUp = useCallback((type: PowerUp['type'], duration: number) => {
    const e = entitiesRef.current;
    soundManager.playPowerUp();

    if (type === 'shield') {
      e.player.hasShield = true;
      e.shieldHitsLeft = perkStateRef.current.twinAegis ? 2 : 1;
      e.floatingTexts.push({
        id: Math.random().toString(),
        x: e.player.x,
        y: e.player.y - 30,
        text: langRef.current === 'ar' ? '🛡️ تم تفعيل الدرع!' : '🛡️ SHIELD ACTIVE!',
        color: '#06b6d4',
        alpha: 1,
        vy: -1.5,
        scale: 1.2
      });
    } else if (type === 'slow_motion') {
      e.slowMotionFactor = 0.45;
      e.floatingTexts.push({
        id: Math.random().toString(),
        x: e.player.x,
        y: e.player.y - 30,
        text: langRef.current === 'ar' ? '⏳ إبطاء الزمن!' : '⏳ TIME SLOW!',
        color: '#a855f7',
        alpha: 1,
        vy: -1.5,
        scale: 1.2
      });
    } else if (type === 'double_score') {
      e.floatingTexts.push({
        id: Math.random().toString(),
        x: e.player.x,
        y: e.player.y - 30,
        text: langRef.current === 'ar' ? '⚡ مضاعفة النقاط x2!' : '⚡ 2X SCORE!',
        color: '#eab308',
        alpha: 1,
        vy: -1.5,
        scale: 1.2
      });
    } else if (type === 'blast_wave') {
      // EMP shockwave clears meteors
      e.empWaveRadius = 10;
      e.shakeAmount = 18;
      createExplosion(e.player.x, e.player.y, '#ec4899', 50);

      // Destroy all on-screen meteors
      for (const m of e.meteors) {
        createExplosion(m.x, m.y, m.color, 15);
      }
      const clearedCount = e.meteors.length;
      e.meteors = [];

      sessionStatsRef.current.score += clearedCount * 50 * sessionStatsRef.current.scoreMultiplier;
      sessionStatsRef.current.meteorsDodged += clearedCount;

      onUpdateStats((prev) => ({
        ...prev,
        score: sessionStatsRef.current.score,
        meteorsDodged: sessionStatsRef.current.meteorsDodged
      }));

      e.floatingTexts.push({
        id: Math.random().toString(),
        x: e.player.x,
        y: e.player.y - 40,
        text: langRef.current === 'ar' ? '💥 صدمة EMP مسحت الفضاء!' : '💥 EMP BLAST CLEARED!',
        color: '#ec4899',
        alpha: 1,
        vy: -2,
        scale: 1.3
      });
      return;
    }

    sessionStatsRef.current.activePowerUp = {
      type,
      remaining: duration,
      maxDuration: duration
    };

    onUpdateStats((prev) => ({
      ...prev,
      scoreMultiplier: type === 'double_score' ? 2 : prev.scoreMultiplier,
      activePowerUp: sessionStatsRef.current.activePowerUp
    }));
  }, [createExplosion, onUpdateStats]);

  // Main Canvas Physics & Rendering Loop
  const updateAndRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const e = entitiesRef.current;
    const now = performance.now();
    const dt = Math.min((now - e.lastTime) / 1000, 0.1);
    e.lastTime = now;

    const perks = perkStateRef.current;
    const currentThemeLevel = sessionStatsRef.current.themeLevel || 1;
    const theme = getThemeForLevel(currentThemeLevel);
    const timeScale = e.slowMotionFactor;

    // --- GAMEPLAY ENGINE UPDATE ---
    if (isPlayingRef.current) {
      // 1. Accumulate survival & calculate score
      sessionStatsRef.current.survivalTime += dt;
      const speedBonus = 1 + (sessionStatsRef.current.survivalTime / 18) * 0.35;
      sessionStatsRef.current.speedMultiplier = Math.min(speedBonus, 4.5);

      const powerUpMult = sessionStatsRef.current.activePowerUp?.type === 'double_score' ? 2 : 1;
      const totalMultiplier = (powerUpMult + perks.scoreMultiplierBonus) * perks.scoreRateMultiplier * perks.godspeedMultiplier;
      sessionStatsRef.current.scoreMultiplier = Math.round(totalMultiplier * 10) / 10;

      const scoreIncrement = Math.round(dt * 30 * speedBonus * totalMultiplier);
      sessionStatsRef.current.score += scoreIncrement;

      // 2. Check 1,000 Points Milestone Trigger (+ Dynamic Scaling with score bonuses)
      if (sessionStatsRef.current.score >= nextMilestoneRef.current) {
        const reachedLevel = (sessionStatsRef.current.themeLevel || 1) + 1;
        sessionStatsRef.current.themeLevel = reachedLevel;
        lastMilestoneScoreRef.current = sessionStatsRef.current.score;

        // Dynamic step calculation: Base 1,000 + proportionally harder with score boosts
        const scoreRateBoost = Math.max(0, (perks.scoreRateMultiplier - 1));
        const multBoost = Math.max(0, perks.scoreMultiplierBonus);
        const godspeedBoost = perks.godspeedMultiplier > 1 ? (perks.godspeedMultiplier - 1) : 0;
        const totalScoreBonusRatio = scoreRateBoost + multBoost + godspeedBoost;
        const dynamicStep = Math.round(1000 * (1 + totalScoreBonusRatio));

        nextMilestoneRef.current = sessionStatsRef.current.score + dynamicStep;
        soundManager.playLevelUp();

        // Sync HUD immediately on milestone
        onUpdateStats((prev) => ({
          ...prev,
          score: sessionStatsRef.current.score,
          survivalTime: sessionStatsRef.current.survivalTime,
          speedMultiplier: sessionStatsRef.current.speedMultiplier,
          scoreMultiplier: sessionStatsRef.current.scoreMultiplier,
          themeLevel: reachedLevel
        }));

        setTimeout(() => {
          onMilestoneReached(reachedLevel);
        }, 50);
      }

      // 3. Power-Up Duration decay
      if (sessionStatsRef.current.activePowerUp) {
        sessionStatsRef.current.activePowerUp.remaining -= dt;
        if (sessionStatsRef.current.activePowerUp.remaining <= 0) {
          sessionStatsRef.current.activePowerUp = null;
          e.slowMotionFactor = 1;
        } else if (sessionStatsRef.current.activePowerUp.type === 'slow_motion') {
          e.slowMotionFactor = 0.45;
        }
      } else {
        e.slowMotionFactor = 1;
      }

      // 4. Periodic HUD State Synchronization (Every ~120ms to prevent React re-render thrashing)
      e.hudSyncTimer += dt;
      if (e.hudSyncTimer >= 0.12) {
        e.hudSyncTimer = 0;
        onUpdateStats((prev) => ({
          ...prev,
          score: sessionStatsRef.current.score,
          survivalTime: sessionStatsRef.current.survivalTime,
          speedMultiplier: sessionStatsRef.current.speedMultiplier,
          scoreMultiplier: sessionStatsRef.current.scoreMultiplier,
          meteorsDodged: sessionStatsRef.current.meteorsDodged,
          nearMisses: sessionStatsRef.current.nearMisses,
          activePowerUp: sessionStatsRef.current.activePowerUp,
          themeLevel: sessionStatsRef.current.themeLevel
        }));
      }

      // 5. Shield Regeneration Perk
      if (perks.shieldRegenInterval > 0 && !e.player.hasShield) {
        e.shieldRegenCountdown += dt;
        if (e.shieldRegenCountdown >= perks.shieldRegenInterval) {
          e.shieldRegenCountdown = 0;
          e.player.hasShield = true;
          e.shieldHitsLeft = perks.twinAegis ? 2 : 1;
          soundManager.playPowerUp();
          e.floatingTexts.push({
            id: Math.random().toString(),
            x: e.player.x,
            y: e.player.y - 30,
            text: langRef.current === 'ar' ? '🔰 تجدد درع البلازما!' : '🔰 SHIELD RECHARGED!',
            color: '#38bdf8',
            alpha: 1,
            vy: -1.5,
            scale: 1.2
          });
        }
      }

      // 6. Laser Interceptor Defense Perk
      if (perks.laserInterceptor) {
        e.laserCountdown -= dt;
        if (e.laserCountdown <= 0) {
          e.laserCountdown = 2.5;
          let closestMeteorIndex = -1;
          let minDistance = 9999;
          for (let i = 0; i < e.meteors.length; i++) {
            const m = e.meteors[i];
            const dist = Math.hypot(m.x - e.player.x, m.y - e.player.y);
            if (dist < minDistance && m.y < e.player.y) {
              minDistance = dist;
              closestMeteorIndex = i;
            }
          }

          if (closestMeteorIndex !== -1 && minDistance < e.height * 0.65) {
            const target = e.meteors[closestMeteorIndex];
            soundManager.playLaser();
            e.laserBeam = {
              x1: e.player.x,
              y1: e.player.y - e.player.height * 0.5,
              x2: target.x,
              y2: target.y,
              life: 0.18
            };
            createExplosion(target.x, target.y, target.color, 25);
            e.meteors.splice(closestMeteorIndex, 1);
            sessionStatsRef.current.score += 40 * sessionStatsRef.current.scoreMultiplier;
            sessionStatsRef.current.meteorsDodged += 1;
          }
        }
      }

      // 7. Supernova Storm Perk
      if (perks.supernovaInterval > 0) {
        e.supernovaCountdown -= dt;
        if (e.supernovaCountdown <= 0) {
          e.supernovaCountdown = perks.supernovaInterval;
          e.supernovaFlash = 1;
          e.shakeAmount = 20;
          soundManager.playExplosion();
          for (const m of e.meteors) {
            createExplosion(m.x, m.y, '#fde047', 15);
          }
          const cleared = e.meteors.length;
          e.meteors = [];
          sessionStatsRef.current.score += (300 + cleared * 50) * sessionStatsRef.current.scoreMultiplier;
          sessionStatsRef.current.meteorsDodged += cleared;

          e.floatingTexts.push({
            id: Math.random().toString(),
            x: e.player.x,
            y: e.player.y - 45,
            text: langRef.current === 'ar' ? '☀️ عاصفة سوبرنوفا كاسحة!' : '☀️ SUPERNOVA BURST!',
            color: '#fde047',
            alpha: 1,
            vy: -2,
            scale: 1.3
          });
        }
      }

      // 8. Periodic EMP Pulse Perk
      if (perks.periodicPulseInterval > 0) {
        e.pulseCountdown -= dt;
        if (e.pulseCountdown <= 0) {
          e.pulseCountdown = perks.periodicPulseInterval;
          e.empWaveRadius = 15;
          e.shakeAmount = 15;
          soundManager.playPowerUp();
          for (let i = e.meteors.length - 1; i >= 0; i--) {
            const m = e.meteors[i];
            if (m.y > e.player.y - 250) {
              createExplosion(m.x, m.y, '#ec4899', 20);
              e.meteors.splice(i, 1);
            }
          }
          e.floatingTexts.push({
            id: Math.random().toString(),
            x: e.player.x,
            y: e.player.y - 35,
            text: langRef.current === 'ar' ? '💥 نبضة EMP دورية!' : '💥 EMP WAVE DISCHARGE!',
            color: '#ec4899',
            alpha: 1,
            vy: -1.8,
            scale: 1.2
          });
        }
      }

      // 9. Mythic Plasma Blaster Auto-Fire (5% Ultra-Rare Ability)
      if (perks.hasPlasmaBlaster) {
        e.blasterTimer += dt;
        const fireInterval = 1 / (perks.blasterFireRate || 4.5);
        if (e.blasterTimer >= fireInterval) {
          e.blasterTimer = 0;
          soundManager.playShoot();
          const wingOffset = (e.player.width * perks.sizeScale) * 0.35;
          // Dual plasma blaster bolts
          e.bullets.push({
            id: Math.random().toString(36).substring(2, 7),
            x: e.player.x - wingOffset,
            y: e.player.y - 12,
            vx: 0,
            vy: -880,
            radius: 4,
            damage: perks.blasterDamage || 1,
            color: '#ec4899'
          });
          e.bullets.push({
            id: Math.random().toString(36).substring(2, 7),
            x: e.player.x + wingOffset,
            y: e.player.y - 12,
            vx: 0,
            vy: -880,
            radius: 4,
            damage: perks.blasterDamage || 1,
            color: '#ec4899'
          });
        }
      }

      // Update Bullets & Collision with Meteors
      for (let bIdx = e.bullets.length - 1; bIdx >= 0; bIdx--) {
        const b = e.bullets[bIdx];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Plasma trail
        if (Math.random() < 0.4) {
          e.particles.push({
            x: b.x,
            y: b.y + 4,
            vx: (Math.random() - 0.5) * 1,
            vy: Math.random() * 2 + 1,
            size: 2.2,
            color: '#ec4899',
            alpha: 0.75,
            decay: 0.08,
            shape: 'circle'
          });
        }

        let hitMeteor = false;
        for (let mIdx = e.meteors.length - 1; mIdx >= 0; mIdx--) {
          const m = e.meteors[mIdx];
          const hitDist = Math.hypot(m.x - b.x, m.y - b.y);
          if (hitDist < m.radius + b.radius + 3) {
            hitMeteor = true;
            m.hp -= b.damage;
            soundManager.playBulletHit();
            createExplosion(b.x, b.y, '#f472b6', 8);

            // If meteor is destroyed by bullets
            if (m.hp <= 0) {
              createExplosion(m.x, m.y, m.color, 32);
              soundManager.playExplosion();
              e.meteors.splice(mIdx, 1);
              const earned = m.points * sessionStatsRef.current.scoreMultiplier;
              sessionStatsRef.current.score += earned;
              sessionStatsRef.current.meteorsDodged += 1;

              e.floatingTexts.push({
                id: Math.random().toString(),
                x: m.x,
                y: m.y - 15,
                text: `💥 +${Math.round(earned)}`,
                color: '#ec4899',
                alpha: 1,
                vy: -1.6,
                scale: 1.15
              });
            }
            break;
          }
        }

        if (hitMeteor || b.y < -30) {
          e.bullets.splice(bIdx, 1);
        }
      }

      // Laser Beam decay
      if (e.laserBeam) {
        e.laserBeam.life -= dt;
        if (e.laserBeam.life <= 0) e.laserBeam = null;
      }

      // Supernova flash decay
      if (e.supernovaFlash > 0) {
        e.supernovaFlash = Math.max(0, e.supernovaFlash - dt * 2.5);
      }

      // 9. Smooth Responsive Player Movement Lerp
      const agilityMult = 0.26 * (perks.speedBoost + perks.agilityBoost);
      const dx = e.player.targetX - e.player.x;
      e.player.x += dx * Math.min(0.65, Math.max(0.2, agilityMult));
      e.player.tilt = Math.max(-0.45, Math.min(0.45, dx * 0.022));

      // Invulnerability tick
      if (e.player.invulnerableTime > 0) {
        e.player.invulnerableTime = Math.max(0, e.player.invulnerableTime - dt);
      }

      // Shield pulse
      e.player.shieldPulse += dt * 3;

      // Spaceship Thruster Plasma Particles
      if (Math.random() < 0.8) {
        e.particles.push({
          x: e.player.x + (Math.random() - 0.5) * 10,
          y: e.player.y + (e.player.height * perks.sizeScale) / 2 - 4,
          vx: (Math.random() - 0.5) * 1.5 - e.player.tilt * 3,
          vy: Math.random() * 4 + 4,
          size: Math.random() * 3.5 + 1.5,
          color: Math.random() < 0.6 ? '#06b6d4' : theme.starColors[1] || '#ec4899',
          alpha: 0.9,
          decay: 0.05,
          shape: 'circle'
        });
      }

      // 10. Spawning Meteors Continuously
      e.spawnTimer += dt * timeScale;
      const baseInterval = difficultyRef.current === 'hyper' ? 0.45 : 0.8;
      const spawnInterval = Math.max(0.18, baseInterval / sessionStatsRef.current.speedMultiplier);
      if (e.spawnTimer >= spawnInterval) {
        e.spawnTimer = 0;
        spawnMeteor();
      }

      // 11. Spawning Power-Ups occasionally (every 14-20s + drop boost)
      e.powerUpSpawnTimer += dt * (1 + perks.dropRateBoost);
      if (e.powerUpSpawnTimer >= 16) {
        e.powerUpSpawnTimer = 0;
        if (Math.random() < 0.75 + perks.dropRateBoost * 0.2) {
          spawnPowerUp();
        }
      }

      // 12. Update PowerUps with Hyper Siphon
      for (let i = e.powerUps.length - 1; i >= 0; i--) {
        const p = e.powerUps[i];

        if (perks.hyperSiphon) {
          const sDx = e.player.x - p.x;
          const sDy = e.player.y - p.y;
          p.x += sDx * 0.08;
          p.y += Math.max(p.speed, sDy * 0.08);
        } else {
          p.y += p.speed * timeScale;
        }

        p.rotation += 0.03;

        // Collision with Player
        const dist = Math.hypot(p.x - e.player.x, p.y - e.player.y);
        if (dist < p.radius + e.player.width * perks.sizeScale * 0.45) {
          activatePowerUp(p.type, p.duration);
          createExplosion(p.x, p.y, p.color, 25);
          e.powerUps.splice(i, 1);
          continue;
        }

        if (p.y > e.height + 50) {
          e.powerUps.splice(i, 1);
        }
      }

      // 13. Update Meteors & Collisions
      for (let i = e.meteors.length - 1; i >= 0; i--) {
        const m = e.meteors[i];
        m.prevX = m.x;
        m.prevY = m.y;
        m.y += m.speed * timeScale;
        m.x += m.horizontalDrift * timeScale;
        m.rotation += m.rotationSpeed * timeScale;

        // Repulsor Aura Perk: Push meteors sideways
        if (perks.repulsorAura) {
          const distToPlayer = Math.hypot(m.x - e.player.x, m.y - e.player.y);
          if (distToPlayer < 110 && m.y < e.player.y) {
            const pushDir = m.x > e.player.x ? 1 : -1;
            m.x += pushDir * 3.5;
          }
        }

        // Tail burning particles
        if (Math.random() < 0.6) {
          e.particles.push({
            x: m.x + (Math.random() - 0.5) * (m.radius * 0.8),
            y: m.y - m.radius * 0.4,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2 - 1,
            size: Math.random() * 3 + 1,
            color: m.color,
            alpha: 0.8,
            decay: 0.045,
            shape: 'spark'
          });
        }

        const dist = Math.hypot(m.x - e.player.x, m.y - e.player.y);

        // Near-Miss Mechanic
        const nearMissInner = m.radius + e.player.width * perks.hitboxScale * 0.45;
        const nearMissOuter = m.radius + e.player.width * perks.hitboxScale * 0.95;

        if (!m.isNearMissed && dist >= nearMissInner && dist <= nearMissOuter && m.y > e.player.y - 20) {
          m.isNearMissed = true;
          soundManager.playNearMiss();

          const earnedBonus = (50 + perks.nearMissBonus) * sessionStatsRef.current.scoreMultiplier;
          sessionStatsRef.current.score += earnedBonus;
          sessionStatsRef.current.nearMisses += 1;

          if (perks.dodgeReflexBlink) {
            e.player.invulnerableTime = 1.0;
          }

          e.floatingTexts.push({
            id: Math.random().toString(),
            x: e.player.x,
            y: e.player.y - 25,
            text: langRef.current === 'ar' ? `🔥 تفادٍ خطير! +${Math.round(earnedBonus)}` : `🔥 CLOSE CALL! +${Math.round(earnedBonus)}`,
            color: '#eab308',
            alpha: 1,
            vy: -1.8,
            scale: 1.15
          });
        }

        // Fatal Collision Detection
        const hitDistance = m.radius + e.player.width * perks.hitboxScale * 0.35;
        if (dist < hitDistance) {
          // Quantum Phase Shift Perk (25% chance to phase through)
          if (perks.quantumPhaseChance > 0 && Math.random() < perks.quantumPhaseChance) {
            e.player.invulnerableTime = 0.8;
            e.floatingTexts.push({
              id: Math.random().toString(),
              x: e.player.x,
              y: e.player.y - 30,
              text: langRef.current === 'ar' ? '🌌 اختراق كوانتم شبحي!' : '🌌 QUANTUM PHASED!',
              color: '#c084fc',
              alpha: 1,
              vy: -1.5,
              scale: 1.2
            });
            continue;
          }

          // If Shield is active
          if (e.player.hasShield) {
            e.shieldHitsLeft--;
            if (e.shieldHitsLeft <= 0) {
              e.player.hasShield = false;
            }
            e.player.invulnerableTime = 1.2;
            soundManager.playShieldBreak();
            createExplosion(m.x, m.y, '#06b6d4', 30);
            e.shakeAmount = 14;
            e.meteors.splice(i, 1);

            e.floatingTexts.push({
              id: Math.random().toString(),
              x: e.player.x,
              y: e.player.y - 30,
              text: langRef.current === 'ar' ? '💥 امتص الدرع الصدمة!' : '💥 SHIELD ABSORBED HIT!',
              color: '#06b6d4',
              alpha: 1,
              vy: -1.5,
              scale: 1.2
            });
            continue;
          } else if (e.player.invulnerableTime > 0) {
            continue;
          } else if (perks.hasPhoenixRevive && !perks.phoenixUsed) {
            // Phoenix Protocol: Free Resurrection!
            perks.phoenixUsed = true;
            soundManager.playPhoenix();
            e.player.hasShield = true;
            e.player.invulnerableTime = 3.5;
            e.empWaveRadius = 20;
            e.shakeAmount = 22;
            createExplosion(e.player.x, e.player.y, '#f97316', 60);

            for (const mItem of e.meteors) {
              createExplosion(mItem.x, mItem.y, mItem.color, 15);
            }
            e.meteors = [];

            e.floatingTexts.push({
              id: Math.random().toString(),
              x: e.player.x,
              y: e.player.y - 45,
              text: langRef.current === 'ar' ? '🔥🦅 إحياء الفينيق الأسطوري!' : '🔥🦅 PHOENIX RESURRECTION!',
              color: '#f97316',
              alpha: 1,
              vy: -2,
              scale: 1.4
            });
            break;
          } else {
            // Game Over Crash
            soundManager.playExplosion();
            createExplosion(e.player.x, e.player.y, '#06b6d4', 60);
            createExplosion(m.x, m.y, m.color, 40);
            e.shakeAmount = 25;

            // Final HUD synchronization on death
            onUpdateStats((prev) => ({
              ...prev,
              score: sessionStatsRef.current.score,
              survivalTime: sessionStatsRef.current.survivalTime,
              meteorsDodged: sessionStatsRef.current.meteorsDodged,
              nearMisses: sessionStatsRef.current.nearMisses
            }));

            onGameOver();
            break;
          }
        }

        // Passed off screen successfully
        if (m.y > e.height + m.radius + 30) {
          e.meteors.splice(i, 1);
          sessionStatsRef.current.score += perks.salvageScorePerMeteor;
          sessionStatsRef.current.meteorsDodged += 1;
        }
      }

      // EMP Blast expansion
      if (e.empWaveRadius !== null) {
        e.empWaveRadius += dt * 800;
        if (e.empWaveRadius > Math.max(e.width, e.height) * 1.5) {
          e.empWaveRadius = null;
        }
      }
    }

    // Update Stars (Starfield scrolling)
    for (const s of e.stars) {
      s.y += s.speed * sessionStatsRef.current.speedMultiplier * (isPlayingRef.current ? 1 : 0.4) * timeScale;
      s.twinkleOffset += s.twinkleSpeed;
      if (s.y > e.height) {
        s.y = 0;
        s.x = Math.random() * e.width;
      }
    }

    // Update Particles
    for (let i = e.particles.length - 1; i >= 0; i--) {
      const p = e.particles[i];
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      p.alpha -= p.decay * (1 / timeScale);
      if (p.shape === 'ring') p.size += 3.5;
      if (p.alpha <= 0) {
        e.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = e.floatingTexts.length - 1; i >= 0; i--) {
      const ft = e.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) {
        e.floatingTexts.splice(i, 1);
      }
    }

    // Screen Shake decay
    if (e.shakeAmount > 0) {
      e.shakeAmount *= 0.88;
      if (e.shakeAmount < 0.2) e.shakeAmount = 0;
    }

    // --- DRAWING CANVAS ---
    ctx.save();
    ctx.clearRect(0, 0, e.width, e.height);

    // Screen Shake
    if (e.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * e.shakeAmount;
      const sy = (Math.random() - 0.5) * e.shakeAmount;
      ctx.translate(sx, sy);
    }

    // Background Nebula Gradient (Theme dynamic)
    const bgGrad = ctx.createRadialGradient(
      e.width * 0.5,
      e.height * 0.35,
      10,
      e.width * 0.5,
      e.height * 0.5,
      e.height * 0.85
    );
    bgGrad.addColorStop(0, theme.grad1);
    bgGrad.addColorStop(0.5, theme.grad2);
    bgGrad.addColorStop(1, theme.grad3);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, e.width, e.height);

    // Draw Parallax Stars
    for (const s of e.stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(s.twinkleOffset);
      ctx.save();
      ctx.globalAlpha = Math.min(1, 0.4 + twinkle * 0.6);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.size > 1.8 ? 6 : 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Danger Radar Guide Beams (Perk)
    if (perks.dangerRadar && isPlayingRef.current) {
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.5;
      for (const m of e.meteors) {
        if (m.type === 'fast_dart' || m.speed > 5) {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.horizontalDrift * 30, e.height);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Draw Laser Beam (Perk)
    if (e.laserBeam) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(e.laserBeam.x1, e.laserBeam.y1);
      ctx.lineTo(e.laserBeam.x2, e.laserBeam.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw EMP Shockwave
    if (e.empWaveRadius !== null) {
      ctx.save();
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(e.player.x, e.player.y, e.empWaveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Supernova Solar Flash Overlay
    if (e.supernovaFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(254, 240, 138, ${e.supernovaFlash * 0.4})`;
      ctx.fillRect(0, 0, e.width, e.height);
      ctx.restore();
    }

    // Draw Power-Up Orbs
    for (const p of e.powerUps) {
      ctx.save();
      ctx.translate(p.x, p.y);

      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;

      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `${p.color}33`;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${p.radius * 1.1}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.icon, 0, 1);

      ctx.restore();
    }

    // Draw Plasma Bullets
    for (const b of e.bullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 14;

      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.ellipse(0, 0, b.radius, b.radius * 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, b.radius * 0.5, b.radius * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw Meteors
    for (const m of e.meteors) {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);

      ctx.shadowColor = m.glowColor;
      ctx.shadowBlur = 20;

      ctx.fillStyle = m.color;
      ctx.beginPath();
      for (let i = 0; i < m.vertices.length; i++) {
        const v = m.vertices[i];
        const vx = Math.cos(v.angle) * v.dist;
        const vy = Math.sin(v.angle) * v.dist;
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = m.coreColor;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-m.radius * 0.4, -m.radius * 0.2);
      ctx.lineTo(m.radius * 0.2, m.radius * 0.3);
      ctx.stroke();

      ctx.restore();

      // If damaged, draw mini health bar / pips above meteor
      if (m.maxHp > 1 && m.hp < m.maxHp) {
        ctx.save();
        ctx.translate(m.x, m.y - m.radius - 8);
        const pipWidth = 6;
        const gap = 2;
        const totalW = m.maxHp * pipWidth + (m.maxHp - 1) * gap;
        const startX = -totalW / 2;

        for (let pIdx = 0; pIdx < m.maxHp; pIdx++) {
          ctx.fillStyle = pIdx < m.hp ? '#ec4899' : 'rgba(255, 255, 255, 0.25)';
          ctx.shadowColor = pIdx < m.hp ? '#ec4899' : 'transparent';
          ctx.shadowBlur = pIdx < m.hp ? 6 : 0;
          ctx.fillRect(startX + pIdx * (pipWidth + gap), 0, pipWidth, 3.5);
        }
        ctx.restore();
      }
    }

    // Draw Particles
    for (const p of e.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === 'ring') {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'spark') {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Spaceship Fighter
    const isBlinking = e.player.invulnerableTime > 0 && Math.floor(now / 100) % 2 === 0;
    if (!isBlinking && (isPlayingRef.current || statusRef.current !== 'gameover')) {
      const scale = perks.sizeScale;
      ctx.save();
      ctx.translate(e.player.x, e.player.y);
      ctx.rotate(e.player.tilt);
      ctx.scale(scale, scale);

      if (perks.repulsorAura) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, e.player.width * 1.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 22;

      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(0, -e.player.height / 2);
      ctx.lineTo(e.player.width * 0.5, e.player.height * 0.4);
      ctx.lineTo(e.player.width * 0.25, e.player.height * 0.5);
      ctx.lineTo(0, e.player.height * 0.35);
      ctx.lineTo(-e.player.width * 0.25, e.player.height * 0.5);
      ctx.lineTo(-e.player.width * 0.5, e.player.height * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-e.player.width * 0.45, e.player.height * 0.35);
      ctx.lineTo(-e.player.width * 0.45, e.player.height * 0.15);
      ctx.moveTo(e.player.width * 0.45, e.player.height * 0.35);
      ctx.lineTo(e.player.width * 0.45, e.player.height * 0.15);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, -e.player.height * 0.1, 4.5, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      if (e.player.hasShield || e.player.invulnerableTime > 0) {
        const isInvulnShield = e.player.invulnerableTime > 0;
        const pulse = Math.sin(e.player.shieldPulse) * 3;
        ctx.save();
        ctx.strokeStyle = isInvulnShield
          ? 'rgba(56, 189, 248, 0.95)'
          : perks.twinAegis
            ? 'rgba(234, 179, 8, 0.9)'
            : 'rgba(6, 182, 212, 0.85)';
        ctx.lineWidth = isInvulnShield ? 4 : perks.twinAegis ? 3.5 : 2.5;
        ctx.shadowColor = isInvulnShield ? '#38bdf8' : perks.twinAegis ? '#eab308' : '#06b6d4';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(0, 0, e.player.width * 0.78 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isInvulnShield
          ? 'rgba(56, 189, 248, 0.2)'
          : perks.twinAegis
            ? 'rgba(234, 179, 8, 0.15)'
            : 'rgba(6, 182, 212, 0.12)';
        ctx.beginPath();
        ctx.arc(0, 0, e.player.width * 0.78 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Extra outer pulse ring for 2s invulnerability shield
        if (isInvulnShield) {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, e.player.width * 0.95 + pulse * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.restore();
    }

    // Draw Floating Score & Combo Texts
    for (const ft of e.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${Math.round(15 * ft.scale)}px 'Cairo', sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }, [activatePowerUp, createExplosion, onGameOver, onMilestoneReached, onUpdateStats, spawnMeteor, spawnPowerUp]);

  // Responsive Resizing with ResizeObserver
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      const e = entitiesRef.current;
      e.width = w;
      e.height = h;
      e.player.y = h - 85;

      if (!isPlayingRef.current && statusRef.current === 'idle') {
        e.player.x = w / 2;
        e.player.targetX = w / 2;
      }

      if (e.stars.length === 0) {
        initStars(w, h, getThemeForLevel(sessionStatsRef.current.themeLevel || 1));
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [initStars]);

  // Main Uninterrupted Animation Frame Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      updateAndRender();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [updateAndRender]);

  // Reset / Transition game session entities when starting a new game
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === 'playing' && (prevStatus === 'idle' || prevStatus === 'gameover')) {
      const e = entitiesRef.current;
      e.meteors = [];
      e.bullets = [];
      e.powerUps = [];
      e.particles = [];
      e.floatingTexts = [];
      e.player.x = e.width / 2;
      e.player.targetX = e.width / 2;
      e.player.hasShield = perkStateRef.current.hasPermanentShield;
      e.player.invulnerableTime = 0;
      e.spawnTimer = 0;
      e.powerUpSpawnTimer = 0;
      e.blasterTimer = 0;
      e.shakeAmount = 0;
      e.empWaveRadius = null;
      e.shieldHitsLeft = perkStateRef.current.twinAegis ? 2 : 1;

      sessionStatsRef.current = {
        score: 0,
        survivalTime: 0,
        speedMultiplier: difficultyRef.current === 'hyper' ? 1.4 : 1,
        scoreMultiplier: 1,
        meteorsDodged: 0,
        nearMisses: 0,
        themeLevel: 1,
        activePowerUp: null
      };
      nextMilestoneRef.current = 1000;
      lastMilestoneScoreRef.current = 0;
      soundManager.startBgm();
    } else if (status === 'gameover' || status === 'paused' || status === 'level_up') {
      soundManager.stopBgm();
    } else if (status === 'playing' && prevStatus === 'level_up') {
      soundManager.startBgm();
      soundManager.playShield();
      const e = entitiesRef.current;

      // 1. Give player exactly 2.0 seconds of invulnerability & protective shield
      e.player.invulnerableTime = 2.0;

      // 2. Trigger expanding EMP shockwave ring effect
      e.empWaveRadius = 20;
      e.shakeAmount = 10;

      // 3. Explode any meteors near player (within 350px or lower 75% of screen)
      const safetyRadius = 350;
      let destroyedCount = 0;
      for (let i = e.meteors.length - 1; i >= 0; i--) {
        const m = e.meteors[i];
        const dist = Math.hypot(m.x - e.player.x, m.y - e.player.y);
        if (dist <= safetyRadius || m.y >= e.player.y - 120) {
          createExplosion(m.x, m.y, m.color, 26);
          e.meteors.splice(i, 1);
          destroyedCount++;
        }
      }

      if (destroyedCount > 0) {
        soundManager.playExplosion();
      }

      e.floatingTexts.push({
        id: Math.random().toString(),
        x: e.player.x,
        y: e.player.y - 45,
        text: langRef.current === 'ar' ? '🛡️ درع حماية (ثانيتان) + تطهير مداري! 💥' : '🛡️ 2s INVULNERABILITY SHIELD! 💥',
        color: '#38bdf8',
        alpha: 1,
        vy: -1.8,
        scale: 1.3
      });
    } else if (status === 'playing' && prevStatus === 'paused') {
      soundManager.startBgm();
    }
  }, [status]);

  // Touch, Pointer & Mouse Movement handler
  const handlePointer = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const e = entitiesRef.current;
    e.player.targetX = Math.max(
      e.player.width * 0.6,
      Math.min(e.width - e.player.width * 0.6, x)
    );
  }, []);

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointer(e.touches[0].clientX);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handlePointer(e.clientX);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayingRef.current) return;
      const ent = entitiesRef.current;
      const step = 32;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        ent.player.targetX = Math.max(ent.player.width * 0.6, ent.player.targetX - step);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        ent.player.targetX = Math.min(ent.width - ent.player.width * 0.6, ent.player.targetX + step);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-viewport"
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair touch-none select-none"
      onMouseMove={onMouseMove}
      onPointerMove={(e) => handlePointer(e.clientX)}
      onPointerDown={(e) => handlePointer(e.clientX)}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchMove}
    >
      <canvas
        ref={canvasRef}
        id="meteor-canvas"
        className="w-full h-full block"
      />
    </div>
  );
};
