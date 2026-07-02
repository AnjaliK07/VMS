# VMS Product Backlog
## EPICs · User Stories · Tasks
> Visitor Management System — IIM Lucknow OIG
> Version 1.0 | Status: Draft

---

## Personas

| ID | Persona | Description | Primary Goal |
|----|---------|-------------|--------------|
| P1 | **Visitor** | External person arriving at premises | Check in quickly, receive badge, find host |
| P2 | **Security Guard** | Staff at entry/exit gate | Verify, log, and manage all visitor movement |
| P3 | **Admin** | Operations manager with full system access | Oversee visitors, manage tasks, run reports |
| P4 | **Host / Employee** | Internal staff member receiving a visitor | Know when guest has arrived, approve/deny entry |
| P5 | **Super Admin** | IT owner / system administrator | Manage users, configure system rules, audit logs |

---

## EPIC Overview

| Epic ID | Title | Priority | Personas |
|---------|-------|----------|----------|
| EP-01 | Authentication & Role-Based Access | 🔴 Critical | All |
| EP-02 | Visitor Self-Service Check-in | 🔴 Critical | Visitor, Guard |
| EP-03 | Guard-Managed Entry & Exit | 🔴 Critical | Guard, Visitor, Admin |
| EP-04 | Host Notification & Approval Flow | 🟠 High | Host, Admin, Guard |
| EP-05 | Admin Dashboard & Visitor Log | 🔴 Critical | Admin |
| EP-06 | Pre-Registration & Appointments | 🟠 High | Admin, Host, Visitor |
| EP-07 | Digital Visitor Pass & Badge | 🟠 High | Visitor, Guard |
| EP-08 | Task Management | 🟡 Medium | Admin |
| EP-09 | Notifications & Alerts | 🟠 High | Host, Guard, Admin |
| EP-10 | Reports & Analytics | 🟡 Medium | Admin, Super Admin |
| EP-11 | System Configuration & User Management | 🟡 Medium | Super Admin |

---

## EP-01 — Authentication & Role-Based Access Control

**Goal:** Every user type can securely log in, access only their permitted screens, and log out safely.

---

### US-01.1 — Admin Login
**As an Admin, I want to log in with my credentials so that I can access the full dashboard securely.**

**Acceptance Criteria:**
- Admin enters username + password and clicks Login
- Incorrect credentials show an inline error; correct credentials redirect to Admin Dashboard
- Login fields pre-filled with default credentials for demo; cleared in production
- Session persists across page refresh; logs out on explicit action

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-01.1.1 | Design login page with split-panel layout (brand left, form right) | 🎨 Design | High |
| T-01.1.2 | Build role-tab toggle UI (Admin / Visitor) with animation | 🖥️ Frontend | High |
| T-01.1.3 | Implement admin login form with validation and shake error state | 🖥️ Frontend | High |
| T-01.1.4 | `POST /api/auth/login` — validate credentials, return JWT token | ⚙️ Backend | High |
| T-01.1.5 | Store session token in httpOnly cookie or localStorage with expiry | ⚙️ Backend | High |
| T-01.1.6 | Redirect to admin dashboard on success; show error toast on failure | 🖥️ Frontend | High |
| T-01.1.7 | Write unit tests for auth validation logic | 🧪 Testing | Medium |

---

### US-01.2 — Guard Login
**As a Security Guard, I want a simplified login screen so that I can quickly access the check-in/out tools at the gate.**

**Acceptance Criteria:**
- Guard has a separate login route (`/guard`) with PIN or username+password
- Guard view shows only check-in, check-out, and current visitor list — no admin controls
- Guard session auto-locks after 5 minutes of inactivity (configurable)
- Guard cannot access admin dashboard or task management

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-01.2.1 | Create dedicated Guard login page/tab with PIN keypad UI | 🎨 Design | High |
| T-01.2.2 | Build Guard view — simplified layout with check-in form + live visitor list | 🖥️ Frontend | High |
| T-01.2.3 | `POST /api/auth/guard-login` — validate guard credentials | ⚙️ Backend | High |
| T-01.2.4 | Implement role-based route protection middleware | ⚙️ Backend | High |
| T-01.2.5 | Add auto-lock/screen-saver after idle timeout | 🖥️ Frontend | Medium |
| T-01.2.6 | Test guard cannot access `/admin` routes | 🧪 Testing | High |

---

### US-01.3 — Visitor Portal Access
**As a Visitor, I want to access the check-in kiosk without needing an account so that I can register myself quickly.**

