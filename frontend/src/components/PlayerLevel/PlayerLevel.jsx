import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import './PlayerLevel.css';

export default function PlayerLevel({ xpGained = 0 }) {
  const { level, xpInLevel, xpPerLevel } = useGame();

  const progress = (xpInLevel / xpPerLevel) * 100;

  return (
    <div className="player-level">
      <div className="player-level__badge">
        <span className="player-level__label">LVL</span>
        <motion.span
          className="player-level__number"
          key={level}
          initial={{ scale: 1.6, color: '#e8d48b' }}
          animate={{ scale: 1,   color: '#c9a84c' }}
          transition={{ duration: 0.4 }}
        >
          {level}
        </motion.span>
      </div>

      <div className="player-level__right">
        <div className="player-level__xp-track" title={`${xpInLevel} / ${xpPerLevel} XP`}>
          <motion.div
            className="player-level__xp-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="player-level__meta">
          <span className="player-level__xp-text">{xpInLevel} / {xpPerLevel} XP</span>
          {xpGained > 0 && (
            <motion.span
              className="player-level__xp-gained"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              +{xpGained} XP
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
