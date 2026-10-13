# Todo List

A small todo app built with React, TypeScript, Tailwind CSS v4, and Vite.

- Organize todos into groups: add, rename (double-click), and delete groups
- Add, complete, edit (double-click), and delete todos in each group
- Filter every group by all / active / completed; toggle all and clear completed per group
- Todos and groups persist in `localStorage` (todos saved before groups existed move into a default group)
- Follows the system light/dark preference

## Getting started

```sh
npm install
npm run dev
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run the Vitest unit tests |
| `npm run lint` | Lint with oxlint |

## Structure

- `src/todos.ts`: group and todo types, the reducer, filtering, and parsing saved state (pure, unit-tested in `src/todos.test.ts`)
- `src/useTodos.ts`: reducer hook that syncs to `localStorage`
- `src/App.tsx`: the UI
