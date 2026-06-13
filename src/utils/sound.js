import { readStorage, writeStorage } from "./storage"

const LS_MUTED = "strike-zone:muted"

let ctx = null
let muted = readStorage(LS_MUTED, false)

function getCtx() {
  if (typeof window === "undefined") return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === "suspended") ctx.resume().catch(() => {})
  return ctx
}

export function isMuted() {
  return muted
}

export function setMuted(value) {
  muted = value
  writeStorage(LS_MUTED, value)
}

export function toggleMuted() {
  setMuted(!muted)
  return muted
}

function tone({ freq = 440, dur = 0.12, type = "square", vol = 0.18, when = 0, slide = 0 }) {
  if (muted) return
  const ac = getCtx()
  if (!ac) return
  try {
    const t0 = ac.currentTime + when
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(gain).connect(ac.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
  } catch {
    // Audio is best-effort only.
  }
}

export const sfx = {
  tap: () => tone({ freq: 320, dur: 0.05, type: "square", vol: 0.1 }),
  tick: () => tone({ freq: 660, dur: 0.07, type: "square", vol: 0.14 }),
  go: () => tone({ freq: 880, dur: 0.22, type: "square", vol: 0.2, slide: 240 }),
  good: () => {
    tone({ freq: 523, dur: 0.1, type: "triangle", vol: 0.2 })
    tone({ freq: 784, dur: 0.14, type: "triangle", vol: 0.2, when: 0.09 })
  },
  bad: () => tone({ freq: 180, dur: 0.25, type: "sawtooth", vol: 0.16, slide: -90 }),
  win: () => {
    tone({ freq: 523, dur: 0.12, type: "triangle", vol: 0.2 })
    tone({ freq: 659, dur: 0.12, type: "triangle", vol: 0.2, when: 0.11 })
    tone({ freq: 784, dur: 0.12, type: "triangle", vol: 0.2, when: 0.22 })
    tone({ freq: 1047, dur: 0.3, type: "triangle", vol: 0.22, when: 0.33 })
  },
  strike: () => {
    tone({ freq: 220, dur: 0.16, type: "sawtooth", vol: 0.17 })
    tone({ freq: 150, dur: 0.3, type: "sawtooth", vol: 0.17, when: 0.14, slide: -60 })
  },
}

export function buzz(pattern = 18) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern)
  } catch {
    // Haptics are best-effort only.
  }
}
