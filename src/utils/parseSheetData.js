import Papa from 'papaparse'

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

  Score encoding: if task completion is 70% → enter -30; 80% → -20; 60% → -40
  Dashboard converts to positive percentage: 100 + (-30) = 70%

  Also supports the old column-based layout (one column per week).
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

function extractSheetId(url) {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  return m ? m[1] : null
}

function buildCsvUrl(sheetUrl) {
  if (sheetUrl.includes('pub?') || sheetUrl.includes('output=csv')) return sheetUrl
  const id = extractSheetId(sheetUrl)
  if (!id) throw new Error('Cannot extract sheet ID from URL: ' + sheetUrl)
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`
}

async function fetchCsv(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(proxy)
    if (!res.ok) throw new Error('Proxy fetch failed')
    const json = await res.json()
    return json.contents
  }
}

// Convert raw score value to completion percentage (0–100)
// Excel format: -30 = 70% completion, -20 = 80%, -40 = 60%
function toCompletionPct(rawVal) {
  if (rawVal === null || rawVal === undefined || rawVal === '') return null
  // Skip template placeholder text
  const str = String(rawVal).trim()
  if (str.startsWith('//')) return null
  const num = typeof rawVal === 'number' ? rawVal : parseFloat(str)
  if (isNaN(num)) return null
  // Negative values are the penalty encoding
  if (num < 0) return Math.max(0, Math.min(100, 100 + num))
  // Positive values: if already in 0–100 range treat as percentage, else as /10 score
  if (num <= 10) return Math.round(num * 10)
  return Math.min(100, num)
}

function parseColumnBased(rows) {
  if (rows.length < 2) return null
  const headerRow = rows[0]
  // New row-based format has "Week Starts from" in first cell — bail out
  if (/^week/i.test((headerRow[0] || '').trim())) return null

  const weekCols = []
  for (let c = 1; c < headerRow.length; c++) {
    const label = (headerRow[c] || '').trim()
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
  const newWeekPattern = /^week/i  // "Week Starts from"
  const weeks = []
  let current = null

  for (const row of rows) {
    const cell0 = (row[0] || '').trim()
    const cell2 = (row[2] || '').trim()

    const isNewFormat = newWeekPattern.test(cell0)
    const isOldFormat = !isNewFormat && oldDatePattern.test(cell0)

    if (isNewFormat || isOldFormat) {
      if (current) weeks.push(current)
      const weekRange = isNewFormat ? cell2 : cell0
      current = {
        weekRange, startDate: null,
        oneThing: '', additionalGoal: '', learnings: '',
        selfComments: '', managerScore: null, managerComment: '',
      }
      continue
    }
    if (!current) continue

    const key = matchField(cell0)
    if (key) {
      const rawVal = (row[1] !== null && row[1] !== undefined) ? row[1] : ''
      if (key === 'managerScore') {
        current[key] = toCompletionPct(rawVal)
      } else {
        const strVal = String(rawVal).trim()
        current[key] = strVal.startsWith('//') ? '' : strVal
      }
    }
  }
  if (current) weeks.push(current)

  // Keep all weeks that have a valid date range — empty weeks display as blank, that's fine
  return weeks.filter(w => w.weekRange && w.weekRange.trim())
}

export async function fetchSheetData(sheetUrl) {
  const csvUrl = buildCsvUrl(sheetUrl)
  const raw    = await fetchCsv(csvUrl)

  // If we got an HTML page instead of CSV, the sheet is not shared/published correctly
  if (raw.trimStart().startsWith('<')) {
    throw new Error('Sheet is not accessible. Make sure it is published or shared as "Anyone with link can view".')
  }

  const result = Papa.parse(raw, { skipEmptyLines: false })
  const rows   = result.data

  console.log('[NP Dashboard] Raw sheet rows (first 10):', rows.slice(0, 10))

  const columnParsed = parseColumnBased(rows)
  if (columnParsed && columnParsed.length > 0) return columnParsed

  const rowParsed = parseRowBased(rows)
  if (rowParsed && rowParsed.length > 0) return rowParsed

  throw new Error('Could not read sheet. Make sure the sheet follows the 30-60-90 tracker format — "Week Starts from" in column A, date range in column C, one block of 7 rows per week.')
}
