/* ================================================
   VMS — app.js
   Visitor Management System · Full App Logic

   Backend integration: search "TODO:" to find
   every spot that maps to a REST API call.
   ================================================ */

'use strict';

// ── Auth config (TODO: validate via POST /api/auth/login) ──
const ADMIN_CREDS = { username: 'admin', password: 'admin@123' };

// ── State ──────────────────────────────────────────────────
let state = {
  currentUser: null,    // { role: 'admin' | 'visitor', ...data }
  visitors: [],
  tasks: [],
  visitorFilter: 'today',
  taskFilter: 'all',
  badgeCounter: 1000,
};


// ════════════════════════════════════════════════
//  PERSISTENCE (localStorage → swap for API)
// ════════════════════════════════════════════════

function persist() {
  // TODO: Remove once backend is wired in.
  localStorage.setItem('vms_visitors',      JSON.stringify(state.visitors));
  localStorage.setItem('vms_tasks',         JSON.stringify(state.tasks));
  localStorage.setItem('vms_badgeCounter',  String(state.badgeCounter));
}

function loadFromStorage() {
  // TODO: Replace with parallel API calls:
  //   const [visitors, tasks] = await Promise.all([
  //     fetch('/api/visitors').then(r => r.json()),
  //     fetch('/api/tasks').then(r => r.json()),
  //   ]);
  state.visitors     = JSON.parse(localStorage.getItem('vms_visitors')     || '[]');
  state.tasks        = JSON.parse(localStorage.getItem('vms_tasks')        || '[]');
  state.badgeCounter = parseInt(localStorage.getItem('vms_badgeCounter')   || '1000', 10);
}


// ════════════════════════════════════════════════
//  SEED DEMO DATA (runs once on first load)
// ════════════════════════════════════════════════

