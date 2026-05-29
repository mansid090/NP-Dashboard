import Papa from 'papaparse'

/*
  Expected Google Sheet layout (column-based — one column per week):
  ──────────────────────────────────────────────────────────────────
  Row 0 │ [blank]               │ 24 May – 1 Jun  │ 1 Jun – 8 Jun  │ …
  Row 1 │ One Thing             │ employee text   │ employee text  │ …
  Row 2 │ Additional Goal       │ employee text   │ employee text  │ …
  Row 3 │ Learnings of the Week │ employee text   │ employee text  │ …
  Row 4 │ Self Comments         │ employee text   │ employee text  │ …
  Row 5 │ Manager Score         │ 8               │ 7.5            │ …
  Row 6 │ Manager Comment       │ manager text    │ manager text   │ …
  ──────────────────────────────────────────────────────────────────

  Row-based variation (each week is a labelled block) is also supported.
  The parser tries column-based first, then falls back to row-based.

  HOW TO PUBLISH YOUR GOOGLE SHEET:
  File → Share → Publish to web → Select "Comma-separated values (.csv)"
  Copy the link and paste it into the admin panel sheet URL field.
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
  // Already a CSV/published URL
  if (sheetUrl.includes('pub?') || sheetUrl.includes('output=csv')) return sheetUrl

  const id = extractSheetId(sheetUrl)
  if (!id) throw new Error('Cannot extract sheet ID from URL: ' + sheetUrl)

  // Prefer the gviz endpoint — works for sheets shared with "anyone with link"
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`
}

async function fetchCsv(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch {
    // CORS proxy fallback — suitable for demo; use a backend proxy in production
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res = await fetch(proxy)
    if (!res.ok) throw new Error('Proxy fetch failed')
    const json = await res.json()
    return json.contents
  }
}

function parseColumnBased(rows) {
  if (rows.length < 2) return null

  const headerRow = rows[0]
  // Collect week columns (non-empty cells in row 0, starting from col 1)
  const weekCols = []
  for (let c = 1; c < headerRow.length; c++) {
    const label = (headerRow[c] || '').trim()
    if (label) weekCols.push({ col: c, label })
  }
  if (!weekCols.length) return null

  // Map each data row's label to a field key
  const fieldRows = {}
  for (let r = 1; r < rows.length; r++) {
    const key = matchField(rows[r][0])
    if (key && !fieldRows[key]) fieldRows[key] = r
  }

  // Require at least score OR comment column to accept this format
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
    managerScore:   parseFloat(getVal(fieldRows.managerScore, col)) || null,
    managerComment: getVal(fieldRows.managerComment, col),
  })).filter(w => w.weekRange && (w.managerScore !== null || w.managerComment))
}

function parseRowBased(rows) {
  // Detect blocks: each block starts with a row whose first cell contains a date-like range
  const datePattern = /\d+\s+\w+\s*[-–]\s*\d+\s+\w+|\w+\s+\d+\s*[-–]\s*\w+\s+\d+/i
  const weeks = []
  let current = null

  for (const row of rows) {
    const cell0 = (row[0] || '').trim()
    const cell1 = (row[1] || '').trim()

    // New week block starts when the label cell looks like a date range
    if (datePattern.test(cell0)) {
      if (current) weeks.push(current)
      current = { weekRange: cell0, startDate: null, oneThing: '', additionalGoal: '',
                   learnings: '', selfComments: '', managerScore: null, managerComment: '' }
      continue
    }
    if (!current) continue

    const key = matchField(cell0)
    if (key) {
      if (key === 'managerScore') current[key] = parseFloat(cell1) || null
      else current[key] = cell1
    }
  }
  if (current) weeks.push(current)
  return weeks.filter(w => w.weekRange)
}

export async function fetchSheetData(sheetUrl) {
  const csvUrl = buildCsvUrl(sheetUrl)
  const raw    = await fetchCsv(csvUrl)
  const result = Papa.parse(raw, { skipEmptyLines: false })
  const rows   = result.data

  const columnParsed = parseColumnBased(rows)
  if (columnParsed && columnParsed.length > 0) return columnParsed

  const rowParsed = parseRowBased(rows)
  if (rowParsed && rowParsed.length > 0) return rowParsed

  throw new Error('Could not detect sheet structure. See console for raw data.')
}
