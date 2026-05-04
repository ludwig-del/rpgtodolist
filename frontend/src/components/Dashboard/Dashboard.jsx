import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import HPBar from '../HPBar/HPBar';
import TodoList from '../TodoList/TodoList';
import PlayerLevel from '../PlayerLevel/PlayerLevel';
import LevelUpModal from '../LevelUpModal/LevelUpModal';
import Inventory from '../Inventory/Inventory';
import './Dashboard.css';

export default function Dashboard() {
  const { session, inventory } = useGame();
  const [imgError, setImgError]       = useState(false);
  const [xpGained, setXpGained]       = useState(0);
  const [showInventory, setShowInventory] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (!session) return null;

  const { boss, is_cleared } = session;

  return (
    <div className="dashboard">
      <LevelUpModal />
      {showInventory && <Inventory onClose={() => setShowInventory(false)} />}

      <nav className="dashboard__nav">
        <span className="dashboard__logo">RPG Todo List</span>
        <div className="dashboard__nav-right">
          <button
            className="dashboard__inv-btn"
            onClick={() => setShowInventory(true)}
            title="Item Collection"
          >
            🎒 Items {inventory.length > 0 && <span className="dashboard__inv-badge">{inventory.length}</span>}
          </button>
          <PlayerLevel xpGained={xpGained} />
        </div>
      </nav>

      <motion.div
        className="dashboard__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard__boss-section">
          {/* Boss portrait */}
          <div className="dashboard__boss-portrait">
            {imgError ? (
              <div className="dashboard__boss-portrait-placeholder">&#9760;</div>
            ) : (
              <img
                src={boss?.image_path}
                alt={boss?.name}
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* HP bar area */}
          <div className="dashboard__boss-info">
            <p className="dashboard__date">{today}</p>
            <h2 className="dashboard__boss-name">{boss?.name}</h2>
            <HPBar session={session} />
          </div>
        </div>

        <div className="gold-divider" />

        <AnimatePresence>
          {is_cleared && (
            <motion.div
              className="dashboard__victory"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <h2 className="dashboard__victory-title">GREAT ENEMY FELLED</h2>
              <p className="dashboard__victory-xp">
                +{session.boss?.difficulty_order} XP earned — Stage {session.boss?.difficulty_order}
              </p>
              <p className="dashboard__victory-sub">
                You may add more tasks to record them, but the quest is complete.
              </p>
              <div className="gold-divider" />
            </motion.div>
          )}
        </AnimatePresence>

        <TodoList sessionCleared={is_cleared} onXpGained={setXpGained} />
      </motion.div>
    </div>
  );
}
