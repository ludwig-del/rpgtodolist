import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import './LevelUpModal.css';

const RARITY_LABELS = {
  common:    'Common',
  uncommon:  'Uncommon',
  rare:      'Rare',
  epic:      'Epic',
  legendary: 'Legendary',
};

export default function LevelUpModal() {
  const { levelUpItem, level, clearLevelUp } = useGame();

  return (
    <AnimatePresence>
      {levelUpItem && (
        <motion.div
          className="levelup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearLevelUp}
        >
          <motion.div
            className="levelup-modal"
            initial={{ scale: 0.7, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={e => e.stopPropagation()}
          >
            <p className="levelup__eyebrow">Achievement Unlocked</p>
            <h2 className="levelup__level-title">LEVEL {level}</h2>

            <div className="gold-divider" />

            <p className="levelup__item-label">Item Obtained</p>

            <div className={`levelup__item levelup__item--${levelUpItem.rarity}`}>
              <span className="levelup__item-icon">{levelUpItem.icon}</span>
              <div className="levelup__item-details">
                <p className="levelup__item-name">{levelUpItem.name}</p>
                <p className={`levelup__item-rarity levelup__rarity--${levelUpItem.rarity}`}>
                  {RARITY_LABELS[levelUpItem.rarity]}
                </p>
                <p className="levelup__item-desc">{levelUpItem.description}</p>
              </div>
            </div>

            <button className="levelup__close-btn" onClick={clearLevelUp}>
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
