import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser, shuffle } from "../utils/random"

export default function ColorTrap({ players, onResult }) {
  const [phase, setPhase] = useState("p0-ready")
  const [cells, setCells] = useState(["neutral", "neutral", "neutral", "neutral"])
  const [timeLeft, setTimeLeft] = useState(8)
  const [scoreDisplay, setScoreDisplay] = useState(0)
  const [scores, setScores] = useState([null, null])
  const cellsRef = useRef(cells)
  const scoreRef = useRef(0)
  const activeRef = useRef(false)
  const { addInterval, clearAll, addTimeout } = useTimers()

  const randomize = () => {
    const values = shuffle(["green", "green", "red", "neutral"])
    cellsRef.current = values
    setCells(values)
  }

  const startTurn = (player) => {
    clearAll()
    activeRef.current = true
    scoreRef.current = 0
    setScoreDisplay(0)
    setTimeLeft(8)
    randomize()
    addInterval(randomize, 700)
    let remaining = 8
    addInterval(() => {
      remaining -= 1
      setTimeLeft(remaining)
      if (remaining <= 0) {
        activeRef.current = false
        clearAll()
        const finalScore = scoreRef.current
        setScores((prev) => {
          const next = [...prev]
          next[player] = finalScore
          return next
        })
        setPhase(player === 0 ? "handoff" : "done")
      }
    }, 1000)
  }

  useEffect(() => {
    if (phase !== "done") return
    const [s0, s1] = scores
    if (s0 == null || s1 == null) return
    addTimeout(() => onResult(chooseLoser(s0, s1)), 1100)
  }, [phase, scores])

  const hit = (idx) => {
    if (!activeRef.current) return
    const type = cellsRef.current[idx]
    if (type === "neutral") return
    scoreRef.current += type === "green" ? 1 : -1
    const next = [...cellsRef.current]
    next[idx] = "neutral"
    cellsRef.current = next
    setCells(next)
    setScoreDisplay(scoreRef.current)
  }

  if (phase === "p0-ready") return <PassTo name={players[0].name} color="#ff2d6e" info="Tap GREEN = +1 · Tap RED = -1 · 8 seconds." onReady={() => { setPhase("p0-play"); startTurn(0) }} />
  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name} scored ${scores[0]} — beat it.`} onReady={() => { setPhase("p1-play"); startTurn(1) }} />
  if (phase === "done") return <div className="ct-outer" style={{ alignItems: "center", justifyContent: "center" }}><div className="bang t-gold glow-gold" style={{ fontSize: 48 }}>RESULTS!</div><div className="bang" style={{ fontSize: 28, display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}><div className="t-pink">{players[0].name}: {scores[0]}</div><div className="t-cyan">{players[1].name}: {scores[1]}</div></div></div>

  const player = phase.includes("p0") ? 0 : 1
  return (
    <div className="ct-outer">
      <div className="ct-header"><div className="ct-score" style={{ color: scoreDisplay >= 0 ? "#00ff44" : "#ff4444" }}>{scoreDisplay >= 0 ? "+" : ""}{scoreDisplay}</div><div className="ct-turn" style={{ color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div><div className="ct-time" style={{ color: timeLeft <= 3 ? "#ff2d6e" : "#fff" }}>{timeLeft}s</div></div>
      <div className="grid-2x2">{cells.map((type, idx) => <div key={idx} className={`ct-cell ${type}`} onPointerDown={(e) => { e.preventDefault(); hit(idx) }}>{type === "green" ? "✅" : type === "red" ? "❌" : "·"}</div>)}</div>
    </div>
  )
}
