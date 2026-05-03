import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import * as api from '../services/api';

const initialState = {
  session: null,
  todos:   [],
  bosses:  [],
  loading: true,
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
    default:             return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // On mount: load today's session and boss list
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
    return data;
  }, []);

  const removeTodo = useCallback(async (todoId) => {
    await api.deleteTodo(todoId);
    dispatch({ type: 'DELETE_TODO', payload: todoId });
  }, []);

  return (
    <GameContext.Provider value={{ ...state, chooseBoss, addTodo, completeTodo, removeTodo }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
};
