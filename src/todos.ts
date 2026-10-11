export type Todo = {
  id: string
  text: string
  completed: boolean
}

export type Filter = 'all' | 'active' | 'completed'

export type Action =
  | { type: 'add'; id: string; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'edit'; id: string; text: string }
  | { type: 'remove'; id: string }
  | { type: 'toggleAll' }
  | { type: 'clearCompleted' }

export function todosReducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add': {
      const text = action.text.trim()
      if (!text) return todos
      return [...todos, { id: action.id, text, completed: false }]
    }
    case 'toggle':
      return todos.map((t) =>
        t.id === action.id ? { ...t, completed: !t.completed } : t,
      )
    case 'edit': {
      const text = action.text.trim()
      // Saving an empty edit deletes the todo.
      if (!text) return todos.filter((t) => t.id !== action.id)
      return todos.map((t) => (t.id === action.id ? { ...t, text } : t))
    }
    case 'remove':
      return todos.filter((t) => t.id !== action.id)
    case 'toggleAll': {
      const completed = todos.some((t) => !t.completed)
      return todos.map((t) => ({ ...t, completed }))
    }
    case 'clearCompleted':
      return todos.filter((t) => !t.completed)
  }
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === 'active') return todos.filter((t) => !t.completed)
  if (filter === 'completed') return todos.filter((t) => t.completed)
  return todos
}
