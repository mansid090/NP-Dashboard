import { useState, useEffect } from 'react'
import { CONFIG_SHEET_URL } from '../config'
import { fetchConfigSheet } from '../utils/parseConfig'

export function useConfig() {
  const configured  = !!CONFIG_SHEET_URL?.trim()
  const [employees, setEmployees] = useState([])
  const [managers,  setManagers]  = useState([])
  const [loading,   setLoading]   = useState(configured)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!configured) return

    fetchConfigSheet(CONFIG_SHEET_URL)
      .then(({ employees, managers }) => {
        setEmployees(employees)
        setManagers(managers)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { employees, managers, loading, error, configured }
}
