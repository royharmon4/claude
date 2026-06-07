import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { chooseLoser } from "../utils/random"

export default function PrecisionMeter({ players, onResult, variant }) {
  const [phase, setPhase] = useState("p0-ready")
  const [scores, setScores] = useState([null, null])
  const posRef = useRef(variant === "balance" ? -65 : 20)
  const dirRef = useRef(1)
  const rafRef = useRef(null)
  const lastRef = useRef(null)
  const activeRef = useRef(false)
  const barRef = useRef(null)

  const stop = () => {
    activeRef.current = false
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
  }

  const start = () => {
    posRef.current = variant === "balance" ? -65 + Math.random() * 40 : 18 + Math.random() * 18
    dirRef.current = 1
    lastRef.current = null
    activeRef.current = true

    const animate = (now) => {
      if (!activeRef.current) return
      if (lastRef.current == null) lastRef.current = now
      const dt = Math.min((now - lastRef.current) / 1000, 0.05)
      lastRef.current = now
      posRef.current += dirRef.current * (variant === "balance" ? 120 : 62) * dt
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
    window.setTimeout(start, 80)
  }

  const tap = () => {
    if (phase !== "p0-play" && phase !== "p1-play") return
    stop()
    const dist = Math.abs(variant === "balance" ? posRef.current : posRef.current - 50)
    if (phase === "p0-play") {
      setScores([dist, null])
      setPhase("handoff")
    } else {
      const s0 = scores[0]
      setScores([s0, dist])
      setPhase("done")
      window.setTimeout(() => onResult(chooseLoser(s0, dist, true)), 1200)
    }
  }

  const label = variant === "balance" ? "Balance Meter" : "Stop the Bar"
  const accuracy = (d) => `${Math.max(0, Math.min(100, 100 - d * (variant === "balance" ? 1.3 : 2))).toFixed(0)}%`

  if (phase === "p0-ready") {
    return <div className="mini-outer"><div className="bang t-pink" style={{ fontSize: 32 }}>{players[0].name}<br />YOU'RE UP FIRST</div><div className="command-sub">{variant === "balance" ? "Stop the needle as close to upright center as possible." : "Stop the bar as close to center as possible."}</div><button className="btn btn-go" onClick={() => play("p0-play")}>START!</button></div>
  }

  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}: ${accuracy(scores[0])} — beat it.`} onReady={() => play("p1-play")} />

  if (phase === "done") return <div className="mini-outer"><div className="bang t-gold" style={{ fontSize: 40 }}>RESULTS!</div><div className="score-row"><div><span className="t-pink">{players[0].name}</span><br />{accuracy(scores[0])}</div><div><span className="t-cyan">{players[1].name}</span><br />{accuracy(scores[1])}</div></div><div className="command-sub">Closest to center wins this point.</div></div>

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
