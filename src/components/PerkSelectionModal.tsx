import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Perk, BackgroundTheme } from '../types';
import { RARITY_INFO } from '../data/perks';
import { soundManager } from '../utils/audio';
import { Sparkles, Zap, Shield, Star, Award } from 'lucide-react';

interface PerkSelectionModalProps {
  isOpen: boolean;
  score: number;
  level: number;
  theme: BackgroundTheme;
  perks: Perk[];
  onSelectPerk: (perk: Perk) => void;
}

export const PerkSelectionModal: React.FC<PerkSelectionModalProps> = ({
  isOpen,
  score,
  level,
  theme,
  perks,
  onSelectPerk,
}) => {
  if (!isOpen || perks.length === 0) return null;

  const handleSelect = (perk: Perk) => {
    soundManager.playPerkSelect();
    onSelectPerk(perk);
  };

  return (
    <AnimatePresence>
      <div
        id="perk-selection-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="perk-selection-container"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl bg-slate-950/95 border border-cyan-500/40 rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: `0 0 60px ${theme.nebulaGlow || 'rgba(6, 182, 212, 0.3)'}, inset 0 0 30px rgba(0,0,0,0.8)`
          }}
        >
          {/* Background Ambient Glow */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ background: theme.grad1 }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ background: theme.grad2 }}
          />

          {/* Header */}
          <div className="relative z-10 text-center mb-3 sm:mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-yellow-500/50 text-yellow-300 font-bold text-[11px] sm:text-xs md:text-sm mb-2 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin text-yellow-400" />
              <span>إنجاز مستوى جديد: {score.toLocaleString()} نقطة!</span>
            </motion.div>

            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 tracking-wide mb-1">
              اختر قدرتك الفضائية المطورة ⚡
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
              <span>انتقلت مركبتك إلى:</span>
              <span
                className="px-2 py-0.5 rounded font-bold text-cyan-200 border border-cyan-500/40 text-xs sm:text-sm"
                style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}
              >
                {theme.nameAr}
              </span>
              <span>(المستوى {level})</span>
            </p>

            {/* Rarity & Drop Probability Legend (Compact on Mobile) */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap text-[10px] sm:text-xs">
              <span className="text-slate-400 font-medium ml-1 hidden xs:inline">نسب الحظ:</span>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold">عادي: 45%</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-bold">جيد: 30%</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold">ممتاز: 18%</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-950/60 border border-pink-500/40 text-pink-300">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                <span className="font-bold">أسطوري: 7%</span>
              </div>
            </div>
          </div>

          {/* 3 Perk Choice Cards Grid - Displayed Horizontally Side-by-Side on Phone and Desktop */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:gap-5 relative z-10 my-1 sm:my-3">
            {perks.map((perk, index) => {
              const rarityMeta = RARITY_INFO[perk.rarity];

              return (
                <motion.button
                  key={perk.id}
                  id={`perk-card-${perk.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.08, type: 'spring' }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(perk)}
                  className="group relative flex flex-col justify-between text-right p-2.5 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer h-full"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: rarityMeta.borderColor,
                    boxShadow: `0 0 16px ${rarityMeta.bgGlow}`
                  }}
                >
                  {/* Subtle hover gradient wash */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at top, ${rarityMeta.color}, transparent 70%)`
                    }}
                  />

                  {/* Card Top: Badge & Icon (Smaller Icons as requested) */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2.5">
                      <span
                        className={`text-[9px] sm:text-[10px] md:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-full border ${rarityMeta.badgeBg}`}
                      >
                        {rarityMeta.nameAr} • {rarityMeta.probability}%
                      </span>
                      <span className="text-xl sm:text-2xl md:text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                        {perk.icon}
                      </span>
                    </div>

                    <h3
                      className="text-xs sm:text-base md:text-lg font-black mb-0.5 transition-colors leading-tight line-clamp-1 sm:line-clamp-none"
                      style={{ color: rarityMeta.color }}
                    >
                      {perk.nameAr}
                    </h3>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-slate-400 font-mono tracking-tight mb-1.5 sm:mb-2.5 truncate">
                      {perk.nameEn}
                    </p>

                    <p className="text-[10px] sm:text-xs md:text-sm text-slate-200 leading-snug sm:leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {perk.descAr}
                    </p>
                  </div>

                  {/* Card Bottom CTA Button */}
                  <div className="mt-2 sm:mt-4 pt-1.5 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[9px] sm:text-xs text-slate-400 group-hover:text-white transition-colors font-medium">
                      تفعيل
                    </span>
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full border transition-transform group-hover:translate-x-[-2px]"
                      style={{
                        backgroundColor: rarityMeta.bgGlow,
                        borderColor: rarityMeta.borderColor,
                        color: rarityMeta.color
                      }}
                    >
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="text-center mt-2 sm:mt-4 text-[10px] sm:text-xs text-slate-400 font-mono">
            انقر على إحدى البطاقات الثلاث لتجهيزها ومتابعة اللعبة
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