**Acceptance Criteria:**
- Visitor tab on login screen opens a self-service check-in form — no password required
- Form collects: Full Name, Phone, Email (optional), Purpose, Host, Company (optional)
- Visitor is uniquely identified by phone number for returning visit lookup
- After submission, visitor is redirected to their digital pass

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-01.3.1 | Design visitor check-in form with clear field labels and CTA | 🎨 Design | High |
| T-01.3.2 | Build visitor self-service form with validation | 🖥️ Frontend | High |
| T-01.3.3 | Auto-detect returning visitor by phone number and pre-fill form | 🖥️ Frontend | Medium |
| T-01.3.4 | `POST /api/visitors/checkin` — create visitor record, return badge | ⚙️ Backend | High |
| T-01.3.5 | `GET /api/visitors/returning?phone=xxx` — lookup returning visitors | ⚙️ Backend | Medium |

---

### US-01.4 — Logout & Session Expiry
**As any logged-in user, I want my session to expire after inactivity so that unauthorised access is prevented.**

**Acceptance Criteria:**
- All roles have a Logout button visible at all times
- Sessions expire after configurable idle period (default: 30 min admin, 5 min guard)
- On expiry, user is redirected to login with a "Session expired" message
- Visitor portal has no session (stateless) — pass is tied to badge ID only

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-01.4.1 | Implement logout button and clear local session/token | 🖥️ Frontend | High |
| T-01.4.2 | `POST /api/auth/logout` — invalidate server-side token | ⚙️ Backend | High |
| T-01.4.3 | Add idle timer middleware; trigger auto-logout and redirect | 🖥️ Frontend | Medium |
| T-01.4.4 | Show session-expiry toast/modal before auto-logout (30s warning) | 🖥️ Frontend | Medium |
| T-01.4.5 | Test session tokens are fully invalidated on logout | 🧪 Testing | High |

---

## EP-02 — Visitor Self-Service Check-in

**Goal:** Visitors can independently check themselves in at a kiosk or their own device with minimal friction.

---

### US-02.1 — New Visitor Registration & Check-in
**As a Visitor, I want to fill in my details on the kiosk so that I can check in without needing a guard's help.**

**Acceptance Criteria:**
- Form fields: Full Name*, Phone*, Email, Purpose*, Person to Meet*, Company
- Required fields validated before submission; error shown inline
- On successful submission: unique Badge ID generated (e.g. VMS-2026-1001)
- Check-in timestamp recorded automatically
- Visitor immediately sees their Digital Pass after submission

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-02.1.1 | Design kiosk-optimised check-in form (large touch targets) | 🎨 Design | High |
| T-02.1.2 | Build and validate self-service check-in form | 🖥️ Frontend | High |
| T-02.1.3 | Implement badge ID generation logic (sequential, year-prefixed) | ⚙️ Backend | High |
| T-02.1.4 | `POST /api/visitors/checkin` — persist record with checkIn timestamp | ⚙️ Backend | High |
| T-02.1.5 | Render digital visitor pass after successful check-in | 🖥️ Frontend | High |
| T-02.1.6 | Notify host via email/SMS that visitor has arrived (trigger hook) | ⚙️ Backend | Medium |
| T-02.1.7 | Add camera/photo capture option for visitor photo (optional) | 🖥️ Frontend | Low |

---

### US-02.2 — Returning Visitor Check-in
**As a returning Visitor, I want my details to be pre-filled when I enter my phone number so that I can check in faster.**

**Acceptance Criteria:**
- Phone number field triggers auto-lookup on blur/after 10 digits
- If a match is found: Name, Email, Company auto-populated
- Visitor can confirm or edit pre-filled data
- Previous visit history shown: "Last visit: 3 Jun 2026"

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-02.2.1 | Add debounced phone lookup on check-in form blur | 🖥️ Frontend | Medium |
| T-02.2.2 | `GET /api/visitors/returning?phone=` — return last visitor profile | ⚙️ Backend | Medium |
| T-02.2.3 | Pre-fill form fields from returned profile with visual indicator | 🖥️ Frontend | Medium |
| T-02.2.4 | Display "last visit" info below name field | 🖥️ Frontend | Low |
| T-02.2.5 | Write tests for returning-visitor lookup edge cases | 🧪 Testing | Medium |

---

### US-02.3 — Visitor Self Check-out
**As a Visitor, I want to check myself out from the digital pass page so that my exit is recorded without needing a guard.**

**Acceptance Criteria:**
- Digital pass shows "Check Out Now" button when status is Checked In
- On checkout: status updates to Checked Out, checkOut timestamp recorded
- Duration (time inside) displayed on updated pass
- Thank-you screen shown with total visit duration
- Guard dashboard updates in real-time to reflect check-out

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-02.3.1 | Show/hide check-out button based on current visitor status | 🖥️ Frontend | High |
| T-02.3.2 | `PATCH /api/visitors/:id/checkout` — record checkOut timestamp | ⚙️ Backend | High |
| T-02.3.3 | Render post-checkout thank-you screen with duration | 🖥️ Frontend | High |
| T-02.3.4 | Update visitor record live in admin/guard dashboard | ⚙️ Backend | Medium |
| T-02.3.5 | Trigger host notification: "Your visitor has left" | ⚙️ Backend | Low |

