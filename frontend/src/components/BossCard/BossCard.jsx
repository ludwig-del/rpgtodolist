import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import './BossCard.css';

const FADE_DURATION_MS = 800;

/**
 * BossCard — displays a single boss with:
 *  - Framer Motion scale/glow animation on hover
 *  - Theme audio that fades in on hover and fades out on leave
 *  - Image placeholder when asset is not yet present
 */
export default function BossCard({ boss, onSelect, isSelected }) {
  const audioRef  = useRef(null);
  const fadeTimer = useRef(null);
  const [imgError, setImgError] = useState(false);

  const fadeIn = useCallback(() => {
    if (!audioRef.current) return;
    clearInterval(fadeTimer.current);
    audioRef.current.volume = 0;
    audioRef.current.play().catch(() => {});          // autoplay policy guard
    let vol = 0;
    fadeTimer.current = setInterval(() => {
      vol = Math.min(vol + 0.05, 0.6);
      audioRef.current.volume = vol;
      if (vol >= 0.6) clearInterval(fadeTimer.current);
    }, FADE_DURATION_MS / 12);
  }, []);

  const fadeOut = useCallback(() => {
    if (!audioRef.current) return;
    clearInterval(fadeTimer.current);
    let vol = audioRef.current.volume;
    fadeTimer.current = setInterval(() => {
      vol = Math.max(vol - 0.05, 0);
      audioRef.current.volume = vol;
      if (vol <= 0) {
        clearInterval(fadeTimer.current);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, FADE_DURATION_MS / 12);
  }, []);

  const handleSelect = () => onSelect(boss.id);

  return (
    <motion.div
      className={`boss-card${isSelected ? ' boss-card--selected' : ''}`}
      onClick={handleSelect}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      onMouseEnter={fadeIn}
      onMouseLeave={fadeOut}
      onFocus={fadeIn}
      onBlur={fadeOut}
      tabIndex={0}
      role="button"
      aria-label={`Select ${boss.name} — requires ${boss.required_todos} task${boss.required_todos > 1 ? 's' : ''}`}
      aria-pressed={isSelected}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={boss.audio_path} loop preload="none" />

      <div className="boss-card__frame">
        {imgError ? (
          <div className="boss-card__placeholder">&#9760;</div>
        ) : (
          <img
            className="boss-card__image"
            src={boss.image_path}
            alt={boss.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className="boss-card__overlay" />
        <div className="boss-card__glow" />
        <span className="boss-card__audio-badge" aria-hidden="true">♪</span>
      </div>

      <div className="boss-card__info">
        <p className="boss-card__name">{boss.name}</p>
        <span className="boss-card__req">
          <span className="boss-card__req-icon">⚔</span>
          {boss.required_todos} {boss.required_todos === 1 ? 'Task' : 'Tasks'}
        </span>
      </div>
    </motion.div>
  );
}
