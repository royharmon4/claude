import { useEffect, useRef } from "react"

export function useTimers() {
  const timers = useRef([])

  const addTimeout = (fn, ms) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push({ id, type: "timeout" })
    return id
  }

  const addInterval = (fn, ms) => {
    const id = window.setInterval(fn, ms)
    timers.current.push({ id, type: "interval" })
    return id
  }

  const clearAll = () => {
    timers.current.forEach(({ id, type }) => {
      if (type === "interval") window.clearInterval(id)
      else window.clearTimeout(id)
    })
    timers.current = []
  }

  useEffect(() => clearAll, [])
  return { addTimeout, addInterval, clearAll }
}
