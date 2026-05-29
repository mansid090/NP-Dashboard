import { addDays, format, parseISO, differenceInDays, isAfter } from 'date-fns'

export const DEFAULT_PROBATION_DAYS = 90

export function getProbationEndDate(joiningDate, probationDays = DEFAULT_PROBATION_DAYS) {
  return addDays(parseISO(joiningDate), probationDays)
}

export function formatDate(date) {
  return format(date instanceof Date ? date : parseISO(date), 'dd MMM yyyy')
}

export function isProbationActive(joiningDate, probationDays = DEFAULT_PROBATION_DAYS) {
  return isAfter(getProbationEndDate(joiningDate, probationDays), new Date())
}

export function getDaysRemaining(joiningDate, probationDays = DEFAULT_PROBATION_DAYS) {
  return Math.max(0, differenceInDays(getProbationEndDate(joiningDate, probationDays), new Date()))
}

export function getDaysElapsed(joiningDate, probationDays = DEFAULT_PROBATION_DAYS) {
  return Math.min(probationDays, differenceInDays(new Date(), parseISO(joiningDate)))
}

export function getProbationProgress(joiningDate, probationDays = DEFAULT_PROBATION_DAYS) {
  const elapsed = getDaysElapsed(joiningDate, probationDays)
  return Math.min(100, Math.round((elapsed / probationDays) * 100))
}

export function getMonthFromWeekLabel(weekLabel, year = new Date().getFullYear()) {
  if (!weekLabel) return null

  const numericMatch = weekLabel.match(/^(\d{1,2})\/(\d{2})\/(\d{2,4})/)
  if (numericMatch) {
    const month = parseInt(numericMatch[2], 10)
    let yr = parseInt(numericMatch[3], 10)
    if (yr < 100) yr += 2000
    return `${yr}-${String(month).padStart(2, '0')}`
  }

  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
  const lower = weekLabel.toLowerCase()
  for (let i = 0; i < months.length; i++) {
    if (lower.includes(months[i])) return `${year}-${String(i + 1).padStart(2, '0')}`
  }
  return null
}

export function monthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return format(new Date(+y, +m - 1, 1), 'MMMM yyyy')
}

export function groupByMonth(weeklyData) {
  const groups = {}
  weeklyData.forEach(w => {
    const month = w.startDate ? w.startDate.slice(0, 7) : getMonthFromWeekLabel(w.weekRange)
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
