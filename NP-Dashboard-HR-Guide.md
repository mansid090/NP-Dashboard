# NowPurchase Probation Dashboard
### HR User Guide — Complete Feature Reference

---

## What Is This Dashboard?

The **NowPurchase Probation Dashboard** is a web-based viewing tool for HR to track every probation employee's weekly performance — pulled automatically from their manager's Google Sheet.

**This is a view-only tool.** No data is entered here. The manager fills in the Google Sheet. The dashboard reads and displays it.

> If you can use a browser, you can use this dashboard. No technical knowledge needed.

---

## How the Hierarchy Works

The dashboard is built around a two-level structure:

```
Manager
 ├── Employee 1  →  their Google Sheet  →  dashboard reads it
 ├── Employee 2  →  their Google Sheet  →  dashboard reads it
 └── Employee 3  →  their Google Sheet  →  dashboard reads it

Manager 2
 ├── Employee 4  →  their Google Sheet  →  dashboard reads it
 └── Employee 5  →  their Google Sheet  →  dashboard reads it
```

- **Every manager** is added once in Settings with their name and role
- **Every employee** is linked to exactly one manager
- **Every employee** has their own Google Sheet that their manager fills in weekly
- The dashboard uses the Manager dropdown to filter — select a manager to see only their team, or select "All Managers" to see everyone

---

## What You Can See

| Section | What It Shows |
|---|---|
| **Employee List (left panel)** | All employees, their manager, and their average completion score |
| **Probation Status** | Joining date, probation end date, days remaining, progress bar |
| **Overall Summary** | Total weeks tracked, average score, best score ever |
| **Monthly Performance Gauge** | Average completion % for any month — shown as a visual dial |
| **Weekly Remarks** | Every week's goals, learnings, comments and manager score as expandable cards |
| **Export Report** | Download any employee's data as Excel or CSV |

---

## How the Data Flows In

```
Manager fills in their employee's Google Sheet weekly
          ↓
Dashboard fetches the sheet automatically
          ↓
HR views the data — scores, goals, comments, trends
```

Updates appear in the dashboard:
- **Instantly** — switch back to the dashboard tab after the manager fills the sheet and it auto-fetches
- **Every 2 minutes** — silent background refresh while you have the tab open
- **Manually** — click **Refresh ↺** in the header at any time

---

## Setting Up: Step-by-Step

### Step 1 — Open the Dashboard
Open the dashboard URL in Chrome (recommended). Bookmark it for easy access.

---

### Step 2 — Add Managers

Each reporting manager must be added once.

1. Click **Settings ⚙** (top-right)
2. Go to the **Managers** tab
3. Click **+ Add Manager**
4. Enter:
   - **Full Name** — e.g. Sanjay Mehta
   - **Role / Title** — e.g. Head of Sales
5. Click **Add**
6. Repeat for every manager

> Managers are used as a filter on the dashboard. Employees are assigned to a manager, so adding managers first is important.

---

### Step 3 — Add Employees

Each probation employee is added and linked to their manager.

1. Click **Settings ⚙**
2. Go to the **Employees** tab
3. Click **+ Add Employee**
4. Enter:
   - **Full Name** — e.g. Ankit Sharma
   - **Manager** — select from the dropdown (must be added in Step 2 first)
   - **Joining Date** — the date they joined the company (used to calculate probation timeline)
   - **Google Sheet URL** — the link to their 30-60-90 tracker sheet (see Step 4)
5. Click **Add**
6. Repeat for every employee

---

### Step 4 — Link the Google Sheet

Each employee needs a Google Sheet maintained by their manager in the **30-60-90 tracker format**.

**To get the sheet link:**

**Option A — Publish as CSV (most reliable):**
1. Manager opens the employee's Google Sheet
2. Click **File → Share → Publish to web**
3. Select the sheet tab → select **Comma-separated values (.csv)**
4. Click **Publish** → copy the URL that appears
5. Paste that URL into the **Google Sheet URL** field in Settings for that employee

**Option B — Share link:**
1. Click **Share** in the sheet
2. Change access to **"Anyone with the link can view"**
3. Copy the link → paste into Settings for that employee

> If no sheet URL is added, the dashboard shows sample/demo data for that employee.

---

### Step 5 — Verify the Setup

After adding employees and linking sheets:
- Go back to the main dashboard
- Select a manager from the **Manager** dropdown — you should see their employees listed on the left
- Click an employee — their data should load on the right

---

## The Dashboard Layout — Every Element Explained

