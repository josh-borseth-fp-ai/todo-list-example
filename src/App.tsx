import { useRef, useState, type Dispatch } from 'react'
import { filterTodos, type Action, type Filter, type Todo } from './todos'
import { useTodos } from './useTodos'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function App() {
  const [todos, dispatch] = useTodos()
  const [filter, setFilter] = useState<Filter>('all')
  const [draft, setDraft] = useState('')

  const visible = filterTodos(todos, filter)
  const remaining = todos.filter((t) => !t.completed).length
  const hasCompleted = todos.length > remaining

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-center text-5xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          todos
        </h1>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <form
            className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ type: 'add', id: crypto.randomUUID(), text: draft })
              setDraft('')
            }}
          >
            <button
              type="button"
              aria-label="Toggle all"
              disabled={todos.length === 0}
              onClick={() => dispatch({ type: 'toggleAll' })}
              className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:invisible dark:hover:bg-slate-800"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What needs to be done?"
              aria-label="New todo"
              className="flex-1 bg-transparent px-1 py-2 text-lg outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              Add
            </button>
          </form>

          {visible.length > 0 && (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {visible.map((todo) => (
                <TodoItem key={todo.id} todo={todo} dispatch={dispatch} />
              ))}
            </ul>
          )}

          {todos.length === 0 ? (
            <p className="p-8 text-center text-slate-400">Nothing to do yet. Add a task above.</p>
          ) : (
            visible.length === 0 && (
              <p className="p-8 text-center text-slate-400">No {filter} todos.</p>
            )
          )}

          {todos.length > 0 && (
            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800">
              <span>
                {remaining} {remaining === 1 ? 'item' : 'items'} left
              </span>
              <div className="flex gap-1">
                {FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    aria-pressed={filter === value}
                    className={`rounded-md px-2.5 py-1 ${
                      filter === value
                        ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => dispatch({ type: 'clearCompleted' })}
                className={`hover:text-slate-700 hover:underline dark:hover:text-slate-300 ${
                  hasCompleted ? '' : 'invisible'
                }`}
              >
                Clear completed
              </button>
            </footer>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">Double-click a todo to edit it.</p>
      </div>
    </main>
  )
}

function TodoItem({ todo, dispatch }: { todo: Todo; dispatch: Dispatch<Action> }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.text)
  // Escape unmounts the input, which can fire blur; this stops that blur from saving.
  const cancelled = useRef(false)

  function save() {
    if (cancelled.current) return
    dispatch({ type: 'edit', id: todo.id, text })
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="px-4 py-2">
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') {
              cancelled.current = true
              setEditing(false)
            }
          }}
          aria-label="Edit todo"
          className="w-full rounded-lg border border-indigo-400 bg-transparent px-3 py-2 text-lg outline-none ring-2 ring-indigo-200 dark:ring-indigo-500/30"
        />
      </li>
    )
  }

  return (
    <li className="group flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => dispatch({ type: 'toggle', id: todo.id })}
        aria-label={`Mark "${todo.text}" ${todo.completed ? 'incomplete' : 'complete'}`}
        className="size-5 cursor-pointer accent-indigo-600"
      />
      <span
        onDoubleClick={() => {
          cancelled.current = false
          setText(todo.text)
          setEditing(true)
        }}
        className={`flex-1 cursor-text text-lg break-words ${
          todo.completed ? 'text-slate-400 line-through' : ''
        }`}
      >
        {todo.text}
      </span>
      <button
        onClick={() => dispatch({ type: 'remove', id: todo.id })}
        aria-label={`Delete "${todo.text}"`}
        className="rounded-md p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 dark:hover:bg-rose-500/10"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </li>
  )
}
