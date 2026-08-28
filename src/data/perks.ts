import { Perk, PerkRarity, BackgroundTheme, ActivePerkState } from '../types';

export const RARITY_INFO: Record<PerkRarity, {
  nameAr: string;
  nameEn: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  badgeBg: string;
  probability: number; // percentage
}> = {
  common: {
    nameAr: 'عادي',
    nameEn: 'Common',
    color: '#38bdf8',
    borderColor: 'rgba(56, 189, 248, 0.5)',
    bgGlow: 'rgba(56, 189, 248, 0.15)',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    probability: 45
  },
  rare: {
    nameAr: 'جيد',
    nameEn: 'Good',
    color: '#a855f7',
    borderColor: 'rgba(168, 85, 247, 0.6)',
    bgGlow: 'rgba(168, 85, 247, 0.2)',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    probability: 30
  },
  epic: {
    nameAr: 'ممتاز',
    nameEn: 'Excellent',
    color: '#eab308',
    borderColor: 'rgba(234, 179, 8, 0.7)',
    bgGlow: 'rgba(234, 179, 8, 0.25)',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    probability: 18
  },
  legendary: {
    nameAr: 'أسطوري',
    nameEn: 'Legendary',
    color: '#ec4899',
    borderColor: 'rgba(236, 72, 153, 0.85)',
    bgGlow: 'rgba(236, 72, 153, 0.3)',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
    probability: 7
  }
};