function seedDemoData() {
  if (state.visitors.length > 0 || state.tasks.length > 0) return;

  const now      = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Build a datetime string for today at h:m
  function t(h, m) {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }
  function dayOffset(n) {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  state.visitors = [
    {
      id: 'v_s1', badgeId: 'VMS-2026-1001',
      name: 'Priya Sharma',      phone: '+91 98765 43210', email: 'priya.s@mckinsey.com',
      purpose: 'Meeting',        host: 'Prof. Rajesh Kumar', company: 'McKinsey & Co.',
      status: 'checked-in',      checkIn: t(10,30),  checkOut: null,
      scheduledDate: null,       createdAt: t(10,28),
    },
    {
      id: 'v_s2', badgeId: 'VMS-2026-1002',
      name: 'Rahul Mehta',       phone: '+91 87654 32109', email: 'rahul.m@kpmg.com',
      purpose: 'Interview',      host: 'HR Team',    company: 'KPMG India',
      status: 'checked-out',     checkIn: t(9,15),   checkOut: t(11,0),
      scheduledDate: null,       createdAt: t(9,10),
    },
    {
      id: 'v_s3', badgeId: 'VMS-2026-1003',
      name: 'Dr. Ananya Singh',  phone: '+91 76543 21098', email: 'ananya@iima.ac.in',
      purpose: 'Training',       host: 'Academic Office', company: 'IIM Ahmedabad',
      status: 'checked-out',     checkIn: t(8,45),   checkOut: t(13,15),
      scheduledDate: null,       createdAt: t(8,40),
    },
    {
      id: 'v_s4', badgeId: 'VMS-2026-1004',
      name: 'Vikram Patel',      phone: '+91 65432 10987', email: null,
      purpose: 'Delivery',       host: 'Admin Office', company: 'Blue Dart Express',
      status: 'checked-out',     checkIn: t(11,5),   checkOut: t(11,22),
      scheduledDate: null,       createdAt: t(11,4),
    },
    {
      id: 'v_s5', badgeId: 'VMS-2026-1005',
      name: 'Neha Gupta',        phone: '+91 54321 09876', email: 'neha.g@amazon.com',
      purpose: 'Site Visit',     host: 'Operations Team', company: 'Amazon India',
      status: 'checked-in',      checkIn: t(11,50),  checkOut: null,
      scheduledDate: null,       createdAt: t(11,48),
    },
    {
      id: 'v_s6', badgeId: 'VMS-2026-1006',
      name: 'Sanya Kapoor',      phone: '+91 43210 98765', email: 'sanya.k@bcg.com',
      purpose: 'Interview',      host: 'Placement Team', company: 'BCG India',
      status: 'checked-out',     checkIn: t(9,30),   checkOut: t(11,45),
      scheduledDate: null,       createdAt: t(9,25),
    },
    {
      id: 'v_s7', badgeId: 'VMS-2026-1007',
      name: 'Arjun Nair',        phone: '+91 32109 87654', email: 'arjun.n@deloitte.com',
      purpose: 'Meeting',        host: 'Finance Team', company: 'Deloitte India',
      status: 'pending',         checkIn: null,       checkOut: null,
      scheduledDate: dayOffset(1),                    createdAt: now.toISOString(),
    },
    {
      id: 'v_s8', badgeId: 'VMS-2026-1008',
      name: 'Meera Iyer',        phone: '+91 21098 76543', email: 'meera@tcs.com',
      purpose: 'Meeting',        host: 'Research Team', company: 'TCS Innovation Labs',
      status: 'checked-out',     checkIn: t(14,0),   checkOut: t(15,30),
      scheduledDate: null,       createdAt: t(13,55),
    },
  ];

  state.tasks = [
    {
      id: 't_s1', title: 'Review Q2 vendor contracts and renewal terms',
      priority: 'high',   dueDate: todayStr,       category: 'Work',
      completed: false,   createdAt: now.toISOString(),
    },
    {
      id: 't_s2', title: 'Prepare ISCEA certification batch documents for students',
      priority: 'high',   dueDate: dayOffset(1),   category: 'OIG',
      completed: false,   createdAt: now.toISOString(),
    },
    {
      id: 't_s3', title: 'Draft Byzantine 2026 post-event report for ISCEA',
      priority: 'high',   dueDate: dayOffset(2),   category: 'OIG',
      completed: false,   createdAt: now.toISOString(),
    },
    {
      id: 't_s4', title: 'Update visitor management policy SOP',
      priority: 'medium', dueDate: dayOffset(4),   category: 'Admin',
      completed: false,   createdAt: now.toISOString(),
    },
    {
      id: 't_s5', title: 'Follow up with KDL logistics on freight savings analysis',
      priority: 'medium', dueDate: dayOffset(-1),  category: 'Supply Chain',
      completed: true,    createdAt: now.toISOString(), completedAt: now.toISOString(),
    },
    {
      id: 't_s6', title: 'Schedule OIG committee meeting agenda for August',
      priority: 'low',    dueDate: dayOffset(6),   category: 'OIG',
      completed: false,   createdAt: now.toISOString(),
    },
    {
      id: 't_s7', title: 'Coordinate guest speaker slot for next operations seminar',
      priority: 'low',    dueDate: null,            category: 'Work',
      completed: false,   createdAt: now.toISOString(),
    },
  ];

  state.badgeCounter = 1008;
  persist();
}


// ════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════

function adminLogin() {
  const username = v('adminUsername').trim();
  const password = v('adminPassword').trim();
  const err = el('adminLoginError');

  // TODO: Replace with → POST /api/auth/login { username, password }
  if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
    err.classList.add('hidden');
    state.currentUser = { role: 'admin', username };
    showView('admin');
    renderAdminDashboard();
  } else {
    showError(err, 'Incorrect username or password.');
    el('adminPassword').classList.add('shake');
    el('adminPassword').addEventListener('animationend', () => el('adminPassword').classList.remove('shake'), { once: true });
  }
}

function visitorCheckin() {
  // TODO: Replace with → POST /api/visitors/checkin { ...fields }
  const name    = v('vName').trim();
  const phone   = v('vPhone').trim();
  const email   = v('vEmail').trim();
  const purpose = v('vPurpose');
  const host    = v('vHost').trim();
  const company = v('vCompany').trim();
  const err     = el('visitorCheckinError');

  if (!name || !phone || !purpose || !host) {
    showError(err, 'Please fill in all required fields.');
    return;
  }
  err.classList.add('hidden');

  const visitor = makeVisitor({ name, phone, email, purpose, host, company, status: 'checked-in' });
  state.visitors.unshift(visitor);
  persist();

  state.currentUser = { role: 'visitor', visitorId: visitor.id };
  showView('visitor');
  renderVisitorPass(visitor);
}

function adminLogout() {
  // TODO: POST /api/auth/logout
  state.currentUser = null;
  showView('login');
  el('adminPassword').value = '';
}