---

## EP-03 — Guard-Managed Entry & Exit

**Goal:** The Security Guard can efficiently manage visitor flow at the gate — checking in, verifying, issuing passes, and logging exits.

---

### US-03.1 — Guard Checks in Walk-in Visitor
**As a Guard, I want to register a visitor who walks in without pre-registering so that no visitor enters unlogged.**

**Acceptance Criteria:**
- Guard has a quick-add visitor form in their dashboard
- Form auto-focuses on Name field for fast entry
- Guard can select purpose and host from dropdowns
- Submission creates record + prints/displays badge ID
- Visitor is immediately visible in "Currently Inside" list

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-03.1.1 | Design guard view with quick-add panel always visible | 🎨 Design | High |
| T-03.1.2 | Build guard-specific check-in form (streamlined, fewer fields) | 🖥️ Frontend | High |
| T-03.1.3 | Auto-focus first field on page load for kiosk speed | 🖥️ Frontend | Medium |
| T-03.1.4 | Reuse `POST /api/visitors/checkin` with guard role header | ⚙️ Backend | High |
| T-03.1.5 | Show generated badge ID prominently after check-in | 🖥️ Frontend | High |
| T-03.1.6 | Add print-badge button to trigger browser print for badge template | 🖥️ Frontend | Medium |

---

### US-03.2 — Guard Verifies Visitor Identity
**As a Guard, I want to verify a visitor's identity against their ID so that unauthorised persons are not granted entry.**

**Acceptance Criteria:**
- Guard can mark an ID as verified (checkbox/toggle) on visitor record
- ID type recorded: Aadhaar / PAN / Passport / Employee ID / Other
- Unverified visitors are flagged with a warning badge in the log
- Admin can view ID verification status in visitor table

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-03.2.1 | Add ID type dropdown + "Verified" toggle to guard check-in form | 🖥️ Frontend | High |
| T-03.2.2 | Add `idType` and `idVerified` fields to visitor data model | 🗄️ Database | High |
| T-03.2.3 | `PATCH /api/visitors/:id` — update ID verification status | ⚙️ Backend | High |
| T-03.2.4 | Show "⚠ Unverified" warning badge in admin visitor table | 🖥️ Frontend | Medium |
| T-03.2.5 | Add ID photo capture (optional camera input) | 🖥️ Frontend | Low |

---

### US-03.3 — Guard Processes Check-out at Gate
**As a Guard, I want to check out visitors at the exit gate so that exit times are accurately logged.**

**Acceptance Criteria:**
- Guard can search visitor by Badge ID, Name, or Phone in the "Currently Inside" list
- Clicking Check Out on a record updates status to Checked Out with timestamp
- Duration is calculated and shown in the visitor row
- Guard sees a real-time count of visitors currently inside

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-03.3.1 | Build "Currently Inside" live list in guard dashboard | 🖥️ Frontend | High |
| T-03.3.2 | Add search/filter by Name or Badge ID in the live list | 🖥️ Frontend | High |
| T-03.3.3 | One-click Check Out button per row in guard live list | 🖥️ Frontend | High |
| T-03.3.4 | `PATCH /api/visitors/:id/checkout` — shared with self-checkout | ⚙️ Backend | High |
| T-03.3.5 | Show live "X visitors inside" counter in guard header | 🖥️ Frontend | Medium |
| T-03.3.6 | Display duration beside each visitor in live list | 🖥️ Frontend | Medium |

---

### US-03.4 — Guard Manages Overstaying Visitors
**As a Guard, I want to see alerts for visitors who have been inside longer than expected so that overstays are caught and followed up on.**

**Acceptance Criteria:**
- Visitors checked in for > 4 hours (configurable) are highlighted in amber in the live list
- Guard sees a dedicated "Overstay" section or filter in their dashboard
- Guard can add a note to an overstaying visitor record
- Admin receives a notification when overstay threshold is breached

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-03.4.1 | Implement overstay detection in frontend (client-side timer) | 🖥️ Frontend | Medium |
| T-03.4.2 | Highlight overstay rows with amber colour and ⏱ icon | 🖥️ Frontend | Medium |
| T-03.4.3 | Add "Notes" text field to visitor record (guard-editable) | 🖥️ Frontend | Medium |
| T-03.4.4 | `PATCH /api/visitors/:id/note` — save guard note | ⚙️ Backend | Medium |
| T-03.4.5 | Backend cron job — fire overstay webhook/notification after threshold | ⚙️ Backend | Medium |
| T-03.4.6 | Allow admin to configure overstay threshold in system settings | ⚙️ Backend | Low |

---

### US-03.5 — Guard Denies Entry & Logs Reason
**As a Guard, I want to log a denied entry with a reason so that security incidents are fully documented.**

