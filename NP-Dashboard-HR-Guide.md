# NowPurchase Probation Dashboard
### HR User Guide — Everything You Need to Know

---

## What Is This Dashboard?

The **NowPurchase Probation Dashboard** is a simple web tool built for HR and managers to **track, review, and manage employees on probation** — all in one place.

Instead of digging through spreadsheets or chasing managers for updates, everything is visible here:
- Weekly performance scores from each manager
- Goals, learnings, and comments for every week
- Monthly performance averages
- Probation status (Active / Confirmed)
- Downloadable reports for each employee

> **No technical knowledge needed.** If you can use a browser, you can use this dashboard.

---

## What Can You Do?

| Feature | What It Means |
|---|---|
| View weekly scores | See the score a manager gave an employee each week |
| Track monthly performance | Average score for any month, shown as a visual gauge |
| Read weekly remarks | Goals, learnings, and manager comments — week by week |
| Manage employees | Add, edit, or remove employees from the system |
| Mark probation as confirmed | Officially move an employee from "Active" to "Confirmed" |
| Download reports | Export a clean PDF-style report for any employee |
| Auto-refresh from Google Sheets | Data updates automatically — no manual uploads needed |

---

## How the Data Flows In

Each employee has their own **Google Sheet** maintained by their manager.
The manager fills in weekly entries — the dashboard reads directly from that sheet and displays it automatically.

```
Manager fills Google Sheet  →  Dashboard auto-refreshes  →  HR views updated data
```

**You never need to upload anything manually.** Changes in the Google Sheet appear in the dashboard:
- **Instantly** — when you switch back to the dashboard tab after editing
- **Every 2 minutes** — automatic background refresh while you're on the dashboard
- **On demand** — click the Refresh button at any time

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
   - **Joining Date** — the date they joined
   - **Status** — leave as "Active Probation"
   - **Google Sheet URL** — paste the link to their tracking sheet (see Step 4)
5. Click **Add**

---

### Step 4 — Link the Google Sheet

Each employee needs a Google Sheet maintained by their manager.
To link it to the dashboard:

**The manager must make the sheet accessible:**

1. Open the employee's Google Sheet
2. Click **File → Share → Publish to web**
3. In the dropdown, select **Comma-separated values (.csv)**
4. Click **Publish** — copy the link that appears
5. Paste that link into the **Google Sheet URL** field in the dashboard (Step 3 above)

> **Alternatively:** The manager can share the sheet with *"Anyone with the link can view"* and paste the regular sheet URL — the dashboard will handle the rest automatically.

---

### Step 5 — View an Employee's Performance

1. On the left side, select a **Manager** from the dropdown
2. Select an **Employee** from the list
3. The right panel loads their full performance view:

#### What you'll see:

**Probation Status Card**
Shows whether the employee is on active probation, how many days remain, and an overall summary (total weeks tracked, average score, best score).

**Monthly Performance Gauge**
A visual dial showing the average score for any selected month. Switch between months using the dropdown at the top.

**Weekly Performance Remarks**
All weekly entries in expandable cards. Each card shows:
- One Thing (primary goal for that week)
- Additional Goal
- Learnings of the Week
- Self Comments (from the employee)
- Manager Score (out of 10)
- Manager Comment

---

### Step 6 — Mark an Employee as Confirmed

Once probation is complete:

1. Select the employee from the list
2. Click the **"Mark as Confirmed"** button (green, top-right of the employee detail panel)
3. A confirmation dialog will appear — review and confirm
4. The employee moves from **Active Probation** → **Confirmed Records**
5. Their record is preserved and accessible under the **Confirmed** tab

---

### Step 7 — Download a Report

1. Select an employee
2. Scroll down to the **Export Report** section
3. Choose what to include (select months or specific weeks)
4. Click **Download Report**

The report includes the employee's details, probation timeline, monthly scores, and all weekly remarks in a clean, printable format.

---

## Navigating the Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Header: NowPurchase Logo   [Refresh ↺]   [Settings ⚙]     │
├─────────────────────────────────────────────────────────────┤
│  Filter Bar: [Manager ▼]  [Employee ▼]    Active: 5  Confirmed: 3 │
├──────────────────────────┬──────────────────────────────────┤
│  Active Probation Tab    │  Confirmed Records Tab           │
├──────────────────────────┴──────────────────────────────────┤
│  Left Panel              │  Right Panel                     │
│  ─ Employee List         │  ─ Employee Detail               │
│  ─ Shows latest score    │  ─ Probation Status              │
│  ─ Click to select       │  ─ Monthly Score Gauge           │
│                          │  ─ Weekly Remarks                │
│                          │  ─ Export Report                 │
└──────────────────────────┴──────────────────────────────────┘
```

---

## Tabs Explained

| Tab | What's Here |
|---|---|
| **Active Probation** | Employees currently in their probation period |
| **Confirmed Records** | Employees whose probation has been completed and confirmed |

---

## The Google Sheet Format

The manager fills in the Google Sheet like this — **one column per week**:

| | 24 May – 1 Jun | 1 Jun – 8 Jun | 8 Jun – 15 Jun |
|---|---|---|---|
| One Thing | Completed onboarding | Finished training module | Handled first client call |
| Additional Goal | Set up tools | Shadow 3 meetings | Write weekly summary |
| Learnings of the Week | Understood the product | Learned the sales process | Improved communication |
| Self Comments | Settling in well | More confident now | Ready for more responsibility |
| Manager Score | 7.5 | 8 | 8.5 |
| Manager Comment | Good start | Showing initiative | Strong week |

The dashboard reads this table directly. **No special formatting or formulas needed.**

---

## Frequently Asked Questions

**Q: What if the data doesn't update?**
Click the **Refresh ↺** button in the header, or the smaller Refresh button next to the employee's name. Data auto-refreshes every 2 minutes and whenever you return to the tab.

**Q: What if a sheet link shows an error?**
The dashboard will show sample data and display a small error message. Ask the manager to re-check that the sheet is published or shared correctly (Step 4 above).

**Q: Can I edit an employee's details later?**
Yes. Go to Settings → Employees → click the pencil icon next to any employee → edit and save.

**Q: What happens to a confirmed employee's data?**
All their weekly data, scores, and remarks are preserved and viewable under the **Confirmed Records** tab. Nothing is deleted.

**Q: Can multiple people use the dashboard at the same time?**
Yes. The dashboard can be opened in any browser. Each person sees the same live data pulled from the Google Sheets.

**Q: Do managers need access to the dashboard?**
No. Managers only fill in their Google Sheet as usual. The dashboard reads from there automatically. Only HR needs to use the dashboard.

---

## Quick Reference Card

| Task | How |
|---|---|
| Add a new employee | Settings ⚙ → Employees → + Add Employee |
| Add a manager | Settings ⚙ → Managers → + Add Manager |
| Link a Google Sheet | Settings ⚙ → Edit employee → paste Sheet URL |
| View performance | Select manager → select employee |
| Confirm probation | Open employee → click "Mark as Confirmed" |
| Download report | Open employee → scroll to Export Report → Download |
| Refresh data manually | Click ↺ Refresh in header or on employee card |
| Switch between active/confirmed | Use the tabs below the filter bar |

---

*For any technical issues or questions about setting up the dashboard, contact the tech team.*
