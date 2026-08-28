import React, { useState } from 'react';
import { ActivePerkState, GameStats, Language } from '../types';
import { Shield, Zap, Sparkles, Crosshair, Flame, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface AbilityStatsSidebarProps {
  perkState: ActivePerkState;
  stats: GameStats;
  lang: Language;
}

export const AbilityStatsSidebar: React.FC<AbilityStatsSidebarProps> = ({
  perkState,
  stats,
  lang,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Compute live percentages
  const speedPct = Math.round(((perkState.speedBoost + perkState.agilityBoost) - 1) * 100);
  const slowPct = Math.round((1 - perkState.permanentSlowFactor * (1 - perkState.meteorSpeedReduction)) * 100);
  const hitboxReductionPct = Math.round((1 - perkState.hitboxScale) * 100);
  const scoreBonusPct = Math.round((perkState.scoreRateMultiplier - 1 + perkState.scoreMultiplierBonus) * 100);

  const hasAnyBoost =
    speedPct > 0 ||
    slowPct > 0 ||
    hitboxReductionPct > 0 ||
    scoreBonusPct > 0 ||
    perkState.hasPermanentShield ||
    perkState.hasPlasmaBlaster ||
    perkState.hasPhoenixRevive;

  // Render shield status text
  let shieldText = lang === 'ar' ? 'غير مفعل' : 'None';
  if (perkState.twinAegis) {
    shieldText = lang === 'ar' ? 'درع مضاعف' : 'Twin Aegis';
  } else if (perkState.shieldRegenInterval > 0) {
    shieldText = lang === 'ar' ? `متجدد (${perkState.shieldRegenInterval}ث)` : `Regen (${perkState.shieldRegenInterval}s)`;
  } else if (perkState.hasPermanentShield) {
    shieldText = lang === 'ar' ? 'درع طاقة' : 'Active';
  }

  return (
    <aside
      id="ability-stats-sidebar"
      className="absolute right-1 sm:right-2 top-24 z-20 flex flex-col items-end select-none pointer-events-auto transition-all duration-300"
    >
      {/* Toggle button on mobile / compact bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[10px] sm:text-xs font-bold py-1 px-1.5 sm:px-2 rounded-l-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] transition cursor-pointer mb-1"
        title="نسب تعزيز القدرات / Ability Boost Percentages"
      >
        <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span className="font-orbitron tracking-wider">
          {hasAnyBoost ? (lang === 'ar' ? 'القدرات' : 'PERKS') : (lang === 'ar' ? 'القدرات 0%' : '0%')}
        </span>
        {isOpen ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Mini Stat Strip (Always visible compact badges on the side) */}
      {!isOpen && (
        <div className="flex flex-col gap-1 items-end opacity-90 hover:opacity-100 transition">
          {speedPct > 0 && (
            <div
              className="bg-slate-950/85 border border-cyan-500/50 text-cyan-300 text-[9px] sm:text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded-l-md shadow-sm flex items-center gap-1"
              title="سرعة الحركة والمناورة"
            >
              <span>⚡</span>
              <span>+{speedPct}%</span>
            </div>
          )}

          {slowPct > 0 && (
            <div
              className="bg-slate-950/85 border border-purple-500/50 text-purple-300 text-[9px] sm:text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded-l-md shadow-sm flex items-center gap-1"
              title="إبطاء سرعة النيازك"
            >
              <span>⏳</span>
              <span>-{slowPct}%</span>
            </div>
          )}

          {perkState.hasPermanentShield && (
            <div
              className="bg-slate-950/85 border border-blue-500/50 text-blue-300 text-[9px] sm:text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded-l-md shadow-sm flex items-center gap-1"
              title="درع الحماية"
            >
              <span>🛡️</span>
              <span>{perkState.twinAegis ? 'x2' : 'OK'}</span>
            </div>
          )}

          {hitboxReductionPct > 0 && (
            <div
              className="bg-slate-950/85 border border-emerald-500/50 text-emerald-300 text-[9px] sm:text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded-l-md shadow-sm flex items-center gap-1"
              title="تقليص منطقة الاصطدام"
            >
              <span>🎯</span>
              <span>-{hitboxReductionPct}%</span>
            </div>
          )}

          {perkState.hasPlasmaBlaster && (
            <div
              className="bg-pink-950/90 border border-pink-500 text-pink-200 text-[9px] sm:text-[10px] font-orbitron font-extrabold px-1.5 py-0.5 rounded-l-md shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse flex items-center gap-1"
              title="المدفع البلازمي التلقائي"
            >
              <span>🔫</span>
              <span>BLAST</span>
            </div>
          )}
        </div>
      )}

      {/* Expanded Detailed Breakdown Box */}
      {isOpen && (
        <div className="w-48 sm:w-56 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/50 rounded-l-2xl p-2.5 shadow-[0_0_25px_rgba(6,182,212,0.35)] text-right flex flex-col gap-1.5 text-xs text-slate-200 animate-fadeIn">
          <div className="text-[11px] font-bold text-cyan-300 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span className="font-orbitron text-xs">STAT BOOSTS</span>
            <span>نسب تعزيز القدرات</span>
          </div>

          {/* Speed Boost */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-1 text-slate-300">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px]">سرعة المركبة:</span>
            </div>
            <span className={`font-orbitron font-bold text-xs ${speedPct > 0 ? 'text-cyan-300' : 'text-slate-500'}`}>
              +{speedPct}%
            </span>
          </div>

          {/* Meteor Slowdown */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[11px]">إبطاء النيازك:</span>
            </div>
            <span className={`font-orbitron font-bold text-xs ${slowPct > 0 ? 'text-purple-300' : 'text-slate-500'}`}>
              -{slowPct}%
            </span>
          </div>

          {/* Hitbox Safety Reduction */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-1 text-slate-300">
              <Crosshair className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px]">منطقة الاصطدام:</span>
            </div>
            <span className={`font-orbitron font-bold text-xs ${hitboxReductionPct > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>
              -{hitboxReductionPct}%
            </span>
          </div>

          {/* Score Multiplier Bonus */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-1 text-slate-300">
              <Flame className="w-3 h-3 text-amber-400" />
              <span className="text-[11px]">مضاعفة النقاط:</span>
            </div>
            <span className={`font-orbitron font-bold text-xs ${scoreBonusPct > 0 ? 'text-amber-300' : 'text-slate-500'}`}>
              +{scoreBonusPct}% (x{stats.scoreMultiplier})
            </span>
          </div>

          {/* Shield Status */}
          <div className="flex items-center justify-between py-0.5 border-t border-slate-800/80 pt-1">
            <div className="flex items-center gap-1 text-slate-300">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-[11px]">حالة الدرع:</span>
            </div>
            <span className={`font-semibold text-[10px] ${perkState.hasPermanentShield ? 'text-blue-300' : 'text-slate-500'}`}>
              {shieldText}
            </span>
          </div>

          {/* Special Weapon / Super perks status */}
          {perkState.hasPlasmaBlaster && (
            <div className="bg-pink-950/60 border border-pink-500/40 rounded-lg p-1 text-[10px] text-pink-300 flex items-center justify-between">
              <span>🔫 مدفع البلازما (5%):</span>
              <span className="font-bold text-pink-400">1-4 ضربات</span>
            </div>
          )}

          {perkState.hasPhoenixRevive && (
            <div className="bg-amber-950/60 border border-amber-500/40 rounded-lg p-1 text-[10px] text-amber-300 flex items-center justify-between">
              <span>🦅 خلود الفينيق:</span>
              <span className="font-bold text-amber-400">{perkState.phoenixUsed ? 'مستخدم' : 'جاهز'}</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