**Acceptance Criteria:**
- Guard can create a "Denied Entry" record (separate from check-in)
- Required fields: Visitor name, reason for denial, timestamp auto-set
- Denied entries appear in a separate section of admin log with a red badge
- Admin can view all denied entries in reports

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-03.5.1 | Add "Deny Entry" button/option in guard dashboard | 🖥️ Frontend | Medium |
| T-03.5.2 | Build denial form: name, phone, reason dropdown + notes | 🖥️ Frontend | Medium |
| T-03.5.3 | `POST /api/visitors/deny` — create denied-entry record | ⚙️ Backend | Medium |
| T-03.5.4 | Show denied entries in admin log with red "Denied" status badge | 🖥️ Frontend | Medium |
| T-03.5.5 | Include denial records in daily security report | ⚙️ Backend | Low |

---

## EP-04 — Host / Employee Notification & Approval Flow

**Goal:** Internal hosts are informed when their visitors arrive, can pre-approve expected guests, and can flag concerns.

---

### US-04.1 — Host Receives Arrival Notification
**As a Host/Employee, I want to receive a notification when my visitor checks in so that I can meet them promptly.**

**Acceptance Criteria:**
- On visitor check-in, system sends notification to host via email and/or SMS
- Notification includes: Visitor name, purpose, badge ID, check-in time
- Host can view a "My Visitors Today" summary from a link in the email
- Guard sees a "Notification sent" confirmation after check-in

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-04.1.1 | Design arrival notification email template (branded) | 🎨 Design | High |
| T-04.1.2 | Integrate email service (SendGrid / Nodemailer) for host notification | ⚙️ Backend | High |
| T-04.1.3 | Integrate SMS gateway (Twilio / AWS SNS) for host SMS | ⚙️ Backend | Medium |
| T-04.1.4 | `POST /api/notify/host` — trigger on visitor check-in | ⚙️ Backend | High |
| T-04.1.5 | Add host email field to visitor form (admin and guard) | 🖥️ Frontend | High |
| T-04.1.6 | Show "Host notified" confirmation chip after check-in | 🖥️ Frontend | Medium |
| T-04.1.7 | Build `GET /api/hosts/:id/visitors/today` — host's visitor summary | ⚙️ Backend | Medium |

---

### US-04.2 — Host Pre-approves Expected Visitor
**As a Host, I want to pre-register a guest before they arrive so that their check-in is faster and the guard is informed.**

**Acceptance Criteria:**
- Host can submit a pre-registration form (via shared link or internal portal)
- Form creates a "Pending" visitor record with scheduled date/time
- Guard sees pending visitors at the top of their list for the day
- On arrival, guard can convert pending → checked-in in one click

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-04.2.1 | Design host pre-registration form (minimal, shareable) | 🎨 Design | High |
| T-04.2.2 | Build pre-registration form page (accessible via unique link) | 🖥️ Frontend | High |
| T-04.2.3 | `POST /api/visitors/preregister` — create pending visitor record | ⚙️ Backend | High |
| T-04.2.4 | Show pending visitors at top of guard dashboard, sorted by schedule | 🖥️ Frontend | High |
| T-04.2.5 | One-click "Arrived" button converts pending → checked-in | 🖥️ Frontend | High |
| T-04.2.6 | Send pre-registration confirmation email to visitor with QR/pass link | ⚙️ Backend | Medium |
| T-04.2.7 | Notify host when pre-registered visitor actually arrives | ⚙️ Backend | Medium |

---

### US-04.3 — Host Denies / Flags an Unexpected Visitor
**As a Host, I want to flag that I am not expecting a particular visitor so that the guard can handle entry appropriately.**

**Acceptance Criteria:**
- Host receives notification and can respond: "Approve" / "Deny" / "Ask guard to hold"
- Guard sees real-time status update of host response
- Denied by host → record logged as "Host Denied"; visitor not permitted entry
- Guard gets an alert when host responds

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-04.3.1 | Add approval action buttons (Approve/Deny/Hold) to host notification email | 🎨 Design | Medium |
| T-04.3.2 | `POST /api/visitors/:id/host-response` — record host decision | ⚙️ Backend | Medium |
| T-04.3.3 | Real-time push to guard dashboard when host responds (WebSocket / polling) | ⚙️ Backend | Medium |
| T-04.3.4 | Show host-response status on visitor row in guard view | 🖥️ Frontend | Medium |
| T-04.3.5 | Auto-create denial log when host denies via notification | ⚙️ Backend | Medium |

---

## EP-05 — Admin Dashboard & Visitor Log

**Goal:** Admin has a comprehensive, real-time view of all visitor activity, can manage records, and take any action.

---

### US-05.1 — Admin Views Real-Time Visitor Stats
**As an Admin, I want to see live visitor statistics on my dashboard so that I know the current situation at a glance.**

