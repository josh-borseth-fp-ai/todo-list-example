# Todo List

A small todo app built with React, TypeScript, Tailwind CSS v4, and Vite.

- Add, complete, edit (double-click), and delete todos
- Filter by all / active / completed, toggle all, and clear completed
- Todos persist in `localStorage`
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

- `src/todos.ts`: todo types, the reducer, and filtering (pure, unit-tested in `src/todos.test.ts`)
- `src/useTodos.ts`: reducer hook that syncs to `localStorage`
- `src/App.tsx`: the UI
