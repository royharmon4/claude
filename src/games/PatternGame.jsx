import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { shuffle } from "../utils/random"
import { sfx, buzz } from "../utils/sound"

const KEYS = ["r", "b", "g", "y"]
const ICON = { r: "🔴", b: "🔵", g: "🟢", y: "🟡" }

function makeSequence() {
  // Start from a shuffle so all four colors appear, then add a random tail.
  const base = shuffle(KEYS)
  const tail = Array.from({ length: 2 }, () => KEYS[Math.floor(Math.random() * 4)])
  return [...base, ...tail]
}

export default function PatternGame({ players, onResult }) {
  const [seq] = useState(makeSequence)
  const [phase, setPhase] = useState("show0")
  const [lit, setLit] = useState(null)
  const [entered, setEntered] = useState([])
  const [scores, setScores] = useState([null, null])
  const input = useRef([])
  const playStartRef = useRef(null)
  const { addTimeout, clearAll } = useTimers()

  useEffect(() => {
    if (phase !== "show0" && phase !== "show1") return
    clearAll()
    input.current = []
    setEntered([])
    setLit(null)
    let delay = 500
    seq.forEach((key) => {
      addTimeout(() => { setLit(key); sfx.tick() }, delay)
      delay += 600
      addTimeout(() => setLit(null), delay)
      delay += 220
    })
    addTimeout(() => {
      playStartRef.current = performance.now()
      setPhase(phase === "show0" ? "play0" : "play1")
    }, delay + 150)
  }, [phase])

  const finish = (player, score) => {
    const time = playStartRef.current != null ? performance.now() - playStartRef.current : 0
    setScores((old) => {
      const next = [...old]
      next[player] = { score, time }
      return next
    })
    if (score === seq.length) sfx.good()
    else sfx.bad()
    addTimeout(() => setPhase(player === 0 ? "handoff" : "done"), 900)
  }

  const press = (key) => {
    if (phase !== "play0" && phase !== "play1") return
    const player = phase === "play0" ? 0 : 1
    const idx = input.current.length
    const next = [...input.current, key]
    input.current = next
    setEntered(next)
    buzz(10)
    if (key !== seq[idx]) finish(player, idx)
    else {
      sfx.tap()
      if (next.length === seq.length) finish(player, seq.length)
    }
  }

  useEffect(() => {
    if (phase !== "done") return
    const [a, b] = scores
    if (a == null || b == null) return
    let loser = null
    if (a.score !== b.score) loser = a.score > b.score ? 1 : 0
    else if (a.score > 0 && Math.round(a.time / 10) !== Math.round(b.time / 10)) loser = a.time < b.time ? 1 : 0
    addTimeout(() => onResult(loser), 1700)
  }, [phase, scores])

  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name}: ${scores[0].score}/${seq.length}. Same pattern — ties go to the faster player.`} onReady={() => setPhase("show1")} />

  if (phase === "done") {
    const [a, b] = scores
    let winnerIdx = null
    if (a && b) {
      if (a.score !== b.score) winnerIdx = a.score > b.score ? 0 : 1
      else if (a.score > 0 && Math.round(a.time / 10) !== Math.round(b.time / 10)) winnerIdx = a.time < b.time ? 0 : 1
    }
    return (
      <div className="mini-outer">
        <div className="bang t-gold" style={{ fontSize: 40 }}>RESULTS!</div>
        <div className="bang" style={{ fontSize: 24 }}>
          <span className="t-pink">{players[0].name}: {a.score}/{seq.length} · {(a.time / 1000).toFixed(2)}s{winnerIdx === 0 ? " 🏆" : ""}</span><br />
          <span className="t-cyan">{players[1].name}: {b.score}/{seq.length} · {(b.time / 1000).toFixed(2)}s{winnerIdx === 1 ? " 🏆" : ""}</span>
        </div>
        <div className="command-sub">Pattern: {seq.map((x) => ICON[x]).join(" ")}{winnerIdx == null ? " · Tie — replay!" : ""}</div>
      </div>
    )
  }

  const player = phase.endsWith("0") ? 0 : 1
  const show = phase.startsWith("show")
  return (
    <div className="mp-outer">
      <div className="mp-status" style={{ color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{show ? `${players[player].name}: watch` : `${players[player].name}: repeat (fast!)`}</div>
      {!show && <div className="mp-progress">{entered.map((x) => ICON[x]).join(" ")} <span style={{ color: "rgba(255,255,255,.28)" }}>{"·".repeat(Math.max(0, seq.length - entered.length))}</span></div>}
      <div className="grid-2x2">{KEYS.map((key) => <div key={key} className={`mp-cell ${key}${show ? "" : " on"}${lit === key ? " lit" : ""}`} onPointerDown={(e) => { e.preventDefault(); press(key) }} />)}</div>
    </div>
  )
}