// 30 Total Unique Abilities categorized strictly as requested
export const ALL_PERKS: Perk[] = [
  // ================= 8 COMMON ABILITIES (عادي) =================
  {
    id: 'c_agility',
    nameAr: 'خفة حركة نيون',
    nameEn: 'Neon Agility',
    descAr: 'زيادة سرعة استجابة ومناورة المركبة بنسبة +15%',
    descEn: 'Increases ship handling and maneuver speed by +15%',
    icon: '⚡',
    rarity: 'common',
    apply: (s) => { s.speedBoost += 0.15; }
  },
  {
    id: 'c_score_flux',
    nameAr: 'مغناطيس النقاط',
    nameEn: 'Score Magnet',
    descAr: 'زيادة معدل كسب نقاط الصمود بنسبة +12%',
    descEn: 'Boosts continuous survival score yield by +12%',
    icon: '💎',
    rarity: 'common',
    apply: (s) => { s.scoreRateMultiplier += 0.12; }
  },
  {
    id: 'c_nano_shrink',
    nameAr: 'تصغير النانو',
    nameEn: 'Nano Shrink',
    descAr: 'تقليص أبعاد المركبة بنسبة 10% لسهولة المرور بين النيازك',
    descEn: 'Shrinks starship scale by 10% for easier dodging',
    icon: '📐',
    rarity: 'common',
    apply: (s) => { s.sizeScale *= 0.90; }
  },
  {
    id: 'c_safety_hitbox',
    nameAr: 'منطقة أمان مضغوطة',
    nameEn: 'Safety Buffer',
    descAr: 'تقليل منطقة الاصطدام القاتلة بنسبة 15%',
    descEn: 'Reduces collision hitbox radius by 15%',
    icon: '🎯',
    rarity: 'common',
    apply: (s) => { s.hitboxScale *= 0.85; }
  },
  {
    id: 'c_danger_radar',
    nameAr: 'مستشعر الخطر المسبق',
    nameEn: 'Danger Radar',
    descAr: 'تحذير مسبق بأشعة ضوئية تظهر مسار النيازك فائقة السرعة',
    descEn: 'Early warning beams showing paths of high-speed meteors',
    icon: '📡',
    rarity: 'common',
    apply: (s) => { s.dangerRadar = true; }
  },
  {
    id: 'c_golden_dodge',
    nameAr: 'التفادي الذهبي',
    nameEn: 'Golden Dodge',
    descAr: 'مضاعفة نقاط التفادي الوشيك (Close Call) من 50 إلى 120 نقطة',
    descEn: 'Increases Close Call bonus from 50 to 120 points',
    icon: '✨',
    rarity: 'common',
    apply: (s) => { s.nearMissBonus += 70; }
  },
  {
    id: 'c_star_flux',
    nameAr: 'جاذبية الكبسولات',
    nameEn: 'Power Attraction',
    descAr: 'زيادة معدل سقوط كبسولات الطاقة وسرعة التقاطها بنسبة +25%',
    descEn: 'Boosts energy power-up drop frequency and suction',
    icon: '🧲',
    rarity: 'common',
    apply: (s) => { s.dropRateBoost += 0.25; }
  },
  {
    id: 'c_kinetic_drag',
    nameAr: 'مكابح كهرومغناطيسية',
    nameEn: 'Kinetic Drag',
    descAr: 'تقليل سرعة سقوط جميع النيازك بنسبة 8%',
    descEn: 'Permanently slows meteor descent speed by 8%',
    icon: '🛑',
    rarity: 'common',
    apply: (s) => { s.meteorSpeedReduction += 0.08; }
  },

  // ================= 8 GOOD / RARE ABILITIES (جيد) =================
  {
    id: 'r_energy_shield',
    nameAr: 'درع طاقة دائم (Mk I)',
    nameEn: 'Energy Shield Mk I',
    descAr: 'تزويد المركبة بدرع طاقة فوري يمتص صدمة نيزك واحدة كاملة',
    descEn: 'Equips a solid energy shield absorbing 1 full collision',
    icon: '🛡️',
    rarity: 'rare',
    apply: (s) => { s.hasPermanentShield = true; }
  },
  {
    id: 'r_chrono_dilator',
    nameAr: 'ممدد الزمن الدائم',
    nameEn: 'Chrono Dilator',
    descAr: 'إبطاء حركة وسقوط النيازك بنسبة 16% بشكل دائم',
    descEn: 'Permanently dilates time, slowing all meteors by 16%',
    icon: '⏳',
    rarity: 'rare',
    apply: (s) => { s.permanentSlowFactor *= 0.84; }
  },
  {
    id: 'r_score_overdrive',
    nameAr: 'مضاعف نقاط مستمر',
    nameEn: 'Score Overdrive',
    descAr: 'زيادة جميع النقاط المكتسبة بنسبة +35% طوال اللعبة',
    descEn: 'Permanently boosts all incoming points by +35%',
    icon: '🔥',
    rarity: 'rare',
    apply: (s) => { s.scoreMultiplierBonus += 0.35; }
  },
  {
    id: 'r_repulsor_aura',
    nameAr: 'هالة الدفع النبضي',
    nameEn: 'Repulsor Aura',
    descAr: 'هالة طاقة تدفع النيازك القريبة تلقائياً بعيداً عن مسار المركبة',
    descEn: 'Deflective aura nudging approaching meteors sideways',
    icon: '🌀',
    rarity: 'rare',
    apply: (s) => { s.repulsorAura = true; }
  },
  {
    id: 'r_power_surge',
    nameAr: 'تعزيز كبسولات الطاقة',
    nameEn: 'Power Surge',
    descAr: 'زيادة مدة وتأثير كبسولات الطاقة بنسبة +50%',
    descEn: 'Extends duration of all collected power-ups by +50%',
    icon: '⚡',
    rarity: 'rare',
    apply: (s) => { s.powerUpDurationBoost += 0.5; }
  },
  {
    id: 'r_reflex_blink',
    nameAr: 'وميض المناعة الخاطف',
    nameEn: 'Reflex Blink',
    descAr: 'بعد كل تفادٍ وشيك، تكتسب المركبة مناعة واختراقاً لمدة 1 ثانية',
    descEn: 'Triggers 1 second of invulnerability after every Close Call',
    icon: '💫',
    rarity: 'rare',
    apply: (s) => { s.dodgeReflexBlink = true; }
  },
  {
    id: 'r_graviton_thruster',
    nameAr: 'محركات الجاذبية النفاثة',
    nameEn: 'Graviton Thrusters',
    descAr: 'زيادة سرعة المناورة الأفقية بنسبة +30% وانعطاف فائق',
    descEn: 'Increases lateral dodge velocity by +30%',
    icon: '🚀',
    rarity: 'rare',
    apply: (s) => { s.agilityBoost += 0.30; }
  },
  {
    id: 'r_meteor_salvage',
    nameAr: 'حصاد النيازك',
    nameEn: 'Meteor Salvage',
    descAr: 'كل نيزك يمر بأمان دون لمسك يمنحك +20 نقطة إضافية فوراً',
    descEn: 'Awards +20 extra points for every safely dodged meteor',
    icon: '🪙',
    rarity: 'rare',
    apply: (s) => { s.salvageScorePerMeteor += 20; }
  },

  // ================= 8 EXCELLENT / EPIC ABILITIES (ممتاز) =================
  {
    id: 'e_recharging_aegis',
    nameAr: 'درع البلازما المتجدد',
    nameEn: 'Recharging Aegis',
    descAr: 'درع واقٍ يتجدد تلقائياً كل 40 ثانية دون الحاجة لكبسولات',
    descEn: 'Energy shield that automatically recharges every 40s',
    icon: '🔰',
    rarity: 'epic',
    apply: (s) => { s.shieldRegenInterval = 40; s.hasPermanentShield = true; }
  },
  {
    id: 'e_periodic_emp',
    nameAr: 'نبضة EMP الدورية',
    nameEn: 'Periodic EMP Pulse',
    descAr: 'إطلاق موجة كهرومغناطيسية كل 25 ثانية تدمر كل النيازك القريبة',
    descEn: 'Discharges an EMP wave every 25s destroying nearby meteors',
    icon: '💥',
    rarity: 'epic',
    apply: (s) => { s.periodicPulseInterval = 25; }
  },
  {
    id: 'e_absolute_zero',
    nameAr: 'التجميد النيوني الفائق',
    nameEn: 'Absolute Zero',
    descAr: 'إبطاء النيازك الضخمة والفائقة السرعة بنسبة 35%',
    descEn: 'Slows giant and fast dart meteors heavily by 35%',
    icon: '❄️',
    rarity: 'epic',
    apply: (s) => { s.bossFreeze = 0.35; }
  },
  {
    id: 'e_laser_interceptor',
    nameAr: 'مدفع الليزر الدفاعي',
    nameEn: 'Laser Interceptor',
    descAr: 'إطلاق شعاع ليزر تلقائي كل 2.5 ثانية لتفتيت أقرب نيزك خطر',
    descEn: 'Auto-fires a defense laser every 2.5s vaporizing nearest meteor',
    icon: '⚡',
    rarity: 'epic',
    apply: (s) => { s.laserInterceptor = true; }
  },
  {
    id: 'e_hyper_multiplier',
    nameAr: 'المضاعف الهائج',
    nameEn: 'Hyper Multiplier',
    descAr: 'مضاعفة النقاط x1.75 وزيادة نقاط Close Call بـ +250 نقطة',
    descEn: 'Score gain x1.75 and adds +250 points to every Close Call',
    icon: '👑',
    rarity: 'epic',
    apply: (s) => { s.scoreMultiplierBonus += 0.75; s.nearMissBonus += 250; }
  },
  {
    id: 'e_quantum_phase',
    nameAr: 'شبح الكوانتم النيوني',
    nameEn: 'Quantum Phase Shift',
    descAr: 'فرصة 25% لتجاوز أي اصطدام مميت بدون أي ضرر نهائياً',
    descEn: '25% chance to phase through any fatal collision unharmed',
    icon: '🌌',
    rarity: 'epic',
    apply: (s) => { s.quantumPhaseChance = 0.25; }
  },
  {
    id: 'e_hyper_siphon',
    nameAr: 'سيفون الطاقة الفائق',
    nameEn: 'Hyper Siphon',
    descAr: 'سحب مغناطيسي قوي يجذب جميع كبسولات الطاقة أينما ظهرت',
    descEn: 'Powerful cosmic vortex drawing all energy orbs immediately',
    icon: '🌀',
    rarity: 'epic',
    apply: (s) => { s.hyperSiphon = true; }
  },
  {
    id: 'e_twin_aegis',
    nameAr: 'الدرع المزدوج المقوى',
    nameEn: 'Twin Aegis Shield',
    descAr: 'درع مزدوج الطبقات يتحمل ضربتين كاملتين قبل الاختفاء',
    descEn: 'Reinforced twin shield absorbing 2 consecutive hits',
    icon: '🛡️🛡️',
    rarity: 'epic',
    apply: (s) => { s.twinAegis = true; s.hasPermanentShield = true; }
  },

  // ================= 6 LEGENDARY / MYTHIC ABILITIES (أسطوري) =================
  {
    id: 'l_plasma_blaster',
    nameAr: 'مدفع البلازما الكوني (الرصاص)',
    nameEn: 'Cosmic Plasma Blaster',
    descAr: 'إطلاق تلقائي لطلقات بلازما تدمر النيازك! النيزك الصغير السريع يموت بطلقة 1، والمتوسط بطلقتين، والعملاق بـ 4 طلقات.',
    descEn: 'Auto-fires continuous plasma bullets! Small fast meteors die in 1 hit, larger ones take 2-4 hits.',
    icon: '🔫💥',
    rarity: 'legendary',
    apply: (s) => {
      s.hasPlasmaBlaster = true;
      s.blasterFireRate = 4.5;
      s.blasterDamage = 1;
    }
  },
  {
    id: 'l_phoenix_revive',
    nameAr: 'بروتوكول خلود الفينيق',
    nameEn: 'Phoenix Protocol',
    descAr: 'إحياء فوري مجاني عند الخسارة مع انفجار يمسح الشاشة ومناعة 3.5 ثانية',
    descEn: 'Free instant resurrection upon death, clearing the screen + 3.5s immunity',
    icon: '🔥🦅',
    rarity: 'legendary',
    apply: (s) => { s.hasPhoenixRevive = true; s.phoenixUsed = false; }
  },
  {
    id: 'l_singularity_core',
    nameAr: 'مولد الثقب الأسود',
    nameEn: 'Singularity Core',
    descAr: 'توليد ثقب أسود تكتيكي كل 20 ثانية يبتلع جميع النيازك ويحولها لنقاط',
    descEn: 'Spawns a tactical black hole every 20s consuming all meteors',
    icon: '🕳️',
    rarity: 'legendary',
    apply: (s) => { s.singularityInterval = 20; }
  },
  {
    id: 'l_chronos_domain',
    nameAr: 'مجال كرونوس لتجميد الزمن',
    nameEn: 'Chronos Domain',
    descAr: 'تجميد كلي لحركة النيازك بنسبة 60% وزيادة سرعة المركبة للضعف',
    descEn: 'Freezes cosmic time by 60% while doubling your starship speed',
    icon: '⌛⚡',
    rarity: 'legendary',
    apply: (s) => { s.permanentSlowFactor *= 0.40; s.speedBoost += 0.50; }
  },
  {
    id: 'l_supernova_storm',
    nameAr: 'عاصفة البلازما السوبرنوفا',
    nameEn: 'Supernova Storm',
    descAr: 'كل 15 ثانية تنفجر شحنة بلازما شمسية تدمر جميع النيازك وتمنح +300 نقطة',
    descEn: 'Triggers a solar supernova every 15s destroying all meteors +300pts',
    icon: '☀️💥',
    rarity: 'legendary',
    apply: (s) => { s.supernovaInterval = 15; }
  },
  {
    id: 'l_godspeed_overdrive',
    nameAr: 'تريليون فولت النجمي',
    nameEn: 'Celestial Godspeed',
    descAr: 'مضاعفة نقاط الصمود x3، وتقليص حجم المركبة 25% مع مناورة خارقة',
    descEn: 'Score x3, ship size -25%, and lightning-speed warp dodging',
    icon: '⚡👑',
    rarity: 'legendary',
    apply: (s) => { s.scoreRateMultiplier *= 3; s.sizeScale *= 0.75; s.speedBoost += 0.6; }
  },
  {
    id: 'l_celestial_bastion',
    nameAr: 'حصن الحصانة السماوية',
    nameEn: 'Celestial Bastion',
    descAr: 'درع أسطوري يتجدد كل 18 ثانية مع مناعة تامة ضد النيازك السريعة',
    descEn: 'Legendary aegis recharging every 18s + immune to dart meteors',
    icon: '🌟🛡️',
    rarity: 'legendary',
    apply: (s) => { s.celestialBastion = true; s.shieldRegenInterval = 18; s.hasPermanentShield = true; }
  }
];

