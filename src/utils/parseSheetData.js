import Papa from 'papaparse'
import { buildCsvUrl, fetchCsv } from './fetchCsv'

/*
  Supported Google Sheet layout — row-based (one block of 7 rows per week):
  ──────────────────────────────────────────────────────────────────────────
  Row │ Week Starts from  │ [blank] │ 5/05/26 - 11/05/26 │ …
  Row │ One Thing         │ employee text
  Row │ Additional Goal   │ employee text
  Row │ Learnings of the Week │ employee text
  Row │ Self Comments     │ employee text
  Row │ Manager Score     │ -30   ← negative = penalty; -30 means 70% completion
  Row │ Manager Comment   │ manager text
  ──────────────────────────────────────────────────────────────────────────

  Score encoding: -30 = 70%, -20 = 80%, -40 = 60%  (100 + score = completion %)
*/

const FIELD_ALIASES = {
  oneThing:       ['one thing', '1 thing', 'primary goal', 'main goal', 'focus'],
  additionalGoal: ['additional goal', 'secondary goal', 'other goal', 'goal 2'],
  learnings:      ['learning', 'learnings of the week', 'key learning', 'what i learned'],
  selfComments:   ['self comment', 'self-comment', 'employee comment', 'my comment'],
  managerScore:   ['manager score', 'score', 'rating', 'manager rating'],
  managerComment: ['manager comment', 'manager remark', 'feedback', 'manager feedback'],
}

function matchField(label) {
  const l = (label || '').toLowerCase().trim()
  for (const [key, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some(a => l.includes(a))) return key
  }
  return null
}

// Convert raw score → completion % (0–100)
// -30 → 70%,  -20 → 80%,  positive ≤10 treated as /10 score
function toCompletionPct(rawVal) {
  if (rawVal === null || rawVal === undefined || rawVal === '') return null
  const str = String(rawVal).trim()
  if (str.startsWith('//')) return null
  const num = typeof rawVal === 'number' ? rawVal : parseFloat(str)
  if (isNaN(num)) return null
  if (num < 0)   return Math.max(0, Math.min(100, 100 + num))
  if (num <= 10) return Math.round(num * 10)
  return Math.min(100, num)
}

function parseColumnBased(rows) {
  if (rows.length < 2) return null
  // Row-based format starts with "Week Starts from" — bail out
  if (/^week/i.test((rows[0][0] || '').trim())) return null

  const weekCols = []
  for (let c = 1; c < rows[0].length; c++) {
    const label = (rows[0][c] || '').trim()
    if (label) weekCols.push({ col: c, label })
  }
  if (!weekCols.length) return null

  const fieldRows = {}
  for (let r = 1; r < rows.length; r++) {
    const key = matchField(rows[r][0])
    if (key && !fieldRows[key]) fieldRows[key] = r
  }
  if (!fieldRows.managerScore && !fieldRows.managerComment) return null

  const getVal = (rowIdx, col) =>
    rowIdx !== undefined ? (rows[rowIdx]?.[col] || '').trim() : ''

  return weekCols.map(({ col, label }) => ({
    weekRange:      label,
    startDate:      null,
    oneThing:       getVal(fieldRows.oneThing, col),
    additionalGoal: getVal(fieldRows.additionalGoal, col),
    learnings:      getVal(fieldRows.learnings, col),
    selfComments:   getVal(fieldRows.selfComments, col),
    managerScore:   toCompletionPct(rows[fieldRows.managerScore]?.[col]),
    managerComment: getVal(fieldRows.managerComment, col),
  })).filter(w => w.weekRange && (w.managerScore !== null || w.managerComment))
}

function parseRowBased(rows) {
  const oldDatePattern = /\d+\s+\w+\s*[-–]\s*\d+\s+\w+|\w+\s+\d+\s*[-–]\s*\w+\s+\d+/i
  const newWeekPattern = /^week/i
  const weeks  = []
  let current  = null

  for (const row of rows) {
    const cell0 = (row[0] || '').trim()
    const cell2 = (row[2] || '').trim()

    const isNewFormat = newWeekPattern.test(cell0)
    const isOldFormat = !isNewFormat && oldDatePattern.test(cell0)

    if (isNewFormat || isOldFormat) {
      if (current) weeks.push(current)
      // For new format: try cell2 first, then scan all columns for a date
      let weekRange = isNewFormat ? cell2 : cell0
      if (!weekRange) {
        for (let c = 1; c < row.length; c++) {
          const candidate = String(row[c] || '').trim()
          if (candidate && /\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/.test(candidate)) {
            weekRange = candidate
            break
          }
        }
      }
      current = {
        weekRange,
        startDate:      null,
        oneThing:       '', additionalGoal: '', learnings: '',
        selfComments:   '', managerScore: null, managerComment: '',
      }
      continue
    }
    if (!current) continue

    const key = matchField(cell0)
    if (key) {
      // Scan columns B, C, D… and take the first non-empty value.
      let rawVal = ''
      for (let c = 1; c < Math.min(row.length, 5); c++) {
        const v = row[c]
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          rawVal = v
          break
        }
      }
      if (key === 'managerScore') {
        current[key] = toCompletionPct(rawVal)
      } else {
        const strVal = String(rawVal).trim()
        current[key] = strVal.startsWith('//') ? '' : strVal
      }
    }

    // If this week still has no date range, scan every column of this row
    // for a date-like value (handles sheets where the date is stored in the
    // Manager Comment row's column C as a dropdown).
    if (current && !current.weekRange) {
      for (let c = 1; c < row.length; c++) {
        const candidate = String(row[c] || '').trim()
        if (candidate && /\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/.test(candidate)) {
          current.weekRange = candidate
          break
        }
      }
    }
  }
  if (current) weeks.push(current)

  return weeks.filter(w => w.weekRange && w.weekRange.trim())
}

export async function fetchSheetData(sheetUrl) {
  const csvUrl = buildCsvUrl(sheetUrl)
  const raw    = await fetchCsv(csvUrl)

  console.log('[NP Dashboard] Raw sheet rows (first 10):', Papa.parse(raw, { skipEmptyLines: false }).data.slice(0, 10))

  const result = Papa.parse(raw, { skipEmptyLines: false })
  const rows   = result.data

  const columnParsed = parseColumnBased(rows)
  if (columnParsed && columnParsed.length > 0) return columnParsed

  const rowParsed = parseRowBased(rows)
  if (rowParsed && rowParsed.length > 0) return rowParsed

  throw new Error('Could not read sheet. Make sure it follows the 30-60-90 tracker format — "Week Starts from" in column A, date range in column C, one block of 7 rows per week.')
}
