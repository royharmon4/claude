import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser, shuffle } from "../utils/random"
import { sfx, buzz } from "../utils/sound"

function makeProblem() {
  const kind = Math.floor(Math.random() * 3)
  let a, b, answer, text
  if (kind === 0) {
    a = 11 + Math.floor(Math.random() * 39)
    b = 11 + Math.floor(Math.random() * 39)
    answer = a + b
    text = `${a} + ${b}`
  } else if (kind === 1) {
    a = 25 + Math.floor(Math.random() * 60)
    b = 6 + Math.floor(Math.random() * Math.min(24, a - 1))
    answer = a - b
    text = `${a} − ${b}`
  } else {
    a = 3 + Math.floor(Math.random() * 9)
    b = 3 + Math.floor(Math.random() * 9)
    answer = a * b
    text = `${a} × ${b}`
  }
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, 10, -10]).slice(0, 3)
  const choices = shuffle([answer, ...offsets.map((o) => answer + o)])
  return { text, answer, choices }
}

const displayedHundredths = (ms) => Math.round(ms / 10)

export default function QuickMath({ players, onResult }) {
  const [problem] = useState(() => makeProblem())
  const [phase, setPhase] = useState("p0-ready")
  const [scores, setScores] = useState([null, null])
  const startRef = useRef(null)
  const { addTimeout } = useTimers()

  const begin = (player) => {
    setPhase(`p${player}-play`)
    startRef.current = performance.now()
  }

  const answer = (player, choice) => {
    const correct = choice === problem.answer
    if (correct) sfx.good()
    else sfx.bad()
    buzz(15)
    const result = { correct, time: performance.now() - startRef.current, choice }
    setScores((prev) => {
      const next = [...prev]
      next[player] = result
      return next
    })
    setPhase(player === 0 ? "handoff" : "done")
  }

  useEffect(() => {
    if (phase !== "done" || !scores[0] || !scores[1]) return
    const [a, b] = scores
    let loser = null
    if (a.correct !== b.correct) loser = a.correct ? 1 : 0
    else if (a.correct && b.correct) loser = chooseLoser(displayedHundredths(a.time), displayedHundredths(b.time), true)
    addTimeout(() => onResult(loser), 1800)
  }, [phase, scores])

  if (phase === "p0-ready") return <PassTo name={players[0].name} color="#ff2d6e" info="Solve the math problem. Correct + fastest wins. Don't say the answer out loud!" onReady={() => begin(0)} />
  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name} answered. Same problem — fastest correct answer wins.`} onReady={() => begin(1)} />

  if (phase === "done") {
    const [a, b] = scores
    let winnerIdx = null
    if (a.correct !== b.correct) winnerIdx = a.correct ? 0 : 1
    else if (a.correct && b.correct && displayedHundredths(a.time) !== displayedHundredths(b.time)) winnerIdx = a.time < b.time ? 0 : 1
    return (
      <div className="mini-outer">
        <div className="bang t-gold" style={{ fontSize: 40 }}>RESULTS!</div>
        <div className="bang" style={{ fontSize: 30 }}>{problem.text} = {problem.answer}</div>
        <div className="bang" style={{ fontSize: 22, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="t-pink">{players[0].name}: {a.choice} ({a.correct ? "✓" : "✗"}) · {(a.time / 1000).toFixed(2)}s{winnerIdx === 0 ? " 🏆" : ""}</span>
          <span className="t-cyan">{players[1].name}: {b.choice} ({b.correct ? "✓" : "✗"}) · {(b.time / 1000).toFixed(2)}s{winnerIdx === 1 ? " 🏆" : ""}</span>
        </div>
        {winnerIdx == null && <div className="command-sub">Tie — replay!</div>}
      </div>
    )
  }

  const player = phase.startsWith("p0") ? 0 : 1
  return (
    <div className="mini-outer">
      <div className="bang" style={{ fontSize: 30, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div>
      <div className="bang t-gold" style={{ fontSize: 64 }}>{problem.text} = ?</div>
      <div className="choice-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {problem.choices.map((choice) => <button key={choice} className="choice-btn" onClick={() => answer(player, choice)}>{choice}</button>)}
      </div>
      <div className="command-sub">Faster is better!</div>
    </div>
  )
}
