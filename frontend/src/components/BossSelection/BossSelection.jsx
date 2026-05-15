import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import BossCard from '../BossCard/BossCard';
import './BossSelection.css';

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

export default function BossSelection() {
  const { bosses, chooseBoss } = useGame();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const selectedBoss = bosses.find(b => b.id === selectedId);

  const handleSelect = (id) => {
    setSelectedId(id);
    setError('');
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setError('');
    try {
      await chooseBoss(selectedId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to select boss. Try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="boss-selection">
      <header className="boss-selection__header">
        <p className="boss-selection__eyebrow">Daily Quest</p>
        <h1 className="boss-selection__title">Choose Your Adversary</h1>
        <p className="boss-selection__subtitle">
          The number of tasks required increases with each stage.
          <br />
          Defeat harder bosses to earn more XP.
        </p>
      </header>

      <div className="gold-divider" />

      <motion.div
        className="boss-selection__grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {bosses.map((boss) => (
          <motion.div key={boss.id} variants={cardVariants}>
            <BossCard
              boss={boss}
              onSelect={handleSelect}
              isSelected={boss.id === selectedId}
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedBoss && (
          <motion.div
            className="boss-selection__preview"
            key={selectedBoss.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="boss-selection__preview-name">{selectedBoss.name}</h2>
            <p className="boss-selection__preview-desc">{selectedBoss.description}</p>
            <p className="boss-selection__preview-req">
              Required Tasks &nbsp;—&nbsp; {selectedBoss.required_todos}
            </p>
            <button
              className="boss-selection__confirm-btn"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? 'Summoning...' : 'Begin the Fight'}
            </button>
            {error && <p className="boss-selection__error">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