// Helper to roll 3 random distinct perks based on weighted probability
export function rollThreePerks(alreadyChosenIds: string[]): Perk[] {
  const availablePerks = ALL_PERKS.filter(p => !alreadyChosenIds.includes(p.id));
  const pool = availablePerks.length >= 3 ? availablePerks : ALL_PERKS;

  const selected: Perk[] = [];

  // 5% Special standalone chance for the ultra-rare Plasma Blaster to appear if not chosen yet
  const blasterPerk = pool.find(p => p.id === 'l_plasma_blaster');
  if (blasterPerk && Math.random() < 0.05) {
    selected.push(blasterPerk);
  }

  while (selected.length < 3) {
    // Roll rarity based on weights
    const roll = Math.random() * 100;
    let chosenRarity: PerkRarity = 'common';
    if (roll < 7) {
      chosenRarity = 'legendary';
    } else if (roll < 25) {
      chosenRarity = 'epic';
    } else if (roll < 55) {
      chosenRarity = 'rare';
    } else {
      chosenRarity = 'common';
    }

    // Filter by rarity
    let candidates = pool.filter(p => p.rarity === chosenRarity && !selected.some(s => s.id === p.id));
    if (candidates.length === 0) {
      candidates = pool.filter(p => !selected.some(s => s.id === p.id));
    }

    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      selected.push(pick);
    } else {
      break;
    }
  }

  return selected;
}

