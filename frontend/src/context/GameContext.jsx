import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import * as api from '../services/api';
import { rollItem } from '../data/items';

const XP_PER_LEVEL    = 5;
const XP_KEY          = 'rpg_xp';
const INVENTORY_KEY   = 'rpg_inventory';

function loadXp() {
  return parseInt(localStorage.getItem(XP_KEY) || '0', 10);
}

function loadInventory() {
  try { return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]'); }
  catch { return []; }
}

function xpToStats(xp) {
  return {
    xp,
    level:      Math.floor(xp / XP_PER_LEVEL) + 1,
    xpInLevel:  xp % XP_PER_LEVEL,
    xpPerLevel: XP_PER_LEVEL,
  };
}

const stored = loadXp();

const initialState = {
  session:     null,
  todos:       [],
  bosses:      [],
  loading:     true,
  levelUpItem: null,
  inventory:   loadInventory(),
  ...xpToStats(stored),
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':  return { ...state, session: action.payload };
    case 'SET_TODOS':    return { ...state, todos: action.payload };
    case 'SET_BOSSES':   return { ...state, bosses: action.payload };
    case 'SET_LOADING':  return { ...state, loading: action.payload };
    case 'ADD_TODO':     return { ...state, todos: [...state.todos, action.payload] };
    case 'TICK_TODO':
      return {
        ...state,
        todos:   state.todos.map(t => t.id === action.payload.todo.id ? action.payload.todo : t),
        session: action.payload.session,
      };
    case 'DELETE_TODO':  return { ...state, todos: state.todos.filter(t => t.id !== action.payload) };
    case 'RENAME_TODO':  return { ...state, todos: state.todos.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'RENAME_BOSS':  return {
      ...state,
      bosses: state.bosses.map(b => b.id === action.payload.id ? action.payload : b),
      session: state.session?.boss?.id === action.payload.id
        ? { ...state.session, boss: action.payload }
        : state.session,
    };
    case 'ADD_XP': {
      const newXp = state.xp + action.payload;
      localStorage.setItem(XP_KEY, String(newXp));
      const newStats  = xpToStats(newXp);
      const leveledUp = newStats.level > state.level;
      if (!leveledUp) return { ...state, ...newStats };
      const item      = rollItem();
      const inventory = [...state.inventory, { ...item, obtainedAt: Date.now(), atLevel: newStats.level }];
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      return { ...state, ...newStats, inventory, levelUpItem: item };
    }
    case 'CLEAR_LEVEL_UP': return { ...state, levelUpItem: null };
    default:               return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: bossData }, { data: sessionData }] = await Promise.all([
          api.getBosses(),
          api.getTodaySession(),
        ]);
        dispatch({ type: 'SET_BOSSES',  payload: bossData });
        dispatch({ type: 'SET_SESSION', payload: sessionData.session });
        if (sessionData.session) {
          const { data } = await api.getTodos();
          dispatch({ type: 'SET_TODOS', payload: data.todos });
        }
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  const chooseBoss = useCallback(async (bossId) => {
    const { data } = await api.selectBoss(bossId);
    dispatch({ type: 'SET_SESSION', payload: data.session });
    dispatch({ type: 'SET_TODOS',   payload: [] });
    return data.session;
  }, []);

  const addTodo = useCallback(async (taskName) => {
    const { data } = await api.createTodo(taskName);
    dispatch({ type: 'ADD_TODO', payload: data.todo });
    return data.todo;
  }, []);

  const completeTodo = useCallback(async (todoId) => {
    const { data } = await api.tickTodo(todoId);
    dispatch({ type: 'TICK_TODO', payload: { todo: data.todo, session: data.session } });
    if (data.boss_defeated) {
      const xpEarned = data.session.boss?.difficulty_order || 1;
      dispatch({ type: 'ADD_XP', payload: xpEarned });
    }
    return data;
  }, []);

  const removeTodo = useCallback(async (todoId) => {
    await api.deleteTodo(todoId);
    dispatch({ type: 'DELETE_TODO', payload: todoId });
  }, []);

  const renameTodo = useCallback(async (todoId, taskName) => {
    const { data } = await api.renameTodo(todoId, taskName);
    dispatch({ type: 'RENAME_TODO', payload: data.todo });
    return data.todo;
  }, []);

  const renameBoss = useCallback(async (bossId, name) => {
    const { data } = await api.renameBoss(bossId, name);
    dispatch({ type: 'RENAME_BOSS', payload: data.boss });
    return data.boss;
  }, []);

  const clearLevelUp = useCallback(() => dispatch({ type: 'CLEAR_LEVEL_UP' }), []);

  const resetDay = useCallback(async () => {
    await api.resetSession();
    dispatch({ type: 'SET_SESSION', payload: null });
    dispatch({ type: 'SET_TODOS',   payload: [] });
  }, []);

  return (
    <GameContext.Provider value={{ ...state, chooseBoss, addTodo, completeTodo, removeTodo, renameTodo, renameBoss, clearLevelUp, resetDay }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
