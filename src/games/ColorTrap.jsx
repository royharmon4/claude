import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser, shuffle } from "../utils/random"
import { sfx, buzz } from "../utils/sound"

const TURN_SECONDS = 8

export default function ColorTrap({ players, onResult }) {
  const [phase, setPhase] = useState("p0-ready")
  const [cells, setCells] = useState(["neutral", "neutral", "neutral", "neutral"])
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS)
  const [scoreDisplay, setScoreDisplay] = useState(0)
  const [scores, setScores] = useState([null, null])
  const cellsRef = useRef(cells)
  const scoreRef = useRef(0)
  const activeRef = useRef(false)
  const { addInterval, clearAll, addTimeout } = useTimers()

  const randomize = () => {
    // ~18% of boards swap a green for a gold tile worth +3.
    const base = Math.random() < 0.18 ? ["gold", "green", "red", "neutral"] : ["green", "green", "red", "neutral"]
    const values = shuffle(base)
    cellsRef.current = values
    setCells(values)
  }

  const startTurn = (player) => {
    clearAll()
    activeRef.current = true
    scoreRef.current = 0
    setScoreDisplay(0)
    setTimeLeft(TURN_SECONDS)
    randomize()

    // The board reshuffles faster and faster as time runs out.
    let elapsed = 0
    const scheduleShuffle = () => {
      if (!activeRef.current) return
      const delay = Math.max(420, 750 - elapsed * 40)
      addTimeout(() => {
        if (!activeRef.current) return
        randomize()
        scheduleShuffle()
      }, delay)
    }
    scheduleShuffle()

    let remaining = TURN_SECONDS
    addInterval(() => {
      elapsed += 1
      remaining -= 1
      setTimeLeft(remaining)
      if (remaining > 0 && remaining <= 3) sfx.tick()
      if (remaining <= 0) {
        activeRef.current = false
        clearAll()
        sfx.good()
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
    addTimeout(() => onResult(chooseLoser(s0, s1)), 1600)
  }, [phase, scores])

  const hit = (idx) => {
    if (!activeRef.current) return
    const type = cellsRef.current[idx]
    if (type === "neutral") return
    if (type === "red") {
      scoreRef.current -= 1
      sfx.bad()
      buzz([30, 30, 30])
    } else if (type === "gold") {
      scoreRef.current += 3
      sfx.good()
      buzz(20)
    } else {
      scoreRef.current += 1
      sfx.tap()
      buzz(10)
    }
    const next = [...cellsRef.current]
    next[idx] = "neutral"
    cellsRef.current = next
    setCells(next)
    setScoreDisplay(scoreRef.current)
  }

  if (phase === "p0-ready") return <PassTo name={players[0].name} color="#ff2d6e" info="GREEN = +1 · GOLD = +3 · RED = -1 · 8 seconds. It speeds up!" onReady={() => { setPhase("p0-play"); startTurn(0) }} />
  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name} scored ${scores[0]} — beat it.`} onReady={() => { setPhase("p1-play"); startTurn(1) }} />
  if (phase === "done") {
    const winnerIdx = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
    return (
      <div className="ct-outer" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="bang t-gold glow-gold" style={{ fontSize: 48 }}>RESULTS!</div>
        <div className="bang" style={{ fontSize: 28, display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          <div className="t-pink">{players[0].name}: {scores[0]}{winnerIdx === 0 ? " 🏆" : ""}</div>
          <div className="t-cyan">{players[1].name}: {scores[1]}{winnerIdx === 1 ? " 🏆" : ""}</div>
        </div>
        {winnerIdx == null && <div className="command-sub">Tie — replay!</div>}
      </div>
    )
  }

  const player = phase.includes("p0") ? 0 : 1
  return (
    <div className="ct-outer">
      <div className="ct-header"><div className="ct-score" style={{ color: scoreDisplay >= 0 ? "#00ff44" : "#ff4444" }}>{scoreDisplay >= 0 ? "+" : ""}{scoreDisplay}</div><div className="ct-turn" style={{ color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div><div className="ct-time" style={{ color: timeLeft <= 3 ? "#ff2d6e" : "#fff" }}>{timeLeft}s</div></div>
      <div className="grid-2x2">{cells.map((type, idx) => <div key={idx} className={`ct-cell ${type}`} onPointerDown={(e) => { e.preventDefault(); hit(idx) }}>{type === "green" ? "✅" : type === "red" ? "❌" : type === "gold" ? "⭐" : "·"}</div>)}</div>
    </div>
  )
}
