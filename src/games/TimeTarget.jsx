import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { TARGET_MS } from "../constants"
import { chooseLoser } from "../utils/random"
import { diffFromTarget, formatMs } from "../utils/time"
import { sfx, buzz } from "../utils/sound"

const displayedMsDiff = (ms) => Math.round(Math.abs(ms - TARGET_MS))

export default function TimeTarget({ players, onResult, mode }) {
  const [phase, setPhase] = useState("p0-ready")
  const [active, setActive] = useState(false)
  const [elapsed, setElapsed] = useState([null, null])
  const startRef = useRef(null)
  const player = phase.includes("p0") ? 0 : 1

  const start = () => {
    startRef.current = performance.now()
    setActive(true)
    sfx.tick()
    buzz(15)
    setPhase(`p${player}-${mode === "hold" ? "hold" : "run"}`)
  }

  const stop = () => {
    if (!active || startRef.current == null) return
    const ms = performance.now() - startRef.current
    setActive(false)
    startRef.current = null
    buzz(15)
    if (displayedMsDiff(ms) <= 150) sfx.good()
    else sfx.tick()
    setElapsed((prev) => {
      const next = [...prev]
      next[player] = ms
      return next
    })
    setPhase(player === 0 ? "p0-done" : "p1-done")
  }

  useEffect(() => {
    if (phase === "p0-done") {
      const id = window.setTimeout(() => setPhase("handoff"), 1400)
      return () => window.clearTimeout(id)
    }
    if (phase === "p1-done") {
      const id = window.setTimeout(() => setPhase("done"), 1400)
      return () => window.clearTimeout(id)
    }
    if (phase === "done") {
      const [a, b] = elapsed
      if (a == null || b == null) return undefined
      const id = window.setTimeout(() => onResult(chooseLoser(displayedMsDiff(a), displayedMsDiff(b), true)), 1500)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [phase, elapsed])

  if (phase === "p0-ready") return <PassTo name={players[0].name} color="#ff2d6e" info={mode === "hold" ? "Hold, then release at exactly 5 seconds." : "Tap START, then STOP at exactly 5 seconds."} onReady={() => setPhase("p0-run")} />
  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}: ${formatMs(elapsed[0])} (${diffFromTarget(elapsed[0])}) — beat it.`} onReady={() => setPhase("p1-run")} />
  if (phase === "done") return <TimedResults players={players} elapsed={elapsed} />

  const done = phase.endsWith("done")
  const doneElapsed = elapsed[player]
  const buttonClass = mode === "tap" ? (active ? "stop" : "start") : (active ? "holding" : "idle")

  return (
    <div className="mini-outer">
      <div className="bang" style={{ fontSize: 32, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div>
      <div className="command-sub">🎯 Target: exactly 5.000 seconds</div>
      <button
        className={`circle-btn ${buttonClass}`}
        onPointerDown={(e) => {
          e.preventDefault()
          if (done) return
          // Capture the pointer so a sliding finger doesn't end the hold early.
          if (mode === "hold" && e.currentTarget.setPointerCapture) {
            try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* unsupported */ }
          }
          if (mode === "hold") start()
          else active ? stop() : start()
        }}
        onPointerUp={mode === "hold" ? stop : undefined}
        onPointerCancel={mode === "hold" ? stop : undefined}
      >
        {done ? "✓" : active ? (mode === "tap" ? "STOP!" : "HOLDING...") : (mode === "tap" ? "START" : "HOLD")}
      </button>
      {active && <div className="bang t-gold" style={{ fontSize: 22 }}>⏱️ Counting in your head...</div>}
      {done && doneElapsed !== null && <div className="result-big">{formatMs(doneElapsed)}<br /><span style={{ color: "rgba(255,255,255,.5)", fontSize: 18 }}>{diffFromTarget(doneElapsed)} from target</span></div>}
    </div>
  )
}

function TimedResults({ players, elapsed }) {
  const d0 = displayedMsDiff(elapsed[0])
  const d1 = displayedMsDiff(elapsed[1])
  const winnerIdx = d0 === d1 ? null : d0 < d1 ? 0 : 1
  return (
    <div className="mini-outer">
      <div className="bang t-gold glow-gold" style={{ fontSize: 40 }}>RESULTS!</div>
      <div className="bang" style={{ fontSize: 22, display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
        <div><span className="t-pink">{players[0].name}:</span> {formatMs(elapsed[0])} ({diffFromTarget(elapsed[0])}){winnerIdx === 0 ? " 🏆" : ""}</div>
        <div><span className="t-cyan">{players[1].name}:</span> {formatMs(elapsed[1])} ({diffFromTarget(elapsed[1])}){winnerIdx === 1 ? " 🏆" : ""}</div>
      </div>
      <div style={{ color: "rgba(255,255,255,.5)", fontFamily: "Bangers,cursive", fontSize: 18 }}>
        {winnerIdx == null ? "Same difference — replay!" : `${players[winnerIdx].name} was closest to 5.000s.`}
      </div>
    </div>
  )
}
