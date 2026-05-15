import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ITEMS } from '../../data/items';
import './Inventory.css';

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
const RARITY_LABELS = { legendary: 'Legendary', epic: 'Epic', rare: 'Rare', uncommon: 'Uncommon', common: 'Common' };

export default function Inventory({ onClose }) {
  const { inventory } = useGame();

  // count how many times each item id was obtained
  const counts = {};
  for (const entry of inventory) {
    counts[entry.id] = (counts[entry.id] || 0) + 1;
  }

  const totalOwned  = Object.keys(counts).length;
  const totalItems  = ITEMS.length;

  return (
    <AnimatePresence>
      <motion.div
        className="inv-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="inv-panel"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: 40,    opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="inv-header">
            <div>
              <p className="inv-eyebrow">Compendium</p>
              <h2 className="inv-title">Item Collection</h2>
            </div>
            <div className="inv-header-right">
              <span className="inv-count">{totalOwned} / {totalItems} found</span>
              <button className="inv-close-btn" onClick={onClose} aria-label="Close">✕</button>
            </div>
          </div>

          <div className="gold-divider" />

          <div className="inv-body">
            {RARITY_ORDER.map(rarity => {
              const group = ITEMS.filter(i => i.rarity === rarity);
              return (
                <div key={rarity} className="inv-group">
                  <p className={`inv-group-label inv-group-label--${rarity}`}>
                    {RARITY_LABELS[rarity]}
                  </p>
                  <div className="inv-grid">
                    {group.map(item => {
                      const count = counts[item.id] || 0;
                      const owned = count > 0;
                      return (
                        <div
                          key={item.id}
                          className={`inv-card inv-card--${item.rarity}${owned ? '' : ' inv-card--locked'}`}
                          title={owned ? item.description : '???'}
                        >
                          <span className="inv-card-icon">{owned ? item.icon : '🔒'}</span>
                          <p className="inv-card-name">{owned ? item.name : '???'}</p>
                          {owned && count > 1 && (
                            <span className="inv-card-count">×{count}</span>
                          )}
                          {owned && (
                            <p className="inv-card-desc">{item.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
