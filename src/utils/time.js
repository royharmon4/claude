import { TARGET_MS } from "../constants"

export function formatMs(ms) {
  return `${(ms / 1000).toFixed(3)}s`
}

export function diffFromTarget(ms) {
  const seconds = (ms - TARGET_MS) / 1000
  return `${seconds >= 0 ? "+" : ""}${seconds.toFixed(3)}s`
}
