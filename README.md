# VMS — Visitor Management System

A full-featured, single-page Visitor Management System with role-based login, visitor check-in/check-out, and integrated task management. Pure HTML, CSS, and JavaScript — no build tools, no frameworks.

---

## Features

### Visitor Management
- Visitor self check-in with: Name, Phone, Email, Purpose, Host, Company
- Auto-generated badge ID (e.g. `VMS-2026-1001`)
- Visitor pass card with check-in time, purpose, host details
- Self check-out from visitor portal
- Real-time duration tracking (active visits)

### Admin Dashboard
- Secure login (username + password)
- 4 stat cards: Today's visitors, Currently inside, Checked out, Avg. duration
- Full visitor log table with filters: Today / This Week / All Time
- Admin can manually check-in, check-out, or delete visitor records
- Quick "Add Visitor" modal for pre-registration
- Integrated task management (priority, due date, tags, filters, search)

### General
- Role-based access: Admin and Visitor portals
- LocalStorage persistence (tasks and visitors survive page refresh)
- Fully responsive — works on mobile
- Zero dependencies, no `npm install`

---

## Getting Started

Open `index.html` directly in a browser.

```bash
git clone https://github.com/AnjaliK07/VMS.git
cd VMS
open index.html
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin@123`

---

## Project Structure

```
VMS/
├── index.html   — All views (Login, Admin Dashboard, Visitor Portal)
├── style.css    — Complete stylesheet with CSS custom properties
├── app.js       — Full app logic (auth, visitor CRUD, task CRUD)
└── README.md    — This file
```

---

## Backend Integration

Every data operation has a `TODO:` comment showing the exact API call to substitute. Search `TODO:` in `app.js` to find all integration points.

| Function              | Now (localStorage)       | Replace with                    |
|-----------------------|--------------------------|---------------------------------|
| `loadFromStorage()`   | localStorage reads       | `GET /api/visitors`, `GET /api/tasks` |
| `adminLogin()`        | Hardcoded credential check | `POST /api/auth/login`        |
| `visitorCheckin()`    | Local array push         | `POST /api/visitors/checkin`    |
| `adminCheckin(id)`    | Local state update       | `PATCH /api/visitors/:id/checkin` |
| `adminCheckout(id)`   | Local state update       | `PATCH /api/visitors/:id/checkout` |
| `deleteVisitor(id)`   | Local array filter       | `DELETE /api/visitors/:id`      |
| `addTask()`           | Local array push         | `POST /api/tasks`               |
| `toggleTask(id)`      | Local state update       | `PATCH /api/tasks/:id`          |
| `deleteTask(id)`      | Local array filter       | `DELETE /api/tasks/:id`         |

---

## Customisation

All design tokens (colours, fonts, border-radii, shadows) live under `:root { }` at the top of `style.css`. Change the palette there and the entire UI updates.

---

## Tech Stack

HTML5 · CSS3 (custom properties, grid, flexbox) · Vanilla JS (ES2020)  
Google Fonts: Space Grotesk + DM Sans · Zero runtime dependencies