**Acceptance Criteria:**
- Dashboard shows 4 stat cards: Today's Visitors, Currently Inside, Checked Out, Avg. Duration
- Stats update without page refresh (polling every 30s or WebSocket)
- Clicking a stat card filters the visitor log below

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-05.1.1 | Design stat card layout with colour-coded variants | 🎨 Design | High |
| T-05.1.2 | Build stat card components with animated number updates | 🖥️ Frontend | High |
| T-05.1.3 | `GET /api/stats/today` — return aggregated visitor stats | ⚙️ Backend | High |
| T-05.1.4 | Set up polling (30s) or WebSocket subscription for live updates | ⚙️ Backend | Medium |
| T-05.1.5 | Clicking stat card applies corresponding filter to visitor table | 🖥️ Frontend | Medium |

---

### US-05.2 — Admin Browses & Filters the Visitor Log
**As an Admin, I want to filter visitors by date range, status, purpose, and host so that I can find records quickly.**

**Acceptance Criteria:**
- Filter tabs: Today / This Week / All Time (default: Today)
- Search bar filters by name, phone, company, badge ID
- Status filter: All / Checked In / Checked Out / Pending / Denied
- Purpose filter dropdown
- Table columns: Badge ID, Visitor, Purpose, Host, Check-in, Check-out, Duration, Status, Actions

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-05.2.1 | Build responsive visitor log table with all required columns | 🖥️ Frontend | High |
| T-05.2.2 | Implement client-side date-range filter tabs | 🖥️ Frontend | High |
| T-05.2.3 | Implement live search across name, phone, badge ID | 🖥️ Frontend | High |
| T-05.2.4 | Add status filter dropdown above table | 🖥️ Frontend | Medium |
| T-05.2.5 | `GET /api/visitors?from=&to=&status=&search=` — filterable API endpoint | ⚙️ Backend | High |
| T-05.2.6 | Add column sort (click header to sort asc/desc) | 🖥️ Frontend | Low |
| T-05.2.7 | Paginate results (25 per page) with load-more or paging | 🖥️ Frontend | Medium |

---

### US-05.3 — Admin Manually Adds a Visitor
**As an Admin, I want to manually add a visitor record so that walk-ins or system failures are handled without data gaps.**

**Acceptance Criteria:**
- "Add Visitor" button opens a modal form
- All fields available including: name, phone, email, purpose, host, company, status, date
- Admin can set status as Pending, Checked In, or Checked Out
- Manual entries are tagged "Added by Admin" in the record

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-05.3.1 | Design Add Visitor modal with full form | 🎨 Design | High |
| T-05.3.2 | Build modal component with form validation | 🖥️ Frontend | High |
| T-05.3.3 | `POST /api/visitors` — create record with `createdBy: admin` tag | ⚙️ Backend | High |
| T-05.3.4 | Allow backdating check-in time (datetime picker) | 🖥️ Frontend | Medium |
| T-05.3.5 | Close modal on Escape key and backdrop click | 🖥️ Frontend | Low |

---

### US-05.4 — Admin Edits or Deletes a Visitor Record
**As an Admin, I want to edit incorrect visitor data and delete test/spam entries so that the log stays clean and accurate.**

**Acceptance Criteria:**
- Edit icon on each row opens pre-filled edit modal
- Admin can change any field except Badge ID and createdAt
- Delete requires confirmation ("Are you sure?") before removing record
- Deleted records can be soft-deleted (retained in audit log, not shown by default)

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-05.4.1 | Add Edit and Delete action buttons to visitor table row | 🖥️ Frontend | High |
| T-05.4.2 | Reuse modal for edit (pre-fill fields from selected record) | 🖥️ Frontend | High |
| T-05.4.3 | `PUT /api/visitors/:id` — update visitor record | ⚙️ Backend | High |
| T-05.4.4 | `DELETE /api/visitors/:id` — soft delete (set `deleted: true`) | ⚙️ Backend | High |
| T-05.4.5 | Build confirmation dialog component (reusable) | 🖥️ Frontend | Medium |
| T-05.4.6 | Add "Show deleted records" toggle in admin log | 🖥️ Frontend | Low |

---

## EP-06 — Pre-Registration & Appointment Scheduling

**Goal:** Visitors or hosts can pre-register expected visits so the guard is informed and check-in is one-click.

---

### US-06.1 — Admin Pre-registers an Expected Visitor
**As an Admin, I want to create a pending visitor record in advance so that scheduled visitors can be processed faster on arrival.**

**Acceptance Criteria:**
- Admin can set status as "Pending" and a scheduled date
- Pending visitors appear at the top of the visitor log, sorted by schedule time
- Visitor receives a confirmation email with their pre-registration details
- On arrival, pending → checked-in with one action

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-06.1.1 | Add "Scheduled Date & Time" fields to Add Visitor modal | 🖥️ Frontend | High |
| T-06.1.2 | `POST /api/visitors/preregister` — create pending record | ⚙️ Backend | High |
| T-06.1.3 | Sort pending visitors by schedule time in visitor log | 🖥️ Frontend | Medium |
| T-06.1.4 | Send pre-registration email to visitor with pass preview link | ⚙️ Backend | Medium |
| T-06.1.5 | One-click "Check In Now" converts pending → checked-in in table | 🖥️ Frontend | High |

