import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import './TodoList.css';

function TodoItem({ todo, onTick, onDelete, onRename, disabled }) {
  const isDone = todo.status === 'done';
  const [editing, setEditing]   = useState(false);
  const [editVal, setEditVal]   = useState(todo.task_name);
  const [saving, setSaving]     = useState(false);

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    const trimmed = editVal.trim();
    if (!trimmed || trimmed === todo.task_name) { setEditing(false); return; }
    setSaving(true);
    try {
      await onRename(todo.id, trimmed);
      setEditing(false);
    } catch {
      setEditVal(todo.task_name);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.li
      className={`todo-item${isDone ? ' todo-item--done' : ''}`}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
    >
      <button
        className={`todo-item__check${isDone ? ' todo-item__check--done' : ''}`}
        onClick={() => !isDone && onTick(todo.id)}
        disabled={isDone || disabled}
        aria-label={isDone ? 'Task complete' : `Complete: ${todo.task_name}`}
        title={isDone ? 'Done' : 'Mark complete'}
      >
        {isDone && <span className="todo-item__check-icon">✓</span>}
      </button>

      {editing ? (
        <form className="todo-item__rename-form" onSubmit={handleRenameSubmit}>
          <input
            className="todo-item__rename-input"
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={handleRenameSubmit}
            autoFocus
            maxLength={255}
            disabled={saving}
          />
        </form>
      ) : (
        <span
          className="todo-item__text"
          title={isDone ? undefined : 'Double-click to rename'}
          onDoubleClick={() => { if (!isDone) { setEditVal(todo.task_name); setEditing(true); } }}
        >
          {todo.task_name}
        </span>
      )}

      {!isDone && !editing && (
        <div className="todo-item__actions">
          <button
            className="todo-item__edit-btn"
            onClick={() => { setEditVal(todo.task_name); setEditing(true); }}
            aria-label={`Rename: ${todo.task_name}`}
            title="Rename task"
          >
            ✎
          </button>
          <button
            className="todo-item__delete-btn"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete: ${todo.task_name}`}
            title="Remove task"
          >
            ✕
          </button>
        </div>
      )}
    </motion.li>
  );
}

export default function TodoList({ sessionCleared, onXpGained }) {
  const { todos, addTodo, completeTodo, removeTodo, renameTodo } = useGame();
  const [taskName, setTaskName] = useState('');
  const [adding, setAdding]     = useState(false);
  const [ticking, setTicking]   = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    setAdding(true);
    try {
      await addTodo(taskName.trim());
      setTaskName('');
    } finally {
      setAdding(false);
    }
  };

  const handleTick = async (id) => {
    setTicking(id);
    try {
      const data = await completeTodo(id);
      if (data.boss_defeated && onXpGained) {
        const earned = data.session.boss?.difficulty_order || 1;
        onXpGained(earned);
        setTimeout(() => onXpGained(0), 3000);
      }
    } finally {
      setTicking(null);
    }
  };

  const handleDelete = async (id) => {
    await removeTodo(id);
  };

  const handleRename = async (id, name) => {
    await renameTodo(id, name);
  };

  return (
    <div className="todo-list">
      {sessionCleared && (
        <div className="todo-list__cleared-notice">
          Quest Complete — All tasks vanquished
        </div>
      )}

      <form className="todo-list__add-form" onSubmit={handleAdd}>
        <input
          className="todo-list__input"
          type="text"
          placeholder="Describe your task..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          maxLength={255}
          disabled={adding}
        />
        <button
          type="submit"
          className="todo-list__add-btn"
          disabled={adding || !taskName.trim()}
        >
          + Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="todo-list__empty">No tasks yet. Add one to begin the assault.</p>
      ) : (
        <ul className="todo-list__items">
          <AnimatePresence>
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onTick={handleTick}
                onDelete={handleDelete}
                onRename={handleRename}
                disabled={ticking === todo.id}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
