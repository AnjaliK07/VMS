/* ================================================
   TaskFlow — app.js
   Task CRUD, filtering, rendering, localStorage.

   Backend integration: search for "TODO:" to find
   every spot that maps to a REST API call.
   ================================================ */

'use strict';

// ── State ──────────────────────────────────────────

let tasks = [];
let currentFilter = 'all';

// ── Persistence ────────────────────────────────────
// These are the four functions you'll replace with
// API calls when the backend is ready.

async function loadTasks() {
  // TODO: Replace with → GET /api/tasks
  // Example:
  //   const res = await fetch('/api/tasks');
  //   tasks = await res.json();
  const stored = localStorage.getItem('taskflow_tasks');
  tasks = stored ? JSON.parse(stored) : [];
}

async function createTask(task) {
  // TODO: Replace with → POST /api/tasks
  // Example:
  //   const res = await fetch('/api/tasks', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(task),
  //   });
  //   const created = await res.json();
  //   task.id = created.id; // use server-assigned ID
  tasks.unshift(task);
  persist();
}

async function updateTask(id, patch) {
  // TODO: Replace with → PATCH /api/tasks/:id
  // Example:
  //   await fetch(`/api/tasks/${id}`, {
  //     method: 'PATCH',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(patch),
  //   });
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) Object.assign(tasks[idx], patch);
  persist();
}

async function removeTask(id) {
  // TODO: Replace with → DELETE /api/tasks/:id
  // Example:
  //   await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  tasks = tasks.filter(t => t.id !== id);
  persist();
}

function persist() {
  // TODO: Remove this once the backend is wired in.
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// ── Core actions ───────────────────────────────────

async function addTask() {
  const titleEl = document.getElementById('taskInput');
  const title   = titleEl.value.trim();

  if (!title) {
    titleEl.classList.add('shake');
    titleEl.focus();
    titleEl.addEventListener('animationend', () => titleEl.classList.remove('shake'), { once: true });
    return;
  }

  const task = {
    id:        `local_${Date.now()}`,   // server will override this
    title,
    priority:  document.getElementById('prioritySelect').value,
    dueDate:   document.getElementById('dueDateInput').value  || null,
    category:  document.getElementById('categoryInput').value.trim() || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await createTask(task);
  renderAll();

  // Reset form fields
  titleEl.value = '';
  document.getElementById('dueDateInput').value  = '';
  document.getElementById('categoryInput').value = '';
  document.getElementById('prioritySelect').value = 'medium';
  titleEl.focus();
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const completed = !task.completed;
  await updateTask(id, {
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  });
  renderAll();
}

async function deleteTask(id) {
  await removeTask(id);
  renderAll();
}

// ── Filter ─────────────────────────────────────────

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  renderTasks();
}

function getFiltered() {
  const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  return tasks.filter(t => {
    const matchFilter =
      currentFilter === 'all'
        ? true
        : currentFilter === 'active'
          ? !t.completed
          : t.completed;

    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q));

    return matchFilter && matchSearch;
  });
}

// ── Render ─────────────────────────────────────────

function renderAll() {
  renderTasks();
  updateCounts();
  updateProgress();
}

function renderTasks() {
  const listEl  = document.getElementById('taskList');
  const emptyEl = document.getElementById('emptyState');
  const filtered = getFiltered();

  if (filtered.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    setEmptyMessage();
  } else {
    emptyEl.classList.add('hidden');
    listEl.innerHTML = filtered.map(taskCardHTML).join('');
  }
}

function setEmptyMessage() {
  const msgs = {
    all:       ['Nothing here yet.',       'Add a task above to get started.'],
    active:    ['No active tasks.',        'Nice — or add something new above.'],
    completed: ['Nothing completed yet.',  'Check off a task to see it here.'],
  };
  const [title, sub] = msgs[currentFilter] || msgs.all;
  document.getElementById('emptyTitle').textContent = title;
  document.getElementById('emptySub').textContent   = sub;
}

function updateCounts() {
  const total  = tasks.length;
  const done   = tasks.filter(t =>  t.completed).length;
  const active = tasks.filter(t => !t.completed).length;

  document.getElementById('countAll').textContent    = total;
  document.getElementById('countActive').textContent = active;
  document.getElementById('countDone').textContent   = done;
  document.getElementById('totalCount').textContent  = total;
  document.getElementById('completedCount').textContent = done;
}

function updateProgress() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.completed).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('progressPercent').textContent = pct + '%';

  // SVG circle: r=30 → circumference = 2π×30 ≈ 188.5
  const C      = 2 * Math.PI * 30;
  const offset = C - (pct / 100) * C;
  const circle = document.getElementById('progressCircle');
  circle.style.strokeDasharray  = C;
  circle.style.strokeDashoffset = offset;
}

// ── Card HTML ──────────────────────────────────────

function taskCardHTML(task) {
  const doneClass  = task.completed ? 'task-done' : '';
  const checkClass = task.completed ? 'checked'   : '';

  const priorityLabel = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' }[task.priority] || 'Medium';
  const priorityClass = `priority-${task.priority}`;

  const dateBadge = task.dueDate ? buildDateBadge(task.dueDate, task.completed) : '';
  const tagBadge  = task.category
    ? `<span class="badge badge-tag">${esc(task.category)}</span>`
    : '';

  return `
    <div class="task-card ${doneClass}">
      <button
        class="task-checkbox ${checkClass}"
        onclick="toggleTask('${task.id}')"
        title="${task.completed ? 'Mark as active' : 'Mark as done'}"
        aria-label="${task.completed ? 'Mark as active' : 'Mark as done'}"
      >${task.completed ? '✓' : ''}</button>

      <div class="task-body">
        <span class="task-title">${esc(task.title)}</span>
        <div class="task-meta">
          <span class="badge ${priorityClass}">${priorityLabel}</span>
          ${tagBadge}
          ${dateBadge}
        </div>
      </div>

      <button
        class="task-delete"
        onclick="deleteTask('${task.id}')"
        title="Delete task"
        aria-label="Delete task"
      >✕</button>
    </div>
  `.trim();
}

function buildDateBadge(dateStr, completed) {
  const date  = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff  = Math.round((date - today) / 864e5);

  let label;
  if      (diff === 0)  label = '📅 Today';
  else if (diff === 1)  label = '📅 Tomorrow';
  else if (diff === -1) label = '📅 Yesterday';
  else label = `📅 ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;

  const isOverdue = !completed && diff < 0;
  const cls = isOverdue ? 'badge-overdue' : 'badge-date';
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── Utils ──────────────────────────────────────────

function esc(str) {
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(str));
  return el.innerHTML;
}

// ── Event wiring ───────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadTasks();
  renderAll();

  // Enter to add task
  document.getElementById('taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Add task button
  document.getElementById('addTaskBtn').addEventListener('click', addTask);

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter));
  });

  // Live search
  document.getElementById('searchInput').addEventListener('input', renderTasks);
});
