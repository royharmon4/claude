import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser } from "../utils/random"
import { sfx, buzz } from "../utils/sound"

export default function PrecisionMeter({ players, onResult, variant }) {
  const [phase, setPhase] = useState("p0-ready")
  const [scores, setScores] = useState([null, null])
  // Speed is randomized once per game so both players face the same challenge.
  const speedRef = useRef(variant === "balance" ? 110 + Math.random() * 50 : 56 + Math.random() * 26)
  const posRef = useRef(variant === "balance" ? -65 : 20)
  const dirRef = useRef(1)
  const rafRef = useRef(null)
  const lastRef = useRef(null)
  const activeRef = useRef(false)
  const barRef = useRef(null)
  const { addTimeout } = useTimers()

  const stop = () => {
    activeRef.current = false
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
  }

  const start = () => {
    posRef.current = variant === "balance" ? -65 + Math.random() * 40 : 18 + Math.random() * 18
    dirRef.current = Math.random() < 0.5 ? -1 : 1
    lastRef.current = null
    activeRef.current = true

    const animate = (now) => {
      if (!activeRef.current) return
      if (lastRef.current == null) lastRef.current = now
      const dt = Math.min((now - lastRef.current) / 1000, 0.05)
      lastRef.current = now
      posRef.current += dirRef.current * speedRef.current * dt
      const min = variant === "balance" ? -75 : 4
      const max = variant === "balance" ? 75 : 96
      if (posRef.current >= max) { posRef.current = max; dirRef.current = -1 }
      if (posRef.current <= min) { posRef.current = min; dirRef.current = 1 }
      if (barRef.current) {
        if (variant === "balance") barRef.current.style.transform = `rotate(${posRef.current}deg)`
        else barRef.current.style.left = `${posRef.current}%`
      }
      rafRef.current = window.requestAnimationFrame(animate)
    }
    rafRef.current = window.requestAnimationFrame(animate)
  }

  useEffect(() => () => stop(), [])

  const play = (next) => {
    setPhase(next)
    addTimeout(start, 80)
  }

  const accuracyValue = (d) => Math.round(Math.max(0, Math.min(100, 100 - d * (variant === "balance" ? 1.3 : 2))))
  const accuracy = (d) => `${accuracyValue(d)}%`

  const tap = () => {
    if (phase !== "p0-play" && phase !== "p1-play") return
    stop()
    buzz(15)
    const dist = Math.abs(variant === "balance" ? posRef.current : posRef.current - 50)
    const acc = accuracyValue(dist)
    if (acc >= 90) sfx.good()
    else if (acc >= 60) sfx.tick()
    else sfx.bad()
    if (phase === "p0-play") {
      setScores([dist, null])
      setPhase("handoff")
    } else {
      const s0 = scores[0]
      setScores([s0, dist])
      setPhase("done")
      addTimeout(() => onResult(chooseLoser(accuracyValue(s0), accuracyValue(dist))), 1500)
    }
  }

  const label = variant === "balance" ? "Balance Meter" : "Stop the Bar"

  if (phase === "p0-ready") {
    return <div className="mini-outer"><div className="bang t-pink" style={{ fontSize: 32 }}>{players[0].name}<br />YOU'RE UP FIRST</div><div className="command-sub">{variant === "balance" ? "Stop the needle as close to upright center as possible." : "Stop the bar as close to center as possible."}</div><button className="btn btn-go" onClick={() => play("p0-play")}>START!</button></div>
  }

  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}: ${accuracy(scores[0])} — beat it.`} onReady={() => play("p1-play")} />

  if (phase === "done") {
    const a0 = accuracyValue(scores[0])
    const a1 = accuracyValue(scores[1])
    const winnerIdx = a0 === a1 ? null : a0 > a1 ? 0 : 1
    return (
      <div className="mini-outer">
        <div className="bang t-gold" style={{ fontSize: 40 }}>RESULTS!</div>
        <div className="score-row">
          <div><span className="t-pink">{players[0].name}</span><br />{accuracy(scores[0])}{winnerIdx === 0 ? " 🏆" : ""}</div>
          <div><span className="t-cyan">{players[1].name}</span><br />{accuracy(scores[1])}{winnerIdx === 1 ? " 🏆" : ""}</div>
        </div>
        <div className="command-sub">{winnerIdx == null ? "Same accuracy — replay!" : `${players[winnerIdx].name} takes the point.`}</div>
      </div>
    )
  }

  const player = phase.startsWith("p0") ? 0 : 1
  return (
    <div className="mini-outer" onPointerDown={(e) => { e.preventDefault(); tap() }} style={{ touchAction: "none" }}>
      <div className="bang" style={{ fontSize: 32, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}<br />TAP TO STOP!</div>
      {variant === "balance" ? (
        <div style={{ width: 260, height: 170, position: "relative", borderBottom: "4px solid rgba(255,255,255,.18)", display: "flex", alignItems: "end", justifyContent: "center" }}>
          <div style={{ position: "absolute", bottom: 0, height: 150, width: 3, background: "#ffd700", opacity: .8 }} />
          <div ref={barRef} style={{ position: "absolute", bottom: 0, width: 8, height: 145, borderRadius: 8, background: "linear-gradient(180deg,#00e5ff,#0062ff)", transformOrigin: "bottom center", transform: `rotate(${posRef.current}deg)`, boxShadow: "0 0 18px rgba(0,229,255,.55)" }} />
          <div className="bang t-gold" style={{ position: "absolute", bottom: -32, fontSize: 20 }}>CENTER</div>
        </div>
      ) : (
        <div className="track-wrap"><div className="track"><div className="target-zone" /><div className="target-line" /><div className="bar" ref={barRef} style={{ left: `${posRef.current}%` }} /></div></div>
      )}
      <div className="command-sub">{label}: tap anywhere to freeze.</div>
      {scores[0] !== null && <div className="command-sub" style={{ color: "#ffd700" }}>{players[0].name}: {accuracy(scores[0])}</div>}
    </div>
  )
}
