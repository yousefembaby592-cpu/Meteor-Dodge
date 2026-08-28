/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { PerkSelectionModal } from './components/PerkSelectionModal';
import { AbilityStatsSidebar } from './components/AbilityStatsSidebar';
import { GameStats, GameStatus, Language, Perk, ActivePerkState } from './types';
import { soundManager } from './utils/audio';
import { rollThreePerks, createInitialPerkState, getThemeForLevel } from './data/perks';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [difficulty, setDifficulty] = useState<'normal' | 'hyper'>('normal');
  const [lang, setLang] = useState<Language>('ar');
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getIsMuted());

  // Perk System State
  const [perkState, setPerkState] = useState<ActivePerkState>(createInitialPerkState);
  const [currentLevelChoices, setCurrentLevelChoices] = useState<Perk[]>([]);
  const [currentUpgradeLevel, setCurrentUpgradeLevel] = useState<number>(1);

  // Load high score from localStorage
  const [stats, setStats] = useState<GameStats>(() => {
    const savedHighScore = parseInt(localStorage.getItem('meteor_dodge_high_score') || '0', 10);
    return {
      score: 0,
      highScore: Number.isNaN(savedHighScore) ? 0 : savedHighScore,
      meteorsDodged: 0,
      nearMisses: 0,
      survivalTime: 0,
      speedMultiplier: 1,
      scoreMultiplier: 1,
      activePowerUp: null,
      themeLevel: 1,
      activePerks: []
    };
  });

  // Handle Return to Home Screen (Main Menu)
  const handleReturnHome = useCallback(() => {
    soundManager.stopBgm();
    soundManager.playClick();
    setStatus('idle');
    setPerkState(createInitialPerkState());
    setCurrentLevelChoices([]);
    setCurrentUpgradeLevel(1);
    setStats((prev) => ({
      ...prev,
      score: 0,
      survivalTime: 0,
      meteorsDodged: 0,
      nearMisses: 0,
      activePowerUp: null,
      activePerks: []
    }));
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    setStatus('gameover');
    setStats((prev) => {
      const nextHigh = Math.max(prev.highScore, prev.score);
      if (nextHigh > prev.highScore) {
        localStorage.setItem('meteor_dodge_high_score', String(nextHigh));
      }
      return {
        ...prev,
        highScore: nextHigh
      };
    });
  }, []);

  // Handle 1,000 Points Milestone Reach (Level Up Perk Trigger)
  const handleMilestoneReached = useCallback((reachedLevel: number) => {
    setStatus('level_up');
    setCurrentUpgradeLevel(reachedLevel);
    // Roll 3 distinct perks using the probability weights
    setPerkState((currentPerks) => {
      const rolled = rollThreePerks(currentPerks.selectedPerkIds);
      setCurrentLevelChoices(rolled);
      return currentPerks;
    });
  }, []);

  // Handle Perk Selection by the Player
  const handleSelectPerk = useCallback((chosenPerk: Perk) => {
    setPerkState((prev) => {
      const updated = { ...prev };
      // Apply the selected perk's mathematical bonus
      chosenPerk.apply(updated);
      updated.selectedPerkIds = [...updated.selectedPerkIds, chosenPerk.id];
      return updated;
    });

    setStats((prev) => ({
      ...prev,
      activePerks: [...(prev.activePerks || []), chosenPerk.id]
    }));

    // Resume playing smoothly
    setStatus('playing');
  }, []);

  // Start new game
  const handleStartGame = useCallback((diff: 'normal' | 'hyper' = 'normal') => {
    setDifficulty(diff);
    setPerkState(createInitialPerkState());
    setCurrentLevelChoices([]);
    setCurrentUpgradeLevel(1);

    setStats((prev) => ({
      ...prev,
      score: 0,
      meteorsDodged: 0,
      nearMisses: 0,
      survivalTime: 0,
      speedMultiplier: diff === 'hyper' ? 1.4 : 1,
      scoreMultiplier: 1,
      activePowerUp: null,
      themeLevel: 1,
      activePerks: []
    }));
    setStatus('playing');
  }, []);

  // Toggle Pause
  const handleTogglePause = useCallback(() => {
    soundManager.playClick();
    setStatus((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  }, []);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Toggle Language
  const handleToggleLang = useCallback(() => {
    soundManager.playClick();
    setLang((prev) => {
      const next = prev === 'ar' ? 'en' : 'ar';
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
      return next;
    });
  }, []);

  // Prevent default touch scrolling on mobile to keep game responsive
  useEffect(() => {
    const preventDefaultTouch = (e: TouchEvent) => {
      if (status === 'playing') {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefaultTouch);
  }, [status]);

  const currentTheme = getThemeForLevel(stats.themeLevel || 1);

  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center relative font-cairo select-none">
      {/* Outer Glow Backdrop for desktop simulation */}
      <div
        className="absolute inset-0 transition-colors duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${currentTheme.grad1}, ${currentTheme.grad2} 70%, #000000 100%)`
        }}
      />

      {/* Main Arcade Frame Container (Mobile Responsive 100% or Max Width on Desktop) */}
      <div
        id="arcade-container"
        className="relative w-full h-full sm:max-w-md sm:max-h-[920px] sm:h-[94vh] sm:rounded-3xl sm:border sm:border-cyan-500/30 sm:shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-black overflow-hidden flex flex-col"
      >
        {/* Top HUD */}
        <HUD
          stats={stats}
          status={status}
          isMuted={isMuted}
          lang={lang}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onToggleLang={handleToggleLang}
          onReturnHome={handleReturnHome}
        />

        {/* 2D Canvas Game Board */}
        <GameBoard
          status={status}
          difficulty={difficulty}
          lang={lang}
          stats={stats}
          perkState={perkState}
          onUpdateStats={setStats}
          onGameOver={handleGameOver}
          onMilestoneReached={handleMilestoneReached}
        />

        {/* Real-time Ability Stats Sidebar (Right Edge) */}
        {(status === 'playing' || status === 'paused' || status === 'level_up') && (
          <AbilityStatsSidebar
            perkState={perkState}
            stats={stats}
            lang={lang}
          />
        )}

        {/* Start Mission Screen */}
        {status === 'idle' && (
          <StartScreen
            stats={stats}
            lang={lang}
            onStart={handleStartGame}
          />
        )}

        {/* Game Over Screen */}
        {status === 'gameover' && (
          <GameOverModal
            stats={stats}
            lang={lang}
            onRestart={() => handleStartGame(difficulty)}
            onGoHome={handleReturnHome}
          />
        )}

        {/* Perk Selection Modal (Triggered every 1000 points) */}
        <PerkSelectionModal
          isOpen={status === 'level_up'}
          score={stats.score}
          level={currentUpgradeLevel}
          theme={getThemeForLevel(currentUpgradeLevel)}
          perks={currentLevelChoices}
          onSelectPerk={handleSelectPerk}
        />
      </div>
    </main>
  );
}