```
┌────────────────────────────────────────────────────────────────┐
│  Probation Dashboard                [Refresh ↺]  [Settings ⚙] │  ← Header
├────────────────────────────────────────────────────────────────┤
│  Manager: [All Managers ▼]   Employee: [Select ▼]   12 Total  │  ← Filter Bar
├──────────────────────┬─────────────────────────────────────────┤
│                      │                                          │
│   EMPLOYEE LIST      │   EMPLOYEE DETAIL                       │
│   (left panel)       │   (right panel)                         │
│                      │                                          │
│  ┌──────────────┐    │   Employee Name + Manager Name/Role     │
│  │ Ankit Sharma │    │                                          │
│  │ Sanjay Mehta │    │   ┌─────────────┐  ┌────────────────┐  │
│  │ Avg: 75%  ░░ │    │   │  Probation  │  │    Monthly     │  │
│  └──────────────┘    │   │   Status    │  │  Performance   │  │
│                      │   └─────────────┘  └────────────────┘  │
│  ┌──────────────┐    │                                          │
│  │ Kavya Reddy  │    │   Weekly Performance Remarks            │
│  │ Sanjay Mehta │    │   ┌────────────────────────────────┐   │
│  │ Avg: 80%  ░░░│    │   │ 5/05/26 – 11/05/26   80% ▼   │   │
│  └──────────────┘    │   └────────────────────────────────┘   │
│                      │   ┌────────────────────────────────┐   │
│                      │   │ 12/05/26 – 18/05/26  70% ▼   │   │
│                      │   └────────────────────────────────┘   │
│                      │                                          │
│                      │   Export Report                         │
└──────────────────────┴─────────────────────────────────────────┘
```

---

## Feature-by-Feature Breakdown

### Filter Bar
- **Manager dropdown** — filters the employee list to show only that manager's team. Select "All Managers" to see everyone
- **Employee dropdown** — alternatively, search directly by employee name across all managers
- **Employee count chip** — shows total number of employees currently visible

---

### Employee List (Left Panel)

Each card shows:
- Employee's name and initials avatar (colour-coded automatically)
- Their manager's name and role
- **Average completion score** shown as a percentage and a colour bar
  - Green bar = high performance (90%+)
  - Blue bar = good (70–89%)
  - Amber bar = average (50–69%)
  - Red bar = needs attention (below 50%)
- Probation status badge (Active / Overdue)
- Click any card to load their full detail on the right

---

### Employee Detail Header

When an employee is selected, the top of the right panel shows:
- Employee's full name
- Manager name and role they report to
- A **Refresh** button — click to force-fetch the latest data from their sheet immediately
- An error message if their sheet is not accessible or not in the right format

---

### Probation Status Card

Shows the employee's probation timeline calculated from their **Joining Date** (set in Settings):

| Field | Where it comes from |
|---|---|
| Joining Date | Entered manually in Settings when adding the employee |
| Probation End Date | Joining Date + 90 days (calculated automatically) |
| Days Remaining | Today's date vs probation end date |
| Progress bar | % of the 90-day probation period elapsed |
| Overdue status | Appears if today is past the end date and probation hasn't been extended |

**Below the probation timeline — Overall Summary:**
- **Total Weeks** — how many weekly entries exist in the linked sheet
- **Avg Score** — average completion % across all weeks
- **Best Score** — highest single-week completion % recorded

---

### Monthly Performance Gauge

A semi-circular dial that shows the **average task completion % for a selected month**.

- Use the **month dropdown** to switch between months
- The dial fills and changes colour based on the average:
  - 90%+ → Green (Excellent)
  - 70–89% → Blue (Good)
  - 50–69% → Amber (Average)
  - Below 50% → Red (Needs Improvement)
- Below the dial: a **week-by-week breakdown** for that month
- A **trend indicator** shows if this month is up or down vs the previous month

> Months are detected automatically from the week date ranges in the Google Sheet.

---

### Weekly Performance Remarks

All weekly entries from the Google Sheet, shown as expandable cards — newest first.

**Week selector at the top:**
- Toggle individual weeks on/off to focus on specific periods
- "Select all" / "Deselect all" toggle

**Each week card shows:**

| Field | Who fills it | In the Sheet |
|---|---|---|
| Week date range | Auto (from sheet) | Row: "Week Starts from" → Column C |
| One Thing | Employee | Row: "One Thing" → Column B |
| Additional Goal | Employee | Row: "Additional Goal" → Column B |
| Learnings of the Week | Employee | Row: "Learnings of the Week" → Column B |
| Self Comments | Employee | Row: "Self Comments" → Column B |
| Manager Score | Manager | Row: "Manager Score" → Column B (negative number) |
| Manager Comment | Manager | Row: "Manager Comment" → Column B |

