// Demo data — loaded when no real Google Sheets are configured
// Replace sheet URLs with real employee Google Sheet links in the admin panel

export const MOCK_MANAGERS = [
  { id: 'mgr_01', name: 'Sanjay Mehta',  role: 'Head of Operations' },
  { id: 'mgr_02', name: 'Pooja Iyer',    role: 'Product Manager' },
  { id: 'mgr_03', name: 'Arjun Rao',     role: 'Sales Lead' },
]

export const MOCK_EMPLOYEES = [
  {
    id: 'emp_01', name: 'Ankit Sharma',   managerId: 'mgr_01',
    joiningDate: '2026-02-28', probationStatus: 'active', confirmationDate: null,
    sheetUrl: '', sheetId: '',
  },
  {
    id: 'emp_02', name: 'Kavya Reddy',    managerId: 'mgr_01',
    joiningDate: '2026-03-15', probationStatus: 'active', confirmationDate: null,
    sheetUrl: '', sheetId: '',
  },
  {
    id: 'emp_03', name: 'Rohan Gupta',    managerId: 'mgr_02',
    joiningDate: '2026-03-01', probationStatus: 'active', confirmationDate: null,
    sheetUrl: '', sheetId: '',
  },
  {
    id: 'emp_04', name: 'Divya Nair',     managerId: 'mgr_03',
    joiningDate: '2026-03-20', probationStatus: 'active', confirmationDate: null,
    sheetUrl: '', sheetId: '',
  },
  {
    id: 'emp_05', name: 'Priya Patel',    managerId: 'mgr_01',
    joiningDate: '2025-10-05', probationStatus: 'confirmed', confirmationDate: '2026-01-12',
    sheetUrl: '', sheetId: '',
  },
  {
    id: 'emp_06', name: 'Nikhil Kumar',   managerId: 'mgr_02',
    joiningDate: '2025-11-01', probationStatus: 'confirmed', confirmationDate: '2026-02-01',
    sheetUrl: '', sheetId: '',
  },
]

// Helper to build ISO date string relative to today
function weeksAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  return d.toISOString().slice(0, 10)
}
function weekLabel(startOffset, endOffset) {
  const s = new Date(); s.setDate(s.getDate() - startOffset)
  const e = new Date(); e.setDate(e.getDate() - endOffset)
  const fmt = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return `${fmt(s)} – ${fmt(e)}`
}

const WEEK_LABELS = [
  weekLabel(49, 43),
  weekLabel(42, 36),
  weekLabel(35, 29),
  weekLabel(28, 22),
  weekLabel(21, 15),
  weekLabel(14, 8),
  weekLabel(7, 1),
]

function weekDate(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(0, 10)
}

const WEEK_START_DATES = [
  weekDate(49), weekDate(42), weekDate(35),
  weekDate(28), weekDate(21), weekDate(14), weekDate(7),
]

function makeWeeks(scores, comments) {
  return WEEK_LABELS.map((label, i) => ({
    weekRange:      label,
    startDate:      WEEK_START_DATES[i],
    oneThing:       [
      'Complete onboarding and understand the product stack',
      'Set up initial customer outreach pipeline',
      'Review and document existing processes',
      'Drive cross-team sync on Q2 priorities',
      'Finalize the competitive analysis report',
      'Implement feedback from manager review session',
      'Deliver the weekly performance brief to stakeholders',
    ][i],
    additionalGoal: [
      'Shadow senior engineer on critical bug fix',
      'Identify top 5 prospective enterprise clients',
      'Create a workflow diagram for the ops team',
      'Help onboard the new junior team member',
      'Prepare 3 case studies for client pitch',
      'Improve dashboard load time by 15%',
      'Complete all pending documentation backlog',
    ][i],
    learnings: [
      'Understood the foundry workflow end-to-end and key pain points',
      'Learned about consultative selling and needs-based questioning',
      'Realized the value of async documentation in distributed teams',
      'Communication gaps cause more delays than technical issues',
      'Data-backed stories close deals faster than feature lists',
      'User feedback often reveals issues earlier than QA',
      'Prioritization frameworks help reduce context-switching fatigue',
    ][i],
    selfComments: [
      'Made good progress on onboarding; still learning the codebase structure',
      'Struggled with prioritization but improved by end of week',
      'Delivered on all targets; ready for more ownership',
      'Could have communicated blockers earlier to the team',
      'Strong week overall — exceeded the outreach target',
      'Focused and productive; no major blockers',
      'Finished ahead of schedule; used spare time to help teammates',
    ][i],
    managerScore:   scores[i],
    managerComment: comments[i],
  }))
}

export const MOCK_SHEET_DATA = {
  emp_01: makeWeeks(
    [7, 7.5, 8, 7, 8.5, 9, 8],
    [
      'Solid start — getting up to speed on fundamentals quickly.',
      'Good effort but needs to raise blockers proactively.',
      'Excellent week; took full ownership of the assigned module.',
      'Communication could be more concise in stand-ups.',
      'Impressive output; shows strong problem-solving instinct.',
      'Consistently high quality — keep this momentum going.',
      'Top performer this week. Ready for independent ownership.',
    ]
  ),
  emp_02: makeWeeks(
    [6, 7, 6.5, 8, 7.5, 8, 9],
    [
      'Decent first week; needs to show more initiative.',
      'Better this week — reached out to customer on own initiative.',
      'Output was good but missed the documentation task.',
      'Very impressed with the cross-team coordination ability.',
      'Strong analytical thinking shown in case studies.',
      'Great week — took feedback well and course-corrected fast.',
      'Best week so far. Ready to step up to next level of work.',
    ]
  ),
  emp_03: makeWeeks(
    [8, 8.5, 9, 8, 9, 8.5, 9.5],
    [
      'Excellent onboarding pace; already adding value.',
      'Great attention to detail and stakeholder awareness.',
      'Outstanding work — above and beyond expectations.',
      'Slight dip in output but quality remained high.',
      'Back at full speed; delivered excellent results.',
      'Consistent, reliable, high-quality delivery.',
      'Exceptional week — strong candidate for early confirmation.',
    ]
  ),
  emp_04: makeWeeks(
    [5, 6, 7, 6.5, 7.5, 8, 7],
    [
      'Below expectations; needs to pick up the pace significantly.',
      'Improvement shown — keep working on time management.',
      'Good recovery from last week; deliverables met.',
      'Output quality inconsistent; needs more attention to detail.',
      'Much better — proactive and thorough this week.',
      'Great work on the client outreach; exceeded targets.',
      'Solid week overall. Continuing positive trajectory.',
    ]
  ),
  emp_05: makeWeeks(
    [8, 9, 8.5, 9, 9.5, 9, 9],
    [
      'Excellent start; quickly grasped product complexities.',
      'Outstanding deliverables and stakeholder management.',
      'Consistently high performer. Very impressed.',
      'Leadership qualities emerging — great to see.',
      'Best performance in the cohort this week.',
      'Exceptional ownership and quality of work.',
      'Ready for confirmation — all criteria met and exceeded.',
    ]
  ),
  emp_06: makeWeeks(
    [7, 8, 7.5, 8.5, 8, 9, 8.5],
    [
      'Good first impression; collaborative and driven.',
      'Strong output; took initiative on process improvement.',
      'Reliable and consistent — rare qualities in probation period.',
      'Excellent thinking on the product roadmap suggestion.',
      'Very high quality work; great team player.',
      'Impressive problem solving under tight deadline.',
      'All targets hit; clear for confirmation.',
    ]
  ),
}
