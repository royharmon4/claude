import { useEffect, useRef, useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"
import { chooseLoser, shuffle } from "../utils/random"

const MEMORY_ITEMS = ["🍕", "🚀", "🐸", "👑", "🎲", "🦖", "🍩", "⚽", "🎸", "🐙", "💎", "🌮", "🧲", "🛸", "🦄", "🍔", "🎩", "🕹️", "🐢", "🧃"]

function makeChallenge() {
  const picked = shuffle(MEMORY_ITEMS)
  const shown = picked.slice(0, 6)
  const missing = picked[6]
  return { shown, missing, choices: shuffle([missing, ...shown.slice(0, 3)]) }
}

const displayedHundredths = (ms) => Math.round(ms / 10)

export default function SneakyMemory({ players, onResult }) {
  const [challenge] = useState(() => makeChallenge())
  const [phase, setPhase] = useState("show-p0")
  const [scores, setScores] = useState([null, null])
  const startRef = useRef(null)
  const { addTimeout } = useTimers()

  useEffect(() => {
    if (phase === "show-p0" || phase === "show-p1") {
      addTimeout(() => {
        startRef.current = performance.now()
        setPhase(phase === "show-p0" ? "answer-p0" : "answer-p1")
      }, 3200)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "done" || !scores[0] || !scores[1]) return
    const [a, b] = scores
    let loser = null

    if (a.correct !== b.correct) {
      loser = a.correct ? 1 : 0
    } else if (a.correct && b.correct) {
      loser = chooseLoser(displayedHundredths(a.time), displayedHundredths(b.time), true)
    }

    addTimeout(() => onResult(loser), 1500)
  }, [phase, scores])

  const answer = (player, choice) => {
    const result = { correct: choice === challenge.missing, time: performance.now() - startRef.current, choice }
    setScores((prev) => {
      const next = [...prev]
      next[player] = result
      return next
    })
    setPhase(player === 0 ? "handoff" : "done")
  }

  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info={`${players[0].name} answered. Same memory challenge — no peeking.`} onReady={() => setPhase("show-p1")} />

  if (phase === "done") {
    return (
      <div className="mini-outer">
        <div className="bang t-gold" style={{ fontSize: 42 }}>RESULTS!</div>
        <div className="reveal-row">
          {[0, 1].map((idx) => (
            <div key={idx} className="reveal-card">
              <div className="emoji">{scores[idx]?.choice}</div>
              <div className={`name ${idx === 0 ? "t-pink" : "t-cyan"}`}>{players[idx].name}</div>
              <div className="command-sub">{scores[idx]?.correct ? "Correct" : "Wrong"} · {scores[idx] ? `${(scores[idx].time / 1000).toFixed(2)}s` : "—"}</div>
            </div>
          ))}
        </div>
        <div className="command-sub">Missing item: {challenge.missing}</div>
      </div>
    )
  }

  const player = phase.includes("p0") ? 0 : 1
  if (phase.startsWith("show")) {
    return (
      <div className="mini-outer">
        <div className="bang" style={{ fontSize: 34, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div>
        <div className="command-sub">Memorize these. One answer is NOT shown.</div>
        <div className="grid-2x2" style={{ maxWidth: 340, maxHeight: 340 }}>{challenge.shown.slice(0, 4).map((item) => <div key={item} className="reveal-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div className="emoji">{item}</div></div>)}</div>
        <div className="reveal-row">{challenge.shown.slice(4).map((item) => <div key={item} className="reveal-card"><div className="emoji">{item}</div></div>)}</div>
      </div>
    )
  }

  return (
    <div className="mini-outer">
      <div className="bang" style={{ fontSize: 34, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div>
      <div className="command-sub">Which item was NOT shown?</div>
      <div className="choice-grid">{challenge.choices.map((item) => <button key={item} className="choice-btn" onClick={() => answer(player, item)}><span className="choice-emoji">{item}</span></button>)}</div>
    </div>
  )
}
