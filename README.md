# TaskFlow

A clean, one-page task management app — vanilla HTML, CSS, and JavaScript. No build tools. No frameworks. No dependencies. Push to GitHub and open in a browser.

---

## Features

- Add tasks with **priority** (High / Medium / Low), **due date**, and **tag**
- Mark tasks as **done / reopen** with one click
- **Filter** by All / Active / Done
- **Search** tasks by title or tag
- **Progress ring** showing overall completion at a glance
- Overdue task detection (due date badges turn red)
- **LocalStorage** persistence — data survives page refreshes
- Fully **responsive** down to mobile

---

## Getting Started

1. Clone the repo and open `index.html` directly in your browser — that's it.

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
open index.html      # macOS
# or just double-click index.html on Windows/Linux
```

No `npm install`. No build step. No server required (yet).

---

## Project Structure

```
taskflow/
├── index.html   — App markup
├── style.css    — All styles (CSS custom properties)
├── app.js       — Task logic + localStorage layer
└── README.md    — This file
```

---

## Backend Integration

All data operations are isolated into four async functions at the top of `app.js`. Search for `TODO:` to find every spot.

| Function        | Current (localStorage)      | Replace with          |
|-----------------|-----------------------------|-----------------------|
| `loadTasks()`   | `localStorage.getItem()`    | `GET /api/tasks`      |
| `createTask()`  | `tasks.unshift(task)`       | `POST /api/tasks`     |
| `updateTask()`  | `Object.assign(task, patch)`| `PATCH /api/tasks/:id`|
| `removeTask()`  | `tasks.filter(...)`         | `DELETE /api/tasks/:id`|

Each function is already `async` — swap the body, keep the signature, and the rest of the app just works.

---

## Customisation

All colours, fonts, spacing, and border-radii are defined as CSS custom properties at the top of `style.css` under `:root { }`. Change the palette there and the whole UI updates.

---

## Tech Stack

- HTML5 · CSS3 (custom properties, grid, flexbox) · Vanilla JS (ES2020)
- Google Fonts: Space Grotesk + DM Sans
- Zero runtime dependencies
