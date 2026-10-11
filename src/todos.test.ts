import { describe, expect, it } from 'vitest'
import { filterTodos, todosReducer, type Todo } from './todos'

const a: Todo = { id: 'a', text: 'Buy milk', completed: false }
const b: Todo = { id: 'b', text: 'Walk dog', completed: true }

describe('todosReducer', () => {
  it('adds a trimmed todo', () => {
    expect(todosReducer([], { type: 'add', id: 'x', text: '  Hi  ' })).toEqual([
      { id: 'x', text: 'Hi', completed: false },
    ])
  })

  it('ignores blank todos', () => {
    expect(todosReducer([a], { type: 'add', id: 'x', text: '   ' })).toEqual([a])
  })

  it('toggles a todo', () => {
    expect(todosReducer([a, b], { type: 'toggle', id: 'a' })[0].completed).toBe(true)
  })

  it('edits a todo, and removes it when the edit is blank', () => {
    expect(todosReducer([a], { type: 'edit', id: 'a', text: ' Oat milk ' })[0].text).toBe('Oat milk')
    expect(todosReducer([a, b], { type: 'edit', id: 'a', text: '' })).toEqual([b])
  })

  it('removes a todo', () => {
    expect(todosReducer([a, b], { type: 'remove', id: 'b' })).toEqual([a])
  })

  it('toggleAll completes everything unless everything is already complete', () => {
    const all = todosReducer([a, b], { type: 'toggleAll' })
    expect(all.every((t) => t.completed)).toBe(true)
    expect(todosReducer(all, { type: 'toggleAll' }).every((t) => !t.completed)).toBe(true)
  })

  it('clears completed todos', () => {
    expect(todosReducer([a, b], { type: 'clearCompleted' })).toEqual([a])
  })
})

describe('filterTodos', () => {
  it('filters by status', () => {
    expect(filterTodos([a, b], 'all')).toEqual([a, b])
    expect(filterTodos([a, b], 'active')).toEqual([a])
    expect(filterTodos([a, b], 'completed')).toEqual([b])
  })
})
