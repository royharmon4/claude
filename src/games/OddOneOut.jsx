import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser } from "../utils/random"
import { sfx, buzz } from "../utils/sound"

const GRID = 4 // 4x4
const PENALTY_MS = 1500

const BASE_HUES = [340, 195, 48, 270, 130, 20]

function makeBoard() {
  const hue = BASE_HUES[Math.floor(Math.random() * BASE_HUES.length)]
  const odd = Math.floor(Math.random() * GRID * GRID)
  return { hue, odd }
}

const displayedHundredths = (ms) => Math.round(ms / 10)

export default function OddOneOut({ players, onResult }) {
  // Same board for both players, so the contest is pure spotting speed.
  const [board] = useState(() => makeBoard())
  const [phase, setPhase] = useState("p0-ready")
  const [scores, setScores] = useState([null, null])
  const [penalties, setPenalties] = useState(0)
  const startRef = useRef(null)
  const penaltyRef = useRef(0)
  const { addTimeout } = useTimers()

  const begin = (player) => {
    penaltyRef.current = 0
    setPenalties(0)
    setPhase(`p${player}-play`)
    startRef.current = performance.now()
  }

  const tapCell = (player, idx) => {
    if (idx !== board.odd) {
      penaltyRef.current += PENALTY_MS
      setPenalties((p) => p + 1)
      sfx.bad()
      buzz([30, 30, 30])
      return
    }
    sfx.good()
    buzz(20)
    const time = performance.now() - startRef.current + penaltyRef.current
    setScores((prev) => {
      const next = [...prev]
      next[player] = { time, penalties: penaltyRef.current / PENALTY_MS }
      return next
    })
    setPhase(player === 0 ? "handoff" : "done")
  }

  useEffect(() => {
    if (phase !== "done" || !scores[0] || !scores[1]) return
    addTimeout(() => onResult(chooseLoser(displayedHundredths(scores[0].time), displayedHundredths(scores[1].time), true)), 1800)
  }, [phase, scores])

  if (phase === "p0-ready") return <PassTo name={players[0].name} color="#ff2d6e" info="One tile is a slightly different shade. Tap it fast! Wrong taps add +1.5s." onReady={() => begin(0)} />
  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}: ${(scores[0].time / 1000).toFixed(2)}s. Same board — beat it.`} onReady={() => begin(1)} />

  if (phase === "done") {
    const [a, b] = scores
    const winnerIdx = displayedHundredths(a.time) === displayedHundredths(b.time) ? null : a.time < b.time ? 0 : 1
    return (
      <div className="mini-outer">
        <div className="bang t-gold" style={{ fontSize: 40 }}>RESULTS!</div>
        <div className="bang" style={{ fontSize: 22, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="t-pink">{players[0].name}: {(a.time / 1000).toFixed(2)}s{a.penalties ? ` (${a.penalties} miss)` : ""}{winnerIdx === 0 ? " 🏆" : ""}</span>
          <span className="t-cyan">{players[1].name}: {(b.time / 1000).toFixed(2)}s{b.penalties ? ` (${b.penalties} miss)` : ""}{winnerIdx === 1 ? " 🏆" : ""}</span>
        </div>
        <div className="command-sub">{winnerIdx == null ? "Tie — replay!" : "Fastest spotter wins."}</div>
      </div>
    )
  }

  const player = phase.startsWith("p0") ? 0 : 1
  const baseColor = `hsl(${board.hue}, 70%, 45%)`
  const oddColor = `hsl(${board.hue}, 70%, 57%)`
  return (
    <div className="mini-outer" style={{ gap: 12 }}>
      <div className="bang" style={{ fontSize: 28, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}: FIND THE ODD TILE!</div>
      {penalties > 0 && <div className="command-sub" style={{ color: "#ff4444" }}>+{(penalties * PENALTY_MS / 1000).toFixed(1)}s penalty</div>}
      <div className="odd-grid">
        {Array.from({ length: GRID * GRID }, (_, idx) => (
          <div key={idx} className="odd-cell" style={{ background: idx === board.odd ? oddColor : baseColor }} onPointerDown={(e) => { e.preventDefault(); tapCell(player, idx) }} />
        ))}
      </div>
      <div className="command-sub">Wrong tap = +1.5s penalty</div>
    </div>
  )
}
