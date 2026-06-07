import { useCallback, useEffect, useRef } from "react"

export function useTimers() {
  const timers = useRef([])

  const addTimeout = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push({ id, type: "timeout" })
    return id
  }, [])

  const addInterval = useCallback((fn, ms) => {
    const id = window.setInterval(fn, ms)
    timers.current.push({ id, type: "interval" })
    return id
  }, [])

  const clearAll = useCallback(() => {
    timers.current.forEach(({ id, type }) => {
      if (type === "interval") window.clearInterval(id)
      else window.clearTimeout(id)
    })
    timers.current = []
  }, [])

  useEffect(() => clearAll, [clearAll])
  return { addTimeout, addInterval, clearAll }
}
