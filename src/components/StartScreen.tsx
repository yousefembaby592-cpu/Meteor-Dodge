import React, { useState } from 'react';
import { Rocket, Trophy, Sparkles, HelpCircle, Flame, Shield, ArrowRightLeft, Zap, Award } from 'lucide-react';
import { GameStats, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { soundManager } from '../utils/audio';

interface StartScreenProps {
  stats: GameStats;
  lang: Language;
  onStart: (difficulty: 'normal' | 'hyper') => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  stats,
  lang,
  onStart,
}) => {
  const t = getTranslation(lang);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [difficulty, setDifficulty] = useState<'normal' | 'hyper'>('normal');

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        id="start-screen-card"
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        {/* Animated Spaceship Icon Hero */}
        <div className="relative mb-3 mt-1">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full blur-md opacity-40 animate-pulse" />
          <div className="relative p-4 rounded-full bg-slate-950 border border-cyan-400/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Rocket className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="text-3xl font-black text-white tracking-wide neon-glow-cyan">
          {t.title}
        </h1>
        <p className="text-xs font-orbitron text-pink-400 font-bold tracking-widest uppercase mt-0.5 mb-2">
          {t.subtitle}
        </p>

        {/* 1000 Pts Upgrade System Banner */}
        <div className="w-full bg-gradient-to-r from-purple-950/60 via-fuchsia-950/60 to-cyan-950/60 border border-purple-500/40 rounded-xl py-1.5 px-2.5 mb-3 flex items-center justify-center gap-1.5 text-[11px] text-purple-200">
          <Award className="w-3.5 h-3.5 text-fuchsia-400" />
          <span>تطور كل 1000 نقطة: 30 قدرة خارقة ومجرات كونية متجددة!</span>
        </div>

        {/* High Score Badge */}
        {stats.highScore > 0 && (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl py-1.5 px-3 mb-3 flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{t.highScore}:</span>
            <span className="font-orbitron font-black text-sm text-amber-200">
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        )}

        {/* Difficulty Selector */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 mb-3.5 flex gap-1">
          <button
            onClick={() => {
              soundManager.playClick();
              setDifficulty('normal');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              difficulty === 'normal'
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.diffNormal}</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setDifficulty('hyper');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              difficulty === 'hyper'
                ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t.diffHyper}</span>
          </button>
        </div>

        {/* How to Play Collapse */}
        {showHowToPlay ? (
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 mb-3 text-start text-xs space-y-1.5 text-slate-300 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>{t.howToPlay}</span>
            </div>
            <p className="text-[11px] leading-relaxed">• {t.rule1}</p>
            <p className="text-[11px] leading-relaxed">• {t.rule2}</p>
            <p className="text-[11px] leading-relaxed">• {t.rule3}</p>
            <p className="text-[11px] leading-relaxed">• كل 1000 نقطة يتغير لون الفضاء وتختار من 3 قدرات خارقة (مع درع حماية ثانيتان وتفجير النيازك القريبة).</p>
          </div>
        ) : (
          <div className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 mb-3 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{t.controlsHint}</span>
          </div>
        )}

        {/* Start Game Button */}
        <button
          id="start-mission-btn"
          onClick={() => {
            soundManager.playClick();
            onStart(difficulty);
          }}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-95 text-white font-black text-lg rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.6)] transition flex items-center justify-center gap-2 cursor-pointer mb-2"
        >
          <Rocket className="w-5 h-5" />
          <span>{t.startMission}</span>
        </button>

        {/* Bottom Instructions Toggle */}
        <div className="w-full flex items-center justify-center pt-1 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1 cursor-pointer py-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHowToPlay ? 'إخفاء التعليمات' : t.howToPlay}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
