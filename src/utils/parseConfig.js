import Papa from 'papaparse'
import { buildCsvUrl, fetchCsv } from './fetchCsv'

// Convert various date formats → YYYY-MM-DD
function parseDate(raw) {
  if (!raw) return ''
  const s = String(raw).trim()
  if (!s) return ''

  // Already ISO: 2026-02-28
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // DD/MM/YYYY or D/M/YYYY
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`

  // DD/MM/YY
  const dmyShort = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
  if (dmyShort) return `20${dmyShort[3]}-${dmyShort[2].padStart(2,'0')}-${dmyShort[1].padStart(2,'0')}`

  // DD-MM-YYYY
  const dmy2 = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dmy2) return `${dmy2[3]}-${dmy2[2].padStart(2,'0')}-${dmy2[1].padStart(2,'0')}`

  // Fallback: try native Date (handles "28 Feb 2026", "Feb 28 2026", etc.)
  const d = new Date(s)
  if (!isNaN(d)) return d.toISOString().slice(0, 10)

  return s
}

function slugId(prefix, str) {
  return `${prefix}_${String(str).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`
}

export function parseConfigRows(rows) {
  const managersMap = {}  // manager name → manager object
  const employees   = []
  const seen        = new Set()

  // Row 0 is the header — start from row 1
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const empName  = (row[0] || '').trim()
    const mgrName  = (row[1] || '').trim()
    const mgrRole  = (row[2] || '').trim()
    const joinDate = (row[3] || '').trim()
    const sheetUrl = (row[4] || '').trim()

    if (!empName) continue   // skip blank rows

    // Build manager record once per unique manager name
    if (mgrName && !managersMap[mgrName]) {
      managersMap[mgrName] = {
        id:   slugId('mgr', mgrName),
        name: mgrName,
        role: mgrRole,
      }
    } else if (mgrName && managersMap[mgrName] && mgrRole && !managersMap[mgrName].role) {
      managersMap[mgrName].role = mgrRole
    }

    // Avoid duplicate employees
    const empId = slugId('emp', empName)
    if (seen.has(empId)) continue
    seen.add(empId)

    employees.push({
      id:               empId,
      name:             empName,
      managerId:        mgrName ? managersMap[mgrName].id : '',
      joiningDate:      parseDate(joinDate),
      probationStatus:  'active',
      confirmationDate: null,
      sheetUrl,
    })
  }

  return {
    employees,
    managers: Object.values(managersMap),
  }
}

export async function fetchConfigSheet(configUrl) {
  const csvUrl = buildCsvUrl(configUrl)
  const raw    = await fetchCsv(csvUrl)
  const { data: rows } = Papa.parse(raw, { skipEmptyLines: true })

  if (!rows.length)
    throw new Error('The Master Config Sheet appears to be empty.')

  if (rows.length < 2)
    throw new Error('No employee rows found. Make sure row 1 is the header and row 2+ are employees.')

  return parseConfigRows(rows)
}
