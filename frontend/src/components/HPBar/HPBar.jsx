import React from 'react';
import { motion } from 'framer-motion';
import './HPBar.css';

/**
 * Renders the boss HP bar.
 * hp_percentage comes directly from the session payload (0–100).
 */
export default function HPBar({ session }) {
  if (!session) return null;

  const { boss, hp_percentage, current_todos_done, required_todos, is_cleared } = session;

  return (
    <div className={`hp-bar-wrapper${is_cleared ? ' hp-bar--cleared' : ''}`}>
      <div className="hp-bar-header">
        <span className="hp-bar-boss-name">{boss?.name}</span>
        <span className="hp-bar-label">HP</span>
      </div>

      <div className="hp-bar-track" role="progressbar"
        aria-valuenow={Math.round(hp_percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${boss?.name} HP: ${Math.round(hp_percentage)}%`}
      >
        <motion.div
          className="hp-bar-fill"
          initial={{ width: '100%' }}
          animate={{ width: `${hp_percentage}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Segment dividers — one per required task */}
        <div className="hp-bar-segments">
          {Array.from({ length: required_todos }).map((_, i) => (
            <div key={i} className="hp-bar-segment" />
          ))}
        </div>
      </div>

      {is_cleared ? (
        <p className="hp-bar-defeated-text">&#10022; Boss Defeated &#10022;</p>
      ) : (
        <p className="hp-bar-progress-text">
          {current_todos_done} / {required_todos} tasks completed
        </p>
      )}
    </div>
  );
}
