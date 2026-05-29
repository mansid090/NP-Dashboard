# NowPurchase Probation Dashboard
### HR User Guide — Everything You Need to Know

---

## What Is This Dashboard?

The **NowPurchase Probation Dashboard** is a simple web tool built for HR to **view and track employee performance during probation** — all in one place.

Data flows directly from each employee's **Google Sheet** (maintained by their manager) into the dashboard automatically. HR only views — nothing is entered or changed here.

> **No technical knowledge needed.** If you can use a browser, you can use this dashboard.

---

## What Can You See?

| Feature | What It Shows |
|---|---|
| Weekly completion scores | Task completion % the manager gave each week |
| Monthly performance gauge | Average completion % for any month, shown as a visual dial |
| Weekly remarks | Goals, learnings, self comments, and manager feedback — week by week |
| Probation status | Days remaining, progress bar, joining date |
| Overall summary | Total weeks tracked, average score, best score |
| Downloadable reports | Export any employee's full data as Excel or CSV |

> **This is a view-only dashboard.** No data is entered or changed here. All data comes from the manager's Google Sheet.

---

## How the Data Flows In

Each employee has their own **Google Sheet** maintained by their manager.
The manager fills in the tracker weekly — the dashboard reads it automatically.

```
Manager fills Google Sheet  →  Dashboard auto-refreshes  →  HR views updated data
```

**You never need to upload anything.** Changes in the Google Sheet appear in the dashboard:
- **Instantly** — when you switch back to the dashboard tab after the manager has updated the sheet
- **Every 2 minutes** — automatic background refresh while you are on the dashboard
- **On demand** — click the **Refresh ↺** button at any time

---

## Setting Up: Step-by-Step

### Step 1 — Open the Dashboard
Open the dashboard link in any browser (Chrome recommended).

---

### Step 2 — Add a Manager

1. Click the **Settings (⚙)** icon in the top-right corner
2. Go to the **Managers** tab
3. Click **+ Add Manager**
4. Fill in:
   - **Full Name** — e.g. Sanjay Mehta
   - **Role / Title** — e.g. Head of Operations
5. Click **Add**

---

### Step 3 — Add an Employee

1. Click the **Settings (⚙)** icon
2. Go to the **Employees** tab
3. Click **+ Add Employee**
4. Fill in:
   - **Full Name** — e.g. Ankit Sharma
   - **Manager** — select from the dropdown
   - **Joining Date** — the date they joined (used to calculate probation timeline)
   - **Google Sheet URL** — paste the link to their tracking sheet (see Step 4)
5. Click **Add**

---

### Step 4 — Link the Employee's Google Sheet

Each employee has a Google Sheet maintained by their manager in the **30-60-90 tracker format**.
To connect it to the dashboard:

**Option A — Publish as CSV (recommended):**
1. Open the employee's Google Sheet
2. Click **File → Share → Publish to web**
3. Select the sheet tab and format **Comma-separated values (.csv)**
4. Click **Publish** → copy the link
5. Paste into the **Google Sheet URL** field in Settings

**Option B — Share link:**
1. Click **Share** → change access to **"Anyone with the link can view"**
2. Copy the link and paste into the **Google Sheet URL** field in Settings

---

### Step 5 — View an Employee's Performance

1. Use the **Manager** dropdown at the top to filter by manager (optional)
2. Select an **Employee** from the list on the left
3. The right panel loads their full performance view

#### What you will see:

**Probation Status**
Shows joining date, probation end date, days remaining, and a progress bar.
Also shows overall summary — total weeks tracked, average score, best score.

**Monthly Performance Gauge**
A visual dial showing the average completion % for the selected month.
Switch between months using the dropdown. Shows trend vs previous month.

**Weekly Performance Remarks**
All weekly entries as expandable cards. Each card shows:
- One Thing (primary goal for that week)
- Additional Goal
- Learnings of the Week
- Self Comments (written by the employee)
- Manager Score (shown as task completion %)
- Manager Comment

