import { useState, useCallback, useRef } from 'react'
import { fetchSheetData } from '../utils/parseSheetData'

const CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes

export function useGoogleSheets() {
  const [sheetData,  setSheetData]  = useState({})
  const [loadingIds, setLoadingIds] = useState(new Set())
  const [errorIds,   setErrorIds]   = useState({})
  const cacheRef = useRef({})

  const loadEmployee = useCallback(async (employee, forceFresh = false) => {
    const { id, sheetUrl } = employee

    if (!sheetUrl?.trim()) {
      setSheetData(prev => ({ ...prev, [id]: [] }))
      return
    }

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
      setSheetData(prev => ({ ...prev, [id]: [] }))
    } finally {
      setLoadingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }, [])

  const loadAll = useCallback(async (employees, forceFresh = false) => {
    await Promise.all(employees.map(e => loadEmployee(e, forceFresh)))
  }, [loadEmployee])

  const clearCache = useCallback(() => {
    cacheRef.current = {}
  }, [])

  return { sheetData, loadingIds, errorIds, loadEmployee, loadAll, clearCache }
}
