import { useEffect, useReducer } from 'react'
import { parseStoredState, todosReducer, type TodoState } from './todos'

const STORAGE_KEY = 'todo-groups'
// Before groups, todos were a bare Todo[] under this key. It is only read to migrate and never
// written, so an old build (a stale tab, or a rollback) still finds the format it expects.
const LEGACY_STORAGE_KEY = 'todos'

function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null')
  } catch {
    // Corrupt storage reads as empty.
    return null
  }
}

function load(): TodoState {
  const raw = read(STORAGE_KEY) ?? read(LEGACY_STORAGE_KEY)
  return parseStoredState(raw, () => crypto.randomUUID())
}

export function useTodos() {
  const [state, dispatch] = useReducer(todosReducer, undefined, load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, dispatch] as const
}
