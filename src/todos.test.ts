import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GROUP_NAME,
  filterTodos,
  parseStoredState,
  todosReducer,
  type Group,
  type Todo,
  type TodoState,
} from './todos'

const home: Group = { id: 'home', name: 'Home' }
const work: Group = { id: 'work', name: 'Work' }
const a: Todo = { id: 'a', groupId: 'home', text: 'Buy milk', completed: false }
const b: Todo = { id: 'b', groupId: 'home', text: 'Walk dog', completed: true }
const c: Todo = { id: 'c', groupId: 'work', text: 'Ship it', completed: true }

const state = (todos: Todo[], groups: Group[] = [home, work]): TodoState => ({ groups, todos })

describe('todosReducer: groups', () => {
  it('adds a trimmed group and ignores blank names', () => {
    expect(todosReducer(state([], []), { type: 'addGroup', id: 'g', name: '  Errands ' }).groups).toEqual([
      { id: 'g', name: 'Errands' },
    ])
    expect(todosReducer(state([]), { type: 'addGroup', id: 'g', name: '  ' })).toEqual(state([]))
  })

  it('renames a group, keeping the old name when the new one is blank', () => {
    expect(todosReducer(state([]), { type: 'renameGroup', id: 'home', name: ' House ' }).groups).toEqual([
      { id: 'home', name: 'House' },
      work,
    ])
    expect(todosReducer(state([]), { type: 'renameGroup', id: 'home', name: '' })).toEqual(state([]))
  })

  it('removes a group along with its todos', () => {
    expect(todosReducer(state([a, b, c]), { type: 'removeGroup', id: 'home' })).toEqual(state([c], [work]))
  })
})

describe('todosReducer: todos', () => {
  it('adds a trimmed todo to a group', () => {
    expect(todosReducer(state([]), { type: 'add', id: 'x', groupId: 'work', text: '  Hi  ' }).todos).toEqual([
      { id: 'x', groupId: 'work', text: 'Hi', completed: false },
    ])
  })

  it('ignores blank todos and todos for a missing group', () => {
    expect(todosReducer(state([a]), { type: 'add', id: 'x', groupId: 'home', text: '   ' })).toEqual(state([a]))
    expect(todosReducer(state([a]), { type: 'add', id: 'x', groupId: 'nope', text: 'Hi' })).toEqual(state([a]))
  })

  it('toggles a todo', () => {
    expect(todosReducer(state([a, b]), { type: 'toggle', id: 'a' }).todos[0].completed).toBe(true)
  })

  it('edits a todo, and removes it when the edit is blank', () => {
    expect(todosReducer(state([a]), { type: 'edit', id: 'a', text: ' Oat milk ' }).todos[0].text).toBe('Oat milk')
    expect(todosReducer(state([a, b]), { type: 'edit', id: 'a', text: '' }).todos).toEqual([b])
  })

  it('removes a todo', () => {
    expect(todosReducer(state([a, b]), { type: 'remove', id: 'b' }).todos).toEqual([a])
  })

  it('toggleAll completes a whole group unless it is already complete, leaving other groups alone', () => {
    const work2: Todo = { ...c, id: 'c2', completed: false }
    const all = todosReducer(state([a, b, work2]), { type: 'toggleAll', groupId: 'home' }).todos
    expect(all).toEqual([{ ...a, completed: true }, b, work2])
    const none = todosReducer(state(all), { type: 'toggleAll', groupId: 'home' }).todos
    expect(none).toEqual([a, { ...b, completed: false }, work2])
  })

  it('clears completed todos in one group only', () => {
    expect(todosReducer(state([a, b, c]), { type: 'clearCompleted', groupId: 'home' }).todos).toEqual([a, c])
  })
})

describe('filterTodos', () => {
  it('filters by status', () => {
    expect(filterTodos([a, b], 'all')).toEqual([a, b])
    expect(filterTodos([a, b], 'active')).toEqual([a])
    expect(filterTodos([a, b], 'completed')).toEqual([b])
  })
})

describe('parseStoredState', () => {
  const newId = () => 'new'

  it('moves pre-groups todos into a default group', () => {
    const legacy = [{ id: 'a', text: 'Buy milk', completed: false }]
    expect(parseStoredState(legacy, newId)).toEqual({
      groups: [{ id: 'new', name: DEFAULT_GROUP_NAME }],
      todos: [{ ...legacy[0], groupId: 'new' }],
    })
  })

  it('keeps grouped state as is', () => {
    expect(parseStoredState(state([a, c]), newId)).toEqual(state([a, c]))
  })

  it('starts with one empty default group when storage is empty or unrecognised', () => {
    const fresh = { groups: [{ id: 'new', name: DEFAULT_GROUP_NAME }], todos: [] }
    expect(parseStoredState(null, newId)).toEqual(fresh)
    expect(parseStoredState({ nope: true }, newId)).toEqual(fresh)
  })
})