---

### Step 6 — Download a Report

1. Select an employee
2. Scroll down to the **Export Report** section
3. Choose report type: Full Employee / Selected Weeks / Selected Month / All Employees
4. Choose format: **Excel (.xlsx)** or **CSV**
5. Click **Download**

---

## Navigating the Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Probation Dashboard          [Refresh ↺]  [Settings ⚙]  NP │
├──────────────────────────────────────────────────────────────┤
│  Filter Bar:  [Manager ▼]   [Employee ▼]      12 Employees   │
├─────────────────────┬────────────────────────────────────────┤
│  Left Panel         │  Right Panel                           │
│  ─ Employee List    │  ─ Employee Name & Manager             │
│  ─ Avg score shown  │  ─ Probation Status + Summary          │
│  ─ Click to select  │  ─ Monthly Performance Gauge           │
│                     │  ─ Weekly Remarks (expandable cards)   │
│                     │  ─ Export Report                       │
└─────────────────────┴────────────────────────────────────────┘
```

---

## The Google Sheet Format

The manager fills in one **block of 7 rows per week**, repeating downward:

| Column A | Column B | Column C |
|---|---|---|
| Week Starts from | | 5/05/26 - 11/05/26 |
| One Thing | Schedule 3-4 meetings in Pune | |
| Additional Goal | Complete pending tasks, follow up for trials | |
| Learnings of the Week | Improve follow-up with clients | |
| Self Comments | Work on building pipeline | |
| Manager Score | -20 | |
| Manager Comment | Good progress, stay consistent | |
| Week Starts from | | 12/05/26 - 18/05/26 |
| One Thing | Close 2 bulk orders | |
| ... | ... | |

**The date range goes in Column C** of the "Week Starts from" row.
**All other values go in Column B.**

---

## How the Manager Score Works

The manager enters a **negative number** representing how much was missed:

| Manager Enters | Means | Dashboard Shows |
|---|---|---|
| -10 | 90% tasks completed | **90%** (green) |
| -20 | 80% tasks completed | **80%** (blue) |
| -30 | 70% tasks completed | **70%** (blue) |
| -40 | 60% tasks completed | **60%** (amber) |
| -50 | 50% tasks completed | **50%** (red) |

The dashboard automatically converts and displays it as a percentage.

---

## Frequently Asked Questions

**Q: The data is not showing or showing an error — what do I do?**
Ask the manager to check that:
1. The sheet is published (File → Share → Publish to web → CSV) or shared as "Anyone with link can view"
2. The sheet follows the exact format — "Week Starts from" in Column A, date in Column C, all values in Column B

**Q: The data is outdated — how do I refresh?**
Click the **Refresh ↺** button in the header. Data also auto-refreshes every 2 minutes and whenever you return to the browser tab.

**Q: Can I edit anything on the dashboard?**
No. This dashboard is view-only. All data is entered by managers in their Google Sheets.

**Q: Can multiple people use the dashboard at the same time?**
Yes. Anyone with the link can open it. Everyone sees the same live data from the Google Sheets.

**Q: Can I edit an employee's joining date or sheet link?**
Yes. Go to Settings ⚙ → Employees → click the pencil icon → edit and save.

**Q: Do managers need to log in or use the dashboard?**
No. Managers only fill in their Google Sheet. The dashboard reads from there automatically.

---

## Quick Reference Card

| Task | How |
|---|---|
| Add a new employee | Settings ⚙ → Employees → + Add Employee |
| Add a manager | Settings ⚙ → Managers → + Add Manager |
| Link a Google Sheet | Settings ⚙ → Edit employee → paste Sheet URL → Save |
| View an employee | Select manager (optional) → select employee from left panel |
| Refresh data | Click ↺ Refresh in header, or Refresh button on employee card |
| Download a report | Select employee → scroll to Export Report → choose type → Download |

---

*For any technical issues or questions about setting up the dashboard, contact the tech team.*