---

### US-06.2 — Visitor Receives Pre-registration Confirmation
**As a Visitor, I want to receive a confirmation with my visit details before I arrive so that I know what to expect at the gate.**

**Acceptance Criteria:**
- Email sent with: visitor name, host, date/time, purpose, location
- Email includes a QR code or badge preview link
- Visitor can click link to view pass and check-in status before arrival
- Guard can scan QR or look up by badge ID on arrival

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-06.2.1 | Design pre-registration confirmation email template | 🎨 Design | High |
| T-06.2.2 | Generate unique pass URL: `/pass/:badgeId` | ⚙️ Backend | High |
| T-06.2.3 | `GET /api/visitors/pass/:badgeId` — return visitor pass data (public) | ⚙️ Backend | High |
| T-06.2.4 | Build public pass page (no login required, badge ID as token) | 🖥️ Frontend | High |
| T-06.2.5 | Generate QR code pointing to pass URL and embed in email | ⚙️ Backend | Medium |
| T-06.2.6 | Allow guard to look up visitor by scanning QR with device camera | 🖥️ Frontend | Low |

---

## EP-07 — Digital Visitor Pass & Badge

**Goal:** Every checked-in visitor receives a digital pass that serves as their identification inside the premises.

---

### US-07.1 — Visitor Receives Digital Pass After Check-in
**As a Visitor, I want to see my digital pass immediately after checking in so that I have proof of authorised entry.**

**Acceptance Criteria:**
- Pass displays: Visitor name, initials avatar, badge ID, purpose, host, company
- Check-in time and live duration shown
- Status indicator: CHECKED IN (green pulsing dot) / CHECKED OUT
- Pass is accessible via direct URL without logging in

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-07.1.1 | Design visitor pass card (physical badge aesthetic) | 🎨 Design | High |
| T-07.1.2 | Build digital pass component with all required fields | 🖥️ Frontend | High |
| T-07.1.3 | Generate and display initials avatar from visitor name | 🖥️ Frontend | Medium |
| T-07.1.4 | Live duration counter (updates every minute while checked in) | 🖥️ Frontend | Medium |
| T-07.1.5 | Implement public pass route `/pass/:badgeId` | 🖥️ Frontend | High |
| T-07.1.6 | Add "Share Pass" button to copy URL to clipboard | 🖥️ Frontend | Low |

---

### US-07.2 — Guard Validates Visitor Pass
**As a Guard, I want to verify a visitor's pass at exit by badge ID or QR so that only logged-in visitors leave the premises.**

**Acceptance Criteria:**
- Guard can search visitor by Badge ID in their live list
- QR code on digital pass can be scanned by guard's device to pull up the record
- Guard sees visitor status: Checked In / Already Checked Out / Not Found
- Scanning an already checked-out badge shows a warning

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-07.2.1 | Add badge ID search bar in guard exit panel | 🖥️ Frontend | High |
| T-07.2.2 | `GET /api/visitors/badge/:badgeId` — look up by badge | ⚙️ Backend | High |
| T-07.2.3 | Integrate QR scanner library for camera-based scan | 🖥️ Frontend | Medium |
| T-07.2.4 | Show visitor card preview when badge is found | 🖥️ Frontend | High |
| T-07.2.5 | Show warning/error for already checked-out or unknown badge IDs | 🖥️ Frontend | Medium |

---

## EP-08 — Task Management

**Goal:** Admin can manage operational to-do tasks alongside visitor management in one unified interface.

---

### US-08.1 — Admin Creates & Manages Tasks
**As an Admin, I want to create tasks with priority, due date, and tag so that I can manage operational work without switching tools.**

**Acceptance Criteria:**
- Task form: Title (required), Priority (High/Medium/Low), Due Date, Tag (optional)
- Task saved instantly; visible in list below
- Enter key submits task from title field
- Invalid submission (empty title) triggers shake animation + focus

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-08.1.1 | Build task add form with all fields and keyboard shortcut | 🖥️ Frontend | High |
| T-08.1.2 | `POST /api/tasks` — create task record | ⚙️ Backend | High |
| T-08.1.3 | Persist tasks to localStorage (frontend stub); swap to API | 🖥️ Frontend | High |
| T-08.1.4 | Add shake + error state on empty task submission | 🖥️ Frontend | Medium |

---

### US-08.2 — Admin Tracks Task Completion
**As an Admin, I want to mark tasks as done and see my completion progress so that I stay on top of my workload.**

