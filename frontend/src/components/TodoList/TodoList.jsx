import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import './TodoList.css';

function TodoItem({ todo, onTick, onDelete, disabled }) {
  const isDone = todo.status === 'done';

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

      <span className="todo-item__text">{todo.task_name}</span>

      {!isDone && (
        <button
          className="todo-item__delete-btn"
          onClick={() => onDelete(todo.id)}
          aria-label={`Delete: ${todo.task_name}`}
          title="Remove task"
        >
          ✕
        </button>
      )}
    </motion.li>
  );
}

export default function TodoList({ sessionCleared }) {
  const { todos, addTodo, completeTodo, removeTodo } = useGame();
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
      await completeTodo(id);
    } finally {
      setTicking(null);
    }
  };

  const handleDelete = async (id) => {
    await removeTodo(id);
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
                disabled={ticking === todo.id}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