// 8 Background Galaxy Themes (Changes every 1000 points)
export const BACKGROUND_THEMES: BackgroundTheme[] = [
  {
    level: 1, // 0 - 999
    nameAr: 'سديم النيون الأزرق',
    nameEn: 'Cyber Blue Nebula',
    grad1: '#0d1838',
    grad2: '#050a18',
    grad3: '#020309',
    nebulaGlow: 'rgba(6, 182, 212, 0.25)',
    starColors: ['#ffffff', '#67e8f9', '#38bdf8', '#c084fc']
  },
  {
    level: 2, // 1000 - 1999
    nameAr: 'سديم البنفسج الفضائي',
    nameEn: 'Cosmic Violet Void',
    grad1: '#260a3a',
    grad2: '#12041d',
    grad3: '#05010a',
    nebulaGlow: 'rgba(168, 85, 247, 0.3)',
    starColors: ['#ffffff', '#c084fc', '#e879f9', '#a855f7']
  },
  {
    level: 3, // 2000 - 2999
    nameAr: 'سديم الجمر الأحمر',
    nameEn: 'Crimson Plasma Flare',
    grad1: '#3d0c15',
    grad2: '#1c0308',
    grad3: '#080103',
    nebulaGlow: 'rgba(239, 68, 68, 0.3)',
    starColors: ['#ffffff', '#fca5a5', '#f87171', '#fbbf24']
  },
  {
    level: 4, // 3000 - 3999
    nameAr: 'السديم الذهبي المشع',
    nameEn: 'Supernova Gold Domain',
    grad1: '#362406',
    grad2: '#180f02',
    grad3: '#080501',
    nebulaGlow: 'rgba(234, 179, 8, 0.3)',
    starColors: ['#ffffff', '#fef08a', '#fde047', '#fb923c']
  },
  {
    level: 5, // 4000 - 4999
    nameAr: 'سديم الزمرد الكوني',
    nameEn: 'Emerald Cyber Matrix',
    grad1: '#062d1f',
    grad2: '#02140d',
    grad3: '#010805',
    nebulaGlow: 'rgba(16, 185, 129, 0.3)',
    starColors: ['#ffffff', '#6ee7b7', '#34d399', '#a7f3d0']
  },
  {
    level: 6, // 5000 - 5999
    nameAr: 'سديم الفوشيا الكهربائي',
    nameEn: 'Electric Magenta Rift',
    grad1: '#3b0826',
    grad2: '#1a0311',
    grad3: '#070104',
    nebulaGlow: 'rgba(236, 72, 153, 0.35)',
    starColors: ['#ffffff', '#f472b6', '#ec4899', '#fbcfe8']
  },
  {
    level: 7, // 6000 - 6999
    nameAr: 'الأورورا القطبية الفضائية',
    nameEn: 'Polar Aurora Frost',
    grad1: '#072e36',
    grad2: '#021519',
    grad3: '#010708',
    nebulaGlow: 'rgba(20, 184, 166, 0.35)',
    starColors: ['#ffffff', '#5eead4', '#2dd4bf', '#99f6e4']
  },
  {
    level: 8, // 7000+
    nameAr: 'الفراغ اللانهائي الأسطوري',
    nameEn: 'Infinite Singularity Void',
    grad1: '#1a0b2e',
    grad2: '#0d0417',
    grad3: '#020104',
    nebulaGlow: 'rgba(217, 70, 239, 0.4)',
    starColors: ['#ffffff', '#f0abfc', '#67e8f9', '#fde047', '#f43f5e']
  }
];