**Acceptance Criteria:**
- Checkbox on each task toggles complete / active
- Completed tasks shown with strikethrough and greyed style
- Progress chip in section header: "X of Y done"
- Overdue tasks (past due date, not completed) highlighted in red

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-08.2.1 | Implement checkbox toggle with completion styling | 🖥️ Frontend | High |
| T-08.2.2 | `PATCH /api/tasks/:id` — update completed + completedAt | ⚙️ Backend | High |
| T-08.2.3 | Compute and display "X of Y done" progress chip | 🖥️ Frontend | Medium |
| T-08.2.4 | Highlight overdue task badges in red with pulse animation | 🖥️ Frontend | Medium |
| T-08.2.5 | Completed tasks move to bottom of list | 🖥️ Frontend | Low |

---

### US-08.3 — Admin Filters & Searches Tasks
**As an Admin, I want to filter tasks by status and search by keyword so that I find what I need without scrolling.**

**Acceptance Criteria:**
- Filter tabs: All / Active / Done — with count badges
- Search bar filters by title or tag in real-time
- Active filter persists within the session
- Priority colour-coded left border on each task card

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-08.3.1 | Build filter tab row with live count badges | 🖥️ Frontend | High |
| T-08.3.2 | Implement live search across task title and tag | 🖥️ Frontend | High |
| T-08.3.3 | Add priority-coloured left border to task cards | 🖥️ Frontend | Medium |
| T-08.3.4 | `GET /api/tasks?status=&search=` — filterable task endpoint | ⚙️ Backend | Medium |

---

## EP-09 — Notifications & Alerts

**Goal:** The right people are informed at the right time — host on arrival, guard on issues, admin on anomalies.

---

### US-09.1 — System Sends Configurable Notifications
**As an Admin, I want to configure which events trigger notifications and to whom so that alert fatigue is minimised.**

**Acceptance Criteria:**
- Notification settings page: toggle on/off per event type
- Events: Visitor Check-in, Visitor Check-out, Overstay, Denied Entry, Pre-registration
- Channels: Email, SMS, In-app toast
- Changes saved per admin user

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-09.1.1 | Design notification settings panel | 🎨 Design | Medium |
| T-09.1.2 | Build notification settings UI (toggle per event + channel) | 🖥️ Frontend | Medium |
| T-09.1.3 | `PUT /api/settings/notifications` — save notification prefs | ⚙️ Backend | Medium |
| T-09.1.4 | Implement event-driven notification dispatcher | ⚙️ Backend | High |
| T-09.1.5 | Integrate email provider (SendGrid) and SMS (Twilio) | ⚙️ Backend | High |
| T-09.1.6 | Build in-app toast notification component | 🖥️ Frontend | Medium |

---

### US-09.2 — Guard Receives Overstay Alert
**As a Guard, I want an in-app alert when a visitor has been inside longer than the allowed limit so that I can investigate.**

**Acceptance Criteria:**
- Visitor rows turn amber after configurable threshold (default: 4h)
- In-app alert appears in guard dashboard with visitor name + duration
- Alert is dismissible and logged
- Guard can click alert to view full visitor record

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-09.2.1 | Client-side timer flags visitors past overstay threshold | 🖥️ Frontend | Medium |
| T-09.2.2 | Show amber highlight + ⏱ icon on overstaying rows | 🖥️ Frontend | Medium |
| T-09.2.3 | Display dismissible overstay alert panel in guard view | 🖥️ Frontend | Medium |
| T-09.2.4 | Backend cron check every 15 min → fire alert webhook | ⚙️ Backend | Medium |
| T-09.2.5 | Log dismissed alerts in `alerts` table for audit | ⚙️ Backend | Low |

---

## EP-10 — Reports & Analytics

**Goal:** Admin and Super Admin can view, filter, and export data to understand visitor patterns and security posture.

---

### US-10.1 — Admin Views Daily Visitor Summary
**As an Admin, I want to see a daily summary report so that I can brief security leadership on visitor activity.**

**Acceptance Criteria:**
- Report shows: total visitors, by-purpose breakdown, peak hour, longest visit, avg duration
- Filterable by date (single day or date range)
- Printable / PDF export available
- Accessible from Admin dashboard via "Reports" section

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-10.1.1 | Design reports page with summary cards and chart placeholders | 🎨 Design | Medium |
| T-10.1.2 | Build daily summary report view | 🖥️ Frontend | Medium |
| T-10.1.3 | `GET /api/reports/daily?date=` — return aggregated daily stats | ⚙️ Backend | Medium |
| T-10.1.4 | Add purpose breakdown bar chart (Chart.js or Recharts) | 🖥️ Frontend | Medium |
| T-10.1.5 | Add peak-hours histogram | 🖥️ Frontend | Low |
| T-10.1.6 | Implement PDF export of daily report | ⚙️ Backend | Low |

---

