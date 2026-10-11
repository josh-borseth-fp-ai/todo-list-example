import { useEffect, useReducer } from 'react'
import { todosReducer, type Todo } from './todos'

const STORAGE_KEY = 'todos'

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Todo[]) : []
  } catch {
    return []
  }
}

export function useTodos() {
  const [todos, dispatch] = useReducer(todosReducer, undefined, load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  return [todos, dispatch] as const
}