export function getThemeForLevel(level: number): BackgroundTheme {
  const index = Math.max(0, Math.min(BACKGROUND_THEMES.length - 1, level - 1));
  return BACKGROUND_THEMES[index];
}

export function createInitialPerkState(): ActivePerkState {
  return {
    speedBoost: 1,
    scoreRateMultiplier: 1,
    sizeScale: 1,
    hitboxScale: 1,
    dangerRadar: false,
    nearMissBonus: 0,
    dropRateBoost: 0,
    meteorSpeedReduction: 0,

    hasPermanentShield: false,
    permanentSlowFactor: 1,
    scoreMultiplierBonus: 0,
    repulsorAura: false,
    powerUpDurationBoost: 1,
    dodgeReflexBlink: false,
    agilityBoost: 0,
    salvageScorePerMeteor: 0,

    shieldRegenTimer: 0,
    shieldRegenInterval: 0,
    periodicPulseTimer: 0,
    periodicPulseInterval: 0,
    bossFreeze: 0,
    laserInterceptor: false,
    laserTimer: 0,
    quantumPhaseChance: 0,
    hyperSiphon: false,
    twinAegis: false,

    singularityTimer: 0,
    singularityInterval: 0,
    hasPhoenixRevive: false,
    phoenixUsed: false,
    chronoDomainReady: false,
    supernovaTimer: 0,
    supernovaInterval: 0,
    godspeedMultiplier: 1,
    celestialBastion: false,

    hasPlasmaBlaster: false,
    blasterFireRate: 4,
    blasterDamage: 1,

    selectedPerkIds: []
  };
}