The score badge on each card is colour-coded:
- Green = 90%+ · Blue = 70–89% · Amber = 50–69% · Red = below 50%

---

### Export Report

Download an employee's tracker data as a file.

| Option | What It Exports |
|---|---|
| Full Employee Report | All weeks for the selected employee |
| Selected Weeks | Only the weeks currently toggled on |
| Selected Month | Only the weeks in the selected month |
| All Employees | Every employee's data in one file |

Formats available: **Excel (.xlsx)** or **CSV**

---

## The Google Sheet Format

Each employee's Google Sheet must follow this exact layout.
One block of **7 rows per week**, repeated downward for every week:

| Column A | Column B | Column C |
|---|---|---|
| `Week Starts from` | *(leave blank)* | `5/05/26 - 11/05/26` |
| `One Thing` | Employee fills this | |
| `Additional Goal` | Employee fills this | |
| `Learnings of the Week` | Employee fills this | |
| `Self Comments` | Employee fills this | |
| `Manager Score` | `-20` | |
| `Manager Comment` | Manager fills this | |
| `Week Starts from` | *(leave blank)* | `12/05/26 - 18/05/26` |
| `One Thing` | Employee fills this | |
| ... | ... | |

**Rules:**
- The label goes in **Column A** exactly as shown above
- The value goes in **Column B**
- The week date range goes in **Column C** of the "Week Starts from" row
- Each week is exactly 7 rows — no blank rows between fields

---

## How the Manager Score Works

The manager enters a **negative number** showing how much was missed:

| Manager Enters | Means | Dashboard Displays |
|---|---|---|
| `-10` | 90% of tasks completed | **90%** — green |
| `-20` | 80% of tasks completed | **80%** — blue |
| `-30` | 70% of tasks completed | **70%** — blue |
| `-40` | 60% of tasks completed | **60%** — amber |
| `-50` | 50% of tasks completed | **50%** — red |

Formula: `100 + (manager's number)` = completion %
Example: `100 + (-30)` = **70%**

The dashboard converts this automatically — managers do not need to change how they fill the sheet.

---

## Frequently Asked Questions

**Q: A manager has multiple employees — does each one get their own sheet?**
Yes. Every employee has their own separate Google Sheet. The manager fills in each employee's sheet individually. In Settings, you link a different sheet URL for each employee.

**Q: Can one employee appear under multiple managers?**
No. Each employee is linked to exactly one manager. If someone changes managers, edit their record in Settings and update the manager.

**Q: The data is showing an error — what do I do?**
The error message will tell you what went wrong. Common causes:
1. The sheet is not published/shared — ask the manager to publish it as CSV or set it to "Anyone with link can view"
2. The sheet format is wrong — check that column A has the labels, column B has values, and the week date range is in column C
3. The sheet URL is wrong — edit the employee in Settings and re-paste the URL

**Q: The data looks outdated — how do I refresh?**
Click **Refresh ↺** in the header. Data also refreshes automatically every 2 minutes and whenever you return to the browser tab.

**Q: Can I edit an employee's details (joining date, manager, sheet link)?**
Yes — Settings ⚙ → Employees → click the pencil icon → edit → Save.

**Q: Can I edit an employee's weekly data?**
No. This dashboard is view-only. Only the manager can edit data by updating the Google Sheet.

**Q: Can multiple HR people use the dashboard at the same time?**
Yes. Anyone with the link can open it simultaneously. Everyone sees the same live data.

**Q: Do managers need to log into or use the dashboard?**
No. Managers only fill in the Google Sheet as usual. The dashboard reads from it automatically. Only HR uses the dashboard.

**Q: What happens if a manager leaves a week blank?**
Blank weeks (with only placeholder text like `//add your goal`) are still shown in the dashboard but will appear empty. Only filled weeks show actual content.

---

## Quick Reference Card

| Task | Steps |
|---|---|
| Add a manager | Settings ⚙ → Managers tab → + Add Manager |
| Add an employee | Settings ⚙ → Employees tab → + Add Employee |
| Link a Google Sheet | Settings ⚙ → Edit employee (pencil icon) → paste URL → Save |
| Filter by manager | Use the Manager dropdown in the filter bar |
| View an employee | Click their name in the left panel |
| Refresh data | Click ↺ Refresh in the header |
| Download a report | Select employee → scroll to Export Report → choose type → Download |
| Edit employee details | Settings ⚙ → Employees → pencil icon |

---

*For technical issues, contact the tech team. For questions about a specific employee's data, contact their manager.*
