export type Group = {
  id: string
  name: string
}

export type Todo = {
  id: string
  groupId: string
  text: string
  completed: boolean
}

export type TodoState = {
  groups: Group[]
  todos: Todo[]
}

export type Filter = 'all' | 'active' | 'completed'

export type Action =
  | { type: 'addGroup'; id: string; name: string }
  | { type: 'renameGroup'; id: string; name: string }
  | { type: 'removeGroup'; id: string }
  | { type: 'add'; id: string; groupId: string; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'edit'; id: string; text: string }
  | { type: 'remove'; id: string }
  | { type: 'toggleAll'; groupId: string }
  | { type: 'clearCompleted'; groupId: string }

export const DEFAULT_GROUP_NAME = 'Todos'

export function todosReducer(state: TodoState, action: Action): TodoState {
  const { groups, todos } = state
  switch (action.type) {
    case 'addGroup': {
      const name = action.name.trim()
      if (!name) return state
      return { groups: [...groups, { id: action.id, name }], todos }
    }
    case 'renameGroup': {
      const name = action.name.trim()
      // Unlike todos, a blank rename keeps the old name: deleting a whole group is too easy to do by accident.
      if (!name) return state
      return { groups: groups.map((g) => (g.id === action.id ? { ...g, name } : g)), todos }
    }
    case 'removeGroup':
      return {
        groups: groups.filter((g) => g.id !== action.id),
        todos: todos.filter((t) => t.groupId !== action.id),
      }
    case 'add': {
      const text = action.text.trim()
      if (!text || !groups.some((g) => g.id === action.groupId)) return state
      return {
        groups,
        todos: [...todos, { id: action.id, groupId: action.groupId, text, completed: false }],
      }
    }
    case 'toggle':
      return {
        groups,
        todos: todos.map((t) => (t.id === action.id ? { ...t, completed: !t.completed } : t)),
      }
    case 'edit': {
      const text = action.text.trim()
      // Saving an empty edit deletes the todo.
      if (!text) return { groups, todos: todos.filter((t) => t.id !== action.id) }
      return { groups, todos: todos.map((t) => (t.id === action.id ? { ...t, text } : t)) }
    }
    case 'remove':
      return { groups, todos: todos.filter((t) => t.id !== action.id) }
    case 'toggleAll': {
      const inGroup = (t: Todo) => t.groupId === action.groupId
      const completed = todos.some((t) => inGroup(t) && !t.completed)
      return { groups, todos: todos.map((t) => (inGroup(t) ? { ...t, completed } : t)) }
    }
    case 'clearCompleted':
      return {
        groups,
        todos: todos.filter((t) => t.groupId !== action.groupId || !t.completed),
      }
  }
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === 'active') return todos.filter((t) => !t.completed)
  if (filter === 'completed') return todos.filter((t) => t.completed)
  return todos
}

// Turns whatever was in storage into valid state. Before groups existed, storage held a bare
// Todo[]; those todos move into a default group so upgrading loses nothing.
export function parseStoredState(raw: unknown, newId: () => string): TodoState {
  if (Array.isArray(raw)) {
    const groupId = newId()
    return {
      groups: [{ id: groupId, name: DEFAULT_GROUP_NAME }],
      todos: raw.map((t: Omit<Todo, 'groupId'>) => ({ ...t, groupId })),
    }
  }
  if (
    raw &&
    typeof raw === 'object' &&
    Array.isArray((raw as TodoState).groups) &&
    Array.isArray((raw as TodoState).todos)
  ) {
    return raw as TodoState
  }
  return { groups: [{ id: newId(), name: DEFAULT_GROUP_NAME }], todos: [] }
}
