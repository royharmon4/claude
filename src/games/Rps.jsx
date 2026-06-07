import { useState } from "react"
import PassTo from "../components/PassTo"
import { useTimers } from "../hooks/useTimers"

const MOVES = [
  { id: "a", label: "A", icon: "✊", beats: "c" },
  { id: "b", label: "B", icon: "✋", beats: "a" },
  { id: "c", label: "C", icon: "✌️", beats: "b" },
]

export default function Rps({ players, onResult }) {
  const [phase, setPhase] = useState("p0")
  const [choices, setChoices] = useState([null, null])
  const [message, setMessage] = useState("Pick secretly. No peeking.")
  const { addTimeout } = useTimers()

  const pick = (player, choice) => {
    const next = [...choices]
    next[player] = choice
    setChoices(next)

    if (player === 0) {
      setMessage(`${players[0].name} locked in. Pass the phone.`)
      setPhase("handoff")
      return
    }

    const [p0, p1] = next
    if (p0.id === p1.id) {
      setMessage("Tie! Replay this point.")
      setPhase("tie")
      addTimeout(() => {
        setChoices([null, null])
        setMessage("Pick secretly. No peeking.")
        setPhase("p0")
      }, 1500)
      return
    }

    const loser = p0.beats === p1.id ? 1 : 0
    setMessage(`${players[1 - loser].name} wins the point!`)
    setPhase("reveal")
    addTimeout(() => onResult(loser), 1400)
  }

  if (phase === "handoff") return <PassTo name={players[1].name} color="#00e5ff" info="Player 1 picked. Choose your move without looking back." onReady={() => setPhase("p1")} />

  if (phase === "reveal" || phase === "tie") {
    return <div className="mini-outer"><div className="bang t-gold" style={{ fontSize: 34 }}>{message}</div><div className="reveal-row">{[0, 1].map((idx) => <div key={idx} className="reveal-card"><div className="emoji">{choices[idx]?.icon ?? "❔"}</div><div className={`name ${idx === 0 ? "t-pink" : "t-cyan"}`}>{players[idx].name}</div><div className="command-sub">Move {choices[idx]?.label ?? "?"}</div></div>)}</div></div>
  }

  const player = phase === "p0" ? 0 : 1
  return <div className="mini-outer"><div className="bang" style={{ fontSize: 34, color: player === 0 ? "#ff2d6e" : "#00e5ff" }}>{players[player].name}</div><div className="command-sub">{message}</div><div className="choice-grid">{MOVES.map((choice) => <button key={choice.id} className="choice-btn" onClick={() => pick(player, choice)}><span className="choice-emoji">{choice.icon}</span><span>Move {choice.label}</span></button>)}</div></div>
}
