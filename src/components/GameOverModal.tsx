import React, { useEffect } from 'react';
import { RotateCcw, Trophy, Timer, ShieldAlert, Sparkles, Flame, Award, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameStats, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { soundManager } from '../utils/audio';
import { BACKGROUND_THEMES, ALL_PERKS } from '../data/perks';

interface GameOverModalProps {
  stats: GameStats;
  lang: Language;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  lang,
  onRestart,
  onGoHome,
}) => {
  const t = getTranslation(lang);
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;
  const currentTheme = BACKGROUND_THEMES[Math.max(0, Math.min(BACKGROUND_THEMES.length - 1, (stats.themeLevel || 1) - 1))];
  const acquiredPerks = (stats.activePerks || []).map(id => ALL_PERKS.find(p => p.id === id)).filter(Boolean);

  useEffect(() => {
    if (isNewHighScore) {
      soundManager.playHighScore();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#ec4899', '#eab308', '#3b82f6']
        });
      } catch {
        // confetti fallback
      }
    }
  }, [isNewHighScore]);

  return (
    <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="game-over-dialog"
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-red-500/40 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(239,68,68,0.25)] flex flex-col items-center text-center relative overflow-hidden my-auto"
      >
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-amber-500" />

        {/* Title */}
        <div className="mb-3">
          <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mb-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-7 h-7 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            {t.gameOver}
          </h2>
          <p className="text-xs font-orbitron text-red-400 font-bold tracking-widest uppercase mt-0.5">
            Mission Terminated
          </p>
        </div>

        {/* New High Score Banner */}
        {isNewHighScore && (
          <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-yellow-500/50 rounded-xl py-2 px-3 mb-3 flex items-center justify-center gap-2 text-yellow-300 font-bold text-xs animate-pulse">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>{t.newHighScore}</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
        )}

        {/* Main Score & Galaxy Level Display */}
        <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 mb-3 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
            <span className="font-semibold">{t.score}</span>
            <span className="text-cyan-300 font-bold">
              المستوى {stats.themeLevel || 1}: {currentTheme.nameAr}
            </span>
          </div>
          <div className="font-orbitron text-3xl sm:text-4xl font-black text-cyan-300 neon-glow-cyan my-1 tracking-wider">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-medium">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t.highScore}:</span>
            <span className="font-orbitron font-bold">{stats.highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>{t.meteorsDodged}</span>
            </div>
            <span className="font-orbitron text-sm sm:text-base font-bold text-slate-200">
              {stats.meteorsDodged}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>{t.nearMisses}</span>
            </div>
            <span className="font-orbitron text-sm sm:text-base font-bold text-pink-400">
              {stats.nearMisses}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Timer className="w-3 h-3 text-cyan-400" />
              <span>{t.timeSurvived}</span>
            </div>
            <span className="font-orbitron text-sm sm:text-base font-bold text-slate-200">
              {Math.floor(stats.survivalTime)}{t.seconds}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
              <Award className="w-3 h-3 text-fuchsia-400" />
              <span>القدرات المفعلة</span>
            </div>
            <span className="font-orbitron text-sm sm:text-base font-bold text-fuchsia-400">
              {acquiredPerks.length}
            </span>
          </div>
        </div>

        {/* Acquired Perks Preview if any */}
        {acquiredPerks.length > 0 && (
          <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 mb-3.5 text-right">
            <div className="text-[11px] text-slate-400 font-bold mb-1.5 flex items-center justify-between">
              <span>القدرات التي تم جمعها:</span>
              <span className="text-xs text-fuchsia-400 font-orbitron">{acquiredPerks.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {acquiredPerks.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200"
                >
                  <span>{p?.icon}</span>
                  <span>{p?.nameAr}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons: 1-Tap Play Again & Main Menu */}
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <button
            id="game-over-replay-btn"
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-base rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.5)] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>

          <button
            id="game-over-home-btn"
            onClick={() => {
              soundManager.playClick();
              onGoHome();
            }}
            className="py-3 px-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 active:scale-95 text-slate-300 hover:text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