function visitorBack() {
  state.currentUser = null;
  showView('login');
  // Reset visitor form
  ['vName','vPhone','vEmail','vHost','vCompany'].forEach(id => el(id).value = '');
  el('vPurpose').value = '';
}


// ════════════════════════════════════════════════
//  VISITOR CRUD
// ════════════════════════════════════════════════

function makeVisitor({ name, phone, email, purpose, host, company, status, scheduledDate }) {
  state.badgeCounter++;
  return {
    id:            `v_${Date.now()}`,
    badgeId:       `VMS-${new Date().getFullYear()}-${state.badgeCounter}`,
    name, phone,
    email:         email || null,
    purpose,
    host,
    company:       company || null,
    status:        status || 'pending',
    checkIn:       status === 'checked-in' ? new Date().toISOString() : null,
    checkOut:      null,
    scheduledDate: scheduledDate || null,
    createdAt:     new Date().toISOString(),
  };
}

function adminCheckin(id) {
  // TODO: PATCH /api/visitors/:id/checkin
  const v = state.visitors.find(v => v.id === id);
  if (!v) return;
  v.status  = 'checked-in';
  v.checkIn = new Date().toISOString();
  persist();
  renderVisitorTable();
  renderStats();
}

function adminCheckout(id) {
  // TODO: PATCH /api/visitors/:id/checkout
  const v = state.visitors.find(v => v.id === id);
  if (!v) return;
  v.status   = 'checked-out';
  v.checkOut = new Date().toISOString();
  persist();
  renderVisitorTable();
  renderStats();
}

function deleteVisitor(id) {
  // TODO: DELETE /api/visitors/:id
  state.visitors = state.visitors.filter(v => v.id !== id);
  persist();
  renderVisitorTable();
  renderStats();
}

function saveVisitorFromModal() {
  // TODO: POST /api/visitors { ...fields }
  const name    = v('mName').trim();
  const phone   = v('mPhone').trim();
  const email   = v('mEmail').trim();
  const company = v('mCompany').trim();
  const purpose = v('mPurpose');
  const host    = v('mHost').trim();
  const status  = v('mStatus');
  const date    = v('mDate');
  const err     = el('modalError');

  if (!name || !phone || !purpose || !host) {
    showError(err, 'Please fill in all required fields.');
    return;
  }
  err.classList.add('hidden');

  const visitor = makeVisitor({ name, phone, email, purpose, host, company, status, scheduledDate: date || null });
  if (status === 'checked-in') visitor.checkIn = new Date().toISOString();
  state.visitors.unshift(visitor);
  persist();

  closeModal();
  renderVisitorTable();
  renderStats();
}

// Visitor self-checkout (from visitor portal)
function visitorSelfCheckout(id) {
  // TODO: PATCH /api/visitors/:id/checkout
  const visitor = state.visitors.find(v => v.id === id);
  if (!visitor) return;
  visitor.status   = 'checked-out';
  visitor.checkOut = new Date().toISOString();
  persist();
  renderVisitorPass(visitor);
}


// ════════════════════════════════════════════════
//  TASK CRUD
// ════════════════════════════════════════════════

