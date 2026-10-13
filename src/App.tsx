import { useRef, useState, type Dispatch } from 'react'
import { filterTodos, type Action, type Filter, type Group, type Todo } from './todos'
import { useTodos } from './useTodos'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function App() {
  const [{ groups, todos }, dispatch] = useTodos()
  const [filter, setFilter] = useState<Filter>('all')
  const [groupDraft, setGroupDraft] = useState('')

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-center text-5xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          todos
        </h1>

        {todos.length > 0 && (
          <div className="mb-6 flex justify-center gap-1 text-sm text-slate-500">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-md px-2.5 py-1 ${
                  filter === value
                    ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {groups.map((group, i) => (
            <GroupCard
              key={group.id}
              group={group}
              todos={todos.filter((t) => t.groupId === group.id)}
              filter={filter}
              autoFocus={i === 0}
              dispatch={dispatch}
            />
          ))}
        </div>

        {groups.length === 0 && (
          <p className="p-8 text-center text-slate-400">No groups yet. Create one below.</p>
        )}

        <form
          className="mt-6 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            dispatch({ type: 'addGroup', id: crypto.randomUUID(), name: groupDraft })
            setGroupDraft('')
          }}
        >
          <input
            value={groupDraft}
            onChange={(e) => setGroupDraft(e.target.value)}
            placeholder="New group name"
            aria-label="New group"
            className="flex-1 rounded-lg bg-white px-3 py-2 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-300 dark:bg-slate-900 dark:ring-slate-800"
          />
          <button
            type="submit"
            disabled={!groupDraft.trim()}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50 disabled:opacity-40 dark:text-indigo-300 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10"
          >
            Add group
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Double-click a todo or group name to edit it.
        </p>
      </div>
    </main>
  )
}

function GroupCard({
  group,
  todos,
  filter,
  autoFocus,
  dispatch,
}: {
  group: Group
  todos: Todo[]
  filter: Filter
  autoFocus: boolean
  dispatch: Dispatch<Action>
}) {
  const [draft, setDraft] = useState('')
  const [renaming, setRenaming] = useState(false)

  const visible = filterTodos(todos, filter)
  const remaining = todos.filter((t) => !t.completed).length
  const hasCompleted = todos.length > remaining

  function removeGroup() {
    const n = todos.length
    if (n > 0 && !confirm(`Delete "${group.name}" and its ${n} ${n === 1 ? 'todo' : 'todos'}?`)) {
      return
    }
    dispatch({ type: 'removeGroup', id: group.id })
  }

  return (
    <section
      aria-label={group.name}
      className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
    >
      <header className="group flex items-center gap-2 border-b border-slate-200 px-4 pt-3 pb-2 dark:border-slate-800">
        {renaming ? (
          <InlineEdit
            initial={group.name}
            label="Rename group"
            onDone={(name) => {
              if (name !== null) dispatch({ type: 'renameGroup', id: group.id, name })
              setRenaming(false)
            }}
            className="flex-1 px-2 py-1 font-semibold"
          />
        ) : (
          <h2
            onDoubleClick={() => setRenaming(true)}
            className="flex-1 cursor-text font-semibold break-words text-slate-700 dark:text-slate-200"
          >
            {group.name}
          </h2>
        )}
        <button
          onClick={removeGroup}
          aria-label={`Delete group "${group.name}"`}
          className="rounded-md p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 dark:hover:bg-rose-500/10"
        >
          <TrashIcon />
        </button>
      </header>

      <form
        className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault()
          dispatch({ type: 'add', id: crypto.randomUUID(), groupId: group.id, text: draft })
          setDraft('')
        }}
      >
        <button
          type="button"
          aria-label={`Toggle all in "${group.name}"`}
          disabled={todos.length === 0}
          onClick={() => dispatch({ type: 'toggleAll', groupId: group.id })}
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
          autoFocus={autoFocus}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What needs to be done?"
          aria-label={`New todo in "${group.name}"`}
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
        <p className="p-6 text-center text-slate-400">Nothing here yet. Add a task above.</p>
      ) : (
        visible.length === 0 && <p className="p-6 text-center text-slate-400">No {filter} todos.</p>
      )}

      {todos.length > 0 && (
        <footer className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800">
          <span>
            {remaining} {remaining === 1 ? 'item' : 'items'} left
          </span>
          <button
            onClick={() => dispatch({ type: 'clearCompleted', groupId: group.id })}
            className={`hover:text-slate-700 hover:underline dark:hover:text-slate-300 ${
              hasCompleted ? '' : 'invisible'
            }`}
          >
            Clear completed
          </button>
        </footer>
      )}
    </section>
  )
}

function TodoItem({ todo, dispatch }: { todo: Todo; dispatch: Dispatch<Action> }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="px-4 py-2">
        <InlineEdit
          initial={todo.text}
          label="Edit todo"
          onDone={(text) => {
            if (text !== null) dispatch({ type: 'edit', id: todo.id, text })
            setEditing(false)
          }}
          className="w-full px-3 py-2 text-lg"
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
        onDoubleClick={() => setEditing(true)}
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

// Text input for in-place editing. Calls onDone once: with the new text on Enter or blur,
// or with null on Escape.
function InlineEdit({
  initial,
  label,
  className,
  onDone,
}: {
  initial: string
  label: string
  className: string
  onDone: (text: string | null) => void
}) {
  const [text, setText] = useState(initial)
  // Enter or Escape unmounts the input, which can also fire blur; this stops a second onDone.
  const done = useRef(false)

  function finish(result: string | null) {
    if (done.current) return
    done.current = true
    onDone(result)
  }

  return (
    <input
      autoFocus
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => finish(text)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish(text)
        if (e.key === 'Escape') finish(null)
      }}
      aria-label={label}
      className={`rounded-lg border border-indigo-400 bg-transparent outline-none ring-2 ring-indigo-200 dark:ring-indigo-500/30 ${className}`}
    />
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
        clipRule="evenodd"
      />
    </svg>
  )
}
