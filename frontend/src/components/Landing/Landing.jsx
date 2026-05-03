import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import './Landing.css';

export default function Landing() {
  const { session } = useGame();
  const navigate    = useNavigate();

  const handlePlay = () => {
    // If there's already a session today, go straight to dashboard
    navigate(session ? '/dashboard' : '/select');
  };

  return (
    <div className="landing">
      <motion.div
        className="landing__content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <p className="landing__eyebrow">Tarnished, rise</p>

        <h1 className="landing__title">ELDEN RING</h1>

        <p className="landing__subtitle">Daily Quest</p>

        <div className="landing__divider" />

        <motion.button
          className="landing__play-btn"
          onClick={handlePlay}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {session ? 'Continue Quest' : 'Play'}
        </motion.button>

        <p className="landing__hint">Choose your adversary &mdash; complete your tasks</p>
      </motion.div>
    </div>
  );
}
