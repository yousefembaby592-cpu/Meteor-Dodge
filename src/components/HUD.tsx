import React from 'react';
import { Volume2, VolumeX, Pause, Play, Shield, Zap, Sparkles, Globe, Award, Home } from 'lucide-react';
import { GameStats, GameStatus, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { BACKGROUND_THEMES } from '../data/perks';

interface HUDProps {
  stats: GameStats;
  status: GameStatus;
  isMuted: boolean;
  lang: Language;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onToggleLang: () => void;
  onReturnHome: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  status,
  isMuted,
  lang,
  onToggleMute,
  onTogglePause,
  onToggleLang,
  onReturnHome,
}) => {
  const t = getTranslation(lang);
  const isPlaying = status === 'playing' || status === 'level_up' || status === 'paused';
  const currentTheme = BACKGROUND_THEMES[Math.max(0, Math.min(BACKGROUND_THEMES.length - 1, (stats.themeLevel || 1) - 1))];

  return (
    <header className="absolute top-0 left-0 right-0 p-2 sm:p-4 z-20 pointer-events-none flex flex-col gap-1.5 sm:gap-2">
      {/* Top Bar Controls & Scores */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 max-w-2xl mx-auto w-full">
        {/* Left Side: Current Score, Level & Multiplier */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Home Button (Returns to Main Menu) */}
          <button
            id="hud-home-btn"
            onClick={onReturnHome}
            className="p-2 sm:p-2.5 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 hover:border-cyan-400 rounded-xl text-slate-300 hover:text-cyan-300 transition shadow-sm cursor-pointer"
            title={lang === 'ar' ? 'العودة للقائمة الرئيسية' : 'Return to Main Menu'}
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col">
            <span className="text-[10px] sm:text-xs text-cyan-400 font-semibold tracking-wider flex items-center gap-1">
              {t.score}
              {stats.themeLevel && stats.themeLevel > 1 && (
                <span className="text-[9px] sm:text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1 rounded border border-amber-500/40">
                  Lvl {stats.themeLevel}
                </span>
              )}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-orbitron text-base sm:text-2xl font-black text-white neon-glow-cyan tracking-wider">
                {stats.score.toLocaleString()}
              </span>
              {stats.scoreMultiplier > 1 && (
                <span className="font-orbitron text-[10px] sm:text-xs font-bold text-yellow-400 bg-yellow-400/20 border border-yellow-400/50 px-1 py-0.2 rounded animate-pulse">
                  x{stats.scoreMultiplier}
                </span>
              )}
            </div>
          </div>

          {/* High Score Pill */}
          <div className="hidden xs:flex bg-slate-900/70 backdrop-blur-md border border-amber-500/30 rounded-xl px-2 py-1 flex-col">
            <span className="text-[9px] text-amber-400/80 font-medium">
              {t.highScore}
            </span>
            <span className="font-orbitron text-xs sm:text-sm font-bold text-amber-300">
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto">
          {/* Active Perks Count Badge */}
          {stats.activePerks && stats.activePerks.length > 0 && (
            <div
              className="px-2 py-1 bg-slate-900/80 backdrop-blur-md border border-fuchsia-500/40 rounded-xl text-fuchsia-300 flex items-center gap-1 text-[11px] sm:text-xs font-bold shadow-[0_0_10px_rgba(217,70,239,0.2)]"
              title="القدرات المفعلة"
            >
              <Award className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>{stats.activePerks.length}</span>
            </div>
          )}

          {/* Language Toggle */}
          <button
            id="hud-lang-btn"
            onClick={onToggleLang}
            className="p-1.5 sm:px-2.5 sm:py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 hover:border-slate-500 rounded-xl text-slate-300 hover:text-white transition text-[11px] sm:text-xs font-bold font-orbitron flex items-center gap-1 cursor-pointer"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="hud-sound-btn"
            onClick={onToggleMute}
            className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 hover:border-cyan-500/50 rounded-xl text-slate-300 hover:text-cyan-400 transition cursor-pointer"
            title={isMuted ? t.soundOn : t.soundOff}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Pause Button (Only visible during gameplay) */}
          {status === 'playing' && (
            <button
              id="hud-pause-btn"
              onClick={onTogglePause}
              className="p-2 sm:p-2.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 hover:border-amber-500/50 rounded-xl text-slate-300 hover:text-amber-400 transition cursor-pointer"
              title={t.pause}
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {status === 'paused' && (
            <button
              id="hud-resume-btn"
              onClick={onTogglePause}
              className="p-2 sm:p-2.5 bg-emerald-950/80 hover:bg-emerald-900 backdrop-blur-md border border-emerald-500/50 rounded-xl text-emerald-400 animate-pulse transition cursor-pointer"
              title={t.resume}
            >
              <Play className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Speed Multiplier & Active Power-Up & Theme Badges */}
      {isPlaying && (
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full px-1">
          {/* Galaxy Theme Indicator */}
          <div className="flex items-center gap-1 bg-slate-950/75 backdrop-blur-sm border border-cyan-500/30 px-2 py-0.5 rounded-lg">
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: currentTheme.starColors[1] }} />
            <span className="text-[10px] sm:text-[11px] text-cyan-300 font-medium truncate max-w-[120px] sm:max-w-none">
              {lang === 'ar' ? currentTheme.nameAr : currentTheme.nameEn}
            </span>
          </div>

          {/* Speed / Danger Meter */}
          <div className="flex items-center gap-1 bg-slate-950/65 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded-lg">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] sm:text-[11px] text-slate-400">{t.maxSpeed}:</span>
            <span className="font-orbitron text-[11px] sm:text-xs font-bold text-yellow-300">
              {stats.speedMultiplier.toFixed(1)}x
            </span>
          </div>

          {/* Active Power-up Progress Pill */}
          {stats.activePowerUp && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-pink-500/50 px-2 py-0.5 rounded-lg shadow-[0_0_10px_rgba(236,72,153,0.3)] animate-pulse">
              {stats.activePowerUp.type === 'shield' && <Shield className="w-3 h-3 text-cyan-400" />}
              {stats.activePowerUp.type === 'slow_motion' && <Sparkles className="w-3 h-3 text-purple-400" />}
              {stats.activePowerUp.type === 'double_score' && <Zap className="w-3 h-3 text-yellow-400" />}
              <span className="font-orbitron text-[11px] sm:text-xs font-bold text-pink-300">
                {stats.activePowerUp.remaining.toFixed(1)}s
              </span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
