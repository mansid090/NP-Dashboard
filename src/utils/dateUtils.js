import { addDays, format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns'

export const PROBATION_DAYS = 90

export function getProbationEndDate(joiningDate) {
  return addDays(parseISO(joiningDate), PROBATION_DAYS)
}

export function formatDate(date) {
  return format(date instanceof Date ? date : parseISO(date), 'dd MMM yyyy')
}

export function isProbationActive(joiningDate) {
  return isAfter(getProbationEndDate(joiningDate), new Date())
}

export function getDaysRemaining(joiningDate) {
  return Math.max(0, differenceInDays(getProbationEndDate(joiningDate), new Date()))
}

export function getDaysElapsed(joiningDate) {
  return Math.min(PROBATION_DAYS, differenceInDays(new Date(), parseISO(joiningDate)))
}

export function getProbationProgress(joiningDate) {
  const elapsed = getDaysElapsed(joiningDate)
  return Math.min(100, Math.round((elapsed / PROBATION_DAYS) * 100))
}

// Parse a "DD Mon – DD Mon" label and return the start month as 'YYYY-MM'
// Falls back gracefully if the format is unexpected
export function getMonthFromWeekLabel(weekLabel, year = new Date().getFullYear()) {
  if (!weekLabel) return null
  // Try to find a month name in the label
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
  const lower = weekLabel.toLowerCase()
  for (let i = 0; i < months.length; i++) {
    if (lower.includes(months[i])) {
      return `${year}-${String(i + 1).padStart(2, '0')}`
    }
  }
  return null
}

export function monthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return format(new Date(+y, +m - 1, 1), 'MMMM yyyy')
}

// Group weekly data entries by month (YYYY-MM)
export function groupByMonth(weeklyData) {
  const groups = {}
  weeklyData.forEach(w => {
    // Use startDate if available, else try to parse from weekRange
    let month = null
    if (w.startDate) {
      month = w.startDate.slice(0, 7)
    } else {
      month = getMonthFromWeekLabel(w.weekRange)
    }
    if (month) {
      if (!groups[month]) groups[month] = []
      groups[month].push(w)
    }
  })
  return groups
}

export function averageScore(weeks) {
  const scored = weeks.filter(w => w.managerScore !== null && !isNaN(w.managerScore))
  if (!scored.length) return null
  return scored.reduce((s, w) => s + Number(w.managerScore), 0) / scored.length
}
