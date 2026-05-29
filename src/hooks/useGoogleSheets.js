import { useState, useCallback, useRef } from 'react'
import { fetchSheetData } from '../utils/parseSheetData'
import { MOCK_SHEET_DATA } from '../data/mockData'

const CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes

export function useGoogleSheets() {
  const [sheetData,   setSheetData]   = useState({})   // { empId: weeklyData[] }
  const [loadingIds,  setLoadingIds]  = useState(new Set())
  const [errorIds,    setErrorIds]    = useState({})    // { empId: errorMessage }
  const cacheRef = useRef({})                            // { empId: { data, ts } }

  const loadEmployee = useCallback(async (employee, forceFresh = false) => {
    const { id, sheetUrl } = employee

    // No sheet URL → use mock data
    if (!sheetUrl || sheetUrl.trim() === '') {
      setSheetData(prev => ({ ...prev, [id]: MOCK_SHEET_DATA[id] || [] }))
      return
    }

    // Cache hit
    const cached = cacheRef.current[id]
    if (!forceFresh && cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setSheetData(prev => ({ ...prev, [id]: cached.data }))
      return
    }

    setLoadingIds(prev => new Set([...prev, id]))
    setErrorIds(prev => { const n = { ...prev }; delete n[id]; return n })

    try {
      const data = await fetchSheetData(sheetUrl)
      cacheRef.current[id] = { data, ts: Date.now() }
      setSheetData(prev => ({ ...prev, [id]: data }))
    } catch (err) {
      console.error(`Failed to fetch sheet for ${employee.name}:`, err)
      setErrorIds(prev => ({ ...prev, [id]: err.message }))
      // Fallback to mock if available
      if (MOCK_SHEET_DATA[id]) {
        setSheetData(prev => ({ ...prev, [id]: MOCK_SHEET_DATA[id] }))
      }
    } finally {
      setLoadingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }, [])

  const loadAll = useCallback(async (employees, forceFresh = false) => {
    await Promise.all(employees.map(e => loadEmployee(e, forceFresh)))
  }, [loadEmployee])

  const clearEmployee = useCallback(id => {
    delete cacheRef.current[id]
    setSheetData(prev => { const n = { ...prev }; delete n[id]; return n })
  }, [])

  return { sheetData, loadingIds, errorIds, loadEmployee, loadAll, clearEmployee }
}
