import { useEffect, useReducer } from 'react'
import { parseStoredState, todosReducer, type TodoState } from './todos'

const STORAGE_KEY = 'todos'

function load(): TodoState {
  let raw: unknown = null
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    // Corrupt storage falls through to a fresh state.
  }
  return parseStoredState(raw, () => crypto.randomUUID())
}

export function useTodos() {
  const [state, dispatch] = useReducer(todosReducer, undefined, load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, dispatch] as const
}