async function addTask() {
  // TODO: POST /api/tasks
  const titleEl = el('taskInput');
  const title   = titleEl.value.trim();
  if (!title) {
    titleEl.classList.add('shake');
    titleEl.focus();
    titleEl.addEventListener('animationend', () => titleEl.classList.remove('shake'), { once: true });
    return;
  }
  const task = {
    id:        `t_${Date.now()}`,
    title,
    priority:  v('prioritySelect'),
    dueDate:   v('dueDateInput') || null,
    category:  v('categoryInput').trim() || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  state.tasks.unshift(task);
  persist();
  renderTaskSection();
  titleEl.value = '';
  el('dueDateInput').value   = '';
  el('categoryInput').value  = '';
  el('prioritySelect').value = 'medium';
  titleEl.focus();
}

async function toggleTask(id) {
  // TODO: PATCH /api/tasks/:id
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.completed  = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  persist();
  renderTaskSection();
}

async function deleteTask(id) {
  // TODO: DELETE /api/tasks/:id
  state.tasks = state.tasks.filter(t => t.id !== id);
  persist();
  renderTaskSection();
}


// ════════════════════════════════════════════════
//  RENDER — ADMIN DASHBOARD
// ════════════════════════════════════════════════

function renderAdminDashboard() {
  renderStats();
  renderVisitorTable();
  renderTaskSection();
}

function renderStats() {
  const todayStr = todayDate();
  const todayVisitors = state.visitors.filter(v => {
    const d = (v.checkIn || v.scheduledDate || v.createdAt || '').slice(0, 10);
    return d === todayStr;
  });
  const inNow   = state.visitors.filter(v => v.status === 'checked-in');
  const outToday = todayVisitors.filter(v => v.status === 'checked-out');

  // Avg duration for checked-out today
  const durations = outToday
    .filter(v => v.checkIn && v.checkOut)
    .map(v => (new Date(v.checkOut) - new Date(v.checkIn)) / 60000);
  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

  setText('statToday', todayVisitors.length);
  setText('statIn',    inNow.length);
  setText('statOut',   outToday.length);
  setText('statAvg',   avg !== null ? formatDuration(avg) : '—');
}

function renderVisitorTable() {
  const tbody  = el('visitorTableBody');
  const empty  = el('vtableEmpty');
  const todayStr = todayDate();
  const weekAgo  = weekAgoDate();

  const filtered = state.visitors.filter(v => {
    const d = (v.checkIn || v.scheduledDate || v.createdAt || '').slice(0, 10);
    if (state.visitorFilter === 'today') return d === todayStr;
    if (state.visitorFilter === 'week')  return d >= weekAgo;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  tbody.innerHTML = filtered.map(visitorRowHTML).join('');
}

function visitorRowHTML(visitor) {
  const statusLabel = { 'checked-in': 'Checked In', 'checked-out': 'Checked Out', 'pending': 'Pending' }[visitor.status] || visitor.status;
  const statusClass = { 'checked-in': 's-checked-in', 'checked-out': 's-checked-out', 'pending': 's-pending' }[visitor.status];

  const checkInStr  = visitor.checkIn  ? fmtDateTime(visitor.checkIn)  : '—';
  const checkOutStr = visitor.checkOut ? fmtDateTime(visitor.checkOut) : '—';

  let durationStr = '—';
  if (visitor.checkIn && visitor.checkOut) {
    const mins = (new Date(visitor.checkOut) - new Date(visitor.checkIn)) / 60000;
    durationStr = formatDuration(mins);
  } else if (visitor.checkIn && visitor.status === 'checked-in') {
    const mins = (Date.now() - new Date(visitor.checkIn)) / 60000;
    durationStr = `${formatDuration(mins)} ↑`;
  }

  let actions = '';
  if (visitor.status === 'pending')    actions += `<button class="tbl-btn tbl-btn-in"  onclick="adminCheckin('${visitor.id}')">Check In</button>`;
  if (visitor.status === 'checked-in') actions += `<button class="tbl-btn tbl-btn-out" onclick="adminCheckout('${visitor.id}')">Check Out</button>`;
  actions += `<button class="tbl-btn tbl-btn-del" onclick="deleteVisitor('${visitor.id}')">Delete</button>`;

  return `
    <tr>
      <td><span class="badge-id">${esc(visitor.badgeId)}</span></td>
      <td>
        <div class="vcell-name">${esc(visitor.name)}</div>
        <div class="vcell-sub">${esc(visitor.phone)}${visitor.company ? ` · ${esc(visitor.company)}` : ''}</div>
      </td>
      <td>${esc(visitor.purpose)}</td>
      <td>${esc(visitor.host)}</td>
      <td>${checkInStr}</td>
      <td>${checkOutStr}</td>
      <td>${durationStr}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td><div class="tbl-actions">${actions}</div></td>
    </tr>
  `.trim();
}


// ════════════════════════════════════════════════
//  RENDER — VISITOR PASS
// ════════════════════════════════════════════════

function renderVisitorPass(visitor) {
  const pass     = el('visitorPassCard');
  const isIn     = visitor.status === 'checked-in';
  const initials = getInitials(visitor.name);

  let timesHTML = `
    <div class="pass-time-row">
      <span class="pass-time-key">Check-in</span>
      <span class="pass-time-val">${visitor.checkIn ? fmtDateTime(visitor.checkIn) : '—'}</span>
    </div>
    <div class="pass-time-row">
      <span class="pass-time-key">Check-out</span>
      <span class="pass-time-val">${visitor.checkOut ? fmtDateTime(visitor.checkOut) : 'Active…'}</span>
    </div>
  `;
  if (visitor.checkOut) {
    const mins = (new Date(visitor.checkOut) - new Date(visitor.checkIn)) / 60000;
    timesHTML += `
      <div class="pass-time-row">
        <span class="pass-time-key">Duration</span>
        <span class="pass-time-val">${formatDuration(mins)}</span>
      </div>
    `;
  }

  let statusBarHTML;
  if (isIn) {
    statusBarHTML = `
      <div class="pass-status-bar">
        <span class="pass-status-label in">● CHECKED IN</span>
        <button class="pass-checkout-btn" onclick="visitorSelfCheckout('${visitor.id}')">Check Out Now</button>
      </div>
    `;
  } else {
    statusBarHTML = `
      <div class="pass-status-bar">
        <span class="pass-status-label out">✓ CHECKED OUT</span>
      </div>
      <div class="pass-thankyou">
        <div class="pass-thankyou-emoji">👋</div>
        <div class="pass-thankyou-text">Thank you for visiting!</div>
        <div class="pass-thankyou-sub">We hope to see you again soon.</div>
      </div>
    `;
  }

  pass.innerHTML = `
    <div class="pass-head">
      <span class="pass-head-label">Visitor Pass</span>
      <span class="pass-badge-id">${esc(visitor.badgeId)}</span>
    </div>
    <div class="pass-identity">
      <div class="pass-avatar">${initials}</div>
      <div>
        <div class="pass-name">${esc(visitor.name)}</div>
        <div class="pass-sub">${visitor.company ? esc(visitor.company) : 'Individual visitor'}</div>
      </div>
    </div>
    <div class="pass-details">
      <div class="pass-row">
        <span class="pass-row-icon">🎯</span>
        <div><div class="pass-row-key">Purpose</div><div class="pass-row-val">${esc(visitor.purpose)}</div></div>
      </div>
      <div class="pass-row">
        <span class="pass-row-icon">👤</span>
        <div><div class="pass-row-key">Meeting with</div><div class="pass-row-val">${esc(visitor.host)}</div></div>
      </div>
      ${visitor.phone ? `<div class="pass-row"><span class="pass-row-icon">📱</span><div><div class="pass-row-key">Phone</div><div class="pass-row-val">${esc(visitor.phone)}</div></div></div>` : ''}
    </div>
    <div class="pass-times">${timesHTML}</div>
    ${statusBarHTML}
  `;
}


// ════════════════════════════════════════════════
//  RENDER — TASK SECTION
// ════════════════════════════════════════════════

function renderTaskSection() {
  const q = (el('searchInput')?.value || '').trim().toLowerCase();
  const filtered = state.tasks.filter(t => {
    const filt = state.taskFilter === 'all' ? true : state.taskFilter === 'active' ? !t.completed : t.completed;
    const search = !q || t.title.toLowerCase().includes(q) || (t.category && t.category.toLowerCase().includes(q));
    return filt && search;
  });

  const listEl  = el('taskList');
  const emptyEl = el('emptyState');

  if (filtered.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    const msgs = { all: ['No tasks yet.','Add a task above.'], active: ['No active tasks.','Check off a task or add a new one.'], completed: ['Nothing completed yet.','Mark tasks done to see them here.'] };
    const [t, s] = msgs[state.taskFilter] || msgs.all;
    setText('emptyTitle', t); setText('emptySub', s);
  } else {
    emptyEl.classList.add('hidden');
    listEl.innerHTML = filtered.map(taskCardHTML).join('');
  }

  // Counts
  const total  = state.tasks.length;
  const done   = state.tasks.filter(t => t.completed).length;
  const active = total - done;
  setText('countAll', total); setText('countActive', active); setText('countDone', done);
  setText('taskProgress', `${done} of ${total} done`);
}

function taskCardHTML(task) {
  const pLabel    = { high:'🔴 High', medium:'🟡 Medium', low:'🟢 Low' }[task.priority] || 'Medium';
  const priClass  = task.completed ? '' : ` pri-${task.priority}`;
  const dateBadge = task.dueDate ? buildDateBadge(task.dueDate, task.completed) : '';
  const tagBadge  = task.category ? `<span class="badge badge-tag">${esc(task.category)}</span>` : '';
  return `
    <div class="task-card${task.completed ? ' task-done' : ''}${priClass}">
      <button class="task-checkbox${task.completed ? ' checked' : ''}" onclick="toggleTask('${task.id}')">${task.completed ? '✓' : ''}</button>
      <div class="task-body">
        <span class="task-title">${esc(task.title)}</span>
        <div class="task-meta">
          <span class="badge priority-${task.priority}">${pLabel}</span>
          ${tagBadge}${dateBadge}
        </div>
      </div>
      <button class="task-delete" onclick="deleteTask('${task.id}')">✕</button>
    </div>
  `.trim();
}

function buildDateBadge(dateStr, completed) {
  const date  = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff  = Math.round((date - today) / 864e5);
  const label = diff === 0 ? '📅 Today' : diff === 1 ? '📅 Tomorrow' : diff === -1 ? '📅 Yesterday'
    : `📅 ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
  const cls = !completed && diff < 0 ? 'badge-overdue' : 'badge-date';
  return `<span class="badge ${cls}">${label}</span>`;
}


// ════════════════════════════════════════════════
//  MODAL
// ════════════════════════════════════════════════

function openModal() {
  el('addVisitorModal').classList.remove('hidden');
  el('mDate').value = todayDate();
  el('mName').focus();
}

function closeModal() {
  el('addVisitorModal').classList.add('hidden');
  ['mName','mPhone','mEmail','mCompany','mHost','mDate'].forEach(id => el(id).value = '');
  el('mPurpose').value = '';
  el('mStatus').value  = 'pending';
  el('modalError').classList.add('hidden');
}


// ════════════════════════════════════════════════
//  VIEW ROUTING
// ════════════════════════════════════════════════

function showView(name) {
  ['loginView', 'adminView', 'visitorView'].forEach(id => el(id).classList.add('hidden'));
  el(name + 'View').classList.remove('hidden');
}


// ════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════

const el  = id => document.getElementById(id);
const v   = id => el(id)?.value ?? '';

function setText(id, text) {
  const node = el(id);
  if (node) node.textContent = text;
}

function showError(errorEl, msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function weekAgoDate() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDuration(minutes) {
  if (minutes < 1)  return '< 1m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60), m = Math.round(minutes % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}


// ════════════════════════════════════════════════
//  EVENT WIRING
// ════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  seedDemoData(); // Populates demo data on first load; remove once backend is wired in

  // ── Login ──
  el('adminLoginBtn').addEventListener('click', adminLogin);
  el('adminUsername').addEventListener('keydown', e => e.key === 'Enter' && el('adminPassword').focus());
  el('adminPassword').addEventListener('keydown', e => e.key === 'Enter' && adminLogin());

  el('visitorCheckinBtn').addEventListener('click', visitorCheckin);
  el('vName').addEventListener('keydown',    e => e.key === 'Enter' && el('vPhone').focus());
  el('vPhone').addEventListener('keydown',   e => e.key === 'Enter' && el('vEmail').focus());
  el('vEmail').addEventListener('keydown',   e => e.key === 'Enter' && el('vPurpose').focus());
  el('vHost').addEventListener('keydown',    e => e.key === 'Enter' && visitorCheckin());

  // Role tabs
  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isAdmin = tab.dataset.role === 'admin';
      el('adminLoginForm').classList.toggle('hidden', !isAdmin);
      el('visitorCheckinForm').classList.toggle('hidden', isAdmin);
      if (isAdmin) el('adminUsername').focus();
      else         el('vName').focus();
    });
  });

  // ── Admin dashboard ──
  el('adminLogoutBtn').addEventListener('click', adminLogout);
  el('visitorBackBtn').addEventListener('click', visitorBack);

  // Visitor filter tabs
  document.querySelectorAll('.vtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.vtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.visitorFilter = tab.dataset.vfilter;
      renderVisitorTable();
    });
  });

  // Add visitor modal
  el('addVisitorBtn').addEventListener('click', openModal);
  el('closeModalBtn').addEventListener('click', closeModal);
  el('saveVisitorBtn').addEventListener('click', saveVisitorFromModal);
  el('addVisitorModal').addEventListener('click', e => { if (e.target === el('addVisitorModal')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ── Tasks ──
  el('addTaskBtn').addEventListener('click', addTask);
  el('taskInput').addEventListener('keydown', e => e.key === 'Enter' && addTask());
  el('searchInput').addEventListener('input', renderTaskSection);

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.taskFilter = tab.dataset.filter;
      renderTaskSection();
    });
  });

  // Pre-fill login fields for demo convenience
  el('adminUsername').value = 'admin';
  el('adminPassword').value = 'admin@123';
});