### US-10.2 — Admin Exports Visitor Log to CSV
**As an Admin, I want to export the visitor log to a spreadsheet so that I can share records with security or compliance teams.**

**Acceptance Criteria:**
- "Export CSV" button available on visitor log
- Export respects currently applied filters (date range, status)
- CSV includes all columns: Badge ID, Name, Phone, Email, Purpose, Host, Company, Check-in, Check-out, Duration, Status
- Export triggers browser download immediately

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-10.2.1 | Add Export CSV button to visitor log header | 🖥️ Frontend | Medium |
| T-10.2.2 | Generate CSV from filtered visitor data client-side (Papa Parse) | 🖥️ Frontend | Medium |
| T-10.2.3 | `GET /api/visitors/export?format=csv&from=&to=&status=` | ⚙️ Backend | Medium |
| T-10.2.4 | Include all columns, format timestamps, calculate duration in export | ⚙️ Backend | Medium |
| T-10.2.5 | Add Excel (.xlsx) export option | ⚙️ Backend | Low |

---

## EP-11 — System Configuration & User Management

**Goal:** Super Admin can configure the system, manage user accounts, and audit all system activity.

---

### US-11.1 — Super Admin Manages System Users
**As a Super Admin, I want to create, edit, and deactivate user accounts so that access is always controlled and up to date.**

**Acceptance Criteria:**
- User management table: Name, Email, Role, Status, Last Login, Actions
- Roles available: Super Admin, Admin, Guard
- Super Admin can reset passwords, change roles, deactivate accounts
- Deactivated users cannot log in; their records remain intact

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-11.1.1 | Build User Management page (Super Admin only) | 🖥️ Frontend | High |
| T-11.1.2 | `GET /api/users` — list all users | ⚙️ Backend | High |
| T-11.1.3 | `POST /api/users` — create new user | ⚙️ Backend | High |
| T-11.1.4 | `PATCH /api/users/:id` — update role, status | ⚙️ Backend | High |
| T-11.1.5 | `POST /api/users/:id/reset-password` — send reset email | ⚙️ Backend | Medium |
| T-11.1.6 | Role-based menu: Super Admin sees Users & Config; Admin does not | 🖥️ Frontend | High |

---

### US-11.2 — Super Admin Configures System Rules
**As a Super Admin, I want to configure system-wide rules so that the VMS behaves according to our organisation's policies.**

**Acceptance Criteria:**
- Configurable settings: overstay threshold, session timeout, allowed purposes, ID types
- Changes take effect immediately without redeployment
- Settings page is accessible only to Super Admin
- All setting changes are logged in audit trail

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-11.2.1 | Build System Settings page with organised sections | 🎨 Design | Medium |
| T-11.2.2 | Implement editable fields for all configurable rules | 🖥️ Frontend | Medium |
| T-11.2.3 | `GET /api/settings` and `PUT /api/settings` — CRUD for config | ⚙️ Backend | Medium |
| T-11.2.4 | Store settings in DB (not hard-coded); read at runtime | 🗄️ Database | Medium |
| T-11.2.5 | Log every settings change in `audit_log` table | ⚙️ Backend | Medium |

---

### US-11.3 — Super Admin Reviews Audit Log
**As a Super Admin, I want to view an audit log of all system actions so that I can investigate security incidents.**

**Acceptance Criteria:**
- Audit log table: Timestamp, User, Action, Resource, Details, IP Address
- Filterable by date, user, action type
- Immutable — no one can edit or delete audit entries
- Exportable to CSV

**Tasks:**
| Task ID | Description | Type | Priority |
|---------|-------------|------|----------|
| T-11.3.1 | Build Audit Log page with full table and filters | 🖥️ Frontend | Medium |
| T-11.3.2 | `GET /api/audit?from=&to=&user=&action=` | ⚙️ Backend | Medium |
| T-11.3.3 | Implement audit logging middleware — fires on every mutating API call | ⚙️ Backend | High |
| T-11.3.4 | Prevent any DELETE or UPDATE on `audit_log` table | 🗄️ Database | High |
| T-11.3.5 | Export audit log to CSV with all columns | ⚙️ Backend | Low |

---

## Summary

| Metric | Count |
|--------|-------|
| EPICs | 11 |
| User Stories | 37 |
| Tasks | 147 |
| Frontend Tasks | ~68 |
| Backend Tasks | ~55 |
| Design Tasks | ~12 |
| Database Tasks | ~6 |
| Testing Tasks | ~6 |

### Task Type Legend
| Icon | Type |
|------|------|
| 🎨 | Design / UX |
| 🖥️ | Frontend (HTML/CSS/JS) |
| ⚙️ | Backend API |
| 🗄️ | Database / Schema |
| 🧪 | Testing / QA |

---

*VMS Product Backlog · IIM Lucknow OIG · Frontend v2.0 · Backend integration pending*
